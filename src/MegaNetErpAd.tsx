/*
 * ===== AD COPY: Mega-Net ERP Cloud, "Who owes you money?" ad (composition MegaNetAd, v2 colour makeover) =====
 * Copy, voiceover (public/voiceover.mp3) and scene timings are unchanged from v1:
 * Scene 1 (0-90f):    "Who owes you money?"           icons: coins + notebook
 * Scene 2 (90-180f):  "How much cash do you have?"    icon: wallet
 * Scene 3 (180-270f): "Are you making profit" + pulsing orange "?"   icon: chart
 * Scene 4 (270-360f): "Still guessing?"               icon: dice
 * Scene 5 (360-510f): "Mega-Net ERP Cloud" / "Simple business management & accounting for small & medium businesses"
 * Scene 6 (510-600f): "Book a / free demo" / "WhatsApp: +2347035682478" / "meganetsoftware.com.ng" / "Mega-Net Software"
 * There are no burned-in captions in this ad (voiceover only), as in v1.
 * Safe area (Shorts/Reels/TikTok): everything, including animations, stays inside x 80-920, y 200-1440.
 * Each scene has its own gradient; helpers (gradients, icons, debug layers) live in src/fx.tsx.
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
import {
  BLUE,
  DARK,
  DebugContext,
  Glow,
  GradientBg,
  Icon,
  IconName,
  Layer,
  ORANGE,
  PURPLE,
  Violation,
  WHITE,
} from './fx';

const COPY = {
  s1: 'Who owes you money?',
  s2: 'How much cash do you have?',
  s3: 'Are you making profit',
  s4: 'Still guessing?',
  s5Title: 'Mega-Net ERP Cloud',
  s5Sub: 'Simple business management & accounting for small & medium businesses',
  s6Title: 'Book a\nfree demo',
  s6Whatsapp: 'WhatsApp: +2347035682478',
  s6Web: 'meganetsoftware.com.ng',
  s6Brand: 'Mega-Net Software',
};

const SAFE_L = 80;
const SAFE_R = 160; // right edge at x = 920
const SAFE_T = 200;
const SAFE_B = 480; // bottom edge at y = 1440
const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const Stage: React.FC<{stops: string[]; glows?: Glow[]; angle?: number; children: React.ReactNode}> = ({
  stops,
  glows,
  angle,
  children,
}) => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <GradientBg stops={stops} glows={glows} angle={angle} />
    <Layer kind="content">
      <div
        style={{
          position: 'absolute',
          left: SAFE_L,
          right: SAFE_R,
          top: SAFE_T,
          bottom: SAFE_B,
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

const bigText = (color: string): React.CSSProperties => ({
  fontSize: 130,
  lineHeight: 1.1,
  fontWeight: 900,
  color,
  margin: 0,
  letterSpacing: -2,
  textShadow: '0 4px 18px rgba(10,10,70,0.45)',
});

/** Icon that bobs gently in place (small amplitude, stays inside its slot). */
const Bob: React.FC<{name: IconName; size: number; phase?: number; accent?: string}> = ({name, size, phase = 0, accent}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <div
      style={{
        transform: `translateY(${Math.sin(t * 2.2 + phase) * 8}px) rotate(${Math.sin(t * 1.6 + phase) * 5}deg)`,
        filter: 'drop-shadow(0 8px 14px rgba(10,15,80,0.4))',
      }}
    >
      <Icon name={name} size={size} accent={accent} />
    </div>
  );
};

/** Fade + rise entrance; no horizontal travel so the text never leaves the safe area. */
const useEnter = (delay = 0, damping = 18) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = Math.min(1, spring({frame: frame - delay, fps, config: {damping, stiffness: 120}}));
  return p;
};

const Pulse: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const p = 1 + 0.18 * Math.sin((frame / 30) * Math.PI * 2 * 1.5);
  return (
    <span
      style={{
        display: 'inline-block',
        color: ORANGE,
        transform: `scale(${p})`,
        transformOrigin: 'center bottom',
        WebkitTextStroke: `8px ${WHITE}`,
        paintOrder: 'stroke fill',
        filter: 'drop-shadow(0 0 18px rgba(247,148,29,0.8))',
        textShadow: 'none',
      }}
    >
      {children}
    </span>
  );
};

const Question: React.FC<{
  stops: string[];
  glows: Glow[];
  icons: React.ReactNode;
  children: React.ReactNode;
  shake?: number;
}> = ({stops, glows, icons, children, shake = 0}) => {
  const p = useEnter(0, 20);
  return (
    <Stage stops={stops} glows={glows}>
      <div style={{display: 'flex', gap: 40, alignItems: 'center', opacity: p, marginBottom: 50}}>{icons}</div>
      <h1
        style={{
          ...bigText(WHITE),
          opacity: interpolate(p, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `translate(${shake}px, ${(1 - p) * 50}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
        }}
      >
        {children}
      </h1>
    </Stage>
  );
};

const Scene1: React.FC = () => (
  <Question
    stops={['#0B3A9E', '#4A2AB8']}
    glows={[
      {x: 150, y: 400, r: 420, color: 'rgba(0,214,200,0.22)'},
      {x: 950, y: 1300, r: 380, color: 'rgba(247,148,29,0.20)'},
    ]}
    icons={
      <>
        <Bob name="coins" size={190} />
        <Bob name="notebook" size={170} phase={2} />
      </>
    }
  >
    {COPY.s1}
  </Question>
);

const Scene2: React.FC = () => (
  <Question
    stops={['#06507F', '#1A3FA8']}
    glows={[
      {x: 900, y: 450, r: 420, color: 'rgba(0,214,200,0.30)'},
      {x: 100, y: 1250, r: 360, color: 'rgba(247,148,29,0.18)'},
    ]}
    icons={<Bob name="wallet" size={200} />}
  >
    {COPY.s2}
  </Question>
);

const Scene3: React.FC = () => (
  <Question
    stops={['#3A1E9E', '#7A2FB8']}
    glows={[
      {x: 200, y: 450, r: 420, color: 'rgba(120,160,255,0.28)'},
      {x: 900, y: 1250, r: 380, color: 'rgba(247,148,29,0.22)'},
    ]}
    icons={<Bob name="chart" size={200} />}
  >
    {COPY.s3}
    <Pulse>?</Pulse>
  </Question>
);

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - 15;
  const len = 14;
  const x = t >= 0 && t < len ? Math.sin((t / len) * Math.PI * 6) * 20 * (1 - t / len) : 0;
  return (
    <Question
      shake={x}
      stops={['#1B2A6B', '#5B2FC9']}
      glows={[
        {x: 540, y: 450, r: 460, color: 'rgba(247,148,29,0.26)'},
        {x: 120, y: 1250, r: 360, color: 'rgba(0,214,200,0.20)'},
      ]}
      icons={<Bob name="die" size={190} />}
    >
      {COPY.s4}
    </Question>
  );
};

// Brand reveal on a light gradient: dark/blue text, orange accents.
const Scene5: React.FC = () => {
  const s = useEnter(0, 14);
  const subP = useEnter(40, 20);
  return (
    <Stage
      stops={['#FFFFFF', '#DCEBFF', '#EADFFF']}
      glows={[
        {x: 900, y: 350, r: 380, color: 'rgba(247,148,29,0.20)'},
        {x: 100, y: 1200, r: 380, color: 'rgba(26,109,224,0.16)'},
      ]}
    >
      <Img
        src={staticFile('logo-mark.png')}
        style={{height: 240, width: 'auto', transform: `scale(${s})`, marginBottom: 40, filter: 'drop-shadow(0 10px 20px rgba(26,109,224,0.3))'}}
      />
      <h1 style={{...bigText(BLUE), fontSize: 120, textShadow: 'none', transform: `scale(${s})`, opacity: s}}>{COPY.s5Title}</h1>
      <div style={{width: interpolate(s, [0, 1], [0, 360]), height: 14, borderRadius: 7, backgroundColor: ORANGE, marginTop: 24, boxShadow: '0 0 20px rgba(247,148,29,0.55)'}} />
      <p
        style={{
          fontSize: 54,
          lineHeight: 1.3,
          fontWeight: 600,
          color: DARK,
          margin: '36px 0 0',
          opacity: subP,
          transform: `translateY(${(1 - subP) * 50}px)`,
        }}
      >
        {COPY.s5Sub}
      </p>
    </Stage>
  );
};

const Scene6: React.FC = () => {
  const a = useEnter(0, 14);
  const b = useEnter(12);
  const c = useEnter(22);
  const rise = (p: number) => `translateY(${(1 - p) * 40}px)`;
  return (
    <Stage
      stops={['#1458D6', '#5B2FC9', '#7A3FD8']}
      glows={[
        {x: 160, y: 1250, r: 420, color: 'rgba(0,214,200,0.24)'},
        {x: 900, y: 350, r: 340, color: 'rgba(247,148,29,0.20)'},
      ]}
    >
      <h1
        style={{
          ...bigText(WHITE),
          whiteSpace: 'pre-line',
          opacity: a,
          transform: `scale(${interpolate(a, [0, 1], [0.8, 1])})`,
        }}
      >
        {COPY.s6Title}
      </h1>
      <p style={{fontSize: 52, fontWeight: 700, color: WHITE, margin: '60px 0 0', opacity: b, transform: rise(b)}}>{COPY.s6Whatsapp}</p>
      <p style={{fontSize: 52, fontWeight: 700, color: WHITE, margin: '24px 0 0', opacity: c, transform: rise(c)}}>{COPY.s6Web}</p>
      <div style={{marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: c, transform: rise(c)}}>
        <div
          style={{
            width: 280,
            height: 260,
            borderRadius: 48,
            backgroundColor: WHITE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 16px 36px rgba(10,15,70,0.30), 0 0 40px rgba(255,255,255,0.45)',
          }}
        >
          <Img src={staticFile('logo-mark.png')} style={{height: 200, width: 'auto'}} />
        </div>
        <p style={{fontSize: 48, fontWeight: 700, color: WHITE, margin: '24px 0 0'}}>{COPY.s6Brand}</p>
      </div>
    </Stage>
  );
};

export const MegaNetAd: React.FC<{debug?: string}> = ({debug = ''}) => (
  <DebugContext.Provider value={debug}>
    <AbsoluteFill style={{backgroundColor: WHITE}}>
      <Audio src={staticFile('voiceover.mp3')} />
      <Sequence from={0} durationInFrames={90}><Scene1 /></Sequence>
      <Sequence from={90} durationInFrames={90}><Scene2 /></Sequence>
      <Sequence from={180} durationInFrames={90}><Scene3 /></Sequence>
      <Sequence from={270} durationInFrames={90}><Scene4 /></Sequence>
      <Sequence from={360} durationInFrames={150}><Scene5 /></Sequence>
      <Sequence from={510} durationInFrames={90}><Scene6 /></Sequence>
      <Violation />
    </AbsoluteFill>
  </DebugContext.Provider>
);
