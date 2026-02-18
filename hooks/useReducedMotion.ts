// hooks/useReducedMotion.ts
// UPDATED: CP19 - SSR-safe initial read, typo fix on ts-expect-error

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────
// SSR-safe helper — reads the media query value synchronously
// on the client so the very first render is already correct.
// Returns false during SSR (no window) — safe default.
// ─────────────────────────────────────────────────────────
function getInitialValue(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  // Initialize with the real value — no flash of wrong animation
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    getInitialValue
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      // Modern browsers
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Legacy browsers (Safari < 14, older Android WebView)
      mediaQuery.addListener(handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }, []);

  return prefersReducedMotion;
}

// ─────────────────────────────────────────────────────────
// Get motion variants — reduced motion users get opacity-only
// no transforms, no movement, just a clean fade
// ─────────────────────────────────────────────────────────
export function getMotionVariants(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeOut" },
  };
}

// ─────────────────────────────────────────────────────────
// Particle helpers — mobile gets fewer, reduced motion gets none
// ─────────────────────────────────────────────────────────
export function shouldShowParticles(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion;
}

export function getParticleCount(prefersReducedMotion: boolean): number {
  if (prefersReducedMotion) return 0;
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  return isMobile ? 30 : 80;
}

// ─────────────────────────────────────────────────────────
// Stagger delay — capped for mobile performance
// With 12 log entries at 0.1s each = 1.2s total chain.
// Cap at 0.05s per item on mobile so max chain = 600ms.
// ─────────────────────────────────────────────────────────
export function getStaggerDelay(
  index: number,
  prefersReducedMotion: boolean
): number {
  if (prefersReducedMotion) return 0;
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  const baseDelay = isMobile ? 0.05 : 0.1;
  // Hard cap — no item should wait more than 0.5s to appear
  return Math.min(index * baseDelay, 0.5);
}