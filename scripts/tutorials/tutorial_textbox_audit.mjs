// Logs the box (including transforms) of EVERY text node on EVERY frame of a Staff Directory tutorial, with no settled-frame or
// opacity filter, so scripts/verify_textboxes_pharmacy.py (generic despite its name) can prove that no text box leaves the safe
// area at any frame, mid cross-fade included; scripts/tutorials/verify_captions_tutorial.py also reads this file to check the
// caption text actually rendered on every frame.
// usage: node scripts/tutorials/tutorial_textbox_audit.mjs <invite|change|deactivate> <out-dir> [first last] [debug-mode]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const key = process.argv[2];
const out = path.resolve(process.argv[3]);
fs.mkdirSync(out, {recursive: true});
const ID = {invite: 'MegaNetTutorialInvite', change: 'MegaNetTutorialChange', deactivate: 'MegaNetTutorialDeactivate'}[key];
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chromium', {browserExecutable: '/opt/pw-browsers/chromium'});
const mode = process.argv[6] ? 'audit+' + process.argv[6] : 'audit';
const comp = await selectComposition({serveUrl, id: ID, inputProps: {debug: mode}, puppeteerInstance: browser});
const first = process.argv[4] ? Number(process.argv[4]) : 0;
const last = process.argv[5] ? Number(process.argv[5]) : comp.durationInFrames - 1;
const rows = {};
for (let f = first; f <= last; f++) {
  const logs = [];
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, 'tmp.jpg'), imageFormat: 'jpeg', jpegQuality: 40, inputProps: {debug: mode}, puppeteerInstance: browser, onBrowserLog: (l) => logs.push(l.text)});
  const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
  rows[f] = line ? JSON.parse(line.slice('AUDIT_JSON'.length)) : [];
  if (f % 200 === 0) console.log(key, 'frame', f, 'text nodes', rows[f].length);
}
fs.writeFileSync(path.join(out, 'textboxes.json'), JSON.stringify(rows));
await browser.close(() => {});
console.log(key, 'done', Object.keys(rows).length, 'frames');
