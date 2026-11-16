/*
 * MegaNetCrmAd - 1080x1920 @30fps, 35s. "Introducing Sales & CRM" for Mega-Net ERP Cloud.
 * Voice: public/voiceover-crm.mp3 (en-NG-AbeoNeural, -3% rate), word timings src/crmTimings.ts (scripts/crm_voice.py).
 * Sound: public/crm-*.wav, generated in code by scripts/crm_sound.py (no licensed audio).
 * Screens: real phone-viewport screenshots of the app running against a LOCAL seeded demo tenant (public/crm/*.png:
 * menu, My Day) plus faithful React recreations (Leads, Pipeline, Reports, Quotation/Invoice, AI bubble) driven by data
 * exported from the same API (src/crmData.ts). Look: dark cinematic (brief overrides the light STYLE_GUIDE for this ad).
 * Safe area: text/UI inside y 130-1625 (120px top, 280px bottom clear).
 */
import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {LINES, VOICE_END} from './crmTimings';
import {DATA} from './crmData';
import {
  APP, AppHeader, Background, Captions, Card, CloudIcon, CYAN, FONT, FPS, GrainVignette, KWord, LEAD, Phone, PHONE_TOP, Pill, Tap, Title, VIOLET,
  clamp, ease, inout, naira, prog, wEnd, wf,
} from './crmCommon';

export const CRM_FPS = FPS;
export const CRM_DURATION = 1050; // 35.0s
const HOLD_FROM = 990; // visuals are frozen from 33.0s to the end (2s still)

// scene boundaries follow the generated audio: each scene starts 4 frames before its first word
const S: number[] = LINES.map((_, i) => (i === 0 ? 0 : wf(i, 0) - 4));
S.push(CRM_DURATION);
const len = (i: number) => S[i + 1] - S[i];
const lw = (s: number, w: number) => wf(s, w) - S[s]; // local frame of a word

const SceneWrap: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => {
  const f = useCurrentFrame();
  const L = len(i) + 6;
  const fadeIn = i === 0 ? 1 : i === 1 ? 1 : prog(f, 0, 6);
  const fadeOut = i === 7 ? 1 : 1 - prog(f, L - 6, 6);
  return <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>{children}</AbsoluteFill>;
};

/* ============ 0 HOOK ============ */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + 0.12 * (f / len(0));
  const lines: [number, number, string[]][] = [
    [0, 0, ['Leads', 'in', 'your', 'phone.']],
    [0, 4, ['Follow-ups', 'in', 'a', 'notebook.']],
    [0, 8, ['Deals', 'in', 'your', 'head.']],
  ];
  const pts = Array.from({length: 26}, (_, i) => ({x: (i * 173) % 1080, y: (i * 311) % 1500 + 150, s: 3 + (i % 4) * 2, sp: 0.2 + (i % 5) * 0.12}));
  return (
    <AbsoluteFill>
      {pts.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: p.x, top: p.y - f * p.sp * 2, width: p.s, height: p.s, borderRadius: '50%', background: i % 2 ? CYAN : VIOLET, opacity: 0.35}} />
      ))}
      <div style={{position: 'absolute', left: 70, right: 70, top: 560, transform: `scale(${push})`, transformOrigin: '50% 50%', fontFamily: FONT}}>
        {lines.map(([s, w0, ws], li) => (
          <div key={li} style={{marginBottom: 46, textAlign: 'center', lineHeight: 1.08}}>
            {ws.map((t, k) => {
              const start = lw(s, w0 + k) - 3;
              const cur = li === 2 ? VIOLET : li === 1 ? CYAN : '#fff';
              const isLast = k === ws.length - 1;
              return (
                <KWord key={k} start={start} size={88} color={isLast ? (li === 0 ? '#fff' : cur) : '#fff'}>{t}</KWord>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ============ 1 REVEAL ============ */
export const Logo: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${CYAN}66, 0 20px 50px rgba(0,0,0,0.5)`}}>
    <Img src={staticFile('logo-mark.png')} style={{height: size * 0.72, width: 'auto'}} />
  </div>
);

const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const T = len(1);
  const phase1 = 1 - prog(f, 44, 14);
  const logoIn = prog(f, 0, 16);
  const cloud = prog(f, 4, 30, inout);
  const open = prog(f, 66, 26, inout);
  const phoneLocal = f - 50;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: phase1 * logoIn, transform: `scale(${0.9 + 0.1 * logoIn - (1 - phase1) * 0.1}) translateY(${-(1 - phase1) * 40}px)`}}>
        <div style={{position: 'relative', width: 480, height: 400}}>
          <div style={{position: 'absolute', left: 60, top: 0}}><CloudIcon size={360} progress={cloud} /></div>
          <div style={{position: 'absolute', left: 150, top: 80}}><Logo size={180} /></div>
        </div>
        <div style={{fontFamily: FONT, fontSize: 78, fontWeight: 800, color: '#fff', marginTop: 20, textAlign: 'center', letterSpacing: -1.5}}>
          {['Mega-Net', 'ERP', 'Cloud'].map((t, i) => (<KWord key={i} start={12 + i * 5} size={78}>{t}</KWord>))}
        </div>
      </div>
      {f > 40 && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 138, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: CYAN, letterSpacing: 6, textTransform: 'uppercase', opacity: prog(f, 46, 10)}}>Introducing</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, lineHeight: 1}}>
            <KWord start={50} size={100}>Sales</KWord><KWord start={55} size={100}>&amp;</KWord><KWord start={60} size={100} color={CYAN}>CRM</KWord>
          </div>
          <Phone local={phoneLocal} len={T - 50}>
            <div style={{position: 'absolute', inset: 0, background: APP.navy}}>
              <Img src={staticFile('crm/menu_crm.png')} style={{width: 390, height: 844, display: 'block'}} />
              {/* cover the group's items, then uncover top-down: the group "opens" */}
              <div style={{position: 'absolute', left: 0, top: 476 + open * 268, width: 285, height: 268 - open * 268 + 2, background: APP.navy}} />
              <div style={{position: 'absolute', left: 14, top: 436, width: 262, height: 34, borderRadius: 8, boxShadow: `0 0 0 ${2 + Math.sin(f / 4) * 1.5}px ${CYAN}, 0 0 28px ${CYAN}88`, opacity: prog(f, 58, 8)}} />
            </div>
          </Phone>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ============ 2 LEADS ============ */
const scoreStyle = (s: number) => (s >= 50 ? {bg: '#dcfce7', fg: '#15803d'} : s >= 30 ? {bg: '#fef3c7', fg: '#b45309'} : {bg: '#e5e7eb', fg: '#4b5563'});
const statusStyle = (s: string) =>
  s === 'qualified' ? {bg: '#dcfce7', fg: '#15803d', t: 'Qualified'} : s === 'contacted' ? {bg: '#dbeafe', fg: '#1d4ed8', t: 'Contacted'} : {bg: '#ede9fe', fg: '#6d28d9', t: 'New'};

const Leads: React.FC = () => {
  const f = useCurrentFrame();
  const T = len(2);
  const open = [...DATA.leads].filter((l) => l.status !== 'converted').sort((a, b) => b.score - a.score);
  const rows = open.slice(0, 7);
  const target = rows.findIndex((r) => r.company_name === 'Northgate Catering Equipment');
  const tPop = 44, tTap = 82, tChecks = 88;
  const popP = prog(f, tPop, 12) * (1 - 0);
  const rowTop = (i: number) => 164 + i * 90;
  const converted = f >= tTap + 2;
  const tgt = rows[target];
  return (
    <AbsoluteFill>
      <Title words={[['Capture.', lw(2, 0) - 2], ['Score.', lw(2, 3) - 2], ['Convert.', lw(2, 9) - 2, CYAN]]} />
      <Phone local={f} len={T}>
        <div style={{position: 'absolute', inset: 0, background: '#fff'}}>
          <AppHeader />
          <div style={{position: 'absolute', left: 16, top: 70, fontSize: 28, fontWeight: 800, color: APP.h}}>Leads</div>
          <div style={{position: 'absolute', right: 16, top: 68, background: APP.accent, color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 15, fontWeight: 600}}>New lead</div>
          <div style={{position: 'absolute', left: 16, top: 120, right: 16, display: 'flex', gap: 8}}>
            {[['New', 2], ['Contacted', 3], ['Qualified', 2], ['Converted', 5]].map(([a, b]) => (
              <div key={a as string} style={{flex: 1, background: APP.bgMuted, border: `1px solid ${APP.border}`, borderRadius: 8, padding: '4px 6px', textAlign: 'center'}}>
                <div style={{fontSize: 10.5, color: APP.muted}}>{a}</div>
                <div style={{fontSize: 17, fontWeight: 800, color: APP.h}}>{b}</div>
              </div>
            ))}
          </div>
          {rows.map((r, i) => {
            const p = prog(f, 3 + i * 3, 10);
            const bp = prog(f, lw(2, 3) + i * 3, 10);
            const ss = scoreStyle(r.score);
            const st = statusStyle(r.status);
            const shown = Math.round(r.score * bp);
            const isT = i === target;
            const hi = isT && f >= tPop - 4 && !converted ? 1 : 0;
            return (
              <div key={r.id} style={{position: 'absolute', left: 16, right: 16, top: rowTop(i) + (1 - p) * 24, height: 80, opacity: p, background: hi ? '#eef2ff' : APP.bgMuted, border: `1.5px solid ${hi ? APP.accent : APP.border}`, borderRadius: 12, padding: '10px 12px', boxSizing: 'border-box'}}>
                <div style={{fontSize: 15.5, fontWeight: 800, color: APP.h, width: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.company_name}</div>
                <div style={{fontSize: 12.5, color: APP.muted, marginTop: 2}}>{r.contact_name} · {r.source_name}</div>
                <div style={{marginTop: 6}}><Pill bg={st.bg} fg={st.fg}>{isT && converted ? 'Converted' : st.t}</Pill></div>
                <div style={{position: 'absolute', right: 12, top: 18, width: 44, height: 44, borderRadius: '50%', background: ss.bg, color: ss.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, transform: `scale(${0.4 + 0.6 * ease(bp) + Math.sin(bp * Math.PI) * 0.18})`, opacity: bp, boxShadow: bp > 0.3 ? `0 0 0 ${3 * (1 - bp)}px ${ss.fg}55` : 'none'}}>{shown}</div>
              </div>
            );
          })}
          {/* explainable score + convert card */}
          {f >= tPop - 2 && (
            <div style={{position: 'absolute', left: 14, right: 14, top: 258, zIndex: 10, opacity: popP, transform: `translateY(${(1 - popP) * 30}px)`}}>
              <div style={{background: '#fff', border: `1.5px solid ${APP.accent}`, borderRadius: 14, padding: 14, boxShadow: '0 18px 40px rgba(30,20,80,0.28)'}}>
                {!converted ? (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                      <div style={{fontSize: 15, fontWeight: 800, color: APP.h}}>Why {tgt.score}?</div>
                      <div style={{fontSize: 12, color: APP.muted}}>{tgt.company_name}</div>
                    </div>
                    {tgt.score_reasons.map((r, k) => (
                      <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '3px 0', opacity: prog(f, tPop + 6 + k * 3, 8)}}>
                        <span>{r.reason}</span><span style={{fontWeight: 800, color: APP.success}}>+{r.points}</span>
                      </div>
                    ))}
                    <div style={{marginTop: 10, background: APP.accent, color: '#fff', borderRadius: 9, padding: '11px 0', textAlign: 'center', fontSize: 15, fontWeight: 700, transform: f >= tTap - 3 ? 'scale(0.97)' : 'none'}}>Convert to customer + contact + deal</div>
                  </>
                ) : (
                  <>
                    <div style={{fontSize: 15, fontWeight: 800, color: APP.success, marginBottom: 6}}>Converted in one step</div>
                    {['Customer account created', 'Contact added', 'Deal added to your pipeline'].map((t, k) => {
                      const p = prog(f, tChecks + k * 7, 8);
                      return (
                        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', opacity: p, transform: `translateX(${(1 - p) * 16}px)`, fontSize: 14.5, fontWeight: 600}}>
                          <span style={{width: 22, height: 22, borderRadius: '50%', background: APP.success, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transform: `scale(${0.5 + 0.5 * p})`}}>✓</span>{t}
                        </div>
                      );
                    })}
                    <div style={{fontSize: 12, color: APP.muted, marginTop: 6, opacity: prog(f, tChecks + 20, 8)}}>Duplicates are blocked by email or phone</div>
                  </>
                )}
              </div>
            </div>
          )}
          <Tap x={195} y={445} at={tTap} />
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

/* ============ 3 FOLLOW-UPS ============ */
const FollowUps: React.FC = () => {
  const f = useCurrentFrame();
  const T = len(3);
  const tTap = 34;
  const x = prog(f, tTap + 14, 10); // crossfade to the real "done" screen
  const check = prog(f, tTap + 8, 10);
  const scroll = prog(f, 62, 40, inout) * 70;
  return (
    <AbsoluteFill>
      <Title words={[['Never', lw(3, 1)], ['miss', lw(3, 8)], ['a', lw(3, 9)], ['follow-up.', lw(3, 10), CYAN]]} />
      <Phone local={f} len={T}>
        <div style={{position: 'absolute', inset: 0, background: '#fff', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: -scroll, width: 390, height: 844}}>
            <Img src={staticFile('crm/myday_before.png')} style={{position: 'absolute', left: 0, top: 0, width: 390, height: 844, opacity: 1 - x}} />
            <Img src={staticFile('crm/myday_done.png')} style={{position: 'absolute', left: 0, top: 0, width: 390, height: 844, opacity: x}} />
            {/* the finished follow-up turns green */}
            <div style={{position: 'absolute', left: 30, top: 186, width: 330, height: 128, borderRadius: 12, background: `rgba(21,128,61,${0.16 * check * (1 - x)})`, border: `2px solid rgba(21,128,61,${check * (1 - x)})`}} />
            <div style={{position: 'absolute', left: 150, top: 218, width: 90, height: 90, borderRadius: '50%', background: APP.success, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 58, fontWeight: 800, transform: `scale(${check * (1.15 - 0.15 * check)})`, opacity: check * (1 - x), boxShadow: '0 12px 40px rgba(21,128,61,0.55)'}}>✓</div>
            {x > 0.5 && <div style={{position: 'absolute', left: 16, top: 142, width: 100, height: 36, borderRadius: 10, boxShadow: `0 0 0 ${3 * (1 - clamp((f - tTap - 24) / 20))}px ${APP.success}88`}} />}
          </div>
          <AppHeader />
          <Tap x={215} y={287} at={tTap} />
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

/* ============ 4 PIPELINE ============ */
const COLS = ['Qualification', 'Proposal', 'Quotation sent', 'Negotiation', 'Won', 'Lost'];
const PROB: Record<string, number> = {Qualification: 10, Proposal: 30, 'Quotation sent': 60, Negotiation: 80, Won: 100, Lost: 0};
const MOVER = 'Hospital front-desk system';
const OTHERS = DATA.oppsBeforeWin.filter((o) => o.name !== MOVER);
const MOVER_OPP = DATA.oppsBeforeWin.find((o) => o.name === MOVER)!;
const COL_W = 300, COL_STEP = 312, CARD_H = 112, CARD_GAP = 10, COL_TOP = 172, CARDS_TOP = COL_TOP + 14 + 66;

const OppCard: React.FC<{o: {name: string; customer_name: string; amount: string; probability?: number; owner_name: string; expected_close_date?: string}; prob: number; hi?: number; lost?: boolean}> = ({o, prob, hi = 0, lost}) => (
  <div style={{height: CARD_H, boxSizing: 'border-box', background: '#fff', border: `${hi ? 2 : 1}px solid ${hi ? APP.accent : APP.border}`, borderRadius: 10, padding: '10px 12px', boxShadow: hi ? `0 0 0 4px ${APP.accent}33, 0 20px 40px rgba(30,20,80,0.35)` : 'none'}}>
    <div style={{fontSize: 14.5, fontWeight: 800, color: hi ? APP.accent : APP.h, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{o.name}</div>
    <div style={{fontSize: 12, color: APP.muted, marginTop: 1}}>{o.customer_name}</div>
    <div style={{fontSize: 18, fontWeight: 800, color: APP.h, marginTop: 6}}>{naira(Number(o.amount))} <span style={{fontSize: 12, fontWeight: 600, color: APP.muted}}>· {prob}%</span></div>
    <div style={{fontSize: 11.5, color: lost ? APP.danger : APP.muted, marginTop: 3}}>{lost ? 'Lost: Chose a competitor' : `${o.owner_name}`}</div>
  </div>
);

const Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  const T = len(4);
  const g1 = [16, 40], g2 = [52, 76];
  const pos = 2 + inout(clamp((f - g1[0]) / (g1[1] - g1[0]))) + inout(clamp((f - g2[0]) / (g2[1] - g2[0])));
  const stage = Math.round(pos);
  const landP = prog(f, g2[1] - 2, 24);
  const camP = pos;
  const tx = 45 - camP * COL_STEP;
  const lift = prog(f, 10, 6) * (1 - prog(f, g2[1] + 2, 8));
  const moverProb = [60, 80, 100][clamp(stage - 2, 0, 2)];
  const stageProb = (c: number) => PROB[COLS[c]];
  const colItems = COLS.map((_, c) => OTHERS.filter((o) => o.stage_name === COLS[c]));
  const sum = (c: number, moverIn: boolean) =>
    colItems[c].reduce((a, o) => a + Number(o.amount), 0) + (moverIn ? Number(MOVER_OPP.amount) : 0);
  const wsum = (c: number, moverIn: boolean) =>
    colItems[c].reduce((a, o) => a + Number(o.amount) * (o.probability ?? stageProb(c)) / 100, 0) + (moverIn ? Number(MOVER_OPP.amount) * stageProb(c) / 100 : 0);
  let open = 0, wopen = 0;
  for (let c = 0; c < 4; c++) { open += sum(c, stage === c); wopen += wsum(c, stage === c); }
  const wonBase = sum(4, false);
  const wonShown = wonBase + Number(MOVER_OPP.amount) * landP;
  const moverX = COL_STEP * pos + 14;
  return (
    <AbsoluteFill>
      <Title size={62} words={[['See', lw(4, 0)], ['every', lw(4, 1)], ['deal.', lw(4, 2)], ['Know', lw(4, 8), CYAN], ['what', lw(4, 9), CYAN], ['you', lw(4, 10), CYAN], ['will', lw(4, 11), CYAN], ['earn.', lw(4, 12), CYAN]]} />
      <Phone local={f} len={T}>
        <div style={{position: 'absolute', inset: 0, background: '#fff', overflow: 'hidden'}}>
          <AppHeader />
          <div style={{position: 'absolute', left: 16, top: 68, fontSize: 28, fontWeight: 800, color: APP.h}}>Pipeline</div>
          <div style={{position: 'absolute', left: 16, top: 108, right: 16, fontSize: 13.5, color: APP.muted, lineHeight: 1.35}}>
            Open <b style={{color: APP.h}}>{naira(open)}</b> · Weighted forecast <b style={{color: APP.h}}>{naira(wopen)}</b>
          </div>
          <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${tx}px)`}}>
            {COLS.map((name, c) => {
              const moverIn = stage === c && f >= 0;
              const w = clamp(1 - Math.abs(pos - c));
              const cnt = colItems[c].length + (moverIn ? 1 : 0) + (c === 4 ? 0 : 0);
              const amt = c === 4 ? wonShown : sum(c, moverIn);
              const wgt = c === 4 ? wonShown : wsum(c, moverIn);
              const isWon = c === 4;
              const wonCount = colItems[4].length + (landP > 0.5 ? 1 : 0);
              return (
                <div key={name} style={{position: 'absolute', left: COL_STEP * c, top: COL_TOP, width: COL_W, height: 470, background: isWon ? '#f0fdf4' : '#fff', border: `1.5px solid ${isWon ? '#86efac' : APP.border}`, borderRadius: 14, padding: 14, boxSizing: 'border-box'}}>
                  <div style={{fontSize: 17, fontWeight: 800, color: APP.h}}>{name} <span style={{fontSize: 13, color: APP.muted}}>({isWon ? wonCount : cnt})</span></div>
                  <div style={{fontSize: 12.5, color: isWon ? APP.success : APP.muted, marginTop: 3, fontWeight: isWon ? 800 : 400}}>
                    {naira(amt)}{c < 4 ? ` · weighted ${naira(wgt)}` : ''}
                  </div>
                  <div style={{position: 'absolute', left: 14, right: 14, top: 66 + 14 - 14 + 0}}>
                    <div style={{height: w * (CARD_H + CARD_GAP)}} />
                    {colItems[c].map((o) => (
                      <div key={o.id} style={{marginBottom: CARD_GAP}}><OppCard o={o} prob={o.probability ?? stageProb(c)} lost={c === 5} /></div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* the deal card that glides across the board */}
            <div style={{position: 'absolute', left: moverX, top: CARDS_TOP - 14 - 4 - lift * 10, width: COL_W - 28, transform: `scale(${1 + lift * 0.04})`, zIndex: 8}}>
              <OppCard o={MOVER_OPP} prob={moverProb} hi={1} />
            </div>
          </div>
          {/* Won counter */}
          <div style={{position: 'absolute', left: 16, right: 16, bottom: 22, zIndex: 12, opacity: prog(f, g2[1] - 8, 10), transform: `translateY(${(1 - prog(f, g2[1] - 8, 10)) * 30}px)`}}>
            <div style={{background: APP.success, color: '#fff', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', boxShadow: '0 16px 40px rgba(21,128,61,0.5)'}}>
              <span style={{fontSize: 15, fontWeight: 700}}>Won this month</span>
              <span style={{fontSize: 26, fontWeight: 800}}>{naira(wonShown)}</span>
            </div>
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

/* ============ 5 ONE SYSTEM ============ */
const Doc: React.FC<{kind: 'Quotation' | 'Invoice'; paid: number}> = ({kind, paid}) => {
  const q = kind === 'Quotation';
  return (
    <div style={{background: '#fff', borderRadius: 22, padding: 26, color: APP.h, fontFamily: FONT, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', width: 440, boxSizing: 'border-box'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 800}}>{kind}</div>
        <Pill bg={q ? '#dbeafe' : paid > 0.5 ? '#dcfce7' : '#fef3c7'} fg={q ? '#1d4ed8' : paid > 0.5 ? '#15803d' : '#b45309'}>
          <span style={{fontSize: 22, padding: '0 6px'}}>{q ? 'Accepted' : paid > 0.5 ? 'Paid ✓' : 'Unpaid'}</span>
        </Pill>
      </div>
      <div style={{fontSize: 24, color: APP.muted, marginTop: 6, fontWeight: 600}}>{q ? DATA.quotation.quotation_number : DATA.invoice.invoice_number}</div>
      <div style={{fontSize: 26, fontWeight: 700, marginTop: 18}}>{DATA.invoice.customer_name}</div>
      <div style={{fontSize: 22, color: APP.muted, marginTop: 4}}>Front-desk system setup and training</div>
      <div style={{height: 2, background: APP.border, margin: '20px 0'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <span style={{fontSize: 22, color: APP.muted, fontWeight: 600}}>Total</span>
        <span style={{fontSize: 44, fontWeight: 800}}>{naira(Number(DATA.invoice.total_amount))}</span>
      </div>
    </div>
  );
};

const OneSystem: React.FC = () => {
  const f = useCurrentFrame();
  const flip = prog(f, 30, 14, inout); // quotation -> invoice
  const won = prog(f, 48, 12);
  const paid = prog(f, 78, 12);
  const panelIn = prog(f, 0, 14);
  const isInv = flip > 0.5;
  const rot = flip < 0.5 ? flip * 180 : -(1 - flip) * 180;
  const beam = prog(f, 40, 20, inout) * (1 - prog(f, 70, 12));
  const stages = ['Qualification', 'Proposal', 'Quotation sent', 'Negotiation', 'Won'];
  const stageIdx = won > 0.5 ? 4 : 3;
  return (
    <AbsoluteFill>
      <Title size={64} words={[['Quote.', lw(5, 1)], ['Invoice.', lw(5, 2)], ['Get', lw(5, 4)], ['paid.', lw(5, 5)], ['All', lw(5, 6), CYAN], ['connected.', lw(5, 8), CYAN]]} />
      {/* divider */}
      <div style={{position: 'absolute', left: 539, top: 500, width: 3, height: 860, background: `linear-gradient(180deg,transparent,${CYAN},${VIOLET},transparent)`, opacity: panelIn, boxShadow: `0 0 24px ${CYAN}`}} />
      <div style={{position: 'absolute', left: 40, top: 500, width: 480, opacity: panelIn, transform: `translateY(${(1 - panelIn) * 40}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 800, color: CYAN, letterSpacing: 3, textAlign: 'center', marginBottom: 22}}>SALES</div>
        <div style={{display: 'flex', justifyContent: 'center', perspective: 1400}}>
          <div style={{transform: `rotateY(${rot}deg)`}}><Doc kind={isInv ? 'Invoice' : 'Quotation'} paid={paid} /></div>
        </div>
        <div style={{marginTop: 30, display: 'flex', justifyContent: 'center', opacity: paid, transform: `translateY(${(1 - paid) * 30}px) scale(${0.9 + 0.1 * paid})`}}>
          <div style={{background: '#16a34a', color: '#fff', fontFamily: FONT, fontSize: 36, fontWeight: 800, borderRadius: 22, padding: '20px 30px', boxShadow: '0 20px 50px rgba(22,163,74,0.5)', textAlign: 'center'}}>
            Payment received<br />{naira(Number(DATA.invoice.total_amount))}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 500, width: 480, opacity: panelIn, transform: `translateY(${(1 - panelIn) * 40}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 800, color: VIOLET, letterSpacing: 3, textAlign: 'center', marginBottom: 22}}>CRM DEAL</div>
        <div style={{background: '#fff', borderRadius: 22, padding: 26, fontFamily: FONT, color: APP.h, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', width: 440, margin: '0 auto', boxSizing: 'border-box', outline: won > 0.5 ? `4px solid #16a34a` : 'none'}}>
          <div style={{fontSize: 28, fontWeight: 800}}>{MOVER}</div>
          <div style={{fontSize: 22, color: APP.muted, marginTop: 4, fontWeight: 600}}>{DATA.invoice.customer_name}</div>
          <div style={{fontSize: 44, fontWeight: 800, marginTop: 14}}>{naira(Number(DATA.invoice.total_amount))}</div>
          <div style={{marginTop: 16}}>
            <span style={{display: 'inline-block', fontSize: 28, fontWeight: 800, padding: '6px 18px', borderRadius: 999, background: won > 0.5 ? '#16a34a' : '#fde68a', color: won > 0.5 ? '#fff' : '#92400e', transform: `scale(${1 + Math.sin(won * Math.PI) * 0.12})`}}>{won > 0.5 ? 'Won' : 'Negotiation'}</span>
          </div>
          <div style={{marginTop: 22}}>
            {stages.map((s, i) => (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, opacity: i <= stageIdx ? 1 : 0.35}}>
                <span style={{width: 16, height: 16, borderRadius: '50%', background: i < stageIdx ? '#16a34a' : i === stageIdx ? (won > 0.5 ? '#16a34a' : '#f59e0b') : APP.border}} />
                <span style={{fontSize: 22, fontWeight: i === stageIdx ? 800 : 600}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* beam between the two halves */}
      <div style={{position: 'absolute', left: 478, top: 735, width: 124 * beam, height: 6, background: `linear-gradient(90deg,${CYAN},${VIOLET})`, borderRadius: 3, boxShadow: `0 0 30px ${CYAN}`, opacity: beam > 0 ? 1 : 0, zIndex: 5}} />
    </AbsoluteFill>
  );
};

/* ============ 6 INSIGHT ============ */
const Insight: React.FC = () => {
  const f = useCurrentFrame();
  const T = len(6);
  const P = DATA.pipelineD;
  const bars = P.open.stages.map((s) => ({label: s.stage, amount: Number(s.amount)}));
  const max = Math.max(...bars.map((b) => b.amount));
  const bubble1 = prog(f, 34, 10);
  const dots = f >= 48 && f < 58;
  const bubble2 = prog(f, 58, 10);
  const ans = `${P.open.count} open deals worth ${naira(Number(P.open.amount))}. Win rate this month: ${Math.round(Number(P.win_rate))}%.`;
  const shownChars = Math.round(ans.length * clamp((f - 60) / 24));
  return (
    <AbsoluteFill>
      <Title words={[['Ask', lw(6, 0)], ['how', lw(6, 1)], ['your', lw(6, 2)], ['sales', lw(6, 3)], ['are', lw(6, 4)], ['doing.', lw(6, 5), CYAN]]} />
      <Phone local={f} len={T}>
        <div style={{position: 'absolute', inset: 0, background: '#fff'}}>
          <AppHeader />
          <div style={{position: 'absolute', left: 16, top: 66, fontSize: 26, fontWeight: 800, color: APP.h}}>CRM reports</div>
          <div style={{position: 'absolute', left: 16, right: 16, top: 106, display: 'flex', gap: 6}}>
            {['Lead conversion', 'Pipeline and win rate', 'Sales rep performance', 'Lost deals'].map((r, i) => (
              <div key={r} style={{flex: i === 1 ? 1.5 : 1, fontSize: 10.5, fontWeight: 700, textAlign: 'center', padding: '6px 3px', borderRadius: 8, background: i === 1 ? APP.accent : APP.bgMuted, color: i === 1 ? '#fff' : APP.muted, border: `1px solid ${i === 1 ? APP.accent : APP.border}`, lineHeight: 1.15}}>{r}</div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 16, right: 16, top: 158, display: 'flex', gap: 10, opacity: prog(f, 2, 10)}}>
            <Card style={{flex: 1}}>
              <div style={{fontSize: 12, color: APP.muted}}>Win rate</div>
              <div style={{fontSize: 40, fontWeight: 800, color: APP.success}}>{(Number(P.win_rate) * prog(f, 4, 22)).toFixed(1)}%</div>
              <div style={{fontSize: 12.5, color: APP.muted}}>{P.won.count} won · {P.lost.count} lost</div>
            </Card>
            <Card style={{flex: 1}}>
              <div style={{fontSize: 12, color: APP.muted}}>Won this month</div>
              <div style={{fontSize: 22, fontWeight: 800, color: APP.h, marginTop: 8}}>{naira(Number(P.won.amount) * prog(f, 4, 22))}</div>
              <div style={{fontSize: 12.5, color: APP.muted, marginTop: 4}}>Weighted forecast {naira(Number(P.open.weighted_amount))}</div>
            </Card>
          </div>
          <div style={{position: 'absolute', left: 16, right: 16, top: 312, fontSize: 14, fontWeight: 800, color: APP.h}}>Open deals by stage</div>
          {bars.map((b, i) => {
            const p = prog(f, 8 + i * 5, 18);
            return (
              <div key={b.label} style={{position: 'absolute', left: 16, right: 16, top: 342 + i * 52}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 3}}>
                  <span style={{fontWeight: 600}}>{b.label}</span><span style={{color: APP.muted, opacity: p}}>{naira(b.amount)}</span>
                </div>
                <div style={{height: 18, background: APP.bgMuted, borderRadius: 9}}>
                  <div style={{height: 18, width: `${(b.amount / max) * 100 * p}%`, borderRadius: 9, background: `linear-gradient(90deg,${APP.accent},${CYAN})`}} />
                </div>
              </div>
            );
          })}
          {/* AI assistant bubbles */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 560, bottom: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0),#fff 12%)', opacity: bubble1}} />
          <div style={{position: 'absolute', right: 16, top: 590, maxWidth: 270, opacity: bubble1, transform: `translateY(${(1 - bubble1) * 24}px)`}}>
            <div style={{background: APP.accent, color: '#fff', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', fontSize: 16, fontWeight: 600, lineHeight: 1.3}}>How is my pipeline this month?</div>
          </div>
          <div style={{position: 'absolute', left: 16, top: 668, maxWidth: 300}}>
            {dots && (
              <div style={{background: APP.bgMuted, borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: 6, border: `1px solid ${APP.border}`}}>
                {[0, 1, 2].map((k) => <span key={k} style={{width: 9, height: 9, borderRadius: '50%', background: APP.muted, opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + k * 3) / 4))}} />)}
              </div>
            )}
            {f >= 58 && (
              <div style={{opacity: bubble2, background: APP.bgMuted, border: `1px solid ${APP.border}`, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', fontSize: 15.5, fontWeight: 600, lineHeight: 1.35, color: APP.h}}>
                <div style={{fontSize: 11.5, fontWeight: 800, color: APP.accent, marginBottom: 4}}>AI assistant</div>
                {ans.slice(0, shownChars)}
              </div>
            )}
          </div>
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

/* ============ 7 CTA ============ */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const logoIn = prog(f, 0, 18);
  const cloud = prog(f, 2, 30, inout);
  const btn = prog(f, lw(7, 9) - 2, 14);
  const contact = prog(f, Math.min(lw(7, 9) + 8, 126), 14);
  const glow = 0.6 + 0.4 * Math.sin(f / 10);
  return (
    <AbsoluteFill style={{fontFamily: FONT, textAlign: 'center'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: logoIn, transform: `translateY(${(1 - logoIn) * 20}px)`}}>
        <div style={{position: 'relative', width: 200, height: 190}}>
          <div style={{position: 'absolute', left: -20, top: -30}}><CloudIcon size={240} progress={cloud} /></div>
          <div style={{position: 'absolute', left: 38, top: 22}}><Logo size={116} /></div>
        </div>
        <div style={{fontSize: 62, fontWeight: 800, color: '#fff', textAlign: 'left', lineHeight: 1.05, letterSpacing: -1}}>Mega-Net<br />ERP Cloud</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 470, lineHeight: 1.1}}>
        <KWord start={lw(7, 0) - 2} size={92} color={CYAN}>Sales</KWord><KWord start={lw(7, 1) - 2} size={92} color={CYAN}>&amp;</KWord><KWord start={lw(7, 2) - 2} size={92} color={CYAN}>CRM</KWord>
        <br />
        <KWord start={lw(7, 3) - 2} size={74}>is</KWord><KWord start={lw(7, 3) - 1} size={74}>now</KWord><KWord start={lw(7, 4)} size={74}>live</KWord>
        <br />
        <KWord start={lw(7, 5) - 2} size={74}>in</KWord><KWord start={lw(7, 6) - 2} size={74}>Mega-Net</KWord>
        <br />
        <KWord start={lw(7, 7) - 2} size={74}>ERP</KWord><KWord start={lw(7, 8) - 2} size={74}>Cloud</KWord>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 975, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{background: `linear-gradient(90deg,${CYAN},${VIOLET})`, borderRadius: 999, padding: '28px 70px', fontSize: 58, fontWeight: 800, color: '#050816', boxShadow: `0 0 ${50 * glow}px ${CYAN}88, 0 24px 60px rgba(0,0,0,0.5)`}}>Book a free demo</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, opacity: contact, transform: `translateY(${(1 - contact) * 20}px)`}}>
        <div style={{fontSize: 54, fontWeight: 800, color: '#fff'}}><span style={{color: '#4ade80'}}>WhatsApp</span> +234 703 568 2478</div>
        <div style={{fontSize: 46, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginTop: 18}}>www.meganetsoftware.com.ng</div>
      </div>
    </AbsoluteFill>
  );
};

/* ============ flare + sfx ============ */
const Flare: React.FC = () => {
  const f = useCurrentFrame();
  const c = S[1];
  const up = clamp((f - (c - 6)) / 6), down = 1 - clamp((f - c) / 16);
  const o = f < c ? up : down * 0.9;
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: o, mixBlendMode: 'screen', background: `radial-gradient(ellipse 70% 40% at 50% 46%, rgba(255,255,255,0.95), ${CYAN}55 45%, transparent 75%)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, height: 6, background: '#fff', filter: 'blur(3px)', transform: `scaleX(${0.3 + (f < c ? up : 1 + (1 - down)) * 0.7})`}} />
    </AbsoluteFill>
  );
};

const Sfx: React.FC = () => {
  const at = (frame: number, file: string, vol: number) => (
    <Sequence key={file + frame} from={Math.max(0, frame)} durationInFrames={50}><Audio src={staticFile(file)} volume={vol} /></Sequence>
  );
  const taps = [S[2] + 82, S[3] + 34, S[4] + 16];
  return (
    <>
      {S.slice(1, 8).map((s, i) => at(s - 5, 'crm-whoosh.wav', 0.5))}
      {taps.map((t) => at(t, 'crm-click.wav', 0.6))}
      {[S[2] + 90, S[3] + 44, S[4] + 74, S[5] + 50, S[5] + 78].map((t) => at(t, 'crm-chime.wav', 0.5))}
    </>
  );
};

export const MegaNetCrmAd: React.FC = () => {
  const f = useCurrentFrame();
  const scenes = [Hook, Reveal, Leads, FollowUps, Pipeline, OneSystem, Insight, Cta];
  const lastWord = wEnd(7, LINES[7].words.length - 1);
  return (
    <AbsoluteFill style={{background: '#02030a'}}>
      <Freeze frame={HOLD_FROM} active={f >= HOLD_FROM}>
        <Background />
        {scenes.map((Sc, i) => (
          <Sequence key={i} from={S[i]} durationInFrames={len(i) + (i < 7 ? 6 : 0)}>
            <SceneWrap i={i}><Sc /></SceneWrap>
          </Sequence>
        ))}
        <Flare />
        <GrainVignette />
      </Freeze>
      <Captions hideBefore={S[1]} hideAfter={lastWord + 6} />
      <Sequence from={LEAD}><Audio src={staticFile('voiceover-crm.mp3')} volume={1} /></Sequence>
      <Audio src={staticFile('crm-music.wav')} volume={1} />
      <Sfx />
    </AbsoluteFill>
  );
};

/* Thumbnail still: hook text on the Reveal look (logo + cloud + "Introducing Sales & CRM"). */
export const MegaNetCrmThumb: React.FC = () => (
  <AbsoluteFill style={{background: '#02030a', fontFamily: FONT, textAlign: 'center'}}>
    <Background />
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
      <div style={{position: 'relative', width: 200, height: 190}}>
        <div style={{position: 'absolute', left: -20, top: -30}}><CloudIcon size={240} progress={1} /></div>
        <div style={{position: 'absolute', left: 38, top: 22}}><Logo size={116} /></div>
      </div>
      <div style={{fontSize: 62, fontWeight: 800, color: '#fff', textAlign: 'left', lineHeight: 1.05, letterSpacing: -1}}>Mega-Net<br />ERP Cloud</div>
    </div>
    <div style={{position: 'absolute', left: 70, right: 70, top: 520, color: '#fff', fontSize: 74, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2}}>
      Leads in your phone.<br />Follow-ups in a notebook.<br /><span style={{color: VIOLET}}>Deals in your head.</span>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 960, fontSize: 40, fontWeight: 700, color: CYAN, letterSpacing: 6, textTransform: 'uppercase'}}>Introducing</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1015, fontSize: 124, fontWeight: 800, color: '#fff', letterSpacing: -2}}>Sales &amp; <span style={{color: CYAN}}>CRM</span></div>
    <GrainVignette />
  </AbsoluteFill>
);
