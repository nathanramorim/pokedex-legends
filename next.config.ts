import type { NextConfig } from 'next';

const noCache = 'no-cache, no-store, must-revalidate';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // O service worker e o manifesto nunca podem ficar presos em cache longo.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: noCache },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      { source: '/manifest.webmanifest', headers: [{ key: 'Cache-Control', value: noCache }] },
    ];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'raw.githubusercontent.com' }],
  },
};

export default nextConfig;
