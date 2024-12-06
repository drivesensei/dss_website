import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { optimizeCssModules } from './custom-build/vite-plugin-optimize-css';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
    optimizeCssModules(),
  ],
});
