import './fonts.css';
import './styles.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { registerTab, showTab, handleBack } from './nav';
import { applyTheme } from './theme';
import { home } from './screens/home';
import { reviewTab } from './screens/review';
import { chartTab } from './screens/chart';
import { meTab } from './screens/me';

registerTab('home', home);
registerTab('review', reviewTab);
registerTab('chart', chartTab);
registerTab('me', meTab);
applyTheme();
showTab('home');

if (Capacitor.isNativePlatform()) {
  App.addListener('backButton', () => {
    const sheet = document.querySelector('.sheet-bg');
    if (sheet) return sheet.remove();
    if (!handleBack()) App.minimizeApp();
  });
  // Refresh due counts and streak when coming back to the app.
  App.addListener('resume', () => { if (!document.querySelector('.flow')) showTab(); });
}
