import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || 'dev') },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
