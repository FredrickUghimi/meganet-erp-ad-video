#!/usr/bin/env python3
"""Story-order checks for MegaNetPharmacyInteractionAd, from the every-frame text-box log (scripts/pharmacy_textbox_audit.mjs).
 1. The "Mega-Net EHR Cloud" badge and the "Feature: Drug interaction warning" label exist on EVERY frame, starting at frame 0.
 2. The warning (title "Drug interaction warning" inside the prescribing screen, the "Defined interaction pair"/"Severe" chips, the
    CONFIRM gate and the status chips) never appears before the "Save Prescription" button has been pressed; the button is on screen
    first, and the warning box's first frame comes after the press frame.
 3. Warfarin and Aspirin are never on screen without the "Example" tag in the same frame, and never in the narration.
 4. The hook (frames before the feature scene) shows no drug names at all (placeholder bars only).
Negative controls: the same checks are run on a copy of the log with (a) the warning title injected 40 frames early, (b) the Example
tag removed, (c) the badge removed from frame 0; each must be flagged.
usage: verify_story_pharmacy.py textboxes.json pharmacyTimings.ts"""
import copy, json, re, sys
FPS, LEAD = 30, 12
data = {int(k): v for k, v in json.load(open(sys.argv[1])).items()}
t = open(sys.argv[2]).read()
LINES = json.loads(t[t.index('= [') + 2:t.rindex(';')])
wordF = lambda s, w: LEAD + round(LINES[s]['words'][w]['start'] * FPS)
wordEndF = lambda s, w: LEAD + round(LINES[s]['words'][w]['end'] * FPS)
PRESS, WARN = wordEndF(2, 7) + 1, wordF(2, 9) - 1  # the same two moments as EVENTS in the composition
SCENE1, SCENE2 = wordF(1, 0) - 9, wordF(2, 0) - 9
WARN_TEXTS = {'Drug interaction warning', 'Defined interaction pair', 'Severe', 'Type CONFIRM to proceed', 'Confirm — Prescribe Anyway', 'Nothing saved yet', 'Saved'}
texts = lambda d, f: [n['text'] for n in d[f]]


def run(d):
    out = []
    n = len(d)
    for f in range(n):
        tx = texts(d, f)
        if 'Mega-Net EHR Cloud' not in tx or 'Feature: Drug interaction warning' not in tx:
            out.append(f'frame {f}: badge/label missing')
    first_warn = next((f for f in range(n) if WARN_TEXTS & set(texts(d, f))), None)
    first_save = next((f for f in range(n) if 'Save Prescription' in texts(d, f)), None)
    if first_warn is None or first_save is None:
        out.append('no warning or no Save Prescription button found')
    else:
        if first_warn <= PRESS:
            out.append(f'warning text at frame {first_warn}, not after the press ({PRESS})')
        if first_save >= first_warn:
            out.append('Save Prescription not on screen before the warning')
    for f in range(n):
        tx = texts(d, f)
        if ('Warfarin' in tx or 'Aspirin' in tx or 'Warfarin + Aspirin' in tx) and 'Example' not in tx:
            out.append(f'frame {f}: drug name without the Example tag')
        if f < SCENE2 and ('Warfarin' in tx or 'Aspirin' in tx):
            out.append(f'frame {f}: drug name before the prescribing screen')
    return out, first_warn, first_save


bad, first_warn, first_save = run(data)
words = ' '.join(w['text'] for ln in LINES for w in ln['words']).lower()
narr = [w for w in ('warfarin', 'aspirin') if w in words]
print(f'frames {len(data)}; press frame {PRESS} ({PRESS / FPS:.3f}s); Save Prescription first on screen at frame {first_save} ({first_save / FPS:.3f}s); first warning text at frame {first_warn} ({first_warn / FPS:.3f}s)')
print(f'warning appears {first_warn - PRESS} frames ({(first_warn - PRESS) / FPS:.3f}s) after the press')
print('badge + feature label on every frame from frame 0:', 'PASS' if not any('badge' in b for b in bad) else 'FAIL')
print('warning only after the Save Prescription press:', 'PASS' if not any('warning' in b for b in bad) and first_warn > PRESS else 'FAIL')
print('drug names always tagged Example, none in the hook:', 'PASS' if not any('drug name' in b for b in bad) else 'FAIL')
print('Warfarin/Aspirin absent from the narration (TTS word list):', 'PASS' if not narr else f'FAIL {narr}')
ok = not bad and not narr
for b in bad[:10]:
    print('  ', b)
# negative controls
a = copy.deepcopy(data)
for f in range(WARN - 40, WARN - 1):
    a[f].append({'text': 'Drug interaction warning'})
c1 = run(a)[0]
b2 = copy.deepcopy(data)
for f in b2:
    b2[f] = [n for n in b2[f] if n['text'] != 'Example']
c2 = run(b2)[0]
c3d = copy.deepcopy(data)
c3d[0] = [n for n in c3d[0] if n['text'] != 'Mega-Net EHR Cloud']
c3 = run(c3d)[0]
for name, res in [('warning injected 40 frames early', c1), ('Example tag removed', c2), ('badge removed at frame 0', c3)]:
    print(f'negative control, {name}:', 'flagged (check works)' if res else 'NOT flagged (check is blind)')
    ok &= bool(res)
print('RESULT:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
