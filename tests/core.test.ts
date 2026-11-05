import { describe, it, expect } from 'vitest';
import { UNITS, ALL_KANA } from '../src/data/kana';
import { buildLesson, buildBoss, isAnswer, hiraOf } from '../src/lessonGen';
import { grade, newCard, nextIv, DAY } from '../src/srs';
import { markActive, levelOf, levelStart, dayKey } from '../src/state';
import strokes from '../src/data/strokes.json';

let seed = 1; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('data', () => {
  it('has 2 units, 13 lessons each, unique ids', () => {
    expect(UNITS.map((u) => u.lessons.length)).toEqual([13, 13]);
    expect(new Set(ALL_KANA.map((k) => k.id)).size).toBe(ALL_KANA.length);
    expect(ALL_KANA.length).toBe(2 * (46 + 25 + 33));
  });
  it('has stroke data for every single kana', () => {
    for (const k of ALL_KANA) if (k.char.length === 1) expect((strokes as Record<string, string[]>)[k.char], k.char).toBeTruthy();
  });
  it('katakana maps back to hiragana', () => expect(hiraOf(UNITS[1].lessons[1].kana[0])?.char).toBe('か'));
});

describe('lessons', () => {
  it('every lesson builds valid questions', () => {
    for (const u of UNITS) u.lessons.forEach((l, i) => {
      const known = u.lessons.slice(0, i).flatMap((x) => x.kana);
      const qs = buildLesson(l, known, rng);
      expect(qs.filter((q) => q.t === 'intro').length).toBe(l.kana.length);
      expect(qs.some((q) => q.t === 'match')).toBe(true);
      for (const q of qs) {
        if (q.t === 'pickKana' || q.t === 'listen') {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.options.filter((o) => o.sound === q.k.sound).length).toBe(1); // no homophone ambiguity
        }
        if (q.t === 'pickRomaji') expect(q.options.filter((o) => o === q.k.romaji).length).toBe(1);
      }
    });
  });
  it('boss has 20 questions', () => expect(buildBoss(UNITS[0], rng).length).toBe(20));
  it('accepts alternate spellings', () => {
    const shi = ALL_KANA.find((k) => k.char === 'し')!;
    expect(isAnswer(shi, ' SI ')).toBe(true);
    expect(isAnswer(shi, 'shi')).toBe(true);
    expect(isAnswer(shi, 'su')).toBe(false);
  });
});

describe('srs + progress', () => {
  it('schedules a new card with FSRS (1m / 1d / 4d / 14d)', () => {
    const c = newCard('x', 0); c.reps = 0;
    expect(['again', 'hard', 'good', 'easy'].map((g) => nextIv(c, g as never))).toEqual([0, 1, 4, 14]);
    const g = grade(c, 'good', 0);
    expect(g.due).toBe(4 * DAY);
    expect(nextIv(g, 'good')).toBeGreaterThan(3);
  });
  it('streak counts consecutive days and resets after a gap', () => {
    const s = { streak: 0, lastDay: '' } as unknown as NonNullable<Parameters<typeof markActive>[0]>;
    const t = new Date(2026, 0, 10, 12).getTime();
    expect(markActive(s, t)).toBe(1);
    expect(markActive(s, t + 3600e3)).toBe(1);
    expect(markActive(s, t + DAY)).toBe(2);
    expect(markActive(s, t + 3 * DAY)).toBe(1);
    expect(s.lastDay).toBe(dayKey(t + 3 * DAY));
  });
  it('levels', () => { expect([0, 299, 300, 900, 1799, 1800].map(levelOf)).toEqual([1, 1, 2, 3, 3, 4]); expect(levelStart(3)).toBe(900); });
});

import { speakable } from '../src/audio';
describe('speech', () => {
  it('ends single kana with a full stop so they are not clipped', () => {
    expect(speakable('か')).toBe('か。');
    expect(speakable('キャ')).toBe('キャ。');
    expect(speakable('こんにちは、みち です。')).toBe('こんにちは、みち です。');
  });
});
