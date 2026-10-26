#!/usr/bin/env python3
"""Caption checks for the Sentinel ad.
usage: verify_captions.py CAPS.mp4 BG.mp4
1) geometry: decodes every frame of the captions-only render vs the gradient-only render; reports the caption
   pill bbox (bottom must be <= 1360, height <= 2 lines).
2) text: rebuilds the caption text from CHUNKS in src/MegaNetSentinelAd.tsx + WORDS in src/sentinelTimings.ts and
   compares it word for word with the narration."""
import re
import subprocess
import sys

import numpy as np

W, H = 1080, 1920
NARRATION = "Tests done. Drugs dispensed. Billed? Or lost? Meet Financial Sentinel, in Mega-Net EHR Cloud. One click checks clinical records against bills and flags unbilled services, duplicates and rejected claim patterns. Each finding is ranked and explained. Your team decides. Book a free demo. Message us on WhatsApp."


def frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)


words = re.findall(r'"w": "([^"]+)"', open('src/sentinelTimings.ts').read())
src = open('src/MegaNetSentinelAd.tsx').read()
chunks = [(int(a), int(b)) for a, b in re.findall(r'\[(\d+), (\d+)\]', src[src.index('const CHUNKS'):src.index('// ---- timing')])]
flat = [i for a, b in chunks for i in range(a, b + 1)]
assert flat == list(range(len(words))), 'chunks do not cover every word exactly once, in order'
cap_text = ' '.join(words)
print('caption words:', len(words), '| narration words:', len(NARRATION.split()))
print('TEXT MATCH:', 'PASS' if cap_text == NARRATION else 'FAIL')
if cap_text != NARRATION:
    print(cap_text)
for a, b in chunks:
    print('  chunk:', ' '.join(words[a:b + 1]))

bottom, height, shown, n = 0, 0, 0, 0
for fr, bg in zip(frames(sys.argv[1]), frames(sys.argv[2])):
    n += 1
    m = np.abs(fr.astype(np.int16) - bg.astype(np.int16)).max(axis=2) > 40
    ys, xs = np.nonzero(m)
    if len(ys) < 50:
        continue
    shown += 1
    bottom = max(bottom, ys.max())
    height = max(height, ys.max() - ys.min() + 1)
    xmin, xmax = xs.min(), xs.max()
    if xmin < 80 or xmax >= 920:
        print('caption outside x-safe at frame', n - 1, xmin, xmax)
print(f'frames {n}, with caption {shown}; lowest caption pixel y={bottom} (limit 1360); tallest pill {height}px '
      f'(1 line ~110, 2 lines ~176, 3 lines ~242)')
ok = cap_text == NARRATION and bottom <= 1360 and height <= 190
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
