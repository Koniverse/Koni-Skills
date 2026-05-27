import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, '..', '..', 'src', 'cli', 'index.ts');
const TSX_LOADER = join(__dirname, '..', '..', 'node_modules', 'tsx', 'dist', 'loader.mjs');

export interface CliResult {
  stdout: string;
  stderr: string;
  status: number;
}

export function runCli(args: string[], opts: { cwd?: string } = {}): CliResult {
  const r = spawnSync(process.execPath, ['--import', TSX_LOADER, CLI_ENTRY, ...args], {
    encoding: 'utf-8',
    cwd: opts.cwd,
    env: { ...process.env, NO_COLOR: '1' },
  });
  return {
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    status: typeof r.status === 'number' ? r.status : 1,
  };
}
