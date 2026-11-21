/** Runs a list of cards one at a time: progress bar on top, one thing in the middle, one main button at the bottom. */
import { h, clear } from './ui';
import { sfx } from './audio';
import { grade, ungrade, S } from './store';

export interface Card {
  /** The item this card tests (k:あ, w:ie, p:ohayo). Graded on the first try only. */
  item?: string;
  retry?: boolean;
  build(run: Run, body: HTMLElement): void;
}
export interface Stats { asked: number; right: number; missed: string[] }
export interface Run {
  next(): void;
  /** Set the main button. */
  footer(label: string, fn: () => void, enabled?: boolean): void;
  enable(on: boolean): void;
  /** Show the result of an answer, record it, and bring a missed card back a little later. */
  answer(ok: boolean, msg: string | Node, o?: { undo?: boolean; extra?: Node }): void;
  redraw(): void;
}
let root: HTMLElement;
export const mount = (el: HTMLElement) => { root = el; };
/** True while the home (or welcome) screen is showing; used by the Android back button. */
export const nav = { home: false };
/** Swap the whole screen. */
export function show(...kids: (Node | null | false)[]) {
  const v = h('div', { class: 'view' }, ...kids);
  nav.home = false;
  clear(root); root.classList.toggle('motion', S.settings.motion); root.appendChild(v);
  return v;
}
export const fb = (ok: boolean, msg: string | Node) => { const d = h('div', { class: `fb ${ok ? 'ok' : 'no'}`, role: 'status' }); d.append(msg); return d; };

export function runSession(o: { cards: Card[]; start?: number; onPos?: (i: number) => void; onDone: (s: Stats) => void; onExit: () => void }) {
  const queue = [...o.cards], total = queue.length, stats: Stats = { asked: 0, right: 0, missed: [] };
  let i = Math.min(o.start ?? 0, Math.max(0, total - 1));
  const draw = () => {
    if (i >= queue.length) return o.onDone(stats);
    const card = queue[i], body = h('div', { class: 'pg' }), btn = h('button', { class: 'btn', disabled: true }, 'Next'), ft = h('div', { class: 'ft' }, btn);
    let action = () => {};
    btn.addEventListener('click', () => action());
    const done = Math.min(i, total), run: Run = {
      next() { i++; if (!queue[i]?.retry) o.onPos?.(Math.min(i, total)); draw(); },
      footer(label, fn, enabled = true) { btn.textContent = label; action = fn; btn.disabled = !enabled; },
      enable(on) { btn.disabled = !on; },
      redraw: draw,
      answer(ok, msg, opt = {}) {
        sfx(ok ? 'good' : 'bad');
        let clone: Card | null = null;
        if (card.item && !card.retry) { grade(card.item, ok); stats.asked++; if (ok) stats.right++; else if (!stats.missed.includes(card.item)) stats.missed.push(card.item); }
        if (!ok) { clone = { ...card, retry: true }; queue.splice(Math.min(i + 3, queue.length), 0, clone); }
        const box = fb(ok, msg);
        body.append(box);
        if (opt.extra) body.append(opt.extra);
        if (!ok && opt.undo) {
          body.append(h('button', { class: 'link c', onclick: () => {
            if (clone) queue.splice(queue.indexOf(clone), 1);
            if (card.item && !card.retry) { ungrade(card.item); stats.asked--; stats.missed = stats.missed.filter((m) => m !== card.item); }
            draw();
          } }, 'My finger slipped · undo'));
          body.append(h('p', { class: 'hint c' }, 'This one will come back in a moment.'));
        }
        run.footer('Next', run.next);
        box.scrollIntoView({ block: 'nearest' });
      },
    };
    show(
      h('div', { class: 'top' }, h('button', { class: 'x', 'aria-label': 'Close', onclick: o.onExit }, '✕'),
        h('div', { class: 'prog' }, h('i', { style: { width: `${(done / total) * 100}%` } })), h('span', { class: 'count' }, `${Math.min(i + 1, total)} / ${total}`)),
      body, ft);
    card.build(run, body);
  };
  draw();
}
