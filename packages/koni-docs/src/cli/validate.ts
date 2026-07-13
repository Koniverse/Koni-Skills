import type { Command } from 'commander';
import { loadCorpus, validateRefs, validateFrRefs, findMalformedDue, findRedundantDue, getDeadlines } from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

interface ValidateFlags {
  json: boolean;
  includeWarnings: boolean;
}

/** Mirrors `status --due-soon-days`; only used to label warnings here. */
const DUE_SOON_DAYS = 3;

export function registerValidate(program: Command): void {
  program
    .command('validate')
    .description('Validate the L3 ID graph (epic/sprint/PRD references) — exits non-zero on error')
    .option('--json', 'machine-readable output', false)
    .option('--include-warnings', 'include FR-refs that have no PRD Functional Requirements row (default: warnings = errors)', false)
    .action(function (this: Command, cmdOpts: ValidateFlags) {
      const opts = getGlobalOpts(this);
      const corpus = loadCorpus(opts.docsPath);
      const refErrors = validateRefs(corpus);
      const frMissing = validateFrRefs(corpus);

      // A `due` that is not a real date is a schema violation — an error.
      const dueMalformed = findMalformedDue(corpus);
      // A story that is merely past its date is news, not a defect. It prints,
      // but it must NOT fail the build: deadlines inform, they do not block.
      const overdue = getDeadlines(corpus, new Date(), DUE_SOON_DAYS)
        .filter(d => d.state === 'overdue');
      // A `due` that just restates the sprint end is the drift that turns the
      // Deadlines board into a second copy of the sprint table. Warn, don't block.
      const dueRedundant = findRedundantDue(corpus);

      const errorCount = refErrors.length + frMissing.length + dueMalformed.length;

      if (cmdOpts.json || opts.json) {
        console.log(JSON.stringify({
          ok: errorCount === 0,
          refErrors,
          frMissing,
          dueMalformed,
          overdue,
          dueRedundant,
          summary: {
            ref: refErrors.length,
            fr: frMissing.length,
            dueMalformed: dueMalformed.length,
            overdue: overdue.length,
            dueRedundant: dueRedundant.length,
          },
        }, null, 2));
      } else {
        console.log(`koni-docs validate — ${opts.docsPath}`);
        console.log('');
        if (errorCount === 0) {
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
              console.log(`    - ${m.id} (${m.source}): missing ${m.missingFr.join(', ')} in PRD Functional Requirements`);
            }
          }
          if (dueMalformed.length > 0) {
            console.log(`  ✗ ${dueMalformed.length} malformed due date(s):`);
            for (const d of dueMalformed) {
              const why = d.reason === 'impossible_date'
                ? 'no such calendar date'
                : 'not a YYYY-MM-DD date — prose belongs in the body';
              console.log(`    - ${d.id} (${d.source}): due="${d.due}" (${why})`);
            }
          }
        }
        if (overdue.length > 0) {
          console.log('');
          console.log(`  ⚠ ${overdue.length} overdue story(ies) — warning only, does not fail validate:`);
          for (const d of overdue) {
            console.log(`    - ${d.id}: due ${d.due} (${Math.abs(d.daysRemaining)} day(s) ago, status ${d.status})`);
          }
        }
        if (dueRedundant.length > 0) {
          console.log('');
          console.log(`  ⚠ ${dueRedundant.length} story(ies) whose due just restates the sprint end — warning only:`);
          for (const d of dueRedundant) {
            console.log(`    - ${d.id}: due ${d.due} == end of ${d.sprint}. "This sprint" is already said by \`sprint:\` — leave due empty.`);
          }
        }
      }
      process.exit(errorCount === 0 ? 0 : 1);
    });
}
