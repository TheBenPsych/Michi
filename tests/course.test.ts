import { describe, it, expect, beforeEach } from 'vitest';
import { COURSE, ALL_STOPS, WORDS, gloss } from '../src/data/course';
import { LESSONS } from '../src/data/kana';
import { hasArt } from '../src/art';
import { S } from '../src/state';
import { stopUnlocked, stopDone, nextStop, courseUnitUnlocked } from '../src/progress';
import { rj, rjTokens, readable, ALL_KANA } from '../src/script';

describe('course content', () => {
  it('kana stops point at real kana lessons, and every kana lesson is on the path once', () => {
    const kana = ALL_STOPS.filter((s) => s.kind === 'kana').map((s) => s.id);
    for (const id of kana) expect(LESSONS.some((l) => l.id === id), id).toBe(true);
    expect(new Set(kana).size).toBe(LESSONS.length);
    expect(new Set(ALL_STOPS.map((s) => s.id)).size).toBe(ALL_STOPS.length);
  });
  it('every word, panel and scene has a drawing', () => {
    for (const w of WORDS.values()) expect(hasArt(w.art), w.id).toBe(true);
    for (const s of ALL_STOPS) {
      if (s.kind === 'story') for (const p of s.story.panels) expect(hasArt(p.art), p.art).toBe(true);
      if (s.kind === 'mission') expect(hasArt(s.m.art)).toBe(true);
      if (s.kind === 'culture') expect(hasArt(s.c.art)).toBe(true);
    }
  });
  it('every tappable story word has a meaning', () => {
    for (const s of ALL_STOPS) if (s.kind === 'story') for (const p of s.story.panels) for (const l of p.lines)
      for (const t of l.tokens) if (typeof t !== 'string') expect(gloss(t[1]).en, t[1]).toBeTruthy();
  });
  it('grammar drills and missions are well formed', () => {
    for (const s of ALL_STOPS) {
      if (s.kind === 'grammar') for (const d of s.g.drills) {
        if (d.t === 'choose') expect(d.options[d.a]).toBeTruthy();
        if (d.t === 'fix') expect(d.tokens[d.wrong]).not.toBe(d.fix);
        if (d.t === 'tiles') for (const x of d.extra) expect(d.answer).not.toContain(x);
      }
      if (s.kind === 'mission') for (const st of s.m.steps) if ('choices' in st) expect(st.choices.filter((c) => c.ok).length).toBe(1);
    }
  });
});

describe('course unlocking', () => {
  beforeEach(() => { S.done = {}; S.bosses = {}; S.stamps = {}; });
  const u1 = COURSE[0].parts.flatMap((p) => p.stops);
  it('opens stops one at a time', () => {
    expect(nextStop()).toBe(u1[0]);
    expect(stopUnlocked(u1[1])).toBe(false);
    S.done[u1[0].id] = 100;
    expect(stopUnlocked(u1[1])).toBe(true);
    expect(courseUnitUnlocked(COURSE[1])).toBe(false);
  });
  it('the kana boss skips kana stops, and the unit boss unlocks the next unit', () => {
    S.bosses.hira = true;
    expect(stopDone(u1[0])).toBe(true);
    expect(nextStop()).toBe(u1.find((s) => s.kind !== 'kana'));
    S.stamps.u1 = true;
    expect(courseUnitUnlocked(COURSE[1])).toBe(true);
    expect(stopUnlocked(u1[5])).toBe(true);
  });
});

describe('pacing: no kana before it is taught', () => {
  // Walk Unit 1 in order, collecting the kana taught so far.
  const steps: { s: (typeof ALL_STOPS)[number]; known: Set<string> }[] = [];
  const known = new Set<string>();
  for (const s of COURSE[0].parts.flatMap((p) => p.stops)) {
    if (s.kind === 'kana') LESSONS.find((l) => l.id === s.id)!.kana.forEach((k) => [...k.char].forEach((c) => known.add(c)));
    else steps.push({ s, known: new Set(known) });
  }
  const unknownIn = (text: string, k: Set<string>) => [...text].filter((c) => ALL_KANA.has(c) && !k.has(c) && !'ゃゅょっ'.includes(c));
  it('"Read it" stops only use kana taught before them', () => {
    for (const { s, known: k } of steps) if (s.kind === 'words' && s.id.startsWith('u1-kw')) for (const w of s.words) expect(readable(w.kana, k), `${s.id} ${w.kana}`).toBe(true);
  });
  it('everything shown on a stop is in learned kana or romaji', () => {
    for (const { s, known: k } of steps) {
      const texts: string[] = [];
      if (s.kind === 'story') s.story.panels.forEach((p) => p.lines.forEach((l) => texts.push(rjTokens(l.tokens.map((t) => (typeof t === 'string' ? t : t[0])), k).join(''))));
      if (s.kind === 'grammar') texts.push(...[s.g.title, ...s.g.pattern, ...s.g.points, ...s.g.examples.map((e) => e.jp)].map((t) => rj(t, k)));
      if (s.kind === 'mission') s.m.steps.forEach((st) => texts.push(...('npc' in st ? [st.npc] : st.choices.flatMap((c) => [c.jp, c.why ?? ''])).map((t) => rj(t, k))));
      if (s.kind === 'culture') texts.push(...[s.c.title, s.c.jp, s.c.text].map((t) => rj(t, k)));
      if (s.kind === 'words') texts.push(...s.words.flatMap((w) => [readable(w.kana, k) ? w.kana : w.romaji, rj(w.note ?? '', k)]));
      for (const t of texts) expect(unknownIn(t, k), `${s.id}: ${t}`).toEqual([]);
    }
  });
  it('romaji reads naturally', () => {
    const none = new Set<string>();
    expect(rj('わたしは がくせいです。', none)).toBe('Watashi wa gakusei desu.');
    expect(rj('メイさんの せんこうは なんですか。', none)).toBe('Mei-san no senkou wa nan desu ka.');
    expect(rj('こんにちは！', none)).toBe('Konnichiwa!');
    expect(rjTokens(['レオ', 'さん', 'は', ' ', 'がくせい', 'です', 'か', '。'], none).join('')).toBe('Leo-san wa gakusei desu ka.');
    expect(rj('わたしは がくせいです。', new Set([...'わたしはがくせいで'].concat('す')))).toBe('わたしは がくせいです。');
  });
});
