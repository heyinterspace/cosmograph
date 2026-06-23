---
name: Active scientist in URL
description: Why the explored OpenAlex author is encoded as ?author= and carried through Stripe Checkout.
---

The active scientist is loaded live from OpenAlex and is NOT part of the baked
bundle. Encode it in the URL as `?author=A123` so it survives reloads, shared
links, and especially the Stripe Checkout round-trip (which redirects away and
back to the app base URL).

**Rule:** any flow that navigates the browser away and back (Stripe, OAuth)
must carry the active author id, or the user lands on the default home
scientist and loses their place.

**How to apply:**
- Default scientist clears the param (clean home URL); non-default sets it.
- Checkout request takes an optional `author`; the server embeds a
  server-side-sanitized id (`/^A\d+$/`) into both success_url and cancel_url.
  Never trust a client author id directly in a redirect URL — it can inject
  query params.
- On mount, restore the scientist named in `?author=` (skip if it equals the
  default). This same effect handles both plain reloads and the post-payment
  return; entitlement confirmation runs independently so canExplore flips
  without a reload.
- The redirect param-stripper (EntitlementBridge) must keep `author` when it
  removes unlocked/session_id/unlock_cancelled.
