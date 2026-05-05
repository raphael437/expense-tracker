import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'cdn-icons-png.flaticon.com',
        protocol: 'https',
      },
      {
        hostname: 'img.clerk.com',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
