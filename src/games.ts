import { Kana } from './data/kana';
import { Q, isAnswer, shuffle, hiraOf } from './lessonGen';
import { h, svgEl, jp } from './ui';
import { say, sfx } from './audio';
import { strokeAnim, strokesOf, VIEW } from './strokes';

export interface Result { ok: boolean; neutral?: boolean; k?: Kana; note?: string }
export interface Game { eyebrow: string; title: string; el: HTMLElement; autoNext?: boolean }
type Done = (r: Result) => void;

const SPEAKER = () => {
  const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  s.appendChild(svgEl('path', { d: 'M4 9v6h4l5 4V5L8 9H4z' }));
  s.appendChild(svgEl('path', { d: 'M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12' }));
  return s;
};
export const soundBtn = (k: Kana, label = 'Play sound') => h('button', { class: 'soundbtn', onclick: () => say(k.sound) }, SPEAKER(), label);

/** Explains where a kana comes from: dakuten, combos and katakana partners. */
function origin(k: Kana): string | null {
  const parts: string[] = [];
  const nfd = [...k.char.normalize('NFD')];
  if (k.char.length === 2) parts.push(`${k.char[0]} + small ${k.char[1]} blend into one beat.`);
  else if (nfd.length === 2) parts.push(`${nfd[0]} plus ${nfd[1] === '゙' ? 'two marks ゛' : 'a circle ゜'} makes ${k.romaji}.`);
  if (k.script === 'k') { const hk = hiraOf(k); if (hk) parts.push(`Hiragana partner: ${hk.char}`); }
  if (k.char === 'を') parts.push('Said "o". Used almost only as a grammar particle.');
  if (k.char === 'ぢ' || k.char === 'づ') parts.push('Sounds just like じ / ず, and is much rarer.');
  return parts.length ? parts.join(' ') : null;
}

export function intro(k: Kana, done: Done): Game {
  setTimeout(() => say(k.sound), 250);
  const o = origin(k);
  return {
    eyebrow: 'New kana', title: `Meet ${k.char}`,
    el: h('div', { class: 'center' },
      jp(k.char, `bigkana ${k.char.length > 1 ? 'multi' : ''}`),
      h('div', { style: { fontSize: '30px', fontWeight: '800', color: 'var(--tint-ink)' } }, k.romaji),
      soundBtn(k),
      strokesOf(k.char[0]).length ? strokeAnim(k.char) : null,
      h('div', { class: 'small' }, 'Tap the strokes to replay them.'),
      o ? h('div', { class: 'sub' }, o) : null,
      h('button', { class: 'btn', style: { marginTop: '8px' }, onclick: () => done({ ok: true, neutral: true }) }, 'Got it')),
  };
}

function choice(q: Extract<Q, { t: 'pickRomaji' | 'pickKana' | 'listen' }>, done: Done): Game {
  const k = q.k;
  const labels = q.t === 'pickRomaji' ? q.options : q.options.map((o) => o.char);
  const right = q.t === 'pickRomaji' ? k.romaji : k.char;
  let answered = false;
  const btns = labels.map((lab) => h('button', {
    class: `opt ${q.t === 'pickRomaji' ? '' : 'kana'}`, lang: q.t === 'pickRomaji' ? 'en' : 'ja',
    onclick: (e: Event) => {
      if (answered) return; answered = true;
      const b = e.currentTarget as HTMLElement, ok = lab === right;
      b.classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake');
      btns.forEach((x, i) => { if (labels[i] === right) x.classList.add('ok'); x.setAttribute('disabled', ''); });
      say(k.sound);
      done({ ok, k });
    },
  }, lab));
  const grid = h('div', { class: 'opts' }, btns);
  if (q.t === 'listen') {
    setTimeout(() => say(k.sound), 300);
    return {
      eyebrow: 'Listen', title: 'Tap what you hear',
      el: h('div', { class: 'stage' },
        h('button', { class: 'play', 'aria-label': 'Play the sound again', onclick: () => say(k.sound) }, SPEAKER()),
        h('div', { class: 'center' }, h('button', { class: 'linkbtn', onclick: () => say(k.sound, true) }, 'Play it slowly')),
        grid),
    };
  }
  if (q.t === 'pickKana') return { eyebrow: 'Pick the kana', title: `Which one is "${k.romaji}"?`, el: h('div', { class: 'stage' }, h('div', { class: 'bigkana', style: { fontSize: '72px', fontWeight: '800', color: 'var(--tint-ink)' } }, k.romaji), grid) };
  return { eyebrow: 'Read it', title: 'What sound is this?', el: h('div', { class: 'stage' }, jp(k.char, `bigkana ${k.char.length > 1 ? 'multi' : ''}`), grid) };
}

function typeIt(k: Kana, done: Done): Game {
  const input = h('input', { class: 'typein', type: 'text', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'done', 'aria-label': 'Type the reading in English letters', placeholder: 'type in romaji' });
  let answered = false;
  const check = h('button', { class: 'btn', disabled: true }, 'Check');
  const submit = () => {
    if (answered || !input.value.trim()) return; answered = true;
    const ok = isAnswer(k, input.value);
    input.classList.add(ok ? 'ok' : 'no', ok ? 'pop' : 'shake'); input.readOnly = true; check.remove();
    say(k.sound); input.blur();
    done({ ok, k });
  };
  input.addEventListener('input', () => { check.disabled = !input.value.trim(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  check.addEventListener('click', submit);
  setTimeout(() => input.focus(), 200);
  return { eyebrow: 'Type the reading', title: 'How do you read this?', el: h('div', { class: 'stage' }, jp(k.char, `bigkana ${k.char.length > 1 ? 'multi' : ''}`), input, check) };
}

function match(q: Extract<Q, { t: 'match' }>, done: Done): Game {
  const n = q.pairs.length;
  const label = (k: Kana) => (q.mode === 'script' ? hiraOf(k)?.char ?? k.romaji : k.romaji);
  const left = shuffle(q.pairs), right = shuffle(q.pairs);
  let selL: [Kana, HTMLElement] | null = null, selR: [Kana, HTMLElement] | null = null, matched = 0, mistakes = 0;
  const pick = (side: 'L' | 'R', k: Kana, b: HTMLElement) => {
    if (b.hasAttribute('disabled')) return;
    sfx('tap');
    if (side === 'L') { selL?.[1].classList.remove('sel'); selL = [k, b]; say(k.sound); } else { selR?.[1].classList.remove('sel'); selR = [k, b]; }
    b.classList.add('sel');
    if (!selL || !selR) return;
    const [a, ab] = selL, [c, cb] = selR; selL = selR = null;
    ab.classList.remove('sel'); cb.classList.remove('sel');
    if (a.id === c.id) {
      for (const x of [ab, cb]) { x.classList.add('ok', 'pop'); x.setAttribute('disabled', ''); }
      sfx('good');
      if (++matched === n) setTimeout(() => done({ ok: true, neutral: true, note: mistakes ? `Matched with ${mistakes} slip${mistakes > 1 ? 's' : ''}` : 'Perfect match!' }), 350);
    } else {
      mistakes++; sfx('bad');
      for (const x of [ab, cb]) { x.classList.add('no', 'shake'); setTimeout(() => x.classList.remove('no', 'shake'), 450); }
    }
  };
  const cells: HTMLElement[] = [];
  for (let i = 0; i < n; i++) {
    const L = left[i], R = right[i];
    cells.push(h('button', { class: 'opt kana', lang: 'ja', onclick: (e: Event) => pick('L', L, e.currentTarget as HTMLElement) }, L.char));
    cells.push(h('button', { class: `opt ${q.mode === 'script' ? 'kana' : ''}`, onclick: (e: Event) => pick('R', R, e.currentTarget as HTMLElement) }, label(R)));
  }
  return { eyebrow: 'Match pairs', title: q.mode === 'script' ? 'Match katakana to hiragana' : 'Tap each kana and its sound', el: h('div', { class: 'opts', style: { flex: '1' } }, cells), autoNext: true };
}

/** Trace each stroke in order over a faint guide. Strokes are checked against KanjiVG paths. */
export function trace(k: Kana, done: Done): Game {
  const ds = strokesOf(k.char);
  const box = h('div', { class: 'trace', 'aria-label': `Trace ${k.char}` });
  const svg = svgEl('svg', { viewBox: `0 0 ${VIEW} ${VIEW}`, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 7 });
  for (const [x1, y1, x2, y2] of [[54.5, 4, 54.5, 105], [4, 54.5, 105, 54.5]]) svg.appendChild(svgEl('line', { x1, y1, x2, y2, class: 'gridl', 'stroke-width': 0.8 }));
  const paths = ds.map((d) => { const p = svgEl('path', { d, class: 'g' }) as SVGPathElement; svg.appendChild(p); return p; });
  const startDot = svgEl('circle', { r: 4.5, class: 'start' });
  svg.appendChild(startDot);
  const canvas = h('canvas');
  box.append(svg, canvas);
  const status = h('div', { class: 'sub', style: { textAlign: 'center', marginTop: '0' } }, `Stroke 1 of ${ds.length}. Start at the dot.`);
  let cur = 0, fails = 0, helped = 0;
  let hint: SVGPathElement | null = null;

  const sample = (p: SVGPathElement, n: number) => { const L = p.getTotalLength(); return Array.from({ length: n }, (_, i) => { const pt = p.getPointAtLength((L * i) / (n - 1)); return [pt.x, pt.y]; }); };
  const resample = (pts: number[][], n: number) => {
    const seg = [0]; for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = seg.at(-1)!, out: number[][] = []; let j = 0;
    for (let i = 0; i < n; i++) {
      const t = (L * i) / (n - 1); while (j < seg.length - 2 && seg[j + 1] < t) j++;
      const f = seg[j + 1] === seg[j] ? 0 : (t - seg[j]) / (seg[j + 1] - seg[j]);
      out.push([pts[j][0] + f * (pts[j + 1][0] - pts[j][0]), pts[j][1] + f * (pts[j + 1][1] - pts[j][1])]);
    }
    return out;
  };
  const show = () => {
    paths.forEach((p, i) => p.setAttribute('class', i < cur ? 'done' : i === cur ? 'next' : 'g'));
    if (cur < ds.length) { const p0 = paths[cur].getPointAtLength(0); startDot.setAttribute('cx', String(p0.x)); startDot.setAttribute('cy', String(p0.y)); }
    else startDot.remove();
  };
  const showHint = () => {
    hint?.remove();
    hint = svgEl('path', { d: ds[cur], class: 'hint', pathLength: 1 }) as SVGPathElement;
    svg.insertBefore(hint, startDot);
  };
  const advance = () => {
    hint?.remove(); hint = null; fails = 0; cur++;
    show();
    if (cur >= ds.length) {
      status.textContent = helped ? 'Done! Try it again later from the chart.' : 'Beautiful strokes!';
      sfx('good'); say(k.sound);
      setTimeout(() => done({ ok: true, neutral: true, note: helped ? 'Traced with some help' : 'Traced it perfectly' }), 500);
    } else status.textContent = `Stroke ${cur + 1} of ${ds.length}.`;
  };
  // Drawing
  const ctx = canvas.getContext('2d')!;
  let pts: number[][] = [], drawing = false;
  const toView = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * VIEW, ((e.clientY - r.top) / r.height) * VIEW]; };
  const fit = () => { const r = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1; canvas.width = r.width * dpr; canvas.height = r.height * dpr; };
  const ink = () => {
    const s = canvas.width / VIEW; ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = getComputedStyle(box).getPropertyValue('--pri'); ctx.lineWidth = 7 * s; ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * s, y * s) : ctx.moveTo(x * s, y * s))); ctx.stroke();
  };
  canvas.addEventListener('pointerdown', (e) => { if (cur >= ds.length) return; if (!canvas.width) fit(); drawing = true; canvas.setPointerCapture(e.pointerId); pts = [toView(e)]; ink(); });
  canvas.addEventListener('pointermove', (e) => { if (!drawing) return; pts.push(toView(e)); ink(); });
  const end = () => {
    if (!drawing) return; drawing = false;
    const len = pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (len < 3 && paths[cur].getTotalLength() > 12) return; // a stray tap
    const ref = sample(paths[cur], 24), usr = len < 1 ? Array(24).fill(pts[0]) : resample(pts, 24);
    const mean = ref.reduce((a, p, i) => a + Math.hypot(p[0] - usr[i][0], p[1] - usr[i][1]), 0) / 24;
    const startD = Math.hypot(ref[0][0] - usr[0][0], ref[0][1] - usr[0][1]);
    const endD = Math.hypot(ref[23][0] - usr[23][0], ref[23][1] - usr[23][1]);
    if (mean < 13 && startD < 20 && endD < 22) { sfx('tap'); advance(); }
    else {
      fails++; sfx('bad'); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      if (fails >= 3) { helped++; status.textContent = 'Here it is. On to the next one.'; advance(); }
      else { status.textContent = startD >= 20 ? 'Start at the dot and follow the arrow.' : 'Close! Follow the blue stroke.'; showHint(); }
    }
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  requestAnimationFrame(() => { show(); fit(); });
  const skip = h('button', { class: 'linkbtn', onclick: () => done({ ok: true, neutral: true, note: 'Skipped tracing' }) }, 'Skip tracing');
  return { eyebrow: 'Trace strokes', title: `Write ${k.char} (${k.romaji})`, el: h('div', { class: 'stage' }, box, status, h('div', { class: 'center' }, strokeAnim(k.char), skip)), autoNext: true };
}

export function renderGame(q: Q, done: Done): Game {
  switch (q.t) {
    case 'intro': return intro(q.k, done);
    case 'type': return typeIt(q.k, done);
    case 'match': return match(q, done);
    case 'trace': return trace(q.k, done);
    default: return choice(q, done);
  }
}
