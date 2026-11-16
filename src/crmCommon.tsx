/* Shared pieces for MegaNetCrmAd: cinematic background, 3D-feel phone frame, kinetic text, captions, app-style UI atoms. */
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {LINES} from './crmTimings';

export const FPS = 30;
export const LEAD = 3; // frames before the voice starts
export const FONT = 'Inter, "Inter Display", system-ui, sans-serif';
export const CYAN = '#22D3EE';
export const VIOLET = '#8B5CF6';
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const inout = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const prog = (f: number, start: number, dur: number, e: (t: number) => number = ease) =>
  e(clamp((f - start) / dur));
export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');

/** Frame at which word w of voice line s starts (voice offset by LEAD). */
export const wf = (s: number, w: number) => LEAD + Math.round(LINES[s].words[w].start * FPS);
export const wEnd = (s: number, w: number) => LEAD + Math.round(LINES[s].words[w].end * FPS);

/* ---------------- background ---------------- */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const d = (k: number) => Math.sin(f / (90 + k * 20) + k) * 60;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b1636 0%,#070c1f 45%,#02030a 100%)'}}>
      <div style={{position: 'absolute', left: -200 + d(1), top: 80 + d(2), width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle,${CYAN}38,transparent 65%)`}} />
      <div style={{position: 'absolute', right: -260 + d(3), top: 700 + d(4), width: 1000, height: 1000, borderRadius: '50%', background: `radial-gradient(circle,${VIOLET}40,transparent 65%)`}} />
      <div style={{position: 'absolute', left: 100 + d(5), bottom: -300 + d(6), width: 900, height: 700, borderRadius: '50%', background: `radial-gradient(circle,${CYAN}22,transparent 65%)`}} />
    </AbsoluteFill>
  );
};

export const GrainVignette: React.FC = () => {
  const f = useCurrentFrame();
  const ox = (f * 37) % 200;
  const oy = (f * 91) % 200;
  return (
    <>
      <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: GRAIN, backgroundPosition: `${ox}px ${oy}px`, opacity: 0.1, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </>
  );
};
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(#n)'/></svg>",
)}")`;

/* ---------------- kinetic text ---------------- */
export const KWord: React.FC<{start: number; children: React.ReactNode; color?: string; size: number; weight?: number}> = ({start, children, color = '#fff', size, weight = 800}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 12);
  return (
    <span style={{display: 'inline-block', whiteSpace: 'nowrap', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: `blur(${(1 - p) * 8}px)`, color, fontSize: size, fontWeight: weight, marginRight: size * 0.28, letterSpacing: -size * 0.02}}>
      {children}
    </span>
  );
};

/** Scene title in the top safe band (y 130+). Each entry is [text, startFrame, optional colour]. */
export const Title: React.FC<{words: [string, number, string?][]; size?: number; top?: number}> = ({words, size = 72, top = 140}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: FONT, lineHeight: 1.12, textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>
    {words.map(([t, s, c], i) => (
      <KWord key={i} start={s} color={c} size={size}>{t}</KWord>
    ))}
  </div>
);

/* ---------------- phone ---------------- */
export const PHONE_W = 500;
export const PHONE_SCALE = PHONE_W / 390;
export const PHONE_H = 844 * PHONE_SCALE;
export const PHONE_TOP = 325;

export const Phone: React.FC<{children: React.ReactNode; local: number; len: number; rotate?: number}> = ({children, local, len, rotate = 1}) => {
  const slide = prog(local, 0, 16);
  const push = 1 + 0.035 * inout(clamp(local / len));
  const ry = (-9 + 6 * clamp(local / len)) * rotate;
  return (
    <div style={{position: 'absolute', left: (1080 - PHONE_W - 28) / 2, top: PHONE_TOP, width: PHONE_W + 28, height: PHONE_H + 28, perspective: 2200, transform: `translateY(${(1 - slide) * 60}px) scale(${push})`, transformOrigin: '50% 10%', opacity: slide}}>
      <div style={{position: 'relative', width: '100%', height: '100%', transform: `rotateY(${ry}deg) rotateX(2deg)`, transformStyle: 'preserve-3d'}}>
        {/* shadow */}
        <div style={{position: 'absolute', left: 30, right: 30, bottom: -70, height: 90, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', filter: 'blur(34px)'}} />
        {/* bezel */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 70, background: 'linear-gradient(145deg,#3a4668 0%,#12182b 35%,#0a0e1c 70%,#2a3558 100%)', boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 80px ${CYAN}22, inset 0 0 0 2px rgba(255,255,255,0.14)`}} />
        {/* side buttons */}
        <div style={{position: 'absolute', right: -5, top: 230, width: 6, height: 120, borderRadius: 3, background: '#1b2340'}} />
        <div style={{position: 'absolute', left: -5, top: 190, width: 6, height: 70, borderRadius: 3, background: '#1b2340'}} />
        {/* screen */}
        <div style={{position: 'absolute', left: 14, top: 14, width: PHONE_W, height: PHONE_H, borderRadius: 56, overflow: 'hidden', background: '#fff'}}>
          <div style={{width: 390, height: 844, transform: `scale(${PHONE_SCALE})`, transformOrigin: '0 0', position: 'relative', fontFamily: FONT, color: '#2c2a33'}}>{children}</div>
          {/* island + glass */}
          <div style={{position: 'absolute', left: '50%', top: 9, width: 12, height: 12, marginLeft: -6, borderRadius: 6, background: '#05070d'}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0) 28%,rgba(255,255,255,0) 70%,rgba(255,255,255,0.06) 100%)', pointerEvents: 'none'}} />
        </div>
      </div>
    </div>
  );
};

/** Real app header, cropped from a real screenshot of the demo tenant (top 56 CSS px). */
export const AppHeader: React.FC = () => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 390, height: 56, overflow: 'hidden', zIndex: 20}}>
    <Img src={staticFile('crm/myday_before.png')} style={{width: 390, height: 844, display: 'block'}} />
  </div>
);

/** Tap ripple at (x,y) in phone-screen CSS px, starting at frame `at`. */
export const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  const p = clamp((f - at) / 16);
  if (f < at || p >= 1) return null;
  return (
    <div style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, zIndex: 40, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #4f46e5', transform: `scale(${0.4 + p * 1.3})`, opacity: 1 - p}} />
      <div style={{position: 'absolute', left: 20, top: 20, width: 20, height: 20, borderRadius: '50%', background: 'rgba(79,70,229,0.55)', opacity: 1 - p * 0.5, transform: `scale(${1 - p * 0.3})`}} />
    </div>
  );
};

/* ---------------- app-style atoms (colours from the app's index.css) ---------------- */
export const APP = {text: '#2c2a33', h: '#08060d', muted: '#6b6375', bgMuted: '#f6f5f8', border: '#e5e4e7', accent: '#4f46e5', danger: '#b91c1c', success: '#15803d', navy: '#1a2744'};
export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: APP.bgMuted, border: `1px solid ${APP.border}`, borderRadius: 12, padding: 14, ...style}}>{children}</div>
);
export const Pill: React.FC<{bg: string; fg: string; children: React.ReactNode}> = ({bg, fg, children}) => (
  <span style={{display: 'inline-block', background: bg, color: fg, borderRadius: 999, padding: '2px 9px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'}}>{children}</span>
);

/* ---------------- captions ---------------- */
type CW = {text: string; start: number; end: number};
type Group = {words: CW[]; from: number; to: number};

const buildGroups = (): Group[] => {
  const groups: Group[] = [];
  LINES.forEach((ln) => {
    const toks = ln.text.split(/\s+/);
    const ws = ln.words;
    const aligned = toks.length === ws.length;
    let cur: CW[] = [];
    const flush = () => {
      if (!cur.length) return;
      // split long groups in two balanced halves
      const parts = cur.length > 6 ? [cur.slice(0, Math.ceil(cur.length / 2)), cur.slice(Math.ceil(cur.length / 2))] : [cur];
      parts.forEach((p) => groups.push({words: p, from: 0, to: 0}));
      cur = [];
    };
    ws.forEach((w, i) => {
      let t = w.text;
      cur.push({text: t, start: LEAD + w.start * FPS, end: LEAD + w.end * FPS});
      const brk = aligned ? /[.,!?]$/.test(toks[i]) : cur.length >= 5;
      if (brk) flush();
    });
    flush();
  });
  groups.forEach((g, i) => {
    g.from = g.words[0].start - 2;
    g.to = i + 1 < groups.length ? groups[i + 1].words[0].start - 2 : g.words[g.words.length - 1].end + 24;
  });
  return groups;
};
const GROUPS = buildGroups();

export const Captions: React.FC<{hideBefore?: number; hideAfter?: number}> = ({hideBefore = 0, hideAfter = 1e9}) => {
  const f = useCurrentFrame();
  const g = GROUPS.find((x) => f >= x.from && f < x.to);
  if (!g || f < hideBefore || f >= hideAfter) return null;
  const shown = g.words.map((w, i) => {
    let t = w.text;
    if (t.toLowerCase() === 'and' && g.words[i - 1]?.text === 'Sales' && g.words[i + 1]?.text === 'CRM') t = '&';
    return t;
  });
  const enter = prog(f, g.from, 7);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 295, display: 'flex', justifyContent: 'center', opacity: enter, transform: `translateY(${(1 - enter) * 16}px)`}}>
      <div style={{maxWidth: 1000, textAlign: 'center', padding: '20px 30px', borderRadius: 40, background: 'rgba(8,12,30,0.72)', border: '1.5px solid rgba(255,255,255,0.16)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', fontFamily: FONT, fontSize: 50, fontWeight: 800, lineHeight: 1.18, letterSpacing: -0.5}}>
        {g.words.map((w, i) => {
          const active = f >= w.start && f < w.end + 3;
          const past = f >= w.end + 3;
          return (
            <span key={i} style={{display: 'inline-block', whiteSpace: 'nowrap', marginRight: i < g.words.length - 1 ? 22 : 0, color: active ? CYAN : past ? '#fff' : 'rgba(255,255,255,0.5)', textShadow: active ? `0 0 24px ${CYAN}aa` : 'none'}}>
              {shown[i]}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const CloudIcon: React.FC<{size: number; progress: number; color?: string}> = ({size, progress, color = CYAN}) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 120 94" style={{overflow: 'visible'}}>
    <path d="M30 80a22 22 0 0 1 2-43 30 30 0 0 1 57 6 19 19 0 0 1-1 37z" fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} style={{filter: `drop-shadow(0 0 10px ${color})`}} />
  </svg>
);
