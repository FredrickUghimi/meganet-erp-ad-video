# MegaNetBalanceSheetAd: script and build notes

1080x1920, 30fps, 640 frames (21.33s): 0.4s lead-in, voice 18.93s, 2s frozen hold after the voice.
Voice: Microsoft `en-NG-AbeoNeural` (male), one edge-tts call per sentence with word boundaries, sentences joined with 0.3s gaps, no speed-up, no music (`scripts/bs_voice.py`, certifi pointed at `/root/.ccr/ca-bundle.crt`, verification on).
Look and rules: `STYLE_GUIDE.md` (light blue/orange family, blue accent, text >= 32px and >= 4.5:1, safe area x 80-920 / y 200-1440, captions end by y 1340, max 2 lines).
No figures, names or statistics, no app screenshots: blocks, stacks, pans, bars and the date stamp are drawn placeholders with no account names and no date text.

## Script and scenes (approved wording, used word for word; captions burned in)

| # | Scene starts (frame) | Voice | On screen | Transition in |
|---|---|---|---|---|
| 1 | 0 | "Your business, measured on one day. The Balance Sheet Report in Mega-Net ERP Cloud." | Snapshot hook: viewfinder brackets close in on a drawn block stack and snap shut on "day" (flash, orange brackets, placeholder date stamp); the title card "Balance Sheet Report / in Mega-Net ERP Cloud" lands and stays | none (start) |
| 2 | 161 | "Choose a date, and see where your business stands." | "Balance Sheet", an "As of" date field (calendar glyph, placeholder bar), a drawn calendar with one cell picked, three small block stacks | split doors, vertical seam |
| 3 | 250 | "Total assets on one side. Total liabilities plus equity on the other." | Two-pan balance with placeholder blocks, legend cards "Total assets" and "Total Liabilities + Equity" | stacked-block build |
| 4 | 384 | "Open only to people you've given accounting permission." | "Balance Sheet" card, lock card "Accounting permission / Required to view this report"; the lock turns into an eye | split doors, horizontal seam |
| 5 | 470 | "Want to see yours? Message us on WhatsApp for a free demo." | Logo (`logo-trim.jpg`), "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng | fade-through |

Hook style (row added to `STYLE_GUIDE.md`): "Snapshot hook: a viewfinder snaps shut on a drawn block structure while the spoken statement names the report and product. It has no question, trail line, command prompt, object story or split screen."
Transitions differ from the Ledger ad (slides/wipes), P&L ad (zooms/flips) and Cash Flow ad (blinds, clock wipe, blur dissolve, diamond iris): split doors (halves slide apart from a vertical seam), a stacked-block build (columns of blocks rise, coloured blocks cap each column), split doors on a horizontal seam, fade-through. All run inside a clip box of exactly the safe area. The "stacked blocks collapse" transition from the first proposal was dropped because the 5-scene script has four cuts.

## What each claim rests on (backend `mega-net-erp-cloud`, frontend `mega-net-erp-cloud-web`; app not run)

- Balance Sheet Report, "what the business owns, owes, and is worth as of a date": `src/lib/reportCatalog.ts` (label "Balance Sheet", description).
- One day, choose a date: `apps/reports/periods.py` `resolve_as_of` (single `as_of`, default the organization's today), `apps/reports/services.py` `balance_sheet`; `src/pages/BalanceSheetPage.tsx` ("As of" date input).
- Total assets / Total liabilities + equity: `BalanceSheetPage.tsx` ("Total assets", "Total liabilities", "Total equity", "Total Liabilities + Equity"); `services.balance_sheet` (`total_assets`, `total_liabilities_and_equity`). The drawn two-pan balance ends level as a visual of these two totals; the ad makes no spoken or written claim that they match (the app computes `is_balanced` and shows a warning only when they do not).
- Accounting permission: `apps/reports/views.py` `ReportsViewSet.permission_classes = [CanViewAccounting]`, flag `can_view_accounting` (`apps/core/permissions.py`); `src/lib/reportCatalog.ts` `FINANCIAL`, route guard in `src/App.tsx`. No role is named. The card line "Required to view this report" is the ad's own wording of the same rule.
- Not claimed anywhere: period or presets (none exist for this report), comparison, export, dashboard summary, a "balanced" confirmation, account names, current/non-current split, retained earnings, any figure or date, any named role.

## Rebuild

```
export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
python3 -I scripts/bs_voice.py <scratch-dir>   # public/voiceover-balancesheet.mp3 + src/bsTimings.ts
npm run render:balancesheet                    # out/meganet-balancesheet-ad.mp4
npm run poster:balancesheet                    # out/meganet-balancesheet-poster.png
# checks (last run: out/balancesheet-verification.txt)
npx remotion render MegaNetBalanceSheetAd full-png --sequence --image-format=png --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetBalanceSheetAd bg-png --sequence --image-format=png --props='{"debug":"bg"}' --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/verify_safe_area_lossless.py full-png bg-png
npx remotion render MegaNetBalanceSheetAd caps.mp4 --props='{"debug":"caps"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetBalanceSheetAd bg.mp4 --props='{"debug":"bg"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/verify_captions_bs.py caps.mp4 bg.mp4
node scripts/bs_audit.mjs audit-dir && python3 -I scripts/ledger_audit.py audit-dir
```
