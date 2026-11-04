// The Michi course: one path that blends kana lessons with Genki-style units.
import { WORDS_U1, STORIES_U1, GRAMMAR_U1, MISSION_U1, CULTURE_U1, GLOSS } from './unit1';

export interface Word { id: string; kana: string; kanji?: string; romaji: string; alts?: string[]; en: string; art: string; note?: string }
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
export interface Culture { id: string; title: string; jp: string; art: string; text: string }

export type Stop =
  | { id: string; kind: 'kana'; title: string }
  | { id: string; kind: 'story'; title: string; story: Story }
  | { id: string; kind: 'words'; title: string; words: Word[] }
  | { id: string; kind: 'grammar'; title: string; g: Grammar }
  | { id: string; kind: 'mission'; title: string; m: Mission }
  | { id: string; kind: 'culture'; title: string; c: Culture };
export interface Part { title: string; stops: Stop[] }
export interface CourseUnit {
  id: string; n: number; jp: string; title: string; kanaUnit: 'hira' | 'kata';
  parts: Part[]; words: Word[]; boss?: { name: string; jp: string }; soon?: string;
}

export const WORDS = new Map<string, Word>(WORDS_U1.map((w) => [w.id, w]));
export const gloss = (ref: string): { jp: string; en: string; word?: Word } => {
  const w = WORDS.get(ref);
  return w ? { jp: w.kanji ? `${w.kana} ${w.kanji}` : w.kana, en: w.en, word: w } : { jp: ref, en: GLOSS[ref] ?? '' };
};
export const CULTURE = [...CULTURE_U1];

const kana = (script: 'h' | 'k', key: string, title: string): Stop => ({ id: `${script}-${key}`, kind: 'kana', title });
const words = (id: string, title: string, ids: string[]): Stop => ({ id, kind: 'words', title, words: ids.map((i) => WORDS.get(i)!) });
const story = (i: number): Stop => ({ id: STORIES_U1[i].id, kind: 'story', title: `Story: ${STORIES_U1[i].title}`, story: STORIES_U1[i] });
const grammar = (i: number): Stop => ({ id: GRAMMAR_U1[i].id, kind: 'grammar', title: `Grammar: ${GRAMMAR_U1[i].title}`, g: GRAMMAR_U1[i] });
const culture = (i: number): Stop => ({ id: CULTURE_U1[i].id, kind: 'culture', title: `Culture: ${CULTURE_U1[i].title}`, c: CULTURE_U1[i] });

export const COURSE: CourseUnit[] = [
  {
    id: 'u1', n: 1, jp: 'はじめまして', title: 'Meeting new friends', kanaUnit: 'hira', words: WORDS_U1,
    boss: { name: 'Gatekeeper Tanuki', jp: '狸' },
    parts: [
      { title: 'Hello', stops: [kana('h', 'vowels', 'Kana: あいうえお'), story(0), kana('h', 'k', 'Kana: かきくけこ'),
        words('u1-w-greet', 'Words: greetings', ['ohayou', 'konnichiwa', 'konbanwa', 'sayounara', 'arigatou', 'sumimasen', 'hajimemashite']),
        kana('h', 's', 'Kana: さしすせそ'), grammar(0), kana('h', 't', 'Kana: たちつてと')] },
      { title: 'About you', stops: [kana('h', 'n', 'Kana: なにぬねの'),
        words('u1-w-people', 'Words: people and school', ['watashi', 'gakusei', 'sensei', 'daigaku', 'tomodachi', 'isha', 'kaishain', 'senkou']),
        kana('h', 'h', 'Kana: はひふへほ'), grammar(1), kana('h', 'm', 'Kana: まみむめも'), kana('h', 'yw', 'Kana: やゆよ わをん'), culture(0)] },
      { title: 'Where from', stops: [kana('h', 'r', 'Kana: らりるれろ'),
        words('u1-w-world', 'Words: countries and numbers', ['nihon', 'amerika', 'igirisu', 'chuugoku', 'jin', 'sai', 'denwa', 'bangou']),
        kana('h', 'gz', 'Kana: が and ざ'), grammar(2), kana('h', 'dbp', 'Kana: だ, ば and ぱ'), story(1),
        kana('h', 'combo1', 'Kana: きゃ combos'), kana('h', 'combo2', 'Kana: more combos'),
        { id: MISSION_U1.id, kind: 'mission', title: `Mission: ${MISSION_U1.title}`, m: MISSION_U1 }, culture(1)] },
    ],
  },
  {
    id: 'u2', n: 2, jp: 'かいもの', title: 'Shopping', kanaUnit: 'kata', words: [],
    soon: 'Genki-style stories, words and grammar for this unit are coming next. Katakana is ready now.',
    parts: [{ title: 'Katakana', stops: [
      kana('k', 'vowels', 'Kana: アイウエオ'), kana('k', 'k', 'Kana: カキクケコ'), kana('k', 's', 'Kana: サシスセソ'), kana('k', 't', 'Kana: タチツテト'),
      kana('k', 'n', 'Kana: ナニヌネノ'), kana('k', 'h', 'Kana: ハヒフヘホ'), kana('k', 'm', 'Kana: マミムメモ'), kana('k', 'yw', 'Kana: ヤユヨ ワヲン'),
      kana('k', 'r', 'Kana: ラリルレロ'), kana('k', 'gz', 'Kana: ガ and ザ'), kana('k', 'dbp', 'Kana: ダ, バ and パ'),
      kana('k', 'combo1', 'Kana: キャ combos'), kana('k', 'combo2', 'Kana: more combos')] }],
  },
];
export const ALL_STOPS = COURSE.flatMap((u) => u.parts.flatMap((p) => p.stops));
export const unitOfStop = (s: Stop) => COURSE.find((u) => u.parts.some((p) => p.stops.includes(s)))!;
