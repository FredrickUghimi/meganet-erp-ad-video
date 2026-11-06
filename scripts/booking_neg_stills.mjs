// Negative-control stills for scripts/verify_safe_area_booking.py: one frame with a box placed 30px outside each edge.
// usage: node scripts/booking_neg_stills.mjs <out-dir> <frame>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const frame = Number(process.argv[3]);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const debug of ['violate-left', 'violate-right', 'violate-top', 'violate-bottom', 'violateweak-left']) {
  const comp = await selectComposition({serveUrl, id: 'MegaNetBookingAd', inputProps: {debug}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame, output: path.join(out, `${debug}.png`), inputProps: {debug}, browserExecutable, imageFormat: 'png'});
  console.log(debug);
}
