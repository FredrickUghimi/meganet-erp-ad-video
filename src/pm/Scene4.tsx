import React from 'react';
import {Avatar, BACK, Card, C, HEAD, IllustrativeLabel, KWords, lerp, OUT, Pill, pr, rise, SceneIO, UI, useT, Warn} from './common';
import {sceneFrames, T4} from './timing';

const PEOPLE = [
  {name: 'Ada', ini: 'AO', hrs: [32, 36, 38, 34, 30, 28]},
  {name: 'Tunde', ini: 'TB', hrs: [40, 38, 36, 40, 32, 30]},
  {name: 'Chioma', ini: 'CE', hrs: [24, 28, 32, 36, 38, 34]},
  {name: 'Musa', ini: 'MK', hrs: [36, 40, 40, 38, 34, 26]},
  {name: 'Ife', ini: 'IF', hrs: [34, 38, 46, 52, 38, 34]},
];
const CAP = 40;
const SCALE = 3.5; // px per hour
const NAME_W = 300;
const CELL_W = 230;
const CARD_X = 96;
const CARD_Y = 214;
const ROW_H = 98;
const HEAD_H = 118;

export const Scene4: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(4);
  const cardK = pr(t, T4.card, 0.8);
  const markerK = pr(t, T4.marker, 0.8);
  const flagK = pr(t, T4.flag, 0.5);
  const pulse = flagK > 0 ? 0.5 + 0.5 * Math.sin((t - T4.flag) * 7) : 0;
  const banK = pr(t, T4.banner, 0.7, BACK);
  return (
    <SceneIO dur={dur}>
      <KWords t={t} starts={[T4.head, T4.head + 0.25, T4.head + 0.5, T4.head + 0.75]} size={80} gap={0.26} words={[{text: 'MANAGE'}, {text: 'PEOPLE'}, {text: 'AND'}, {text: 'RESOURCES', color: C.orange}]} />
      <Card style={{left: CARD_X, top: CARD_Y, width: 1728, height: HEAD_H + ROW_H * 5 + 24, ...rise(cardK, 40)}}>
        {/* header */}
        <div style={{position: 'absolute', left: 32, top: 24, fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: C.char}}>Weekly capacity</div>
        <div style={{position: 'absolute', right: 32, top: 26, display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 700, color: C.amberTxt, opacity: markerK}}>
          <svg width="12" height="36" viewBox="0 0 12 36"><line x1="6" y1="0" x2="6" y2="36" stroke={C.orange} strokeWidth="3.5" strokeDasharray="7 5" /></svg>
          40 h/week capacity
        </div>
        {[0, 1, 2, 3, 4, 5].map((w) => (
          <div key={w} style={{position: 'absolute', left: NAME_W + 32 + w * CELL_W, top: 76, width: CELL_W, textAlign: 'center', fontSize: 24, fontWeight: 700, color: C.muted, opacity: pr(t, T4.card + 0.4 + w * 0.06, 0.5)}}>
            Week {w + 1}
          </div>
        ))}
        {PEOPLE.map((p, ri) => {
          const rk = pr(t, T4.row0 + ri * T4.rowStep, 0.6);
          const over = p.name === 'Ife';
          const top = HEAD_H + ri * ROW_H;
          return (
            <div key={p.name} style={{position: 'absolute', left: 0, top, width: 1728, height: ROW_H, opacity: rk, transform: `translateX(${(1 - rk) * -30}px)`}}>
              <div style={{position: 'absolute', left: 14, right: 14, top: 4, bottom: 4, borderRadius: 20, background: ri % 2 === 0 ? C.soft : 'transparent', border: over && flagK > 0 ? `3px solid rgba(255,142,28,${0.55 + 0.45 * pulse})` : '3px solid transparent', boxSizing: 'border-box'}} />
              <div style={{position: 'absolute', left: 34, top: 20, display: 'flex', alignItems: 'center', gap: 16}}>
                <Avatar initials={p.ini} size={56} i={ri} />
                <div style={{fontSize: 30, fontWeight: 700, color: C.char}}>{p.name}</div>
              </div>
              {p.hrs.map((h, w) => {
                const bk = pr(t, T4.bars + ri * T4.rowStep + w * 0.07, 0.9);
                const x = NAME_W + 32 + w * CELL_W + 8;
                const isOver = h > CAP;
                const base = Math.min(h, CAP) * SCALE * bk;
                const extra = isOver ? (h - CAP) * SCALE * bk : 0;
                const hot = isOver && flagK > 0;
                return (
                  <div key={w}>
                    <div style={{position: 'absolute', left: x, top: 26, width: base, height: 46, borderRadius: extra > 0 ? '12px 0 0 12px' : 12, background: hot ? C.red : C.blue, display: 'flex', alignItems: 'center', paddingLeft: 14, boxSizing: 'border-box', color: '#fff', fontSize: 24, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                      {bk > 0.97 ? `${h} h` : ''}
                    </div>
                    {extra > 0 && (
                      <div style={{position: 'absolute', left: x + base, top: 26, width: extra, height: 46, borderRadius: '0 12px 12px 0', background: hot ? '#FF6B6F' : C.blue}} />
                    )}
                    {/* 40 h marker */}
                    <div style={{position: 'absolute', left: x + CAP * SCALE - 1.5, top: 14, height: ROW_H - 28, borderLeft: `3px dashed ${C.orange}`, opacity: markerK}} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>

      {/* warning */}
      <div
        style={{
          position: 'absolute', left: 96, top: 214 + HEAD_H + ROW_H * 5 + 24 + 28, width: 1728, height: 120, borderRadius: 28, background: 'linear-gradient(90deg, rgba(255,142,28,0.28), rgba(229,72,77,0.2))',
          border: `3px solid ${C.orange}`, display: 'flex', alignItems: 'center', gap: 24, padding: '0 36px', boxSizing: 'border-box', opacity: banK > 0 ? 1 : 0, transform: `translateY(${(1 - banK) * 40}px) scale(${lerp(0.96, 1, banK)})`,
        }}
      >
        <Warn size={64} />
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: C.white, whiteSpace: 'nowrap'}}>Over-allocated: Ife</div>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 30, color: '#FFE2C2', whiteSpace: 'nowrap'}}>Week 3: 46 h · Week 4: 52 h</div>
        <div style={{flex: 1}} />
        <Pill bg={C.orange} color="#2B1500" size={26}>Week 3 +6 h</Pill>
        <Pill bg={C.orange} color="#2B1500" size={26}>Week 4 +12 h</Pill>
      </div>
      <IllustrativeLabel t={t} />
    </SceneIO>
  );
};
