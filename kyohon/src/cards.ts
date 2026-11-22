/** Every kind of lesson card. Each one asks the learner to do something: hear, say, write, spell or choose. */
import { h, jp, ic } from './ui';
import { Card, Run, fb } from './engine';
import { ill, av, SPEAKER } from './art';
import { sayLine, sayKana, sfx } from './audio';
import { L, Scene, phrase, word, PHRASES } from './data/content';
import { ALL, kanaOf } from './data/kana';
import { S, knows, meet, learnKana } from './store';
import { strokeAnim, strokesOf } from './strokes';
import { writePad } from './pad';
import { canListen, listenJa, heardWord } from './speech';

export const shuffle = <T>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const pick = <T>(a: T[], n: number) => shuffle(a).slice(0, n);

const playBtn = (fn: () => void, label = '▶', cls = '') => h('button', { class: `play ${cls}`, 'aria-label': label === '▶' ? 'Play' : 'Play slowly', onclick: fn }, label);
/** Japanese with romaji under any chunk that has a letter the learner has not been taught. Taught letters are in ink. */
export function rl(id: string): HTMLElement {
  return h('div', { class: 'rl', lang: 'ja' }, ...L[id].chunks.map(([ja, ro]) => {
    const all = [...ja].every(knows);
    return h('span', null, h('span', { style: { flexDirection: 'row' } }, ...[...ja].map((c) => (knows(c) ? c : h('i', null, c)))), h('small', { lang: 'en' }, all ? '' : ro));
  }));
}
const audioRow = (id: string) => h('div', { class: 'row c' }, playBtn(() => sayLine(id)), playBtn(() => sayLine(id, 'f', true), '½'));

/** Hear a phrase, see when it is used, say it aloud. */
export const hear = (id: string): Card => ({
  tag: 'listen',
  build(run, body) {
    const p = phrase(id);
    body.append(ill(p.scene), h('p', { class: 'hint c' }, p.when), rl(id), h('p', { class: 'p c' }, h('b', null, L[id].en)), audioRow(id), h('p', { class: 'hint c' }, 'Listen, then say it aloud.'));
    sayLine(id); meet(`p:${id}`);
    run.footer('I said it', run.next);
  },
});

export interface Opt { label?: string; jp?: string; scene?: Scene; small?: string; ok?: boolean; play?: () => void }
export interface PickSpec { item?: string; prompt: string; audio?: () => void; big?: string; opts: Opt[]; ok: string; no: string; delay?: boolean; note?: { title: string; text: string }; cols?: 1 | 2 | 3; pre?: () => Node }
/** Choose one of two or three answers. With delay, the choices appear a moment later so the learner recalls first. */
export const choose = (s: PickSpec): Card => ({
  item: s.item,
  tag: s.big ? 'read' : 'listen',
  build(run, body) {
    const opts = shuffle(s.opts), cols = s.cols ?? (opts.length === 2 ? 2 : 3);
    const grid = h('div', { class: `opts ${cols === 1 ? 'one' : cols === 2 ? 'two' : ''} ${s.delay ? 'wait' : ''}` });
    if (s.note) body.append(h('div', { class: 'note' }, h('h4', null, s.note.title), h('p', null, s.note.text)));
    body.append(h('p', { class: 'p' }, s.prompt));
    if (s.pre) body.append(s.pre());
    if (s.audio) { body.append(h('div', { class: 'row c' }, playBtn(s.audio))); s.audio(); }
    if (s.big) body.append(h('div', { class: `kbig jp ${[...s.big].length > 1 ? 'two' : ''}`, lang: 'ja' }, s.big));
    opts.forEach((o) => {
      const b = h('button', { class: `opt ${o.jp ? 'jp' : ''}`, lang: o.jp ? 'ja' : null, onclick: () => {
        grid.classList.add('done');
        b.classList.add(o.ok ? 'ok' : 'no');
        if (!o.ok) [...grid.children][opts.findIndex((x) => x.ok)]?.classList.add('ok');
        run.answer(!!o.ok, o.ok ? s.ok : s.no, { undo: true });
      } }, o.scene ? ill(o.scene) : null, o.jp ?? o.label ?? '', o.small ? h('small', null, o.small) : null);
      grid.append(b);
    });
    body.append(grid);
    if (s.delay) setTimeout(() => grid.classList.remove('wait'), 1400);
    run.footer('Next', run.next, false);
  },
});

/** Meet one letter: its shape, its sound and one short memory hook. */
export const meetKana = (k: string): Card => ({
  tag: 'read',
  build(run, body) {
    const d = kanaOf(k);
    body.append(h('div', { class: 'kbig jp', lang: 'ja' }, k), h('p', { class: 'p c' }, h('b', null, d.r), d.sound ? ` · ${d.sound}` : ''),
      h('div', { class: 'row c' }, playBtn(() => sayKana(k)), playBtn(() => sayKana(k, true), '½')),
      h('div', { class: 'note' }, h('p', null, h('b', null, 'Memory hook. '), d.hook)));
    sayKana(k); learnKana([k]);
    run.footer('Write it', run.next);
  },
});

/** Write a letter. "trace" shows the strokes being drawn first and a faint guide; "free" is from memory and is graded. */
export const writeKana = (k: string, mode: 'trace' | 'free'): Card => ({
  tag: 'read',
  item: mode === 'free' ? `k:${k}` : undefined,
  build(run, body) {
    const d = kanaOf(k), n = strokesOf(k).length, strokesWord = `${n} stroke${n === 1 ? '' : 's'}`;
    const practise = (guide: boolean) => {
      body.replaceChildren();
      let tried = false;
      const pad = writePad(k, guide, () => run.enable(true));
      const slot = h('div', null);
      const again = () => { pad.clear(); slot.replaceChildren(); run.footer('Check my writing', check, false); };
      const check = () => {
        const v = pad.check();
        slot.replaceChildren();
        if (v.ok) { if (mode === 'free' && !tried) run.answer(true, v.msg); else { sfx('good'); slot.append(fb(true, v.msg)); run.footer('Next', run.next); } return; }
        if (mode === 'free' && !tried) { tried = true; run.answer(false, v.msg); slot.append(fb(false, v.msg)); } else { sfx('bad'); slot.append(fb(false, v.msg)); }
        run.footer('Try again', again);
      };
      body.append(h('p', { class: 'p' }, guide ? 'Trace ' : 'Now write ', h('b', null, d.r), guide ? `. ${strokesWord}, in order.` : ` from memory. ${strokesWord}.`), pad.el, slot,
        h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: watch }, 'Watch the strokes'), h('button', { class: 'btn ghost', onclick: again }, 'Clear')));
      run.footer('Check my writing', check, false);
    };
    const watch = () => {
      body.replaceChildren(h('p', { class: 'p' }, 'Watch how ', h('b', null, d.r), ` is written. ${strokesWord}.`), strokeAnim(k), h('p', { class: 'hint c' }, 'Tap the letter to watch again.'));
      run.footer('My turn', () => practise(mode === 'trace'));
    };
    if (mode === 'trace') watch(); else practise(false);
  },
});

/** Words made only of letters the learner knows. Tap to hear. */
export const showWords = (ids: string[], lead = 'You can already read real words. Tap each one to hear it.'): Card => ({
  tag: 'read',
  build(run, body) {
    body.append(h('p', { class: 'p' }, lead), h('div', { class: 'wg' }, ...ids.map((id) => {
      meet(`w:${id}`);
      return h('button', { class: 'wc', onclick: () => sayLine(id) }, ill(word(id).scene), h('b', { lang: 'ja' }, L[id].ja), h('small', null, L[id].en), h('span', { class: 'pb' }, ic('sound', '')));
    })));
    run.footer('Next', run.next);
  },
});

/** Spell a word by tapping kana tiles, from its picture or from its sound. */
export const spell = (id: string, cue: 'pic' | 'audio'): Card => ({
  item: `w:${id}`,
  tag: 'read',
  build(run, body) {
    const target = L[id].ja, letters = [...target];
    const extra = pick(S.kana.filter((k) => !letters.includes(k)), Math.max(0, 5 - letters.length));
    let built = '', locked = false;
    const line = h('div', { class: 'built jp', lang: 'ja', 'aria-live': 'polite' });
    const press = (k: string) => {
      if (locked) return;
      sfx('tap');
      built = k === '⌫' ? [...built].slice(0, -1).join('') : built + k;
      line.textContent = built;
      if ([...built].length === letters.length) {
        locked = true;
        const ok = built === target;
        if (ok && cue === 'pic') sayLine(id);
        run.answer(ok, ok ? `Correct. ${target} · ${L[id].en}` : `The word is ${target} (${L[id].en}).`, { undo: true });
      }
    };
    if (cue === 'pic') body.append(h('p', { class: 'p' }, 'Spell ', h('b', null, L[id].en), '.'), ill(word(id).scene, 'sm'));
    else { body.append(h('p', { class: 'p' }, 'Listen, then spell what you hear.'), h('div', { class: 'row c' }, playBtn(() => sayLine(id)), playBtn(() => sayLine(id, 'f', true), '½'))); sayLine(id); }
    body.append(line, h('div', { class: 'tiles' }, ...shuffle([...letters, ...extra]).map((k) => h('button', { class: 'tile', lang: 'ja', onclick: () => press(k) }, k)), h('button', { class: 'tile', 'aria-label': 'Delete', onclick: () => press('⌫') }, '⌫')));
    run.footer('Next', run.next, false);
  },
});

const ALT: Record<string, string[]> = { shi: ['si'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], n: ['nn'], o: ['wo'] };
export const romajiOk = (kana: string, typed: string) => {
  const t = typed.toLowerCase().replace(/[^a-z]/g, '');
  const walk = (i: number, rest: string): boolean => {
    if (i === [...kana].length) return rest === '';
    const r = kanaOf([...kana][i]).r;
    return [r, ...(ALT[r] ?? [])].some((x) => rest.startsWith(x) && walk(i + 1, rest.slice(x.length)));
  };
  return walk(0, t);
};
/** Type the sound of one or more kana in English letters. */
export const typeSound = (kana: string, o: { item?: string; skip?: (run: Run) => void; onResult?: (ok: boolean) => void } = {}): Card => ({
  item: o.item,
  tag: 'read',
  build(run, body) {
    const many = [...kana].length > 1, want = [...kana].map((k) => kanaOf(k).r).join(' ');
    const input = h('input', { class: 'in', type: 'text', autocapitalize: 'none', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', placeholder: many ? 'for example: a ka' : 'for example: ka', 'aria-label': 'The sound in English letters' });
    const check = () => {
      if (!input.value.trim()) return;
      const ok = romajiOk(kana, input.value);
      input.disabled = true; o.onResult?.(ok);
      const like = !many && kanaOf(kana).like;
      run.answer(ok, ok ? `Correct. ${kana} is ${want}.` : `This is ${want}.${like ? ` It is easy to mix up with ${like}.` : ''}`, { undo: !o.onResult });
    };
    input.addEventListener('input', () => run.enable(!!input.value.trim()));
    input.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter' && !input.disabled) check(); });
    body.append(h('p', { class: 'p' }, many ? 'Type the sounds, in order.' : 'Type the sound.'), h('div', { class: `kbig jp ${many ? 'two' : ''}`, lang: 'ja' }, kana), h('div', { class: 'row' }, input));
    if (o.skip) body.append(h('button', { class: 'link c', onclick: () => o.skip!(run) }, 'I don’t know this one'));
    run.footer('Check', check, false);
  },
});

export interface SaySpec { id: string; cue: string; scene?: Scene; text?: boolean; partner?: { id: string; who: string }; item?: string }
/** Say a phrase or word aloud. The phone shows what it heard; it never blocks, and the learner can overrule it. */
export const sayIt = (s: SaySpec): Card => ({
  item: s.item,
  tag: 'speak',
  build(run, body) {
    const slot = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }), hintSlot = h('div', null);
    const model = () => sayLine(s.id);
    body.append(h('p', { class: 'p' }, s.cue));
    if (s.scene) body.append(ill(s.scene));
    if (s.partner) {
      body.append(h('div', { class: 'dl' }, av('m'), h('div', null, h('div', { class: 'who' }, `${s.partner.who} · ${SPEAKER.m}`), h('div', { class: 'ja' }, rl(s.partner.id))), playBtn(() => sayLine(s.partner!.id, 'm'), '▶', 'sm')));
      sayLine(s.partner.id, 'm');
    }
    if (s.text) body.append(rl(s.id), h('p', { class: 'hint c' }, L[s.id].en));
    else body.append(hintSlot, h('button', { class: 'link c', onclick: () => { hintSlot.replaceChildren(rl(s.id), h('p', { class: 'hint c' }, L[s.id].en)); } }, 'Hint'));
    const selfReport = () => {
      body.append(h('div', { class: 'row c' }, h('button', { class: 'btn ghost', onclick: model }, 'Hear the model')), h('p', { class: 'hint c' }, 'Say it aloud, then compare with the model.'));
      run.footer('I said it', run.next);
    };
    canListen().then((can) => {
      if (!can || !S.settings.speech) return selfReport();
      let tries = 0, answered = false;
      const mic = h('button', { class: 'rec', 'aria-label': 'Tap and speak' }, ic('mic', ''), h('span', { class: 'lbl' }, 'Tap and speak'));
      const finish = (ok: boolean, msg: string) => { if (answered) return; answered = true; mic.parentElement?.remove(); run.answer(ok, msg); };
      mic.addEventListener('click', async () => {
        if (mic.classList.contains('live')) return;
        mic.classList.add('live'); mic.lastChild!.textContent = 'Listening…'; slot.replaceChildren();
        let heard: string[] = [];
        try { heard = await Promise.race([listenJa(), new Promise<string[]>((r) => setTimeout(() => r([]), 9000))]); } catch { mic.classList.remove('live'); mic.parentElement?.remove(); slot.replaceChildren(h('p', { class: 'hint c' }, 'The microphone is not available, so this one is on your honour.')); return selfReport(); }
        mic.classList.remove('live'); mic.lastChild!.textContent = 'Tap and speak'; tries++;
        const ok = heardWord(heard, L[s.id].heard);
        slot.replaceChildren(h('div', { class: 'res' }, h('span', { class: 'ey' }, 'The phone heard'), h('span', { class: 'big', lang: 'ja' }, heard[0] || '(nothing clear)')));
        if (ok) return finish(true, 'That matches. You were understood.');
        slot.append(fb(false, heard[0] ? 'That is not quite what was expected. Listen to the model and try again.' : 'Nothing clear came through. Hold the phone closer and try again.'),
          h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: model }, 'Hear the model')),
          h('button', { class: 'link c', onclick: () => { slot.replaceChildren(); finish(true, 'Noted. You said it correctly.'); } }, 'I said it correctly'));
        sfx('bad');
        if (tries >= 1) run.footer('Move on', () => { if (!answered && s.item) { answered = true; } run.next(); });
      });
      body.append(h("div", { class: "recwrap" }, mic), slot);
      run.footer('Next', run.next, false);
    });
  },
});

/* ---------- questions built from what the learner knows ---------- */
const kanaDistractors = (k: string, n = 2): string[] => {
  const like = kanaOf(k).like, pool = (S.kana.length >= 3 ? S.kana : ALL.slice(0, 5).map((x) => x.k)).filter((x) => x !== k && x !== like);
  const out = like && (knows(like) || S.kana.length < 3) ? [like] : [];
  return [...out, ...pick(pool, n)].slice(0, n);
};
const likeNote = (k: string) => { const d = kanaOf(k); return d.like ? ` ${d.hook}` : ''; };
/** See a letter, recall its sound, then choose. */
export const recallSound = (k: string): Card => {
  const d = kanaOf(k), rs = [...new Set(kanaDistractors(k).map((x) => kanaOf(x).r).filter((r) => r !== d.r))];
  return choose({ item: `k:${k}`, prompt: 'Say the sound to yourself first. Then choose.', big: k, delay: true,
    opts: [{ label: d.r, ok: true }, ...rs.map((r) => ({ label: r }))], ok: `Correct. ${k} is ${d.r}.`, no: `This one is ${d.r}.${likeNote(k)}` });
};
/** Hear a sound, choose the letter. */
export const recallLetter = (k: string): Card => {
  const d = kanaOf(k);
  return choose({ item: `k:${k}`, prompt: 'Listen. Which letter is it?', audio: () => sayKana(k),
    opts: [{ jp: k, ok: true }, ...kanaDistractors(k).map((x) => ({ jp: x }))], ok: `Correct. ${k} is ${d.r}.`, no: `That sound is ${d.r}, written ${k}.${likeNote(k)}` });
};
const others = (id: string, pool: string[]) => pick(pool.filter((x) => x !== id), 2);
/** Hear a phrase, choose when it is used. */
export const whenPhrase = (id: string, pool: string[]): Card => {
  const p = phrase(id), o = (x: string, ok = false): Opt => ({ scene: phrase(x).scene, small: phrase(x).when, ok });
  return choose({ item: `p:${id}`, prompt: 'Listen. When would you say this?', audio: () => sayLine(id), cols: 3,
    opts: [o(id, true), ...others(id, pool).map((x) => o(x))], ok: `Correct. That was ${L[id].chunks.map((c) => c[1]).join(' ')}: ${L[id].en.toLowerCase()}.`, no: `That was ${L[id].chunks.map((c) => c[1]).join(' ')}. ${p.when}.` });
};
const roma = (id: string) => { const r = L[id].chunks.map((c) => c[1]).join(' '); return r[0].toUpperCase() + r.slice(1); };
/** See a situation, choose what to say. */
export const whichPhrase = (id: string, pool: string[]): Card => {
  const p = phrase(id);
  return choose({ item: `p:${id}`, prompt: p.cue, pre: () => ill(p.scene), cols: 1,
    opts: [{ label: roma(id), ok: true }, ...others(id, pool).map((x) => ({ label: roma(x) }))], ok: `Correct. ${roma(id)}.`, no: `Here you would say ${roma(id)}.` });
};
/** One review question for any item, used by the warm-up and by practice. */
export function quizFor(item: string): Card | null {
  const [kind, id] = item.split(':');
  if (kind === 'k') return Math.random() < 0.5 ? recallSound(id) : recallLetter(id);
  if (kind === 'w') return [...L[id].ja].every(knows) ? spell(id, Math.random() < 0.5 ? 'pic' : 'audio') : null;
  if (kind === 'p') { const pool = PHRASES.map((p) => p.id).filter((x) => S.items[`p:${x}`]); return pool.length >= 3 ? (Math.random() < 0.5 ? whenPhrase(id, pool) : whichPhrase(id, pool)) : null; }
  return null;
}
