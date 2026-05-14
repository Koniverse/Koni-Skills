#!/usr/bin/env node

/**
 * agile-sync-up.mjs — Propagate story status upward through all 5 doc layers.
 *
 * For each story file in <docs>/sprints/stories/, this script:
 *   1. Updates the EPIC file's Stories table (status + version) — handles
 *      both the 4-column (ID/Title/Status/Version) and 5-column
 *      (ID/Title/Goal/Status/Version) shapes by replacing the LAST TWO
 *      data cells of the matched row.
 *   2. Updates PRD.md story entry — tries the per-story `### US-X.Y` section
 *      format (old), then falls back to the per-epic table format under
 *      §Epics & User Stories (new template).
 *   3. Updates PRD.md FR table row (status) via prd_ref field.
 *   4. Updates the active sprint file's scope table (status only — sprint
 *      scope has no version column).
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

// --- Status icon helpers ---
function statusIconShort(status) {
  return status === 'done' ? '✅ done' :
    status === 'in-progress' ? '🚧 in-progress' :
    status === 'review' ? '👀 review' :
    status === 'blocked' ? '🚫 blocked' :
    status === 'ready' ? '🟢 ready' : '📋 backlog';
}

// --- Table-row updater (column-shape-agnostic) ---
//
// Locates a markdown table row matching `rowMatcher(line)` and rewrites
// specific data cells named by `updates`. Cell positions are addressed
// from the END of the row, which keeps the updater robust against
// inserted columns (e.g. the new "Goal" column on EPIC stories tables).
//
// `updates` is an array of `[fromEnd, value]` pairs where fromEnd=0 is
// the last data cell, fromEnd=1 is the second-to-last, etc.
function updateTableRowCells(content, rowMatcher, updates) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!rowMatcher(lines[i])) continue;
    const cells = lines[i].split('|');
    // A valid pipe-table row has empty strings at cells[0] and cells[last]
    // (the text before the first `|` and after the last `|`).
    if (cells.length < 4) continue;
    if (cells[0].trim() !== '' || cells[cells.length - 1].trim() !== '') continue;
    const dataCellCount = cells.length - 2;
    for (const [fromEnd, value] of updates) {
      const pos = cells.length - 2 - fromEnd;
      if (pos < 1 || pos > dataCellCount) continue;
      cells[pos] = ` ${value} `;
    }
    lines[i] = cells.join('|');
    return { content: lines.join('\n'), updated: true };
  }
  return { content, updated: false };
}

// --- Match helpers for table rows ---
function epicStoryRowMatcher(storyId) {
  // Matches both `| [US-X.Y](...) |` and `| US-X.Y |` first-cell shapes.
  const escaped = storyId.replace(/\./g, '\\.');
  const linked = new RegExp(`\\|\\s*\\[${escaped}\\]\\(`);
  const plain = new RegExp(`\\|\\s*${escaped}\\s*\\|`);
  return (line) => linked.test(line) || plain.test(line);
}

// --- Update epic Stories table row ---
// Handles BOTH old 4-col (ID/Title/Status/Version) and new 5-col
// (ID/Title/Goal/Status/Version) layouts by writing the LAST TWO data
// cells regardless of how many columns precede them.
function updateEpicStoriesTable(epicPath, storyId, status, version) {
  const raw = readFileSync(epicPath, 'utf-8');
  const statusIcon = statusIconShort(status);
  const versionStr = version && status === 'done' ? `v${version}` : '—';

  const { content, updated } = updateTableRowCells(
    raw,
    epicStoryRowMatcher(storyId),
    [[0, versionStr], [1, statusIcon]]
  );

  if (updated && !DRY_RUN) writeFileSync(epicPath, content, 'utf-8');
  return updated;
}

// --- Update PRD story entry (per-story section format — old PRD template) ---
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

// --- Update PRD §11 epic/story index (per-epic table format — new PRD template) ---
// The new PRD template groups stories into a 4-column table per epic:
//   | Story | Title | Status | Version |
//   | US-X.Y | <title> | 📋 Backlog | — |
//
// Returns: 'updated' | 'current' | 'not_found'
function updatePRDStoriesIndex(prdPath, storyId, status, version) {
  const raw = readFileSync(prdPath, 'utf-8');
  const statusIcon = statusIconShort(status);
  const versionStr = version && status === 'done' ? `v${version}` : '—';

  // Capture current row to detect "current" vs "updated" — replay match using
  // the same matcher the updater uses to find the row.
  const matcher = epicStoryRowMatcher(storyId);
  const lines = raw.split('\n');
  let beforeRow = null;
  for (const line of lines) {
    if (matcher(line)) { beforeRow = line; break; }
  }
  if (beforeRow === null) return 'not_found';

  const { content, updated } = updateTableRowCells(
    raw,
    matcher,
    [[0, versionStr], [1, statusIcon]]
  );
  if (!updated) return 'not_found';
  // Compare row to detect no-op
  const afterRow = content.split('\n').find(matcher);
  if (afterRow === beforeRow) return 'current';
  if (!DRY_RUN) writeFileSync(prdPath, content, 'utf-8');
  return 'updated';
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
// Sprint scope template is `| US | Title | Epic | Pri | Points | Status | Story file |`
// — Status is the second-to-last cell. Updates only the status cell (no version
// column in sprint scope). The line-based updater handles any column count as
// long as Status remains the second-to-last cell.
function updateSprintScopeTable(sprintId, storyId, status, version) {
  if (!sprintId) return false;
  if (!existsSync(SPRINTS_DIR)) return false;

  // Find sprint file
  const sprintFiles = readdirSync(SPRINTS_DIR).filter(f => f.startsWith('sprint-') && f.endsWith('.md'));
  const sprintFile = sprintFiles.find(f => f.startsWith(`${sprintId}.`) || f.startsWith(`${sprintId}-`));
  if (!sprintFile) return false;

  const sprintPath = join(SPRINTS_DIR, sprintFile);
  const raw = readFileSync(sprintPath, 'utf-8');
  const statusIcon = statusIconShort(status);

  const { content, updated } = updateTableRowCells(
    raw,
    epicStoryRowMatcher(storyId),
    [[1, statusIcon]]
  );

  if (updated && !DRY_RUN) writeFileSync(sprintPath, content, 'utf-8');
  return updated;
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

    // 2. PRD story entry — update BOTH formats if present:
    //    - per-story `### US-X.Y` section (old PRD template)
    //    - per-epic table row in §11 (new PRD template)
    //    A migrated PRD has only one, but a transitional one may have both;
    //    updating both keeps them in sync.
    if (existsSync(PRD_PATH)) {
      const sectionResult = updatePRDStoryEntry(PRD_PATH, id, status, version_shipped);
      const tableResult = updatePRDStoriesIndex(PRD_PATH, id, status, version_shipped);
      const formats = [];
      if (sectionResult === 'updated') formats.push('section');
      if (tableResult === 'updated') formats.push('table');
      if (formats.length > 0) {
        console.log(`  ✓ PRD story entry updated (${formats.join(' + ')})`);
        results.prdStory++;
      } else if (sectionResult === 'current' || tableResult === 'current') {
        const which = [];
        if (sectionResult === 'current') which.push('section');
        if (tableResult === 'current') which.push('table');
        console.log(`  - PRD story entry already up to date (${which.join(' + ')})`);
      } else {
        console.log('  ⚠ PRD story entry not found (no per-story section or per-epic table row)');
      }

      // 3. PRD FR table
      if (prd_ref) {
        const okFR = updatePRDFRRow(PRD_PATH, prd_ref, status, version_shipped);
        console.log(okFR ? '  ✓ PRD FR row updated' : '  ⚠ PRD FR row not found');
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
