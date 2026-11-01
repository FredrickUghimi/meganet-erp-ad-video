// Logs the box (including transforms) of EVERY text node on EVERY frame of MegaNetPharmacyInteractionAd, with no
// settled-frame filter and no opacity filter, so scripts/verify_textboxes_pharmacy.py can prove that no text box leaves
// the safe area at any frame, mid-slide and mid-transition included.
// usage: node scripts/pharmacy_textbox_audit.mjs <out-dir> [first-frame last-frame]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const browser = await openBrowser('chromium', {browserExecutable});
const comp = await selectComposition({serveUrl, id: 'MegaNetPharmacyInteractionAd', inputProps: {debug: 'audit'}, puppeteerInstance: browser});
const first = process.argv[3] ? Number(process.argv[3]) : 0;
const last = process.argv[4] ? Number(process.argv[4]) : comp.durationInFrames - 1;
const rows = {};
for (let f = first; f <= last; f++) {
  const logs = [];
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, 'tmp.jpg'), imageFormat: 'jpeg', jpegQuality: 40, inputProps: {debug: 'audit'}, puppeteerInstance: browser, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  rows[f] = line ? JSON.parse(line.slice('AUDIT_JSON'.length)) : [];
  if (f % 50 === 0) console.log('frame', f, 'text nodes', rows[f].length);
}
fs.writeFileSync(path.join(out, 'textboxes.json'), JSON.stringify(rows));
await browser.close(() => {});
console.log('done', Object.keys(rows).length, 'frames');
