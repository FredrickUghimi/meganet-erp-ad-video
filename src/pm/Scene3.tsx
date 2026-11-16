import React from 'react';
import {Avatar, BACK, Card, Check, C, Dot, HEAD, IllustrativeLabel, KWords, lerp, OUT, Pill, pr, rise, SceneIO, UI, useT} from './common';
import {sceneFrames, T3} from './timing';

const CHIP_DEFS = [
  {label: 'Status', value: 'Planning', dot: C.blue},
  {label: 'Start date', value: '01 Mar', dot: C.lb},
  {label: 'Target end date', value: '30 Jun', dot: C.lb},
  {label: 'Priority', value: 'High', dot: C.orange},
];
const MILESTONES = [
  {name: 'Discovery', tasks: ['Map processes', 'Approve scope'], due: ['Due 14 Mar', 'Due 28 Mar'], who: [['AO', 0], ['CE', 1]]},
  {name: 'Build', tasks: ['Configure modules', 'Train staff'], due: ['Due 25 Apr', 'Due 16 May'], who: [['TB', 2], ['MK', 3]]},
  {name: 'Go-live', tasks: ['Migrate data', 'Final sign-off'], due: ['Due 13 Jun', 'Due 27 Jun'], who: [['IF', 4], ['NU', 5]]},
] as const;

const Count: React.FC<{k: number; to: number}> = ({k, to}) => <>{Math.round(to * k)}</>;

export const Scene3: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(3);
  const chars = Math.min(T3.name.length, Math.max(0, Math.floor((t - T3.typeStart) * T3.typeCps)));
  const typing = t >= T3.typeStart && chars < T3.name.length;
  const caret = Math.floor(t * 2.4) % 2 === 0;
  const cardK = pr(t, T3.card, 0.8);
  const rightK = pr(t, T3.ms[0] - 0.7, 0.8);
  const lineK = pr(t, T3.line, 1.2);
  const COLW = 298;
  const X0 = 840 + 32;
  const sumLabels = [['3', 'milestones'], ['6', 'tasks'], ['6', 'assigned']];
  return (
    <SceneIO dur={dur}>
      <KWords t={t} starts={T3.head as unknown as number[]} size={84} words={[{text: 'PLAN.'}, {text: 'ORGANISE.'}, {text: 'ASSIGN.', color: C.orange}]} />

      {/* New project panel */}
      <Card style={{left: 96, top: 220, width: 700, height: 500, ...rise(cardK, 40)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '26px 32px 0'}}>
          <div style={{width: 44, height: 44, borderRadius: 12, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 32, fontFamily: HEAD}}>+</div>
          <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: C.char}}>New project</div>
        </div>
        <div style={{padding: '20px 32px 0'}}>
          <div style={{fontSize: 24, fontWeight: 600, color: C.muted}}>Project name</div>
          <div style={{marginTop: 8, height: 76, borderRadius: 16, border: `3px solid ${typing || chars === 0 ? C.blue : C.line}`, background: C.soft, display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 34, fontWeight: 600, color: C.char, whiteSpace: 'nowrap', boxSizing: 'border-box'}}>
            {T3.name.slice(0, chars)}
            <span style={{display: 'inline-block', width: 3, height: 40, marginLeft: 3, background: C.blue, opacity: t >= T3.card + 0.3 && chars < T3.name.length + 6 && caret ? 1 : 0}} />
          </div>
        </div>
        <div style={{padding: '22px 32px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
          {CHIP_DEFS.map((c, i) => {
            const k = pr(t, T3.chips[i], 0.55, BACK);
            return (
              <div key={c.label} style={{height: 96, borderRadius: 18, border: `2px solid ${C.line}`, background: '#fff', padding: '12px 18px', boxSizing: 'border-box', opacity: k > 0 ? 1 : 0, transform: `scale(${lerp(0.85, 1, k)})`}}>
                <div style={{fontSize: 22, fontWeight: 600, color: C.muted}}>{c.label}</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 30, fontWeight: 700, color: C.char, marginTop: 2}}>
                  <Dot color={c.dot} size={14} />
                  {c.value}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline panel */}
      <Card style={{left: 840, top: 220, width: 984, height: 500, ...rise(rightK, 40)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '26px 32px 0'}}>
          <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: C.char}}>Project timeline</div>
          <Pill bg={C.blueBg} color={C.blueTxt} size={22}>01 Mar – 30 Jun</Pill>
        </div>
        {/* connecting line */}
        <div style={{position: 'absolute', left: 32 + COLW / 2 - 4, top: 109, height: 6, width: (COLW + 20) * 2, borderRadius: 3, background: C.line}}>
          <div style={{height: 6, borderRadius: 3, background: C.blue, width: `${lineK * 100}%`}} />
        </div>
        {MILESTONES.map((m, mi) => {
          const x = 32 + mi * (COLW + 20);
          const mk = pr(t, T3.ms[mi], 0.55, BACK);
          return (
            <div key={m.name}>
              <div style={{position: 'absolute', left: x + COLW / 2 - 20 - 4, top: 92, width: 40, height: 40, transform: `rotate(45deg) scale(${mk})`, borderRadius: 9, background: mi === 2 ? C.orange : C.blue, boxShadow: '0 6px 16px rgba(11,105,231,0.4)'}} />
              <div style={{position: 'absolute', left: x, top: 148, width: COLW, textAlign: 'center', fontSize: 30, fontWeight: 700, color: C.char, opacity: mk}}>{m.name}</div>
              {m.tasks.map((task, ti) => {
                const idx = mi * 2 + ti;
                const k = pr(t, T3.tasks[idx], 0.6);
                const ak = pr(t, T3.av[idx], 0.5, BACK);
                const dk = pr(t, T3.due[idx], 0.5);
                const top = 202 + ti * 140;
                return (
                  <div key={task} style={{position: 'absolute', left: x, top, width: COLW, height: 124, borderRadius: 18, border: `2px solid ${C.line}`, background: C.soft, boxSizing: 'border-box', padding: '14px 16px', ...rise(k, 22)}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 700, color: C.char, whiteSpace: 'nowrap'}}>
                      <span style={{width: 22, height: 22, borderRadius: 7, border: `3px solid ${C.blue}`, flex: 'none', boxSizing: 'border-box'}} />
                      {task}
                    </div>
                    <div style={{position: 'absolute', left: 16, right: 16, bottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      <div style={{opacity: dk, transform: `translateY(${(1 - dk) * 8}px)`}}>
                        <Pill bg={C.amberBg} color={C.amberTxt} size={22} style={{padding: '6px 14px'}}>{m.due[ti]}</Pill>
                      </div>
                      <div style={{opacity: ak > 0 ? 1 : 0, transform: `scale(${ak})`}}>
                        <Avatar initials={m.who[ti][0]} size={48} i={m.who[ti][1]} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>

      {/* Summary */}
      <div style={{position: 'absolute', left: 96, top: 770, width: 1728, display: 'flex', gap: 24}}>
        {sumLabels.map(([n, l], i) => {
          const k = pr(t, T3.sum[i], 0.7);
          return (
            <div key={l} style={{flex: 1, height: 200, borderRadius: 28, background: 'linear-gradient(135deg, rgba(11,105,231,0.35), rgba(11,42,91,0.75))', border: '2px solid rgba(125,184,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, boxSizing: 'border-box', ...rise(k, 30)}}>
              <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: i === 2 ? C.orange : C.white, lineHeight: 1}}>
                <Count k={k} to={Number(n)} />
              </div>
              <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 52, color: C.lb}}>{l}</div>
              <div style={{opacity: pr(t, T3.sum[i] + 0.3, 0.4)}}>
                <div style={{width: 52, height: 52, borderRadius: 26, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check size={32} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <IllustrativeLabel t={t} />
    </SceneIO>
  );
};
