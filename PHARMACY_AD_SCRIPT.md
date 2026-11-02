# Mega-Net EHR Cloud: Pharmacy drug-interaction warning ad (v4; 31.605 s measured, 948 frames, 1080x1920, 30 fps)

Composition `MegaNetPharmacyInteractionAd` (`src/MegaNetPharmacyInteractionAd.tsx`, copy and design in the comment block at the top). v4 **replaces the earlier "spot the collision" ad in place**: one composition with this id in `src/Root.tsx`, one render `out/meganet-pharmacy-interaction-ad.mp4` (the earlier ad stays in git history on `main`; its stale renders, stills and reports were removed from `out/`).
Render: `npm run render:pharmacy`. Poster: `npm run poster:pharmacy` (frame 440, the warning on screen).
Voice: **`en-NG-EzinneNeural` (female)**, a per-feature exception to the series default (AbeoNeural), requested by the project owner. Built by `scripts/pharmacy_voice.py` into `public/voiceover-pharmacy.mp3` and `src/pharmacyTimings.ts` (word timings come from the real audio, no estimates). No music, never sped up.

**Why v4:** a first-time viewer could not tell what the previous ad was: no brand, no situation, no sign it was a feature, and it read like a drug ad. v4 puts the "Mega-Net EHR Cloud" badge (with the logo) and the label "Feature: Drug interaction warning" on screen from frame 0 and on every frame, opens with a doctor writing a prescription, names the feature out loud, and shows the warning only after the doctor presses **Save Prescription**.

**Status: not ready to publish until production is verified and the demo org has a signed-off interaction pair.** Deployed to production: **unknown** (no Render access from this session; nothing here was checked on staging or production).

## Runtime (measured, not estimated)

Lead-in 0.400 s + voice 29.205 s (7 sentences, six 0.3 s gaps between the sentences, never sped up) + 2.000 s end hold = **31.605 s**. The render is 948 frames at 30 fps = **31.600 s** (ffprobe `duration=31.600000`). The brief's own band was 28-30 s (30-31 s acceptable, above 31 s stop and report); the measurement was 31.6 s, it was reported before building, and the project owner accepted it explicitly. The series default for EHR feature-spotlight ads is now "about 30 s, 28-32 s acceptable" (`STYLE_GUIDE.md` section 4).

## Narration (captions identical, word for word)

1. A doctor is about to prescribe two drugs for one patient.
2. Some drug pairs can interact.
3. Mega-Net EHR Cloud has a feature for that: a drug interaction warning.
4. When the doctor tries to save the prescription, a warning appears if the two drugs are a defined interaction pair.
5. For a severe interaction, the doctor must stop and type CONFIRM to continue.
6. Nothing is saved until they do.
7. Mega-Net EHR Cloud. Book a free demo. Message us on WhatsApp.

78 words. "Doctor" in narration and captions; "prescriber" appears only in the claim table below. Warfarin and Aspirin are never spoken. No "Here is an example" line; the on-screen "Example" tag stays.

| Scene | Frames / time | On screen | Narration |
|---|---|---|---|
| header (all frames) | 0-947 | "Mega-Net EHR Cloud" badge with logo, label "Feature: Drug interaction warning"; not animated, there on frame 0 | all |
| 0 hook | 0-181, 0-6.0 s | **"The prescription pad writes itself"**: a pen draws two placeholder drug lines (grey tile + grey bar, no names) on a "New prescription" pad, then an orange link marker joins the two lines | 1, 2 |
| 1 feature | 181-322, 6.0-10.7 s | Logo card, "New feature" chip, "Drug interaction warning" with the warning icon | 3 |
| 2 prescribing screen | 314-730, 10.5-24.3 s | "Write a Prescription" card tagged "Example" with Warfarin and Aspirin rows and the **Save Prescription** button; a cursor presses it (frame 394, 13.13 s), a spinner shows, and only then (frame 406, 13.53 s) the card becomes the "Drug interaction warning" box: "Warfarin + Aspirin" tagged "Example", "Defined interaction pair" chip, "Severe" chip, "Type CONFIRM to proceed", CONFIRM typed letter by letter, "Confirm — Prescribe Anyway" disabled then enabled, a status chip "Nothing saved yet" that turns into "Saved" when the cursor presses the button | 4, 5, 6 |
| 3 CTA | 718-948, 23.9-31.6 s | Logo card, "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng | 7 |

Hook style **"the prescription pad writes itself" is new to the series** (checked against the hook table in `STYLE_GUIDE.md` section 5, and a grep of every ad's source and script doc for "pen", "writes itself" and "prescription pad": no match). The nearest existing hook is the Ledger ad's dotted trail line that draws across the screen; this one differs in object (a pen on a pad), result (grey placeholder bars that become drug lines) and motion (a hand-drawn stroke, not a trail line travelling to a row). Transitions: split, circle iris, zoom-fade (as before).

## Claims and where they come from (EHR-Cloud- at `e8ca779`, tip of `origin/main`; every line below was re-read at `origin/main` this round, none carried over from the earlier notes; the app was not run)

| Claim in the ad | Evidence | Status | On main? | Deployed to production? |
|---|---|---|---|---|
| 1. A doctor is about to prescribe two drugs for one patient; 2. some drug pairs can interact | `Prescribe.jsx:187` ("Write a Prescription"); a prescription takes several drug rows (`api/pharmacy.py:65` `MAX_DRUG_ROWS = 5`); every pair in a prescription is looked up for an interaction (`api/pharmacy.py:116-125`) | implemented | yes | **unknown** |
| 3. Mega-Net EHR Cloud has a feature, a drug interaction warning | the box title "Drug interaction warning" (`Prescribe.jsx:228`) | implemented | yes | **unknown** |
| 4. When the doctor tries to save the prescription, a warning appears if the two drugs are a defined interaction pair. (Selecting a drug does **not** show it: `updateRow`, `Prescribe.jsx:63-64`, only sets local state.) | Button "Save Prescription" `Prescribe.jsx:335-336` (`type="submit"`) -> `handleSubmit` `:145-147` -> `submit()` `:105` -> `createPrescription(...)` `:119`; the server checks every pair (`api/pharmacy.py:248`, `_find_interactions` `:116-125`) and returns `confirmation_required` (`:258` severe/contraindicated; `:262` other severities; the ad shows the severe tier) **instead of creating the prescription**; the client then calls `setPendingConfirm` (`Prescribe.jsx:121`, inside `if (result.confirmation_required)` `:120`) and the form is replaced by the warning box (`:226-228`) | implemented | yes | **unknown** |
| 5. For a severe interaction the prescriber must stop and type CONFIRM to continue | `api/pharmacy.py:66-67` (`HARD_CONFIRM_SEVERITIES`, `SEVERE_CONFIRM_WORD`), `:255-258` (the typed word must equal `CONFIRM`, else the gate response); `Prescribe.jsx:183` (`hardConfirmValid`), `:246` ("Type CONFIRM to proceed"), `:265` (button disabled until it matches), `:267` ("Confirm — Prescribe Anyway") | implemented | yes | **unknown** |
| 6. Nothing is saved until they do | `api/pharmacy.py:258` returns before the prescription is created at **`:265`** (`Prescription.objects.create`; the earlier note said `:264`, corrected) | implemented | yes | **unknown** |
| (not claimed) also checks the patient's other active prescriptions | `api/pharmacy.py:129-143`, `:249` | implemented, left out | yes | **unknown** |
| (not claimed) checks every drug / prevents errors; compliance, encryption, certification, safety guarantees | none | **not claimed, excluded** | n/a | n/a |

Wording that comes from the product: "Drug interaction warning" (`Prescribe.jsx:228`), "Type CONFIRM to proceed" (`:246`), "Confirm — Prescribe Anyway" (`:267`), "Save Prescription" (`:336`), "Write a Prescription" (`:187`). Ad-original wording, not product strings: "New prescription", "New feature", "Example", "Defined interaction pair", "Severe" (the stored severity name comes from the earlier PR #8 notes, `pharmacy/models.py` was not re-read this round), "Nothing saved yet", "Saved".

What the typed confirmation requires: `CONFIRM` in capitals after trimming (`api/pharmacy.py:256-257`); the button stays disabled until it matches (`Prescribe.jsx:183`, `:265`); the server re-checks. Severe and Contraindicated both use this gate; the ad says only "severe".

Deliberately **not** claimed: that it checks every drug or prevents errors; any compliance, encryption, certification or safety-guarantee wording; that other severities behave in any way; that any organisation has pairs set up out of the box. The warning is described only as appearing "if the two drugs are a defined interaction pair".

## Facts the project owner needs before publishing

Carried over from the earlier PR #8 write-up and **not re-read this round** (EHR-Cloud- was attached only for `Prescribe.jsx` and `api/pharmacy.py`):
- **Pairs are per facility and set up by platform staff.** `DrugInteraction` has no organisation or facility column; it is scoped through its drug links, a pair only fires when both drugs are that facility's own formulary rows (exact strength and form), and it is editable only in Django Admin. A new organisation gets **no warnings** until pairs are added for its own drugs.
- **One pair is seeded**: Warfarin 5mg + Aspirin 75mg, severe, only in the Mega-Net Demo Hospital seed and only when `ALLOW_DEMO_SEED=true`. The on-screen pair is therefore a demo-organisation example, which is why it is tagged "Example". **The demo org needs a signed-off interaction pair before this ad is published.**
- A starter set per organisation is possible but not built; it needs clinician-reviewed content and is a gated data decision (the EHR repo's `CLAUDE.md`). Left to the project owner.

## Voice check

The audio was generated with `en-NG-EzinneNeural` through edge-tts (certifi pointed at `/root/.ccr/ca-bundle.crt`; TLS verification on). No automatic speech recognition was possible, so the pronunciation of "Mega-Net", "EHR", "CONFIRM" and "WhatsApp" was not machine-checked; the project owner listens. **The caption word check is against the TTS engine's own word list, not an independent recogniser** (the list comes from the same engine that spoke the words).

## Verification (local renders only; nothing checked on staging or production)

Reports in `out/pharmacy-v4-verification/`; scripts in `scripts/`:
- **Frame check, every one of the 948 frames** (lossless PNG diffed against a gradient-only render, threshold 6/255; `safe-area.txt`, `safe-area-frames.csv`, `scripts/verify_safe_area_pharmacy.py`): 0 frames with a pixel outside x 80-920, y 200-1440; content bbox over all frames x 92-907, y 216-1279. Negative controls (a box 30 px outside each edge, plus a faint white one): all 5 flagged.
- **Text boxes on every frame, no waiver** (`textboxes.txt`, `textbox-frames.csv`, `scripts/pharmacy_textbox_audit.mjs` + `scripts/verify_textboxes_pharmacy.py`): 948 frames, 10,429 text-box measurements, 0 outside (extremes: left 147.0, right 859.0, top 234.5, scene text bottom within 1095, caption bottom 1254.5). A synthetic text box outside the safe area is flagged (negative control).
- **Caption zone** (`caption-overlap.txt`, `scripts/verify_caption_overlap.py`): 948 frames, 0 frames with scene content inside the caption zone or the 24 px band above it (lowest scene content y 1079); the synthetic negative control is flagged. (The rendered `nocaps-violate-caption` control was not re-run this round.)
- **Story order** (`story.txt`, `scripts/verify_story_pharmacy.py`): badge and label on every frame from frame 0; "Save Prescription" first on screen at frame 314 (10.467 s), pressed at frame 394 (13.133 s), first warning text at frame 406 (13.533 s), i.e. 12 frames (0.400 s) after the press and never before; Warfarin and Aspirin always tagged "Example", absent from the hook and from the narration (TTS word list). Three negative controls (warning injected 40 frames early, Example tag removed, badge removed from frame 0) are all flagged.
- **Contrast** (`contrast.txt`, `scripts/pharmacy_audit.mjs` + `scripts/pharmacy_contrast.py`): worst pixel behind every text box on settled frames (a frame inside an element's ~0.3 s entry, inside a scene transition or inside a caption's 3-frame fade-in is not sampled; the next settled frame is). 466 samples, 127 distinct text+colour pairs, smallest font 32 px, lowest contrast **5.91:1**, 0 failures. Negative control: the same run with a 7:1 floor fails 178 samples, and with a 36 px size floor it fails too.

Contrast per colour pair (minimum 4.5:1, labels at least 32 px):

| Text colour | Worst pixel behind it | Used for (examples) | Size (px) | Lowest contrast | Samples |
|---|---|---|---|---|---|
| #1458B5 | #F2EFE8 | free demo | 104-104 | 5.91:1 | 1 |
| #9E3F00 | #FFF1DC | Example | 34-34 | 5.96:1 | 1 |
| #FFFFFF | #0B6E46 | Saved, WhatsApp +2347035682478 | 34-40 | 6.30:1 | 2 |
| #B42328 | #FFFFFF | Drug interaction warning, Drug interaction, warning | 44-62 | 6.54:1 | 3 |
| #FFFFFF | #B42328 | Severe, Confirm — Prescribe Anyway | 34-38 | 6.54:1 | 2 |
| #44506A | #E3E8F0 | Confirm — Prescribe Anyway | 38-38 | 6.56:1 | 1 |
| #1458B5 | #FFFFFF | Feature: Drug interaction warning | 34-34 | 6.79:1 | 1 |
| #FFFFFF | #1458B5 | Defined interaction pair, New feature, Save Prescription ... | 34-40 | 6.79:1 | 4 |
| #1B2430 | #F7941D | Book, Cloud., EHR ... | 48-48 | 6.86:1 | 35 |
| #44506A | #FFFFFF | Type CONFIRM to proceed, CONFIRM, Cloud ... | 36-48 | 8.07:1 | 46 |
| #1B2430 | #E7E6E5 | Book a | 104-104 | 12.56:1 | 1 |
| #1B2430 | #F4F8FF | Aspirin, Warfarin | 46-46 | 14.70:1 | 2 |
| #1B2430 | #FFFFFF | Mega-Net EHR Cloud, Nothing saved yet, New prescription ... | 32-56 | 15.65:1 | 28 |

Captions (`captions.txt`, `caption-timing.csv`, `scripts/verify_captions_pharmacy.py`): 78 caption words = 78 narration words = 78 TTS-reported words (**the TTS engine's own word list, not an independent recogniser**); caption pill x 110-889, y 1121-1271 (limit y <= 1280), tallest pill 151 px = 2 lines. Timing, per sentence, against the TTS word boundaries (+0.4 s lead-in) and against the boundaries measured on the rendered video's own audio (silence detection, -45 dB); pass = every delta within 0.1 s. The TTS boundaries lead the audible onset by about 0.05-0.15 s, so captions and the spoken-word highlight run 2 frames (0.067 s) behind them (`CAP_DELAY`).

| # | Sentence | Caption on (s) | Caption off (s) | TTS start | TTS end | Audio start | Audio end | Max abs delta (s) | Result |
|---|---|---|---|---|---|---|---|---|---|
| 1 | A doctor is about to prescribe two drugs for one patient. | 0.500 | 3.533 | 0.430 | 3.455 | 0.562 | 3.558 | 0.078 | PASS |
| 2 | Some drug pairs can interact. | 3.900 | 5.733 | 3.845 | 5.683 | 3.981 | 5.785 | 0.081 | PASS |
| 3 | Mega-Net EHR Cloud has a feature for that: a drug interaction warning. | 6.133 | 10.467 | 6.072 | 10.385 | 6.225 | 10.488 | 0.092 | PASS |
| 4 | When the doctor tries to save the prescription, a warning appears if the two drugs are a defined interaction pair. | 10.833 | 16.933 | 10.775 | 16.850 | 10.914 | 16.953 | 0.083 | PASS |
| 5 | For a severe interaction, the doctor must stop and type CONFIRM to continue. | 17.300 | 21.733 | 17.240 | 21.665 | 17.383 | 21.768 | 0.083 | PASS |
| 6 | Nothing is saved until they do. | 22.133 | 23.733 | 22.055 | 23.667 | 22.148 | 23.770 | 0.078 | PASS |
| 7 | Mega-Net EHR Cloud. Book a free demo. Message us on WhatsApp. | 24.133 | 29.600 | 24.058 | 29.545 | 24.175 | 29.622 | 0.076 | PASS |

Sentence 7 is spoken as three short phrases with pauses and has three captions; its row above spans the first phrase's caption-on to the last phrase's caption-off. Each phrase on its own (supplementary, not part of the pass/fail): the first caption ("Mega-Net EHR Cloud.") disappears **0.143 s before the audible end of "Cloud."** on the rendered audio, which is outside 0.1 s; against the TTS-reported end it is 0.051 s. The TTS-reported end and the audible end of that word differ by 0.194 s, so no frame can be within 0.1 s of both; the caption follows the TTS boundary like every other caption. Left as is and reported.

| Phrase of sentence 7 | on d TTS | off d TTS | on d audio | off d audio |
|---|---|---|---|---|
| 7a Mega-Net EHR Cloud. | +0.076 | +0.051 | -0.041 | -0.143 |
| 7b Book a free demo. | +0.055 | +0.067 | -0.046 | -0.069 |
| 7c Message us on WhatsApp. | +0.076 | +0.055 | -0.065 | -0.022 |
