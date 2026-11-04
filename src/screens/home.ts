import { UNITS } from '../data/kana';
import { COURSE, CourseUnit, Stop } from '../data/course';
import { h, jp, bar } from '../ui';
import { art } from '../art';
import { S, currentStreak, dueCards, levelOf } from '../state';
import { stopDone, stopUnlocked, nextStop, currentUnit, courseUnitDone, courseUnitUnlocked } from '../progress';
import { startBoss } from './lesson';
import { startStop, startUnitBoss } from './stops';
import { showTab } from '../nav';

export function header() {
  const st = currentStreak();
  return h('div', { class: 'head' },
    h('div', { class: 'logo' }, jp('道'), ' Michi'),
    h('div', { class: 'chips' },
      h('div', { class: 'chip lv' }, `Lv ${levelOf(S.xp)}`),
      h('div', { class: 'chip st' }, `${st} day${st === 1 ? '' : 's'}`),
      h('div', { class: 'chip xp' }, `${S.xp} XP`)));
}

let viewing: string | null = null;
const openParts = new Set<string>();
const ICON: Record<Stop['kind'], string> = { kana: '', story: '話', words: '語', grammar: '文', mission: '任', culture: '化' };
const icon = (s: Stop) => (s.kind === 'kana' ? [...s.title.replace('Kana: ', '')][0] : ICON[s.kind]);

function stopRow(s: Stop, next: Stop | undefined) {
  const done = stopDone(s), open = stopUnlocked(s), cur = s === next;
  const sub = done ? (s.id in S.done ? `Done · best ${S.done[s.id]}%` : 'Skipped with the kana boss') : cur ? 'Up next · about 3 min' : open ? 'Ready' : 'Locked';
  return h('button', { class: `stop ${done ? 'done' : ''} ${cur ? 'cur' : ''} ${open ? '' : 'lock'} k-${s.kind}`, disabled: !open, onclick: () => startStop(s) },
    h('span', { class: 'ic jp', 'aria-hidden': 'true' }, done ? '✓' : icon(s)),
    h('span', { class: 't' }, h('b', null, s.title), h('small', null, sub)),
    cur ? h('span', { class: 'go' }, 'Start') : null);
}

function unitView(u: CourseUnit) {
  const next = nextStop();
  const stops = u.parts.flatMap((p) => p.stops);
  const doneN = stops.filter(stopDone).length;
  const kanaBoss = UNITS.find((x) => x.id === u.kanaUnit)!;
  return [
    h('div', null,
      h('div', { class: 'eyebrow' }, `N5 course · Unit ${u.n} of 12`),
      h('div', { class: 'title jp' }, u.jp),
      h('div', { class: 'sub', style: { marginTop: '2px' } }, `${u.title} · with ${u.kanaUnit === 'hira' ? 'hiragana' : 'katakana'}`),
      h('div', { style: { marginTop: '10px' } }, bar(doneN / stops.length))),
    u.soon ? h('div', { class: 'note' }, h('b', null, 'Coming soon'), h('p', null, u.soon)) : null,
    ...u.parts.map((p, pi) => {
      const key = `${u.id}-${pi}`, pd = p.stops.filter(stopDone).length;
      const isOpen = openParts.has(key) || p.stops.includes(next!) || (u.parts.length === 1);
      return h('section', { class: `part ${isOpen ? 'open' : ''}` },
        h('button', { class: 'phead', 'aria-expanded': String(isOpen), onclick: () => { if (openParts.has(key)) openParts.delete(key); else openParts.add(key); showTab('home'); } },
          h('b', null, `Part ${pi + 1} · ${p.title}`), h('span', null, `${pd} of ${p.stops.length}`)),
        isOpen ? h('div', { class: 'stops' }, p.stops.map((s) => stopRow(s, next))) : null);
    }),
    S.bosses[kanaBoss.id] ? null : h('button', { class: 'boss row', onclick: () => startBoss(kanaBoss) },
      h('div', null, h('div', { class: 'eyebrow' }, `Already know ${u.kanaUnit === 'hira' ? 'hiragana' : 'katakana'}?`),
        h('div', { style: { fontSize: '15px', fontWeight: '800' } }, `Beat ${kanaBoss.boss.name} to skip the kana stops`)),
      jp(kanaBoss.boss.jp, 'big')),
    u.boss ? h('button', { class: 'boss row', onclick: () => startUnitBoss(u) },
      h('div', null, h('div', { class: 'eyebrow' }, 'Unit boss'), h('div', { style: { fontSize: '16px', fontWeight: '800' } }, u.boss.name),
        h('div', { style: { fontSize: '12px', color: 'var(--boss-sub)', marginTop: '2px' } }, S.stamps[u.id] ? 'Stamp earned. Rematch any time.' : courseUnitDone(u) ? 'Ready when you are' : 'Take it early to skip ahead')),
      art('tanuki', '', 'bossface')) : null,
  ];
}

export function home(): HTMLElement {
  const cur = currentUnit();
  const u = COURSE.find((x) => x.id === viewing) ?? cur;
  const due = dueCards().length;
  return h('main', { class: 'screen' },
    header(),
    ...unitView(u),
    h('div', { class: 'card row' },
      h('div', null, h('h3', null, 'Review'), h('p', null, due ? `${due} card${due === 1 ? ' is' : 's are'} ready to review` : Object.keys(S.cards).length ? 'All caught up. Nice!' : 'Finish a stop to start reviewing')),
      h('button', { class: 'btn mint sm', onclick: () => showTab('review') }, due ? 'Review' : 'Practice')),
    h('div', { class: 'eyebrow', style: { marginTop: '4px' } }, 'All units'),
    h('div', { class: 'units' }, COURSE.map((x) => {
      const open = courseUnitUnlocked(x);
      return h('button', { class: `ucard ${x === u ? 'on' : ''} ${open ? '' : 'lock'}`, disabled: !open, onclick: () => { viewing = x === cur ? null : x.id; showTab('home'); } },
        h('span', { class: 'n' }, S.stamps[x.id] ? '✓' : String(x.n)), h('span', null, h('b', { class: 'jp' }, x.jp), h('small', null, x.title)));
    }), h('div', { class: 'ucard lock' }, h('span', { class: 'n' }, '3'), h('span', null, h('b', null, 'More units'), h('small', null, 'On the way')))));
}
