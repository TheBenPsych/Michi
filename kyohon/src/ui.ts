type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, unknown> | null;

/** Tiny DOM builder: h('button', { class: 'btn', onclick: fn }, 'Go') */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Attrs, ...kids: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, kids);
  return el;
}
export function append(el: Node, kids: Child[]) {
  for (const c of kids.flat(9 as 1)) if (c != null && c !== false) el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
}
export const svgEl = (tag: string, attrs: Record<string, string | number>) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
export const clear = (el: Element) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const jp = (text: string, cls = '') => h('span', { class: `jp ${cls}`, lang: 'ja' }, text);
export const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);
export const bar = (fraction: number, cls = '') => h('div', { class: `bar ${cls}` }, h('div', { style: { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` } }));

/** Line icons used across the app (24px grid, stroke = currentColor). */
const PATHS: Record<string, string> = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
  ear: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
  redo: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z"/><path d="M12 6v14"/>',
  cards: '<rect x="3" y="7" width="13" height="14" rx="3"/><path d="M8 3h10a3 3 0 0 1 3 3v11"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
};
export function ic(name: keyof typeof PATHS | string, cls = 'ico'): HTMLElement {
  const s = document.createElement('span');
  s.style.lineHeight = '0';
  s.innerHTML = `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] ?? ''}</svg>`;
  return s;
}
