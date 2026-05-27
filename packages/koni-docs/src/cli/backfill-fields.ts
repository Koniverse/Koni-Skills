import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Command } from 'commander';
import { readDoc, writeDoc, updateFrontmatter } from '../lib/index.ts';
import { STORY_DEFAULTS } from '../lib/schemas/story.ts';
import { getGlobalOpts } from './global-opts.ts';

export function registerBackfillFields(program: Command): void {
  program
    .command('backfill-fields')
    .description('Add missing standard frontmatter fields to story files')
    .action(function (this: Command) {
      const opts = getGlobalOpts(this);
      const storiesDir = join(opts.docsPath, 'sprints', 'stories');
      const files = readdirSync(storiesDir).filter(f => f.endsWith('.md'));

      let updatedCount = 0;
      const addedFieldsByFile: Array<{ file: string; added: string[] }> = [];

      for (const f of files) {
        const path = join(storiesDir, f);
        const doc = readDoc(path);
        if (!doc.frontmatter.id) continue;
        const missing: string[] = [];
        const patch: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(STORY_DEFAULTS)) {
          if (!(k in doc.frontmatter)) {
            patch[k] = v;
            missing.push(k);
          }
        }
        if (missing.length === 0) continue;
        const next = updateFrontmatter(doc, patch);
        if (!opts.dryRun) writeDoc(path, next);
        updatedCount++;
        addedFieldsByFile.push({ file: f, added: missing });
      }

      if (opts.json) {
        console.log(JSON.stringify({ ok: true, dryRun: opts.dryRun, updated: updatedCount, files: addedFieldsByFile }, null, 2));
      } else if (updatedCount === 0) {
        console.log('✓ all story files have complete frontmatter');
      } else {
        console.log(`✓ ${updatedCount} stor${updatedCount === 1 ? 'y' : 'ies'} backfilled${opts.dryRun ? ' (dry run — no changes written)' : ''}`);
        for (const e of addedFieldsByFile) console.log(`  ${e.file}: +${e.added.join(', ')}`);
      }
    });
}
