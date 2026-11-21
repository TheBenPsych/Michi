// Renders the Android launcher icons (教 on warm red) with Playwright. Run: node scripts/make-icons.cjs
const { chromium } = require('playwright');
const path = require('path');
const font = path.resolve(__dirname, '../node_modules/@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-700-normal.woff2');
const FONT64 = require('fs').readFileSync(font).toString('base64');
const RES = path.resolve(__dirname, '../android/app/src/main/res');
const D = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const page = (size, kind) => `<!doctype html><style>
@font-face{font-family:M;src:url(data:font/woff2;base64,${FONT64})}
html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
.b{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:M;color:#FFFDF8;
background:${kind === 'fg' ? 'transparent' : '#B5482F'};border-radius:${kind === 'round' ? '50%' : kind === 'sq' ? '22%' : '0'};
font-size:${kind === 'fg' ? size * 0.42 : size * 0.62}px;line-height:1;padding-bottom:${size * 0.03}px;box-sizing:border-box}
</style><div class="b">教</div>`;
(async () => {
  const b = await chromium.launch();
  for (const [dir, s] of Object.entries(D)) {
    for (const [name, kind, size] of [['ic_launcher', 'sq', 48], ['ic_launcher_round', 'round', 48], ['ic_launcher_foreground', 'fg', 108]]) {
      const px = Math.round(size * s);
      const p = await b.newPage({ viewport: { width: px, height: px } });
      await p.setContent(page(px, kind));
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: `${RES}/mipmap-${dir}/${name}.png`, omitBackground: true });
      await p.close();
    }
  }
  await b.close();
  console.log('icons written');
})();
