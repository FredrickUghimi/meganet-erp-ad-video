#!/usr/bin/env python3
"""Measures the audible start/end of every sentence on the audio Remotion actually renders (audio-only AAC render of each
tutorial: same mixer and encoder as the mp4, including the encoder delay of about 0.043 s) and writes them into
src/tutorialTimings.ts as aon / aoff (seconds from the start of voiceover-tutorial-<key>.mp3).
Caption edges for a sentence's first / last caption sit halfway between the TTS engine's word boundary and this audible
boundary (src/MegaNetTutorials.tsx), which keeps captions within 0.1 s of BOTH whenever the two differ by less than 0.2 s.
Silence detection: -45 dB, 0.12 s, the same call scripts/tutorials/verify_captions_tutorial.py uses on the final mp4.
usage: python3 scripts/tutorials/calibrate_captions.py <scratch-dir> [invite change deactivate]"""
import json, os, re, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(root)
work = sys.argv[1]; keys = sys.argv[2:] or ['invite', 'change', 'deactivate']; os.makedirs(work, exist_ok=True)
ID = {'invite': 'MegaNetTutorialInvite', 'change': 'MegaNetTutorialChange', 'deactivate': 'MegaNetTutorialDeactivate'}
LEAD = 0.4
path = 'src/tutorialTimings.ts'; t = open(path).read(); i = t.index('= {', t.index('TIMINGS:')) + 2; j = t.rindex(';')
T = json.loads(t[i:j])
for k in keys:
    aac = os.path.join(work, f'{k}.aac')
    subprocess.run(['npx', 'remotion', 'render', ID[k], aac, '--codec=aac', '--browser-executable=/opt/pw-browsers/chromium'], check=True, capture_output=True)
    sd = subprocess.run(['ffmpeg', '-v', 'info', '-i', aac, '-af', 'silencedetect=noise=-45dB:d=0.12', '-vn', '-f', 'null', '-'], capture_output=True, text=True).stderr
    sil = [(float(a), float(b)) for a, b in zip(re.findall(r'silence_start: ([\d.]+)', sd), re.findall(r'silence_end: ([\d.]+)', sd))]
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', aac]))
    speech, last = [], 0.0
    for a, b in sil:
        if a - last > 0.05: speech.append((last, a))
        last = b
    if dur - last > 0.05: speech.append((last, dur))
    speech = [sg for sg in speech if sg[1] - sg[0] > 0.08]
    gaps = []
    for s in T[k]['SENTENCES']:
        ts, te = s['words'][0]['start'] + LEAD, s['words'][-1]['end'] + LEAD
        seg = [sg for sg in speech if sg[1] > ts - 0.15 and sg[0] < te + 0.15]
        s['aon'] = round(min(x[0] for x in seg) - LEAD, 4); s['aoff'] = round(max(x[1] for x in seg) - LEAD, 4)
        gaps.append((s['aon'] - s['words'][0]['start'], s['aoff'] - s['words'][-1]['end']))
    print(f"{k}: {len(T[k]['SENTENCES'])} sentences; audible start - TTS start {min(g[0] for g in gaps):.3f}..{max(g[0] for g in gaps):.3f} s; audible end - TTS end {min(g[1] for g in gaps):.3f}..{max(g[1] for g in gaps):.3f} s")
open(path, 'w').write(t[:i] + json.dumps(T, indent=1) + t[j:])
