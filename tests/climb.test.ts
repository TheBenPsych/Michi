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
