// Speech recognition for "say it" reviews: the Android recognizer on the phone, the browser's in a web preview.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const native = Capacitor.isNativePlatform();
type WebRec = { lang: string; maxAlternatives: number; onresult: (e: { results: { length: number; [i: number]: { transcript: string } }[] }) => void; onerror: () => void; onend: () => void; start: () => void };
const W0 = typeof window === 'undefined' ? {} : window;
const WebSR = (W0 as unknown as { webkitSpeechRecognition?: new () => WebRec; SpeechRecognition?: new () => WebRec }).webkitSpeechRecognition
  ?? (W0 as unknown as { SpeechRecognition?: new () => WebRec }).SpeechRecognition;

let cached: boolean | null = null;
export async function canListen(): Promise<boolean> {
  if (cached != null) return cached;
  try { cached = native ? (await SpeechRecognition.available()).available : !!WebSR; } catch { cached = false; }
  return cached;
}

/** Listen once in Japanese. Resolves with what the recognizer heard (best guesses first). */
export async function listenJa(): Promise<string[]> {
  if (native) {
    const p = await SpeechRecognition.checkPermissions().catch(() => ({ speechRecognition: 'prompt' }));
    if (p.speechRecognition !== 'granted') {
      const r = await SpeechRecognition.requestPermissions();
      if (r.speechRecognition !== 'granted') throw new Error('mic');
    }
    const res = await SpeechRecognition.start({ language: 'ja-JP', maxResults: 5, partialResults: false, popup: false });
    return res.matches ?? [];
  }
  return new Promise((resolve, reject) => {
    if (!WebSR) return reject(new Error('none'));
    const r = new WebSR(); let got: string[] = [];
    r.lang = 'ja-JP'; r.maxAlternatives = 5;
    r.onresult = (e) => { const alt = e.results[0]; got = Array.from({ length: alt.length }, (_, i) => alt[i].transcript); };
    r.onerror = () => resolve(got); r.onend = () => resolve(got);
    r.start();
  });
}

const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const clean = (s: string) => toHira(s).replace(/[\s。、！？!?.,〜ー・「」]/g, '');
/** Did any of the heard phrases contain the word (kana or kanji spelling)? */
export const heardWord = (heard: string[], spellings: string[]) => {
  const want = spellings.filter(Boolean).map(clean);
  return heard.some((x) => { const c = clean(x); return want.some((w) => c === w || c.includes(w)); });
};
