# Kyōhon (教本)

A serious, textbook-grade Japanese course for Android: hear it, say it, write it, read it, a few minutes at a time. No points, streaks or mascots.

This folder is a separate app from Michi (the app in the repository root). It has its own app id (`com.thebenpsych.kyohon`), so both can be installed side by side.

## What is built

- Welcome screen, with a level check for people who already know some kana.
- Chapter 1 "Sounds and greetings" in five short steps: three greetings by ear, the five vowels, thank you and excuse me, the k row, then speaking and a chapter check.
- Home screen with a capped daily warm-up (spaced review, no backlog), the Continue card and study tools.
- Kana trainer: full hiragana chart, a page per letter (sound, stroke animation, writing practice, look-alikes), mixed practice, and "learn the next row".
- Word list with pictures and audio.
- Checked handwriting (stroke count, order, direction and shape) and a speech check that shows what the phone heard and can always be overruled.
- Warm paper (light) and Calm night (dark) themes, text size, and switches for sound, movement, speech check and writing strictness.

## Install on a phone

Every merge to `main` that touches this folder builds an APK and publishes it as a GitHub release named `kyohon-N`. Open the latest release on the phone, download `Kyohon.apk` and install it. Updates install over the previous version and keep progress.

## Work on it

```
cd kyohon
npm install
npm run dev        # preview in a browser
npm test           # pacing and content checks
npm run typecheck
```

- `src/data/lines.json`: every recorded line. After changing it, run `python3 scripts/voice.py` (needs `pip install edge-tts`) to record new clips into `public/voice/`.
- `src/data/content.ts`, `src/lessons.ts`: Chapter 1.
- `src/art.ts`: all drawings (hand-written SVG).
- `tests/pacing.test.ts`: fails the build if a word uses a letter that has not been taught yet, or a recording is missing.

## Credits

Stroke order data from [KanjiVG](https://kanjivg.tagaini.net) by Ulrich Apel, CC BY-SA 3.0. Fonts: Lexend and Zen Maru Gothic (SIL Open Font License). All lesson content and drawings are original.
