import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Completely disables ESLint during builds
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        "@clerk/clerk-js": "Clerk",
      });
    }
    return config;
  },
};

export default nextConfig;
