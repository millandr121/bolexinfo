#!/usr/bin/env bash
# frac.sh <doc> <page> <x0> <y0> <x1> <y1> <out>
# Crop by fraction of the page, from a 600dpi render.
set -euo pipefail
S=/tmp/claude-0/-home-user-bolexinfo/d3bd2653-7cbb-5932-9e89-90bf6d012074/scratchpad
doc=$1; page=$2; x0=$3; y0=$4; x1=$5; y1=$6; out=$7
src="$S/raw/${doc}-${page}.png"
if [ ! -f "$src" ]; then
  mkdir -p "$S/raw"
  pdftoppm -r 600 -png -f "$page" -l "$page" "$S/docs/${doc}.pdf" "$S/raw/t"
  mv "$S/raw/t"-*.png "$src"
fi
read W H < <(identify -format "%w %h\n" "$src")
spec=$(awk -v W=$W -v H=$H -v a=$x0 -v b=$y0 -v c=$x1 -v d=$y1 \
  'BEGIN{printf "%dx%d+%d+%d", (c-a)*W, (d-b)*H, a*W, b*H}')
mkdir -p "$(dirname "$out")"
convert "$src" -crop "$spec" +repage -resize '1600x1600>' -quality 86 "$out"
identify -format "%f %wx%h\n" "$out"
