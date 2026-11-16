import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, C, HEAD, lerp, LogoTile, OUT, pr, rise, SceneIO, UI, useT} from './common';
import {sceneFrames, T7} from './timing';

const PHRASES = ['YOUR PROJECTS.', 'YOUR PEOPLE.', 'YOUR BUSINESS.'];

export const Scene7: React.FC = () => {
  const t = useT();
  const dur = sceneFrames(7);
  const lk = pr(t, T7.lock, 0.9, BACK);
  const lt = pr(t, T7.lock + 0.35, 0.8);
  const fade = pr(t, T7.fadeStart, 0.5, (x) => x);
  const lineK = pr(t, T7.nodes[0], T7.nodes[2] - T7.nodes[0] + 0.6, (x) => x);
  const allK = pr(t, T7.all, 0.8);
  const demoK = pr(t, T7.demo, 0.8);
  const NODE_X = 1010;
  const YS = [170, 296, 422];
  const ALL_Y = 560;
  return (
    <SceneIO dur={dur} outT={false}>
      <AbsoluteFill style={{opacity: 1 - fade * 0.0}}>
        {/* soft hero glow */}
        <div data-noaudit="1" style={{position: 'absolute', left: -60, top: 90, width: 900, height: 700, borderRadius: 450, background: 'radial-gradient(circle, rgba(11,105,231,0.45), transparent 65%)', opacity: lk}} />
        {/* lockup */}
        <div style={{position: 'absolute', left: 96, top: 250, display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{transform: `scale(${lk})`, opacity: lk > 0 ? 1 : 0}}>
            <LogoTile size={220} glow={1 - pr(t, T7.lock + 0.9, 1)} />
          </div>
          <div style={{opacity: lt, transform: `translateX(${(1 - lt) * -40}px)`}}>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 100, color: C.white, lineHeight: 1.02, letterSpacing: -1, whiteSpace: 'nowrap'}}>Mega-Net</div>
            <div style={{fontFamily: HEAD, fontWeight: 600, fontSize: 76, color: C.lb, lineHeight: 1.1, marginTop: 14, whiteSpace: 'nowrap'}}>ERP Cloud</div>
          </div>
        </div>

        {/* connecting line + phrases */}
        <div style={{position: 'absolute', left: NODE_X - 3, top: YS[0] + 46, width: 6, height: ALL_Y - YS[0] + 46 - 46 + 0, background: 'rgba(125,184,255,0.22)', borderRadius: 3}} />
        <div style={{position: 'absolute', left: NODE_X - 3, top: YS[0] + 46, width: 6, height: (ALL_Y - YS[0]) * lineK, background: `linear-gradient(180deg, ${C.blue}, ${C.lb} 60%, ${C.orange})`, borderRadius: 3}} />
        {PHRASES.map((p, i) => {
          const k = pr(t, T7.nodes[i], 0.7);
          return (
            <div key={p} style={{position: 'absolute', left: NODE_X - 20, top: YS[i], display: 'flex', alignItems: 'center', gap: 40}}>
              <div style={{width: 40, height: 40, borderRadius: 20, background: C.blue, border: `6px solid ${C.white}`, boxSizing: 'border-box', boxShadow: '0 0 30px rgba(11,105,231,0.9)', transform: `scale(${k})`, flex: 'none'}} />
              <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: C.white, whiteSpace: 'nowrap', lineHeight: 1.1, opacity: k > 0 ? 1 : 0, transform: `translateX(${(1 - k) * 60}px)`, letterSpacing: -1}}>{p}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: NODE_X - 20, top: ALL_Y, display: 'flex', alignItems: 'center', gap: 40}}>
          <div style={{width: 40, height: 40, borderRadius: 20, background: C.orange, border: `6px solid ${C.white}`, boxSizing: 'border-box', boxShadow: '0 0 40px rgba(255,142,28,1)', transform: `scale(${pr(t, T7.all, 0.6, BACK)})`, flex: 'none'}} />
          <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: C.orange, whiteSpace: 'nowrap', lineHeight: 1.1, letterSpacing: -1, opacity: allK > 0 ? 1 : 0, transform: `translateX(${(1 - allK) * 60}px)`, textShadow: '0 0 40px rgba(255,142,28,0.45)'}}>ALL CONNECTED.</div>
        </div>

        {/* demo line + pills */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 756, textAlign: 'center', fontFamily: HEAD, fontWeight: 600, fontSize: 58, color: C.white, whiteSpace: 'nowrap', ...rise(demoK, 24, 1)}}>
          Request a personalised live demonstration.
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 868, display: 'flex', justifyContent: 'center', gap: 28}}>
          {[
            {k: pr(t, T7.pill1, 0.6, BACK), label: 'WhatsApp:', value: '+234 707 600 0030', bg: '#0B7A4F'},
            {k: pr(t, T7.pill2, 0.6, BACK), label: '', value: 'meganetsoftware.com.ng/erp-cloud.html', bg: C.blue},
          ].map((p, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: 96, padding: '0 40px', borderRadius: 48, background: p.bg, border: '3px solid rgba(255,255,255,0.35)', fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.white, whiteSpace: 'nowrap', boxShadow: '0 14px 40px rgba(0,0,0,0.35)', opacity: p.k > 0 ? 1 : 0, transform: `scale(${lerp(0.85, 1, p.k)}) translateY(${(1 - p.k) * 24}px)`}}>
              {p.label && <span style={{fontWeight: 500}}>{p.label}</span>}
              <span>{p.value}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill data-noaudit="1" style={{background: C.navy0, opacity: fade * 0.6, pointerEvents: 'none'}} />
    </SceneIO>
  );
};
