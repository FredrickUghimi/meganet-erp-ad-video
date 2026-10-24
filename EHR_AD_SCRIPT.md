# Mega-Net EHR Cloud ad: script (20 s, 1080x1920, 30 fps)

Composition `MegaNetEhrAd` (`src/MegaNetAd.tsx`, copy in `EHR_COPY`). The ERP ad (`MegaNetAd`) is unchanged.

## On-screen copy

| Scene | Time | Text |
|---|---|---|
| 1 | 0-3s | How long do patients wait? |
| 2 | 3-6s | Are lab results reaching the doctor? |
| 3 | 6-9s | Is every bill captured? (orange pulsing "?") |
| 4 | 9-12s | Still using paper files? |
| 5 | 12-17s | **Mega-Net EHR Cloud** / Patient records, lab, prescriptions and billing in one system for hospitals and clinics |
| 6 | 17-20s | Book a / free demo; WhatsApp: +2347035682478; meganetsoftware.com.ng; logo badge + Mega-Net Software |

## Voiceover (edge-tts, voice `en-NG-AbeoNeural` only)

Only leading/trailing silence trimmed (threshold -50 dB, 20 ms kept); nothing trimmed inside a line.
Times are of the speech in `public/voiceover-ehr.mp3` before MP3 encoding.

| # | Line | Start | End | Speed | Gap to next line |
|---|---|---|---|---|---|
| 1 | How long do your patients wait? | 0.00s | 1.54s | 1.00x | 1.46s |
| 2 | Do lab results reach the doctor on time? | 3.00s | 5.11s | 1.00x | 0.89s |
| 3 | Is every single bill captured? | 6.00s | 7.39s | 1.00x | 1.61s |
| 4 | Or are you still using paper files? | 9.00s | 10.86s | 1.00x | 1.44s |
| 5 | Mega-Net EHR Cloud, records, lab and billing in one system. | 12.30s | 16.27s | 1.00x | 0.73s (ends before 16.6s) |
| 6 | Book a free demo. Message us on WhatsApp. | 17.00s | 19.86s | 1.05x | end of file |

Line 5 as first written ("Mega-Net EHR Cloud. Records, lab and billing in one system.") needed 1.10x and still ended at 16.602s, so the comma wording was used.

Loudness: mixed track, then ffmpeg `loudnorm` (I=-16.5, TP=-2), +3.5 dB and a limiter (-0.9 dB ceiling), mono 44.1 kHz MP3 128 kbps. The MP3 decodes to 20.04s (MP3 frame granularity); the video is 20.00s.
Remotion's mono-to-stereo mix is about 3 dB lower than the file, so the file was set about 3 dB hotter to land the video near -18 dB.

Measured on the rendered `out/meganet-ehr-ad.mp4` (ffmpeg volumedetect): mean -18.7 dB, peak -4.3 dB. (The ERP ad ended at -25 dB.)

## EHR features confirmed in the code

Checked in `EHR-Cloud-` (React routes in `frontend/src/App.jsx`, API modules in `api/`, `docs/support/*.md`). Each of the 11 sidebar items you named has a page and a backend API:

Dashboard; Patient Search; Patient Registry; Register Patient; Nurses Bay (queue, walk-in intake, ANC); Consultation Queue and Consultation; Lab (order, worklist, my orders, catalog); Prescribe / Pharmacy (worklist, drug list, controlled-substance log); Billing (queue, invoices, claims, payers, tariffs); Inventory (items, suppliers, low stock, purchase orders); Admissions (ward board, admit, wards).

Other modules also present, not used in the ad: Radiology, Surgery, Inpatient Nursing, Scheduling and appointments, Business Insights, Financial Sentinel, SMS, Messages, Documents, Support.

How each on-screen claim is backed:
- Patient waits: queues show "waiting since"; the Visits Dashboard charts average wait time.
- Lab results reaching the doctor: My Lab Orders, the lab panel in Consultation, and Encounter Summary show results with flags.
- Every bill captured: Financial Sentinel detects services that were never billed (and duplicates, claims issues). It detects and reports; it does not fix.
- Paper files: Patient Registry, Registration and patient detail records.
- Subtitle (records, lab, prescriptions, billing): all four exist as modules.

**Billing does not add charges automatically.** Per `docs/support/billing.md`, there is no automatic charge accrual from an encounter: a new invoice is an empty draft and every line item is added by hand. Nothing in the ad claims otherwise.

**Not run on a live system.** This is a read-through of the code, routes and docs only. Django and a database were not set up in this session and the app was not run. Nothing was checked on `meganet-web-staging` or `meganet-web` (production).
