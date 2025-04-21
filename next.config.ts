import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  //

  env: {
    // Load environment variables dynamically based on the NODE_ENV
    ...require('dotenv').config({
      path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
    }).parsed,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.generated.photos',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn3d.iconscout.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
// next.config.ts
