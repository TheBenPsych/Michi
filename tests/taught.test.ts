import { describe, it, expect } from 'vitest';
import { COURSE, Stop } from '../src/data/course';

// Review finding #1: nothing may be used before it is taught.
// Walk the whole path in order. Each words stop teaches its words, each grammar stop its grammar words.
// Every Japanese line a learner meets must split into pieces taught so far.
const NAMES = ['レオ', 'ゆき', 'メイ', 'ベン', 'やまだ', 'みち'];
const strip = (t: string) => t.replace(/「|」|[。、！？\s＿…〜・,.!?"']/g, '').replace(/[A-Za-z0-9()=:;+\-]+/g, '|');

/** True when the text (kana only) can be cut into known pieces. Returns the part it could not explain. */
function unexplained(text: string, pieces: Set<string>): string | null {
  for (const chunk of strip(text).split('|').filter(Boolean)) {
    const ok: boolean[] = [true];
    for (let i = 1; i <= chunk.length; i++) { ok[i] = false; for (const p of pieces) if (p.length <= i && ok[i - p.length] && chunk.slice(i - p.length, i) === p) { ok[i] = true; break; } }
    if (!ok[chunk.length]) return chunk;
  }
  return null;
}
const jpOnly = (t: string) => (/[぀-ヿ]/.test(t) ? [t] : []);
/** Kana inside 「」 is about the kana itself (shown with romaji), so it is not "using" a word. */
const dropQuoted = (t: string) => t.replace(/「[^」]*」/g, '');

function textsOf(s: Stop): string[] {
  const out: string[] = [];
  const line = (ts: (string | [string, string])[]) => ts.map((t) => (typeof t === 'string' ? t : t[0])).join('');
  if (s.kind === 'words') s.words.forEach((w) => { if (w.ex) out.push(w.ex.jp); });
  if (s.kind === 'grammar') {
    out.push(...s.g.examples.map((e) => e.jp), ...s.g.points.map(dropQuoted).flatMap(jpOnly));
    for (const d of s.g.drills) {
      if (d.t === 'tiles') out.push(...d.answer, ...d.extra);
      if (d.t === 'choose') out.push(...jpOnly(d.prompt), ...d.options.flatMap(jpOnly));
      if (d.t === 'fix') out.push(...d.tokens, d.fix);
    }
  }
  if (s.kind === 'story' || s.kind === 'speak') s.story.panels.forEach((p) => p.lines.forEach((l) => out.push(line(l.tokens))));
  if (s.kind === 'speak') out.push(...s.say.map((l) => l.jp));
  if (s.kind === 'mission') s.m.steps.forEach((st) => ('npc' in st ? out.push(st.npc) : st.choices.forEach((c) => out.push(c.jp, ...jpOnly(dropQuoted(c.why ?? ''))))));
  if (s.kind === 'culture') out.push(...jpOnly(dropQuoted(s.c.text)));
  return out;
}

describe('taught before used', () => {
  it('every line uses only words and grammar taught earlier on the path', () => {
    const pieces = new Set<string>(NAMES);
    const problems: string[] = [];
    for (const u of COURSE) for (const p of u.parts) for (const s of p.stops) {
      if (s.kind === 'words') s.words.forEach((w) => pieces.add(w.kana.replace('〜', '')));
      if (s.kind === 'grammar') (s.g.teaches ?? []).forEach((t) => pieces.add(t));
      for (const t of textsOf(s)) { const bad = unexplained(t, pieces); if (bad) problems.push(`${s.id}: "${t}" (can't explain "${bad}")`); }
    }
    expect(problems).toEqual([]);
  });
  it('every chapter ends by talking, then a checkpoint', () => {
    for (const u of COURSE) for (const p of u.parts) {
      expect(p.stops.at(-1)!.kind, `${u.id} ${p.title}`).toBe('checkpoint');
      expect(['speak', 'mission'], `${u.id} ${p.title}`).toContain(p.stops.at(-2)!.kind);
    }
  });
  it('every unit has a unit test, so its stamp can be earned', () => {
    for (const u of COURSE) expect(u.boss, u.id).toBeTruthy();
  });
});
