import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, C, HEAD, IllustrativeLabel, INOUT, lerp, LogoTile, OUT, pr, SceneIO, useT} from './common';
import {sceneFrames, T2} from './timing';

const Ring: React.FC<{t: number; start: number; color: string; w: number; max: number}> = ({t, start, color, w, max}) => {
  const k = pr(t, start, 1.3, OUT);
  if (k <= 0 || k >= 1) return null;
  const r = lerp(30, max, k);
  return <div data-noaudit="1" style={{position: 'absolute', left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: r, border: `${w}px solid ${color}`, opacity: (1 - k) * 0.95, boxShadow: `0 0 40px ${color}`}} />;
};

/** Abstract dashboard: shapes only, no labels. */
const Dash: React.FC<{t: number}> = ({t}) => {
  const rise = pr(t, T2.dash, T2.dashDur, OUT);
  const s = (k: number, d = 0.8) => pr(t, T2.shapes + k, d);
  const bars = [0.45, 0.7, 0.55, 0.85, 0.65, 0.95, 0.75];
  const W = 1400;
  return (
    <div
      data-noaudit="1"
      style={{
        position: 'absolute', left: 960 - W / 2, top: lerp(1100, 600, rise), width: W, height: 760, borderRadius: 32, background: 'linear-gradient(160deg, #F7FAFF, #E6EFFC)',
        boxShadow: '0 -20px 120px rgba(11,105,231,0.45), 0 0 0 2px rgba(255,255,255,0.35)', transform: `perspective(2200px) rotateX(${lerp(16, 10, rise)}deg)`, transformOrigin: '50% 100%', overflow: 'hidden',
      }}
    >
      {/* top bar */}
      <div style={{height: 70, background: '#fff', borderBottom: `2px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px'}}>
        {[C.red, C.orange, C.green].map((c, i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
        <div style={{marginLeft: 40, width: 360, height: 24, borderRadius: 12, background: C.soft}} />
      </div>
      <div style={{display: 'flex'}}>
        {/* sidebar */}
        <div style={{width: 190, height: 690, background: C.navy1, padding: 24, boxSizing: 'border-box'}}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{height: 22, borderRadius: 11, marginBottom: 26, width: `${60 + (i % 3) * 14}%`, background: i === 1 ? C.orange : 'rgba(125,184,255,0.45)', opacity: s(i * 0.12, 0.5)}} />
          ))}
        </div>
        <div style={{flex: 1, padding: 28}}>
          {/* KPI tiles */}
          <div style={{display: 'flex', gap: 22}}>
            {[C.blue, C.orange, C.green, C.red].map((c, i) => (
              <div key={i} style={{flex: 1, height: 120, borderRadius: 20, background: '#fff', border: `2px solid ${C.line}`, padding: 20, boxSizing: 'border-box', opacity: s(i * 0.15, 0.6), transform: `translateY(${(1 - s(i * 0.15, 0.6)) * 20}px)`}}>
                <div style={{width: 70, height: 14, borderRadius: 7, background: C.line}} />
                <div style={{width: `${40 + i * 10}%`, height: 34, borderRadius: 10, background: c, marginTop: 16}} />
              </div>
            ))}
          </div>
          <div style={{display: 'flex', gap: 22, marginTop: 22}}>
            {/* bar chart */}
            <div style={{flex: 1.4, height: 330, borderRadius: 20, background: '#fff', border: `2px solid ${C.line}`, padding: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', gap: 22}}>
              {bars.map((b, i) => (
                <div key={i} style={{flex: 1, height: 250 * b * pr(t, T2.shapes + 0.3 + i * 0.08, 0.9), borderRadius: 10, background: i === 5 ? C.orange : C.blue}} />
              ))}
            </div>
            {/* donut + line */}
            <div style={{flex: 1, height: 330, borderRadius: 20, background: '#fff', border: `2px solid ${C.line}`, padding: 24, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18}}>
              <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
                <path d="M0 100 C60 90 80 40 140 55 S230 100 280 50 S350 20 400 10" fill="none" stroke={C.blue} strokeWidth={7} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - pr(t, T2.shapes + 0.5, 1.4))} />
              </svg>
              <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="52" fill="none" stroke={C.line} strokeWidth={22} />
                  <circle cx="70" cy="70" r="52" fill="none" stroke={C.orange} strokeWidth={22} strokeLinecap="round" strokeDasharray={327} strokeDashoffset={327 * (1 - 0.68 * pr(t, T2.shapes + 0.8, 1.2))} transform="rotate(-90 70 70)" />
                </svg>
                <div style={{flex: 1}}>
                  {[0.9, 0.65, 0.78].map((w, i) => <div key={i} style={{height: 16, borderRadius: 8, background: C.soft, marginBottom: 14, width: `${w * 100}%`}} />)}
                </div>
              </div>
            </div>
          </div>
          {/* table rows */}
          <div style={{marginTop: 22}}>
            {[0, 1].map((i) => (
              <div key={i} style={{height: 40, borderRadius: 12, background: '#fff', border: `2px solid ${C.line}`, marginBottom: 12, opacity: s(0.7 + i * 0.15, 0.6)}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Scene2: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(2);
  const pop = pr(t, T2.mark, 0.7, BACK);
  const up = pr(t, T2.up, T2.upDur, INOUT);
  const size = lerp(300, 150, up);
  const cy = lerp(540, 130, up);
  const kick = pr(t, T2.kick, 0.7);
  const h = pr(t, T2.h, 0.8);
  const brand = pr(t, T2.brand, 0.8);
  const flare = pr(t, 0, 0.7) * (1 - pr(t, 0.5, 0.9));
  return (
    <SceneIO dur={dur} inT={false}>
      <div data-noaudit="1" style={{position: 'absolute', left: 960 - 500, top: 540 - 500, width: 1000, height: 1000, borderRadius: 500, background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(125,184,255,0.55) 14%, transparent 55%)', opacity: flare, transform: `scale(${lerp(0.4, 1.6, pr(t, 0, 0.9))})`}} />
      <Ring t={t} start={T2.ring} color={C.orange} w={8} max={1000} />
      <Ring t={t} start={T2.ring + 0.12} color={C.blue} w={14} max={1250} />
      <Ring t={t} start={T2.ring + 0.26} color={C.lb} w={5} max={1500} />
      <Dash t={t} />
      <div style={{position: 'absolute', left: 960 - size / 2, top: cy - size / 2, opacity: pop > 0 ? 1 : 0, transform: `scale(${pop})`}}>
        <LogoTile size={size} glow={1 - up} />
      </div>
      <AbsoluteFill style={{alignItems: 'center', fontFamily: HEAD, textAlign: 'center'}}>
        <div style={{position: 'absolute', top: 218, opacity: kick, letterSpacing: lerp(30, 14, kick), color: C.orange, fontWeight: 600, fontSize: 64, whiteSpace: 'nowrap', transform: `translateY(${(1 - kick) * 20}px)`}}>INTRODUCING</div>
        <div style={{position: 'absolute', top: 296, overflow: 'hidden', padding: '0 20px 10px'}}>
          <div style={{color: C.white, fontWeight: 800, fontSize: 124, lineHeight: 1.15, letterSpacing: -1.5, whiteSpace: 'nowrap', transform: `translateY(${(1 - h) * 105}%)`}}>PROJECT MANAGEMENT</div>
        </div>
        <div style={{position: 'absolute', top: 452, color: C.lb, fontWeight: 600, fontSize: 80, whiteSpace: 'nowrap', opacity: brand, transform: `translateY(${(1 - brand) * 24}px)`}}>
          <span style={{color: C.white}}>Mega-Net</span> ERP Cloud
        </div>
      </AbsoluteFill>
      <IllustrativeLabel t={t} />
    </SceneIO>
  );
};
