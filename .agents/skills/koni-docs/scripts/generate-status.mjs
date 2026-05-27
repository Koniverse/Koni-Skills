#!/usr/bin/env node

/**
 * generate-status.mjs — Regenerate STATUS.md from all story frontmatter.
 *
 * Scans Docs/sprints/stories/*.md, reads each story's YAML frontmatter,
 * groups by status, and writes Docs/sprints/STATUS.md as a kanban board.
 *
 * Usage: node scripts/generate-status.mjs [--docs-path Docs/]
 *
 * Intended to be wired as: npm run agile:status
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Config ---
const DOCS_PATH = process.argv.includes('--docs-path')
  ? process.argv[process.argv.indexOf('--docs-path') + 1]
  : 'Docs';

const STORIES_DIR = join(DOCS_PATH, 'sprints', 'stories');
const STATUS_PATH = join(DOCS_PATH, 'sprints', 'STATUS.md');

// --- Frontmatter parser ---
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value || '';
  }
  return data;
}

// --- Status display config ---
const STATUS_ORDER = ['backlog', 'ready', 'in-progress', 'review', 'done', 'blocked', 'deprecated'];
const STATUS_EMOJI = {
  'backlog': '📋',
  'ready': '🟢',
  'in-progress': '🟡',
  'review': '👀',
  'done': '✅',
  'blocked': '🚫',
  'deprecated': '🗑️',
};
const STATUS_LABEL = {
  'backlog': 'Backlog',
  'ready': 'Ready',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
  'blocked': 'Blocked',
  'deprecated': 'Deprecated',
};

// --- Main ---
function main() {
  if (!existsSync(STORIES_DIR)) {
    console.error(`✗ Stories directory not found: ${STORIES_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(STORIES_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No story files found. Generating empty STATUS.md.');
  }

  // Parse all stories — skip files without a parseable story frontmatter
  // (e.g. README.md or index files in the stories directory).
  const stories = [];
  const skipped = [];
  for (const file of files) {
    const raw = readFileSync(join(STORIES_DIR, file), 'utf-8');
    const fm = parseFrontmatter(raw);
    if (!fm.id) { skipped.push(file); continue; }
    fm._file = file;
    stories.push(fm);
  }
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} file(s) without an \`id\` frontmatter: ${skipped.join(', ')}`);
  }

  // Sort: by epic then by id
  stories.sort((a, b) => {
    const ea = a.epic || '';
    const eb = b.epic || '';
    if (ea !== eb) return ea.localeCompare(eb);
    return (a.id || '').localeCompare(b.id || '');
  });

  // Group by status
  const grouped = {};
  for (const s of STATUS_ORDER) grouped[s] = [];
  for (const story of stories) {
    const status = STATUS_ORDER.includes(story.status) ? story.status : 'backlog';
    grouped[status].push(story);
  }

  // Build markdown
  const lines = [];

  lines.push('# Sprint Status');
  lines.push('');
  lines.push('> **AUTO-GENERATED** by `npm run agile:status`. Do not hand-edit (RULE-5).');
  lines.push(`> Last generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`);
  lines.push(`> Total stories: ${stories.length}`);

  for (const status of STATUS_ORDER) {
    const bucket = grouped[status];
    lines.push('');
    lines.push(`## ${STATUS_EMOJI[status]} ${STATUS_LABEL[status]} (${bucket.length})`);
    lines.push('');

    if (bucket.length === 0) {
      lines.push('_No stories_');
      continue;
    }

    lines.push('| ID | Title | Epic | Pri | Points | Sprint | Assignee |');
    lines.push('|---|---|---|---|---|---|---|');

    for (const s of bucket) {
      const id = s.id || '—';
      const title = s.title ? s.title.replace(/\|/g, '\\|') : '—';
      const epic = s.epic || '—';
      const pri = s.priority || '—';
      const points = s.points || '—';
      const sprint = s.sprint || '—';
      const assignee = s.assignee || '—';
      lines.push(`| ${id} | ${title} | ${epic} | ${pri} | ${points} | ${sprint} | ${assignee} |`);
    }
  }

  // Summary section
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  for (const status of STATUS_ORDER) {
    lines.push(`- ${STATUS_EMOJI[status]} **${STATUS_LABEL[status]}**: ${grouped[status].length}`);
  }

  // WIP limit check
  const wip = grouped['in-progress'].length;
  lines.push('');
  if (wip > 3) {
    lines.push(`⚠️  **WIP limit exceeded**: ${wip} stories in-progress (limit: 3).`);
  } else {
    lines.push(`✓ WIP: ${wip}/3 stories in-progress.`);
  }

  // Ensure output directory exists
  const outDir = dirname(STATUS_PATH);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  writeFileSync(STATUS_PATH, lines.join('\n') + '\n', 'utf-8');
  console.log(`✓ STATUS.md regenerated — ${stories.length} stories across ${STATUS_ORDER.filter(s => grouped[s].length > 0).length} columns`);
}

main();
