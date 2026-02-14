// ============================================
// ASCENT LEDGER - UPSTASH REDIS CLIENT
// ============================================
// Sprint 5 - Checkpoint 7: Rate Limiting Setup
// Redis client for rate limiting and caching
// ============================================

import { Redis } from '@upstash/redis';

// Validate environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
}

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Export for testing/health checks
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
};