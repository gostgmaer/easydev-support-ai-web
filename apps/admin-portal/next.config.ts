import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easydev/types',
    '@easydev/utils',
    '@easydev/design-system',
    '@easydev/api-client',
    '@easydev/auth',
    '@easydev/permissions',
    '@easydev/feature-flags',
    '@easydev/stores',
    '@easydev/analytics',
    '@easydev/ui',
    '@easydev/observability',
  ],
};

export default nextConfig;
