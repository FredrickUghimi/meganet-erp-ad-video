#!/usr/bin/env python3
"""Every text box on every frame must sit inside the safe area: x 80-920, y 200-1095 for scene text (v3: 24px above the caption zone), caption text bottom <= 1280.
Input: textboxes.json from scripts/skip_textbox_audit.mjs (box of every text node incl. transforms, every frame,
no settled-frame or opacity filter; clipped or invisible text still counts). A box counts as outside if any edge is
more than EPS pixels past the limit (EPS covers sub-pixel rounding only).
usage: verify_textboxes_skip.py textboxes.json OUT_CSV"""
import csv, json, sys
FPS, EPS = 30, 0.5
X0, X1, Y0, Y1, CAPY = 80, 920, 200, 1095, 1280
data = {int(k): v for k, v in json.load(open(sys.argv[1])).items()}
rows, bad_frames = [], []
for f in sorted(data):
    bad = []
    for n in data[f]:
        cap = n['y0'] > 1110
        if n['x0'] < X0 - EPS or n['x1'] > X1 + EPS or n['y0'] < Y0 - EPS or n['y1'] > (CAPY if cap else Y1) + EPS:
            bad.append(n)
    rows.append((f, len(data[f]), bad))
    if bad:
        bad_frames.append((f, bad))
with open(sys.argv[2], 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['frame', 'time_s', 'text_nodes', 'text_boxes_outside', 'result'])
    for f, n, bad in rows:
        w.writerow([f, f'{f / FPS:.3f}', n, len(bad), 'PASS' if not bad else 'FAIL'])
mn = lambda k, fn: fn(n[k] for f in data for n in data[f])
print(f'frames audited: {len(rows)}; text-node boxes measured: {sum(r[1] for r in rows)}; every frame listed in {sys.argv[2]}')
print(f'{"time window":<14} {"frames":<10} {"text nodes":>10} {"boxes outside":>14}  result')
for s in range(0, (len(rows) + FPS - 1) // FPS):
    ch = [r for r in rows if s <= r[0] / FPS < s + 1]
    if not ch:
        continue
    nb = sum(len(r[2]) for r in ch)
    print(f'{s:>2}.00-{s + 1:>2}.00 s  {ch[0][0]:>3}-{ch[-1][0]:<6} {sum(r[1] for r in ch):>10} {nb:>14}  {"PASS" if nb == 0 else "FAIL"}')
print(f'extreme text-box edges over all frames: left {mn("x0", min):.1f} (>= {X0}), right {mn("x1", max):.1f} (<= {X1}), top {mn("y0", min):.1f} (>= {Y0}), bottom {mn("y1", max):.1f} (<= {Y1}; captions <= {CAPY})')
print(f'frames failing: {len(bad_frames)} of {len(rows)}')
for f, bad in bad_frames[:30]:
    print(f'  frame {f} ({f / FPS:.2f}s): ' + '; '.join(f'"{b["text"][:14]}" x {b["x0"]:.0f}-{b["x1"]:.0f} y {b["y0"]:.0f}-{b["y1"]:.0f}' for b in bad[:4]))
print('RESULT:', 'PASS' if not bad_frames else 'FAIL')
sys.exit(1 if bad_frames else 0)
