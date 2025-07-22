import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@libsql/client', '@libsql/hrana-client', '@libsql/isomorphic-ws'],
  reactStrictMode: false, // Helps reduce some hydration issues
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@excalidraw/excalidraw', 'platejs', '@platejs/core'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals.push('@libsql/client', '@libsql/hrana-client', '@libsql/isomorphic-ws');
    }

    // Optimize bundle splitting for heavy libraries
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          excalidraw: {
            name: 'excalidraw',
            test: /[\\/]node_modules[\\/]@excalidraw[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          plate: {
            name: 'plate-editor',
            test: /[\\/]node_modules[\\/](@platejs|platejs)[\\/]/,
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          radix: {
            name: 'radix-ui',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'freeimage.host',
      },
      {
        protocol: 'https',
        hostname: 'iili.io',
      },
    ],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
