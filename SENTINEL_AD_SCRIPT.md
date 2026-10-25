# Mega-Net EHR Cloud: Financial Sentinel ad (20.7 s, 1080x1920, 30 fps)

Composition `MegaNetSentinelAd` (`src/MegaNetSentinelAd.tsx`, copy in the comment block at the top). `MegaNetAd` and `MegaNetEhrAd` are unchanged.
Render: `npx remotion render MegaNetSentinelAd out/meganet-sentinel-ad.mp4 --browser-executable=/opt/pw-browsers/chromium` (cloud sessions).

| Scene | Time | On screen | Narration (captions match word for word) |
|---|---|---|---|
| 1 | 0-3.95s | Tests done. / Drugs dispensed. / Billed? / Or lost? | "Tests done. Drugs dispensed. Billed? Or lost?" |
| 2 | 3.95-7.2s | Logo card, shield badge, Financial Sentinel, in Mega-Net EHR Cloud | "Meet Financial Sentinel, in Mega-Net EHR Cloud." |
| 3 | 7.2-13.8s | Illustrated Run Analysis button (not a screenshot), Clinical records vs Bills, chips: Unbilled services, Duplicate transactions, Rejected claims | "One click checks clinical records against bills and flags unbilled services, duplicates and rejected claim patterns." |
| 4 | 13.8-17.4s | Each finding / Critical, High, Medium, Informational / Explained. / Your team decides. | "Each finding is ranked and explained. Your team decides." |
| 5 | 17.4-20.7s | Book a free demo, WhatsApp +2347035682478, meganetsoftware.com.ng, logo card | "Book a free demo. Message us on WhatsApp." |

47 words. Voice `en-NG-AbeoNeural` (edge-tts), no music. Last spoken word ends 20.15 s; the last frame holds to 20.70 s (0.55 s).
Audio: `public/voiceover-sentinel.mp3`, built by `scripts/build-sentinel-voiceover.py`. The voice leaves ~0.9 s after every sentence; those pauses were cut to 0.25-0.35 s and gaps between lines are 0.30 s. No word is trimmed, sped up or changed. Word timings drive the scenes and captions (`src/sentinelTimings.ts`).
Measured on the render: mean -17.1 dB, peak -3.3 dB.

## Claims and where they come from (EHR-Cloud-, `docs/support/financial_sentinel.md`, `financial_sentinel/*.py`)

- One click: the Sentinel Dashboard has a **Run Analysis** button (on demand; no scheduled runs, alerts or emails).
- Checks clinical records against bills: detection reads lab, radiology, pharmacy dispensing and surgery records against invoices, payments and claims.
- Unbilled services, duplicate transactions, rejected claim patterns: three of the six live detection categories (the others are capitation/FFS double-billing, stale claims, tariff drift; not shown).
- Ranked: each finding has a severity (Critical, High, Medium, Informational) from its estimated Naira impact.
- Explained: each finding gets a plain-language explanation and recommended action (AI-written, or a fact-based template if the AI is unavailable).
- Your team decides: findings are read-only; the tool takes no action itself.

Not claimed: real-time or 24/7 monitoring, automatic fixes or recovery of money, that every missed charge is caught (matching a service to a bill is best-effort), discount/waiver/refund monitoring (not built). No figures, patient data or medical claims.
Read from the code only (EHR-Cloud- at 074d814); the app was not run and nothing was checked on staging or production.
