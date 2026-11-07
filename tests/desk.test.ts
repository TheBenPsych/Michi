import { describe, it, expect } from 'vitest';
import { SECTIONS, DIALOGUE, PARTS } from '../src/desk/data';
import { KANA_BY_ID } from '../src/data/kana';
import { heardOk, overlap, norm } from '../src/desk/desk';

describe('Study Desk lesson 1', () => {
  it('every part has sections and every section id is unique', () => {
    for (const p of PARTS) expect(SECTIONS.some((s) => s.part === p.id)).toBe(true);
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(SECTIONS.length);
  });
  it('kana sections only use kana the app can draw', () => {
    for (const s of SECTIONS) if (s.kind === 'kana') for (const c of s.kana) expect(KANA_BY_ID.get(`h:${c}`), c).toBeTruthy();
  });
  it('answers are valid: right answer not among wrong ones, indexes in range', () => {
    for (const s of SECTIONS) {
      if (s.kind === 'grammar') for (const d of s.drills) { expect(d.wrong).not.toContain(d.jp); expect(d.key.length).toBeGreaterThan(0); }
      if (s.kind === 'role') for (const t of s.turns) expect(t.wrong).not.toContain(t.jp);
      if (s.kind === 'listen') for (const l of s.items) expect(l.a).toBeLessThan(l.options.length);
      if (s.kind === 'fill') for (const f of s.items) expect(f.choices).toContain(f.a);
      if (s.kind === 'reading') for (const q of s.qs) expect(q.a).toBeLessThan(q.options.length);
    }
    expect(DIALOGUE.length).toBeGreaterThan(5);
  });
  it('speech check accepts kanji from the recognizer and rejects wrong answers', () => {
    expect(norm('カナダ人です')).toBe('かなだじんです');
    expect(heardOk(['はい、カナダ人です'], ['カナダじん'], 'はい。カナダじんです。')).toBe(true);
    expect(heardOk(['7時半です'], ['しちじはん'], 'しちじはんです。')).toBe(true);
    expect(heardOk(['経済です'], ['れきし'], 'れきしです。')).toBe(false);
    expect(overlap('初めまして春人です', 'はじめまして。はるとです。')).toBeGreaterThan(0.6);
  });
});
