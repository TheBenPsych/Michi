import { describe, it, expect } from 'vitest';
import { existsSync, writeFileSync } from 'node:fs';
import { characterLines, clipKey } from '../src/voiceLines';
import clips from '../src/data/voiceClips.json';

describe('voice clips', () => {
  const lines = characterLines();
  // `GEN_VOICE=1 npx vitest run tests/voice.test.ts` writes the list for scripts/voice.py to record.
  if (process.env.GEN_VOICE) writeFileSync('voice-lines.json', JSON.stringify(lines.map((l) => ({ ...l, key: clipKey(l.kind, l.text) })), null, 1));
  it('every character line has a recorded clip', () => {
    const missing = lines.filter((l) => !clips.includes(clipKey(l.kind, l.text)) || !existsSync(`public/voice/${clipKey(l.kind, l.text)}.mp3`));
    expect(missing).toEqual([]);
  });
});
