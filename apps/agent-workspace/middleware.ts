import { createAuthMiddleware } from '@easydev/auth/middleware';

const { middleware, config } = createAuthMiddleware({
  publicPaths: [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/sso/callback',
    '/session-expired',
    '/unauthorized',
    '/forbidden',
  ],
});

export { middleware, config };
