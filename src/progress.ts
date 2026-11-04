import { UNITS, Lesson, Unit, Kana } from './data/kana';
import { S } from './state';
import { MASTERED_DAYS } from './srs';

export const unitOf = (l: Lesson) => UNITS.find((u) => u.id === l.unit)!;
export const unitDone = (u: Unit) => !!S.bosses[u.id] || u.lessons.every((l) => l.id in S.done);

export function unitUnlocked(u: Unit): boolean {
  const i = UNITS.indexOf(u);
  return i === 0 || unitDone(UNITS[i - 1]);
}
export function lessonUnlocked(l: Lesson): boolean {
  const u = unitOf(l), i = u.lessons.indexOf(l);
  if (!unitUnlocked(u)) return false;
  return i === 0 || !!S.bosses[u.id] || u.lessons[i - 1].id in S.done;
}
/** The lesson to suggest next: first unlocked lesson not yet done. */
export function nextLesson(): Lesson {
  for (const u of UNITS) for (const l of u.lessons) if (lessonUnlocked(l) && !(l.id in S.done)) return l;
  return UNITS[UNITS.length - 1].lessons.at(-1)!;
}
/** Kana taught in this unit before the given lesson. */
export const knownBefore = (l: Lesson): Kana[] => { const u = unitOf(l); return u.lessons.slice(0, u.lessons.indexOf(l)).flatMap((x) => x.kana); };

export type Mastery = 'm' | 'l' | 'n';
export const mastery = (id: string): Mastery => { const c = S.cards[id]; return !c ? 'n' : c.iv >= MASTERED_DAYS ? 'm' : 'l'; };
export const learnedKana = (): Kana[] => UNITS.flatMap((u) => u.lessons.flatMap((l) => l.kana)).filter((k) => S.cards[k.id]);
