// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Point to your schema file
  schema: 'prisma/schema.prisma',
  
  // Define connection logic (moved from schema.prisma)
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('DIRECT_URL'), // For migrations in serverless
  },
  
  // Migration path
  migrations: {
    path: 'prisma/migrations',
  },
});