import './styles.css';
import { App } from '@capacitor/app';
import { mount, nav } from './engine';
import { home, applySettings } from './screens';

mount(document.getElementById('app')!);
applySettings();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);
// The Android back button returns to the home screen; from home it leaves the app.
App.addListener('backButton', () => { if (nav.home) App.exitApp(); else home(); }).catch(() => {});
home();
