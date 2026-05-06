#!/usr/bin/env node

/**
 * agile-inject-tasks.mjs — Regenerate Tasks from Acceptance Criteria.
 *
 * AC is canonical — Tasks are derived from AC items. This script reads a
 * story file, extracts the AC checkboxes, and regenerates the Tasks section
 * with properly numbered TASK items.
 *
 * Usage:
 *   node scripts/agile-inject-tasks.mjs --story US-X.Y         # single story
 *   node scripts/agile-inject-tasks.mjs --all                   # all stories
 *   node scripts/agile-inject-tasks.mjs --story US-X.Y --dry-run
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// --- Config ---
const DOCS_PATH = process.argv.includes('--docs-path')
  ? process.argv[process.argv.indexOf('--docs-path') + 1]
  : 'Docs';

const STORIES_DIR = join(DOCS_PATH, 'sprints', 'stories');
const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');
const storyFlagIdx = process.argv.indexOf('--story');
const STORY_FILTER = storyFlagIdx !== -1 ? process.argv[storyFlagIdx + 1] : null;

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

// --- Extract AC items ---
function extractACItems(content) {
  // Find the "## Acceptance criteria" section
  const acMatch = content.match(/## Acceptance criteria\n\n([\s\S]*?)(?=\n## |$)/);
  if (!acMatch) return [];

  const acSection = acMatch[1];
  const items = [];
  const lines = acSection.split('\n');

  for (const line of lines) {
    // Match: "- [ ] AC-1: <description>" or "- [x] AC-1: <description>" or "- [ ] <description>"
    const match = line.match(/^-\s*\[[ x]\]\s*(?:AC-\d+:?\s*)?(.+)/);
    if (match && match[1].trim()) {
      items.push(match[1].trim());
    }
  }

  return items;
}

// --- Generate tasks from AC items ---
function generateTasks(storyId, acItems, keepCompleted) {
  const lines = [];
  lines.push('## Tasks');
  lines.push('');

  if (acItems.length === 0) {
    lines.push('_No AC items to derive tasks from._');
    return lines.join('\n');
  }

  for (let i = 0; i < acItems.length; i++) {
    const taskId = `TASK-${storyId.replace('US-', '')}.${i + 1}`;
    // Derive a short task description from the AC — keep it as-is since AC should be actionable
    const desc = acItems[i];
    lines.push(`- [ ] ${taskId} — ${desc}`);
  }

  return lines.join('\n');
}

// --- Find story files ---
function findStoryFiles() {
  if (!existsSync(STORIES_DIR)) {
    console.error(`✗ Stories directory not found: ${STORIES_DIR}`);
    process.exit(1);
  }

  if (STORY_FILTER) {
    const files = readdirSync(STORIES_DIR).filter(f => f.endsWith('.md'));
    const match = files.find(f => f.startsWith(`${STORY_FILTER}-`) || f.startsWith(`${STORY_FILTER}.`));
    if (!match) {
      console.error(`✗ Story not found: ${STORY_FILTER}`);
      process.exit(1);
    }
    return [join(STORIES_DIR, match)];
  }

  if (ALL) {
    return readdirSync(STORIES_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => join(STORIES_DIR, f));
  }

  console.error('✗ Specify --story US-X.Y or --all');
  process.exit(1);
}

// --- Process one story ---
function processStory(storyPath) {
  const raw = readFileSync(storyPath, 'utf-8');
  const fm = parseFrontmatter(raw);
  const storyId = fm.id;

  if (!storyId) {
    console.log(`⚠ Skipping ${storyPath} — no id in frontmatter`);
    return null;
  }

  const acItems = extractACItems(raw);

  if (acItems.length === 0) {
    console.log(`⚠ ${storyId} — no AC items found`);
    return null;
  }

  // Keep track of existing completed tasks
  const existingTasks = raw.match(/-\s*\[x\]\s*TASK-[^\n]+/g) || [];
  const completedTaskDescs = existingTasks.map(t => {
    const m = t.match(/TASK-[^\s]+\s*—\s*(.+)/);
    return m ? m[1].trim() : null;
  }).filter(Boolean);

  const newTasks = generateTasks(storyId, acItems);

  // Replace the Tasks section
  let updated = raw;
  const tasksSection = raw.match(/## Tasks\n\n[\s\S]*?(?=\n## |$)/);
  if (tasksSection) {
    updated = raw.replace(tasksSection[0], newTasks);

    // Restore completed tasks where descriptions match
    for (const completedDesc of completedTaskDescs) {
      for (let i = 0; i < acItems.length; i++) {
        if (acItems[i] === completedDesc) {
          const taskId = `TASK-${storyId.replace('US-', '')}.${i + 1}`;
          updated = updated.replace(
            `- [ ] ${taskId} — ${completedDesc}`,
            `- [x] ${taskId} — ${completedDesc}`
          );
        }
      }
    }
  } else {
    // No existing Tasks section — append after AC section
    const acEnd = raw.search(/\n## (?!Acceptance)/);
    if (acEnd !== -1) {
      updated = raw.slice(0, acEnd) + '\n' + newTasks + '\n' + raw.slice(acEnd);
    } else {
      updated = raw + '\n' + newTasks + '\n';
    }
  }

  if (!DRY_RUN) {
    writeFileSync(storyPath, updated, 'utf-8');
  }

  return { id: storyId, acCount: acItems.length };
}

// --- Main ---
function main() {
  const storyFiles = findStoryFiles();

  if (DRY_RUN) console.log('🔍 DRY RUN — no files will be modified\n');

  let totalAC = 0;
  for (const storyPath of storyFiles) {
    const result = processStory(storyPath);
    if (result) {
      console.log(`✓ ${result.id} — ${result.acCount} AC → Tasks regenerated`);
      totalAC += result.acCount;
    }
  }

  console.log(`\nDone — ${totalAC} total AC items processed across ${storyFiles.length} story(s).`);
  if (DRY_RUN) console.log('(dry run — no changes written)');
}

main();
