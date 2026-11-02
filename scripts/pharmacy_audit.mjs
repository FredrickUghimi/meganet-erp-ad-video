// Contrast / size / position audit for MegaNetPharmacyInteractionAd.
// For a set of settled frames it renders (1) the frame in debug 'audit' mode, which logs every text node's box,
// colour, font size and effective opacity, and (2) the same frame in 'notext' mode (text made transparent) so the
// pixels behind each text box can be measured. scripts/pharmacy_contrast.py then computes the worst-case contrast.
// usage: node scripts/pharmacy_audit.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/pharmacyTimings.ts', 'utf8');
const LINES = JSON.parse(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(';')));
const src = fs.readFileSync('src/MegaNetPharmacyInteractionAd.tsx', 'utf8');
const body = src.slice(src.indexOf('export const CHUNKS'), src.indexOf('];', src.indexOf('export const CHUNKS')));
const chunks = [...body.matchAll(/\[(\d+), (\d+), (\d+)\]/g)].map((m) => m.slice(1).map(Number));
const LEAD = 12;
const wordF = (s, w) => LEAD + Math.round(LINES[s].words[w].start * 30);
const wordEndF = (s, w) => LEAD + Math.round(LINES[s].words[w].end * 30);
// visual scene starts, as VS in src/MegaNetPharmacyInteractionAd.tsx: hook, feature, prescribing screen (narration groups 2+3), CTA
const VS = [0, wordF(1, 0) - 9, wordF(2, 0) - 9, wordF(4, 0) - 4];
const TR = 14; // transition length; text mid-transition is transient (STYLE_GUIDE.md section 2)
const frames = new Set();
// two settled frames per caption chunk: 6 frames after it appears (its 3-frame fade-in is over) and at the end of its last word,
// never at or after the next chunk's first frame (that chunk's fade-in is transient, STYLE_GUIDE.md section 2)
const CAP_DELAY = 2;
chunks.forEach(([s, a, b], i) => {
  const on = wordF(s, a) + CAP_DELAY;
  const nextOn = i + 1 < chunks.length ? wordF(chunks[i + 1][0], chunks[i + 1][1]) + CAP_DELAY : Infinity;
  frames.add(on + 6);
  frames.add(Math.min(wordF(s, b) + 8, nextOn - 1));
});
// settled states of the moving pieces (hook pad with both lines drawn, link marker, form, press, warning, chips, gate, typed word, enabled button, status chips, CTA)
[100, 135, 175, wordF(1, 5) + 14, wordF(1, 11) + 12, wordF(2, 7) - 2, wordF(2, 9) + 14, wordF(2, 17) + 12, wordF(3, 2) + 12, wordF(3, 7) + 14, wordF(3, 10) + 20, wordF(3, 13) + 14, wordF(3, 18) + 4,
  wordF(4, 0) + 30, wordF(4, 3) + 20, wordF(4, 7) + 24, LEAD + Math.round(parseFloat(/VOICE_END = ([\d.]+)/.exec(t)[1]) * 30)].forEach((f) => frames.add(f));
// Settling rule (no waiver, just which frames count as "settled"): every element that fades/slides in takes about 0.3 s
// (<= 10 frames), and a caption chunk fades in over 3 frames. A sampled frame must not fall inside any of those entries, so
// it is moved to the first frame after them. Events: the prescribing-screen moments in src/MegaNetPharmacyInteractionAd.tsx.
const EV = [wordEndF(2, 7) + 1, wordF(2, 9) - 1, wordF(2, 17) - 2, wordF(3, 2) - 2, wordF(3, 7) - 2, wordF(3, 13) - 2, ...VS.map((v) => v + 4), ...VS.map((v) => v + 20)];
const capWin = chunks.map(([s, a, b], i) => [wordF(s, a) + CAP_DELAY, i + 1 < chunks.length ? wordF(chunks[i + 1][0], chunks[i + 1][1]) + CAP_DELAY : Infinity]);
const settle = (f0) => {
  let f = f0;
  for (let k = 0; k < 6; k++) {
    for (const e of EV) if (f >= e && f < e + 11) f = e + 11;
    for (const [on, off] of capWin) if (f >= on && f < off && f < on + 4) f = on + 4;
  }
  return f;
};
const settled = new Set([...frames].map(settle));
frames.clear();
settled.forEach((f) => frames.add(f));
const inTransition = (f) => VS.some((v, i) => i > 0 && f >= v && f < v + TR);
const skipped = [...frames].filter(inTransition);
if (skipped.length) console.log('skipped (mid-transition):', skipped.join(','));
const list = [...frames].filter((f) => !inTransition(f)).sort((a, b) => a - b);
console.log('audit frames', list.join(','));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const fr of list) {
  const logs = [];
  const comp = await selectComposition({serveUrl, id: 'MegaNetPharmacyInteractionAd', inputProps: {debug: 'audit'}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {debug: 'audit'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  const comp2 = await selectComposition({serveUrl, id: 'MegaNetPharmacyInteractionAd', inputProps: {debug: 'notext'}, browserExecutable});
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {debug: 'notext'}, browserExecutable});
  console.log('frame', fr, 'text nodes', line ? JSON.parse(line.slice(10)).length : 0);
}
