import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'lib/index': 'src/lib/index.ts',
    'lib/markdown/index': 'src/lib/markdown/index.ts',
    'lib/schemas/index': 'src/lib/schemas/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  outExtension: () => ({ js: '.mjs' }),
});
