import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { S } from './state';

const native = Capacitor.isNativePlatform();

/** Speak Japanese text. Falls back to the browser voice when not on Android. */
/** Single kana are said as a tiny sentence ("か。") so the voice finishes the vowel instead of clipping it. */
export const speakable = (text: string) => (/^[\u3041-\u30ff]{1,2}$/.test(text) ? `${text}。` : text);

export async function say(raw: string, slow = false) {
  const text = speakable(raw);
  // Lone kana get a slightly slower rate so the vowel is held a moment longer.
  const rate = S.settings.rate * (slow ? 0.6 : 1) * (text !== raw ? 0.9 : 1);
  try {
    if (native) { await TextToSpeech.stop(); await TextToSpeech.speak({ text, lang: 'ja-JP', rate, pitch: 1, volume: 1 }); return; }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP'; u.rate = rate;
      speechSynthesis.speak(u);
    }
  } catch { /* no Japanese voice installed: stay silent */ }
}

/** True when a Japanese voice seems to be available. */
export async function hasVoice(): Promise<boolean> {
  try {
    if (native) return (await TextToSpeech.getSupportedLanguages()).languages.some((l) => l.toLowerCase().startsWith('ja'));
    return speechSynthesis.getVoices().some((v) => v.lang.startsWith('ja'));
  } catch { return false; }
}

let ctx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  ctx ||= new AudioContext();
  const t = ctx.currentTime + start, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}

export function sfx(kind: 'good' | 'bad' | 'tap' | 'win' | 'hit') {
  if (native) {
    if (kind === 'bad') Haptics.notification({ type: NotificationType.Error }).catch(() => {});
    else if (kind !== 'tap') Haptics.impact({ style: kind === 'hit' ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  }
  if (!S.settings.sfx) return;
  try {
    if (kind === 'good') { tone(660, 0, 0.12); tone(880, 0.08, 0.18); }
    else if (kind === 'bad') { tone(220, 0, 0.25, 'triangle', 0.1); }
    else if (kind === 'tap') tone(520, 0, 0.05, 'sine', 0.04);
    else if (kind === 'hit') { tone(180, 0, 0.12, 'square', 0.04); tone(520, 0.05, 0.15); }
    else [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3));
  } catch { /* audio blocked */ }
}
