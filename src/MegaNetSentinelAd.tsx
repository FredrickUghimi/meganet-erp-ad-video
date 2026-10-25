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
 * Captions: bottom edge at y=1440, max 2 lines, centered in the 840px safe width.
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

const BLUE = '#1A6DE0';
const ORANGE = '#F7941D';
const DARK = '#263238';
const WHITE = '#FFFFFF';
const GREY = '#CFD8DC';

const SAFE_L = 80;
const SAFE_R = 160;
const SAFE_T = 200;
const SAFE_B = 480; // captions end at y = 1920 - 480 = 1440
const CAPTION_ZONE = 200; // room kept free above the captions (2 lines + gap)
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

const Stage: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{backgroundColor: bg, fontFamily: FONT}}>
    <div
      style={{
        position: 'absolute',
        left: SAFE_L,
        right: SAFE_R,
        top: SAFE_T,
        bottom: SAFE_B + CAPTION_ZONE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
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
      boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
    }}
  >
    <Img src={staticFile('logo-trim.jpg')} style={{width: '100%', height: 'auto'}} />
  </div>
);

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
  return (
    <Stage bg={WHITE}>
      <h1 style={{...big(92), ...slam(a)}}>Tests done.</h1>
      <h1 style={{...big(92), marginTop: 20, whiteSpace: 'nowrap', ...slam(b)}}>Drugs dispensed.</h1>
      <h1 style={{...big(200, BLUE), marginTop: 90, ...slam(c)}}>
        Billed<Pulse>?</Pulse>
      </h1>
      <h1 style={{...big(150, ORANGE), marginTop: 20, ...slam(d)}}>
        Or lost<Pulse color={DARK}>?</Pulse>
      </h1>
    </Stage>
  );
};

// ---------- Scene 2: brand ----------
const ShieldBadge: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill={ORANGE} />
    <path d="M50 17 L77 27 V50 C77 66 65 76 50 82 C35 76 23 66 23 50 V27 Z" fill={WHITE} />
    <path d="M37 50 L46 59 L64 40" fill="none" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Scene2: React.FC = () => {
  const card = useWord(W.meet, {damping: 13, stiffness: 110});
  const badge = useWord(W.financial, {damping: 10, stiffness: 120});
  const title = useWord(W.financial, {damping: 16, stiffness: 110});
  const ehr = useWord(W.mega, {damping: 16, stiffness: 110});
  return (
    <Stage bg={BLUE}>
      <div style={{opacity: card, transform: `translateY(${(1 - card) * 50}px)`}}>
        <LogoCard width={760} />
      </div>
      <div style={{marginTop: 70, transform: `scale(${badge})`, opacity: badge}}>
        <ShieldBadge size={170} />
      </div>
      <h1
        style={{
          ...big(150, WHITE),
          marginTop: 30,
          opacity: title,
          transform: `translateY(${(1 - title) * 50}px)`,
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
          marginTop: 26,
        }}
      />
      <p
        style={{
          fontSize: 62,
          fontWeight: 700,
          color: WHITE,
          margin: '40px 0 0',
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
  const ripple = interpolate(frame, [clickF, clickF + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursorP = Math.min(1, spring({frame: frame - (clickF - 22), fps, config: {damping: 18, stiffness: 90}}));
  return (
    <div style={{position: 'relative', width: 760, height: 170, opacity: enter, transform: `scale(${enter})`}}>
      {ripple > 0 && ripple < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 300 + ripple * 470,
            height: 150 + ripple * 80,
            marginLeft: -(300 + ripple * 470) / 2,
            marginTop: -(150 + ripple * 80) / 2,
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
          backgroundColor: BLUE,
          boxShadow: '0 16px 0 #1556B0',
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
          left: interpolate(cursorP, [0, 1], [560, 640]),
          top: interpolate(cursorP, [0, 1], [260, 128]),
          opacity: interpolate(cursorP, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        <Cursor />
      </div>
    </div>
  );
};

const RecordCard: React.FC<{label: string; accent: string; word: number; kind: 'clip' | 'bill'}> = ({
  label,
  accent,
  word,
  kind,
}) => {
  const p = useWord(word, {damping: 13, stiffness: 120});
  return (
    <div
      style={{
        width: 380,
        height: 250,
        borderRadius: 36,
        backgroundColor: WHITE,
        border: `8px solid ${accent}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
      }}
    >
      <svg width="96" height="96" viewBox="0 0 100 100">
        {kind === 'clip' ? (
          <>
            <rect x="22" y="14" width="56" height="74" rx="9" fill="none" stroke={accent} strokeWidth="7" />
            <rect x="36" y="8" width="28" height="14" rx="6" fill={accent} />
            <path d="M34 44 H66 M34 58 H66 M34 72 H54" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M24 10 H76 V90 L66 82 L58 90 L50 82 L42 90 L34 82 L24 90 Z" fill="none" stroke={accent} strokeWidth="7" strokeLinejoin="round" />
            <path d="M36 32 H64 M36 46 H64 M36 60 H52" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span style={{fontSize: 38, fontWeight: 800, color: DARK, whiteSpace: 'nowrap'}}>{label}</span>
    </div>
  );
};

const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useWord(W.against, {damping: 12, stiffness: 140});
  const wob = Math.sin(frame / 4) * 8;
  return (
    <div style={{width: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `scale(${p})`}}>
      <svg width="80" height="80" viewBox="0 0 100 100" style={{transform: `translateX(${wob}px)`}}>
        <path d="M14 36 H78 M62 18 L82 36 L62 54" fill="none" stroke={ORANGE} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M86 68 H22 M38 50 L18 68 L38 86" fill="none" stroke={BLUE} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const Chip: React.FC<{label: string; word: number}> = ({label, word}) => {
  const p = useWord(word, {damping: 12, stiffness: 150});
  return (
    <div
      style={{
        width: 840,
        height: 112,
        borderRadius: 56,
        backgroundColor: WHITE,
        border: `6px solid ${BLUE}`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '0 36px',
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: ORANGE,
          color: WHITE,
          fontSize: 44,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        !
      </div>
      <span style={{fontSize: 54, fontWeight: 800, color: DARK, whiteSpace: 'nowrap'}}>{label}</span>
    </div>
  );
};

const Scene3: React.FC = () => (
  <Stage bg={WHITE}>
    <RunButton />
    <div style={{display: 'flex', alignItems: 'center', gap: 0, marginTop: 70}}>
      <RecordCard label="Clinical records" accent={BLUE} word={W.clinical} kind="clip" />
      <Compare />
      <RecordCard label="Bills" accent={ORANGE} word={W.bills} kind="bill" />
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 70}}>
      <Chip label="Unbilled services" word={W.unbilled} />
      <Chip label="Duplicate transactions" word={W.duplicates} />
      <Chip label="Rejected claims" word={W.rejected} />
    </div>
  </Stage>
);

// ---------- Scene 4: ranked, explained, your team decides ----------
const LADDER: Array<{label: string; bg: string; fg: string; w: number}> = [
  {label: 'Critical', bg: DARK, fg: WHITE, w: 840},
  {label: 'High', bg: ORANGE, fg: DARK, w: 720},
  {label: 'Medium', bg: BLUE, fg: WHITE, w: 600},
  {label: 'Informational', bg: GREY, fg: DARK, w: 480},
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
    <Stage bg={WHITE}>
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
        Your team <span style={{color: ORANGE}}>decides.</span>
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
  return (
    <Stage bg={BLUE}>
      <h1
        style={{
          ...big(150, WHITE),
          whiteSpace: 'pre-line',
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
      <div style={{marginTop: 80, opacity: c, transform: rise(c)}}>
        <LogoCard width={640} />
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
    <div
      style={{
        position: 'absolute',
        left: SAFE_L,
        right: SAFE_R,
        bottom: SAFE_B,
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
  );
};

export const MegaNetSentinelAd: React.FC = () => {
  const seq = (key: keyof typeof SCENES, next: keyof typeof SCENES, node: React.ReactNode) => (
    <Sequence from={f(SCENES[key])} durationInFrames={f(SCENES[next]) - f(SCENES[key])}>
      <SceneStart.Provider value={f(SCENES[key])}>{node}</SceneStart.Provider>
    </Sequence>
  );
  return (
    <AbsoluteFill style={{backgroundColor: WHITE}}>
      <Audio src={staticFile('voiceover-sentinel.mp3')} />
      {seq('s1', 's2', <Scene1 />)}
      {seq('s2', 's3', <Scene2 />)}
      {seq('s3', 's4', <Scene3 />)}
      {seq('s4', 's5', <Scene4 />)}
      {seq('s5', 'end', <Scene5 />)}
      <Captions />
    </AbsoluteFill>
  );
};
