import LINES from './lines.json';
export interface Line { ja: string; tts: string; en: string; chunks: string[][]; heard: string[]; voices: string[] }
export const L = LINES as Record<string, Line>;
export type Scene = 'morning' | 'day' | 'evening' | 'gift' | 'excuse' | 'house' | 'blue' | 'station' | 'face' | 'red' | 'pond' | 'sign';

export interface Phrase { id: string; scene: Scene; when: string; cue: string }
export const PHRASES: Phrase[] = [
  { id: 'ohayo', scene: 'morning', when: 'In the morning', cue: 'It is morning. Greet someone.' },
  { id: 'konnichiwa', scene: 'day', when: 'During the day', cue: 'It is the middle of the day. Greet someone.' },
  { id: 'konbanwa', scene: 'evening', when: 'In the evening', cue: 'It is evening. Greet someone.' },
  { id: 'arigato', scene: 'gift', when: 'Someone gives you something', cue: 'Someone hands you a gift. Thank them.' },
  { id: 'sumimasen', scene: 'excuse', when: 'To get attention or apologise', cue: 'You need to get past someone. What do you say?' },
];
export const phrase = (id: string) => PHRASES.find((p) => p.id === id)!;

export interface Word { id: string; scene: Scene; step: number }
export const WORDS: Word[] = [
  { id: 'ie', scene: 'house', step: 2 }, { id: 'ao', scene: 'blue', step: 2 },
  { id: 'eki', scene: 'station', step: 4 }, { id: 'kao', scene: 'face', step: 4 }, { id: 'aka', scene: 'red', step: 4 }, { id: 'ike', scene: 'pond', step: 4 },
];
export const word = (id: string) => WORDS.find((w) => w.id === id)!;

export const STEPS = [
  { title: 'Hello', sub: 'Three greetings by ear', mins: 4, can: 'You can greet someone at any time of day', next: 'Next: the five vowel sounds, and your first Japanese letters.' },
  { title: 'The five vowels', sub: 'あ い う え お and two words', mins: 7, can: 'You can read and write the five vowels', next: 'Next: the greetings come back, plus thank you and excuse me.' },
  { title: 'Thank you', sub: 'Greetings again, and two new phrases', mins: 5, can: 'You can thank someone and get their attention', next: 'Next: five more letters, the k row.' },
  { title: 'The k row', sub: 'か き く け こ and four words', mins: 8, can: 'You can read and write ten letters', next: 'Next: short exchanges aloud, then the chapter check.' },
  { title: 'Put it together', sub: 'Speaking and the chapter check', mins: 7, can: '', next: '' },
];
/** Kana each step expects the learner to know once it is finished. */
export const STEP_KANA = ['', 'あいうえお', 'あいうえお', 'あいうえおかきくけこ', 'あいうえおかきくけこ'];
