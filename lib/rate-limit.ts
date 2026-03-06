/**
 * Rate limit por IP. Usa Upstash Redis quando UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
 * estão definidos; caso contrário usa um Map em memória (uma instância apenas).
 */

const WINDOW_SEC = 15 * 60; // 15 min
const MAX_ATTEMPTS = 5;

const store = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function inMemoryCheck(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_SEC * 1000 });
    return { allowed: true };
  }
  if (entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_SEC * 1000 });
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function inMemoryClear(ip: string): void {
  store.delete(ip);
}

async function redisCheck(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const key = `ratelimit:login:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SEC);
  const ttl = await redis.ttl(key);
  if (count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: ttl > 0 ? ttl : WINDOW_SEC };
  }
  return { allowed: true };
}

async function redisClear(ip: string): Promise<void> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  await redis.del(`ratelimit:login:${ip}`);
}

function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function checkLoginRateLimit(
  request: Request
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip = getClientIp(request);
  if (isRedisConfigured()) return redisCheck(ip);
  return inMemoryCheck(ip);
}

export async function clearLoginRateLimit(request: Request): Promise<void> {
  const ip = getClientIp(request);
  if (isRedisConfigured()) await redisClear(ip);
  else inMemoryClear(ip);
}
