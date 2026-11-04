// Kana data. Hiragana is written out; katakana is derived by codepoint offset.
export type Script = 'h' | 'k';
export interface Kana {
  id: string;       // e.g. "h:か"
  char: string;     // か
  romaji: string;   // canonical reading shown to the learner
  alts: string[];   // other accepted typed readings
  script: Script;
  sound: string;    // text spoken by TTS (homophones share a sound)
}

// [kana, romaji, ...alternative spellings]
const H_ROWS: Record<string, string[][]> = {
  vowels: [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']],
  k: [['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']],
  s: [['さ','sa'],['し','shi','si'],['す','su'],['せ','se'],['そ','so']],
  t: [['た','ta'],['ち','chi','ti'],['つ','tsu','tu'],['て','te'],['と','to']],
  n: [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']],
  h: [['は','ha'],['ひ','hi'],['ふ','fu','hu'],['へ','he'],['ほ','ho']],
  m: [['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']],
  yw: [['や','ya'],['ゆ','yu'],['よ','yo'],['わ','wa'],['を','wo','o'],['ん','n','nn']],
  r: [['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']],
  gz: [['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],['ざ','za'],['じ','ji','zi'],['ず','zu'],['ぜ','ze'],['ぞ','zo']],
  dbp: [['だ','da'],['ぢ','ji','di'],['づ','zu','du'],['で','de'],['ど','do'],['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']],
  combo1: [['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],['しゃ','sha','sya'],['しゅ','shu','syu'],['しょ','sho','syo'],['ちゃ','cha','tya'],['ちゅ','chu','tyu'],['ちょ','cho','tyo'],['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo']],
  combo2: [['みゃ','mya'],['みゅ','myu'],['みょ','myo'],['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo'],['じゃ','ja','jya','zya'],['じゅ','ju','jyu','zyu'],['じょ','jo','jyo','zyo'],['びゃ','bya'],['びゅ','byu'],['びょ','byo'],['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']],
};

const toKata = (s: string) => [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).join('');

function make(script: Script, row: string[][]): Kana[] {
  return row.map(([h, romaji, ...alts]) => {
    const char = script === 'h' ? h : toKata(h);
    // を is pronounced "o"; ぢ/づ sound like じ/ず
    const sound = h === 'を' ? 'お' : h === 'ぢ' ? 'じ' : h === 'づ' ? 'ず' : h;
    return { id: `${script}:${char}`, char, romaji, alts, script, sound: script === 'h' ? sound : toKata(sound) };
  });
}

export interface Lesson { id: string; unit: string; title: string; blurb: string; kana: Kana[]; trace: boolean }
export interface Unit { id: string; script: Script; title: string; jp: string; lessons: Lesson[]; boss: { name: string; jp: string } }

const LESSON_META: [string, string, string, boolean][] = [
  ['vowels', 'The vowels', 'Five sounds every other kana builds on: a, i, u, e, o.', true],
  ['k', 'The K row', 'Add a K to each vowel: ka, ki, ku, ke, ko.', true],
  ['s', 'The S row', 'Sa, shi, su, se, so. Note that "si" is said "shi".', true],
  ['t', 'The T row', 'Ta, chi, tsu, te, to. Two odd ones: chi and tsu.', true],
  ['n', 'The N row', 'Na, ni, nu, ne, no. The particle の (no) is everywhere.', true],
  ['h', 'The H row', 'Ha, hi, fu, he, ho. Fu is soft, between f and h.', true],
  ['m', 'The M row', 'Ma, mi, mu, me, mo.', true],
  ['yw', 'Y, W and N', 'Ya, yu, yo, wa, wo, and ん, the only lone consonant.', true],
  ['r', 'The R row', 'Ra, ri, ru, re, ro. The Japanese R is a light tap.', true],
  ['gz', 'G and Z sounds', 'Two small marks (゛) turn K into G and S into Z.', false],
  ['dbp', 'D, B and P', 'T becomes D, H becomes B, and a small circle (゜) makes P.', false],
  ['combo1', 'Combos, part 1', 'A small ゃ, ゅ or ょ blends into one beat: kya, sha, cho.', false],
  ['combo2', 'Combos, part 2', 'More blends: mya, ryu, ja, byo, pyo.', false],
];

function buildUnit(script: Script): Unit {
  const name = script === 'h' ? 'Hiragana' : 'Katakana';
  return {
    id: script === 'h' ? 'hira' : 'kata',
    script,
    title: name,
    jp: script === 'h' ? 'ひらがな' : 'カタカナ',
    boss: script === 'h' ? { name: 'The Kana Oni', jp: '鬼' } : { name: 'The Katakana Tengu', jp: '天' },
    lessons: LESSON_META.map(([key, title, blurb, trace]) => ({
      id: `${script}-${key}`,
      unit: script === 'h' ? 'hira' : 'kata',
      title,
      blurb: script === 'k' ? blurb.replace(/[ぁ-ゖ]/g, (c) => toKata(c)) : blurb,
      kana: make(script, H_ROWS[key]),
      trace,
    })),
  };
}

export const UNITS: Unit[] = [buildUnit('h'), buildUnit('k')];
export const ALL_KANA: Kana[] = UNITS.flatMap((u) => u.lessons.flatMap((l) => l.kana));
export const KANA_BY_ID = new Map(ALL_KANA.map((k) => [k.id, k]));
export const LESSONS = UNITS.flatMap((u) => u.lessons);

/** Chart layout: rows of 5 cells (null = empty slot) for the basic 46 + voiced. */
export const CHART_ROWS: (string | null)[][] = [
  ['あ','い','う','え','お'],['か','き','く','け','こ'],['さ','し','す','せ','そ'],['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],['は','ひ','ふ','へ','ほ'],['ま','み','む','め','も'],['や',null,'ゆ',null,'よ'],
  ['ら','り','る','れ','ろ'],['わ',null,null,null,'を'],['ん',null,null,null,null],
  ['が','ぎ','ぐ','げ','ご'],['ざ','じ','ず','ぜ','ぞ'],['だ','ぢ','づ','で','ど'],['ば','び','ぶ','べ','ぼ'],['ぱ','ぴ','ぷ','ぺ','ぽ'],
];
export const chartChar = (h: string, script: Script) => (script === 'h' ? h : toKata(h));

// Short original culture notes shown after lessons.
export const NOTES: [string, string][] = [
  ['Why is it called "kana"?', 'Kana grew out of simplified kanji. か came from the kanji 加, and you can still see its shape.'],
  ['Two scripts, one set of sounds', 'Hiragana and katakana make the same sounds. Hiragana handles grammar and native words; katakana is used for loanwords like コーヒー (coffee).'],
  ['Writing direction', 'Japanese can be written left to right or top to bottom. Books and newspapers often run in vertical columns, read from right to left.'],
  ['The particle は', 'When は marks the topic of a sentence it is read "wa", not "ha". You will meet it in your very first sentences.'],
  ['ん never starts a word', 'Almost no Japanese word begins with ん. It is the only kana that is a consonant on its own.'],
  ['Stroke order matters', 'Strokes usually go top to bottom and left to right. Good stroke order makes handwriting faster and easier for others to read.'],
  ['Small っ', 'A small っ doubles the next consonant: きって (kitte) means stamp, while きて (kite) means come.'],
  ['Long vowels in katakana', 'Katakana uses a dash, ー, to stretch a vowel: ケーキ (kēki) is cake.'],
  ['Kanji with kana', 'Most sentences mix all three scripts. In 食べる (taberu, to eat), the kanji carries the meaning and the hiragana carries the grammar.'],
];
