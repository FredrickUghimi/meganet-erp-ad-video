# MegaNetLedgerAd: script and build notes

1080x1920, 30fps, 571 frames (19.03s): 0.4s lead-in, voice 16.62s, 2s frozen hold after the voice (lossless frames 512-570 identical to frame 511).
Voice: Microsoft `en-NG-AbeoNeural` (male), one edge-tts call per sentence with word boundaries, sentences joined with 0.3s gaps (longest silence between any two words: 0.39s), no speed-up, no music.
Look: light and airy, brand blue + orange family, dark text, all text >= 4.5:1 and >= 32px. Rules in `STYLE_GUIDE.md`.
No figures, names or statistics anywhere: rows, chips and bars are drawn placeholders.

## Script and scenes (frames at 30fps; captions burned in, word for word)

| # | Scene starts | Voice | On screen | Transition in | Background (light) |
|---|---|---|---|---|---|
| 1 | 0 | "Every naira leaves a trail." | Words slide up one by one as spoken; a dotted blue-to-orange trail draws across the screen with a moving head and lands on a ledger row (placeholder pills) with an arrival ring | none (start) | White to pale blue to pale peach |
| 2 | 59 | "Meet the General Ledger. Pick an account, choose your dates." | "General Ledger" title, Account select that opens (placeholder options), Start date / End date chips | slide left | Cream to peach to pale blue |
| 3 | 173 | "Every debit and credit, with its reference and a running balance." | Reference / Debit / Credit / Running balance columns lighting up on their words, Opening and Closing balance rows, placeholder row chips | wipe up | Pale blue to sky to cream |
| 4 | 291 | "Entries are never edited, only reversed." | "Journal entry" card with a crossed-out pencil, then a "Reversal" card with debit and credit swapped and a reverse arrow | slide right | Cream to apricot to pale blue |
| 5 | 376 | "Only roles with accounting access can view it." | Lock, "Other roles / No accounting access" card, "Accounting access / Can view the General Ledger" card | diagonal wipe | Pale blue to periwinkle-sky to cream |
| 6 | 456 | "Book a free demo with Mega-Net." | Logo card, "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng (frozen from frame 511) | slide up | Pale blue to cream to orange |

Changes in this revision: scene 1 narration was "Where did the money go?" and is now "Every naira leaves a trail." with a new trail-drawing layout; every scene recoloured to the light blue-and-orange family; labels raised to 32px or more; transitions changed from fades to slides and wipes clipped to the safe area; captions are a white pill with an orange highlight on the spoken word.

## What each claim rests on (read from the backend and frontend repos, app not run)

- Account picker, required: `apps/reports/views.py` `general_ledger` (`account_id` required) and `general_ledger_accounts`; `src/pages/GeneralLedgerPage.tsx`.
- Date range: same view, `period` or `start_date`/`end_date`; `PeriodSelector`.
- Debit, credit, reference, running balance, opening and closing balance: `apps/reports/services.py` `general_ledger`; `src/components/reports/StatementTable.tsx`.
- Entries are never edited, only reversed: `apps/accounting/models.py` `JournalEntry` docstring; `apps/accounting/views.py` `JournalEntryViewSet` allows create/list/retrieve plus a `reverse` action only.
- Only roles with accounting access: `apps/reports/views.py` `ReportsViewSet.permission_classes = [CanViewAccounting]`; `apps/core/permissions.py`; `src/lib/reportCatalog.ts`.
- "Every naira leaves a trail" is the hook line the owner supplied; the trail is a drawn metaphor for transactions reaching a ledger row, not a feature claim.
- Not claimed anywhere: export of any kind, draft or approval states, drill-down, real-time, statements, any figure, any named role.

## Rebuild

```
export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
python3 -I scripts/ledger_voice.py <scratch-dir>   # public/voiceover-ledger.mp3 + src/ledgerTimings.ts
npm run render:ledger                              # out/meganet-ledger-ad.mp4
npm run poster:ledger                              # out/meganet-ledger-poster.png
# checks (see out/ledger-verification.txt for the last run)
npx remotion render MegaNetLedgerAd bg.mp4 --props='{"debug":"bg"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetLedgerAd caps.mp4 --props='{"debug":"caps"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetLedgerAd full-png --sequence --image-format=png --browser-executable=/opt/pw-browsers/chromium
npx remotion render MegaNetLedgerAd bg-png --sequence --image-format=png --props='{"debug":"bg"}' --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/verify_safe_area_lossless.py full-png bg-png
python3 -I scripts/verify_safe_area.py out/meganet-ledger-ad.mp4 bg.mp4 --thresh 30
python3 -I scripts/verify_captions_ledger.py caps.mp4 bg.mp4
node scripts/ledger_audit.mjs audit-dir && python3 -I scripts/ledger_audit.py audit-dir
```

edge-tts builds its TLS context from `certifi`, so `scripts/ledger_voice.py` points `certifi.where()` at `/root/.ccr/ca-bundle.crt`; verification stays on.
