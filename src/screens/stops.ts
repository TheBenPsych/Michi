// Screens for the course stops: words, grammar, story, mission, culture and the unit boss.
import { Word, Stop, Story, Grammar, Mission, Culture, Drill, Token, CourseUnit, gloss, WORDS } from '../data/course';
import { Region } from '../data/climb';
import { LESSONS, Kana, KANA_BY_ID } from '../data/kana';
import { h, jp, bar, pct, clear } from '../ui';
import { art } from '../art';
import { S, save, addXp, logMistake, clearMistake, markActive, addCards } from '../state';
import { say, sfx, voiceOf } from '../audio';
import { lineText } from '../voiceLines';
import { rj, rjTokens, readable, knownKana } from '../script';
/** One drill's Japanese is all kana or all romaji, so the choices never give each other away. */
const kset = (texts: string[]) => (readable(texts.join('')) ? knownKana() : new Set<string>());
import { showFlow, showTab } from '../nav';
import { shuffle } from '../lessonGen';
import { startLesson } from './lesson';

type Done = (ok: boolean, note?: string) => void;
interface Item { eyebrow: string; title: string; render: (done: Done) => HTMLElement; neutral?: boolean; retry?: () => Item; ref?: string; onRight?: () => void }
interface RunOpts { stopId?: string; label: string; items: Item[]; hearts?: boolean; boss?: { name: string; again: () => void }; timer?: number; onWin?: () => string; medal?: string; back?: () => void }

/** A word in kana once all its kana are learned, otherwise in romaji. */
const wtxt = (w: Word) => (readable(w.kana) ? w.kana : w.romaji);
const romaji = (w: Word) => (S.settings.romaji && readable(w.kana) ? h('small', { class: 'rom' }, w.romaji) : null);
const wordLabel = (w: Word) => { const el = h('span', { class: 'wl' }, jp(wtxt(w)), romaji(w)); const n = (el.querySelector('.jp')?.textContent ?? '').length; if (n > 9) el.classList.add('xlong'); else if (n > 6) el.classList.add('long'); return el; };
const speak = (w: Word) => say(w.kana.replace('〜', ''));
const home = () => showTab('home');

export function startStop(s: Stop) {
  if (s.kind === 'kana') return startLesson(LESSONS.find((l) => l.id === s.id)!);
  if (s.kind === 'words') return runQuiz({ stopId: s.id, label: s.title, items: wordItems(s.words), onWin: () => { addCards(s.words.map((w) => `w:${w.id}`)); return `${s.words.length} new words added to your review deck.`; } });
  if (s.kind === 'grammar') return runQuiz({ stopId: s.id, label: s.title, items: grammarItems(s.g), onWin: () => `You can now use ${s.g.title}.` });
  if (s.kind === 'story') return storyScreen(s.id, s.story);
  if (s.kind === 'mission') return missionScreen(s.id, s.m);
  return cultureScreen(s.id, s.c);
}

/** Mixed boss questions: pictures and listening for words, plus grammar choices. */
function bossItems(units: CourseUnit[], nWords: number, nGrammar: number): Item[] {
  const pool = units.flatMap((u) => u.words);
  const wq = shuffle(pool).slice(0, nWords).map((w, i) => [pickPicture, pictureToWord, listenPick][i % 3](w, pool));
  const gq = shuffle(units.flatMap((u) => u.parts.flatMap((p) => p.stops)).flatMap((s) => (s.kind === 'grammar' ? s.g.drills.filter((d) => d.t === 'choose') : [])) as Extract<Drill, { t: 'choose' }>[]).slice(0, nGrammar).map(chooseItem);
  return shuffle([...wq, ...gq]);
}

export function startUnitBoss(u: CourseUnit) {
  runQuiz({ label: u.boss!.name, items: bossItems([u], 8, 6), hearts: true, boss: { name: u.boss!.name, again: () => startUnitBoss(u) }, timer: 15, medal: u.stamp,
    onWin: () => { const first = !S.stamps[u.id]; S.stamps[u.id] = true; addCards(u.words.map((w) => `w:${w.id}`)); return first ? `The ${u.stamp} stamp is in your stamp book. Unit ${u.n + 1} is unlocked.` : 'Rematch won. Nice!'; } });
}

/** The rank-up exam at the end of a region: everything in its units, harder and longer. */
export function startGate(r: Region, units: CourseUnit[]) {
  const name = `${r.rank}'s Gate`;
  runQuiz({ label: name, items: bossItems(units, 14, 8), hearts: true, boss: { name, again: () => startGate(r, units) }, timer: 12, medal: r.rankJp[0],
    onWin: () => { S.gates[r.id] = true; return `You are now a ${r.rank} (${r.rankJp}). The next region of the mountain is open.`; } });
}

// ---------- Word games ----------
function options(w: Word, pool: Word[], n = 4) { return shuffle([w, ...shuffle(pool.filter((x) => x.id !== w.id && x.en !== w.en)).slice(0, n - 1)]); }
function choiceGrid(opts: Word[], right: Word, cell: (w: Word) => Element, done: Done, cls = 'opts pics', after?: () => void) {
  let answered = false;
  const btns = opts.map((o) => {
    const b = h('button', { class: cell === picCell ? 'opt pic' : 'opt', onclick: () => {
      if (answered) return; answered = true;
      const ok = o.id === right.id;
      b.classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake');
      btns.forEach((x, i) => { if (opts[i].id === right.id) x.classList.add('ok'); x.setAttribute('disabled', ''); });
      speak(right); after?.();
      done(ok, `${wtxt(right)} · ${right.en}${right.note ? `. ${rj(right.note)}` : ''}`);
    } }, cell(o));
    return b;
  });
  return h('div', { class: cls }, btns);
}
const picCell = (w: Word) => art(w.art, w.en);
const intro = (w: Word): Item => ({
  eyebrow: 'New word', title: w.en, neutral: true,
  render: (done) => { setTimeout(() => speak(w), 250); return h('div', { class: 'stage center' },
    h('div', { class: 'artcard' }, art(w.art, w.en)),
    h('div', null, jp(wtxt(w), 'wordbig')),
    readable(w.kana) ? h('div', { class: 'read' }, w.romaji) : null,
    h('button', { class: 'soundbtn', onclick: () => speak(w) }, 'Hear it'),
    w.note ? h('div', { class: 'sub' }, rj(w.note)) : null,
    h('button', { class: 'btn', onclick: () => done(true) }, 'Got it')); },
});
function pickPicture(w: Word, pool: Word[]): Item {
  return { eyebrow: 'Picture match', title: 'Which picture is this?', ref: `w:${w.id}`, retry: () => pickPicture(w, pool),
    render: (done) => h('div', { class: 'stage' }, h('div', { class: 'prompt' }, jp(wtxt(w), 'wordbig'), romaji(w), h('button', { class: 'soundbtn sm', onclick: () => speak(w) }, 'Hear it')), choiceGrid(options(w, pool), w, picCell, done)) };
}
function listenPick(w: Word, pool: Word[]): Item {
  return { eyebrow: 'Listen and pick', title: 'Tap what you hear', ref: `w:${w.id}`, retry: () => listenPick(w, pool),
    render: (done) => { setTimeout(() => speak(w), 300); return h('div', { class: 'stage' }, h('button', { class: 'play sm', 'aria-label': 'Play again', onclick: () => speak(w) }, '▶'), choiceGrid(options(w, pool), w, picCell, done)); } };
}
function pictureToWord(w: Word, pool: Word[]): Item {
  return { eyebrow: 'Name it', title: 'What is this in Japanese?', ref: `w:${w.id}`, retry: () => pictureToWord(w, pool),
    render: (done) => h('div', { class: 'stage' }, h('div', { class: 'artcard sm' }, art(w.art, w.en)), choiceGrid(options(w, pool), w, wordLabel, done, 'opts words')) };
}
function typeWord(w: Word): Item {
  return { eyebrow: 'Type it', title: `Type "${w.en}" in romaji`, ref: `w:${w.id}`, retry: () => typeWord(w),
    render: (done) => {
      const input = h('input', { class: 'typein', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Type the word in English letters', placeholder: 'type in romaji' });
      const check = h('button', { class: 'btn', disabled: true }, 'Check');
      let answered = false;
      const submit = () => {
        if (answered || !input.value.trim()) return; answered = true;
        const v = input.value.trim().toLowerCase().replace(/[\s'-]/g, '');
        const ok = v === w.romaji || !!w.alts?.includes(v);
        input.classList.add(ok ? 'ok' : 'no'); input.readOnly = true; check.remove(); input.blur(); speak(w);
        done(ok, readable(w.kana) ? `${w.kana} · ${w.romaji}` : w.romaji);
      };
      input.addEventListener('input', () => { check.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      check.addEventListener('click', submit);
      setTimeout(() => input.focus(), 200);
      return h('div', { class: 'stage' }, h('div', { class: 'artcard sm' }, art(w.art, w.en)), readable(w.kana) ? h('div', { class: 'center' }, jp(w.kana, 'wordbig')) : null, input, check);
    } };
}
function matchItem(ws: Word[]): Item {
  return { eyebrow: 'Match pairs', title: 'Match each picture to its word', neutral: true,
    render: (done) => {
      let sel: [Word, HTMLElement, 'p' | 'w'] | null = null, left = ws.length, slips = 0;
      const tap = (w: Word, b: HTMLElement, side: 'p' | 'w') => {
        if (b.hasAttribute('disabled')) return;
        if (side === 'w') speak(w);
        if (!sel || sel[2] === side) { sel?.[1].classList.remove('sel'); sel = [w, b, side]; b.classList.add('sel'); return; }
        const [o, ob] = sel; sel = null; ob.classList.remove('sel');
        if (o.id === w.id) { for (const x of [b, ob]) { x.classList.add('ok', 'pop'); x.setAttribute('disabled', ''); } sfx('good'); if (!--left) setTimeout(() => done(true, slips ? `Matched with ${slips} slip${slips > 1 ? 's' : ''}` : 'Perfect match!'), 350); }
        else { slips++; sfx('bad'); for (const x of [b, ob]) { x.classList.add('no', 'shake'); setTimeout(() => x.classList.remove('no', 'shake'), 450); } }
      };
      const ps = shuffle(ws), qs = shuffle(ws);
      return h('div', { class: 'opts match' }, ps.flatMap((p, i) => {
        const a: HTMLElement = h('button', { class: 'opt pic', onclick: () => tap(p, a, 'p') }, art(p.art, p.en));
        const b: HTMLElement = h('button', { class: 'opt', onclick: () => tap(qs[i], b, 'w') }, wordLabel(qs[i]));
        return [a, b];
      }));
    } };
}
function wordItems(ws: Word[]): Item[] {
  const teach = ws.flatMap((w) => [intro(w), pickPicture(w, ws)]);
  const drills = shuffle(ws.flatMap((w, i) => [[listenPick, pictureToWord][i % 2](w, ws), ...(i % 3 === 0 ? [typeWord(w)] : [])]));
  drills.splice(Math.floor(drills.length / 2), 0, matchItem(shuffle(ws).slice(0, 4)));
  return [...teach, ...drills];
}

// ---------- Grammar games ----------
function patternCard(g: Grammar): Item {
  return { eyebrow: 'Pattern card', title: rj(g.title), neutral: true,
    render: (done) => h('div', { class: 'stage' },
      h('div', { class: 'pattern' }, h('div', { class: 'pat' }, g.pattern.map((p) => /^[A-Z…]+$/.test(p) ? h('span', { class: 'slot' }, p) : jp(rj(p), 'pj')), h('span', { class: 'mean' }, `= ${g.meaning}`)),
        h('ul', null, g.points.map((p) => h('li', null, rj(p))))),
      g.examples.map((e) => h('button', { class: 'example', onclick: () => say(e.jp) }, jp(rj(e.jp)), h('small', null, e.en))),
      h('div', { class: 'small center' }, 'Tap an example to hear it.'),
      h('button', { class: 'btn', onclick: () => done(true) }, 'Let\u2019s practice')) };
}
function tilesItem(d: Extract<Drill, { t: 'tiles' }>): Item {
  return { eyebrow: 'Build the sentence', title: `"${d.en}"`, retry: () => tilesItem(d),
    render: (done) => {
      const k = kset([...d.answer, ...d.extra]);
      const placed: HTMLElement[] = [];
      const line = h('div', { class: 'tileline' });
      const bank = h('div', { class: 'tilebank' });
      const check = h('button', { class: 'btn', disabled: true }, 'Check');
      const sync = () => { check.disabled = placed.length !== d.answer.length; };
      for (const t of shuffle([...d.answer, ...d.extra])) {
        const b: HTMLElement = h('button', { class: 'wtile', lang: 'ja', 'data-t': t, onclick: () => {
          if (check.dataset.done) return;
          sfx('tap');
          if (b.parentElement === bank) { line.append(b); placed.push(b); } else { bank.append(b); placed.splice(placed.indexOf(b), 1); }
          sync();
        } }, rj(t, k));
        bank.append(b);
      }
      check.addEventListener('click', () => {
        check.dataset.done = '1';
        const ok = placed.map((b) => b.dataset.t).join('') === d.answer.join('');
        line.classList.add(ok ? 'ok' : 'no'); check.remove(); say(d.answer.join(''));
        const ans = rj(d.answer.join(' ') + '。', k);
        done(ok, ok ? ans : `Answer: ${ans}`);
      });
      return h('div', { class: 'stage' }, line, bank, check);
    } };
}
function chooseItem(d: Extract<Drill, { t: 'choose' }>): Item {
  const isJp = /[\u3040-\u30ff]/.test(d.prompt);
  return { eyebrow: 'Pick the right one', title: isJp ? d.en ?? 'Fill the gap' : d.prompt, retry: () => chooseItem(d),
    render: (done) => {
      let answered = false;
      const k = kset([d.prompt, ...d.options].filter((x) => /[\u3040-\u30ff]/.test(x)));
      const right = d.options[d.a];
      const opts = shuffle(d.options);
      const btns = opts.map((o) => h('button', { class: `opt ${isJp ? 'jpopt' : ''}`, lang: isJp ? 'ja' : 'en', onclick: (e: Event) => {
        if (answered) return; answered = true;
        const ok = o === right, b = e.currentTarget as HTMLElement;
        b.classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake');
        btns.forEach((x, i) => { if (opts[i] === right) x.classList.add('ok'); x.setAttribute('disabled', ''); });
        const full = d.prompt.includes('＿') ? d.prompt.replace('＿', right) : right;
        say(full); done(ok, rj(full, k));
      } }, rj(o, k)));
      return h('div', { class: 'stage' }, isJp ? h('div', { class: 'prompt' }, jp(rj(d.prompt, k), 'sent')) : null, h('div', { class: 'opts col' }, btns));
    } };
}
function fixItem(d: Extract<Drill, { t: 'fix' }>): Item {
  return { eyebrow: 'Spot the mistake', title: `"${d.en}"`, retry: () => fixItem(d),
    render: (done) => {
      let answered = false;
      const k = kset([...d.tokens, d.fix]);
      const toks = d.tokens.map((t, i) => h('button', { class: 'wtile', lang: 'ja', onclick: (e: Event) => {
        if (answered) return; answered = true;
        const ok = i === d.wrong, b = e.currentTarget as HTMLElement;
        if (!ok) b.classList.add('no', 'shake');
        const w = toks[d.wrong]; w.classList.add('fixed'); w.textContent = rj(d.fix, k);
        const fixed = d.tokens.map((x, j) => (j === d.wrong ? d.fix : x)).join(' ');
        say(fixed.replace(/ /g, '')); done(ok, `${rj(d.tokens[d.wrong], k)} should be ${rj(d.fix, k)}: ${rj(fixed, k)}`);
      } }, rj(t, k)));
      return h('div', { class: 'stage' }, h('div', { class: 'small center' }, 'Tap the word that is wrong.'), h('div', { class: 'tileline' }, toks));
    } };
}
function grammarItems(g: Grammar): Item[] {
  return [patternCard(g), ...g.drills.map((d) => (d.t === 'tiles' ? tilesItem(d) : d.t === 'fix' ? fixItem(d) : chooseItem(d)))];
}

// ---------- Generic runner ----------
function runQuiz(o: RunOpts) {
  const q = [...o.items];
  let i = 0, hearts = 3, combo = 0, best = 0, xp = 0, graded = 0, right = 0, timerId = 0;
  const hp = o.boss ? Math.max(1, q.length - 3) : 0; let bossHp = hp;
  // Calm mode: no hearts and no timer, even in boss fights.
  const calm = S.settings.calm, useHearts = !!o.hearts && !calm, timer = calm ? 0 : o.timer;
  const quit = () => { clearInterval(timerId); if (i === 0 || confirm('Leave this stop? Progress in it will be lost.')) home(); else render(); };
  const render = () => {
    clearInterval(timerId);
    const it = q[i];
    const foot = h('div', { class: 'foot' });
    const heartsEl = useHearts ? h('div', { class: 'hearts', 'aria-label': `${hearts} hearts left` }, '♥ ', hearts) : null;
    const boss = o.boss ? h('div', { class: 'oni' }, art('tanuki', o.boss.name, 'bossface'), bar(bossHp / hp, 'bad')) : null;
    const tbar = timer && !it.neutral ? bar(1, 'mint timer') : null;
    let answered = false;
    const onDone: Done = (ok, note) => {
      if (answered) return; answered = true; clearInterval(timerId);
      if (it.neutral) { if (note) foot.append(h('div', { class: 'fb ok' }, note)); else return next(); }
      else {
        graded++;
        if (ok) { it.onRight?.(); right++; combo++; best = Math.max(best, combo); const g = 10 + (combo >= 3 ? 5 : 0); xp += g; sfx(o.boss ? 'hit' : 'good');
          if (o.boss) { bossHp--; (boss?.querySelector('.bar > div') as HTMLElement | null)?.style.setProperty('width', `${(bossHp / hp) * 100}%`); boss?.classList.add('hit'); }
          foot.append(h('div', { class: 'fb ok' }, h('span', null, note ?? 'Nice!'), h('span', null, `${combo >= 2 && !calm ? `x${combo} · ` : ''}+${g} XP`)));
        } else {
          combo = 0; sfx('bad'); logMistake(it.ref ?? `n:${it.title}`, it.ref ? note ?? '' : `${it.title}: ${note ?? ''}`);
          if (useHearts) { hearts--; if (heartsEl) heartsEl.textContent = `♥ ${hearts}`; }
          if (it.retry && !o.boss) q.push(it.retry());
          foot.append(h('div', { class: 'fb no' }, h('span', null, note ?? 'Not quite'), useHearts ? h('span', null, `${hearts} ♥ left`) : h('span', null, 'Again later')));
        }
      }
      const b = h('button', { class: `btn ${ok ? 'mint' : 'badb'}`, onclick: next }, 'Continue');
      foot.append(b); b.scrollIntoView({ block: 'nearest' });
    };
    const el = it.render(onDone);
    const eyebrow = o.boss ? `${o.boss.name.toUpperCase()} · ${i + 1} OF ${q.length}` : combo >= 2 && !calm ? `COMBO x${combo} · ${it.eyebrow}` : it.eyebrow;
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: quit }, '✕'), boss ?? bar(i / q.length), heartsEl),
      tbar, h('div', { class: 'qhead' }, h('div', { class: 'eyebrow' }, eyebrow), h('div', { class: 'title' }, it.title)), el, foot), quit);
    if (tbar && timer) {
      const end = Date.now() + timer * 1000, fill = tbar.firstChild as HTMLElement;
      timerId = window.setInterval(() => { const left = (end - Date.now()) / (timer * 1000); fill.style.width = `${Math.max(0, left) * 100}%`; if (left <= 0) { el.querySelectorAll('button').forEach((b) => b.setAttribute('disabled', '')); onDone(false, 'Time is up!'); } }, 100);
    }
  };
  const next = () => {
    i++;
    if (useHearts && hearts <= 0) return fail();
    if (o.boss && bossHp <= 0) return finish();
    if (i >= q.length) return o.boss ? fail() : finish();
    render();
  };
  const fail = () => {
    sfx('bad');
    showFlow(h('div', { class: 'screen flow' }, h('div', { class: 'center' }, o.boss ? art('tanuki', '', 'bossface big') : h('div', { class: 'medal bad' }, jp('休')),
      h('div', { class: 'title' }, o.boss ? `${o.boss.name} wins this round` : 'Out of hearts'), h('div', { class: 'sub' }, 'No waiting: try again right away. Every mistake shows you what to practice.')),
      h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: () => (o.boss ? o.boss.again() : runQuiz({ ...o, items: o.items })) }, 'Try again'), h('button', { class: 'btn ghost', onclick: home }, 'Back')), home);
  };
  const finish = () => complete(o.stopId, xp, pct(right, graded), best, o.onWin?.() ?? '', o.boss ? `${o.boss.name} defeated!` : undefined, o.medal);
  render();
}

/** Records a finished stop and shows the reward screen. */
export function complete(stopId: string | undefined, xp: number, acc: number, best: number, sub: string, title = 'Stop complete!', medal?: string) {
  medal ??= acc === 100 ? '優' : '良';
  xp += 10;
  if (stopId) S.done[stopId] = Math.max(S.done[stopId] ?? 0, acc);
  addXp(xp); S.bestCombo = Math.max(S.bestCombo, best);
  const streak = markActive(); save(); sfx('win');
  showFlow(h('div', { class: 'screen flow' },
    h('div', { class: 'center' }, h('div', { class: 'medal pop' }, jp(medal)), h('div', { class: 'title', style: { marginTop: '14px' } }, title), sub ? h('div', { class: 'sub' }, sub) : null),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'XP'), h('b', null, `+${xp}`)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Accuracy'), h('b', { class: 'mint' }, `${acc}%`)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Streak'), h('b', { class: 'gold' }, `${streak} day${streak === 1 ? '' : 's'}`))),
    h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: home }, 'Continue')), home);
}

// ---------- Story (manga page) ----------
function storyScreen(id: string, st: Story) {
  // English is on by default early on; Japanese takes over as the learner reads more kana.
  let shown = 1, showEn = true;
  const glossBar = h('div', { class: 'gloss', 'aria-live': 'polite' }, 'Tap a bubble to hear it. Tap a highlighted word to see its meaning.');
  const showGloss = (ref: string) => { const g = gloss(ref); clear(glossBar).append(jp(g.word ? wtxt(g.word) : rj(g.jp), 'gj'), h('span', null, g.word && readable(g.word.kana) ? `${g.word.romaji} · ${g.en}` : g.en)); if (g.word) speak(g.word); };
  const page = h('div', { class: 'manga' });
  const draw = () => {
    clear(page).append(...st.panels.map((p, i) => h('div', { class: `panel ${i < shown ? 'on' : ''}` }, i < shown ? [
      art(p.art, ''),
      ...p.lines.map((l) => h('button', { class: 'bubble', lang: 'ja', 'aria-label': `${l.who}: ${lineText(l.tokens)}`, onclick: () => say(lineText(l.tokens), false, voiceOf(l.who)) },
        ((shownTxt) => l.tokens.map((t, ti) => (typeof t === 'string' ? shownTxt[ti] : h('span', { class: 'tw', onclick: (e: Event) => { e.stopPropagation(); showGloss(t[1]); } }, shownTxt[ti]))))(rjTokens(l.tokens.map((t) => (typeof t === 'string' ? t : t[0])))))),
      showEn ? h('div', { class: 'en' }, p.lines.map((l) => l.en).join(' ')) : null,
    ] : h('span', { class: 'q' }, '?'))));
  };
  const nextBtn = h('button', { class: 'btn', onclick: () => {
    if (shown < st.panels.length) { shown++; draw(); const l = st.panels[shown - 1].lines[0]; say(lineText(l.tokens), false, voiceOf(l.who)); nextBtn.textContent = shown < st.panels.length ? 'Next panel' : 'Quick check'; }
    else runQuiz({ stopId: id, label: st.title, items: st.quiz.map((qq) => chooseItem({ t: 'choose', prompt: qq.q, options: qq.options, a: qq.a })), onWin: () => `You read "${st.title}".` });
  } }, 'Next panel');
  const enBtn = h('button', { class: 'linkbtn', onclick: () => { showEn = !showEn; enBtn.textContent = showEn ? 'Hide English' : 'Show English'; draw(); } }, 'Hide English');
  draw();
  setTimeout(() => { const l = st.panels[0].lines[0]; say(lineText(l.tokens), false, voiceOf(l.who)); }, 300);
  showFlow(h('div', { class: 'screen flow' },
    h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: home }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, `Story · ${st.title}`), enBtn),
    page, glossBar, h('div', { style: { flex: '1' } }), nextBtn), home);
}

// ---------- Mission (chat role play; mistakes are explained, never punished) ----------
function missionScreen(id: string, m: Mission) {
  let step = 0, mistakes = 0;
  const goals = m.steps.filter((s) => 'goal' in s).map((s) => (s as { goal: string }).goal);
  const chat = h('div', { class: 'chat' });
  const goalEl = h('div', { class: 'goal' });
  const choicesEl = h('div', { class: 'opts col' });
  const syncTop = () => {
    const done = m.steps.slice(0, step).filter((s) => 'goal' in s).length;
    clear(goalEl).append(h('b', null, `Goal: ${m.goal}`), h('div', null, goals.map((g, i) => h('span', { class: i < done ? 'ok' : '' }, `${i < done ? '✓' : '○'} ${g}`))));
  };
  const npc = (text: string, en: string) => chat.append(h('div', { class: 'msg them' }, art('mei', '', 'av'), h('button', { class: 'say', lang: 'ja', onclick: () => say(text, false, voiceOf(m.npc)) }, jp(rj(text)), h('small', null, en))));
  const advance = () => {
    syncTop(); clear(choicesEl);
    const s = m.steps[step];
    if (!s) return complete(id, Math.max(10, 40 - mistakes * 10), pct(goals.length, goals.length + mistakes), 0, `${m.npc} is your new friend!`, 'Mission complete!', '友');
    if ('npc' in s) { npc(s.npc, s.en); say(s.npc, false, voiceOf(m.npc)); step++; setTimeout(advance, 900); chat.lastElementChild?.scrollIntoView({ block: 'nearest' }); return; }
    const k = kset(s.choices.map((c) => c.jp));
    for (const c of shuffle(s.choices)) {
      choicesEl.append(h('button', { class: 'opt jpopt', lang: 'ja', onclick: () => {
        if (c.ok) { sfx('good'); chat.append(h('div', { class: 'msg me' }, jp(rj(c.jp, k)))); say(c.jp, false, voiceOf('Ben')); step++; advance(); }
        else {
          sfx('bad'); mistakes++; logMistake(`m:${c.jp}`, `${rj(c.jp)}: ${rj(c.why ?? '')}`);
          chat.append(h('div', { class: 'msg me bad' }, jp(rj(c.jp, k), 'strike'), h('small', null, `Not quite · ${rj(c.why ?? '')}`)));
          syncTop();
          (choicesEl.querySelector(`[data-jp="${c.jp}"]`) as HTMLElement | null)?.setAttribute('disabled', '');
        }
        chat.lastElementChild?.scrollIntoView({ block: 'nearest' });
      }, 'data-jp': c.jp }, rj(c.jp, k)));
    }
  };
  showFlow(h('div', { class: 'screen flow' },
    h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: home }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, `Mission · ${m.title}`)),
    h('div', { class: 'scene' }, art(m.art, 'Mei at a welcome party')), goalEl, chat, choicesEl), home);
  advance();
}

// ---------- Culture card ----------
function cultureScreen(id: string, c: Culture) {
  const had = S.album.includes(c.id);
  showFlow(h('div', { class: 'screen flow' },
    h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: home }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, had ? 'Culture card' : 'New culture card')),
    cultureCard(c),
    h('div', { style: { flex: '1' } }),
    h('button', { class: 'btn', onclick: () => { if (!had) S.album.push(c.id); complete(id, 0, 100, 0, `${S.album.length} card${S.album.length === 1 ? '' : 's'} in your album.`, had ? 'Card reviewed' : 'Card collected!', '集'); } }, had ? 'Done' : 'Add to my album')), home);
}
export const cultureCard = (c: Culture) => h('div', { class: 'ccard' }, art(c.art, c.title), h('div', { class: 'cbody' }, h('div', { class: 'row' }, h('b', null, `${rj(c.title)} · `, jp(rj(c.jp))), h('small', null, 'Unit 1')), h('p', null, rj(c.text))));
export const wordById = (id: string) => WORDS.get(id.replace(/^w:/, ''));

// ---------- Practice built from what you have learned (rematch, Daily Mix listening) ----------
const learnedWordList = () => Object.keys(S.cards).filter((id) => id.startsWith('w:')).map(wordById).filter((w): w is Word => !!w);
const learnedKanaList = () => Object.keys(S.cards).filter((id) => /^[hk]:/.test(id)).map((id) => KANA_BY_ID.get(id)).filter((k): k is Kana => !!k);

/** Kana question: read it and pick the romaji, or hear it and pick the kana. */
function kanaItem(k: Kana, pool: Kana[], mode: 'read' | 'listen'): Item {
  const opts = shuffle([k, ...shuffle(pool.filter((x) => x.romaji !== k.romaji && x.sound !== k.sound)).slice(0, 3)]);
  return { eyebrow: mode === 'read' ? 'Read it' : 'Listen', title: mode === 'read' ? 'How do you read this?' : 'Tap the kana you hear', ref: k.id, retry: () => kanaItem(k, pool, mode),
    render: (done) => {
      let answered = false;
      if (mode === 'listen') setTimeout(() => say(k.sound), 300);
      const btns = opts.map((o) => h('button', { class: `opt ${mode === 'listen' ? 'kana' : ''}`, onclick: () => {
        if (answered) return; answered = true; const ok = o.id === k.id;
        btns.forEach((b, i) => { if (opts[i].id === k.id) b.classList.add('ok'); b.setAttribute('disabled', ''); });
        if (!ok) btns[opts.indexOf(o)].classList.add('no', 'shake');
        say(k.sound); done(ok, `${k.char} is "${k.romaji}"`);
      } }, mode === 'listen' ? jp(o.char) : o.romaji));
      return h('div', { class: 'stage' }, mode === 'read' ? h('div', { class: 'center' }, jp(k.char, `bigkana ${k.char.length > 1 ? 'multi' : ''}`)) : h('button', { class: 'play sm', 'aria-label': 'Play again', onclick: () => say(k.sound) }, '▶'), h('div', { class: 'opts' }, btns));
    } };
}

/** Rematch: re-ask the words and kana from the mistake journal. A right answer clears the entry. */
export function startRematch(ids: string[], back = () => showTab('review')) {
  const words = learnedWordList(), kana = learnedKanaList();
  const wpool = words.length >= 4 ? words : [...words, ...COURSE_WORDS()];
  const kpool = kana.length >= 4 ? kana : LESSONS.flatMap((l) => l.kana);
  const items = shuffle(ids).slice(0, 12).flatMap((id, i): Item[] => {
    const w = wordById(id), k = KANA_BY_ID.get(id);
    const it = w ? [pictureToWord, listenPick, typeWord][i % 3](w, wpool) : k ? kanaItem(k, kpool, i % 2 ? 'listen' : 'read') : null;
    if (!it) return [];
    return [{ ...it, onRight: () => clearMistake(id) }];
  });
  if (!items.length) return back();
  runQuiz({ label: 'Rematch', items, onWin: () => `${Object.keys(S.mistakes).length} left in your mistake journal.`, back });
}

/** Listening round for the Daily Mix: words and kana you know, by ear only. */
export function startListening(back = () => showTab('home')): boolean {
  const words = learnedWordList(), kana = learnedKanaList();
  const items = [...shuffle(words).slice(0, words.length >= 4 ? 5 : 0).map((w) => listenPick(w, words)), ...shuffle(kana).slice(0, kana.length >= 4 ? 5 : 0).map((k) => kanaItem(k, kana, 'listen'))];
  if (items.length < 3) return false;
  runQuiz({ label: 'Listening', items: shuffle(items), onWin: () => 'Your ears are getting sharper.', back });
  return true;
}
const COURSE_WORDS = () => [...WORDS.values()];
