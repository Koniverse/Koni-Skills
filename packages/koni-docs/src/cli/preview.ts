import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import type { Command } from 'commander';
import { getGlobalOpts } from './global-opts.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findViewerDir(): string {
  const candidates = [
    path.resolve(__dirname, '..', 'viewer'),                    // dist/cli → dist/viewer (if we ever bundled it)
    path.resolve(__dirname, '..', '..', 'src', 'viewer'),       // dist/cli → src/viewer (when built)
    path.resolve(__dirname, '..', 'viewer'),                    // src/cli → src/viewer (when running via tsx)
  ];
  for (const c of candidates) {
    if (existsSync(path.join(c, 'astro.config.mjs'))) return c;
  }
  throw new Error(`viewer directory not found near ${__dirname}`);
}

export function registerPreview(program: Command): void {
  program
    .command('preview [path]')
    .description('Launch the koni-docs Astro viewer for a docs/ tree')
    .option('--port <n>', 'HTTP port', '4321')
    .option('--host <h>', 'Bind host', 'localhost')
    .option('--open', 'Open browser on start', false)
    .action(function (this: Command, pathArg: string | undefined, cmdOpts: { port: string; host: string; open: boolean }) {
      const opts = getGlobalOpts(this);
      const docsDir = path.resolve(pathArg ?? opts.docsPath);
      if (!existsSync(docsDir)) {
        console.error(`error: docs directory not found: ${docsDir}`);
        process.exit(1);
      }
      const viewerDir = findViewerDir();
      const astroBinDirect = path.resolve(viewerDir, '..', '..', 'node_modules', '.bin', 'astro');
      const useDirect = existsSync(astroBinDirect);
      const cmd = useDirect ? astroBinDirect : 'npx';
      const args = useDirect
        ? ['dev', '--port', cmdOpts.port, '--host', cmdOpts.host, ...(cmdOpts.open ? ['--open'] : [])]
        : ['astro', 'dev', '--port', cmdOpts.port, '--host', cmdOpts.host, ...(cmdOpts.open ? ['--open'] : [])];

      console.log(`🌐 koni-docs preview`);
      console.log(`   docs:   ${docsDir}`);
      console.log(`   server: http://${cmdOpts.host}:${cmdOpts.port}`);
      console.log('');

      const child = spawn(cmd, args, {
        cwd: viewerDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          KONI_DOCS_DIR: docsDir,
          KONI_DOCS_HOST: cmdOpts.host,
          KONI_DOCS_PORT: cmdOpts.port,
        },
      });

      const shutdown = () => {
        if (!child.killed) child.kill('SIGTERM');
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      child.on('exit', (code) => {
        process.exit(code ?? 0);
      });
    });
}
