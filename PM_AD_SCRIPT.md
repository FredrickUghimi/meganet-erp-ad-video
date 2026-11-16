# Mega-Net ERP Cloud: Project Management introduction (62 s, 1920x1080, 30 fps)

Composition ids: `MegaNetPMAd` (full 62 s) and `PMScene1` to `PMScene7` (one per scene, used for the per-scene renders).

## Voiceover

Voice: Microsoft neural `en-NG-EzinneNeural` via the `edge-tts` Python package (no key), rate -4%.
One clip per line. Voice bus normalised to -16 LUFS. Times are the measured placement in the final mix.

| # | Scene | Start (s) | End (s) | Tempo | Text |
|---|---|---|---|---|---|
| 1 | Problem (0-7) | 0.20 | 7.52 | 1.12x | Managing multiple projects can quickly become complicated. Deadlines, people, tasks and budgets. Everything needs attention. |
| 2 | Introduction (7-15) | 7.60 | 15.18 | 1.11x | Introducing Project Management in Mega-Net ERP Cloud. A smarter way to plan, organise and monitor your business projects. |
| 3 | Plan (15-25) | 15.30 | 24.55 | 1.00x | Create projects, establish milestones, break work into tasks and assign responsibilities. Everyone knows what needs to be done and when. |
| 4 | People (25-34) | 25.30 | 31.61 | 1.00x | Plan employee workloads, monitor capacity and identify over-allocation before it becomes a bigger problem. |
| 5 | Time and cost (34-45) | 34.30 | 42.20 | 1.00x | Track working hours, approve timesheets and monitor project costs against budgets using purchases and expenses recorded in your ERP. |
| 6 | Visibility (45-53) | 45.30 | 51.50 | 1.00x | Monitor project progress, identify delays and give management better visibility into project performance. |
| 7a | Close (53-62) | 53.30 | 56.32 | 1.00x | Take control of your projects with Mega-Net ERP Cloud. |
| 7b | Close | 57.50 | 61.54 | 1.00x | Contact Mega-Net Software today to request your personalised demonstration. |

Storyboard start times were 0.3 s (line 1) and 7.3 s (line 2). Line 1 holds 9.9 s of speech for a 6.7 s window, so even at the maximum 1.12x it
could not fit. It starts at 0.20 s, has its three sentences joined with 0.12 s pauses and runs at 1.12x; line 2 therefore starts 0.3 s late.
Nothing in the wording was changed.

## On-screen text by scene

1. 0.0-7.0 Problem: MANAGING PROJECTS / SHOULDN'T BE / THIS COMPLICATED.
2. 7.0-15.0 Introduction: INTRODUCING / PROJECT MANAGEMENT / Mega-Net ERP Cloud (abstract dashboard, shapes only)
3. 15.0-25.0 Plan: PLAN. ORGANISE. ASSIGN. (New project panel, chips, 3 milestones, 6 tasks, assignees, due dates, summary 3 / 6 / 6)
4. 25.0-34.0 People: MANAGE PEOPLE AND RESOURCES (5 employees x 6 weeks against 40 h/week; one person at 46 h and 52 h)
5. 34.0-45.0 Time and cost: TRACK TIME. CONTROL COSTS. (weekly timesheet, budget vs actual, purchases/expenses chart)
6. 45.0-53.0 Visibility: SEE THE BIGGER PICTURE. (KPI tiles, project table with health and reasons, financial summary)
7. 53.0-62.0 Close: YOUR PROJECTS. / YOUR PEOPLE. / YOUR BUSINESS. / ALL CONNECTED. / Request a personalised live demonstration. / WhatsApp: +234 707 600 0030 / meganetsoftware.com.ng/erp-cloud.html

Scenes 2-6 carry the label "ILLUSTRATIVE ANIMATION". All app screens are illustrative; no real screenshots were supplied.

## Rebuilding

```
python3 -I scripts/pm_voice.py <dir>                      # edge-tts clips (needs network to Microsoft's speech service)
node scripts/pm_cues.mjs > cues.json                       # sound-effect cues from src/pm/timing.ts
python3 -I scripts/pm_audio.py <dir> cues.json <audio-dir> # voice placement, -16 LUFS, sfx, music, sidechain mix
scripts/pm_render.sh <render-dir>                          # 7 scene MP4s, identical settings
scripts/pm_mux.sh <render-dir> <audio-dir>/mix.wav final.mp4
```
Timings for both picture and sound live in `src/pm/timing.ts`.
