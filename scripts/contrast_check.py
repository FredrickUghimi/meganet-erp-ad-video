#!/usr/bin/env python3
"""Worst-case contrast of a text colour against the gradient-only render in a region.
usage: contrast_check.py BG.mp4 frame y0 y1 '#text'   (x range 80-920)"""
import subprocess, sys
import numpy as np
W, H = 1080, 1920
path, fr, y0, y1, col = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'select=eq(n\\,{fr})', '-vframes', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
img = np.frombuffer(raw, np.uint8).reshape(H, W, 3)[y0:y1, 80:920].astype(float) / 255
def lum(c):
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
t = np.array([int(col[i:i + 2], 16) for i in (1, 3, 5)]) / 255
lt, lb = lum(t), lum(img)
r = (np.maximum(lt, lb) + 0.05) / (np.minimum(lt, lb) + 0.05)
print(f'frame {fr} y {y0}-{y1} text {col}: min contrast {r.min():.2f}, mean {r.mean():.2f}')
