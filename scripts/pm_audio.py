"""Builds the audio for the Project Management ad from the edge-tts clips (scripts/pm_voice.py).

 1. voice: trim silence, join line 1's sentences with short gaps, atempo (<= 1.12) only where a clip overruns its
    window, place each clip at its start second, normalise the voice bus to -16 LUFS (two-pass loudnorm)
 2. sound design: soft ticks/pops, whooshes, thuds, chimes, check dings, warning blips, synthesised in numpy
    at the cue times from src/pm/timing.ts (via scripts/pm_cues.mjs -> cues.json)
 3. music: synthesised modern-corporate bed (Am-F-C-G, 96 BPM), 62 s
 4. mix: music sidechain-ducked by the voice, sfx on top, true-peak limited

usage: python3 -I scripts/pm_audio.py <voice-dir> <cues.json> <out-dir>
Writes <out-dir>/{vo.wav, sfx.wav, music.wav, mix.wav, timings.json}. No credentials involved."""
import json, pathlib, subprocess, sys
import numpy as np

SR = 48000
TOTAL = 62.0
vdir, cues_path, out = map(pathlib.Path, sys.argv[1:4])
out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(11)


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, args)], check=True)


def read(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).copy()


def write(path, x):  # x: (n,) or (n,2) float -> 24-bit-ish wav via ffmpeg
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", str(path)], stdin=subprocess.PIPE)
    p.communicate(x.tobytes())
    assert p.returncode == 0


def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]))


def trim(path, dst):
    ff("-i", path, "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse", "-ar", SR, "-ac", 1, dst)
    return read(dst)


# ------------------------------------------------------------------ 1. voice
lines = json.loads((vdir / "lines.json").read_text())
START_OVERRIDE = {"v1": 0.2, "v2": 7.6}  # see summary: line 1 cannot fit its 6.7 s window even at 1.12x
GAP = 0.12  # between the sentences of line 1
N = int(TOTAL * SR)
bus = np.zeros(N, dtype=np.float32)
timings = []
tmp = out / "tmp"
tmp.mkdir(exist_ok=True)
for ln in lines:
    pieces = [trim(vdir / p, tmp / f"{ln['id']}_{i}.wav") for i, p in enumerate(ln["pieces"])]
    parts = []
    for i, p in enumerate(pieces):
        if i:
            parts.append(np.zeros(int(GAP * SR), dtype=np.float32))
        parts.append(p)
    clip = np.concatenate(parts)
    d = len(clip) / SR
    start = START_OVERRIDE.get(ln["id"], ln["start"])
    window = ln["latest_end"] - start
    tempo = 1.0
    if d > window:
        tempo = min(1.12, d / window + 0.012)
        write(tmp / "pre.wav", clip)
        ff("-i", tmp / "pre.wav", "-af", f"atempo={tempo:.4f}", "-ac", 1, tmp / "post.wav")
        clip = read(tmp / "post.wav")
    end = start + len(clip) / SR
    a = int(start * SR)
    bus[a : a + len(clip)] += clip[: N - a]
    timings.append({"id": ln["id"], "storyboard_start": ln["start"], "start": round(start, 2), "end": round(end, 2), "raw_speech_s": round(d, 2), "atempo": round(tempo, 3), "fits_window": end <= ln["latest_end"] + 1e-6, "text": ln["text"]})
    print(ln["id"], f"start {start:.2f} end {end:.2f} tempo {tempo:.3f}", "OK" if end <= ln["latest_end"] + 1e-6 else "OVERRUN")
write(out / "vo_raw.wav", bus)
# two-pass loudnorm to -16 LUFS
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out / "vo_raw.wav"), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{") : m.rindex("}") + 1])
ff("-i", out / "vo_raw.wav", "-af", f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true", "-ar", SR, out / "vo.wav")
(out / "timings.json").write_text(json.dumps(timings, indent=1))


# ------------------------------------------------------------------ 2. sound design
def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a, r, curve=3.0):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def bandpass_noise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def sweep_noise(d, f0, f1, width=0.5):
    """noise whose centre frequency sweeps f0 -> f1 (log), built from overlapping bandpassed slices"""
    n = int(d * SR)
    y = np.zeros(n)
    slices = 24
    for i in range(slices):
        c = f0 * (f1 / f0) ** (i / (slices - 1))
        a, b = int(n * i / slices), int(n * min(slices, i + 2.2) / slices)
        seg = bandpass_noise(b - a, c * (1 - width), c * (1 + width))
        seg *= np.hanning(b - a)
        y[a:b] += seg
    return y / (np.abs(y).max() + 1e-9)


def sine(f, d, ph=0.0):
    return np.sin(2 * np.pi * f * t_(d) + ph)


def sfx_tick(g):
    d = 0.06
    x = 0.55 * sine(2600, d) * np.exp(-t_(d) * 90) + 0.35 * bandpass_noise(int(d * SR), 3000, 9000) * np.exp(-t_(d) * 160)
    return x * 0.35 * g


def sfx_pop(g):
    d = 0.14
    tt = t_(d)
    f = 520 + 520 * np.exp(-tt * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 26)
    return x * 0.5 * g


def sfx_thud(g):
    d = 0.5
    tt = t_(d)
    f = 48 + 90 * np.exp(-tt * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) + 0.25 * bandpass_noise(len(tt), 80, 600) * np.exp(-tt * 30)
    return x * 0.8 * g


def sfx_whoosh(g, rev=False):
    d = 0.8
    x = sweep_noise(d, 300, 5200)
    e = np.sin(np.pi * np.linspace(0, 1, len(x))) ** 2.2
    x = x * e
    if rev:
        x = x[::-1]
    return x * 0.4 * g


def sfx_boom(g):
    d = 1.6
    tt = t_(d)
    f = 42 + 70 * np.exp(-tt * 6)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)
    x += 0.5 * sweep_noise(d, 200, 6000, 0.6) * np.exp(-tt * 3.0)
    return x * 0.6 * g


def bell(freqs, d, decay, amps):
    tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * tt + 0.8 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 9)) * np.exp(-tt * decay * (1 + 0.35 * i)) for i, (f, a) in enumerate(zip(freqs, amps)))
    return x


def sfx_chime(g):
    x = bell([880, 1320, 1760, 2217, 2640], 2.4, 2.2, [1, 0.6, 0.45, 0.25, 0.15])
    x2 = np.zeros_like(x)
    k = int(0.12 * SR)
    x2[k:] = 0.55 * bell([1320, 1980, 2640], 2.4, 2.4, [1, 0.5, 0.3])[: len(x) - k]
    return (x + x2) * 0.2 * g


def sfx_check(g):
    a = bell([988, 1976], 0.5, 7, [1, 0.3])
    b = np.zeros_like(a)
    k = int(0.09 * SR)
    b[k:] = bell([1319, 2638], 0.5, 7, [1, 0.3])[: len(a) - k]
    return (a + b) * 0.3 * g


def sfx_warn(g):
    d = 0.5
    x = np.zeros(int(d * SR))
    for i, f in enumerate([660, 520]):
        s = int(i * 0.16 * SR)
        blip = np.sin(2 * np.pi * f * t_(0.13)) * env(int(0.13 * SR), 0.005, 0.08)
        x[s : s + len(blip)] += blip
    return x * 0.35 * g


def sfx_tally(g):
    d = 1.0
    x = np.zeros(int(d * SR))
    for i in range(8):
        s = int(i * 0.1 * SR)
        f = 700 * 2 ** (i / 8)
        blip = np.sin(2 * np.pi * f * t_(0.08)) * np.exp(-t_(0.08) * 40)
        x[s : s + len(blip)] += blip
    return x * 0.28 * g


SFX = {
    "tick": sfx_tick, "pop": sfx_pop, "thud": sfx_thud, "whoosh": sfx_whoosh, "rwhoosh": lambda g: sfx_whoosh(g, True),
    "boom": sfx_boom, "chime": sfx_chime, "check": sfx_check, "warn": sfx_warn, "tally": sfx_tally,
}
cues = json.loads(cues_path.read_text())["cues"]
sfx = np.zeros((N, 2), dtype=np.float32)
for c in cues:
    s = SFX[c["kind"]](c.get("gain", 1.0)).astype(np.float32)
    # whooshes pan left -> right
    n = len(s)
    if c["kind"] in ("whoosh", "rwhoosh"):
        pan = np.linspace(0.2, 0.8, n)
    else:
        pan = np.full(n, 0.5 + 0.12 * np.sin(c["t"] * 7.3))
    a = int(c["t"] * SR)
    # a cue at/ before 0 would be clipped; keep inside the buffer
    a = max(0, a)
    b = min(N, a + n)
    sfx[a:b, 0] += s[: b - a] * np.sqrt(1 - pan[: b - a])
    sfx[a:b, 1] += s[: b - a] * np.sqrt(pan[: b - a])
write(out / "sfx.wav", sfx)

# ------------------------------------------------------------------ 3. music
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
CH = [  # (bass, [pad notes], [arp notes])
    (55.0, [220.0, 261.63, 329.63], [440.0, 523.25, 659.25, 523.25]),  # Am
    (43.65, [174.61, 220.0, 261.63], [349.23, 440.0, 523.25, 440.0]),  # F
    (65.41, [261.63, 329.63, 392.0], [523.25, 659.25, 784.0, 659.25]),  # C
    (49.0, [196.0, 246.94, 293.66], [392.0, 493.88, 587.33, 493.88]),  # G
]
mus = np.zeros((N, 2), dtype=np.float32)


def add(buf, sig, at, pan=0.5):
    a = int(at * SR)
    if a >= N:
        return
    b = min(N, a + len(sig))
    s = sig[: b - a]
    buf[a:b, 0] += s * np.sqrt(1 - pan)
    buf[a:b, 1] += s * np.sqrt(pan)


def pluck(f, d, amp):
    tt = t_(d)
    return amp * (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 12)) * np.exp(-tt * 7) * env(len(tt), 0.004, 0.02, 1)


bars = int(np.ceil(TOTAL / BAR)) + 1
for b in range(bars):
    t0 = b * BAR
    bass, pad, arp = CH[b % 4]
    tn = t0
    # pad: soft detuned sines, attack 0.5 s, overlapping release
    L = BAR + 0.9
    tt = t_(L)
    e = np.minimum(1, tt / 0.5) * np.minimum(1, (L - tt) / 0.9)
    for i, f in enumerate(pad):
        for det, pan in ((-0.0025, 0.35), (0.0025, 0.65)):
            ff_ = f * (1 + det)
            sig = (np.sin(2 * np.pi * ff_ * tt) + 0.3 * np.sin(2 * np.pi * 2 * ff_ * tt + i)) * e * 0.055
            add(mus, sig, tn, pan)
    on = t0 >= 6.2  # body of the track enters just before scene 2
    if t0 < 7.0:
        # scene 1: tense, sparse: sub pulse + dry clock-like ticks
        for k in range(4):
            sig = np.sin(2 * np.pi * bass * 2 * t_(0.5)) * np.exp(-t_(0.5) * 5) * 0.22
            add(mus, sig, t0 + k * BEAT, 0.5)
        for k in range(8):
            tick = bandpass_noise(int(0.03 * SR), 4000, 9000) * np.exp(-t_(0.03) * 150) * 0.05
            add(mus, tick, t0 + k * BEAT / 2, 0.3 + 0.4 * (k % 2))
    if on:
        for k in range(4):  # bass: soft pulses on every beat, held root
            sig = np.sin(2 * np.pi * bass * t_(BEAT * 1.6)) * np.exp(-t_(BEAT * 1.6) * 2.6) * 0.34
            add(mus, sig, t0 + k * BEAT, 0.5)
        for k in (0, 2):  # soft kick
            tt2 = t_(0.18)
            kick = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-tt2 * 40)) / SR) * np.exp(-tt2 * 18) * 0.3
            add(mus, kick, t0 + k * BEAT, 0.5)
        for k in range(8):  # arp: eighths, alternating pan
            note = arp[k % 4] * (2 if (k // 4) % 2 and t0 > 25 else 1)
            add(mus, pluck(note, 0.5, 0.075), t0 + k * BEAT / 2, 0.3 + 0.4 * (k % 2))
        if t0 >= 15:  # hats on off-beats
            for k in range(4):
                hat = bandpass_noise(int(0.05 * SR), 6000, 14000) * np.exp(-t_(0.05) * 90) * 0.045
                add(mus, hat, t0 + k * BEAT + BEAT / 2, 0.65)
# riser into the intro (5.2 -> 7.0)
d = 1.8
riser = sweep_noise(d, 400, 7000, 0.5) * (np.linspace(0, 1, int(d * SR)) ** 2.2) * 0.10
add(mus, riser.astype(np.float32), 5.2, 0.5)
# global fades
fade = np.ones(N)
fi, fo = int(0.8 * SR), int(3.0 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo) ** 1.6
mus *= fade[:, None].astype(np.float32)
write(out / "music_raw.wav", mus)
ff("-i", out / "music_raw.wav", "-af", "loudnorm=I=-22:TP=-3:LRA=7", "-ar", SR, out / "music.wav")

# ------------------------------------------------------------------ 4. mix (music ducked by the voice, sfx on top)
fc = (
    "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[vk][vm];"
    "[1:a]aresample=48000[mus];"
    "[mus][vk]sidechaincompress=threshold=0.05:ratio=4:attack=25:release=500:makeup=1:level_sc=1[musd];"
    "[2:a]aresample=48000,volume=-9dB[sfx];"
    "[musd][sfx][vm]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.93:level=disabled[mix]"
)
ff("-i", out / "vo.wav", "-i", out / "music.wav", "-i", out / "sfx.wav", "-filter_complex", fc, "-map", "[mix]", "-t", TOTAL, "-ar", SR, "-c:a", "pcm_s24le", out / "mix.wav")
print("wrote", out / "mix.wav")
