import React from 'react';
import {Arrow, BACK, Card, Check, C, Dot, HEAD, IllustrativeLabel, KWords, lerp, OUT, pr, rise, SceneIO, UI, useT} from './common';
import {sceneFrames, T5} from './timing';

const DAYS = [
  ['Mon', 'Discovery workshop', 7.5],
  ['Tue', 'Process mapping', 8],
  ['Wed', 'Module set-up', 7.75],
  ['Thu', 'Staff training', 8.25],
  ['Fri', 'Data checks', 7],
] as const;
const MONTHS = [
  ['Mar', 480, 150],
  ['Apr', 560, 210],
  ['May', 620, 240],
  ['Jun', 690, 200],
] as const;
const fmt = (n: number) => n.toLocaleString('en-GB');
const GAUGE = 63;

const Step: React.FC<{label: string; k: number; active: boolean; done: boolean; color: string}> = ({label, k, active, done, color}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 56, padding: '0 22px 0 16px', borderRadius: 999, background: done ? C.greenBg : active ? C.blueBg : C.soft, border: `2.5px solid ${done ? C.green : active ? C.blue : C.line}`, fontSize: 26, fontWeight: 700, color: done ? C.greenTxt : active ? C.blueTxt : C.muted, whiteSpace: 'nowrap', transform: `scale(${lerp(1, 1.06, k * (1 - 0.0))})`}}>
    {done ? (
      <span style={{width: 30, height: 30, borderRadius: 15, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check size={20} /></span>
    ) : (
      <Dot color={active ? C.blue : C.line} size={14} />
    )}
    {label}
  </div>
);

export const Scene5: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(5);
  const leftK = pr(t, T5.left, 0.8);
  const rightK = pr(t, T5.right, 0.8);
  // stepper state
  const stage = t >= T5.steps[2] ? 3 : t >= T5.steps[1] ? 2 : t >= T5.steps[0] ? 1 : 0; // 1 = draft->submitted done
  const draftDone = t >= T5.steps[0];
  const subDone = t >= T5.steps[1];
  const appDone = t >= T5.steps[2];
  const totalK = pr(t, T5.total, 0.7, BACK);
  const gK = pr(t, T5.gauge, 1.4);
  const R = 88;
  const CIRC = 2 * Math.PI * R;
  const budget = 5000000;
  const actual = 3150000;
  const figs: [string, string, string, string][] = [
    ['Budget', fmt(budget), C.char, ''],
    ['Actual cost to date', fmt(actual), C.char, ''],
    ['Variance (under budget)', fmt(budget - actual), C.greenTxt, ''],
    ['Forecast (estimate)', fmt(4820000), C.blueTxt, ''],
  ];
  const CH_X = 40; // chart left inside right card
  return (
    <SceneIO dur={dur}>
      <KWords t={t} starts={[T5.head, T5.head + 0.3, T5.head + 0.6, T5.head + 0.9]} size={84} words={[{text: 'TRACK'}, {text: 'TIME.'}, {text: 'CONTROL'}, {text: 'COSTS.', color: C.orange}]} />

      {/* Timesheet */}
      <Card style={{left: 96, top: 214, width: 840, height: 784, ...rise(leftK, 40)}}>
        <div style={{position: 'absolute', left: 32, top: 24, fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: C.char}}>Weekly timesheet</div>
        <div style={{position: 'absolute', left: 32, top: 74, fontSize: 24, fontWeight: 500, color: C.muted}}>Hours entered in quarter-hour steps</div>
        {/* stepper */}
        <div style={{position: 'absolute', left: 32, top: 124, display: 'flex', alignItems: 'center', gap: 12}}>
          <Step label="Draft" k={0} active={!draftDone} done={draftDone} color={C.blue} />
          <Arrow size={28} />
          <Step label="Submitted" k={0} active={draftDone && !subDone} done={subDone} color={C.blue} />
          <Arrow size={28} />
          <Step label="Approved" k={0} active={subDone && !appDone} done={appDone} color={C.green} />
        </div>
        {/* table */}
        <div style={{position: 'absolute', left: 32, right: 32, top: 208, height: 44, display: 'flex', fontSize: 22, fontWeight: 700, color: C.muted, letterSpacing: 1.5, borderBottom: `2px solid ${C.line}`}}>
          <div style={{width: 120}}>DAY</div>
          <div style={{flex: 1}}>TASK</div>
          <div style={{width: 160, textAlign: 'right'}}>HOURS</div>
        </div>
        {DAYS.map(([d, task, h], i) => {
          const k = pr(t, T5.rows[i], 0.5);
          const hv = h * pr(t, T5.rows[i] + 0.1, 0.5);
          const q = Math.round(hv * 4) / 4;
          return (
            <div key={d} style={{position: 'absolute', left: 32, right: 32, top: 262 + i * 80, height: 68, display: 'flex', alignItems: 'center', ...rise(k, 16, 1), borderBottom: `2px solid ${C.soft}`}}>
              <div style={{width: 120, fontSize: 30, fontWeight: 700, color: C.char}}>{d}</div>
              <div style={{flex: 1, fontSize: 28, fontWeight: 500, color: C.char, whiteSpace: 'nowrap'}}>{task}</div>
              <div style={{width: 160, height: 54, borderRadius: 14, background: C.blueBg, color: C.blueTxt, fontSize: 30, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px', boxSizing: 'border-box'}}>{q.toFixed(2)}</div>
            </div>
          );
        })}
        {/* total */}
        <div style={{position: 'absolute', left: 32, right: 32, top: 684, height: 84, borderRadius: 20, background: C.navy1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', boxSizing: 'border-box', opacity: totalK > 0 ? 1 : 0, transform: `scale(${lerp(0.94, 1, totalK)})`}}>
          <div style={{fontSize: 30, fontWeight: 600, color: C.lb}}>Week total</div>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 48, color: C.white}}>38.50 h</div>
        </div>
      </Card>

      {/* Budget */}
      <Card style={{left: 976, top: 214, width: 848, height: 784, ...rise(rightK, 40)}}>
        <div style={{position: 'absolute', left: 32, top: 24, fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: C.char}}>Budget vs actual</div>
        {/* gauge */}
        <div style={{position: 'absolute', left: 36, top: 92, width: 220, height: 220}}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={R} fill="none" stroke={C.line} strokeWidth={26} />
            <circle cx="110" cy="110" r={R} fill="none" stroke={C.blue} strokeWidth={26} strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - (GAUGE / 100) * gK)} transform="rotate(-90 110 110)" />
          </svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 56, color: C.char, lineHeight: 1}}>{Math.round(GAUGE * gK)}%</div>
            <div style={{fontSize: 24, fontWeight: 600, color: C.muted, marginTop: 4}}>used</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 290, top: 84, right: 32}}>
          {figs.map(([l, v, c], i) => {
            const k = pr(t, T5.figs[i], 0.5);
            return (
              <div key={l} style={{height: 58, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `2px solid ${C.soft}`, marginBottom: 8, ...rise(k, 14, 1)}}>
                <div style={{fontSize: 24, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap'}}>{l}</div>
                <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 38, color: c}}>{v}</div>
              </div>
            );
          })}
        </div>
        {/* stacked chart */}
        <div style={{position: 'absolute', left: 32, top: 360, right: 32, height: 318, opacity: pr(t, T5.chart, 0.5)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 36}}>
            <div style={{fontSize: 24, fontWeight: 700, color: C.char}}>Actual cost by month (’000)</div>
            <div style={{display: 'flex', gap: 22, fontSize: 24, fontWeight: 600, color: C.char}}>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}><Dot color={C.blue} size={16} />Purchases</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}><Dot color={C.orange} size={16} />Expenses</span>
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, height: 220, borderBottom: `3px solid ${C.line}`, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end'}}>
            {MONTHS.map(([m, p, e], i) => {
              const k = pr(t, T5.bars[i], 0.8);
              const sc = 190 / 900;
              return (
                <div key={m} style={{width: 120, position: 'relative', height: (p + e) * sc * k, display: 'flex', flexDirection: 'column-reverse'}}>
                  <div style={{height: p * sc * k, background: C.blue, borderRadius: '0 0 6px 6px'}} />
                  <div style={{height: e * sc * k, background: C.orange, borderRadius: '10px 10px 0 0'}} />
                  <div style={{position: 'absolute', left: 0, right: 0, top: -34, textAlign: 'center', fontSize: 24, fontWeight: 700, color: C.char, opacity: k > 0.9 ? 1 : 0}}>{p + e}</div>
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 4, display: 'flex', justifyContent: 'space-around', fontSize: 24, fontWeight: 600, color: C.muted}}>
            {MONTHS.map(([m]) => <div key={m} style={{width: 120, textAlign: 'center'}}>{m}</div>)}
          </div>
        </div>
        {/* note */}
        <div style={{position: 'absolute', left: 32, right: 32, top: 700, height: 66, borderRadius: 18, background: C.blueBg, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 24, fontWeight: 600, color: C.blueTxt, whiteSpace: 'nowrap', boxSizing: 'border-box', ...rise(pr(t, T5.note, 0.6), 16, 1)}}>
          Actual cost = purchases and expenses tagged to the project
        </div>
      </Card>
      <IllustrativeLabel t={t} />
    </SceneIO>
  );
};
