// Study Desk: a calm, textbook-style way through Genki Lesson 1. No points or hearts: a checklist, finish seals,
// a notebook, and Tama the cat. Every section has a voice, and you speak and write in every part.
import './desk.css';
import { Capacitor } from '@capacitor/core';
import { h, jp, clear, append } from '../ui';
import { S, save, markActive, dayKey } from '../state';
import { say, sfx } from '../audio';
import { showFlow, showTab } from '../nav';
import { canListen, listenJa } from '../speech';
import { KANA_BY_ID } from '../data/kana';
import { intro, trace } from '../games';
import { shuffle } from '../lessonGen';
import { addTama } from './tama';
import { loadRecs, saveRec, canRecord, startRecording, playRec } from './rec';
import { LESSON, PARTS, SECTIONS, DIALOGUE, Section, PartId, Drill, Listen, DWord, voiceOfWho, sectionsOf, allWords } from './data';

const D = () => S.desk;
const native = Capacitor.isNativePlatform();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isDone = (s: Section) => !!D().done[s.id];
const partDone = (p: PartId) => sectionsOf(p).every(isDone);
const nextSection = () => SECTIONS.find((s) => !isDone(s));
const lessonDone = () => SECTIONS.every(isDone);
const goHome = () => showTab('home');

/** Say a line, and on the web wait about as long as it takes (the browser voice doesn't tell us when it ends). */
async function sayWait(text: string, kind: 'm' | 'f' = 'f', slow = false) {
  await say(text, slow, kind);
  if (!native) await sleep(text.length * (slow ? 240 : 170) + 350);
}
const play = (text: string, kind: 'm' | 'f' = 'f', label = 'Play') => h('button', { class: 'dk-play', 'aria-label': label, onclick: (e: Event) => { e.stopPropagation(); say(text, false, kind); } }, '▶');

// ---------- Speech checking (lenient: the recognizer often writes kanji, so map common lesson words back to kana) ----------
const KANJI: [string, string][] = ([
  ['初めまして', 'はじめまして'], ['留学生', 'りゅうがくせい'], ['高校生', 'こうこうせい'], ['大学生', 'だいがくせい'], ['電話番号', 'でんわばんごう'], ['日本語', 'にほんご'], ['日本人', 'にほんじん'],
  ['中国人', 'ちゅうごくじん'], ['中国', 'ちゅうごく'], ['韓国', 'かんこく'], ['英語', 'えいご'], ['日本', 'にほん'], ['学生', 'がくせい'], ['大学', 'だいがく'], ['先生', 'せんせい'], ['専攻', 'せんこう'],
  ['歴史', 'れきし'], ['経済', 'けいざい'], ['何時', 'なんじ'], ['何歳', 'なんさい'], ['何番', 'なんばん'], ['何', 'なん'], ['私', 'わたし'], ['電話', 'でんわ'], ['番号', 'ばんごう'], ['年生', 'ねんせい'],
  ['7時半', 'しちじはん'], ['七時半', 'しちじはん'], ['7時', 'しちじ'], ['今', 'いま'], ['人', 'じん'], ['時', 'じ'], ['半', 'はん'], ['歳', 'さい'], ['才', 'さい'], ['桜', 'さくら'], ['二', 'に'],
] as [string, string][]).sort((a, b) => b[0].length - a[0].length);
const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
export const norm = (s: string) => { let t = s; for (const [k, v] of KANJI) t = t.split(k).join(v); return toHira(t).replace(/[\s。、！？!?.,〜ー・「」]/g, ''); };
/** How much of `want` appears, in order, in `got` (0..1). */
export function overlap(got: string, want: string) {
  const a = norm(got), b = norm(want); if (!b) return 0;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length] / b.length;
}
export const heardOk = (heard: string[], keys: string[], full: string) =>
  heard.some((x) => keys.some((k) => norm(x).includes(norm(k))) || overlap(x, full) >= 0.75);

/** A mic button that listens once and reports what it heard. */
function micBtn(onHeard: (heard: string[]) => void, label = 'Tap and speak') {
  const b = h('button', { class: 'dk-mic', 'aria-label': label }, 'Speak');
  b.onclick = async () => {
    if (b.classList.contains('on')) return;
    if (!(await canListen())) { onHeard([]); return; }
    b.classList.add('on'); b.textContent = 'Listening';
    try { onHeard(await listenJa()); } catch { onHeard([]); }
    b.classList.remove('on'); b.textContent = 'Again';
  };
  return b;
}

// ---------- Frame: top bar, scrolling page, bottom bar, and Tama ----------
interface Frame { el: HTMLElement; body: HTMLElement; foot: HTMLElement }
function frame(title: string, right: string, kids: (Node | null)[], foot: (Node | null)[], onBack: () => void, opts: { progress?: number; cheer?: boolean; sleepy?: boolean } = {}): Frame {
  const body = h('div', { class: 'dk-body' }, kids);
  const ft = h('div', { class: 'dk-foot' }, foot);
  const el = h('div', { class: 'dk' },
    h('div', { class: 'dk-bar' }, h('button', { class: 'dk-x', 'aria-label': 'Close', onclick: onBack }, '✕'), h('div', { class: 't' }, title), h('small', null, right)),
    opts.progress != null ? h('div', { class: 'dk-prog' }, h('div', { style: { width: `${Math.round(opts.progress * 100)}%` } })) : null,
    body, h('div', { class: 'dk-lane', 'aria-hidden': 'true' }), ft);
  showFlow(el, onBack);
  addTama(el, ft, { cheer: opts.cheer, sleepy: opts.sleepy });
  return { el, body, foot: ft };
}

// ---------- Lesson page ----------
export function openDesk() {
  const next = nextSection();
  const doneN = SECTIONS.filter(isDone).length;
  const recs = loadRecs();
  const kids: (Node | null)[] = [
    h('div', null, h('div', { class: 'dk-lbl' }, `Study Desk · Genki I · Lesson ${LESSON.n}`), h('h1', { class: 'dk-h1 jp', lang: 'ja' }, LESSON.jp), h('div', { class: 'dk-mut' }, LESSON.title)),
    next ? h('div', { class: 'dk-box note' }, h('div', { class: 'dk-lbl' }, "Today's goal"), h('b', null, next.title), h('div', { class: 'dk-mut' }, `About ${next.min} minutes. Stop whenever you like: each section is saved when you finish it.`))
      : h('div', { class: 'dk-box ok' }, h('b', null, 'Lesson 1 complete'), h('div', { class: 'dk-mut' }, 'Your certificate is in your notebook. Redo any section whenever you like.')),
    h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'By the end you can'), LESSON.goals.map((g) => h('div', null, g))),
    !recs.first && canRecord() ? h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'Before you start (optional)'),
      h('div', null, 'Record yourself introducing yourself, any way you can. At the end of the lesson you will hear it next to your new one.'),
      h('div', null, h('button', { class: 'dk-btn sm', onclick: () => recordScreen('first', openDesk) }, 'Record day 1'))) : null,
    ...PARTS.map((p) => h('section', { class: 'dk-part' },
      h('h3', null, `${p.id} · ${p.title}`, h('span', { class: `seal mini ${partDone(p.id) ? '' : 'off'}`, 'aria-label': partDone(p.id) ? 'Part done' : 'Not done yet' }, p.seal.slice(0, 1))),
      sectionsOf(p.id).map((s) => h('button', { class: 'dk-check', onclick: () => startSection(s) },
        h('span', { class: `dk-dot ${isDone(s) ? 'done' : s === next ? 'now' : ''}` }, isDone(s) ? '✓' : ''), s.title, h('small', null, `${s.min} min`))))),
    weekBox(),
  ];
  frame('Genki I · Lesson 1', `${doneN} of ${SECTIONS.length} done`, kids,
    [h('button', { class: 'dk-btn', onclick: openNotebook }, 'Notebook'), next ? h('button', { class: 'dk-btn pri', onclick: () => startSection(next) }, 'Continue') : h('button', { class: 'dk-btn pri', onclick: certificate }, 'Certificate')],
    goHome, { sleepy: !next });
}

function weekBox() {
  const now = new Date(), monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
  const days = D().days.filter((d) => new Date(d) >= monday).length;
  const words = SECTIONS.filter((s) => s.kind === 'words' && isDone(s)).reduce((n, s) => n + (s.kind === 'words' ? s.words.length : 0), 0);
  const kana = SECTIONS.filter((s) => s.kind === 'kana' && isDone(s)).length * 5;
  return h('div', null, h('div', { class: 'dk-lbl', style: { marginBottom: '6px' } }, 'This week'),
    h('div', { class: 'dk-stats' }, [[days, `day${days === 1 ? '' : 's'} studied`], [words, 'words learned'], [kana, 'kana written'], [PARTS.filter((p) => partDone(p.id)).length, 'seals earned']]
      .map(([n, l]) => h('div', { class: 'dk-box' }, h('b', null, String(n)), h('span', { class: 'dk-mut' }, String(l))))));
}

// ---------- Running a section: a series of pages with Back / Next ----------
type Page = (next: () => void) => HTMLElement;
function runPages(s: Section, pages: Page[], i = 0) {
  const last = i === pages.length - 1;
  const go = (j: number) => runPages(s, pages, j);
  const next = () => (last ? finishSection(s) : go(i + 1));
  frame(s.title, `${i + 1} / ${pages.length}`, [pages[i](next)],
    [i > 0 ? h('button', { class: 'dk-btn', onclick: () => go(i - 1) }, 'Back') : null, h('button', { class: 'dk-btn pri', onclick: next }, last ? 'Finish' : 'Next')],
    openDesk, { progress: (i + 1) / pages.length });
}

export function startSection(s: Section) {
  sfx('tap');
  switch (s.kind) {
    case 'dialogue': return runPages(s, [dialogueIntro, dialoguePage, dialogueCheck]);
    case 'words': return runPages(s, [wordList(s.words, s.tip), flipCards(s.words), listenPick(s.words)]);
    case 'grammar': return runPages(s, [grammarNote(s), ...s.drills.map(drillPage)]);
    case 'culture': return runPages(s, [() => h('div', { class: 'dk-stage' }, h('div', { class: 'dk-lbl' }, 'Culture note'), ...s.text.map((t) => h('p', { style: { margin: '0 0 10px' } }, t)))]);
    case 'shadow': return runPages(s, [shadowIntro, ...DIALOGUE.map((l) => shadowPage(l.jp, l.rj, l.en, voiceOfWho(l.who)))]);
    case 'role': return runPages(s, s.turns.map((t, i) => rolePage(t, i)));
    case 'listen': return runPages(s, s.items.map(listenPage));
    case 'kana': return runPages(s, s.kana.flatMap((c) => { const k = KANA_BY_ID.get(`h:${c}`)!; return [(n: () => void) => intro(k, n).el, (n: () => void) => h('div', { class: 'dk-stage' }, h('div', { class: 'dk-lbl' }, `Write ${c}`), trace(k, n).el)]; }));
    case 'reading': return runPages(s, [readingPage(s)]);
    case 'fill': return runPages(s, s.items.map((f) => () => fillPage(f)));
    case 'write': return runPages(s, [writePage, () => recordInline()]);
    case 'cando': return runPages(s, [candoPage]);
  }
}

// ---------- Dialogue ----------
const dialogueIntro: Page = () => h('div', { class: 'dk-stage' },
  h('div', { class: 'dk-lbl' }, 'The scene'), h('p', null, 'A welcome party for new international students at Sakura University. Haruto, a Japanese student, meets Alex from Canada.'),
  h('div', { class: 'dk-box note' }, h('b', null, 'How to study it'), h('div', null, '1. Listen once without reading.'), h('div', null, '2. Read along with romaji and English.'), h('div', null, '3. Hide the English and listen again.')),
  h('button', { class: 'dk-btn', onclick: () => playAll() }, '▶ Listen without reading'));
async function playAll(slow = false) { for (const l of DIALOGUE) await sayWait(l.jp, voiceOfWho(l.who), slow); }
const shown = { kana: true, rj: true, en: false };
const dialoguePage: Page = () => {
  const wrap = h('div', { class: 'dk-stage' });
  const draw = () => clear(wrap).append(
    h('div', { class: 'dk-tog', role: 'group', 'aria-label': 'Show' }, (['kana', 'rj', 'en'] as const).map((k) => h('button', { 'aria-pressed': String(shown[k]), onclick: () => { shown[k] = !shown[k]; draw(); } }, k === 'kana' ? 'Kana' : k === 'rj' ? 'Romaji' : 'English'))),
    ...DIALOGUE.map((l) => h('div', { class: 'dk-line', style: { marginTop: '12px' } }, h('span', { class: 'dk-who' }, l.who),
      h('div', null, shown.kana ? jp(l.jp) : null, shown.rj ? h('div', { class: 'dk-rj' }, l.rj) : null, shown.en ? h('div', { class: 'dk-en' }, l.en) : null),
      play(l.jp, voiceOfWho(l.who)))),
    h('div', { class: 'dk-row', style: { marginTop: '14px' } }, h('button', { class: 'dk-btn sm', onclick: () => playAll() }, '▶ Play all'), h('button', { class: 'dk-btn sm', onclick: () => playAll(true) }, 'Slow')));
  draw(); return wrap;
};
const dialogueCheck: Page = () => h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, h('div', { class: 'dk-lbl' }, 'Did you follow it?'),
  choiceQ('Where is Alex from?', ['Canada', 'China', 'America'], 0), choiceQ('What is Alex’s major?', ['Economics', 'History', 'Japanese'], 1), choiceQ('What time is it?', ['7:00', '7:30', '9:30'], 1));

/** A small multiple-choice question that marks itself. */
function choiceQ(q: string, options: string[], a: number, onAnswer?: (ok: boolean) => void) {
  let answered = false;
  const btns = options.map((o, i) => h('button', { class: 'dk-opt', onclick: () => {
    if (answered) return; answered = true;
    btns[a].classList.add('right'); if (i !== a) btns[i].classList.add('wrong');
    sfx(i === a ? 'good' : 'bad'); onAnswer?.(i === a);
  } }, o));
  return h('div', null, h('b', null, q), h('div', { class: 'dk-opts', style: { marginTop: '8px' } }, btns));
}

// ---------- Words ----------
const wordList = (ws: DWord[], tip?: string[]): Page => () => h('div', null,
  h('div', { class: 'dk-mut' }, 'Tap ▶ and say each word out loud after the voice.'),
  ...ws.map((w) => h('div', { class: 'dk-word' }, h('div', { style: { flex: '1', minWidth: '0' } }, jp(w.jp), h('div', { class: 'dk-rj' }, `${w.rj} · ${w.en}`)), play(w.say ?? w.jp.replace('〜', '')))),
  tip ? h('div', { class: 'dk-box note', style: { marginTop: '12px' } }, h('div', { class: 'dk-lbl' }, 'Tip'), tip.map((t) => h('div', null, t))) : null);

const flipCards = (ws: DWord[]): Page => () => {
  let i = 0, flipped = false;
  const deck = shuffle([...ws]);
  const wrap = h('div', { class: 'dk-stage' });
  const draw = () => {
    const w = deck[i];
    clear(wrap).append(h('div', { class: 'dk-mut' }, `Card ${i + 1} of ${deck.length}. Say the meaning, then tap the card to check.`),
      h('button', { class: 'dk-card', style: { width: '100%', marginTop: '10px' }, onclick: () => { flipped = !flipped; if (flipped) say(w.say ?? w.jp.replace('〜', '')); draw(); } },
        flipped ? [jp(w.jp, 'dk-big'), h('div', { class: 'dk-rj' }, w.rj), h('b', null, w.en)] : [jp(w.jp, 'dk-big'), h('div', { class: 'dk-mut' }, 'Tap to flip')]),
      h('div', { class: 'dk-row', style: { marginTop: '10px' } }, h('button', { class: 'dk-btn', disabled: i === 0, onclick: () => { i--; flipped = false; draw(); } }, 'Previous card'),
        h('button', { class: 'dk-btn', disabled: i === deck.length - 1, onclick: () => { i++; flipped = false; draw(); } }, 'Next card')));
  };
  draw(); return wrap;
};

const listenPick = (ws: DWord[]): Page => () => {
  const qs = shuffle([...ws]).slice(0, 6);
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '16px' } }, h('div', { class: 'dk-mut' }, 'Listen, then pick the meaning.'),
    ...qs.map((w, n) => {
      const opts = shuffle([w, ...shuffle(ws.filter((x) => x !== w)).slice(0, 2)]);
      return h('div', null, h('div', { class: 'dk-row' }, play(w.say ?? w.jp.replace('〜', '')), h('b', null, `Word ${n + 1}`)),
        choiceQ('', opts.map((o) => o.en), opts.indexOf(w)));
    }));
};

// ---------- Grammar ----------
const grammarNote = (s: Extract<Section, { kind: 'grammar' }>): Page => () => h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
  h('div', { class: 'dk-big', lang: 'ja' }, s.note.pattern),
  ...s.note.plain.map((p) => h('p', { style: { margin: '0' } }, p)),
  h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'Examples'), s.note.examples.map((e) => h('div', { class: 'dk-row' }, h('div', { class: 'f' }, jp(e.jp), h('div', { class: 'dk-rj' }, `${e.rj} · ${e.en}`)), play(e.jp)))),
  h('div', { class: 'dk-box note' }, h('div', { class: 'dk-lbl' }, 'Watch out'), s.note.watch.map((w) => h('div', null, w))));

/** Say it (or tap it): the app listens, checks, and always shows the model answer afterwards. */
function sayOrPick(prompt: (Node | null)[], answer: { jp: string; rj: string; key: string[]; wrong: string[] }, kind: 'm' | 'f' = 'f') {
  const fb = h('div', { 'aria-live': 'polite' });
  let answered = false;
  const show = (ok: boolean, heard?: string) => {
    answered = true; sfx(ok ? 'good' : 'bad');
    clear(fb).append(h('div', { class: `dk-box ${ok ? 'ok' : 'bad'}` }, heard != null ? h('div', { class: 'dk-mut' }, `I heard: ${heard || '(nothing)'}`) : null,
      h('b', null, ok ? 'Right.' : 'Not quite. The answer is:'), h('div', { class: 'dk-row' }, h('div', { class: 'f' }, jp(answer.jp), h('div', { class: 'dk-rj' }, answer.rj)), play(answer.jp, kind))));
  };
  const opts = shuffle([answer.jp, ...answer.wrong]);
  const btns = opts.map((o) => h('button', { class: 'dk-opt jp', lang: 'ja', onclick: () => { if (answered) return; btns.forEach((b) => b.classList.toggle('right', b.textContent === answer.jp)); if (o !== answer.jp) btns[opts.indexOf(o)].classList.add('wrong'); show(o === answer.jp); } }, o));
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, ...prompt,
    micBtn((heard) => { if (!heard.length) { clear(fb).append(h('div', { class: 'dk-box' }, 'I could not hear anything. Try again, or tap an answer below.')); return; } show(heardOk(heard, answer.key, answer.jp), heard[0]); }),
    h('div', { class: 'dk-mut', style: { textAlign: 'center' } }, 'Say it out loud. Can’t talk right now? Tap the answer instead.'),
    h('div', { class: 'dk-opts' }, btns), fb);
}
const drillPage = (d: Drill): Page => () => sayOrPick([
  h('div', { class: 'dk-lbl' }, 'Say it in Japanese'),
  d.person ? h('div', { class: 'dk-box dk-person' }, h('span', { class: 'dk-av jp' }, d.person.name.slice(0, 1)), h('div', null, jp(d.person.name), h('div', { class: 'dk-mut' }, d.person.info))) : null,
  h('b', { style: { fontSize: '17px' } }, d.cue)], d);

// ---------- Speak & listen ----------
const shadowIntro: Page = () => h('div', { class: 'dk-stage' }, h('div', { class: 'dk-lbl' }, 'Shadowing'),
  h('p', null, 'Shadowing means repeating a line right after you hear it, copying the rhythm and the rise and fall of the voice. It is one of the fastest ways to start sounding natural.'),
  h('div', { class: 'dk-box note' }, h('div', null, '1. Tap ▶ and listen.'), h('div', null, '2. Tap Speak and say the same line.'), h('div', null, '3. Check what the app heard, and try again if you like.')));
const shadowPage = (jpText: string, rjText: string, en: string, kind: 'm' | 'f'): Page => () => {
  const fb = h('div', { 'aria-live': 'polite' });
  setTimeout(() => say(jpText, false, kind), 300);
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    h('div', { class: 'dk-box' }, jp(jpText, 'dk-big'), h('div', { class: 'dk-rj' }, rjText), h('div', { class: 'dk-en' }, en)),
    h('div', { class: 'dk-row' }, h('button', { class: 'dk-btn', onclick: () => say(jpText, false, kind) }, '▶ Model'), h('button', { class: 'dk-btn', onclick: () => say(jpText, true, kind) }, 'Slow')),
    micBtn((heard) => {
      if (!heard.length) return void clear(fb).append(h('div', { class: 'dk-box' }, 'Say it out loud anyway. When speech checking isn’t available, just tap Next.'));
      const score = Math.max(...heard.map((x) => overlap(x, jpText)));
      clear(fb).append(h('div', { class: `dk-box ${score >= 0.75 ? 'ok' : 'note'}` }, h('div', { class: 'dk-mut' }, `I heard: ${heard[0]}`),
        h('b', null, score >= 0.9 ? 'Spot on.' : score >= 0.75 ? 'Very close. Nice.' : 'Getting there. Listen to the model once more and try again.'),
        jpText.endsWith('か。') ? h('div', null, 'Remember: your voice rises on the か at the end of a question.') : null));
    }), fb);
};
const rolePage = (t: Extract<Section, { kind: 'role' }>['turns'][number], i: number): Page => () => {
  setTimeout(() => say(t.them, false, 'm'), 300);
  return sayOrPick([
    i === 0 ? h('div', { class: 'dk-mut' }, 'You play Alex. Haruto speaks first. Answer him out loud.') : null,
    h('div', { class: 'dk-line' }, h('span', { class: 'dk-who' }, 'Haruto'), h('div', null, jp(t.them)), play(t.them, 'm')),
    h('div', { class: 'dk-box note' }, h('div', { class: 'dk-lbl' }, 'Your turn'), h('b', null, t.cue))], t, 'f');
};
const listenPage = (it: Listen): Page => () => {
  const tr = h('div', { class: 'dk-box', hidden: true }, h('div', { class: 'dk-lbl' }, 'Transcript'), jp(it.transcript), h('div', { class: 'dk-en' }, it.en));
  setTimeout(() => say(it.audio), 300);
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    h('div', { class: 'dk-row' }, h('button', { class: 'dk-btn pri', onclick: () => say(it.audio) }, '▶ Play'), h('button', { class: 'dk-btn', onclick: () => say(it.audio, true) }, 'Slow')),
    choiceQ(it.q, it.options, it.a, () => { tr.hidden = false; }),
    h('div', { class: 'dk-mut' }, 'The transcript appears after you answer, so you listen first and read second.'), tr);
};

// ---------- Read & write ----------
const readingPage = (s: Extract<Section, { kind: 'reading' }>): Page => () => {
  const rjEl = h('div', { class: 'dk-rj', hidden: true }, s.rj), enEl = h('div', { class: 'dk-en', hidden: true }, s.en);
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    h('div', { class: 'dk-box' }, h('div', { class: 'dk-read', lang: 'ja' }, s.text), rjEl, enEl),
    h('div', { class: 'dk-row' }, h('button', { class: 'dk-btn sm', onclick: () => say(s.text) }, '▶ Hear it'), h('button', { class: 'dk-btn sm', onclick: () => { rjEl.hidden = !rjEl.hidden; } }, 'Romaji'), h('button', { class: 'dk-btn sm', onclick: () => { enEl.hidden = !enEl.hidden; } }, 'English')),
    h('div', { class: 'dk-mut' }, 'Read it out loud first. Then answer.'),
    ...s.qs.map((q) => choiceQ(q.q, q.options, q.a)));
};
function fillPage(f: Extract<Section, { kind: 'fill' }>['items'][number]) {
  const blank = h('span', { class: 'dk-blank' }, ' ');
  let answered = false;
  const full = `${f.before}${f.a}${f.after}`;
  const btns = f.choices.map((c) => h('button', { class: 'dk-btn sm jp', onclick: () => {
    if (answered) return; answered = true; blank.textContent = f.a;
    btns.forEach((b) => { if (b.textContent === f.a) b.style.borderColor = 'var(--d-green)'; });
    if (c !== f.a) { blank.style.color = 'var(--d-red)'; blank.textContent = `${f.a}`; }
    sfx(c === f.a ? 'good' : 'bad'); say(full);
  } }, c));
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, h('div', { class: 'dk-lbl' }, 'Fill in は, か or の'),
    h('div', { class: 'dk-box' }, h('div', { class: 'jp', lang: 'ja', style: { fontSize: '20px' } }, f.before, blank, f.after), h('div', { class: 'dk-en' }, f.en)),
    h('div', { class: 'dk-row' }, btns));
}
const writePage: Page = () => {
  const ta = h('textarea', { id: 'dk-write', 'aria-label': 'Your introduction', placeholder: 'はじめまして。わたしは …' }) as HTMLTextAreaElement;
  const last = D().writing.at(-1); if (last) ta.value = last.text;
  const add = (t: string) => { ta.value += t; ta.focus(); };
  const saved = h('div', { class: 'dk-mut', 'aria-live': 'polite' });
  const store = () => { const text = ta.value.trim(); if (!text) return; const day = dayKey(); const w = D().writing; if (w.at(-1)?.day === day) w[w.length - 1].text = text; else w.push({ day, text }); save(); saved.textContent = 'Saved to your notebook.'; };
  ta.addEventListener('blur', store);
  return h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, h('div', { class: 'dk-lbl' }, 'Write about yourself'),
    h('div', null, 'Write three sentences: your name, your school or job, and where you are from. Use the phone’s Japanese keyboard, or tap the pieces below.'),
    ta, h('div', { class: 'dk-tags' }, ['はじめまして。', 'わたしは ', 'です。', 'じん', 'の がくせい', 'だいがく', 'さい', 'よろしく。'].map((p) => h('button', { class: 'dk-tag jp', onclick: () => add(p) }, p))),
    h('button', { class: 'dk-btn', onclick: () => { store(); const t = ta.value; const tips = [/です/.test(t) ? null : 'End each sentence with です.', /は/.test(t) ? null : 'Use は after the topic: わたしは …', /じん/.test(t) ? null : 'Say where you are from with 〜じんです.'].filter(Boolean); clear(saved).append(tips.length ? h('div', { class: 'dk-box note' }, tips.map((x) => h('div', null, x))) : h('div', { class: 'dk-box ok' }, 'Looks great. It is saved in your notebook.')); } }, 'Check and save'), saved);
};

/** Record the final introduction, then compare it with day 1. */
function recordInline(): HTMLElement {
  const wrap = h('div', { class: 'dk-stage', style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
  const draw = () => {
    const r = loadRecs();
    append(clear(wrap), [h('div', { class: 'dk-lbl' }, 'Say your introduction'),
      h('div', null, 'Read what you wrote out loud, or say it from memory.'),
      D().writing.at(-1) ? h('div', { class: 'dk-box' }, jp(D().writing.at(-1)!.text)) : null,
      canRecord() ? recButton('last', draw) : h('div', { class: 'dk-box' }, 'Recording isn’t available here. Say it out loud anyway, then tap Finish.'),
      r.first || r.last ? h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'Then and now'),
        r.first ? h('div', { class: 'dk-row' }, h('div', { class: 'f' }, h('b', null, 'Day 1'), h('div', { class: 'dk-mut' }, r.first.day)), h('button', { class: 'dk-play', onclick: () => playRec(r.first!.url), 'aria-label': 'Play day 1' }, '▶')) : null,
        r.last ? h('div', { class: 'dk-row' }, h('div', { class: 'f' }, h('b', null, 'Now'), h('div', { class: 'dk-mut' }, r.last.day)), h('button', { class: 'dk-play', onclick: () => playRec(r.last!.url), 'aria-label': 'Play now' }, '▶')) : null) : null]);
  };
  draw(); return wrap;
}
function recButton(which: 'first' | 'last', after: () => void) {
  const b = h('button', { class: 'dk-mic' }, 'Record');
  const msg = h('div', { class: 'dk-mut', style: { textAlign: 'center' }, 'aria-live': 'polite' });
  let stop: (() => Promise<string | null>) | null = null;
  b.onclick = async () => {
    if (stop) { const s = stop; stop = null; b.classList.remove('on'); b.textContent = 'Saving'; const url = await s(); if (url) { saveRec(which, { url, day: dayKey() }); after(); } else msg.textContent = 'Nothing was recorded. Try again.'; b.textContent = 'Record'; return; }
    try { const r = await startRecording(); stop = r.stop; b.classList.add('on'); b.textContent = 'Stop'; msg.textContent = 'Recording. Tap Stop when you finish (20 seconds max).'; }
    catch { msg.textContent = 'The microphone isn’t available. Check the app’s microphone permission in your phone settings.'; }
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' } }, b, msg);
}
function recordScreen(which: 'first' | 'last', back: () => void) {
  frame('Day 1 recording', '', [h('div', { class: 'dk-lbl' }, 'Introduce yourself'), h('p', null, 'Say hello, your name and where you are from, any way you can. Pauses and English words are fine. Nobody hears this but you.'),
    recButton(which, () => { sfx('good'); back(); })], [h('button', { class: 'dk-btn', onclick: back }, 'Skip for now')], back);
}

const candoPage: Page = () => h('div', { class: 'dk-stage' }, h('div', { class: 'dk-lbl' }, 'Be honest. Tap each one you can do.'),
  ...LESSON.cando.map((c) => {
    const btn = h('button', { class: 'dk-check', 'aria-pressed': String(!!D().cando[c]), onclick: () => { D().cando[c] = !D().cando[c]; save(); dot.className = `dk-dot ${D().cando[c] ? 'done' : ''}`; dot.textContent = D().cando[c] ? '✓' : ''; btn.setAttribute('aria-pressed', String(!!D().cando[c])); } });
    const dot = h('span', { class: `dk-dot ${D().cando[c] ? 'done' : ''}` }, D().cando[c] ? '✓' : '');
    btn.append(dot, c); return btn;
  }),
  h('div', { class: 'dk-box note', style: { marginTop: '12px' } }, 'Anything you leave as "not yet" is a good thing to redo next. Just open that section again from the lesson page.'));

// ---------- Finish moments ----------
const learnedCount = () => ({ words: allWords().length, grammar: SECTIONS.filter((s) => s.kind === 'grammar').length });

function finishSection(s: Section) {
  const first = !isDone(s);
  const wasPartDone = partDone(s.part);
  D().done[s.id] = Date.now();
  const day = dayKey(); if (!D().days.includes(day)) D().days.push(day);
  markActive(); save(); sfx('win');
  const part = PARTS.find((p) => p.id === s.part)!, ps = sectionsOf(s.part), pd = ps.filter(isDone).length;
  const newPart = first && !wasPartDone && partDone(s.part);
  const next = nextSection();
  const goOn = () => (newPart ? partComplete(s.part) : next ? startSection(next) : openDesk());
  const allNow = lessonDone() && !D().finished;
  frame('Nicely done', s.title, [
    h('div', { class: 'dk-center' }, h('button', { class: 'seal sm', 'aria-label': 'Seal' }, jp('済')), h('h2', { class: 'dk-h2' }, s.kind === 'cando' ? 'Self-check done' : 'Section done'), h('div', { class: 'dk-mut' }, s.title)),
    h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'Today you learned'), s.learned.map((l) => h('div', null, l))),
    h('div', { class: 'dk-box' }, h('div', { class: 'dk-row' }, h('div', { class: 'f' }, `Part ${part.id} · ${part.title}`), h('small', { class: 'dk-mut' }, `${pd} of ${ps.length}`)), h('div', { class: 'dk-meter' }, h('div', { style: { width: `${(pd / ps.length) * 100}%` } }))),
    next && !newPart ? h('div', { class: 'dk-box note' }, h('div', { class: 'dk-lbl' }, 'Up next'), next.title) : null,
  ], [h('button', { class: 'dk-btn', onclick: openDesk }, 'Lesson page'), h('button', { class: 'dk-btn pri', onclick: allNow ? certificate : goOn }, newPart || allNow ? 'Continue' : next ? 'Next section' : 'Lesson page')], openDesk, { cheer: true });
}

function partComplete(p: PartId) {
  const part = PARTS.find((x) => x.id === p)!;
  const c = learnedCount();
  const gained = p === 'A' ? `${c.words} new words · ${c.grammar} grammar points · 1 full dialogue` : p === 'B' ? 'Shadowed 9 lines · held a conversation · 4 listening checks'
    : p === 'C' ? '25 hiragana written · 1 reading' : '6 workbook answers · your own introduction';
  const next = nextSection();
  frame(`Part ${p} complete`, '', [
    h('div', { class: 'dk-center' }, h('div', { class: 'dk-lbl' }, `Lesson 1 · ${part.title}`), h('button', { class: 'seal', 'aria-label': 'Part seal' }, jp(part.seal)), h('h2', { class: 'dk-h2' }, `Part ${p} complete`)),
    h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'You now have'), h('div', null, gained)),
    unlock(p),
  ], [h('button', { class: 'dk-btn', onclick: openDesk }, 'Lesson page'), next ? h('button', { class: 'dk-btn pri', onclick: () => startSection(next) }, 'Next part') : h('button', { class: 'dk-btn pri', onclick: certificate }, 'Continue')], openDesk, { cheer: true });
}

/** Something new you can now do, shown when a part is finished. */
function unlock(p: PartId) {
  if (p === 'A') return h('div', { class: 'dk-box ok' }, h('div', { class: 'dk-lbl' }, 'Unlocked: you can read this now'),
    h('div', { class: 'dk-nametag' }, h('div', { class: 'dk-mut' }, 'こんにちは！わたしは'), jp('さとう あおい', 'dk-big'), jp('さくらだいがく ・ にねんせい')),
    choiceQ('What does the name tag say?', ['Aoi Satou, a 2nd-year at Sakura University', 'Aoi Satou, a teacher at Sakura University', 'Sakura Satou, a 2nd-year student'], 0));
  if (p === 'B') {
    const lines = [['Mei', 'はじめまして。メイです。ちゅうごくじんです。', 'f'], ['Haruto', 'せんこうは なんですか。', 'm'], ['Mei', 'けいざいです。はるとさんと おなじですね。', 'f']] as const;
    const en = h('div', { class: 'dk-en', hidden: true }, 'Mei: Nice to meet you. I am Mei, from China. Haruto: What is your major? Mei: Economics. The same as you, Haruto!');
    return h('div', { class: 'dk-box ok' }, h('div', { class: 'dk-lbl' }, 'Unlocked: bonus scene'), h('div', null, 'Haruto meets Mei. Listen with no English and see how much you understand.'),
      h('div', { class: 'dk-row' }, h('button', { class: 'dk-btn sm', onclick: async () => { for (const [, t, k] of lines) await sayWait(t, k); } }, '▶ Play scene'), h('button', { class: 'dk-btn sm', onclick: () => { en.hidden = !en.hidden; } }, 'Show English')), en);
  }
  if (p === 'C') return h('div', { class: 'dk-box ok' }, h('div', { class: 'dk-lbl' }, 'Unlocked: real signs you can read'),
    ...[['えき', 'eki · station', 'You will see this at every train station.'], ['いけ', 'ike · pond', 'On park signs.'], ['ねこ', 'neko · cat', 'On cat café signs.']].map(([k, r, n]) =>
      h('div', { class: 'dk-row' }, h('div', { class: 'dk-nametag', style: { minWidth: '76px' } }, jp(k, 'dk-big')), h('div', { class: 'f' }, h('b', null, r), h('div', { class: 'dk-mut' }, n)), play(k))));
  return h('div', { class: 'dk-box ok' }, 'Your writing and your recording are saved in your notebook.');
}

function certificate() {
  if (!D().finished) { D().finished = dayKey(); save(); }
  const days = D().days.length, r = loadRecs();
  frame('Lesson complete', '', [
    h('div', { class: 'dk-cert' }, h('div', { class: 'dk-lbl' }, 'Genki I · Lesson 1'), h('div', { class: 'dk-h1 jp', lang: 'ja' }, LESSON.jp),
      h('div', { class: 'dk-mut' }, `completed by ${S.name || 'you'} · ${days} day${days === 1 ? '' : 's'} of study`),
      h('div', { class: 'dk-seals' }, PARTS.map((p) => h('span', { class: `seal xs ${partDone(p.id) ? '' : 'off'}` }, jp(p.seal)))),
      h('button', { class: 'seal lg', 'aria-label': 'Lesson seal' }, jp('一課'))),
    r.first && r.last ? h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, 'Then and now'), h('div', { class: 'dk-row' },
      h('button', { class: 'dk-btn sm', onclick: () => playRec(r.first!.url) }, '▶ Day 1'), h('button', { class: 'dk-btn sm', onclick: () => playRec(r.last!.url) }, '▶ Now'),
      h('button', { class: 'dk-btn sm', onclick: async () => { playRec(r.first!.url); await sleep(9000); playRec(r.last!.url); } }, 'Both'))) : null,
    lessonDone() ? h('div', { class: 'dk-box ok' }, h('div', { class: 'dk-lbl' }, 'Next'), 'Lesson 2 (shopping, これ / それ / あれ and prices) comes next in Study Desk.')
      : h('div', { class: 'dk-box note' }, `Finish the last ${SECTIONS.filter((s) => !isDone(s)).length} sections to complete every seal.`),
  ], [h('button', { class: 'dk-btn', onclick: openNotebook }, 'Notebook'), h('button', { class: 'dk-btn pri', onclick: openDesk }, 'Lesson page')], openDesk, { cheer: true });
}

// ---------- Notebook ----------
type NbTab = 'words' | 'kana' | 'writing' | 'voice' | 'seals';
let nbTab: NbTab = 'words';
export function openNotebook() {
  const tabs: [NbTab, string][] = [['words', 'Words'], ['kana', 'Kana'], ['writing', 'My writing'], ['voice', 'Recordings'], ['seals', 'Seals']];
  const r = loadRecs();
  const doneWords = SECTIONS.flatMap((s) => (s.kind === 'words' && isDone(s) ? s.words : []));
  const doneKana = SECTIONS.flatMap((s) => (s.kind === 'kana' && isDone(s) ? s.kana : []));
  const empty = (t: string) => h('div', { class: 'dk-box' }, t);
  const content = nbTab === 'words' ? (doneWords.length ? doneWords.map((w) => h('div', { class: 'dk-word' }, h('div', { style: { flex: '1' } }, jp(w.jp), h('div', { class: 'dk-rj' }, `${w.rj} · ${w.en}`)), play(w.say ?? w.jp.replace('〜', '')))) : [empty('Words appear here after you finish a Words section.')])
    : nbTab === 'kana' ? (doneKana.length ? [h('div', { class: 'dk-box' }, h('div', { class: 'jp', style: { fontSize: '26px', letterSpacing: '.2em', lineHeight: '1.8' } }, doneKana.join(' ')))] : [empty('Kana appear here after you write them in Part C.')])
    : nbTab === 'writing' ? (D().writing.length ? [...D().writing].reverse().map((w) => h('div', { class: 'dk-box' }, h('div', { class: 'dk-lbl' }, w.day), jp(w.text), h('div', null, h('button', { class: 'dk-btn sm', onclick: () => say(w.text) }, '▶ Hear it'))))
      : [empty('Your own writing from the workbook is kept here.')])
    : nbTab === 'voice' ? (r.first || r.last ? [r.first, r.last].map((x, i) => (x ? h('div', { class: 'dk-box dk-row' }, h('div', { class: 'f' }, h('b', null, i ? 'Latest introduction' : 'Day 1 introduction'), h('div', { class: 'dk-mut' }, x.day)), h('button', { class: 'dk-play', onclick: () => playRec(x.url) }, '▶')) : null))
      : [empty('Record your day 1 introduction from the lesson page. Your final one is recorded in Part D.')])
    : [h('div', { class: 'dk-seals' }, PARTS.map((p) => h('div', { class: 'dk-center' }, h('span', { class: `seal sm ${partDone(p.id) ? '' : 'off'}`, style: { animation: 'none' } }, jp(p.seal)), h('small', { class: 'dk-mut' }, `Part ${p.id}`)))),
      D().finished ? h('div', { class: 'dk-box ok' }, h('b', null, 'Lesson 1 certificate'), h('div', null, h('button', { class: 'dk-btn sm', onclick: certificate }, 'Open'))) : null];
  frame('My notebook', 'Lesson 1', [h('div', { class: 'dk-tags' }, tabs.map(([id, l]) => h('button', { class: `dk-tag ${nbTab === id ? 'on' : ''}`, 'aria-pressed': String(nbTab === id), onclick: () => { nbTab = id; openNotebook(); } }, l))), ...content],
    [h('button', { class: 'dk-btn pri', onclick: openDesk }, 'Back to the lesson')], openDesk, { sleepy: true });
}
