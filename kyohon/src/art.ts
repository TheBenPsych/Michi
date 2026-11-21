/** All drawings in the app: flat scenes in the Warm paper colours, hand-written SVG. No faces on objects or places. */
import type { Scene } from './data/content';

const INK = '#3A2E26', CREAM = '#FFF7E8', RED = '#B5482F', SLATE = '#5E6B7A', WOOD = '#8A6A45', GLASS = '#BFD6E6', GREEN = '#7FA487', LEAF = '#4C8A6A';
const svg = (label: string, body: string) => `<svg viewBox="0 0 280 160" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const O = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

/** A small house. x is the left wall, base is the ground line. */
const house = (x: number, base: number, w: number, hgt: number, roof: string, wall: string, lit = false) => {
  const win = lit ? '#F6D27A' : GLASS, r = hgt * 0.55;
  return `<g ${O}><path d="M${x} ${base}V${base - hgt}h${w}V${base}z" fill="${wall}"/>` +
    `<path d="M${x - 7} ${base - hgt}L${x + w / 2} ${base - hgt - r}L${x + w + 7} ${base - hgt}z" fill="${roof}"/>` +
    `<rect x="${x + w * 0.14}" y="${base - hgt * 0.62}" width="${w * 0.26}" height="${hgt * 0.62}" fill="${WOOD}"/>` +
    `<rect x="${x + w * 0.56}" y="${base - hgt * 0.72}" width="${w * 0.28}" height="${hgt * 0.34}" fill="${win}"/></g>`;
};
const pole = (x: number) => `<path d="M${x} 126V52M${x - 9} 60h18M${x - 7} 68h14" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M0 64Q${x / 2} 76 ${x} 60M${x} 60Q${(x + 280) / 2} 76 280 58" stroke="${INK}" stroke-width="1" fill="none"/>`;
const road = `<rect y="126" width="280" height="34" fill="#D8CBB2"/><path d="M0 143h280" stroke="${CREAM}" stroke-width="2.5" stroke-dasharray="16 12"/><path d="M0 126h280" stroke="${INK}" stroke-width="2"/>`;
const hills = (a: string, b: string) => `<path d="M0 104Q60 74 130 100T280 90V160H0z" fill="${a}"/><path d="M0 116Q90 98 160 114T280 108V160H0z" fill="${b}"/>`;
const street = (lit = false) => house(18, 126, 50, 34, RED, CREAM, lit) + house(84, 126, 46, 42, SLATE, '#F3E3C7', lit) + pole(158) + house(206, 126, 52, 32, RED, CREAM, lit);

const swatch = (label: string, c: string, dark: string) => svg(label,
  `<rect width="280" height="160" fill="#F4ECDC"/><rect x="70" y="22" width="140" height="116" rx="8" fill="${CREAM}" ${O}/>` +
  `<rect x="84" y="36" width="112" height="70" rx="4" fill="${c}"/><path d="M92 46h40" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>` +
  `<path d="M96 122h56" stroke="${dark}" stroke-width="5" stroke-linecap="round"/><path d="M162 122h22" stroke="${INK}" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/>`);

const person = (x: number, y: number, top: string, hair: string, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" ${O}><path d="M-17 62c0-22 8-30 17-30s17 8 17 30z" fill="${top}"/><circle cx="0" cy="18" r="13" fill="#F1CFAE"/><path d="${hair}" fill="${INK}"/></g>`;
const HAIR_SHORT = 'M-13 18c-1-12 5-17 13-17s14 5 13 17c-4-7-8-9-13-9s-9 2-13 9z';
const HAIR_BACK = 'M-13 18a13 13 0 0 1 26 0c0 8-5 13-13 13s-13-5-13-13z';

export const SCENES: Record<Scene, string> = {
  morning: svg('A quiet street at sunrise',
    `<defs><linearGradient id="am" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7C99A"/><stop offset="1" stop-color="#FBEBD0"/></linearGradient></defs>` +
    `<rect width="280" height="160" fill="url(#am)"/><circle cx="182" cy="98" r="46" fill="#F2A65A" opacity=".2"/><circle cx="182" cy="98" r="30" fill="#F2A65A"/>` +
    hills('#C9B48C', '#A9B08A') + street() + road),
  day: svg('The same street at midday',
    `<rect width="280" height="160" fill="#CFE6F2"/><circle cx="222" cy="34" r="17" fill="#F5CF6B"/>` +
    `<g fill="#fff" opacity=".9"><ellipse cx="62" cy="34" rx="26" ry="9"/><ellipse cx="82" cy="27" rx="17" ry="9"/><ellipse cx="150" cy="48" rx="20" ry="7"/></g>` +
    hills('#BFD3A6', '#9DBB8D') + street() + road),
  evening: svg('The same street after dark',
    `<defs><linearGradient id="pm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F3566"/><stop offset="1" stop-color="#6A5A86"/></linearGradient></defs>` +
    `<rect width="280" height="160" fill="url(#pm)"/><path d="M228 22a17 17 0 1 0 14 27a14 14 0 0 1-14-27z" fill="#F6E7B0"/>` +
    `<g fill="#F6E7B0"><circle cx="40" cy="24" r="1.6"/><circle cx="96" cy="16" r="1.3"/><circle cx="150" cy="30" r="1.6"/><circle cx="188" cy="14" r="1.2"/><circle cx="70" cy="44" r="1.2"/></g>` +
    hills('#4A4A72', '#3E4466') + street(true) +
    `<rect y="126" width="280" height="34" fill="#55506E"/><path d="M0 143h280" stroke="#8D88A6" stroke-width="2.5" stroke-dasharray="16 12"/><path d="M0 126h280" stroke="${INK}" stroke-width="2"/>`),
  gift: svg('A wrapped present on a table',
    `<rect width="280" height="160" fill="#F6E3D3"/><rect y="118" width="280" height="42" fill="#D9B88F"/><path d="M0 118h280" stroke="${INK}" stroke-width="2"/>` +
    `<ellipse cx="140" cy="122" rx="62" ry="6" fill="${INK}" opacity=".12"/>` +
    `<g ${O}><rect x="92" y="64" width="96" height="56" rx="3" fill="${RED}"/><rect x="86" y="50" width="108" height="18" rx="3" fill="#C9583D"/>` +
    `<rect x="132" y="50" width="16" height="70" fill="${CREAM}"/><path d="M140 50c-8-18-34-16-26-2c4 6 16 4 26 2zM140 50c8-18 34-16 26-2c-4 6-16 4-26 2z" fill="${CREAM}"/></g>` +
    `<g stroke="${RED}" stroke-width="2.5" stroke-linecap="round" opacity=".7"><path d="M62 52l-10-6M58 70H46M218 52l10-6M222 70h12"/></g>`),
  excuse: svg('A customer raising a hand to a shop assistant who is facing the shelves',
    `<rect width="280" height="160" fill="#F1E6D2"/>` +
    `<g ${O}><path d="M150 30h112M150 62h112" stroke-width="3"/>` +
    `<rect x="160" y="14" width="12" height="16" fill="${GREEN}"/><rect x="180" y="10" width="10" height="20" fill="${RED}"/><rect x="198" y="16" width="14" height="14" fill="#E0B25C"/><rect x="224" y="12" width="10" height="18" fill="${SLATE}"/><rect x="242" y="16" width="12" height="14" fill="${GREEN}"/>` +
    `<rect x="158" y="46" width="14" height="16" fill="#E0B25C"/><rect x="238" y="42" width="12" height="20" fill="${RED}"/></g>` +
    person(206, 52, LEAF, HAIR_BACK) +
    `<g ${O}><rect x="120" y="108" width="160" height="52" fill="#C9A474"/><path d="M112 108h168" stroke-width="4"/></g>` +
    `<path d="M80 128C92 108 98 84 101 60" stroke="${INK}" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M80 128C92 108 98 84 101 60" stroke="${RED}" stroke-width="11" stroke-linecap="round" fill="none"/>` +
    `<g ${O}><circle cx="102" cy="50" r="8" fill="#F1CFAE"/></g>` +
    person(64, 74, RED, HAIR_SHORT, 1.25) +
    `<g stroke="${RED}" stroke-width="2.5" stroke-linecap="round"><path d="M117 38l8-6M120 50h10M113 28l4-9"/></g>`),
  house: svg('A house with a garden',
    `<rect width="280" height="160" fill="#D9ECF2"/>` + hills('#BFD3A6', '#9DBB8D') +
    `<g ${O}><path d="M78 132V78h124v54z" fill="${CREAM}"/><path d="M64 80L140 34l76 46z" fill="${RED}"/><rect x="96" y="96" width="24" height="36" fill="${WOOD}"/><circle cx="115" cy="115" r="1.6" fill="${INK}"/>` +
    `<rect x="140" y="92" width="44" height="24" fill="${GLASS}"/><path d="M162 92v24M140 104h44"/><rect x="170" y="42" width="12" height="20" fill="${SLATE}"/></g>` +
    `<g ${O}><path d="M236 132v-22" stroke-width="4"/><circle cx="236" cy="96" r="18" fill="${LEAF}"/></g>` +
    `<rect y="132" width="280" height="28" fill="#A9C795"/><path d="M0 132h280" stroke="${INK}" stroke-width="2"/><path d="M97 133h22l10 27H87z" fill="#E6D7B8"/>`),
  blue: swatch('A paint sample card in blue', '#2F6FD0', '#2F6FD0'),
  red: swatch('A paint sample card in red', '#C8372D', '#C8372D'),
  station: svg('A train at a station platform',
    `<rect width="280" height="160" fill="#DCE9E4"/><path d="M0 66Q70 44 150 62T280 52V160H0z" fill="#B7D2BF"/>` +
    `<g ${O}><path d="M0 22h196l14 11H0z" fill="${SLATE}"/><path d="M40 33v84M152 33v84" stroke-width="3.5"/>` +
    `<path d="M100 54h158a12 12 0 0 1 12 12v50H100z" fill="${CREAM}"/><path d="M100 94h170v22H100z" fill="${LEAF}"/>` +
    `<rect x="112" y="64" width="28" height="20" rx="2" fill="${GLASS}"/><rect x="148" y="64" width="28" height="20" rx="2" fill="${GLASS}"/><rect x="184" y="64" width="28" height="20" rx="2" fill="${GLASS}"/>` +
    `<path d="M222 62h34a8 8 0 0 1 8 8v14h-42z" fill="${GLASS}"/><circle cx="262" cy="104" r="3" fill="#F6D27A"/></g>` +
    `<rect y="116" width="280" height="44" fill="#D8CBB2"/><path d="M0 123h280" stroke="#E9B03A" stroke-width="5"/><path d="M0 116h280" stroke="${INK}" stroke-width="2"/>`),
  face: svg('A person’s face',
    `<rect width="280" height="160" fill="#F6E3D3"/>` +
    `<g ${O}><path d="M84 160c0-30 24-44 56-44s56 14 56 44z" fill="${LEAF}"/><path d="M126 100h28v22a14 14 0 0 1-28 0z" fill="#E9C3A0"/>` +
    `<ellipse cx="140" cy="68" rx="40" ry="46" fill="#F1CFAE"/><path d="M100 70c-4-36 14-54 40-54s44 18 40 54c-6-18-16-28-26-32c-12 8-30 10-44 8c-6 6-8 14-10 24z" fill="${INK}"/>` +
    `<path d="M120 62q6-4 12 0M148 62q6-4 12 0" fill="none"/><circle cx="126" cy="72" r="3" fill="${INK}"/><circle cx="154" cy="72" r="3" fill="${INK}"/><path d="M140 74v12h-5" fill="none"/><path d="M128 97q12 8 24 0" fill="none"/></g>`),
  pond: svg('A garden pond with a fish and water lilies',
    `<rect width="280" height="160" fill="#DDEBC8"/><path d="M0 0h280v46Q200 62 140 50T0 54z" fill="#C7DDB0"/>` +
    `<g ${O}><ellipse cx="140" cy="98" rx="104" ry="44" fill="#9CCBE0"/><path d="M72 92q14-8 28 0M150 122q14-8 28 0" fill="none" stroke="#fff" stroke-width="2"/>` +
    `<path d="M150 88c14-12 34-10 44 0c-10 10-30 12-44 0zM150 88l-14-9v18z" fill="#EE8A3C"/><circle cx="184" cy="86" r="1.8" fill="${INK}"/>` +
    `<path d="M84 112a13 8 0 1 0 2 0l-1 8z" fill="${LEAF}"/><path d="M112 78a10 6 0 1 0 2 0l-1 6z" fill="${LEAF}"/><circle cx="96" cy="113" r="4" fill="#F4B6C0"/>` +
    `<ellipse cx="42" cy="118" rx="16" ry="10" fill="#B8AC98"/><ellipse cx="238" cy="80" rx="14" ry="9" fill="#B8AC98"/>` +
    `<path d="M236 70V38M244 72V46M228 72V50" stroke="${LEAF}" stroke-width="3"/><path d="M236 38v-8M244 46v-7M228 50v-6" stroke="${WOOD}" stroke-width="5"/></g>`),
  sign: svg('A station name sign that reads あおき',
    `<rect width="280" height="160" fill="#CFE0EA"/><path d="M0 118Q80 102 170 116T280 106V160H0z" fill="#B7D2BF"/>` +
    `<path d="M64 124v36M216 124v36" stroke="${SLATE}" stroke-width="7"/><rect x="26" y="28" width="228" height="98" rx="6" fill="#FFFDF8" ${O} stroke-width="2.5"/>` +
    `<text x="143" y="72" text-anchor="middle" font-size="36" font-family="Zen Maru Gothic,sans-serif" font-weight="700" fill="#2D2823" letter-spacing="6">あおき</text>` +
    `<rect x="27" y="84" width="226" height="9" fill="${LEAF}"/><text x="141" y="114" text-anchor="middle" font-size="13" font-family="Lexend,sans-serif" font-weight="700" fill="#2D2823" letter-spacing="3">AOKI</text>`),
};

export function ill(scene: Scene, cls = ''): HTMLElement {
  const d = document.createElement('div');
  d.className = `ill ${cls}`.trim();
  d.innerHTML = SCENES[scene];
  return d;
}

const avatar = (hair: string, top: string) => `<svg class="av" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="${top}" opacity=".28"/><path d="M7 48c0-11 8-16 17-16s17 5 17 16z" fill="${top}"/><circle cx="24" cy="20" r="10.5" fill="#F1CFAE"/><path d="${hair}" fill="${INK}"/></svg>`;
export const AVATARS: Record<'f' | 'm', string> = {
  f: avatar('M12 31c-3-15 3-24 12-24s15 9 12 24c-1-8-3-13-6-16c-4 3-9 4-13 3c-3 3-4 7-5 13z', LEAF),
  m: avatar('M13.5 20c-1-9 4-13 10.5-13s11.500 4 10.500 13c-3-5-6-7-10.500-7s-7.500 2-10.500 7z', RED),
};
export const SPEAKER = { f: 'Nanami', m: 'Keita' };
export function av(kind: 'f' | 'm'): HTMLElement { const s = document.createElement('span'); s.style.lineHeight = '0'; s.innerHTML = AVATARS[kind]; return s; }

export const ICONS = {
  kana: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="10" fill="var(--tint)"/><text x="24" y="34" text-anchor="middle" font-size="27" font-family="Zen Maru Gothic,sans-serif" font-weight="500" fill="var(--accent)">あ</text></svg>`,
  words: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M6 10h13a5 5 0 0 1 5 5v25a5 5 0 0 0-5-4H6zM42 10H29a5 5 0 0 0-5 5v25a5 5 0 0 1 5-4h13z" fill="var(--tint)"/><path d="M11 18h7M11 24h7M30 18h7M30 24h7"/></svg>`,
};
