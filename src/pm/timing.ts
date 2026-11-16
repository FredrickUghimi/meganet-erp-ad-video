// Single source of truth for the Project Management ad timeline.
// Pure data only (no TS-only syntax beyond annotations) so scripts/pm_cues.mjs can import it with Node.
export const PM_FPS = 30;
export const PM_W = 1920;
export const PM_H = 1080;

// Scene start / length in seconds (absolute). Sum = 62 s.
export const SCENES = [
  {id: 1, name: 'problem', start: 0, dur: 7},
  {id: 2, name: 'intro', start: 7, dur: 8},
  {id: 3, name: 'plan', start: 15, dur: 10},
  {id: 4, name: 'people', start: 25, dur: 9},
  {id: 5, name: 'timecost', start: 34, dur: 11},
  {id: 6, name: 'visibility', start: 45, dur: 8},
  {id: 7, name: 'close', start: 53, dur: 9},
];
export const PM_TOTAL_FRAMES = 62 * PM_FPS;
export const sceneFrames = (i: number) => SCENES[i - 1].dur * PM_FPS;
export const sceneStartFrame = (i: number) => SCENES[i - 1].start * PM_FPS;

// Local (per-scene) times in seconds.
export const T1 = {dim: 1.7, l1: 2.0, l2: 2.8, l3: 3.6, collapse: 5.6, collapseDur: 1.3};
export const T2 = {ring: 0.0, mark: 0.25, up: 1.5, upDur: 0.9, kick: 1.8, h: 2.25, brand: 3.0, dash: 3.1, dashDur: 1.6, shapes: 4.2};
export const T3 = {
  head: [0.1, 0.5, 0.9], card: 0.3, typeStart: 0.8, typeCps: 13, name: 'Customer Portal Rollout',
  chips: [2.5, 2.85, 3.2, 3.55], line: 4.0, ms: [4.2, 4.6, 5.0], tasks: [5.3, 5.5, 5.7, 5.9, 6.1, 6.3],
  av: [6.8, 7.0, 7.2, 7.4, 7.6, 7.8], due: [8.2, 8.35, 8.5, 8.65, 8.8, 8.95], sum: [9.0, 9.2, 9.4],
};
export const T4 = {head: 0.1, card: 0.3, row0: 0.9, rowStep: 0.3, bars: 1.2, marker: 1.0, flag: 4.8, banner: 5.8};
export const T5 = {head: 0.1, left: 0.3, steps: [3.0, 4.0, 5.0], rows: [0.9, 1.3, 1.7, 2.1, 2.5], total: 5.4, right: 5.2, gauge: 6.0, figs: [6.2, 6.5, 6.8, 7.1], chart: 7.5, bars: [7.7, 8.1, 8.5, 8.9], note: 9.4};
export const T6 = {head: 0.1, kpi: [0.5, 0.7, 0.9, 1.1, 1.3], table: 1.8, rowStep: 0.4, fin: 4.0, hl: 5.6};
export const T7 = {lock: 0.2, nodes: [1.5, 2.3, 3.1], all: 4.0, demo: 4.6, pill1: 5.6, pill2: 6.1, fadeStart: 8.5};

// ---------- Sound-effect cues (absolute seconds) ----------
export type Cue = {t: number; kind: string; gain?: number};
const A = (i: number, local: number) => SCENES[i - 1].start + local;
const cues: Cue[] = [];
const add = (t: number, kind: string, gain = 1) => cues.push({t: Math.round(t * 1000) / 1000, kind, gain});

// Scene 1: flurry of soft ticks as the chaos builds, thuds on headline lines, reverse whoosh on collapse.
[0.2, 0.45, 0.62, 0.9, 1.05, 1.3, 1.45, 1.7].forEach((l, i) => add(A(1, l), 'tick', 0.45 + 0.05 * (i % 3)));
add(A(1, T1.l1), 'thud', 0.8); add(A(1, T1.l2), 'thud', 0.8); add(A(1, T1.l3), 'thud', 1);
add(A(1, T1.collapse - 0.1), 'rwhoosh', 1);
// Scene 2: ring burst + chime on logo reveal.
add(A(2, 0), 'boom', 0.9); add(A(2, T2.mark + 0.05), 'chime', 1);
add(A(2, T2.up), 'whoosh', 0.55);
add(A(2, T2.h), 'pop', 0.7); add(A(2, T2.brand), 'pop', 0.7);
add(A(2, T2.dash), 'whoosh', 0.45);
[4.2, 4.5, 4.8, 5.1, 5.4].forEach((l) => add(A(2, l), 'tick', 0.6));
// Scene 3
for (let i = 0; i < T3.name.length; i += 2) add(A(3, T3.typeStart + i / T3.typeCps), 'tick', 0.5);
T3.chips.forEach((l) => add(A(3, l), 'pop', 0.6));
T3.ms.forEach((l) => add(A(3, l), 'pop', 0.8));
T3.tasks.forEach((l) => add(A(3, l), 'tick', 0.7));
T3.av.forEach((l) => add(A(3, l), 'pop', 0.5));
T3.due.forEach((l) => add(A(3, l), 'tick', 0.55));
T3.sum.forEach((l) => add(A(3, l), 'pop', 0.9));
// Scene 4
for (let r = 0; r < 5; r++) add(A(4, T4.row0 + r * T4.rowStep), 'tick', 0.6);
add(A(4, T4.flag), 'warn', 0.9); add(A(4, T4.banner), 'pop', 0.8);
// Scene 5
T5.rows.forEach((l) => add(A(5, l), 'tick', 0.6));
T5.steps.forEach((l) => add(A(5, l), 'check', 0.8));
add(A(5, T5.total), 'pop', 0.8);
add(A(5, T5.gauge), 'tally', 0.7);
T5.figs.forEach((l) => add(A(5, l), 'tick', 0.55));
T5.bars.forEach((l) => add(A(5, l), 'pop', 0.6));
// Scene 6
T6.kpi.forEach((l) => add(A(6, l), 'pop', 0.7));
for (let r = 0; r < 5; r++) add(A(6, T6.table + r * T6.rowStep), 'tick', 0.6);
add(A(6, T6.fin), 'pop', 0.8);
// Scene 7
add(A(7, T7.lock), 'chime', 1);
T7.nodes.forEach((l) => add(A(7, l), 'pop', 0.7));
add(A(7, T7.all), 'chime', 0.8);
add(A(7, T7.pill1), 'pop', 0.7); add(A(7, T7.pill2), 'pop', 0.7);
// Scene transitions: whoosh centred on each boundary (the swipe streak crosses mid-screen at the boundary).
[15, 25, 34, 45, 53].forEach((s) => add(s - 0.22, 'whoosh', 0.8));

export const CUES: Cue[] = cues.sort((a, b) => a.t - b.t);
