// The map: the whole mountain from N5 to N1, rank titles, can-do lists and the stamp book.
import { REGIONS, Region } from '../data/climb';
import { h, jp, bar } from '../ui';
import { S } from '../state';
import { currentRegion, unitsOf, stampCount } from '../progress';
import { showFlow, showTab } from '../nav';

const INK = '#232A40';
const BANDS = ['#E8C48E', '#9ED9CC', '#8FA3E8', '#A8B6E0', '#FFFDF9']; // N5 at the foot .. N1 at the top

/** Hand-drawn style mountain with five bands, a dashed trail and a "You" marker on the current region. */
function mountain(cur: number): SVGSVGElement {
  const ys = [392, 320, 256, 192, 128, 0]; // band bottoms from N5 up
  const stations = [[118, 352], [150, 290], [155, 228], [150, 164], [160, 104]];
  const labels: [number, number, string, string][] = [[24, 380, 'N5 Foothills', INK], [58, 300, 'N4 Bamboo', INK], [84, 236, 'N3 Onsen', '#FFFDF9'], [226, 182, 'N2 Castle', INK], [208, 100, 'N1 Summit', INK]];
  const [yx, yy] = stations[cur];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" class="mountain" role="img" aria-label="Mountain map. You are in region ${cur + 1} of 5.">
    <defs><clipPath id="mclip"><path d="M10 392 L120 120 Q160 40 200 120 L310 392 Z"/></clipPath></defs>
    <circle cx="160" cy="42" r="26" fill="#FFE1A0" stroke="${INK}" stroke-width="2.2"/>
    <path d="M146 44q4 4 8 0M166 44q4 4 8 0M150 52q10 7 20 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g clip-path="url(#mclip)">${BANDS.map((c, i) => `<rect x="0" y="${ys[i + 1]}" width="320" height="${ys[i] - ys[i + 1]}" fill="${c}"/>`).join('')}
      <path d="M118 128L136 104L150 120L164 98L180 118L196 106L206 128Z" fill="#E6EAF5"/></g>
    <path d="M10 392 L120 120 Q160 40 200 120 L310 392 Z" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M160 380C90 360 230 330 150 300S220 250 155 230S200 180 150 160S175 120 160 92" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round"/>
    ${stations.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="7" fill="${S.gates[REGIONS[i].id] ? '#1A9E85' : '#EEEBF2'}" stroke="${INK}" stroke-width="2.2"/>`).join('')}
    ${labels.map(([x, y, t, c]) => `<text x="${x}" y="${y}" font-family="Lexend, sans-serif" font-size="11" font-weight="700" fill="${c}">${t}</text>`).join('')}
    <g transform="translate(${yx} ${yy})"><circle r="22" fill="none" stroke="#4A5FA8" stroke-width="2" opacity=".45"/><circle r="15" fill="#4A5FA8" stroke="${INK}" stroke-width="2.4"/>
      <text y="4.5" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFDF9" font-family="Lexend, sans-serif">You</text></g>
  </svg>`;
  const t = document.createElement('template'); t.innerHTML = svg; return t.content.firstChild as SVGSVGElement;
}

function rung(r: Region, cur: Region) {
  const i = REGIONS.indexOf(r), passed = !!S.gates[r.id], here = r === cur;
  const state = passed ? 'Rank earned' : here ? 'You are here' : 'Ahead';
  return h('div', { class: `rung ${passed ? 'passed' : here ? 'here' : 'ahead'}` },
    h('div', { class: 'lvl' }, h('b', null, r.level), jp(r.rankJp, 'rjp'), h('small', null, `${r.rankRomaji} · ${r.rank}`)),
    h('div', { class: 'body' },
      h('div', { class: 'row' }, h('h3', null, jp(r.placeJp), ` ${r.place}`), h('span', { class: 'tag' }, state)),
      h('div', { class: 'meta' }, h('span', null, r.source), h('span', null, `~${r.words.toLocaleString()} words`), h('span', null, `~${r.kanji.toLocaleString()} kanji`)),
      here && r.plan.length ? h('div', null, bar(stampCount(r) / r.plan.length, 'mint'), h('small', null, `${stampCount(r)} of ${r.plan.length} unit stamps`)) : null,
      h('div', { class: 'cando' }, h('div', { class: 'eyebrow' }, passed ? 'You can' : `At ${r.level} you can`), r.cando.map((c) => h('div', { class: passed ? 'ok' : '' }, `${passed ? '✓' : '○'} ${c}`))),
      i > 0 && !passed && !here ? h('small', null, `Opens after the ${REGIONS[i - 1].rank}'s Gate.`) : null));
}

function stampBook(r: Region) {
  const units = unitsOf(r);
  return h('section', { class: 'card stampbook' },
    h('div', { class: 'row' }, h('h3', null, 'Stamp book · ', jp(r.placeJp)), h('small', null, `${stampCount(r)} of ${r.plan.length}`)),
    h('p', null, 'Like the ink stamps at Japanese train stations, every cleared unit leaves its mark here.'),
    h('div', { class: 'stamps' }, r.plan.map((title, i) => {
      const u = units[i], got = u && S.stamps[u.id];
      return h('div', { class: `stampslot ${got ? 'got' : ''}`, title },
        h('span', { class: 'stamp jp' }, got ? u.stamp : String(i + 1)), h('small', null, title));
    })),
    h('div', { class: `rankstamp ${S.gates[r.id] ? 'got' : ''}` }, h('span', { class: 'stamp big jp' }, r.stamp),
      h('small', null, S.gates[r.id] ? `${r.rank} rank stamp` : `Rank stamp: pass the ${r.rank}'s Gate`)));
}

export function openClimb() {
  const cur = currentRegion(), back = () => showTab('home');
  showFlow(h('div', { class: 'screen flow climb' },
    h('div', { class: 'ltop' }, h('button', { class: 'icon-btn', 'aria-label': 'Close map', onclick: back }, '✕'), h('div', { class: 'eyebrow', style: { flex: '1' } }, 'The climb · N5 to N1')),
    h('div', { class: 'mtncard' }, mountain(REGIONS.indexOf(cur))),
    h('div', { class: 'sub', style: { marginTop: 0 } }, 'Each JLPT level is a region of the mountain. Clear its units to fill your stamp book, then pass its gate to earn the next rank.'),
    stampBook(cur),
    h('div', { class: 'eyebrow' }, 'Ranks'),
    REGIONS.map((r) => rung(r, cur))), back);
}
