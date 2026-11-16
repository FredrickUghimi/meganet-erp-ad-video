#!/usr/bin/env bash
# Joins the per-scene MP4s (concat demuxer, -c copy) and muxes the audio mix (AAC). Each step writes a temp file that is
# renamed only when ffmpeg exits 0.
# usage: scripts/pm_mux.sh <render-dir> <mix.wav> <final.mp4>
set -eu
R="$1"; MIX="$2"; FINAL="$3"
list="$R/concat.txt"; : > "$list"
for n in 1 2 3 4 5 6 7; do echo "file '$(realpath "$R/scene$n.mp4")'" >> "$list"; done
ffmpeg -v error -y -f concat -safe 0 -i "$list" -c copy "$R/joined.tmp.mp4" && mv "$R/joined.tmp.mp4" "$R/joined.mp4"
ffmpeg -v error -y -i "$R/joined.mp4" -i "$MIX" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$FINAL.tmp.mp4" && mv "$FINAL.tmp.mp4" "$FINAL"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of default=nw=1 "$FINAL"
