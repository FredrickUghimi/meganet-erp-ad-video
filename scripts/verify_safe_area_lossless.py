#!/usr/bin/env python3
"""Safe-area check on LOSSLESS frames (PNG sequences rendered with `remotion render --sequence --image-format=png`).
Same idea as verify_safe_area.py but without video-codec noise: any pixel that differs from the gradient-only render
by more than THRESH (default 6/255, i.e. any real content, however pale) outside x 80-920, y 200-1440 is a violation.
usage: verify_safe_area_lossless.py FULL_DIR BG_DIR [--thresh N]"""
import glob, os, sys
import numpy as np
from PIL import Image

X0, X1, Y0, Y1 = 80, 920, 200, 1440
thresh = int(sys.argv[sys.argv.index('--thresh') + 1]) if '--thresh' in sys.argv else 6
fa = sorted(glob.glob(os.path.join(sys.argv[1], 'element-*.png')))
fb = sorted(glob.glob(os.path.join(sys.argv[2], 'element-*.png')))
assert len(fa) == len(fb) and fa, 'frame counts differ'
bad, bbox, worst = [], [1080, 1920, 0, 0], 0
for i, (a, b) in enumerate(zip(fa, fb)):
    A = np.asarray(Image.open(a).convert('RGB')).astype(np.int16)
    B = np.asarray(Image.open(b).convert('RGB')).astype(np.int16)
    m = np.abs(A - B).max(axis=2) > thresh
    ys, xs = np.nonzero(m)
    if len(xs):
        bbox = [min(bbox[0], xs.min()), min(bbox[1], ys.min()), max(bbox[2], xs.max()), max(bbox[3], ys.max())]
        out = int(((xs < X0) | (xs >= X1) | (ys < Y0) | (ys >= Y1)).sum())
        if out:
            bad.append((i, out, int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())))
            worst = max(worst, out)
print(f'frames decoded (lossless PNG): {len(fa)}; threshold {thresh}/255')
print(f'content bbox over all frames: x {bbox[0]}-{bbox[2]}, y {bbox[1]}-{bbox[3]} (safe x {X0}-{X1 - 1}, y {Y0}-{Y1 - 1})')
print(f'violating frames: {len(bad)}; worst pixel count {worst}')
for r in bad[:20]:
    print('  frame %d: %d px outside; x %d-%d y %d-%d' % r)
print('RESULT:', 'PASS' if not bad else 'FAIL')
sys.exit(1 if bad else 0)
