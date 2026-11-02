// Contrast / size / position audit for MegaNetAssistantAd (same method as scripts/ledger_audit.mjs): for settled frames it
// renders the frame in mode 'audit' (logs every text node's box, colour, size, opacity) and in mode 'notext' (text
// transparent) so the pixels behind each text box can be measured by scripts/ledger_audit.py.
// usage: node scripts/assistant_audit.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/assistantTimings.ts', 'utf8');
const LINES = JSON.parse(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(';')));
const VOICE_END = parseFloat(/VOICE_END = ([\d.]+)/.exec(t)[1]);
const LEAD = 12;
const lineStartF = (i) => LEAD + Math.round(LINES[i].start * 30);
const sceneFrom = (i) => (i === 0 ? 0 : lineStartF(i) - 5);
const last = LINES.length - 1;
const frames = new Set();
for (let i = 0; i <= last; i++) {
  const next = i < last ? sceneFrom(i + 1) : LEAD + Math.round(VOICE_END * 30);
  frames.add(next - 7); // settled, before the cross-fade to the next scene
  frames.add(Math.min(next - 7, sceneFrom(i) + 34)); // settled early in the scene (captions of the first words)
}
frames.add(LEAD + Math.round(VOICE_END * 30)); // held end frame
const list = [...frames].filter((f) => f > 12).sort((a, b) => a - b);
console.log('audit frames', list.join(','));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const fr of list) {
  const logs = [];
  const comp = await selectComposition({serveUrl, id: 'MegaNetAssistantAd', inputProps: {mode: 'audit'}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {mode: 'audit'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  const comp2 = await selectComposition({serveUrl, id: 'MegaNetAssistantAd', inputProps: {mode: 'notext'}, browserExecutable});
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {mode: 'notext'}, browserExecutable});
  console.log('frame', fr, 'text nodes', line ? JSON.parse(line.slice(10)).length : 0);
}
