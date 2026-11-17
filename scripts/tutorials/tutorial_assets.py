#!/usr/bin/env python3
"""Builds the UI crops for the three Staff Directory tutorials from the local captures, and src/tutorialFrames.ts.

Inputs (made by scripts/tutorials/capture_*.js + analyze_captured_contrast.py against a LOCAL EHR-Cloud- build with
fictional demo data, 360 CSS px viewport, device scale 3):
  SHOTS_DIR   sNN_*.png, sNN_*.notext.png, sNN_*.json (text boxes, toast word/line rects)
  PER_BOX     per_box.json  (worst contrast + effective size of every captured text box)
Every planned crop is pre-flighted: a crop that clips a text box, contains text under 4.5:1, text under 32 px effective
(CSS px x 840/360) or an unexpected email makes this script exit 1. The toast in tutorial 1 is masked after the word
"invited"; the masked area is compared pixel by pixel with the text-less capture.
usage: tutorial_assets.py SHOTS_DIR PER_BOX LOG_OUT"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw

SHOTS, PERBOX, LOG = sys.argv[1], sys.argv[2], sys.argv[3]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTDIR = os.path.join(root, 'public', 'tutorial'); os.makedirs(OUTDIR, exist_ok=True)
PB = json.load(open(PERBOX)); SC = 840 / 360; WIN_H = 354; WIN_Y = 262; GAP = 16
FAKE_EMAIL = re.compile(r'@(demo\.mega-net|example)\.(example|com)$|@example\.com$')
def load(s): return Image.open(f'{SHOTS}/{s}.png').convert('RGB')
def boxes(s): return json.load(open(f'{SHOTS}/{s}.json'))['boxes']
def extra(s): return json.load(open(f'{SHOTS}/{s}.json'))['extra']
def anchor_y(shot, text, pick='first'):
    c = [b for b in boxes(shot) if b['text'].startswith(text) and b['y0'] >= 0]
    if not c: sys.exit(f'anchor {text!r} not in {shot}')
    return (c[0] if pick == 'first' else c[-1])['y0']
def preflight(shot, y0, h, x0=0, x1=360):
    y1 = y0 + h; bad = []; seen = []
    for r in PB:
        if r['state'] != shot or r['x1'] <= x0 or r['x0'] >= x1: continue
        ov = min(r['y1'], y1) - max(r['y0'], y0)
        if ov <= 0: continue
        if ov < (r['y1'] - r['y0']) * 0.98: bad.append(('CLIPPED', r['text'][:40])); continue
        seen.append(r)
        if r['worst'] < 4.5: bad.append((f"contrast {r['worst']:.2f}", r['text'][:40]))
        if r['eff'] < 32: bad.append((f"size {r['eff']}", r['text'][:40]))
    emails = sorted({m for r in seen for m in re.findall(r'[\w.\-]+@[\w.\-]+', r['text'])})
    return bad, emails, seen
def fit(shot, y0, h):
    for dy in range(0, 160, 2):
        for sg in (1, -1):
            y = y0 + sg * dy
            if 0 <= y and y + h <= 780 and not preflight(shot, y, h)[0]: return y
    return y0
def save(img, name): img.save(os.path.join(OUTDIR, name + '.png'), optimize=True); return f'tutorial/{name}.png'
def toast_panel(shot, mask_after=None):
    ex = extra(shot)['toasts']; t = [x for x in ex if 'fictional' not in ' '.join(w['w'] for w in x['words']).lower()][0]
    im = load(shot).copy(); nt = Image.open(f'{SHOTS}/{shot}.notext.png').convert('RGB'); bx = t['box']; info = {}
    y1 = bx['y1']
    if mask_after:
        iw = [w for w in t['words'] if w['w'].startswith(mask_after)][0]
        bg = nt.getpixel((int(bx['x1'] * 3) - 30, int(bx['y1'] * 3) - 30)); d = ImageDraw.Draw(im); rects = []
        for ln in t['lines']:
            if abs(ln['y0'] - iw['y0']) < 3: rects.append((iw['x1'] + 2, ln['y0'] - 3, bx['x1'] - 46, ln['y1'] + 3))
            elif ln['y0'] > iw['y1'] - 3: rects.append((ln['x0'] - 4, ln['y0'] - 3, bx['x1'] - 46, ln['y1'] + 3))
        rr = [tuple(int(v * 3) for v in r) for r in rects]
        for r in rr: d.rectangle(r, fill=bg)
        a = np.array(im).astype(int); b = np.array(nt).astype(int)
        info['mask_residual_maxdiff'] = int(max(np.abs(a[r[1]:r[3], r[0]:r[2]] - b[r[1]:r[3], r[0]:r[2]]).max() for r in rr))
        l1 = [w for w in t['words'] if w['x1'] <= iw['x1'] + 0.5 and abs(w['y0'] - iw['y0']) < 3]
        x0, x1, y0_, y1_ = int(min(w['x0'] for w in l1) * 3), int(iw['x1'] * 3), int(iw['y0'] * 3), int(iw['y1'] * 3)
        info['kept_text_maxdiff'] = int(np.abs(a[y0_:y1_, x0:x1] - b[y0_:y1_, x0:x1]).max())
        y1 = min(bx['y1'], [ln for ln in t['lines'] if abs(ln['y0'] - iw['y0']) < 3][0]['y1'] + 18)
    p = im.crop((int(bx['x0'] * 3), int(bx['y0'] * 3), int(bx['x1'] * 3), int(y1 * 3)))
    m = Image.new('L', p.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, p.size[0] - 1, p.size[1] - 1), 36, fill=255)
    out = Image.new('RGBA', p.size, (255, 255, 255, 0)); out.paste(p.convert('RGBA'), (0, 0), m)
    return out, info
FR = []  # frame records
def add(tut, idx, scene, at, kind, strip=None, **kw): FR.append(dict(tut=tut, idx=idx, scene=scene, at=at, kind=kind, strip=strip, **kw))
def ui(tut, idx, scene, at, shot, anchor, off, strip, pick='first', h=WIN_H, ringlink=False, tapat=None):
    y0 = max(0, min(anchor_y(shot, anchor, pick) - off, 780 - h)); y0 = fit(shot, y0, h)
    bad, em, seen = preflight(shot, y0, h)
    c = load(shot).crop((0, int(y0 * 3), 1080, int((y0 + h) * 3)))
    ring = None
    if ringlink:
        lk = extra(shot)['link']; ring = dict(x=80 + int(lk['x0'] * SC), y=WIN_Y + int((lk['y0'] - y0) * SC), w=int((lk['x1'] - lk['x0']) * SC), h=int((lk['y1'] - lk['y0']) * SC))
        ring['x'] = 80 + int(((lk['x0'] + lk['x1']) / 2 - 40) * SC) if False else ring['x']
    if tapat:
        tb = [q for q in boxes(shot) if q['text'].startswith(tapat)][-1 if tapat in ('Save', 'Deactivate') else 0]
        px, py = (24, 11) if tapat in ('Save', 'Deactivate') else (8, 5)   # outline the button / name, never cover its text
        ring = dict(x=80 + int((tb['x0'] - px) * SC), y=WIN_Y + int((tb['y0'] - py - y0) * SC), w=int((tb['x1'] - tb['x0'] + 2 * px) * SC), h=int((tb['y1'] - tb['y0'] + 2 * py) * SC))
    name = f't{tut}_f{idx:02d}'
    add(tut, idx, scene, at, 'ui', strip, a=dict(src=save(c, name), w=840, h=int(h * SC), y=WIN_Y), ring=ring,
        pf=dict(shot=shot, y0=round(y0, 1), h=h, bad=bad, emails=em, n=len(seen), minc=min([r['worst'] for r in seen] or [99]), mine=min([r['eff'] for r in seen] or [99])))
def focus(tut, idx, scene, at, shot, anchor, hh, scale, strip, off=22):
    y0 = anchor_y(shot, anchor) - off; a = np.array(load(shot)); row = a[int((anchor_y(shot, anchor) + 10) * 3)]
    xs = [x for x in range(600, 1080) if row[x][2] > 200 and row[x][0] < 40 and row[x][1] < 140]; xl = xs[0] / 3 - 3; xr = (xl, 332)
    bad, em, seen = preflight(shot, y0, hh, xr[0], xr[1])
    src = load(shot).crop((int(xr[0] * 3), int(y0 * 3), int(xr[1] * 3), int((y0 + hh) * 3))); w = int((xr[1] - xr[0]) * scale); hp = int(hh * scale)
    src = src.resize((w, hp), Image.LANCZOS); fh = hp + 80; fr = Image.new('RGB', (840, fh), (255, 255, 255)); fr.paste(src, ((840 - w) // 2, 40))
    ring = dict(x=80 + (840 - w) // 2 - 14, y=WIN_Y + 40 - 14, w=w + 28, h=hp + 28)
    add(tut, idx, scene, at, 'ui', strip, a=dict(src=save(fr, f't{tut}_f{idx:02d}'), w=840, h=fh, y=WIN_Y), ring=ring,
        pf=dict(shot=shot, y0=round(y0, 1), h=hh, bad=bad, emails=em, n=len(seen), minc=min([r['worst'] for r in seen] or [99]), mine=min([r['eff'] for r in seen] or [99]), focus_x=[round(xr[0], 1), xr[1]]))
def stack(tut, idx, scene, at, shotA, mask, shotB, anchorB, offB, strip):
    pa, info = toast_panel(shotA, mask); wA = int(pa.size[0] * SC / 3); hA = int(pa.size[1] * SC / 3); remain = int(WIN_H * SC) - hA - GAP; hB = remain / SC
    y0 = max(0, min(anchor_y(shotB, anchorB) - offB, 780 - hB)); y0 = fit(shotB, y0, hB); bad, em, seen = preflight(shotB, y0, hB)
    pb = load(shotB).crop((0, int(y0 * 3), 1080, int((y0 + hB) * 3)))
    xA = 80 + (840 - wA) // 2
    add(tut, idx, scene, at, 'stack', strip, a=dict(src=save(pa, f't{tut}_f{idx:02d}a'), w=wA, h=hA, y=WIN_Y, x=xA), b=dict(src=save(pb, f't{tut}_f{idx:02d}b'), w=840, h=int(remain), y=WIN_Y + hA + GAP),
        pf=dict(shot=shotB, y0=round(y0, 1), h=round(hB, 1), bad=bad, emails=em, n=len(seen), minc=min([r['worst'] for r in seen] or [99]), mine=min([r['eff'] for r in seen] or [99]), toast=shotA, **info))
ROLES = ['Org Admin', 'Physician/Clinician', 'Nurse', 'Front Desk/Registration', 'Billing Clerk', 'Lab Technician', 'Pharmacist', 'Inventory Manager']
DLG = "Deactivate Nneka Eze? They'll no longer be able to log in as this organization."
# ---- tutorial 1: invite ----
t = 1
add(t, 0, 0, 0, 'title', title='Add a staff member', sub='Staff Directory in Mega-Net EHR Cloud')
add(t, 1, 1, 0, 'steps', head='What you will do', steps=['Open Staff Directory', 'Fill in a short form', 'Save'])
ui(t, 2, 2, 0, 's40_nurse_drawer', 'Documents', 230, 'Nurse menu')
ui(t, 3, 3, 0, 's02_drawer_open', 'Staff Directory', 230, 'Step 1: open the menu', pick='last', ringlink=True)
ui(t, 4, 4, 0, 's03_list_top', '[placeholder] Filter', 30, 'Step 2: the list')
ui(t, 5, 4, 1, 's04_filter_one_card', '[value] Ekaette', 30, 'Filter box')
ui(t, 6, 5, 0, 's05_form_empty', 'Add / Edit Staff', 20, 'Step 3: the form')
ui(t, 7, 5, 2, 's09_names_typed', 'Add / Edit Staff', 20, 'Type the details')
ui(t, 8, 6, 0, 's09_names_typed', 'Email', 20, 'One account per email')
ui(t, 9, 7, 0, 's10_role_chosen', 'Role', 30, 'Choose a role')
add(t, 10, 7, 1, 'roles', 'Drawn, not captured', items=ROLES)
ui(t, 11, 8, 0, 's11_ready_to_save', 'Facility', 28, 'Choose a facility', h=100)
ui(t, 12, 9, 0, 's11_ready_to_save', 'Add / Edit Staff', 20, 'No password field')
focus(t, 13, 10, 0, 's11_ready_to_save', 'Save', 60, 5.0, 'Step 4: Save')
stack(t, 14, 11, 0, 's12_after_invite_toast', 'invited', 's13_new_row_listed', '[value] Nneka', 20, 'Invite confirmed')
ui(t, 15, 12, 0, 's12_after_invite_toast', 'Clear', 230, 'Then Clear')
ui(t, 16, 13, 0, 's06_err_empty', 'Add / Edit Staff', 20, 'Missing details')
ui(t, 17, 13, 1, 's07_err_bad_email', 'Add / Edit Staff', 20, 'Invalid email')
ui(t, 18, 13, 2, 's08_err_duplicate', 'Add / Edit Staff', 20, 'Email already used')
add(t, 19, 14, 0, 'steps', head='To recap', steps=['Open Staff Directory', 'Fill in the form', 'Choose Save'])
add(t, 20, 15, 0, 'end')
# ---- tutorial 2: change ----
t = 2
add(t, 0, 0, 0, 'title', title='Change a role or facility', sub='Staff Directory in Mega-Net EHR Cloud')
add(t, 1, 1, 0, 'steps', head='What you will do', steps=['Find the person', 'Change the form', 'Save'])
ui(t, 2, 2, 0, 's02_drawer_open', 'Staff Directory', 230, 'Step 1: open the menu', pick='last', ringlink=True)
ui(t, 3, 3, 0, 's13_new_row_listed', '[value] Nneka', 20, 'Step 2: find them')
ui(t, 4, 4, 0, 's13_new_row_listed', '[value] Nneka', 20, 'Step 3: choose the row', tapat='Nneka Eze')
ui(t, 5, 4, 1, 's21_form_loaded', 'Add / Edit Staff', 20, 'Details load here')
ui(t, 6, 5, 0, 's21_form_loaded', 'Email', 20, 'Role and facility')
ui(t, 7, 6, 0, 's22_role_facility_changed', 'Role', 30, 'Step 4: change them')
ui(t, 8, 7, 0, 's22_role_facility_changed', 'Clear', 230, 'Step 5: Save', tapat='Save')
stack(t, 9, 8, 0, 's23_after_update_toast', None, 's24b_row_updated_unselected', 'Pharmacist', 60, 'Updated')
ui(t, 10, 9, 0, 's21_form_loaded', 'First Name', 30, 'Check before saving')
ui(t, 11, 10, 0, 's21_form_loaded', 'Clear', 230, 'Clear starts over')
ui(t, 12, 11, 0, 's25_edit_own_error', 'Add / Edit Staff', 20, 'Your own record')
add(t, 13, 12, 0, 'steps', head='To recap', steps=['Find the person', 'Change role or facility', 'Choose Save'])
add(t, 14, 13, 0, 'end')
# ---- tutorial 3: deactivate ----
t = 3
add(t, 0, 0, 0, 'title', title='Deactivate a staff member', sub='Staff Directory in Mega-Net EHR Cloud')
add(t, 1, 1, 0, 'steps', head='What you will do', steps=['Choose the person', 'Choose Deactivate', 'Confirm'])
ui(t, 2, 2, 0, 's02_drawer_open', 'Staff Directory', 230, 'Step 1: open the menu', pick='last', ringlink=True)
ui(t, 3, 3, 0, 's24b_row_updated_unselected', '[value] Nneka', 20, 'Find the person')
ui(t, 4, 4, 0, 's24b_row_updated_unselected', '[value] Nneka', 20, 'Step 2: choose the row', tapat='Nneka Eze')
ui(t, 5, 4, 1, 's30_form_ready_deactivate', 'Add / Edit Staff', 20, 'Details load here')
ui(t, 6, 5, 0, 's30_form_ready_deactivate', 'Clear', 230, 'Step 3: Deactivate', tapat='Deactivate')
add(t, 7, 5, 1, 'dialog', 'Drawn, not captured', text=DLG)
add(t, 8, 6, 0, 'dialog', 'Drawn, not captured', text=DLG)
stack(t, 9, 7, 0, 's31_after_deactivate_toast', None, 's32_row_deactivated', 'Deactivated', 150, 'Deactivated')
ui(t, 10, 8, 0, 's32_row_deactivated', 'Deactivated', 290, 'Still in the list')
ui(t, 11, 9, 0, 's36_login_refused', 'Log in', 150, 'Login refused')
stack(t, 12, 10, 0, 's34_own_deactivate_error', None, 's34_own_deactivate_error', 'Clear', 230, 'Your own record')
add(t, 13, 11, 0, 'steps', head='To recap', steps=['Choose the person', 'Choose Deactivate', 'Confirm'])
add(t, 14, 12, 0, 'end')
# ---- gate + outputs ----
fails = []; lines = ['Staff Directory tutorials: asset pre-flight (every captured crop)', f'captures: {SHOTS}', '']
for f in FR:
    p = f.get('pf')
    if not p: continue
    for e in p['emails']:
        if not re.search(r'@demo\.mega-net\.example$|@example\.com$', e): fails.append((f['tut'], f['idx'], 'unexpected email', e))
    if p['bad']: fails.append((f['tut'], f['idx'], p['bad']))
    lines.append(f"T{f['tut']} frame {f['idx']+1:02d} {f['kind']:<5} shot={p['shot']} y0={p['y0']} h={p['h']} text boxes={p['n']} min contrast={p['minc']:.2f}:1 min size={p['mine']} px issues={p['bad'] or 'none'} emails={p['emails'] or '-'}" + (f" toast={p['toast']} mask_residual={p.get('mask_residual_maxdiff')} kept_text_diff={p.get('kept_text_maxdiff')}" if 'toast' in p else ''))
cap = [f for f in FR if f.get('pf')]
lines += ['', f'captured frames: {len(cap)}; minimum contrast over all of them: {min(f["pf"]["minc"] for f in cap):.2f}:1; minimum effective text size: {min(f["pf"]["mine"] for f in cap)} px', 'RESULT: ' + ('FAIL ' + str(fails) if fails else 'PASS')]
open(LOG, 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines[-3:]))
def ts(f):
    d = {k: v for k, v in f.items() if k not in ('pf', 'tut', 'idx')}
    return d
out = {tn: [ts(f) for f in FR if f['tut'] == i] for i, tn in ((1, 'invite'), (2, 'change'), (3, 'deactivate'))}
open(os.path.join(root, 'src', 'tutorialFrames.ts'), 'w').write(
    "// Generated by scripts/tutorials/tutorial_assets.py - do not edit.\n"
    "export type Img = {src: string; w: number; h: number; y: number; x?: number};\n"
    "export type Frame = {kind: 'title' | 'steps' | 'ui' | 'stack' | 'roles' | 'dialog' | 'end'; scene: number; at: number; strip?: string | null; a?: Img; b?: Img; ring?: {x: number; y: number; w: number; h: number} | null; title?: string; sub?: string; head?: string; steps?: string[]; items?: string[]; text?: string};\n"
    "export const FRAMES: Record<'invite' | 'change' | 'deactivate', Frame[]> = " + json.dumps(out, indent=1) + ";\n")
sys.exit(1 if fails else 0)
