import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Completely disables ESLint during builds
  },
  env: {
    NEXT_PUBLIC_CLERK_JS_VARIANT: "static", // Ensures stable version of ClerkJS
  },
};

export default nextConfig;
