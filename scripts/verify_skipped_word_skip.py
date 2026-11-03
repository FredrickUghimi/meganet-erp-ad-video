#!/usr/bin/env python3
"""MegaNetNursesBaySkipAd: the "Skipped" state must be carried by the WORD, not by colour alone.
Rule, on every frame: if the scene content (x 80-920, y 200-1096) contains the Skipped red (#B42328, +-14 per channel) in
at least MIN_RED pixels, the frame's text boxes (textboxes.json from scripts/skip_textbox_audit.mjs) must contain a text
node reading exactly "Skipped" at effective opacity >= 0.99. So red never appears without the word next to it. The reverse
(the word without red) is allowed: the word alone is enough.
Also reports, per frame, whether the word is present, and the first/last frame of each run where it is.
Negative controls (must be flagged): (1) frame 100 with a synthetic red square painted in and no word, (2) a frame that
really has the chip, with its "Skipped" text node deleted from the data.
usage: verify_skipped_word_skip.py FULL_PNG_DIR textboxes.json OUT_CSV"""
import csv, glob, json, os, sys
import numpy as np
from PIL import Image

RED = np.array([0xB4, 0x23, 0x28]); TOL, MIN_RED = 14, 150
X0, X1, Y0, Y1 = 80, 920, 200, 1096
frames = sorted(glob.glob(os.path.join(sys.argv[1], 'element-*.png')))
tb = {int(k): v for k, v in json.load(open(sys.argv[2])).items()}


def red_px(img):
    reg = img[Y0:Y1, X0:X1].astype(int)
    return int((np.abs(reg - RED).max(axis=2) <= TOL).sum())


def has_word(nodes):
    return any(n['text'] == 'Skipped' and n['opacity'] >= 0.99 for n in nodes)


rows, bad = [], []
for i, p in enumerate(frames):
    r = red_px(np.asarray(Image.open(p).convert('RGB')))
    w = has_word(tb[i])
    ok = (r < MIN_RED) or w
    rows.append((i, r, w, ok))
    if not ok:
        bad.append(i)
with open(sys.argv[3], 'w', newline='') as fh:
    c = csv.writer(fh); c.writerow(['frame', 'time_s', 'red_pixels', 'word_Skipped_present', 'result'])
    for i, r, w, ok in rows:
        c.writerow([i, f'{i / 30:.3f}', r, int(w), 'PASS' if ok else 'FAIL'])
print(f'frames checked: {len(rows)} (lossless PNG); every frame listed in {sys.argv[3]}')
with_red = [r for r in rows if r[1] >= MIN_RED]
print(f'frames with the Skipped red (>= {MIN_RED} px): {len(with_red)}; of those with the word "Skipped" present: {sum(1 for r in with_red if r[2])}')
print(f'frames with the word present: {sum(1 for r in rows if r[2])}')
runs, cur = [], None
for i, r, w, ok in rows:
    if w and cur is None: cur = i
    if not w and cur is not None: runs.append((cur, i - 1)); cur = None
if cur is not None: runs.append((cur, len(rows) - 1))
print('runs where the word is on screen (frames):', ', '.join(f'{a}-{b}' for a, b in runs))
print(f'frames with red but NO word: {len(bad)}', ('-> ' + ','.join(map(str, bad[:30]))) if bad else '')
ok = not bad
# negative controls
img = np.asarray(Image.open(frames[100]).convert('RGB')).copy()
img[700:740, 300:340] = RED
c1 = red_px(img) >= MIN_RED and not has_word(tb[100])
ex = next(i for i, r, w, _ in rows if w and r >= MIN_RED)
c2 = red_px(np.asarray(Image.open(frames[ex]).convert('RGB'))) >= MIN_RED and not has_word([n for n in tb[ex] if n['text'] != 'Skipped'])
print(f'negative control 1 (red square painted on frame 100, no word): {"flagged (check works)" if c1 else "NOT flagged (check is blind)"}')
print(f'negative control 2 (frame {ex}: real chip, "Skipped" text node deleted): {"flagged (check works)" if c2 else "NOT flagged (check is blind)"}')
ok &= c1 and c2
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
