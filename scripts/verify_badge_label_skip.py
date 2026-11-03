#!/usr/bin/env python3
"""MegaNetNursesBaySkipAd: the badge "Mega-Net EHR Cloud" and the label "Feature: Skip and call back" must be on screen,
fully opaque, >= 32px and inside the safe area (x 80-920, y >= 200) on EVERY frame from 0 until the call-to-action scene
takes over (first frame = FIRST_CTA, passed in), checked two ways:
  (a) text boxes (textboxes.json): a node with that exact text at y < 400, effective opacity >= 0.99, font >= 32px, box
      inside the safe area;
  (b) pixels (lossless PNG): the badge and label rectangles differ from the gradient-only render by more than 24/255 in at
      least MIN_PX pixels, so they are really drawn, not just present in the DOM.
Negative controls: delete both nodes from frame 0's data (must be flagged); compare frame 0 against itself instead of the
gradient render (no difference, must be flagged).
usage: verify_badge_label_skip.py FULL_DIR BG_DIR textboxes.json FIRST_CTA OUT_CSV"""
import csv, glob, json, os, sys
import numpy as np
from PIL import Image

full = sorted(glob.glob(os.path.join(sys.argv[1], 'element-*.png'))); bg = sorted(glob.glob(os.path.join(sys.argv[2], 'element-*.png')))
tb = {int(k): v for k, v in json.load(open(sys.argv[3])).items()}
FIRST_CTA = int(sys.argv[4]); MIN_PX = 500
BADGE, LABEL = 'Mega-Net EHR Cloud', 'Feature: Skip and call back'
REG = {BADGE: (90, 212, 600, 276), LABEL: (90, 288, 700, 352)}


def node_ok(nodes, text):
    for n in nodes:
        if n['text'] == text and n['y0'] < 400:
            return n['opacity'] >= 0.99 and n['size'] >= 32 and n['x0'] >= 80 and n['x1'] <= 920 and n['y0'] >= 200 and n['y1'] <= 1095
    return False


def px(a, b, box):
    x0, y0, x1, y1 = box
    return int((np.abs(a[y0:y1, x0:x1].astype(int) - b[y0:y1, x0:x1].astype(int)).max(axis=2) > 24).sum())


rows, bad = [], []
for i in range(FIRST_CTA):
    A = np.asarray(Image.open(full[i]).convert('RGB')); B = np.asarray(Image.open(bg[i]).convert('RGB'))
    r = [node_ok(tb[i], BADGE), node_ok(tb[i], LABEL), px(A, B, REG[BADGE]), px(A, B, REG[LABEL])]
    good = r[0] and r[1] and r[2] >= MIN_PX and r[3] >= MIN_PX
    rows.append((i, *r, good))
    if not good: bad.append(i)
with open(sys.argv[5], 'w', newline='') as fh:
    c = csv.writer(fh); c.writerow(['frame', 'time_s', 'badge_node_ok', 'label_node_ok', 'badge_px', 'label_px', 'result'])
    for r in rows: c.writerow([r[0], f'{r[0] / 30:.3f}', int(r[1]), int(r[2]), r[3], r[4], 'PASS' if r[5] else 'FAIL'])
print(f'frames checked: {len(rows)} (frame 0 to {FIRST_CTA - 1}); every frame listed in {sys.argv[5]}')
print(f'frame 0: badge node ok {rows[0][1]}, label node ok {rows[0][2]}, badge pixels {rows[0][3]}, label pixels {rows[0][4]} (need >= {MIN_PX})')
print(f'lowest pixel counts over all frames: badge {min(r[3] for r in rows)}, label {min(r[4] for r in rows)}')
print(f'frames failing: {len(bad)} of {len(rows)}', ('-> ' + ','.join(map(str, bad[:30]))) if bad else '')
ok = not bad
n0 = [n for n in tb[0] if n['text'] not in (BADGE, LABEL)]
c1 = not (node_ok(n0, BADGE) and node_ok(n0, LABEL))
A0 = np.asarray(Image.open(full[0]).convert('RGB'))
c2 = px(A0, A0, REG[BADGE]) < MIN_PX
print(f'negative control 1 (badge and label nodes deleted from frame 0 data): {"flagged (check works)" if c1 else "NOT flagged (check is blind)"}')
print(f'negative control 2 (frame 0 compared with itself, no drawn difference): {"flagged (check works)" if c2 else "NOT flagged (check is blind)"}')
ok &= c1 and c2
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
