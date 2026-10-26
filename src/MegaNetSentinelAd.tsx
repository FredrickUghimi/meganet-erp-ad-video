/*
 * ===== AD COPY: Mega-Net EHR Cloud - Financial Sentinel (20.7 s, 1080x1920, 30 fps) =====
 * Composition: MegaNetSentinelAd. Voiceover: public/voiceover-sentinel.mp3 (en-NG-AbeoNeural).
 * Scene times follow the voiceover word timings in src/sentinelTimings.ts. No background music.
 * Every claim below was read from the EHR-Cloud- repo (docs/support/financial_sentinel.md, financial_sentinel/*.py).
 *
 * Scene 1 (0-3.95s)    on screen: "Tests done." / "Drugs dispensed." / "Billed?" / "Or lost?"
 *                      voice:     "Tests done. Drugs dispensed. Billed? Or lost?"
 * Scene 2 (3.95-7.2s)  on screen: logo card, "Mega-Net EHR Cloud", "Financial Sentinel"
 *                      voice:     "Meet Financial Sentinel, in Mega-Net EHR Cloud."
 * Scene 3 (7.2-13.8s)  on screen: illustrated "Run Analysis" button, "Clinical records" vs "Bills",
 *                                 chips: "Unbilled services", "Duplicate transactions", "Rejected claims"
 *                      voice:     "One click checks clinical records against bills and flags unbilled
 *                                  services, duplicates and rejected claim patterns."
 * Scene 4 (13.8-17.4s) on screen: "Each finding" / severity ladder (Critical, High, Medium, Informational)
 *                                 / "Explained." / "Your team decides."
 *                      voice:     "Each finding is ranked and explained. Your team decides."
 * Scene 5 (17.4-20.7s) on screen: "Book a free demo" / "WhatsApp: +2347035682478" / "meganetsoftware.com.ng"
 *                                 + logo card (the logo already reads "Mega-Net Software")
 *                      voice:     "Book a free demo. Message us on WhatsApp."
 * Captions: burned in, word for word from the voice, highlighted as each word is spoken.
 * Last frame holds ~0.5 s after the last spoken word (voice ends ~20.15 s, video ends 20.7 s).
 * Logo: public/logo-trim.jpg (trimmed from logo.jpg) in a white rounded card on blue scenes.
 * Safe area (Shorts/Reels/TikTok): top 200px, bottom 480px, left 80px, right 160px, i.e. everything
 * (captions, chips, cards, button, CTA, logo) stays inside x 80-920, y 200-1440, including during animations.
 * Captions: bottom edge at y=1360 (Shorts channel-handle row starts near y=1430), max 2 lines, centered in the 840px safe width.
 * v3 colour makeover: gradient backgrounds per scene, drawn floating icons, traffic-light severity pills, coloured chips.
 * Copy, voiceover and timings are unchanged. Helpers (gradients, icons, debug layers) live in src/fx.tsx.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {WORDS} from './sentinelTimings';
import {
  BLUE,
  DARK,
  DebugContext,
  Floaters,
  GradientBg,
  Glow,
  Layer,
  ORANGE,
  ORANGE_TXT,
  PURPLE,
  Violation,
  WHITE,
} from './fx';

const RED = '#D32F2F';
const YELLOW = '#FFD600';

const SAFE_L = 80;
const SAFE_R = 160;
const SAFE_T = 200;
const SAFE_B = 480; // safe area ends at y = 1440
const CAP_B = 560; // captions end at y = 1920 - 560 = 1360
const STAGE_B = 750; // scene content ends at y = 1170, above the 2-line caption (top ~1184)
const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const SENTINEL_FPS = 30;
export const SENTINEL_FRAMES = 621; // 20.7 s

// Scene start times (s), set from the voiceover words.
const SCENES = {s1: 0, s2: 3.95, s3: 7.2, s4: 13.8, s5: 17.4, end: 20.7};
const f = (s: number) => Math.round(s * SENTINEL_FPS);

// Index of each narrated word in WORDS (47 words, in order).
const W = {
  tests: 0, drugs: 2, billed: 4, or: 5,
  meet: 7, financial: 8, sentinel: 9, mega: 11,
  one: 14, click: 15, clinical: 17, against: 19, bills: 20, flags: 22,
  unbilled: 23, duplicates: 25, rejected: 27,
  each: 30, ranked: 33, explained: 35, your: 36,
  book: 39, message: 43, whatsapp: 46,
};

// Caption chunks: [first word, last word] indexes into WORDS. Together they cover all 47 words once.
const CHUNKS: Array<[number, number]> = [
  [0, 1], [2, 3], [4, 6],
  [7, 9], [10, 13],
  [14, 18], [19, 24], [25, 29],
  [30, 35], [36, 38],
  [39, 42], [43, 46],
];

// ---- timing helpers ----
const SceneStart = React.createContext(0);

/** Spring that starts when narrated word `i` begins (a few frames early), relative to the current scene. */
const useWord = (i: number, config: {damping?: number; stiffness?: number; mass?: number} = {damping: 14}) => {
  const frame = useCurrentFrame();
  const from = React.useContext(SceneStart);
  const {fps} = useVideoConfig();
  return Math.min(1, spring({frame: frame - (f(WORDS[i].s) - from - 3), fps, config}));
};

const Stage: React.FC<{
  stops: string[];
  glows?: Glow[];
  angle?: number;
  decor?: React.ReactNode;
  children: React.ReactNode;
}> = ({stops, glows, angle, decor, children}) => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <GradientBg stops={stops} glows={glows} angle={angle} />
    <Layer kind="content">
      {decor}
      <div
        style={{
          position: 'absolute',
          left: SAFE_L,
          right: SAFE_R,
          top: SAFE_T,
          bottom: STAGE_B,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </Layer>
  </AbsoluteFill>
);

const big = (size: number, color = DARK): React.CSSProperties => ({
  fontSize: size,
  lineHeight: 1.08,
  fontWeight: 900,
  color,
  margin: 0,
  letterSpacing: -2,
});

const Pulse: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = ORANGE}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = 1 + 0.18 * Math.sin((frame / fps) * Math.PI * 2 * 1.5);
  return (
    <span style={{display: 'inline-block', color, transform: `scale(${p})`, transformOrigin: 'center bottom'}}>
      {children}
    </span>
  );
};

const LogoCard: React.FC<{width: number; scale?: number}> = ({width, scale = 1}) => (
  <div
    style={{
      width,
      padding: `${width * 0.07}px ${width * 0.08}px`,
      borderRadius: 48,
      backgroundColor: WHITE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      transform: `scale(${scale})`,
      boxShadow: '0 16px 36px rgba(10,15,70,0.30), 0 0 40px rgba(255,255,255,0.45)',
    }}
  >
    <Img src={staticFile('logo-trim.jpg')} style={{width: '100%', height: 'auto'}} />
  </div>
);

// Scene backgrounds (the light scenes keep dark text, the dark scenes keep white text).
const BG1 = [BLUE, PURPLE];
const GLOWS1: Glow[] = [
  {x: 120, y: 1250, r: 400, color: 'rgba(0,214,200,0.30)'},
  {x: 960, y: 140, r: 320, color: 'rgba(0,214,200,0.22)'},
];
const BG2 = ['#123FA8', '#3D2AB5', '#5A2BC0'];
const GLOWS2: Glow[] = [
  {x: 500, y: 330, r: 400, color: 'rgba(120,180,255,0.30)'},
  {x: 900, y: 1150, r: 340, color: 'rgba(0,214,200,0.20)'},
];
const BG3 = ['#DCEBFF', '#E6DEFF'];
const GLOWS3: Glow[] = [
  {x: 150, y: 300, r: 380, color: 'rgba(26,109,224,0.14)'},
  {x: 900, y: 1100, r: 380, color: 'rgba(109,63,214,0.14)'},
];
const BG4 = ['#E3EEFF', '#F1E6FF'];
const GLOWS4: Glow[] = [
  {x: 900, y: 250, r: 360, color: 'rgba(247,148,29,0.16)'},
  {x: 120, y: 1100, r: 360, color: 'rgba(26,109,224,0.14)'},
];
const BG5 = ['#1458D6', '#5B2FC9', '#7A3FD8'];
const GLOWS5: Glow[] = [
  {x: 160, y: 1200, r: 420, color: 'rgba(0,214,200,0.26)'},
  {x: 900, y: 300, r: 340, color: 'rgba(255,255,255,0.12)'},
];

const outlined = (color: string, stroke: number, glow: string): React.CSSProperties => ({
  color,
  WebkitTextStroke: `${stroke}px ${WHITE}`,
  paintOrder: 'stroke fill',
  filter: `drop-shadow(0 0 22px ${glow})`,
});

// ---------- Scene 1: the hook ----------
const Scene1: React.FC = () => {
  const a = useWord(W.tests, {damping: 9, stiffness: 160, mass: 1.2});
  const b = useWord(W.drugs, {damping: 9, stiffness: 160, mass: 1.2});
  const c = useWord(W.billed, {damping: 9, stiffness: 150, mass: 1.2});
  const d = useWord(W.or, {damping: 9, stiffness: 150, mass: 1.2});
  const slam = (p: number): React.CSSProperties => ({
    opacity: interpolate(p, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
    transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
  });
  const shadow = '0 4px 18px rgba(20,10,90,0.45)';
  return (
    <Stage
      stops={BG1}
      glows={GLOWS1}
      decor={
        <Floaters
      items={[
        {icon: 'tube', x: 150, y: 262, size: 104, phase: 0, accent: '#37E0C8'},
        {icon: 'pill', x: 850, y: 262, size: 104, phase: 1.7, accent: ORANGE},
        {icon: 'receipt', x: 150, y: 1100, size: 104, phase: 3.1, accent: BLUE},
        {icon: 'pill', x: 850, y: 1100, size: 104, phase: 4.6, accent: '#37E0C8'},
      ]}
      opacity={interpolate(a, [0, 1], [0, 1])}
    />
      }
    >
      <h1 style={{...big(92, WHITE), textShadow: shadow, ...slam(a)}}>Tests done.</h1>
      <h1 style={{...big(92, WHITE), marginTop: 20, whiteSpace: 'nowrap', textShadow: shadow, ...slam(b)}}>
        Drugs dispensed.
      </h1>
      <h1 style={{...big(200, BLUE), ...outlined(BLUE, 16, 'rgba(255,255,255,0.85)'), marginTop: 90, ...slam(c)}}>
        Billed<Pulse>?</Pulse>
      </h1>
      <h1 style={{...big(150, ORANGE), ...outlined(ORANGE, 14, 'rgba(255,200,120,0.9)'), marginTop: 20, ...slam(d)}}>
        Or lost<Pulse color={DARK}>?</Pulse>
      </h1>
    </Stage>
  );
};

// ---------- Scene 2: brand ----------
const ShieldBadge: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 0 18px rgba(247,148,29,0.7))'}}>
    <circle cx="50" cy="50" r="50" fill={ORANGE} />
    <path d="M50 17 L77 27 V50 C77 66 65 76 50 82 C35 76 23 66 23 50 V27 Z" fill={WHITE} />
    <path d="M37 50 L46 59 L64 40" fill="none" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const from = React.useContext(SceneStart);
  const card = useWord(W.meet, {damping: 13, stiffness: 110});
  const badge = useWord(W.financial, {damping: 10, stiffness: 120});
  const title = useWord(W.financial, {damping: 16, stiffness: 110});
  const ehr = useWord(W.mega, {damping: 16, stiffness: 110});
  // shine: a pale band sweeps across the orange title every 1.6 s once it is in
  const t0 = f(WORDS[W.financial].s) - from + 14;
  const sweep = frame < t0 ? 0 : ((frame - t0) % 48) / 48;
  return (
    <Stage stops={BG2} glows={GLOWS2}>
      <div style={{opacity: card, transform: `translateY(${(1 - card) * 50}px)`}}>
        <LogoCard width={620} />
      </div>
      <div style={{marginTop: 50, transform: `scale(${badge})`, opacity: badge}}>
        <ShieldBadge size={140} />
      </div>
      <h1
        style={{
          ...big(150, ORANGE),
          marginTop: 20,
          opacity: title,
          transform: `translateY(${(1 - title) * 50}px)`,
          backgroundImage: `linear-gradient(105deg, ${ORANGE} 0%, ${ORANGE} 38%, #FFE9BE 50%, ${ORANGE} 62%, ${ORANGE} 100%)`,
          backgroundSize: '300% 100%',
          backgroundPosition: `${interpolate(sweep, [0, 1], [100, 0])}% 0`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 14px rgba(5,10,60,0.55))',
        }}
      >
        Financial
        <br />
        Sentinel
      </h1>
      <div
        style={{
          width: interpolate(title, [0, 1], [0, 420]),
          height: 14,
          borderRadius: 7,
          backgroundColor: ORANGE,
          marginTop: 22,
          boxShadow: '0 0 20px rgba(247,148,29,0.6)',
        }}
      />
      <p
        style={{
          fontSize: 62,
          fontWeight: 700,
          color: WHITE,
          margin: '30px 0 0',
          opacity: ehr,
          transform: `translateY(${(1 - ehr) * 30}px)`,
        }}
      >
        in Mega-Net EHR Cloud
      </p>
    </Stage>
  );
};

// ---------- Scene 3: one click, three checks ----------
const Cursor: React.FC = () => (
  <svg width="96" height="96" viewBox="0 0 24 24">
    <path d="M5 3 L5 19 L9.4 15 L12.2 21 L14.8 19.8 L12 14 L18 14 Z" fill={DARK} stroke={WHITE} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const RunButton: React.FC = () => {
  const frame = useCurrentFrame();
  const from = React.useContext(SceneStart);
  const {fps} = useVideoConfig();
  const enter = useWord(W.one, {damping: 14, stiffness: 120});
  const clickF = f(WORDS[W.click].s) - from;
  const press = interpolate(frame, [clickF - 4, clickF, clickF + 6], [1, 0.93, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow = interpolate(frame, [clickF - 2, clickF + 4, clickF + 40], [0, 1, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ripple = interpolate(frame, [clickF, clickF + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursorP = Math.min(1, spring({frame: frame - (clickF - 22), fps, config: {damping: 18, stiffness: 90}}));
  return (
    <div style={{position: 'relative', width: 700, height: 170, opacity: enter, transform: `scale(${enter})`}}>
      {ripple > 0 && ripple < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 300 + ripple * 400,
            height: 150 + ripple * 70,
            marginLeft: -(300 + ripple * 400) / 2,
            marginTop: -(150 + ripple * 70) / 2,
            borderRadius: 120,
            border: `10px solid ${ORANGE}`,
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 85,
          backgroundImage: `linear-gradient(90deg, ${BLUE}, ${PURPLE})`,
          boxShadow: `0 14px 0 #3A2A9E, 0 0 ${16 + 34 * glow}px ${6 * glow}px rgba(109,63,214,${0.25 + 0.6 * glow})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          transform: `scale(${press}) translateY(${press < 1 ? 8 : 0}px)`,
        }}
      >
        <svg width="70" height="70" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke={WHITE} strokeWidth="8" />
          <path d="M40 30 L72 50 L40 70 Z" fill={WHITE} />
        </svg>
        <span style={{fontSize: 74, fontWeight: 800, color: WHITE, letterSpacing: -1}}>Run Analysis</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: interpolate(cursorP, [0, 1], [520, 600]),
          top: interpolate(cursorP, [0, 1], [260, 128]),
          opacity: interpolate(cursorP, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        <Cursor />
      </div>
    </div>
  );
};

const RecordCard: React.FC<{label: string; accent: string; fill: string; word: number; kind: 'clip' | 'bill'}> = ({
  label,
  accent,
  fill,
  word,
  kind,
}) => {
  const p = useWord(word, {damping: 13, stiffness: 120});
  return (
    <div
      style={{
        width: 370,
        height: 240,
        borderRadius: 36,
        backgroundColor: fill,
        border: `8px solid ${accent}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        boxShadow: `0 10px 26px ${accent}33`,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <svg width="92" height="92" viewBox="0 0 100 100">
        {kind === 'clip' ? (
          <>
            <rect x="22" y="14" width="56" height="74" rx="9" fill={WHITE} stroke={accent} strokeWidth="7" />
            <rect x="36" y="8" width="28" height="14" rx="6" fill={accent} />
            <path d="M34 44 H66 M34 58 H66 M34 72 H54" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M24 10 H76 V90 L66 82 L58 90 L50 82 L42 90 L34 82 L24 90 Z" fill={WHITE} stroke={accent} strokeWidth="7" strokeLinejoin="round" />
            <path d="M36 32 H64 M36 46 H64 M36 60 H52" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span style={{fontSize: 36, fontWeight: 800, color: DARK, whiteSpace: 'nowrap'}}>{label}</span>
    </div>
  );
};

/** Glowing dots flowing between the two cards: blue-purple left to right, orange right to left. */
const FlowDots: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useWord(W.against, {damping: 12, stiffness: 140});
  const GAP = 100;
  const dot = (i: number, dir: 1 | -1, color: string, y: number) => {
    const prog = (((frame / 42 + i / 3) % 1) + 1) % 1;
    const x = dir === 1 ? prog * GAP : (1 - prog) * GAP;
    const a = Math.sin(prog * Math.PI);
    return (
      <div
        key={`${dir}${i}`}
        style={{
          position: 'absolute',
          left: x - 9,
          top: 120 + y - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: color,
          opacity: a * p,
          boxShadow: `0 0 14px 5px ${color}`,
        }}
      />
    );
  };
  return (
    <div style={{position: 'relative', width: GAP, height: 240}}>
      {[0, 1, 2].map((i) => dot(i, 1, '#4E7BFF', -20))}
      {[0, 1, 2].map((i) => dot(i, -1, ORANGE, 20))}
    </div>
  );
};

const CHIP_ICON: Record<string, React.ReactNode> = {
  unbilled: <path d="M50 22 V56 M50 72 V76" stroke={WHITE} strokeWidth="13" strokeLinecap="round" />,
  duplicate: (
    <>
      <rect x="22" y="30" width="42" height="42" rx="9" fill="none" stroke={WHITE} strokeWidth="8" />
      <rect x="40" y="46" width="42" height="42" rx="9" fill={PURPLE} stroke={WHITE} strokeWidth="8" />
    </>
  ),
  rejected: <path d="M28 28 L72 72 M72 28 L28 72" stroke={WHITE} strokeWidth="12" strokeLinecap="round" />,
};

const Chip: React.FC<{label: string; word: number; color: string; tint: string; icon: keyof typeof CHIP_ICON}> = ({
  label,
  word,
  color,
  tint,
  icon,
}) => {
  const p = useWord(word, {damping: 12, stiffness: 150});
  return (
    <div
      style={{
        width: 840,
        height: 104,
        borderRadius: 52,
        backgroundColor: tint,
        border: `6px solid ${color}`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '0 30px',
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
        boxShadow: `0 8px 20px ${color}30`,
      }}
    >
      <svg width="64" height="64" viewBox="0 0 100 100" style={{flexShrink: 0}}>
        <circle cx="50" cy="50" r="50" fill={color} />
        {CHIP_ICON[icon]}
      </svg>
      <span style={{fontSize: 54, fontWeight: 800, color: DARK, whiteSpace: 'nowrap'}}>{label}</span>
    </div>
  );
};

const Scene3: React.FC = () => (
  <Stage stops={BG3} glows={GLOWS3}>
    <RunButton />
    <div style={{display: 'flex', alignItems: 'center', gap: 0, marginTop: 56}}>
      <RecordCard label="Clinical records" accent={BLUE} fill="#D6E6FF" word={W.clinical} kind="clip" />
      <FlowDots />
      <RecordCard label="Bills" accent={ORANGE} fill="#FFE6C7" word={W.bills} kind="bill" />
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 56}}>
      <Chip label="Unbilled services" word={W.unbilled} color={ORANGE} tint="#FFEBD2" icon="unbilled" />
      <Chip label="Duplicate transactions" word={W.duplicates} color={PURPLE} tint="#EADFFF" icon="duplicate" />
      <Chip label="Rejected claims" word={W.rejected} color={RED} tint="#FFDDDD" icon="rejected" />
    </div>
  </Stage>
);

// ---------- Scene 4: ranked, explained, your team decides ----------
const LADDER: Array<{label: string; bg: string; fg: string; w: number}> = [
  {label: 'Critical', bg: RED, fg: WHITE, w: 840},
  {label: 'High', bg: ORANGE, fg: DARK, w: 720},
  {label: 'Medium', bg: YELLOW, fg: DARK, w: 600},
  {label: 'Informational', bg: BLUE, fg: WHITE, w: 480},
];

const Scene4: React.FC = () => {
  const each = useWord(W.each, {damping: 15});
  const frame = useCurrentFrame();
  const from = React.useContext(SceneStart);
  const {fps} = useVideoConfig();
  const rankF = f(WORDS[W.ranked].s) - from - 3;
  const expl = useWord(W.explained, {damping: 12, stiffness: 130});
  const team = useWord(W.your, {damping: 12, stiffness: 130});
  return (
    <Stage stops={BG4} glows={GLOWS4}>
      <h1 style={{...big(96), opacity: each, transform: `translateY(${(1 - each) * 40}px)`}}>Each finding</h1>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 36}}>
        {LADDER.map((r, i) => {
          const p = Math.min(1, spring({frame: frame - rankF - i * 5, fps, config: {damping: 14, stiffness: 140}}));
          return (
            <div
              key={r.label}
              style={{
                width: r.w,
                height: 88,
                borderRadius: 44,
                backgroundColor: r.bg,
                color: r.fg,
                fontSize: 50,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: p,
                transform: `scaleX(${interpolate(p, [0, 1], [0.5, 1])})`,
                boxShadow: `0 8px 20px ${r.bg}55`,
              }}
            >
              {r.label}
            </div>
          );
        })}
      </div>
      <h1 style={{...big(130, BLUE), marginTop: 60, opacity: expl, transform: `scale(${interpolate(expl, [0, 1], [0.7, 1])})`}}>
        Explained.
      </h1>
      <h1 style={{...big(88), marginTop: 20, opacity: team, transform: `translateY(${(1 - team) * 40}px)`}}>
        Your team <span style={{color: ORANGE_TXT}}>decides.</span>
      </h1>
    </Stage>
  );
};

// ---------- Scene 5: call to action ----------
const Scene5: React.FC = () => {
  const a = useWord(W.book, {damping: 14});
  const b = useWord(W.message, {damping: 18});
  const c = useWord(W.whatsapp, {damping: 18});
  const rise = (p: number) => `translateY(${(1 - p) * 40}px)`;
  const shadow = '0 4px 18px rgba(20,10,90,0.40)';
  return (
    <Stage stops={BG5} glows={GLOWS5}>
      <h1
        style={{
          ...big(150, WHITE),
          whiteSpace: 'pre-line',
          textShadow: shadow,
          opacity: a,
          transform: `scale(${interpolate(a, [0, 1], [0.8, 1])})`,
        }}
      >
        {'Book a\nfree demo'}
      </h1>
      <p style={{fontSize: 52, fontWeight: 700, color: WHITE, margin: '70px 0 0', opacity: b, transform: rise(b)}}>
        WhatsApp: +2347035682478
      </p>
      <p style={{fontSize: 52, fontWeight: 700, color: WHITE, margin: '24px 0 0', opacity: c, transform: rise(c)}}>
        meganetsoftware.com.ng
      </p>
      <div style={{marginTop: 70, opacity: c, transform: rise(c)}}>
        <LogoCard width={620} />
      </div>
    </Stage>
  );
};

// ---------- Captions: word for word, active word highlighted ----------
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CHUNKS.findIndex(([a, b], i) => {
    const start = WORDS[a].s - 0.08;
    const next = CHUNKS[i + 1] ? WORDS[CHUNKS[i + 1][0]].s - 0.08 : Infinity;
    return t >= start && t < Math.min(next, WORDS[b].e + 0.35);
  });
  if (idx < 0) return null;
  const [a, b] = CHUNKS[idx];
  return (
    <Layer kind="cap">
    <div
      style={{
        position: 'absolute',
        left: SAFE_L,
        right: SAFE_R,
        bottom: CAP_B,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          maxWidth: 840,
          padding: '22px 36px',
          borderRadius: 40,
          backgroundColor: 'rgba(38,50,56,0.92)',
          fontSize: 54,
          lineHeight: 1.22,
          fontWeight: 800,
          textAlign: 'center',
        }}
      >
        {WORDS.slice(a, b + 1).map((w, i) => {
          const spoken = t >= w.s - 0.02;
          const active = spoken && t < w.e + 0.04;
          return (
            <span key={a + i} style={{color: active ? ORANGE : WHITE, opacity: spoken ? 1 : 0.6}}>
              {w.w}{' '}
            </span>
          );
        })}
      </div>
    </div>
    </Layer>
  );
};

export const MegaNetSentinelAd: React.FC<{debug?: string}> = ({debug = ''}) => {
  const seq = (key: keyof typeof SCENES, next: keyof typeof SCENES, node: React.ReactNode) => (
    <Sequence from={f(SCENES[key])} durationInFrames={f(SCENES[next]) - f(SCENES[key])}>
      <SceneStart.Provider value={f(SCENES[key])}>{node}</SceneStart.Provider>
    </Sequence>
  );
  return (
    <DebugContext.Provider value={debug}>
    <AbsoluteFill style={{backgroundColor: WHITE}}>
      <Audio src={staticFile('voiceover-sentinel.mp3')} />
      {seq('s1', 's2', <Scene1 />)}
      {seq('s2', 's3', <Scene2 />)}
      {seq('s3', 's4', <Scene3 />)}
      {seq('s4', 's5', <Scene4 />)}
      {seq('s5', 'end', <Scene5 />)}
      <Captions />
      <Violation />
    </AbsoluteFill>
    </DebugContext.Provider>
  );
};
