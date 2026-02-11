import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In development, proxy API requests to backend server
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3010/api/:path*',
        },
      ];
    }
    // In production, API requests will go to the same origin
    return [];
  },
};

export default nextConfig;
