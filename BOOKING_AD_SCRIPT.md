# Mega-Net EHR Cloud: Online appointment booking ad (feature-spotlight series; 29.83 s, 1080x1920, 30 fps)

Composition `MegaNetBookingAd` (`src/MegaNetBookingAd.tsx`, design notes in the comment block at the top).
Render: `npm run render:booking` (`npx remotion render MegaNetBookingAd out/meganet-booking-ad.mp4 --browser-executable=/opt/pw-browsers/chromium --crf=14`).
Voice: **`en-NG-EzinneNeural` (female)**, a per-feature exception to the series default (AbeoNeural), requested by the project owner. Built by `scripts/booking_voice.py` (certifi pointed at `/root/.ccr/ca-bundle.crt`, certificate verification on) into `public/voiceover-booking.mp3` and `src/bookingTimings.ts`. Narration only: **no music and no sound effects** (the busy signal is drawn bars, no tone). `STYLE_GUIDE.md` section 4 says "no music, never sped up, pauses between sentences about 0.3s, 2s frozen hold after the voice ends"; it does not mention sound effects at all, so none were added.

**Status: not ready to publish until Turnstile and the proxy IP behaviour are verified.** Deployed to production: **unknown** (no Render access from this session; see "Facts the project owner needs").

## Runtime and timing (measured, not estimated)

| Item | Value |
|---|---|
| Total | **29.833 s** (895 frames at 30 fps; `ffprobe` on the rendered MP4) = 0.4 s lead-in + 27.435 s voice + 2.0 s frozen hold |
| Voice ends | 27.835 s of video |
| First "Mega-Net" spoken | **4.66 s** (TTS word boundary + lead-in); **4.806 s** measured on the rendered audio (silence detection). Limit 8.0 s |
| Longest silence between two spoken words | 0.47 s |

## Narration, scenes and captions (captions match the narration word for word)

| Visual scene | Video time | Narration | On screen (concept drawings only) | Transition in |
|---|---|---|---|---|
| 1 hook | 0-7.97 | "A patient has called the clinic all morning. The line is busy again." / "Mega-Net EHR Cloud lets patients book without calling." | A handset tile that shakes while ring arcs light in turn and six drawn busy bars blink (no sound). On "Mega-Net" the tile morphs in one continuous shape change into a booking card with a ticked day; a green "Booked" pill lands on "book". Badge "Mega-Net EHR Cloud" and label "Feature: Online appointment booking" are on screen from frame 0 | none (start) |
| 2 | 7.97-12.4 | "Every hospital branch has its own booking link. No account needed." | Three branch tiles (building glyph, placeholder bars), each with its own drawn link chip in its own colour, then a person glyph with a tick and "No account needed". No staff screen, no arrow, nothing handed over | tile cascade |
| 3 | 12.4-18.3 | "Patients pick a day, up to sixty days ahead, and see only the times the hospital has set." | A "Today ... 60 days" range bar, a drawn day grid with one day picked, four drawn time chips | alternating slats |
| 4 | 18.3-23.6 | "Then the patient sees a booked page, and the booking appears in the front desk's appointment list." | A "Booked" page (tick, placeholder bars), an arrow, a "Front desk appointment list" with a highlighted row marked "Booked" | polka dots |
| 5 CTA | 23.6-29.83 | "Book a free demo with Mega-Net Software. Message us on WhatsApp." | Logo card (reads Mega-Net Software), "Book a free demo", WhatsApp +2347035682478, meganetsoftware.com.ng; last frame held 2 s | tile cascade, reversed |

80 words. Caption chunks (2 lines max, 48 px, bottom edge y 1272): see `out/booking-verification/captions.txt`. "60 days" is the only figure on screen; it is the configured public booking window (`meganet/settings.py:526`). Everything else is a placeholder bar, chip or glyph. No screenshots; nothing from the live Northgate demo.

## Claims and where they come from (EHR-Cloud- `e8ca779`, tip of `origin/main`; every line number below re-checked against that commit today by string match, 47 of 47)

| Claim in the ad | Evidence | Status | On main? | Deployed to production? |
|---|---|---|---|---|
| Patients can book without calling (a public page, no phone call) | `api/public_booking.py:118-251` (book endpoint), `public_booking/urls.py:31` (page route), `meganet/urls.py:88` (`/book/` mount) | implemented | yes | **unknown** |
| Every hospital branch has its own booking link | `public_booking/urls.py:31` (`<org_slug>/<facility_slug>/`); `foundation/models.py:310` (facility type "branch"), `:325` (slug field), `:343-344` (slug auto-filled on save) | implemented (the link exists by URL scheme) | yes | **unknown** |
| No account needed | `api/public_booking.py:74-75`, `:116-117`, `:255-256` (no authentication, anyone allowed); `frontend/src/pages/PublicBooking.jsx:174` ("No account needed.") | implemented | yes | **unknown** |
| Patients pick a day, up to sixty days ahead | `meganet/settings.py:526` (`PUBLIC_BOOKING_WINDOW_DAYS = 60`); `public_booking/views.py:126-128` (today to today+60); enforced at `api/public_booking.py:88-90` | implemented | yes | **unknown** |
| ... and see only the times the hospital has set | `public_booking/slots.py:40` (only staff-configured, active availability), `:57` (past times dropped), `:62-79` (already-booked times dropped); `api/public_booking.py:95`; `PublicBooking.jsx:185` | implemented | yes | **unknown** |
| The patient sees a booked page afterwards | `api/public_booking.py:251` (returns the appointment id), `PublicBooking.jsx:112` (goes to the confirmation page), `PublicBookingConfirmed.jsx:87`; the stored status is "booked" (`scheduling/models.py:126`, `:134`) | implemented | yes | **unknown** |
| The booking appears in the front desk's appointment list | `api/public_booking.py:232` creates it for that facility with status "booked"; the list is `api/scheduling.py:195-212` (that facility's day, cancelled and rescheduled excluded, needs `scheduling.book`, `:197`). **Local end-to-end test: PASS** (below) | implemented, tested locally | yes | **unknown** |

**End-to-end test (local only, scratch copy of EHR-Cloud- at `e8ca779`, local Postgres 16; EHR-Cloud- itself was not modified; not staging, not production).** Test source `out/booking-verification/e2e_front_desk_list_test.py.txt`, run log `e2e-public-booking-to-front-desk-list.txt`. It books through `POST /api/public-booking/<org>/<facility>/book/` (200, appointment id returned), then logs in as a Front Desk user whose membership is that facility and calls `GET /api/scheduling/appointments/?date=...` (`api/scheduling.py:195`): the list holds exactly that appointment, status "booked", patient "Ada Test". Control: a Front Desk user of a different branch of the same organisation gets an empty list. 1 test, OK.

Not claimed anywhere: 24/7; any SMS or email confirmation; reminders; "the hospital confirmed" or "will call back"; fewer no-shows; any compliance or safety wording; **anything about double booking** (removed by the project owner); that every branch has availability set up; that staff have a screen to copy or share the link (none was found in the frontend, so the branch tiles carry their own link chip and show no hand-over). The ad says "booked", never "confirmed".

Slogan: used only as "book without calling".

## Facts the project owner needs before publishing
- **The booked page says "Confirmed" itself.** `PublicBookingConfirmed.jsx:87-88` titles the page "Appointment Requested" with a green "Confirmed" badge. The ad's wording ("booked") matches the stored status, not that badge. The same page says SMS/email confirmations are not sent (`:119`).
- **Turnstile may be off.** If `TURNSTILE_SECRET_KEY` is unset the check is skipped (`public_booking/captcha.py:36`); the variables are declared in `render.yaml:170-172`. Whether either Render service has them set is not visible from here.
- **Proxy IP behaviour is unverified.** The throttle keys on `get_client_ip`, which reads `REMOTE_ADDR` only (`foundation/audit.py:18`); gunicorn starts with no forwarded-IP setting (`render.yaml:106`); the limit is 5 submissions per 15 minutes (`meganet/settings.py:516-517`). If `REMOTE_ADDR` is Render's proxy address, all visitors would share one throttle bucket. This was read from the code, not observed.
- **CTA wording.** `STYLE_GUIDE.md` section 4 lists "Book a free demo", WhatsApp and the website; the brief said CTA "Mega-Net Software". The ad keeps the series lines on screen and says "Book a free demo with Mega-Net Software" aloud; the logo card reads "Mega-Net Software".

## Voice check
Audio generated with `en-NG-EzinneNeural`. No speech recogniser was available, so pronunciation of "Mega-Net", "EHR" and "WhatsApp" was **not machine-checked**; the project owner listens. The caption text is compared with the TTS engine's own word-boundary transcript, which is not an independent recogniser.

## Verification (local renders only; nothing checked on staging or production)
Reports in `out/booking-verification/`; scripts `scripts/booking_*`, `scripts/verify_*_booking.py`, `scripts/verify_caption_overlap.py`. Run on the final build (895 frames).

| Check | Result |
|---|---|
| Safe area x 80-920, y 200-1440, every frame, lossless PNG vs gradient-only render (`safe-area.txt`, `safe-area-frames.csv`) | 0 of 895 frames fail; content box x 95-907, y 203-1279. Negative controls (box 30 px outside each edge, plus a faint white box): 5 of 5 flagged |
| Caption zone: no scene content in x 110-890, y 1120-1272 or the 24 px above it, every frame (`caption-overlap.txt`) | 0 of 895 frames; lowest scene content y 1095. Controls: synthetic box in zone and in band flagged, box just clear not flagged; rendered strong box flagged on 895 of 895 frames; rendered faint white box flagged on 895 of 895 frames |
| Every text box on every frame inside the safe area, transforms included, mid-transition included, no waiver (`textboxes.txt`, `textbox-frames.csv`) | 7166 text boxes, 0 of 895 frames fail; extremes left 149.0, right 859.0, top 234.5, bottom 1254.5 (captions; scene text ends by 1095). Rendered control: a text node 40 px outside the left edge is flagged |
| Contrast and size (`contrast.txt`) | 1249 settled text samples, 122 distinct text/colour pairs: lowest **5.92:1** (min 4.5:1), smallest font **32 px** (min 32 px), 0 failures; worst background pixel measured behind every text box |
| Caption timing (`captions.txt`, `caption-timing.csv`) | text word for word vs the approved narration and vs the TTS transcript: PASS; all 9 sentences within 0.1 s (max delta 0.085 s) against both the TTS boundaries and silence detection on the rendered audio |

Caption timing deltas (seconds; "audio" = measured on the rendered video's own audio):

| # | Sentence | Caption on | Caption off | TTS start | TTS end | Audio start | Audio end | Max abs delta |
|---|---|---|---|---|---|---|---|---|
| 1 | A patient has called the clinic all morning. | 0.500 | 2.667 | 0.430 | 2.605 | 0.560 | 2.708 | 0.070 |
| 2 | The line is busy again. | 3.067 | 4.333 | 2.995 | 4.270 | 3.134 | 4.373 | 0.072 |
| 3 | Mega-Net EHR Cloud lets patients book without calling. | 4.733 | 7.933 | 4.660 | 7.860 | 4.806 | 7.963 | 0.073 |
| 4 | Every hospital branch has its own booking link. | 8.333 | 10.867 | 8.250 | 10.787 | 8.375 | 10.890 | 0.083 |
| 5 | No account needed. | 11.233 | 12.400 | 11.178 | 12.328 | 11.306 | 12.385 | 0.073 |
| 6 | Patients pick a day, up to sixty days ahead, and see only the times the hospital has set. | 12.800 | 18.333 | 12.718 | 18.255 | 12.861 | 18.278 | 0.082 |
| 7 | Then the patient sees a booked page, and the booking appears in the front desk's appointment list. | 18.700 | 23.600 | 18.645 | 23.532 | 18.785 | 23.613 | 0.085 |
| 8 | Book a free demo with Mega-Net Software. | 24.000 | 26.167 | 23.922 | 26.097 | 24.026 | 26.200 | 0.078 |
| 9 | Message us on WhatsApp. | 26.567 | 27.833 | 26.488 | 27.775 | 26.629 | 27.855 | 0.079 |

Limits of these checks, stated plainly:
- **Contrast is measured on settled text** (`STYLE_GUIDE.md` section 2). The audit samples every 5th frame plus the frame after every caption chunk; 44 samples where text was mid fade-in (effective opacity below 0.99: captions fade over 3 frames, pills and chips over up to 12) are listed in `contrast.txt` but not counted, lowest 1.16:1 at 27% opacity, and 16 frames inside the scene-transition reveals were skipped. The per-frame checks above (safe area, caption zone, text boxes) have no such exclusions.
- **The caption-zone check is blind at the series default threshold.** At 24/255 the faint-white control is flagged on only 496 of 895 frames (a white box on a near-white gradient differs by only 16-17/255), so the check was run at 12/255 (0 frames with content in the zone; every control flagged on all frames). The same real check at 24 also gives 0 frames.
- Caption timing is per sentence, not per word.
- Pronunciation: not machine-checked (above).
- The first full render found one real defect, fixed before the final render: the "Booked" chip in the list row had its text box touching the chip's rounded corners (6 pixels at 2.5:1). The chip and row were made taller and everything above was re-run on the final build.
