import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { Command } from 'commander';
import { loadCorpus, getStories } from '../lib/index.ts';
import type { MatterEntry } from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

const STATUS_ORDER = ['backlog', 'ready', 'in-progress', 'review', 'done', 'blocked', 'deprecated'] as const;
const STATUS_EMOJI: Record<string, string> = {
  backlog: '📋', ready: '🟢', 'in-progress': '🟡', review: '👀',
  done: '✅', blocked: '🚫', deprecated: '🗑️',
};
const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog', ready: 'Ready', 'in-progress': 'In Progress',
  review: 'Review', done: 'Done', blocked: 'Blocked', deprecated: 'Deprecated',
};

function semverIdCompare(a: string, b: string): number {
  const parseId = (id: string): [number, number] => {
    const m = id.match(/^US-(\d+)\.(\d+)$/);
    return m ? [Number(m[1]), Number(m[2])] : [0, 0];
  };
  const [aMaj, aMin] = parseId(a);
  const [bMaj, bMin] = parseId(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  return aMin - bMin;
}

function renderKanban(stories: MatterEntry[]): string {
  const grouped: Record<string, MatterEntry[]> = {};
  for (const s of STATUS_ORDER) grouped[s] = [];
  for (const story of stories) {
    const status = STATUS_ORDER.includes(story.frontmatter.status as (typeof STATUS_ORDER)[number])
      ? (story.frontmatter.status as string)
      : 'backlog';
    grouped[status]!.push(story);
  }
  for (const s of STATUS_ORDER) {
    grouped[s]!.sort((a, b) => {
      const ea = String(a.frontmatter.epic ?? '');
      const eb = String(b.frontmatter.epic ?? '');
      if (ea !== eb) return ea.localeCompare(eb);
      return semverIdCompare(String(a.frontmatter.id ?? ''), String(b.frontmatter.id ?? ''));
    });
  }

  const lines: string[] = [];
  lines.push('# Sprint Status');
  lines.push('');
  lines.push('> **AUTO-GENERATED** by `koni-docs status`. Do not hand-edit (RULE-5).');
  lines.push(`> Last generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`);
  lines.push(`> Total stories: ${stories.length}`);

  for (const status of STATUS_ORDER) {
    const bucket = grouped[status]!;
    lines.push('');
    lines.push(`## ${STATUS_EMOJI[status]} ${STATUS_LABEL[status]} (${bucket.length})`);
    lines.push('');
    if (bucket.length === 0) { lines.push('_No stories_'); continue; }
    lines.push('| ID | Title | Epic | Pri | Points | Sprint | Assignee |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const s of bucket) {
      const id = String(s.frontmatter.id ?? '—');
      const title = String(s.frontmatter.title ?? '—').replace(/\|/g, '\\|');
      const epic = String(s.frontmatter.epic ?? '—');
      const pri = String(s.frontmatter.priority ?? '—');
      const points = String(s.frontmatter.points ?? '—');
      const sprint = String(s.frontmatter.sprint ?? '—');
      const assignee = String(s.frontmatter.assignee ?? '—');
      lines.push(`| ${id} | ${title} | ${epic} | ${pri} | ${points} | ${sprint} | ${assignee} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  for (const status of STATUS_ORDER) {
    lines.push(`- ${STATUS_EMOJI[status]} **${STATUS_LABEL[status]}**: ${grouped[status]!.length}`);
  }
  const wip = grouped['in-progress']!.length;
  lines.push('');
  lines.push(wip > 3 ? `⚠️  **WIP limit exceeded**: ${wip} stories in-progress (limit: 3).` : `✓ WIP: ${wip}/3 stories in-progress.`);
  return lines.join('\n') + '\n';
}

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Regenerate sprints/STATUS.md from story frontmatter')
    .action(function (this: Command) {
      const opts = getGlobalOpts(this);
      const corpus = loadCorpus(opts.docsPath);
      const stories = getStories(corpus);
      const out = renderKanban(stories);
      const outPath = join(opts.docsPath, 'sprints', 'STATUS.md');
      if (opts.dryRun) {
        if (opts.json) console.log(JSON.stringify({ ok: true, dryRun: true, storyCount: stories.length }));
        else console.log(`(dry run) would write ${outPath} (${stories.length} stories)`);
        return;
      }
      if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, out, 'utf-8');
      if (opts.json) console.log(JSON.stringify({ ok: true, path: outPath, storyCount: stories.length }));
      else console.log(`✓ wrote ${outPath} (${stories.length} stories)`);
    });
}
