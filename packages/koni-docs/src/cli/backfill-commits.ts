import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Command } from 'commander';
import {
  parseChangelog, updateCommitSha, isGitRepo, findCommitForVersion, findCommitByTag,
} from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

export function registerBackfillCommits(program: Command): void {
  program
    .command('backfill-commits')
    .description('Replace "pending" commit SHAs in CHANGELOG.md with real SHAs from git')
    .action(function (this: Command) {
      const opts = getGlobalOpts(this);
      if (!isGitRepo()) {
        console.error('error: not a git repository');
        process.exit(1);
      }
      const clPath = join(opts.docsPath, 'CHANGELOG.md');
      if (!existsSync(clPath)) {
        console.error(`error: CHANGELOG not found at ${clPath}`);
        process.exit(1);
      }
      let raw = readFileSync(clPath, 'utf-8');
      const entries = parseChangelog(raw);
      const pending = entries.filter(e => !e.commitSha || e.commitSha === 'pending' || e.commitSha === '');
      if (pending.length === 0) {
        if (opts.json) console.log(JSON.stringify({ ok: true, backfilled: 0 }));
        else console.log('✓ no pending commit SHAs found');
        return;
      }
      let backfilled = 0;
      const filledList: Array<{ version: string; sha: string }> = [];
      for (const entry of pending) {
        let sha = findCommitForVersion(entry.version);
        if (!sha) sha = findCommitByTag(`v${entry.version}`);
        if (sha) {
          raw = updateCommitSha(raw, entry.version, sha);
          backfilled++;
          filledList.push({ version: entry.version, sha });
        }
      }
      if (backfilled > 0 && !opts.dryRun) writeFileSync(clPath, raw, 'utf-8');
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, dryRun: opts.dryRun, backfilled, filled: filledList }, null, 2));
      } else {
        console.log(`✓ backfilled ${backfilled}/${pending.length} commit SHAs${opts.dryRun ? ' (dry run)' : ''}`);
        for (const f of filledList) console.log(`  v${f.version} → ${f.sha}`);
      }
    });
}
