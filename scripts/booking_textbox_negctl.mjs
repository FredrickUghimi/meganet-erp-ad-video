// Negative control for scripts/verify_textboxes_booking.py: logs the text boxes of one frame rendered with
// debug 'audit-violate' (an extra text node 40px outside the left edge); the verifier must flag it.
// usage: node scripts/booking_textbox_negctl.mjs <out.json> <frame>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const frame = Number(process.argv[3]);
const logs = [];
const comp = await selectComposition({serveUrl, id: 'MegaNetBookingAd', inputProps: {debug: 'audit-violate'}, browserExecutable});
await renderStill({composition: comp, serveUrl, frame, output: path.resolve(path.dirname(process.argv[2]), 'negctl.png'), inputProps: {debug: 'audit-violate'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
fs.writeFileSync(process.argv[2], JSON.stringify({[frame]: JSON.parse(line.slice('AUDIT_JSON'.length))}));
console.log('wrote', process.argv[2]);
