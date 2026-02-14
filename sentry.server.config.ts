// ============================================
// ASCENT LEDGER - SENTRY SERVER CONFIG
// ============================================
// Sprint 5 - Checkpoint 5: Server Error Tracking
// Captures errors in API routes and server components
// ============================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN - Where to send errors
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing - Sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Filter out noise
  ignoreErrors: [
    // Database connection retries (handled gracefully)
    'Connection terminated',
    'ECONNREFUSED',
    // Expected auth errors
    'Invalid token',
    'Unauthorized',
  ],

  // Add custom tags
  initialScope: {
    tags: {
      app: 'ascent-ledger',
      component: 'server',
    },
  },

  // Server-specific integrations
  integrations: [
    // HTTP integration for tracking API calls
    Sentry.httpIntegration(),
  ],
});