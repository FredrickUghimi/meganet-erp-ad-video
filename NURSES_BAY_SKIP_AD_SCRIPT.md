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
| 1 hook: before/after split | 0-11.87 s | Badge "Mega-Net EHR Cloud" and label "Feature: Skip and call back" from frame 0. A bench of six drawn people over two identical drawn waiting lists split by a centre line. One person leaves; on the left the second row closes up and its number is gone, on the right the row dims, then gets a red "Skipped" chip. Left label "A list that drops skipped names", right label "Mega-Net EHR Cloud" | 1, 2, 3 |
| 2 | 11.40-15.80 s | "Nurses Bay" card; the second row gets a "Skipped" chip and the line "Stepped out — will return" | 4 |
| 3 | 15.33-18.20 s | "Waiting list" card, four numbered rows; the row with the "Skipped" chip stays in the same slot; tag "Same place in line" | 5 |
| 4 | 17.73-21.93 s | The skipped row; the "Call" button is pressed, the chip changes to "Called", the red outline and the reason line clear | 6 |
| 5 | 21.47-25.10 s | "Skipped" chip, arrow, "Call" button, arrow, "Called" chip | 7 |
| 6 CTA | 24.63-30.30 s | Book a free demo, WhatsApp +2347035682478, meganetsoftware.com.ng, logo | 8 |

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

## Verification (local renders only; nothing checked on staging or production)

Everything below was measured on this session's own renders (Remotion 4, Chromium, 909 frames, lossless PNG where stated). Reports are in `out/nurses-bay-skip-verification/` (every frame is listed in the CSVs). Scripts: `scripts/verify_safe_area_skip.py`, `scripts/skip_textbox_audit.mjs` + `scripts/verify_textboxes_skip.py`, `scripts/verify_caption_overlap.py` (shared), `scripts/verify_captions_skip.py`, `scripts/verify_skipped_word_skip.py`, `scripts/verify_badge_label_skip.py`, `scripts/skip_audit.mjs` + `scripts/skip_contrast.py`, `scripts/skip_gray_stills.mjs`. All reports were produced by one run on the final code (mp4 and PNG sequences rendered from the same source).

| Check | Result |
|---|---|
| Safe area x 80-920, y 200-1440, every one of 909 frames, lossless PNG vs gradient-only render (threshold 6/255) | PASS, 0 of 909 frames outside; content bbox x 90-919, y 209-1279. Negative controls: a box 30 px outside each of the four edges and a faint white one are all flagged |
| Every text box on every frame (boxes incl. transforms, no settled-frame filter, no opacity filter, **no waiver for mid-slide or mid-transition**) | PASS, 0 of 909 frames; extreme edges: left 118.0, right 879.7, top 224.5, scene text bottom within 1095, captions bottom 1254.5. Negative control: a text box 20 px past the left, 25 past the right, 30 past the top or 30 past the bottom limit is flagged, the unmodified data is not |
| Caption zone (x 110-890, y 1120-1272, plus 24 px clearance), diff with captions off, all 909 frames | PASS, 0 frames with scene content in the zone or band; lowest scene content y 1087 (limit 1095) |
| Caption-zone negative controls | Synthetic boxes: caught / clear box not flagged. Rendered red box in the zone: flagged on 909 of 909 frames. Rendered **faint card** (white card, 3 px `#C9DCF6` border, soft shadow: the faintest real element of this ad): flagged on 909 of 909 frames. Rendered **pure-white box: flagged on only 357 of 909 frames**, so that one control reads FAIL (`caption-overlap-rendered-control-white-box.txt`). A white box on this ad's near-white gradients differs from the background by less than the 24/255 threshold on the other 552 frames, so it is not a visible element there. Not waived: reported as a limit of that control, and replaced by the faint-card control above |
| Captions word for word vs the approved narration and vs the TTS word boundaries | PASS (caption max 2 lines; tallest pill 151 px; bbox x 110-889, y 1121-1271) |
| Caption timing, within 0.1 s on both ends of every sentence, against the TTS boundaries (+0.4 s lead-in) and the silence-detected audio of the rendered mp4 | PASS, largest delta 0.087 s (table below) |
| "Skipped" carried by the word, not colour alone: the Skipped red (`#B42328`, 150+ px) is never on screen without a text node reading "Skipped" at full opacity | PASS: 384 frames with the red, all 384 with the word; 0 frames with red and no word. The word is on screen on frames 277-355, 391-473, 478-594, 644-752. Negative controls: a red square painted onto a frame with no word is flagged; a real chip frame with its text node deleted is flagged. Greyscale stills (`gray-stills/gray-*.png`, whole frame through `grayscale(1)`) show the word still reads as the state |
| Badge "Mega-Net EHR Cloud" and label "Feature: Skip and call back" on every frame 0-738: text node present, opacity 1, 32 px, inside the safe area, and actually drawn (pixel diff vs gradient render) | PASS, 739 of 739 frames; frame 0: badge 9,372 px and label 25,789 px drawn. Negative controls (nodes deleted from the data; frame compared with itself) flagged |
| Contrast (min 4.5:1) and label size (min 32 px), every text node on the settled audit frames, worst pixel behind each text box, text-less render of the same frame | PASS: 134 distinct text+colour pairs, **lowest 4.87:1** (white on brand blue `#1A6DE0`, the queue-position discs and the "Call" button), then 5.25:1 (dimmed-row number), 5.92:1, 6.30:1; smallest font 32 px. Text mid-fade (opacity below 0.99) is excluded as transient per `STYLE_GUIDE.md` section 2: 3 samples excluded, and every one of the 134 pairs was measured fully settled at least once, otherwise the check fails |
| **Dimmest frame of the dimmed row** (the right-hand stepped-out row before its chip lands, frames 174-276, every frame audited): the number "2", `#44506A` on `#C8D1E0` | **5.25:1** at its worst frame (frame 174; the dimmed state is solid colours, never opacity, so every dimmed frame is 5.25:1); min 4.5:1 required. PASS |

Caption timing (video seconds; "audio" is measured on the rendered mp4):

| # | Sentence | Caption on | Caption off | TTS start | TTS end | Audio start | Audio end | Max delta |
|---|---|---|---|---|---|---|---|---|
| 1 | A busy clinic, a full waiting room. | 0.500 | 2.567 | 0.430 | 2.505 | 0.561 | 2.608 | 0.070 |
| 2 | A patient steps out when called, and their name can drop off the list. | 2.967 | 6.933 | 2.895 | 6.857 | 3.041 | 6.936 | 0.076 |
| 3 | With Mega-Net EHR Cloud, a skipped patient stays on the waiting list. | 7.300 | 11.367 | 7.247 | 11.297 | 7.387 | 11.373 | 0.087 |
| 4 | The nurse sees them marked as skipped, with the reason underneath. | 11.767 | 15.300 | 11.687 | 15.237 | 11.828 | 15.339 | 0.079 |
| 5 | They keep their original place in the line. | 15.700 | 17.733 | 15.627 | 17.652 | 15.775 | 17.755 | 0.081 |
| 6 | When they are back, the nurse calls them, and the mark clears. | 18.100 | 21.433 | 18.042 | 21.367 | 18.181 | 21.470 | 0.081 |
| 7 | So a patient who steps out is easy to call again. | 21.833 | 24.600 | 21.757 | 24.532 | 21.901 | 24.635 | 0.076 |
| 8 | Book a free demo with Mega-Net. | 25.000 | 26.633 | 24.922 | 26.572 | 25.025 | 26.675 | 0.078 |
| 9 | Message us on WhatsApp. | 27.033 | 28.300 | 26.962 | 28.250 | 27.104 | 28.329 | 0.071 |

Captions and the spoken-word highlight run 2 frames (0.067 s) behind the TTS word boundaries, which lead the audible onset by about 0.05-0.15 s.

### What went wrong on the way, and what was changed
- First full run (reports kept out of the repo): the "Skipped" check failed on 3 frames (595, 653, 654): the red outline outlived the chip changing to "Called" by one frame, and the incoming chip sat inside a fading card. Fixed in the animation (no fade on anything carrying the red; the outline goes on the same frame the chip changes), then every check re-run on the final code.
- The same run's contrast check failed on 5 caption samples taken during a caption's 3-frame fade-in; the audit now samples captions after the fade. A later run failed on 3 samples taken during element fade-ins (the reason line, the right-hand label, the WhatsApp pill); the check now applies the style guide's "settled text only" rule per text node, with the safeguard that every text must be measured fully settled at least once.
- A "Call" button was clipped at the card edge in the call-back scene and the "easy to call again" scene had no content on its first frames; both fixed before the checks.

### Not checked, said plainly
- Pronunciation of "Mega-Net", "EHR" and the rest: no speech recogniser was available (model download blocked at the network layer), so the project owner listens. The caption text is compared with the TTS engine's own word-boundary transcript, which is **not** an independent recogniser.
- Nothing was run on `meganet-web-staging` or `meganet-web` (production); the claims come from reading EHR-Cloud- at `e8ca779`. **Deployed to production: unknown.**
