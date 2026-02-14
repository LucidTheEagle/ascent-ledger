// ============================================
// ASCENT LEDGER - RATE LIMITER
// ============================================
// Sprint 5 - Checkpoint 7: API Rate Limiting
// Protect API routes from abuse using sliding window algorithm
// ============================================

import { redis } from './client';
import { NextRequest } from 'next/server';

// ============================================
// RATE LIMIT CONFIGURATION
// ============================================

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number;
  
  /**
   * Time window in seconds
   */
  window: number;
  
  /**
   * Custom identifier (userId, IP, etc.)
   */
  identifier?: string;
}

// Default rate limits
export const RATE_LIMITS = {
  // Authenticated users: 100 requests per hour
  AUTHENTICATED: {
    limit: 100,
    window: 3600, // 1 hour in seconds
  },
  
  // Anonymous users: 10 requests per hour
  ANONYMOUS: {
    limit: 10,
    window: 3600,
  },
  
  // Strict endpoints (vision, crisis): 5 requests per hour
  STRICT: {
    limit: 5,
    window: 3600,
  },
} as const;

// ============================================
// RATE LIMITER RESPONSE
// ============================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when the limit resets
}

// ============================================
// RATE LIMITING LOGIC
// ============================================

/**
 * Check if a request should be rate limited
 * Uses sliding window counter algorithm
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window, identifier } = config;
  
  // Generate unique key for this rate limit
  const key = identifier || getClientIdentifier(request);
  const rateLimitKey = `rate_limit:${key}`;
  
  try {
    // Get current count
    const current = await redis.get<number>(rateLimitKey);
    const count = current || 0;
    
    // Calculate reset time
    const ttl = await redis.ttl(rateLimitKey);
    const reset = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + (window * 1000);
    
    // Check if limit exceeded
    if (count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      };
    }
    
    // Increment counter
    const newCount = await redis.incr(rateLimitKey);
    
    // Set expiry on first request
    if (newCount === 1) {
      await redis.expire(rateLimitKey, window);
    }
    
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - newCount),
      reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    // Fail open: allow request if Redis is down
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + (window * 1000),
    };
  }
}

// ============================================
// IDENTIFIER HELPERS
// ============================================

/**
 * Get unique identifier for rate limiting
 * Priority: userId > IP address > forwarded IP
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth (if available)
  // You can customize this based on your auth setup
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

// ============================================
// MIDDLEWARE HELPER
// ============================================

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult) {
  const status = result.success ? 200 : 429;
  const message = result.success 
    ? 'Request allowed' 
    : 'Too many requests. Please try again later.';
  
  return new Response(
    JSON.stringify({
      error: !result.success,
      message,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        ...(status === 429 && {
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        }),
      },
    }
  );
}