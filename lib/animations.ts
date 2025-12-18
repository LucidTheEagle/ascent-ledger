/**
 * ASCENT LEDGER - ANIMATION UTILITIES
 * Framer Motion variants and helper functions
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
// ============================================

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: TIMING.fadeIn / 1000,
      ease: EASING.easeOut,
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: TIMING.fadeIn / 1000,
      ease: EASING.easeIn,
    }
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
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    }
  },
};

export const slideInLeftVariants: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    }
  },
  exit: {
    opacity: 0,
    x: 60,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    }
  },
};

export const slideInRightVariants: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    }
  },
  exit: {
    opacity: 0,
    x: -60,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    }
  },
};

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeOut,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: TIMING.slideUp / 1000,
      ease: EASING.easeIn,
    }
  },
};

// ============================================
// STAGGER CONTAINER VARIANTS
// ============================================

/**
 * Use this for parent containers that stagger children
 * Example: <motion.div variants={staggerContainerVariants}>
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: TIMING.staggerShort / 1000,
    }
  },
};

export const staggerContainerMediumVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: TIMING.staggerMedium / 1000,
    }
  },
};

export const staggerContainerLongVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: TIMING.staggerLong / 1000,
    }
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
    }
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
    }
  },
};

// ============================================
// INFINITE LOOP VARIANTS
// ============================================

export const wobbleVariants: Variants = {
  animate: {
    rotate: [-2, 2, -2, 2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    }
  },
};

export const floatVariants: Variants = {
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: EASING.easeInOut,
    }
  },
};

export const pulseSlowVariants: Variants = {
  animate: {
    opacity: [1, 0.8, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: EASING.easeInOut,
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates a custom delay for staggered animations
 */
export function createStaggerDelay(index: number, baseDelay: number = 100): Transition {
  return {
    delay: (index * baseDelay) / 1000,
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
      }
    },
  };
}

/**
 * Viewport scroll trigger config for IntersectionObserver
 */
export const viewportConfig = {
  once: true,        // Animate only once
  amount: 0.2,       // Trigger when 20% of element is visible
  margin: "0px 0px -100px 0px", // Trigger slightly before element is in view
};

/**
 * GPU acceleration hint (add to motion.div)
 */
export const gpuAcceleration = {
  style: {
    transform: "translateZ(0)",
    willChange: "transform, opacity",
  }
};