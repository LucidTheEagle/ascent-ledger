// ============================================
// ASCENT LEDGER - POSTHOG CLIENT
// ============================================
// Sprint 5 - Checkpoint 6: Analytics Setup
// PostHog initialization and configuration
// ============================================

import posthog from 'posthog-js';

// Initialize PostHog (client-side only)
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    // Only initialize if not already initialized
    if (!posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        
        // Privacy & Performance Settings
        autocapture: false, // We'll manually track important events only
        capture_pageview: true, // Auto-track page views
        capture_pageleave: true, // Track when users leave
        
        // Session Recording (useful for debugging UX issues)
        session_recording: {
          maskAllInputs: true, // Privacy: mask all input fields
          maskTextSelector: '[data-private]', // Mask elements with data-private attribute
        },
        // Only enable in production to avoid dev noise
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing(); // Don't track in development
          }
        },
        
        // Performance
        persistence: 'localStorage', // Use localStorage for session persistence
      });
    }
  }
  
  return posthog;
};

// Export singleton instance
export { posthog };