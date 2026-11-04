// Downloads stroke paths for single kana from KanjiVG (CC BY-SA 3.0, https://kanjivg.tagaini.net)
// and writes src/data/strokes.json: { "か": ["M...", ...], ... }. Run: node scripts/fetch-strokes.mjs
import { writeFileSync } from 'node:fs';
const chars = [];
for (let c = 0x3041; c <= 0x3093; c++) chars.push(c);
for (let c = 0x30a1; c <= 0x30f3; c++) chars.push(c);
const out = {};
for (const c of chars) {
  const hex = c.toString(16).padStart(5, '0');
  const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`);
  if (!res.ok) continue;
  const svg = await res.text();
  const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (ds.length) out[String.fromCharCode(c)] = ds;
}
writeFileSync(new URL('../src/data/strokes.json', import.meta.url), JSON.stringify(out));
console.log(Object.keys(out).length, 'kana');
