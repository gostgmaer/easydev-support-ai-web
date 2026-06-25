#!/usr/bin/env bash
# Starts the shared-packages watch build plus all 4 frontend apps' dev
# servers in the background. Safe to re-run - already-running processes are
# left alone. Logs go to logs/<name>.log, PIDs to .pids/<name>.pid so
# frontend-down.sh can find and stop them later.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p logs .pids

start() {
  local name="$1"
  shift
  if [ -f ".pids/$name.pid" ] && kill -0 "$(cat ".pids/$name.pid")" 2>/dev/null; then
    echo "$name already running"
    return
  fi
  "$@" > "logs/$name.log" 2>&1 &
  echo $! > ".pids/$name.pid"
  echo "$name starting (log: logs/$name.log)"
}

# One-shot build first, in dependency order (plain pnpm recursive, no
# --parallel) - packages/auth imports packages/design-system's types, so
# design-system's dist/ must exist before auth's tsup (incl. its --watch
# below) ever runs, or auth's first build fails with a missing-declaration
# error. --parallel below is then safe since every dist/ already exists.
echo "Building shared packages once (dependency order)..."
pnpm run build:packages

# tsup --watch per package: any edit under packages/* rebuilds its dist/
# output immediately, which Next.js's dev server (via transpilePackages)
# then hot-reloads - this is what makes shared-package changes show up live
# without a manual rebuild. charts/forms/icons/layouts have no build step
# (same exclusion as build:packages) so they're left out here too.
start packages-watch pnpm --filter "./packages/**" \
  --filter "!./packages/charts" \
  --filter "!./packages/forms" \
  --filter "!./packages/icons" \
  --filter "!./packages/layouts" \
  --parallel run dev

start admin-portal pnpm --filter "@easydev/admin-portal" dev
start agent-workspace pnpm --filter "agent-workspace" dev
start customer-widget pnpm --filter "@easydev/customer-widget" dev
start help-center pnpm --filter "@easydev/help-center" dev

echo
echo "Packages watch + all 4 frontends starting up:"
echo "  admin-portal:     http://localhost:3011"
echo "  agent-workspace:  http://localhost:3012"
echo "  customer-widget:  http://localhost:3013"
echo "  help-center:      http://localhost:3014"
echo "(Next.js dev servers take a few seconds on first compile.)"
echo "Tear down with: pnpm run frontend:down"
