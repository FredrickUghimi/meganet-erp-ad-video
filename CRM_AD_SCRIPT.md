# MegaNetCrmAd: Sales & CRM launch ad (35s, 1080x1920, 30fps)

Voice: `en-NG-AbeoNeural` (male, series default), rate -3%, one edge-tts call per sentence, 0.22s gaps, never sped up (`scripts/crm_voice.py`). Voice ends at 33.4s; scene lengths follow the generated word timings (`src/crmTimings.ts`).
Sound: ambient pad + pulse underscore, ducked under the voice, plus quiet whoosh/click/chime, all generated in code (`scripts/crm_sound.py`); final mix normalised to about -16 LUFS.
Look: dark cinematic (the brief overrides the light STYLE_GUIDE for this ad), cyan/violet glow, grain, vignette, 3D-feel phone. Captions inside y 130-1625.

Screens: real screenshots (menu with "Sales & CRM", My Day) from the app running against a LOCAL seeded demo tenant; Leads, Pipeline, Reports, quotation/invoice and AI bubble are React recreations fed with data exported from the same API (`src/crmData.ts`).
Demo tenant: `scripts/seed_crm_demo.py` (invented businesses and people, naira amounts). Quotation -> sent -> accepted -> invoice -> payment was run through the real API, so the deal really moved to Quotation sent, Negotiation, Won.

Not claimed: campaigns, WhatsApp/email sending, contracts, renewals, complaints, automation, price.

Rebuild: `python3 -I scripts/crm_voice.py <scratch>`, `python3 -I scripts/crm_sound.py`, `npm run render:crm`, `npm run poster:crm`.
