import { Lesson, Unit, Kana, NOTES, UNITS } from '../data/kana';
import { Q, buildLesson, buildBoss, retryQ, kanaOf } from '../lessonGen';
import { renderGame, Result } from '../games';
import { h, jp, bar, pct } from '../ui';
import { S, save, addXp, logMistake, markActive, addCards } from '../state';
import { sfx } from '../audio';
import { showFlow, showTab, Tab } from '../nav';
import { knownBefore } from '../progress';

type Kind = 'lesson' | 'boss' | 'practice' | 'drill';
interface Run { kind: Kind; lesson?: Lesson; unit?: Unit; queue: Q[]; pool: Kana[]; back: Tab }

const xpFor = (combo: number) => 10 + (combo >= 3 ? 5 : 0) + (combo >= 6 ? 5 : 0);

export const startLesson = (lesson: Lesson) => run({ kind: 'lesson', lesson, queue: buildLesson(lesson, knownBefore(lesson)), pool: [...lesson.kana, ...knownBefore(lesson)], back: 'home' });
export const startBoss = (unit: Unit) => run({ kind: 'boss', unit, queue: buildBoss(unit), pool: unit.lessons.flatMap((l) => l.kana), back: 'home' });
export const startPractice = (queue: Q[], pool: Kana[], back: Tab = 'review') => run({ kind: 'practice', queue, pool, back });
export const startDrill = (q: Q, back: Tab) => run({ kind: 'drill', queue: [q], pool: [], back });

function run(r: Run) {
  let i = 0, hearts = 3, combo = 0, best = 0, xp = 0, graded = 0, right = 0;
  const missed = new Map<string, Kana>();
  const hp = r.kind === 'boss' ? r.queue.length : 0;
  let bossHp = hp;
  // Hearts only in boss fights: practice stays relaxed and mistakes just come back later.
  const usesHearts = r.kind === 'boss' && !S.settings.calm;

  const quit = () => { if (i === 0 || r.kind === 'drill' || confirm('Leave this lesson? Progress in it will be lost.')) showTab(r.back); };

  const render = () => {
    const q = r.queue[i];
    const screen = h('div', { class: 'screen flow' });
    const oni = r.kind === 'boss' ? h('div', { class: 'oni' }, jp(r.unit!.boss.jp, 'face'), bar(bossHp / hp, 'bad')) : null;
    const top = h('div', { class: 'ltop' },
      h('button', { class: 'icon-btn', 'aria-label': 'Close lesson', onclick: quit }, '✕'),
      oni ?? bar(i / r.queue.length),
      usesHearts ? h('div', { class: 'hearts', 'aria-label': `${hearts} hearts left` }, '♥ ', hearts) : null);
    const foot = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
    const game = renderGame(q, (res) => onAnswer(res, q, foot, oni));
    const num = r.kind === 'boss' ? `${r.unit!.boss.name.toUpperCase()} · ${i + 1} OF ${r.queue.length}` : combo >= 2 && !S.settings.calm ? `COMBO x${combo}` : '';
    screen.append(top, h('div', { class: 'qhead' }, h('div', { class: 'eyebrow' }, num ? `${num} · ` : '', game.eyebrow), h('div', { class: 'title' }, game.title)), game.el, foot);
    showFlow(screen, quit);
  };

  const next = () => {
    i++;
    if (usesHearts && hearts <= 0) return fail();
    if (r.kind === 'boss' && bossHp <= 0) return complete(true);
    if (i >= r.queue.length) return complete(r.kind !== 'boss');
    render();
  };

  const onAnswer = (res: Result, q: Q, foot: HTMLElement, oni: HTMLElement | null) => {
    let msg: string, extra = '';
    const k = res.k ?? kanaOf(q);
    if (res.neutral) {
      if (q.t === 'intro') return next();
      if (q.t === 'match') { xp += 10; extra = '+10 XP'; }
      msg = res.note ?? 'Nice!';
      foot.append(h('div', { class: 'fb ok' }, h('span', null, msg), extra ? h('span', null, extra) : null));
    } else {
      graded++;
      if (res.ok) {
        right++; combo++; best = Math.max(best, combo);
        const gain = xpFor(combo); xp += gain;
        if (r.kind === 'boss') { bossHp--; sfx('hit'); oni?.classList.add('hit'); (oni?.querySelector('.bar > div') as HTMLElement | null)?.style.setProperty('width', `${(bossHp / hp) * 100}%`); }
        else sfx('good');
        msg = r.kind === 'boss' ? `Hit! ${k!.char} is "${k!.romaji}"` : `Nice! ${k!.char} is "${k!.romaji}"`;
        extra = `${combo >= 2 ? `Combo x${combo} · ` : ''}+${gain} XP`;
      } else {
        combo = 0; hearts--; sfx('bad');
        missed.set(k!.id, k!);
        logMistake(k!.id, `${k!.char} is "${k!.romaji}"`);
        // Ask again later in a new form. In a boss fight this also means one more round.
        r.queue.push(retryQ(k!, r.pool));
        msg = `${k!.char} is "${k!.romaji}"`;
        extra = !usesHearts ? 'Again later' : hearts > 0 ? `${hearts} ♥ left` : 'Out of hearts';
      }
      const hd = foot.parentElement?.querySelector('.hearts'); if (hd) hd.textContent = `♥ ${hearts}`;
      foot.append(h('div', { class: `fb ${res.ok ? 'ok' : 'no'}` }, h('span', null, msg), h('span', null, extra)));
    }
    const btn = h('button', { class: `btn ${res.ok ? 'mint' : 'badb'}`, onclick: next }, 'Continue');
    foot.append(btn);
    btn.scrollIntoView({ block: 'nearest' });
    if (r.kind === 'drill') btn.textContent = 'Done';
  };

  const fail = () => {
    sfx('bad');
    const again = () => (r.kind === 'lesson' ? startLesson(r.lesson!) : r.kind === 'boss' ? startBoss(r.unit!) : showTab(r.back));
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'center' }, h('div', { class: 'medal bad' }, jp('休')), h('div', { class: 'title' }, r.kind === 'boss' ? `${r.unit!.boss.name} wins this round` : 'Out of hearts'),
        h('div', { class: 'sub' }, 'Take a breath. Every mistake shows you what to practice next.')),
      missed.size ? h('div', { class: 'miss' }, [...missed.values()].map((k) => h('span', null, jp(k.char), ` ${k.romaji}`))) : null,
      h('div', { style: { flex: '1' } }),
      h('button', { class: 'btn', onclick: again }, 'Try again'),
      h('button', { class: 'btn ghost', onclick: () => showTab(r.back) }, 'Back')), () => showTab(r.back));
  };

  const complete = (win: boolean) => {
    if (r.kind === 'drill') return showTab(r.back);
    const now = Date.now();
    const acc = pct(right, graded);
    let title = 'Lesson complete!', sub = '', medal = acc === 100 ? '優' : '良';
    if (r.kind === 'lesson') {
      xp += 10 + (missed.size ? 0 : 10);
      S.done[r.lesson!.id] = Math.max(S.done[r.lesson!.id] ?? 0, acc);
      addCards(r.lesson!.kana.map((k) => k.id), now);
      sub = `You learned ${r.lesson!.title.replace(/^The /, 'the ')}: ${r.lesson!.kana.slice(0, 6).map((k) => k.char).join(' ')}${r.lesson!.kana.length > 6 ? ' …' : ''}`;
    } else if (r.kind === 'boss' && win) {
      xp += 100; medal = '勝'; title = `${r.unit!.boss.name} defeated!`;
      S.bosses[r.unit!.id] = true;
      addCards(r.unit!.lessons.flatMap((l) => l.kana.map((k) => k.id)), now);
      const nextU = UNITS[UNITS.indexOf(r.unit!) + 1];
      sub = nextU ? `${nextU.title} is now unlocked.` : 'You have beaten every kana boss!';
    } else { title = 'Practice complete!'; sub = 'Nice work keeping your kana sharp.'; }
    // Missed kana come back in review soon.
    for (const k of missed.values()) if (S.cards[k.id]) S.cards[k.id].due = Math.min(S.cards[k.id].due, now + 10 * 60_000);
    addXp(xp); S.bestCombo = Math.max(S.bestCombo, best);
    const streak = markActive(); save(); sfx('win');
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const missBox = h('div', { class: 'miss', style: { display: 'none' } }, [...missed.values()].map((k) => h('span', null, jp(k.char), ` ${k.romaji}`)));
    showFlow(h('div', { class: 'screen flow' },
      h('div', { class: 'center' }, h('div', { class: 'medal pop' }, jp(medal)), h('div', { class: 'title', style: { marginTop: '14px' } }, title), sub ? h('div', { class: 'sub', style: { marginTop: '0' } }, sub) : null),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'XP'), h('b', null, `+${xp}`)),
        h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Accuracy'), h('b', { class: 'mint' }, `${acc}%`)),
        h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Streak'), h('b', { class: 'gold' }, `${streak} day${streak === 1 ? '' : 's'}`))),
      h('div', { class: 'note' }, h('div', { class: 'eyebrow' }, 'Culture note'), h('b', null, note[0]), h('p', null, note[1])),
      missBox,
      h('div', { style: { flex: '1' } }),
      h('button', { class: 'btn', onclick: () => showTab(r.back) }, 'Continue'),
      missed.size ? h('button', { class: 'btn ghost', onclick: (e: Event) => { missBox.style.display = 'flex'; (e.currentTarget as HTMLElement).remove(); } }, `Review mistakes (${missed.size})`) : null,
    ), () => showTab(r.back));
  };

  render();
}
