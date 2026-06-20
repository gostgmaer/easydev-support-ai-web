import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easydev/types',
    '@easydev/utils',
    '@easydev/design-system',
    '@easydev/api-client',
    '@easydev/stores',
    '@easydev/analytics',
  ],
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [{ key: 'X-Frame-Options', value: 'ALLOWALL' }],
      },
    ];
  },
};

export default nextConfig;
