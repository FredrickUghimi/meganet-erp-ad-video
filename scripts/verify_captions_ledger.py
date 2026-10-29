#!/usr/bin/env python3
"""Caption checks for MegaNetLedgerAd.
usage: verify_captions_ledger.py CAPS.mp4 BG.mp4 [FULL.mp4]
1) text: rebuilds the burned-in caption text from CHUNKS in src/MegaNetLedgerAd.tsx and the scene text in
   src/ledgerTimings.ts, compares word for word with the approved narration, and compares each caption token with
   the TTS word-boundary the voice reported for it (punctuation stripped).
2) geometry: decodes every frame of the captions-only render vs the gradient-only render; the caption pill must
   stay inside x 80-920, end at y <= 1360 and be at most 2 lines tall.
3) audio: pause (gap) statistics between the spoken words from the timing file, and the video/audio durations."""
import json, re, subprocess, sys
import numpy as np

W, H = 1080, 1920
NARRATION = ["Where did the money go?",
             "Meet the General Ledger. Pick an account, choose your dates.",
             "Every debit and credit, with its reference and a running balance.",
             "Entries are never edited, only reversed.",
             "Only roles with accounting access can view it.",
             "Book a free demo with Mega-Net."]

t = open('src/ledgerTimings.ts').read()
LINES = json.loads(t[t.index('= [') + 2:t.rindex(';')])
src = open('src/MegaNetLedgerAd.tsx').read()
body = src[src.index('export const CHUNKS'):src.index('];', src.index('export const CHUNKS'))]
chunks = [tuple(map(int, m)) for m in re.findall(r'\[(\d+), (\d+), (\d+)\]', body)]

norm = lambda w: re.sub(r'[^\w-]', '', w).lower()
ok = True
# 1) text
cap_words, expect_words = [], []
for s, a, b in chunks:
    toks = LINES[s]['text'].split(' ')
    for i in range(a, b + 1):
        cap_words.append(toks[i])
        if norm(toks[i]) != norm(LINES[s]['words'][i]['text']):
            ok = False; print('TTS boundary mismatch:', s, i, toks[i], LINES[s]['words'][i]['text'])
for s in range(len(LINES)):
    if sum(b - a + 1 for ss, a, b in chunks if ss == s) != len(LINES[s]['text'].split(' ')):
        ok = False; print('scene', s, 'chunks do not cover all words')
expect = ' '.join(NARRATION).split(' ')
print('caption words:', len(cap_words), '| narration words:', len(expect))
match = cap_words == expect
ok &= match
print('TEXT MATCH (word for word, in order):', 'PASS' if match else 'FAIL')
for s, a, b in chunks:
    print('  chunk:', ' '.join(LINES[s]['text'].split(' ')[a:b + 1]))

# 3) pauses
gaps = []
flat = [w for ln in LINES for w in ln['words']]
for x, y in zip(flat, flat[1:]):
    gaps.append((y['start'] - x['end'], x['text'], y['text']))
big = sorted(gaps, reverse=True)[:4]
print('voice ends %.2fs; longest silences between words:' % LINES[-1]['end'], [(round(g, 2), a, b) for g, a, b in big])
for ln in LINES:
    print('  scene %.2f-%.2fs' % (ln['start'], ln['end']))


# 2) geometry
def frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
    p.wait()


bottom, top, height, shown, n, xmin_all, xmax_all = 0, H, 0, 0, 0, W, 0
for fr, bg in zip(frames(sys.argv[1]), frames(sys.argv[2])):
    n += 1
    m = np.abs(fr.astype(np.int16) - bg.astype(np.int16)).max(axis=2) > 40
    ys, xs = np.nonzero(m)
    if len(ys) < 50:
        continue
    shown += 1
    bottom = max(bottom, ys.max()); top = min(top, ys.min())
    height = max(height, ys.max() - ys.min() + 1)
    xmin_all, xmax_all = min(xmin_all, xs.min()), max(xmax_all, xs.max())
print(f'frames {n}, with caption {shown}; caption bbox x {xmin_all}-{xmax_all}, y {top}-{bottom} (bottom limit 1360); '
      f'tallest pill {height}px (1 line ~86, 2 lines ~146, 3 lines ~204)')
geo = bottom <= 1360 and height <= 160 and xmin_all >= 80 and xmax_all <= 920
ok &= geo
print('GEOMETRY:', 'PASS' if geo else 'FAIL')
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
