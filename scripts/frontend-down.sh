#!/usr/bin/env bash
# Stops all 4 frontend dev servers started by frontend-up.sh.
cd "$(dirname "$0")/.."

stop() {
  local name="$1"
  local pidfile=".pids/$name.pid"
  if [ ! -f "$pidfile" ]; then
    echo "$name: not running (no pid file)"
    return
  fi
  local pid
  pid=$(cat "$pidfile")
  if kill -0 "$pid" 2>/dev/null; then
    # pnpm spawns "next dev" as a child process - taskkill //T kills the
    # whole tree so the actual Next.js server dies too, not just the pnpm
    # wrapper that started it.
    taskkill //PID "$pid" //T //F >/dev/null 2>&1 || kill "$pid" 2>/dev/null
    echo "$name stopped (pid $pid)"
  else
    echo "$name: pid $pid not running"
  fi
  rm -f "$pidfile"
}

stop admin-portal
stop agent-workspace
stop customer-widget
stop help-center
