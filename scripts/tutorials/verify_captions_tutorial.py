#!/usr/bin/env python3
"""Caption checks for the Staff Directory tutorials (MegaNetTutorialInvite|Change|Deactivate).
usage: verify_captions_tutorial.py KEY FULL_DIR NOCAPS_DIR FINAL.mp4 OUT_CSV TEXTBOXES_JSON
 KEY            invite | change | deactivate
 FULL_DIR/NOCAPS_DIR  lossless PNG sequences of the full render and of the render with the caption layer off (debug 'nocaps'). Scene
                content ends by y 1095 and the caption zone starts at y 1120, so their difference is exactly the caption pill.
 TEXTBOXES_JSON from scripts/tutorials/tutorial_textbox_audit.mjs (every text node on every frame)
1) TEXT, word for word, in order: the caption words rebuilt from the chunk list vs (a) the approved narration, parsed from
   TUTORIALS in scripts/tutorial_voice.py (independent of the generated timings file) and (b) the words the TTS engine reported
   (punctuation stripped). NOTE (b) is the engine's own word-boundary transcript, not an independent speech recogniser (none is
   available in this environment).
2) RENDERED TEXT on every frame: the caption text nodes actually present in the DOM on each frame must equal the words of the
   chunk scheduled for that frame (and be absent when none is scheduled).
3) GEOMETRY from pixels, every frame (full render vs no-captions render): pill inside x 80-920, bottom y <= 1280, <= 2 lines.
4) TIMING from pixels: per sentence, when its caption appears and disappears (frame accurate) vs the measured sentence
   boundaries, two ways: the TTS word boundaries (+0.4s lead-in) and silence detection (-45dB) run on the rendered video's own
   audio. Pass = within 0.1s on both ends against both measurements.
5) NEGATIVE CONTROLS: a changed word, a 0.25s timing shift and a blanked / altered caption frame must each be caught."""
import ast, csv, glob, json, os, re, subprocess, sys
import numpy as np
from PIL import Image

KEY, CAPS, BGS, FINAL, OUT, TB = sys.argv[1:7]   # CAPS = full render dir, BGS = no-captions render dir
FPS, LEAD, CAP_DELAY = 30, 12, 2
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
vs = ast.parse(open(os.path.join(root, 'scripts', 'tutorial_voice.py')).read())
TUTORIALS = next(ast.literal_eval(n.value) for n in vs.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'TUTORIALS')
NARRATION = [s for sc in TUTORIALS[KEY] for s in sc]
t = open(os.path.join(root, 'src', 'tutorialTimings.ts')).read()
i = t.index('= {', t.index('TIMINGS:')) + 2
T = json.loads(t[i:t.rindex(';')])[KEY]
S, CH = T['SENTENCES'], T['CHUNKS']
FREEZE = LEAD + round(T['VOICE_END'] * FPS)
norm = lambda w: re.sub(r'[^\w-]', '', w).lower()
ok = True

# 1) text
cap_words = [S[s]['words'][w]['text'] for s, a, b in CH for w in range(a, b + 1)]
tts_words = [w['tts'] for sn in S for w in sn['words']]
expect = ' '.join(NARRATION).split(' ')
def text_ok(cap, exp, tts): return cap == exp, [norm(w) for w in cap] == [norm(w) for w in tts]
m1, m2 = text_ok(cap_words, expect, tts_words)
ok &= m1 and m2
print(f'{KEY}: caption words {len(cap_words)} | approved narration words {len(expect)} | TTS-reported words {len(tts_words)}')
print('TEXT vs approved narration, word for word, in order:', 'PASS' if m1 else 'FAIL')
print('TEXT vs TTS engine word-boundary transcript (punctuation stripped):', 'PASS' if m2 else 'FAIL')
bad_words = [(i + 1, c, e, tw) for i, (c, e, tw) in enumerate(zip(cap_words, expect, tts_words)) if c != e or norm(c) != norm(tw)]
print('word mismatches:', bad_words if bad_words else 'none', '(first 6 words: ' + ' | '.join(f'{c}/{e}/{tw}' for c, e, tw in list(zip(cap_words, expect, tts_words))[:6]) + ')')
print('caption chunks (each fits 2 lines at 48px):')
for s, a, b in CH: print('  |', ' '.join(w['text'] for w in S[s]['words'][a:b + 1]))

# chunk windows, same formulas as src/MegaNetTutorials.tsx
wordF = lambda s, w: LEAD + round(S[s]['words'][w]['start'] * FPS)
wordEndF = lambda s, w: LEAD + round(S[s]['words'][w]['end'] * FPS)
def window(ci):
    s, a, b = CH[ci]; on = wordF(s, a) + CAP_DELAY
    off = wordEndF(s, b) + CAP_DELAY if (re.search(r'[.?!]$', S[s]['words'][b]['text']) or ci == len(CH) - 1) else wordF(*CH[ci + 1][:2]) + CAP_DELAY
    return on, off
def expected_text(f):
    ff = min(f, FREEZE)
    for ci in range(len(CH)):
        on, off = window(ci)
        if on <= ff < off:
            s, a, b = CH[ci]; return ' '.join(w['text'] for w in S[s]['words'][a:b + 1])
    return ''

# 2) rendered DOM text on every frame
rows = json.load(open(TB)); nframes = len(rows)
def dom_mismatches(rows, mutate=None):
    bad = []
    for f in range(nframes):
        nodes = [n for n in rows[str(f)] if n['y0'] > 1110]
        nodes.sort(key=lambda n: (round(n['y0']), n['x0']))
        got = ' '.join(n['text'] for n in nodes)
        if mutate: got = mutate(f, got)
        if got != expected_text(f): bad.append((f, got, expected_text(f)))
    return bad
bad = dom_mismatches(rows); okdom = not bad; ok &= okdom
print(f'RENDERED TEXT (DOM) on {nframes} frames: frames whose caption text differs from the scheduled chunk: {len(bad)} ->', 'PASS' if okdom else 'FAIL', bad[:3] if bad else '')

# 3) geometry from pixels
def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.int16)
caps = sorted(glob.glob(os.path.join(CAPS, 'element-*.png'))); bgs = sorted(glob.glob(os.path.join(BGS, 'element-*.png')))
assert caps and len(caps) == len(bgs) == nframes, (len(caps), len(bgs), nframes)
present, bottom, top, tall, xmin, xmax = [], 0, 1920, 0, 1080, 0
for c, b in zip(caps, bgs):
    m = np.abs(load(c) - load(b)).max(axis=2) > 40; ys, xs = np.nonzero(m)
    if len(ys) < 200: present.append(False); continue
    present.append(True); bottom, top = max(bottom, ys.max()), min(top, ys.min()); tall = max(tall, ys.max() - ys.min() + 1); xmin, xmax = min(xmin, xs.min()), max(xmax, xs.max())
print(f'frames {len(present)}, with caption {sum(present)}; caption bbox x {xmin}-{xmax}, y {top}-{bottom} (limit x 80-920, bottom y <= 1280); tallest pill {tall}px (1 line ~86, 2 lines ~146, 3 lines ~204)')
geo = bottom <= 1280 and tall <= 160 and xmin >= 80 and xmax <= 920; ok &= geo
print('GEOMETRY (every frame):', 'PASS' if geo else 'FAIL')

# 4) timing
sent = [(sn['text'], LEAD / FPS + sn['words'][0]['start'], LEAD / FPS + sn['words'][-1]['end']) for sn in S]
runs, cur = [], None
for f, p in enumerate(present):
    if p and cur is None: cur = f
    if not p and cur is not None: runs.append((cur / FPS, f / FPS)); cur = None
if cur is not None: runs.append((cur / FPS, len(present) / FPS))
sd = subprocess.run(['ffmpeg', '-v', 'info', '-i', FINAL, '-af', 'silencedetect=noise=-45dB:d=0.12', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
sil = [(float(a), float(b)) for a, b in zip(re.findall(r'silence_start: ([\d.]+)', sd), re.findall(r'silence_end: ([\d.]+)', sd))]
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', FINAL]))
speech, last = [], 0.0
for a, b in sil:
    if a - last > 0.05: speech.append((last, a))
    last = b
if dur - last > 0.05: speech.append((last, dur))
speech = [sg for sg in speech if sg[1] - sg[0] > 0.08]
def measured(ts, te):
    seg = [sg for sg in speech if sg[1] > ts - 0.15 and sg[0] < te + 0.15]
    return (min(x[0] for x in seg), max(x[1] for x in seg)) if seg else (None, None)
def timing(runs, shift=0.0):
    out = []
    for i, (txt, ts, te) in enumerate(sent):
        on, off = runs[i]; on += shift; off += shift; ss, se = measured(ts, te)
        d = [abs(on - ts), abs(off - te), abs(on - ss), abs(off - se)]
        out.append([i + 1, txt, on, off, ts, te, ss, se, max(d)])
    return out
print(f'sentences {len(sent)} | caption runs {len(runs)} | speech segments by silence detection (-45dB) {len(speech)}')
tok = len(sent) == len(runs); ok &= tok
res = timing(runs) if tok else []
print('"TTS" = start/end the TTS engine reported (+0.4s lead-in); "audio" = measured on the rendered video audio.')
print(f'{"#":>2} {"sentence":<30} {"cap on":>8} {"cap off":>8} {"TTS st":>8} {"TTS end":>8} {"audio st":>9} {"audio end":>9} {"max |d|":>8}  result')
for r in res: print(f'{r[0]:>2} {r[1][:30]:<30} {r[2]:>8.3f} {r[3]:>8.3f} {r[4]:>8.3f} {r[5]:>8.3f} {r[6]:>9.3f} {r[7]:>9.3f} {r[8]:>8.3f}  {"PASS" if r[8] <= 0.1 else "FAIL"}')
tim = tok and all(r[8] <= 0.1 for r in res); ok &= tim
print(f'worst |delta| over {len(res)} sentences x 4 comparisons: {max([r[8] for r in res] or [9]):.3f}s')
print('TIMING (within 0.1s of the measured sentence boundaries):', 'PASS' if tim else 'FAIL')
with open(OUT, 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['n', 'sentence', 'caption_on_s', 'caption_off_s', 'tts_start_s', 'tts_end_s', 'audio_start_s', 'audio_end_s', 'max_abs_delta_s', 'result'])
    for r in res: w.writerow([r[0], r[1], f'{r[2]:.3f}', f'{r[3]:.3f}', f'{r[4]:.3f}', f'{r[5]:.3f}', f'{r[6]:.3f}', f'{r[7]:.3f}', f'{r[8]:.3f}', 'PASS' if r[8] <= 0.1 else 'FAIL'])

# 5) negative controls: each broken input MUST be caught
cw = list(cap_words); cw[len(cw) // 2] = cw[len(cw) // 2] + 'x'
n1 = not text_ok(cw, expect, tts_words)[0]
n2 = not all(r[8] <= 0.1 for r in timing(runs, 0.25)) if tok else False
fa = next(f for f in range(600, nframes) if expected_text(f)); fb = next(f for f in range(fa + 40, nframes) if expected_text(f))   # frames that really carry a caption
blank = dom_mismatches(rows, lambda f, got: '' if f == fa else got); n3 = any(b[0] == fa for b in blank)
swap = dom_mismatches(rows, lambda f, got: got.replace(got.split(' ')[0], 'Wrong', 1) if f == fb else got); n4 = any(b[0] == fb for b in swap)
print(f'NEGATIVE CONTROLS: changed caption word caught: {n1}; 0.25s timing shift caught: {n2}; blanked caption frame caught: {n3}; altered caption word on a frame caught: {n4}')
ok &= n1 and n2 and n3 and n4
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
