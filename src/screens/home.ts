import { UNITS, Lesson } from '../data/kana';
import { h, jp, bar } from '../ui';
import { S, currentStreak, dueCards, levelOf } from '../state';
import { nextLesson, lessonUnlocked, unitUnlocked, unitDone, mastery, unitOf } from '../progress';
import { startLesson, startBoss } from './lesson';
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

export function home(): HTMLElement {
  const l = nextLesson(), u = unitOf(l);
  const idx = u.lessons.indexOf(l);
  const doneInUnit = u.lessons.filter((x) => x.id in S.done).length;
  const due = dueCards().length;
  const kinds = ['Meet the kana', 'Read it', 'Pick the kana', 'Listen', 'Type the reading', 'Match pairs', ...(l.trace ? ['Trace strokes'] : [])];
  const tiles = l.kana.slice(0, 5).map((k, i) => h('div', { class: `tile kana ${mastery(k.id) !== 'n' ? 'on' : i === 0 ? 'cur' : ''}`, lang: 'ja', style: k.char.length > 1 ? { fontSize: '20px' } : null }, k.char));
  const boss = UNITS.find((x) => unitUnlocked(x) && !S.bosses[x.id]) ?? u;
  const nextU = UNITS[UNITS.indexOf(boss) + 1];

  return h('main', { class: 'screen' },
    header(),
    h('div', null,
      h('div', { class: 'eyebrow' }, `${u.title} · Lesson ${idx + 1} of ${u.lessons.length}`),
      h('div', { class: 'title' }, l.title),
      h('div', { class: 'sub' }, l.blurb),
      h('div', { style: { marginTop: '12px' } }, bar(doneInUnit / u.lessons.length))),
    h('div', { class: 'tiles' }, tiles),
    h('div', { class: 'card row' },
      h('div', null, h('h3', null, 'Review'), h('p', null, due ? `${due} card${due === 1 ? ' is' : 's are'} ready to review` : Object.keys(S.cards).length ? 'All caught up. Nice!' : 'Finish a lesson to start reviewing')),
      h('button', { class: 'btn mint sm', onclick: () => showTab('review') }, due ? 'Review' : 'Practice')),
    h('button', { class: 'boss row', onclick: () => startBoss(boss) },
      h('div', null, h('div', { class: 'eyebrow' }, `${boss.title} boss`), h('div', { style: { fontSize: '16px', fontWeight: '800' } },
        S.bosses[boss.id] ? `${boss.boss.name}: rematch any time` : `${boss.boss.name}: beat it to ${nextU ? `unlock ${nextU.title}` : 'finish kana'}`),
        h('div', { style: { fontSize: '12px', color: 'var(--boss-sub)', marginTop: '2px' } }, unitDone(boss) ? 'Ready when you are' : 'Already know these? Win to skip ahead.')),
      jp(boss.boss.jp, 'big')),
    h('div', null,
      h('div', { class: 'eyebrow', style: { marginBottom: '10px' } }, 'In this lesson'),
      h('div', { class: 'pills' }, kinds.map((k) => h('div', { class: 'pill' }, k)))),
    h('button', { class: 'btn', onclick: () => startLesson(l) }, l.id in S.done ? 'Practice this lesson' : 'Start lesson'),
    path(l));
}

function path(cur: Lesson) {
  return h('section', { class: 'path', 'aria-label': 'All lessons' },
    UNITS.map((u) => [
      h('div', { class: 'unit' }, h('div', { class: 'title', style: { fontSize: '20px' } }, u.title), jp(u.jp, 'eyebrow')),
      u.lessons.map((l, i) => {
        const open = lessonUnlocked(l), done = l.id in S.done;
        return h('button', { class: `lrow ${done ? 'done' : ''} ${l === cur ? 'cur' : ''} ${open ? '' : 'lock'}`, disabled: !open, onclick: () => startLesson(l) },
          h('div', { class: 'n' }, done ? '✓' : String(i + 1)),
          h('div', { class: 't' }, h('b', null, l.title), h('small', null, done ? `Best ${S.done[l.id]}%` : open ? 'Ready' : 'Locked')),
          jp(l.kana.slice(0, 5).map((k) => k.char).join(''), 'k'));
      }),
      h('button', { class: `lrow ${S.bosses[u.id] ? 'done' : ''}`, onclick: () => startBoss(u) },
        h('div', { class: 'n' }, jp(u.boss.jp)), h('div', { class: 't' }, h('b', null, u.boss.name), h('small', null, S.bosses[u.id] ? 'Defeated' : 'Unit boss · 20 rounds'))),
    ]));
}
