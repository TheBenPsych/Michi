import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { S } from './store';
import { L } from './data/content';

const native = Capacitor.isNativePlatform();
let clip: HTMLAudioElement | null = null;

function stopAll() {
  clip?.pause(); clip = null;
  try { if (native) TextToSpeech.stop().catch(() => {}); else if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* nothing playing */ }
}
/** Play a recorded line (Nanami "f" or Keita "m"). Resolves when it ends, so screens can chain audio. */
export function sayLine(id: string, kind: 'f' | 'm' = 'f', slow = false): Promise<void> {
  stopAll();
  const voice = L[id].voices.includes(kind) ? kind : L[id].voices[0];
  return new Promise((resolve) => {
    const a = new Audio(`voice/${id}-${voice}.mp3`);
    clip = a; a.playbackRate = slow ? 0.7 : 1;
    a.onended = () => resolve(); a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}
/** Say one kana with the phone's Japanese voice. A lone kana is sent as a tiny sentence so the vowel is not clipped. */
export async function sayKana(k: string, slow = false) {
  stopAll();
  const text = `${k}。`, rate = slow ? 0.55 : 0.8;
  try {
    if (native) { await TextToSpeech.speak({ text, lang: 'ja-JP', rate, pitch: 1, volume: 1 }); return; }
    if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = rate; speechSynthesis.speak(u); }
  } catch { /* no Japanese voice installed: stay silent */ }
}

let ctx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.06) {
  ctx ||= new AudioContext();
  const t = ctx.currentTime + start, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
/** Quiet feedback sounds. Off when "Sound effects" is off. */
export function sfx(kind: 'good' | 'bad' | 'tap' | 'done') {
  if (!S.settings.sfx) return;
  if (native) {
    if (kind === 'bad') Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
    else if (kind !== 'tap') Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }
  try {
    if (kind === 'good') { tone(660, 0, 0.14); tone(880, 0.09, 0.22); }
    else if (kind === 'bad') tone(233, 0, 0.22, 'triangle', 0.07);
    else if (kind === 'tap') tone(520, 0, 0.05, 'sine', 0.03);
    else [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.35));
  } catch { /* audio blocked */ }
}
