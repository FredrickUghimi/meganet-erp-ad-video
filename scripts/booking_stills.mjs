// Renders PNG stills of MegaNetBookingAd at the given frames (default: a review set).
// usage: node scripts/booking_stills.mjs <out-dir> [frame ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const frames = process.argv.slice(3).map(Number);
const list = frames.length ? frames : [0, 40, 100, 125, 145, 175, 245, 300, 360, 420, 480, 560, 640, 720, 800, 890];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const comp = await selectComposition({serveUrl, id: 'MegaNetBookingAd', inputProps: {debug: ''}, browserExecutable});
console.log('duration', comp.durationInFrames, 'fps', comp.fps);
for (const f of list) {
  if (f >= comp.durationInFrames) continue;
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, `f${String(f).padStart(4, '0')}.png`), inputProps: {debug: ''}, browserExecutable});
  console.log('frame', f);
}
