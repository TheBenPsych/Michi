import { describe, it, expect } from 'vitest';
import { L, WORDS, PHRASES, STEP_KANA, STEPS } from '../src/data/content';
import { ALL, ROWS } from '../src/data/kana';
import strokes from '../src/data/strokes.json';
import { romajiOk } from '../src/cards';
import { judge } from '../src/pad';
import { grade, dueItems, S, today } from '../src/store';

const CLIPS = import.meta.glob('../public/voice/*.mp3', { query: '?url' });

describe('pacing: nothing is shown before it is taught', () => {
  it('every word uses only kana taught by the step that introduces it', () => {
    for (const w of WORDS) for (const k of L[w.id].ja) expect(STEP_KANA[w.step - 1], `${L[w.id].ja} in step ${w.step}`).toContain(k);
  });
  it('Chapter 1 teaches ten kana in two rows of five', () => {
    expect([...STEP_KANA[STEPS.length - 1]]).toHaveLength(10);
    expect(STEP_KANA[1]).toBe(ROWS[0].map((k) => k.k).join(''));
  });
});
describe('content is complete', () => {
  it('every line has its recordings', () => {
    for (const [id, l] of Object.entries(L)) for (const v of l.voices) expect(Object.keys(CLIPS), `${id}-${v}`).toContain(`../public/voice/${id}-${v}.mp3`);
  });
  it('every phrase and word has a line, and romaji chunks cover the Japanese', () => {
    for (const x of [...WORDS, ...PHRASES]) { expect(L[x.id]).toBeTruthy(); expect(L[x.id].chunks.map((c) => c[0]).join('')).toBe(L[x.id].ja); }
  });
  it('all 46 hiragana have stroke data, a sound and a hook', () => {
    expect(ALL).toHaveLength(46);
    for (const k of ALL) { expect((strokes as Record<string, string[]>)[k.k]?.length, k.k).toBeGreaterThan(0); expect(k.hook.length).toBeGreaterThan(8); }
    for (const k of ALL) if (k.like) expect(ALL.some((x) => x.k === k.like)).toBe(true);
  });
});
describe('answer checking', () => {
  it('accepts common romaji spellings', () => {
    expect(romajiOk('いこ', 'i ko')).toBe(true); expect(romajiOk('いこ', 'IKO')).toBe(true); expect(romajiOk('し', 'si')).toBe(true);
    expect(romajiOk('つ', 'tsu')).toBe(true); expect(romajiOk('いこ', 'ko i')).toBe(false); expect(romajiOk('あ', 'o')).toBe(false);
  });
  it('judges handwriting by count, direction and shape', () => {
    const line = (x0: number, y0: number, x1: number, y1: number) => Array.from({ length: 16 }, (_, i) => [x0 + ((x1 - x0) * i) / 15, y0 + ((y1 - y0) * i) / 15] as [number, number]);
    const model = [line(20, 20, 20, 90), line(70, 30, 80, 70)];
    expect(judge([line(22, 22, 21, 88), line(68, 32, 79, 72)], model).ok).toBe(true);
    expect(judge([line(22, 22, 21, 88)], model).msg).toMatch(/2 strokes/);
    expect(judge([line(20, 90, 20, 20), line(70, 30, 80, 70)], model).msg).toMatch(/other way/);
    expect(judge([line(60, 20, 60, 90), line(70, 30, 80, 70)], model).ok).toBe(false);
  });
});
describe('review schedule', () => {
  it('brings missed items back first and never more than the cap', () => {
    const t = today();
    for (let i = 0; i < 30; i++) S.items[`k:x${i}`] = { box: 0, due: t - 9, seen: 1, wrong: 0 };
    grade('k:x7', false, t - 1);
    const due = dueItems(12, t);
    expect(due).toHaveLength(12); expect(due[0]).toBe('k:x7');
  });
});
