import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { S } from './state';
import { VoiceKind, clipKey } from './voiceLines';
import CLIPS from './data/voiceClips.json';
export { voiceOf } from './voiceLines';
export type { VoiceKind } from './voiceLines';

const native = Capacitor.isNativePlatform();

/** Speak Japanese text. Falls back to the browser voice when not on Android. */
/** Single kana are said as a tiny sentence ("か。") so the voice finishes the vowel instead of clipping it. */
export const speakable = (text: string) => (/^[\u3041-\u30ff]{1,2}$/.test(text) ? `${text}。` : text);

/** id is unique per voice (several Android voices can share a name like "Japanese Japan"). */
export interface JaVoice { i: number; name: string; id: string }
let voiceCache: JaVoice[] | null = null;
/** Japanese voices installed on the phone (index = position in the full list, as the TTS plugin wants). */
export async function japaneseVoices(): Promise<JaVoice[]> {
  if (voiceCache) return voiceCache;
  try {
    const all = native ? (await TextToSpeech.getSupportedVoices()).voices : speechSynthesis.getVoices();
    const ja = all.map((v, i) => ({ i, name: v.name || v.voiceURI, uri: v.voiceURI || v.name, lang: (v.lang || '').toLowerCase().replace('_', '-') })).filter((v) => v.lang.startsWith('ja'))
      .map(({ i, name, uri }, _, arr) => ({ i, name, id: arr.filter((x) => x.uri === uri).length > 1 ? `${uri}#${i}` : uri }));
    if (ja.length || native) voiceCache = ja;
    return ja;
  } catch { return []; }
}
const MALE = /jac|jad|male|otoya|ichiro|keita|daichi|kenji|naoki/i, FEMALE = /htm|jab|female|kyoko|haruka|ayumi|nanami|mizuki|o-ren|sayaka/i;
/** The voice for a character type: the one picked under Me, else a best guess from the voice names. */
export async function voiceFor(kind: VoiceKind): Promise<JaVoice | undefined> {
  const vs = await japaneseVoices();
  const picked = kind === 'm' ? S.settings.voiceM : S.settings.voiceF;
  const match = vs.filter((v) => (kind === 'm' ? MALE : FEMALE).test(v.name) && !(kind === 'm' ? FEMALE : MALE).test(v.name));
  // Online (network) voices usually sound much more natural than the offline ones.
  return vs.find((v) => v.id === picked) ?? match.find((v) => /network/i.test(v.name)) ?? match[0];
}
/** "Voice 2 · Japanese Japan": the number tells apart voices that share a name. */
export const voiceName = (v: JaVoice, all: JaVoice[]) => `Voice ${all.indexOf(v) + 1} · ${voiceLabel(v.name)}`;
export const voiceLabel = (name: string) => name.replace(/^ja-jp-x-/i, '').replace(/-(local|network)$/i, (m) => (m.includes('net') ? ' (online)' : ''));
const clips = new Set<string>(CLIPS);
let clipEl: HTMLAudioElement | null = null;
/** Play a bundled natural-voice recording of this line, if there is one. Rate 0.8 (the default) plays it as recorded. */
function playClip(text: string, kind: VoiceKind, slow: boolean): boolean {
  const key = clipKey(kind, text);
  if (!clips.has(key)) return false;
  clipEl?.pause();
  if (native) TextToSpeech.stop().catch(() => {}); else if ('speechSynthesis' in window) speechSynthesis.cancel();
  clipEl = new Audio(`voice/${key}.mp3`);
  clipEl.playbackRate = Math.min(1.5, Math.max(0.5, (S.settings.rate / 0.8) * (slow ? 0.7 : 1)));
  clipEl.play().catch(() => { clipEl = null; speakWith(text, S.settings.rate, undefined); });
  return true;
}

export async function say(raw: string, slow = false, kind: VoiceKind = 'f') {
  if (playClip(raw, kind, slow)) return;
  const text = speakable(raw);
  // Lone kana get a slightly slower rate so the vowel is held a moment longer.
  const rate = S.settings.rate * (slow ? 0.6 : 1) * (text !== raw ? 0.9 : 1);
  await speakWith(text, rate, await voiceFor(kind));
}

/** Speak with one exact voice (used by the voice sampler). Pitch stays natural: lowering it sounds robotic. */
export async function speakWith(text: string, rate = S.settings.rate, v?: JaVoice, pitch = 1) {
  try {
    clipEl?.pause();
    if (native) { await TextToSpeech.stop(); await TextToSpeech.speak({ text, lang: 'ja-JP', rate, pitch, volume: 1, ...(v ? { voice: v.i } : {}) }); return; }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP'; u.rate = rate; u.pitch = pitch;
      if (v) u.voice = speechSynthesis.getVoices()[v.i] ?? null;
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
  if (S.settings.calm) return; // Calm mode: no sounds or buzzes
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
