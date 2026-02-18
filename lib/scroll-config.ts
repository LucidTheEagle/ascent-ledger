// lib/scroll-config.ts

/**
 * CHECKPOINT 12: Homepage Scroll & Transition Configuration
 * 
 * Centralized timing, easing, and viewport settings for smooth
 * section-to-section transitions across the homepage.
 */

export const SCROLL_CONFIG = {
    // Scroll behavior
    behavior: {
      smooth: true,
      // Offset for navbar (if sticky)
      offset: 80,
    },
  
    // Viewport intersection settings for section reveals
    viewport: {
      // How much of section must be visible to trigger animation
      amount: 0.2, // 20% visible
      // Only animate once (don't re-trigger on scroll up)
      once: true,
      // Start animation before section fully enters viewport
      margin: "-100px",
    },
  
    // Animation timing per section
    timing: {
      hero: {
        duration: 0.8,
        delay: 0,
        ease: "easeOut",
      },
      fog: {
        duration: 1,
        delay: 0.2,
        ease: "easeOut",
        stagger: 0.15, // Between Fog and Ascent cards
      },
      problem: {
        duration: 0.7,
        delay: 0.1,
        ease: "easeOut",
      },
      solution: {
        duration: 0.8,
        delay: 0.15,
        ease: "easeOut",
      },
      trinity: {
        duration: 0.9,
        delay: 0.2,
        ease: "easeOut",
        stagger: 0.12, // Between cards
      },
      socialProof: {
        duration: 0.7,
        delay: 0.15,
        ease: "easeOut",
      },
      footer: {
        duration: 0.6,
        delay: 0.1,
        ease: "easeOut",
      },
    },
  
    // Easing functions (for custom use)
    easing: {
      smooth: [0.43, 0.13, 0.23, 0.96], // Custom bezier
      spring: { type: "spring", stiffness: 100, damping: 15 },
      default: "easeOut",
    },
  
    // Section-specific reveal variants
    variants: {
      fadeUp: {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
      },
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
      },
      slideInLeft: {
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0 },
      },
      slideInRight: {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
      },
    },
  } as const;
  
  // Helper: Get timing config for a section
  export function getSectionTiming(section: keyof typeof SCROLL_CONFIG.timing) {
    return SCROLL_CONFIG.timing[section];
  }
  
  // Helper: Get viewport config (shared across all sections)
  export function getViewportConfig() {
    return SCROLL_CONFIG.viewport;
  }
  
  // Helper: Apply reduced motion override
  export function getMotionConfig(prefersReducedMotion: boolean) {
    if (prefersReducedMotion) {
      return {
        duration: 0.01, // Instant
        delay: 0,
      };
    }
    return null; // Use defaults
  }