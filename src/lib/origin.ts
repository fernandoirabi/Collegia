// ============================================================
// COLLEGIA — ORIGIN CHECK
//
// Cross-site request defense. A genuine same-origin browser request
// sends an Origin header whose host matches the app's own host. We
// allow any null origin (non-browser clients like curl/APIs) because
// they are still gated by authentication; the Origin check specifically
// closes the browser CSRF vector.
// ============================================================

/** Hosts considered first-party regardless of config (local dev). */
const TRUSTED_LOCAL = new Set(["localhost", "127.0.0.1"]);
/** Any platform that drives production (e.g. Vercel preview/deploy host). */
const TRUSTED_SUFFIX_LOGIN = ".vercel.app";

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  try {
    const hostname = new URL(origin).hostname;
    if (TRUSTED_LOCAL.has(hostname)) return true;
    if (hostname.endsWith(TRUSTED_SUFFIX_LOGIN)) return true;
    return false;
  } catch {
    return false;
  }
}