import { KANA_BY_ID } from '../data/kana';
import { h, jp } from '../ui';
import { S, save, dueCards, markActive } from '../state';
import { grade, nextIv, fmtIv, Grade, Card } from '../srs';
import { say, sfx } from '../audio';
import { showFlow, showTab } from '../nav';
import { soundBtn } from '../games';
import { hiraOf, buildPractice } from '../lessonGen';
import { learnedKana } from '../progress';
import { header } from './home';
import { startPractice } from './lesson';
import { wordById } from './stops';
import { art } from '../art';

export function reviewTab(): HTMLElement {
  const due = dueCards();
  const all = Object.values(S.cards);
  const next = all.filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0];
  const learned = learnedKana();
  const inH = next ? Math.max(1, Math.round((next.due - Date.now()) / 3_600_000)) : 0;
  return h('main', { class: 'screen' },
    header(),
    h('div', null, h('div', { class: 'eyebrow' }, 'Daily review'), h('div', { class: 'title' }, due.length ? `${due.length} card${due.length === 1 ? '' : 's'} ready` : 'All caught up'),
      h('div', { class: 'sub' }, due.length ? 'Spaced review shows each card right before you would forget it.' : next ? `Next card in about ${inH < 24 ? `${inH} hour${inH === 1 ? '' : 's'}` : `${Math.round(inH / 24)} days`}.` : 'Finish a lesson and its kana will show up here.')),
    due.length ? h('button', { class: 'btn mint', onclick: () => session(due.slice(0, 50)) }, 'Start review') : null,
    learned.length >= 4 ? h('div', { class: 'card row' }, h('div', null, h('h3', null, 'Quick practice'), h('p', null, '12 mixed questions on kana you have learned. No scheduling changes.')),
      h('button', { class: 'btn sm', style: { boxShadow: '0 4px 0 var(--pri-sh)' }, onclick: () => startPractice(buildPractice(learned), learned) }, 'Play')) : null,
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Cards'), h('b', null, all.length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Due'), h('b', { class: 'mint' }, due.length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Mastered'), h('b', { class: 'gold' }, all.filter((c) => c.iv >= 21).length))));
}

function session(cards: Card[]) {
  const queue = [...cards];
  const total = cards.length;
  let doneCount = 0;
  const finish = () => {
    const xp = doneCount * 2;
    S.xp += xp; markActive(); save(); sfx('win');
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'center' }, h('div', { class: 'medal pop' }, jp('復')), h('div', { class: 'title', style: { marginTop: '14px' } }, 'Review done!'), h('div', { class: 'sub' }, `${doneCount} cards reviewed · +${xp} XP`)),
      h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: () => showTab('home') }, 'Continue')), () => showTab('home'));
  };
  const leave = () => { if (doneCount) { S.xp += doneCount * 2; markActive(); save(); } showTab('review'); };
  const render = () => {
    const c = queue[0];
    if (!c) return finish();
    const w = wordById(c.id), k = w ? null : KANA_BY_ID.get(c.id);
    if (!w && !k) { queue.shift(); return render(); } // card for content that no longer exists
    let shown = false;
    const sound = w ? w.kana.replace('〜', '') : k!.sound;
    const back = h('div', { class: 'center', style: { visibility: 'hidden' } },
      h('div', { class: 'dash' }),
      w ? h('div', { class: 'artcard sm' }, art(w.art, w.en)) : null,
      h('div', { class: 'read' }, w ? `${w.en}` : k!.romaji),
      w ? h('div', { class: 'sub' }, w.romaji, w.kanji ? ' · ' : '', w.kanji ? jp(w.kanji) : null) : null,
      k && k.script === 'k' && hiraOf(k) ? h('div', { class: 'sub' }, 'Hiragana: ', jp(hiraOf(k)!.char)) : null,
      k ? soundBtn(k) : h('button', { class: 'soundbtn', onclick: () => say(sound) }, 'Hear it'));
    const grades = h('div', { class: 'grades', style: { visibility: 'hidden' } }, (['again', 'hard', 'good', 'easy'] as Grade[]).map((g) =>
      h('button', { class: `g-${g}`, onclick: () => rate(g) }, g[0].toUpperCase() + g.slice(1), h('br'), h('small', null, fmtIv(nextIv(c, g))))));
    const reveal = () => { if (shown) return; shown = true; back.style.visibility = 'visible'; grades.style.visibility = 'visible'; hint.textContent = 'How well did you know it?'; say(sound); };
    const rate = (g: Grade) => {
      S.cards[c.id] = grade(c, g, Date.now()); save(); queue.shift();
      if (g === 'again') queue.push(S.cards[c.id]); else doneCount++;
      sfx(g === 'again' ? 'bad' : 'tap'); render();
    };
    const hint = h('div', { class: 'eyebrow', style: { textAlign: 'center' } }, 'Say it in your head, then tap the card');
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'head', style: { alignItems: 'flex-end' } },
        h('div', null, h('div', { class: 'eyebrow' }, 'Daily review'), h('div', { class: 'title' }, `${Math.min(doneCount + 1, total)} of ${total}`)),
        h('button', { class: 'icon-btn', 'aria-label': 'Stop review', onclick: leave }, '✕')),
      h('button', { class: 'flash', onclick: reveal, 'aria-label': 'Show the answer' }, w ? jp(w.kana, 'wordbig') : jp(k!.char, `bigkana ${k!.char.length > 1 ? 'multi' : ''}`), back),
      hint, grades), leave);
  };
  render();
}
