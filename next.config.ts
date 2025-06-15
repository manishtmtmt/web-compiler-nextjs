import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Completely disables ESLint during builds
  },
  env: {
    NEXT_PUBLIC_CLERK_JS_VARIANT: "static", // Ensures stable version of ClerkJS
  },
  experimental: {
    serverComponentsExternalPackages: ["@clerk/nextjs", "@clerk/clerk-js"],
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
  // Add headers for better CDN handling
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
