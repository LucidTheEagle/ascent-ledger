// ============================================
// ASCENT LEDGER - PRISMA CLIENT SINGLETON
// ============================================
// Sprint 5 - Checkpoint 1: Bulletproof Singleton
// Prevents connection timeouts & pool exhaustion
// ============================================

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// ============================================
// GLOBAL SINGLETON TYPE
// ============================================
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// ============================================
// ENVIRONMENT VALIDATION
// ============================================
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

// ============================================
// CONNECTION POOL CONFIGURATION
// ============================================
// Optimized for Supabase Pooler (Transaction Mode)
// Pooler handles actual Postgres connections - we just need a stable pool

const createPool = () => {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    
    // Connection Limits (Supabase pooler max is typically 15-20)
    max: 10, // Max connections in pool (increased from 5)
    min: 2,  // Keep 2 connections warm
    
    // Timeout Settings (more generous for stability)
    idleTimeoutMillis: 60000, // Keep idle connections for 60s (not 20s)
    connectionTimeoutMillis: 10000, // 10s to establish connection (not 5s)
    
    // Pool Behavior
    allowExitOnIdle: false, // Keep pool alive in serverless (critical!)
    
    // Statement Timeout (Supabase default is 60s)
    statement_timeout: 30000, // 30s max per query
  })
}

// ============================================
// INITIALIZE POOL (SINGLETON)
// ============================================
if (!globalForPrisma.pool) {
  globalForPrisma.pool = createPool()
  
  // Handle pool errors gracefully
  globalForPrisma.pool.on('error', (err) => {
    console.error('Unexpected pool error:', err)
  })
}

const pool = globalForPrisma.pool

// ============================================
// PRISMA ADAPTER
// ============================================
const adapter = new PrismaPg(pool)

// ============================================
// PRISMA CLIENT SINGLETON
// ============================================
const createPrismaClient = () => {
  return new PrismaClient({
    adapter,
    
    // Logging (development vs production)
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    
    // Transaction Settings
    transactionOptions: {
      timeout: 15000, // 15s transaction timeout (increased from 10s)
      maxWait: 10000, // 10s max wait to acquire connection (increased from 5s)
      isolationLevel: 'ReadCommitted', // Default, but explicit
    },
  })
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// In development, preserve instance across HMR
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
// Ensure connections close properly on server shutdown
if (typeof window === 'undefined') {
  const shutdown = async () => {
    await prisma.$disconnect()
    await pool.end()
  }

  process.on('beforeExit', shutdown)
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

// ============================================
// HEALTH CHECK HELPER (Optional - for monitoring)
// ============================================
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export default prisma