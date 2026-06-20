import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@easydev/ui",
    "@easydev/hooks",
    "@easydev/icons",
    "@easydev/forms",
    "@easydev/layouts",
    "@easydev/charts",
    "@easydev/realtime"
  ]
};

export default nextConfig;
