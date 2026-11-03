# Mega-Net EHR Cloud: Nurses Bay "skip and call back" ad (ad 9 of the feature-spotlight series; 30.30 s, 1080x1920, 30 fps)

Composition `MegaNetNursesBaySkipAd` (`src/MegaNetNursesBaySkipAd.tsx`, design notes in the comment block at the top).
Render: `npm run render:skip` (`npx remotion render MegaNetNursesBaySkipAd out/meganet-nurses-bay-skip-ad.mp4 --browser-executable=/opt/pw-browsers/chromium --crf=14`).
Voice: **`en-NG-EzinneNeural` (female)**, a per-feature exception to the series default (AbeoNeural), requested by the project owner for this ad. Built by `scripts/skip_voice.py` into `public/voiceover-skip.mp3` and `src/skipTimings.ts`. No music, never sped up, 0.3 s between sentences, 0.4 s lead-in, 2 s frozen hold after the voice (voice ends 27.91 s). `certifi` is pointed at the proxy CA bundle (`/root/.ccr/ca-bundle.crt`) inside the script; TLS verification stays on.

**Status: draft for review.** Deployed to production: **unknown** (no Render access from this session). Nothing was checked on `meganet-web-staging` or `meganet-web`; every claim below was read from the code of EHR-Cloud- at `origin/main` `e8ca779`, and the app was not run.

**Measured runtime: 30.30 s** = 0.4 s lead-in + 27.91 s voice (real generated Ezinne audio) + 2.0 s hold (909 frames). **"Mega-Net" is first spoken at 7.11 s voice time = 7.51 s video time** (limit 8.0 s).

## Narration (captions identical, word for word)

1. A busy clinic, a full waiting room.
2. A patient steps out when called, and their name can drop off the list.
3. With Mega-Net EHR Cloud, a skipped patient stays on the waiting list.
4. The nurse sees them marked as skipped, with the reason underneath.
5. They keep their original place in the line.
6. When they are back, the nurse calls them, and the mark clears.
7. So a patient who steps out is easy to call again.
8. Book a free demo with Mega-Net. Message us on WhatsApp.

Plain words only: no field names or button labels are spoken. Sentence 2 is scene-setting, not a product claim, and no competitor or other product is named or compared. The left panel is labelled "A list that drops skipped names" (no "Before" label); the right panel is labelled "Mega-Net EHR Cloud".

## Scenes

| Scene | Video time | On screen | Narration |
|---|---|---|---|
| 1 hook: before/after split | 0-11.9 s | Badge "Mega-Net EHR Cloud" and label "Feature: Skip and call back" from frame 0. A bench of six drawn people over two identical drawn waiting lists split by a centre line. One person leaves; on the left the second row closes up and its number is gone, on the right the row dims, then gets a red "Skipped" chip. Left label "A list that drops skipped names", right label "Mega-Net EHR Cloud" | 1, 2, 3 |
| 2 | 11.4-15.7 s | "Nurses Bay" card; the second row gets a "Skipped" chip and the line "Stepped out — will return" | 4 |
| 3 | 15.0-18.0 s | "Waiting list" card, four numbered rows; the row with the "Skipped" chip stays in the same slot; tag "Same place in line" | 5 |
| 4 | 17.4-22.0 s | The skipped row; the "Call" button is pressed, the chip changes to "Called", the red outline and the reason line clear | 6 |
| 5 | 21.8-25.0 s | "Skipped" chip, arrow, "Call" button, arrow, "Called" chip | 7 |
| 6 CTA | 24.4-30.3 s | Book a free demo, WhatsApp +2347035682478, meganetsoftware.com.ng, logo | 8 |

All rows are drawn at **one priority level** (no priority chips, no colours for urgency). The product orders the list by priority first and arrival second, so "same place in the line" is only drawn for rows of equal priority. The numbers in the discs are queue positions, not data; there are no figures, names or statistics.

Hook style "before/after split" is new to the series (`STYLE_GUIDE.md` section 5). Transitions (new, none used in an earlier ad): staggered row sweep (left to right), mosaic grow, row sweep (right to left, bottom up), dropping columns, mosaic grow.

## Claims and where they come from (EHR-Cloud- at `e8ca779`, tip of `main`; read from the code, the app was not run)

| # | Claim in the ad | Evidence | Status | On main? | Deployed to production? |
|---|---|---|---|---|---|
| 1 | Skipping keeps the patient on the Nurses Bay waiting list ("skipped" counts as an active status and the list query uses it) | `service_queue/views.py:58`; `api/queue.py:85`; test `api/tests_queue.py:350-367` | implemented | yes | **unknown** |
| 2 | A reason is required when skipping (stepped out / left / other) | `api/queue.py:146-150`; `service_queue/models.py:90-98`; `frontend/src/pages/SkipReasonModal.jsx:8-11` | implemented | yes | **unknown** |
| 3 | The nurse sees a "Skipped" badge with the reason text underneath | `frontend/src/pages/NursesBayQueue.jsx:12-14`, `:99-103` | implemented | yes | **unknown** |
| 4 | The patient keeps their place: the list is ordered by priority then arrival time, and skip and call never change the arrival time | `api/queue.py:88`; `service_queue/views.py:374-383`; test `api/tests_queue.py:369-378` | implemented | yes | **unknown** |
| 5 | Recovery: "Call" on the skipped row brings them back and clears the mark | `service_queue/views.py:384`; `api/queue.py:158-162`; `NursesBayQueue.jsx:23`, `:124-126` | implemented | yes | **unknown** |
| 6 | Nurses do this (the Nurses Bay queue permission `service_queue.manage` is held by nurses and org admins; front desk and physicians were removed) | `api/queue.py:95`, `:137-139`; `service_queue/migrations/0003:10`, `0004:20`, `0005`; `foundation/permissions.py:261-262` | implemented | yes | **unknown** |
| 7 | The demo organisation has Nurses Bay entries to show it on | `foundation/demo_org_seed.py:86-92`, `:233-252` (4 entries: 2 waiting, 1 called, 1 in progress, **none skipped**); seed runs only when `ALLOW_DEMO_SEED=true` (`foundation/demo_org.py:45-46`, `DEPLOY.md:73`) | seed code only | yes | **unknown** (the ad does not say "see it in the demo") |

Narration sentence to evidence: 1-2 scene-setting, no claim; 3 = claims 1 and the "Skipped" badge (3); 4 = claims 2 and 3; 5 = claim 4; 6 = claim 5 (+ 6 for "the nurse"); 7 = claims 1 and 5 ("steps out ... easy to call again" restates that the patient stays listed and Call brings them back); 8 = series call to action.

On-screen wording from the product: "Nurses Bay", "Skipped", "Called", "Call" (`NursesBayQueue.jsx:13`, `:24`), "Stepped out — will return" (`NursesBayQueue.jsx:14`), "Waiting list" (generic). "Feature: Skip and call back" and "Same place in line" are this ad's own labels, not product text.

Deliberately **not claimed**: any "never lose a patient" or safety, compliance or audit wording; that a skipped entry stays forever (the stale-entry report treats a skipped entry untouched for 7 days as a candidate, `service_queue/orphan_cleanup.py:41-60`); that other products behave differently; that skip works from every status (the server accepts skip from any status including completed, `service_queue/views.py:387`, the React page only hides Skip on already-skipped rows); the Consultation queue (shares the logic, not mentioned); polling; that front desk or doctors cannot do it ("nurses" is not an exclusivity claim); that any organisation has skipped entries out of the box; that the demo organisation shows a skipped patient without a nurse skipping one first. Until v1.49.0 (2026-09-06, `CHANGELOG.md`) skip removed the patient from the list, which is why the left panel is true to this product's own history, but the ad never says so.
