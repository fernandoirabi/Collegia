// ============================================================
// COLLEGIA — SIMPLE IN-MEMORY RATE LIMITER
//
// A fixed-window token-bucket limiter keyed by an arbitrary id
// (the client IP for endpoints). In-memory (Map) is correct for a
// single Next.js instance and only guards against casual abuse.
// For horizontally-scaled deployments, swap the backing store for
// Redis or a shared bucket without changing callers.
// ============================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const DEFAULT_WINDOW_MS = 10_000; // 10s
const DEFAULT_MAX = 30;

function prune() {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true if the caller may proceed. Otherwise false (rate limited).
 * Cheap, best-effort protection — never a source of truth for abuse.
 */
export function rateLimit(
  key: string,
  { max = DEFAULT_MAX, windowMs = DEFAULT_WINDOW_MS }: { max?: number; windowMs?: number } = {}
): boolean {
  const now = Date.now();
  if (buckets.size > 10_000) prune();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= max;
}