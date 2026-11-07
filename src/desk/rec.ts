// Voice recordings for Study Desk ("then and now"). Uses the WebView's microphone; returns a small data URL.
const KEY = 'michi:desk-rec';
export interface Rec { url: string; day: string }
export interface Recs { first?: Rec; last?: Rec }

export const loadRecs = (): Recs => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
export const saveRec = (which: keyof Recs, r: Rec) => { const all = loadRecs(); all[which] = r; try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full */ } };
export const canRecord = () => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

/** Start recording. Call the returned stop() to finish; it resolves with a data URL (or null on failure). Stops itself after maxMs. */
export async function startRecording(maxMs = 20000): Promise<{ stop: () => Promise<string | null> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mr = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  let resolve!: (v: string | null) => void;
  const done = new Promise<string | null>((r) => { resolve = r; });
  mr.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
    if (!blob.size) return resolve(null);
    const fr = new FileReader(); fr.onload = () => resolve(String(fr.result)); fr.onerror = () => resolve(null); fr.readAsDataURL(blob);
  };
  mr.start();
  const t = setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, maxMs);
  return { stop: () => { clearTimeout(t); if (mr.state === 'recording') mr.stop(); return done; } };
}

let player: HTMLAudioElement | null = null;
export const playRec = (url: string) => { player?.pause(); player = new Audio(url); player.play().catch(() => {}); };
