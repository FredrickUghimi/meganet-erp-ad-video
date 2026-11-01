#!/usr/bin/env python3
"""Caption checks for MegaNetPharmacyInteractionAd.
usage: verify_captions_pharmacy.py CAPS_DIR BG_DIR FINAL.mp4 OUT_CSV
1) TEXT: rebuilds the burned-in caption text from CHUNKS in src/MegaNetPharmacyInteractionAd.tsx and compares it word
   for word with (a) the approved narration and (b) the words the TTS engine reported for the generated audio
   (src/pharmacyTimings.ts, punctuation stripped). NOTE: (b) is the engine's own word-boundary transcript, not an
   independent speech recogniser (no recogniser model could be downloaded in this environment).
2) GEOMETRY: every frame of the captions-only PNG render vs the gradient-only render: the caption pill must stay inside
   x 80-920, end at y <= 1360 and be at most 2 lines tall.
3) TIMING: per sentence, when the caption appears and disappears (frame-accurate, from the pixels) vs the measured sentence
   boundaries, two ways: TTS word boundaries (+0.4s lead-in) and silence detection (-45dB) run on the rendered video's own
   audio. Pass = within 0.1s on both ends against both measurements.
   Pass = within 0.1s on both ends against both measurements."""
import csv, glob, json, os, re, subprocess, sys
import numpy as np
from PIL import Image

FPS, LEAD = 30, 12
NARRATION = ["Warfarin meets aspirin.", "Spot the collision.",
             "Mega-Net EHR Cloud warns the prescriber when two drugs are a defined interaction pair.",
             "For a severe interaction, the prescriber must stop, and type CONFIRM to continue.",
             "Book a free demo with Mega-Net.", "Message us on WhatsApp."]
t = open('src/pharmacyTimings.ts').read()
LINES = json.loads(t[t.index('= [') + 2:t.rindex(';')])
src = open('src/MegaNetPharmacyInteractionAd.tsx').read()
body = src[src.index('export const CHUNKS'):src.index('];', src.index('export const CHUNKS'))]
chunks = [tuple(map(int, m)) for m in re.findall(r'\[(\d+), (\d+), (\d+)\]', body)]
norm = lambda w: re.sub(r'[^\w-]', '', w).lower()
ok = True

# 1) text
cap_words, tts_words = [], [w['text'] for ln in LINES for w in ln['words']]
for s, a, b in chunks:
    cap_words += LINES[s]['text'].split(' ')[a:b + 1]
expect = ' '.join(NARRATION).split(' ')
m1 = cap_words == expect
m2 = [norm(w) for w in cap_words] == [norm(w) for w in tts_words]
ok &= m1 and m2
print(f'caption words {len(cap_words)} | approved narration words {len(expect)} | TTS-reported words {len(tts_words)}')
print('TEXT vs approved narration, word for word, in order:', 'PASS' if m1 else 'FAIL')
print('TEXT vs TTS engine word-boundary transcript (punctuation stripped):', 'PASS' if m2 else 'FAIL')
print('word-by-word:')
for i, (c, e, tw) in enumerate(zip(cap_words, expect, tts_words)):
    print(f'  {i + 1:>2}. caption {c:<12} narration {e:<12} TTS {tw:<12} {"ok" if c == e and norm(c) == norm(tw) else "MISMATCH"}')
print('caption chunks (max 2 lines each):')
for s, a, b in chunks:
    print('  |', ' '.join(LINES[s]['text'].split(' ')[a:b + 1]))


# 2) per-frame caption presence + geometry
def load(p):
    return np.asarray(Image.open(p).convert('RGB')).astype(np.int16)


caps = sorted(glob.glob(os.path.join(sys.argv[1], 'element-*.png')))
bgs = sorted(glob.glob(os.path.join(sys.argv[2], 'element-*.png')))
assert caps and len(caps) == len(bgs)
present, bottom, top, tall, xmin, xmax = [], 0, 1920, 0, 1080, 0
for c, b in zip(caps, bgs):
    m = np.abs(load(c) - load(b)).max(axis=2) > 40
    ys, xs = np.nonzero(m)
    if len(ys) < 200:
        present.append(False)
        continue
    present.append(True)
    bottom, top = max(bottom, ys.max()), min(top, ys.min())
    tall = max(tall, ys.max() - ys.min() + 1)
    xmin, xmax = min(xmin, xs.min()), max(xmax, xs.max())
print(f'frames {len(present)}, with caption {sum(present)}; caption bbox x {xmin}-{xmax}, y {top}-{bottom} (limit: x 80-920, bottom y <= 1360); tallest pill {tall}px (1 line ~86, 2 lines ~146, 3 lines ~204)')
geo = bottom <= 1360 and tall <= 160 and xmin >= 80 and xmax <= 920
ok &= geo
print('GEOMETRY:', 'PASS' if geo else 'FAIL')

# 3) timing
sent = []  # (text, tts_start, tts_end) in video seconds
for s, ln in enumerate(LINES):
    toks = ln['text'].split(' ')
    st = 0
    for i, tk in enumerate(toks):
        if re.search(r'[.?!]$', tk):
            sent.append((' '.join(toks[st:i + 1]), LEAD / FPS + ln['words'][st]['start'], LEAD / FPS + ln['words'][i]['end']))
            st = i + 1
runs, cur = [], None
for f, p in enumerate(present):
    if p and cur is None:
        cur = f
    if not p and cur is not None:
        runs.append((cur / FPS, f / FPS)); cur = None
if cur is not None:
    runs.append((cur / FPS, len(present) / FPS))
sd = subprocess.run(['ffmpeg', '-v', 'info', '-i', sys.argv[3], '-af', 'silencedetect=noise=-45dB:d=0.12', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
sil = [(float(a), float(b)) for a, b in zip(re.findall(r'silence_start: ([\d.]+)', sd), re.findall(r'silence_end: ([\d.]+)', sd))]
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', sys.argv[3]]))
speech, last = [], 0.0
for a, b in sil:
    if a - last > 0.05:
        speech.append((last, a))
    last = b
if dur - last > 0.05:
    speech.append((last, dur))
speech = [sg for sg in speech if sg[1] - sg[0] > 0.08]


def measured(ts, te):
    """Audible start/end of a sentence: the outer edges of every detected speech segment that overlaps its TTS window
    (pauses at commas split one sentence into several segments)."""
    seg = [sg for sg in speech if sg[1] > ts - 0.15 and sg[0] < te + 0.15]
    return (min(x[0] for x in seg), max(x[1] for x in seg)) if seg else (None, None)


print(f'sentences {len(sent)} | caption runs {len(runs)} | speech segments by silence detection (-45dB) {len(speech)}')
rows, tok = [], len(sent) == len(runs)
ok &= tok
print('"TTS" = start/end the TTS engine reported (+0.4s lead-in); "audio" = measured on the rendered video audio.')
print(f'{"#":>2} {"sentence":<30} {"caption on":>10} {"caption off":>11} {"TTS start":>9} {"TTS end":>8} {"audio start":>11} {"audio end":>9} {"max |delta|":>11}  result')
for i, (txt, ts, te) in enumerate(sent if tok else []):
    on, off = runs[i]; ss, se = measured(ts, te)
    deltas = [abs(on - ts), abs(off - te), abs(on - ss), abs(off - se)]
    good = max(deltas) <= 0.1
    ok &= good
    rows.append([i + 1, txt, f'{on:.3f}', f'{off:.3f}', f'{ts:.3f}', f'{te:.3f}', f'{ss:.3f}', f'{se:.3f}', f'{max(deltas):.3f}', 'PASS' if good else 'FAIL'])
    print(f'{i + 1:>2} {txt[:30]:<30} {on:>10.3f} {off:>11.3f} {ts:>9.3f} {te:>8.3f} {ss:>11.3f} {se:>9.3f} {max(deltas):>11.3f}  {"PASS" if good else "FAIL"}')
if not tok:
    print('COUNT MISMATCH: runs', runs)
with open(sys.argv[4], 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['n', 'sentence', 'caption_on_s', 'caption_off_s', 'tts_start_s', 'tts_end_s', 'audio_start_s', 'audio_end_s', 'max_abs_delta_s', 'result'])
    w.writerows(rows)
print('TIMING (within 0.1s of the measured sentence boundaries):', 'PASS' if tok and all(r[-1] == 'PASS' for r in rows) else 'FAIL')
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
