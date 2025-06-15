import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Completely disables ESLint during builds
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure Clerk is bundled properly
      config.resolve.alias = {
        ...config.resolve.alias,
        "@clerk/clerk-js": require.resolve("@clerk/clerk-js"),
      };
    }
    return config;
  },
};

export default nextConfig;
