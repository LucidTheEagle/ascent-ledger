import type { NextConfig } from 'next';

// ============================================
// ASCENT LEDGER - NEXT.JS CONFIGURATION
// ============================================
// Sprint 5 - Checkpoint 3: Source Map Fix
// Oracle's Principle: "Next.js is already heavily optimized.
// We only add what is strictly necessary."
// ============================================

const nextConfig: NextConfig = {
  // Performance optimizations (minimal interference)
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
    ],
  },

  // Image optimization (Next.js handles this well by default)
  images: {
    formats: ['image/webp', 'image/avif'],
    // Standard responsive breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Remove console logs in production (optional, but clean)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error/warn logs
    } : false,
  },

  // ============================================
  // SOURCE MAP CONFIGURATION (TURBOPACK)
  // ============================================
  // Fix: Disable source maps to prevent "Invalid source map" warnings
  productionBrowserSourceMaps: false,

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to suppress Turbopack/webpack warning
    // This tells Next.js we're intentionally using Turbopack
  },
};

export default nextConfig;