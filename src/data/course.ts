// The Michi course: one path that blends kana lessons with Genki-style units.
import { WORDS_U1, STORIES_U1, GRAMMAR_U1, MISSION_U1, CULTURE_U1, GLOSS } from './unit1';
import { WORDS_U2, STORIES_U2, GRAMMAR_U2 } from './unit2';

export interface Word { id: string; kana: string; kanji?: string; romaji: string; alts?: string[]; en: string; art: string; note?: string; ex?: { jp: string; en: string };
  /** Used to build new practice sentences in tests: people/jobs, things, food and drink. */ tag?: 'job' | 'thing' | 'food' }
/** Plain text, or [text, ref] where ref is a word id or a GLOSS key (tap to see its meaning). */
export type Token = string | [string, string];
export interface Line { who: string; tokens: Token[]; en: string }
export interface Story { id: string; title: string; panels: { art: string; lines: Line[] }[]; quiz: { q: string; options: string[]; a: number }[] }
export type Drill =
  | { t: 'tiles'; en: string; answer: string[]; extra: string[] }
  | { t: 'choose'; prompt: string; en?: string; options: string[]; a: number }
  | { t: 'fix'; en: string; tokens: string[]; wrong: number; fix: string };
export interface Grammar { id: string; title: string; pattern: string[]; meaning: string; points: string[]; examples: { jp: string; en: string }[]; drills: Drill[];
  /** Grammar words this lesson introduces (checked: nothing is used before it is taught). */ teaches?: string[] }
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
  parts: Part[]; words: Word[]; boss: { name: string; jp: string }; soon?: string;
  /** Kanji pressed into the stamp book when the unit is cleared, and what the learner can now do. */
  stamp: string; cando: string[];
}

export const WORDS = new Map<string, Word>([...WORDS_U1, ...WORDS_U2].map((w) => [w.id, w]));
export const gloss = (ref: string): { jp: string; en: string; word?: Word } => {
  const w = WORDS.get(ref);
  return w ? { jp: w.kanji ? `${w.kana} ${w.kanji}` : w.kana, en: w.en, word: w } : { jp: ref, en: GLOSS[ref] ?? '' };
};
export const CULTURE = [...CULTURE_U1];

const kana = (script: 'h' | 'k', key: string, title: string): Stop => ({ id: `${script}-${key}`, kind: 'kana', title });
const words = (id: string, title: string, ids: string[]): Stop => ({ id, kind: 'words', title, words: ids.map((i) => WORDS.get(i)!) });
const GRAMMAR = new Map([...GRAMMAR_U1, ...GRAMMAR_U2].map((g) => [g.id, g]));
const STORIES = new Map([...STORIES_U1, ...STORIES_U2].map((st) => [st.id, st]));
const grammar = (id: string, title: string): Stop => ({ id, kind: 'grammar', title, g: GRAMMAR.get(id)! });
const culture = (i: number): Stop => ({ id: CULTURE_U1[i].id, kind: 'culture', title: `Culture: ${CULTURE_U1[i].title}`, c: CULTURE_U1[i] });

const speak = (id: string, title: string, story: string, say: { jp: string; en: string }[]): Stop => ({ id, kind: 'speak', title: `Speak it: ${title}`, story: STORIES.get(story)!, say });
const check = (id: string, n: number): Stop => ({ id, kind: 'checkpoint', title: `Checkpoint ${n}` });

// Each unit follows one Genki lesson and is cut into small chapters, so nothing is crammed:
// about 3-6 new words or one grammar point per lesson, and every chapter ends by talking.
export const COURSE: CourseUnit[] = [
  {
    id: 'u1', n: 1, jp: 'はじめまして', title: 'Meeting new friends', kanaUnit: 'hira', words: WORDS_U1, stamp: '友',
    cando: ['Say hello, thank you and goodbye at any time of day', 'Introduce yourself: name, school and major', 'Ask where someone is from and how old they are'],
    boss: { name: 'Gatekeeper Tanuki', jp: '狸' },
    parts: [
      { title: 'Hello', stops: [
        words('u1-w-hello', 'Hello at any time of day', ['ohayou', 'ohayougozaimasu', 'konnichiwa', 'konbanwa']),
        kana('h', 'vowels', 'Kana: あいうえお'),
        words('u1-w-thanks', 'Thank you, sorry, goodbye', ['arigatou', 'arigatougozaimasu', 'sumimasen', 'sayounara']),
        kana('h', 'k', 'Kana: かきくけこ'),
        words('u1-kw1', 'Read it: your first words', ['ai', 'ie', 'kao', 'ao', 'ike']),
        words('u1-w-meet', 'Nice to meet you', ['hajimemashite', 'yoroshiku']),
        culture(0),
        grammar('u1-g-desu', 'Saying your name'),
        culture(1),
        speak('u1-sp1', 'your first meeting', 'u1-story1', [{ jp: 'はじめまして。', en: 'Nice to meet you.' }, { jp: 'ベンです。', en: "I'm (your name)." }, { jp: 'よろしくおねがいします。', en: 'Please be kind to me.' }]),
        check('u1-cp1', 1)] },
      { title: 'About me', stops: [
        words('u1-w-people', 'Student, teacher and jobs', ['watashi', 'gakusei', 'sensei', 'isha', 'kaishain']),
        grammar('u1-g-wa', 'Saying what you are'),
        kana('h', 's', 'Kana: さしすせそ'),
        words('u1-kw2', 'Read it: words with S', ['kasa', 'sushi', 'isu', 'shio', 'suika']),
        words('u1-w-school', 'School and friends', ['daigaku', 'tomodachi', 'senkou', 'nihongo']),
        grammar('u1-g-no', 'My school, my major'),
        grammar('u1-g-ka', 'Asking questions'),
        { id: MISSION_U1.id, kind: 'mission', title: `Speak it: ${MISSION_U1.title}`, m: MISSION_U1 },
        check('u1-cp2', 2)] },
      { title: 'Where are you from?', stops: [
        kana('h', 't', 'Kana: たちつてと'),
        words('u1-kw3', 'Read it: words with T', ['kuchi', 'te', 'tako', 'kutsu', 'tsukue']),
        words('u1-w-world', 'Countries and nationality', ['nihon', 'amerika', 'igirisu', 'chuugoku', 'jin']),
        grammar('u1-g-where', 'Where are you from?'),
        kana('h', 'n', 'Kana: なにぬねの'),
        words('u1-kw4', 'Read it: words with N', ['neko', 'inu', 'sakana', 'okane']),
        words('u1-w-num1', 'Numbers 1 to 5', ['ichi', 'ni', 'san', 'yon', 'go']),
        words('u1-w-num2', 'Numbers 6 to 10, and zero', ['roku', 'nana', 'hachi', 'kyuu', 'juu', 'zero']),
        words('u1-w-age', 'Age and phone numbers', ['sai', 'nansai', 'denwa', 'bangou']),
        speak('u1-sp3', 'the welcome party', 'u1-story2', [{ jp: 'なにじんですか。', en: 'What nationality are you?' }, { jp: 'なんさいですか。', en: 'How old are you?' }, { jp: 'わたしの ともだちです。', en: 'This is my friend.' }]),
        check('u1-cp3', 3)] },
    ],
  },
  {
    id: 'u2', n: 2, jp: 'かいもの', title: 'Shopping', kanaUnit: 'kata', words: WORDS_U2, stamp: '買',
    cando: ['Point at things and ask whose they are', 'Order food and drinks', 'Ask prices and count up to 10,000 yen', 'Read all of hiragana and katakana'],
    boss: { name: 'Gatekeeper Tanuki', jp: '狸' },
    parts: [
      { title: 'This and that', stops: [
        kana('h', 'h', 'Kana: はひふへほ'),
        words('u2-w-things', 'Things you carry', ['hon', 'kaban', 'tokei', 'saifu', 'megane']),
        grammar('u2-g-kore', 'This, that and that over there'),
        kana('h', 'm', 'Kana: まみむめも'),
        words('u2-kw1', 'Read it: words with H and M', ['hana', 'hoshi', 'mimi', 'mushi']),
        grammar('u2-g-dare', 'Whose is it?'),
        speak('u2-sp1', 'whose umbrella?', 'u2-story1', [{ jp: 'これは だれの かさですか。', en: 'Whose umbrella is this?' }, { jp: 'それは わたしの かさです。', en: "That's my umbrella." }]),
        check('u2-cp1', 1)] },
      { title: 'At the café', stops: [
        kana('h', 'yw', 'Kana: やゆよ わをん'),
        words('u2-w-cafe', 'Café menu', ['koohii', 'ocha', 'mizu', 'pan', 'keeki']),
        kana('h', 'r', 'Kana: らりるれろ'),
        grammar('u2-g-kudasai', 'Ordering: please give me'),
        words('u2-kw2', 'Read it: words with Y, W and R', ['yama', 'kuruma', 'saru', 'sora', 'watashi']),
        speak('u2-sp2', 'at the café', 'u2-story2', [{ jp: 'すみません。', en: 'Excuse me.' }, { jp: 'コーヒーを ください。', en: 'A coffee, please.' }, { jp: 'おちゃを ください。', en: 'Green tea, please.' }]),
        check('u2-cp2', 2)] },
      { title: 'How much is it?', stops: [
        kana('h', 'gz', 'Kana: が and ざ'),
        words('u2-w-price', 'Hundreds, thousands and yen', ['hyaku', 'sen', 'man', 'en', 'ikura']),
        kana('h', 'dbp', 'Kana: だ and ば'),
        grammar('u2-g-ikura', 'Asking prices'),
        kana('h', 'p', 'Kana: ぱぴぷぺぽ'),
        words('u2-kw3', 'Read it: words with ゛ and ゜', ['buta', 'gohan', 'tenpura', 'denwa', 'kaban']),
        speak('u2-sp3', 'at the shop', 'u2-story3', [{ jp: 'これは いくらですか。', en: 'How much is this?' }, { jp: 'あれを ください。', en: "I'll take that one, please." }]),
        check('u2-cp3', 3)] },
      { title: 'Combos and long sounds', stops: [
        kana('h', 'combo1', 'Kana: きゃ, しゃ, ちゃ'),
        kana('h', 'combo1b', 'Kana: にゃ and ひゃ'),
        words('u2-kw4', 'Read it: words with combos', ['hyaku', 'kyuu', 'chuugoku', 'isha', 'kaishain']),
        kana('h', 'combo2', 'Kana: みゃ, りゃ, ぎゃ'),
        kana('h', 'combo2b', 'Kana: じゃ, びゃ, ぴゃ'),
        kana('h', 'xtra', 'Kana: small っ and long vowels'),
        speak('u2-sp4', 'your phone number?', 'u2-story4', [{ jp: 'でんわばんごうは なんですか。', en: "What's your phone number?" }, { jp: 'ありがとう！', en: 'Thanks!' }]),
        check('u2-cp4', 4)] },
      { title: 'Katakana: first words', stops: [
        kana('k', 'vowels', 'Kana: アイウエオ'),
        kana('k', 'k', 'Kana: カキクケコ'),
        kana('k', 's', 'Kana: サシスセソ'),
        words('u2-kw5', 'Read it: katakana words', ['kokoa', 'kiui', 'aisu']),
        kana('k', 't', 'Kana: タチツテト'),
        kana('k', 'n', 'Kana: ナニヌネノ'),
        words('u2-kw6', 'Read it: more katakana words', ['tenisu', 'nekutai', 'tsuna', 'takosu']),
        speak('u2-sp5', 'ice cream or cocoa?', 'u2-story5', [{ jp: 'アイスを ください。', en: 'An ice cream, please.' }, { jp: 'ココアを ください。', en: 'A hot cocoa, please.' }]),
        check('u2-cp5', 5)] },
      { title: 'Katakana: around town', stops: [
        kana('k', 'h', 'Kana: ハヒフヘホ'),
        kana('k', 'm', 'Kana: マミムメモ'),
        kana('k', 'yw', 'Kana: ヤユヨ ワヲン'),
        kana('k', 'r', 'Kana: ラリルレロ'),
        words('u2-kw7', 'Read it: around town', ['hoteru', 'kamera', 'naifu', 'miruku']),
        speak('u2-sp6', 'whose camera?', 'u2-story6', [{ jp: 'これは だれの カメラですか。', en: 'Whose camera is this?' }, { jp: 'ミルクを ください。', en: 'Milk, please.' }]),
        check('u2-cp6', 6)] },
      { title: 'Katakana: voiced and long', stops: [
        kana('k', 'gz', 'Kana: ガ and ザ'),
        kana('k', 'dbp', 'Kana: ダ and バ'),
        kana('k', 'p', 'Kana: パピプペポ'),
        kana('k', 'xtra', 'Kana: long ー and small ッ'),
        words('u2-kw8', 'Read it: café and home', ['terebi', 'pasokon', 'keeki', 'koohii']),
        speak('u2-sp7', 'cake and coffee', 'u2-story7', [{ jp: 'ケーキは いくらですか。', en: 'How much is the cake?' }, { jp: 'ケーキを ください。', en: 'The cake, please.' }]),
        check('u2-cp7', 7)] },
      { title: 'Katakana: new sounds', stops: [
        kana('k', 'combo1', 'Kana: キャ, シャ, チャ'),
        kana('k', 'combo1b', 'Kana: ニャ and ヒャ'),
        kana('k', 'combo2', 'Kana: ミャ, リャ, ギャ'),
        kana('k', 'combo2b', 'Kana: ジャ, ビャ, ピャ'),
        kana('k', 'new', 'Kana: ファ, ティ and friends'),
        words('u2-kw9', 'Read it: party words', ['menyuu', 'juusu', 'fooku', 'paatii']),
        speak('u2-sp8', 'the party', 'u2-story8', [{ jp: 'パーティーは どこですか。', en: 'Where is the party?' }, { jp: 'ジュースを ください。', en: 'Juice, please.' }]),
        check('u2-cp8', 8)] },
    ],
  },
];
export const ALL_STOPS = COURSE.flatMap((u) => u.parts.flatMap((p) => p.stops));
export const unitOfStop = (s: Stop) => COURSE.find((u) => u.parts.some((p) => p.stops.includes(s)))!;
