---
name: Stripe one-time entitlement (galactic unlock)
description: How the $10 one-time unlock entitlement is derived without fighting stripe-replit-sync.
---

# $10 one-time unlock entitlement

The app gates exploring *searched* (non-default) scientists behind a $10 one-time Stripe
payment, tied to a Clerk user. Donations are **GitHub Sponsors** (link-out), NOT Stripe —
Stripe is unlock-only.

## Rule
Entitlement (`has_paid`) is derived from Stripe's synced data + a live confirm, never from
custom webhook-signature parsing.

- App table `entitlements` (public schema): `clerk_user_id` PK, `stripe_customer_id`,
  `has_paid` bool, `updated_at`. This is the cached source of truth the gate reads.
- Checkout: signed-in user → ensure a Stripe Customer (store id) → Checkout Session
  `mode: payment`, the seeded $10 unlock price, `client_reference_id` + `metadata.clerkUserId`
  + `metadata.kind=galactic_unlock`, `success_url=...?unlock=success&session_id={CHECKOUT_SESSION_ID}`.
- Confirm-on-redirect: frontend posts the `session_id`; server does a **live**
  `stripe.checkout.sessions.retrieve`, and if `payment_status==='paid'` and it belongs to this
  Clerk user → set `has_paid=true`. Gives instant unlock without waiting on a webhook.
- Backstop: `GET /entitlement` — if `has_paid` is still false, query the synced
  `stripe.checkout_sessions` for a paid `galactic_unlock` session for that customer; if found,
  flip `has_paid=true`. Covers users who close the tab before redirect (webhook syncs the row).

**Why:** `stripe-replit-sync.processWebhook(payload, sig)` resolves the webhook secret itself;
`findOrCreateManagedWebhook` only returns `.secret` on first *creation* (Stripe never returns it
on later "find"), so a boot-time-captured secret is unreliable for our own
`constructEvent` verification. Reading the synced `stripe.*` tables (kept fresh by the sync) +
a live retrieve on redirect avoids needing that secret at all.

**How to apply:** Keep the webhook handler minimal (just `sync.processWebhook`). Put all
entitlement logic in the confirm endpoint and the `/entitlement` read path. Never INSERT into
the `stripe` schema — only query it.
