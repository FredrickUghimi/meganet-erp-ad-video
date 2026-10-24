/*
 * ===== AD COPY (edit the strings in COPY below) =====
 * Scene 1 (0-90f):    "Who owes you money?"
 * Scene 2 (90-180f):  "How much cash do you have?"
 * Scene 3 (180-270f): "Are you making profit" + pulsing orange "?"
 * Scene 4 (270-360f): "Still guessing?"
 * Scene 5 (360-510f): "Mega-Net ERP Cloud"
 *                     "Simple business management & accounting for small & medium businesses"
 * Scene 6 (510-600f): "Book a free demo"
 *                     "WhatsApp: +2347035682478"
 *                     "meganetsoftware.com.ng"
 *                     "Mega-Net Software" (text beside logo mark at bottom)
 * Logo: public/logo-mark.png (transparent mark, shown <=280px tall)
 * Safe margins: 120px left/right, 250px top/bottom.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  getStaticFiles,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type AdCopy = {
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  s5Title: string;
  s5Sub: string;
  s6Title: string;
  s6Whatsapp: string;
  s6Web: string;
  s6Brand: string;
};

const COPY: AdCopy = {
  s1: 'Who owes you money?',
  s2: 'How much cash do you have?',
  s3: 'Are you making profit',
  s4: 'Still guessing?',
  s5Title: 'Mega-Net ERP Cloud',
  s5Sub: 'Simple business management & accounting for small & medium businesses',
  s6Title: 'Book a\nfree demo', // \n = forced line break
  s6Whatsapp: 'WhatsApp: +2347035682478',
  s6Web: 'meganetsoftware.com.ng',
  s6Brand: 'Mega-Net Software',
};

// Copy for the Mega-Net EHR Cloud ad (MegaNetEhrAd composition). Same scenes, layout and timing.
export const EHR_COPY: AdCopy = {
  s1: 'How long do patients wait?',
  s2: 'Are lab results reaching the doctor?',
  s3: 'Is every bill captured',
  s4: 'Still using paper files?',
  s5Title: 'Mega-Net EHR Cloud',
  s5Sub: 'Patient records, lab, prescriptions and billing in one system for hospitals and clinics',
  s6Title: 'Book a\nfree demo', // \n = forced line break
  s6Whatsapp: 'WhatsApp: +2347035682478',
  s6Web: 'meganetsoftware.com.ng',
  s6Brand: 'Mega-Net Software',
};

// Scenes read their copy from context so one set of components serves both ads (default = ERP copy).
const CopyContext = React.createContext<AdCopy>(COPY);

// Voiceover is optional: only mounted when the file exists in public/, so renders never fail without it.
const VOICEOVER_FILE = 'voiceover.mp3';

const BLUE = '#1A6DE0';
const ORANGE = '#F7941D';
const DARK = '#263238';
const WHITE = '#FFFFFF';

const SAFE_X = 120;
const SAFE_Y = 250;
const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const Safe: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: WHITE, fontFamily: FONT}}>
    <div
      style={{
        position: 'absolute',
        left: SAFE_X,
        right: SAFE_X,
        top: SAFE_Y,
        bottom: SAFE_Y,
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

const bigText: React.CSSProperties = {
  fontSize: 130,
  lineHeight: 1.1,
  fontWeight: 900,
  color: DARK,
  margin: 0,
  letterSpacing: -2,
};

// Scene 1: slam-in
const Scene1: React.FC = () => {
  const copy = React.useContext(CopyContext);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 9, stiffness: 160, mass: 1.2}});
  const scale = interpolate(s, [0, 1], [2.6, 1]);
  const opacity = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Safe>
      <h1 style={{...bigText, transform: `scale(${scale})`, opacity}}>{copy.s1}</h1>
    </Safe>
  );
};

// Scene 2: slide in from right, slide out to left
const Scene2: React.FC = () => {
  const copy = React.useContext(CopyContext);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 16, stiffness: 120}});
  const outP = interpolate(frame, [75, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(inP, [0, 1], [1080, 0]) - outP * 1080;
  return (
    <Safe>
      <h1 style={{...bigText, transform: `translateX(${x}px)`}}>{copy.s2}</h1>
    </Safe>
  );
};

// Scene 3: pulsing orange "?"
const Scene3: React.FC = () => {
  const copy = React.useContext(CopyContext);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 14}});
  const pulse = 1 + 0.18 * Math.sin((frame / fps) * Math.PI * 2 * 1.5);
  return (
    <Safe>
      <h1 style={{...bigText, opacity: inP, transform: `translateY(${(1 - inP) * 60}px)`}}>
        {copy.s3}
        <span
          style={{
            display: 'inline-block',
            color: ORANGE,
            transform: `scale(${pulse})`,
            transformOrigin: 'center bottom',
          }}
        >
          ?
        </span>
      </h1>
    </Safe>
  );
};

// Scene 4: one quick shake, then still
const Scene4: React.FC = () => {
  const copy = React.useContext(CopyContext);
  const frame = useCurrentFrame();
  const shakeStart = 15;
  const shakeLen = 14;
  const t = frame - shakeStart;
  const x =
    t >= 0 && t < shakeLen
      ? Math.sin((t / shakeLen) * Math.PI * 6) * 28 * (1 - t / shakeLen)
      : 0;
  const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Safe>
      <h1 style={{...bigText, opacity, transform: `translateX(${x}px)`}}>{copy.s4}</h1>
    </Safe>
  );
};

// Scene 5: brand reveal
const Scene5: React.FC = () => {
  const copy = React.useContext(CopyContext);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12, stiffness: 100}});
  const subP = spring({frame: frame - 40, fps, config: {damping: 20}});
  return (
    <Safe>
      <Img
        src={staticFile('logo-mark.png')}
        style={{
          height: 240,
          width: 'auto',
          transform: `scale(${s})`,
          marginBottom: 50,
        }}
      />
      <h1
        style={{
          ...bigText,
          fontSize: 120,
          color: BLUE,
          transform: `scale(${s})`,
          opacity: s,
        }}
      >
        {copy.s5Title}
      </h1>
      <p
        style={{
          fontSize: 54,
          lineHeight: 1.3,
          fontWeight: 500,
          color: DARK,
          margin: '40px 0 0',
          opacity: subP,
          transform: `translateY(${(1 - subP) * 50}px)`,
        }}
      >
        {copy.s5Sub}
      </p>
    </Safe>
  );
};

// Scene 6: CTA on blue
const Scene6: React.FC = () => {
  const copy = React.useContext(CopyContext);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 14}});
  const b = spring({frame: frame - 12, fps, config: {damping: 18}});
  const c = spring({frame: frame - 22, fps, config: {damping: 18}});
  const rise = (p: number) => `translateY(${(1 - p) * 40}px)`;
  return (
    <AbsoluteFill style={{backgroundColor: BLUE, fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE_X,
          right: SAFE_X,
          top: SAFE_Y,
          bottom: SAFE_Y,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              ...bigText,
              whiteSpace: 'pre-line',
              color: WHITE,
              opacity: a,
              transform: `scale(${interpolate(a, [0, 1], [0.8, 1])})`,
            }}
          >
            {copy.s6Title}
          </h1>
          <p
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: WHITE,
              margin: '70px 0 0',
              opacity: b,
              transform: rise(b),
            }}
          >
            {copy.s6Whatsapp}
          </p>
          <p
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: WHITE,
              margin: '24px 0 0',
              opacity: c,
              transform: rise(c),
            }}
          >
            {copy.s6Web}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: c,
            transform: 'translateY(-60px)',
          }}
        >
          <div
            style={{
              width: 280,
              height: 260,
              borderRadius: 48,
              backgroundColor: WHITE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Img src={staticFile('logo-mark.png')} style={{height: 200, width: 'auto'}} />
          </div>
          <p style={{fontSize: 48, fontWeight: 700, color: WHITE, margin: '24px 0 0'}}>
            {copy.s6Brand}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AdTimeline: React.FC<{voiceoverFile: string}> = ({voiceoverFile}) => {
  const hasVoiceover = getStaticFiles().some((f) => f.name === voiceoverFile);
  return (
  <AbsoluteFill style={{backgroundColor: WHITE}}>
    {hasVoiceover ? <Audio src={staticFile(voiceoverFile)} /> : null}
    <Sequence from={0} durationInFrames={90}><Scene1 /></Sequence>
    <Sequence from={90} durationInFrames={90}><Scene2 /></Sequence>
    <Sequence from={180} durationInFrames={90}><Scene3 /></Sequence>
    <Sequence from={270} durationInFrames={90}><Scene4 /></Sequence>
    <Sequence from={360} durationInFrames={150}><Scene5 /></Sequence>
    <Sequence from={510} durationInFrames={90}><Scene6 /></Sequence>
  </AbsoluteFill>
  );
};

export const MegaNetAd: React.FC = () => (
  <CopyContext.Provider value={COPY}>
    <AdTimeline voiceoverFile={VOICEOVER_FILE} />
  </CopyContext.Provider>
);

export const MegaNetEhrAd: React.FC = () => (
  <CopyContext.Provider value={EHR_COPY}>
    <AdTimeline voiceoverFile="voiceover-ehr.mp3" />
  </CopyContext.Provider>
);
