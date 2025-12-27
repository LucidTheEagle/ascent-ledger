// lib/haptics.ts
// Haptic feedback utility for mobile interactions

export const haptics = {
    /**
     * Light tap - for button presses, CTA clicks
     * Duration: 10ms
     */
    light: () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
  
    /**
     * Medium tap - for card snaps, carousel navigation
     * Duration: 20ms
     */
    medium: () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(20);
      }
    },
  
    /**
     * Pulse - for important events, ticker scroll into view
     * Duration: 30ms
     */
    pulse: () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
    },
  
    /**
     * Success pattern - for completed actions
     * Pattern: short-pause-short
     */
    success: () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  
    /**
     * Error pattern - for warnings or errors
     * Pattern: long vibration
     */
    error: () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    },
  };
  
  /**
   * Check if haptic feedback is supported
   */
  export const isHapticsSupported = (): boolean => {
    return typeof navigator !== "undefined" && "vibrate" in navigator;
  };