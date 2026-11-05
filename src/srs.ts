// Spaced repetition with FSRS (Free Spaced Repetition Scheduler, v4.5 default weights),
// the open scheduler Anki ships. It models how stable each memory is and schedules the
// next review for when you would have about a 90% chance of still remembering it.
export type Grade = 'again' | 'hard' | 'good' | 'easy';
export interface Card {
  id: string; due: number;
  iv: number;      // current interval in days (0 = relearning within minutes)
  ease: number;    // legacy (SM-2), kept so old saves load
  reps: number; lapses: number;
  s?: number;      // FSRS stability in days
  d?: number;      // FSRS difficulty 1..10
  last?: number;   // time of the last review
}

export const MIN = 60_000;
export const DAY = 86_400_000;
export const MASTERED_DAYS = 21;
export const LEECH_LAPSES = 4;
const RETENTION = 0.9;
const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5, FACTOR = 19 / 81;
const G: Record<Grade, number> = { again: 1, hard: 2, good: 3, easy: 4 };
const clampD = (d: number) => Math.min(10, Math.max(1, d));

export const newCard = (id: string, now: number, firstIvDays = 1): Card =>
  ({ id, due: now + firstIvDays * DAY, iv: firstIvDays, ease: 2.5, reps: 0, lapses: 0 });

/** Chance (0..1) of remembering a card right now. */
export function retrievability(c: Card, now: number): number {
  if (!c.s || !c.last) return c.reps ? 0.9 : 1;
  const t = Math.max(0, (now - c.last) / DAY);
  return Math.pow(1 + (FACTOR * t) / c.s, DECAY);
}
const ivFromS = (s: number) => Math.max(1, Math.round((s / FACTOR) * (Math.pow(RETENTION, 1 / DECAY) - 1)));

/** Stability and difficulty after a grade (cards from the old scheduler are converted on the fly). */
function next(c: Card, g: Grade, now: number): { s: number; d: number } {
  const n = G[g];
  if (c.reps === 0 && !c.s) return { s: W[n - 1], d: clampD(W[4] - (n - 3) * W[5]) };
  const s = c.s ?? Math.max(0.5, c.iv), d = c.d ?? 5;
  const last = c.last ?? c.due - c.iv * DAY;
  const r = Math.pow(1 + (FACTOR * Math.max(0, (now - last) / DAY)) / s, DECAY);
  const d0 = W[4]; // initial difficulty for "good"
  const nd = clampD(W[7] * d0 + (1 - W[7]) * (d - W[6] * (n - 3)));
  if (g === 'again') {
    const ns = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
    return { s: Math.max(0.1, Math.min(ns, s)), d: nd };
  }
  const ns = s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * (g === 'hard' ? W[15] : 1) * (g === 'easy' ? W[16] : 1) + 1);
  return { s: ns, d: nd };
}

/** Next interval in days for a grade (0 = relearn in a minute). */
export function nextIv(c: Card, g: Grade, now = Date.now()): number {
  if (g === 'again') return 0;
  const { s } = next(c, g, now);
  let iv = ivFromS(s);
  // Keep the buttons in order: hard <= good <= easy.
  if (g === 'good') iv = Math.max(iv, nextIvRaw(c, 'hard', now));
  if (g === 'easy') iv = Math.max(iv, nextIvRaw(c, 'good', now) + 1);
  return iv;
}
const nextIvRaw = (c: Card, g: Grade, now: number) => ivFromS(next(c, g, now).s);

export function grade(c: Card, g: Grade, now: number): Card {
  const { s, d } = next(c, g, now);
  const iv = nextIv(c, g, now);
  return {
    ...c, iv, s, d, last: now,
    reps: g === 'again' ? c.reps : c.reps + 1,
    lapses: g === 'again' ? c.lapses + 1 : c.lapses,
    due: now + (iv === 0 ? MIN : iv * DAY),
  };
}

/** A card you keep forgetting gets extra help. */
export const isLeech = (c: Card) => c.lapses >= LEECH_LAPSES;
/** How a review card is asked: flip card first, then typing, then listening or speaking. */
export const stageOf = (c: Card): 'flash' | 'type' | 'ear' => {
  const s = c.s ?? c.iv;
  return c.reps === 0 || s < 3 ? 'flash' : s < 30 ? 'type' : 'ear';
};

export const fmtIv = (days: number) => (days === 0 ? '1 min' : days === 1 ? '1 day' : days < 30 ? `${days} days` : days < 365 ? `${Math.round(days / 30)} mo` : `${(days / 365).toFixed(1)} yr`);
