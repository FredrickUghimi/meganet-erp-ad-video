// Greyscale stills of MegaNetNursesBaySkipAd (debug 'gray' = whole frame through grayscale(1)) at the settled frames where
// the "Skipped" state is on screen, so a reader can confirm the word, not the colour, carries the meaning.
// usage: node scripts/skip_gray_stills.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/skipTimings.ts', 'utf8');
const LINES = JSON.parse(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(';')));
const wordF = (s, w) => 12 + Math.round(LINES[s].words[w].start * 30);
const frames = {'hook-dimmed-row-before-label': wordF(1, 3) + 4, 'hook-skipped-chip': wordF(1, 5) + 14, 'marked-with-reason': wordF(2, 9) + 14, 'same-place': wordF(3, 3) + 14, 'before-call': wordF(4, 5), 'loop': wordF(5, 10) + 14};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const debug of ['gray', '']) {
  const comp = await selectComposition({serveUrl, id: 'MegaNetNursesBaySkipAd', inputProps: {debug}, browserExecutable});
  for (const [name, f] of Object.entries(frames)) {
    await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, `${debug || 'color'}-${name}-f${f}.png`), inputProps: {debug}, browserExecutable});
    console.log(debug || 'color', name, f);
  }
}
