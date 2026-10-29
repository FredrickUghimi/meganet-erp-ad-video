# MegaNetLedgerAd — script and build notes

1080x1920, 30fps, 562 frames (18.73s): 0.4s lead-in, voice 16.32s, 2s frozen hold after the voice.
Voice: Microsoft `en-NG-AbeoNeural` (male), one edge-tts call per sentence with word boundaries, sentences joined with 0.3s gaps (longest silence between any two words: 0.39s), no speed-up, no music.
No figures, names or statistics anywhere: rows, chips and bars are drawn placeholders.

## Script and scenes (frames at 30fps; captions burned in, word for word)

| # | Frames | Voice | On screen | Gradient |
|---|---|---|---|---|
| 1 | 0-53 | "Where did the money go?" | Question bubble, coins drifting into a drawn ledger book | Blue to indigo to purple |
| 2 | 54-163 | "Meet the General Ledger. Pick an account, choose your dates." | "General Ledger" title, Account select that opens (placeholder options), Start date / End date chips | Orange to red |
| 3 | 164-281 | "Every debit and credit, with its reference and a running balance." | Table with Reference / Debit / Credit / Running balance columns lighting up on their words, Opening and Closing balance rows, placeholder row chips | Teal to green |
| 4 | 282-366 | "Entries are never edited, only reversed." | "Journal entry" card with a crossed-out pencil, then a "Reversal" card with debit/credit swapped and a reverse arrow | Soft purple to deep purple |
| 5 | 367-446 | "Only roles with accounting access can view it." | Lock, "Other roles / No accounting access" card, "Accounting access / Can view the General Ledger" card | Navy to blue to teal |
| 6 | 447-561 | "Book a free demo with Mega-Net." | Logo card, "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng (frozen from frame 502) | Blue to orange |

## What each claim rests on (read from the backend and frontend repos, app not run)

- Account picker, required: `apps/reports/views.py` `general_ledger` (`account_id` required) and `general_ledger_accounts`; `src/pages/GeneralLedgerPage.tsx`.
- Date range: same view, `period` or `start_date`/`end_date`; `PeriodSelector`.
- Debit, credit, reference, running balance, opening and closing balance: `apps/reports/services.py` `general_ledger`; `src/components/reports/StatementTable.tsx`.
- Entries are never edited, only reversed: `apps/accounting/models.py` `JournalEntry` docstring; `apps/accounting/views.py` `JournalEntryViewSet` allows create/list/retrieve plus a `reverse` action only.
- Only roles with accounting access: `apps/reports/views.py` `ReportsViewSet.permission_classes = [CanViewAccounting]`; `apps/core/permissions.py`; `src/lib/reportCatalog.ts`.
- Not claimed anywhere: export of any kind, draft or approval states, drill-down, real-time, statements, any figure, any named role.

## Rebuild

```
export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
python3 -I scripts/ledger_voice.py <scratch-dir>   # public/voiceover-ledger.mp3 + src/ledgerTimings.ts
npm run render:ledger                              # out/meganet-ledger-ad.mp4
npm run poster:ledger                              # out/meganet-ledger-poster.png
# checks
npx remotion render MegaNetLedgerAd bg.mp4 --props='{"debug":"bg"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetLedgerAd caps.mp4 --props='{"debug":"caps"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/verify_safe_area.py out/meganet-ledger-ad.mp4 bg.mp4
python3 -I scripts/verify_captions_ledger.py caps.mp4 bg.mp4
```

edge-tts builds its TLS context from `certifi`, so `scripts/ledger_voice.py` points `certifi.where()` at `/root/.ccr/ca-bundle.crt`; verification stays on. Results of the last run are in `out/ledger-verification.txt`.
