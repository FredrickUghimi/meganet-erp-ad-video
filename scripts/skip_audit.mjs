// Contrast / size / position audit for MegaNetNursesBaySkipAd.
// For a set of settled frames it renders (1) the frame in debug 'audit' mode, which logs every text node's box,
// colour, font size and effective opacity, and (2) the same frame in 'notext' mode (text made transparent) so the
// pixels behind each text box can be measured. scripts/skip_contrast.py then computes the worst-case contrast.
// usage: node scripts/skip_audit.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/skipTimings.ts', 'utf8');
const LINES = JSON.parse(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(';')));
const src = fs.readFileSync('src/MegaNetNursesBaySkipAd.tsx', 'utf8');
const body = src.slice(src.indexOf('export const CHUNKS'), src.indexOf('];', src.indexOf('export const CHUNKS')));
const chunks = [...body.matchAll(/\[(\d+), (\d+), (\d+)\]/g)].map((m) => m.slice(1).map(Number));
const LEAD = 12;
const wordF = (s, w) => LEAD + Math.round(LINES[s].words[w].start * 30);
const wordEndF = (s, w) => LEAD + Math.round(LINES[s].words[w].end * 30);
const SC = [0, 2, 3, 4, 5, 6]; // visual scene k starts with narration line SC[k] (as in src/MegaNetNursesBaySkipAd.tsx)
const sceneFrom = (k) => (k === 0 ? 0 : wordF(SC[k], 0) - 9);
const LASTV = SC.length - 1;
const TR = 14; // transition length; text mid-transition is transient (STYLE_GUIDE.md section 2)
const inTransition = (f) => SC.some((_, k) => k > 0 && f >= sceneFrom(k) && f < sceneFrom(k) + TR);
const sceneOf = (f) => SC.reduce((acc, _, k) => (f >= sceneFrom(k) ? k : acc), 0);
let list;
if (process.env.FRAMES) {
  // exact frame range "a-b", no transition filter: used for the dimmed-row check (every frame of the dimmed state)
  const [a, b] = process.env.FRAMES.split('-').map(Number);
  list = [];
  for (let f = a; f <= b; f++) list.push(f);
} else {
  const frames = new Set();
  const lastOf = (f) => { const k = sceneOf(f); return k < LASTV ? sceneFrom(k + 1) - 1 : 1e9; };
  chunks.forEach(([s, , b]) => frames.add(Math.min(wordF(s, b) + 8, lastOf(wordF(s, b)))));
  // captions fade in over 3 frames after CAP_DELAY=2 (transient, STYLE_GUIDE.md section 2): audit each caption chunk just after its fade, and drop any frame inside a fade
  const CAP_DELAY = 2;
  const capOn = chunks.map(([s, a]) => wordF(s, a) + CAP_DELAY);
  capOn.forEach((on) => frames.add(on + 6));
  for (const f of [...frames]) if (capOn.some((on) => f >= on && f < on + 4)) frames.delete(f);
  for (let k = 0; k < LASTV; k++) frames.add(sceneFrom(k + 1) - 1);
  frames.add(LEAD + Math.round(parseFloat(/VOICE_END = ([\d.]+)/.exec(t)[1]) * 30));
  // extra settled states: waiting room + dimmed row, labels landed, chip landed, reason landed, Called state, mark cleared, loop
  [wordF(0, 6) + 10, wordF(0, 16) + 12, wordF(1, 1) + 14, wordF(1, 5) + 14, wordF(2, 9) + 14, wordF(3, 3) + 14,
   wordF(4, 6) - 2, wordF(4, 7) + 14, wordF(4, 10) + 14, wordF(5, 10) + 14].forEach((f) => frames.add(f));
  const skipped = [...frames].filter(inTransition);
  if (skipped.length) console.log('skipped (mid-transition):', skipped.join(','));
  list = [...frames].filter((f) => !inTransition(f)).sort((a, b) => a - b);
}
console.log('audit frames', list.length > 40 ? `${list[0]}..${list[list.length - 1]} (${list.length})` : list.join(','));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const fr of list) {
  const logs = [];
  const comp = await selectComposition({serveUrl, id: 'MegaNetNursesBaySkipAd', inputProps: {debug: 'audit'}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {debug: 'audit'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  const comp2 = await selectComposition({serveUrl, id: 'MegaNetNursesBaySkipAd', inputProps: {debug: 'notext'}, browserExecutable});
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {debug: 'notext'}, browserExecutable});
  console.log('frame', fr, 'text nodes', line ? JSON.parse(line.slice(10)).length : 0);
}
