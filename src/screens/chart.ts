import { CHART_ROWS, CHART_LABELS, COMBO_ROWS, chartChar, Script, KANA_BY_ID, Kana } from '../data/kana';
import { h, jp } from '../ui';
import { mastery } from '../progress';
import { strokeAnim, strokesOf } from '../strokes';
import { soundBtn } from '../games';
import { say } from '../audio';
import { startDrill } from './lesson';
import { showTab } from '../nav';

let script: Script = 'h';

export function chartTab(): HTMLElement {
  const cells = CHART_ROWS.flat().filter(Boolean).map((c) => KANA_BY_ID.get(`${script}:${chartChar(c!, script)}`)!);
  const learned = cells.filter((k) => mastery(k.id) !== 'n').length;
  return h('main', { class: 'screen' },
    h('div', { class: 'head', style: { display: 'block' } }, h('div', { class: 'eyebrow' }, 'Kana chart'), h('div', { class: 'title' }, `${learned} of ${cells.length} learned`)),
    h('div', { class: 'seg', role: 'tablist' }, (['h', 'k'] as Script[]).map((s) =>
      h('button', { class: s === script ? 'on' : '', role: 'tab', 'aria-selected': String(s === script), onclick: () => { script = s; showTab('chart'); } }, s === 'h' ? 'Hiragana' : 'Katakana'))),
    h('div', { class: 'legend' }, [['var(--pri)', 'Mastered'], ['var(--line)', 'Learning'], ['var(--muted-bg)', 'New']].map(([c, t]) => h('span', null, h('i', { style: { background: c } }), t))),
    h('div', { class: 'grid6' }, h('span'), ['a', 'i', 'u', 'e', 'o'].map((v) => h('span', { class: 'rowlab' }, v))),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, CHART_ROWS.map((row, ri) => h('div', { class: 'grid6' }, h('span', { class: 'rowlab' }, ri ? CHART_LABELS[ri] : ''), row.map(cell)))),
    h('div', { class: 'eyebrow', style: { marginTop: '8px' } }, 'Combos: a kana + small ya, yu or yo'),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, COMBO_ROWS.map((row) => h('div', { class: 'grid4' }, h('span', { class: 'rowlab' }, cell(row[0]).querySelector('small')?.textContent?.slice(0, -1) ?? ''), row.map(cell)))),
    h('p', { class: 'small' }, 'Tap any kana to hear it, watch its stroke order and practice writing it.'));
}

function cell(c: string | null): HTMLElement {
  if (!c) return h('div', { class: 'cell empty' });
  const k = KANA_BY_ID.get(`${script}:${chartChar(c, script)}`)!;
  return h('button', { class: `cell ${mastery(k.id)}`, 'aria-label': `${k.char} ${k.romaji}`, onclick: () => sheet(k) }, jp(k.char, 'kana'), h('small', null, k.romaji));
}

function sheet(k: Kana) {
  say(k.sound);
  const bg = h('div', { class: 'sheet-bg', onclick: (e: Event) => { if (e.target === bg) close(); } });
  const close = () => bg.remove();
  bg.append(h('div', { class: 'sheet', role: 'dialog', 'aria-label': k.char },
    h('div', { class: 'row' }, h('div', null, jp(k.char, 'bigkana'), h('div', { class: 'title', style: { color: 'var(--tint-ink)' } }, k.romaji)), strokesOf(k.char).length ? strokeAnim(k.char) : null),
    h('div', { class: 'row' }, soundBtn(k), h('div', { class: 'small' }, `${strokesOf(k.char).length} strokes`)),
    h('button', { class: 'btn', onclick: () => { close(); startDrill({ t: 'trace', k }, 'chart'); } }, 'Practice writing'),
    h('button', { class: 'btn ghost', onclick: close }, 'Close')));
  document.body.append(bg);
}
