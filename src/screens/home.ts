import { UNITS } from '../data/kana';
import { COURSE, CourseUnit, Stop } from '../data/course';
import { REGIONS } from '../data/climb';
import { h, jp, bar } from '../ui';
import { art } from '../art';
import { rj } from '../script';
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
import { S, save, currentStreak, dueCards, levelOf, weekDots, weekStreak, dayKey, GOOD_WEEK } from '../state';
import { stopDone, stopUnlocked, nextStop, currentUnit, courseUnitDone, courseUnitUnlocked, currentRegion, unitsOf, gateOpen, stampCount } from '../progress';
import { startBoss } from './lesson';
import { startStop, startUnitBoss, startGate } from './stops';
import { showTab } from '../nav';
import { openClimb } from './climb';

export function header() {
  const st = currentStreak();
  return h('div', { class: 'head' },
    h('div', { class: 'logo' }, jp('道'), ' Michi'),
    h('div', { class: 'chips' },
      h('div', { class: 'chip lv' }, `Lv ${levelOf(S.xp)}`),
      h('div', { class: 'chip st', 'aria-label': `${st} day streak${S.charms ? `, ${S.charms} omamori charm${S.charms > 1 ? 's' : ''}` : ''}` }, `${st} day${st === 1 ? '' : 's'}`, S.charms ? h('span', { class: 'jp charmmini' }, ' 守'.repeat(S.charms)) : null),
      h('div', { class: 'chip xp' }, `${S.xp} XP`)));
}

let viewing: string | null = null;
const openParts = new Set<string>();
const ICON: Record<Stop['kind'], string> = { kana: '', story: '話', words: '語', grammar: '文', mission: '任', culture: '化' };
const icon = (s: Stop) => (s.kind === 'kana' ? [...s.title.replace('Kana: ', '')][0] : ICON[s.kind]);

function stopRow(s: Stop, next: Stop | undefined) {
  const done = stopDone(s), open = stopUnlocked(s), cur = s === next;
  const sub = done ? (s.id in S.done ? `Done · best ${S.done[s.id]}%` : 'Skipped with the kana boss') : cur ? 'Up next · about 3 min' : open ? 'Ready' : 'Locked';
  return h('button', { class: `stop ${done ? 'done' : ''} ${cur ? 'cur' : ''} ${open ? '' : 'lock'} k-${s.kind}`, disabled: !open, onclick: () => startStop(s) },
    h('span', { class: 'ic jp', 'aria-hidden': 'true' }, done ? '✓' : icon(s)),
    h('span', { class: 't' }, h('b', null, s.kind === 'kana' ? s.title : rj(s.title)), h('small', null, sub)),
    cur ? h('span', { class: 'go' }, 'Start') : null);
}

/** The open unit under its trail node: what you'll be able to do, its parts and bosses. */
function unitDetail(u: CourseUnit) {
  const next = nextStop();
  const stops = u.parts.flatMap((p) => p.stops);
  const doneN = stops.filter(stopDone).length;
  const kanaBoss = UNITS.find((x) => x.id === u.kanaUnit)!;
  return h('div', { class: 'udetail' },
    h('div', { class: 'cando' }, h('div', { class: 'eyebrow' }, S.stamps[u.id] ? 'You can now' : 'After this unit you can'),
      u.cando.map((c) => h('div', { class: S.stamps[u.id] ? 'ok' : '' }, `${S.stamps[u.id] ? '✓' : '○'} ${c}`)),
      h('div', { style: { marginTop: '6px' } }, bar(doneN / stops.length)), h('small', null, `${doneN} of ${stops.length} stops`)),
    u.soon ? h('div', { class: 'note' }, h('b', null, 'Coming soon'), h('p', null, u.soon)) : null,
    ...u.parts.map((p, pi) => {
      const key = `${u.id}-${pi}`, pd = p.stops.filter(stopDone).length;
      const isOpen = openParts.has(key) || p.stops.includes(next!) || (u.parts.length === 1);
      return h('section', { class: `part ${isOpen ? 'open' : ''}` },
        h('button', { class: 'phead', 'aria-expanded': String(isOpen), onclick: () => { if (openParts.has(key)) openParts.delete(key); else openParts.add(key); showTab('home'); } },
          h('b', null, `Part ${pi + 1} · ${p.title}`), h('span', null, `${pd} of ${p.stops.length}`)),
        isOpen ? h('div', { class: 'stops' }, p.stops.map((s) => stopRow(s, next))) : null);
    }),
    S.bosses[kanaBoss.id] ? null : h('button', { class: 'boss row', onclick: () => startBoss(kanaBoss) },
      h('div', null, h('div', { class: 'eyebrow' }, `Already know ${u.kanaUnit === 'hira' ? 'hiragana' : 'katakana'}?`),
        h('div', { style: { fontSize: '15px', fontWeight: '800' } }, `Beat ${kanaBoss.boss.name} to skip the kana stops`)),
      jp(kanaBoss.boss.jp, 'big')),
    u.boss ? h('button', { class: 'boss row', onclick: () => startUnitBoss(u) },
      h('div', null, h('div', { class: 'eyebrow' }, 'Unit boss'), h('div', { style: { fontSize: '16px', fontWeight: '800' } }, u.boss.name),
        h('div', { style: { fontSize: '12px', color: 'var(--boss-sub)', marginTop: '2px' } }, S.stamps[u.id] ? 'Stamp earned. Rematch any time.' : courseUnitDone(u) ? `Win to earn the ${u.stamp} stamp` : 'Take it early to skip ahead')),
      art('tanuki', '', 'bossface')) : null);
}

function weekCard() {
  const dots = weekDots(), n = dots.filter(Boolean).length, ws = weekStreak();
  const today = (new Date().getDay() + 6) % 7;
  const saved = S.charmUsed === dayKey();
  return h('div', { class: 'card week' },
    h('div', { class: 'row' }, h('h3', null, `This week · ${n}/7 days`), h('small', null, ws ? `${ws} good week${ws === 1 ? '' : 's'} in a row` : `${GOOD_WEEK} days = good week`)),
    h('div', { class: 'dots' }, 'MTWTFSS'.split('').map((d, i) => h('span', { class: `${dots[i] ? 'on' : ''} ${i === today ? 'today' : ''}` }, d))),
    saved ? h('p', { class: 'charmnote' }, jp('守'), ' Your omamori charm saved your streak yesterday.') : null);
}

export function home(): HTMLElement {
  const cur = currentUnit();
  const sel = COURSE.find((x) => x.id === viewing) ?? cur;
  const due = dueCards().length;
  const r = currentRegion(), ri = REGIONS.indexOf(r), units = unitsOf(r);
  const calmBtn = h('button', { class: `calm ${S.settings.calm ? 'on' : ''}`, 'aria-pressed': String(S.settings.calm), onclick: () => { S.settings.calm = !S.settings.calm; save(); showTab('home'); } },
    jp('静'), S.settings.calm ? ' Calm mode on' : ' Calm mode');
  return h('main', { class: `screen ${S.settings.calm ? 'is-calm' : ''}` },
    header(),
    h('button', { class: 'rankcard', onclick: openClimb },
      h('span', { class: 'rbadge jp' }, r.rankJp[0]),
      h('span', { class: 't' }, h('b', null, `${r.rank} · ${r.level}`), h('small', null, `Rank ${ri + 1} of 5 · ${r.place}`),
        h('span', { class: 'rbar' }, bar(stampCount(r) / Math.max(1, r.plan.length), 'mint'))),
      h('span', { class: 'go2' }, 'Map')),
    weekCard(),
    h('div', { class: 'card row' },
      h('div', null, h('h3', null, 'Review'), h('p', null, due ? `${due} card${due === 1 ? ' is' : 's are'} ready to review` : Object.keys(S.cards).length ? 'All caught up. Nice!' : 'Finish a stop to start reviewing')),
      h('button', { class: 'btn mint sm', onclick: () => showTab('review') }, due ? 'Review' : 'Practice')),
    h('div', { class: 'row' }, h('div', { class: 'eyebrow' }, `${r.level} trail · ${r.place}`), calmBtn),
    h('div', { class: 'trail' }, r.plan.map((title, i) => {
      const u = units[i];
      const built = !!u, open = built && courseUnitUnlocked(u), done = built && !!S.stamps[u.id], isSel = u === sel;
      const cls = done ? 'done' : u === cur ? 'now' : open ? 'open' : 'lock';
      const sub = !built ? 'Coming later' : done ? `${u.stamp} stamp earned` : u === cur ? 'You are here' : open ? 'Open' : 'Locked';
      return [
        h('button', { class: `tnode ${cls} ${isSel ? 'sel' : ''} z${i % 4}`, disabled: !open, 'aria-expanded': open ? String(isSel) : null,
          onclick: () => { viewing = u === cur ? null : u.id; showTab('home'); } },
          h('span', { class: 'dot' }, done ? jp(u.stamp) : String(i + 1)),
          h('span', { class: 't' }, h('b', null, built ? `${cap(rj(u.jp))} · ${u.title}` : title), h('small', null, sub))),
        isSel ? unitDetail(u) : null,
      ];
    })),
    h('button', { class: `gate ${gateOpen(r) ? 'open' : ''}`, disabled: !gateOpen(r), onclick: () => startGate(r, units) },
      h('span', { class: 'gjp jp' }, '門'),
      h('span', null, h('b', null, `${r.rank}'s Gate · rank-up exam`),
        h('small', null, gateOpen(r) ? `Pass it to become a ${r.rank} (${r.rankJp}) and open ${REGIONS[ri + 1]?.place ?? 'the summit'}.` : `Opens when all ${r.plan.length} units have a stamp (${stampCount(r)} of ${r.plan.length}).`))));
}
