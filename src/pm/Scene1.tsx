import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Avatar, BACK, C, HEAD, INOUT, lerp, OUT, pr, SceneIO, UI, useT} from './common';
import {sceneFrames, T1} from './timing';

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Item = {kind: 'card' | 'chip' | 'avatar' | 'sheet' | 'figure'; x: number; y: number; rot: number; amp: number; ph: number; sp: number; t0: number; v: number; scale: number};

const TITLES = ['Project Atlas', 'Site Fit-out', 'Q3 Rollout', 'Migration', 'Audit Prep', 'Branch Setup', 'Vendor Review', 'Onboarding'];
const CHIPS: [string, string, string][] = [
  ['OVERDUE 3d', C.red, '#fff'], ['Due Fri', C.orange, '#2b1700'], ['2 days left', C.orange, '#2b1700'], ['Deadline today', C.red, '#fff'],
  ['Late', C.red, '#fff'], ['Due tomorrow', C.orange, '#2b1700'], ['Overdue', C.red, '#fff'], ['Due 14 Mar', '#fff', C.char],
];
const FIGS = ['1,250,000', '46', '87%', '320', '12.5', '58 h', '4,800', '92', '640,000', '31%', '7.75', '2,150'];
const KINDS: Item['kind'][] = ['card', 'figure', 'chip', 'avatar', 'sheet', 'chip', 'figure', 'card', 'avatar', 'sheet'];

const ITEMS: Item[] = (() => {
  const r = rng(7);
  const out: Item[] = [];
  for (let i = 0; i < 46; i++) {
    out.push({
      kind: KINDS[i % KINDS.length],
      x: 70 + r() * 1700,
      y: 60 + r() * 880,
      rot: (r() - 0.5) * 22,
      amp: 14 + r() * 36,
      ph: r() * 6.28,
      sp: 0.5 + r() * 1.1,
      t0: 0.1 + (i / 46) * 1.7 + r() * 0.1,
      v: Math.floor(r() * 100),
      scale: 0.8 + r() * 0.5,
    });
  }
  return out;
})();

const Sheet: React.FC<{v: number}> = ({v}) => {
  const nums = ['1,250', '320', '46', '87', '12.5', '640', '31', '7.75', '92'];
  return (
    <div style={{width: 300, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 14px 40px rgba(0,0,0,0.4)', fontFamily: UI}}>
      <div style={{background: '#12A06B', color: '#fff', fontWeight: 700, fontSize: 22, padding: '6px 12px'}}>Budget_final_v{(v % 9) + 2}</div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
        {nums.map((n, i) => (
          <div key={i} style={{borderRight: '1px solid #cfd8e3', borderBottom: '1px solid #cfd8e3', padding: '5px 8px', fontSize: 22, color: C.char, textAlign: 'right', fontWeight: 500}}>{n}</div>
        ))}
      </div>
    </div>
  );
};

const ItemView: React.FC<{it: Item; i: number}> = ({it, i}) => {
  switch (it.kind) {
    case 'card':
      return (
        <div style={{width: 320, background: '#fff', borderRadius: 18, padding: '16px 20px', boxShadow: '0 14px 40px rgba(0,0,0,0.4)', fontFamily: UI, color: C.char}}>
          <div style={{fontWeight: 700, fontSize: 28}}>{TITLES[i % TITLES.length]}</div>
          <div style={{fontSize: 22, color: C.muted, marginTop: 2}}>{(it.v % 9) + 2} tasks open</div>
          <div style={{height: 12, borderRadius: 6, background: '#E3ECFA', marginTop: 12}}>
            <div style={{width: `${20 + (it.v % 70)}%`, height: 12, borderRadius: 6, background: i % 3 === 0 ? C.orange : C.blue}} />
          </div>
        </div>
      );
    case 'chip': {
      const [txt, bg, fg] = CHIPS[i % CHIPS.length];
      return <div style={{background: bg, color: fg, fontFamily: UI, fontWeight: 700, fontSize: 28, padding: '10px 24px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>{txt}</div>;
    }
    case 'avatar':
      return <Avatar initials={['AO', 'CE', 'TB', 'MK', 'IF', 'NU', 'SA', 'EO'][i % 8]} size={96} i={i} />;
    case 'sheet':
      return <Sheet v={it.v} />;
    default:
      return <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 56, color: C.lb, whiteSpace: 'nowrap', textShadow: '0 0 30px rgba(125,184,255,0.55)'}}>{FIGS[i % FIGS.length]}</div>;
  }
};

export const Scene1: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(1);
  const dim = pr(t, T1.dim, 0.7);
  const col = pr(t, T1.collapse, T1.collapseDur, INOUT);
  const textOut = pr(t, T1.collapse - 0.1, 0.6, INOUT);
  const lines = [
    {txt: 'MANAGING PROJECTS', s: T1.l1, c: C.white},
    {txt: 'SHOULDN’T BE', s: T1.l2, c: C.white},
    {txt: 'THIS COMPLICATED.', s: T1.l3, c: C.orange},
  ];
  const dotGlow = pr(t, T1.collapse + 0.9, 0.5);
  return (
    <SceneIO dur={dur} inT={false} outT={false}>
      {/* chaos layer: decorative, excluded from text audit */}
      <AbsoluteFill data-noaudit="1" style={{opacity: lerp(1, 0.3, dim), filter: `blur(${lerp(0, 3.5, dim)}px) saturate(${lerp(1, 0.7, dim)})`}}>
        {ITEMS.map((it, i) => {
          const k = pr(t, it.t0, 0.5, BACK);
          if (k <= 0) return null;
          const wob = Math.sin(t * it.sp * 2 + it.ph);
          const wob2 = Math.cos(t * it.sp * 1.6 + it.ph * 1.7);
          const shake = it.kind === 'chip' ? Math.sin(t * 22 + it.ph) * 2.5 * (1 - dim) : 0;
          const x = lerp(it.x + wob * it.amp + shake, 960, col);
          const y = lerp(it.y + wob2 * it.amp, 540, col);
          const sc = it.scale * k * lerp(1, 0.04, col);
          return (
            <div
              key={i}
              style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${it.rot + wob * 6 + col * 200}deg) scale(${sc})`, opacity: 1 - Math.max(0, col - 0.75) * 4}}
            >
              <ItemView it={it} i={i} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* scrim behind headline */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 1000px 520px at 50% 50%, rgba(5,15,38,0.82), rgba(5,15,38,0.0) 75%)', opacity: dim * (1 - textOut)}} />
      {/* headline */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - textOut, transform: `scale(${lerp(1, 0.7, textOut)})`}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 118, lineHeight: 1.12, letterSpacing: -1.5, whiteSpace: 'nowrap'}}>
          {lines.map((l, i) => {
            const k = pr(t, l.s, 0.7);
            return (
              <div key={i} style={{overflow: 'hidden', padding: '0 20px 10px', marginBottom: -10}}>
                <div style={{color: l.c, transform: `translateY(${(1 - k) * 105}%)`, opacity: k > 0 ? 1 : 0}}>{l.txt}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* collapsed point of light, handed over to scene 2's ring burst */}
      <div data-noaudit="1" style={{position: 'absolute', left: 960, top: 540, width: 360, height: 360, marginLeft: -180, marginTop: -180, borderRadius: 180, background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(125,184,255,0.75) 18%, rgba(11,105,231,0.35) 45%, transparent 70%)', opacity: dotGlow, transform: `scale(${lerp(0.2, 0.34, dotGlow)})`}} />
    </SceneIO>
  );
};
