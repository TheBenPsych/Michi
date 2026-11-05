// Michi's hand-drawn art: soft chibi characters and kawaii objects with ink outlines.
// Everything is inline SVG so it is crisp at any size and works offline.
const INK = '#232A40', SKIN = '#FFF4EA', PAPER = '#FFFDF9', BLUSH = '#F2B8A8', SUN = '#FFE1A0', RED = '#C0573E';
const P = (d: string, fill = 'none', sw = 2.4) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const C = (cx: number, cy: number, r: number, fill: string, sw = 2.4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const R = (x: number, y: number, w: number, h: number, fill: string, rx = 0, sw = 2.4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const T = (x: number, y: number, s: number, txt: string, fill = INK) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Lexend, Zen Maru Gothic, sans-serif" font-weight="800" font-size="${s}" fill="${fill}">${txt}</text>`;
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
export const TOPS: Record<string, string> = { yuki: '#4A5FA8', leo: '#1A9E85', mei: '#D98C7A' };
interface HeadOpts { eyes?: 'open' | 'happy' | 'closed'; mouth?: 'smile' | 'open' | 'o' | 'flat'; glasses?: boolean }

/** A chibi head drawn in a 60x60 box, placed at (x, y) with size s. */
export function head(x: number, y: number, s: number, who: Who, o: HeadOpts = {}): string {
  const [hc, front, back] = HAIR[who];
  const eyes = o.eyes === 'happy' ? P('M19 38Q23 33 27 38M33 38Q37 33 41 38', 'none', 2.2)
    : o.eyes === 'closed' ? P('M19 37Q23 40 27 37M33 37Q37 40 41 37', 'none', 2.2)
    : `<ellipse cx="23" cy="36" rx="2.6" ry="3.6" fill="${INK}"/><ellipse cx="37" cy="36" rx="2.6" ry="3.6" fill="${INK}"/><circle cx="24" cy="34.6" r="1" fill="${PAPER}"/><circle cx="38" cy="34.6" r="1" fill="${PAPER}"/>`;
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
const face = (cx: number, cy: number, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})"><ellipse cx="-7" cy="0" rx="2.6" ry="3.4" fill="${INK}"/><ellipse cx="7" cy="0" rx="2.6" ry="3.4" fill="${INK}"/><ellipse cx="-12" cy="6" rx="3" ry="1.5" fill="${BLUSH}"/><ellipse cx="12" cy="6" rx="3" ry="1.5" fill="${BLUSH}"/>${P('M-4 7Q0 10 4 7', 'none', 2)}</g>`;
const flag = (inner: string) => `${P('M30 94V14', 'none', 3)}${C(30, 12, 3.5, SUN, 1.8)}<g transform="translate(32 18)">${inner}</g>`;

// ---- Word pictures (140 x 100) ----
const WORD_ART: Record<string, string> = {
  sunrise: `${BG('#FFF1C9')}${sparks([[70, 30, 0, -10], [44, 40, -8, -7], [96, 40, 8, -7], [32, 60, -10, -2], [108, 60, 10, -2]])}${P('M38 74A32 32 0 0 1 102 74Z', SUN)}<g transform="translate(70 60)">${P('M-11 0Q-7 3 -3 0M3 0Q7 3 11 0', 'none', 2)}<ellipse cx="0" cy="8" rx="2.4" ry="2.8" fill="${INK}"/></g>${P('M2 74Q36 64 70 74T138 72V86Q138 98 126 98H14Q2 98 2 86Z', '#9ED9CC')}`,
  sun: `${BG('#E6EAF5')}${sparks([[40, 6, 0, 6], [14, 32, 6, 0], [60, 32, 6, 0], [22, 14, 4, 4], [58, 14, -4, 4]])}${C(40, 34, 15, SUN)}${face(40, 34, 0.8)}${person(100, 26, 42, 'yuki', TOPS.yuki, 98, { mouth: 'open' })}${arm(112, 66, 126, 40, TOPS.yuki)}${sparks([[130, 30, 4, -4], [132, 42, 6, 0]])}`,
  moon: `${BG('#2F3F78')}${P('M78 18A32 32 0 1 0 98 76A26 26 0 1 1 78 18Z', SUN)}<g transform="translate(58 52)">${P('M-10 0Q-6 3 -2 0M4 0Q8 3 12 0', 'none', 2)}${P('M-1 8Q1 10 3 8', 'none', 1.8)}</g>${star(108, 26, 6)}${star(118, 62, 4)}${star(24, 22, 4)}${star(30, 80, 3)}`,
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
  mouth: `${BG('#F6E2DC')}${head(30, 8, 76, 'mei', { mouth: 'open' })}${P('M124 80L94 63M94 63L102 62M94 63L98 70', 'none', 2.8)}`,
  hand: `${BG('#E6EAF5')}${[[50, 24, 36], [61, 16, 44], [72, 18, 42], [83, 26, 34]].map(([x, y, hh]) => R(x, y, 10, hh, SKIN, 5, 2.2)).join('')}${R(48, 46, 46, 40, SKIN, 16)}${P('M50 70Q36 62 32 50Q34 44 40 48L50 58', SKIN, 2.2)}${face(71, 66, 0.6)}${P('M104 30Q112 40 104 50M112 24Q124 40 112 56', 'none', 2.2)}`,
  octopus: `${BG('#D9F5EF')}${[44, 57, 70, 83, 96].map((x, i) => `<path d="M${x} 58Q${x + (i % 2 ? 8 : -8)} 76 ${x} 92" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${x} 58Q${x + (i % 2 ? 8 : -8)} 76 ${x} 92" fill="none" stroke="#F2A088" stroke-width="5.6" stroke-linecap="round"/>`).join('')}${P('M40 58Q36 14 70 14Q104 14 100 58Z', '#F2A088')}${face(70, 42, 0.9)}${P('M100 26Q112 18 118 26', 'none', 2)}`,
  shoes: `${BG('#E6EAF5')}${[0, 54].map((dx) => `<g transform="translate(${dx} ${dx ? -8 : 6})">${P('M14 74L16 50Q28 46 34 54Q48 62 60 64Q66 74 60 80H16Q12 80 14 74Z', '#6F86C9')}${P('M14 80H62', 'none', 3.4)}${P('M24 56L30 52M28 62L34 57', 'none', 1.8)}</g>`).join('')}${face(98, 64, 0.5)}`,
  desk: `${BG('#E6EAF5')}${R(16, 44, 108, 10, '#C9A06C', 3)}${R(22, 54, 10, 40, '#B58E5C', 2)}${R(108, 54, 10, 40, '#B58E5C', 2)}${R(66, 54, 38, 20, '#C9A06C', 2)}${P('M79 64H91', 'none', 2.4)}${R(30, 30, 30, 14, '#6F86C9', 2)}${P('M88 44V24L98 16', 'none', 2.4)}${P('M92 12L108 20L100 30Z', SUN, 2)}`,
};

// ---- Story panels (170 x 140). Speech bubbles are laid over them in HTML. ----
const PANEL_ART: Record<string, string> = {
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
  tanuki: ['0 0 92 92', `<circle cx="46" cy="46" r="44" fill="#1B2030" stroke="#8FA3E8" stroke-width="3"/><circle cx="24" cy="28" r="9" fill="#8C7556" stroke="#E6E9F2" stroke-width="2.2"/><circle cx="68" cy="28" r="9" fill="#8C7556" stroke="#E6E9F2" stroke-width="2.2"/><circle cx="24" cy="28" r="4" fill="#4E3A2E"/><circle cx="68" cy="28" r="4" fill="#4E3A2E"/><ellipse cx="46" cy="52" rx="28" ry="25" fill="#B59A74" stroke="#E6E9F2" stroke-width="2.4"/><path d="M22 50Q30 40 40 48Q38 58 28 60Q22 58 22 50ZM70 50Q62 40 52 48Q54 58 64 60Q70 58 70 50Z" fill="#4E3A2E"/><path d="M30 46L38 50M62 46L54 50" stroke="#E6E9F2" stroke-width="2.4" stroke-linecap="round"/><circle cx="33" cy="52" r="2.6" fill="${PAPER}"/><circle cx="59" cy="52" r="2.6" fill="${PAPER}"/><ellipse cx="46" cy="64" rx="11" ry="8" fill="#F3EBD6"/><ellipse cx="46" cy="60" rx="4" ry="3" fill="${INK}"/><path d="M41 68Q46 65 51 68" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><path d="M46 26Q38 14 46 6Q56 14 46 26Z" fill="#3FBFA8" stroke="#E6E9F2" stroke-width="2"/><path d="M46 26V10" stroke="#E6E9F2" stroke-width="1.4"/>`],
  mei: ['0 0 60 60', head(0, 0, 60, 'mei')],
};

export const hasArt = (key: string) => key in WORD_ART || key in PANEL_ART || key in SCENES;
/** Returns an <svg> element for a word picture, story panel or scene. */
export function art(key: string, label = '', cls = 'art'): SVGSVGElement {
  const [vb, inner] = WORD_ART[key] ? ['0 0 140 100', WORD_ART[key]] : PANEL_ART[key] ? ['0 0 170 140', PANEL_ART[key]] : SCENES[key] ?? ['0 0 10 10', ''];
  const t = document.createElement('template');
  t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${cls}" ${label ? `role="img" aria-label="${label.replace(/"/g, '')}"` : 'aria-hidden="true"'}>${inner}</svg>`;
  return t.content.firstChild as SVGSVGElement;
}
