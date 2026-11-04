import { Kana, Lesson, Unit, KANA_BY_ID } from './data/kana';

export type Q =
  | { t: 'intro'; k: Kana }
  | { t: 'pickRomaji'; k: Kana; options: string[] }
  | { t: 'pickKana'; k: Kana; options: Kana[] }
  | { t: 'listen'; k: Kana; options: Kana[] }
  | { t: 'type'; k: Kana }
  | { t: 'match'; pairs: Kana[]; mode: 'romaji' | 'script' }
  | { t: 'trace'; k: Kana };

export type Rng = () => number;
export const shuffle = <T>(a: T[], rng: Rng = Math.random): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
const sample = <T>(a: T[], n: number, rng: Rng) => shuffle(a, rng).slice(0, n);

/** Up to n-1 distractors that never share a reading or sound with the answer. */
function distractors(k: Kana, near: Kana[], far: Kana[], n: number, rng: Rng): Kana[] {
  const ok = (x: Kana) => x.id !== k.id && x.romaji !== k.romaji && x.sound !== k.sound;
  const picked: Kana[] = [];
  for (const x of [...shuffle(near.filter(ok), rng), ...shuffle(far.filter(ok), rng)]) {
    if (picked.length >= n - 1) break;
    if (!picked.some((p) => p.romaji === x.romaji || p.sound === x.sound)) picked.push(x);
  }
  return picked;
}

function mcFor(t: 'pickRomaji' | 'pickKana' | 'listen', k: Kana, near: Kana[], far: Kana[], rng: Rng): Q {
  const opts = shuffle([k, ...distractors(k, near, far, 4, rng)], rng);
  return t === 'pickRomaji' ? { t, k, options: opts.map((o) => o.romaji) } : { t, k, options: opts };
}

/** Builds the question queue for a lesson. `known` = kana learned in earlier lessons of the same script. */
export function buildLesson(lesson: Lesson, known: Kana[], rng: Rng = Math.random): Q[] {
  const fresh = lesson.kana;
  const q: Q[] = [];
  // Teach in small groups of up to 5: intro + immediate check for each.
  for (const k of fresh) { q.push({ t: 'intro', k }); q.push(mcFor('pickRomaji', k, fresh, known, rng)); }
  if (lesson.trace) for (const k of sample(fresh, Math.min(3, fresh.length), rng)) q.push({ t: 'trace', k });

  const drill: Q[] = [];
  const types: ('pickKana' | 'listen' | 'type' | 'pickRomaji')[] = ['pickKana', 'listen', 'type'];
  const focus = fresh.length > 6 ? sample(fresh, 8, rng) : fresh;
  for (const k of focus) for (const t of sample(types, fresh.length > 6 ? 1 : 2, rng)) drill.push(t === 'type' ? { t, k } : mcFor(t, k, fresh, known, rng));
  // A few review questions on earlier kana.
  for (const k of sample(known, Math.min(3, known.length), rng)) drill.push(mcFor(rng() < 0.5 ? 'listen' : 'pickKana', k, known, fresh, rng));

  const out = [...q, ...shuffle(drill, rng)];
  // Match round about two-thirds of the way through.
  const pairs = sample(fresh, Math.min(5, fresh.length), rng);
  const mode = lesson.unit === 'kata' && rng() < 0.5 ? 'script' : 'romaji';
  out.splice(Math.floor(out.length * 0.66), 0, { t: 'match', pairs, mode });
  return out;
}

/** Boss fight: 20 quick questions over the whole unit. */
export function buildBoss(unit: Unit, rng: Rng = Math.random, n = 20): Q[] {
  const all = unit.lessons.flatMap((l) => l.kana);
  const types = ['pickRomaji', 'pickKana', 'listen', 'type'] as const;
  return sample(all, n, rng).map((k, i) => {
    const t = types[i % 4];
    return t === 'type' ? { t, k } : mcFor(t, k, all, [], rng);
  });
}

/** Builds a quiz Q for a kana id (used to re-ask missed questions in a fresh form). */
export const kanaOf = (q: Q): Kana | undefined => ('k' in q ? q.k : undefined);
export const isAnswer = (k: Kana, typed: string) => {
  const s = typed.trim().toLowerCase().replace(/\s+/g, '');
  return s === k.romaji || k.alts.includes(s);
};
export const hiraOf = (k: Kana) => KANA_BY_ID.get(`h:${[...k.char].map((c) => String.fromCharCode(c.charCodeAt(0) - 0x60)).join('')}`);

/** A fresh question on the same kana, used to re-ask after a mistake. */
export function retryQ(k: Kana, pool: Kana[], rng: Rng = Math.random): Q {
  const t = (['pickKana', 'listen', 'type', 'pickRomaji'] as const)[Math.floor(rng() * 4)];
  return t === 'type' ? { t, k } : mcFor(t, k, pool, [], rng);
}
/** Quick practice over learned kana (no new material). */
export function buildPractice(pool: Kana[], rng: Rng = Math.random, n = 12): Q[] {
  const ks = sample(pool, Math.min(n, pool.length), rng);
  const qs: Q[] = ks.map((k) => retryQ(k, pool, rng));
  if (ks.length >= 4) qs.splice(Math.floor(qs.length / 2), 0, { t: 'match', pairs: ks.slice(0, 5), mode: 'romaji' });
  return qs;
}
