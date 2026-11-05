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
  // Read it after the N row (vowels, K, S, T and N)
  { id: 'neko', kana: 'ねこ', romaji: 'neko', en: 'cat', art: 'cat' },
  { id: 'inu', kana: 'いぬ', romaji: 'inu', en: 'dog', art: 'dog' },
  { id: 'sakana', kana: 'さかな', romaji: 'sakana', en: 'fish', art: 'fish' },
  { id: 'okane', kana: 'おかね', romaji: 'okane', en: 'money', art: 'money' },
  // Greetings
  { id: 'ohayou', kana: 'おはよう', romaji: 'ohayou', alts: ['ohayo', 'ohayoo'], en: 'good morning (casual)', art: 'sunrise', note: 'For friends and family, in the morning. The "ou" at the end is one long "oh".', ex: { jp: 'おはよう、ゆき！', en: 'Morning, Yuki!' } },
  { id: 'ohayougozaimasu', kana: 'おはようございます', romaji: 'ohayou gozaimasu', alts: ['ohayogozaimasu', 'ohayoogozaimasu'], en: 'good morning (polite)', art: 'morning2', note: 'The polite way. Say it to teachers, bosses and people you don\'t know well.' },
  { id: 'konnichiwa', kana: 'こんにちは', romaji: 'konnichiwa', alts: ['konichiwa', 'konnichiha'], en: 'hello, good afternoon', art: 'sun', note: 'Use it from late morning until it gets dark. It is written with 「は」 at the end, but said "wa".', ex: { jp: 'こんにちは、レオ！', en: 'Hello, Leo!' } },
  { id: 'konbanwa', kana: 'こんばんは', romaji: 'konbanwa', alts: ['kombanwa', 'konbanha'], en: 'good evening', art: 'moon', note: 'Use it after dark. It also ends in 「は」, said "wa".', ex: { jp: 'こんばんは、メイ。', en: 'Good evening, Mei.' } },
  { id: 'arigatou', kana: 'ありがとう', romaji: 'arigatou', alts: ['arigato', 'arigatoo'], en: 'thank you (casual)', art: 'gift', note: 'Casual thanks for friends. The "ou" is a long "oh".', ex: { jp: 'ありがとう、ゆき！', en: 'Thanks, Yuki!' } },
  { id: 'arigatougozaimasu', kana: 'ありがとうございます', romaji: 'arigatou gozaimasu', alts: ['arigatogozaimasu', 'arigatoogozaimasu'], en: 'thank you (polite)', art: 'thanks2', note: 'Polite thanks for teachers, shop staff and strangers.' },
  { id: 'sumimasen', kana: 'すみません', romaji: 'sumimasen', en: 'excuse me, sorry', art: 'sorry', note: 'Two jobs: "excuse me" to get someone\'s attention, and "sorry" for small mistakes. The first u is almost silent: "s\'mimasen".' },
  { id: 'sayounara', kana: 'さようなら', romaji: 'sayounara', alts: ['sayonara', 'sayoonara'], en: 'goodbye', art: 'wave', note: 'Sounds a bit final, like "farewell". Friends say jaa ne ("see you") instead.', ex: { jp: 'さようなら、レオ。', en: 'Goodbye, Leo.' } },
  { id: 'hajimemashite', kana: 'はじめまして', romaji: 'hajimemashite', en: 'nice to meet you', art: 'meet', note: 'Only said the very first time you meet someone. Start your introduction with it.' },
  { id: 'yoroshiku', kana: 'よろしくおねがいします', romaji: 'yoroshiku onegaishimasu', alts: ['yoroshikuonegaishimasu', 'yoroshiku'], en: 'please be kind to me', art: 'please', note: 'Said at the end of an introduction, often with a small bow. Friends just say yoroshiku.', ex: { jp: 'はじめまして。よろしくおねがいします。', en: 'Nice to meet you. Please be kind to me.' } },
  // People and school
  { id: 'watashi', kana: 'わたし', kanji: '私', romaji: 'watashi', en: 'I, me', art: 'me', note: 'Japanese often leaves "I" out when it is clear who you mean.', ex: { jp: 'わたしです！', en: 'It\'s me!' } },
  { id: 'gakusei', kana: 'がくせい', kanji: '学生', romaji: 'gakusei', en: 'student', art: 'student', tag: 'job', ex: { jp: 'がくせいです。', en: 'I\'m a student.' } },
  { id: 'sensei', kana: 'せんせい', kanji: '先生', romaji: 'sensei', en: 'teacher', art: 'teacher', tag: 'job', note: 'Never used for yourself. You can put it after a name: Yamada-sensei.', ex: { jp: 'やまだせんせいです。', en: 'This is Professor Yamada.' } },
  { id: 'isha', kana: 'いしゃ', kanji: '医者', romaji: 'isha', en: 'doctor', art: 'doctor', tag: 'job', ex: { jp: 'いしゃです。', en: 'I\'m a doctor.' } },
  { id: 'kaishain', kana: 'かいしゃいん', kanji: '会社員', romaji: 'kaishain', en: 'office worker', art: 'office', tag: 'job', ex: { jp: 'かいしゃいんです。', en: 'I\'m an office worker.' } },
  { id: 'daigaku', kana: 'だいがく', kanji: '大学', romaji: 'daigaku', en: 'university', art: 'university', ex: { jp: 'みちだいがくです。', en: 'It\'s Michi University.' } },
  { id: 'tomodachi', kana: 'ともだち', kanji: '友達', romaji: 'tomodachi', en: 'friend', art: 'friends', tag: 'job', ex: { jp: 'メイさんは ともだちです。', en: 'Mei is a friend.' } },
  { id: 'senkou', kana: 'せんこう', kanji: '専攻', romaji: 'senkou', alts: ['senko', 'senkoo'], en: 'major (what you study)', art: 'major', ex: { jp: 'せんこうは にほんごです。', en: 'My major is Japanese.' } },
  { id: 'nihongo', kana: 'にほんご', kanji: '日本語', romaji: 'nihongo', en: 'Japanese (language)', art: 'nihongo', note: 'Country + go = its language.' },
  // Countries
  { id: 'nihon', kana: 'にほん', kanji: '日本', romaji: 'nihon', en: 'Japan', art: 'japan', ex: { jp: 'にほんじんです。', en: 'I\'m Japanese.' } },
  { id: 'amerika', kana: 'アメリカ', romaji: 'amerika', en: 'America', art: 'usa', note: 'Country names from other languages are written in katakana.', ex: { jp: 'レオさんは アメリカじんです。', en: 'Leo is American.' } },
  { id: 'igirisu', kana: 'イギリス', romaji: 'igirisu', en: 'Britain', art: 'uk', ex: { jp: 'イギリスじんですか。', en: 'Are you British?' } },
  { id: 'chuugoku', kana: 'ちゅうごく', kanji: '中国', romaji: 'chuugoku', alts: ['chugoku', 'tyuugoku'], en: 'China', art: 'china', ex: { jp: 'メイさんは ちゅうごくじんです。', en: 'Mei is Chinese.' } },
  { id: 'jin', kana: '〜じん', kanji: '〜人', romaji: '-jin', alts: ['jin'], en: 'person from (a country)', art: 'jin', note: 'Country + jin. nihon-jin is a Japanese person, amerika-jin an American.', ex: { jp: 'にほんじんですか。', en: 'Are you Japanese?' } },
  // Numbers
  { id: 'ichi', kana: 'いち', romaji: 'ichi', alts: ['iti'], en: 'one (1)', art: 'n1' },
  { id: 'ni', kana: 'に', romaji: 'ni', en: 'two (2)', art: 'n2' },
  { id: 'san', kana: 'さん', romaji: 'san', en: 'three (3)', art: 'n3', note: 'Sounds just like the さん you put after names.' },
  { id: 'yon', kana: 'よん', romaji: 'yon', alts: ['shi', 'si'], en: 'four (4)', art: 'n4', note: 'Also shi, but yon is safer: shi sounds like the word for death.' },
  { id: 'go', kana: 'ご', romaji: 'go', en: 'five (5)', art: 'n5' },
  { id: 'roku', kana: 'ろく', romaji: 'roku', en: 'six (6)', art: 'n6' },
  { id: 'nana', kana: 'なな', romaji: 'nana', alts: ['shichi', 'sichi'], en: 'seven (7)', art: 'n7', note: 'Also shichi.' },
  { id: 'hachi', kana: 'はち', romaji: 'hachi', alts: ['hati'], en: 'eight (8)', art: 'n8' },
  { id: 'kyuu', kana: 'きゅう', romaji: 'kyuu', alts: ['kyu', 'ku'], en: 'nine (9)', art: 'n9', note: 'Also ku.' },
  { id: 'juu', kana: 'じゅう', romaji: 'juu', alts: ['ju', 'jyuu'], en: 'ten (10)', art: 'n10', note: 'Bigger numbers just stack: juu-ichi (10 + 1) is 11, ni-juu (2 x 10) is 20.' },
  { id: 'zero', kana: 'ゼロ', romaji: 'zero', alts: ['rei'], en: 'zero (0)', art: 'n0', note: 'Also rei. Phone numbers often use zero.' },
  // Age and phone
  { id: 'sai', kana: '〜さい', kanji: '〜歳', romaji: '-sai', alts: ['sai'], en: '... years old', art: 'cake', note: 'Number + sai: juu-kyuu-sai is 19. Watch out: 1 is issai, 8 is hassai, 10 is jussai, and 20 is hatachi.', ex: { jp: 'じゅうきゅうさいです。', en: 'I\'m 19 years old.' } },
  { id: 'nansai', kana: 'なんさい', romaji: 'nansai', en: 'how old', art: 'cake2', ex: { jp: 'なんさいですか。', en: 'How old are you?' } },
  { id: 'denwa', kana: 'でんわ', kanji: '電話', romaji: 'denwa', en: 'telephone', art: 'phone', ex: { jp: 'でんわばんごうは なんですか。', en: 'What\'s your phone number?' } },
  { id: 'bangou', kana: 'ばんごう', kanji: '番号', romaji: 'bangou', alts: ['bango', 'bangoo'], en: 'number', art: 'number', note: 'Read phone numbers one digit at a time.', ex: { jp: 'ばんごうは ななです。', en: 'The number is seven.' } },
];

// Extra words that only appear in stories or missions (tap to see the meaning).
export const GLOSS: Record<string, string> = {
  'です': 'is, am, are (polite)', 'は': 'topic marker, said "wa"', 'か': 'makes a question', 'の': "links nouns: A's B", 'はい': 'yes', 'いいえ': 'no',
  'レオ': 'Leo', 'ゆき': 'Yuki', 'メイ': 'Mei', 'さん': 'Mr./Ms. (never for yourself)', 'みちだいがく': 'Michi University', 'なん': 'what',
  'なにじん': 'what nationality', 'どこ': 'where', 'ちゅうごくじん': 'a Chinese person', 'じゅうきゅうさい': '19 years old',
  'これ': 'this one (near me)', 'それ': 'that one (near you)', 'あれ': 'that one over there', 'だれ': 'who', 'を': 'marks the thing (said "o")', 'ください': 'please give me',
  'さんぜん': '3,000', 'はっぴゃく': '800', 'ごひゃく': '500', 'よんひゃく': '400', 'ゼロきゅうゼロ': '090',
};

export const STORIES_U1: Story[] = [
  {
    id: 'u1-story1', title: 'At the dorm',
    panels: [
      { art: 's1p1', lines: [{ who: 'Leo', tokens: [['はじめまして', 'hajimemashite'], '。'], en: 'Nice to meet you.' }] },
      { art: 's1p2', lines: [{ who: 'Yuki', tokens: [['はじめまして', 'hajimemashite'], '。', ['ゆき', 'ゆき'], 'です。'], en: "Nice to meet you. I'm Yuki." }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['レオ', 'レオ'], 'です。', ['よろしくおねがいします', 'yoroshiku'], '。'], en: "I'm Leo. Please be kind to me." }] },
      { art: 's1p4', lines: [{ who: 'Yuki', tokens: [['よろしくおねがいします', 'yoroshiku'], '。'], en: 'Nice to meet you too.' }] },
    ],
    quiz: [
      { q: "What is the girl's name?", options: ['Yuki', 'Mei', 'Leo'], a: 0 },
      { q: 'Is this their first meeting?', options: ['Yes: they say hajimemashite', 'No: they are old friends', 'No: they are saying goodbye'], a: 0 },
      { q: 'What does Leo say after his name?', options: ['Please be kind to me', 'Goodbye', 'Good evening'], a: 0 },
    ],
  },
  {
    id: 'u1-story2', title: 'The welcome party',
    panels: [
      { art: 's2p1', lines: [{ who: 'Mei', tokens: [['こんにちは', 'konnichiwa'], '。', ['メイ', 'メイ'], 'です。'], en: "Hello. I'm Mei." }] },
      { art: 's2p2', lines: [{ who: 'Leo', tokens: [['メイ', 'メイ'], ['さん', 'さん'], ['は', 'は'], ' ', ['なにじん', 'なにじん'], 'です', ['か', 'か'], '。'], en: 'Mei, what nationality are you?' }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['ちゅうごくじん', 'ちゅうごくじん'], 'です。', ['じゅうきゅうさい', 'じゅうきゅうさい'], 'です。'], en: "I'm Chinese. I'm 19." }] },
      { art: 's2p4', lines: [{ who: 'Yuki', tokens: [['メイ', 'メイ'], ['さん', 'さん'], ['は', 'は'], ' ', ['わたし', 'watashi'], ['の', 'の'], ['ともだち', 'tomodachi'], 'です。'], en: 'Mei is my friend.' }] },
    ],
    quiz: [
      { q: 'Where is Mei from?', options: ['China', 'America', 'Britain'], a: 0 },
      { q: 'How old is Mei?', options: ['19', '9', '10'], a: 0 },
      { q: 'Who is Mei to Yuki?', options: ['Her friend', 'Her teacher', 'Her doctor'], a: 0 },
    ],
  },
];

export const GRAMMAR_U1: Grammar[] = [
  {
    id: 'u1-g-desu', title: 'X です', pattern: ['X', 'です'], meaning: "I'm X, it's X", teaches: ['です', 'さん'],
    points: ['「です」 goes at the end. It means "am, is, are" and keeps you polite. Say it "des": the u is almost silent.', 'To give your name, say your name + 「です」. You don\'t need "I": Japanese leaves out words that are clear.', 'Put 「さん」 after other people\'s names (Leo-san, like Mr. or Ms.). Never after your own.'],
    examples: [{ jp: 'ゆきです。', en: "I'm Yuki." }, { jp: 'はじめまして。レオです。', en: "Nice to meet you. I'm Leo." }],
    drills: [
      { t: 'tiles', en: "I'm Yuki.", answer: ['ゆき', 'です'], extra: ['さん'] },
      { t: 'choose', prompt: 'Leo introduces himself. What does he say?', options: ['レオです。', 'レオさんです。', 'です レオ。'], a: 0 },
      { t: 'tiles', en: "Nice to meet you. I'm Ben.", answer: ['はじめまして', 'ベン', 'です'], extra: ['さん'] },
      { t: 'choose', prompt: 'You meet Mei. How do you say hello to her by name?', options: ['こんにちは、メイさん。', 'こんにちは、さんメイ。', 'こんにちは、メイです さん。'], a: 0 },
      { t: 'tiles', en: "Nice to meet you. I'm Mei. Please be kind to me.", answer: ['はじめまして', 'メイ', 'です', 'よろしくおねがいします'], extra: ['さようなら'] },
    ],
  },
  {
    id: 'u1-g-wa', title: 'X は Y です', pattern: ['X', 'は', 'Y', 'です'], meaning: 'X is Y', teaches: ['は'],
    points: ['「は」 marks the topic: what you are talking about. X は Y です = "X is Y".', 'Here this kana is said "wa", not "ha". It is the one big exception.', 'There is no word for "a" or "the", and no he or she: the name does that job.', 'When the topic is clear, drop it: がくせいです = "(I) am a student."'],
    examples: [{ jp: 'わたしは がくせいです。', en: 'I am a student.' }, { jp: 'ゆきさんは がくせいです。', en: 'Yuki is a student.' }],
    drills: [
      { t: 'tiles', en: 'I am a student.', answer: ['わたし', 'は', 'がくせい', 'です'], extra: ['さん', 'せんせい'] },
      { t: 'choose', prompt: 'わたし ＿ ベンです。', en: 'I am Ben.', options: ['は', 'です', 'さん'], a: 0 },
      { t: 'tiles', en: 'Leo is a student.', answer: ['レオさん', 'は', 'がくせい', 'です'], extra: ['わたし', 'いしゃ'] },
      { t: 'fix', en: 'I am a doctor.', tokens: ['わたし', 'です', 'いしゃ', 'です'], wrong: 1, fix: 'は' },
      { t: 'choose', prompt: 'Which one means "The teacher is a doctor"?', options: ['せんせいは いしゃです。', 'いしゃは せんせいです。', 'せんせいです いしゃは。'], a: 0 },
      { t: 'tiles', en: 'Mei is an office worker.', answer: ['メイさん', 'は', 'かいしゃいん', 'です'], extra: ['わたし', 'さん'] },
    ],
  },
  {
    id: 'u1-g-no', title: 'A の B', pattern: ['A', 'の', 'B'], meaning: "A's B, B of A", teaches: ['の'],
    points: ['「の」 joins two nouns. The first one describes the second.', 'わたしの せんせい = my teacher. ゆきさんの ともだち = Yuki\'s friend.', 'The main thing always comes last.'],
    examples: [{ jp: 'わたしの ともだち', en: 'my friend' }, { jp: 'みちだいがくの がくせいです。', en: "I'm a Michi University student." }],
    drills: [
      { t: 'tiles', en: 'my friend', answer: ['わたし', 'の', 'ともだち'], extra: ['は', 'です'] },
      { t: 'choose', prompt: 'レオさん ＿ せんこう', en: "Leo's major", options: ['の', 'は', 'です'], a: 0 },
      { t: 'tiles', en: "Yuki's major", answer: ['ゆきさん', 'の', 'せんこう'], extra: ['は', 'です'] },
      { t: 'fix', en: 'a teacher of Japanese', tokens: ['にほんご', 'は', 'せんせい'], wrong: 1, fix: 'の' },
      { t: 'choose', prompt: 'Which one means "my teacher"?', options: ['わたしの せんせい', 'せんせいの わたし', 'わたしは せんせい'], a: 0 },
      { t: 'tiles', en: 'I am a Michi University student.', answer: ['わたし', 'は', 'みちだいがく', 'の', 'がくせい', 'です'], extra: ['さん'] },
    ],
  },
  {
    id: 'u1-g-ka', title: 'Questions with か', pattern: ['…', 'です', 'か'], meaning: 'Is it …?', teaches: ['か', 'なん', 'はい', 'いいえ'],
    points: ['Put 「か」 at the end and the sentence becomes a question. The word order stays the same.', 'Answer with 「はい」 (yes) or 「いいえ」 (no).', '「なん」 means "what": なんですか = "What is it?"'],
    examples: [{ jp: 'レオさんは がくせいですか。', en: 'Is Leo a student?' }, { jp: 'はい、がくせいです。', en: 'Yes, he is a student.' }],
    drills: [
      { t: 'tiles', en: 'Is Leo a student?', answer: ['レオさん', 'は', 'がくせい', 'です', 'か'], extra: ['の', 'さん'] },
      { t: 'choose', prompt: 'ゆきさんは がくせいです＿。', en: 'Is Yuki a student?', options: ['か', 'は', 'の'], a: 0 },
      { t: 'choose', prompt: 'レオさんは がくせいですか。', en: 'Leo is a student. Pick the right answer.', options: ['はい、がくせいです。', 'いいえ、がくせいです。', 'はい、がくせいですか。'], a: 0 },
      { t: 'tiles', en: 'What is your major?', answer: ['せんこう', 'は', 'なん', 'です', 'か'], extra: ['の'] },
      { t: 'fix', en: 'Is Leo a student?', tokens: ['レオさん', 'の', 'がくせい', 'ですか'], wrong: 1, fix: 'は' },
      { t: 'choose', prompt: 'メイさんは いしゃですか。', en: 'Mei is a teacher. Pick the right answer.', options: ['いいえ、せんせいです。', 'はい、せんせいです。', 'いいえ、いしゃです。'], a: 0 },
    ],
  },
  {
    id: 'u1-g-where', title: 'なにじん and どこ', pattern: ['…', 'は', 'なにじん', 'ですか'], meaning: 'What nationality is …?', teaches: ['なにじん', 'どこ'],
    points: ['Country + 「じん」 = a person from there: にほんじん, アメリカじん.', '「なにじん」 asks "what nationality?": メイさんは なにじんですか。', '「どこ」 means "where". どこの だいがくですか = "Which university?" (word for word: "a university of where?")'],
    examples: [{ jp: 'メイさんは なにじんですか。', en: 'What nationality is Mei?' }, { jp: 'ちゅうごくじんです。', en: 'She is Chinese.' }],
    drills: [
      { t: 'tiles', en: 'What nationality is Leo?', answer: ['レオさん', 'は', 'なにじん', 'です', 'か'], extra: ['どこ', 'の'] },
      { t: 'choose', prompt: 'ゆきさんは ＿ですか。', en: 'What nationality is Yuki?', options: ['なにじん', 'にほん', 'どこ'], a: 0 },
      { t: 'choose', prompt: 'レオさんは なにじんですか。', en: 'Leo is American. Pick the answer.', options: ['アメリカじんです。', 'アメリカです。', 'イギリスじんです。'], a: 0 },
      { t: 'tiles', en: 'Which university are you at?', answer: ['どこ', 'の', 'だいがく', 'です', 'か'], extra: ['なにじん', 'は'] },
      { t: 'fix', en: "I'm Japanese.", tokens: ['わたし', 'は', 'にほん', 'です'], wrong: 2, fix: 'にほんじん' },
      { t: 'choose', prompt: 'Which one means "I\'m British"?', options: ['イギリスじんです。', 'イギリスです。', 'イギリスの じんです。'], a: 0 },
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
    { npc: 'ベンさんは がくせいですか。', en: 'Are you a student?' },
    { goal: 'Answer her', choices: [{ jp: 'はい、がくせいです。', ok: true }, { jp: 'はい、がくせいですか。', why: 'か turns it into a question. Just answer.' }, { jp: 'いいえ、がくせいです。', why: 'いいえ means no, but then you say you are a student.' }] },
    { npc: 'わたしは みちだいがくの がくせいです。', en: "I'm a Michi University student." },
    { goal: 'Ask her major', choices: [{ jp: 'メイさんの せんこうは なんですか。', ok: true }, { jp: 'メイさんは せんこうですか。', why: 'That asks "Are you a major?"' }, { jp: 'せんこうは メイさんですか。', why: 'That asks "Is the major Mei?" Start with メイさんの せんこう.' }] },
    { npc: 'にほんごです。', en: 'Japanese.' },
    { goal: 'End the introduction', choices: [{ jp: 'よろしくおねがいします。', ok: true }, { jp: 'さようなら。', why: 'That means goodbye. You just met!' }, { jp: 'すみません。', why: 'すみません is for excuse me or sorry.' }] },
    { npc: 'よろしくおねがいします！', en: 'Nice to meet you too!' },
  ],
};

export const CULTURE_U1: Culture[] = [
  { id: 'c-bow', title: 'Bowing', jp: 'おじぎ', art: 'bowing', text: 'A small nod or short bow goes with はじめまして and よろしくおねがいします. Deeper, longer bows show thanks or say sorry. Bow with your hands at your sides, not while shaking hands.',
    tf: [{ s: 'You bow while shaking hands.', a: false, note: 'Bow with your hands at your sides. A handshake and a bow are two different greetings.' }, { s: 'A deeper, longer bow shows stronger thanks or a bigger sorry.', a: true, note: 'The deeper and longer the bow, the more feeling it shows.' }] },
  { id: 'c-names', title: 'Names and さん', jp: 'さん', art: 'names', text: 'Japanese names put the family name first: やまだ ゆき. Add さん after other people\'s names, but never after your own. Teachers are called sensei ("teacher") instead.',
    tf: [{ s: 'You say your own name with さん: "I am Ben-san."', a: false, note: 'さん is a sign of respect for others, so never use it for yourself.' }, { s: 'In Japan, the family name comes first.', a: true, note: 'やまだ ゆき: Yamada is the family name, Yuki the given name.' }] },
];
