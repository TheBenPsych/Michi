/** The screens around the lessons: welcome, today, chapter cover, step results, warm-up, kana trainer, words, level check and Me. */
import { h, jp, ic } from './ui';
import { show, runSession, Stats, Card, nav, tagEl, Tag } from './engine';
import { S, save, reset, learnKana, knows, dueItems, today, weak, grade } from './store';
import { STEPS, STEP_KANA, WORDS, L, PHRASES, Scene } from './data/content';
import { ROWS, ALL, kanaOf, ROW_NAMES } from './data/kana';
import { stepCards, kanaLesson } from './lessons';
import { quizFor, recallSound, recallLetter, writeKana, spell, typeSound, shuffle, pick } from './cards';
import { ill } from './art';
import { sayLine, sayKana, sfx } from './audio';
import { strokeAnim } from './strokes';
import { writePad } from './pad';
import { fb } from './engine';

const top = (title: string, back: () => void = home) => h('div', { class: 'top' }, h('button', { class: 'x', 'aria-label': 'Back', onclick: back }, ic('back', '')), h('h2', null, title), h('span', { class: 'sp' }));
/** The bottom bar on the five main screens. */
type TabName = 'today' | 'course' | 'kana' | 'words' | 'me';
const tabs = (cur: TabName) => h('nav', { class: 'tabs', 'aria-label': 'Main' }, ...([
  ['today', 'Today', ic('home'), home], ['course', 'Course', ic('book'), chapterCover], ['kana', 'Kana', h('span', { class: 'ka', 'aria-hidden': 'true' }, 'あ'), kanaChart],
  ['words', 'Words', ic('cards'), wordList], ['me', 'Me', ic('user'), me],
] as [TabName, string, Node, () => void][]).map(([k, name, icon, go]) => h('button', { 'aria-current': k === cur ? 'page' : null, onclick: () => { if (k !== cur) go(); } }, icon, name)));
const SEAL = ['一', '二', '三', '四', '五'];
const STEP_SCENE: Scene[] = ['morning', 'house', 'gift', 'face', 'excuse'];
const STEP_TAGS: Tag[][] = [['listen'], ['read'], ['speak', 'listen'], ['read'], ['speak', 'read']];
const CHAPTER = { title: 'First words', can: 'greet people, say thank you and excuse me, and read ten letters',
  story: 'Mika has just moved to a small street in Tokyo. On her first morning she meets Mr Sato from next door, and has no idea what to say.' };
const segs = (n: number, on: number) => h('div', { class: 'segs', 'aria-hidden': 'true' }, ...Array.from({ length: n }, (_, i) => h('i', { class: i < on ? 'on' : '' })));
export function applySettings() {
  const dark = S.settings.theme === 'dark' || (S.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.setProperty('--fs', ['16px', '18px', '20px'][S.settings.text]);
}


/* ---------- welcome ---------- */
export function welcome() {
  const feat = (cls: string, icon: string, text: string) => h('div', { class: 'row', style: { gap: '12px' } }, h('span', { class: `ib ${cls}`, style: { width: '36px', height: '36px', borderRadius: '12px', display: 'grid', placeItems: 'center' } }, ic(icon)), h('span', null, text));
  show(h('div', { class: 'pg' },
    h('div', { style: { position: 'relative' } }, ill('morning'), h('span', { class: 'jp', 'aria-hidden': 'true', style: { position: 'absolute', left: '14px', top: '14px', width: '54px', height: '54px', borderRadius: '18px', background: 'var(--accent)', color: 'var(--on-accent)', display: 'grid', placeItems: 'center', fontSize: '30px', fontWeight: '700', boxShadow: '0 6px 16px rgba(0,0,0,.18)' } }, '教')),
    h('p', { class: 'ey', style: { marginTop: '8px' } }, 'Kyōhon'),
    h('h1', { class: 'lt', style: { fontSize: '1.85rem', lineHeight: '1.15', letterSpacing: '-.015em' } }, 'Learn Japanese properly, a few minutes at a time.'),
    feat('listen', 'ear', 'Hear real Japanese voices'), feat('speak', 'mic', 'Speak, and see what was understood'), feat('read', 'pen', 'Write every letter with your finger')),
  h('div', { class: 'ft' },
    h('button', { class: 'btn', onclick: () => { S.started = true; save(); startStep(); } }, 'Start with your first word'),
    h('button', { class: 'link c', onclick: levelCheck }, 'I already know some Japanese'),
    h('p', { class: 'hint c' }, 'No account. Everything stays on your phone.')));
  nav.home = true;
}

/* ---------- today ---------- */
const warmCap = () => S.settings.warm * 4;
const part = () => { const hr = new Date().getHours(); return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; };
export function home() {
  if (!S.started) return welcome();
  const due = S.warmDay === today() ? [] : dueItems(warmCap());
  const done = S.step >= STEPS.length, n = Math.min(S.step, STEPS.length - 1), st = STEPS[n];
  const hero = done
    ? h('div', { class: 'hero' }, ill('sign'), h('div', { class: 'in2' }, h('p', { class: 'ey' }, 'Chapter 1 · complete'), h('h2', null, 'Chapter 2 is being written'),
        h('p', { class: 'hint' }, 'Until then, the warm-up and the kana trainer keep everything fresh, and you can learn more rows of letters ahead.'),
        h('button', { class: 'btn', onclick: kanaChart }, 'Open the kana trainer')))
    : h('div', { class: 'hero' }, ill(STEP_SCENE[n]), h('div', { class: 'in2' },
        h('div', { class: 'hh' }, h('p', { class: 'ey' }, 'Up next · Chapter 1'), h('span', { class: 'hint' }, `Step ${n + 1} of ${STEPS.length}`)),
        h('h2', null, st.title),
        h('div', { class: 'chips' }, h('span', { class: 'chip' }, `${st.mins} min`), ...STEP_TAGS[n].map(tagEl)),
        segs(STEPS.length, S.step),
        h('button', { class: 'btn', onclick: startStep }, S.step === 0 && S.pos === 0 ? 'Start' : 'Continue')));
  show(h('div', { class: 'pg' },
    h('div', { class: 'hello' }, h('div', null, h('p', { class: 'ey', style: { color: 'var(--muted)' } }, new Date().toLocaleDateString('en', { weekday: 'long' })), h('h1', null, part()))),
    hero,
    due.length ? h('button', { class: 'rowcard', onclick: warmIntro }, h('span', { class: 'ib good' }, ic('redo')),
      h('span', { class: 'tx' }, h('b', null, `Warm-up · ${S.settings.warm} min`), h('span', { class: 'hint' }, `${due.length} items, the tricky ones first`)), ic('chev')) : null,
    h('button', { class: 'card', style: { gap: '12px', textAlign: 'left' }, onclick: kanaChart },
      h('span', { class: 'hh' }, h('b', null, 'Your letters'), h('span', { class: 'hint' }, `${S.kana.length} of ${ALL.length}`)),
      h('span', { class: 'mini', lang: 'ja', 'aria-hidden': 'true' }, ...ALL.map((k) => h('span', { class: knows(k.k) ? 'on' : '' }, k.k))))),
  tabs('today'));
  nav.home = true;
}

/* ---------- chapter cover (Course) ---------- */
function chapterCover() {
  const done = S.step >= STEPS.length;
  show(h('div', { class: 'pg' },
    h('div', { class: 'cover' }, ill('morning')),
    h('p', { class: 'ey' }, 'Chapter 1'), h('h1', { class: 'lt', style: { fontSize: '1.75rem' } }, CHAPTER.title),
    h('p', { class: 'story' }, CHAPTER.story),
    h('p', { class: 'p' }, h('b', null, 'By the end '), `you can ${CHAPTER.can}.`),
    h('ol', { class: 'steps' }, ...STEPS.map((st, i) => {
      const state = i < S.step ? 'done' : i === S.step ? 'now' : 'next';
      return h('li', { class: state }, h('span', { class: 'n' }, state === 'done' ? ic('check', '') : String(i + 1)),
        h('span', { class: 't' }, h('b', null, st.title), h('small', null, st.sub)), h('span', { class: 'hint' }, state === 'now' ? `${st.mins} min` : state === 'done' ? 'Done' : ''));
    }))),
  done ? null : h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: startStep }, S.step === 0 && S.pos === 0 ? 'Start step 1' : `Continue step ${S.step + 1}`)),
  tabs('course'));
}

/* ---------- chapter steps ---------- */
function startStep() {
  const n = S.step;
  if (n >= STEPS.length) return home();
  if (S.pos === 0) { S.base = [...S.kana]; save(); }
  const t0 = Date.now();
  runSession({ cards: stepCards(n, S.base), start: S.pos, onPos: (i) => { S.pos = i; save(); }, onExit: home, onDone: (stats) => {
    const fresh = [...STEP_KANA[n]].filter((k) => !S.base.includes(k)).length;
    learnKana([...STEP_KANA[n]]);
    S.step = n + 1; S.pos = 0; save(); sfx('done');
    if (S.step >= STEPS.length) chapterResult(stats); else stepDone(n, stats, fresh, Math.max(1, Math.round((Date.now() - t0) / 60000)));
  } });
}
function stepDone(n: number, stats: Stats, letters: number, mins: number) {
  const st = STEPS[n];
  show(h('div', { class: 'pg' }, h('div', { class: 'mid', style: { alignItems: 'center', textAlign: 'center' } },
    h('div', { class: 'seal', 'aria-hidden': 'true' }, SEAL[n]),
    h('p', { class: 'ey' }, `Step ${n + 1} of ${STEPS.length} · done`), h('h2', { class: 'lt' }, st.title),
    h('p', { class: 'p muted' }, `${st.can}.`),
    h('div', { class: 'card stats', style: { width: '100%' } },
      h('div', null, h('b', null, `${stats.right}/${stats.asked}`), h('span', null, 'right first time')),
      h('div', null, h('b', null, String(letters)), h('span', null, letters === 1 ? 'new letter' : 'new letters')),
      h('div', null, h('b', null, `${mins} min`), h('span', null, 'spent'))),
    h('p', { class: 'hint' }, st.next))),
  h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: startStep }, `Continue to step ${n + 2}`), h('button', { class: 'link c', onclick: home }, 'Stop here for today')));
}
const label = (item: string) => { const [k, id] = item.split(':'); return k === 'k' ? id : k === 'w' ? `${L[id].ja} (${L[id].en})` : L[id].chunks.map((c) => c[1]).join(' ').replace(/^./, (c) => c.toUpperCase()); };
function chapterResult(stats: Stats) {
  const missed = Object.keys(S.items).filter(weak).slice(0, 4);
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  show(h('div', { class: 'pg' },
    h('div', { class: 'cert' },
      h('p', { class: 'ey', style: { color: 'var(--muted)' } }, 'Chapter 1 · complete'), h('h2', { class: 'lt' }, CHAPTER.title),
      h('p', { class: 'p muted' }, `You can now ${CHAPTER.can}.`),
      h('div', { class: 'kg5', lang: 'ja', style: { width: '100%' } }, ...[...'あいうえおかきくけこ'].map((k) => h('span', null, k))),
      h('div', { class: 'foot' }, h('span', { class: 'hint', style: { textAlign: 'left' } }, 'Finished', h('br'), h('b', { style: { color: 'var(--fg)' } }, date)), h('div', { class: 'seal sm', 'aria-hidden': 'true' }, '一'))),
    stats.asked ? h('p', { class: 'hint c' }, `Chapter check: ${stats.right} of ${stats.asked} right on the first try.`) : null,
    missed.length ? h('div', { class: 'res' }, h('span', { class: 'ey' }, 'Worth another look'), h('span', { class: 'p' }, missed.map(label).join(' · ')), h('span', { class: 'hint' }, 'These open tomorrow’s warm-up.')) : null),
  h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: signMoment }, 'Next')));
}
function signMoment() {
  show(h('div', { class: 'pg' }, ill('sign'),
    h('span', { class: 'tag', style: { background: 'var(--goodbg)', color: 'var(--good)' } }, 'Real Japan'), h('h2', { class: 'lt', style: { fontSize: '1.3rem' } }, 'You can read this sign'),
    h('p', { class: 'p' }, 'Station signs in Japan show the name in hiragana. Every letter on this one is yours: ', jp('あ · お · き'), '. It says Aoki.')),
  h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: home }, 'Done for today')));
}

/* ---------- warm-up ---------- */
function warmIntro() {
  const due = dueItems(warmCap()), count = (k: string) => due.filter((d) => d.startsWith(k + ':')).length;
  const kinds: [string, string, string, number][] = [['listen', 'sound', 'phrases to hear', count('p')], ['read', 'pen', 'letters to read and write', count('k')], ['read', 'cards', 'words to spell', count('w')]];
  show(h('div', { class: 'top' }, h('button', { class: 'x', 'aria-label': 'Close', onclick: home }, ic('close', '')), h('span', { style: { flex: '1' } })),
    h('div', { class: 'pg' },
      h('p', { class: 'ey', style: { color: 'var(--good)' } }, 'Before you continue'), h('h1', { class: 'lt', style: { fontSize: '1.75rem' } }, 'Warm-up'),
      h('p', { class: 'p muted' }, 'A short look back at things you are about to forget.'),
      h('div', { class: 'radio', role: 'group', 'aria-label': 'Length' }, ...([3, 5, 10] as const).map((m) => h('button', { 'aria-pressed': String(S.settings.warm === m), onclick: () => { S.settings.warm = m; save(); warmIntro(); } }, `${m} min`))),
      h('div', { class: 'list2' }, ...kinds.filter((k) => k[3]).map(([c, icon, t, n]) => h('div', { class: 'rowcard', style: { boxShadow: 'none', borderRadius: '0' } }, h('span', { class: `ib ${c}` }, ic(icon)), h('span', { class: 'tx' }, h('b', null, `${n} ${t}`))))),
      h('p', { class: 'hint c' }, 'Missed ones come first. It never grows into a pile, however long you were away.')),
    h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: warmup }, 'Start warm-up')));
}
function warmup() {
  const cards = dueItems(warmCap()).map(quizFor).filter((c): c is Card => !!c);
  if (!cards.length) { S.warmDay = today(); save(); return home(); }
  runSession({ cards, onExit: home, onDone: (stats) => {
    S.warmDay = today(); save(); sfx('done');
    show(h('div', { class: 'pg' }, h('div', { class: 'mid', style: { alignItems: 'center', textAlign: 'center' } }, h('span', { class: 'ib good', style: { width: '64px', height: '64px', borderRadius: '50%', display: 'grid', placeItems: 'center' } }, ic('check')), h('p', { class: 'ey' }, 'Warm-up finished'),
      h('h2', { class: 'lt' }, `${stats.asked} items, ${stats.right} right first time`),
      stats.missed.length ? h('p', { class: 'p muted' }, `Coming back tomorrow: ${stats.missed.map(label).join(' · ')}`) : h('p', { class: 'p muted' }, 'Nothing needs another look today.'))),
    h('div', { class: 'ft' }, h('button', { class: 'btn', onclick: home }, 'Continue')));
  } });
}

/* ---------- kana trainer ---------- */
const CHART = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や ゆ よ', 'らりるれろ', 'わ を ん'];
function nextRow() { return ROWS.findIndex((r) => r.some((k) => !knows(k.k))); }
const sure = (k: string) => { const it = S.items[`k:${k}`]; return it ? Math.min(3, 1 + it.box) : 0; };
export function kanaChart() {
  const nr = nextRow();
  show(h('div', { class: 'pg' },
    h('div', { class: 'hello' }, h('h1', null, 'Kana'), h('span', { class: 'hint' }, `${S.kana.length} of ${ALL.length} met`)),
    h('div', { class: 'kc', lang: 'ja' }, ...CHART.flatMap((r) => [...r].map((k) => (k === ' ' ? h('span', null)
      : h('button', { class: knows(k) ? (weak(`k:${k}`) ? 'wk' : '') : 'un', 'aria-label': `${k}, ${kanaOf(k).r}`, onclick: () => kanaPage(k) }, h('span', null, k),
          knows(k) ? h('span', { class: 'dots3', 'aria-hidden': 'true' }, ...[0, 1, 2].map((d) => h('i', { class: d < sure(k) ? 'on' : '' }))) : null))))),
    h('p', { class: 'hint c' }, 'The dots show how sure you are. Outlined letters need work. Tap any letter.'),
    h('div', { class: 'row' },
      S.kana.length >= 3 ? h('button', { class: 'btn ghost', onclick: practice }, 'Practise') : null,
      nr >= 0 ? h('button', { class: 'btn', style: { padding: '12px 10px', fontSize: '.92rem' }, onclick: () => learnRow(nr) }, `Learn ahead: ${ROW_NAMES[nr]}`) : null)),
  tabs('kana'));
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
  show(h('div', { class: 'pg' },
    h('div', { class: 'hello' }, h('h1', null, 'Words'), h('span', { class: 'hint' }, `${ws.length} words · ${ps.length} phrases`)),
    !ws.length && !ps.length ? h('p', { class: 'p muted' }, 'Words and phrases appear here as you meet them in the chapters.') : null,
    ws.length ? h('div', { class: 'wg' }, ...ws.map((w) => h('button', { class: 'wc', onclick: () => sayLine(w.id) }, ill(w.scene), h('b', { lang: 'ja' }, L[w.id].ja), h('small', null, L[w.id].en), h('span', { class: 'pb' }, ic('sound', ''))))) : null,
    ps.length ? h('p', { class: 'ey', style: { marginTop: '6px' } }, 'Phrases') : null,
    ps.length ? h('div', { class: 'list2' }, ...ps.map((p) => h('button', { class: 'rowcard', style: { boxShadow: 'none', borderRadius: '0' }, onclick: () => sayLine(p.id) },
      h('span', { class: 'ib listen' }, ic('sound')), h('span', { class: 'tx' }, h('b', null, label(`p:${p.id}`)), h('span', { class: 'hint' }, L[p.id].en))))) : null,
    ws.length >= 2 ? h('button', { class: 'btn ghost', onclick: () => runSession({ cards: shuffle(ws).map((w, i) => spell(w.id, i % 2 ? 'audio' : 'pic')), onExit: wordList, onDone: wordList }) }, 'Quiz me on the words') : null),
  tabs('words'));
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


/* ---------- settings controls ---------- */
function seg<T extends string | number | boolean>(cur: T, choices: [T, string][], set: (v: T) => void) {
  return h('div', { class: 'seg', role: 'group' }, ...choices.map(([v, name]) => h('button', { 'aria-pressed': String(v === cur), onclick: () => { set(v); save(); applySettings(); me(); } }, name)));
}

/* ---------- me (progress and settings) ---------- */
function me() {
  const s = S.settings, onOff: [boolean, string][] = [[true, 'On'], [false, 'Off']];
  const wordsMet = WORDS.filter((w) => S.items[`w:${w.id}`]).length + PHRASES.filter((p) => S.items[`p:${p.id}`]).length;
  let armed = false;
  const wipe = h('button', { class: 'link c', onclick: () => { if (!armed) { armed = true; wipe.textContent = 'Tap again to erase all progress'; return; } reset(); applySettings(); welcome(); } }, 'Start over from the beginning');
  const li = (name: string, ctl: Node) => h('div', { class: 'li' }, name, ctl);
  const grp = (name: string, ...rows: Node[]) => h('div', { class: 'grp' }, h('span', null, name), h('div', { class: 'list2' }, ...rows));
  show(h('div', { class: 'pg' },
    h('div', { class: 'hello' }, h('h1', null, 'Me')),
    h('div', { class: 'card', style: { gap: '10px' } },
      h('div', { class: 'stats', style: { padding: '4px 0' } },
        h('div', null, h('b', null, String(S.kana.length)), h('span', null, 'letters')),
        h('div', null, h('b', null, String(wordsMet)), h('span', null, 'words and phrases')),
        h('div', null, h('b', null, `${Math.min(S.step, STEPS.length)}/${STEPS.length}`), h('span', null, 'steps of Chapter 1'))),
      h('span', { class: 'hint' }, 'Missing a day costs nothing. The warm-up picks up where you left off.')),
    grp('Study',
      li('Warm-up length', seg(s.warm, [[3, '3'], [5, '5'], [10, '10 min']], (v) => { s.warm = v; })),
      li('Check my speaking', seg(s.speech, onOff, (v) => { s.speech = v; })),
      li('Writing check', seg(s.strict, [[false, 'Normal'], [true, 'Strict']], (v) => { s.strict = v; }))),
    grp('Look and sound',
      li('Theme', seg(s.theme, [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], (v) => { s.theme = v; })),
      li('Text size', seg(s.text, [[0, 'A'], [1, 'A+'], [2, 'A++']], (v) => { s.text = v; })),
      li('Sound effects', seg(s.sfx, onOff, (v) => { s.sfx = v; })),
      li('Movement', seg(s.motion, onOff, (v) => { s.motion = v; }))),
    h('button', { class: 'link c', onclick: levelCheck }, 'Take the level check'),
    wipe,
    h('p', { class: 'hint' }, 'Your progress is kept on this phone only. Stroke order data: KanjiVG, by Ulrich Apel (CC BY-SA 3.0). Voices: Nanami and Keita.'),
    h('p', { class: 'hint' }, `Version ${__APP_VERSION__}`)),
  tabs('me'));
}
