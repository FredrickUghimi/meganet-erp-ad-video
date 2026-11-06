// Renders PNG stills of MegaNetNursesBaySkipAd at the given frames (default: a review set).
// usage: node scripts/skip_stills.mjs <out-dir> [frame ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const frames = process.argv.slice(3).map(Number);
const list = frames.length ? frames : [0, 40, 90, 150, 200, 240, 290, 340, 400, 440, 480, 530, 600, 660, 720, 770, 830, 908];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const comp = await selectComposition({serveUrl, id: 'MegaNetNursesBaySkipAd', inputProps: {debug: ''}, browserExecutable});
console.log('duration', comp.durationInFrames, 'fps', comp.fps);
for (const f of list) {
  if (f >= comp.durationInFrames) continue;
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, `f${String(f).padStart(4, '0')}.png`), inputProps: {debug: ''}, browserExecutable});
  console.log('frame', f);
}
