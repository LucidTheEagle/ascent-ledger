// prisma.config.ts
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:5432/placeholder',
    shadowDatabaseUrl: process.env.DIRECT_URL ?? 'postgresql://placeholder:5432/placeholder',
  },
})