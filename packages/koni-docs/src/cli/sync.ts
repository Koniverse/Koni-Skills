import type { Command } from 'commander';
import {
  loadCorpus, getStories, resolveById, readDoc, writeDoc,
  updateCell, type MatterEntry, type Corpus,
} from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

function statusIcon(status: string): string {
  switch (status) {
    case 'done': return '✅ done';
    case 'in-progress': return '🚧 in-progress';
    case 'review': return '👀 review';
    case 'blocked': return '🚫 blocked';
    case 'deprecated': return '🗑️ deprecated';
    case 'ready': return '🟢 ready';
    default: return '📋 backlog';
  }
}

function frStatusIcon(status: string, version: string | undefined): string {
  if (status === 'done' && version) return `✅ shipped (v${version})`;
  if (status === 'in-progress') return '🚧 In progress';
  if (status === 'deprecated') return '🗑️ deprecated';
  return '📋 Backlog';
}

function versionCell(status: string, version: string | undefined): string {
  return version && status === 'done' ? `v${version}` : '—';
}

interface SyncStats {
  epic: number;
  prdStory: number;
  prdFr: number;
  sprint: number;
  skipped: number;
  warnings: string[];
}

function findEpicPath(corpus: Corpus, epicId: string): string | null {
  const epic = corpus.epics.find(e => e.frontmatter.id === epicId);
  return epic?.path ?? null;
}

function findSprintPath(corpus: Corpus, sprintId: string): string | null {
  const sprint = corpus.sprints.find(s => s.frontmatter.id === sprintId);
  return sprint?.path ?? null;
}

function syncOne(corpus: Corpus, story: MatterEntry, dryRun: boolean): SyncStats {
  const stats: SyncStats = { epic: 0, prdStory: 0, prdFr: 0, sprint: 0, skipped: 0, warnings: [] };
  const fm = story.frontmatter;
  const id = String(fm.id ?? '');
  const epic = String(fm.epic ?? '');
  const status = String(fm.status ?? 'backlog');
  const version = typeof fm.version_shipped === 'string' && fm.version_shipped.length > 0
    ? fm.version_shipped : undefined;
  const sprint = typeof fm.sprint === 'string' && fm.sprint.length > 0 ? fm.sprint : null;
  const prdRef = typeof fm.prd_ref === 'string' ? fm.prd_ref.split(',').map(s => s.trim()).filter(Boolean) :
    Array.isArray(fm.prd_ref) ? fm.prd_ref.filter((x): x is string => typeof x === 'string') : [];

  // 1. Epic Stories table
  const epicPath = findEpicPath(corpus, epic);
  if (epicPath) {
    try {
      const doc = readDoc(epicPath);
      updateCell(doc, {
        tableLocator: { inSection: 'Stories' },
        rowMatcher: { column: 'ID', value: id },
        column: 'Status',
        value: statusIcon(status),
      });
      updateCell(doc, {
        tableLocator: { inSection: 'Stories' },
        rowMatcher: { column: 'ID', value: id },
        column: 'Version',
        value: versionCell(status, version),
      });
      if (!dryRun) writeDoc(epicPath, doc);
      stats.epic++;
    } catch (e) {
      stats.warnings.push(`epic ${epic}: ${(e as Error).message}`);
    }
  } else {
    stats.warnings.push(`epic ${epic} not found for story ${id}`);
  }

  // 2. Sprint scope table (status only — no version column in sprint scope)
  if (sprint) {
    const sprintPath = findSprintPath(corpus, sprint);
    if (sprintPath) {
      try {
        const doc = readDoc(sprintPath);
        updateCell(doc, {
          tableLocator: { inSection: 'Sprint scope' },
          rowMatcher: { column: 'US', value: id },
          column: 'Status',
          value: statusIcon(status),
        });
        if (!dryRun) writeDoc(sprintPath, doc);
        stats.sprint++;
      } catch (e) {
        stats.warnings.push(`sprint ${sprint}: ${(e as Error).message}`);
      }
    } else {
      stats.warnings.push(`sprint ${sprint} not found for story ${id}`);
    }
  }

  // 3. PRD §8 FR rows
  const prdEntry = corpus.singletons.prd;
  if (prdEntry && prdRef.length > 0) {
    try {
      const doc = readDoc(prdEntry.path);
      let prdFrUpdated = 0;
      for (const fr of prdRef) {
        try {
          updateCell(doc, {
            tableLocator: { inSection: 'Functional requirements' },
            rowMatcher: { column: 'ID', value: fr },
            column: 'Status',
            value: frStatusIcon(status, version),
          });
          prdFrUpdated++;
        } catch {
          // Try section header with section-number prefix
          try {
            updateCell(doc, {
              tableLocator: { inSection: '8. Functional requirements' },
              rowMatcher: { column: 'ID', value: fr },
              column: 'Status',
              value: frStatusIcon(status, version),
            });
            prdFrUpdated++;
          } catch (e) {
            stats.warnings.push(`PRD §8 FR ${fr}: ${(e as Error).message}`);
          }
        }
      }
      if (prdFrUpdated > 0 && !dryRun) writeDoc(prdEntry.path, doc);
      stats.prdFr += prdFrUpdated;
    } catch (e) {
      stats.warnings.push(`PRD: ${(e as Error).message}`);
    }
  }

  return stats;
}

export function registerSync(program: Command): void {
  program
    .command('sync')
    .description('Propagate story status across the 5-layer doc surface')
    .option('--story <id>', 'sync only this story (US-X.Y); omit to sync all')
    .action(function (this: Command, cmdOpts: { story?: string }) {
      const opts = getGlobalOpts(this);
      const corpus = loadCorpus(opts.docsPath);

      let targets: MatterEntry[];
      if (cmdOpts.story) {
        const s = resolveById(corpus, cmdOpts.story);
        if (!s || !cmdOpts.story.startsWith('US-')) {
          console.error(`error: story ${cmdOpts.story} not found in ${opts.docsPath}`);
          process.exit(1);
        }
        targets = [s];
      } else {
        targets = getStories(corpus);
      }

      const totals: SyncStats = { epic: 0, prdStory: 0, prdFr: 0, sprint: 0, skipped: 0, warnings: [] };
      for (const story of targets) {
        const s = syncOne(corpus, story, opts.dryRun);
        totals.epic += s.epic;
        totals.prdFr += s.prdFr;
        totals.sprint += s.sprint;
        totals.warnings.push(...s.warnings);
      }

      if (opts.json) {
        console.log(JSON.stringify({ ok: true, dryRun: opts.dryRun, totals }, null, 2));
      } else {
        console.log(`✓ epic:${totals.epic} sprint:${totals.sprint} PRD-FR:${totals.prdFr} (${targets.length} stor${targets.length === 1 ? 'y' : 'ies'})`);
        for (const w of totals.warnings) console.log(`  ⚠ ${w}`);
      }
      if (opts.dryRun) console.log('(dry run — no changes written)');
    });
}
