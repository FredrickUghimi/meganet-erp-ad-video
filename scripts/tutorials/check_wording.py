#!/usr/bin/env python3
"""Wording gate for the Staff Directory tutorials (project owner's rules, 2026-11-17):
 - no narration, caption or on-screen text claims that an email / invite / link was sent, delivered, received or arrived;
 - nothing about security, encryption or compliance (secure, encrypted, HIPAA, certified, compliant, protected ...).
Scans (1) the approved narration (TUTORIALS in scripts/tutorial_voice.py), (2) the caption words the video renders
(src/tutorialTimings.ts + CHUNKS), (3) every drawn string in src/tutorialFrames.ts and the end card in
src/MegaNetTutorials.tsx, and (4) when textboxes.json files are given, the text of every DOM text node on every rendered frame.
Captured app pixels are covered by construction: the only captured toast in the tutorials is masked after "invited".
A negative control proves the patterns catch the banned claims.
usage: check_wording.py [textboxes.json ...]"""
import ast, json, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DELIVERY = re.compile(r"\b(sent|sends?|sending|deliver\w*|arriv\w*|receiv\w*|inbox|mailed|e-?mailed)\b|password-setup|set their own password|set your own password", re.I)
SECURITY = re.compile(r"\b(secur\w*|encrypt\w*|complian\w*|hipaa|certif\w*|protect\w*|safeguard\w*|gdpr|ndpr|confidential\w*)\b", re.I)
def hits(text): return [m.group(0) for r in (DELIVERY, SECURITY) for m in r.finditer(text)]
fails = []
def scan(label, strings):
    n = 0
    for s in strings:
        n += 1
        h = hits(s)
        if h: fails.append((label, s[:80], h))
    print(f'{label}: {n} strings scanned')
vs = ast.parse(open(os.path.join(root, 'scripts', 'tutorial_voice.py')).read())
TUT = next(ast.literal_eval(n.value) for n in vs.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'TUTORIALS')
scan('approved narration', [s for sc in sum(TUT.values(), []) for s in sc])
t = open(os.path.join(root, 'src', 'tutorialTimings.ts')).read(); T = json.loads(t[t.index('= {', t.index('TIMINGS:')) + 2:t.rindex(';')])
caps = []
for k, v in T.items():
    for s, a, b in v['CHUNKS']: caps.append(' '.join(w['text'] for w in v['SENTENCES'][s]['words'][a:b + 1]))
scan('rendered caption chunks', caps)
f = open(os.path.join(root, 'src', 'tutorialFrames.ts')).read(); F = json.loads(f[f.index('= {', f.index('FRAMES:')) + 2:f.rindex(';')])
drawn = []
for k, v in F.items():
    for fr in v:
        for key in ('title', 'sub', 'head', 'text', 'strip'):
            if fr.get(key): drawn.append(fr[key])
        drawn += fr.get('steps') or []; drawn += fr.get('items') or []
scan('drawn strings (title / steps / roles / dialog / chip labels)', drawn)
tsx = open(os.path.join(root, 'src', 'MegaNetTutorials.tsx')).read()
scan('end card and chips in src/MegaNetTutorials.tsx', re.findall(r'>([A-Za-z+][^<>{}]{2,})<', tsx) + re.findall(r"text=\"([^\"]+)\"", tsx))
for p in sys.argv[1:]:
    rows = json.load(open(p)); seen = set(); n = 0
    for fr, nodes in rows.items():
        for nd in nodes:
            n += 1
            if nd['text'] in seen: continue
            seen.add(nd['text']); h = hits(nd['text'])
            if h: fails.append((os.path.basename(os.path.dirname(os.path.dirname(p))) + ' frame ' + fr, nd['text'][:80], h))
    print(f'rendered DOM text, {p}: {len(rows)} frames, {n} text nodes, {len(seen)} distinct strings scanned')
# negative control: the app's own toast wording and a security claim MUST be caught
ctl = ['Nneka Eze invited — a password-setup email was sent to nneka@demo.example.', 'Your data is securely encrypted and HIPAA compliant.', 'The invite was delivered to their inbox.']
caught = all(hits(c) for c in ctl)
print('NEGATIVE CONTROL (the toast sentence, a security claim and a delivery claim are all caught):', 'PASS' if caught else 'FAIL')
print('matches:', fails if fails else 'none')
print('RESULT:', 'PASS' if caught and not fails else 'FAIL')
sys.exit(0 if caught and not fails else 1)
