// Unit 1 content: meeting people (follows the topics of Genki I, Lesson 1). All text is original to Michi.
import type { Word, Story, Grammar, Mission, Culture } from './course';

export const WORDS_U1: Word[] = [
  // First reading words: built only from kana taught just before (vowels + K, then S, then T)
  { id: 'ai', kana: 'あい', romaji: 'ai', en: 'love', art: 'love' },
  { id: 'ie', kana: 'いえ', romaji: 'ie', en: 'house', art: 'house' },
  { id: 'kao', kana: 'かお', romaji: 'kao', en: 'face', art: 'face' },
  { id: 'ao', kana: 'あお', romaji: 'ao', en: 'blue', art: 'blue' },
  { id: 'ike', kana: 'いけ', romaji: 'ike', en: 'pond', art: 'pond' },
  { id: 'kasa', kana: 'かさ', romaji: 'kasa', en: 'umbrella', art: 'umbrella' },
  { id: 'sushi', kana: 'すし', romaji: 'sushi', en: 'sushi', art: 'sushi' },
  { id: 'isu', kana: 'いす', romaji: 'isu', en: 'chair', art: 'chair' },
  { id: 'shio', kana: 'しお', romaji: 'shio', alts: ['sio'], en: 'salt', art: 'salt' },
  { id: 'suika', kana: 'すいか', romaji: 'suika', en: 'watermelon', art: 'watermelon' },
  { id: 'kuchi', kana: 'くち', romaji: 'kuchi', alts: ['kuti'], en: 'mouth', art: 'mouth' },
  { id: 'te', kana: 'て', romaji: 'te', en: 'hand', art: 'hand' },
  { id: 'tako', kana: 'たこ', romaji: 'tako', en: 'octopus', art: 'octopus' },
  { id: 'kutsu', kana: 'くつ', romaji: 'kutsu', alts: ['kutu'], en: 'shoes', art: 'shoes' },
  { id: 'tsukue', kana: 'つくえ', romaji: 'tsukue', alts: ['tukue'], en: 'desk', art: 'desk' },
  // Greetings
  { id: 'ohayou', kana: 'おはよう', romaji: 'ohayou', alts: ['ohayo', 'ohayoo'], en: 'good morning', art: 'sunrise', note: 'Casual. Add ございます to be polite: おはようございます.', ex: { jp: 'おはようございます、せんせい。', en: "Good morning, teacher." } },
  { id: 'konnichiwa', kana: 'こんにちは', romaji: 'konnichiwa', alts: ['konichiwa', 'konnichiha'], en: 'hello', art: 'sun', note: 'The last は is read "wa".', ex: { jp: 'こんにちは、レオさん！', en: "Hello, Leo!" } },
  { id: 'konbanwa', kana: 'こんばんは', romaji: 'konbanwa', alts: ['kombanwa', 'konbanha'], en: 'good evening', art: 'moon', ex: { jp: 'こんばんは、メイさん。', en: "Good evening, Mei." } },
  { id: 'sayounara', kana: 'さようなら', romaji: 'sayounara', alts: ['sayonara', 'sayoonara'], en: 'goodbye', art: 'wave', note: 'Sounds a bit final. Friends often say じゃあね instead.', ex: { jp: 'さようなら、せんせい。', en: "Goodbye, teacher." } },
  { id: 'arigatou', kana: 'ありがとう', romaji: 'arigatou', alts: ['arigato', 'arigatoo'], en: 'thank you', art: 'gift', ex: { jp: 'ありがとう、ゆきさん。', en: "Thanks, Yuki." } },
  { id: 'sumimasen', kana: 'すみません', romaji: 'sumimasen', en: 'excuse me, sorry', art: 'sorry', ex: { jp: 'すみません、せんせい。', en: "Excuse me, teacher." } },
  { id: 'hajimemashite', kana: 'はじめまして', romaji: 'hajimemashite', en: 'nice to meet you', art: 'meet', note: 'Only said the very first time you meet someone.', ex: { jp: 'はじめまして。ゆきです。', en: "Nice to meet you. I'm Yuki." } },
  // People and school
  { id: 'watashi', kana: 'わたし', kanji: '私', romaji: 'watashi', en: 'I, me', art: 'me', ex: { jp: 'わたしは ベンです。', en: "I am Ben." } },
  { id: 'gakusei', kana: 'がくせい', kanji: '学生', romaji: 'gakusei', en: 'student', art: 'student', ex: { jp: 'わたしは がくせいです。', en: "I am a student." } },
  { id: 'sensei', kana: 'せんせい', kanji: '先生', romaji: 'sensei', en: 'teacher', art: 'teacher', note: 'Never used for yourself.', ex: { jp: 'やまだせんせいです。', en: "This is Professor Yamada." } },
  { id: 'daigaku', kana: 'だいがく', kanji: '大学', romaji: 'daigaku', en: 'university', art: 'university', ex: { jp: 'みちだいがくの がくせいです。', en: "I'm a Michi University student." } },
  { id: 'tomodachi', kana: 'ともだち', kanji: '友達', romaji: 'tomodachi', en: 'friend', art: 'friends', ex: { jp: 'メイさんは ともだちです。', en: "Mei is a friend." } },
  { id: 'isha', kana: 'いしゃ', kanji: '医者', romaji: 'isha', en: 'doctor', art: 'doctor', ex: { jp: 'メイさんは いしゃですか。', en: "Is Mei a doctor?" } },
  { id: 'kaishain', kana: 'かいしゃいん', kanji: '会社員', romaji: 'kaishain', en: 'office worker', art: 'office', ex: { jp: 'ちちは かいしゃいんです。', en: "My dad is an office worker." } },
  { id: 'senkou', kana: 'せんこう', kanji: '専攻', romaji: 'senkou', alts: ['senko', 'senkoo'], en: 'major (what you study)', art: 'major', ex: { jp: 'せんこうは けいざいです。', en: "My major is economics." } },
  // Countries and numbers
  { id: 'nihon', kana: 'にほん', kanji: '日本', romaji: 'nihon', en: 'Japan', art: 'japan', ex: { jp: 'ゆきさんは にほんじんです。', en: "Yuki is Japanese." } },
  { id: 'amerika', kana: 'アメリカ', romaji: 'amerika', en: 'America', art: 'usa', note: 'Country names from other languages are written in katakana.', ex: { jp: 'レオさんは アメリカじんです。', en: "Leo is American." } },
  { id: 'igirisu', kana: 'イギリス', romaji: 'igirisu', en: 'Britain', art: 'uk', ex: { jp: 'イギリスの だいがくです。', en: "It's a British university." } },
  { id: 'chuugoku', kana: 'ちゅうごく', kanji: '中国', romaji: 'chuugoku', alts: ['chugoku', 'chuugoku'], en: 'China', art: 'china', ex: { jp: 'メイさんは ちゅうごくじんです。', en: "Mei is Chinese." } },
  { id: 'jin', kana: '〜じん', kanji: '〜人', romaji: 'jin', en: '…person (nationality)', art: 'jin', note: 'Country + じん: にほんじん is a Japanese person.', ex: { jp: 'にほんじんですか。', en: "Are you Japanese?" } },
  { id: 'sai', kana: '〜さい', kanji: '〜歳', romaji: 'sai', en: '… years old', art: 'cake', note: 'じゅうきゅうさい = 19 years old.', ex: { jp: 'じゅうきゅうさいです。', en: "I'm 19 years old." } },
  { id: 'denwa', kana: 'でんわ', kanji: '電話', romaji: 'denwa', en: 'telephone', art: 'phone', ex: { jp: 'でんわばんごうは なんですか。', en: "What's your phone number?" } },
  { id: 'bangou', kana: 'ばんごう', kanji: '番号', romaji: 'bangou', alts: ['bango', 'bangoo'], en: 'number', art: 'number', ex: { jp: 'ばんごうは ごです。', en: "The number is five." } },
];

// Extra words that only appear in stories or missions (tap to see the meaning).
export const GLOSS: Record<string, string> = {
  'です': 'is, am, are (polite)', 'は': 'topic marker, said "wa"', 'か': 'makes a question', 'の': "links nouns: A's B", 'はい': 'yes', 'いいえ': 'no',
  'レオ': 'Leo', 'ゆき': 'Yuki', 'メイ': 'Mei', 'さん': 'Mr./Ms. (never for yourself)', 'みちだいがく': 'Michi University', 'りょう': 'dormitory',
  'アメリカじん': 'an American', 'ちゅうごくじん': 'a Chinese person', 'にほんじん': 'a Japanese person', 'なん': 'what', 'わたしも': 'me too',
  'よろしく': 'nice to meet you (please be kind to me)', 'どうぞ': 'please', 'けいざい': 'economics', 'ようこそ': 'welcome',
};

export const STORIES_U1: Story[] = [
  {
    id: 'u1-story1', title: 'At the dorm',
    panels: [
      { art: 's1p1', lines: [{ who: 'Leo', tokens: [['はじめまして', 'hajimemashite'], '。'], en: 'Nice to meet you.' }] },
      { art: 's1p2', lines: [{ who: 'Yuki', tokens: [['はじめまして', 'hajimemashite'], '。', ['ゆき', 'ゆき'], 'です。'], en: "Nice to meet you. I'm Yuki." }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['レオ', 'レオ'], 'です。', ['アメリカじん', 'アメリカじん'], 'です。'], en: "I'm Leo. I'm American." }] },
      { art: 's1p4', lines: [{ who: 'Yuki', tokens: [['レオ', 'レオ'], ['さん', 'さん'], ['は', 'は'], ' ', ['がくせい', 'gakusei'], 'です', ['か', 'か'], '。'], en: 'Are you a student, Leo?' }] },
    ],
    quiz: [
      { q: 'Where is Leo from?', options: ['America', 'Japan', 'China'], a: 0 },
      { q: 'What does Yuki ask Leo?', options: ['If he is a student', 'His age', 'His phone number'], a: 0 },
    ],
  },
  {
    id: 'u1-story2', title: 'The welcome party',
    panels: [
      { art: 's2p1', lines: [{ who: 'Mei', tokens: [['こんにちは', 'konnichiwa'], '。', ['メイ', 'メイ'], 'です。'], en: "Hello. I'm Mei." }] },
      { art: 's2p2', lines: [{ who: 'Leo', tokens: [['メイ', 'メイ'], ['さん', 'さん'], ['は', 'は'], ' ', ['ちゅうごくじん', 'ちゅうごくじん'], 'です', ['か', 'か'], '。'], en: 'Mei, are you Chinese?' }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['はい', 'はい'], '。', ['だいがく', 'daigaku'], ['の', 'の'], ['がくせい', 'gakusei'], 'です。'], en: "Yes. I'm a university student." }] },
      { art: 's2p4', lines: [{ who: 'Yuki', tokens: [['メイ', 'メイ'], ['さん', 'さん'], ['は', 'は'], ' ', ['わたし', 'watashi'], ['の', 'の'], ['ともだち', 'tomodachi'], 'です。'], en: 'Mei is my friend.' }] },
    ],
    quiz: [
      { q: 'Where is Mei from?', options: ['China', 'America', 'Britain'], a: 0 },
      { q: 'What is Mei?', options: ['A student', 'A teacher', 'A doctor'], a: 0 },
      { q: 'Who is Mei to Yuki?', options: ['Her friend', 'Her teacher', 'Her doctor'], a: 0 },
    ],
  },
];

export const GRAMMAR_U1: Grammar[] = [
  {
    id: 'u1-g-wa', title: 'X は Y です', pattern: ['X', 'は', 'Y', 'です'], meaning: 'X is Y',
    points: ['は marks the topic: what you are talking about. It is said "wa".', 'です at the end makes it polite.', 'There is no word for "a" or "the".'],
    examples: [{ jp: 'わたしは がくせいです。', en: 'I am a student.' }, { jp: 'ゆきさんは にほんじんです。', en: 'Yuki is Japanese.' }],
    drills: [
      { t: 'tiles', en: 'I am a student.', answer: ['わたし', 'は', 'がくせい', 'です'], extra: ['の', 'か'] },
      { t: 'choose', prompt: 'わたし ＿ ベンです。', en: 'I am Ben.', options: ['は', 'の', 'か'], a: 0 },
      { t: 'tiles', en: 'Leo is American.', answer: ['レオさん', 'は', 'アメリカじん', 'です'], extra: ['せんせい', 'の'] },
      { t: 'fix', en: 'I am a student.', tokens: ['わたし', 'を', 'がくせい', 'です'], wrong: 1, fix: 'は' },
      { t: 'choose', prompt: 'Which one means "The teacher is Japanese"?', options: ['せんせいは にほんじんです。', 'にほんじんは せんせいです。', 'せんせいの にほんじんです。'], a: 0 },
      { t: 'tiles', en: 'Mei is Chinese.', answer: ['メイさん', 'は', 'ちゅうごくじん', 'です'], extra: ['いしゃ', 'か'] },
    ],
  },
  {
    id: 'u1-g-ka', title: 'Questions with か', pattern: ['…', 'です', 'か'], meaning: 'Is it …?',
    points: ['Put か at the end and the sentence becomes a question.', 'No need to change the word order.', 'なん means "what": なんですか = what is it?'],
    examples: [{ jp: 'レオさんは がくせいですか。', en: 'Is Leo a student?' }, { jp: 'はい、がくせいです。', en: 'Yes, he is a student.' }],
    drills: [
      { t: 'tiles', en: 'Is Leo a student?', answer: ['レオさん', 'は', 'がくせい', 'です', 'か'], extra: ['の', 'を'] },
      { t: 'choose', prompt: 'ゆきさんは にほんじんです＿。', en: 'Is Yuki Japanese?', options: ['か', 'は', 'の'], a: 0 },
      { t: 'choose', prompt: 'レオさんは がくせいですか。', en: 'Leo is a student. Pick the right answer.', options: ['はい、がくせいです。', 'いいえ、がくせいです。', 'はい、がくせいですか。'], a: 0 },
      { t: 'tiles', en: 'What is your major?', answer: ['せんこう', 'は', 'なん', 'です', 'か'], extra: ['の'] },
      { t: 'fix', en: 'Is Leo a student?', tokens: ['レオさん', 'の', 'がくせい', 'ですか'], wrong: 1, fix: 'は' },
      { t: 'choose', prompt: 'メイさんは いしゃですか。', en: 'Mei is a teacher. Pick the right answer.', options: ['いいえ、せんせいです。', 'はい、せんせいです。', 'いいえ、いしゃです。'], a: 0 },
    ],
  },
  {
    id: 'u1-g-no', title: 'A の B', pattern: ['A', 'の', 'B'], meaning: "A's B, B of A",
    points: ['の joins two nouns. The first one describes the second.', "わたしの せんせい = my teacher. にほんの だいがく = a Japanese university.", 'The main thing always comes last.'],
    examples: [{ jp: 'わたしの ともだち', en: 'my friend' }, { jp: 'ゆきさんの でんわばんごう', en: "Yuki's phone number" }],
    drills: [
      { t: 'tiles', en: 'my friend', answer: ['わたし', 'の', 'ともだち'], extra: ['は', 'です'] },
      { t: 'choose', prompt: 'レオさん ＿ でんわばんごう', en: "Leo's phone number", options: ['の', 'は', 'か'], a: 0 },
      { t: 'tiles', en: "Yuki's major", answer: ['ゆきさん', 'の', 'せんこう'], extra: ['か', 'は'] },
      { t: 'fix', en: 'a Japanese university', tokens: ['にほん', 'は', 'だいがく'], wrong: 1, fix: 'の' },
      { t: 'choose', prompt: 'Which one means "my teacher"?', options: ['わたしの せんせい', 'せんせいの わたし', 'わたしは せんせい'], a: 0 },
      { t: 'tiles', en: 'I am a Michi University student.', answer: ['わたし', 'は', 'みちだいがく', 'の', 'がくせい', 'です'], extra: ['か'] },
    ],
  },
];

export const MISSION_U1: Mission = {
  id: 'u1-mission', title: 'Make a friend', goal: 'Make a friend at the welcome party', npc: 'Mei', art: 'party',
  steps: [
    { npc: 'こんにちは！', en: 'Hello!' },
    { goal: 'Say hello', choices: [{ jp: 'こんにちは。', ok: true }, { jp: 'さようなら。', why: 'さようなら means goodbye.' }, { jp: 'すみません。', why: 'すみません means excuse me or sorry.' }] },
    { npc: 'はじめまして。メイです。', en: "Nice to meet you. I'm Mei." },
    { goal: 'Give your name', choices: [{ jp: 'はじめまして。ベンです。', ok: true }, { jp: 'はじめまして。ベンさんです。', why: 'Never add さん to your own name.' }, { jp: 'はじめまして。メイです。', why: 'That is her name, not yours!' }] },
    { npc: 'ベンさんは がくせいですか。', en: 'Are you a student, Ben?' },
    { goal: 'Answer her', choices: [{ jp: 'はい、がくせいです。', ok: true }, { jp: 'はい、がくせいですか。', why: 'か turns it into a question. Just answer.' }, { jp: 'いいえ、がくせいです。', why: 'いいえ means no, but then you say you are a student.' }] },
    { npc: 'わたしも がくせいです。', en: "I'm a student too." },
    { goal: 'Ask her major', choices: [{ jp: 'メイさんの せんこうは なんですか。', ok: true }, { jp: 'メイさんは せんこうですか。', why: 'That asks "Are you a major?"' }, { jp: 'せんこうは メイさんですか。', why: 'That asks "Is the major Mei?" Start with メイさんの せんこう.' }] },
    { npc: 'けいざいです。よろしく！', en: "Economics. Nice to meet you!" },
  ],
};

export const CULTURE_U1: Culture[] = [
  { id: 'c-bow', title: 'Bowing', jp: 'おじぎ', art: 'bowing', text: 'A small nod or short bow goes with はじめまして. Deeper, longer bows show thanks or say sorry. Bow with your hands at your sides, not while shaking hands.',
    tf: [{ s: 'You bow while shaking hands.', a: false, note: 'Bow with your hands at your sides. A handshake and a bow are two different greetings.' }, { s: 'A deeper, longer bow shows stronger thanks or a bigger sorry.', a: true, note: 'The deeper and longer the bow, the more feeling it shows.' }] },
  { id: 'c-names', title: 'Names and さん', jp: 'さん', art: 'names', text: 'Japanese names put the family name first: やまだ ゆき. Add さん after other people\'s names, but never after your own. Teachers are simply called せんせい.',
    tf: [{ s: 'You say your own name with さん: "I am Ben-san."', a: false, note: 'さん is a sign of respect for others, so never use it for yourself.' }, { s: 'In Japan, the family name comes first.', a: true, note: 'やまだ ゆき: Yamada is the family name, Yuki the given name.' }] },
];
