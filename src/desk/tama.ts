// Tama, the Study Desk cat. Lives just above the bottom bar: wanders, naps, grooms, walks to where you tap,
// purrs when petted and can be carried around. Cheers when you finish something.
import { TAMA_SVG, ensureTamaDefs } from './tamaArt';

type St = 'sit' | 'walk' | 'sleep' | 'groom' | 'held' | 'happy';
export interface Tama { cheer: (text?: string) => void }

const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const W = 84;

/** Put Tama in `root` (position: relative), standing on top of `foot`. */
export function addTama(root: HTMLElement, foot: HTMLElement, opts: { cheer?: boolean; sleepy?: boolean } = {}): Tama {
  ensureTamaDefs();
  const el = document.createElement('div');
  el.className = 'cat'; el.tabIndex = 0; el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Tama the cat. Tap to pet, drag to carry, tap the screen to call.');
  el.innerHTML = `${TAMA_SVG}<span class="zz">z</span><span class="zz">z</span><span class="bub" hidden></span>`;
  root.appendChild(el);
  const bub = el.querySelector('.bub') as HTMLElement;
  let x = rnd(8, 120), dir = Math.random() < 0.5 ? -1 : 1, st: St = 'sit', until = 0, goal: number | null = null;
  let f = 0, tick = 0, lift = 0, bt = 0;
  let drag: { x: number; y: number; moved: boolean } | null = null;
  const maxX = () => Math.max(0, root.clientWidth - W);

  const place = () => { el.style.left = `${x}px`; el.style.bottom = `${foot.offsetHeight - 3 + lift}px`; el.classList.toggle('left', dir < 0); };
  const pose = (p: string) => { el.dataset.pose = p; };
  const set = (s: St, ms: number) => { st = s; until = Date.now() + ms; pose(s === 'walk' ? `walk${f}` : s === 'groom' ? 'groom0' : s); };
  const say = (t: string) => { bub.textContent = t; bub.hidden = false; clearTimeout(bt); bt = window.setTimeout(() => { bub.hidden = true; }, 1800); };
  const hop = () => { if (reduce()) return; el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); };
  const walkTo = (g: number) => { goal = g; dir = g > x ? 1 : -1; set('walk', 1e9); place(); };
  const pet = () => { const woke = st === 'sleep'; goal = null; set('happy', 2000); say(woke ? 'にゃ…？' : 'ごろごろ ♡'); };
  const cheer = (t = 'やった！') => { goal = null; set('happy', 2200); say(t); hop(); };

  set(opts.sleepy ? 'sleep' : 'sit', rnd(2000, 5000)); place();

  el.addEventListener('pointerdown', (e) => { e.stopPropagation(); drag = { x: e.clientX, y: e.clientY, moved: false }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) { drag.moved = true; set('held', 1e9); el.style.transition = 'none'; }
    if (drag.moved) {
      const r = root.getBoundingClientRect(), fh = foot.offsetHeight;
      x = Math.max(0, Math.min(r.width - W, e.clientX - r.left - W / 2));
      lift = Math.max(0, Math.min(r.height - fh - 110, r.bottom - e.clientY - fh - 56));
      place();
    }
  });
  const up = () => {
    const d = drag; drag = null; if (!d) return;
    if (!d.moved) return pet();
    el.style.transition = 'bottom .42s cubic-bezier(.55,0,1,.45)'; lift = 0; place();
    setTimeout(() => { el.style.transition = ''; set('sit', rnd(2500, 4000)); say('にゃっ！'); hop(); }, 430);
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pet(); } });
  // Tap anywhere on the page and Tama walks over, like a desktop pet chasing the pointer.
  root.addEventListener('pointerdown', (e) => {
    if (drag || st === 'held') return;
    const r = root.getBoundingClientRect(), g = Math.max(0, Math.min(r.width - W, e.clientX - r.left - W / 2));
    if (Math.abs(g - x) < 6) return;
    if (st === 'sleep') { if (Math.random() < 0.5) { say('にゃ？'); set('sit', 900); goal = g; } return; }
    walkTo(g);
  });

  const timer = window.setInterval(() => {
    if (!el.isConnected) { clearInterval(timer); return; }
    tick++;
    if (drag?.moved) return;
    const now = Date.now();
    if (st === 'walk') {
      if (reduce()) { x = goal ?? x; goal = null; set('sit', 4000); place(); return; }
      if (goal != null) dir = goal > x ? 1 : -1;
      x = Math.max(0, Math.min(maxX(), x + dir * 1.8));
      if (tick % 3 === 0) { f = (f + 1) % 4; pose(`walk${f}`); }
      if (goal == null || Math.abs(x - goal) < 2 || x <= 0 || x >= maxX()) { goal = null; set('sit', rnd(2500, 5000)); }
      place(); return;
    }
    if (st === 'groom' && tick % 6 === 0) pose(el.dataset.pose === 'groom0' ? 'groom1' : 'groom0');
    if (st === 'sit' && Math.random() < 0.008) { el.classList.add('blink'); setTimeout(() => el.classList.remove('blink'), 140); }
    if (now < until) return;
    if (goal != null) return walkTo(goal);
    if (reduce()) return set('sit', 5000);
    const r = Math.random();
    if (r < 0.4) walkTo(rnd(0, maxX()));
    else if (r < 0.6) set('sit', rnd(3000, 6000));
    else if (r < 0.82) set('sleep', rnd(8000, 15000));
    else set('groom', rnd(2400, 3400));
  }, 50);
  if (opts.cheer) setTimeout(() => cheer(), 700);
  return { cheer };
}
