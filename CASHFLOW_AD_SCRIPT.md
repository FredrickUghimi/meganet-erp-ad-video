# MegaNetCashFlowAd: script and build notes

1080x1920, 30fps, 650 frames (21.67s): 0.4s lead-in, voice 19.28s, 2s frozen hold after the voice.
Voice: Microsoft `en-NG-AbeoNeural` (male), one edge-tts call per sentence with word boundaries, sentences joined with 0.3s gaps, no speed-up, no music.
Look and rules: `STYLE_GUIDE.md` (light blue/orange family, text >= 32px and >= 4.5:1, safe area x 80-920 / y 200-1440, captions end by y 1360, max 2 lines). Green marks cash in, red marks cash out.
No figures, names or statistics: rows, chips and bars are drawn placeholders (bar lengths in the Cash In vs. Cash Out chart are illustrative, not data). The Cash In and Cash Out rows carry no category names.

## Script and scenes (approved wording, used word for word; frames at 30fps; captions burned in)

| # | Scene starts | Voice | On screen | Transition in |
|---|---|---|---|---|
| 1 | 0 | "Follow your cash." | Command-style hook: a ">" prompt tile "Follow", then "your" and "cash" tiles stamp in while four corner brackets close on a coin and lock | none (start) |
| 2 | 44 | "Meet the Cash Flow report. Pick a period, or set your own dates." | "Cash Flow" title, Period select showing "This month", drawn chips This month / Last month / This quarter / Custom range, then Start date / End date | vertical blinds |
| 3 | 174 | "See your opening balance, cash in, cash out, and closing balance." | "Opening Balance" and "Closing Balance" cards, "Cash In vs. Cash Out" chart (bars labelled "Cash in" / "Cash out"), "Net Change in Cash" strip, "Cash In" and "Cash Out" cards with blank placeholder rows | clock wipe |
| 4 | 316 | "It tracks cash that actually moved. A credit sale counts once it's paid." | A coin travels from a customer tile into a wallet tile; a "Credit sale" card waits (clock chip, empty bar), then turns into a green "Paid" chip and the bar fills | blur dissolve |
| 5 | 447 | "Only roles with accounting permission can view it." | A "Cash Flow" report card, then a lock card "Accounting permission / Required to view this report" whose lock turns into an eye | diamond iris |
| 6 | 532 | "Book a free demo with Mega-Net." | Logo card, "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng | fade-through |

Hook style (added to the table in `STYLE_GUIDE.md`): a command, not a question. It differs from the questions of the ERP/EHR ads, the staccato lines of Sentinel, the typed field of Assistant, the trail line of Ledger and the calendar story of P&L.
Transitions differ from the Ledger ad (slides and wipes in a different direction at each cut) and the P&L ad (zoom, card flips, pop, circular background reveal): vertical blinds, clock wipe, blur dissolve, diamond iris, fade-through; backgrounds cross-fade. All run inside a clip box of exactly the safe area.

## What each claim rests on (backend `mega-net-erp-cloud`, frontend `mega-net-erp-cloud-web`; app not run)

- Cash in, cash out, opening and closing balance: `apps/reports/services.py` `cash_flow` (opening balance = Cash & Bank balance the day before the start date, closing = balance at the end date; cash in = debits and cash out = credits to Cash & Bank and its child accounts in the period). The "Cash In" / "Cash Out" rows are listed by journal-entry memo; the ad draws blank placeholders and names no category.
- Net Change in Cash: same function (`net_change_in_cash = total_cash_in - total_cash_out`); label in `src/pages/CashFlowPage.tsx`. Shown as a label with a placeholder bar; not narrated.
- On-screen labels, exactly as in `CashFlowPage.tsx`: "Cash Flow", "Opening Balance", "Closing Balance", "Net Change in Cash", "Cash In vs. Cash Out" (bars "Cash in" / "Cash out"), section headings "Cash In" and "Cash Out"; `src/components/reports/PeriodSelector.tsx`: "Period", "Start date", "End date", and the options This month, Last month, This quarter, Custom range (the ad draws four of the eight options: Today, This week, This month, Last month, This quarter, This financial year, Last financial year, Custom range).
- Period or own dates: `apps/reports/periods.py` `RANGE_PRESETS`, `resolve_range` (default `this_month`; start and end date must come together).
- Cash that actually moved, a credit sale counts once paid: docstring of `services.cash_flow` ("derived from postings to the Cash & Bank account ... never inferred from Net Profit ... a credit sale recognizes revenue immediately with no cash moving until later"). The ad says only that a credit sale counts once it is paid.
- Accounting permission: `apps/reports/views.py` `ReportsViewSet.permission_classes = [CanViewAccounting]` (Cash Flow is not one of the operational reports that also accept another role), `apps/core/permissions.py`; `src/lib/reportCatalog.ts` (`FINANCIAL = ['can_view_accounting']`), `src/App.tsx` route guard. No role is named in the ad.
- Not claimed anywhere: export (PDF/CSV/Excel; none exists), comparison with a previous period (none exists), operating/investing/financing sections (none exist), category names, any figure, any named role, an invoice-aging or customer-balance claim.

## Rebuild

```
export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
python3 -I scripts/cashflow_voice.py <scratch-dir>   # public/voiceover-cashflow.mp3 + src/cashflowTimings.ts
npm run render:cashflow                              # out/meganet-cashflow-ad.mp4
npm run poster:cashflow                              # out/meganet-cashflow-poster.png
# checks (last run: out/cashflow-verification.txt)
npx remotion render MegaNetCashFlowAd bg.mp4 --props='{"debug":"bg"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetCashFlowAd caps.mp4 --props='{"debug":"caps"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetCashFlowAd full-png --sequence --image-format=png --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetCashFlowAd bg-png --sequence --image-format=png --props='{"debug":"bg"}' --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/verify_safe_area_lossless.py full-png bg-png
python3 -I scripts/verify_captions_cashflow.py caps.mp4 bg.mp4
node scripts/cashflow_audit.mjs audit-dir && python3 -I scripts/ledger_audit.py audit-dir
```

`scripts/ledger_audit.py`, `verify_safe_area_lossless.py` and `STYLE_GUIDE.md` are reused unchanged; `cashflow_voice.py`, `cashflow_audit.mjs` and `verify_captions_cashflow.py` are the P&L scripts with this ad's names and narration.
