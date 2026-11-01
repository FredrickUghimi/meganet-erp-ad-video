# Mega-Net EHR Cloud: Pharmacy drug-interaction warning ad (ad 8 of the feature-spotlight series; 19.47 s, 1080x1920, 30 fps)

Composition `MegaNetPharmacyInteractionAd` (`src/MegaNetPharmacyInteractionAd.tsx`, copy and design in the comment block at the top).
Render: `npm run render:pharmacy` (`npx remotion render MegaNetPharmacyInteractionAd out/meganet-pharmacy-interaction-ad.mp4 --browser-executable=/opt/pw-browsers/chromium --crf=14`).
Voice: **`en-NG-EzinneNeural` (female)**, a per-feature exception to the series default (AbeoNeural), requested by the project owner for this ad. Built by `scripts/pharmacy_voice.py` into `public/voiceover-pharmacy.mp3` and `src/pharmacyTimings.ts`. No music, never sped up, 0.3 s between sentences, 0.4 s lead-in, 2 s frozen hold after the voice (voice ends 17.05 s).

**Status: not ready to publish.** Deployed to production: **unknown** (no Render access from this session; see below). Open question for the project owner: the starter-pair question (an organisation has no interaction pairs unless platform staff add them).

| Scene | Time | On screen | Narration (captions match word for word) |
|---|---|---|---|
| 1 hook | 0-3.17 s | "Spot the collision": Warfarin and Aspirin tiles slide toward each other, an orange stop-bar drops between them and halts them, the label "Interaction warning" lands | "Warfarin meets aspirin. Spot the collision." |
| 2 | 3.17-8.53 s | Drawn prescription card with two drug rows; a "Drug interaction warning" box with "Warfarin + Aspirin" and the chip "Defined interaction pair" | "Mega-Net EHR Cloud warns the prescriber when two drugs are a defined interaction pair." |
| 3 | 8.53-13.77 s | Same warning with a "Severe" chip; a "Type CONFIRM to proceed" field, a no-entry sign, CONFIRM typed letter by letter, sign turns to a tick, button "Confirm — Prescribe Anyway" goes from greyed to enabled | "For a severe interaction, the prescriber must stop, and type CONFIRM to continue." |
| 4 CTA | 13.77-19.47 s | Book a free demo, WhatsApp +2347035682478, meganetsoftware.com.ng, logo card | "Book a free demo with Mega-Net. Message us on WhatsApp." |

43 words. Hook style "spot the collision" is new to the series (`STYLE_GUIDE.md` section 5). Transitions: split (barn doors from the centre line), circle iris, zoom-fade.

## Claims and where they come from (EHR-Cloud- at `e8ca779`, tip of `main`; read from the code, the app was not run)

| Claim in the ad | Evidence | Status | On main? | Deployed to production? |
|---|---|---|---|---|
| Warns the prescriber when two drugs are a defined interaction pair | `api/pharmacy.py:116-125`, `:248-262`; `frontend/src/pages/Prescribe.jsx:227-228` ("Drug interaction warning") | implemented | yes | **unknown** |
| For a severe interaction the prescriber must stop and type CONFIRM to continue | `api/pharmacy.py:66-67`, `:255-258`; `Prescribe.jsx:183`, `:246`, `:265-267` | implemented | yes | **unknown** |
| (implied by "must stop") nothing is saved until the gate is passed | `api/pharmacy.py:258` returns before the prescription is created (`:264`) | implemented | yes | **unknown** |

Wording that comes from the product: "Drug interaction warning" (`Prescribe.jsx:228`), "Type CONFIRM to proceed" (`Prescribe.jsx:246`), "Confirm — Prescribe Anyway" (`Prescribe.jsx:267`). "Severe" is a stored severity (`pharmacy/models.py:93`).

What the typed confirmation requires: the field must equal `CONFIRM` in capitals after trimming spaces (`api/pharmacy.py:256-257`); `confirm` fails; a tick-box is not accepted for this tier; the button stays disabled until it matches (`Prescribe.jsx:183`, `:265`); the server re-checks the word. Severe and Contraindicated both use this gate; the ad only says "severe".

Deliberately **not** claimed: that it checks every drug or prevents errors; any compliance, encryption, certification or safety-guarantee wording; that other severities (Minor, Moderate, Contraindicated) behave in any way; that it also checks the patient's other active prescriptions (implemented, `api/pharmacy.py:129-143`, but left out: adding the sentence would make the ad 22.54 s, over the 22 s limit); that any organisation has pairs set up out of the box.

## Facts the project owner needs before publishing
- **Pairs are per facility, via the drugs, and set up by platform staff.** `DrugInteraction` has no organisation or facility column; it is scoped through its drug links (`pharmacy/migrations/0002_row_level_security.py`), and a pair only fires when both drugs are that facility's own formulary rows (exact strength and form). Editable only in Django Admin (`pharmacy/admin.py:20-24`, `docs/support/pharmacy.md:40`), i.e. platform staff or superusers; org admins have no admin access. A new organisation therefore gets **no warnings** until pairs are added for its own drugs.
- **One pair is seeded**: Warfarin 5mg + Aspirin 75mg, severe (`foundation/demo_clinical_content.py:64-72`), only in the Mega-Net Demo Hospital seed and only when `ALLOW_DEMO_SEED=true` (`foundation/demo_org_seed.py:327`). The on-screen pair is therefore a demo-organisation example; the label says "Defined interaction pair" for that reason.
- **Starter set per organisation**: technically possible (additive, per-facility rows) but not built. It needs clinician-reviewed content, mapping onto each organisation's exact formulary rows, and a decision that it writes data per organisation (gated by `CLAUDE.md`). Decision left to the project owner.
- Tests run locally (Postgres 16, not staging or production): `api.tests_pharmacy` and `pharmacy.tests`, 77 tests, all OK.

## Voice check
Test clip and the script audio were generated with `en-NG-EzinneNeural`. No automatic speech recognition was possible (the model download was blocked at the network layer with a 403), so pronunciation of "Warfarin", "Mega-Net", "EHR" and "CONFIRM" was not machine-checked; the project owner listens. The caption text is compared with the TTS engine's own word-boundary transcript, which is **not** an independent recogniser.

## Verification (local renders only; nothing checked on staging or production)
Reports in `out/pharmacy-verification/`: `safe-area.txt` and `safe-area-frames.csv` (every one of the 584 frames, lossless PNG, vs a gradient-only render, with negative controls), `captions.txt` and `caption-timing.csv`, `contrast.txt`. Scripts: `scripts/verify_safe_area_pharmacy.py`, `scripts/verify_captions_pharmacy.py`, `scripts/pharmacy_audit.mjs` + `scripts/pharmacy_contrast.py`, `scripts/pharmacy_neg_stills.mjs`.
- The TTS engine's word boundaries lead the audible onset by about 0.05-0.15 s (measured by silence detection on the rendered audio), so captions and the spoken-word highlight run 2 frames (0.067 s) behind the reported boundaries (`CAP_DELAY`).
- Mid-slide text is transient (`STYLE_GUIDE.md` section 2): two hook tile names at frame 46 are listed as "clipped" in the contrast report; their contrast and size are still enforced, and the pixel check proves no visible pixel leaves the safe area.
