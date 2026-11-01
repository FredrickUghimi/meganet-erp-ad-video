// Renders PNG stills of MegaNetPharmacyInteractionAd at the given frames (default: a review set).
// usage: node scripts/pharmacy_stills.mjs <out-dir> [frame ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const frames = process.argv.slice(3).map(Number);
const list = frames.length ? frames : [20, 45, 62, 70, 85, 110, 160, 225, 300, 330, 350, 380, 400, 470, 560, 575];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const comp = await selectComposition({serveUrl, id: 'MegaNetPharmacyInteractionAd', inputProps: {debug: ''}, browserExecutable});
console.log('duration', comp.durationInFrames, 'fps', comp.fps);
for (const f of list) {
  if (f >= comp.durationInFrames) continue;
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, `f${String(f).padStart(4, '0')}.png`), inputProps: {debug: ''}, browserExecutable});
  console.log('frame', f);
}
