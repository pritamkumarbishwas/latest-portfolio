import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Sliding-window rate limiting for /api/chat, keyed by client IP:
 * 10 requests per minute and 50 per day.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN are set (required in
 * production — the route fails closed without them). In development it falls
 * back to a single-process in-memory limiter and logs a warning once.
 */

export const CHAT_RATE_PER_MINUTE = 10;
export const CHAT_RATE_PER_DAY = 50;

const MINUTE_WINDOW = "1 m";
const DAY_WINDOW = "1 d";

export type ChatRateLimitResult = {
  limited: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export type Limiters = {
  minute: Ratelimit;
  day: Ratelimit;
};

let cachedLimiters: Limiters | null | undefined;

function getUpstashLimiters(): Limiters | null {
  if (cachedLimiters !== undefined) return cachedLimiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cachedLimiters = null;
    return null;
  }

  const redis = new Redis({ url, token });
  cachedLimiters = {
    minute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(CHAT_RATE_PER_MINUTE, MINUTE_WINDOW),
      prefix: "chat:rl:min",
    }),
    day: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(CHAT_RATE_PER_DAY, DAY_WINDOW),
      prefix: "chat:rl:day",
    }),
  };
  return cachedLimiters;
}

type MemoryBucket = {
  minute: number[];
  day: number[];
};

const memoryStore = new Map<string, MemoryBucket>();
const MEMORY_MAX_KEYS = 10_000;
const MINUTE_WINDOW_MS = 60_000;
const DAY_WINDOW_MS = 86_400_000;
let memoryWarned = false;

function pruneBucket(timestamps: number[], windowMs: number, now: number): void {
  while (timestamps.length > 0 && timestamps[0]! <= now - windowMs) {
    timestamps.shift();
  }
}

function memoryLimit(ip: string): ChatRateLimitResult {
  if (!memoryWarned) {
    memoryWarned = true;
    console.warn(
      "[chat] UPSTASH_REDIS_REST_URL/TOKEN not set — using an in-memory rate limiter. This is development-only; production fails closed until Upstash is configured.",
    );
  }

  const now = Date.now();

  if (memoryStore.size >= MEMORY_MAX_KEYS && !memoryStore.has(ip)) {
    for (const [key, bucket] of memoryStore) {
      const oldest = bucket.day[0] ?? now;
      if (oldest <= now - DAY_WINDOW_MS) memoryStore.delete(key);
      if (memoryStore.size < MEMORY_MAX_KEYS) break;
    }
    if (memoryStore.size >= MEMORY_MAX_KEYS && !memoryStore.has(ip)) {
      const fallbackKey = memoryStore.keys().next().value;
      if (fallbackKey !== undefined) memoryStore.delete(fallbackKey);
    }
  }

  let bucket = memoryStore.get(ip);
  if (!bucket) {
    bucket = { minute: [], day: [] };
    memoryStore.set(ip, bucket);
  }

  pruneBucket(bucket.minute, MINUTE_WINDOW_MS, now);
  pruneBucket(bucket.day, DAY_WINDOW_MS, now);

  if (bucket.minute.length >= CHAT_RATE_PER_MINUTE) {
    const oldest = bucket.minute[0]!;
    return {
      limited: true,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + MINUTE_WINDOW_MS - now) / 1000)),
    };
  }
  if (bucket.day.length >= CHAT_RATE_PER_DAY) {
    const oldest = bucket.day[0]!;
    return {
      limited: true,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + DAY_WINDOW_MS - now) / 1000)),
    };
  }

  bucket.minute.push(now);
  bucket.day.push(now);
  return {
    limited: false,
    remaining: Math.min(
      CHAT_RATE_PER_MINUTE - bucket.minute.length,
      CHAT_RATE_PER_DAY - bucket.day.length,
    ),
    retryAfterSeconds: 0,
  };
}

function secondsUntil(resetMs: number): number {
  return Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
}

async function upstashLimit(ip: string, limiters: Limiters): Promise<ChatRateLimitResult> {
  const minute = await limiters.minute.limit(ip);
  if (!minute.success) {
    return { limited: true, remaining: 0, retryAfterSeconds: secondsUntil(minute.reset) };
  }

  const day = await limiters.day.limit(ip);
  if (!day.success) {
    return { limited: true, remaining: 0, retryAfterSeconds: secondsUntil(day.reset) };
  }

  return {
    limited: false,
    remaining: Math.min(minute.remaining, day.remaining),
    retryAfterSeconds: 0,
  };
}

/**
 * Checks the per-IP sliding windows. Throws when no limiter is available
 * (production without Upstash, or a Redis outage) — callers must fail closed.
 */
export async function checkChatRateLimit(ip: string): Promise<ChatRateLimitResult> {
  const limiters = getUpstashLimiters();

  if (limiters) {
    try {
      return await upstashLimit(ip, limiters);
    } catch (error) {
      console.error(
        "[chat] Upstash rate limiter error:",
        error instanceof Error ? error.name : "unknown",
      );
      throw error;
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production",
    );
  }

  return memoryLimit(ip);
}

/** First client IP from x-forwarded-for (untrusted but platform-provided), capped for safety. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && first.length <= 45) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && realIp.length <= 45) return realIp;

  return "unknown";
}
