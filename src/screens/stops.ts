// Screens for the course stops: words, grammar, story, mission, culture and the unit boss.
import { Word, Stop, Story, Grammar, Mission, Culture, Drill, CourseUnit, Part, gloss, WORDS, COURSE } from '../data/course';
import { canListen, listenJa, heardWord } from '../speech';
import { Region } from '../data/climb';
import { LESSONS, Kana, KANA_BY_ID } from '../data/kana';
import { h, jp, bar, pct, clear } from '../ui';
import { art } from '../art';
import { S, save, addXp, logMistake, clearMistake, markActive, addCards } from '../state';
import { say, sfx, voiceOf } from '../audio';
import { lineText } from '../voiceLines';
import { rj, rjTokens, readable, knownKana, toKatakana, withName, romajiOf } from '../script';
/** One drill's Japanese is all kana or all romaji, so the choices never give each other away. */
const kset = (texts: string[]) => (readable(texts.join('')) ? knownKana() : new Set<string>());
import { showFlow, showTab } from '../nav';
import { shuffle } from '../lessonGen';
import { startLesson } from './lesson';

/** skip = the item doesn't count (e.g. "Can't speak now" in a test). */
type Done = (ok: boolean, note?: string, skip?: boolean) => void;
type Skill = 'Listening' | 'Reading' | 'Kana' | 'Sentences' | 'Words' | 'Grammar' | 'Speaking';
interface Item { eyebrow: string; title: string; render: (done: Done) => HTMLElement; neutral?: boolean; retry?: () => Item; ref?: string; onRight?: () => void; skill?: Skill }
interface RunOpts { stopId?: string; label: string; items: Item[]; hearts?: boolean; boss?: { name: string; again: () => void }; timer?: number; onWin?: () => string; medal?: string; back?: () => void;
  /** Tests: the score needed to pass (percent), and who hosts it. */ pass?: number; host?: string; title?: string;
  /** Fresh questions for "Try again", and a fixed accuracy for stops that grade themselves (missions). */ rebuild?: () => Item[]; acc?: number }

/** A word in kana once all its kana are learned, otherwise in romaji. */
const wtxt = (w: Word) => (readable(w.kana) ? w.kana : w.romaji);
const romaji = (w: Word) => (S.settings.romaji && readable(w.kana) ? h('small', { class: 'rom' }, w.romaji) : null);
const wordLabel = (w: Word) => { const el = h('span', { class: 'wl' }, jp(wtxt(w)), romaji(w)); const n = (el.querySelector('.jp')?.textContent ?? '').length; if (n > 9) el.classList.add('xlong'); else if (n > 6) el.classList.add('long'); return el; };
const speak = (w: Word) => say(w.kana.replace('〜', ''));
const home = () => showTab('home');

export function startStop(s: Stop) {
  if (s.kind === 'kana') return startLesson(LESSONS.find((l) => l.id === s.id)!);
  if (s.kind === 'words') return runQuiz({ stopId: s.id, label: s.title, items: wordItems(s.words), title: 'Lesson done!', onWin: () => { addCards(s.words.map((w) => `w:${w.id}`)); return `${s.words.length} new words added to your review deck.`; } });
  if (s.kind === 'grammar') return runQuiz({ stopId: s.id, label: s.title, items: grammarItems(s.g), title: 'Lesson done!', onWin: () => `You can now use ${rj(s.g.title)}.` });
  if (s.kind === 'story') return storyScreen(s.id, s.story);
  if (s.kind === 'speak') return storyScreen(s.id, s.story, s.title, s.say.map((l) => sayItem(l.jp, l.en)));
  if (s.kind === 'checkpoint') return startCheckpoint(s);
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

/** Tanuki's unit test: like a Genki review test, in sections. Pass with 80%. */
export function startUnitBoss(u: CourseUnit) {
  const build = () => testItems(u.parts, u.words, { listen: 4, dialogue: 2, kana: 3, read: 4, sentences: 4, grammar: 4, speak: 3 }, `${u.boss.name}'s unit test`);
  runQuiz({ label: `Unit ${u.n} test`, items: build(), rebuild: build, hearts: true, pass: 80, host: u.boss.name, medal: u.stamp, title: 'Unit test passed!',
    onWin: () => { const first = !S.stamps[u.id]; S.stamps[u.id] = true; addCards(u.words.map((w) => `w:${w.id}`)); return first ? `The ${u.stamp} stamp is in your stamp book. Unit ${u.n + 1} is unlocked.` : 'Passed again. Nice!'; } });
}

const chapterOf = (s: Stop): [CourseUnit, Part] => { for (const u of COURSE) for (const p of u.parts) if (p.stops.includes(s)) return [u, p]; throw new Error(s.id); };
/** A test in sections: listening, kana, reading, new sentences, grammar, then speaking. Only uses what those chapters taught. */
function testItems(parts: Part[], pool: Word[], n: { listen: number; dialogue: number; kana: number; read: number; sentences: number; grammar: number; speak: number }, name: string): Item[] {
  const stops = parts.flatMap((p) => p.stops);
  const ws = [...new Map(stops.flatMap((s) => (s.kind === 'words' ? s.words : [])).map((w) => [w.id, w])).values()];
  const opts = pool.length >= 4 ? pool : ws;
  const tag = (skill: Skill) => (it: Item): Item => ({ ...it, skill, retry: undefined });
  const listen = shuffle(ws).slice(0, n.listen).map((w) => tag('Listening')(listenPick(w, opts)));
  const lines = stops.flatMap((s) => (s.kind === 'speak' || s.kind === 'story' ? s.story.panels.flatMap((p) => p.lines) : s.kind === 'mission' ? s.m.steps.flatMap((st) => ('npc' in st ? [{ who: s.m.npc, tokens: [st.npc], en: st.en }] : [])) : []));
  const dialogue = shuffle(lines).slice(0, n.dialogue).map((l) => tag('Listening')(lineItem(l, lines)));
  const kanaPool = stops.flatMap((s) => (s.kind === 'kana' ? LESSONS.find((l) => l.id === s.id)!.kana : []));
  const kana = kanaPool.length >= 4 ? shuffle(kanaPool).slice(0, n.kana).map((k, i) => tag('Kana')(kanaItem(k, kanaPool, i % 2 ? 'listen' : 'read'))) : [];
  // Reading = words you can read in kana now. Words still shown in romaji are tested with pictures instead.
  const canRead = ws.filter((w) => readable(w.kana));
  const read = shuffle(canRead).slice(0, n.read).map((w, i) => tag('Reading')((i % 2 ? pictureToWord : pickPicture)(w, opts)));
  const pics = shuffle(ws.filter((w) => !canRead.includes(w))).slice(0, Math.max(0, n.read - read.length)).map((w, i) => tag('Words')((i % 2 ? tfWord : completeWord)(w, opts)));
  const gs = stops.flatMap((s) => (s.kind === 'grammar' ? [s.g] : []));
  const known = pool.filter((w) => ws.includes(w) || stopsBefore(parts[0]).some((s) => s.kind === 'words' && s.words.includes(w)));
  const sentences = shuffle(gs.flatMap((g) => newSentences(g.id, known))).slice(0, n.sentences).map(tag('Sentences'));
  const drills = gs.flatMap((g) => g.drills);
  const grammar = shuffle(drills).slice(0, n.grammar).map((d) => tag('Grammar')(d.t === 'tiles' ? tilesItem(d) : d.t === 'fix' ? fixItem(d) : chooseItem(d)));
  const speak = shuffle(ws).slice(0, n.speak).map((w) => tag('Speaking')(sayItem(w.kana, w.en, w, true)));
  const body = [...listen, ...dialogue, ...kana, ...read, ...pics, ...sentences, ...grammar, ...speak];
  return [testIntro(name, body), ...body];
}
/** Every stop on the path before this chapter. */
const stopsBefore = (p: Part) => { const all = COURSE.flatMap((u) => u.parts); return all.slice(0, all.indexOf(p)).flatMap((x) => x.stops); };
/** The first screen of a test: its sections and the pass mark. */
function testIntro(name: string, body: Item[]): Item {
  const counts = new Map<Skill, number>(); body.forEach((it) => it.skill && counts.set(it.skill, (counts.get(it.skill) ?? 0) + 1));
  const graded = body.length, allowed = Math.floor(graded * 0.2);
  return { eyebrow: 'Test', title: name, neutral: true,
    render: (done) => h('div', { class: 'stage' }, h('div', { class: 'testintro' },
      [...counts].map(([k, v]) => h('div', { class: 'row' }, h('b', null, k), h('span', null, `${v} question${v > 1 ? 's' : ''}`))),
      h('p', { class: 'sub' }, `Pass with 80%: you can make ${allowed} mistake${allowed === 1 ? '' : 's'} and still pass. Speaking you skip doesn't count against you.`)),
      h('button', { class: 'btn', onclick: () => done(true) }, 'Start the test')) };
}
function startCheckpoint(s: Stop) {
  const [u, p] = chapterOf(s);
  const upto = u.parts.slice(0, u.parts.indexOf(p) + 1).flatMap((x) => x.stops).flatMap((x) => (x.kind === 'words' ? x.words : []));
  const build = () => testItems([p], upto, { listen: 2, dialogue: 2, kana: 2, read: 3, sentences: 2, grammar: 2, speak: 2 }, `${s.title}: ${p.title}`);
  runQuiz({ stopId: s.id, label: `${s.title} · ${p.title}`, items: build(), rebuild: build, hearts: true, pass: 80, title: 'Checkpoint passed!', medal: '合',
    onWin: () => `Chapter "${p.title}" is complete.` });
}

// ---------- New sentences for tests: taught words in taught patterns, never seen before as a drill ----------
const SUBJ: [string, string, string][] = [['わたし', 'I', 'am'], ['レオさん', 'Leo', 'is'], ['ゆきさん', 'Yuki', 'is'], ['メイさん', 'Mei', 'is']];
const OWN: [string, string][] = [['わたし', 'my'], ['レオさん', "Leo's"], ['ゆきさん', "Yuki's"], ['メイさん', "Mei's"]];
const an = (en: string) => `${/^[aeiou]/i.test(en) ? 'an' : 'a'} ${en.replace(/ \(.*\)$/, '').replace(/,.*$/, '')}`;
const base = (en: string) => en.replace(/ \(.*\)$/, '').replace(/,.*$/, '');
function newSentences(gid: string, known: Word[]): Item[] {
  const of = (t: Word['tag']) => shuffle(known.filter((w) => w.tag === t));
  const jobs = of('job'), things = of('thing'), food = of('food');
  const make = (jp: string, en: string, wrong: string[]) => sentenceItem(jp, en, wrong);
  const out: Item[] = [];
  const two = <T,>(a: T[]) => shuffle(a).slice(0, 2);
  if (gid === 'u1-g-wa' && jobs.length >= 2) for (const [sj, se, be] of two(SUBJ)) { const [j, k] = jobs; out.push(make(`${sj}は ${j.kana}です。`, `${se} ${be} ${an(j.en)}.`, [`${se} ${be} ${an(k.en)}.`, `${an(j.en)[0].toUpperCase()}${an(j.en).slice(1)} is ${se === 'I' ? 'me' : se}.`])); }
  if (gid === 'u1-g-ka' && jobs.length >= 2) for (const [sj, se] of two(SUBJ.slice(1))) { const [j, k] = shuffle(jobs); out.push(make(`${sj}は ${j.kana}ですか。`, `Is ${se} ${an(j.en)}?`, [`${se} is ${an(j.en)}.`, `Is ${se} ${an(k.en)}?`])); }
  if (gid === 'u1-g-no' && jobs.length >= 2) for (const [o, oe] of two(OWN)) { const [j, k] = shuffle(jobs); out.push(make(`${o}の ${j.kana}`, `${oe} ${base(j.en)}`, [`${oe} ${base(k.en)}`, `${base(j.en)} is ${oe.replace(/'s$/, '').replace('my', 'me')}`])); }
  const DEM: [string, string][] = [['これ', 'This'], ['それ', 'That (near you)'], ['あれ', 'That (over there)']];
  if (gid === 'u2-g-kore' && things.length >= 2) for (const [d, de] of two(DEM)) { const [t, x] = shuffle(things); const other = DEM.find((y) => y[0] !== d)![1]; out.push(make(`${d}は ${t.kana}です。`, `${de} is ${an(t.en)}.`, [`${other} is ${an(t.en)}.`, `${de} is ${an(x.en)}.`])); }
  if (gid === 'u2-g-dare' && things.length >= 2) for (const [d, de] of two(DEM)) { const [t, x] = shuffle(things); out.push(make(`${d}は だれの ${t.kana}ですか。`, `Whose ${base(t.en)} is ${de.toLowerCase().replace(' is', '')}?`, [`What is ${de.toLowerCase()}?`, `Whose ${base(x.en)} is ${de.toLowerCase()}?`])); }
  if (gid === 'u2-g-kudasai' && food.length >= 3) for (const f of food.slice(0, 2)) { const [x, y] = food.filter((z) => z !== f); out.push(make(`${f.kana}を ください。`, `${base(f.en)[0].toUpperCase()}${base(f.en).slice(1)}, please.`, [`${base(x.en)[0].toUpperCase()}${base(x.en).slice(1)}, please.`, `Is it ${base(f.en)}?`])); }
  if (gid === 'u2-g-ikura' && things.length + food.length >= 2) for (const t of shuffle([...things, ...food]).slice(0, 2)) out.push(make(`${t.kana}は いくらですか。`, `How much is the ${base(t.en)}?`, [`Whose ${base(t.en)} is it?`, `Is it ${an(t.en)}?`]));
  return out;
}
function sentenceItem(text: string, en: string, wrong: string[]): Item {
  return { eyebrow: 'New sentence', title: 'What does it mean?', ref: `n:${text}`,
    render: (done) => {
      setTimeout(() => say(text), 250);
      const opts = shuffle([en, ...wrong]);
      let answered = false;
      const btns = opts.map((o) => h('button', { class: 'opt', onclick: (e: Event) => {
        if (answered) return; answered = true; const ok = o === en;
        (e.currentTarget as HTMLElement).classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake');
        btns.forEach((b, i) => { if (opts[i] === en) b.classList.add('ok'); b.setAttribute('disabled', ''); });
        done(ok, `${rj(text)} = ${en}`);
      } }, o));
      return h('div', { class: 'stage' }, h('div', { class: 'prompt' }, jp(rj(text), 'sent'), h('button', { class: 'soundbtn sm', onclick: () => say(text) }, 'Hear it')), h('div', { class: 'opts col' }, btns));
    } };
}
/** Hear one line from the chapter's dialogue (no text), then pick what it meant. */
function lineItem(l: { who: string; tokens: (string | [string, string])[]; en: string }, all: { en: string }[]): Item {
  const text = lineText(l.tokens);
  return { eyebrow: 'Listen to the dialogue', title: `What does ${l.who} say?`, ref: `n:${text}`,
    render: (done) => {
      const play = () => say(text, false, voiceOf(l.who));
      setTimeout(play, 300);
      const opts = shuffle([l.en, ...shuffle([...new Set(all.map((x) => x.en))].filter((e) => e !== l.en)).slice(0, 2)]);
      let answered = false;
      const btns = opts.map((o) => h('button', { class: 'opt', onclick: (e: Event) => {
        if (answered) return; answered = true; const ok = o === l.en;
        (e.currentTarget as HTMLElement).classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake');
        btns.forEach((b, i) => { if (opts[i] === l.en) b.classList.add('ok'); b.setAttribute('disabled', ''); });
        done(ok, `${rj(text)} = ${l.en}`);
      } }, o));
      return h('div', { class: 'stage' }, h('button', { class: 'play sm', 'aria-label': 'Play again', onclick: play }, '▶'), h('div', { class: 'opts col' }, btns));
    } };
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
    w.ex ? h('button', { class: 'example', onclick: () => say(w.ex!.jp) }, h('small', { class: 'exl' }, 'Example 🔊'), jp(rj(w.ex.jp)), h('small', null, w.ex.en)) : null,
    h('button', { class: 'btn', onclick: () => done(true) }, 'Continue')); },
});

// ---------- Speaking: hear it, then say it out loud ----------
let quietUntil = 0;
/** "Can't speak now" turns speaking off for a while; those steps then skip themselves. */
const speakingOff = () => Date.now() < quietUntil;
function sayItem(text: string, en: string, w?: Word, graded = false): Item {
  return { eyebrow: graded ? 'Speaking' : 'Say it', title: 'Say it out loud', neutral: !graded, ref: w ? `w:${w.id}` : undefined,
    render: (done) => {
      // Speaking turned off: practice steps skip themselves, and test questions don't count.
      if (speakingOff()) { setTimeout(() => done(true, graded ? 'Skipped: speaking is off for now.' : undefined, true), 0); return h('div'); }
      const shown = w ? wtxt(w) : rj(text);
      const play = (slow = false) => (w ? say(w.kana.replace('〜', ''), slow) : say(text, slow));
      setTimeout(() => play(), 250);
      const status = h('div', { class: 'small center', 'aria-live': 'polite' }, 'Listen, then tap the mic and say it.');
      let tries = 0, answered = false;
      const finish = (ok: boolean, note: string, skip = false) => { if (answered) return; answered = true; mic.setAttribute('disabled', ''); extra.remove(); done(ok, note, skip); };
      const mic: HTMLButtonElement = h('button', { class: 'mic', 'aria-label': 'Tap and speak' }, '🎤');
      // In tests, "I said it" only shows up once you have tried the mic (or the phone can't listen).
      const saidIt = h('button', { class: 'linkbtn', hidden: graded, onclick: () => finish(true, graded ? 'Counted. Keep practicing out loud.' : 'Great. Saying it out loud helps it stick.') }, 'I said it');
      const extra = h('div', { class: 'hrow' });
      mic.addEventListener('click', async () => {
        if (!(await canListen())) { status.textContent = 'This phone can\u2019t listen here. Say it aloud, then tap "I said it".'; saidIt.hidden = false; return; }
        mic.classList.add('on'); status.textContent = 'Listening…';
        let heard: string[] = [];
        try { heard = await listenJa(); } catch { status.textContent = 'The microphone is off. Say it aloud, then tap "I said it".'; mic.classList.remove('on'); saidIt.hidden = false; return; }
        mic.classList.remove('on');
        const spellings = w ? [w.kana.replace('〜', ''), w.kanji?.replace('〜', '') ?? ''] : [withName(text)];
        if (heardWord(heard, spellings)) return finish(true, `I heard "${heard[0]}". Nicely said!`);
        tries++;
        status.textContent = heard.length ? `I heard "${heard[0]}". Listen again and try once more.` : 'I didn\u2019t catch that. Try once more.';
        if (tries >= 2) { status.textContent += ' Or tap "I said it" if you know it was right.'; saidIt.hidden = false; }
      });
      extra.append(saidIt,
        h('button', { class: 'linkbtn', onclick: () => { quietUntil = Date.now() + 30 * 60_000; finish(true, graded ? 'Skipped. This one doesn\u2019t count. Speaking is off for 30 minutes.' : 'Speaking is off for 30 minutes. You\u2019ll get listening instead.', graded); } }, 'Can\u2019t speak now'));
      return h('div', { class: 'stage center' },
        h('div', { class: 'prompt' }, jp(shown, w ? 'wordbig' : 'sent'), h('small', null, en)),
        h('div', { class: 'hrow' }, h('button', { class: 'soundbtn sm', onclick: () => play() }, 'Hear it'), h('button', { class: 'soundbtn sm', onclick: () => play(true) }, '🐢 Slow')),
        mic, status, extra);
    } };
}

/** Asks the learner's name once, and shows it in katakana. Lines written for "Ben" then use it. */
function nameItem(): Item {
  return { eyebrow: 'About you', title: 'What\u2019s your name?', neutral: true,
    render: (done) => {
      const input = h('input', { class: 'typein', type: 'text', autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', 'aria-label': 'Your name', placeholder: 'e.g. Ben, or maiku for Mike', value: S.name || '' }) as HTMLInputElement;
      const kana = h('div', { class: 'namekana jp', lang: 'ja' }, S.nameKana || '');
      const sync = () => { kana.textContent = input.value.trim() ? toKatakana(input.value) : ''; };
      input.addEventListener('input', sync); sync();
      return h('div', { class: 'stage nameform' },
        h('p', { class: 'sub' }, 'Type your name the way it sounds. Names from other languages are written in katakana, so here is yours. You\u2019ll learn katakana in Unit 2.'),
        input, kana,
        h('button', { class: 'btn', onclick: () => { const v = input.value.trim(); if (v) { S.name = v[0].toUpperCase() + v.slice(1); S.nameKana = toKatakana(v) || 'ベン'; save(); } done(true, `Nice to meet you, ${S.name || 'Ben'}!`); } }, 'Save my name'));
    } };
}

// ---------- Try it: build the word, true or false ----------
const SYL = /(ch|sh|ts|[kgsztdnhbpmrwfjy])?y?[aiueo]|n(?![aiueoy])|([kstpgdc])(?=\2)/g;
/** A word cut into the pieces you hear: kana (small ゃゅょ stay with the one before) or romaji syllables. */
export const syllables = (w: Word): string[] => readable(w.kana) ? w.kana.replace('〜', '').match(/.[ゃゅょャュョ]?/g) ?? [] : (w.romaji.match(SYL) ?? [w.romaji]);
function completeWord(w: Word, pool: Word[]): Item {
  return { eyebrow: 'Complete the word', title: w.en, ref: `w:${w.id}`, retry: () => completeWord(w, pool),
    render: (done) => {
      const parts = syllables(w);
      const gaps = parts.length <= 2 ? [parts.length - 1] : shuffle(parts.map((_, i) => i).slice(1)).slice(0, 2).sort((a, b) => a - b);
      const others = shuffle([...new Set(pool.filter((x) => x.id !== w.id).flatMap(syllables))].filter((x) => !gaps.some((g) => parts[g] === x))).slice(0, 2);
      const cells = parts.map((p, i) => h('span', { class: gaps.includes(i) ? 'gap' : '' }, gaps.includes(i) ? '＿' : p));
      let k = 0, answered = false;
      const chips = shuffle([...gaps.map((g) => parts[g]), ...others]).map((t) => {
        const b: HTMLButtonElement = h('button', { class: 'wtile', lang: 'ja', onclick: () => {
          if (answered || b.disabled) return; sfx('tap'); b.disabled = true;
          const cell = cells[gaps[k]]; cell.textContent = t; cell.classList.add('filled'); k++;
          if (k === gaps.length) {
            answered = true; const ok = gaps.every((g) => cells[g].textContent === parts[g]);
            gaps.forEach((g) => { cells[g].textContent = parts[g]; cells[g].classList.add(ok ? 'ok' : 'no'); });
            speak(w); done(ok, `${wtxt(w)} · ${w.en}${w.note ? `. ${rj(w.note)}` : ''}`);
          }
        } }, t);
        return b;
      });
      return h('div', { class: 'stage' }, h('div', { class: 'artcard sm' }, art(w.art, w.en)), h('div', { class: 'hrow' }, h('button', { class: 'soundbtn sm', onclick: () => speak(w) }, 'Hear it')),
        h('div', { class: 'cword jp', lang: 'ja' }, cells), h('div', { class: 'tilebank' }, chips));
    } };
}
function trueFalse(eyebrow: string, statement: Element | string, a: boolean, note: string, ref?: string, after?: () => void): Item {
  return { eyebrow, title: 'True or false?', ref,
    render: (done) => {
      let answered = false;
      const btns = [true, false].map((v) => h('button', { class: 'opt', onclick: (e: Event) => {
        if (answered) return; answered = true; const ok = v === a;
        (e.currentTarget as HTMLElement).classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake');
        btns.forEach((b, i) => { if ([true, false][i] === a) b.classList.add('ok'); b.setAttribute('disabled', ''); });
        after?.(); done(ok, note);
      } }, v ? 'True' : 'False'));
      return h('div', { class: 'stage' }, h('div', { class: 'prompt tf' }, statement), h('div', { class: 'opts tf' }, btns));
    } };
}
function tfWord(w: Word, pool: Word[]): Item {
  const other = shuffle(pool.filter((x) => x.id !== w.id && x.en !== w.en))[0];
  const truth = !other || Math.random() < 0.5;
  const it = trueFalse('True or false', h('span', null, '"', jp(wtxt(w)), `" means "${truth ? w.en : other.en}".`), truth,
    `${wtxt(w)} means "${w.en}".${w.note ? ` ${rj(w.note)}` : ''}`, `w:${w.id}`, () => speak(w));
  return { ...it, retry: () => tfWord(w, pool) };
}
/** The calm end of a lesson: what you learned, with sound. */
const recapItem = (ws: Word[]): Item => ({ eyebrow: 'Recap', title: 'You can now say', neutral: true,
  render: (done) => h('div', { class: 'stage' }, h('div', { class: 'recap' }, ws.map((w) => h('button', { class: 'rrow', onclick: () => speak(w) }, '🔊 ', jp(wtxt(w)), h('small', null, ` ${w.en}`)))),
    h('button', { class: 'btn', onclick: () => done(true) }, 'Finish lesson')) });
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
        const clean = (x: string) => x.toLowerCase().replace(/[\s'~-]/g, '');
        const ok = v === clean(w.romaji) || !!w.alts?.some((a) => clean(a) === v);
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
/** A words lesson in 5 beats: warm up, hear it, say it, try it, use it, then a recap. */
function wordItems(ws: Word[]): Item[] {
  const old = learnedWordList().filter((x) => !ws.some((w) => w.id === x.id));
  const pool = ws.length >= 4 ? ws : [...ws, ...shuffle(old.length >= 3 ? old : [...WORDS.values()].filter((x) => !ws.includes(x))).slice(0, 4 - ws.length)];
  const warm = old.length >= 4 ? shuffle(old).slice(0, 2).map((w) => ({ ...listenPick(w, old), eyebrow: 'Warm up', retry: undefined })) : [];
  const tries = [completeWord, tfWord, pickPicture];
  const teach = ws.flatMap((w, i) => [intro(w), sayItem(w.kana, w.en, w), tries[i % 3](w, pool)]);
  const use = shuffle(ws.map((w, i) => [listenPick, pictureToWord][i % 2](w, pool)));
  if (ws.length >= 3) use.splice(1, 0, matchItem(shuffle(ws).slice(0, 4)));
  if (ws.length >= 4) use.push(typeWord(ws[0]));
  return [...warm, ...teach, ...use, recapItem(ws)];
}

// ---------- Grammar games ----------
function patternCard(g: Grammar): Item {
  return { eyebrow: 'Pattern card', title: rj(g.title), neutral: true,
    render: (done) => h('div', { class: 'stage' },
      // Grammar words are shown as kana with their sound under them, so は reads "wa" and の never looks like English "no".
      h('div', { class: 'pattern' }, h('div', { class: 'pat' }, g.pattern.map((p) => /^[A-Z…]+$/.test(p) ? h('span', { class: 'slot' }, p) : h('span', { class: 'pjw' }, jp(p, 'pj'), h('small', null, romajiOf(p)))), h('span', { class: 'mean' }, `= ${g.meaning}`)),
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
  const ds = g.drills.map((d) => (d.t === 'tiles' ? tilesItem(d) : d.t === 'fix' ? fixItem(d) : chooseItem(d)));
  ds.splice(3, 0, sayItem(g.examples[1]?.jp ?? g.examples[0].jp, g.examples[1]?.en ?? g.examples[0].en));
  return [...(g.id === 'u1-g-desu' ? [nameItem()] : []), patternCard(g), sayItem(g.examples[0].jp, g.examples[0].en), ...ds];
}

// ---------- Generic runner ----------
function runQuiz(o: RunOpts) {
  const q = [...o.items];
  let i = 0, hearts = 3, combo = 0, best = 0, xp = 0, graded = 0, right = 0, timerId = 0;
  const skills = new Map<Skill, [number, number]>();
  const hp = o.boss ? Math.max(1, q.length - 3) : 0; let bossHp = hp;
  // Calm mode: no hearts and no timer, even in boss fights.
  const calm = S.settings.calm, useHearts = !!o.hearts && !calm, timer = calm ? 0 : o.timer;
  // In a test, hearts are the mistakes you can make and still pass: lose one more and you fall under the pass mark.
  if (o.pass) hearts = Math.floor(q.filter((x) => !x.neutral).length * (100 - o.pass) / 100) + 1;
  const quit = () => { clearInterval(timerId); if (i === 0 || confirm('Leave this stop? Progress in it will be lost.')) home(); else render(); };
  const render = () => {
    clearInterval(timerId);
    const it = q[i];
    const foot = h('div', { class: 'foot' });
    const heartsEl = useHearts ? h('div', { class: 'hearts', 'aria-label': `${hearts} hearts left` }, '♥ ', hearts) : null;
    const boss = o.boss ? h('div', { class: 'oni' }, art('tanuki', o.boss.name, 'bossface'), bar(bossHp / hp, 'bad')) : null;
    const tbar = timer && !it.neutral ? bar(1, 'mint timer') : null;
    let answered = false;
    const onDone: Done = (ok, note, skip) => {
      if (answered) return; answered = true; clearInterval(timerId);
      if (it.neutral || skip) { if (note) foot.append(h('div', { class: 'fb ok' }, note)); else return next(); }
      else {
        graded++;
        if (it.skill) { const t = skills.get(it.skill) ?? [0, 0]; skills.set(it.skill, [t[0] + (ok ? 1 : 0), t[1] + 1]); }
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
    const eyebrow = o.boss ? `${o.boss.name.toUpperCase()} · ${i + 1} OF ${q.length}` : it.skill ? `${it.skill.toUpperCase()} · ${i + 1} OF ${q.length}` : combo >= 2 && !calm ? `COMBO x${combo} · ${it.eyebrow}` : it.eyebrow;
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
  const fail = (score?: number) => {
    sfx('bad');
    const host = o.boss?.name ?? o.host;
    showFlow(h('div', { class: 'screen flow' }, h('div', { class: 'center' }, host ? art('tanuki', '', 'bossface big') : h('div', { class: 'medal bad' }, jp('休')),
      h('div', { class: 'title' }, score != null ? `${score}%: almost there` : o.boss ? `${o.boss.name} wins this round` : 'Out of hearts'),
      h('div', { class: 'sub' }, score != null ? `You need ${o.pass}% to pass. No waiting: try again right away.` : 'No waiting: try again right away. Every mistake shows you what to practice.')),
      skillBars(skills),
      h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: () => (o.boss ? o.boss.again() : runQuiz({ ...o, items: o.rebuild?.() ?? o.items })) }, 'Try again'), h('button', { class: 'btn ghost', onclick: home }, 'Back')), home);
  };
  const finish = () => {
    const acc = o.acc ?? pct(right, graded);
    if (o.pass && acc < o.pass) return fail(acc);
    complete(o.stopId, xp, acc, best, o.onWin?.() ?? '', o.boss ? `${o.boss.name} defeated!` : o.title, o.medal, skills);
  };
  render();
}

/** Records a finished stop and shows the reward screen. */
/** Results by skill, for tests. */
const skillBars = (skills?: Map<Skill, [number, number]>) => (skills?.size ? h('div', { class: 'skills' }, [...skills].map(([k, [r, n]]) =>
  h('div', { class: 'skill' }, h('div', { class: 'row' }, h('b', null, k), h('small', null, `${r} of ${n}`)), bar(r / n, r / n < 0.8 ? 'warn' : '')))) : null);

export function complete(stopId: string | undefined, xp: number, acc: number, best: number, sub: string, title = 'Lesson done!', medal?: string, skills?: Map<Skill, [number, number]>) {
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
    skillBars(skills),
    h('div', { style: { flex: '1' } }), h('button', { class: 'btn', onclick: home }, 'Continue')), home);
}

// ---------- Story (manga page) ----------
function storyScreen(id: string, st: Story, label = `Story · ${st.title}`, extra: Item[] = []) {
  // English is on by default early on; Japanese takes over as the learner reads more kana.
  let shown = 1, showEn = !extra.length; // Speak it: English starts hidden, so the questions test your Japanese.
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
    else runQuiz({ stopId: id, label: st.title, items: [...st.quiz.map((qq) => ({ ...chooseItem({ t: 'choose', prompt: qq.q, options: qq.options, a: qq.a }), eyebrow: 'About the dialogue' })), ...extra], title: 'Lesson done!', onWin: () => (extra.length ? 'You followed a real conversation and said it yourself.' : `You read "${st.title}".`) });
  } }, 'Next panel');
  const enBtn = h('button', { class: 'linkbtn', onclick: () => { showEn = !showEn; enBtn.textContent = showEn ? 'Hide English' : 'Show English'; draw(); } }, showEn ? 'Hide English' : 'Show English');
  draw();
  setTimeout(() => { const l = st.panels[0].lines[0]; say(lineText(l.tokens), false, voiceOf(l.who)); }, 300);
  showFlow(h('div', { class: 'screen flow' },
    h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: home }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, rj(label)), enBtn),
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
    if (!s) {
      // Then say your side of the chat out loud.
      const mine = m.steps.flatMap((x) => ('choices' in x ? x.choices.filter((c) => c.ok).map((c) => c.jp) : []));
      const acc = pct(goals.length, goals.length + mistakes);
      return runQuiz({ stopId: id, label: `Speak it · ${m.title}`, items: mine.map((t) => ({ ...sayItem(t, 'Say your line from the chat'), eyebrow: 'Now say it' })), acc, title: 'Mission complete!', medal: '友', onWin: () => `${m.npc} is your new friend!` });
    }
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
    h('button', { class: 'btn', onclick: () => {
      if (!had) S.album.push(c.id);
      const sub = `${S.album.length} card${S.album.length === 1 ? '' : 's'} in your album.`;
      if (c.tf?.length) runQuiz({ stopId: id, label: rj(c.title), items: c.tf.map((t) => trueFalse('Culture check', rj(t.s), t.a, rj(t.note))), title: 'Lesson done!', medal: '集', onWin: () => sub });
      else complete(id, 0, 100, 0, sub, had ? 'Card reviewed' : 'Card collected!', '集');
    } }, c.tf?.length ? 'Quick check' : had ? 'Done' : 'Add to my album')), home);
}
export const cultureCard = (c: Culture) => h('div', { class: 'ccard' }, art(c.art, c.title), h('div', { class: 'cbody' }, h('div', { class: 'row' }, h('b', null, `${rj(c.title)} · `, jp(rj(c.jp))), h('small', null, `Unit ${COURSE.find((u) => u.parts.some((p) => p.stops.some((s) => s.kind === 'culture' && s.c === c)))?.n ?? 1}`)), h('p', null, rj(c.text))));
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
