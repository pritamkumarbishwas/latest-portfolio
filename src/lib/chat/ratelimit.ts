import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Sliding-window rate limiting for /api/chat, keyed by client IP:
 * 10 requests per minute and 50 per day.
 *
 * Uses a single-process in-memory limiter. Note that this is not shared
 * across serverless instances and state is lost on cold starts.
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
      "[chat] Using an in-memory rate limiter. This is not shared across instances in production.",
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

/**
 * Checks the per-IP sliding windows.
 */
export async function checkChatRateLimit(ip: string): Promise<ChatRateLimitResult> {
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
