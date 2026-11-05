import { h, clear } from './ui';
import { dueCards } from './state';

export type Tab = 'home' | 'review' | 'chart' | 'me';
type Render = () => HTMLElement;
const tabs: Partial<Record<Tab, Render>> = {};
let current: Tab = 'home';
let backHandler: (() => void) | null = null;

/** While set (by the Daily Mix), going back to a tab shows the mix's next step instead. */
let interceptor: ((t: Tab) => boolean) | null = null;
export const setInterceptor = (f: ((t: Tab) => boolean) | null) => { interceptor = f; };

export const registerTab = (t: Tab, r: Render) => { tabs[t] = r; };
const root = () => document.getElementById('app')!;

const ICONS: [Tab, string, string][] = [['home', '道', 'Learn'], ['review', '復', 'Review'], ['chart', '表', 'Chart'], ['me', '私', 'Me']];

export function showTab(t: Tab = current) {
  if (interceptor && interceptor(t)) return;
  current = t; backHandler = null;
  const due = dueCards().length;
  const screen = tabs[t]!();
  const bar = h('nav', { class: 'tabs', 'aria-label': 'Main' }, ICONS.map(([id, jp, label]) =>
    h('button', { class: id === t ? 'on' : '', 'aria-current': id === t ? 'page' : null, onclick: () => showTab(id) },
      h('span', { class: 'jp', 'aria-hidden': 'true' }, jp), label,
      id === 'review' && due ? h('span', { class: 'badge' }, String(due)) : null)));
  clear(root()).append(screen, bar);
  screen.scrollTop = 0;
}

/** Full-screen flow (lesson, review). `onBack` runs for the Android back button. */
export function showFlow(el: HTMLElement, onBack: () => void) {
  backHandler = onBack;
  clear(root()).append(el);
}
export const isFlow = () => !!backHandler;
export const currentTab = () => current;
export function handleBack(): boolean {
  if (backHandler) { backHandler(); return true; }
  if (current !== 'home') { showTab('home'); return true; }
  return false;
}
