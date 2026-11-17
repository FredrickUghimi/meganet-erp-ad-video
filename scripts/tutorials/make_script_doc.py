#!/usr/bin/env python3
"""Builds TUTORIAL_STAFF_DIRECTORY_SCRIPT.md (scripts, captions, screens, claim map, verification) from the generated files:
src/tutorialTimings.ts (real Ezinne timings + caption chunks), src/tutorialFrames.ts, out/tutorials-verification/*.
usage: python3 scripts/tutorials/make_script_doc.py"""
import json, os, re
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(root)
LEAD, HOLD, CAPD = 0.4, 2.0, 2 / 30
def obj(path, name):
    t = open(path).read(); i = t.index('= {', t.index(name + ':')) + 2; return json.loads(t[i:t.rindex(';')])
TIM = obj('src/tutorialTimings.ts', 'TIMINGS'); FRM = obj('src/tutorialFrames.ts', 'FRAMES')
NAMES = {'invite': 'Tutorial 1: invite a staff member', 'change': 'Tutorial 2: change a role or facility', 'deactivate': 'Tutorial 3: deactivate a staff member'}
COMP = {'invite': 'MegaNetTutorialInvite', 'change': 'MegaNetTutorialChange', 'deactivate': 'MegaNetTutorialDeactivate'}
CLAIMS={
'invite':{
0:("You need the Org Admin role","foundation/migrations/0012_seed_staff_management_permission.py:16-18; api/staff_directory.py:78-79","local: nurse got 403 + no menu link; org_admin worked. Code: only org_admin granted"),
2:("Other roles do not see Staff Directory in the menu","frontend/src/layouts/Sidebar.jsx:632-642; foundation/views.py:1364-1366","local: nurse drawer has no such item (s40). Other 6 roles: code-read only, not each tested"),
3:("Open the menu, choose Staff Directory","Sidebar.jsx:632-642; App.jsx:269","local: link opens /app/front-office/staff-directory"),
4:("List shows everyone in the organization with role, facility, status; filter box","api/staff_directory.py:59-63; StaffDirectory.jsx:42-46,108-116,163","local: 8 demo staff listed, filter 'Ekaette' left one card. No sort claim (table header is hidden at 360px)"),
5:("Add or Edit Staff form; asterisk = required; first/last name, email","StaffDirectory.jsx:217,220-241; api/staff_directory.py:101-107","local: labels 'First Name *' etc.; empty Save lists every missing field"),
6:("Each email can belong to only one account","api/staff_directory.py:112-117","local: duplicate email refused with the message shown in scene 13"),
7:("Role list (8 roles)","foundation/models.py:363-373; foundation/views.py:810","local: dropdown options read from the page. Narration shortens 'Physician/Clinician' and 'Front Desk/Registration' (drawn list shows exact labels)"),
8:("Facility from the organization's list","api/staff_directory.py:58,109-110; StaffDirectory.jsx:250-262","local: 2 demo facilities listed"),
9:("No password field; you never choose or see a password","StaffDirectory.jsx:220-262; api/staff_directory.py:144","local: 0 password inputs on the form. Says nothing about how the person gets access"),
10:("Choose Save","StaffDirectory.jsx:70-87,270","local"),
11:("A message confirms the invite; the person appears in the list","StaffDirectory.jsx:79-80; api/staff_directory.py:163-168","local: toast shows 'Nneka Eze invited' (rest masked, residual 0); new row listed. NO email claim: delivery unverified"),
12:("Form keeps their details; Clear first to add someone else","StaffDirectory.jsx:81,56-59","local: form kept the new person's details; Clear emptied it"),
13:("Save tells you what to fix; invalid email; email already used","api/staff_directory.py:101-123","local: all three messages observed, text on screen is the app's own"),
},
'change':{
0:("You need the Org Admin role","as T1 scene 0",""),
2:("Open the menu, choose Staff Directory","Sidebar.jsx:632-642","local"),
3:("Filter box","StaffDirectory.jsx:42-46,163","local"),
4:("Choose an Active person's row; details load into the form","StaffDirectory.jsx:48-54,202","local. Row shown BEFORE selection (selected-row styling clips text at 360px). Deactivated people not taught (Save would silently reactivate them: api/staff_directory.py:138)"),
5:("Form shows first name, last name, email, role, facility","StaffDirectory.jsx:48-54,220-262","local"),
6:("Change role, facility or both; facility = the site they are assigned to","api/staff_directory.py:136-137; foundation/permissions.py:211-222","local: Nurse->Pharmacist, Annex->Main Campus saved. 'Assigned to' is an interpretation of Membership.facility. NO claim about what the new role can do (not tested)"),
7:("Choose Save","StaffDirectory.jsx:70-87","local"),
8:("Message confirms update; row shows new role and facility","api/staff_directory.py:163-167; StaffDirectory.jsx:61-68","local: toast 'Nneka Eze updated.'; row showed Pharmacist / Main Campus"),
9:("Save also writes name and email exactly as in the form","api/staff_directory.py:131-135","code-read (the save overwrites both from the form); not separately tested"),
10:("Clear starts over without saving","StaffDirectory.jsx:56-59","local: Clear emptied the form"),
11:("You cannot change your own record here","api/staff_directory.py:119-120","local: 'You can't manage your own staff record from this screen.'"),
},
'deactivate':{
0:("You need the Org Admin role","as T1 scene 0",""),
3:("Filter box","StaffDirectory.jsx:42-46","local"),
4:("Choose the row; details load","StaffDirectory.jsx:48-54","local (row shown before selection)"),
5:("Choose Deactivate; the app asks you to confirm","StaffDirectory.jsx:89-92","local: confirm text 'Deactivate Nneka Eze? They'll no longer be able to log in as this organization.' DRAWN, not captured (native dialog)"),
6:("Cancel changes nothing; OK goes ahead","StaffDirectory.jsx:92","local, Chromium: Cancel -> 0 deactivate requests and row stayed ACTIVE. Button wording in other browsers not tested"),
7:("Message confirms; status changes to Deactivated","StaffDirectory.jsx:95-98; api/staff_directory.py:189-197","local: toast 'Nneka Eze deactivated.'; badge DEACTIVATED"),
8:("Removes their access to this organization; nothing is deleted; person stays in the list","api/staff_directory.py:189-190; foundation/views.py:176; foundation/permissions.py:247","local: row stays; new login refused; an open session lost access at once (403 on a pharmacy API). Wording is the approved sentence"),
9:("A deactivated person logging in with that role is refused","foundation/views.py:176-190","local: real login page shows 'Your credentials are correct, but that role isn't available for this account. Please select the correct role and try again.'"),
10:("Deactivate works only after choosing a person; cannot deactivate yourself","StaffDirectory.jsx:267; api/staff_directory.py:186-187","local: button disabled with no row (NOT shown: 2.48:1); own-row toast 'Couldn't deactivate this staff member.' + 'You can't deactivate your own staff record from this screen.'"),
}}

PF = {}
pf = open('out/tutorials-verification/assets-preflight.txt').read() if os.path.exists('out/tutorials-verification/assets-preflight.txt') else ''
for m in re.finditer(r'^T(\d) frame (\d+) (\w+)\s+shot=(\S+) y0=(\S+) h=(\S+) text boxes=(\d+) min contrast=([\d.]+):1 min size=([\d.]+) px issues=(.*?) emails=(.*)$', pf, re.M):
    PF[(int(m.group(1)), int(m.group(2)) - 1)] = m.groups()
def vfile(key, name):
    p = f'out/tutorials-verification/{key}/{name}'
    return open(p).read() if os.path.exists(p) else ''
out = []; P = out.append
P(open('scripts/tutorials/script_doc_head.md').read())
for ti, key in enumerate(['invite', 'change', 'deactivate'], 1):
    T = TIM[key]; S = T['SENTENCES']; F = FRM[key]
    scenes = sorted({s['scene'] for s in S}); n = len(S); wc = sum(len(s['words']) for s in S); end = T['VOICE_END']
    total = LEAD + end + HOLD
    P(f"\n## {NAMES[key]}\n")
    P(f"Composition `{COMP[key]}` (`src/MegaNetTutorials.tsx`); render: `npm run render:tutorial-{key}`. Voice ends {end:.2f} s; video length {total:.2f} s (0.4 s lead-in + voice + 2 s hold); {wc} words, {n} sentences, {len(scenes)} narration scenes. Target 60-120 s: **{'OK' if 60 <= total <= 120 else 'OUT OF RANGE'}**.\n")
    for sc in scenes:
        ss = [s for s in S if s['scene'] == sc]; st = ss[0]['start'] + LEAD
        nxt = [s for s in S if s['scene'] == sc + 1]; en = (nxt[0]['start'] + LEAD) if nxt else total
        P(f"\n### Scene {sc + 1}  ({st:.2f}-{en:.2f} s)\n"); P('**Narration:**\n')
        for s in ss: P(f"- [{s['start'] + LEAD:.2f}-{s['end'] + LEAD:.2f}] {s['text']}")
        P('\n**Captions** (word for word; on/off in video seconds, on = first word + 2 frames):\n')
        for si, s in enumerate(S):
            if s['scene'] != sc: continue
            ch = [c for c in T['CHUNKS'] if c[0] == si]
            for k, (_, a, b) in enumerate(ch):
                on = s['words'][a]['start'] + LEAD + CAPD
                off = (s['words'][ch[k + 1][1]]['start'] + LEAD + CAPD) if k + 1 < len(ch) else s['end'] + LEAD + CAPD
                P(f"- {on:.2f}-{off:.2f}  `{' '.join(w['text'] for w in s['words'][a:b + 1])}`")
        P('\n**Screens:**\n')
        for i, fr in enumerate(F):
            if fr['scene'] != sc: continue
            first = next(j for j, s in enumerate(S) if s['scene'] == sc); cue = S[first + fr['at']]['start'] + LEAD
            p = PF.get((ti, i))
            what = f"capture `{p[3]}` (crop y {p[4]} css px, window h {p[5]}; {p[6]} text boxes, min contrast {p[7]}:1, min size {p[8]} px, issues {p[9]})" if p else ('drawn (' + fr['kind'] + ', no capture)')
            P(f"- frame {i + 1} `{fr['kind']}`{' [' + fr['strip'] + ']' if fr.get('strip') else ''} from {cue:.2f} s: {what}")
        c = CLAIMS[key].get(sc)
        if c: P(f"\n**Claim:** {c[0]}.  \n**Evidence:** {c[1]}  \n**Status:** {c[2]}")
    P(f"\n### {NAMES[key]}: verification (local renders only)\n")
    for name, title in [('safe-area.txt', 'safe area, every frame, lossless'), ('caption-zone.txt', 'caption zone, every frame'), ('captions.txt', 'captions: text, rendered text, geometry, timing'), ('textboxes.txt', 'text boxes, every frame'), ('contrast.txt', 'contrast and size of drawn text')]:
        txt = vfile(key, name)
        if not txt: continue
        keep = [l for l in txt.splitlines() if re.search(r'RESULT|PASS|FAIL|NEGATIVE|frames|worst|lowest|violating|content bbox|failing|within 0.1s', l)]
        P(f"**{title}** (`out/tutorials-verification/{key}/{name}`):\n"); P('```'); P('\n'.join(keep[:30])); P('```')
open('TUTORIAL_STAFF_DIRECTORY_SCRIPT.md', 'w').write('\n'.join(out) + '\n'); print('written', len(out), 'lines')
