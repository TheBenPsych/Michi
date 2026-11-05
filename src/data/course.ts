// The Michi course: one path that blends kana lessons with Genki-style units.
import { WORDS_U1, STORIES_U1, GRAMMAR_U1, MISSION_U1, CULTURE_U1, GLOSS } from './unit1';

export interface Word { id: string; kana: string; kanji?: string; romaji: string; alts?: string[]; en: string; art: string; note?: string; ex?: { jp: string; en: string } }
/** Plain text, or [text, ref] where ref is a word id or a GLOSS key (tap to see its meaning). */
export type Token = string | [string, string];
export interface Line { who: string; tokens: Token[]; en: string }
export interface Story { id: string; title: string; panels: { art: string; lines: Line[] }[]; quiz: { q: string; options: string[]; a: number }[] }
export type Drill =
  | { t: 'tiles'; en: string; answer: string[]; extra: string[] }
  | { t: 'choose'; prompt: string; en?: string; options: string[]; a: number }
  | { t: 'fix'; en: string; tokens: string[]; wrong: number; fix: string };
export interface Grammar { id: string; title: string; pattern: string[]; meaning: string; points: string[]; examples: { jp: string; en: string }[]; drills: Drill[] }
export interface Choice { jp: string; ok?: boolean; why?: string }
export type MStep = { npc: string; en: string } | { goal: string; choices: Choice[] };
export interface Mission { id: string; title: string; goal: string; npc: string; art: string; steps: MStep[] }
export interface Culture { id: string; title: string; jp: string; art: string; text: string; tf?: { s: string; a: boolean; note: string }[] }

export type Stop =
  | { id: string; kind: 'kana'; title: string }
  | { id: string; kind: 'story'; title: string; story: Story }
  | { id: string; kind: 'words'; title: string; words: Word[] }
  | { id: string; kind: 'grammar'; title: string; g: Grammar }
  | { id: string; kind: 'mission'; title: string; m: Mission }
  | { id: string; kind: 'culture'; title: string; c: Culture }
  /** "Speak it": the chapter's closing fluency lesson. A dialogue to hear, questions on it, then lines to say out loud. */
  | { id: string; kind: 'speak'; title: string; story: Story; say: { jp: string; en: string }[] }
  /** Short test at the end of a chapter, built from that chapter's lessons. */
  | { id: string; kind: 'checkpoint'; title: string };
/** A chapter: a handful of short lessons (Busuu-sized), ending with Speak it and a Checkpoint. */
export interface Part { title: string; stops: Stop[] }
export interface CourseUnit {
  id: string; n: number; jp: string; title: string; kanaUnit: 'hira' | 'kata';
  parts: Part[]; words: Word[]; boss?: { name: string; jp: string }; soon?: string;
  /** Kanji pressed into the stamp book when the unit is cleared, and what the learner can now do. */
  stamp: string; cando: string[];
}

export const WORDS = new Map<string, Word>(WORDS_U1.map((w) => [w.id, w]));
export const gloss = (ref: string): { jp: string; en: string; word?: Word } => {
  const w = WORDS.get(ref);
  return w ? { jp: w.kanji ? `${w.kana} ${w.kanji}` : w.kana, en: w.en, word: w } : { jp: ref, en: GLOSS[ref] ?? '' };
};
export const CULTURE = [...CULTURE_U1];

const kana = (script: 'h' | 'k', key: string, title: string): Stop => ({ id: `${script}-${key}`, kind: 'kana', title });
const words = (id: string, title: string, ids: string[]): Stop => ({ id, kind: 'words', title, words: ids.map((i) => WORDS.get(i)!) });
const grammar = (i: number, title: string): Stop => ({ id: GRAMMAR_U1[i].id, kind: 'grammar', title, g: GRAMMAR_U1[i] });
const culture = (i: number): Stop => ({ id: CULTURE_U1[i].id, kind: 'culture', title: `Culture: ${CULTURE_U1[i].title}`, c: CULTURE_U1[i] });

const speak = (id: string, title: string, i: number, say: { jp: string; en: string }[]): Stop => ({ id, kind: 'speak', title: `Speak it: ${title}`, story: STORIES_U1[i], say });
const check = (id: string, n: number): Stop => ({ id, kind: 'checkpoint', title: `Checkpoint ${n}` });

// Each unit follows one Genki lesson and is cut into small chapters, so nothing is crammed:
// about 3-6 new words or one grammar point per lesson, and every chapter ends by talking.
export const COURSE: CourseUnit[] = [
  {
    id: 'u1', n: 1, jp: 'はじめまして', title: 'Meeting new friends', kanaUnit: 'hira', words: WORDS_U1, stamp: '友',
    cando: ['Say hello and goodbye at any time of day', 'Introduce yourself: name, school and major', 'Ask where someone is from and how old they are'],
    boss: { name: 'Gatekeeper Tanuki', jp: '狸' },
    parts: [
      { title: 'Hello', stops: [
        words('u1-w-hello', 'Konnichiwa!', ['konnichiwa', 'hajimemashite', 'ohayou', 'konbanwa']),
        kana('h', 'vowels', 'Kana: あいうえお'),
        words('u1-w-thanks', 'Thank you and excuse me', ['arigatou', 'sumimasen', 'sayounara']),
        kana('h', 'k', 'Kana: かきくけこ'),
        words('u1-kw1', 'Read it: your first words', ['ai', 'ie', 'kao', 'ao', 'ike']),
        speak('u1-sp1', 'your first meeting', 0, [{ jp: 'はじめまして。', en: 'Nice to meet you.' }, { jp: 'こんにちは。', en: 'Hello.' }]),
        check('u1-cp1', 1)] },
      { title: 'About me', stops: [
        words('u1-w-people', 'Student, teacher and jobs', ['watashi', 'gakusei', 'sensei', 'isha', 'kaishain']),
        grammar(0, 'Saying what you are'),
        kana('h', 's', 'Kana: さしすせそ'),
        words('u1-kw2', 'Read it: words with S', ['kasa', 'sushi', 'isu', 'shio', 'suika']),
        words('u1-w-school', 'School and friends', ['daigaku', 'tomodachi', 'senkou']),
        grammar(2, 'My school, my major'),
        culture(0),
        { id: MISSION_U1.id, kind: 'mission', title: `Speak it: ${MISSION_U1.title}`, m: MISSION_U1 },
        check('u1-cp2', 2)] },
      { title: 'Where are you from?', stops: [
        kana('h', 't', 'Kana: たちつてと'),
        words('u1-kw3', 'Read it: words with T', ['kuchi', 'te', 'tako', 'kutsu', 'tsukue']),
        words('u1-w-world', 'Countries and nationality', ['nihon', 'amerika', 'igirisu', 'chuugoku', 'jin']),
        grammar(1, 'Asking questions'),
        kana('h', 'n', 'Kana: なにぬねの'),
        words('u1-w-age', 'Age and phone numbers', ['sai', 'denwa', 'bangou']),
        culture(1),
        speak('u1-sp3', 'the welcome party', 1, [{ jp: 'ちゅうごくじんですか。', en: 'Are you Chinese?' }, { jp: 'わたしの ともだちです。', en: 'She is my friend.' }]),
        check('u1-cp3', 3)] },
    ],
  },
  {
    id: 'u2', n: 2, jp: 'かいもの', title: 'Shopping', kanaUnit: 'kata', words: [], stamp: '買',
    cando: ['Read all of hiragana', 'Read every katakana sound', 'Read loanwords like coffee and TV'],
    soon: 'Genki-style words, grammar and talking lessons for this unit are coming next. The rest of hiragana and all of katakana are ready now.',
    parts: [
      { title: 'Finish hiragana', stops: [
        kana('h', 'h', 'Kana: はひふへほ'), kana('h', 'm', 'Kana: まみむめも'), kana('h', 'yw', 'Kana: やゆよ わをん'), kana('h', 'r', 'Kana: らりるれろ')] },
      { title: 'Hiragana extras', stops: [
        kana('h', 'gz', 'Kana: が and ざ'), kana('h', 'dbp', 'Kana: だ, ば and ぱ'), kana('h', 'combo1', 'Kana: きゃ combos'), kana('h', 'combo2', 'Kana: more combos')] },
      { title: 'Katakana', stops: [
        kana('k', 'vowels', 'Kana: アイウエオ'), kana('k', 'k', 'Kana: カキクケコ'), kana('k', 's', 'Kana: サシスセソ'), kana('k', 't', 'Kana: タチツテト'),
        kana('k', 'n', 'Kana: ナニヌネノ'), kana('k', 'h', 'Kana: ハヒフヘホ'), kana('k', 'm', 'Kana: マミムメモ')] },
      { title: 'More katakana', stops: [
        kana('k', 'yw', 'Kana: ヤユヨ ワヲン'), kana('k', 'r', 'Kana: ラリルレロ'), kana('k', 'gz', 'Kana: ガ and ザ'), kana('k', 'dbp', 'Kana: ダ, バ and パ'),
        kana('k', 'combo1', 'Kana: キャ combos'), kana('k', 'combo2', 'Kana: more combos')] },
    ],
  },
];
export const ALL_STOPS = COURSE.flatMap((u) => u.parts.flatMap((p) => p.stops));
export const unitOfStop = (s: Stop) => COURSE.find((u) => u.parts.some((p) => p.stops.includes(s)))!;
