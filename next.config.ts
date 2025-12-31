import type { NextConfig } from 'next';

// Oracle's Principle: "Next.js 14/15 is already heavily optimized.
// We only add what is strictly necessary."

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

  // Bundle analyzer (uncomment when needed)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         openAnalyzer: false,
  //       })
  //     );
  //   }
  //   return config;
  // },
};

export default nextConfig;