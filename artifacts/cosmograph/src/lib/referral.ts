// Referral links. Every signed-in account gets a stable code; a brand-new
// account that signs up after arriving via `?ref=<code>` is attributed to the
// referrer. The code is captured BEFORE sign-up (the visitor isn't signed in
// yet), stashed in localStorage, and claimed once they sign in.

const REF_PARAM = "ref";
const PENDING_KEY = "cosmograph.pendingRef";

// Codes are short alphanumerics; anything else (or absent) is ignored.
function isValidCode(code: string): boolean {
  return /^[A-Za-z0-9]{4,16}$/.test(code);
}

export function readReferralParam(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get(REF_PARAM);
    const code = (raw ?? "").trim();
    return isValidCode(code) ? code : null;
  } catch {
    return null;
  }
}

// Drop the `?ref=` param from the URL (without a history entry) so it isn't
// re-shared by accident and the address bar stays clean.
export function stripReferralParam(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(REF_PARAM)) return;
    params.delete(REF_PARAM);
    const qs = params.toString();
    const next =
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState({}, "", next);
  } catch {
    // ignore (history disabled)
  }
}

export function getPendingReferral(): string | null {
  try {
    const code = window.localStorage.getItem(PENDING_KEY);
    return code && isValidCode(code) ? code : null;
  } catch {
    return null;
  }
}

export function setPendingReferral(code: string): void {
  try {
    window.localStorage.setItem(PENDING_KEY, code);
  } catch {
    // ignore (storage disabled)
  }
}

export function clearPendingReferral(): void {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

// The full shareable invite link for a given code.
export function buildReferralLink(code: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?${REF_PARAM}=${encodeURIComponent(code)}`;
}
