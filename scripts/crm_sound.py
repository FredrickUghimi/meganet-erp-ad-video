"""Generates the Sales & CRM ad's sound in code (no licensed audio): a soft ambient pad + gentle pulse
underscore ducked under the narration (read from src/crmTimings.ts), plus quiet whoosh / click / chime effects.
usage: python3 -I scripts/crm_sound.py   -> public/crm-music.wav, crm-whoosh.wav, crm-click.wav, crm-chime.wav"""
import json, re, pathlib, wave
import numpy as np
root = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
DUR = 35.0
LEAD = 0.1
txt = (root / "src" / "crmTimings.ts").read_text()
lines = json.loads(re.search(r"LINES[^=]*= (\[.*\]);", txt, re.S).group(1))
rng = np.random.default_rng(7)


def save(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(root / "public" / name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


t = np.arange(int(DUR * SR)) / SR
# pad: Am9 -> Fmaj7 -> C -> G, slowly swelling detuned sines
chords = [[220.0, 261.63, 329.63, 392.0], [174.61, 220.0, 261.63, 329.63], [196.0, 261.63, 329.63, 392.0], [196.0, 246.94, 293.66, 392.0]]
pad = np.zeros_like(t)
seg = 8.75
for k in range(4):
    a, b = k * seg, (k + 1) * seg + 1.5
    m = (t >= a) & (t < b)
    env = np.zeros_like(t)
    tt = t[m] - a
    env[m] = np.minimum(1, tt / 2.5) * np.minimum(1, (b - a - tt) / 2.5)
    for f in chords[k]:
        for det in (-0.6, 0.6):
            pad += env * np.sin(2 * np.pi * (f + det) * t + rng.uniform(0, 6)) * 0.05
    pad += env * np.sin(2 * np.pi * (chords[k][0] / 2) * t) * 0.09
# soft pulse: low sine thump on every 0.5s (120 bpm), very gentle
pulse = np.zeros_like(t)
for n in range(int(DUR / 0.5)):
    s = int(n * 0.5 * SR); L = int(0.28 * SR)
    if s + L > len(t): break
    tt = np.arange(L) / SR
    pulse[s:s + L] += np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 9) * (0.16 if n % 2 == 0 else 0.09)
# airy shimmer arpeggio from 8s
arp = np.zeros_like(t)
notes = [659.25, 783.99, 987.77, 783.99, 880.0, 659.25, 523.25, 659.25]
for n in range(int((DUR - 4) / 0.25)):
    s0 = 4 + n * 0.25
    if s0 > DUR - 2: break
    s = int(s0 * SR); L = int(0.6 * SR)
    tt = np.arange(L) / SR
    arp[s:s + L] += np.sin(2 * np.pi * notes[n % 8] * tt) * np.exp(-tt * 5) * 0.022
music = (pad + pulse + arp)
# duck under voice
gain = np.full_like(t, 0.62)
for ln in lines:
    for w in ln["words"]:
        a = int((w["start"] + LEAD - 0.12) * SR); b = int((w["end"] + LEAD + 0.25) * SR)
        gain[max(a, 0):b] = 0.2
k = int(0.18 * SR)
gain = np.convolve(gain, np.ones(k) / k, mode="same")
music *= gain
music *= np.minimum(1, t / 1.0) * np.minimum(1, (DUR - t) / 1.0)  # fade in 1s, out last second
music /= max(1e-6, np.abs(music).max()) / 0.55
save("crm-music.wav", music)

def whoosh(dur=0.7):
    n = int(dur * SR); x = rng.normal(0, 1, n)
    tt = np.arange(n) / SR
    env = np.sin(np.pi * np.minimum(1, tt / dur)) ** 2
    # band-pass sweep via cumulative one-pole filtering with rising cutoff
    y = np.zeros(n); lp = 0.0
    for i in range(n):
        c = 0.02 + 0.5 * (i / n)
        lp += c * (x[i] - lp); y[i] = x[i] - lp if i % 2 else lp
    return y * env * 0.12
def click():
    n = int(0.09 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 70) + 0.3 * rng.normal(0, 1, n) * np.exp(-tt * 120)) * 0.25
def chime():
    n = int(0.9 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318.5 * tt) + 0.5 * np.sin(2 * np.pi * 1975.5 * tt)) * np.exp(-tt * 4.5) * 0.12
save("crm-whoosh.wav", whoosh()); save("crm-click.wav", click()); save("crm-chime.wav", chime())
print("sound ok")
