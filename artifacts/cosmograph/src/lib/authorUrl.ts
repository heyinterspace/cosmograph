// Keep the active scientist in the URL so it survives reloads and the Stripe
// Checkout round-trip (which redirects away and back to the app). The OpenAlex
// author id is encoded as a `?author=A123` query param; the default scientist
// uses no param so the home galaxy keeps a clean URL.

const AUTHOR_PARAM = "author";

// Read the requested author id from the current URL, normalized to the
// canonical `A` + digits form. Anything else (or absent) returns null.
export function readAuthorParam(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get(AUTHOR_PARAM);
    const id = (raw ?? "").trim();
    return /^A\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Sync the `author` param into the URL without adding a history entry. Pass the
// active id to set it, or null to drop it (back on the default scientist). The
// pathname, hash, and any other query params are preserved.
export function writeAuthorParam(id: string | null): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (id) params.set(AUTHOR_PARAM, id);
    else params.delete(AUTHOR_PARAM);
    const qs = params.toString();
    const next =
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState({}, "", next);
  } catch {
    // ignore (storage/history disabled)
  }
}
