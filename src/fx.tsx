/*
 * Shared colour-makeover helpers: gradient backgrounds, drawn icons, floating icons, and debug layers.
 * Debug modes (input prop `debug`) exist only for the verification scripts in scripts/:
 *   'bg'   -> gradient backgrounds only (reference for the safe-area diff)
 *   'caps' -> backgrounds + captions only
 *   'violate-left|right|top|bottom' -> normal frame plus a small box just outside the safe area (negative control)
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

export const BLUE = '#1A6DE0';
export const PURPLE = '#6D3FD6';
export const ORANGE = '#F7941D';
export const ORANGE_TXT = '#BF5200'; // orange for text on light backgrounds (keeps contrast >= 3:1)
export const DARK = '#263238';
export const WHITE = '#FFFFFF';

export const DebugContext = React.createContext<string>('');

/** Kind of layer: 'bg' always renders; 'cap' renders in full and 'caps'; 'content' only in full/violate modes. */
export const Layer: React.FC<{kind: 'content' | 'cap'; children: React.ReactNode}> = ({kind, children}) => {
  const mode = React.useContext(DebugContext);
  const show = mode === 'bg' ? false : mode === 'caps' ? kind === 'cap' : true;
  return <div style={{display: show ? 'contents' : 'none'}}>{children}</div>;
};

/** Negative control: a bright box 30px outside the given edge of the safe area (x 80-920, y 200-1440). */
export const Violation: React.FC = () => {
  const mode = React.useContext(DebugContext);
  if (!mode.startsWith('violate-')) return null;
  const edge = mode.slice(8);
  const box: Record<string, React.CSSProperties> = {
    left: {left: 40, top: 900},
    right: {left: 925, top: 900},
    top: {left: 500, top: 150},
    bottom: {left: 500, top: 1450},
  };
  return <div style={{position: 'absolute', width: 40, height: 40, backgroundColor: '#fff', ...box[edge]}} />;
};

export type Glow = {x: number; y: number; r: number; color: string; drift?: number};

/** Full-bleed linear gradient plus soft radial glows that drift slowly. */
export const GradientBg: React.FC<{stops: string[]; angle?: number; glows?: Glow[]}> = ({
  stops,
  angle = 160,
  glows = [],
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${angle}deg, ${stops.join(', ')})`}}>
      {glows.map((g, i) => {
        const dx = Math.sin(t * 0.5 + i * 2) * (g.drift ?? 30);
        const dy = Math.cos(t * 0.4 + i) * (g.drift ?? 30);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: g.x + dx - g.r,
              top: g.y + dy - g.r,
              width: g.r * 2,
              height: g.r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${g.color} 0%, rgba(0,0,0,0) 68%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------- drawn icons (viewBox 100x100) ----------------
export type IconName = 'tube' | 'pill' | 'receipt' | 'coins' | 'notebook' | 'wallet' | 'chart' | 'die' | 'check';

export const Icon: React.FC<{name: IconName; size: number; accent?: string; ink?: string}> = ({
  name,
  size,
  accent = ORANGE,
  ink = WHITE,
}) => {
  const p: Record<IconName, React.ReactNode> = {
    tube: (
      <>
        <g transform="rotate(35 50 50)">
          <path d="M38 12 H62 V68 C62 82 56 90 50 90 C44 90 38 82 38 68 Z" fill={ink} fillOpacity="0.92" />
          <path d="M38 52 H62 V68 C62 82 56 90 50 90 C44 90 38 82 38 68 Z" fill={accent} />
          <rect x="32" y="8" width="36" height="9" rx="4.5" fill={ink} />
        </g>
      </>
    ),
    pill: (
      <g transform="rotate(-40 50 50)">
        <rect x="14" y="30" width="72" height="40" rx="20" fill={ink} />
        <path d="M50 30 H66 A20 20 0 0 1 66 70 H50 Z" fill={accent} />
        <rect x="22" y="36" width="22" height="6" rx="3" fill="#fff" fillOpacity="0.6" />
      </g>
    ),
    receipt: (
      <>
        <path d="M24 8 H76 V92 L66 84 L58 92 L50 84 L42 92 L34 84 L24 92 Z" fill={ink} />
        <path d="M35 28 H65 M35 43 H65 M35 58 H53" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      </>
    ),
    coins: (
      <>
        <ellipse cx="38" cy="70" rx="28" ry="12" fill={accent} />
        <rect x="10" y="52" width="56" height="18" fill={accent} />
        <ellipse cx="38" cy="52" rx="28" ry="12" fill={ink} stroke={accent} strokeWidth="4" />
        <ellipse cx="62" cy="42" rx="28" ry="12" fill={accent} />
        <rect x="34" y="24" width="56" height="18" fill={accent} />
        <ellipse cx="62" cy="24" rx="28" ry="12" fill={ink} stroke={accent} strokeWidth="4" />
        <ellipse cx="62" cy="24" rx="14" ry="5" fill="none" stroke={accent} strokeWidth="4" />
      </>
    ),
    notebook: (
      <>
        <rect x="20" y="8" width="62" height="84" rx="9" fill={ink} />
        <rect x="20" y="8" width="14" height="84" rx="6" fill={accent} />
        <path d="M44 32 H72 M44 48 H72 M44 64 H62" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      </>
    ),
    wallet: (
      <>
        <rect x="8" y="24" width="84" height="62" rx="12" fill={ink} />
        <path d="M14 24 L66 10 L72 24 Z" fill={accent} />
        <rect x="52" y="44" width="46" height="26" rx="13" fill={accent} />
        <circle cx="68" cy="57" r="6" fill={ink} />
      </>
    ),
    chart: (
      <>
        <rect x="12" y="58" width="18" height="30" rx="4" fill={ink} />
        <rect x="41" y="40" width="18" height="48" rx="4" fill={ink} />
        <rect x="70" y="20" width="18" height="68" rx="4" fill={accent} />
        <path d="M14 44 L44 24 L60 32 L88 8" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    die: (
      <g transform="rotate(-12 50 50)">
        <rect x="12" y="12" width="76" height="76" rx="16" fill={ink} />
        {[[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill={accent} />
        ))}
      </g>
    ),
    check: <path d="M22 52 L42 72 L80 28" fill="none" stroke={ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible'}}>
      {p[name]}
    </svg>
  );
};

export type Floater = {icon: IconName; x: number; y: number; size: number; phase: number; accent?: string; ink?: string};

/** Icons that drift slowly (small amplitude) around fixed spots; positions are chosen clear of text. */
export const Floaters: React.FC<{items: Floater[]; opacity?: number}> = ({items, opacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      {items.map((it, i) => {
        const dx = Math.sin(t * 0.9 + it.phase) * 9;
        const dy = Math.cos(t * 0.7 + it.phase * 1.3) * 10;
        const rot = Math.sin(t * 0.6 + it.phase) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: it.x - it.size / 2 + dx,
              top: it.y - it.size / 2 + dy,
              opacity,
              transform: `rotate(${rot}deg)`,
              filter: 'drop-shadow(0 6px 10px rgba(10,20,80,0.35))',
            }}
          >
            <Icon name={it.icon} size={it.size} accent={it.accent} ink={it.ink} />
          </div>
        );
      })}
    </>
  );
};
