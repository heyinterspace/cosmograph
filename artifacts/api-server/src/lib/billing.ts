import type Stripe from "stripe";
import type { Logger } from "pino";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";
import { clerkClient } from "@clerk/express";
import { getUncachableStripeClient } from "./stripeClient";

// One-time, account-level unlock: a single $10 purchase grants full exploration
// of ANY searched scientist. We model it as a boolean on the user (hasPaid),
// not per-author, because the product is a one-time unlock.
const UNLOCK_PRODUCT_NAME = "Galactic — Full Exploration";
const UNLOCK_DESCRIPTION =
  "One-time unlock to fully explore any researcher's galaxy — guided tour, spaceship fly-through, and rich paper detail.";
const UNLOCK_AMOUNT = 1000; // $10.00 in cents
const UNLOCK_CURRENCY = "usd";

export interface EntitlementResult {
  entitled: boolean;
  email: string | null;
}

export interface CheckoutResult {
  alreadyEntitled: boolean;
  url?: string | null;
}

async function fetchClerkEmail(userId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const primary = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}

async function getOrCreateUser(
  userId: string,
  email: string | null,
): Promise<User> {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (existing) {
    if (email && existing.email !== email) {
      const [updated] = await db
        .update(usersTable)
        .set({ email })
        .where(eq(usersTable.id, userId))
        .returning();
      return updated;
    }
    return existing;
  }
  const [created] = await db
    .insert(usersTable)
    .values({ id: userId, email })
    .returning();
  return created;
}

// Pure read used by GET /me/entitlement. Never touches Stripe, so it keeps
// working (returning the cached unlock flag) even if Stripe is unreachable.
export async function getEntitlement(
  userId: string,
): Promise<EntitlementResult> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return {
    entitled: user?.hasPaid ?? false,
    email: user?.email ?? null,
  };
}

async function ensureCustomer(stripe: Stripe, user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const email = user.email ?? (await fetchClerkEmail(user.id)) ?? undefined;
  const customer = await stripe.customers.create({
    email,
    metadata: { userId: user.id },
  });
  await db
    .update(usersTable)
    .set({ stripeCustomerId: customer.id, email: email ?? user.email })
    .where(eq(usersTable.id, user.id));
  return customer.id;
}

// Finds the one-time unlock price, creating the product + price on first use so
// the flow works as soon as Stripe is connected (no separate seeding step
// required). Idempotent: subsequent calls reuse the existing product/price.
async function getOrCreateUnlockPrice(stripe: Stripe): Promise<Stripe.Price> {
  const found = await stripe.products.search({
    query: "metadata['galactic_unlock']:'true' AND active:'true'",
  });
  let product = found.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: UNLOCK_PRODUCT_NAME,
      description: UNLOCK_DESCRIPTION,
      metadata: { galactic_unlock: "true" },
    });
  }
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const existing = prices.data.find(
    (p) =>
      !p.recurring &&
      p.unit_amount === UNLOCK_AMOUNT &&
      p.currency === UNLOCK_CURRENCY,
  );
  if (existing) return existing;
  return stripe.prices.create({
    product: product.id,
    unit_amount: UNLOCK_AMOUNT,
    currency: UNLOCK_CURRENCY,
  });
}

export async function createCheckout(
  userId: string,
  origin: string,
  log: Logger,
): Promise<CheckoutResult> {
  const email = await fetchClerkEmail(userId);
  const user = await getOrCreateUser(userId, email);
  if (user.hasPaid) return { alreadyEntitled: true };

  const stripe = await getUncachableStripeClient();
  const customerId = await ensureCustomer(stripe, user);
  const price = await getOrCreateUnlockPrice(stripe);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${origin}/?unlocked=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?unlock_cancelled=1`,
    metadata: { userId },
    payment_intent_data: { metadata: { userId } },
  });

  log.info({ userId, sessionId: session.id }, "created unlock checkout session");
  return { alreadyEntitled: false, url: session.url };
}

async function markPaid(userId: string): Promise<void> {
  await db
    .insert(usersTable)
    .values({ id: userId, hasPaid: true })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: { hasPaid: true },
    });
}

// Authoritative confirmation on the success redirect: verify the session
// directly against Stripe (not the synced cache) and grant the unlock only if
// it is paid and owned by this account.
export async function confirmCheckout(
  userId: string,
  sessionId: string,
  log: Logger,
): Promise<EntitlementResult> {
  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (
    session.payment_status === "paid" &&
    session.metadata?.userId === userId
  ) {
    await markPaid(userId);
    log.info({ userId, sessionId }, "unlock confirmed and granted");
  }
  return getEntitlement(userId);
}

// Best-effort entitlement grant straight from the webhook, covering the case
// where the buyer never returns to the success URL. The signature is already
// verified by StripeSync.processWebhook before this runs, so the parsed payload
// is trusted.
export async function markUnlockedFromWebhook(
  payload: Buffer,
  log: Logger,
): Promise<void> {
  try {
    const event = JSON.parse(payload.toString("utf8")) as {
      type?: string;
      data?: { object?: Record<string, unknown> };
    };
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const obj = event.data?.object ?? {};
      const metadata = obj.metadata as { userId?: string } | undefined;
      const userId = metadata?.userId;
      const paid =
        obj.payment_status === "paid" || obj.status === "complete";
      if (userId && paid) {
        await markPaid(userId);
        log.info({ userId }, "unlock granted via webhook");
      }
    }
  } catch (err) {
    log.warn({ err }, "failed to process unlock from webhook payload");
  }
}
