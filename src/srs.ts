// Small spaced-repetition scheduler (SM-2 style) with the four buttons from the design.
export type Grade = 'again' | 'hard' | 'good' | 'easy';
export interface Card { id: string; due: number; iv: number; ease: number; reps: number; lapses: number }

export const MIN = 60_000;
export const DAY = 86_400_000;

export const newCard = (id: string, now: number, firstIvDays = 1): Card =>
  ({ id, due: now + firstIvDays * DAY, iv: firstIvDays, ease: 2.5, reps: 0, lapses: 0 });

/** Next interval in days for a grade (0 = relearn in a minute). */
export function nextIv(c: Card, g: Grade): number {
  if (g === 'again') return 0;
  if (c.reps === 0 || c.iv < 1) return { hard: 1, good: 3, easy: 7 }[g];
  if (g === 'hard') return Math.max(1, Math.round(c.iv * 1.2));
  if (g === 'good') return Math.max(c.iv + 1, Math.round(c.iv * c.ease));
  return Math.max(c.iv + 2, Math.round(c.iv * c.ease * 1.3));
}

export function grade(c: Card, g: Grade, now: number): Card {
  const iv = nextIv(c, g);
  const ease = Math.max(1.3, c.ease + { again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[g]);
  return {
    ...c, iv, ease,
    reps: g === 'again' ? c.reps : c.reps + 1,
    lapses: g === 'again' ? c.lapses + 1 : c.lapses,
    due: now + (iv === 0 ? MIN : iv * DAY),
  };
}

export const fmtIv = (days: number) => (days === 0 ? '1 min' : days === 1 ? '1 day' : days < 30 ? `${days} days` : days < 365 ? `${Math.round(days / 30)} mo` : `${(days / 365).toFixed(1)} yr`);
export const MASTERED_DAYS = 21;
