// Contrast / size / position audit for MegaNetLedgerAd.
// For a set of settled frames it renders (1) the frame in debug 'audit' mode, which logs every text node's box,
// colour, font size and effective opacity, and (2) the same frame in 'notext' mode (text made transparent) so the
// pixels behind each text box can be measured. scripts/ledger_audit.py then computes the worst-case contrast.
// usage: node scripts/ledger_audit.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/ledgerTimings.ts', 'utf8');
const LINES = JSON.parse(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(';')));
const src = fs.readFileSync('src/MegaNetLedgerAd.tsx', 'utf8');
const body = src.slice(src.indexOf('export const CHUNKS'), src.indexOf('];', src.indexOf('export const CHUNKS')));
const chunks = [...body.matchAll(/\[(\d+), (\d+), (\d+)\]/g)].map((m) => m.slice(1).map(Number));
const LEAD = 12;
const wordF = (s, w) => LEAD + Math.round(LINES[s].words[w].start * 30);
const sceneFrom = (i) => (i === 0 ? 0 : wordF(i, 0) - 5);
const frames = new Set();
chunks.forEach(([s, , b]) => frames.add(Math.min(wordF(s, b) + 8, s < LINES.length - 1 ? sceneFrom(s + 1) - 1 : 1e9)));
for (let s = 0; s < LINES.length; s++) frames.add(s < LINES.length - 1 ? sceneFrom(s + 1) - 1 : LEAD + Math.round(parseFloat(/VOICE_END = ([\d.]+)/.exec(t)[1]) * 30));
const list = [...frames].sort((a, b) => a - b);
console.log('audit frames', list.join(','));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const fr of list) {
  const logs = [];
  const comp = await selectComposition({serveUrl, id: 'MegaNetLedgerAd', inputProps: {debug: 'audit'}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {debug: 'audit'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  const comp2 = await selectComposition({serveUrl, id: 'MegaNetLedgerAd', inputProps: {debug: 'notext'}, browserExecutable});
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {debug: 'notext'}, browserExecutable});
  console.log('frame', fr, 'text nodes', line ? JSON.parse(line.slice(10)).length : 0);
}
