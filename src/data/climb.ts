// The climb from N5 to N1: five regions of one mountain, each with a rank title earned at its gate.

export interface Region {
  id: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  level: string;            // "N5"
  place: string; placeJp: string;
  rank: string; rankJp: string; rankRomaji: string;
  source: string;           // where the content comes from
  words: number; kanji: number; // rough targets
  cando: string[];
  stamp: string;            // kanji on the rank stamp
  /** Planned units for this region (shown on the trail before they are built). */
  plan: string[];
}

export const REGIONS: Region[] = [
  { id: 'n5', level: 'N5', place: 'Foothill Village', placeJp: '麓の村', rank: 'Traveler', rankJp: '旅人', rankRomaji: 'Tabibito',
    source: 'Genki I style', words: 800, kanji: 100, stamp: '旅',
    cando: ['Introduce yourself', 'Buy things and ask prices', 'Make plans and invite friends', 'Talk about your day in simple sentences'],
    plan: ['Meeting new friends', 'Shopping', 'Making plans', 'A first date', 'A trip', 'A day in the life', 'Family photo', 'Barbecue party', 'A night at the theater', 'Winter break plans', 'After the holidays', 'Feeling sick'] },
  { id: 'n4', level: 'N4', place: 'Bamboo Forest', placeJp: '竹林', rank: 'Apprentice', rankJp: '見習い', rankRomaji: 'Minarai',
    source: 'Genki II style', words: 1500, kanji: 300, stamp: '竹',
    cando: ['Ask for and do favors', 'Give and receive gifts politely', 'Speak politely to a boss or teacher', 'Follow slow everyday conversation'],
    plan: [] },
  { id: 'n3', level: 'N3', place: 'Hot Spring Town', placeJp: '温泉町', rank: 'Craftsman', rankJp: '職人', rankRomaji: 'Shokunin',
    source: "Michi's own units", words: 3700, kanji: 650, stamp: '湯',
    cando: ['Read short articles and graded readers', 'Follow most natural-speed daily talk', 'Explain your opinion with reasons'], plan: [] },
  { id: 'n2', level: 'N2', place: 'Castle Town', placeJp: '城下町', rank: 'Master teacher', rankJp: '師範', rankRomaji: 'Shihan',
    source: "Michi's own units", words: 6000, kanji: 1000, stamp: '城',
    cando: ['Read newspapers and opinion pieces', 'Follow TV and news', 'Work in Japanese with some effort'], plan: [] },
  { id: 'n1', level: 'N1', place: 'The Summit', placeJp: '山頂', rank: 'Master', rankJp: '達人', rankRomaji: 'Tatsujin',
    source: "Michi's own units", words: 10000, kanji: 2000, stamp: '頂',
    cando: ['Read essays and novels', 'Follow lectures and fast, nuanced speech', 'Discuss almost any topic'], plan: [] },
];
