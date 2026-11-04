import { h, bar } from '../ui';
import { S, save, resetAll, currentStreak, levelOf, levelStart, Theme } from '../state';
import { learnedKana, mastery, currentUnit, learnedWords, stopDone } from '../progress';
import { UNITS, CHART_ROWS, KANA_BY_ID, chartChar } from '../data/kana';
import { COURSE, CULTURE, ALL_STOPS } from '../data/course';
import { jp } from '../ui';
import { cultureCard } from './stops';
import { say, hasVoice, japaneseVoices, voiceFor, voiceLabel, VoiceKind } from '../audio';
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
    h('div', { class: 'card' }, h('div', { class: 'eyebrow' }, 'Course'), h('h3', { style: { marginTop: '4px' } }, `N5 · Unit ${cu.n}: ${cu.title}`),
      h('p', null, `${ALL_STOPS.filter(stopDone).length} of ${ALL_STOPS.length} stops done · ${COURSE.filter((u) => S.stamps[u.id]).length} unit stamps`)),
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
    h('section', null, h('div', { class: 'eyebrow', style: { marginBottom: '8px' } }, `Culture album · ${S.album.length} / ${CULTURE.length}`),
      h('div', { class: 'album' }, CULTURE.map((c) => S.album.includes(c.id)
        ? h('button', { class: 'acard', onclick: () => showCard(c.id) }, jp(c.jp), h('small', null, c.title))
        : h('div', { class: 'acard empty' }, h('small', null, 'Locked'))))),
    h('section', { class: 'card' },
      h('div', { class: 'setting' }, h('b', null, 'Theme'), seg<Theme>([['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], S.settings.theme, (v) => { S.settings.theme = v; applyTheme(); })),
      h('div', { class: 'setting' }, h('b', null, 'Sound effects'), h('button', { class: `toggle ${S.settings.sfx ? 'on' : ''}`, role: 'switch', 'aria-checked': String(S.settings.sfx), 'aria-label': 'Sound effects', onclick: () => { S.settings.sfx = !S.settings.sfx; save(); showTab('me'); } })),
      h('div', { class: 'setting' }, h('b', null, 'Romaji help'), h('button', { class: `toggle ${S.settings.romaji ? 'on' : ''}`, role: 'switch', 'aria-checked': String(S.settings.romaji), 'aria-label': 'Show romaji under words', onclick: () => { S.settings.romaji = !S.settings.romaji; save(); showTab('me'); } })),
      h('div', { class: 'setting' }, h('b', null, 'Voice speed'), seg<number>([[0.6, 'Slow'], [0.8, 'Normal'], [1, 'Fast']], S.settings.rate, (v) => { S.settings.rate = v; })),
      voiceRow('f'), voiceRow('m'),
      h('div', { class: 'setting', style: { flexWrap: 'wrap' } }, h('b', null, 'Test voice'), h('div', { class: 'pills' }, ['か', 'し', 'つ', 'きゃ', 'ん'].map((k) => h('button', { class: 'soundbtn', lang: 'ja', onclick: () => say(k) }, k)), h('button', { class: 'soundbtn', onclick: () => say('こんにちは、みち です。') }, 'こんにちは')), voiceNote)),
    h('button', { class: 'btn ghost', onclick: () => { if (confirm('Erase all progress, XP and review cards? This cannot be undone.') && confirm('Are you sure?')) { resetAll(); applyTheme(); showTab('home'); } } }, 'Reset progress'),
    h('p', { class: 'small' }, 'Michi v', __APP_VERSION__, '. Stroke data from KanjiVG by Ulrich Apel (CC BY-SA 3.0). Fonts: M PLUS Rounded 1c and Shippori Mincho (SIL Open Font License). Progress is saved on this device only.'));
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
  const label = async () => { const v = await voiceFor(kind); btn.textContent = `${S.settings[key] ? '' : 'Auto: '}${v ? voiceLabel(v.name) : kind === 'm' ? 'lower pitch' : 'phone default'}`; };
  btn.addEventListener('click', async () => {
    const vs = await japaneseVoices();
    const names = ['', ...vs.map((v) => v.name)];
    S.settings[key] = names[(names.indexOf(S.settings[key]) + 1) % names.length]; save();
    await label(); say(sample, false, kind);
  });
  label();
  return h('div', { class: 'setting' }, h('div', null, h('b', null, kind === 'm' ? 'Male voice' : 'Female voice'), h('div', { class: 'small' }, kind === 'm' ? 'Leo and other men' : 'Yuki, Mei and single words')), btn);
}
