import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { S } from './state';

const mq = window.matchMedia('(prefers-color-scheme: dark)');
export function applyTheme() {
  if ((S.settings.theme as string) === 'midnight') S.settings.theme = 'dark'; // Midnight was retired
  const t = S.settings.theme;
  const dark = t === 'dark' || (t === 'auto' && mq.matches);
  document.documentElement.classList.toggle('dark', dark);
  if (Capacitor.isNativePlatform()) SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
}
mq.addEventListener('change', applyTheme);
