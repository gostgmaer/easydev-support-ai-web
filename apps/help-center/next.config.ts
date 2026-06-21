import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easydev/types',
    '@easydev/utils',
    '@easydev/design-system',
    '@easydev/api-client',
    '@easydev/feature-flags',
    '@easydev/stores',
    '@easydev/analytics',
    '@easydev/ui',
    '@easydev/auth',
    '@easydev/permissions',
    '@easydev/observability',
  ],
};

export default nextConfig;
