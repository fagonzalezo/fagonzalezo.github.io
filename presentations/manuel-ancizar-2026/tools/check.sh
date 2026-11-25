#!/bin/bash
# Prints the ?check report (elements outside their slide, overflowing boxes) and JS errors.
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=$(( 8900 + RANDOM % 90 ))
python3 -m http.server $PORT >/dev/null 2>&1 & SRV=$!
PROFILE=$(mktemp -d -t deckchrome)
trap "kill $SRV 2>/dev/null; rm -rf $PROFILE" EXIT
sleep 0.7
perl -e 'alarm shift; exec @ARGV' 90 "$CHROME" --headless=new --disable-gpu --user-data-dir=$PROFILE --no-first-run --window-size=1920,1080 --virtual-time-budget=30000 \
  --enable-logging=stderr --v=0 --dump-dom "http://localhost:$PORT/index.html?check" 2>/tmp/deck-console.$$ \
  | grep -o '<pre id="check-report"[^>]*>[^<]*' | sed 's/<pre[^>]*>//' | python3 -c 'import sys,json,html; d=json.loads(html.unescape(sys.stdin.read() or "{}")); print("slides:",d.get("slides")); [print(p) for p in d.get("problems",[])]'
grep -i "uncaught\|error" /tmp/deck-console.$$ | grep -v CVDisplayLink | grep -v "gpu\|GPU\|dbus\|Fontconfig\|registration\|SharedImage" | head -20
rm -f /tmp/deck-console.$$
