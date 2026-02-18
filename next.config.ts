import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',      // This is required for mobile apps
  images: {
    unoptimized: true,   // Essential for static exports
  },
};

export default nextConfig;