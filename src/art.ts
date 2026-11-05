// Michi's hand-drawn art: soft chibi characters and kawaii objects with ink outlines.
// Everything is inline SVG so it is crisp at any size and works offline.
const INK = '#2B2F4F', SKIN = '#FFF4EA', PAPER = '#FFFDF9', BLUSH = '#F2B8A8', SUN = '#FFE1A0', RED = '#C0573E';
const P = (d: string, fill = 'none', sw = 3) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const C = (cx: number, cy: number, r: number, fill: string, sw = 3) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const R = (x: number, y: number, w: number, h: number, fill: string, rx = 0, sw = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const T = (x: number, y: number, s: number, txt: string, fill = INK) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Lexend, Zen Maru Gothic, sans-serif" font-weight="800" font-size="${s}" fill="${fill}">${txt}</text>`;
import { POP } from './popart';
// Muted Michi colors mapped to the brighter Pop palette.
const VIVID: Record<string, string> = { '#E6EAF5': '#E8F4FF', '#FFF1C9': '#FFF4D6', '#D9F5EF': '#E3FAEF', '#F6E2DC': '#FFE8EC', '#2F3F78': '#3F55C0', '#4A5FA8': '#4A5FE8', '#6F86C9': '#6F86F0', '#8FA3E8': '#8FA3FF', '#A8B6E0': '#9EB0FF', '#9ED9CC': '#7FE0B8', '#1A9E85': '#2BD9B0', '#A8C8F0': '#9ED9F5', '#FFE1A0': '#FFC800', '#C0573E': '#FF4B4B', '#F2B8A8': '#FF9FB2', '#B58E5C': '#C98A4B', '#C9A06C': '#E8A15A', '#4F9A5A': '#58CC02', '#E86A5C': '#FF5C6C', '#F2A088': '#FF7B5C', '#8FC4E8': '#49C0F8', '#4A7FD0': '#1CB0F6', '#D98C7A': '#FF7B5C', '#3E5A4A': '#2E6B4F', '#D9B77A': '#F2B544', '#8A5A3C': '#7A3F1D', '#FFF4EA': '#FFE8D6', '#8C7556': '#C98A4B' };
const vivid = (svg: string) => svg.replace(/#[0-9A-Fa-f]{6}/g, (c) => VIVID[c.toUpperCase()] ?? c);
const BG = (fill: string, w = 140, h = 100) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="12" fill="${fill}"/>`;

type Who = 'yuki' | 'leo' | 'mei' | 'gray' | 'doc' | 'suit';
const HAIR: Record<Who, [string, string, string?]> = {
  yuki: ['#2F3F78', 'M10 36C7 12 53 12 50 36L51 47C46 42 46 28 41 23C35 29 24 29 19 23C14 28 14 42 9 47Z'],
  leo: ['#D9B77A', 'M10 34Q8 18 18 19Q20 9 30 14Q38 7 42 17Q52 16 50 34C44 24 16 24 10 34Z'],
  mei: ['#8A5A3C', 'M11 34Q9 12 30 12Q51 12 49 34Q46 24 40 21Q30 28 20 22Q14 26 11 34Z', 'M46 22Q60 26 56 44Q52 36 46 34Z'],
  gray: ['#8A93B0', 'M11 31Q11 13 30 13Q49 13 49 31Q45 21 30 21Q15 21 11 31Z'],
  doc: ['#4E3A2E', 'M11 33Q9 12 30 12Q51 12 49 33Q46 22 36 20Q30 26 18 24Q13 27 11 33Z'],
  suit: ['#232A40', 'M11 31Q11 12 32 13Q50 14 49 31Q47 22 38 20Q26 24 16 22Q12 26 11 31Z'],
};
export const TOPS: Record<string, string> = { yuki: '#4A5FE8', leo: '#2BD9B0', mei: '#FFC800' };
interface HeadOpts { eyes?: 'open' | 'happy' | 'closed'; mouth?: 'smile' | 'open' | 'o' | 'flat'; glasses?: boolean }

/** A chibi head drawn in a 60x60 box, placed at (x, y) with size s. */
export function head(x: number, y: number, s: number, who: Who, o: HeadOpts = {}): string {
  const [hc, front, back] = HAIR[who];
  const eyes = o.eyes === 'happy' ? P('M19 38Q23 33 27 38M33 38Q37 33 41 38', 'none', 2.2)
    : o.eyes === 'closed' ? P('M19 37Q23 40 27 37M33 37Q37 40 41 37', 'none', 2.2)
    : `<ellipse cx="23" cy="36" rx="3.6" ry="4.6" fill="${INK}"/><ellipse cx="37" cy="36" rx="3.6" ry="4.6" fill="${INK}"/><circle cx="24.4" cy="34.2" r="1.5" fill="#fff"/><circle cx="38.4" cy="34.2" r="1.5" fill="#fff"/><circle cx="22" cy="38.4" r=".7" fill="#fff"/><circle cx="36" cy="38.4" r=".7" fill="#fff"/>`;
  const mouth = o.mouth === 'open' ? P('M25.5 42.5Q30 49 34.5 42.5Z', INK, 1.4) : o.mouth === 'o' ? `<ellipse cx="30" cy="45" rx="2.4" ry="2.8" fill="${INK}"/>`
    : o.mouth === 'flat' ? P('M27 45H33', 'none', 1.8) : P('M27 44Q30 46.5 33 44', 'none', 1.8);
  const glasses = o.glasses ? `${C(23, 36, 5.5, 'none', 1.8)}${C(37, 36, 5.5, 'none', 1.8)}${P('M28.5 36H31.5', 'none', 1.8)}` : '';
  return `<g transform="translate(${x} ${y}) scale(${s / 60})">${back ? P(back, hc, 2) : ''}${C(30, 33, 19, SKIN)}${P(front, hc, 2)}${who === 'mei' ? C(47, 22, 3, RED, 1.4) : ''}${eyes}<ellipse cx="18" cy="42" rx="3" ry="1.6" fill="${BLUSH}"/><ellipse cx="42" cy="42" rx="3" ry="1.6" fill="${BLUSH}"/>${mouth}${glasses}</g>`;
}
const body = (cx: number, top: number, bottom: number, fill: string, wt: number, wb: number) =>
  P(`M${cx - wt / 2} ${top + 4}Q${cx} ${top - 4} ${cx + wt / 2} ${top + 4}L${cx + wb / 2} ${bottom}H${cx - wb / 2}Z`, fill);
/** Body + head centred on cx, head top at y, size s, body down to `bottom`. */
export const person = (cx: number, y: number, s: number, who: Who, top: string, bottom: number, o: HeadOpts = {}) =>
  body(cx, y + s * 0.9, bottom, top, s * 0.58, s * 0.85) + head(cx - s / 2, y, s, who, o);
const arm = (x1: number, y1: number, x2: number, y2: number, sleeve: string) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${sleeve}" stroke-width="4.4" stroke-linecap="round"/>${C(x2, y2, 4.5, SKIN, 2)}`;
const heart = (x: number, y: number, s = 1, fill = RED) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -3C-3 -9 -11 -7 -10 -1C-9 4 -3 7 0 10C3 7 9 4 10 -1C11 -7 3 -9 0 -3Z" fill="${fill}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
const sweat = (x: number, y: number) => P(`M${x} ${y}Q${x + 6} ${y + 10} ${x + 2} ${y + 16}Q${x - 4} ${y + 18} ${x - 4} ${y + 12}Q${x - 4} ${y + 6} ${x} ${y}Z`, '#9ED9CC', 1.6);
const sparks = (pts: number[][]) => pts.map(([x, y, dx, dy]) => `<path d="M${x} ${y}l${dx} ${dy}" stroke="#7A5600" stroke-width="2.4" stroke-linecap="round"/>`).join('');
const star = (x: number, y: number, r: number, fill = SUN) => { let d = ''; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`; } return P(d + 'Z', fill, 1.4); };
const face = (_cx: number, _cy: number, _s = 1) => ''; // objects and places have no faces
const flag = (inner: string) => `${P('M30 94V14', 'none', 3)}${C(30, 12, 3.5, SUN, 1.8)}<g transform="translate(32 18)">${inner}</g>`;

// ---- Word pictures (140 x 100) ----
const WORD_ART: Record<string, string> = {
  sunrise: `${BG('#FFF1C9')}${sparks([[70, 30, 0, -10], [44, 40, -8, -7], [96, 40, 8, -7], [32, 60, -10, -2], [108, 60, 10, -2]])}${P('M38 74A32 32 0 0 1 102 74Z', SUN)}${P('M2 74Q36 64 70 74T138 72V86Q138 98 126 98H14Q2 98 2 86Z', '#9ED9CC')}`,
  sun: `${BG('#E6EAF5')}${sparks([[40, 6, 0, 6], [14, 32, 6, 0], [60, 32, 6, 0], [22, 14, 4, 4], [58, 14, -4, 4]])}${C(40, 34, 15, SUN)}${face(40, 34, 0.8)}${person(100, 26, 42, 'yuki', TOPS.yuki, 98, { mouth: 'open' })}${arm(112, 66, 126, 40, TOPS.yuki)}${sparks([[130, 30, 4, -4], [132, 42, 6, 0]])}`,
  moon: `${BG('#2F3F78')}${P('M78 18A32 32 0 1 0 98 76A26 26 0 1 1 78 18Z', SUN)}${star(108, 26, 6)}${star(118, 62, 4)}${star(24, 22, 4)}${star(30, 80, 3)}`,
  wave: `${BG('#E6EAF5')}${person(60, 12, 50, 'leo', TOPS.leo, 98, { mouth: 'open', eyes: 'happy' })}${arm(76, 60, 100, 30, TOPS.leo)}${P('M108 18Q114 26 110 34M116 14Q124 26 118 40', 'none', 2)}`,
  gift: `${BG('#FFF1C9')}${person(54, 10, 48, 'yuki', TOPS.yuki, 98, { eyes: 'happy', mouth: 'open' })}${R(72, 56, 38, 32, RED, 4)}${P('M91 56V88M72 70H110', 'none', 2)}<path d="M91 56V88M72 70H110" stroke="${SUN}" stroke-width="3"/>${P('M91 56Q80 42 84 52Q86 58 91 56Q102 42 98 52Q96 58 91 56Z', SUN, 2)}${heart(118, 22, 0.9)}`,
  sorry: `${BG('#F6E2DC')}<g transform="rotate(24 70 98)">${person(70, 16, 50, 'suit', '#2F3F78', 98, { eyes: 'closed', mouth: 'flat' })}</g>${sweat(110, 20)}${sweat(122, 36)}`,
  meet: `${BG('#E6EAF5')}<g transform="rotate(16 40 98)">${person(40, 22, 44, 'yuki', TOPS.yuki, 98, { eyes: 'closed' })}</g><g transform="rotate(-16 100 98)">${person(100, 22, 44, 'leo', TOPS.leo, 98, { eyes: 'closed' })}</g>${sparks([[64, 30, 4, -4], [76, 30, -4, -4], [70, 24, 0, -6]])}`,
  me: `${BG('#E6EAF5')}${person(70, 6, 54, 'leo', TOPS.leo, 98, { mouth: 'open' })}${arm(90, 70, 74, 78, TOPS.leo)}${sparks([[30, 30, -6, -4], [28, 44, -8, 0], [110, 30, 6, -4], [112, 44, 8, 0]])}`,
  student: `${BG('#E6EAF5')}${person(66, 6, 54, 'yuki', TOPS.yuki, 98)}${R(86, 62, 22, 28, RED, 3)}${P('M90 70H104M90 76H100', 'none', 1.6)}`,
  teacher: `${BG('#D9F5EF')}${R(6, 12, 54, 40, '#3E5A4A', 4)}${T(33, 39, 18, 'あいう', '#D9F5EF')}${person(98, 6, 52, 'gray', '#B58E5C', 98, { glasses: true })}${P('M76 70L58 48', 'none', 3)}`,
  doctor: `${BG('#E6EAF5')}${person(70, 6, 54, 'doc', PAPER, 98)}${P('M70 60V98', 'none', 1.4)}${P('M60 64Q58 80 66 84Q74 80 72 64', 'none', 2.2).replace(INK, '#1A9E85')}${P('M84 72V82M79 77H89', 'none', 3).replace(INK, RED)}`,
  office: `${BG('#E6EAF5')}${person(62, 6, 54, 'suit', '#2F3F78', 98)}${P('M56 58L62 70L68 58Z', PAPER, 1.6)}${P('M62 63L59 75L62 81L65 75Z', RED, 1.4)}${R(94, 72, 32, 22, '#B58E5C', 4)}${P('M104 72V67H116V72', 'none', 2.2)}`,
  university: `${BG('#E6EAF5')}${P('M14 92Q14 70 24 66Q34 70 34 92Z', '#9ED9CC')}${P('M24 92V80', 'none', 2)}${R(44, 44, 76, 48, PAPER, 2)}${P('M40 46L82 22L124 46Z', '#A8B6E0')}${C(82, 36, 6, SUN, 2)}${P('M82 33V36L84 38', 'none', 1.4)}${P('M56 54V84M70 54V84M94 54V84M108 54V84', 'none', 2)}${R(76, 66, 12, 26, '#6F86C9', 2, 2)}${P('M40 92H124', 'none', 2.4)}`,
  friends: `${BG('#FFF1C9')}${person(46, 16, 48, 'yuki', TOPS.yuki, 98, { eyes: 'happy', mouth: 'open' })}${person(96, 16, 48, 'mei', TOPS.mei, 98, { eyes: 'happy', mouth: 'open' })}${heart(71, 18, 1.1)}`,
  major: `${BG('#E6EAF5')}${R(46, 44, 48, 50, '#6F86C9', 4)}${R(52, 44, 6, 50, '#4A5FA8', 0, 2)}${P('M64 58H86M64 66H82', 'none', 2).replace(INK, PAPER)}${P('M38 34L70 20L102 34L70 46Z', '#2F3F78')}${P('M54 40V48Q70 56 86 48V40', '#2F3F78')}${P('M102 34V52', 'none', 2)}${C(102, 54, 3, SUN, 1.6)}`,
  japan: `${BG('#E6EAF5')}${flag(`${P('M0 0Q20 -6 40 0T80 0V50Q60 44 40 50T0 50Z', PAPER)}${C(40, 25, 13, RED)}`)}`,
  usa: `${BG('#E6EAF5')}${flag(`${R(0, 0, 80, 50, PAPER, 2)}<path d="M0 6H80M0 18H80M0 30H80M0 42H80" stroke="${RED}" stroke-width="5"/>${R(0, 0, 34, 26, '#2F3F78', 2, 2)}${[6, 14, 22].flatMap((y) => [8, 17, 26].map((x) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${PAPER}"/>`)).join('')}${R(0, 0, 80, 50, 'none', 2)}`)}`,
  uk: `${BG('#E6EAF5')}${flag(`<clipPath id="ukc"><rect width="80" height="50" rx="2"/></clipPath><g clip-path="url(#ukc)"><rect width="80" height="50" fill="#2F3F78"/><path d="M0 0L80 50M80 0L0 50" stroke="${PAPER}" stroke-width="10"/><path d="M0 0L80 50M80 0L0 50" stroke="${RED}" stroke-width="3.5"/><path d="M40 0V50M0 25H80" stroke="${PAPER}" stroke-width="14"/><path d="M40 0V50M0 25H80" stroke="${RED}" stroke-width="7"/></g>${R(0, 0, 80, 50, 'none', 2)}`)}`,
  china: `${BG('#E6EAF5')}${flag(`${R(0, 0, 80, 50, RED, 2)}${star(16, 16, 9)}${star(32, 6, 3)}${star(38, 13, 3)}${star(38, 23, 3)}${star(32, 30, 3)}`)}`,
  jin: `${BG('#E6EAF5')}${person(56, 10, 52, 'yuki', TOPS.yuki, 98, { mouth: 'open' })}${P('M88 92V26', 'none', 2.6)}${arm(74, 66, 88, 62, TOPS.yuki)}${P('M90 26H124V50H90Z', PAPER, 2)}${C(107, 38, 7, RED, 1.8)}`,
  cake: `${BG('#FFF1C9')}${R(30, 56, 80, 36, '#F2B8A8', 8)}${R(40, 36, 60, 22, PAPER, 6)}${P('M30 66Q40 74 50 66T70 66T90 66T110 66', 'none', 2)}${R(56, 20, 6, 16, '#8FA3E8', 2, 1.8)}${R(78, 20, 6, 16, '#9ED9CC', 2, 1.8)}${P('M59 10Q63 16 59 19Q55 16 59 10Z', SUN, 1.6)}${P('M81 10Q85 16 81 19Q77 16 81 10Z', SUN, 1.6)}${T(70, 84, 16, '19')}${face(70, 46, 0.7)}`,
  phone: `${BG('#E6EAF5')}${R(48, 10, 44, 82, '#2F3F78', 10)}${R(54, 20, 32, 58, '#E6EAF5', 4, 2)}${face(70, 46, 0.8)}${C(70, 85, 3, PAPER, 1.6)}${P('M100 30Q108 40 100 50M108 24Q120 40 108 56M40 30Q32 40 40 50M32 24Q20 40 32 56', 'none', 2.2)}`,
  number: `${BG('#E6EAF5')}${R(18, 20, 104, 62, PAPER, 10)}${T(70, 66, 40, '123', '#4A5FA8')}${P('M26 28H44', 'none', 2).replace(INK, '#CDD5EC')}`,
  // First reading words (vowels, K, S, T rows)
  love: `${BG('#F6E2DC')}${heart(70, 50, 3.4)}${face(70, 50, 0.9)}${heart(22, 26, 0.9)}${heart(118, 74, 0.8)}${sparks([[112, 22, 6, -4], [26, 76, -6, 4]])}`,
  house: `${BG('#E6EAF5')}${P('M10 92H130', 'none', 2)}${R(36, 46, 68, 46, PAPER, 2)}${P('M26 50L70 16L114 50Z', RED)}${R(62, 64, 18, 28, '#B58E5C', 2)}${C(76, 79, 1.6, INK, 1)}${R(84, 56, 14, 14, '#A8C8F0', 2, 2)}${face(50, 62, 0.55)}${P('M94 30V18H102V36', '#E6EAF5', 2.2)}`,
  face: `${BG('#E6EAF5')}${head(36, 8, 72, 'leo', { eyes: 'happy', mouth: 'open' })}${P('M118 30L104 40M104 40L106 33M104 40L111 41', 'none', 2.6)}${P('M22 70L36 60M36 60L29 59M36 60L35 67', 'none', 2.6)}`,
  blue: `${BG('#E6EAF5')}${P('M34 62Q26 32 58 30Q88 20 100 46Q112 76 78 82Q42 90 34 62Z', '#4A7FD0')}${face(68, 56, 0.9)}${P('M106 34L124 12', 'none', 5)}<path d="M106 34L124 12" stroke="#B58E5C" stroke-width="2.6" stroke-linecap="round"/>${P('M100 42Q100 34 106 34Q110 38 104 44Z', '#4A7FD0', 2)}`,
  pond: `${BG('#D9F5EF')}<ellipse cx="72" cy="68" rx="56" ry="22" fill="#8FC4E8" stroke="${INK}" stroke-width="2.4"/><ellipse cx="46" cy="64" rx="10" ry="5" fill="#9ED9CC" stroke="${INK}" stroke-width="2"/>${P('M84 64Q92 60 100 64M90 74Q98 70 106 74', 'none', 1.8)}${P('M18 62V26M26 64V36M12 64V40', 'none', 2.2)}<ellipse cx="18" cy="26" rx="3" ry="7" fill="#B58E5C" stroke="${INK}" stroke-width="1.6"/><ellipse cx="26" cy="36" rx="3" ry="7" fill="#B58E5C" stroke="${INK}" stroke-width="1.6"/>${face(72, 76, 0.55)}`,
  umbrella: `${BG('#E6EAF5')}${P('M22 52Q70 -2 118 52Q106 44 94 52Q82 44 70 52Q58 44 46 52Q34 44 22 52Z', RED)}${face(70, 34, 0.7)}${P('M70 52V84Q70 94 61 94Q53 94 53 86', 'none', 3)}${sweat(20, 14)}${sweat(122, 18)}${sweat(112, 68)}${sweat(26, 66)}`,
  sushi: `${BG('#FFF1C9')}<ellipse cx="70" cy="82" rx="56" ry="12" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>${R(36, 52, 68, 28, PAPER, 12)}${P('M30 56Q70 30 110 56Q102 64 70 60Q38 64 30 56Z', '#F2A088')}<path d="M52 46L57 56M68 42L72 54M86 44L88 56" stroke="${PAPER}" stroke-width="2.4" stroke-linecap="round"/>${face(70, 68, 0.65)}`,
  chair: `${BG('#E6EAF5')}${R(44, 12, 16, 60, '#B58E5C', 4)}${R(44, 54, 56, 12, '#C9A06C', 4)}${P('M50 66V94M94 66V94M58 66V86M86 66V86', 'none', 3)}${face(52, 32, 0.45)}${R(64, 44, 32, 10, '#9ED9CC', 5, 2)}`,
  salt: `${BG('#E6EAF5')}${R(50, 36, 40, 56, PAPER, 10)}${P('M50 42Q50 20 70 20Q90 20 90 42Z', '#A8B6E0')}${[62, 70, 78].map((x) => `<circle cx="${x}" cy="30" r="1.8" fill="${INK}"/>`).join('')}${face(70, 64, 0.8)}${[[34, 22], [28, 34], [108, 26], [114, 40], [104, 16]].map(([x, y]) => R(x, y, 4, 4, PAPER, 1, 1.4)).join('')}`,
  watermelon: `${BG('#D9F5EF')}${P('M14 36Q70 120 126 36Z', '#4F9A5A')}${P('M22 38Q70 108 118 38Z', '#F6E2DC', 0)}${P('M26 38Q70 100 114 38Z', '#E86A5C', 2)}${[[46, 50], [94, 50], [60, 64], [80, 64], [70, 80]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="${INK}"/>`).join('')}${face(70, 48, 0.7)}`,
  mouth: `${BG('#F6E2DC')}${P('M30 50Q46 26 70 36Q94 26 110 50Q92 80 70 80Q48 80 30 50Z', '#E8506A', 3)}${P('M38 50Q70 44 102 50Q90 70 70 70Q50 70 38 50Z', '#5A1E2E', 2.4)}${P('M44 50Q70 46 96 50L94 56Q70 52 46 56Z', '#FFFFFF', 2)}${P('M54 66Q70 56 86 66Q78 70 70 70Q62 70 54 66Z', '#FF8FA3', 2)}${P('M48 36Q58 32 64 36', 'none', 2)}<ellipse cx="54" cy="72" rx="6" ry="2.4" fill="#FFFFFF" opacity=".55"/>`,
  hand: `${BG('#E6EAF5')}${[[50, 24, 36], [61, 16, 44], [72, 18, 42], [83, 26, 34]].map(([x, y, hh]) => R(x, y, 10, hh, SKIN, 5, 2.2)).join('')}${R(48, 46, 46, 40, SKIN, 16)}${P('M50 70Q36 62 32 50Q34 44 40 48L50 58', SKIN, 2.2)}${face(71, 66, 0.6)}${P('M104 30Q112 40 104 50M112 24Q124 40 112 56', 'none', 2.2)}`,
  octopus: `${BG('#D9F5EF')}${[[-1, 26, 52], [-1, 34, 62], [-1, 46, 70], [-1, 60, 74], [1, 80, 74], [1, 94, 70], [1, 106, 62], [1, 114, 52]].map(([d, x, y]) => { const q = `M${70 + (x - 70) * 0.45} 56Q${x} ${y - 6} ${x + d * 8} ${y + 14}Q${x + d * 12} ${y + 22} ${x + d * 4} ${y + 20}`; return `<path d="${q}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="${q}" fill="none" stroke="#F2A088" stroke-width="5.4" stroke-linecap="round"/>`; }).join('')}${P('M40 60Q34 10 70 10Q106 10 100 60Q86 66 70 66Q54 66 40 60Z', '#F2A088')}<ellipse cx="58" cy="38" rx="4.6" ry="6" fill="${INK}"/><ellipse cx="82" cy="38" rx="4.6" ry="6" fill="${INK}"/><circle cx="59.6" cy="35.6" r="1.8" fill="#fff"/><circle cx="83.6" cy="35.6" r="1.8" fill="#fff"/><ellipse cx="50" cy="49" rx="4" ry="2.2" fill="#E8506A" opacity=".5"/><ellipse cx="90" cy="49" rx="4" ry="2.2" fill="#E8506A" opacity=".5"/>${P('M64 49Q70 54 76 49', 'none', 2.4)}${C(54, 22, 3, '#FFC2B0', 0)}${C(84, 20, 4, '#FFC2B0', 0)}`,
  shoes: `${BG('#E6EAF5')}${[0, 54].map((dx) => `<g transform="translate(${dx} ${dx ? -8 : 6})">${P('M14 74L16 50Q28 46 34 54Q48 62 60 64Q66 74 60 80H16Q12 80 14 74Z', '#6F86C9')}${P('M14 80H62', 'none', 3.4)}${P('M24 56L30 52M28 62L34 57', 'none', 1.8)}</g>`).join('')}${face(98, 64, 0.5)}`,
  desk: `${BG('#E6EAF5')}${R(16, 44, 108, 10, '#C9A06C', 3)}${R(22, 54, 10, 40, '#B58E5C', 2)}${R(108, 54, 10, 40, '#B58E5C', 2)}${R(66, 54, 38, 20, '#C9A06C', 2)}${P('M79 64H91', 'none', 2.4)}${R(30, 30, 30, 14, '#6F86C9', 2)}${P('M88 44V24L98 16', 'none', 2.4)}${P('M92 12L108 20L100 30Z', SUN, 2)}`,
};

// ---- More word pictures (beginner review): new words, numbers and clearer look-alikes ----
const EYES = (x1: number, x2: number, y: number) => [x1, x2].map((x) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="4.4" fill="${INK}"/><circle cx="${x + 1.3}" cy="${y - 1.7}" r="1.3" fill="#fff"/>`).join('');
const CHEEKS = (x1: number, x2: number, y: number) => `<ellipse cx="${x1}" cy="${y}" rx="4" ry="2" fill="${BLUSH}"/><ellipse cx="${x2}" cy="${y}" rx="4" ry="2" fill="${BLUSH}"/>`;
const NUM_BG = ['#E8F4FF', '#FFF4D6', '#E3FAEF', '#FFE8EC', '#F6EDFF'];
const NUM_FG = ['#1CB0F6', '#E8A15A', '#2BD9B0', '#FF4B4B', '#A560E8'];
const numArt = (n: string, i: number) => `${BG(NUM_BG[i % 5])}${R(26, 14, 88, 72, PAPER, 16)}${T(70, n.length > 4 ? 60 : 66, n.length > 4 ? 24 : n.length > 2 ? 32 : 44, n, NUM_FG[i % 5])}`;
const steam = (x: number, y: number) => P(`M${x} ${y}Q${x - 6} ${y - 8} ${x} ${y - 14}M${x + 10} ${y}Q${x + 4} ${y - 8} ${x + 10} ${y - 14}`, 'none', 2.2);
const mug = (fill: string, top: string) => `${R(44, 40, 44, 46, fill, 10)}${P('M88 50Q104 50 104 62Q104 74 88 74', 'none', 4)}<ellipse cx="66" cy="44" rx="20" ry="5" fill="${top}" stroke="${INK}" stroke-width="2.4"/>`;
const MORE_ART: Record<string, string> = {
  ...Object.fromEntries(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '100', '1000', '10000'].map((n, i) => [`n${n}`, numArt(n === '10000' ? '10,000' : n === '1000' ? '1,000' : n, i)])),
  morning2: `${BG('#FFF1C9')}${P('M8 74A24 24 0 0 1 56 74Z', SUN)}${sparks([[32, 40, 0, -8], [12, 52, -6, -5], [52, 52, 6, -5]])}${P('M2 74H138', 'none', 2)}<g transform="rotate(14 82 98)">${person(82, 30, 36, 'yuki', TOPS.yuki, 98, { eyes: 'closed' })}</g>${person(116, 22, 36, 'gray', '#B58E5C', 98, { glasses: true })}`,
  thanks2: `${BG('#FFF1C9')}${R(14, 58, 32, 30, RED, 4)}${P('M30 58V88M14 72H46', 'none', 2)}${P('M30 58Q22 46 25 54Q27 59 30 58Q38 46 35 54Q33 59 30 58Z', SUN, 1.8)}<g transform="rotate(14 74 98)">${person(74, 28, 38, 'yuki', TOPS.yuki, 98, { eyes: 'closed' })}</g>${person(114, 20, 38, 'gray', '#B58E5C', 98, { glasses: true, mouth: 'open' })}`,
  please: `${BG('#E3FAEF')}<g transform="rotate(22 70 98)">${person(70, 20, 50, 'leo', TOPS.leo, 98, { eyes: 'closed' })}</g>${heart(112, 26, 0.9)}${heart(26, 34, 0.7)}${sparks([[110, 52, 8, 0], [30, 58, -8, 0]])}`,
  nihongo: `${BG('#E6EAF5')}${P('M24 14H116Q126 14 126 24V60Q126 70 116 70H62L44 88V70H24Q14 70 14 60V24Q14 14 24 14Z', PAPER)}${C(70, 42, 14, RED)}${sparks([[30, 26, -4, -4], [112, 26, 4, -4]])}`,
  cake2: '',
  cat: `${BG('#FFF4D6')}${P('M40 46L44 16L64 34Z', '#F2A088')}${P('M100 46L96 16L76 34Z', '#F2A088')}<ellipse cx="70" cy="58" rx="36" ry="30" fill="#F2A088" stroke="${INK}" stroke-width="3"/>${EYES(58, 82, 54)}${CHEEKS(50, 90, 66)}${P('M64 66Q70 71 76 66', 'none', 2)}${P('M36 60H18M36 66L20 70M104 60H122M104 66L120 70', 'none', 2)}`,
  dog: `${BG('#E8F4FF')}<ellipse cx="70" cy="56" rx="32" ry="30" fill="#E8C49A" stroke="${INK}" stroke-width="3"/>${P('M42 34Q26 36 30 66Q40 62 44 46Z', '#B58E5C')}${P('M98 34Q114 36 110 66Q100 62 96 46Z', '#B58E5C')}${EYES(58, 82, 52)}<ellipse cx="70" cy="66" rx="7" ry="5" fill="${INK}"/>${P('M70 71V76M62 78Q70 84 78 78', 'none', 2)}${CHEEKS(48, 92, 66)}`,
  fish: `${BG('#E8F4FF')}${P('M24 50Q60 14 100 50Q60 86 24 50Z', '#49C0F8')}${P('M100 50L124 30V70Z', '#49C0F8')}<ellipse cx="44" cy="46" rx="3.4" ry="4.4" fill="${INK}"/><circle cx="45.3" cy="44.3" r="1.3" fill="#fff"/>${P('M60 34Q66 50 60 66M74 32Q80 50 74 68', 'none', 2)}${P('M30 56Q34 60 38 56', 'none', 2)}`,
  money: `${BG('#FFF4D6')}${[[44, 70], [44, 58], [44, 46], [92, 70], [92, 58]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="8" fill="${SUN}" stroke="${INK}" stroke-width="2.4"/>`).join('')}${C(84, 30, 16, SUN)}${T(84, 37, 18, '¥', '#7A5600')}`,
  book: `${BG('#E8F4FF')}${P('M70 26Q50 16 24 20V82Q50 78 70 88Q90 78 116 82V20Q90 16 70 26Z', PAPER)}${P('M70 26V88', 'none', 2.4)}${P('M34 36Q48 34 60 38M34 48Q48 46 60 50M80 38Q92 34 106 36M80 50Q92 46 106 48', 'none', 1.8)}`,
  bag: `${BG('#FFE8EC')}${P('M50 40V30Q50 18 70 18Q90 18 90 30V40', 'none', 4)}${R(30, 38, 80, 52, '#FF7B5C', 12)}${R(30, 38, 80, 16, '#FF5C6C', 8, 2.4)}${R(62, 48, 16, 12, SUN, 3, 2)}`,
  watch: `${BG('#F6EDFF')}${R(56, 6, 28, 88, '#A560E8', 8)}${C(70, 50, 24, PAPER)}${P('M70 50V36M70 50L80 56', 'none', 3)}${C(70, 50, 2.4, INK, 1)}`,
  wallet: `${BG('#E3FAEF')}${R(22, 30, 96, 56, '#2E6B4F', 10)}${P('M22 46H118', 'none', 2.4)}${R(84, 52, 34, 20, '#58CC02', 8, 2.4)}${C(96, 62, 3, SUN, 1.6)}${R(32, 22, 40, 16, '#E8F4FF', 3, 2)}`,
  glasses: `${BG('#E8F4FF')}${C(44, 52, 20, '#C8EBFF')}${C(96, 52, 20, '#C8EBFF')}${P('M64 50Q70 44 76 50M24 48L10 40M116 48L130 40', 'none', 3)}${P('M34 44L40 40M86 44L92 40', 'none', 2).replace(INK, '#fff')}`,
  flower: `${BG('#E3FAEF')}${P('M70 60V96M70 80Q54 72 50 82Q60 90 70 84', '#58CC02', 3)}${[0, 72, 144, 216, 288].map((a) => C(70 + 16 * Math.cos((a * Math.PI) / 180), 40 + 16 * Math.sin((a * Math.PI) / 180), 12, '#FF9FB2', 2.4)).join('')}${C(70, 40, 9, SUN, 2.4)}`,
  star: `${BG('#2F3F78')}${star(70, 52, 36)}${star(118, 20, 6)}${star(22, 26, 5)}${star(28, 82, 4)}`,
  ear: `${BG('#FFE8EC')}${P('M58 20Q96 14 100 48Q102 70 82 78Q76 90 64 90Q52 88 56 76Q62 66 58 56Q42 46 58 20Z', SKIN)}${P('M66 34Q86 30 86 48Q86 60 74 62Q68 56 72 50', 'none', 2.4)}${P('M112 36Q120 50 112 64M120 28Q132 50 120 72', 'none', 2.2)}`,
  bug: `${BG('#E3FAEF')}${C(70, 58, 30, '#FF4B4B')}${P('M70 28V88', 'none', 2.4)}${[[56, 50], [84, 50], [54, 70], [86, 70]].map(([x, y]) => C(x, y, 5, INK, 1)).join('')}${C(70, 28, 13, '#2B2F4F')}${C(64, 27, 3, '#fff', 0)}${C(76, 27, 3, '#fff', 0)}${P('M62 18L54 6M78 18L86 6', 'none', 2.4)}`,
  coffee: `${BG('#FFF4D6')}${mug('#8A5A3C', '#5A3A24')}${steam(58, 32)}${steam(74, 30)}`,
  tea: `${BG('#E3FAEF')}${P('M36 46Q36 86 70 86Q104 86 104 46Z', '#9ED9CC')}<ellipse cx="70" cy="46" rx="34" ry="8" fill="#58CC02" stroke="${INK}" stroke-width="2.4"/>${P('M50 66H90', 'none', 2)}${steam(62, 36)}`,
  water: `${BG('#E8F4FF')}${P('M40 18L48 90H92L100 18Z', '#FFFFFF')}${P('M43 40L48 90H92L97 40Q84 46 70 40Q56 34 43 40Z', '#49C0F8', 2.4)}${C(62, 62, 3, '#fff', 0)}${C(76, 74, 2.4, '#fff', 0)}`,
  bread: `${BG('#FFF4D6')}${P('M22 76V52Q22 28 50 30Q60 20 70 28Q80 20 90 30Q118 28 118 52V76Q118 86 108 86H32Q22 86 22 76Z', '#E8A15A')}${P('M46 44Q52 52 48 60M70 40Q76 50 72 60M94 44Q100 52 96 60', 'none', 2.2)}`,
  shortcake: `${BG('#FFE8EC')}${P('M20 80L104 80L104 50L20 70Z', '#FFF4D6')}${P('M20 70L104 50L104 58L20 78Z', '#FF9FB2', 2)}${P('M20 70L56 30L104 50Z', PAPER)}${C(64, 32, 10, '#FF4B4B', 2.4)}${P('M60 22L64 16L68 22', '#58CC02', 2)}`,
  mountain: `${BG('#E8F4FF')}${P('M8 90L52 26L96 90Z', '#58CC02')}${P('M52 90L92 34L132 90Z', '#2BD9B0')}${P('M42 40L52 26L62 40L57 44L52 38L47 44Z', PAPER, 2)}${P('M84 46L92 34L100 46L96 49L92 44L88 49Z', PAPER, 2)}${C(116, 20, 8, SUN, 2)}`,
  car: `${BG('#E8F4FF')}${P('M14 72V58Q14 50 24 48L42 30H96L114 48Q126 50 126 60V72Z', '#FF4B4B')}${P('M48 36H68V48H38ZM74 36H92L102 48H74Z', '#C8EBFF', 2)}${C(40, 74, 11, '#2B2F4F')}${C(100, 74, 11, '#2B2F4F')}${C(40, 74, 4, '#ccc', 1)}${C(100, 74, 4, '#ccc', 1)}`,
  monkey: `${BG('#FFF4D6')}${C(34, 50, 12, '#F2B8A8')}${C(106, 50, 12, '#F2B8A8')}${C(70, 52, 32, '#B9773A')}${P('M50 52Q50 36 62 40Q70 34 78 40Q90 36 90 52Q90 76 70 78Q50 76 50 52Z', '#F2C9A0', 2.4)}${EYES(62, 78, 50)}${P('M64 66Q70 70 76 66', 'none', 2)}`,
  sky: `${BG('#9ED9F5')}${P('M20 70Q20 56 34 56Q38 42 54 46Q64 36 76 48Q92 46 92 60Q104 60 104 70Z', PAPER)}${P('M86 34Q86 26 94 26Q98 18 108 22Q118 20 120 30Q128 30 128 36H86Z', PAPER, 2)}${sparks([[24, 22, -4, -4], [36, 16, 0, -6]])}`,
  yen: `${BG('#FFF4D6')}${C(70, 50, 34, SUN)}${C(70, 50, 26, 'none', 2)}${T(70, 64, 38, '¥', '#7A5600')}`,
  pricetag: `${BG('#E3FAEF')}${P('M34 30H96L118 50L96 70H34Q26 70 26 62V38Q26 30 34 30Z', '#FFC800')}${C(102, 50, 5, PAPER, 2)}${T(62, 62, 30, '¥?', '#7A5600')}${P('M107 50Q124 40 128 20', 'none', 2)}`,
  pig: `${BG('#FFE8EC')}${P('M40 34L36 14L56 26Z', '#FF9FB2')}${P('M100 34L104 14L84 26Z', '#FF9FB2')}<ellipse cx="70" cy="54" rx="38" ry="32" fill="#FF9FB2" stroke="${INK}" stroke-width="3"/>${EYES(54, 86, 46)}<ellipse cx="70" cy="64" rx="13" ry="9" fill="#FF7B9C" stroke="${INK}" stroke-width="2.2"/>${C(65, 64, 2.4, INK, 0)}${C(75, 64, 2.4, INK, 0)}`,
  rice: `${BG('#E8F4FF')}${P('M48 50Q48 22 70 22Q92 22 92 50Z', '#FFFFFF')}${[[60, 32], [72, 28], [82, 36], [64, 42], [76, 42]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.6" fill="#E6EAF5"/>`).join('')}${P('M28 50H112Q110 86 70 88Q30 86 28 50Z', '#1CB0F6')}${P('M36 62H104', 'none', 2).replace(INK, '#fff')}${P('M98 20L120 40M104 16L126 36', 'none', 3).replace(INK, '#8A5A2B')}`,
  tempura: `${BG('#FFF4D6')}<ellipse cx="70" cy="84" rx="54" ry="9" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>${P('M24 66Q30 34 70 34Q104 34 112 52Q100 50 98 62Q86 72 60 74Q32 76 24 66Z', '#F2B544')}${P('M112 52L126 38L122 58Z', '#FF7B5C')}${[[42, 50], [56, 44], [70, 52], [84, 46], [96, 56]].map(([x, y]) => C(x, y, 2.6, '#E8A15A', 1.4)).join('')}`,
  cocoa: `${BG('#FFE8EC')}${mug('#FF7B9C', '#8A5A3C')}${R(56, 36, 10, 8, PAPER, 3, 1.6)}${R(70, 34, 10, 8, PAPER, 3, 1.6)}${steam(60, 26)}`,
  kiwi: `${BG('#E3FAEF')}${C(70, 50, 34, '#7A5A2E')}${C(70, 50, 28, '#7FE0B8', 2)}${C(70, 50, 9, '#FFF4D6', 1.6)}${Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5; return `<ellipse cx="${(70 + 16 * Math.cos(a)).toFixed(1)}" cy="${(50 + 16 * Math.sin(a)).toFixed(1)}" rx="1.6" ry="2.6" fill="${INK}"/>`; }).join('')}`,
  icecream: `${BG('#F6EDFF')}${P('M50 52L70 94L90 52Z', '#E8A15A')}${P('M56 60L80 60M60 70L76 70', 'none', 1.6)}${C(60, 44, 14, '#FF9FB2')}${C(80, 44, 14, '#FFF4D6')}${C(70, 30, 14, '#8A5A3C')}`,
  tennis: `${BG('#E3FAEF')}<ellipse cx="58" cy="40" rx="26" ry="30" fill="#E8F4FF" stroke="${INK}" stroke-width="3" transform="rotate(-30 58 40)"/>${P('M44 22L72 58M36 34L64 66M58 16L80 46', 'none', 1.2)}${P('M74 62L104 94', 'none', 7).replace(INK, '#1CB0F6')}${C(108, 30, 11, '#C8F000')}${P('M98 26Q108 32 118 26', 'none', 1.6)}`,
  necktie: `${BG('#E8F4FF')}${P('M58 12H82L76 28H64Z', '#FF4B4B')}${P('M64 28H76L90 76L70 94L50 76Z', '#FF4B4B')}${P('M60 50L84 44M56 66L88 58', 'none', 2.4).replace(INK, '#FFC800')}`,
  tuna: `${BG('#E8F4FF')}<ellipse cx="70" cy="34" rx="40" ry="10" fill="#ccc" stroke="${INK}" stroke-width="2.4"/>${P('M30 34V72Q30 84 70 84Q110 84 110 72V34', '#1CB0F6')}${P('M44 56Q62 42 80 56Q62 70 44 56ZM80 56L94 46V66Z', '#FFF4D6', 2)}`,
  taco: `${BG('#FFF4D6')}${P('M20 76Q20 28 70 28Q120 28 120 76Z', '#F2B544')}${P('M28 64Q40 48 54 56Q64 44 78 54Q90 44 102 56Q110 54 114 64', '#58CC02', 2.4)}${C(52, 62, 5, '#FF4B4B', 1.8)}${C(84, 62, 5, '#FF4B4B', 1.8)}`,
  hotel: `${BG('#E8F4FF')}${R(36, 16, 68, 78, '#A560E8', 4)}${[26, 42, 58].flatMap((y) => [46, 64, 82].map((x) => R(x, y, 12, 10, '#C8EBFF', 2, 1.6))).join('')}${R(60, 74, 20, 20, '#FFC800', 2, 2)}${R(46, 4, 48, 14, '#FF4B4B', 4, 2)}${T(70, 15, 11, 'HOTEL', '#fff')}`,
  camera: `${BG('#FFE8EC')}${R(22, 32, 96, 56, '#2B2F4F', 10)}${R(40, 24, 26, 12, '#2B2F4F', 3)}${C(70, 60, 20, '#8FA3FF')}${C(70, 60, 11, '#1CB0F6')}${C(66, 56, 3, '#fff', 0)}${R(96, 40, 14, 8, '#FFC800', 2, 1.6)}`,
  knife: `${BG('#E3FAEF')}${P('M18 70L84 40Q98 36 94 48L30 78Z', '#E8F4FF')}${R(90, 34, 36, 14, '#8A5A3C', 6)}`.replace('M18 70L84 40Q98 36 94 48L30 78Z', 'M14 62Q60 36 92 44V58L22 70Q12 70 14 62Z').replace(`${R(90, 34, 36, 14, '#8A5A3C', 6)}`, `${R(92, 42, 36, 16, '#8A5A3C', 6)}`),
  milk: `${BG('#E8F4FF')}${P('M46 34L56 14H84L94 34V92H46Z', PAPER)}${P('M46 34H94', 'none', 2.4)}${R(52, 48, 36, 26, '#1CB0F6', 6, 2)}${C(70, 61, 6, PAPER, 1.6)}`,
  tv: `${BG('#F6EDFF')}${R(18, 26, 104, 62, '#2B2F4F', 10)}${R(26, 34, 88, 46, '#49C0F8', 4, 2)}${P('M56 26L44 8M84 26L96 8', 'none', 3)}${P('M30 70Q50 56 66 66T108 58V78H30Z', '#58CC02', 2)}${R(50, 88, 40, 6, '#2B2F4F', 3, 2)}`,
  laptop: `${BG('#E3FAEF')}${R(30, 18, 80, 54, '#2B2F4F', 6)}${R(36, 24, 68, 42, '#C8EBFF', 2, 2)}${P('M14 82L30 72H110L126 82Q126 88 120 88H20Q14 88 14 82Z', '#8A93B0')}`,
  menu: `${BG('#FFF4D6')}${P('M70 24Q50 16 26 20V84Q50 80 70 88Q90 80 114 84V20Q90 16 70 24Z', '#FF7B5C')}${R(32, 28, 32, 50, PAPER, 3, 2)}${R(76, 28, 32, 50, PAPER, 3, 2)}${P('M36 38H58M36 48H54M36 58H58M80 38H102M80 48H98M80 58H102', 'none', 1.8)}${C(92, 70, 4, SUN, 1.4)}`,
  juice: `${BG('#FFF4D6')}${P('M44 26L52 92H88L96 26Z', '#FFFFFF')}${P('M46 40L52 92H88L94 40Z', '#FFC800', 2.4)}${P('M76 40L90 6', 'none', 4).replace(INK, '#FF4B4B')}${C(58, 30, 10, '#FF7B5C', 2)}`,
  fork: `${BG('#E8F4FF')}${P('M54 12V38Q54 50 66 52V94H74V52Q86 50 86 38V12', '#C8CFE0')}${P('M64 12V38M76 12V38', 'none', 2.4)}`,
  partyart: `${BG('#F6EDFF')}${[[40, 34, '#FF4B4B'], [70, 26, '#FFC800'], [100, 34, '#1CB0F6']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="17" fill="${c}" stroke="${INK}" stroke-width="2.4"/>${P(`M${x} ${Number(y) + 17}Q${Number(x) - 4} ${Number(y) + 40} ${x} ${Number(y) + 62}`, 'none', 1.6)}`).join('')}${[[20, 80, '#58CC02'], [56, 88, '#FF9FB2'], [88, 84, '#A560E8'], [120, 78, '#FFC800']].map(([x, y, c]) => R(Number(x), Number(y), 8, 5, String(c), 1, 1.2)).join('')}`,
};
MORE_ART.cake2 = WORD_ART.cake.replace('>19<', '>?<');
// Clearer look-alikes: konnichiwa is a midday sun with two friends waving, sayounara a wave goodbye at a door,
// and ~jin a person in front of the world (any nationality, not just Japan).
MORE_ART.sun = `${BG('#E8F4FF')}${C(70, 22, 13, SUN)}${sparks([[70, 2, 0, 4], [48, 14, 4, 3], [92, 14, -4, 3], [44, 30, 5, 0], [96, 30, -5, 0]])}${person(32, 40, 36, 'yuki', TOPS.yuki, 98, { mouth: 'open' })}${arm(42, 72, 54, 50, TOPS.yuki)}${person(108, 40, 36, 'mei', TOPS.mei, 98, { mouth: 'open', eyes: 'happy' })}${arm(98, 72, 86, 50, TOPS.mei)}`;
MORE_ART.wave = `${BG('#FFE8EC')}${R(10, 16, 34, 82, '#B58E5C', 4)}${C(36, 60, 2.4, INK, 1)}${person(84, 16, 46, 'leo', TOPS.leo, 98, { mouth: 'open', eyes: 'happy' })}${arm(98, 62, 116, 32, TOPS.leo)}${P('M122 22Q128 30 124 38M128 16Q136 30 130 44', 'none', 2)}${P('M52 92H68M56 84H66', 'none', 2)}`;
MORE_ART.jin = `${BG('#E8F4FF')}${C(96, 46, 30, '#49C0F8')}${P('M80 30Q94 26 94 40Q92 52 82 50Q74 42 80 30Z', '#58CC02', 2)}${P('M100 52Q114 48 118 58Q114 72 102 68Q96 60 100 52Z', '#58CC02', 2)}${person(48, 14, 50, 'mei', TOPS.mei, 98, { mouth: 'open' })}`;
Object.assign(WORD_ART, MORE_ART);

for (const k of ['phone', 'umbrella', 'sushi', 'chair', 'watermelon', 'shoes']) WORD_ART[k] = `${BG(k === 'sushi' ? '#FFF3E0' : k === 'umbrella' ? '#FFEFEF' : k === 'watermelon' ? '#FFF0F2' : k === 'phone' ? '#F6EDFF' : '#E8F7FF')}<g transform="translate(22 -4) scale(.9)">${POP[k]}</g>`;

// ---- Story panels (170 x 140). Speech bubbles are laid over them in HTML. ----
const PANEL_ART: Record<string, string> = {
  cafe: `<rect width="170" height="140" fill="#FFF4D6"/>${R(16, 14, 70, 44, '#2E6B4F', 6)}${T(51, 32, 11, 'MENU', '#fff')}${P('M28 42H74M28 50H64', 'none', 1.6).replace(/#2B2F4F/g, '#fff')}${R(0, 104, 170, 36, '#C98A4B', 0, 2.4)}${R(104, 84, 22, 20, PAPER, 4, 2)}${P('M126 90Q134 90 134 96Q134 102 126 102', 'none', 2.4)}${person(132, 40, 40, 'leo', TOPS.leo, 104, { mouth: 'open' })}`,
  shop: `<rect width="170" height="140" fill="#E8F4FF"/>${R(8, 12, 92, 84, PAPER, 4)}${P('M8 40H100M8 68H100', 'none', 2.4)}${R(16, 20, 16, 20, '#FF4B4B', 2, 2)}${R(40, 24, 22, 16, '#1CB0F6', 2, 2)}${C(80, 30, 9, '#FFC800', 2)}${R(18, 50, 26, 18, '#A560E8', 3, 2)}${R(54, 46, 14, 22, '#58CC02', 3, 2)}${R(76, 52, 18, 16, '#FF9FB2', 3, 2)}${R(0, 108, 170, 32, '#C98A4B', 0, 2.4)}${person(134, 44, 42, 'mei', TOPS.mei, 108, { mouth: 'open' })}`,
  s1p1: `<rect width="170" height="140" fill="${PAPER}"/>${R(118, 30, 40, 92, '#E6EAF5', 0, 2)}<circle cx="126" cy="80" r="2.6" fill="${INK}"/>${T(138, 46, 10, 'りょう', '#34468A')}${P('M0 122H170', 'none', 2)}${person(56, 52, 50, 'leo', TOPS.leo, 122, { mouth: 'open' })}${R(86, 96, 24, 26, '#E5B8AA', 4, 2.2)}${P('M93 96V90H103V96', 'none', 2.2)}`,
  s1p2: `<rect width="170" height="140" fill="${PAPER}"/>${sparks([[30, 70, 6, 4], [140, 66, -6, 4], [34, 96, 8, 0], [136, 92, -8, 0]])}<g transform="rotate(18 85 140)">${person(85, 56, 54, 'yuki', TOPS.yuki, 140, { eyes: 'closed' })}</g>`,
  s1p3: `<rect width="170" height="140" fill="#E6EAF5"/>${person(85, 40, 84, 'leo', TOPS.leo, 140, { mouth: 'open', eyes: 'happy' })}`,
  s1p4: `<rect width="170" height="140" fill="${PAPER}"/>${person(46, 68, 42, 'leo', TOPS.leo, 140, { mouth: 'o' })}${sweat(72, 66)}${person(118, 52, 56, 'yuki', TOPS.yuki, 140)}`,
  s2p1: `<rect width="170" height="140" fill="#E6EAF5"/>${P('M0 44Q42 58 85 44T170 44', 'none', 1.6)}${[14, 50, 120, 156].map((x) => P(`M${x - 7} ${x < 85 ? 48 : 48}L${x} 60L${x + 7} 48Z`, SUN, 1.4)).join('')}<ellipse cx="22" cy="86" rx="11" ry="14" fill="#9ED9CC" stroke="${INK}" stroke-width="2"/>${P('M22 100Q18 116 24 140', 'none', 1.4)}${person(88, 60, 52, 'mei', TOPS.mei, 140, { mouth: 'open' })}${arm(104, 106, 124, 80, TOPS.mei)}`,
  s2p2: `<rect width="170" height="140" fill="${PAPER}"/>${person(56, 44, 66, 'leo', TOPS.leo, 140, { mouth: 'o' })}${person(136, 76, 38, 'mei', TOPS.mei, 140)}`,
  s2p3: `<rect width="170" height="140" fill="#FFF1C9"/>${person(85, 42, 80, 'mei', TOPS.mei, 140, { eyes: 'happy', mouth: 'open' })}${R(110, 104, 18, 22, '#A8C8F0', 3, 2)}`,
  s2p4: `<rect width="170" height="140" fill="${PAPER}"/>${person(60, 58, 52, 'yuki', TOPS.yuki, 140, { eyes: 'happy', mouth: 'open' })}${person(112, 58, 52, 'mei', TOPS.mei, 140, { eyes: 'happy' })}${heart(86, 58, 1)}`,
};

// ---- Scenes ----
const SCENES: Record<string, [string, string]> = {
  party: ['0 0 344 120', `<rect width="344" height="120" fill="#E6EAF5"/>${P('M0 14Q43 34 86 14T172 14T258 14T344 14', 'none', 1.6)}${[28, 72, 116, 228, 272, 316].map((x) => P(`M${x - 8} 20L${x} 34L${x + 8} 22`, SUN, 1.6)).join('')}${R(128, 34, 88, 26, PAPER, 6, 2)}${T(172, 53, 15, 'ようこそ', '#4A5FA8')}<ellipse cx="40" cy="70" rx="13" ry="16" fill="#9ED9CC" stroke="${INK}" stroke-width="2"/>${P('M40 86Q36 100 42 118', 'none', 1.4)}<ellipse cx="66" cy="62" rx="13" ry="16" fill="${BLUSH}" stroke="${INK}" stroke-width="2"/>${P('M66 78Q70 96 64 118', 'none', 1.4)}${R(250, 92, 80, 28, PAPER, 0, 2)}${R(262, 80, 12, 12, '#A8C8F0', 0, 1.8)}${R(298, 84, 10, 8, '#A8C8F0', 0, 1.8)}${person(176, 58, 58, 'mei', TOPS.mei, 122, { mouth: 'open' })}${arm(192, 104, 214, 76, TOPS.mei)}`],
  bowing: ['0 0 344 130', `<rect width="344" height="130" fill="#E6EAF5"/>${P('M0 116H344', 'none', 2)}<g transform="rotate(16 86 116)">${person(86, 22, 54, 'yuki', TOPS.yuki, 116, { eyes: 'closed' })}</g><g transform="rotate(-16 258 116)">${person(258, 22, 54, 'leo', TOPS.leo, 116, { eyes: 'closed' })}</g>${R(122, 86, 100, 24, PAPER, 12, 2)}${T(172, 103, 14, 'はじめまして', '#4A5FA8')}${sparks([[152, 50, -8, -4], [192, 50, 8, -4], [150, 62, -10, 0], [194, 62, 10, 0]])}`],
  names: ['0 0 344 130', `<rect width="344" height="130" fill="#E6EAF5"/>${R(80, 22, 184, 88, PAPER, 12)}${R(80, 22, 184, 24, '#4A5FA8', 12, 2.4)}${T(172, 40, 13, 'はじめまして', PAPER)}${R(100, 62, 74, 34, '#FFF1C9', 8, 0)}${T(137, 88, 26, 'やまだ')}${T(214, 88, 26, 'ゆき')}${head(18, 40, 56, 'yuki', { eyes: 'happy', mouth: 'open' })}${T(137, 122, 11, 'family name', '#34468A')}${T(214, 122, 11, 'given name', '#34468A')}`],
  tanuki: ['0 0 92 92', `<circle cx="46" cy="46" r="44" fill="#FFF4D1" stroke="#FFC800" stroke-width="3"/><g transform="translate(4 2) scale(.7)">${POP.tanuki}</g>`],
  mei: ['0 0 60 60', head(0, 0, 60, 'mei')],
};

export const hasArt = (key: string) => key in WORD_ART || key in PANEL_ART || key in SCENES;
/** Returns an <svg> element for a word picture, story panel or scene. */
export function art(key: string, label = '', cls = 'art'): SVGSVGElement {
  const [vb, inner] = WORD_ART[key] ? ['0 0 140 100', WORD_ART[key]] : PANEL_ART[key] ? ['0 0 170 140', PANEL_ART[key]] : SCENES[key] ?? ['0 0 10 10', ''];
  const t = document.createElement('template');
  t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${cls}" ${label ? `role="img" aria-label="${label.replace(/"/g, '')}"` : 'aria-hidden="true"'}>${vivid(inner)}</svg>`;
  return t.content.firstChild as SVGSVGElement;
}
