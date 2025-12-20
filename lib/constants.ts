/**
 * ASCENT LEDGER - CONSTANTS
 * All copy, timing values, and design tokens in one place
 */

// ============================================
// HOMEPAGE COPY
// ============================================

export const COPY = {
    hero: {
      h1: {
        staticText: "STOP MISTAKING MOTION FOR",
        flipWords: ["PROGRESS", "GROWTH", "MOMENTUM", "ASCENT"],
      },
      subheading: "You are working hard. But are you ascending?",
      highlightWord: "ascending",
      cta: {
        primary: "ENTER THE COCKPIT",
        secondary: "READ THE MANIFESTO",
      },
    },
  
    fog: {
      h2: "THE GRAVITY OF CONTEXT SWITCHING",
      leftCard: {
        title: "THE FOG",
        bullets: [
          "50 tabs open",
          "10 vague goals",
          "0 clarity",
        ],
      },
      rightCard: {
        title: "THE ASCENT",
        bullets: [
          "Clear trajectory",
          "Strategic moves",
          "Visible progress",
        ],
      },
      subheading: "You have 50 tabs open. You have 10 goals. You have 0 clarity.",
      painPoint: "0 clarity", // Will be highlighted in red
    },
  
    trinity: {
      h2: "THE COCKPIT SYSTEM",
      visionCard: {
        title: "THE VISION CANVAS",
        placeholder: "I am ascending from micromanagement to strategic leadership...",
        cta: "Declare your altitude.",
      },
      logCard: {
        title: "THE STRATEGIC LOG",
        bulletExample: "Coffee chat with Director",
        statusLabel: "Leverage Built",
        cta: "Track your velocity.",
      },
      fogCheckCard: {
        title: "THE FOG CHECK",
        quote: "You are building a library, not a career.",
        quoteWords: {
          library: "library", // Will flicker RED
          career: "career",   // Will glow BLUE
        },
        cta: "Receive the insight.",
      },
    },
  
    socialProof: {
      h2: "PILOTS IN THE AIR",
      subheading: {
        line1: "Join the closed beta.",
        line2: "The airspace is limited.", // Will be highlighted in amber
      },
      ticker: [
        "USER_092: ASCENT_STREAK_12_WEEKS",
        "USER_114: LEVERAGE_MOMENT_DETECTED",
        "USER_005: PROMOTED_TO_LEAD",
        "USER_088: FOG_CLEARED_WEEK_8",
        "USER_203: VISION_LOCKED",
        "USER_017: MILESTONE_ACHIEVED_10_WEEKS",
        "USER_156: TRANSITION_COMPLETE",
        "USER_241: LEVERAGE_BUILT_Coffee_Chat",
        "USER_073: ASCENT_STREAK_8_WEEKS",
        "USER_129: FOG_CLEARED_WEEK_12",
      ],
      cta: "REQUEST BETA ACCESS",
    },
  
    footer: {
      quote: "I speak like altitude. Calm. Certain. Above the fog.",
      links: [
        { label: "Manifesto", href: "/manifesto" },
        { label: "GitHub", href: "https://github.com/lucidtheeagle/ascent-ledger" },
        { label: "Login", href: "/login" },
      ],
      copyright: "© 2025 Ascent Ledger",
    },
  
    nav: {
      links: [
        { label: "Manifesto", href: "/manifesto" },
        { label: "Features", href: "#trinity" },
        { label: "Pricing", href: "/pricing" },
        { label: "Login", href: "/login" },
      ],
      ctaLabel: "ENTER THE COCKPIT",
    },
  };
  
  // ============================================
  // ANIMATION TIMING (in milliseconds)
  // ============================================
  
  export const TIMING = {
    // Text animations
    textFlipWordDelay: 100, // Delay between each word in H1
    typingSpeed: 50,        // Speed of typing effect (ms per character)
    typingPausePeriod: 300, // Pause at period
    typingPauseComma: 200,  // Pause at comma
  
    // Transition durations
    fadeIn: 500,            // Standard fade in
    slideUp: 600,           // Standard slide up
    hover: 300,             // Hover transitions
  
    // Stagger delays (for sequential animations)
    staggerShort: 200,      // 0.2s between elements
    staggerMedium: 400,     // 0.4s between elements
    staggerLong: 600,       // 0.6s between elements
  
    // Section-specific
    heroCtaDelay: 200,      // Delay after subheading for primary CTA
    heroCtaSecondary: 400,  // Delay for secondary CTA after primary
  
    fogCardLeft: 200,       // Delay for left card after H2
    fogCardRight: 400,      // Delay for right card after left
  
    trinityVision: 300,     // Delay for Vision card after H2
    trinityLog: 600,        // Delay for Log card
    trinityFog: 900,        // Delay for Fog Check card
  };
  
  // ============================================
  // DESIGN TOKENS (CSS Custom Properties)
  // ============================================
  
  export const COLORS = {
    // Backgrounds
    black: '#0A0A0F',
    obsidian: '#13131A',
    card: '#1C1C26',
  
    // Accents
    blue: '#3B82F6',
    purple: '#8B5CF6',
    green: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
  
    // Text
    white: '#FFFFFF',
    gray: '#9CA3AF',
  };
  
  export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };
  
  // ============================================
  // FRAMER MOTION VARIANTS
  // ============================================
  
  export const MOTION_VARIANTS = {
    // Fade in from opacity 0
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  
    // Slide up from bottom
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  
    // Slide in from left
    slideInLeft: {
      initial: { opacity: 0, x: -60 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 60 },
    },
  
    // Slide in from right
    slideInRight: {
      initial: { opacity: 0, x: 60 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -60 },
    },
  
    // Scale in (for cards)
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
  
    // Hover scale (subtle)
    hoverScale: {
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  
    // Wobble (for Vision card)
    wobble: {
      rotate: [-2, 2, -2, 2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  
    // Float (for footer eagle icon)
    float: {
      y: [-10, 0, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };
  
  // ============================================
  // SCROLL THRESHOLDS
  // ============================================
  
  export const SCROLL = {
    navbarHideThreshold: 100,  // Hide full navbar after 100px scroll
    navbarShowDelay: 50,        // Delay before showing floating navbar
  };
  
  // ============================================
  // PERFORMANCE BUDGETS
  // ============================================
  
  export const PERFORMANCE = {
    maxInitialLoadKB: 150,
    targetLCP: 2500,        // Largest Contentful Paint (ms)
    targetFID: 100,         // First Input Delay (ms)
    targetCLS: 0.1,         // Cumulative Layout Shift
    targetFPS: 60,
  };
  
  // ============================================
  // SEO METADATA
  // ============================================
  
  export const SEO = {
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan. From unclear to unstoppable.",
    url: "https://ascentledger.com",
    ogImage: "/og-image.jpg",
    twitterHandle: "@ascentledger",
  };