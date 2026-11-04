import { h, bar } from '../ui';
import { S, save, resetAll, currentStreak, levelOf, levelStart, Theme } from '../state';
import { learnedKana } from '../progress';
import { say, hasVoice } from '../audio';
import { showTab } from '../nav';
import { applyTheme } from '../theme';
import { header } from './home';

export function meTab(): HTMLElement {
  const lv = levelOf(S.xp), a = levelStart(lv), b = levelStart(lv + 1);
  const cards = Object.values(S.cards);
  const voiceNote = h('div', { class: 'small' });
  hasVoice().then((ok) => { if (!ok) voiceNote.textContent = 'No Japanese voice found. On Android, open Settings > System > Languages > Text-to-speech, choose Google, and install Japanese voice data.'; });
  const seg = <T extends string | number>(opts: [T, string][], cur: T, set: (v: T) => void) =>
    h('div', { class: 'seg' }, opts.map(([v, t]) => h('button', { class: v === cur ? 'on' : '', 'aria-pressed': String(v === cur), onclick: () => { set(v); save(); showTab('me'); } }, t)));
  return h('main', { class: 'screen' },
    header(),
    h('div', null, h('div', { class: 'eyebrow' }, 'Your path'), h('div', { class: 'title' }, `Level ${lv}`),
      h('div', { class: 'sub' }, `${S.xp - a} / ${b - a} XP to level ${lv + 1}`), h('div', { style: { marginTop: '10px' } }, bar((S.xp - a) / (b - a)))),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Streak'), h('b', { class: 'gold' }, currentStreak())),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Kana'), h('b', null, learnedKana().length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Best combo'), h('b', { class: 'mint' }, S.bestCombo)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Lessons'), h('b', null, Object.keys(S.done).length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Mastered'), h('b', { class: 'gold' }, cards.filter((c) => c.iv >= 21).length)),
      h('div', { class: 'stat' }, h('div', { class: 'eyebrow' }, 'Bosses'), h('b', { class: 'mint' }, Object.values(S.bosses).filter(Boolean).length))),
    h('section', { class: 'card' },
      h('div', { class: 'setting' }, h('b', null, 'Theme'), seg<Theme>([['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], S.settings.theme, (v) => { S.settings.theme = v; applyTheme(); })),
      h('div', { class: 'setting' }, h('b', null, 'Sound effects'), h('button', { class: `toggle ${S.settings.sfx ? 'on' : ''}`, role: 'switch', 'aria-checked': String(S.settings.sfx), 'aria-label': 'Sound effects', onclick: () => { S.settings.sfx = !S.settings.sfx; save(); showTab('me'); } })),
      h('div', { class: 'setting' }, h('b', null, 'Voice speed'), seg<number>([[0.6, 'Slow'], [0.8, 'Normal'], [1, 'Fast']], S.settings.rate, (v) => { S.settings.rate = v; })),
      h('div', { class: 'setting', style: { flexWrap: 'wrap' } }, h('b', null, 'Test voice'), h('div', { class: 'pills' }, ['か', 'し', 'つ', 'きゃ', 'ん'].map((k) => h('button', { class: 'soundbtn', lang: 'ja', onclick: () => say(k) }, k)), h('button', { class: 'soundbtn', onclick: () => say('こんにちは、みち です。') }, 'こんにちは')), voiceNote)),
    h('button', { class: 'btn ghost', onclick: () => { if (confirm('Erase all progress, XP and review cards? This cannot be undone.') && confirm('Are you sure?')) { resetAll(); applyTheme(); showTab('home'); } } }, 'Reset progress'),
    h('p', { class: 'small' }, 'Michi v', __APP_VERSION__, '. Stroke data from KanjiVG by Ulrich Apel (CC BY-SA 3.0). Fonts: M PLUS Rounded 1c and Shippori Mincho (SIL Open Font License). Progress is saved on this device only.'));
}
