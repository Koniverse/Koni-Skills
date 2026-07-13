import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { Command } from 'commander';
import { loadCorpus, getStories, getDeadlines } from '../lib/index.ts';
import type { Corpus, Deadline, DeadlineState, MatterEntry } from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

/** A deadline within this many days of today counts as due-soon. */
const DEFAULT_DUE_SOON_DAYS = 3;

const DEADLINE_EMOJI: Record<DeadlineState, string> = {
  overdue: '🔴', 'due-soon': '🟠', 'on-track': '🟢',
};

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

/**
 * The `## ⏰ Deadlines` block. Rendered above the kanban columns: a story that
 * owes someone a date is the first thing worth seeing.
 *
 * Only stories carrying an explicit `due` appear. Sprint end dates are NOT
 * inherited — see lib/deadlines.ts for why the noise would defeat the point.
 */
function renderDeadlines(deadlines: Deadline[]): string[] {
  const lines: string[] = [];
  lines.push('');
  lines.push(`## ⏰ Deadlines (${deadlines.length})`);
  lines.push('');

  if (deadlines.length === 0) {
    lines.push('_No stories carry an explicit deadline._');
    return lines;
  }

  lines.push('| ID | Title | Due | Days | State | Assignee |');
  lines.push('|---|---|---|---|---|---|');
  for (const d of deadlines) {
    const title = d.title.replace(/\|/g, '\\|');
    // Signed, always — "+2" and "-3" read as a direction, "2" reads as a count.
    const days = d.daysRemaining >= 0 ? `+${d.daysRemaining}` : String(d.daysRemaining);
    lines.push(
      `| ${d.id || '—'} | ${title || '—'} | ${d.due} | ${days} | ${DEADLINE_EMOJI[d.state]} ${d.state} | ${d.assignee || '—'} |`,
    );
  }
  return lines;
}

function renderDeadlineSummary(deadlines: Deadline[], dueSoonDays: number): string {
  const overdue = deadlines.filter(d => d.state === 'overdue').length;
  const dueSoon = deadlines.filter(d => d.state === 'due-soon').length;
  if (overdue === 0 && dueSoon === 0) return '✓ No overdue stories.';
  const parts: string[] = [];
  if (overdue > 0) parts.push(`${overdue} overdue`);
  if (dueSoon > 0) parts.push(`${dueSoon} due within ${dueSoonDays} day${dueSoonDays === 1 ? '' : 's'}`);
  return `⚠️  **Deadlines**: ${parts.join(' · ')}.`;
}

function renderKanban(stories: MatterEntry[], deadlines: Deadline[], dueSoonDays: number): string {
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

  lines.push(...renderDeadlines(deadlines));

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
  lines.push('');
  lines.push(renderDeadlineSummary(deadlines, dueSoonDays));
  return lines.join('\n') + '\n';
}

interface StatusFlags {
  dueSoonDays: string;
}

/** Rejects `--due-soon-days garbage` / `-1` loudly instead of silently meaning 0. */
function parseDueSoonDays(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    console.error(`✗ --due-soon-days must be a non-negative integer (got "${raw}")`);
    process.exit(2);
  }
  return n;
}

export function renderStatus(corpus: Corpus, today: Date, dueSoonDays: number): string {
  const stories = getStories(corpus);
  const deadlines = getDeadlines(corpus, today, dueSoonDays);
  return renderKanban(stories, deadlines, dueSoonDays);
}

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Regenerate sprints/STATUS.md from story frontmatter')
    .option(
      '--due-soon-days <n>',
      'a story due within this many days is flagged due-soon',
      String(DEFAULT_DUE_SOON_DAYS),
    )
    .action(function (this: Command, cmdOpts: StatusFlags) {
      const opts = getGlobalOpts(this);
      const dueSoonDays = parseDueSoonDays(cmdOpts.dueSoonDays);
      const corpus = loadCorpus(opts.docsPath);
      const stories = getStories(corpus);
      const deadlines = getDeadlines(corpus, new Date(), dueSoonDays);
      const overdue = deadlines.filter(d => d.state === 'overdue').length;
      const out = renderKanban(stories, deadlines, dueSoonDays);
      const outPath = join(opts.docsPath, 'sprints', 'STATUS.md');
      if (opts.dryRun) {
        if (opts.json) console.log(JSON.stringify({ ok: true, dryRun: true, storyCount: stories.length, deadlineCount: deadlines.length, overdue }));
        else console.log(`(dry run) would write ${outPath} (${stories.length} stories)`);
        return;
      }
      if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, out, 'utf-8');
      if (opts.json) console.log(JSON.stringify({ ok: true, path: outPath, storyCount: stories.length, deadlineCount: deadlines.length, overdue }));
      else {
        console.log(`✓ wrote ${outPath} (${stories.length} stories)`);
        if (overdue > 0) console.log(`⚠️  ${overdue} story(ies) overdue — see the Deadlines section.`);
      }
    });
}
