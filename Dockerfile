# Builds any one of the 4 Next.js apps in this monorepo, selected via
# --build-arg APP_DIR=<admin-portal|agent-workspace|customer-widget|help-center>.
# Used by docker-compose.yml, one service per app with its own APP_DIR/APP_PORT.

# --- BUILD STAGE ---
FROM node:22-alpine AS builder
ARG APP_DIR
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not
# read at container runtime - changing one means rebuilding the image with a
# new --build-arg, setting it in `environment:` alone won't do anything.
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_WIDGET_EMBED_URL
ARG NEXT_PUBLIC_WIDGET_TENANT_ID
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}
ENV NEXT_PUBLIC_WIDGET_EMBED_URL=${NEXT_PUBLIC_WIDGET_EMBED_URL}
ENV NEXT_PUBLIC_WIDGET_TENANT_ID=${NEXT_PUBLIC_WIDGET_TENANT_ID}
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
# This monorepo's install pulls far more (and larger - Next.js, esbuild/swc
# native binaries) packages than a typical API image, which made the
# default fetch-retry budget too easily exhausted on a flaky connection.
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-factor 2 && \
    pnpm config set fetch-timeout 120000 && \
    pnpm config set network-concurrency 4

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/${APP_DIR} ./apps/${APP_DIR}

RUN pnpm install --frozen-lockfile

# Dependency-ordered one-shot build (same packages excluded as build:packages
# has no build step for them - charts/forms/icons/layouts) before the app
# itself, which needs their dist/ output to exist.
RUN pnpm --filter "./packages/**" --filter "!./packages/charts" \
    --filter "!./packages/forms" --filter "!./packages/icons" \
    --filter "!./packages/layouts" run build
RUN pnpm --filter "./apps/${APP_DIR}" build

# --- RUN STAGE ---
FROM node:22-alpine AS runner
ARG APP_DIR
ARG APP_PORT=3000
ENV APP_DIR=${APP_DIR}
ENV NODE_ENV=production
ENV PORT=${APP_PORT}
WORKDIR /usr/src/app

# Next.js standalone output already mirrors the monorepo root (including the
# pruned, hoisted node_modules it actually needs) - static assets and public/
# are deliberately excluded from standalone and must be copied in separately.
COPY --from=builder /usr/src/app/apps/${APP_DIR}/.next/standalone ./
COPY --from=builder /usr/src/app/apps/${APP_DIR}/.next/static ./apps/${APP_DIR}/.next/static
COPY --from=builder /usr/src/app/apps/${APP_DIR}/public ./apps/${APP_DIR}/public
COPY scripts/health-check.js ./health-check.js

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs && chown -R nextjs:nodejs /usr/src/app
USER nextjs

EXPOSE ${APP_PORT}
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "health-check.js"]

CMD node apps/${APP_DIR}/server.js
