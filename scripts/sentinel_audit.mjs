// Contrast / size / position audit for MegaNetSentinelAd (same method as scripts/ledger_audit.mjs): for settled frames it
// renders the frame in debug 'audit' mode (logs every text node's box, colour, size, opacity) and in 'notext' mode (text
// transparent) so the pixels behind each text box can be measured by scripts/ledger_audit.py.
// usage: node scripts/sentinel_audit.mjs <out-dir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const t = fs.readFileSync('src/sentinelTimings.ts', 'utf8');
const WORDS = [...t.matchAll(/"s": ([\d.]+),\s*"e": ([\d.]+)/g)].map((m) => ({s: +m[1], e: +m[2]}));
const src = fs.readFileSync('src/MegaNetSentinelAd.tsx', 'utf8');
const body = src.slice(src.indexOf('const CHUNKS'), src.indexOf('];', src.indexOf('const CHUNKS')));
const chunks = [...body.matchAll(/\[(\d+), (\d+)\]/g)].map((m) => [+m[1], +m[2]]);
const sc = JSON.parse(/const SCENES = (\{[^}]*\})/.exec(src)[1].replace(/(\w+):/g, '"$1":'));
const starts = Object.values(sc).map((s) => Math.round(s * 30));
const frames = new Set();
chunks.forEach(([, b]) => frames.add(Math.round((WORDS[b].s + 0.25) * 30)));
starts.slice(1).forEach((s) => frames.add(s - 2));
const SETTLE = 22; // frames after a scene starts that are still entry animation (springs)
const list = [...frames].filter((f) => !starts.some((s) => f >= s && f < s + SETTLE)).sort((a, b) => a - b);
console.log('audit frames', list.join(','));

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
for (const fr of list) {
  const logs = [];
  const comp = await selectComposition({serveUrl, id: 'MegaNetSentinelAd', inputProps: {debug: 'audit'}, browserExecutable});
  await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `audit-${fr}.png`), inputProps: {debug: 'audit'}, browserExecutable, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  fs.writeFileSync(path.join(out, `audit-${fr}.json`), line ? line.slice('AUDIT_JSON'.length) : '[]');
  const comp2 = await selectComposition({serveUrl, id: 'MegaNetSentinelAd', inputProps: {debug: 'notext'}, browserExecutable});
  await renderStill({composition: comp2, serveUrl, frame: fr, output: path.join(out, `notext-${fr}.png`), inputProps: {debug: 'notext'}, browserExecutable});
  console.log('frame', fr, 'text nodes', line ? JSON.parse(line.slice(10)).length : 0);
}
