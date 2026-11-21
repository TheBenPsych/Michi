/** Chapter 1 as five short steps, plus the generic "learn a row of kana" lesson used by the trainer. */
import { Card } from './engine';
import { hear, meetKana, writeKana, recallSound, recallLetter, showWords, spell, typeSound, sayIt, whenPhrase, whichPhrase, choose, shuffle, pick } from './cards';
import { S } from './store';
import { phrase } from './data/content';

/** Teach a row: meet, trace and write each letter, with a quick recall after three and after all of them. Known letters skip the teaching. */
export function kanaLesson(row: string[], review: string[] = [], known: string[] = S.kana): Card[] {
  const cards: Card[] = [], fresh = row.filter((k) => !known.includes(k));
  fresh.forEach((k, i) => {
    cards.push(meetKana(k), writeKana(k, 'trace'), writeKana(k, 'free'));
    if (i === 2 && fresh.length > 3) cards.push(...shuffle(fresh.slice(0, 3)).map(recallSound));
  });
  const mix = shuffle(row).map((k, i) => (i % 2 ? recallLetter(k) : recallSound(k)));
  const old = pick(review, 3).map((k, i) => (i % 2 ? recallSound(k) : recallLetter(k)));
  return [...cards, ...shuffle([...mix, ...old])];
}

const GREET = ['ohayo', 'konnichiwa', 'konbanwa'], ALLP = [...GREET, 'arigato', 'sumimasen'];
export function stepCards(n: number, base: string[] = S.kana): Card[] {
  if (n === 0) return [...GREET.map(hear), ...shuffle(GREET).map((id) => whenPhrase(id, GREET))];
  if (n === 1) return [...kanaLesson([...'あいうえお'], [], base), showWords(['ie', 'ao']), spell('ie', 'pic'), spell('ao', 'pic')];
  if (n === 2) return [
    ...GREET.map((id) => sayIt({ id, cue: phrase(id).cue, scene: phrase(id).scene, item: `p:${id}` })),
    hear('arigato'), hear('sumimasen'),
    choose({ note: { title: 'Polite or casual', text: 'With friends, people say just Ohayō and Arigatō. Adding gozaimasu makes it polite, and polite is the safe choice.' },
      prompt: 'A stranger holds the door for you. Which do you say?', cols: 1,
      opts: [{ label: 'Arigatō gozaimasu', ok: true }, { label: 'Arigatō' }], ok: 'Correct. With a stranger, use the polite form.', no: 'With a stranger the polite form is safer: Arigatō gozaimasu.' }),
    whichPhrase('sumimasen', ALLP), whichPhrase('arigato', ALLP), whenPhrase('sumimasen', ALLP),
  ];
  if (n === 3) return [...kanaLesson([...'かきくけこ'], [...'あいうえお'], base), typeSound('いこ'), showWords(['eki', 'kao', 'aka', 'ike'], 'Four more words from your ten letters. Tap each one to hear it.'),
    spell('eki', 'pic'), spell('kao', 'pic'), spell('aka', 'audio'), spell('ike', 'audio')];
  // Step 5: short exchanges aloud, then the chapter check.
  const ks = shuffle(S.kana.length ? S.kana.slice(0, 10) : [...'あいうえおかきくけこ']);
  return [
    sayIt({ id: 'konnichiwa', cue: 'It is the afternoon. Your neighbour greets you. Answer aloud.', partner: { id: 'konnichiwa', who: 'Neighbour' }, item: 'p:konnichiwa' }),
    sayIt({ id: 'arigato', cue: 'Someone hands you a present. Thank them.', scene: 'gift', item: 'p:arigato' }),
    sayIt({ id: 'sumimasen', cue: 'You want the shop assistant’s attention. Call out politely.', scene: 'excuse', item: 'p:sumimasen' }),
    ...shuffle<Card>([
      recallLetter(ks[0]), recallLetter(ks[1]), recallSound(ks[2]),
      spell(pick(['ie', 'ao', 'kao'], 1)[0], 'pic'), spell(pick(['eki', 'aka', 'ike'], 1)[0], 'audio'),
      whichPhrase('konbanwa', ALLP), whenPhrase('ohayo', ALLP),
      writeKana(ks[3], 'free'), typeSound(ks[4] + ks[5], { item: `k:${ks[4]}` }),
    ]),
    sayIt({ id: 'ohayo', cue: 'It is morning. Greet someone.', scene: 'morning', item: 'p:ohayo' }),
  ];
}
