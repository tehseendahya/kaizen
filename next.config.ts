import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Increase body size limit for file uploads (default is 4.5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  // Server-side external dependencies (not bundled)
  serverExternalPackages: ['pdf-parse', 'canvas', 'jsdom'],
};

export default nextConfig;
