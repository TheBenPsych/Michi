import data from './data/strokes.json';
import { svgEl } from './ui';

const STROKES = data as Record<string, string[]>;
export const strokesOf = (ch: string): string[] => STROKES[ch] || [];
export const VIEW = 109; // KanjiVG coordinate box

/** An SVG that draws each stroke in order, looping when tapped. */
export function strokeAnim(text: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'strokes';
  wrap.setAttribute('aria-label', `Stroke order for ${text}`);
  const build = () => {
    wrap.replaceChildren();
    let i = 0;
    for (const ch of text) {
      const svg = svgEl('svg', { viewBox: `0 0 ${VIEW} ${VIEW}`, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': 6 });
      for (const d of strokesOf(ch)) svg.appendChild(svgEl('path', { d, class: 'g' }));
      for (const d of strokesOf(ch)) {
        const p = svgEl('path', { d, class: 'a', pathLength: 1 });
        p.style.animationDelay = `${0.2 + i++ * 0.6}s`;
        svg.appendChild(p);
      }
      wrap.appendChild(svg);
    }
  };
  build();
  wrap.addEventListener('click', build);
  return wrap;
}
