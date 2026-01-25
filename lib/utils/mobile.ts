// ============================================
// lib/utils/mobile.ts
// MOBILE OPTIMIZATION UTILITIES
// Handles keyboard, scrolling, viewport issues
// ============================================

/**
 * Scroll input into view when keyboard appears
 * Prevents keyboard from blocking input on mobile
 */
export function scrollInputIntoView(element: HTMLElement) {
    if (typeof window === 'undefined') return;
  
    // Only on mobile devices
    if (window.innerWidth > 768) return;
  
    // Wait for keyboard to appear (300ms delay)
    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  }
  
  /**
   * Check if device is mobile
   */
  export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  
  /**
   * Get safe viewport height (accounts for mobile browser chrome)
   */
  export function getSafeViewportHeight(): number {
    if (typeof window === 'undefined') return 0;
    
    // Use visualViewport if available (accounts for keyboard)
    if (window.visualViewport) {
      return window.visualViewport.height;
    }
    
    return window.innerHeight;
  }
  
  /**
   * Prevent body scroll when modal/overlay is open
   */
  export function lockBodyScroll() {
    if (typeof document === 'undefined') return;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }
  
  export function unlockBodyScroll() {
    if (typeof document === 'undefined') return;
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
  
  /**
   * Optimize animation performance on mobile
   */
  export function optimizeForMobile() {
    if (typeof window === 'undefined') return false;
    
    // Reduce motion if user prefers
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    
    if (prefersReducedMotion) return true;
    
    // Check if low-end device
    const isLowEnd = 
      /Android.*Chrome\/[.0-9]* Mobile/i.test(navigator.userAgent) ||
      /iPhone OS [5-9]_/i.test(navigator.userAgent);
    
    return isLowEnd;
  }