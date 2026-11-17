#!/usr/bin/env bash
# Renders one Staff Directory tutorial and runs every check on every frame, with negative controls.
# usage: scripts/tutorials/verify_tutorial.sh <invite|change|deactivate> <work-dir>
# Writes out/meganet-tutorial-<key>.mp4 and out/tutorials-verification/<key>/*.txt|csv. The lossless PNG sequences (about 10 GB)
# live in <work-dir> and are deleted at the end. Needs: node deps (npm ci), python3 with numpy + Pillow, ffmpeg, Chromium at
# /opt/pw-browsers/chromium.
set -u
KEY=$1; W=$2; ID=$(python3 -c "print({'invite':'MegaNetTutorialInvite','change':'MegaNetTutorialChange','deactivate':'MegaNetTutorialDeactivate'}['$KEY'])")
BR=/opt/pw-browsers/chromium; V=out/tutorials-verification/$KEY; mkdir -p "$V" "$W" out
MP4=out/meganet-tutorial-$KEY.mp4; NF=100; RC=0
R() { npx remotion "$@" --browser-executable=$BR; }
echo "== $KEY: final mp4"; R render $ID $MP4 --crf=14 --concurrency=4 > "$V/render-mp4.log" 2>&1 || RC=1
echo "== $KEY: text-box audit (every frame)"; node scripts/tutorials/tutorial_textbox_audit.mjs $KEY "$W/tb" > "$V/textbox-audit.log" 2>&1 || RC=1
for m in full bg nocaps; do
  d=$m; [ $m = full ] && d=""
  echo "== $KEY: sequence $m"; R render $ID "$W/$m" --sequence --image-format=png --props="{\"debug\":\"$d\"}" --concurrency=4 > "$V/render-$m.log" 2>&1 || RC=1
done
echo "== $KEY: negative-control stills"; mkdir -p "$W/neg"
for n in violate-left violate-right violate-top violate-bottom violateweak-left; do R still $ID "$W/neg/$n.png" --frame=$NF --image-format=png --props="{\"debug\":\"$n\"}" > /dev/null 2>&1 || RC=1; done
for n in nocaps-violate-caption nocaps-violateweak-caption; do R render $ID "$W/$n" --sequence --image-format=png --frames=0-5 --props="{\"debug\":\"$n\"}" --concurrency=4 > /dev/null 2>&1 || RC=1; done
STARTS=$(python3 - <<PY
import json, math
t=open('src/tutorialTimings.ts').read(); T=json.loads(t[t.index('= {',t.index('TIMINGS:'))+2:t.rindex(';')])['$KEY']
f=open('src/tutorialFrames.ts').read(); F=json.loads(f[f.index('= {',f.index('FRAMES:'))+2:f.rindex(';')])['$KEY']
S=T['SENTENCES']; st=[]
for i,fr in enumerate(F):
    first=next(j for j,s in enumerate(S) if s['scene']==fr['scene']); st.append(0 if i==0 else 12+math.floor(S[first+fr['at']]['start']*30+0.5)-9)
print(','.join(map(str,st)))
PY
)
echo "== $KEY: checks"
python3 scripts/verify_safe_area_pharmacy.py "$W/full" "$W/bg" "$V/safe-area-frames.csv" "$W/neg" $NF > "$V/safe-area.txt" 2>&1 || { echo "safe-area FAILED"; RC=1; }
mkdir -p "$W/bg6"; ls "$W/bg"/element-*.png | head -6 | while read f; do ln -sf "$f" "$W/bg6/$(basename "$f")"; done
{ python3 scripts/verify_caption_overlap.py "$W/nocaps" "$W/bg" --scene-starts "$STARTS"; E1=$?
  echo "--- negative control (synthetic boxes: one inside the zone must be caught, one just clear of the band must not)"; python3 scripts/verify_caption_overlap.py --negative-control "$W/nocaps" "$W/bg"; E2=$?
  for n in nocaps-violate-caption nocaps-violateweak-caption; do echo "--- rendered control $n (--expect-fail: PASS means all 6 frames flagged)"; python3 scripts/verify_caption_overlap.py "$W/$n" "$W/bg6" --expect-fail; E3=$?; [ $E3 -ne 0 ] && E2=1; done
  echo "exit statuses: main=$E1 negative-controls=$E2"; [ $E1 -ne 0 -o $E2 -ne 0 ] && echo "CAPTION-ZONE RESULT: FAIL" || echo "CAPTION-ZONE RESULT: PASS"; } > "$V/caption-zone.txt" 2>&1
grep -q "CAPTION-ZONE RESULT: FAIL" "$V/caption-zone.txt" && RC=1
python3 scripts/tutorials/verify_captions_tutorial.py $KEY "$W/full" "$W/nocaps" $MP4 "$V/caption-timing.csv" "$W/tb/textboxes.json" > "$V/captions.txt" 2>&1 || { echo "captions FAILED"; RC=1; }
python3 scripts/verify_textboxes_pharmacy.py "$W/tb/textboxes.json" "$V/textbox-frames.csv" > "$V/textboxes.txt" 2>&1 || { echo "textboxes FAILED"; RC=1; }
echo "--- negative control: a text node outside the safe area MUST be flagged" >> "$V/textboxes.txt"
node scripts/tutorials/tutorial_textbox_audit.mjs $KEY "$W/tb-neg" 300 305 violate-text > /dev/null 2>&1
if python3 scripts/verify_textboxes_pharmacy.py "$W/tb-neg/textboxes.json" "$W/tb-neg/neg.csv" >> "$V/textboxes.txt" 2>&1; then echo "NEGATIVE CONTROL: FAIL (not flagged)" >> "$V/textboxes.txt"; RC=1; else echo "NEGATIVE CONTROL: PASS (flagged, exit status non-zero as required)" >> "$V/textboxes.txt"; fi
node scripts/tutorials/tutorial_audit.mjs $KEY "$W/audit" > "$V/contrast-audit.log" 2>&1 || RC=1
python3 scripts/pharmacy_contrast.py "$W/audit" > "$V/contrast.txt" 2>&1 || { echo "contrast FAILED"; RC=1; }
FRM=$(ls "$W/audit"/audit-*.json | head -3 | tail -1 | sed -E 's/.*audit-([0-9]+)\.json/\1/')
for n in lowcontrast-text smalltext; do
  node scripts/tutorials/tutorial_audit.mjs $KEY "$W/audit-neg-$n" $n $FRM > /dev/null 2>&1
  echo "--- negative control $n (MUST fail)" >> "$V/contrast.txt"
  if python3 scripts/pharmacy_contrast.py "$W/audit-neg-$n" >> "$V/contrast.txt" 2>&1; then echo "NEGATIVE CONTROL $n: FAIL (not flagged)" >> "$V/contrast.txt"; RC=1; else echo "NEGATIVE CONTROL $n: PASS (flagged)" >> "$V/contrast.txt"; fi
done
cp out/tutorials-verification/assets-preflight.txt "$V/" 2>/dev/null
rm -rf "$W/full" "$W/bg" "$W/nocaps" "$W/nocaps-violate-caption" "$W/nocaps-violateweak-caption" "$W/bg6"
echo "== $KEY done, exit status $RC"; echo "$RC" > "$V/exit-status.txt"; exit $RC
