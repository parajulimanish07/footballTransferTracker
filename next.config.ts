import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.bbc.com' },
      { protocol: 'https', hostname: 'www.theguardian.com' },
      { protocol: 'https', hostname: 'assets.bundesliga.com' },
    ],
  },
};

export default nextConfig;