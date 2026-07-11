#!/usr/bin/env bash
#
# ORVIX — Dev server (web + AI in one shot)
#
# Starts both apps in the background and tails the combined logs.
# Ctrl-C to stop both.
#
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

WEB_LOG="$ROOT/.dev-web.log"
AI_LOG="$ROOT/.dev-ai.log"
WEB_PID=""
AI_PID=""

cleanup() {
  echo
  echo "→ Stopping dev servers..."
  [[ -n "$WEB_PID" ]] && kill -TERM "$WEB_PID" 2>/dev/null || true
  [[ -n "$AI_PID" ]] && kill -TERM "$AI_PID" 2>/dev/null || true
  sleep 1
  [[ -n "$WEB_PID" ]] && kill -KILL "$WEB_PID" 2>/dev/null || true
  [[ -n "$AI_PID" ]] && kill -KILL "$AI_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "→ Starting AI service (port 3001)..."
(cd "$ROOT/apps/ai" && pnpm dev > "$AI_LOG" 2>&1) &
AI_PID=$!

echo "→ Starting web app (port 3000)..."
(cd "$ROOT/apps/web" && pnpm dev > "$WEB_LOG" 2>&1) &
WEB_PID=$!

echo
echo "  AI:  http://127.0.0.1:3001  (log: $AI_LOG)"
echo "  Web: http://localhost:3000  (log: $WEB_LOG)"
echo
echo "  Ctrl-C to stop both."
echo

# Tail combined
tail -f "$WEB_LOG" "$AI_LOG"
