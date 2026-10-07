const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BUCKETS = 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { limited: false, retryAfterSeconds: 0 };
}
