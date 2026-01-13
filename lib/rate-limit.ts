// lib/rate-limit.ts - Rate limiting middleware
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from './redis';

export interface RateLimitConfig {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block after exceeding limit
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  public: { points: 120, duration: 60 }, // 120 requests per minute
  auth: { points: 10, duration: 60, blockDuration: 300 }, // 10 auth attempts per minute, 5 min block
  api: { points: 60, duration: 60 }, // 60 API calls per minute for authenticated users
  business: { points: 300, duration: 60 }, // 300 requests per minute for business accounts
};

export async function checkRateLimit(
  identifier: string,
  config?: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const cfg = config || defaultConfigs.public;
  const key = `ratelimit:${identifier}`;
  
  try {
    const redis = getRedisClient();
    const now = Date.now();
    const windowStart = now - (cfg.duration * 1000);

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const requestCount = await redis.zcard(key);

    if (requestCount >= cfg.points) {
      // Check if blocked
      const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetAt = oldestRequest[1] 
        ? parseInt(oldestRequest[1]) + (cfg.blockDuration || cfg.duration) * 1000
        : now + cfg.duration * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}:${Math.random()}`);
    await redis.expire(key, cfg.duration + (cfg.blockDuration || 0));

    return {
      allowed: true,
      remaining: cfg.points - requestCount - 1,
      resetAt: now + cfg.duration * 1000,
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: -1,
      resetAt: Date.now() + 60000,
    };
  }
}

export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Use IP address for anonymous users
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
    || request.headers.get('x-real-ip') 
    || 'unknown';

  return `ip:${ip}`;
}

export async function rateLimitMiddleware(
  request: NextRequest,
  userId?: string,
  configName: keyof typeof defaultConfigs = 'public'
): Promise<NextResponse | null> {
  const identifier = getRateLimitIdentifier(request, userId);
  const config = defaultConfigs[configName];

  const { allowed, remaining, resetAt } = await checkRateLimit(identifier, config);

  if (!allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        resetAt: new Date(resetAt).toISOString(),
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.points.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetAt).toISOString(),
          'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
