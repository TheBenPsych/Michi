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
