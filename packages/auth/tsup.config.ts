import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'next'],
    banner: {
      js: "'use client';",
    },
  },
  {
    // Next.js Middleware runs on the Edge runtime, not as a React client component -
    // it must ship without the 'use client' banner the main entry uses, and stay
    // import-isolated from the rest of @easydev/auth's React tree.
    entry: ['src/middleware.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['next'],
  },
]);
