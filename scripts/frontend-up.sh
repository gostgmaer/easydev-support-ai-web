#!/usr/bin/env bash
# Starts all 4 frontend apps' dev servers in the background. Pass
# --with-packages (used by `npm run frontend:up:package`) to also build the
# shared packages once and keep them rebuilding on change via tsup --watch.
# Safe to re-run - already-running processes are left alone. Logs go to
# logs/<name>.log, PIDs to .pids/<name>.pid so frontend-down.sh can find and
# stop them later.
set -euo pipefail
cd "$(dirname "$0")/.."

with_packages=false
if [ "${1:-}" = "--with-packages" ]; then
  with_packages=true
fi

mkdir -p logs .pids

start() {
  local name="$1"
  local cwd="$2"
  shift 2
  if [ -f ".pids/$name.pid" ] && kill -0 "$(cat ".pids/$name.pid")" 2>/dev/null; then
    echo "$name already running"
    return
  fi
  : > "logs/$name.log"
  # Plain `"$@" & ` background jobs die when this bash process (and the
  # npm/PowerShell chain above it) exits on Windows - see spawn-detached.js
  # for why. Node's own detached+unref spawn survives that.
  node scripts/spawn-detached.js "$name" "$cwd" "$@"
  echo "$name starting (log: logs/$name.log)"
}

# Path to an app's own next bin, *relative to that app's own directory*
# (which is what `start`'s cwd will be) - so it can be run directly via
# `node`, skipping pnpm/cmd.exe entirely. cmd.exe was observed not
# surviving detachment on Windows, and even when it appeared to, pnpm
# exited early while next dev kept running as an orphan under an
# untracked PID, which broke frontend-down.sh's ability to stop it later.
NEXT_BIN="node_modules/next/dist/bin/next"

if [ "$with_packages" = true ]; then
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
  start packages-watch . pnpm --filter "./packages/**" \
    --filter "!./packages/charts" \
    --filter "!./packages/forms" \
    --filter "!./packages/icons" \
    --filter "!./packages/layouts" \
    --parallel run dev
else
  echo "Skipping shared-packages build (run 'npm run frontend:up:package' to include it)."
fi

start admin-portal apps/admin-portal node "$NEXT_BIN" dev -p 3011
start agent-workspace apps/agent-workspace node "$NEXT_BIN" dev -p 3012
start customer-widget apps/customer-widget node "$NEXT_BIN" dev -p 3013
start help-center apps/help-center node "$NEXT_BIN" dev -p 3014

echo
if [ "$with_packages" = true ]; then
  echo "Packages watch + all 4 frontends starting up:"
else
  echo "All 4 frontends starting up:"
fi
echo "  admin-portal:     http://localhost:3011"
echo "  agent-workspace:  http://localhost:3012"
echo "  customer-widget:  http://localhost:3013"
echo "  help-center:      http://localhost:3014"
echo "(Next.js dev servers take a few seconds on first compile.)"
echo "Tear down with: pnpm run frontend:down"
