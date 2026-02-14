// ============================================
// ASCENT LEDGER - SENTRY EDGE CONFIG
// ============================================
// Sprint 5 - Checkpoint 5: Edge Runtime Error Tracking
// Captures errors in middleware and edge functions
// ============================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN - Where to send errors
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing - Lower sample rate for edge (higher volume)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Add custom tags
  initialScope: {
    tags: {
      app: 'ascent-ledger',
      component: 'edge',
    },
  },
});