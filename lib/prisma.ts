// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Use DATABASE_URL (pooler connection)
const connectionString = process.env.DATABASE_URL

// Create PostgreSQL connection pool with optimized settings for Supabase pooler
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString,
    max: 5, // Keep pool small for Supabase pooler
    idleTimeoutMillis: 20000, // Close idle connections after 20 seconds
    connectionTimeoutMillis: 5000, // Timeout if can't connect in 5 seconds
    allowExitOnIdle: true, // Allow pool to close when idle
  })
}

const pool = globalForPrisma.pool

// Create adapter
const adapter = new PrismaPg(pool)

// Create Prisma Client with adapter and extended timeout
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] // Reduced logging in dev
    : ['error'],
  transactionOptions: {
    timeout: 10000, // 10 second timeout for transactions
    maxWait: 5000, // Wait max 5 seconds to start transaction
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma