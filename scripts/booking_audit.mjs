// Contrast / size / position audit for MegaNetBookingAd.
// For a set of settled frames it renders (1) the frame in debug 'audit' mode, which logs every text node's box,
// colour, font size and effective opacity, and (2) the same frame in 'notext' mode (text made transparent) so the
// pixels behind each text box can be measured. scripts/booking_contrast.py then computes the worst-case contrast.
// usage: node scripts/booking_audit.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/bookingTimings.ts', 'utf8');
const LINES = JSON.parse(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(';')));
const src = fs.readFileSync('src/MegaNetBookingAd.tsx', 'utf8');
const body = src.slice(src.indexOf('export const CHUNKS'), src.indexOf('];', src.indexOf('export const CHUNKS')));
const chunks = [...body.matchAll(/\[(\d+), (\d+), (\d+)\]/g)].map((m) => m.slice(1).map(Number));
const LEAD = 12;
const wordF = (s, w) => LEAD + Math.round(LINES[s].words[w].start * 30);
const wordEndF = (s, w) => LEAD + Math.round(LINES[s].words[w].end * 30);
const VS = [0, 2, 3, 4, 5];
const sceneFrom = (i) => (i === 0 ? 0 : wordF(VS[i], 0) - 9);
const frames = new Set();
const NV = VS.length;
const TR = 16; // transition length, as in src/MegaNetBookingAd.tsx; text mid-transition is transient (STYLE_GUIDE.md section 2)
const inTransition = (f) => VS.some((_, i) => i > 0 && f >= sceneFrom(i) && f < sceneFrom(i) + TR);
const voiceEndF = LEAD + Math.round(parseFloat(/VOICE_END = ([\d.]+)/.exec(t)[1]) * 30);
// settled frames: shortly after every caption chunk's last word starts, the last frame of every visual scene, and extra settled states
chunks.forEach(([s, , b]) => frames.add(wordF(s, b) + 8));
for (let i = 0; i < NV; i++) frames.add(i < NV - 1 ? sceneFrom(i + 1) - 1 : voiceEndF);
// hook: ringing + busy bars (before the morph), settled booking card + Booked pill, badge pulse; branches with links + "No account needed"; days/times; booked page + list
[40, 100, wordF(1, 5) + 30, wordF(1, 0) + 5, wordF(2, 10) + 12, wordF(3, 17) + 14, wordF(4, 16) + 14].forEach((f) => frames.add(f));
for (let f = 0; f <= voiceEndF; f += 5) frames.add(f); // plus every 5th frame, so settled text is measured everywhere, not only at hand-picked frames
const skipped = [...frames].filter(inTransition);
if (skipped.length) console.log('skipped (mid-transition):', skipped.join(','));
const list = [...frames].filter((f) => !inTransition(f) && f < 895).sort((a, b) => a - b);
console.log('audit frames', list.join(','));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const fr of list) {
  const logs = [];
  const comp = await selectComposition({serveUrl, id: 'MegaNetBookingAd', inputProps: {debug: 'audit'}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {debug: 'audit'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  const comp2 = await selectComposition({serveUrl, id: 'MegaNetBookingAd', inputProps: {debug: 'notext'}, browserExecutable});
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {debug: 'notext'}, browserExecutable});
  console.log('frame', fr, 'text nodes', line ? JSON.parse(line.slice(10)).length : 0);
}
