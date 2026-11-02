#!/usr/bin/env python3
"""Per-frame safe-area check for MegaNetPharmacyInteractionAd on LOSSLESS PNG frames.
Every frame of the full render is diffed against the gradient-only render ('bg' debug mode, same frame); any pixel
that differs by more than THRESH (default 6/255: any real content, however pale) outside x 80-920, y 200-1440 is a
violation. Captions are part of the full render, so they are inside the same box (their own limit, y <= 1280 and at
most 2 lines, is checked by verify_captions_pharmacy.py).
Negative controls: NEG_DIR holds stills of frame NEG_FRAME rendered with debug=violate-left/right/top/bottom and
violateweak-left (a box 30px outside that edge); each must be flagged, otherwise the check proves nothing.
usage: verify_safe_area_pharmacy.py FULL_DIR BG_DIR OUT_CSV [NEG_DIR NEG_FRAME]"""
import csv, glob, os, sys
import numpy as np
from PIL import Image

X0, X1, Y0, Y1 = 80, 920, 200, 1440
THRESH = 6
FPS = 30


def outside(a, b):
    m = np.abs(a.astype(np.int16) - b.astype(np.int16)).max(axis=2) > THRESH
    ys, xs = np.nonzero(m)
    if not len(xs):
        return 0, None
    out = int(((xs < X0) | (xs >= X1) | (ys < Y0) | (ys >= Y1)).sum())
    return out, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))


full = sorted(glob.glob(os.path.join(sys.argv[1], 'element-*.png')))
bg = sorted(glob.glob(os.path.join(sys.argv[2], 'element-*.png')))
assert full and len(full) == len(bg), 'frame counts differ'
rows = []
for i, (a, b) in enumerate(zip(full, bg)):
    A = np.asarray(Image.open(a).convert('RGB')); B = np.asarray(Image.open(b).convert('RGB'))
    n, bb = outside(A, B)
    rows.append((i, i / FPS, n, bb))
with open(sys.argv[3], 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['frame', 'time_s', 'px_outside_safe_area', 'content_bbox_x0_y0_x1_y1', 'result'])
    for i, t, n, bb in rows:
        w.writerow([i, f'{t:.3f}', n, 'none' if bb is None else ' '.join(map(str, bb)), 'PASS' if n == 0 else 'FAIL'])

print(f'frames checked: {len(rows)} (lossless PNG, threshold {THRESH}/255); every frame listed in {sys.argv[3]}')
print(f'{"time window":<14} {"frames":<11} {"content bbox x0-x1, y0-y1":<30} {"px outside":>10}  result')
for s in range(0, int(np.ceil(len(rows) / FPS))):
    chunk = [r for r in rows if s <= r[1] < s + 1]
    if not chunk:
        continue
    bbs = [r[3] for r in chunk if r[3]]
    bb = (min(b[0] for b in bbs), max(b[2] for b in bbs), min(b[1] for b in bbs), max(b[3] for b in bbs)) if bbs else None
    bad = sum(r[2] for r in chunk)
    txt = 'none' if bb is None else f'x {bb[0]}-{bb[1]}, y {bb[2]}-{bb[3]}'
    print(f'{s:>2}.00-{s + 1:>2}.00 s  {chunk[0][0]:>3}-{chunk[-1][0]:<7} {txt:<30} {bad:>10}  {"PASS" if bad == 0 else "FAIL"}')
bad_frames = [r for r in rows if r[2]]
allbb = [r[3] for r in rows if r[3]]
print(f'content bbox over all frames: x {min(b[0] for b in allbb)}-{max(b[2] for b in allbb)}, y {min(b[1] for b in allbb)}-{max(b[3] for b in allbb)} (safe x {X0}-{X1 - 1}, y {Y0}-{Y1 - 1})')
print(f'frames failing: {len(bad_frames)} of {len(rows)}')
ok = not bad_frames

if len(sys.argv) > 5:
    nf = int(sys.argv[5]); B = np.asarray(Image.open(bg[nf]).convert('RGB'))
    print(f'negative controls (frame {nf}; each MUST be flagged):')
    for name in ['violate-left', 'violate-right', 'violate-top', 'violate-bottom', 'violateweak-left']:
        p = os.path.join(sys.argv[4], f'{name}.png')
        n, bb = outside(np.asarray(Image.open(p).convert('RGB')), B)
        flagged = n > 0
        ok &= flagged
        print(f'  {name:<18} px outside: {n:>5}  -> {"flagged (check works)" if flagged else "NOT flagged (check is blind)"}')
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
