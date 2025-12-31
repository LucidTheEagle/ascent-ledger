// hooks/useReducedMotion.ts

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } 
    // Legacy browsers
    else {
      // @ts-exoect-error - Legacy API
      mediaQuery.addListener(handleChange);
      // '@ts-expect-error'
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

// Helper: Get simplified animation variants for reduced motion users
export function getMotionVariants(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    // Simple fade only - no transforms
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    };
  }

  // Full animations for users who want them
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };
}

// Helper: Should we show particles?
export function shouldShowParticles(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion;
}

// Helper: Get particle count based on device + motion preference
export function getParticleCount(prefersReducedMotion: boolean): number {
  if (prefersReducedMotion) return 0;
  
  // Reduce on mobile for performance
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return isMobile ? 40 : 80;
}