# Michi 道

A free, game-like Japanese learning app for Android. Short lessons, XP, streaks, hearts, combos, boss fights and spaced-repetition review, starting with hiragana and katakana.

## Install on your phone

1. On your phone, open the [latest release](https://github.com/TheBenPsych/Michi/releases/latest).
2. Tap **Michi.apk** to download it.
3. Open the downloaded file. If Android asks, allow your browser to "install unknown apps", then tap **Install**.
4. New versions install over the old one and keep your progress.

**No voice?** Listening games use your phone's text-to-speech. Go to Settings > System > Languages > Text-to-speech output, pick Google, and install the Japanese voice.

## What's inside

- **Course path**: one N5 path that follows the topics of Genki I. Unit 1 (meeting people) blends all of hiragana with a manga story, word stops with pictures, three grammar stops, a chat mission (3 hearts), culture cards and a timed unit boss, Gatekeeper Tanuki. Unit 2 holds katakana for now. All content and drawings are original.
- **Pacing**: you never see kana before it is taught. Anything with unlearned kana shows in romaji with English and switches to kana by itself once you learn it (`src/script.ts`). Each early kana lesson is followed by a "Read it" stop whose words use only the kana learned so far. A test checks this for every stop.
- **Kana lessons**: 13 per script (vowels to combos like きゃ). Each one teaches the kana, then mixes games: read it, pick the kana, listen, type the reading, match pairs and trace strokes.
- **Bosses**: the Kana Oni (hiragana) and the Katakana Tengu. Beat one to unlock the next unit, or to skip ahead if you already know the kana.
- **Review**: kana and word cards (Again / Hard / Good / Easy) scheduled with spaced repetition.
- **Chart**: every kana coloured by how well you know it. Tap one to hear it, watch its stroke order and practice writing it.
- Light and dark mode (follows your phone, or pick one under Me).

## For developers

Stack: TypeScript + Vite (no framework), wrapped as an Android app with Capacitor. Every push to `main` builds the APK in GitHub Actions and publishes it as a release.

```bash
npm install
npm run dev        # open the app in a browser
npm test           # unit tests
npm run build && npx cap sync android   # then build android/ with Android Studio or ./gradlew assembleDebug
```

- `src/data/kana.ts`: kana, lessons and culture notes
- `src/lessonGen.ts`: builds each lesson's question mix
- `src/srs.ts`: spaced-repetition scheduler
- `src/games.ts`: the mini-games, including stroke tracing
- `scripts/fetch-strokes.mjs`: regenerates stroke data from KanjiVG

Credits: stroke data from [KanjiVG](https://kanjivg.tagaini.net) by Ulrich Apel (CC BY-SA 3.0). Fonts M PLUS Rounded 1c and Shippori Mincho (SIL OFL).
