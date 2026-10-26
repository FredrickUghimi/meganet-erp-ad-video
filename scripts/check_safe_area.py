"""Decodes EVERY frame of the final MP4 and of a backgrounds-only render of the
same composition (`--props='{"mode":"bg"}'`), and flags any pixel whose colour
differs (content = anything that is not background) outside the safe area.

usage: check_safe_area.py final.mp4 bg.mp4 [x0 y0 x1 y1]   (default 80 200 920 1440)
Also verifies that every frame after the voice ends is identical (frozen hold)."""
import subprocess, sys
import numpy as np

W, H = 1080, 1920
THRESH = 40  # per-channel difference that counts as "content" (codec noise is far below this)
final, bg = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = (int(v) for v in sys.argv[3:7]) if len(sys.argv) >= 7 else (80, 200, 920, 1440)


def frames(path):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    size = W * H * 3
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    p.wait()


n = bad = 0
worst = 0
bbox = [W, H, 0, 0]
first_bad = []
prev = None
hold_start = int(sys.argv[7]) if len(sys.argv) >= 8 else None
hold_diffs = []
for i, (a, b) in enumerate(zip(frames(final), frames(bg))):
    n += 1
    mask = (np.abs(a.astype(np.int16) - b.astype(np.int16)).max(axis=2) > THRESH)
    inside = np.zeros_like(mask); inside[y0:y1, x0:x1] = True
    out = int((mask & ~inside).sum())
    if mask.any():
        ys, xs = np.nonzero(mask)
        bbox = [min(bbox[0], xs.min()), min(bbox[1], ys.min()), max(bbox[2], xs.max()), max(bbox[3], ys.max())]
    if out:
        bad += 1; worst = max(worst, out)
        if len(first_bad) < 5: first_bad.append((i, out))
    if hold_start is not None and prev is not None and i > hold_start:
        hold_diffs.append(int(np.abs(a.astype(np.int16) - prev.astype(np.int16)).max()))
    if hold_start is not None and i == hold_start:
        prev = a.copy()
print(f"frames decoded: {n}")
print(f"safe area x {x0}-{x1}, y {y0}-{y1}: frames with content outside = {bad}, worst pixel count = {worst}, first = {first_bad}")
print(f"content bounding box over all frames: x {bbox[0]}-{bbox[2]}, y {bbox[1]}-{bbox[3]}")
if hold_diffs:
    print(f"hold frames compared to frame {hold_start}: {len(hold_diffs)} frames, max pixel diff = {max(hold_diffs)}")
sys.exit(1 if bad else 0)
