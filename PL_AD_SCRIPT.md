# MegaNetProfitLossAd: script and build notes

1080x1920, 30fps, 655 frames (21.83s): 0.4s lead-in, voice 19.43s, 2s frozen hold after the voice (lossless frames 595-654 identical).
Voice: Microsoft `en-NG-AbeoNeural` (male), one edge-tts call per sentence with word boundaries, sentences joined with 0.3s gaps (longest silence between any two words 0.39s), no speed-up, no music.
Look and rules: `STYLE_GUIDE.md` (light blue/orange family, text >= 32px and >= 4.5:1, safe area x 80-920 / y 200-1440, captions end by y 1360, max 2 lines). Green is the accent for profit.
No figures, names or statistics: rows, chips and bars are drawn placeholders (bar heights in the chart are illustrative, not data).

## Script and scenes (frames at 30fps; captions burned in, word for word)

| # | Scene starts | Voice | On screen | Transition in |
|---|---|---|---|---|
| 1 | 0 | "Month end. One report. Your answer." | Mini-story on objects: a calendar page with its last day marked and a "Month end" label flips up and away; a report card with an "One report" label is revealed; a green "Your answer" pill lands on it | none (start) |
| 2 | 98 | "Meet the Profit and Loss report. Pick a period, or set your own dates." | "Profit & Loss" title, Period select showing "This month", drawn chips This month / Last month / This quarter / Custom range, then Start date / End date | zoom in |
| 3 | 238 | "See your income and your expenses, line by line." | "Income" card and "Expenses" card, placeholder rows, "Total income" / "Total expenses" rows | card flip (vertical axis) |
| 4 | 331 | "Income minus expenses gives your net profit." | Income bar, minus, Expenses bar, equals, green "Net Profit" bar | zoom out |
| 5 | 415 | "Your dashboard shows a profit summary too, for accounting roles only." | "Profit Summary" card, then a lock/eye card "Accounting roles only / Other roles don't see this card" | card flip (horizontal axis) |
| 6 | 537 | "Book a free demo with Mega-Net." | Logo card, "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng (frozen from frame 595) | pop |

Hook style (added to the table in `STYLE_GUIDE.md`): words sit on objects as labels instead of stacked text lines, which separates it from the Sentinel ad's staccato lines. "Month end. One report. Your answer." is a story beat, not a feature claim.

## What each claim rests on (backend `mega-net-erp-cloud`, frontend `mega-net-erp-cloud-web`; app not run)

- Income, Expenses, Net Profit: `apps/reports/services.py` `profit_and_loss` (`net_profit = total_income - total_expenses`); labels "Income", "Total income", "Expenses", "Total expenses", "Net Profit" in `src/pages/ProfitAndLossPage.tsx`. The app says "Income", not "revenue", so the ad does too.
- Line by line with totals: `ProfitAndLossPage.tsx` `LineList`.
- Income / Expenses / Net Profit bar chart: `ProfitAndLossPage.tsx` ("Income vs. Expenses vs. Net Profit").
- Period presets and custom dates: `apps/reports/periods.py` `RANGE_PRESETS`, `resolve_range` (default `this_month`); `src/components/reports/PeriodSelector.tsx` (This month, Last month, This quarter, Custom range, "Start date", "End date"; the ad draws four of the eight options).
- Dashboard "Profit Summary": `apps/dashboard/services.py` `profit_summary`, `apps/dashboard/views.py` (left out of the response without `can_view_accounting`), `src/pages/DashboardPage.tsx`.
- Accounting roles only: `apps/reports/views.py` `ReportsViewSet.permission_classes = [CanViewAccounting]`, `apps/core/permissions.py`; `src/lib/reportCatalog.ts`, `src/App.tsx` `RequirePermission`.
- Not claimed anywhere: cost of goods sold as a section, gross profit, comparison with a previous period, export (PDF/CSV/Excel), "last quarter", a loss label, any figure, any named role, a user-chosen dashboard period.

## Rebuild

```
export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
python3 -I scripts/pl_voice.py <scratch-dir>   # public/voiceover-pl.mp3 + src/plTimings.ts
npm run render:pl                              # out/meganet-pl-ad.mp4
npm run poster:pl                              # out/meganet-pl-poster.png
# checks (last run: out/pl-verification.txt)
npx remotion render MegaNetProfitLossAd bg.mp4 --props='{"debug":"bg"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetProfitLossAd caps.mp4 --props='{"debug":"caps"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetProfitLossAd full-png --sequence --image-format=png --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetProfitLossAd bg-png --sequence --image-format=png --props='{"debug":"bg"}' --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/verify_safe_area_lossless.py full-png bg-png
python3 -I scripts/verify_captions_pl.py caps.mp4 bg.mp4
node scripts/pl_audit.mjs audit-dir && python3 -I scripts/ledger_audit.py audit-dir
```

`scripts/ledger_*`, `verify_*` and `STYLE_GUIDE.md` are copied unchanged from the `ledger-ad` branch; `pl_voice.py`, `pl_audit.mjs` and `verify_captions_pl.py` are the same scripts with this ad's names and narration.
