import type { Command } from 'commander';
import { loadCorpus, validateRefs, validateFrRefs } from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

interface ValidateFlags {
  json: boolean;
  includeWarnings: boolean;
}

export function registerValidate(program: Command): void {
  program
    .command('validate')
    .description('Validate the L3 ID graph (epic/sprint/PRD references) — exits non-zero on error')
    .option('--json', 'machine-readable output', false)
    .option('--include-warnings', 'include FR-refs that have no PRD §8 row (default: warnings = errors)', false)
    .action(function (this: Command, cmdOpts: ValidateFlags) {
      const opts = getGlobalOpts(this);
      const corpus = loadCorpus(opts.docsPath);
      const refErrors = validateRefs(corpus);
      const frMissing = validateFrRefs(corpus);

      const errorCount = refErrors.length + frMissing.length;

      if (cmdOpts.json || opts.json) {
        console.log(JSON.stringify({
          ok: errorCount === 0,
          refErrors,
          frMissing,
          summary: {
            ref: refErrors.length,
            fr: frMissing.length,
          },
        }, null, 2));
      } else {
        console.log(`koni-docs validate — ${opts.docsPath}`);
        console.log('');
        if (refErrors.length === 0 && frMissing.length === 0) {
          console.log('  ✓ all references resolve');
        } else {
          if (refErrors.length > 0) {
            console.log(`  ✗ ${refErrors.length} reference error(s):`);
            for (const e of refErrors) {
              console.log(`    - ${e.source}: ${e.kind}="${e.ref}" (${e.error})`);
            }
          }
          if (frMissing.length > 0) {
            console.log(`  ✗ ${frMissing.length} FR-ref miss(es):`);
            for (const m of frMissing) {
              console.log(`    - ${m.id} (${m.source}): missing ${m.missingFr.join(', ')} in PRD §8`);
            }
          }
        }
      }
      process.exit(errorCount === 0 ? 0 : 1);
    });
}
