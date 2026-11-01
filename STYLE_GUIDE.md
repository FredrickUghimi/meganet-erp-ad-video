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
- Build every scene inside a clip box (see `SceneFrame` in `src/MegaNetLedgerAd.tsx`) so slides and wipes cannot leave it. The clip box is x 80-920, **y 200-1163**: it stops 24px above the caption zone, so a transition (slide, wipe, flip, block build, door split) can never carry scene content under a caption either. Content at rest should end by about y 1140 so the soft card shadow is not sliced by the clip.
- Captions: burned in, word for word, at most 2 lines, bottom edge at **y <= 1360** (the Ledger ad rests at y 1340). White pill, ink text, orange highlight on the spoken word. Keep each word unbroken (`white-space: nowrap`).
- **Caption zone (nothing with meaning may sit under a caption).** The caption zone is the full caption box rectangle at its *maximum two-line height*, not the height of the current line: x 110-890, y 1188-1340 (2 x 48px x 1.22 line height + 28px padding + 6px border, bottom edge y=1340). ALL scene content (text, cards, icons, chips, labels, the CTA block, the WhatsApp number, the website) must end at least **24px** above the zone top, i.e. at **y <= 1163** (the Sentinel ad's content ends at about y=1170). Do not solve a collision by lowering the captions into the Shorts title area; captions still end at y <= 1360. Only decorative background gradients and glows may extend behind captions. Design scenes to the 200-1163 band; 1164-1440 is for gradients only.
- Check the caption zone on every frame, on lossless PNG frames, with a negative control: render the composition with the caption layer off (`--props='{"debug":"nocaps"}'`) and gradients only (`'{"debug":"bg"}'`), then run `scripts/verify_caption_overlap.py NOCAPS_DIR BG_DIR --scene-starts ...`. It diffs every frame inside the zone plus the 24px band above it and fails on any scene pixel there. Prove it can fail with `--negative-control` (synthetic box inside the zone must be caught, a box just clear of the band must not) and with a rendered control (`'{"debug":"nocaps-violate-caption"}'` and `'nocaps-violateweak-caption'`, run with `--expect-fail`). The diff is taken with captions off because an opaque caption pill would hide the very content being looked for.
- Check on every frame, with a negative control: render the composition twice (full and `debug: 'bg'` gradients only), diff every frame, and prove the check fails when a box is placed just outside each edge (`scripts/verify_safe_area.py`, `scripts/verify_safe_area_lossless.py`). Because the palette is pale, check at a low threshold and, where possible, on lossless PNG frames (`remotion render --sequence --image-format=png`); H.264 ringing at hard moving edges alone can exceed 18/255 for a few pixels.

## 4. Voice, timing, claims

- Voice: a Microsoft `en-NG` neural voice, word-level timing, no music, never sped up, pauses between sentences about 0.3s, 2s frozen hold after the voice ends. **Series default: `en-NG-AbeoNeural` (male).** The voice is a per-feature choice: an ad uses a different `en-NG` voice only when the brief for that ad says so, and its script doc must name the voice and say it is a deliberate exception. The Voice column in section 5 records which voice each ad uses. Narration timing always comes from that ad's own generated audio, never from another ad's timings. Point `certifi` at `/root/.ccr/ca-bundle.crt` if TLS fails; verification stays on.
- Captions match the narration word for word (`scripts/verify_captions_ledger.py` pattern).
- No figures, names or statistics; rows, bars and chips are drawn placeholders. No app screenshots. Every product claim traced to the backend or frontend code and written up in the ad's script doc, with what is deliberately not claimed.
- CTA: "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng.

## 5. Hook rule: every ad in the series uses a different hook style

The first scene of each ad must be built differently from every other ad's first scene, in layout, motion and transition. Pick a style that is not on this list, and add the new one to it.

| Ad | Hook style | Voice |
|---|---|---|
| `MegaNetAd` (ERP) | Questions as on-screen text cards | not recorded in the repo |
| `MegaNetEhrAd` | Questions as on-screen text cards, one pulsing "?" | Abeo |
| `MegaNetSentinelAd` | Short staccato statements stacked line by line | Abeo |
| `MegaNetAssistantAd` | Typed question field, then answer bubbles | Abeo |
| `MegaNetLedgerAd` | A dotted trail line draws across the screen and lands on a ledger row while the words slide in | Abeo |
| `MegaNetProfitLossAd` | Mini-story told on objects, not text lines: a calendar page with its last day marked flips away to reveal a report card, and a green bottom-line pill lands on it; each beat's words sit on the object as a label | Abeo |
| `MegaNetCashFlowAd` | Command-style: a single imperative ("Follow your cash.") stamped as a prompt line (">" Follow / your / cash tiles) while four corner brackets lock onto a coin; no question, no trail line, no object story | Abeo |
| `MegaNetPharmacyInteractionAd` | "Spot the collision": two drug tiles slide toward each other, an orange stop-bar drops between them and halts them, and the label "Interaction warning" lands; the words sit under the object in the caption pill, no question, no trail, no calendar story, no command stamp | Ezinne (`en-NG-EzinneNeural`, female; per-feature exception requested by the project owner) |

Scene transitions should also vary between ads. The Cash Flow ad uses vertical blinds, a clock wipe, a blur dissolve, a diamond iris and a fade-through; the Pharmacy Interaction ad uses a split (barn doors from the centre line), a circle iris and a zoom-fade. The Ledger ad uses slides and wipes only, in a different direction at each cut (slide-left, wipe-up, slide-right, diagonal wipe, slide-up), all inside the safe area.
