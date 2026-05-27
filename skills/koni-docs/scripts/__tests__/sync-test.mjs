#!/usr/bin/env node

/**
 * sync-test.mjs — Self-contained integration test for the agile-sync-up,
 * generate-status, agile-inject-tasks, and agile-backfill-fields scripts.
 *
 * Why self-contained: examples/ is gitignored. The test builds its own
 * fixture in a tmpdir so it runs anywhere with `node` + this repo checked
 * out. Cleans up on exit.
 *
 * What it covers (regression guards):
 *   - EPIC Stories table — both 4-col (legacy) and 5-col (new template with
 *     Goal column) shapes update the LAST TWO cells (status + version)
 *     without corrupting middle cells.
 *   - PRD story sync — both per-story `### US-X.Y` section format (legacy)
 *     and per-epic table under §11 (new template) update in the same run.
 *   - Sprint scope table — 7-col layout, status cell only.
 *   - generate-status — produces STATUS.md with correct kanban grouping.
 *   - agile-inject-tasks — extracts AC, generates Tasks.
 *   - agile-backfill-fields — adds missing frontmatter fields.
 *
 * Usage:
 *   node skills/koni-docs/scripts/__tests__/sync-test.mjs
 *   node skills/koni-docs/scripts/__tests__/sync-test.mjs --keep   # keep tmpdir for inspection
 *
 * Exit code 0 = all assertions passed; 1 = at least one failed.
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const KEEP = process.argv.includes('--keep');
const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = join(__dirname, '..');

// --- Assertion helpers ---
let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, label, detail) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push({ label, detail });
    console.log(`  ✗ ${label}`);
    if (detail) console.log(`      ${detail}`);
  }
}

function assertContains(haystack, needle, label) {
  assert(
    haystack.includes(needle),
    label,
    !haystack.includes(needle) ? `missing: ${JSON.stringify(needle)}` : null
  );
}

function assertNotContains(haystack, needle, label) {
  assert(
    !haystack.includes(needle),
    label,
    haystack.includes(needle) ? `unexpected: ${JSON.stringify(needle)}` : null
  );
}

// --- Build fixture ---
const root = mkdtempSync(join(tmpdir(), 'koni-docs-sync-test-'));
const docs = join(root, 'docs');
mkdirSync(join(docs, 'sprints', 'stories'), { recursive: true });
mkdirSync(join(docs, 'sprints', 'epics'), { recursive: true });

console.log(`\n📁 Fixture root: ${root}\n`);

// --- Stories ---
// US-1.1: done, in NEW 5-col EPIC, NEW PRD §11 table, AND legacy §7 section
writeFileSync(join(docs, 'sprints', 'stories', 'US-1.1-foo.md'), `---
id: US-1.1
title: "Foo"
epic: EPIC-1
status: done
priority: P0
points: 5
sprint: sprint-2026-W01
version_shipped: "0.1.0"
prd_ref: FR-1
assignee: alice
commit: abc1234
created: 2026-01-01
updated: 2026-01-05
---

## Goal

Foo so users can bar.

## Acceptance criteria

- [x] AC-1: User can create a foo
- [x] AC-2: Foo list shows newest first

## Tasks

(placeholder — overwritten by inject-tasks)
`);

// US-2.1: backlog, in OLD 4-col EPIC, OLD PRD §7 section, in sprint scope
writeFileSync(join(docs, 'sprints', 'stories', 'US-2.1-bar.md'), `---
id: US-2.1
title: "Bar"
epic: EPIC-2
status: backlog
priority: P1
points: 3
sprint: sprint-2026-W01
version_shipped: ""
prd_ref: FR-2
assignee: ""
commit: ""
created: 2026-01-02
updated: 2026-01-02
---

## Goal

Bar.

## Acceptance criteria

- [ ] AC-1: User can do bar
`);

// US-3.1: missing frontmatter fields — for backfill test
writeFileSync(join(docs, 'sprints', 'stories', 'US-3.1-baz.md'), `---
id: US-3.1
title: "Baz"
epic: EPIC-3
status: backlog
---

## Goal

Baz.
`);

// --- Epics ---
// EPIC-1: NEW 5-col format (with Goal column)
writeFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), `---
id: EPIC-1
title: "Foo Epic"
status: in-progress
prd_ref: FR-1
created: 2026-01-01
updated: 2026-01-05
---

## Goal

Foo capability.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-1.1](../stories/US-1.1-foo.md) | Foo | Foundation foo + list | 📋 backlog | — |
`);

// EPIC-2: OLD 4-col format (no Goal column) — backward compat
writeFileSync(join(docs, 'sprints', 'epics', 'EPIC-2.md'), `---
id: EPIC-2
title: "Bar Epic"
status: backlog
prd_ref: FR-2
created: 2026-01-02
updated: 2026-01-02
---

## Goal

Bar capability.

## Stories

| ID | Title | Status | Version |
|---|---|---|---|
| [US-2.1](../stories/US-2.1-bar.md) | Bar | 🚧 in-progress | v0.9.0 |
`);

// --- PRD with BOTH formats (transitional state) ---
writeFileSync(join(docs, 'PRD.md'), `# Demo PRD

## §4 Functional requirements

| ID | Requirement | Priority | Status | Epic |
|----|------------|----------|--------|------|
| FR-1 | Foo support | P0 | 📋 Backlog | EPIC-1 |
| FR-2 | Bar support | P1 | 📋 Backlog | EPIC-2 |

## §7 Story map (legacy per-story sections)

### US-1.1 — Foo

**Status**: 📋 Backlog
**Epic**: EPIC-1
**Goal**: Foo so users can bar.

### US-2.1 — Bar

**Status**: 📋 Backlog
**Epic**: EPIC-2
**Goal**: Bar.

## §11 Epics & User Stories (new per-epic table)

### EPIC-1 — Foo Epic
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-1.1 | Foo | 📋 Backlog | — |

### EPIC-2 — Bar Epic
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-2.1 | Bar | 📋 Backlog | — |
`);

// --- Sprint file (7-col scope table) ---
writeFileSync(join(docs, 'sprints', 'sprint-2026-W01.md'), `---
id: sprint-2026-W01
status: in-progress
start: 2026-01-01
end: 2026-01-07
goal: "Ship Foo + Bar"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-1.1 | Foo | EPIC-1 | P0 | 5 | 📋 backlog | [link](stories/US-1.1-foo.md) |
| US-2.1 | Bar | EPIC-2 | P1 | 3 | 🚧 in-progress | [link](stories/US-2.1-bar.md) |
`);

// --- Run scripts and assert ---
function run(script, ...args) {
  const cmd = `node ${join(SCRIPTS_DIR, script)} --docs-path ${docs} ${args.join(' ')}`;
  return execSync(cmd, { encoding: 'utf-8' });
}

console.log('━━━ Test 1: agile-sync-up (US-1.1 done → NEW 5-col EPIC + BOTH PRD formats) ━━━\n');
run('agile-sync-up.mjs', '--story', 'US-1.1');

const epic1After = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
assertContains(
  epic1After,
  '| Foundation foo + list | ✅ done | v0.1.0 |',
  'EPIC-1 (5-col): Goal preserved, status + version updated'
);
assertNotContains(
  epic1After,
  '| ✅ done | v0.1.0 | v0.1.0 |',
  'EPIC-1 (5-col): no duplicate version cell (regression guard)'
);

const prdAfter1 = readFileSync(join(docs, 'PRD.md'), 'utf-8');
assertContains(
  prdAfter1,
  '**Status**: ✅ Done (v0.1.0)',
  'PRD §7 section: US-1.1 status updated to Done'
);
assertContains(
  prdAfter1,
  '| US-1.1 | Foo | ✅ done | v0.1.0 |',
  'PRD §11 table: US-1.1 row updated'
);
assertContains(
  prdAfter1,
  '| FR-1 | Foo support | P0 | ✅ shipped (v0.1.0) | EPIC-1 |',
  'PRD §4 FR-1: status updated to shipped'
);

const sprintAfter1 = readFileSync(join(docs, 'sprints', 'sprint-2026-W01.md'), 'utf-8');
assertContains(
  sprintAfter1,
  '| US-1.1 | Foo | EPIC-1 | P0 | 5 | ✅ done | [link]',
  'Sprint scope (7-col): US-1.1 status updated, story file link preserved'
);

console.log('\n━━━ Test 2: agile-sync-up (US-2.1 backlog → OLD 4-col EPIC backward compat) ━━━\n');
run('agile-sync-up.mjs', '--story', 'US-2.1');

const epic2After = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-2.md'), 'utf-8');
assertContains(
  epic2After,
  '| [US-2.1](../stories/US-2.1-bar.md) | Bar | 📋 backlog | — |',
  'EPIC-2 (4-col): status reset to backlog, version cleared'
);

const sprintAfter2 = readFileSync(join(docs, 'sprints', 'sprint-2026-W01.md'), 'utf-8');
assertContains(
  sprintAfter2,
  '| US-2.1 | Bar | EPIC-2 | P1 | 3 | 📋 backlog | [link]',
  'Sprint scope: US-2.1 status updated to backlog'
);

console.log('\n━━━ Test 3: agile-sync-up idempotency ━━━\n');
const out3 = run('agile-sync-up.mjs', '--story', 'US-1.1');
assertContains(out3, 'already up to date', 'Re-run reports "already up to date"');

console.log('\n━━━ Test 4: generate-status ━━━\n');
run('generate-status.mjs');
const status = readFileSync(join(docs, 'sprints', 'STATUS.md'), 'utf-8');
assertContains(status, '## 📋 Backlog', 'STATUS.md has Backlog section');
assertContains(status, '## ✅ Done', 'STATUS.md has Done section');
assertContains(status, '| US-1.1 | Foo |', 'STATUS.md lists US-1.1');
assertContains(status, 'Total stories: 3', 'STATUS.md counts all stories');

console.log('\n━━━ Test 5: agile-inject-tasks ━━━\n');
run('agile-inject-tasks.mjs', '--story', 'US-1.1');
const story1 = readFileSync(join(docs, 'sprints', 'stories', 'US-1.1-foo.md'), 'utf-8');
// inject-tasks strips the leading `AC-N:` label when generating the Task line.
assertContains(story1, '- [ ] TASK-1.1.1 — User can create a foo', 'Tasks generated from AC-1');
assertContains(story1, '- [ ] TASK-1.1.2 — Foo list shows newest first', 'Tasks generated from AC-2');
assertNotContains(story1, '(placeholder — overwritten by inject-tasks)', 'Old Tasks placeholder removed');

console.log('\n━━━ Test 6: agile-backfill-fields ━━━\n');
run('agile-backfill-fields.mjs');
const story3 = readFileSync(join(docs, 'sprints', 'stories', 'US-3.1-baz.md'), 'utf-8');
assertContains(story3, 'priority: ', 'Backfilled: priority field added');
assertContains(story3, 'points: ', 'Backfilled: points field added');
assertContains(story3, 'sprint: ', 'Backfilled: sprint field added');
assertContains(story3, 'assignee: ', 'Backfilled: assignee field added');
assertContains(story3, 'commit: ', 'Backfilled: commit field added');

console.log('\n━━━ Test 7: agile-sync-up regex-escape robustness (US-1.5 BLOCKER fix) ━━━\n');
// Trap (LESSONS §5 / AD-10): story content (title, prd_ref) containing regex
// metacharacters used to crash agile-sync-up with `SyntaxError: Range out of
// order in character class` because raw strings were interpolated into
// `new RegExp(...)` without escape. Triggered in real-world Koni-Finance-Final
// US-1.34. The fix added an `escapeRegExp` helper and applied it to every
// dynamic regex input.
//
// This fixture pairs two adversarial cases:
//   - US-9.1 — title contains `[`, `]`, `(`, `)`, `.`, `*`
//   - US-9.2 — prd_ref contains comma-separated FRs MIXED WITH AD-N tokens
//     AND descriptive prose with brackets — the exact KFF US-1.34 shape

// Story with regex-special characters in title and a multi-FR prd_ref:
writeFileSync(join(docs, 'sprints', 'stories', 'US-9.1-regex-special.md'), `---
id: US-9.1
title: "Add [Component] (v2) + foo.bar * baz"
epic: EPIC-9
status: done
priority: P1
points: 2
sprint: sprint-2026-W01
version_shipped: "0.9.0"
prd_ref: FR-9, FR-10
assignee: alice
commit: deadbe1
created: 2026-01-09
updated: 2026-01-09
---

## Goal

Brackets and parens in story titles must not crash sync.
`);

// Story with the exact KFF US-1.34 shape: descriptive prose in prd_ref:
writeFileSync(join(docs, 'sprints', 'stories', 'US-9.2-prose-prd-ref.md'), `---
id: US-9.2
title: "Docker compose dev infra"
epic: EPIC-9
status: done
priority: P1
points: 3
sprint:
version_shipped: "0.9.0"
prd_ref: AD-24 (Docker Compose dev infra) + AD-26 (self-hosted Node deployment + multi-stage Dockerfile); no dedicated FR — sibling of [[US-1.1]] (dev compose) and [[US-1.10]] (prod Dockerfile)
assignee: alice
commit: deadbe2
created: 2026-01-09
updated: 2026-01-09
---

## Goal

Prose with brackets + parens + dots in prd_ref must not crash sync.
`);

// Add EPIC-9 file so sync has somewhere to write the row updates:
writeFileSync(join(docs, 'sprints', 'epics', 'EPIC-9.md'), `---
id: EPIC-9
title: "Regex-special edge cases"
status: in-progress
prd_ref: FR-9, FR-10
created: 2026-01-09
updated: 2026-01-09
---

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-9.1](../stories/US-9.1-regex-special.md) | Add [Component] (v2) | regex-special title | 📋 backlog | — |
| [US-9.2](../stories/US-9.2-prose-prd-ref.md) | Docker compose dev infra | prose prd_ref | 📋 backlog | — |
`);

// Add FR-9 + FR-10 to the PRD so the FR table updater has rows to find.
// We append to the existing PRD fixture rather than rewriting it.
const prdNow = readFileSync(join(docs, 'PRD.md'), 'utf-8');
const prdWithExtraFRs = prdNow.replace(
  /(\| FR-2 \|[^\n]+\n)/,
  `$1| FR-9 | Regex-special edge case | P1 | 📋 Backlog | EPIC-9 |\n| FR-10 | Multi-FR comma test | P1 | 📋 Backlog | EPIC-9 |\n`
);
writeFileSync(join(docs, 'PRD.md'), prdWithExtraFRs);

// Run sync against US-9.1: this used to crash. Now it should exit 0 and update
// BOTH FR-9 and FR-10 rows because prd_ref is comma-separated.
const out9_1 = run('agile-sync-up.mjs', '--story', 'US-9.1');
assertContains(out9_1, 'US-9.1 (done)', 'Sync runs against regex-special title without crash');
assertContains(out9_1, 'PRD FR row updated', 'FR row update succeeded on US-9.1');

const prdAfter91 = readFileSync(join(docs, 'PRD.md'), 'utf-8');
assertContains(prdAfter91, '| FR-9 | Regex-special edge case | P1 | ✅ shipped (v0.9.0) | EPIC-9 |',
  'FR-9 row updated via multi-FR prd_ref (FR-9, FR-10)');
assertContains(prdAfter91, '| FR-10 | Multi-FR comma test | P1 | ✅ shipped (v0.9.0) | EPIC-9 |',
  'FR-10 row updated via multi-FR prd_ref (BOTH comma-separated FRs touched)');

const epic9After91 = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-9.md'), 'utf-8');
assertContains(epic9After91, '| ✅ done | v0.9.0 |',
  'EPIC-9 row for US-9.1 updated (status + version)');

// Run sync against US-9.2 — the actual KFF US-1.34 crash shape. Must not throw.
const out9_2 = run('agile-sync-up.mjs', '--story', 'US-9.2');
assertContains(out9_2, 'US-9.2 (done)', 'Sync runs against prose-only prd_ref without crash');
// US-9.2's prd_ref has NO `FR-N` token, so FR row updater short-circuits with
// "not found" (no crash). The AD-N tokens are correctly ignored.
assertContains(out9_2, 'PRD FR row not found',
  'AD-only prd_ref correctly produces "not found" (no crash)');

// --- Cleanup + report ---
console.log(`\n━━━ Results: ${passed} passed, ${failed} failed ━━━\n`);

if (!KEEP) {
  rmSync(root, { recursive: true, force: true });
  console.log('(tmpdir cleaned up — pass --keep to inspect)');
} else {
  console.log(`📁 Fixture kept at: ${root}`);
}

if (failed > 0) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  ✗ ${f.label}`);
    if (f.detail) console.log(`    ${f.detail}`);
  }
  process.exit(1);
}
process.exit(0);
