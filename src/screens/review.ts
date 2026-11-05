import { KANA_BY_ID, Kana } from '../data/kana';
import { Word } from '../data/course';
import { readable } from '../script';
import { h, jp, svgEl } from '../ui';
import { S, save, addXp, logMistake, clearMistake, dueCards, markActive } from '../state';
import { grade, nextIv, fmtIv, Grade, Card, isLeech, stageOf } from '../srs';
import { say, sfx } from '../audio';
import { showFlow, showTab } from '../nav';
import { soundBtn } from '../games';
import { hiraOf, buildPractice, isAnswer, shuffle } from '../lessonGen';
import { learnedKana } from '../progress';
import { header } from './home';
import { startPractice } from './lesson';
import { wordById, startRematch } from './stops';
import { art } from '../art';
import { canListen, listenJa, heardWord } from '../speech';

/** Kana that are easy to mix up, shown side by side when one keeps slipping. */
const LOOKALIKE = [['さ', 'ち'], ['ぬ', 'め'], ['ね', 'れ', 'わ'], ['る', 'ろ'], ['は', 'ほ'], ['き', 'さ'], ['い', 'り'], ['あ', 'お'], ['く', 'へ'], ['シ', 'ツ'], ['ソ', 'ン'], ['ク', 'ケ', 'タ'], ['ウ', 'ワ', 'フ'], ['ア', 'マ'], ['コ', 'ユ'], ['チ', 'テ'], ['ノ', 'メ'], ['ル', 'レ']];

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s'’-]/g, '').replace(/ou|oo/g, 'o').replace(/uu/g, 'u').replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/ee/g, 'e');
const wordOk = (w: Word, typed: string) => [w.romaji, ...(w.alts ?? [])].some((r) => norm(r) === norm(typed));

export function reviewTab(): HTMLElement {
  const due = dueCards();
  const all = Object.values(S.cards);
  const next = all.filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0];
  const learned = learnedKana();
  const inH = next ? Math.max(1, Math.round((next.due - Date.now()) / 3_600_000)) : 0;
  const nm = Object.keys(S.mistakes).length;
  return h('main', { class: 'screen' },
    header(),
    h('div', null, h('div', { class: 'eyebrow' }, 'Daily review'), h('div', { class: 'title' }, due.length ? `${due.length} card${due.length === 1 ? '' : 's'} ready` : 'All caught up'),
      h('div', { class: 'sub' }, due.length ? 'Each card comes back right before you would forget it. Familiar cards ask you to type, listen or speak.' : next ? `Next card in about ${inH < 24 ? `${inH} hour${inH === 1 ? '' : 's'}` : `${Math.round(inH / 24)} days`}.` : 'Finish a lesson and its kana will show up here.')),
    due.length ? h('button', { class: 'btn mint', onclick: () => session(due.slice(0, 50)) }, 'Start review') : null,
    h('button', { class: 'card row journalcard', onclick: journal },
      h('div', null, h('h3', null, 'Mistake journal'), h('p', null, nm ? `${nm} thing${nm === 1 ? '' : 's'} to work on. Rematch them any time.` : 'Every mistake you make lands here with its fix.')),
      h('span', { class: 'jcount' }, String(nm))),
    learned.length >= 4 ? h('div', { class: 'card row' }, h('div', null, h('h3', null, 'Quick practice'), h('p', null, '12 mixed questions on kana you have learned. No scheduling changes.')),
      h('button', { class: 'btn sm', style: { boxShadow: '0 4px 0 var(--pri-sh)' }, onclick: () => startPractice(buildPractice(learned), learned) }, 'Play')) : null,
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Cards'), h('b', null, all.length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Due'), h('b', { class: 'mint' }, due.length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Mastered'), h('b', { class: 'gold' }, all.filter((c) => c.iv >= 21).length))));
}

// ---------- Mistake journal ----------
function journal() {
  const back = () => showTab('review');
  const render = () => {
    const entries = Object.entries(S.mistakes).sort((a, b) => b[1].n - a[1].n || b[1].last - a[1].last);
    const ids = entries.map(([id]) => id).filter((id) => wordById(id) || KANA_BY_ID.get(id));
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: back }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, 'Mistake journal')),
      h('div', { class: 'sub', style: { marginTop: 0 } }, entries.length ? 'Your slips, most frequent first. Win a rematch to clear a word or kana. Grammar notes clear when you tap Got it.' : 'Nothing here yet. Mistakes show up here with the right answer, so you can learn from them.'),
      ids.length ? h('button', { class: 'btn', onclick: () => startRematch(ids, back) }, `Rematch (${Math.min(12, ids.length)})`) : null,
      h('div', { class: 'jlist' }, entries.map(([id, m]) => {
        const w = wordById(id), k = KANA_BY_ID.get(id);
        const head = w ? h('b', null, jp(readable(w.kana) ? w.kana : w.romaji), ` · ${w.en}`) : k ? h('b', null, jp(k.char), ` · ${k.romaji}`) : null;
        return h('div', { class: 'jentry' },
          h('div', { class: 't' }, head, h('p', null, m.note), h('small', null, `Missed ${m.n}×`)),
          h('button', { class: 'soundbtn sm', onclick: () => { clearMistake(id); save(); render(); } }, 'Got it'));
      }))), back);
  };
  render();
}

// ---------- Review session ----------
/** Runs a review session over the given cards. */
export function session(cards: Card[]) {
  const queue = [...cards];
  const total = cards.length;
  let doneCount = 0;
  const finish = () => {
    const xp = doneCount * 2;
    addXp(xp); markActive(); save(); sfx('win');
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'center' }, h('div', { class: 'medal pop' }, jp('復')), h('div', { class: 'title', style: { marginTop: '14px' } }, 'Review done!'), h('div', { class: 'sub' }, `${doneCount} cards reviewed · +${xp} XP`)),
      h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: () => showTab('home') }, 'Continue')), () => showTab('home'));
  };
  const leave = () => { if (doneCount) { addXp(doneCount * 2); markActive(); save(); } showTab('review'); };

  const render = (forceFlash = false) => {
    const c = queue[0];
    if (!c) return finish();
    const w = wordById(c.id), k = w ? undefined : KANA_BY_ID.get(c.id);
    if (!w && !k) { queue.shift(); return render(); } // card for content that no longer exists
    const leech = isLeech(c);
    let stage = forceFlash || leech ? 'flash' : stageOf(c);
    if (w && !readable(w.kana) && stage !== 'flash') stage = 'type';
    const sound = w ? w.kana.replace('〜', '') : k!.sound;
    const answer = w ? `${readable(w.kana) ? `${w.kana} · ` : ''}${w.romaji} · ${w.en}` : `${k!.char} · ${k!.romaji}`;

    const rate = (g: Grade) => {
      if (g === 'again') logMistake(c.id, answer);
      S.cards[c.id] = grade(c, g, Date.now()); save(); queue.shift();
      if (g === 'again') queue.push(S.cards[c.id]); else doneCount++;
      sfx(g === 'again' ? 'bad' : 'tap'); render();
    };
    const top = h('div', { class: 'head', style: { alignItems: 'flex-end' } },
      h('div', null, h('div', { class: 'eyebrow' }, leech ? 'Tricky one' : stage === 'flash' ? 'Daily review' : stage === 'type' ? 'Type it' : 'By ear'), h('div', { class: 'title' }, `${Math.min(doneCount + 1, total)} of ${total}`)),
      h('button', { class: 'icon-btn', 'aria-label': 'Stop review', onclick: leave }, '✕'));
    const help = leech ? leechHelp(w, k) : null;

    if (stage === 'flash') {
      let shown = false;
      const back = h('div', { class: 'center', style: { visibility: 'hidden' } },
        h('div', { class: 'dash' }),
        w ? h('div', { class: 'artcard sm' }, art(w.art, w.en)) : null,
        h('div', { class: 'read' }, w ? `${w.en}` : k!.romaji),
        w && readable(w.kana) ? h('div', { class: 'sub' }, w.romaji) : null,
        k && k.script === 'k' && hiraOf(k) ? h('div', { class: 'sub' }, 'Hiragana: ', jp(hiraOf(k)!.char)) : null,
        k ? soundBtn(k) : h('button', { class: 'soundbtn', onclick: () => say(sound) }, 'Hear it'));
      const grades = h('div', { class: 'grades', style: { visibility: 'hidden' } }, (['again', 'hard', 'good', 'easy'] as Grade[]).map((g) =>
        h('button', { class: `g-${g}`, onclick: () => rate(g) }, g[0].toUpperCase() + g.slice(1), h('br'), h('small', null, fmtIv(nextIv(c, g))))));
      const hint = h('div', { class: 'eyebrow', style: { textAlign: 'center' } }, 'Say it in your head, then tap the card');
      const reveal = () => { if (shown) return; shown = true; back.style.visibility = 'visible'; grades.style.visibility = 'visible'; if (help) help.hidden = false; hint.textContent = 'How well did you know it?'; say(sound); };
      if (help) help.hidden = true;
      showFlow(h('div', { class: 'screen flow' }, top,
        h('button', { class: 'flash', onclick: reveal, 'aria-label': 'Show the answer' }, w ? jp(readable(w.kana) ? w.kana : w.romaji, 'wordbig') : jp(k!.char, `bigkana ${k!.char.length > 1 ? 'multi' : ''}`), back),
        help, hint, grades), leave);
      return;
    }

    // Typed, listening and speaking cards grade themselves: right = Good, wrong = Again.
    const foot = h('div', { class: 'foot' });
    let answered = false;
    const result = (ok: boolean) => {
      if (answered) return; answered = true;
      sfx(ok ? 'good' : 'bad'); say(sound);
      foot.append(h('div', { class: `fb ${ok ? 'ok' : 'no'}` }, h('span', null, answer), h('span', null, ok ? `Next in ${fmtIv(nextIv(c, 'good'))}` : 'Again soon')),
        h('button', { class: `btn ${ok ? 'mint' : 'badb'}`, onclick: () => rate(ok ? 'good' : 'again') }, 'Continue'));
      foot.lastElementChild?.scrollIntoView({ block: 'nearest' });
    };
    const flashLink = h('button', { class: 'linkbtn', onclick: () => render(true) }, 'Show me the card instead');
    let body: HTMLElement;

    const typeBox = (check: (v: string) => boolean, ph: string) => {
      const input = h('input', { class: 'typein', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': ph, placeholder: ph });
      const btn = h('button', { class: 'btn', disabled: true }, 'Check');
      const submit = () => { if (answered || !input.value.trim()) return; const ok = check(input.value); input.classList.add(ok ? 'ok' : 'no'); input.readOnly = true; btn.remove(); input.blur(); result(ok); };
      input.addEventListener('input', () => { btn.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      btn.addEventListener('click', submit);
      setTimeout(() => input.focus(), 250);
      return [input, btn];
    };

    if (stage === 'type') {
      body = k
        ? h('div', { class: 'stage' }, h('div', { class: 'center' }, jp(k.char, `bigkana ${k.char.length > 1 ? 'multi' : ''}`)), ...typeBox((v) => isAnswer(k, v), 'type the romaji'))
        : h('div', { class: 'stage' }, h('div', { class: 'artcard sm' }, art(w!.art, w!.en)), h('div', { class: 'center read' }, w!.en), ...typeBox((v) => wordOk(w!, v), 'type it in romaji'));
    } else if (k) {
      setTimeout(() => say(sound), 300);
      body = h('div', { class: 'stage' }, h('button', { class: 'play sm', 'aria-label': 'Play again', onclick: () => say(sound) }, '▶'), h('div', { class: 'small center' }, 'Type the romaji for what you hear.'), ...typeBox((v) => isAnswer(k, v), 'what did you hear?'));
    } else {
      // Words you know well: say it out loud (when the phone can listen), otherwise pick the meaning by ear.
      body = h('div', { class: 'stage' });
      const others = shuffle(Object.keys(S.cards).map(wordById).filter((x): x is Word => !!x && x.id !== w!.id && x.en !== w!.en)).slice(0, 3);
      const pickByEar = () => {
        if (others.length < 3) { body.append(...typeBox((v) => wordOk(w!, v), 'type what you hear')); return; }
        const opts = shuffle([w!, ...others]);
        const btns = opts.map((o) => h('button', { class: 'opt', onclick: () => { btns.forEach((b, i) => { if (opts[i] === w) b.classList.add('ok'); b.setAttribute('disabled', ''); }); result(o === w); } }, o.en));
        body.append(h('div', { class: 'opts col' }, btns));
      };
      const sayIt = () => {
        const status = h('div', { class: 'small center' }, 'Tap the mic and say it in Japanese.');
        const mic = h('button', { class: 'play sm mic', 'aria-label': 'Speak' }, micIcon());
        let tries = 0;
        mic.addEventListener('click', async () => {
          if (answered) return;
          status.textContent = 'Listening…'; mic.classList.add('on');
          try {
            const heard = await listenJa(); mic.classList.remove('on');
            if (heardWord(heard, [w!.kana.replace('〜', ''), w!.kanji ?? ''])) { status.textContent = `Heard: ${heard[0]}`; return result(true); }
            tries++;
            status.textContent = heard.length ? `Heard "${heard[0]}". ${tries < 2 ? 'Try once more.' : ''}` : 'I did not catch that. Try again.';
            if (tries >= 2) result(false);
          } catch { mic.classList.remove('on'); status.textContent = 'The microphone is not available, so pick the meaning instead.'; mic.remove(); pickByEar(); }
        });
        body.append(h('div', { class: 'artcard sm' }, art(w!.art, w!.en)), h('div', { class: 'center read' }, w!.en), mic, status,
          h('button', { class: 'linkbtn', onclick: () => result(false) }, "I don't know it"));
      };
      canListen().then((ok) => {
        if (ok && c.reps % 2 === 0) sayIt();
        else { setTimeout(() => say(sound), 300); body.append(h('button', { class: 'play sm', 'aria-label': 'Play again', onclick: () => say(sound) }, '▶'), h('div', { class: 'small center' }, 'What does this word mean?')); pickByEar(); }
      });
    }
    showFlow(h('div', { class: 'screen flow' }, top, help, body, foot, h('div', { style: { flex: '1' } }), flashLink), leave);
  };
  render();
}

/** Extra help for a card you keep missing: look-alikes side by side, or the picture with its reading. */
function leechHelp(w?: Word, k?: Kana): HTMLElement {
  const box = h('div', { class: 'note leech' }, h('div', { class: 'eyebrow' }, `You've missed this one a few times`));
  if (k) {
    const group = LOOKALIKE.find((g) => g.includes(k.char));
    if (group) box.append(h('p', null, 'It looks like these. Spot the difference:'), h('div', { class: 'pills' }, group.map((c) => h('span', { class: `pill ${c === k.char ? 'on' : ''}` }, jp(c), ` ${[...KANA_BY_ID.values()].find((x) => x.char === c)?.romaji ?? ''}`))));
    else box.append(h('p', null, `Trace ${k.char} in the air while saying "${k.romaji}" three times.`));
  } else if (w) box.append(h('p', null, `Picture it: ${w.en}. Say "${w.romaji}" out loud three times while you look at the picture.`));
  return box;
}

function micIcon() {
  const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  s.append(svgEl('rect', { x: 9, y: 3, width: 6, height: 11, rx: 3 }), svgEl('path', { d: 'M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8' }));
  return s;
}
