#!/usr/bin/env bash
# Starts all 4 frontend apps' dev servers in the background. Safe to re-run -
# already-running apps are left alone. Logs go to logs/<app>.log, PIDs to
# .pids/<app>.pid so frontend-down.sh can find and stop them later.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p logs .pids

start() {
  local name="$1" filter="$2" port="$3"
  if [ -f ".pids/$name.pid" ] && kill -0 "$(cat ".pids/$name.pid")" 2>/dev/null; then
    echo "$name already running on http://localhost:$port"
    return
  fi
  pnpm --filter "$filter" dev > "logs/$name.log" 2>&1 &
  echo $! > ".pids/$name.pid"
  echo "$name starting on http://localhost:$port (log: logs/$name.log)"
}

start admin-portal "@easydev/admin-portal" 3011
start agent-workspace "agent-workspace" 3012
start customer-widget "@easydev/customer-widget" 3013
start help-center "@easydev/help-center" 3014

echo
echo "All 4 frontends starting up (Next.js dev servers take a few seconds on first compile)."
echo "Tear down with: pnpm run frontend:down"
