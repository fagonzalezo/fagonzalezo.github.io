#!/bin/bash
# Screenshots of slides, final state (all fragments shown).
#   tools/shoot.sh OUTDIR A-01 A-02 ...      (no ids: every slide)
#   STEP=1 tools/shoot.sh OUTDIR 1-03/2       (slide/fragment, interactive state, no ?static)
# Needs Google Chrome. Serves the deck on a free local port.
set -e
cd "$(dirname "$0")/.."
OUT="$1"; shift; mkdir -p "$OUT"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=$(( 8700 + RANDOM % 200 ))
python3 -m http.server $PORT >/dev/null 2>&1 & SRV=$!
PROFILE=$(mktemp -d -t deckchrome)
trap "kill $SRV 2>/dev/null; rm -rf $PROFILE" EXIT
sleep 0.7
IDS=("$@")
if [ ${#IDS[@]} -eq 0 ]; then IDS=($(grep -o '<section[^>]*id="[^"]*"' index.html | sed 's/.*id="\([^"]*\)"/\1/')); fi
Q="?static"; [ -n "$STEP" ] && Q=""
for id in "${IDS[@]}"; do
  f="$OUT/$(echo "$id" | tr '/' '_').png"
  perl -e 'alarm shift; exec @ARGV' 90 "$CHROME" --headless=new --disable-gpu --user-data-dir=$PROFILE --no-first-run --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1920,1080 --virtual-time-budget=${VT:-6000} --screenshot="$f" \
    "http://localhost:$PORT/index.html$Q#/$id" >/dev/null 2>&1 || echo "failed: $id"
  echo "$f"
done
