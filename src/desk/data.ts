// Study Desk, Lesson 1 (Genki I, Lesson 1 shape: "Meeting new people").
// All dialogues, examples and exercises are original, written in Genki's style. Nothing is copied from the books.

export interface Line { who: 'Haruto' | 'Alex'; jp: string; rj: string; en: string }
export interface DWord { jp: string; rj: string; en: string; say?: string }
export interface Example { jp: string; rj: string; en: string }
export interface Note { pattern: string; plain: string[]; examples: Example[]; watch: string[] }
/** A drill: say (or pick) the Japanese for the cue. `key` is what speech recognition must hear. */
export interface Drill { cue: string; person?: { name: string; info: string }; jp: string; rj: string; key: string[]; wrong: string[] }
export interface Listen { audio: string; q: string; options: string[]; a: number; transcript: string; en: string }
export interface Fill { before: string; after: string; a: string; choices: string[]; en: string }
export interface RoleTurn { them: string; cue: string; jp: string; rj: string; key: string[]; wrong: string[] }

export type PartId = 'A' | 'B' | 'C' | 'D';
export type Section =
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'dialogue' }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'words'; words: DWord[]; tip?: string[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'grammar'; note: Note; drills: Drill[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'culture'; text: string[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'shadow' }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'role'; turns: RoleTurn[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'listen'; items: Listen[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'kana'; kana: string[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'reading'; text: string; rj: string; en: string; qs: { q: string; options: string[]; a: number }[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'fill'; items: Fill[] }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'write' }
  | { id: string; part: PartId; title: string; min: number; learned: string[]; kind: 'cando' };

export const LESSON = {
  n: 1, jp: 'はじめまして', title: 'Meeting new people',
  goals: ['Say your name, school, year and major', 'Ask where someone is from', 'Ask and tell the time', 'Say a phone number and your age'],
  cando: ['Introduce myself in three sentences', 'Ask someone where they are from', 'Ask and tell the time', 'Say a phone number', 'Say my age', 'Read あ to の without help'],
};

export const PARTS: { id: PartId; title: string; seal: string; about: string }[] = [
  { id: 'A', title: 'Conversation & Grammar', seal: '会話', about: 'The dialogue, the words and the grammar of the lesson.' },
  { id: 'B', title: 'Speak & Listen', seal: '話す', about: 'Say it out loud, act it out, and understand it by ear.' },
  { id: 'C', title: 'Read & Write', seal: '読書', about: 'Hiragana stroke by stroke, then a short reading.' },
  { id: 'D', title: 'Workbook & Check', seal: '練習', about: 'Workbook pages, your own writing, and a self-check.' },
];

export const DIALOGUE: Line[] = [
  { who: 'Haruto', jp: 'はじめまして。はるとです。', rj: 'Hajimemashite. Haruto desu.', en: 'Nice to meet you. I am Haruto.' },
  { who: 'Alex', jp: 'はじめまして。アレックスです。', rj: 'Hajimemashite. Arekkusu desu.', en: 'Nice to meet you. I am Alex.' },
  { who: 'Haruto', jp: 'アレックスさんは りゅうがくせいですか。', rj: 'Arekkusu-san wa ryuugakusei desu ka.', en: 'Alex, are you an international student?' },
  { who: 'Alex', jp: 'はい。カナダじんです。さくらだいがくの にねんせいです。', rj: 'Hai. Kanada-jin desu. Sakura daigaku no ninensei desu.', en: 'Yes. I am Canadian. I am a second-year student at Sakura University.' },
  { who: 'Haruto', jp: 'そうですか。せんこうは なんですか。', rj: 'Sou desu ka. Senkou wa nan desu ka.', en: 'I see. What is your major?' },
  { who: 'Alex', jp: 'れきしです。はるとさんは？', rj: 'Rekishi desu. Haruto-san wa?', en: 'History. And you, Haruto?' },
  { who: 'Haruto', jp: 'わたしは けいざいです。よろしく。', rj: 'Watashi wa keizai desu. Yoroshiku.', en: 'Mine is economics. Nice to meet you.' },
  { who: 'Alex', jp: 'よろしく。あのう、いま なんじですか。', rj: 'Yoroshiku. Anou, ima nanji desu ka.', en: 'Nice to meet you too. Um, what time is it now?' },
  { who: 'Haruto', jp: 'しちじはんです。', rj: 'Shichiji han desu.', en: 'It is half past seven.' },
];
export const voiceOfWho = (w: Line['who']) => (w === 'Haruto' ? 'm' : 'f') as 'm' | 'f';

const W = (jp: string, rj: string, en: string, say?: string): DWord => ({ jp, rj, en, say });

export const SECTIONS: Section[] = [
  { id: 'a-dlg', part: 'A', kind: 'dialogue', title: 'Dialogue: At the welcome party', min: 6, learned: ['はじめまして · nice to meet you', '〜です · I am / it is', 'よろしく · nice to meet you (please be kind to me)'] },
  { id: 'a-w1', part: 'A', kind: 'words', title: 'Words: School and people', min: 6, learned: ['9 school words', '〜ねんせい for your year'],
    words: [W('だいがく', 'daigaku', 'university'), W('こうこう', 'koukou', 'high school'), W('がくせい', 'gakusei', 'student'), W('だいがくせい', 'daigakusei', 'college student'),
      W('りゅうがくせい', 'ryuugakusei', 'international student'), W('せんせい', 'sensei', 'teacher'), W('せんこう', 'senkou', 'major (field of study)'),
      W('〜ねんせい', '~nensei', '...year student (いちねんせい = 1st year)', 'いちねんせい'), W('わたし', 'watashi', 'I, me')],
    tip: ['Say each word out loud after the voice.', 'に + ねんせい = にねんせい, a second-year student.'] },
  { id: 'a-w2', part: 'A', kind: 'words', title: 'Words: Countries and majors', min: 6, learned: ['7 countries', '〜じん = a person from…', '〜ご = …language', '5 majors'],
    words: [W('にほん', 'nihon', 'Japan'), W('アメリカ', 'amerika', 'USA'), W('イギリス', 'igirisu', 'Britain'), W('カナダ', 'kanada', 'Canada'), W('ちゅうごく', 'chuugoku', 'China'),
      W('かんこく', 'kankoku', 'Korea'), W('オーストラリア', 'oosutoraria', 'Australia'), W('〜じん', '~jin', 'a person from … (にほんじん = Japanese person)', 'にほんじん'),
      W('〜ご', '~go', '… language (にほんご = Japanese)', 'にほんご'), W('れきし', 'rekishi', 'history'), W('けいざい', 'keizai', 'economics'), W('えいご', 'eigo', 'English (language)'),
      W('ビジネス', 'bijinesu', 'business'), W('コンピューター', 'konpyuutaa', 'computer')],
    tip: ['Add じん to a country for a person: カナダじん, a Canadian.', 'Add ご for a language: かんこくご, Korean.'] },
  { id: 'a-w3', part: 'A', kind: 'words', title: 'Words: Numbers and time', min: 7, learned: ['Numbers 0 to 10', '〜じ o’clock, はん half past', 'いま なんじですか · what time is it?'],
    words: [W('ゼロ', 'zero', '0'), W('いち', 'ichi', '1'), W('に', 'ni', '2'), W('さん', 'san', '3'), W('よん', 'yon', '4 (also し)'), W('ご', 'go', '5'), W('ろく', 'roku', '6'),
      W('なな', 'nana', '7 (also しち)'), W('はち', 'hachi', '8'), W('きゅう', 'kyuu', '9 (also く)'), W('じゅう', 'juu', '10'),
      W('いま', 'ima', 'now'), W('〜じ', '~ji', '… o’clock (いちじ = 1:00)', 'いちじ'), W('はん', 'han', 'half past'), W('なんじ', 'nanji', 'what time'), W('ごぜん', 'gozen', 'a.m.'), W('ごご', 'gogo', 'p.m.')],
    tip: ['Three times have their own readings: よじ (4:00), しちじ (7:00), くじ (9:00).', '7:30 is しちじはん. 3 p.m. is ごご さんじ.'] },
  { id: 'a-w4', part: 'A', kind: 'words', title: 'Words: Phone numbers and age', min: 6, learned: ['でんわばんごう · phone number', '〜さい · … years old', 'はい / いいえ, そうですか, あのう'],
    words: [W('でんわ', 'denwa', 'telephone'), W('ばんごう', 'bangou', 'number'), W('でんわばんごう', 'denwa bangou', 'phone number'), W('なんばん', 'nanban', 'what number'),
      W('〜さい', '~sai', '… years old (じゅうきゅうさい = 19)', 'じゅうきゅうさい'), W('なんさい', 'nansai', 'how old'), W('はい', 'hai', 'yes'), W('いいえ', 'iie', 'no'),
      W('そうですか', 'sou desu ka', 'I see. / Is that so?'), W('あのう', 'anou', 'um… (to get attention politely)'), W('よろしく', 'yoroshiku', 'nice to meet you')],
    tip: ['Phone numbers are said digit by digit. The dash is の: ゼロきゅうゼロの…', '20 years old has a special word: はたち.'] },
  { id: 'a-g1', part: 'A', kind: 'grammar', title: 'Grammar 1: X は Y です', min: 6, learned: ['X は Y です · X is Y'],
    note: { pattern: 'X は Y です。', plain: ['This is the simplest sentence in Japanese: "X is Y."', 'は works like a spotlight: "As for X…". です at the end makes it polite.'],
      examples: [{ jp: 'わたしは がくせいです。', rj: 'Watashi wa gakusei desu.', en: 'I am a student.' }, { jp: 'はるとさんは にほんじんです。', rj: 'Haruto-san wa nihonjin desu.', en: 'Haruto is Japanese.' }, { jp: 'せんこうは れきしです。', rj: 'Senkou wa rekishi desu.', en: 'My major is history.' }],
      watch: ['The particle は is said "wa", not "ha", when it marks the topic.', 'Never put さん after your own name.', 'When it is clear who you mean, leave X out: れきしです. (My major) is history.'] },
    drills: [
      { cue: 'Say Mei is Chinese.', person: { name: 'メイ', info: 'from China · economics' }, jp: 'メイさんは ちゅうごくじんです。', rj: 'Mei-san wa chuugokujin desu.', key: ['ちゅうごくじん'], wrong: ['メイさんは かんこくじんです。', 'メイさんの ちゅうごくじんです。'] },
      { cue: 'Say Lisa is American.', person: { name: 'リサ', info: 'from the USA · business' }, jp: 'リサさんは アメリカじんです。', rj: 'Risa-san wa amerikajin desu.', key: ['アメリカじん'], wrong: ['リサさんは イギリスじんです。', 'リサは アメリカごです。'] },
      { cue: 'Say Ken is a high school student.', person: { name: 'けん', info: 'high school · 17' }, jp: 'けんさんは こうこうせいです。', rj: 'Ken-san wa koukousei desu.', key: ['こうこうせい'], wrong: ['けんさんは だいがくせいです。', 'けんさんは せんせいです。'] },
      { cue: 'Say you are a student.', jp: 'わたしは がくせいです。', rj: 'Watashi wa gakusei desu.', key: ['がくせい'], wrong: ['わたしさんは がくせいです。', 'わたしは せんせいです。'] },
    ] },
  { id: 'a-g2', part: 'A', kind: 'grammar', title: 'Grammar 2: Questions with か', min: 6, learned: ['〜ですか · questions', 'なん · what'],
    note: { pattern: 'X は Y ですか。', plain: ['To ask a question, add か to the end. That is all.', 'Your voice goes up a little on か. Use なん for "what".'],
      examples: [{ jp: 'がくせいですか。', rj: 'Gakusei desu ka.', en: 'Are you a student?' }, { jp: 'はい、がくせいです。', rj: 'Hai, gakusei desu.', en: 'Yes, I am a student.' }, { jp: 'せんこうは なんですか。', rj: 'Senkou wa nan desu ka.', en: 'What is your major?' }, { jp: 'いま なんじですか。', rj: 'Ima nanji desu ka.', en: 'What time is it now?' }],
      watch: ['No question mark is needed in Japanese: the か does that job.', 'Answer with はい (yes) or いいえ (no) and repeat the noun.'] },
    drills: [
      { cue: 'Ask if she is an international student.', jp: 'りゅうがくせいですか。', rj: 'Ryuugakusei desu ka.', key: ['りゅうがくせいですか'], wrong: ['りゅうがくせいです。', 'りゅうがくせいは なんですか。'] },
      { cue: 'Ask what his major is.', jp: 'せんこうは なんですか。', rj: 'Senkou wa nan desu ka.', key: ['せんこう', 'なん'], wrong: ['せんこうですか。', 'なんは せんこうですか。'] },
      { cue: 'Ask what time it is now.', jp: 'いま なんじですか。', rj: 'Ima nanji desu ka.', key: ['なんじ'], wrong: ['いま なんさいですか。', 'いま なんばんですか。'] },
      { cue: 'Ask how old she is.', jp: 'なんさいですか。', rj: 'Nansai desu ka.', key: ['なんさい'], wrong: ['なんじですか。', 'なんですか。'] },
    ] },
  { id: 'a-g3', part: 'A', kind: 'grammar', title: 'Grammar 3: Noun の noun', min: 6, learned: ['A の B · B of A, A’s B'],
    note: { pattern: 'A の B', plain: ['の links two nouns. The second one is the main thing, the first one tells you more about it.', 'It covers "my", "of" and "at": わたしの でんわばんごう = my phone number.'],
      examples: [{ jp: 'さくらだいがくの がくせいです。', rj: 'Sakura daigaku no gakusei desu.', en: 'I am a student at Sakura University.' }, { jp: 'にほんごの せんせい', rj: 'nihongo no sensei', en: 'a Japanese language teacher' }, { jp: 'メイさんの せんこう', rj: 'Mei-san no senkou', en: 'Mei’s major' }],
      watch: ['The order is the opposite of English "of": にほんごの せんせい is "teacher OF Japanese".'] },
    drills: [
      { cue: 'Say you are a student at Sakura University.', jp: 'さくらだいがくの がくせいです。', rj: 'Sakura daigaku no gakusei desu.', key: ['さくらだいがくのがくせい'], wrong: ['がくせいの さくらだいがくです。', 'さくらだいがくは がくせいです。'] },
      { cue: 'Say "my phone number".', jp: 'わたしの でんわばんごう', rj: 'watashi no denwa bangou', key: ['わたしのでんわばんごう'], wrong: ['でんわばんごうの わたし', 'わたしは でんわばんごう'] },
      { cue: 'Say "a Japanese language teacher".', jp: 'にほんごの せんせい', rj: 'nihongo no sensei', key: ['にほんごのせんせい'], wrong: ['せんせいの にほんご', 'にほんじんの せんせい'] },
      { cue: 'Ask what Mei’s major is.', jp: 'メイさんの せんこうは なんですか。', rj: 'Mei-san no senkou wa nan desu ka.', key: ['のせんこう'], wrong: ['メイさんは せんこうですか。', 'せんこうの メイさんは なんですか。'] },
    ] },
  { id: 'a-cul', part: 'A', kind: 'culture', title: 'Culture: Names and bowing', min: 3, learned: ['Family name first', 'さん is for other people', 'A small bow with はじめまして'],
    text: ['In Japan the family name comes first: さとう あおい is Aoi from the Satou family. Friends from school often use the family name plus さん.',
      'さん goes after other people’s names, never your own. Teachers are called せんせい, even without their name.',
      'When you meet someone, a small bow from the waist goes with はじめまして. You do not need to get it perfect: a friendly nod is fine for a visitor.'] },
  { id: 'b-sh', part: 'B', kind: 'shadow', title: 'Shadowing: Repeat after the voice', min: 6, learned: ['You said the whole dialogue out loud'] },
  { id: 'b-role', part: 'B', kind: 'role', title: 'Role play: You are Alex', min: 5, learned: ['You held a real first conversation'],
    turns: [
      { them: 'はじめまして。はるとです。', cue: 'Greet him and say your name is Alex.', jp: 'はじめまして。アレックスです。', rj: 'Hajimemashite. Arekkusu desu.', key: ['アレックス'], wrong: ['はるとです。', 'アレックスさんです。'] },
      { them: 'アレックスさんは りゅうがくせいですか。', cue: 'Say yes, and that you are Canadian.', jp: 'はい。カナダじんです。', rj: 'Hai. Kanadajin desu.', key: ['カナダじん'], wrong: ['いいえ。カナダです。', 'はい。カナダごです。'] },
      { them: 'せんこうは なんですか。', cue: 'Say your major is history.', jp: 'れきしです。', rj: 'Rekishi desu.', key: ['れきし'], wrong: ['けいざいです。', 'れきしですか。'] },
      { them: 'いま なんじですか。', cue: 'Look at the clock: 7:30. Tell him the time.', jp: 'しちじはんです。', rj: 'Shichiji han desu.', key: ['しちじはん', '7時半', '七時半'], wrong: ['しちじです。', 'はちじはんです。'] },
    ] },
  { id: 'b-lis', part: 'B', kind: 'listen', title: 'Listening: Who, where and when', min: 5, learned: ['You picked out numbers, times and countries by ear'],
    items: [
      { audio: 'すみません、いま なんじですか。ごご さんじはんです。', q: 'What time is it?', options: ['3:30 p.m.', '3:00 p.m.', '4:30 p.m.'], a: 0, transcript: 'すみません、いま なんじですか。 ごご さんじはんです。', en: 'Excuse me, what time is it? It is 3:30 p.m.' },
      { audio: 'けんさんは なんさいですか。じゅうななさいです。', q: 'How old is Ken?', options: ['7', '17', '19'], a: 1, transcript: 'けんさんは なんさいですか。 じゅうななさいです。', en: 'How old is Ken? He is 17.' },
      { audio: 'リサさんは イギリスじんですか。いいえ、アメリカじんです。', q: 'Where is Lisa from?', options: ['Britain', 'Canada', 'USA'], a: 2, transcript: 'リサさんは イギリスじんですか。 いいえ、アメリカじんです。', en: 'Is Lisa British? No, she is American.' },
      { audio: 'メイさんの せんこうは なんですか。けいざいです。', q: 'What is Mei’s major?', options: ['History', 'Economics', 'Business'], a: 1, transcript: 'メイさんの せんこうは なんですか。 けいざいです。', en: 'What is Mei’s major? Economics.' },
    ] },
  { id: 'c-k1', part: 'C', kind: 'kana', title: 'Hiragana: あ い う え お', min: 6, learned: ['あ い う え お'], kana: ['あ', 'い', 'う', 'え', 'お'] },
  { id: 'c-k2', part: 'C', kind: 'kana', title: 'Hiragana: か き く け こ', min: 6, learned: ['か き く け こ'], kana: ['か', 'き', 'く', 'け', 'こ'] },
  { id: 'c-k3', part: 'C', kind: 'kana', title: 'Hiragana: さ し す せ そ', min: 6, learned: ['さ し す せ そ'], kana: ['さ', 'し', 'す', 'せ', 'そ'] },
  { id: 'c-k4', part: 'C', kind: 'kana', title: 'Hiragana: た ち つ て と', min: 6, learned: ['た ち つ て と'], kana: ['た', 'ち', 'つ', 'て', 'と'] },
  { id: 'c-k5', part: 'C', kind: 'kana', title: 'Hiragana: な に ぬ ね の', min: 6, learned: ['な に ぬ ね の'], kana: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { id: 'c-read', part: 'C', kind: 'reading', title: 'Reading: Aoi introduces herself', min: 5, learned: ['You read a whole introduction in hiragana'],
    text: 'はじめまして。わたしは さとう あおい です。さくらだいがくの にねんせい です。せんこうは にほんご です。にじゅういっさい です。どうぞ よろしく。',
    rj: 'Hajimemashite. Watashi wa Satou Aoi desu. Sakura daigaku no ninensei desu. Senkou wa nihongo desu. Nijuuissai desu. Douzo yoroshiku.',
    en: 'Nice to meet you. I am Aoi Satou. I am a second-year student at Sakura University. My major is Japanese. I am 21. Nice to meet you.',
    qs: [{ q: 'What year is Aoi in?', options: ['1st year', '2nd year', '3rd year'], a: 1 }, { q: 'What does she study?', options: ['History', 'Economics', 'Japanese'], a: 2 }, { q: 'How old is she?', options: ['20', '21', '12'], a: 1 }] },
  { id: 'd-fill', part: 'D', kind: 'fill', title: 'Workbook: は, か or の', min: 4, learned: ['You chose the right particle every time'],
    items: [
      { before: 'わたし', after: ' だいがくせいです。', a: 'は', choices: ['は', 'か', 'の'], en: 'I am a college student.' },
      { before: 'はるとさんは にほんじんです', after: '。', a: 'か', choices: ['は', 'か', 'の'], en: 'Is Haruto Japanese?' },
      { before: 'さくらだいがく', after: ' がくせいです。', a: 'の', choices: ['は', 'か', 'の'], en: 'I am a student at Sakura University.' },
      { before: 'メイさん', after: ' せんこうは けいざいです。', a: 'の', choices: ['は', 'か', 'の'], en: 'Mei’s major is economics.' },
      { before: 'せんこう', after: ' なんですか。', a: 'は', choices: ['は', 'か', 'の'], en: 'What is your major?' },
      { before: 'いま なんじです', after: '。', a: 'か', choices: ['は', 'か', 'の'], en: 'What time is it now?' },
    ] },
  { id: 'd-lis', part: 'D', kind: 'listen', title: 'Workbook: Phone numbers and times', min: 4, learned: ['You wrote down phone numbers and times by ear'],
    items: [
      { audio: 'もしもし、メイです。でんわばんごうは ゼロきゅうゼロの よんにいはちいちの ろくななさんごです。', q: 'What is Mei’s phone number?', options: ['090-4281-6375', '090-4281-6735', '080-4218-6735'], a: 0, transcript: 'でんわばんごうは ゼロきゅうゼロの よんにいはちいちの ろくななさんごです。', en: 'My phone number is 090-4281-6375.' },
      { audio: 'いま ごぜん くじです。', q: 'What time is it?', options: ['9:00 a.m.', '9:00 p.m.', '7:00 a.m.'], a: 0, transcript: 'いま ごぜん くじです。', en: 'It is 9:00 a.m. now.' },
      { audio: 'いま ごご よじはんです。', q: 'What time is it?', options: ['4:00 p.m.', '4:30 p.m.', '8:30 p.m.'], a: 1, transcript: 'いま ごご よじはんです。', en: 'It is 4:30 p.m. now.' },
      { audio: 'けんさんの でんわばんごうは ゼロはちゼロの いちにいさんよんの ごろくななはちです。', q: 'What is Ken’s phone number?', options: ['080-1234-5678', '090-1234-5678', '080-1243-5687'], a: 0, transcript: 'でんわばんごうは ゼロはちゼロの いちにいさんよんの ごろくななはちです。', en: 'Ken’s phone number is 080-1234-5678.' },
    ] },
  { id: 'd-write', part: 'D', kind: 'write', title: 'Write and record your introduction', min: 8, learned: ['Your own introduction, written and spoken'] },
  { id: 'd-check', part: 'D', kind: 'cando', title: 'Can I do this? Self-check', min: 3, learned: ['An honest look at what you can do now'] },
];

export const sectionsOf = (p: PartId) => SECTIONS.filter((s) => s.part === p);
export const allWords = () => SECTIONS.flatMap((s) => (s.kind === 'words' ? s.words : []));
