#!/usr/bin/env python3
"""Safe-area check on decoded frames.

usage: verify_safe_area.py FULL.mp4 BG.mp4 [--first N] [--expect-fail]

FULL is the real render, BG is the same composition rendered with {"debug":"bg"} (gradients only, no content).
Every frame of both is decoded; a pixel counts as content when any channel differs by more than THRESH.
Safe area: x 80-920, y 200-1440. Prints the content bounding box over all frames and every violating frame.
--first N: frame index in BG that FULL's first frame corresponds to (for short negative-control renders).
--expect-fail: negative control; exit 0 only if violations ARE found.
"""
import subprocess
import sys

import numpy as np

W, H = 1080, 1920
X0, X1, Y0, Y1 = 80, 920, 200, 1440
THRESH = 60
MIN_PIXELS = 6  # ignore isolated codec specks


def frames(path):
    p = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        stdout=subprocess.PIPE,
    )
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
    p.wait()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    expect_fail = '--expect-fail' in sys.argv
    first = 0
    if '--first' in sys.argv:
        first = int(sys.argv[sys.argv.index('--first') + 1])
        args.remove(str(first))
    full_path, bg_path = args[:2]
    bg_iter = frames(bg_path)
    for _ in range(first):
        next(bg_iter)
    bad = []
    n = 0
    bx0, by0, bx1, by1 = W, H, 0, 0
    worst_out = 0
    for i, (fr, bg) in enumerate(zip(frames(full_path), bg_iter)):
        n += 1
        mask = np.abs(fr.astype(np.int16) - bg.astype(np.int16)).max(axis=2) > THRESH
        ys, xs = np.nonzero(mask)
        if len(xs) == 0:
            continue
        bx0, by0, bx1, by1 = min(bx0, xs.min()), min(by0, ys.min()), max(bx1, xs.max()), max(by1, ys.max())
        out = int(((xs < X0) | (xs >= X1) | (ys < Y0) | (ys >= Y1)).sum())
        worst_out = max(worst_out, out)
        if out >= MIN_PIXELS:
            bad.append((i + first, out, int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())))
    print(f'frames decoded: {n}')
    print(f'content bbox over all frames: x {bx0}-{bx1}, y {by0}-{by1} (safe x {X0}-{X1}, y {Y0}-{Y1})')
    print(f'violating frames: {len(bad)}')
    for b in bad[:20]:
        print('  frame %d: %d px outside; x %d-%d y %d-%d' % b)
    ok = (len(bad) == 0) if not expect_fail else (len(bad) == n and n > 0)
    print('RESULT:', 'PASS' if ok else 'FAIL', '(negative control)' if expect_fail else '')
    sys.exit(0 if ok else 1)


main()
