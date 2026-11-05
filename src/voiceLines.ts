// Character lines that ship as pre-recorded natural voice clips (public/voice/*.mp3).
import { COURSE, Token } from './data/course';

export type VoiceKind = 'f' | 'm';
/** Characters with a male voice. Everyone else, and words on their own, use the female voice. */
export const voiceOf = (who: string): VoiceKind => (/^(Leo|Ben|Tanuki)$/i.test(who) ? 'm' : 'f');
export const lineText = (ts: Token[]) => ts.map((t) => (typeof t === 'string' ? t : t[0])).join('');

/** Stable file name for a clip: FNV-1a hash of voice + text. */
export function clipKey(kind: VoiceKind, text: string): string {
  let h = 0x811c9dc5;
  for (const ch of `${kind}|${text}`) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; }
  return `${kind}-${h.toString(16).padStart(8, '0')}`;
}

/** Every spoken character line in the course (story panels, mission chats, the player's replies). */
export function characterLines(): { kind: VoiceKind; text: string }[] {
  const out = new Map<string, { kind: VoiceKind; text: string }>();
  const add = (who: string, text: string) => { const kind = voiceOf(who); out.set(clipKey(kind, text), { kind, text }); };
  for (const u of COURSE) for (const p of u.parts) for (const s of p.stops) {
    if (s.kind === 'story' || s.kind === 'speak') s.story.panels.forEach((pn) => pn.lines.forEach((l) => add(l.who, lineText(l.tokens))));
    if (s.kind === 'mission') s.m.steps.forEach((st) => ('npc' in st ? add(s.m.npc, st.npc) : st.choices.filter((c) => c.ok).forEach((c) => add('Ben', c.jp))));
  }
  return [...out.values()];
}
