---
name: Iframe auth handoff
description: Why Cosmograph auth pages detect iframing and hand off to a new top-level tab.
---

In the Replit dev preview the app runs inside an iframe. OAuth providers
(Google/GitHub) refuse to render their consent screens in an iframe, so Clerk
pops OAuth into a new tab while its bot/Cloudflare challenge stays in the framed
page — a confusing split. This split is essentially a **dev-preview artifact**:
in the published app (or the preview opened in its own tab) the page is
top-level, OAuth does a same-tab redirect, and the challenge renders inline.

**Decision:** `AuthHandoff` (wraps `<SignIn>`/`<SignUp>` in `App.tsx`) detects
`window.self !== window.top` (try/catch → treat cross-origin throw as framed)
and, when framed, replaces the Clerk widget with a "Continue in a new window"
button (`window.open(location.href, "_blank", "noopener,noreferrer")`) so the
whole flow finishes top-level. When not framed it renders the real widget
unchanged, so production is untouched.

**Why:** Clerk's bot challenge is Replit-managed and NOT code/Auth-pane
configurable — can't suppress it; the only lever is keeping the whole flow in one
top-level window. The handoff is purely a UX fix for embedded contexts.
