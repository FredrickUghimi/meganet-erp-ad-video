#!/usr/bin/env bash
# Renders each scene to a temporary file and renames it only when the renderer exits 0.
# All scenes use identical encoder settings so the concat demuxer can join them with -c copy.
# usage: scripts/pm_render.sh <out-dir> [scene numbers...]
set -u
OUT="$1"; shift
mkdir -p "$OUT"
SCENES=("$@"); [ ${#SCENES[@]} -eq 0 ] && SCENES=(1 2 3 4 5 6 7)
for n in "${SCENES[@]}"; do
  tmp="$OUT/scene$n.tmp.mp4"
  rm -f "$tmp"
  if npx remotion render "PMScene$n" "$tmp" --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --muted --jpeg-quality=95 --browser-executable=/opt/pw-browsers/chromium; then
    mv "$tmp" "$OUT/scene$n.mp4" && echo "scene $n OK"
  else
    echo "scene $n FAILED (kept no output)"; rm -f "$tmp"; exit 1
  fi
done
