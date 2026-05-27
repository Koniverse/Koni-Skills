import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  srcDir: './',
  publicDir: './public',
  outDir: './dist',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: {
    host: process.env.KONI_DOCS_HOST ?? 'localhost',
    port: Number(process.env.KONI_DOCS_PORT ?? 4321),
  },
  vite: {
    server: { fs: { allow: ['..', '../..', '../../..'] } },
  },
});
