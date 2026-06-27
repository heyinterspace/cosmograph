import { randomBytes } from "node:crypto";
import { and, count, eq, isNull } from "drizzle-orm";
import type { Logger } from "pino";
import { db, usersTable, type User } from "@workspace/db";
import { clerkClient } from "@clerk/express";

// Every signed-in account gets a stable short referral code used as
// `?ref=<code>`. A "referral" is counted when a BRAND-NEW account signs up
// through someone's link: the new account's `referredBy` is set once
// (permanently) to the referrer's account id. There is intentionally no
// owner-facing UI for the tallies — they are read directly from the `users`
// table on request.

export interface ReferralInfo {
  code: string;
  referredCount: number;
}

// Only attribute a referral to a genuinely new account. We approximate "this is
// a real sign-up happening now" by the age of the visitor's Clerk account: a
// fresh sign-up is minutes old, while an existing member who later clicks a
// friend's link has an account that is days/weeks old and is never credited.
const SIGNUP_ATTRIBUTION_WINDOW_MS = 24 * 60 * 60 * 1000;

// Unambiguous alphabet (no 0/O/1/I/l) so codes are easy to read and share.
const CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 8;

function randomCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

// Find-or-create the account row and guarantee it has a referral code. Generates
// one on first use and lazily backfills accounts created before referrals
// existed. Retries on the (astronomically unlikely) unique-code collision.
async function ensureAccount(userId: string): Promise<User> {
  await db
    .insert(usersTable)
    .values({ id: userId })
    .onConflictDoNothing({ target: usersTable.id });

  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (row.referralCode) return row;

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomCode();
    try {
      const [updated] = await db
        .update(usersTable)
        .set({ referralCode: code })
        .where(and(eq(usersTable.id, userId), isNull(usersTable.referralCode)))
        .returning();
      if (updated?.referralCode) return updated;
      // A concurrent call set the code first — re-read and use it.
      const [fresh] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      if (fresh?.referralCode) return fresh;
    } catch (err) {
      // 23505 = unique_violation on referral_code: pick another code and retry.
      if ((err as { code?: string })?.code !== "23505") throw err;
    }
  }
  throw new Error("could not allocate a unique referral code");
}

// How many accounts signed up through this account's link.
async function countReferred(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(usersTable)
    .where(eq(usersTable.referredBy, userId));
  return row?.n ?? 0;
}

// Whether the account was created recently enough to count as a fresh sign-up.
// Fails closed (returns false) if Clerk can't be reached, so we never miscredit.
async function isFreshSignup(userId: string): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const createdAt =
      typeof user.createdAt === "number"
        ? user.createdAt
        : new Date(user.createdAt as unknown as string).getTime();
    if (!Number.isFinite(createdAt)) return false;
    return Date.now() - createdAt <= SIGNUP_ATTRIBUTION_WINDOW_MS;
  } catch {
    return false;
  }
}

export async function getReferral(userId: string): Promise<ReferralInfo> {
  const account = await ensureAccount(userId);
  return {
    code: account.referralCode!,
    referredCount: await countReferred(userId),
  };
}

// Best-effort attribution: set `referredBy` once, only for a genuinely new
// account, only to an existing different account's code. Always returns the
// caller's own referral info (never throws on an ineligible claim).
export async function claimReferral(
  userId: string,
  code: string,
  log: Logger,
): Promise<ReferralInfo> {
  const me = await ensureAccount(userId);
  const trimmed = code.trim();

  if (me.referredBy || !trimmed || trimmed === me.referralCode) {
    return { code: me.referralCode!, referredCount: await countReferred(userId) };
  }

  const [referrer] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.referralCode, trimmed));

  if (referrer && referrer.id !== userId && (await isFreshSignup(userId))) {
    const [updated] = await db
      .update(usersTable)
      .set({ referredBy: referrer.id, referredAt: new Date() })
      .where(and(eq(usersTable.id, userId), isNull(usersTable.referredBy)))
      .returning();
    if (updated?.referredBy) {
      log.info({ userId, referrerId: referrer.id }, "referral attributed");
    }
  }

  return { code: me.referralCode!, referredCount: await countReferred(userId) };
}
