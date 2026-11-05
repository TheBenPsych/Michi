import { Card, newCard, DAY } from './srs';

export type Theme = 'auto' | 'light' | 'dark';
export interface State {
  v: 1;
  xp: number;
  streak: number;
  lastDay: string;          // YYYY-MM-DD of last activity
  bestCombo: number;
  done: Record<string, number>;      // lessonId -> best accuracy %
  bosses: Record<string, boolean>;   // unitId -> beaten
  cards: Record<string, Card>;
  stamps: Record<string, boolean>;   // course unit id -> unit boss beaten
  album: string[];                   // collected culture card ids
  gates: Record<string, boolean>;    // region id -> rank gate passed
  days: string[];                    // YYYY-MM-DD days with activity (recent ones)
  charms: number;                    // omamori: each one saves the streak for one missed day
  charmUsed: string;                 // day a charm last saved the streak (to show a note once)
  settings: { theme: Theme; sfx: boolean; rate: number; romaji: boolean; voiceF: string; voiceM: string; calm: boolean };
}

const KEY = 'michi:v1';
const fresh = (): State => ({ v: 1, xp: 0, streak: 0, lastDay: '', bestCombo: 0, done: {}, bosses: {}, cards: {}, stamps: {}, album: [], gates: {}, days: [], charms: 0, charmUsed: '', settings: { theme: 'auto', sfx: true, rate: 0.8, romaji: true, voiceF: '', voiceM: '', calm: false } });

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); return { ...fresh(), ...s, settings: { ...fresh().settings, ...s.settings } }; }
  } catch { /* corrupted or unavailable: start fresh */ }
  return fresh();
}

export let S: State = load();
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* ignore */ } };
export const resetAll = () => { S = fresh(); save(); };

export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export const MAX_CHARMS = 2;
/** Streak shown to the user. One missed day is forgiven while you hold an omamori charm. */
export function currentStreak(s = S, now = Date.now()): number {
  if (s.lastDay === dayKey(now) || s.lastDay === dayKey(now - DAY)) return s.streak;
  return s.lastDay === dayKey(now - 2 * DAY) && s.charms > 0 ? s.streak : 0;
}

/** Call when a lesson or review finishes. Returns the new streak. */
export function markActive(s = S, now = Date.now()): number {
  const today = dayKey(now);
  s.days ??= []; s.charms ??= 0;
  if (s.lastDay !== today) {
    if (s.lastDay === dayKey(now - DAY)) s.streak++;
    else if (s.lastDay === dayKey(now - 2 * DAY) && s.charms > 0) { s.charms--; s.charmUsed = today; s.streak++; }
    else s.streak = 1;
    s.lastDay = today;
    // Every 7 days in a row earns a charm.
    if (s.streak % 7 === 0) s.charms = Math.min(MAX_CHARMS, s.charms + 1);
  }
  if (!s.days.includes(today)) s.days = [...s.days, today].slice(-120);
  return s.streak;
}

/** Monday of the week containing `t`, as a day key. */
const weekStart = (t: number) => { const d = new Date(t); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
/** Which days (Mon..Sun) of this week had activity. */
export function weekDots(s = S, now = Date.now()): boolean[] {
  const m = weekStart(now);
  return Array.from({ length: 7 }, (_, i) => s.days.includes(dayKey(m + i * DAY)));
}
export const GOOD_WEEK = 5;
/** Good weeks (5+ active days) in a row, counting this week only once it is good. */
export function weekStreak(s = S, now = Date.now()): number {
  const days = new Set(s.days);
  const count = (start: number) => Array.from({ length: 7 }, (_, i) => days.has(dayKey(start + i * DAY))).filter(Boolean).length;
  let w = weekStart(now), n = count(w) >= GOOD_WEEK ? 1 : 0;
  for (;;) { w -= 7 * DAY; if (count(w) >= GOOD_WEEK) n++; else break; }
  return n;
}

/** Level n starts at 150*n*(n-1) XP: 0, 300, 900, 1800... */
export const levelOf = (xp: number) => Math.floor((1 + Math.sqrt(1 + (8 * xp) / 300)) / 2);
export const levelStart = (lv: number) => 150 * lv * (lv - 1);

export function addCards(ids: string[], now = Date.now(), firstIvDays = 1, s = S) {
  for (const id of ids) if (!s.cards[id]) s.cards[id] = newCard(id, now, firstIvDays);
}
export const dueCards = (now = Date.now(), s = S) => Object.values(s.cards).filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
