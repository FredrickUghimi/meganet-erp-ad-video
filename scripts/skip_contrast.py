#!/usr/bin/env python3
"""Contrast / size / position report for MegaNetNursesBaySkipAd from the output of scripts/skip_audit.mjs.
For every text node on every audited settled frame: WCAG contrast of the text colour (with its effective opacity)
against EVERY pixel behind its box in the text-less render (worst pixel = minimum), font size, and position (safe area
x 80-920, y 200-1440; captions end by y 1280; scene text by y 1095). One line per distinct text+colour (worst case over frames), then the totals.
usage: skip_contrast.py <audit-dir> [--min-contrast 4.5] [--min-size 32]"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image

d = sys.argv[1]
min_c = float(sys.argv[sys.argv.index('--min-contrast') + 1]) if '--min-contrast' in sys.argv else 4.5
min_s = float(sys.argv[sys.argv.index('--min-size') + 1]) if '--min-size' in sys.argv else 32
only = sys.argv[sys.argv.index('--only') + 1].rsplit(':', 1) if '--only' in sys.argv else None  # TEXT:#RRGGBB, judge only that text node (e.g. the dimmed row's number)


def lin(c):
    c = c / 255.0
    return np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lum(rgb):
    rgb = lin(rgb.astype(float))
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


hexc = lambda c: '#%02X%02X%02X' % tuple(int(round(v)) for v in c)
best = {}  # (text, colour) -> worst record
nodes, fails = 0, 0
seen, measured, excluded = set(), set(), 0
for jf in sorted(glob.glob(os.path.join(d, 'audit-*.json')), key=lambda p: int(re.findall(r'(\d+)', os.path.basename(p))[0])):
    fr = int(re.findall(r'(\d+)', os.path.basename(jf))[0])
    img = np.asarray(Image.open(os.path.join(d, f'notext-{fr}.png')).convert('RGB'))
    for it in json.load(open(jf)):
        m = re.match(r'rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)', it['color'])
        col = np.array([float(m.group(i)) for i in (1, 2, 3)])
        alpha = float(m.group(4) or 1) * it['opacity']
        if only and not (it['text'] == only[0] and hexc(col) == only[1].upper()):
            continue
        x0, y0, x1, y1 = (int(round(it[k])) for k in ('x0', 'y0', 'x1', 'y1'))
        cx0, cy0, cx1, cy1 = max(x0, 0), max(y0, 0), min(x1, 1080), min(y1, 1920)
        if cx1 <= cx0 or cy1 <= cy0 or alpha < 0.02:
            continue  # off-canvas or invisible at this frame
        key0 = (it['text'][:34], hexc(col))
        seen.add(key0)
        if alpha < 0.99:
            excluded += 1  # mid-entry or mid-exit fade (STYLE_GUIDE.md section 2: transient, not part of the contrast check)
            continue
        measured.add(key0)
        bg = img[cy0:cy1, cx0:cx1].reshape(-1, 3).astype(float)
        fg = col * alpha + bg * (1 - alpha)
        l1, l2 = lum(fg), lum(bg)
        ratio = (np.maximum(l1, l2) + 0.05) / (np.minimum(l1, l2) + 0.05)
        k = int(ratio.argmin())
        cap = y0 > 1110  # caption text sits below the scene content (scene content ends by y 1095)
        ok_pos = x0 >= 80 and x1 <= 920 and y0 >= 200 and y1 <= (1280 if cap else 1095)
        r = float(ratio.min())
        # A non-caption text node whose box crosses the safe-area edge while its tile is still sliding in is clipped by the
        # scene's safe-area clip box, so its overflowing part is not visible (scripts/verify_safe_area_skip.py proves no
        # visible pixel leaves the box on every frame). Its contrast and size are still enforced; only the box-position rule
        # is waived, and it is listed as 'clipped mid-slide'.
        clipped = False  # no waiver: every text box must be inside the safe area
        ok = r >= min_c and it['size'] >= min_s and (ok_pos or clipped)
        nodes += 1
        fails += not ok
        key = (it['text'][:34], hexc(col))
        rec = dict(text=it['text'][:34], fg=hexc(col), bg=hexc(bg[k]), size=it['size'], weight=it['weight'], ratio=r, frame=fr, pos=ok_pos, ok=ok, cap=cap, clipped=clipped and not ok_pos)
        if key not in best or r < best[key]['ratio']:
            best[key] = rec
print(f'{"text":<35} {"text colour":<9} {"worst bg pixel":<9} {"px":>3} {"wt":>4} {"contrast":>8}  {"frame":>5} {"in safe":>7}')
for rec in sorted(best.values(), key=lambda r: r['ratio']):
    print(f'{rec["text"]:<35} {rec["fg"]:<9} {rec["bg"]:<14} {rec["size"]:>3.0f} {rec["weight"]:>4} {rec["ratio"]:>8.2f}  {rec["frame"]:>5} {("clipped" if rec["clipped"] else str(rec["pos"])):>7}{"" if rec["ok"] else "  <-- FAIL"}')
rs = list(best.values())
print(f'distinct text+colour pairs: {len(rs)}; text-node samples audited: {nodes}; smallest font {min(r["size"] for r in rs):.0f}px; lowest contrast {min(r["ratio"] for r in rs):.2f}:1; failing samples: {fails}')
never = sorted(seen - measured)
print(f'text-node samples excluded as mid-fade (opacity < 0.99): {excluded}; distinct text+colour pairs seen: {len(seen)}, measured fully settled at least once: {len(measured)}')
if never:
    print('NEVER MEASURED SETTLED (every text must be measured fully opaque at least once):', never[:20])
    fails += len(never)
print('RESULT:', 'PASS' if fails == 0 else 'FAIL')
sys.exit(1 if fails else 0)
