import { h, bar } from '../ui';
import { S, save, resetAll, currentStreak, levelOf, levelStart, Theme, dayKey } from '../state';
import { DAY, retrievability } from '../srs';
import { learnedKana, mastery, currentUnit, learnedWords, stopDone, currentRegion, stampCount } from '../progress';
import { openClimb } from './climb';
import { UNITS, CHART_ROWS, KANA_BY_ID, chartChar } from '../data/kana';
import { CULTURE, ALL_STOPS } from '../data/course';
import { jp } from '../ui';
import { cultureCard } from './stops';
import { rj } from '../script';
import { say, hasVoice, japaneseVoices, voiceFor, voiceLabel, voiceName, VoiceKind, speakWith, JaVoice } from '../audio';
import { showTab } from '../nav';
import { applyTheme } from '../theme';
import { header } from './home';

export function meTab(): HTMLElement {
  const lv = levelOf(S.xp), a = levelStart(lv), b = levelStart(lv + 1);
  const cards = Object.values(S.cards);
  const cu = currentUnit();
  const voiceNote = h('div', { class: 'small' });
  japaneseVoices().then((vs) => { if (vs.length === 1) voiceNote.textContent = 'Only one Japanese voice is installed. For a separate male voice, open Settings > System > Languages > Text-to-speech > Google > Install voice data > Japanese, and pick a second voice.'; });
  hasVoice().then((ok) => { if (!ok) voiceNote.textContent = 'No Japanese voice found. On Android, open Settings > System > Languages > Text-to-speech, choose Google, and install Japanese voice data.'; });
  const seg = <T extends string | number>(opts: [T, string][], cur: T, set: (v: T) => void) =>
    h('div', { class: 'seg' }, opts.map(([v, t]) => h('button', { class: v === cur ? 'on' : '', 'aria-pressed': String(v === cur), onclick: () => { set(v); save(); showTab('me'); } }, t)));
  return h('main', { class: 'screen' },
    header(),
    h('div', null, h('div', { class: 'eyebrow' }, 'Your path'), h('div', { class: 'title' }, `Level ${lv}`),
      h('div', { class: 'sub' }, `${S.xp - a} / ${b - a} XP to level ${lv + 1}`), h('div', { style: { marginTop: '10px' } }, bar((S.xp - a) / (b - a)))),
    h('div', { class: 'card row' }, h('div', null, h('div', { class: 'eyebrow' }, `Rank · ${currentRegion().rank} `, jp(currentRegion().rankJp)), h('h3', { style: { marginTop: '4px' } }, `${currentRegion().level} · Unit ${cu.n}: ${cu.title}`),
      h('p', null, `${ALL_STOPS.filter(stopDone).length} of ${ALL_STOPS.length} stops done · ${stampCount(currentRegion())} stamps`)), h('button', { class: 'soundbtn', onclick: openClimb }, 'Map')),
    h('section', { class: 'card kanaprog' }, h('h3', null, 'Kana progress'),
      UNITS.map((u) => { const all = u.lessons.flatMap((l) => l.kana), n = all.filter((k) => mastery(k.id) !== 'n').length;
        return h('div', null, h('div', { class: 'row small' }, h('b', null, jp(u.jp), ` ${u.title}`), h('b', null, `${n} / ${all.length}`)), h('div', { style: { marginTop: '4px' } }, bar(n / all.length, u.script === 'h' ? 'mint' : ''))); }),
      h('div', { class: 'minigrid' }, CHART_ROWS.slice(0, 11).flat().filter(Boolean).map((c) => { const k = KANA_BY_ID.get(`h:${chartChar(c!, 'h')}`)!; return h('span', { class: `jp ${mastery(k.id)}` }, k.char); })),
      h('button', { class: 'linkbtn', onclick: () => showTab('chart') }, 'Open the full chart')),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Streak'), h('b', { class: 'gold' }, currentStreak())),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Words'), h('b', null, learnedWords())),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Kana'), h('b', null, learnedKana().length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Best combo'), h('b', { class: 'mint' }, S.bestCombo)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Mastered'), h('b', { class: 'gold' }, cards.filter((c) => c.iv >= 21).length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Bosses'), h('b', { class: 'mint' }, Object.values(S.bosses).filter(Boolean).length + Object.values(S.stamps).filter(Boolean).length))),
    studyCalendar(), forecast(),
    h('section', null, h('div', { class: 'eyebrow', style: { marginBottom: '8px' } }, `Culture album · ${S.album.length} / ${CULTURE.length}`),
      h('div', { class: 'album' }, CULTURE.map((c) => S.album.includes(c.id)
        ? h('button', { class: 'acard', onclick: () => showCard(c.id) }, jp(rj(c.jp)), h('small', null, rj(c.title)))
        : h('div', { class: 'acard empty' }, h('small', null, 'Locked'))))),
    h('section', { class: 'card' },
      h('div', { class: 'setting', style: { flexWrap: 'wrap' } }, h('div', null, h('b', null, 'Theme'), h('div', { class: 'small' }, 'Auto follows your phone.')), seg<Theme>([['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], S.settings.theme, (v) => { S.settings.theme = v; applyTheme(); })),
      h('div', { class: 'setting' }, h('div', null, h('b', null, 'Calm mode'), h('div', { class: 'small' }, 'No timers, hearts, combos or sounds. Good for tired days.')), h('button', { class: `toggle ${S.settings.calm ? 'on' : ''}`, role: 'switch', 'aria-checked': String(S.settings.calm), 'aria-label': 'Calm mode', onclick: () => { S.settings.calm = !S.settings.calm; save(); showTab('me'); } })),
      h('div', { class: 'setting' }, h('div', null, h('b', null, 'Omamori charms'), h('div', { class: 'small' }, `You hold ${S.charms} of 2. Earn one for every 7 days in a row. A charm saves your streak if you miss one day.`)), jp('守'.repeat(Math.max(1, S.charms)), S.charms ? 'charmjp' : 'charmjp off')),
      h('div', { class: 'setting' }, h('b', null, 'Sound effects'), h('button', { class: `toggle ${S.settings.sfx ? 'on' : ''}`, role: 'switch', 'aria-checked': String(S.settings.sfx), 'aria-label': 'Sound effects', onclick: () => { S.settings.sfx = !S.settings.sfx; save(); showTab('me'); } })),
      h('div', { class: 'setting' }, h('b', null, 'Romaji help'), h('button', { class: `toggle ${S.settings.romaji ? 'on' : ''}`, role: 'switch', 'aria-checked': String(S.settings.romaji), 'aria-label': 'Show romaji under words', onclick: () => { S.settings.romaji = !S.settings.romaji; save(); showTab('me'); } })),
      h('div', { class: 'setting' }, h('b', null, 'Voice speed'), seg<number>([[0.6, 'Slow'], [0.8, 'Normal'], [1, 'Fast']], S.settings.rate, (v) => { S.settings.rate = v; })),
      voiceRow('f'), voiceRow('m'),
      S.settings.voiceF || S.settings.voiceM ? h('div', { class: 'setting' }, h('div', null, h('b', null, 'Reset voices'), h('div', { class: 'small' }, 'Go back to the automatic voice picks')), h('button', { class: 'soundbtn', onclick: () => { S.settings.voiceF = ''; S.settings.voiceM = ''; save(); showTab('me'); } }, 'Reset')) : null,
      h('div', { class: 'setting' }, h('div', null, h('b', null, 'Voice sampler'), h('div', { class: 'small' }, 'Hear every Japanese voice on this phone')), h('button', { class: 'soundbtn', onclick: sampler }, 'Open')),
      h('div', { class: 'setting', style: { flexWrap: 'wrap' } }, h('b', null, 'Test voice'), h('div', { class: 'pills' }, ['か', 'し', 'つ', 'きゃ', 'ん'].map((k) => h('button', { class: 'soundbtn', lang: 'ja', onclick: () => say(k) }, k)), h('button', { class: 'soundbtn', onclick: () => say('こんにちは、みち です。') }, 'こんにちは')), voiceNote)),
    h('button', { class: 'btn ghost', onclick: () => { if (confirm('Erase all progress, XP and review cards? This cannot be undone.') && confirm('Are you sure?')) { resetAll(); applyTheme(); showTab('home'); } } }, 'Reset progress'),
    h('p', { class: 'small' }, 'Michi v', __APP_VERSION__, '. Stroke data from KanjiVG by Ulrich Apel (CC BY-SA 3.0). Fonts: Lexend and Zen Maru Gothic (SIL Open Font License). Progress is saved on this device only.'));
}

function showCard(id: string) {
  const c = CULTURE.find((x) => x.id === id)!;
  const bg = h('div', { class: 'sheet-bg', onclick: (e: Event) => { if (e.target === bg) bg.remove(); } });
  bg.append(h('div', { class: 'sheet', role: 'dialog', 'aria-label': c.title }, cultureCard(c), h('button', { class: 'btn ghost', onclick: () => bg.remove() }, 'Close')));
  document.body.append(bg);
}

/** Tap to cycle through the phone's Japanese voices for female or male characters. */
function voiceRow(kind: VoiceKind) {
  const btn = h('button', { class: 'soundbtn' }, 'Auto');
  const sample = kind === 'm' ? 'こんにちは。レオです。' : 'こんにちは。ゆきです。';
  const key = kind === 'm' ? 'voiceM' : 'voiceF';
  const label = async () => {
    const vs = await japaneseVoices(), v = await voiceFor(kind), picked = vs.some((x) => x.id === S.settings[key]);
    btn.textContent = `${picked ? '' : 'Auto: '}${v ? voiceName(v, vs) : kind === 'm' ? 'no male voice found' : 'phone default'}`;
  };
  // Each tap moves to the next voice; after the last one it goes back to Auto.
  btn.addEventListener('click', async () => {
    const vs = await japaneseVoices();
    const ids = ['', ...vs.map((v) => v.id)];
    S.settings[key] = ids[(Math.max(0, ids.indexOf(S.settings[key])) + 1) % ids.length]; save();
    await label(); say(sample, false, kind);
  });
  label();
  return h('div', { class: 'setting' }, h('div', null, h('b', null, kind === 'm' ? 'Male voice' : 'Female voice'), h('div', { class: 'small' }, kind === 'm' ? 'Leo and other men' : 'Yuki, Mei and single words')), btn);
}

/** Lists every Japanese voice on the phone with a play button, so the learner can pick by ear. */
async function sampler() {
  const vs = await japaneseVoices();
  const bg = h('div', { class: 'sheet-bg', onclick: (e: Event) => { if (e.target === bg) bg.remove(); } });
  const row = (v: JaVoice, n: number) => h('div', { class: 'setting', style: { flexWrap: 'wrap' } },
    h('div', null, h('b', null, `Voice ${n + 1}`), h('div', { class: 'small' }, voiceLabel(v.name))),
    h('div', { class: 'pills' },
      h('button', { class: 'soundbtn sm', onclick: () => speakWith('はじめまして。レオです。アメリカじんです。', S.settings.rate, v) }, 'Play'),
      h('button', { class: `soundbtn sm ${S.settings.voiceM === v.id ? 'on' : ''}`, onclick: () => { S.settings.voiceM = v.id; save(); bg.remove(); showTab('me'); } }, 'Use for men'),
      h('button', { class: `soundbtn sm ${S.settings.voiceF === v.id ? 'on' : ''}`, onclick: () => { S.settings.voiceF = v.id; save(); bg.remove(); showTab('me'); } }, 'Use for women')));
  bg.append(h('div', { class: 'sheet', role: 'dialog', 'aria-label': 'Voice sampler' },
    h('div', { class: 'title' }, 'Voice sampler'),
    h('div', { class: 'small' }, vs.length ? `${vs.length} Japanese voice${vs.length === 1 ? '' : 's'} on this phone. Voices marked (online) need internet and usually sound the most natural.` : 'No Japanese voices found.'),
    vs.map(row),
    h('div', { class: 'small' }, 'For more voices: Settings > System > Languages > Text-to-speech > tap the gear next to Google > Install voice data > Japanese.'),
    h('button', { class: 'btn ghost', onclick: () => bg.remove() }, 'Close')));
  document.body.append(bg);
}

/** Last 12 weeks, one square per day, darker for more XP. */
function studyCalendar() {
  const now = new Date(); now.setHours(12, 0, 0, 0);
  const end = now.getTime() + ((7 - ((now.getDay() + 6) % 7)) - 1) * DAY; // this Sunday
  const days = Array.from({ length: 84 }, (_, i) => end - (83 - i) * DAY);
  const xps = days.map((t) => S.dayXp[dayKey(t)] ?? 0);
  const max = Math.max(1, ...xps);
  const lvl = (x: number) => (x <= 0 ? 0 : x < max * 0.25 ? 1 : x < max * 0.6 ? 2 : 3);
  const active = xps.filter((x) => x > 0).length;
  return h('section', { class: 'card' },
    h('div', { class: 'row' }, h('h3', null, 'Study calendar'), h('small', { class: 'small' }, `${active} day${active === 1 ? '' : 's'} in 12 weeks`)),
    h('div', { class: 'heat', role: 'img', 'aria-label': `Study calendar: ${active} active days in the last 12 weeks` },
      days.map((t, i) => h('span', { class: `l${lvl(xps[i])} ${t > Date.now() ? 'future' : ''}`, title: `${dayKey(t)}: ${xps[i]} XP` }))),
    h('div', { class: 'heatkey small' }, 'Less ', [0, 1, 2, 3].map((l) => h('span', { class: `l${l}` })), ' More'));
}

/** Reviews coming due over the next 7 days, plus how much you are likely to remember. */
function forecast() {
  const cards = Object.values(S.cards), now = Date.now();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const counts = Array.from({ length: 7 }, (_, i) => cards.filter((c) => (i === 0 ? c.due < start.getTime() + DAY : c.due >= start.getTime() + i * DAY && c.due < start.getTime() + (i + 1) * DAY)).length);
  const max = Math.max(1, ...counts);
  const seen = cards.filter((c) => c.reps > 0);
  const recall = seen.length ? Math.round((100 * seen.reduce((a, c) => a + retrievability(c, now), 0)) / seen.length) : null;
  const names = ['Today', ...Array.from({ length: 6 }, (_, i) => new Date(start.getTime() + (i + 1) * DAY).toLocaleDateString('en', { weekday: 'short' }))];
  return h('section', { class: 'card' },
    h('div', { class: 'row' }, h('h3', null, 'Review forecast'), h('small', { class: 'small' }, recall == null ? 'Review a few cards to see your recall' : `You likely remember ${recall}% of your cards right now`)),
    h('div', { class: 'fcast' }, counts.map((n, i) => h('div', { class: 'fcol' }, h('small', null, String(n)), h('span', { class: 'fbar' }, h('i', { style: { height: `${(n / max) * 100}%` } })), h('small', null, names[i])))));
}
