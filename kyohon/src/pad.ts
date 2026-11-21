/** A square to write a kana in with a finger, and an honest check of the strokes against the KanjiVG model. */
import { strokesOf, VIEW } from './strokes';
import { svgEl } from './ui';
import { S } from './store';

type Pt = [number, number];
const N = 16;
function resample(pts: Pt[], n = N): Pt[] {
  if (pts.length < 2) return Array.from({ length: n }, () => pts[0] ?? [0, 0]);
  const d = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = d[d.length - 1] || 1, out: Pt[] = [];
  for (let k = 0, j = 0; k < n; k++) {
    const t = (total * k) / (n - 1);
    while (j < d.length - 2 && d[j + 1] < t) j++;
    const seg = d[j + 1] - d[j] || 1, f = (t - d[j]) / seg;
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
  }
  return out;
}
/** Sample a model stroke (an SVG path) into points. */
export function modelPoints(d: string, n = N): Pt[] {
  const p = svgEl('path', { d }) as unknown as SVGPathElement, len = p.getTotalLength();
  return Array.from({ length: n }, (_, i) => { const q = p.getPointAtLength((len * i) / (n - 1)); return [q.x, q.y] as Pt; });
}
const avg = (a: Pt[], b: Pt[]) => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length;
const where = (p: Pt) => `${p[1] < 40 ? 'top' : p[1] > 70 ? 'bottom' : 'middle'} ${p[0] < 40 ? 'left' : p[0] > 70 ? 'right' : 'centre'}`.replace('middle centre', 'centre');

export interface Verdict { ok: boolean; msg: string; bad: number[] }
/** Compare drawn strokes with the model: count, order, direction and rough shape. */
export function judge(user: Pt[][], model: Pt[][], strict = false): Verdict {
  if (!user.length) return { ok: false, msg: 'Write the letter in the square first.', bad: [] };
  if (user.length !== model.length) return { ok: false, msg: `This letter has ${model.length} stroke${model.length === 1 ? '' : 's'}. You drew ${user.length}.`, bad: [] };
  const limit = strict ? 13 : 19, bad: number[] = []; let msg = '';
  user.forEach((u, i) => {
    const a = resample(u), m = model[i], fwd = avg(a, m), rev = avg([...a].reverse(), m);
    if (fwd <= limit) return;
    bad.push(i);
    if (msg) return;
    if (rev <= limit) msg = `Stroke ${i + 1} goes the other way. Start it at the ${where(m[0])}.`;
    else if (Math.hypot(a[0][0] - m[0][0], a[0][1] - m[0][1]) > limit * 1.3) msg = `Stroke ${i + 1} should start at the ${where(m[0])}.`;
    else msg = `Stroke ${i + 1} is off. Follow the shape more closely and end at the ${where(m[N - 1])}.`;
  });
  return bad.length ? { ok: false, msg, bad } : { ok: true, msg: 'Good. The strokes are in the right order and shape.', bad };
}

export interface Pad { el: HTMLElement; clear(): void; check(): Verdict; count(): number }
export function writePad(ch: string, guide: boolean, onStroke?: () => void): Pad {
  const el = document.createElement('div'); el.className = 'pad';
  const svg = svgEl('svg', { viewBox: `0 0 ${VIEW} ${VIEW}` });
  svg.appendChild(svgEl('path', { d: `M${VIEW / 2} 4V${VIEW - 4}M4 ${VIEW / 2}H${VIEW - 4}`, class: 'grid' }));
  if (guide) for (const d of strokesOf(ch)) svg.appendChild(svgEl('path', { d, class: 'g' }));
  const layer = svgEl('g', {}); svg.appendChild(layer); el.appendChild(svg);
  let strokes: Pt[][] = [], cur: Pt[] | null = null, line: SVGElement | null = null;
  const pt = (e: PointerEvent): Pt => { const r = el.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * VIEW, ((e.clientY - r.top) / r.height) * VIEW]; };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); cur = [pt(e)]; line = svgEl('polyline', { class: 'u', points: cur[0].join(',') }); layer.appendChild(line); });
  el.addEventListener('pointermove', (e) => { if (!cur || !line) return; cur.push(pt(e)); line.setAttribute('points', cur.map((p) => p.join(',')).join(' ')); });
  const end = () => { if (cur && cur.length > 1) { strokes.push(cur); onStroke?.(); } else line?.remove(); cur = null; line = null; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  return {
    el,
    count: () => strokes.length,
    clear() { strokes = []; layer.replaceChildren(); },
    check() {
      const model = strokesOf(ch).map((d) => modelPoints(d)), v = judge(strokes, model, S.settings.strict);
      [...layer.children].forEach((c, i) => c.classList.toggle('bad', v.bad.includes(i)));
      // Show the model strokes thinly over a wrong attempt so the difference is visible.
      if (!v.ok) for (const d of strokesOf(ch)) layer.appendChild(svgEl('path', { d, class: 'm' }));
      return v;
    },
  };
}
