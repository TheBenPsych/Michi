import { describe, it, expect } from 'vitest';
import { markActive, currentStreak, weekStreak, weekDots, dayKey, S, MAX_CHARMS } from '../src/state';
import { DAY } from '../src/srs';
import { REGIONS } from '../src/data/climb';
import { COURSE } from '../src/data/course';

const fresh = () => ({ ...structuredClone(S), streak: 0, lastDay: '', days: [] as string[], charms: 0, charmUsed: '' });
const T0 = new Date(2026, 10, 2, 12).getTime(); // a Monday, noon

describe('streak charms', () => {
  it('earns a charm every 7 days, capped', () => {
    const s = fresh();
    for (let d = 0; d < 21; d++) markActive(s, T0 + d * DAY);
    expect(s.streak).toBe(21);
    expect(s.charms).toBe(MAX_CHARMS);
  });
  it('a charm saves one missed day', () => {
    const s = fresh();
    for (let d = 0; d < 7; d++) markActive(s, T0 + d * DAY);
    expect(s.charms).toBe(1);
    expect(currentStreak(s, T0 + 8 * DAY)).toBe(7); // missed day 7, still shown
    markActive(s, T0 + 8 * DAY);
    expect(s.streak).toBe(8); expect(s.charms).toBe(0); expect(s.charmUsed).toBe(dayKey(T0 + 8 * DAY));
  });
  it('without a charm a missed day resets', () => {
    const s = fresh();
    markActive(s, T0); markActive(s, T0 + DAY);
    expect(currentStreak(s, T0 + 3 * DAY)).toBe(0);
    markActive(s, T0 + 3 * DAY); expect(s.streak).toBe(1);
  });
});

describe('weekly streak', () => {
  it('counts good weeks (5 of 7 days)', () => {
    const s = fresh();
    for (const d of [0, 1, 2, 3, 4, 7, 8, 9, 11, 12]) markActive(s, T0 + d * DAY); // two good weeks
    expect(weekStreak(s, T0 + 13 * DAY)).toBe(2);
    expect(weekDots(s, T0 + 13 * DAY)).toEqual([true, true, true, false, true, true, false]);
    expect(weekStreak(s, T0 + 15 * DAY)).toBe(2); // new week not yet good, old ones still count
  });
});

describe('climb data', () => {
  it('has five regions N5..N1 and every built unit has a stamp and can-do list', () => {
    expect(REGIONS.map((r) => r.level)).toEqual(['N5', 'N4', 'N3', 'N2', 'N1']);
    expect(REGIONS[0].plan.length).toBe(12);
    for (const u of COURSE) { expect(u.stamp).toBeTruthy(); expect(u.cando.length).toBeGreaterThan(0); }
  });
});

import { heardWord } from '../src/speech';
import { grade as fsrs, newCard as nc, nextIv as niv, stageOf } from '../src/srs';
describe('speech + fsrs', () => {
  it('matches what the recognizer heard in kana, katakana or kanji', () => {
    expect(heardWord(['せんせい'], ['せんせい', '先生'])).toBe(true);
    expect(heardWord(['先生です。'], ['せんせい', '先生'])).toBe(true);
    expect(heardWord(['スシ'], ['すし'])).toBe(true);
    expect(heardWord(['がくせい'], ['せんせい', '先生'])).toBe(false);
  });
  it('grows intervals with good answers and moves from flip cards to typing to listening', () => {
    let c = nc('x', 0); let t = 0;
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) { seen.push(stageOf(c)); t = c.due; c = fsrs(c, 'good', t); }
    expect(seen[0]).toBe('flash'); expect(seen).toContain('type'); expect(seen.at(-1)).toBe('ear');
    expect(c.iv).toBeGreaterThan(30);
    const before = c.iv; const lapsed = fsrs(c, 'again', c.due);
    expect(lapsed.iv).toBe(0); expect(niv(lapsed, 'good', lapsed.due)).toBeLessThan(before);
  });
  it('converts old SM-2 cards', () => {
    const old = { id: 'o', due: 10 * 86_400_000, iv: 10, ease: 2.5, reps: 3, lapses: 0 };
    const g = fsrs(old, 'good', old.due);
    expect(g.iv).toBeGreaterThan(10); expect(g.s).toBeGreaterThan(0);
  });
});

import { logMistake, clearMistake, addXp } from '../src/state';
describe('journal + calendar', () => {
  it('counts mistakes, clears them, and logs XP per day', () => {
    const s = fresh() as typeof S; s.mistakes = {}; s.dayXp = {}; s.xp = 0;
    logMistake('h:さ', 'さ is sa', s, T0); logMistake('h:さ', '', s, T0 + 1);
    expect(s.mistakes['h:さ']).toMatchObject({ n: 2, note: 'さ is sa' });
    clearMistake('h:さ', s); expect(s.mistakes['h:さ']).toBeUndefined();
    addXp(10, s, T0); addXp(5, s, T0 + 1000);
    expect(s.xp).toBe(15); expect(s.dayXp[dayKey(T0)]).toBe(15);
  });
});
