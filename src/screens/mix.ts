// Daily Michi Mix: one button for a ~10 minute session. Review, then something new, then listening.
import { h, jp } from '../ui';
import { S, save, addXp, dueCards, markActive, dayKey } from '../state';
import { nextStop } from '../progress';
import { showFlow, showTab, setInterceptor } from '../nav';
import { session } from './review';
import { startStop, startListening } from './stops';
import { rj } from '../script';
import { sfx } from '../audio';

interface Step { name: string; detail: string; run: () => boolean }

function steps(): Step[] {
  const due = dueCards(), st = nextStop();
  return [
    { name: 'Review', detail: due.length ? `${Math.min(15, due.length)} cards due` : 'Nothing due, skipping', run: () => { const d = dueCards(); if (!d.length) return false; session(d.slice(0, 15)); return true; } },
    { name: 'Something new', detail: st ? rj(st.title) : 'Path complete', run: () => { const s = nextStop(); if (!s) return false; startStop(s); return true; } },
    { name: 'Listening', detail: 'Words and kana by ear', run: () => startListening() },
  ];
}

export function startMix() {
  const plan = steps();
  let i = 0;
  const stop = () => { setInterceptor(null); showTab('home'); };
  const between = () => {
    const done = i >= plan.length;
    if (done) {
      setInterceptor(null);
      const first = S.mixDay !== dayKey();
      if (first) { S.mixDay = dayKey(); addXp(20); markActive(); save(); }
      sfx('win');
      showFlow(h('div', { class: 'screen flow' },
        h('div', { class: 'center' }, h('div', { class: 'medal pop' }, jp('混')), h('div', { class: 'title', style: { marginTop: '14px' } }, 'Daily Mix done!'),
          h('div', { class: 'sub' }, first ? '+20 XP bonus. See you tomorrow.' : 'Bonus already earned today, but extra practice always helps.')),
        h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: () => showTab('home') }, 'Continue')), () => showTab('home'));
      return;
    }
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Stop the mix', onclick: stop }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, 'Daily Mix')),
      h('div', { class: 'mixsteps' }, plan.map((p, n) => h('div', { class: `mixstep ${n < i ? 'done' : n === i ? 'cur' : ''}` },
        h('span', { class: 'dot' }, n < i ? '✓' : String(n + 1)), h('span', null, h('b', null, p.name), h('small', null, p.detail))))),
      h('div', { style: { flex: '1' } }),
      h('button', { class: 'btn', onclick: go }, i === 0 ? 'Start' : `Next: ${plan[i].name}`),
      h('button', { class: 'btn ghost', onclick: stop }, 'Stop for today')), stop);
  };
  const go = () => {
    // Any return to a tab means the step finished (or was left): show the next step.
    setInterceptor(() => { i++; between(); return true; });
    while (i < plan.length) { if (plan[i].run()) return; i++; }
    setInterceptor(null); between();
  };
  between();
}
