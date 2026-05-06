#!/usr/bin/env node

/**
 * agile-sync-up.mjs — Propagate story status upward through all 5 doc layers.
 *
 * For each story file in Docs/sprints/stories/, this script:
 *   1. Updates the EPIC file's Stories table (status + version)
 *   2. Updates PRD.md §7 story entry (status)
 *   3. Updates PRD.md §4 FR table row (status) via prd_ref field
 *   4. Updates the active sprint file's scope table
 *   5. (STATUS.md is handled separately by generate-status.mjs)
 *
 * Usage: node scripts/agile-sync-up.mjs [--docs-path Docs/] [--story US-X.Y]
 *
 * With --story, sync only that one story. Without, sync all stories.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// --- Config ---
const DOCS_PATH = process.argv.includes('--docs-path')
  ? process.argv[process.argv.indexOf('--docs-path') + 1]
  : 'Docs';

const storyFlagIdx = process.argv.indexOf('--story');
const STORY_FILTER = storyFlagIdx !== -1 ? process.argv[storyFlagIdx + 1] : null;
const DRY_RUN = process.argv.includes('--dry-run');

const STORIES_DIR = join(DOCS_PATH, 'sprints', 'stories');
const EPICS_DIR = join(DOCS_PATH, 'sprints', 'epics');
const SPRINTS_DIR = join(DOCS_PATH, 'sprints');
const PRD_PATH = join(DOCS_PATH, 'PRD.md');

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

// --- Find matching epic file ---
function findEpicFile(epicId) {
  if (!existsSync(EPICS_DIR)) return null;
  const files = readdirSync(EPICS_DIR).filter(f => f.endsWith('.md'));
  for (const f of files) {
    if (f.startsWith(`${epicId}.`) || f.startsWith(`${epicId}-`)) return join(EPICS_DIR, f);
    // Also try reading frontmatter to match by id
    const raw = readFileSync(join(EPICS_DIR, f), 'utf-8');
    const fm = parseFrontmatter(raw);
    if (fm.id === epicId) return join(EPICS_DIR, f);
  }
  return null;
}

// --- Find matching story file ---
function findStoryFile(storyId) {
  if (!existsSync(STORIES_DIR)) return null;
  const files = readdirSync(STORIES_DIR).filter(f => f.endsWith('.md'));
  for (const f of files) {
    if (f.startsWith(`${storyId}-`) || f.startsWith(`${storyId}.`)) return join(STORIES_DIR, f);
  }
  return null;
}

// --- Update epic Stories table row ---
function updateEpicStoriesTable(epicPath, storyId, status, version) {
  let content = readFileSync(epicPath, 'utf-8');
  const statusIcon = status === 'done' ? '✅ done' :
    status === 'in-progress' ? '🚧 in-progress' :
    status === 'review' ? '👀 review' :
    status === 'blocked' ? '🚫 blocked' :
    status === 'ready' ? '🟢 ready' : '📋 backlog';
  const versionStr = version && status === 'done' ? `v${version}` : '—';

  // Match the story row in the Stories table: | [US-X.Y](...) | <title> | <status> | <version> |
  const rowPattern = new RegExp(
    `(\\| \\[${storyId.replace(/\./g, '\\.')}\\]\\([^)]+\\) \\| [^|]+ \\| )[^|]+( \\| )[^|]*( \\|)`,
    'g'
  );

  if (rowPattern.test(content)) {
    content = content.replace(rowPattern, `$1${statusIcon}$2${versionStr}$3`);
    if (!DRY_RUN) writeFileSync(epicPath, content, 'utf-8');
    return true;
  }
  return false;
}

// --- Update PRD §7 story entry ---
// Returns: 'updated' | 'current' | 'not_found'
function updatePRDStoryEntry(prdPath, storyId, status, version) {
  let content = readFileSync(prdPath, 'utf-8');

  // Find the story section: ### US-X.Y — <title>
  const sectionStart = new RegExp(
    `### ${storyId.replace(/\./g, '\\.')} — .+`,
    'g'
  );

  const match = content.match(sectionStart);
  if (!match) return 'not_found';

  // Find the status line within the story section
  const startIdx = content.indexOf(match[0]);
  const afterSection = content.slice(startIdx);
  const nextSection = afterSection.search(/\n### /);
  const section = nextSection !== -1 ? afterSection.slice(0, nextSection) : afterSection;

  const newStatus = status === 'done' && version
    ? `✅ Done (v${version})`
    : status === 'in-progress' ? '🚧 In progress'
    : status === 'review' ? '👀 In review'
    : status === 'blocked' ? '🚫 Blocked'
    : '📋 Backlog';

  const updatedSection = section.replace(
    /\*\*Status\*\*: .+/,
    `**Status**: ${newStatus}`
  );

  if (updatedSection !== section) {
    content = content.replace(section, updatedSection);
    if (!DRY_RUN) writeFileSync(prdPath, content, 'utf-8');
    return 'updated';
  }
  return 'current';
}

// --- Update PRD §4 FR table row ---
function updatePRDFRRow(prdPath, frRef, status, version) {
  if (!frRef) return false;
  let content = readFileSync(prdPath, 'utf-8');

  const newStatus = status === 'done' && version
    ? `✅ shipped (v${version})`
    : status === 'in-progress' ? '🚧 In progress'
    : '📋 Backlog';

  // Match FR table row: | FR-N | <desc> | <pri> | <status> | <epic> |
  const rowPattern = new RegExp(
    `(\\| ${frRef.replace(/\./g, '\\.')} \\| [^|]+ \\| [^|]+ \\| )[^|]+( \\|)`,
    'g'
  );

  if (rowPattern.test(content)) {
    content = content.replace(rowPattern, `$1${newStatus}$2`);
    if (!DRY_RUN) writeFileSync(prdPath, content, 'utf-8');
    return true;
  }
  return false;
}

// --- Update sprint file scope table ---
function updateSprintScopeTable(sprintId, storyId, status, version) {
  if (!sprintId) return false;
  if (!existsSync(SPRINTS_DIR)) return false;

  // Find sprint file
  const sprintFiles = readdirSync(SPRINTS_DIR).filter(f => f.startsWith('sprint-') && f.endsWith('.md'));
  const sprintFile = sprintFiles.find(f => f.startsWith(`${sprintId}.`) || f.startsWith(`${sprintId}-`));
  if (!sprintFile) return false;

  const sprintPath = join(SPRINTS_DIR, sprintFile);
  let content = readFileSync(sprintPath, 'utf-8');

  const statusIcon = status === 'done' ? '✅ done' :
    status === 'in-progress' ? '🚧 in-progress' :
    status === 'review' ? '👀 review' :
    status === 'blocked' ? '🚫 blocked' : '📋 backlog';

  // Match the story row in the sprint scope table
  const rowPattern = new RegExp(
    `(\\| ${storyId.replace(/\./g, '\\.')} \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| )[^|]+( \\|)`,
    'g'
  );

  if (rowPattern.test(content)) {
    content = content.replace(rowPattern, `$1${statusIcon}$2`);
    if (!DRY_RUN) writeFileSync(sprintPath, content, 'utf-8');
    return true;
  }
  return false;
}

// --- Main ---
function main() {
  if (!existsSync(STORIES_DIR)) {
    console.error(`✗ Stories directory not found: ${STORIES_DIR}`);
    process.exit(1);
  }

  // Determine which stories to process
  let storyFiles;
  if (STORY_FILTER) {
    const path = findStoryFile(STORY_FILTER);
    if (!path) {
      console.error(`✗ Story not found: ${STORY_FILTER}`);
      process.exit(1);
    }
    storyFiles = [path];
  } else {
    storyFiles = readdirSync(STORIES_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => join(STORIES_DIR, f));
  }

  if (DRY_RUN) console.log('🔍 DRY RUN — no files will be modified\n');

  const results = { epic: 0, prdStory: 0, prdFR: 0, sprint: 0, skipped: 0 };

  for (const storyPath of storyFiles) {
    const raw = readFileSync(storyPath, 'utf-8');
    const fm = parseFrontmatter(raw);
    const { id, epic, priority, status, sprint, version_shipped, prd_ref } = fm;

    if (!id) {
      results.skipped++;
      continue;
    }

    const storyLabel = `${id} (${status || 'no status'})`;
    console.log(`\n📄 ${storyLabel}`);

    // 1. Epic file
    if (epic) {
      const epicPath = findEpicFile(epic);
      if (epicPath) {
        const ok = updateEpicStoriesTable(epicPath, id, status, version_shipped);
        console.log(ok ? `  ✓ Epic ${epic} updated` : `  ⚠ Epic ${epic} — story row not found in table`);
        if (ok) results.epic++;
      } else {
        console.log(`  ⚠ Epic file not found for ${epic}`);
      }
    }

    // 2. PRD §7
    if (existsSync(PRD_PATH)) {
      const prdResult = updatePRDStoryEntry(PRD_PATH, id, status, version_shipped);
      if (prdResult === 'updated') {
        console.log('  ✓ PRD §7 updated');
        results.prdStory++;
      } else if (prdResult === 'current') {
        console.log('  - PRD §7 already up to date');
      } else {
        console.log('  ⚠ PRD §7 — story entry not found');
      }

      // 3. PRD §4 (FR table)
      if (prd_ref) {
        const okFR = updatePRDFRRow(PRD_PATH, prd_ref, status, version_shipped);
        console.log(okFR ? '  ✓ PRD §4 FR row updated' : '  ⚠ PRD §4 — FR row not found');
        if (okFR) results.prdFR++;
      }
    }

    // 4. Sprint file
    if (sprint) {
      const ok = updateSprintScopeTable(sprint, id, status, version_shipped);
      console.log(ok ? `  ✓ Sprint ${sprint} updated` : `  ⚠ Sprint ${sprint} — story row not found`);
      if (ok) results.sprint++;
    }
  }

  console.log(`\n---`);
  console.log(`Results: ${results.epic} epic(s), ${results.prdStory} PRD story(s), ${results.prdFR} FR row(s), ${results.sprint} sprint(s) updated. ${results.skipped} skipped.`);
  if (DRY_RUN) console.log('(dry run — no changes written)');
}

main();
