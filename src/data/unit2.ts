// Unit 2 content: shopping (follows the topics of Genki I, Lesson 2), woven with the rest of hiragana and all of katakana.
// All text is original to Michi.
import type { Word, Story, Grammar } from './course';

export const WORDS_U2: Word[] = [
  // Things you carry
  { id: 'hon', kana: 'ほん', kanji: '本', romaji: 'hon', en: 'book', art: 'book', tag: 'thing', ex: { jp: 'にほんごの ほんです。', en: "It's a Japanese book." } },
  { id: 'kaban', kana: 'かばん', romaji: 'kaban', en: 'bag', art: 'bag', tag: 'thing', ex: { jp: 'ゆきさんの かばんです。', en: "It's Yuki's bag." } },
  { id: 'tokei', kana: 'とけい', kanji: '時計', romaji: 'tokei', alts: ['tokee'], en: 'watch, clock', art: 'watch', tag: 'thing', ex: { jp: 'わたしの とけいです。', en: "It's my watch." } },
  { id: 'saifu', kana: 'さいふ', romaji: 'saifu', alts: ['saihu'], en: 'wallet', art: 'wallet', tag: 'thing', ex: { jp: 'レオさんの さいふですか。', en: "Is it Leo's wallet?" } },
  { id: 'megane', kana: 'めがね', romaji: 'megane', en: 'glasses', art: 'glasses', tag: 'thing', ex: { jp: 'せんせいの めがねです。', en: "They're the teacher's glasses." } },
  // Read it: H and M rows
  { id: 'hana', kana: 'はな', kanji: '花', romaji: 'hana', en: 'flower', art: 'flower' },
  { id: 'hoshi', kana: 'ほし', kanji: '星', romaji: 'hoshi', alts: ['hosi'], en: 'star', art: 'star' },
  { id: 'mimi', kana: 'みみ', kanji: '耳', romaji: 'mimi', en: 'ear', art: 'ear' },
  { id: 'mushi', kana: 'むし', kanji: '虫', romaji: 'mushi', alts: ['musi'], en: 'bug', art: 'bug' },
  // Café
  { id: 'koohii', kana: 'コーヒー', romaji: 'koohii', alts: ['kohi', 'kouhii', 'koohi'], en: 'coffee', art: 'coffee', tag: 'food', ex: { jp: 'コーヒーですか。', en: 'Is it coffee?' } },
  { id: 'ocha', kana: 'おちゃ', romaji: 'ocha', alts: ['otya'], en: 'green tea', art: 'tea', tag: 'food', ex: { jp: 'にほんの おちゃです。', en: "It's Japanese tea." } },
  { id: 'mizu', kana: 'みず', kanji: '水', romaji: 'mizu', en: 'water', art: 'water', tag: 'food', ex: { jp: 'みずですか。', en: 'Is it water?' } },
  { id: 'pan', kana: 'パン', romaji: 'pan', en: 'bread', art: 'bread', tag: 'food', note: 'Pan came into Japanese from Portuguese.' },
  { id: 'keeki', kana: 'ケーキ', romaji: 'keeki', alts: ['keki'], en: 'cake', art: 'shortcake', tag: 'food', ex: { jp: 'わたしの ケーキです！', en: "It's my cake!" } },
  // Read it: Y, W and R rows
  { id: 'yama', kana: 'やま', kanji: '山', romaji: 'yama', en: 'mountain', art: 'mountain' },
  { id: 'kuruma', kana: 'くるま', kanji: '車', romaji: 'kuruma', en: 'car', art: 'car' },
  { id: 'saru', kana: 'さる', kanji: '猿', romaji: 'saru', en: 'monkey', art: 'monkey' },
  { id: 'sora', kana: 'そら', kanji: '空', romaji: 'sora', en: 'sky', art: 'sky' },
  // Prices
  { id: 'hyaku', kana: 'ひゃく', kanji: '百', romaji: 'hyaku', en: 'hundred (100)', art: 'n100', note: 'Some sounds change: 300 is sanbyaku, 600 roppyaku, 800 happyaku.', ex: { jp: 'ひゃくえんです。', en: "It's 100 yen." } },
  { id: 'sen', kana: 'せん', kanji: '千', romaji: 'sen', en: 'thousand (1,000)', art: 'n1000', note: '3,000 is sanzen and 8,000 is hassen.', ex: { jp: 'せんえんです。', en: "It's 1,000 yen." } },
  { id: 'man', kana: 'まん', kanji: '万', romaji: 'man', en: 'ten thousand (10,000)', art: 'n10000', note: 'Japanese counts big numbers in ten-thousands: ichi-man is 10,000.', ex: { jp: 'いちまんえんです。', en: "It's 10,000 yen." } },
  { id: 'en', kana: 'えん', kanji: '円', romaji: 'en', alts: ['yen'], en: 'yen (money)', art: 'yen', note: 'Prices are number + en: hyaku-en is 100 yen.', ex: { jp: 'ごひゃくえんです。', en: "It's 500 yen." } },
  { id: 'ikura', kana: 'いくら', romaji: 'ikura', en: 'how much', art: 'pricetag', ex: { jp: 'これは いくらですか。', en: 'How much is this?' } },
  // Read it: voiced sounds
  { id: 'buta', kana: 'ぶた', kanji: '豚', romaji: 'buta', en: 'pig', art: 'pig' },
  { id: 'gohan', kana: 'ごはん', romaji: 'gohan', en: 'rice, a meal', art: 'rice', tag: 'food' },
  { id: 'tenpura', kana: 'てんぷら', romaji: 'tenpura', alts: ['tempura'], en: 'tempura (fried shrimp and veg)', art: 'tempura', tag: 'food' },
  // Katakana loanwords
  { id: 'kokoa', kana: 'ココア', romaji: 'kokoa', en: 'hot cocoa', art: 'cocoa', tag: 'food' },
  { id: 'kiui', kana: 'キウイ', romaji: 'kiui', en: 'kiwi fruit', art: 'kiwi', tag: 'food' },
  { id: 'aisu', kana: 'アイス', romaji: 'aisu', en: 'ice cream', art: 'icecream', tag: 'food', note: 'From "ice", short for ice cream.' },
  { id: 'tenisu', kana: 'テニス', romaji: 'tenisu', en: 'tennis', art: 'tennis' },
  { id: 'nekutai', kana: 'ネクタイ', romaji: 'nekutai', en: 'necktie', art: 'necktie', tag: 'thing' },
  { id: 'tsuna', kana: 'ツナ', romaji: 'tsuna', alts: ['tuna'], en: 'tuna', art: 'tuna', tag: 'food' },
  { id: 'takosu', kana: 'タコス', romaji: 'takosu', en: 'tacos', art: 'taco', tag: 'food' },
  { id: 'hoteru', kana: 'ホテル', romaji: 'hoteru', en: 'hotel', art: 'hotel' },
  { id: 'kamera', kana: 'カメラ', romaji: 'kamera', en: 'camera', art: 'camera', tag: 'thing' },
  { id: 'naifu', kana: 'ナイフ', romaji: 'naifu', alts: ['naihu'], en: 'knife', art: 'knife', tag: 'thing' },
  { id: 'miruku', kana: 'ミルク', romaji: 'miruku', en: 'milk', art: 'milk', tag: 'food' },
  { id: 'terebi', kana: 'テレビ', romaji: 'terebi', en: 'TV', art: 'tv', tag: 'thing' },
  { id: 'pasokon', kana: 'パソコン', romaji: 'pasokon', en: 'computer (PC)', art: 'laptop', tag: 'thing', note: 'Short for "personal computer".' },
  { id: 'menyuu', kana: 'メニュー', romaji: 'menyuu', alts: ['menyu', 'menyuu'], en: 'menu', art: 'menu', tag: 'thing' },
  { id: 'juusu', kana: 'ジュース', romaji: 'juusu', alts: ['jusu', 'jyuusu'], en: 'juice', art: 'juice', tag: 'food' },
  { id: 'fooku', kana: 'フォーク', romaji: 'fooku', alts: ['foku', 'hooku'], en: 'fork', art: 'fork', tag: 'thing' },
  { id: 'paatii', kana: 'パーティー', romaji: 'paatii', alts: ['pati', 'paatei', 'paathii'], en: 'party', art: 'partyart' },
];

export const STORIES_U2: Story[] = [
  {
    id: 'u2-story1', title: 'Whose umbrella?',
    panels: [
      { art: 's1p4', lines: [{ who: 'Yuki', tokens: [['これ', 'これ'], ['は', 'は'], ' ', ['だれ', 'だれ'], ['の', 'の'], ' ', ['かさ', 'kasa'], 'ですか。'], en: 'Whose umbrella is this?' }] },
      { art: 'umbrella', lines: [{ who: 'Leo', tokens: [['それ', 'それ'], ['は', 'は'], ' ', ['わたし', 'watashi'], ['の', 'の'], ' ', ['かさ', 'kasa'], 'です。'], en: "That's my umbrella." }] },
      { art: 's2p2', lines: [{ who: 'Yuki', tokens: [['あれ', 'あれ'], ['は', 'は'], ' ', ['メイ', 'メイ'], ['さん', 'さん'], ['の', 'の'], ' ', ['かばん', 'kaban'], 'ですか。'], en: "Is that bag over there Mei's?" },
        { who: 'Leo', tokens: [['はい', 'はい'], '、', ['メイ', 'メイ'], ['さん', 'さん'], ['の', 'の'], 'です。'], en: "Yes, it's Mei's." }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['ありがとう', 'arigatou'], '！'], en: 'Thanks!' }] },
    ],
    quiz: [
      { q: 'Whose umbrella is it?', options: ["Leo's", "Yuki's", "Mei's"], a: 0 },
      { q: 'Whose is the bag over there?', options: ["Mei's", "Leo's", "Yuki's"], a: 0 },
    ],
  },
  {
    id: 'u2-story2', title: 'At the café',
    panels: [
      { art: 'cafe', lines: [{ who: 'Leo', tokens: [['すみません', 'sumimasen'], '。'], en: 'Excuse me.' }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['コーヒー', 'koohii'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'A coffee, please.' }] },
      { art: 's1p4', lines: [{ who: 'Leo', tokens: [['ゆき', 'ゆき'], ['さん', 'さん'], ['は', 'は'], '？'], en: 'And you, Yuki?' },
        { who: 'Yuki', tokens: [['おちゃ', 'ocha'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'Green tea, please.' }] },
      { art: 's1p2', lines: [{ who: 'Yuki', tokens: [['ありがとうございます', 'arigatougozaimasu'], '。'], en: 'Thank you very much.' }] },
    ],
    quiz: [
      { q: 'What does Leo order?', options: ['Coffee', 'Green tea', 'Water'], a: 0 },
      { q: 'What does Yuki order?', options: ['Green tea', 'Coffee', 'Cake'], a: 0 },
    ],
  },
  {
    id: 'u2-story3', title: 'At the shop',
    panels: [
      { art: 'shop', lines: [{ who: 'Leo', tokens: [['すみません', 'sumimasen'], '。', ['これ', 'これ'], ['は', 'は'], ' ', ['いくら', 'ikura'], 'ですか。'], en: 'Excuse me. How much is this?' }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['それ', 'それ'], ['は', 'は'], ' ', ['さんぜん', 'さんぜん'], ['えん', 'en'], 'です。'], en: "That's 3,000 yen." }] },
      { art: 's2p2', lines: [{ who: 'Leo', tokens: [['あれ', 'あれ'], ['は', 'は'], '？'], en: 'And that one over there?' },
        { who: 'Mei', tokens: [['あれ', 'あれ'], ['は', 'は'], ' ', ['はっぴゃく', 'はっぴゃく'], ['えん', 'en'], 'です。'], en: "That one is 800 yen." }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['あれ', 'あれ'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: "I'll take that one, please." }] },
    ],
    quiz: [
      { q: 'How much is the first thing?', options: ['3,000 yen', '300 yen', '800 yen'], a: 0 },
      { q: 'What does Leo buy?', options: ['The one over there', 'The first one', 'Nothing'], a: 0 },
    ],
  },
  {
    id: 'u2-story4', title: 'Your phone number?',
    panels: [
      { art: 's2p2', lines: [{ who: 'Leo', tokens: [['メイ', 'メイ'], ['さん', 'さん'], '、', ['でんわ', 'denwa'], ['ばんごう', 'bangou'], ['は', 'は'], ' ', ['なん', 'なん'], 'ですか。'], en: "Mei, what's your phone number?" }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['ゼロきゅうゼロ', 'ゼロきゅうゼロ'], 'の、', ['ろく', 'roku'], ['に', 'ni'], ['よん', 'yon'], ['ご', 'go'], 'です。'], en: "It's 090-6245." }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['ありがとう', 'arigatou'], '！'], en: 'Thanks!' }] },
    ],
    quiz: [
      { q: 'What does Leo ask Mei for?', options: ['Her phone number', 'Her age', 'Her major'], a: 0 },
      { q: "How does Mei's number start?", options: ['090', '080', '070'], a: 0 },
    ],
  },
  {
    id: 'u2-story5', title: 'Ice cream or cocoa?',
    panels: [
      { art: 'cafe', lines: [{ who: 'Leo', tokens: [['すみません', 'sumimasen'], '。', ['アイス', 'aisu'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'Excuse me. An ice cream, please.' }] },
      { art: 's1p4', lines: [{ who: 'Yuki', tokens: [['ココア', 'kokoa'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'A hot cocoa, please.' }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['ごひゃく', 'ごひゃく'], ['えん', 'en'], 'です。'], en: "That's 500 yen." }] },
    ],
    quiz: [
      { q: 'What does Leo want?', options: ['Ice cream', 'Hot cocoa', 'A kiwi'], a: 0 },
      { q: 'How much is it?', options: ['500 yen', '5,000 yen', '50 yen'], a: 0 },
    ],
  },
  {
    id: 'u2-story6', title: 'Whose camera?',
    panels: [
      { art: 's1p4', lines: [{ who: 'Yuki', tokens: [['これ', 'これ'], ['は', 'は'], ' ', ['だれ', 'だれ'], ['の', 'の'], ' ', ['カメラ', 'kamera'], 'ですか。'], en: 'Whose camera is this?' }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['メイ', 'メイ'], ['さん', 'さん'], ['の', 'の'], 'です。'], en: "It's Mei's." }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['ありがとう', 'arigatou'], '！', ['ミルク', 'miruku'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'Thanks! Milk, please.' }] },
    ],
    quiz: [
      { q: 'Whose camera is it?', options: ["Mei's", "Leo's", "Yuki's"], a: 0 },
      { q: 'What does Mei ask for?', options: ['Milk', 'Juice', 'Coffee'], a: 0 },
    ],
  },
  {
    id: 'u2-story7', title: 'Cake and coffee',
    panels: [
      { art: 'cafe', lines: [{ who: 'Leo', tokens: [['ケーキ', 'keeki'], ['は', 'は'], ' ', ['いくら', 'ikura'], 'ですか。'], en: 'How much is the cake?' }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['よんひゃく', 'よんひゃく'], ['えん', 'en'], 'です。'], en: "It's 400 yen." }] },
      { art: 's1p3', lines: [{ who: 'Leo', tokens: [['ケーキ', 'keeki'], ['を', 'を'], ' ', ['ください', 'ください'], '。', ['コーヒー', 'koohii'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'The cake, please. And a coffee, please.' }] },
    ],
    quiz: [
      { q: 'How much is the cake?', options: ['400 yen', '4,000 yen', '40 yen'], a: 0 },
      { q: 'What else does Leo order?', options: ['Coffee', 'Tea', 'Juice'], a: 0 },
    ],
  },
  {
    id: 'u2-story8', title: 'The party',
    panels: [
      { art: 'partyart', lines: [{ who: 'Leo', tokens: [['パーティー', 'paatii'], ['は', 'は'], ' ', ['どこ', 'どこ'], 'ですか。'], en: 'Where is the party?' }] },
      { art: 's2p4', lines: [{ who: 'Yuki', tokens: [['あれ', 'あれ'], 'です！'], en: "It's over there!" }] },
      { art: 's2p3', lines: [{ who: 'Mei', tokens: [['メニュー', 'menyuu'], 'です。'], en: "Here's the menu." }, { who: 'Leo', tokens: [['ジュース', 'juusu'], ['を', 'を'], ' ', ['ください', 'ください'], '。'], en: 'Juice, please.' }] },
    ],
    quiz: [
      { q: 'What is Leo looking for?', options: ['The party', 'The hotel', 'The shop'], a: 0 },
      { q: 'What does Leo order?', options: ['Juice', 'Milk', 'Cocoa'], a: 0 },
    ],
  },
];

export const GRAMMAR_U2: Grammar[] = [
  {
    id: 'u2-g-kore', title: 'これ, それ, あれ', pattern: ['これ', 'は', 'X', 'です'], meaning: 'This is X', teaches: ['これ', 'それ', 'あれ'],
    points: ['「これ」 = this one, near me. 「それ」 = that one, near you. 「あれ」 = that one over there, far from both of us.', 'They stand on their own, like "this one": これは ほんです = "This is a book."', 'Point while you say it, just like in English.'],
    examples: [{ jp: 'これは とけいです。', en: 'This is a watch.' }, { jp: 'それは わたしの かばんです。', en: 'That is my bag.' }],
    drills: [
      { t: 'tiles', en: 'This is a book.', answer: ['これ', 'は', 'ほん', 'です'], extra: ['それ', 'の'] },
      { t: 'choose', prompt: '＿は かばんですか。', en: 'Is that (near you) a bag?', options: ['それ', 'これ', 'あれ'], a: 0 },
      { t: 'choose', prompt: '＿は だいがくです。', en: 'That (far over there) is a university.', options: ['あれ', 'これ', 'それ'], a: 0 },
      { t: 'tiles', en: 'That (near you) is my wallet.', answer: ['それ', 'は', 'わたし', 'の', 'さいふ', 'です'], extra: ['これ'] },
      { t: 'fix', en: 'This is a watch.', tokens: ['これ', 'の', 'とけい', 'です'], wrong: 1, fix: 'は' },
      { t: 'choose', prompt: 'Which one means "This is Leo\'s bag"?', options: ['これは レオさんの かばんです。', 'これは かばんの レオさんです。', 'レオさんは これの かばんです。'], a: 0 },
    ],
  },
  {
    id: 'u2-g-dare', title: 'だれの: whose?', pattern: ['これは', 'だれの', 'X', 'ですか'], meaning: 'Whose X is this?', teaches: ['だれ'],
    points: ['「だれ」 means "who", so 「だれの」 means "whose".', 'Answer by putting the person where だれ was: これは だれの ほんですか。 ゆきさんの ほんです。', 'You can leave out the thing: ゆきさんのです = "It\'s Yuki\'s."'],
    examples: [{ jp: 'これは だれの かさですか。', en: 'Whose umbrella is this?' }, { jp: 'レオさんの かさです。', en: "It's Leo's umbrella." }],
    drills: [
      { t: 'tiles', en: 'Whose bag is this?', answer: ['これ', 'は', 'だれ', 'の', 'かばん', 'です', 'か'], extra: ['それ'] },
      { t: 'choose', prompt: 'それは だれの とけいですか。', en: "It is Mei's. Pick the answer.", options: ['メイさんのです。', 'メイさんです。', 'だれのです。'], a: 0 },
      { t: 'tiles', en: "It's Yuki's book.", answer: ['ゆきさん', 'の', 'ほん', 'です'], extra: ['だれ'] },
      { t: 'choose', prompt: 'あれは ＿の かばんですか。', en: 'Whose bag is that over there?', options: ['だれ', 'なん', 'どこ'], a: 0 },
      { t: 'fix', en: 'Whose glasses are these?', tokens: ['これ', 'は', 'なん', 'の', 'めがね', 'ですか'], wrong: 2, fix: 'だれ' },
      { t: 'choose', prompt: 'Which one means "That is the teacher\'s wallet"?', options: ['それは せんせいの さいふです。', 'それは さいふの せんせいです。', 'せんせいは それの さいふです。'], a: 0 },
    ],
  },
  {
    id: 'u2-g-kudasai', title: 'X を ください', pattern: ['X', 'を', 'ください'], meaning: 'X, please', teaches: ['を', 'ください'],
    points: ['「ください」 means "please give me". Put the thing first: コーヒーを ください = "Coffee, please."', '「を」 marks the thing you want. It is said "o", just like 「お」.', 'In a shop, これを ください means "I\'ll take this one."'],
    examples: [{ jp: 'おちゃを ください。', en: 'Green tea, please.' }, { jp: 'これを ください。', en: "I'll take this one, please." }],
    drills: [
      { t: 'tiles', en: 'Water, please.', answer: ['みず', 'を', 'ください'], extra: ['は', 'の'] },
      { t: 'choose', prompt: 'コーヒー ＿ ください。', en: 'Coffee, please.', options: ['を', 'は', 'の'], a: 0 },
      { t: 'tiles', en: "I'll take that one (near you), please.", answer: ['それ', 'を', 'ください'], extra: ['これ', 'です'] },
      { t: 'fix', en: 'Bread, please.', tokens: ['パン', 'は', 'ください'], wrong: 1, fix: 'を' },
      { t: 'choose', prompt: 'Which one means "Cake, please"?', options: ['ケーキを ください。', 'ケーキは ください。', 'くださいを ケーキ。'], a: 0 },
      { t: 'tiles', en: 'Excuse me. Green tea, please.', answer: ['すみません', 'おちゃ', 'を', 'ください'], extra: ['ありがとう'] },
    ],
  },
  {
    id: 'u2-g-ikura', title: 'いくらですか', pattern: ['X', 'は', 'いくら', 'ですか'], meaning: 'How much is X?', teaches: ['さんびゃく', 'ろっぴゃく', 'はっぴゃく', 'さんぜん', 'はっせん'],
    points: ['「いくら」 means "how much": それは いくらですか = "How much is that?"', 'Build prices like a sum: せん (1,000) + ごひゃく (500) = せんごひゃくえん, 1,500 yen.', 'A few sounds change: さんびゃく (300), ろっぴゃく (600), はっぴゃく (800), さんぜん (3,000), はっせん (8,000).', 'Big numbers go up in ten-thousands: いちまん is 10,000.'],
    examples: [{ jp: 'これは いくらですか。', en: 'How much is this?' }, { jp: 'さんびゃくえんです。', en: "It's 300 yen." }],
    drills: [
      { t: 'choose', prompt: 'Which one is 300 yen?', options: ['さんびゃくえん', 'さんひゃくえん', 'さんせんえん'], a: 0 },
      { t: 'tiles', en: 'How much is this?', answer: ['これ', 'は', 'いくら', 'です', 'か'], extra: ['だれ', 'の'] },
      { t: 'choose', prompt: 'ケーキは ＿ですか。', en: 'How much is the cake?', options: ['いくら', 'なん', 'だれ'], a: 0 },
      { t: 'choose', prompt: 'Which one is 1,500 yen?', options: ['せんごひゃくえん', 'ごひゃくせんえん', 'いちせんごえん'], a: 0 },
      { t: 'tiles', en: 'That (over there) is 800 yen.', answer: ['あれ', 'は', 'はっぴゃく', 'えん', 'です'], extra: ['ひゃく'] },
      { t: 'choose', prompt: 'Which one is 10,000 yen?', options: ['いちまんえん', 'じゅうせんえん', 'せんえん'], a: 0 },
    ],
  },
];
