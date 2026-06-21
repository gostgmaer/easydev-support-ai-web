import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@easydev/ui",
    "@easydev/icons",
    "@easydev/forms",
    "@easydev/layouts",
    "@easydev/charts",
    "@easydev/realtime",
    "@easydev/observability"
  ]
};

export default nextConfig;
