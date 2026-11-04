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
  settings: { theme: Theme; sfx: boolean; rate: number; romaji: boolean; voiceF: string; voiceM: string };
}

const KEY = 'michi:v1';
const fresh = (): State => ({ v: 1, xp: 0, streak: 0, lastDay: '', bestCombo: 0, done: {}, bosses: {}, cards: {}, stamps: {}, album: [], settings: { theme: 'auto', sfx: true, rate: 0.8, romaji: true, voiceF: '', voiceM: '' } });

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

/** Streak shown to the user: broken if the last activity was before yesterday. */
export function currentStreak(s = S, now = Date.now()): number {
  return s.lastDay === dayKey(now) || s.lastDay === dayKey(now - DAY) ? s.streak : 0;
}

/** Call when a lesson or review finishes. Returns the new streak. */
export function markActive(s = S, now = Date.now()): number {
  const today = dayKey(now);
  if (s.lastDay !== today) {
    s.streak = s.lastDay === dayKey(now - DAY) ? s.streak + 1 : 1;
    s.lastDay = today;
  }
  return s.streak;
}

/** Level n starts at 150*n*(n-1) XP: 0, 300, 900, 1800... */
export const levelOf = (xp: number) => Math.floor((1 + Math.sqrt(1 + (8 * xp) / 300)) / 2);
export const levelStart = (lv: number) => 150 * lv * (lv - 1);

export function addCards(ids: string[], now = Date.now(), firstIvDays = 1, s = S) {
  for (const id of ids) if (!s.cards[id]) s.cards[id] = newCard(id, now, firstIvDays);
}
export const dueCards = (now = Date.now(), s = S) => Object.values(s.cards).filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
