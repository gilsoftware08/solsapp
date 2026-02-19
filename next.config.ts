import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',       // Static HTML export for Capacitor (outputs to ./out)
  images: {
    unoptimized: true,    // No Node server; required for static export
  },
};

export default nextConfig;