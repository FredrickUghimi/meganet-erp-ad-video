import React, {createContext, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PM_FPS} from './timing';

export const C = {
  navy0: '#050F26',
  navy1: '#0B2A5B',
  blue: '#0B69E7',
  orange: '#FF8E1C',
  white: '#FFFFFF',
  char: '#263340',
  lb: '#7DB8FF',
  // functional UI colours
  green: '#12A06B',
  greenTxt: '#0B6E46',
  greenBg: '#DDF5EA',
  red: '#E5484D',
  redTxt: '#B42318',
  redBg: '#FDE6E6',
  amberTxt: '#9A4A00',
  amberBg: '#FFEBD2',
  blueTxt: '#0A52B5',
  blueBg: '#E3EEFF',
  muted: '#55627A',
  line: '#D5E3F8',
  card: '#FFFFFF',
  soft: '#F2F7FF',
};
export const HEAD = "'Poppins', 'Inter', sans-serif";
export const UI = "'Inter', 'Helvetica Neue', sans-serif";

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0..1 progress of time t (seconds) over [start, start+dur]. */
export const pr = (t: number, start: number, dur: number, easing: (x: number) => number = OUT) =>
  interpolate(t, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const useT = () => useCurrentFrame() / PM_FPS;

// Absolute-frame offset of the scene (so the ambient background is continuous across separately rendered scenes).
export const OffsetCtx = createContext(0);

const FACES: [string, number, string][] = [
  ['Poppins', 500, 'poppins-latin-500-normal.woff2'],
  ['Poppins', 600, 'poppins-latin-600-normal.woff2'],
  ['Poppins', 700, 'poppins-latin-700-normal.woff2'],
  ['Poppins', 800, 'poppins-latin-800-normal.woff2'],
  ['Inter', 400, 'inter-latin-400-normal.woff2'],
  ['Inter', 500, 'inter-latin-500-normal.woff2'],
  ['Inter', 600, 'inter-latin-600-normal.woff2'],
  ['Inter', 700, 'inter-latin-700-normal.woff2'],
];
export const useFonts = () => {
  const [handle] = useState(() => delayRender('pm-fonts'));
  useEffect(() => {
    Promise.all(
      FACES.map(async ([fam, w, file]) => {
        const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: String(w)});
        await ff.load();
        document.fonts.add(ff);
      }),
    )
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error('font load failed', e);
        continueRender(handle);
      });
  }, [handle]);
};

/** Ambient background: navy gradient, drifting glows and a faint grid. Time-continuous across scenes. */
export const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const off = useContext(OffsetCtx);
  const g = (f + off) / PM_FPS;
  const gx = (g * 6) % 96;
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, ${C.navy0} 0%, #081C42 45%, ${C.navy1} 100%)`}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 600px at ${25 + 6 * Math.sin(g * 0.35)}% ${30 + 5 * Math.cos(g * 0.3)}%, rgba(11,105,231,0.34), transparent 70%),
            radial-gradient(700px 500px at ${82 + 4 * Math.cos(g * 0.4)}% ${86 + 4 * Math.sin(g * 0.33)}%, rgba(255,142,28,0.13), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(125,184,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(125,184,255,0.055) 1px, transparent 1px)`,
          backgroundSize: '96px 96px',
          backgroundPosition: `${-gx}px ${-gx * 0.5}px`,
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 30%, transparent 85%)',
        }}
      />
    </AbsoluteFill>
  );
};

const IN_F = 14;
const OUT_F = 10;
/** Scene wrapper: slide+blur in/out on shared background, plus a light streak that crosses mid-screen at the boundary. */
export const SceneIO: React.FC<{dur: number; inT?: boolean; outT?: boolean; children: React.ReactNode}> = ({dur, inT = true, outT = true, children}) => {
  const f = useCurrentFrame();
  const kin = inT ? interpolate(f, [0, IN_F], [0, 1], {extrapolateRight: 'clamp', easing: OUT}) : 1;
  const kout = outT ? interpolate(f, [dur - OUT_F, dur - 1], [0, 1], {extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic)}) : 0;
  const op = kin * (1 - kout);
  const tx = (1 - kin) * 90 - kout * 90;
  const blur = (1 - kin) * 10 + kout * 10;
  const sIn = inT ? interpolate(f, [0, 12], [0.5, 1.15], {extrapolateRight: 'clamp'}) : 9;
  const sOut = outT ? interpolate(f, [dur - 12, dur], [-0.15, 0.5], {extrapolateLeft: 'clamp'}) : -9;
  const sx = f < dur / 2 ? sOut : sIn; // streak progress 0..1 across width
  const showStreak = (inT && f <= 12) || (outT && f >= dur - 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: op, transform: `translateX(${tx}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>
      {showStreak && (
        <div
          data-noaudit="1"
          style={{
            position: 'absolute', top: -100, bottom: -100, width: 360, left: `${sx * 100}%`, marginLeft: -180,
            transform: 'skewX(-16deg)',
            background: `linear-gradient(90deg, transparent, rgba(125,184,255,0.0) 12%, rgba(125,184,255,0.35) 45%, rgba(255,255,255,0.8) 50%, rgba(255,142,28,0.5) 56%, transparent 90%)`,
            filter: 'blur(6px)', opacity: 0.9, mixBlendMode: 'screen',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Corner label required on scenes 2-6. */
export const IllustrativeLabel: React.FC<{t: number}> = ({t}) => (
  <div
    style={{
      position: 'absolute', right: 56, bottom: 16, display: 'flex', alignItems: 'center', gap: 12, fontFamily: UI, fontWeight: 600, fontSize: 22, letterSpacing: 3,
      color: C.lb, opacity: pr(t, 0.2, 0.5), padding: '8px 16px', border: '1.5px solid rgba(125,184,255,0.45)', borderRadius: 999, background: 'rgba(5,15,38,0.55)',
    }}
  >
    <span style={{width: 10, height: 10, borderRadius: 5, background: C.orange}} />
    ILLUSTRATIVE ANIMATION
  </div>
);

/** Kinetic headline: words rise out of a mask, staggered. */
export const KWords: React.FC<{words: {text: string; color?: string}[]; t: number; starts: number[]; size: number; x?: number; y?: number; gap?: number; weight?: number}> = ({
  words, t, starts, size, x = 96, y = 56, gap = 0.28, weight = 800,
}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: size * gap, fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight: 1.15, letterSpacing: -1, whiteSpace: 'nowrap'}}>
    {words.map((w, i) => {
      const k = pr(t, starts[i], 0.7);
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08, marginBottom: -size * 0.08}}>
          <span style={{display: 'inline-block', color: w.color ?? C.white, transform: `translateY(${(1 - k) * 105}%) skewY(${(1 - k) * 6}deg)`, opacity: k > 0 ? 1 : 0}}>{w.text}</span>
        </span>
      );
    })}
  </div>
);

/** Real Mega-Net mark on a white tile (keeps the brand blue/orange legible on navy). */
export const LogoTile: React.FC<{size: number; glow?: number}> = ({size, glow = 0}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <div data-noaudit="1" style={{position: 'absolute', left: -size * 0.7, top: -size * 0.7, width: size * 2.4, height: size * 2.4, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,184,255,0.55) 0%, rgba(125,184,255,0.18) 30%, transparent 60%)', opacity: glow}} />
    <div
      style={{
        position: 'relative', width: size, height: size, borderRadius: size * 0.24, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 ${size * 0.08}px ${size * 0.3}px rgba(0,0,0,0.35)`,
      }}
    >
      <Img src={staticFile('logo-mark.png')} style={{height: size * 0.68, width: 'auto', display: 'block'}} />
    </div>
  </div>
);

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      position: 'absolute', background: C.card, borderRadius: 28, border: `2px solid ${C.line}`, boxShadow: '0 30px 80px rgba(2,10,30,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
      fontFamily: UI, color: C.char, boxSizing: 'border-box', ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{bg: string; color: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({bg, color, size = 24, children, style}) => (
  <div
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, background: bg, color, borderRadius: 999, padding: `${size * 0.32}px ${size * 0.8}px`,
      fontFamily: UI, fontWeight: 700, fontSize: size, lineHeight: 1.1, whiteSpace: 'nowrap', ...style,
    }}
  >
    {children}
  </div>
);

export const Dot: React.FC<{color: string; size?: number}> = ({color, size = 14}) => <span style={{width: size, height: size, borderRadius: size / 2, background: color, display: 'inline-block', flex: 'none'}} />;

const AV = ['#0B69E7', '#FF8E1C', '#12A06B', '#7B61FF', '#E5484D', '#0FA3B1'];
export const Avatar: React.FC<{initials: string; size?: number; i?: number; ring?: string}> = ({initials, size = 56, i = 0, ring}) => (
  <div
    style={{
      width: size, height: size, borderRadius: size / 2, background: `linear-gradient(135deg, ${AV[i % AV.length]}, ${AV[(i + 2) % AV.length]})`, color: C.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 700, fontSize: Math.max(22, size * 0.38), flex: 'none',
      boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
    }}
  >
    {initials}
  </div>
);

export const Check: React.FC<{size?: number; color?: string; stroke?: number}> = ({size = 26, color = C.white, stroke = 3.4}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flex: 'none'}}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Warn: React.FC<{size?: number; color?: string}> = ({size = 40, color = C.orange}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flex: 'none'}}>
    <path d="M12 3.5L2.5 20h19L12 3.5z" />
    <path d="M12 10v4.5M12 17.4v.1" />
  </svg>
);
export const Arrow: React.FC<{size?: number; color?: string}> = ({size = 34, color = C.muted}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flex: 'none'}}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

/** Appear helper: opacity + rise + slight scale, from progress k. */
export const rise = (k: number, dy = 26, s0 = 0.96): React.CSSProperties => ({opacity: k, transform: `translateY(${(1 - k) * dy}px) scale(${lerp(s0, 1, k)})`});

/** Audit hook: when the `audit` prop is set, logs every visible text box on the frame (see scripts/pm_audit.mjs). */
export const Audit: React.FC<{on: boolean}> = ({on}) => {
  useLayoutEffect(() => {
    if (!on) return;
    const rows: any[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const txt = (n.textContent || '').trim();
      const el = n.parentElement;
      if (!txt || !el) continue;
      if (['STYLE', 'SCRIPT'].includes(el.tagName)) continue;
      let op = 1;
      let ignore = false;
      let clipped = false;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      for (let a: HTMLElement | null = el; a; a = a.parentElement) {
        if (a.dataset && a.dataset.noaudit) ignore = true;
        const cs = getComputedStyle(a);
        op *= parseFloat(cs.opacity);
        if (cs.overflow === 'hidden' && a !== document.body) {
          const ar = a.getBoundingClientRect();
          if (r.left < ar.left - 1.5 || r.right > ar.right + 1.5 || r.top < ar.top - 1.5 || r.bottom > ar.bottom + 1.5) {
            // headline mask wrappers intentionally extend; only flag horizontal clipping
            if (r.left < ar.left - 1.5 || r.right > ar.right + 1.5) clipped = true;
          }
        }
      }
      const cs = getComputedStyle(el);
      rows.push({text: txt, x: r.left, y: r.top, w: r.width, h: r.height, fs: parseFloat(cs.fontSize), op, ignore, clipped, fam: cs.fontFamily.split(',')[0]});
    }
    console.log('AUDIT_JSON' + JSON.stringify(rows));
  });
  return null;
};
