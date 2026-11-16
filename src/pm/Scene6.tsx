import React from 'react';
import {BACK, Card, C, Dot, HEAD, IllustrativeLabel, KWords, lerp, OUT, pr, rise, SceneIO, UI, useT} from './common';
import {sceneFrames, T6} from './timing';

const KPIS = [
  {label: 'Active projects', n: 12, color: C.white, accent: C.blue},
  {label: 'On track', n: 7, color: '#6EE7B0', accent: C.green},
  {label: 'At risk', n: 3, color: '#FFC27A', accent: C.orange},
  {label: 'Delayed', n: 2, color: '#FF9A9D', accent: C.red},
  {label: 'Overdue tasks', n: 9, color: C.white, accent: C.lb},
];
type Health = 'On track' | 'At risk' | 'Delayed';
const ROWS: {name: string; reason: string; pct: number; h: Health}[] = [
  {name: 'Customer Portal Rollout', reason: 'No overdue tasks', pct: 72, h: 'On track'},
  {name: 'Warehouse Fit-out', reason: '2 overdue tasks', pct: 48, h: 'At risk'},
  {name: 'Finance Migration', reason: 'Target end date passed', pct: 31, h: 'Delayed'},
  {name: 'Branch Network Upgrade', reason: 'No overdue tasks', pct: 85, h: 'On track'},
  {name: 'Staff Onboarding Drive', reason: '1 overdue task', pct: 54, h: 'At risk'},
];
const HCOL: Record<Health, {bg: string; fg: string; dot: string; bar: string}> = {
  'On track': {bg: C.greenBg, fg: C.greenTxt, dot: C.green, bar: C.green},
  'At risk': {bg: C.amberBg, fg: C.amberTxt, dot: C.orange, bar: C.orange},
  Delayed: {bg: C.redBg, fg: C.redTxt, dot: C.red, bar: C.red},
};
const fmt = (n: number) => n.toLocaleString('en-GB');

export const Scene6: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(6);
  const finK = pr(t, T6.fin, 0.8);
  const tableK = pr(t, T6.table - 0.4, 0.7);
  const hl = pr(t, T6.hl, 0.6);
  const pulse = 0.5 + 0.5 * Math.sin((t - T6.hl) * 6);
  const TOP = 400;
  return (
    <SceneIO dur={dur}>
      <KWords t={t} starts={[T6.head, T6.head + 0.25, T6.head + 0.5, T6.head + 0.75]} size={84} words={[{text: 'SEE'}, {text: 'THE'}, {text: 'BIGGER'}, {text: 'PICTURE.', color: C.orange}]} />
      {/* KPI tiles */}
      <div style={{position: 'absolute', left: 96, top: 196, width: 1728, display: 'flex', gap: 24}}>
        {KPIS.map((k, i) => {
          const kk = pr(t, T6.kpi[i], 0.6);
          return (
            <div key={k.label} style={{flex: 1, height: 170, borderRadius: 24, background: 'linear-gradient(160deg, rgba(20,60,130,0.85), rgba(8,28,66,0.9))', border: '2px solid rgba(125,184,255,0.35)', position: 'relative', overflow: 'hidden', boxSizing: 'border-box', padding: '20px 24px', ...rise(kk, 30)}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: k.accent}} />
              <div style={{fontFamily: UI, fontWeight: 600, fontSize: 26, color: C.lb, whiteSpace: 'nowrap'}}>{k.label}</div>
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 84, color: k.color, lineHeight: 1.1, marginTop: 4}}>{Math.round(k.n * kk)}</div>
            </div>
          );
        })}
      </div>

      {/* Project table */}
      <Card style={{left: 96, top: TOP, width: 1194, height: 600, ...rise(tableK, 36)}}>
        <div style={{position: 'absolute', left: 32, right: 32, top: 18, height: 44, display: 'flex', fontSize: 22, fontWeight: 700, color: C.muted, letterSpacing: 1.5, borderBottom: `2px solid ${C.line}`}}>
          <div style={{width: 500}}>PROJECT</div>
          <div style={{width: 380}}>PROGRESS</div>
          <div>HEALTH</div>
        </div>
        {ROWS.map((r, i) => {
          const k = pr(t, T6.table + i * T6.rowStep, 0.6);
          const bk = pr(t, T6.table + i * T6.rowStep + 0.15, 1.0);
          const hc = HCOL[r.h];
          const pk = pr(t, T6.table + i * T6.rowStep + 0.7, 0.5, BACK);
          const emph = hl > 0 && r.h !== 'On track' ? pulse : 0;
          return (
            <div key={r.name} style={{position: 'absolute', left: 14, right: 14, top: 72 + i * 100, height: 96, borderRadius: 18, background: emph > 0 ? `rgba(255,142,28,${0.08 + 0.08 * emph})` : i % 2 === 0 ? C.soft : '#fff', ...rise(k, 16, 1)}}>
              <div style={{position: 'absolute', left: 18, top: 10}}>
                <div style={{fontSize: 30, fontWeight: 700, color: C.char, whiteSpace: 'nowrap'}}>{r.name}</div>
                <div style={{fontSize: 24, fontWeight: 600, color: r.h === 'On track' ? C.muted : hc.fg, marginTop: 2, whiteSpace: 'nowrap'}}>{r.reason}</div>
              </div>
              <div style={{position: 'absolute', left: 518, top: 30, display: 'flex', alignItems: 'center', gap: 16}}>
                <div style={{width: 230, height: 18, borderRadius: 9, background: C.line, overflow: 'hidden'}}>
                  <div style={{height: 18, borderRadius: 9, background: hc.bar, width: `${r.pct * bk}%`}} />
                </div>
                <div style={{fontSize: 28, fontWeight: 700, color: C.char, width: 80}}>{Math.round(r.pct * bk)}%</div>
              </div>
              <div style={{position: 'absolute', left: 898, top: 24, opacity: pk > 0 ? 1 : 0, transform: `scale(${lerp(0.7, 1, pk)})`, transformOrigin: 'left center'}}>
                <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: hc.bg, color: hc.fg, borderRadius: 999, padding: '8px 22px 8px 16px', fontSize: 26, fontWeight: 700, whiteSpace: 'nowrap'}}>
                  <Dot color={hc.dot} size={14} />
                  {r.h}
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Financial summary */}
      <Card style={{left: 1330, top: TOP, width: 494, height: 600, ...rise(finK, 36)}}>
        <div style={{position: 'absolute', left: 30, top: 24, fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: C.char}}>Financial summary</div>
        {[
          ['Total budget', fmt(18400000), C.char],
          ['Actual cost', fmt(11920000), C.char],
          ['Variance', fmt(6480000), C.greenTxt],
          ['Forecast (estimate)', fmt(17900000), C.blueTxt],
        ].map(([l, v, c], i) => {
          const k = pr(t, T6.fin + 0.3 + i * 0.25, 0.5);
          return (
            <div key={l} style={{position: 'absolute', left: 30, right: 30, top: 86 + i * 88, height: 80, borderBottom: `2px solid ${C.soft}`, ...rise(k, 14, 1)}}>
              <div style={{fontSize: 24, fontWeight: 600, color: C.muted}}>{l}</div>
              <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 42, color: c, lineHeight: 1.2}}>{v}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 30, right: 30, top: 462, ...rise(pr(t, T6.fin + 1.3, 0.5), 14, 1)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 600, color: C.muted}}>
            <span>Budget used</span>
            <span style={{fontWeight: 700, color: C.char}}>{Math.round(65 * pr(t, T6.fin + 1.4, 1.2))}%</span>
          </div>
          <div style={{height: 22, borderRadius: 11, background: C.line, marginTop: 12, overflow: 'hidden'}}>
            <div style={{height: 22, borderRadius: 11, background: `linear-gradient(90deg, ${C.blue}, ${C.lb})`, width: `${65 * pr(t, T6.fin + 1.4, 1.2)}%`}} />
          </div>
        </div>
      </Card>
      <IllustrativeLabel t={t} />
    </SceneIO>
  );
};
