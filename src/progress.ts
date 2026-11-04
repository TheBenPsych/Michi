import { UNITS, Lesson, Unit, Kana } from './data/kana';
import { S } from './state';
import { MASTERED_DAYS } from './srs';
import { COURSE, CourseUnit, Stop, ALL_STOPS, unitOfStop } from './data/course';

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

// ---- Course path ----
const kanaUnitOfStop = (s: Stop) => (s.id.startsWith('h-') ? 'hira' : 'kata');
/** Done for real, or a kana stop skipped by beating that script's kana boss. */
export const stopDone = (s: Stop) => s.id in S.done || (s.kind === 'kana' && !!S.bosses[kanaUnitOfStop(s)]);
export const courseUnitDone = (u: CourseUnit) => !!S.stamps[u.id] || u.parts.every((p) => p.stops.every(stopDone));
export const courseUnitUnlocked = (u: CourseUnit) => { const i = COURSE.indexOf(u); return i <= 0 || courseUnitDone(COURSE[i - 1]); };
export function stopUnlocked(s: Stop): boolean {
  const u = unitOfStop(s);
  if (stopDone(s)) return true;
  if (!courseUnitUnlocked(u)) return false;
  const all = u.parts.flatMap((p) => p.stops), i = all.indexOf(s);
  return i === 0 || !!S.stamps[u.id] || stopDone(all[i - 1]);
}
/** The stop to suggest next: the first unlocked stop that is not done. */
export const nextStop = (): Stop | undefined => ALL_STOPS.find((s) => stopUnlocked(s) && !stopDone(s));
export const currentUnit = (): CourseUnit => { const s = nextStop(); return s ? unitOfStop(s) : COURSE[COURSE.length - 1]; };
export const learnedWords = () => Object.keys(S.cards).filter((id) => id.startsWith('w:')).length;
