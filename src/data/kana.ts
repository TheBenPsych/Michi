// Kana data. Hiragana is written out; katakana is derived by codepoint offset.
export type Script = 'h' | 'k';
export interface Kana {
  id: string;       // e.g. "h:か"
  char: string;     // か
  romaji: string;   // canonical reading shown to the learner
  alts: string[];   // other accepted typed readings
  script: Script;
  sound: string;    // text spoken by TTS (homophones share a sound)
  /** Sound-pattern lessons (small っ, long vowels, new katakana sounds) teach whole words: meaning and a short note. */
  en?: string; note?: string;
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
  // Big rows are split so a lesson never brings more than about 10 new kana.
  dbp: [['だ','da'],['ぢ','ji','di'],['づ','zu','du'],['で','de'],['ど','do'],['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo']],
  p: [['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']],
  combo1: [['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],['しゃ','sha','sya'],['しゅ','shu','syu'],['しょ','sho','syo'],['ちゃ','cha','tya'],['ちゅ','chu','tyu'],['ちょ','cho','tyo']],
  combo1b: [['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo']],
  combo2: [['みゃ','mya'],['みゅ','myu'],['みょ','myo'],['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo']],
  combo2b: [['じゃ','ja','jya','zya'],['じゅ','ju','jyu','zyu'],['じょ','jo','jyo','zyo'],['びゃ','bya'],['びゅ','byu'],['びょ','byo'],['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']],
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

/** Lessons that teach sound patterns with whole words, written per script: [text, romaji, alts, meaning, note]. */
const SPECIAL: Record<string, [string, string, string[], string, string][]> = {
  'h-xtra': [
    ['きって', 'kitte', ['kite'], 'stamp', 'A small っ is a tiny pause: ki-(stop)-te. Compare きて (kite), "come".'],
    ['ざっし', 'zasshi', ['zassi'], 'magazine', 'The small っ doubles the next sound: za-(stop)-shi.'],
    ['がっこう', 'gakkou', ['gakko', 'gakkoo'], 'school', 'A pause (っ), then a long o: おう is said as one long "oh".'],
    ['おかあさん', 'okaasan', ['okasan'], 'mother', 'ああ is one long "ah". Holding a vowel can change the word.'],
    ['おにいさん', 'oniisan', ['onisan'], 'big brother', 'いい is one long "ee".'],
    ['せんせい', 'sensei', ['sense', 'sensee'], 'teacher', 'えい is usually said as a long "eh": sen-seh.'],
  ],
  'k-xtra': [
    ['ケーキ', 'keeki', ['keki', 'kēki'], 'cake', 'The dash ー makes the vowel before it long: ke-e-ki.'],
    ['コーヒー', 'koohii', ['kohi', 'kouhii', 'koohi'], 'coffee', 'Two dashes, two long vowels: ko-o-hi-i.'],
    ['ノート', 'nooto', ['noto', 'nōto'], 'notebook', 'Katakana uses ー for long sounds instead of an extra vowel.'],
    ['スーパー', 'suupaa', ['supa', 'suupa'], 'supermarket', 'Long u, long a: su-u-pa-a.'],
    ['ベッド', 'beddo', ['bedo'], 'bed', 'A small ッ works just like hiragana っ: a tiny pause.'],
    ['カップ', 'kappu', ['kapu'], 'cup', 'English words that end in a consonant get an extra u or o: cup becomes kappu.'],
  ],
  'k-new': [
    ['ファ', 'fa', [], '', 'フ + small ァ. As in ファン (fan).'], ['フィ', 'fi', [], '', 'フ + small ィ. As in フィルム (film).'],
    ['フェ', 'fe', [], '', 'フ + small ェ. As in カフェ (café).'], ['フォ', 'fo', [], '', 'フ + small ォ. As in フォーク (fork).'],
    ['ティ', 'ti', ['thi'], '', 'テ + small ィ makes "ti", a sound Japanese words do not have. As in パーティー (party).'],
    ['ディ', 'di', ['dhi'], '', 'デ + small ィ. As in ディズニー (Disney).'],
    ['ウィ', 'wi', [], '', 'ウ + small ィ. As in ウィキ (wiki).'], ['ウェ', 'we', [], '', 'ウ + small ェ. As in ウェブ (web).'],
    ['ウォ', 'wo', [], '', 'ウ + small ォ. As in ウォッチ (watch).'], ['ヴ', 'vu', ['bu'], '', 'ウ with ゛ is a "v". Many people just say it like ブ (bu).'],
  ],
};

export interface Lesson { id: string; unit: string; title: string; blurb: string; kana: Kana[]; trace: boolean }
export interface Unit { id: string; script: Script; title: string; jp: string; lessons: Lesson[]; boss: { name: string; jp: string } }

// [key, title, blurb, trace, only for this script]
const LESSON_META: [string, string, string, boolean, Script?][] = [
  ['vowels', 'The vowels', 'Five sounds every other kana builds on: a, i, u, e, o.', true],
  ['k', 'The K row', 'Add a K to each vowel: ka, ki, ku, ke, ko.', true],
  ['s', 'The S row', 'Sa, shi, su, se, so. Note that "si" is said "shi".', true],
  ['t', 'The T row', 'Ta, chi, tsu, te, to. Two odd ones: chi and tsu.', true],
  ['n', 'The N row', 'Na, ni, nu, ne, no. Nothing tricky here.', true],
  ['h', 'The H row', 'Ha, hi, fu, he, ho. Fu is soft, between f and h.', true],
  ['m', 'The M row', 'Ma, mi, mu, me, mo.', true],
  ['yw', 'Y, W and N', 'Ya, yu, yo, wa, wo, and n. The n kana is the only one that is just a consonant. The wo kana is said "o" and is only used as a grammar word.', true],
  ['r', 'The R row', 'Ra, ri, ru, re, ro. The Japanese R is a light tap of the tongue, halfway between r, l and d.', true],
  ['gz', 'G and Z sounds', 'Two small marks (゛, called dakuten) make a sound "voiced": K becomes G, S becomes Z. Same shape, new sound.', true],
  ['dbp', 'D and B sounds', 'The same two marks (゛) turn T into D and H into B. ぢ and づ sound like じ and ず and are rare.', true],
  ['p', 'P sounds', 'A small circle (゜, called handakuten) turns the H row into P: pa, pi, pu, pe, po. Only the H row takes it.', true],
  ['combo1', 'Combos, part 1', 'A kana from the i column (き, し, ち) plus a small ゃ, ゅ or ょ blends into one beat: kya, sha, cho. The small one is written about half size.', false],
  ['combo1b', 'Combos, part 2', 'The same trick with に and ひ: nya, nyu, nyo, hya, hyu, hyo.', false],
  ['combo2', 'Combos, part 3', 'With み, り and ぎ: mya, ryu, gyo.', false],
  ['combo2b', 'Combos, part 4', 'With じ, び and ぴ: ja, ju, jo, bya, pyo. Note じゃ is just "ja".', false],
  ['xtra', 'Small っ and long vowels', 'Two rules that change words: a small っ is a short pause that doubles the next sound, and a doubled vowel is held twice as long.', false, 'h'],
  ['xtra', 'Long ー and small ッ', 'Katakana marks a long vowel with a dash, ー. A small ッ is a tiny pause, just like in hiragana.', false, 'k'],
  ['new', 'New sounds for loanwords', 'Katakana adds small vowels (ァ ィ ェ ォ) to write sounds Japanese does not have, like fa, ti and we.', false, 'k'],
];

/** The very first lesson of each script explains what the script is for. */
export const SCRIPT_INTRO: Record<Script, string> = {
  h: 'Japanese uses three scripts together. Hiragana writes native words and grammar. Katakana writes words from other languages. Kanji are Chinese characters that carry meaning. You start with hiragana: 46 basic shapes, one for each sound.',
  k: 'Katakana makes exactly the same sounds as hiragana, with sharper, simpler shapes. It writes words from other languages (coffee becomes コーヒー), foreign names and sound effects. You already know the sounds, so this goes faster.',
};

/** Memory hooks (and how to say each vowel). Original to Michi. */
export const HOOKS: Record<string, string> = {
  あ: 'Say "ah" as in father. Picture an apple with a cross on it.', い: 'Say "ee" as in feet, short. Two eels side by side.', う: 'Say "oo" with relaxed lips. Someone bent over going "ooh".',
  え: 'Say "eh" as in egg. An energetic dancer.', お: 'Say "oh", short. A golfer swinging and shouting "oh!"',
  か: 'A blade cutting: a karate chop, "ka!"', き: 'Looks like a key: "ki".', く: 'A cuckoo\'s open beak: "ku".', け: 'A keg next to a pole: "ke".', こ: 'Two co-workers lying side by side: "ko".',
  さ: 'A sign saying "sa" with a little hook.', し: 'A long strand of hair: "she" has long hair.', す: 'A swing with a loop: "su".', せ: 'A mouth with a big tooth saying "se".', そ: 'A zig-zag sewing stitch: "so".',
  た: 'Looks like the letters t and a: "ta".', ち: 'A cheerleader: "chi".', つ: 'A tsunami wave: "tsu".', て: 'A hand reaching out. て even means hand!', と: 'A toe with a splinter: "to".',
  な: 'A nun kneeling to pray: "na".', に: 'A knee next to a wall: "ni".', ぬ: 'Noodles with chopsticks: "nu".', ね: 'A cat curling its tail: "ne".', の: 'A no-entry sign: "no".',
  は: 'A happy H with an a: "ha".', ひ: 'A big grin: "hee hee".', ふ: 'Mount Fuji: "fu". Blow gently, between f and h.', へ: 'A hill to climb: "he".', ほ: 'は with an extra bar on top: "ho".',
  ま: 'Mama with her hair tied up: "ma".', み: 'Looks like the number 21: "me" at 21.', む: 'A cow going "moo".', め: 'An eye: め means eye!', も: 'A fishhook catching more fish: "mo".',
  や: 'A yak with horns: "ya".', ゆ: 'A U-turn sign: "yu".', よ: 'A yo-yo on a string: "yo".', わ: 'A swan: "wa".', を: 'Someone falling: "whoa!" It is said "o".', ん: 'Looks like a lowercase n: "n".',
  ら: 'A rabbit with one ear: "ra".', り: 'Reeds by a river: "ri".', る: 'A road with a loop at the end: "ru".', れ: 'A man kneeling to reach: "re".', ろ: 'る without the loop: a road, "ro".',
  ア: 'An axe: "a".', イ: 'An eagle\'s leg: "i".', ウ: 'う with a hat: "u".', エ: 'An elevator shaft: "e".', オ: 'An opera singer: "o".',
  カ: 'Like か without the dash: "ka".', キ: 'A key with two teeth: "ki".', ク: 'A cook\'s hat: "ku".', ケ: 'A letter K, leaning: "ke".', コ: 'A corner: "ko".',
  サ: 'A salad bowl with chopsticks: "sa".', シ: 'Smiling eyes looking up: "shi". Strokes go up.', ス: 'A superhero running: "su".', セ: 'Like せ: "se".', ソ: 'A needle sewing down: "so". Strokes go down.',
  タ: 'A taco: "ta".', チ: 'A cheerleader with a pom-pom: "chi".', ツ: 'Eyes looking sideways at a tsunami: "tsu".', テ: 'A telephone pole: "te".', ト: 'A totem pole: "to".',
  ナ: 'A knife: "na".', ニ: 'Two lines, like に without the side: "ni".', ヌ: 'Chopsticks lifting noodles: "nu".', ネ: 'A necklace on a hook: "ne".', ノ: 'One slash, "no!"',
  ハ: 'Two strokes laughing "ha ha".', ヒ: 'A heel: "hi".', フ: 'A hook, like ふ simplified: "fu".', ヘ: 'The same as へ: "he".', ホ: 'A holy cross: "ho".',
  マ: 'A mama\'s apron: "ma".', ミ: 'Three lines, like み: "mi".', ム: 'A moo-ing cow\'s face: "mu".', メ: 'A crossed-out mess: "me".', モ: 'Like も with no hook: "mo".',
  ヤ: 'Like や: a yak, "ya".', ユ: 'A U-turn on its side: "yu".', ヨ: 'A yo-yo trick: "yo".', ワ: 'A wine glass: "wa".', ヲ: 'Said "o", almost never used.', ン: 'Like ソ, but the last stroke goes up: "n".',
  ラ: 'A rabbit\'s ears on top: "ra".', リ: 'Like り: reeds, "ri".', ル: 'Two legs running: "ru".', レ: 'A letter L, bent: "re".', ロ: 'A square road: "ro".',
};

function buildUnit(script: Script): Unit {
  const name = script === 'h' ? 'Hiragana' : 'Katakana';
  return {
    id: script === 'h' ? 'hira' : 'kata',
    script,
    title: name,
    jp: script === 'h' ? 'ひらがな' : 'カタカナ',
    boss: script === 'h' ? { name: 'The Kana Oni', jp: '鬼' } : { name: 'The Katakana Tengu', jp: '天' },
    lessons: LESSON_META.filter((m) => !m[4] || m[4] === script).map(([key, title, blurb, trace]) => ({
      id: `${script}-${key}`,
      unit: script === 'h' ? 'hira' : 'kata',
      title,
      blurb: script === 'k' ? blurb.replace(/[ぁ-ゖ]/g, (c) => toKata(c)) : blurb,
      kana: SPECIAL[`${script}-${key}`]
        ? SPECIAL[`${script}-${key}`].map(([char, romaji, alts, en, note]) => ({ id: `${script}:${char}`, char, romaji, alts, script, sound: char, en: en || undefined, note }))
        : make(script, H_ROWS[key]),
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
/** Row names for the chart, and the combo chart (3 columns: ya, yu, yo). */
export const CHART_LABELS = ['a', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'n', 'g', 'z', 'd', 'b', 'p'];
export const COMBO_ROWS: string[][] = [...H_ROWS.combo1, ...H_ROWS.combo1b, ...H_ROWS.combo2, ...H_ROWS.combo2b].map((r) => r[0])
  .reduce<string[][]>((rows, c, i) => { if (i % 3 === 0) rows.push([]); rows[rows.length - 1].push(c); return rows; }, []);

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
