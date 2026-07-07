#!/usr/bin/env bash
# scripts/open-ui.sh — cross-platform, free, no deps
set -euo pipefail
PORT="${PORT:-8765}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/ui"

# Serve via stdlib (free, ships with python3 / busybox / ruby fallback)
if command -v python3 >/dev/null; then
  python3 -m http.server "$PORT" >/dev/null 2>&1 &
elif command -v python >/dev/null; then
  python -m SimpleHTTPServer "$PORT" >/dev/null 2>&1 &
elif command -v ruby >/dev/null; then
  ruby -run -e httpd . -p "$PORT" >/dev/null 2>&1 &
else
  echo "No stdlib HTTP server available." >&2; exit 1
fi
SERVER_PID=$!
sleep 1
URL="http://localhost:${PORT}/"

# Cross-platform open (all free / built-in)
if command -v open >/dev/null; then open "$URL"             # macOS
elif command -v xdg-open >/dev/null; then xdg-open "$URL"   # Linux
elif command -v wslview >/dev/null; then wslview "$URL"     # WSL
elif command -v cmd.exe >/dev/null; then cmd.exe /c start "$URL"  # Windows
else echo "Open $URL manually."; fi

echo "Serving ui/ at $URL  (pid=$SERVER_PID).  Ctrl-C to stop."
wait $SERVER_PID
