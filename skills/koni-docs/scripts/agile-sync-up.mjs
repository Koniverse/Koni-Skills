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

// --- Regex helpers ---
// Escape every regex metacharacter so dynamic story content (titles, AD-N
// descriptions, prd_ref values) can be safely interpolated into a
// `new RegExp(...)`. Trap (LESSONS §5 / AD-10 / US-1.5): a single unescaped
// `[`, `]`, `(`, `.`, `*`, `+`, `?`, `|`, `^`, `$`, or `\` from story data
// turns the regex literal into a SyntaxError at construction time and
// crashes the script mid-run.
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    status === 'deprecated' ? '🗑️ deprecated' :
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
  // The story id must be the FIRST DATA CELL of the row — the shape used by
  // every tracking table (epic Stories, PRD §11 index, sprint scope):
  // `| [US-X.Y](...) | ... |` or `| US-X.Y | ... |`.
  //
  // This deliberately does NOT match rows that merely *reference* the story
  // in a later column — Feature pillars' "Stories" column, AD/FR Coverage's
  // "Story" column, Cross-story testing's "Stories" column. Those rows'
  // last two cells are NOT (status, version); rewriting them corrupts the
  // table (see __tests__ Test 7 / docs LESSONS).
  const escaped = escapeRegExp(storyId);
  const linkedCell = new RegExp(`^\\s*\\[${escaped}\\]\\(`);
  const plainCell = new RegExp(`^\\s*${escaped}\\s*$`);
  return (line) => {
    if (!line.includes('|')) return false;
    const cells = line.split('|');
    // Valid pipe-table row: empty before first `|` and after last `|`.
    if (cells.length < 4) return false;
    if (cells[0].trim() !== '' || cells[cells.length - 1].trim() !== '') return false;
    const firstDataCell = cells[1];
    return linkedCell.test(firstDataCell) || plainCell.test(firstDataCell);
  };
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
    `### ${escapeRegExp(storyId)} — .+`,
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
    : status === 'deprecated' ? '🗑️ Deprecated'
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
// `frRef` from story frontmatter may be:
//   - a single FR-N (`FR-7`)
//   - comma-separated multiple FRs (`FR-1, FR-2, FR-11`)
//   - mixed with AD-N (`FR-11, AD-4`)  ← AD-N is the AD table in PRD §6,
//     hand-maintained, NOT touched by sync
//   - free-form descriptive text from older stories (`AD-24 (Docker
//     Compose dev infra) + AD-26 (...)`)  ← only AD-N tokens extracted;
//     descriptive prose ignored
//
// Extract every `FR-N` token, escape, and try to update each FR row
// independently. Returns true if AT LEAST ONE FR row was updated.
function updatePRDFRRow(prdPath, frRef, status, version) {
  if (!frRef) return false;
  let content = readFileSync(prdPath, 'utf-8');

  const newStatus = status === 'done' && version
    ? `✅ shipped (v${version})`
    : status === 'in-progress' ? '🚧 In progress'
    : status === 'deprecated' ? '🗑️ deprecated'
    : '📋 Backlog';

  // Extract every well-formed FR-N token (FR followed by digits, optionally
  // a dotted segment like FR-3.5). Whitespace, descriptive prose, and AD-N
  // tokens are ignored. Empty array means "no FR-N found in frRef" — common
  // for AD-only stories.
  const frTokens = [...frRef.matchAll(/\bFR-[0-9]+(?:\.[0-9]+)?\b/g)]
    .map(m => m[0]);
  if (frTokens.length === 0) return false;

  let anyUpdated = false;
  for (const frId of frTokens) {
    // Match FR table row: | FR-N | <desc> | <pri> | <status> | <epic> |
    const rowPattern = new RegExp(
      `(\\| ${escapeRegExp(frId)} \\| [^|]+ \\| [^|]+ \\| )[^|]+( \\|)`,
      'g'
    );

    if (rowPattern.test(content)) {
      content = content.replace(rowPattern, `$1${newStatus}$2`);
      anyUpdated = true;
    }
  }

  if (anyUpdated && !DRY_RUN) writeFileSync(prdPath, content, 'utf-8');
  return anyUpdated;
}

// --- Find table header column index ---
// Given a matched row at `lines[rowIdx]`, scan upward (≤ 20 lines) for the
// table separator (`|---|---|...`); the line immediately above it is the
// header row. Return the column index of `columnName` (case-insensitive),
// or -1 if header / column not found.
//
// Used by `updateSprintScopeTable` to locate the Status column robustly
// across BOTH the 6-col canonical shape and the 7-col Koni-Finance-Final
// shape (which inserts a `Carry` column before `Story file`). Was-bug
// (US-1.5 / AC-6): hardcoded fromEnd-based position assumed 6-col and
// silently wrote to the wrong cell on 7-col tables.
function findColumnIndex(lines, rowIdx, columnName) {
  const target = columnName.toLowerCase();
  for (let i = rowIdx - 1; i >= 0 && i >= rowIdx - 20; i--) {
    if (/^\s*\|[-:|\s]+\|\s*$/.test(lines[i]) && i > 0) {
      const headers = lines[i - 1].split('|').map(c => c.trim().toLowerCase());
      return headers.findIndex(h => h === target);
    }
  }
  return -1;
}

// --- Update sprint file scope table ---
// Sprint scope template is `| US | Title | Epic | Pri | Points | Status | Story file |`
// (6 data cells) BUT Koni-Finance-Final adds a `Carry` column between Status
// and Story file (7 data cells). The updater locates the Status column by
// HEADER NAME, not by position-from-end, so both shapes write to the right cell.
function updateSprintScopeTable(sprintId, storyId, status, version) {
  if (!sprintId) return false;
  if (!existsSync(SPRINTS_DIR)) return false;

  // Find sprint file (also peek into archive/ — some projects move closed
  // sprints there but still reference them from done stories).
  const sprintFiles = [
    ...readdirSync(SPRINTS_DIR).filter(f => f.startsWith('sprint-') && f.endsWith('.md')),
    ...(existsSync(join(SPRINTS_DIR, 'archive'))
      ? readdirSync(join(SPRINTS_DIR, 'archive'))
          .filter(f => f.startsWith('sprint-') && f.endsWith('.md'))
          .map(f => join('archive', f))
      : []),
  ];
  const sprintFile = sprintFiles.find(f => {
    const base = f.split('/').pop();
    return base.startsWith(`${sprintId}.`) || base.startsWith(`${sprintId}-`);
  });
  if (!sprintFile) return false;

  const sprintPath = join(SPRINTS_DIR, sprintFile);
  const raw = readFileSync(sprintPath, 'utf-8');
  const statusIcon = statusIconShort(status);
  const lines = raw.split('\n');
  const matcher = epicStoryRowMatcher(storyId);

  // Find the matched row + its Status column index via the header above it.
  let rowIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (matcher(lines[i])) { rowIdx = i; break; }
  }
  if (rowIdx === -1) return false;

  const statusCol = findColumnIndex(lines, rowIdx, 'Status');
  if (statusCol === -1) return false;

  const cells = lines[rowIdx].split('|');
  if (statusCol < 1 || statusCol >= cells.length - 1) return false;
  cells[statusCol] = ` ${statusIcon} `;
  lines[rowIdx] = cells.join('|');

  if (!DRY_RUN) writeFileSync(sprintPath, lines.join('\n'), 'utf-8');
  return true;
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
      } else if (prd_ref) {
        // Story claims a PRD reference but no per-story listing exists. May be
        // a documentation gap (story not registered in PRD §11) OR a project
        // that intentionally tracks stories only in the Epic Stories table.
        // Surfaced as info, not warning, to keep sync output quiet on legacy
        // projects (Koni-Finance-Final / senti_quant pattern — US-1.5 / AC-4).
        console.log('  - PRD story entry not registered (no per-story section or per-epic table row)');
      }
      // If prd_ref is empty AND no PRD entry exists, silent — story
      // legitimately has no PRD coupling.

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
