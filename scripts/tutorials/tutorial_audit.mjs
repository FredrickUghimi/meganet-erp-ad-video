// Contrast / size / position audit for the Staff Directory tutorials (MegaNetTutorialInvite|Change|Deactivate).
// For every settled UI/drawn frame and every caption chunk it renders (1) the frame in debug 'audit' mode, which logs every
// text node's box, colour, size and effective opacity, and (2) the same frame in 'notext' mode (text transparent) so the pixels
// behind each text box can be measured. scripts/pharmacy_contrast.py (generic despite its name) computes the worst-case contrast.
// Settled = text is not mid-entry: at least 34 frames after its frame starts (cross-fade 8 frames + staggered entries), and before
// the next frame starts (STYLE_GUIDE.md section 2: text mid-entry is transient). Captured UI pixels are not DOM text; they are
// pre-flighted by scripts/tutorials/tutorial_assets.py.
// usage: node scripts/tutorials/tutorial_audit.mjs <invite|change|deactivate> <out-dir> [debug-suffix]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const key = process.argv[2];
const out = path.resolve(process.argv[3]);
const suffix = process.argv[4] ? '+' + process.argv[4] : '';
const only = process.argv[5] ? process.argv[5].split(',').map(Number) : null; // optional explicit frame list (negative controls)
fs.mkdirSync(out, {recursive: true});
const ID = {invite: 'MegaNetTutorialInvite', change: 'MegaNetTutorialChange', deactivate: 'MegaNetTutorialDeactivate'}[key];
const objOf = (file, name) => { const t = fs.readFileSync(file, 'utf8'); const i = t.indexOf('= {', t.indexOf(name + ':')) + 2; return JSON.parse(t.slice(i, t.lastIndexOf(';'))); };
const T = objOf('src/tutorialTimings.ts', 'TIMINGS')[key];
const FR = objOf('src/tutorialFrames.ts', 'FRAMES')[key];
const LEAD = 12, FADE = 8, CAP_DELAY = 2, SETTLE = 34;
const wordF = (s, w) => LEAD + Math.round(T.SENTENCES[s].words[w].start * 30);
const wordEndF = (s, w) => LEAD + Math.round(T.SENTENCES[s].words[w].end * 30);
const starts = FR.map((fr, i) => {
  if (i === 0) return 0;
  const first = T.SENTENCES.findIndex((s) => s.scene === fr.scene);
  return LEAD + Math.round(T.SENTENCES[first + fr.at].start * 30) - 9;
});
const FREEZE = LEAD + Math.round(T.VOICE_END * 30);
const settledAt = (f) => starts.some((s, i) => f >= s + SETTLE && f < (i + 1 < starts.length ? starts[i + 1] : 1e9));
const frames = new Set();
starts.forEach((s, i) => frames.add(Math.min(s + SETTLE, i + 1 < starts.length ? starts[i + 1] - 1 : FREEZE)));
const skippedChunks = [];
T.CHUNKS.forEach(([s, a, b], ci) => {
  const on = wordF(s, a) + CAP_DELAY;
  const endsS = /[.?!]$/.test(T.SENTENCES[s].words[b].text);
  const off = endsS || ci === T.CHUNKS.length - 1 ? wordEndF(s, b) + CAP_DELAY : wordF(T.CHUNKS[ci + 1][0], T.CHUNKS[ci + 1][1]) + CAP_DELAY;
  let pick = null;
  for (let f = Math.min(wordF(s, b) + CAP_DELAY + 4, off - 1); f >= on + 3; f--) if (settledAt(f)) { pick = f; break; }
  if (pick === null) skippedChunks.push(ci); else frames.add(pick);
});
frames.add(FREEZE);
const list = only || [...frames].sort((a, b) => a - b);
console.log(key, 'audit frames', list.length, '| chunks with no settled frame inside their window (caption contrast covered by other chunks):', skippedChunks.length);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const browser = await openBrowser('chromium', {browserExecutable});
const dbg = (m) => m + suffix;
const comp = await selectComposition({serveUrl, id: ID, inputProps: {debug: dbg('audit')}, puppeteerInstance: browser});
const comp2 = await selectComposition({serveUrl, id: ID, inputProps: {debug: dbg('notext')}, puppeteerInstance: browser}); // props are resolved per composition: the text-less render needs its own
for (const fr of list) {
  const logs = [];
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {debug: dbg('audit')}, puppeteerInstance: browser, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {debug: dbg('notext')}, puppeteerInstance: browser});
}
await browser.close(() => {});
console.log('done', list.length, 'frames');
