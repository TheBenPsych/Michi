// Pacing rule: learners only ever see kana they have already been taught.
// Any run of kana that uses an unlearned character is shown in romaji instead,
// and it switches to kana by itself once those characters are learned.
import { LESSONS, UNITS } from './data/kana';
import { S } from './state';

const BASE: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o', か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko', さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to', な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no', は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo', や: 'ya', ゆ: 'yu', よ: 'yo', ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro', わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go', ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo', だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo', ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po', ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o', ゔ: 'vu',
};
const SMALL_Y: Record<string, string> = { ゃ: 'a', ゅ: 'u', ょ: 'o' };
const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Plain Hepburn romaji for a kana run. */
function plain(run: string): string {
  const s = toHira(run);
  let out = '', dbl = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i], nx = s[i + 1];
    if (c === 'っ') { dbl = true; continue; }
    if (c === 'ー') { out += out.slice(-1); continue; }
    let r = BASE[c] ?? c;
    if (nx && SMALL_Y[nx]) { r = /^(shi|chi|ji)$/.test(r) ? r.slice(0, -1) + SMALL_Y[nx] : r.slice(0, -1) + 'y' + SMALL_Y[nx]; i++; }
    if (dbl) { r = (r.startsWith('ch') ? 't' : r[0]) + r; dbl = false; }
    out += r;
  }
  return out;
}

// Names keep their English spelling; a few whole phrases need word breaks.
const WHOLE: Record<string, string> = { レオ: 'Leo', メイ: 'Mei', ベン: 'Ben', ゆき: 'Yuki', やまだ: 'Yamada', わたしも: 'watashi mo', こんにちは: 'konnichiwa', こんばんは: 'konbanwa' };
const SUFFIX: [string, string][] = [['ですか', ' desu ka'], ['です', ' desu'], ['は', ' wa'], ['を', ' o'], ['の', ' no']];

/** Romaji for one run of kana, with particles split off: "わたしは" → "watashi wa". */
export function romajiOf(run: string): string {
  if (WHOLE[run]) return WHOLE[run];
  if (run === 'は') return 'wa';
  if (run === 'を') return 'o';
  if (run.endsWith('さん') && WHOLE[run.slice(0, -2)]) return `${WHOLE[run.slice(0, -2)]}-san`;
  for (const [suf, r] of SUFFIX) if (run.length > suf.length + 1 && run.endsWith(suf)) return romajiOf(run.slice(0, -suf.length)) + r;
  return plain(run);
}

/** Kana the learner has been taught: every finished kana lesson, or a whole script once its kana boss is beaten. */
export function knownKana(): Set<string> {
  const known = new Set<string>();
  for (const u of UNITS) for (const l of u.lessons) if (S.bosses[u.id] || l.id in S.done) l.kana.forEach((k) => [...k.char].forEach((c) => known.add(c)));
  return known;
}
export const ALL_KANA = new Set(LESSONS.flatMap((l) => l.kana.flatMap((k) => [...k.char])));

// Small kana count as learned along with their big form.
const FULL: Record<string, string> = { ゃ: 'や', ゅ: 'ゆ', ょ: 'よ', っ: 'つ', ぁ: 'あ', ぃ: 'い', ぅ: 'う', ぇ: 'え', ぉ: 'お', ャ: 'ヤ', ュ: 'ユ', ョ: 'ヨ', ッ: 'ツ' };
const RUN = /[ぁ-ゖァ-ヺー]+/g;

/** True when every kana in the text has been learned. */
export function readable(text: string, known = knownKana()): boolean {
  for (const c of text.match(RUN)?.join('') ?? '') if (c !== 'ー' && !known.has(FULL[c] ?? c)) return false;
  return true;
}

/** The text as the learner should see it: each kana run stays kana if learned, otherwise becomes romaji. */
const PUNCT: Record<string, string> = { '。': '. ', '、': ', ', '！': '! ', '？': '? ' };
export function rj(text: string, known = knownKana(), cap = true): string {
  let changed = false;
  // A Japanese sentence is shown all in kana or all in romaji, never half and half. English text with Japanese words mixed in is done word by word.
  const whole = !/[A-Za-z]/.test(text) && !readable(text, known);
  const out = text.replace(RUN, (run) => { if (!whole && readable(run, known)) return run; changed = true; return romajiOf(run); });
  if (!changed) return text;
  // After romaji, Japanese punctuation becomes English punctuation, and sentences start with a capital.
  const tidy = out.replace(/(?<=[a-z])[。、！？]/gi, (m) => PUNCT[m]).replace(/＿/g, ' ＿ ').replace(/ {2,}/g, ' ').trim();
  return tidy.replace(!cap ? /^$/ : /[.!?]$/.test(tidy) ? /(^|[.!?] )([a-z])/g : /([.!?] )([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

/** rj for a line split into tokens (so each word stays tappable), with spaces between romaji words. */
export function rjTokens(raws: string[], known = knownKana()): string[] {
  let prevRom = false, sofar = '';
  if (!readable(raws.join(''), known)) known = new Set();
  return raws.map((raw) => {
    let txt = rj(raw, known, false);
    const rom = txt !== raw;
    if (prevRom) txt = txt.replace(/^[。、！？]/, (m) => PUNCT[m]);
    if (raw === 'さん' && /\p{L}$/u.test(sofar)) txt = '-san';
    else if (sofar && !/\s$/.test(sofar) && (rom || prevRom) && /^\p{L}/u.test(txt)) txt = ` ${txt}`;
    if ((rom || prevRom) && (!sofar.trim() || /[.!?]\s*$/.test(sofar))) txt = txt.replace(/^(\s*)([a-z])/, (_, a: string, b: string) => a + b.toUpperCase());
    prevRom = rom || (prevRom && /^[。、！？]/.test(raw));
    sofar += txt;
    return txt;
  }).map((t, i, a) => (i === a.length - 1 ? t.trimEnd() : t));
}
