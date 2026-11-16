// Text audit for the Project Management ad. Renders every Nth frame of each PMSceneN with audit=true and checks:
//  - font size >= 22px for all visible text (>= 76px for headline-class text >= 60px is reported for info)
//  - text boxes inside the 1920x1080 canvas
//  - no horizontally clipped text (overflow:hidden ancestors)
//  - no overlapping text boxes between different elements (both opacity > 0.6)
// usage: node scripts/pm_audit.mjs <out.json> [step=10]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const step = Number(process.argv[3] || 10);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chromium', {browserExecutable: '/opt/pw-browsers/chromium'});
const tmp = path.resolve(process.argv[2] + '.tmp.jpg');
const issues = [];
const texts = new Set();
let minFont = 999;
for (let s = 1; s <= 7; s++) {
  const inputProps = {n: s, audit: true};
  const comp = await selectComposition({serveUrl, id: `PMScene${s}`, inputProps, puppeteerInstance: browser});
  for (let f = 0; f < comp.durationInFrames; f += step) {
    const logs = [];
    await renderStill({composition: comp, serveUrl, frame: f, output: tmp, imageFormat: 'jpeg', jpegQuality: 30, inputProps, puppeteerInstance: browser, onBrowserLog: (l) => logs.push(l.text)});
    const line = logs.find((x) => x.startsWith('AUDIT_JSON'));
    const rows = line ? JSON.parse(line.slice(10)) : [];
    const vis = rows.filter((r) => !r.ignore && r.op > 0.6 && r.w > 0);
    for (const r of vis) {
      texts.add(r.text);
      minFont = Math.min(minFont, r.fs);
      if (r.fs < 22) issues.push({s, f, kind: 'small-font', text: r.text, fs: r.fs});
      if (r.x < -1 || r.y < -1 || r.x + r.w > 1921 || r.y + r.h > 1081) issues.push({s, f, kind: 'off-canvas', text: r.text, box: [r.x, r.y, r.w, r.h].map(Math.round)});
      if (r.clipped) issues.push({s, f, kind: 'clipped', text: r.text});
    }
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i], b = vis[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 4 && oy > 6) issues.push({s, f, kind: 'overlap', a: a.text, b: b.text, ox: Math.round(ox), oy: Math.round(oy)});
    }
  }
  console.log('scene', s, 'done');
}
fs.rmSync(tmp, {force: true});
// collapse duplicates
const seen = new Map();
for (const i of issues) { const k = JSON.stringify({...i, f: undefined, box: undefined, ox: undefined, oy: undefined}); if (!seen.has(k)) seen.set(k, {...i, count: 0}); seen.get(k).count++; }
const out = {minFontSeen: minFont, uniqueTexts: [...texts].sort(), issues: [...seen.values()]};
fs.writeFileSync(path.resolve(process.argv[2]), JSON.stringify(out, null, 1));
console.log('min font', minFont, 'issues', out.issues.length);
for (const i of out.issues.slice(0, 60)) console.log(JSON.stringify(i));
await browser.close(() => {});
