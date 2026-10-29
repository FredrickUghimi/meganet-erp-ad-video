#!/usr/bin/env python3
"""Reads the output of scripts/ledger_audit.mjs and reports, for every text node on the audited frames:
worst-case WCAG contrast (text colour with its effective opacity vs the pixels behind it, text-less render),
font size (>= 32px), and position (inside the safe area x 80-920, y 200-1440; captions end by y 1360).
usage: ledger_audit.py <audit-dir> [--min-contrast 4.5] [--min-size 32]"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image

d = sys.argv[1]
min_c = float(sys.argv[sys.argv.index('--min-contrast') + 1]) if '--min-contrast' in sys.argv else 4.5
min_s = float(sys.argv[sys.argv.index('--min-size') + 1]) if '--min-size' in sys.argv else 32


def lin(c):
    c = c / 255.0
    return np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lum(rgb):
    rgb = lin(rgb.astype(float))
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


rows, fails = [], 0
for jf in sorted(glob.glob(os.path.join(d, 'audit-*.json')), key=lambda p: int(re.findall(r'(\d+)', os.path.basename(p))[0])):
    fr = int(re.findall(r'(\d+)', os.path.basename(jf))[0])
    img = np.asarray(Image.open(os.path.join(d, f'notext-{fr}.png')).convert('RGB'))
    for it in json.load(open(jf)):
        m = re.match(r'rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)', it['color'])
        col = np.array([float(m.group(i)) for i in (1, 2, 3)])
        alpha = float(m.group(4) or 1) * it['opacity']
        x0, y0, x1, y1 = (int(round(it[k])) for k in ('x0', 'y0', 'x1', 'y1'))
        cx0, cy0, cx1, cy1 = max(x0, 0), max(y0, 0), min(x1, 1080), min(y1, 1920)
        if cx1 <= cx0 or cy1 <= cy0 or alpha < 0.02:
            continue  # off-canvas or invisible at this frame
        bg = img[cy0:cy1, cx0:cx1].reshape(-1, 3).astype(float)
        fg = col * alpha + bg * (1 - alpha)
        l1, l2 = lum(fg), lum(bg)
        ratio = (np.maximum(l1, l2) + 0.05) / (np.minimum(l1, l2) + 0.05)
        cap = y1 > 1100 and y0 > 1150  # caption text sits below the scene content
        ok_pos = x0 >= 80 and x1 <= 920 and y0 >= 200 and y1 <= (1360 if cap else 1440)
        ok = ratio.min() >= min_c and it['size'] >= min_s and ok_pos
        fails += not ok
        rows.append((fr, it['text'][:30], it['size'], round(float(ratio.min()), 2), ok_pos, ok))
print(f'{"frame":>5} {"text":<31} {"px":>4} {"min contrast":>12} {"in safe":>7}')
for r in rows:
    print(f'{r[0]:>5} {r[1]:<31} {r[2]:>4.0f} {r[3]:>12} {str(r[4]):>7} {"" if r[5] else "  <-- FAIL"}')
print(f'text nodes audited: {len(rows)}; smallest font {min(r[2] for r in rows):.0f}px; lowest contrast {min(r[3] for r in rows)}; failures: {fails}')
print('RESULT:', 'PASS' if fails == 0 else 'FAIL')
sys.exit(1 if fails else 0)
