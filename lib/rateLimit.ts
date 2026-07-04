type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window rate limiter (per serverless instance). A real barrier
 * against single-instance abuse; pair it with the daily $ cost guard. For strong
 * cross-instance limits, back this with Upstash/Redis later.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): { ok: boolean; retryAfterSec: number } {
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** First hop of x-forwarded-for (Vercel sets this), else a fallback bucket. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}
