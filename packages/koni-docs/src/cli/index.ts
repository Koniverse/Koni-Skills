import { Command } from 'commander';
import { KONI_DOCS_LIB_VERSION } from '../lib/index.ts';

const program = new Command();

program
  .name('koni-docs')
  .description('Koni-docs framework CLI')
  .version(KONI_DOCS_LIB_VERSION)
  .option('--docs-path <path>', 'override docs/ root', 'docs/')
  .option('--dry-run', 'preview changes without writing files', false)
  .option('--json', 'machine-readable output', false)
  .option('--verbose', 'extra logging', false);

import { registerStatus } from './status.ts';
registerStatus(program);

import { registerSync } from './sync.ts';
registerSync(program);

// Subcommands registered in later tasks:
// import { registerInjectTasks } from './inject-tasks.ts'; registerInjectTasks(program);
// import { registerBackfillFields } from './backfill-fields.ts'; registerBackfillFields(program);
// import { registerBackfillCommits } from './backfill-commits.ts'; registerBackfillCommits(program);

program.on('command:*', () => {
  console.error('error: unknown command');
  process.exit(1);
});

program
  .allowUnknownOption(false)
  .parseAsync(process.argv)
  .catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
