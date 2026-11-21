/** The screens around the lessons: welcome, home, step results, kana trainer, words, warm-up, level check and settings. */
import { h, jp } from './ui';
import { show, runSession, Stats, Card, nav } from './engine';
import { S, save, reset, learnKana, knows, dueItems, today, weak, grade } from './store';
import { STEPS, STEP_KANA, WORDS, L, PHRASES } from './data/content';
import { ROWS, ALL, kanaOf, ROW_NAMES } from './data/kana';
import { stepCards, kanaLesson } from './lessons';
import { quizFor, recallSound, recallLetter, writeKana, spell, typeSound, shuffle, pick } from './cards';
import { ill, ICONS } from './art';
import { sayLine, sayKana, sfx } from './audio';
import { strokeAnim } from './strokes';
import { writePad } from './pad';
import { fb } from './engine';

const top = (title: string, back: () => void = home) => h('div', { class: 'top' }, h('button', { class: 'link', onclick: back }, '‹ Back'), h('h2', null, title), h('span', { class: 'sp' }));
const icon = (svg: string) => { const s = h('span', { style: { lineHeight: '0' } }); s.innerHTML = svg; return s; };
export function applySettings() {
  const dark = S.settings.theme === 'dark' || (S.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.setProperty('--fs', ['16px', '18px', '20px'][S.settings.text]);
}

/* ---------- welcome ---------- */
export function welcome() {
  show(h('div', { class: 'pg' }, h('div', { class: 'mid' },
    h('p', { class: 'ey jp', style: { fontSize: '1.1rem', letterSpacing: '.2em' } }, '教本'),
    h('h1', { class: 'lt' }, 'Learn Japanese properly, a few minutes at a time'),
    h('p', { class: 'p muted' }, 'You will hear it, say it, write it and read it. No Japanese needed to begin.'))),
  h('div', { class: 'ft' },
    h('button', { class: 'btn', onclick: () => { S.started = true; save(); startStep(); } }, 'Start with your first word'),
    h('button', { class: 'link c', onclick: levelCheck }, 'I already know some Japanese')));
  nav.home = true;
}

/* ---------- home ---------- */
const warmCap = () => S.settings.warm * 4;
export function home() {
  if (!S.started) return welcome();
  const due = S.warmDay === today() ? [] : dueItems(warmCap());
  const done = S.step >= STEPS.length, st = STEPS[Math.min(S.step, STEPS.length - 1)];
  const wordsMet = WORDS.filter((w) => S.items[`w:${w.id}`]).length + PHRASES.filter((p) => S.items[`p:${p.id}`]).length;
  show(h('div', { class: 'pg' },
    h('div', { class: 'hh' }, h('p', { class: 'ey' }, 'Today'), h('button', { class: 'link', onclick: settings }, 'Settings')),
    due.length ? h('button', { class: 'card', onclick: warmup }, h('b', null, `Warm-up · ${S.settings.warm} minutes`), h('span', { class: 'hint' }, `${due.length} items from what you have learned, starting with the ones you missed.`)) : null,
    done
      ? h('div', { class: 'card main' }, h('b', null, 'Chapter 1 is complete'), h('span', { class: 'hint' }, 'Chapter 2 (I am ...) is being written. Until then, the warm-up and the kana trainer keep everything fresh, and you can learn more rows of letters ahead.'),
          h('button', { class: 'btn', style: { marginTop: '8px' }, onclick: kanaChart }, 'Open the kana trainer'))
      : h('div', { class: 'card main' }, h('b', null, `Chapter 1 · ${st.title}`), h('span', { class: 'hint' }, `Step ${S.step + 1} of ${STEPS.length} · ${st.sub} · about ${st.mins} minutes`),
          h('div', { class: 'dots', style: { margin: '6px 0 2px' } }, ...STEPS.map((_, i) => h('i', { class: i < S.step ? 'on' : '' }))),
          h('button', { class: 'btn', style: { marginTop: '8px' }, onclick: startStep }, S.step === 0 && S.pos === 0 ? 'Start' : 'Continue')),
    h('p', { class: 'ey', style: { marginTop: '6px' } }, 'Study tools'),
    h('div', { class: 'tg' },
      h('button', { class: 'tl', onclick: kanaChart }, icon(ICONS.kana), h('b', null, 'Kana'), h('small', null, `${S.kana.length} of ${ALL.length}`)),
      wordsMet ? h('button', { class: 'tl', onclick: wordList }, icon(ICONS.words), h('b', null, 'Words'), h('small', null, String(wordsMet))) : null),
    h('p', { class: 'hint c' }, 'More tools appear as you learn enough to use them.')));
  nav.home = true;
}

/* ---------- chapter steps ---------- */
function startStep() {
  const n = S.step;
  if (n >= STEPS.length) return home();
  if (S.pos === 0) { S.base = [...S.kana]; save(); }
  runSession({ cards: stepCards(n, S.base), start: S.pos, onPos: (i) => { S.pos = i; save(); }, onExit: home, onDone: (stats) => {
    learnKana([...STEP_KANA[n]]);
    S.step = n + 1; S.pos = 0; save(); sfx('done');
    if (S.step >= STEPS.length) chapterResult(stats); else stepDone(n);
  } });
}
function stepDone(n: number) {
  const st = STEPS[n];
  show(h('div', { class: 'pg' }, h('div', { class: 'mid' },
    h('p', { class: 'ey' }, `Step ${n + 1} of ${STEPS.length} finished`), h('h2', { class: 'lt' }, st.can),
    h('div', { class: 'dots' }, ...STEPS.map((_, i) => h('i', { class: i <= n ? 'on' : '' }))),
    h('p', { class: 'p muted' }, st.next))),
  h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: startStep }, `Continue to Step ${n + 2}`), h('button', { class: 'link c', onclick: home }, 'Stop here for today')));
}
const label = (item: string) => { const [k, id] = item.split(':'); return k === 'k' ? id : k === 'w' ? `${L[id].ja} (${L[id].en})` : L[id].chunks.map((c) => c[1]).join(' '); };
function chapterResult(stats: Stats) {
  const missed = Object.keys(S.items).filter(weak).slice(0, 4);
  show(h('div', { class: 'pg' },
    h('p', { class: 'ey' }, 'Chapter 1 complete'), h('h2', { class: 'lt' }, 'You can now'),
    h('ul', { class: 'list p' }, h('li', null, 'Greet, thank and get someone’s attention politely'), h('li', null, 'Read and write 10 hiragana'), h('li', null, 'Read and spell 6 words')),
    h('div', { class: 'kg5', lang: 'ja' }, ...[...'あいうえおかきくけこ'].map((k) => h('span', null, k))),
    stats.asked ? h('p', { class: 'hint' }, `Chapter check: ${stats.right} of ${stats.asked} right on the first try.`) : null,
    missed.length ? h('div', { class: 'res' }, h('span', { class: 'ey' }, 'Worth another look'), h('span', { class: 'p' }, missed.map(label).join(' · ')), h('span', { class: 'hint' }, 'These open tomorrow’s warm-up.')) : null),
  h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: signMoment }, 'Next')));
}
function signMoment() {
  show(h('div', { class: 'pg' }, ill('sign'),
    h('p', { class: 'ey' }, 'Something real'), h('h2', { class: 'lt', style: { fontSize: '1.3rem' } }, 'You can read this sign'),
    h('p', { class: 'p' }, 'Station signs in Japan show the name in hiragana. Every letter on this one is yours: ', jp('あ · お · き'), '. It says Aoki.')),
  h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: home }, 'Done for today')));
}

/* ---------- warm-up ---------- */
function warmup() {
  const cards = dueItems(warmCap()).map(quizFor).filter((c): c is Card => !!c);
  if (!cards.length) { S.warmDay = today(); save(); return home(); }
  runSession({ cards, onExit: home, onDone: (stats) => {
    S.warmDay = today(); save(); sfx('done');
    show(h('div', { class: 'pg' }, h('div', { class: 'mid' }, h('p', { class: 'ey' }, 'Warm-up finished'),
      h('h2', { class: 'lt' }, `${stats.asked} items, ${stats.right} right first time`),
      stats.missed.length ? h('p', { class: 'p muted' }, `${stats.missed.map(label).join(' and ')} will come back tomorrow.`) : h('p', { class: 'p muted' }, 'Nothing needs another look today.'))),
    h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: home }, 'Continue')));
  } });
}

/* ---------- kana trainer ---------- */
const CHART = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や ゆ よ', 'らりるれろ', 'わ を ん'];
function nextRow() { return ROWS.findIndex((r) => r.some((k) => !knows(k.k))); }
export function kanaChart() {
  const nr = nextRow();
  show(top('Kana'), h('div', { class: 'pg' },
    h('div', { class: 'kc', lang: 'ja' }, ...CHART.flatMap((r) => [...r].map((k) => (k === ' ' ? h('span', null)
      : h('button', { class: knows(k) ? (weak(`k:${k}`) ? 'wk' : '') : 'un', 'aria-label': `${k}, ${kanaOf(k).r}`, onclick: () => kanaPage(k) }, k))))),
    h('p', { class: 'hint c' }, 'Dark: you know it. Outlined: needs work. Grey: not yet. Tap any letter.')),
  h('div', { class: 'ft' },
    S.kana.length >= 3 ? h('button', { class: 'btn', onclick: practice }, 'Practise what I know') : null,
    nr >= 0 ? h('button', { class: S.kana.length >= 3 ? 'link c' : 'btn', onclick: () => learnRow(nr) }, `Learn the next row: the ${ROW_NAMES[nr]}`) : null));
}
function kanaPage(k: string) {
  const d = kanaOf(k), words = WORDS.filter((w) => L[w.id].ja.includes(k) && S.items[`w:${w.id}`]);
  const slot = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
  const strokes = () => slot.replaceChildren(strokeAnim(k), h('p', { class: 'hint c' }, 'Tap the letter to watch again.'));
  const write = () => {
    const res = h('div', null), pad = writePad(k, true);
    slot.replaceChildren(pad.el, res, h('div', { class: 'row' },
      h('button', { class: 'btn ghost', onclick: () => { pad.clear(); res.replaceChildren(); } }, 'Clear'),
      h('button', { class: 'btn ghost', onclick: () => { const v = pad.check(); sfx(v.ok ? 'good' : 'bad'); res.replaceChildren(fb(v.ok, v.msg)); } }, 'Check')));
  };
  show(top('Kana', kanaChart), h('div', { class: 'pg' },
    h('div', { class: 'kbig jp', lang: 'ja' }, k), h('p', { class: 'p c' }, h('b', null, d.r), d.sound ? ` · ${d.sound}` : ''),
    h('div', { class: 'row c' }, h('button', { class: 'play', 'aria-label': 'Play', onclick: () => sayKana(k) }, '▶'), h('button', { class: 'play', 'aria-label': 'Play slowly', onclick: () => sayKana(k, true) }, '½')),
    h('div', { class: 'note' }, h('p', null, h('b', null, 'Memory hook. '), d.hook)),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: strokes }, 'Watch the strokes'), h('button', { class: 'btn ghost', onclick: write }, 'Write it')),
    slot,
    words.length ? h('p', { class: 'ey' }, 'Words you know with it') : null,
    ...words.map((w) => h('button', { class: 'wr', onclick: () => sayLine(w.id) }, ill(w.scene), h('b', { lang: 'ja' }, L[w.id].ja), h('span', null, L[w.id].en))),
    d.like ? h('p', { class: 'hint' }, 'Often mixed up with ', jp(d.like), '. ', h('button', { class: 'link', onclick: () => kanaPage(d.like!) }, `See ${d.like}`)) : null));
  sayKana(k);
}
function practice() {
  const known = S.kana, weakFirst = [...known].sort((a, b) => Number(weak(`k:${b}`)) - Number(weak(`k:${a}`)));
  const ks = [...weakFirst.slice(0, 6), ...pick(known, 10)].slice(0, 14);
  const cards: Card[] = shuffle(ks.map((k, i) => (i % 4 === 0 ? recallSound(k) : i % 4 === 1 ? recallLetter(k) : i % 4 === 2 ? typeSound(k, { item: `k:${k}` }) : writeKana(k, 'free'))));
  const ws = WORDS.filter((w) => S.items[`w:${w.id}`] && [...L[w.id].ja].every(knows));
  cards.push(...pick(ws, 3).map((w, i) => spell(w.id, i % 2 ? 'audio' : 'pic')));
  runSession({ cards: shuffle(cards), onExit: kanaChart, onDone: (stats) => {
    sfx('done');
    show(h('div', { class: 'pg' }, h('div', { class: 'mid' }, h('p', { class: 'ey' }, 'Practice finished'), h('h2', { class: 'lt' }, `${stats.right} of ${stats.asked} right first time`),
      h('p', { class: 'p muted' }, stats.missed.length ? `Worth another look: ${stats.missed.map(label).join(' · ')}` : 'Every letter was right first time.'))),
    h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: kanaChart }, 'Back to the chart')));
  } });
}
function learnRow(i: number) {
  const row = ROWS[i].map((k) => k.k), before = [...S.kana];
  runSession({ cards: kanaLesson(row, before, before), onExit: kanaChart, onDone: () => {
    learnKana(row); sfx('done');
    show(h('div', { class: 'pg' }, h('div', { class: 'mid' }, h('p', { class: 'ey' }, 'Row finished'), h('h2', { class: 'lt' }, `You can read and write the ${ROW_NAMES[i]}`),
      h('div', { class: 'kg5', lang: 'ja' }, ...row.map((k) => h('span', null, k))), h('p', { class: 'p muted' }, 'These letters now count in your chapters and your warm-up.'))),
    h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: kanaChart }, 'Back to the chart')));
  } });
}

/* ---------- words ---------- */
function wordList() {
  const ws = WORDS.filter((w) => S.items[`w:${w.id}`]), ps = PHRASES.filter((p) => S.items[`p:${p.id}`]);
  show(top('Words'), h('div', { class: 'pg' },
    ps.length ? h('p', { class: 'ey' }, 'Phrases') : null,
    ...ps.map((p) => h('button', { class: 'wr', onclick: () => sayLine(p.id) }, ill(p.scene), h('span', { style: { display: 'flex', flexDirection: 'column', color: 'var(--fg)' } }, h('b', { style: { fontFamily: 'var(--en)', fontSize: '1rem', fontWeight: '700' } }, L[p.id].chunks.map((c) => c[1]).join(' ')), h('small', { class: 'hint' }, L[p.id].en)))),
    ws.length ? h('p', { class: 'ey', style: { marginTop: '8px' } }, 'Words') : null,
    ...ws.map((w) => h('button', { class: 'wr', onclick: () => sayLine(w.id) }, ill(w.scene), h('b', { lang: 'ja' }, L[w.id].ja), h('span', null, L[w.id].en))),
    h('p', { class: 'hint c' }, 'Tap any line to hear it.')),
  ws.length >= 2 ? h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: () => runSession({ cards: shuffle(ws).map((w, i) => spell(w.id, i % 2 ? 'audio' : 'pic')), onExit: wordList, onDone: wordList }) }, 'Quiz me on the words')) : null);
}

/* ---------- level check ---------- */
function levelCheck() {
  const got: string[] = [];
  const cards = ALL.map((k): Card => typeSound(k.k, { onResult: (ok) => { if (ok) got.push(k.k); }, skip: (run) => run.next() }));
  runSession({ cards, onExit: () => (S.started ? home() : welcome()), onDone: () => {
    learnKana(got); got.forEach((k) => grade(`k:${k}`, true)); S.started = true; save();
    show(h('div', { class: 'pg' }, h('div', { class: 'mid' }, h('p', { class: 'ey' }, 'Level check finished'), h('h2', { class: 'lt' }, `You know ${got.length} of ${ALL.length} hiragana`),
      h('p', { class: 'p muted' }, got.length ? 'The chapters will skip teaching those letters and keep the greetings, words and speaking. The letters stay in your warm-up so they do not fade.' : 'No problem. The chapters teach every letter from the start.'))),
    h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: home }, 'Go to my course')));
  } });
}

/* ---------- settings ---------- */
function seg<T extends string | number | boolean>(cur: T, choices: [T, string][], set: (v: T) => void) {
  return h('div', { class: 'seg', role: 'group' }, ...choices.map(([v, name]) => h('button', { 'aria-pressed': String(v === cur), onclick: () => { set(v); save(); applySettings(); settings(); } }, name)));
}
function settings() {
  const s = S.settings, onOff: [boolean, string][] = [[true, 'On'], [false, 'Off']];
  let armed = false;
  const wipe = h('button', { class: 'link c', onclick: () => { if (!armed) { armed = true; wipe.textContent = 'Tap again to erase all progress'; return; } reset(); applySettings(); welcome(); } }, 'Start over from the beginning');
  show(top('Settings'), h('div', { class: 'pg' },
    h('div', { class: 'li' }, 'Theme', seg(s.theme, [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], (v) => { s.theme = v; })),
    h('div', { class: 'li' }, 'Text size', seg(s.text, [[0, 'A'], [1, 'A+'], [2, 'A++']], (v) => { s.text = v; })),
    h('div', { class: 'li' }, 'Daily warm-up', seg(s.warm, [[3, '3 min'], [5, '5 min'], [10, '10 min']], (v) => { s.warm = v; })),
    h('div', { class: 'li' }, 'Speech check', seg(s.speech, onOff, (v) => { s.speech = v; })),
    h('div', { class: 'li' }, 'Writing check', seg(s.strict, [[false, 'Normal'], [true, 'Strict']], (v) => { s.strict = v; })),
    h('div', { class: 'li' }, 'Sound effects', seg(s.sfx, onOff, (v) => { s.sfx = v; })),
    h('div', { class: 'li' }, 'Movement', seg(s.motion, onOff, (v) => { s.motion = v; })),
    h('button', { class: 'link c', onclick: levelCheck }, 'Take the level check'),
    wipe,
    h('p', { class: 'hint' }, 'Your progress is kept on this phone only. Stroke order data: KanjiVG, by Ulrich Apel (CC BY-SA 3.0). Voices: Nanami and Keita.'),
    h('p', { class: 'hint' }, `Version ${__APP_VERSION__}`)));
}
