// Renders full-size stills of chosen frames (local to each scene) for review.
// usage: node scripts/pm_stills.mjs <out-dir> [scene:frame,frame ...]   e.g. 3:60,150
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const DEFAULT = {1: [30, 75, 120, 195, 209], 2: [8, 30, 60, 100, 150, 215], 3: [45, 120, 170, 215, 255, 290], 4: [90, 150, 200, 240], 5: [100, 170, 215, 255, 295, 325], 6: [50, 110, 160, 220], 7: [45, 100, 140, 190, 250]};
const req = process.argv.slice(3);
const plan = req.length ? Object.fromEntries(req.map((a) => { const [s, f] = a.split(':'); return [s, f.split(',').map(Number)]; })) : DEFAULT;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chromium', {browserExecutable: '/opt/pw-browsers/chromium'});
for (const [s, frames] of Object.entries(plan)) {
  const comp = await selectComposition({serveUrl, id: `PMScene${s}`, puppeteerInstance: browser});
  for (const f of frames) {
    await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, `s${s}-f${String(f).padStart(3, '0')}.png`), puppeteerInstance: browser});
  }
  console.log('scene', s, frames.join(','));
}
await browser.close(() => {});
