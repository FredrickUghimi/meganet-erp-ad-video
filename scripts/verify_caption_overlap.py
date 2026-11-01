#!/usr/bin/env python3
"""Caption-vs-content overlap check on LOSSLESS frames (STYLE_GUIDE.md section 3, "caption zone").

Rule: the caption box must never cover scene content. The caption zone is the FULL caption box rectangle at its
maximum two-line height (not the current line): x 110-890, y 1120-1272. All scene content (text, cards, icons, chips,
labels, CTA block, WhatsApp number, website) must sit above it with at least CLEARANCE (24px) to spare, i.e. end at
y <= 1095. Decorative background gradients may extend behind the captions; they are in the reference render, so they
are subtracted out.

Inputs are two PNG sequences rendered with `remotion render <Comp> <dir> --sequence --image-format=png`:
  NOCAPS_DIR  --props='{"debug":"nocaps"}'  gradients + scene content, caption layer OFF
  BG_DIR      --props='{"debug":"bg"}'      gradients only
Every frame is diffed (NOCAPS vs BG). Any pixel whose largest channel difference exceeds --thresh inside the zone
(or inside the clearance band just above it) is scene content in the way of the captions. The diff is made with the
caption layer off on purpose: with it on, an opaque caption pill would hide exactly what we need to see.

usage:
  verify_caption_overlap.py NOCAPS_DIR BG_DIR [--scene-starts 0,100,...] [--thresh 24] [--clearance 24]
                            [--zone x0,y0,x1,y1] [--expect-fail]
  verify_caption_overlap.py --negative-control NOCAPS_DIR BG_DIR      (synthetic box inside the zone must be caught,
                                                                        a box just clear of the band must not)
--expect-fail: for a rendered negative control (debug 'nocaps-violate-caption'): exit 0 only if EVERY frame is flagged.
--thresh: soft card shadows are decorative and fade to ~20/255 within a few px of a card edge, while borders, text,
chips and icons differ by 33/255 or more from every background in the series, so 24 separates the two.
"""
import glob, os, sys
import numpy as np
from PIL import Image

ZONE = (110, 1120, 890, 1272)  # x0, y0, x1, y1 (exclusive): caption box, 780 wide, max two lines (~152px), bottom edge y=1272 (limit 1280)
CLEARANCE = 24


def arg(name, default, cast=str):
    return cast(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


def load(d):
    f = sorted(glob.glob(os.path.join(d, 'element-*.png')))
    assert f, f'no element-*.png in {d}'
    return f


def content_mask(a, b, thresh):
    return np.abs(a.astype(np.int16) - b.astype(np.int16)).max(axis=2) > thresh


def check_frame(mask, zone, clearance):
    """Returns (pixels inside zone, pixels in clearance band, bbox of offending pixels or None)."""
    x0, y0, x1, y1 = zone
    inside = mask[y0:y1, x0:x1]
    band = mask[max(y0 - clearance, 0):y0, x0:x1]
    n_in, n_band = int(inside.sum()), int(band.sum())
    if not (n_in or n_band):
        return 0, 0, None
    reg = mask[max(y0 - clearance, 0):y1, x0:x1]
    ys, xs = np.nonzero(reg)
    return n_in, n_band, (int(xs.min()) + x0, int(ys.min()) + max(y0 - clearance, 0), int(xs.max()) + x0, int(ys.max()) + max(y0 - clearance, 0))


def ranges(frames):
    out, start, prev = [], None, None
    for f in frames:
        if start is None:
            start = prev = f
        elif f == prev + 1:
            prev = f
        else:
            out.append((start, prev)); start = prev = f
    if start is not None:
        out.append((start, prev))
    return out


def negative_control(fa, fb, zone, clearance, thresh):
    """Synthetic control on real frames: a box inside the zone, one inside the clearance band, one just clear of it."""
    x0, y0, x1, y1 = zone
    i = len(fa) // 2
    A = np.asarray(Image.open(fa[i]).convert('RGB')).copy()
    B = np.asarray(Image.open(fb[i]).convert('RGB'))
    base = content_mask(A, B, thresh)
    res = []
    for name, top, expect in (('inside zone', y0 + 40, True), ('inside clearance band', y0 - clearance + 4, True),
                              ('just clear of band (control, must NOT be flagged)', y0 - clearance - 50, False)):
        T = A.copy()
        T[top:top + 40, 500:540] = (229, 72, 77)
        n_in, n_band, _ = check_frame(content_mask(T, B, thresh), zone, clearance)
        n_in0, n_band0, _ = check_frame(base, zone, clearance)
        flagged = (n_in - n_in0) + (n_band - n_band0) > 0
        res.append((name, flagged, expect))
        print(f'  test box {name}: {"flagged" if flagged else "not flagged"} (expected {"flagged" if expect else "not flagged"})')
    ok = all(f == e for _, f, e in res)
    print('NEGATIVE CONTROL:', 'PASS (checker catches a box in the caption zone)' if ok else 'FAIL')
    return ok


def main():
    pos = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith('--') and sys.argv[i - 1] not in ('--thresh', '--clearance', '--zone', '--scene-starts')]
    fa, fb = load(pos[0]), load(pos[1])
    assert len(fa) == len(fb), 'frame counts differ'
    zone = tuple(int(v) for v in arg('--zone', ','.join(map(str, ZONE))).split(','))
    clearance, thresh = arg('--clearance', CLEARANCE, int), arg('--thresh', 24, int)
    starts = [int(v) for v in arg('--scene-starts', '', str).split(',') if v]
    if '--negative-control' in sys.argv:
        sys.exit(0 if negative_control(fa, fb, zone, clearance, thresh) else 1)
    scene_of = lambda f: max([i for i, s in enumerate(starts) if f >= s], default=0) + 1 if starts else None
    bad, per_scene, lowest = [], {}, None
    for i, (a, b) in enumerate(zip(fa, fb)):
        m = content_mask(np.asarray(Image.open(a).convert('RGB')), np.asarray(Image.open(b).convert('RGB')), thresh)
        n_in, n_band, bb = check_frame(m, zone, clearance)
        if bb:
            bad.append((i, n_in, n_band, bb))
            per_scene.setdefault(scene_of(i), []).append(i)
        # content bottom above the zone, for the report
        ys = np.nonzero(m[:zone[1] - clearance].any(axis=1))[0]
        if len(ys):
            lowest = max(lowest or 0, int(ys.max()))
    print(f'frames decoded (lossless PNG): {len(fa)}; threshold {thresh}/255; zone x {zone[0]}-{zone[2] - 1}, y {zone[1]}-{zone[3] - 1}; '
          f'clearance {clearance}px (content must end by y {zone[1] - clearance - 1})')
    print(f'lowest scene content outside zone + band: y {lowest}')
    print(f'frames with scene content inside the zone or its clearance band: {len(bad)}')
    for s, fr in sorted(per_scene.items(), key=lambda kv: kv[1][0]):
        sub = [b for b in bad if b[0] in set(fr)]
        bx = [min(b[3][0] for b in sub), min(b[3][1] for b in sub), max(b[3][2] for b in sub), max(b[3][3] for b in sub)]
        rs = ', '.join(f'{a}-{b}' if a != b else str(a) for a, b in ranges(fr))
        print(f'  scene {s}: {len(fr)} frames ({rs}); worst frame {max(sub, key=lambda b: b[1] + b[2])[0]} '
              f'({max(b[1] for b in sub)} px in zone, {max(b[2] for b in sub)} px in band); offending bbox x {bx[0]}-{bx[2]}, y {bx[1]}-{bx[3]}')
    if '--expect-fail' in sys.argv:
        ok = len(bad) == len(fa)
        print('RESULT:', 'PASS' if ok else 'FAIL', f'(negative control: expected all {len(fa)} frames flagged, got {len(bad)})')
        sys.exit(0 if ok else 1)
    print('RESULT:', 'PASS' if not bad else 'FAIL')
    sys.exit(1 if bad else 0)


main()
