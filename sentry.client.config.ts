// ============================================
// ASCENT LEDGER - SENTRY CLIENT CONFIG
// ============================================
// Sprint 5 - Checkpoint 5: Client Error Tracking
// Captures errors in browser/React components
// ============================================

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN - Where to send errors
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing - Sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay - Capture user sessions when errors occur
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Capture 10% of normal sessions

  // Environment
  environment: process.env.NODE_ENV,

  // Only send errors in production (avoid dev noise)
  enabled: process.env.NODE_ENV === 'production',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Privacy: mask all text content
      blockAllMedia: true, // Privacy: block images/videos
    }),
  ],

  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors (user's connection issues)
    'NetworkError',
    'Failed to fetch',
    // Cancelled requests
    'AbortError',
  ],

  // Add custom tags
  initialScope: {
    tags: {
      app: 'ascent-ledger',
      component: 'client',
    },
  },
});