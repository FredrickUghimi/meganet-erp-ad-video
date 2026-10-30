# Mega-Net ad series: style guide

Applies to every new vertical ad (1080x1920, 30fps, programmatic Remotion). The Ledger ad (`MegaNetLedgerAd`) is the reference build. The four earlier ads (`MegaNetAd`, `MegaNetEhrAd`, `MegaNetSentinelAd`, `MegaNetAssistantAd`) predate this guide and have not been recoloured.

## 1. Look: light, airy, brand blue and orange

Family taken from the Ledger ad's call-to-action scene: brand blue into brand orange, lightened. Backgrounds are near-white, pale blue or pale peach gradients (one distinct gradient per scene, soft drifting glows). Colour comes from accents: white cards, tiles, chips, bars and icons.

| Role | Colour | Use |
|---|---|---|
| Brand blue | `#1A6DE0` | fills, tiles, chevrons, bars |
| Brand orange | `#F7941D` | fills, tiles, active-word highlight, arrival rings |
| Green | `#12875A` | debit / positive chips (fill only) |
| Red | `#D8383D` | credit / negative chips (fill only) |
| Teal | `#0E9AA7` | date and balance accents (fill only) |
| Soft lavender | `#9B8CF5` | one accent tile at most (fill only) |
| Ink | `#1B2430` | all body text on light backgrounds (charcoal, not navy) |
| Muted | `#44506A` | secondary text, not-yet-spoken caption words |
| Text blue / orange / green / red / teal | `#1458B5` / `#9E3F00` / `#0B6E46` / `#B42328` / `#0A6A74` | the only colours allowed for coloured text on white or pale backgrounds |
| White | `#FFFFFF` | cards, caption pill, text on solid green/blue pills |

Not allowed: deep purples, navy or other dark backgrounds, dark gradients, white text on pale backgrounds. Fill colours above are for shapes only; coloured *text* uses the text variants.

Cards: white, 3px `#C9DCF6` border, soft blue-tinted shadow. Font: Inter (Inter Display fallback), weights 800-900 for anything on screen.

## 2. Contrast and font rules

- All text at least **4.5:1** against the pixels behind it, measured, not eyeballed (`scripts/ledger_audit.mjs` + `scripts/ledger_audit.py`: every text node on settled frames, worst pixel behind its box, text-less render of the same frame).
- Every label at least **32px** (the Ledger ad's smallest is 32px; table headings, chip labels, form labels and role subtitles included). Headings 42-116px, captions 48px.
- Never lower text contrast with opacity; use a solid colour instead. Unspoken caption words are `#44506A` on white, the spoken word gets an orange highlight with ink text.
- Measure at settled frames. Text mid-entry (cards fading or sliding in for about 0.3s) is transient and is not part of the contrast check.

## 3. Safe area and captions

- All text, cards, icons and animation inside **x 80-920, y 200-1440**. Full-bleed gradients may go beyond.
- Build every scene inside a clip box of exactly the safe area (see `SceneFrame` in `src/MegaNetLedgerAd.tsx`) so slides and wipes cannot leave it.
- Captions: burned in, word for word, at most 2 lines, bottom edge at **y <= 1360** (the Ledger ad rests at y 1340). White pill, ink text, orange highlight on the spoken word. Keep each word unbroken (`white-space: nowrap`).
- Check on every frame, with a negative control: render the composition twice (full and `debug: 'bg'` gradients only), diff every frame, and prove the check fails when a box is placed just outside each edge (`scripts/verify_safe_area.py`, `scripts/verify_safe_area_lossless.py`). Because the palette is pale, check at a low threshold and, where possible, on lossless PNG frames (`remotion render --sequence --image-format=png`); H.264 ringing at hard moving edges alone can exceed 18/255 for a few pixels.

## 4. Voice, timing, claims

- Voice: Microsoft `en-NG-AbeoNeural` (male), word-level timing, no music, never sped up, pauses between sentences about 0.3s, 2s frozen hold after the voice ends. Point `certifi` at `/root/.ccr/ca-bundle.crt` if TLS fails; verification stays on.
- Captions match the narration word for word (`scripts/verify_captions_ledger.py` pattern).
- No figures, names or statistics; rows, bars and chips are drawn placeholders. No app screenshots. Every product claim traced to the backend or frontend code and written up in the ad's script doc, with what is deliberately not claimed.
- CTA: "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng.

## 5. Hook rule: every ad in the series uses a different hook style

The first scene of each ad must be built differently from every other ad's first scene, in layout, motion and transition. Pick a style that is not on this list, and add the new one to it.

| Ad | Hook style |
|---|---|
| `MegaNetAd` (ERP) | Questions as on-screen text cards |
| `MegaNetEhrAd` | Questions as on-screen text cards, one pulsing "?" |
| `MegaNetSentinelAd` | Short staccato statements stacked line by line |
| `MegaNetAssistantAd` | Typed question field, then answer bubbles |
| `MegaNetLedgerAd` | A dotted trail line draws across the screen and lands on a ledger row while the words slide in |
| `MegaNetProfitLossAd` | Mini-story told on objects, not text lines: a calendar page with its last day marked flips away to reveal a report card, and a green bottom-line pill lands on it; each beat's words sit on the object as a label |

Scene transitions should also vary between ads. The Ledger ad uses slides and wipes only, in a different direction at each cut (slide-left, wipe-up, slide-right, diagonal wipe, slide-up), all inside the safe area.
