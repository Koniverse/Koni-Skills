import type { Command } from 'commander';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  readDoc, writeDoc, parseCheckboxes, replaceSection,
  type CheckboxItem,
} from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

function generateTasksMarkdown(storyId: string, acItems: CheckboxItem[]): string {
  if (acItems.length === 0) return '\n_No AC items to derive tasks from._\n';
  const lines: string[] = [];
  for (let i = 0; i < acItems.length; i++) {
    const taskId = `TASK-${storyId.replace('US-', '')}.${i + 1}`;
    lines.push(`- [ ] **${taskId}** — ${acItems[i]!.text}`);
  }
  return '\n' + lines.join('\n') + '\n';
}

function injectIntoStory(storyPath: string): { id: string; acCount: number } | null {
  const doc = readDoc(storyPath);
  const id = String(doc.frontmatter.id ?? '');
  if (!id) return null;
  const ac = parseCheckboxes(doc, 'Acceptance criteria');
  if (ac.length === 0) return null;
  const tasksMd = generateTasksMarkdown(id, ac);
  const next = replaceSection(doc, 'Tasks', tasksMd);
  writeDoc(storyPath, next);
  return { id, acCount: ac.length };
}

export function registerInjectTasks(program: Command): void {
  program
    .command('inject-tasks')
    .description('Regenerate ## Tasks from ## Acceptance criteria')
    .option('--story <id>', 'inject one story (US-X.Y)')
    .option('--all', 'inject all stories in docs/sprints/stories/', false)
    .action(function (this: Command, cmdOpts: { story?: string; all?: boolean }) {
      const opts = getGlobalOpts(this);
      if (!cmdOpts.story && !cmdOpts.all) {
        console.error('error: specify --story <id> or --all');
        process.exit(1);
      }

      const storiesDir = join(opts.docsPath, 'sprints', 'stories');
      const allFiles = readdirSync(storiesDir).filter(f => f.endsWith('.md'));
      let targets: string[];
      if (cmdOpts.story) {
        const match = allFiles.find(f => f.startsWith(`${cmdOpts.story}-`) || f.startsWith(`${cmdOpts.story}.`));
        if (!match) {
          console.error(`error: story ${cmdOpts.story} not found in ${storiesDir}`);
          process.exit(1);
        }
        targets = [join(storiesDir, match)];
      } else {
        targets = allFiles.map(f => join(storiesDir, f));
      }

      const results: Array<{ id: string; acCount: number }> = [];
      for (const path of targets) {
        const r = injectIntoStory(path);
        if (r) results.push(r);
      }

      if (opts.json) console.log(JSON.stringify({ ok: true, stories: results }, null, 2));
      else console.log(`✓ ${results.length} stor${results.length === 1 ? 'y' : 'ies'} updated (${results.reduce((s, r) => s + r.acCount, 0)} AC items)`);
    });
}
