#!/usr/bin/env python3
"""Caption checks for MegaNetAssistantAd.
usage: verify_captions_assistant.py CAPS.mp4 BG.mp4 [FULL.mp4]
(CAPS = render with --props='{"mode":"caps"}', BG = --props='{"mode":"bg"}')
1) text: the burned-in caption of each line is LINES[i].text (src/assistantTimings.ts); compare, word for word and in
   order, with the approved narration (ASSISTANT_AD_SCRIPT.md table) and with the TTS word boundaries.
2) geometry: decodes every frame of the captions-only render vs the gradient-only render; the caption pill must stay inside
   x 90-910, end at y <= 1280 (v3 limit) and be at most 2 lines tall.
3) audio: the longest pauses between spoken words."""
import json, re, subprocess, sys
import numpy as np

W, H = 1080, 1920
NARRATION = ["Just ask your business.", "Who owes you the most?", "Which products are running low?",
             "What did you spend this month?", "How is your profit this month?",
             "Answers from your own data, only for those allowed to see them.", "Book a free demo with Mega-Net."]

t = open('src/assistantTimings.ts').read()
LINES = json.loads(t[t.index('= [') + 2:t.rindex(';')])
norm = lambda w: re.sub(r'[^\w-]', '', w).lower()
ok = True
cap_words = []
for i, ln in enumerate(LINES):
    toks = ln['text'].split(' ')
    cap_words += toks
    if len(toks) != len(ln['words']) or any(norm(a) != norm(b['text']) for a, b in zip(toks, ln['words'])):
        ok = False; print('TTS boundary mismatch in line', i)
expect = ' '.join(NARRATION).split(' ')
print('caption words:', len(cap_words), '| narration words:', len(expect))
match = cap_words == expect
ok &= match
print('TEXT MATCH (word for word, in order):', 'PASS' if match else 'FAIL')
for ln in LINES:
    print('  caption:', ln['text'])
flat = [w for ln in LINES for w in ln['words']]
gaps = sorted(((y['start'] - x['end'], x['text'], y['text']) for x, y in zip(flat, flat[1:])), reverse=True)[:4]
print('voice ends %.2fs; longest silences between words:' % LINES[-1]['end'], [(round(g, 2), a, b) for g, a, b in gaps])


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
print(f'frames {n}, with caption {shown}; caption bbox x {xmin_all}-{xmax_all}, y {top}-{bottom} (bottom limit 1280); '
      f'tallest pill {height}px (1 line ~80, 2 lines ~135, 3 lines ~188)')
geo = bottom <= 1280 and height <= 150 and xmin_all >= 90 and xmax_all <= 910
ok &= geo
print('GEOMETRY:', 'PASS' if geo else 'FAIL')
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
