// ============================================
// ASCENT LEDGER - APP PROVIDERS
// ============================================
// Sprint 5 - Checkpoint 6: PostHog Provider
// Initializes PostHog on app load
// ============================================

'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from '@/lib/posthog/client';

// ─────────────────────────────────────────────────────────
// INNER COMPONENT — uses useSearchParams(), must be inside Suspense
// ─────────────────────────────────────────────────────────
function PostHogPageTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// ─────────────────────────────────────────────────────────
// EXPORTED PROVIDER — Suspense boundary required for useSearchParams()
// ─────────────────────────────────────────────────────────
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PostHogPageTracker>{children}</PostHogPageTracker>
    </Suspense>
  );
}