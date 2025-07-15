import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@libsql/client', '@libsql/hrana-client', '@libsql/isomorphic-ws'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@libsql/client', '@libsql/hrana-client', '@libsql/isomorphic-ws');
    }
    return config;
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
