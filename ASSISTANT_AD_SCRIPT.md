# MegaNetAssistantAd — script and build notes

1080x1920, 30fps, 482 frames (16.07s): 0.4s lead-in, voice 13.66s, 2s frozen hold after the voice.
Voice: Microsoft `en-NG-AbeoNeural` (male), one edge-tts call per line, lines joined with ~0.3s gaps, no speed-up, no music.
No figures, names or statistics anywhere: answer cards use placeholder bars only.

## Script and scenes (frames at 30fps)

| # | Frames | Voice (burned-in caption, word for word) | On screen |
|---|---|---|---|
| 1 | 0-58 | "Just ask your business." | Blue/purple. "Meet your AI Business Assistant", typing question field |
| 2 | 59-98 | "Who owes you the most?" | Orange. Question bubble, typing dots, blue "Customer balances / Highest first" card (placeholder bars) |
| 3 | 99-153 | "Which products are running low?" | Red. "Low stock / At or below reorder level" card |
| 4 | 154-206 | "What did you spend this month?" | Purple. "Spending this month / By category" card |
| 5 | 207-262 | "How is your profit this month?" | Green. "Profit this month / From your reports" card, no comparison bars |
| 6 | 263-366 | "Answers from your own data, only for those allowed to see them." | Blue. Chips: Your data only / Role-based access / Read-only, timed to the words "own data", "allowed", "see" |
| 7 | 367-481 | "Book a free demo with Mega-Net." | Logo card, "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng (static from ~frame 400; frozen from 422) |

## What the product claims rest on (read from the backend, not run)

- Receivables: `get_receivables`, customers sorted by amount owed, highest first. Financial roles only (`can_view_accounting`).
- Low stock: `get_low_stock_alerts`, tracked active products at or below reorder level. Any member.
- Spending / profit: `get_profit_and_loss` (expense lines by top-level category, income, net profit) for a named period such as `this_month`. Financial roles only.
- "Own data only": tenant-scoped queries (`TenantManager`). "Only for those allowed": tool list filtered by role, re-checked on execution. "Read-only": every tool wraps a read-side report/dashboard function.
- Not claimed: ranking of biggest expenses, explanations of why profit changed, any figure.

## Rebuild

```
export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
python3 -I scripts/assistant_voice.py <scratch-dir>      # voiceover-assistant.mp3 + src/assistantTimings.ts
npm run render:assistant                                  # out/meganet-assistant-ad.mp4
npx remotion render MegaNetAssistantAd bg.mp4 --props='{"mode":"bg"}' --crf=14 --browser-executable=/opt/pw-browsers/chromium
python3 -I scripts/check_safe_area.py out/meganet-assistant-ad.mp4 bg.mp4 80 200 920 1440 422
```

edge-tts builds its TLS context from `certifi`, so `scripts/assistant_voice.py` points `certifi.where()` at `/root/.ccr/ca-bundle.crt`; verification stays on.
`public/logo-trim.jpg` did not exist in the repo; it is `public/logo.jpg` auto-cropped to the logo with 18px padding.
