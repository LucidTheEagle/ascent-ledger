/**
 * ASCENT LEDGER - ANIMATION UTILITIES
 * Framer Motion variants and helper functions
 * UPDATED: CP19 - Mobile-safe transforms, reduced motion for infinite loops,
 *          capped horizontal slide distances, stagger delay cap
 */

import { Variants, Transition } from "framer-motion";
import { TIMING } from "./constants";

// ============================================
// STANDARD EASING CURVES
// ============================================

export const EASING = {
  easeOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 100, damping: 15 },
  springBounce: { type: "spring" as const, stiffness: 300, damping: 20 },
};

// ============================================
// BASE VARIANTS
// All use transform (opacity, y, x, scale) — GPU composited,
// never animates width/height/top/left which trigger layout reflow
// ============================================

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: TIMING.fadeIn / 1000,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMING.fadeIn / 1000,
      ease: EASING.easeIn,
    },
  },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    },
  },
};

// CP19: Horizontal slides capped at x:20 (was x:60)
// Large horizontal transforms cause visible jank on low-end Android
// because the browser has to composite a wide paint region
export const slideInLeftVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    },
  },
};

export const slideInRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    },
  },
};

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    },
  },
};

// ============================================
// STAGGER CONTAINER VARIANTS
// ============================================

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: TIMING.staggerShort / 1000,
    },
  },
};

export const staggerContainerMediumVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: TIMING.staggerMedium / 1000,
    },
  },
};

export const staggerContainerLongVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: TIMING.staggerLong / 1000,
    },
  },
};

// ============================================
// HOVER VARIANTS
// ============================================

export const hoverScaleVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: TIMING.hover / 1000,
      ease: EASING.easeInOut,
    },
  },
};

export const hoverGlowVariants = {
  rest: {
    boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
  },
  hover: {
    boxShadow: "0 0 24px rgba(59, 130, 246, 0.3)",
    transition: {
      duration: TIMING.hover / 1000,
      ease: EASING.easeInOut,
    },
  },
};

// ============================================
// INFINITE LOOP VARIANTS
// CP19: These must be gated with useReducedMotion before use.
// Usage: const reduced = useReducedMotion()
//        <motion.div animate={reduced ? {} : wobbleVariants.animate} />
// Never use these unconditionally — they loop forever and destroy
// battery life and accessibility for reduced motion users.
// ============================================

export const wobbleVariants: Variants = {
  animate: {
    rotate: [-2, 2, -2, 2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const floatVariants: Variants = {
  animate: {
    // CP19: Use translateY (transform) not top/margin — GPU only
    y: [-8, 0, -8],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: EASING.easeInOut,
    },
  },
};

export const pulseSlowVariants: Variants = {
  animate: {
    opacity: [1, 0.75, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: EASING.easeInOut,
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates a stagger delay capped for mobile performance.
 * At 0.1s per item, 12 items = 1.2s total chain — too long on mobile.
 * Cap: no item waits more than 500ms to appear.
 */
export function createStaggerDelay(
  index: number,
  baseDelay: number = 100
): Transition {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  // Mobile: halve the base delay
  const effectiveDelay = isMobile ? baseDelay / 2 : baseDelay;
  // Hard cap at 500ms regardless of index
  const cappedDelay = Math.min((index * effectiveDelay) / 1000, 0.5);

  return {
    delay: cappedDelay,
    duration: TIMING.fadeIn / 1000,
    ease: EASING.easeOut,
  };
}

/**
 * Creates variants with a custom delay
 */
export function createDelayedVariants(delayMs: number): Variants {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: delayMs / 1000,
        duration: TIMING.slideUp / 1000,
        ease: EASING.easeOut,
      },
    },
  };
}

/**
 * Viewport scroll trigger config for IntersectionObserver
 */
export const viewportConfig = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
};

/**
 * GPU acceleration hint — add to motion.div style prop
 * Forces element onto its own compositor layer.
 * Use sparingly — too many promoted layers increases memory usage.
 */
export const gpuAcceleration = {
  style: {
    transform: "translateZ(0)",
    willChange: "transform, opacity",
  },
};

/**
 * Safe infinite animation helper.
 * Returns the animation only when reduced motion is not preferred.
 * Use this instead of raw infinite variants everywhere.
 *
 * Usage:
 *   const reduced = useReducedMotion()
 *   <motion.div animate={safeInfinite(floatVariants.animate, reduced)} />
 */
export function safeInfinite(
  animation: Variants["animate"],
  prefersReducedMotion: boolean
): Variants["animate"] {
  return prefersReducedMotion ? {} : animation;
}