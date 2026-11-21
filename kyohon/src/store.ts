/** Everything the app remembers, kept on the phone only (localStorage). */
export interface Item { box: number; due: number; seen: number; wrong: number }
export interface Settings { theme: 'auto' | 'light' | 'dark'; sfx: boolean; motion: boolean; speech: boolean; strict: boolean; warm: 3 | 5 | 10; text: 0 | 1 | 2 }
export interface State {
  started: boolean;
  /** Steps of Chapter 1 finished (0 to 5). */
  step: number;
  /** Where the learner stopped inside the current step. */
  pos: number;
  /** Kana the learner has been taught (or showed they know in the level check). */
  kana: string[];
  /** Kana known when the current step was started, so a resumed step is rebuilt the same way. */
  base: string[];
  items: Record<string, Item>;
  warmDay: number;
  settings: Settings;
}
const KEY = 'kyohon.v1';
const fresh = (): State => ({ started: false, step: 0, pos: 0, kana: [], base: [], items: {}, warmDay: 0, settings: { theme: 'auto', sfx: true, motion: true, speech: true, strict: false, warm: 3, text: 0 } });
function load(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw) as State; return { ...fresh(), ...s, settings: { ...fresh().settings, ...s.settings } }; } } catch { /* first run */ }
  return fresh();
}
export const S: State = load();
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage full or blocked */ } };
export const reset = () => { Object.assign(S, fresh()); save(); };

export const DAY = 86400000;
export const today = (now = Date.now()) => Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / DAY);
const GAPS = [1, 2, 4, 7, 14, 30];

export const knows = (k: string) => S.kana.includes(k);
export function learnKana(ks: string[]) { for (const k of ks) { if (!S.kana.includes(k)) S.kana.push(k); S.items[`k:${k}`] ||= { box: 0, due: today() + 1, seen: 0, wrong: 0 }; } save(); }
export function meet(id: string) { S.items[id] ||= { box: 0, due: today() + 1, seen: 0, wrong: 0 }; save(); }
/** Record a first-try answer. Right answers push the item further out; wrong ones bring it back tomorrow. */
export function grade(id: string, ok: boolean, now = today()) {
  const it = (S.items[id] ||= { box: 0, due: now + 1, seen: 0, wrong: 0 });
  it.seen++;
  if (ok) { it.due = now + GAPS[Math.min(it.box, GAPS.length - 1)]; it.box = Math.min(it.box + 1, GAPS.length - 1); }
  else { it.wrong++; it.box = 0; it.due = now + 1; }
  save();
}
export function ungrade(id: string) { const it = S.items[id]; if (it && it.wrong > 0) { it.wrong--; save(); } }
/** Items to bring back today, weakest first, never more than the cap (no backlog is ever shown). */
export function dueItems(cap: number, now = today()): string[] {
  return Object.entries(S.items).filter(([, it]) => it.due <= now)
    .sort((a, b) => b[1].wrong - a[1].wrong || a[1].due - b[1].due || a[1].box - b[1].box).slice(0, cap).map(([id]) => id);
}
export const weak = (id: string) => { const it = S.items[id]; return !!it && it.wrong > 0 && it.box < 2; };
