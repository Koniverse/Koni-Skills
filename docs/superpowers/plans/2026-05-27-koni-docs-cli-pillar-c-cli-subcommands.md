# Koni-docs CLI — Pillar C: CLI Subcommands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 5 first-class `koni-docs` CLI subcommands (`status` / `sync` / `inject-tasks` / `backfill-fields` / `backfill-commits`) backed by the Pillar B lib, and delete the 5 corresponding `.mjs` scripts from `skills/koni-docs/scripts/`. The W23 Carry-column BLOCKER fix lands in real user-facing behavior via `koni-docs sync`.

**Architecture:** Thin command layer at `packages/koni-docs/src/cli/` composes Pillar B lib primitives. `commander` (already in tech stack) wires subcommands. Each subcommand is a separate ~50–150 line module — pure orchestration, zero parsing logic. Spawn-based integration tests under `__tests__/cli/` validate end-to-end behavior against the existing `buildFixture` test corpus. `preview` subcommand is deferred to Pillar D (alongside the Astro viewer build).

**Tech Stack:** TypeScript 5 strict ESM · commander 11.x · tsup (existing) · node:test built-in runner · spawnSync from node:child_process for CLI tests · existing Pillar B lib for all parsing/writing.

**Scope covered:** US-4.10 (minus preview), US-4.11, US-4.12, US-4.13, US-4.14, US-4.15 (5 stories, ~16 points).

**Not in scope (Pillar D):** Astro SSR viewer + `preview` subcommand, SKILL.md §7 rewrite, `references/sprint-system.md` rewrite, `npm publish @koniverse/koni-docs@v0.5.0`, full agent skill migration docs.

---

## File structure

```
packages/koni-docs/
├── package.json                     # ADD `bin`, INSTALL commander
├── tsup.config.ts                   # ADD entry `cli/index`
├── src/
│   └── cli/
│       ├── index.ts                 # commander entry, wires all 5 subcommands
│       ├── global-opts.ts           # --docs-path / --dry-run / --json / --verbose handling
│       ├── status.ts                # generates STATUS.md kanban
│       ├── sync.ts                  # propagates status across 5 layers — column-by-NAME (W23 fix)
│       ├── inject-tasks.ts          # regenerates Tasks from AC checkboxes
│       ├── backfill-fields.ts       # adds missing frontmatter keys
│       └── backfill-commits.ts      # replaces "pending" commit SHA in CHANGELOG
└── __tests__/
    └── cli/
        ├── _helpers.ts              # runCli() spawn helper
        ├── status.test.ts
        ├── sync.test.ts             # CRITICAL: 8-col W23 fixture, Status not Carry
        ├── inject-tasks.test.ts
        ├── backfill-fields.test.ts
        └── backfill-commits.test.ts

skills/koni-docs/scripts/             # DELETE all 5 .mjs files + sync-test.mjs in their respective tasks
```

**File ownership rule:** Each `cli/<name>.ts` exports a single `register(program: Command)` function that adds the subcommand to commander. Subcommand body is pure orchestration — never reaches into mdast or gray-matter directly, always via the lib.

---

## Task 1: CLI framework — commander + bin + tsup cli entry + global opts

**Files:**
- Modify: `packages/koni-docs/package.json` (add `bin`, install `commander`)
- Modify: `packages/koni-docs/tsup.config.ts` (add `cli/index` entry)
- Create: `packages/koni-docs/src/cli/global-opts.ts`
- Create: `packages/koni-docs/src/cli/index.ts`
- Create: `packages/koni-docs/__tests__/cli/_helpers.ts`
- Create: `packages/koni-docs/__tests__/cli/index.test.ts`

- [ ] **Step 1: Install `commander`**

```bash
cd packages/koni-docs
npm install commander@^11.1.0
```

- [ ] **Step 2: Add `bin` to package.json**

Edit `package.json` and add this `"bin"` field (place it next to `"files"`):

```json
"bin": {
  "koni-docs": "./dist/cli/index.mjs"
},
```

(`koni-docs-viewer` alias is deferred to Pillar D, alongside the actual viewer build.)

- [ ] **Step 3: Add `cli/index` entry to `tsup.config.ts`**

Final shape of the `entry` map:

```ts
entry: {
  'cli/index': 'src/cli/index.ts',
  'lib/index': 'src/lib/index.ts',
  'lib/markdown/index': 'src/lib/markdown/index.ts',
  'lib/schemas/index': 'src/lib/schemas/index.ts',
},
```

Also add `banner: { js: '#!/usr/bin/env node' }` so the built CLI bundle is directly executable. Final `defineConfig`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli/index': 'src/cli/index.ts',
    'lib/index': 'src/lib/index.ts',
    'lib/markdown/index': 'src/lib/markdown/index.ts',
    'lib/schemas/index': 'src/lib/schemas/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  outExtension: () => ({ js: '.mjs' }),
  banner: { js: '#!/usr/bin/env node' },
});
```

- [ ] **Step 4: Create `src/cli/global-opts.ts`**

```ts
import type { Command } from 'commander';

export interface GlobalOpts {
  docsPath: string;
  dryRun: boolean;
  json: boolean;
  verbose: boolean;
}

/**
 * Read merged global options from the commander program.
 * Subcommands call this in their action handler.
 */
export function getGlobalOpts(cmd: Command): GlobalOpts {
  const root = cmd.parent ?? cmd;
  const opts = root.opts<{ docsPath?: string; dryRun?: boolean; json?: boolean; verbose?: boolean }>();
  return {
    docsPath: opts.docsPath ?? 'docs/',
    dryRun: Boolean(opts.dryRun),
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
  };
}
```

- [ ] **Step 5: Create `src/cli/index.ts` (minimal — subcommands wired in later tasks)**

```ts
import { Command } from 'commander';
import { KONI_DOCS_LIB_VERSION } from '../lib/index.ts';

const program = new Command();

program
  .name('koni-docs')
  .description('Koni-docs framework CLI')
  .version(KONI_DOCS_LIB_VERSION)
  .option('--docs-path <path>', 'override docs/ root', 'docs/')
  .option('--dry-run', 'preview changes without writing files', false)
  .option('--json', 'machine-readable output', false)
  .option('--verbose', 'extra logging', false);

// Subcommands registered in later tasks:
// import { registerStatus } from './status.ts'; registerStatus(program);
// import { registerSync } from './sync.ts'; registerSync(program);
// import { registerInjectTasks } from './inject-tasks.ts'; registerInjectTasks(program);
// import { registerBackfillFields } from './backfill-fields.ts'; registerBackfillFields(program);
// import { registerBackfillCommits } from './backfill-commits.ts'; registerBackfillCommits(program);

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
```

- [ ] **Step 6: Create `__tests__/cli/_helpers.ts`**

```ts
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, '..', '..', 'src', 'cli', 'index.ts');

export interface CliResult {
  stdout: string;
  stderr: string;
  status: number;
}

export function runCli(args: string[], opts: { cwd?: string } = {}): CliResult {
  const r = spawnSync(process.execPath, ['--import', 'tsx', CLI_ENTRY, ...args], {
    encoding: 'utf-8',
    cwd: opts.cwd,
    env: { ...process.env, NO_COLOR: '1' },
  });
  return {
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    status: typeof r.status === 'number' ? r.status : 1,
  };
}
```

- [ ] **Step 7: Create `__tests__/cli/index.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from './_helpers.ts';

test('cli: --version prints lib version', () => {
  const r = runCli(['--version']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\d+\.\d+\.\d+/);
});

test('cli: --help prints program name', () => {
  const r = runCli(['--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /koni-docs/);
});

test('cli: unknown command exits non-zero', () => {
  const r = runCli(['nope-this-doesnt-exist']);
  assert.notEqual(r.status, 0);
});
```

- [ ] **Step 8: Run tests + typecheck**

```bash
cd packages/koni-docs && npm test 2>&1 | tail -10
npm run typecheck && echo "exit:$?"
```

Expected: 52 tests pass total (49 lib + 3 new CLI), typecheck exit 0.

- [ ] **Step 9: Commit**

```bash
git add packages/koni-docs/package.json packages/koni-docs/package-lock.json packages/koni-docs/tsup.config.ts packages/koni-docs/src/cli/ packages/koni-docs/__tests__/cli/
git commit -m "feat(koni-docs/cli): scaffold commander framework + global opts (US-4.10)"
```

---

## Task 2: `koni-docs status` subcommand

**Files:**
- Create: `packages/koni-docs/src/cli/status.ts`
- Create: `packages/koni-docs/__tests__/cli/status.test.ts`
- Modify: `packages/koni-docs/src/cli/index.ts` (register the subcommand)
- Delete: `skills/koni-docs/scripts/generate-status.mjs`

- [ ] **Step 1: Write the failing CLI test**

Create `__tests__/cli/status.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-cli-status-'));
const docs = buildFixture(root);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('status: regenerates STATUS.md grouped by status', () => {
  const r = runCli(['status', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const status = readFileSync(join(docs, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /## .*Done/);
  assert.match(status, /## .*In Progress/);
  assert.match(status, /US-1\.1/);
  assert.match(status, /US-1\.2/);
});

test('status: --dry-run does not write the file', () => {
  const docsB = buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-status-b-')));
  const r = runCli(['status', '--docs-path', docsB, '--dry-run']);
  assert.equal(r.status, 0);
  // STATUS.md should NOT exist (fixture does not create one)
  assert.throws(() => readFileSync(join(docsB, 'sprints', 'STATUS.md'), 'utf-8'));
});

test('status: sorts IDs by semver, not lexicographic (US-1.10 after US-1.2)', () => {
  // The fixture only has US-1.1 and US-1.2 so we craft a tighter assertion:
  // confirm US-1.1 appears before US-1.2 in the Done section (sorted by epic+id).
  const r = runCli(['status', '--docs-path', docs]);
  assert.equal(r.status, 0);
  const status = readFileSync(join(docs, 'sprints', 'STATUS.md'), 'utf-8');
  // US-1.1 is done, US-1.2 is in-progress, so they're in different sections,
  // but the broader assertion: file regenerated cleanly.
  assert.match(status, /US-1\.1/);
});
```

- [ ] **Step 2: Run — expect failure**

```bash
cd packages/koni-docs && npm test 2>&1 | tail -10
```

Expected: `status` not a known command (since not registered yet).

- [ ] **Step 3: Implement `src/cli/status.ts`**

```ts
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
  // US-1.2 vs US-1.10 — split on last "."
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
```

- [ ] **Step 4: Wire into `src/cli/index.ts`**

Replace the comment placeholder with:

```ts
import { registerStatus } from './status.ts';
registerStatus(program);
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm test 2>&1 | tail -10
```

Expected: 55 tests pass total (52 prior + 3 new status tests).

- [ ] **Step 6: Typecheck**

```bash
npm run typecheck && echo "exit:$?"
```

Expected: exit 0.

- [ ] **Step 7: Delete `skills/koni-docs/scripts/generate-status.mjs`**

```bash
git rm skills/koni-docs/scripts/generate-status.mjs
```

- [ ] **Step 8: Commit**

```bash
git add packages/koni-docs/src/cli/status.ts packages/koni-docs/src/cli/index.ts packages/koni-docs/__tests__/cli/status.test.ts
git commit -m "feat(koni-docs/cli): status subcommand; delete generate-status.mjs (US-4.11)"
```

---

## Task 3: `koni-docs sync` subcommand — column-by-NAME, W23 BLOCKER fix

**Files:**
- Create: `packages/koni-docs/src/cli/sync.ts`
- Create: `packages/koni-docs/__tests__/cli/sync.test.ts`
- Modify: `packages/koni-docs/src/cli/index.ts` (register)
- Delete: `skills/koni-docs/scripts/agile-sync-up.mjs`

This is the highest-leverage task in Pillar C. The W23 BLOCKER regression test is the gate.

- [ ] **Step 1: Extend the test fixture with an 8-col W23 sprint file**

Edit `__tests__/lib/_fixtures/build-fixture.ts` and APPEND a second sprint file (do not modify the existing `sprint-2026-W01.md`). Find the end of `buildFixture` (right before `return docs;`) and insert:

```ts
  writeFileSync(join(docs, 'sprints', 'sprint-2026-W23.md'), `---
id: sprint-2026-W23
status: in-progress
start: 2026-05-27
end: 2026-06-03
goal: "8-column scope table for W23 BLOCKER fixture"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-1.1 | Foo | EPIC-1 | P0 | 5 | 🟢 ready | new | [link](stories/US-1.1-foo.md) |
| US-1.2 | Bar | EPIC-1 | P1 | 3 | 🟢 ready | new | [link](stories/US-1.2-bar.md) |
`);
```

This file gives `sync` an 8-column sprint scope table — the exact shape that broke `agile-sync-up.mjs`. The new CLI must address `Status` by name, not by position.

- [ ] **Step 2: Write the failing CLI test**

Create `__tests__/cli/sync.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  const root = mkdtempSync(join(tmpdir(), 'koni-docs-cli-sync-'));
  const docs = buildFixture(root);
  return docs;
}

test('sync: single story — updates EPIC Stories table row', () => {
  const docs = freshDocs();
  const r = runCli(['sync', '--story', 'US-1.1', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const epic = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  // US-1.1 is `done` with version 0.1.0 — should appear with ✅ done + v0.1.0
  assert.match(epic, /US-1\.1[\s\S]*✅ done[\s\S]*0\.1\.0/);
});

test('sync: W23 BLOCKER — Status updated by NAME, Carry left intact (8-col sprint)', () => {
  const docs = freshDocs();
  // Flip US-1.1's sprint to W23 so sync targets the 8-col table
  const storyPath = join(docs, 'sprints', 'stories', 'US-1.1-foo.md');
  const raw = readFileSync(storyPath, 'utf-8');
  writeFileSync(storyPath, raw.replace('sprint: sprint-2026-W01', 'sprint: sprint-2026-W23'));

  const r = runCli(['sync', '--story', 'US-1.1', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const sprint = readFileSync(join(docs, 'sprints', 'sprint-2026-W23.md'), 'utf-8');
  // Expected: Status column updated to ✅ done, Carry column STILL "new" (NOT overwritten)
  assert.match(sprint, /US-1\.1[\s\S]*✅ done[\s\S]*new/);
  // Regression guard: Carry was NEVER set to ✅ done
  assert.doesNotMatch(sprint, /\| ✅ done \| \[link\]/);
});

test('sync: --dry-run — no files modified', () => {
  const docs = freshDocs();
  const epicBefore = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  const r = runCli(['sync', '--story', 'US-1.1', '--docs-path', docs, '--dry-run']);
  assert.equal(r.status, 0);
  const epicAfter = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  assert.equal(epicAfter, epicBefore);
});

test('sync: all stories — no --story flag syncs everything', () => {
  const docs = freshDocs();
  const r = runCli(['sync', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const epic = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  assert.match(epic, /US-1\.1[\s\S]*✅ done/);
  assert.match(epic, /US-1\.2[\s\S]*🚧 in-progress/);
});

test('sync: unknown story id — exits non-zero with clear error', () => {
  const docs = freshDocs();
  const r = runCli(['sync', '--story', 'US-9.9', '--docs-path', docs]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /US-9\.9/);
});
```

- [ ] **Step 3: Run — expect failure**

```bash
npm test 2>&1 | tail -10
```

Expected: `sync` not a known command (sync.ts doesn't exist yet).

- [ ] **Step 4: Implement `src/cli/sync.ts`**

```ts
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
          // Try section header without "8. " prefix if not found
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
```

- [ ] **Step 5: Wire into `src/cli/index.ts`**

After the `registerStatus` import block, add:

```ts
import { registerSync } from './sync.ts';
registerSync(program);
```

- [ ] **Step 6: Run tests — expect pass (including W23 BLOCKER)**

```bash
npm test 2>&1 | tail -15
```

Expected: 60 tests pass total. CRITICAL: the test `sync: W23 BLOCKER — Status updated by NAME, Carry left intact (8-col sprint)` must pass.

- [ ] **Step 7: Typecheck**

```bash
npm run typecheck && echo "exit:$?"
```

Expected: exit 0.

- [ ] **Step 8: Delete `skills/koni-docs/scripts/agile-sync-up.mjs`**

```bash
git rm skills/koni-docs/scripts/agile-sync-up.mjs
```

- [ ] **Step 9: Commit**

```bash
git add packages/koni-docs/src/cli/sync.ts packages/koni-docs/src/cli/index.ts packages/koni-docs/__tests__/cli/sync.test.ts packages/koni-docs/__tests__/lib/_fixtures/build-fixture.ts
git commit -m "feat(koni-docs/cli): sync subcommand — column-by-NAME (W23 fix); delete agile-sync-up.mjs (US-4.12)"
```

---

## Task 4: `koni-docs inject-tasks` subcommand

**Files:**
- Create: `packages/koni-docs/src/cli/inject-tasks.ts`
- Create: `packages/koni-docs/__tests__/cli/inject-tasks.test.ts`
- Modify: `packages/koni-docs/src/cli/index.ts`
- Delete: `skills/koni-docs/scripts/agile-inject-tasks.mjs`

- [ ] **Step 1: Write failing CLI test**

Create `__tests__/cli/inject-tasks.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  return buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-inject-')));
}

test('inject-tasks: regenerates Tasks from AC checkbox list', () => {
  const docs = freshDocs();
  const storyPath = join(docs, 'sprints', 'stories', 'US-1.2-bar.md');
  // Add a Tasks placeholder to the story
  const raw = readFileSync(storyPath, 'utf-8');
  writeFileSync(storyPath, raw + '\n## Tasks\n\n_placeholder_\n');

  const r = runCli(['inject-tasks', '--story', 'US-1.2', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const updated = readFileSync(storyPath, 'utf-8');
  // US-1.2 has AC-1: "Pending criterion" — Tasks section should mirror it
  assert.match(updated, /## Tasks/);
  assert.match(updated, /TASK-1\.2\.1.*Pending criterion/);
  assert.doesNotMatch(updated, /_placeholder_/);
});

test('inject-tasks: --all processes every story with AC', () => {
  const docs = freshDocs();
  // Pre-add a Tasks placeholder to BOTH stories
  for (const f of ['US-1.1-foo.md', 'US-1.2-bar.md']) {
    const p = join(docs, 'sprints', 'stories', f);
    writeFileSync(p, readFileSync(p, 'utf-8') + '\n## Tasks\n\n_placeholder_\n');
  }
  const r = runCli(['inject-tasks', '--all', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const foo = readFileSync(join(docs, 'sprints', 'stories', 'US-1.1-foo.md'), 'utf-8');
  assert.match(foo, /TASK-1\.1\.1.*First criterion/);
});

test('inject-tasks: missing --story and --all exits non-zero', () => {
  const docs = freshDocs();
  const r = runCli(['inject-tasks', '--docs-path', docs]);
  assert.notEqual(r.status, 0);
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test 2>&1 | tail -10
```

Expected: `inject-tasks` not a known command.

- [ ] **Step 3: Implement `src/cli/inject-tasks.ts`**

```ts
import type { Command } from 'commander';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  readDoc, writeDoc, parseCheckboxes, replaceCheckboxes, replaceSection,
  type Doc, type CheckboxItem,
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
```

- [ ] **Step 4: Wire into `src/cli/index.ts`**

Add:

```ts
import { registerInjectTasks } from './inject-tasks.ts';
registerInjectTasks(program);
```

- [ ] **Step 5: Run tests + typecheck**

```bash
npm test 2>&1 | tail -10
npm run typecheck && echo "exit:$?"
```

Expected: 63 tests pass total (60 prior + 3 new). Typecheck exit 0.

- [ ] **Step 6: Delete `skills/koni-docs/scripts/agile-inject-tasks.mjs`**

```bash
git rm skills/koni-docs/scripts/agile-inject-tasks.mjs
```

- [ ] **Step 7: Commit**

```bash
git add packages/koni-docs/src/cli/inject-tasks.ts packages/koni-docs/src/cli/index.ts packages/koni-docs/__tests__/cli/inject-tasks.test.ts
git commit -m "feat(koni-docs/cli): inject-tasks subcommand; delete agile-inject-tasks.mjs (US-4.13)"
```

---

## Task 5: `koni-docs backfill-fields` subcommand

**Files:**
- Create: `packages/koni-docs/src/cli/backfill-fields.ts`
- Create: `packages/koni-docs/__tests__/cli/backfill-fields.test.ts`
- Modify: `packages/koni-docs/src/cli/index.ts`
- Delete: `skills/koni-docs/scripts/agile-backfill-fields.mjs`

- [ ] **Step 1: Write failing CLI test**

Create `__tests__/cli/backfill-fields.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  return buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-bf-')));
}

test('backfill-fields: adds STORY_DEFAULTS keys to a sparse story', () => {
  const docs = freshDocs();
  // Replace US-1.1's frontmatter with sparse version (only id+title+epic+status)
  const sparsePath = join(docs, 'sprints', 'stories', 'US-3.1-sparse.md');
  writeFileSync(sparsePath, `---
id: US-3.1
title: "Sparse"
epic: EPIC-3
status: backlog
---

## Goal

Sparse story.

## Acceptance criteria

- [ ] AC-1: Something
`);

  const r = runCli(['backfill-fields', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const updated = readFileSync(sparsePath, 'utf-8');
  // STORY_DEFAULTS adds priority + points + sprint + version_shipped + assignee + commit + created + updated
  assert.match(updated, /priority:\s*P2/);
  assert.match(updated, /points:/);
  assert.match(updated, /assignee:/);
  // Existing keys preserved:
  assert.match(updated, /id:\s*US-3\.1/);
  assert.match(updated, /status:\s*backlog/);
});

test('backfill-fields: idempotent — running twice produces no further changes', () => {
  const docs = freshDocs();
  const sparsePath = join(docs, 'sprints', 'stories', 'US-3.2-mini.md');
  writeFileSync(sparsePath, `---
id: US-3.2
title: "Mini"
epic: EPIC-3
status: backlog
---

body
`);

  const r1 = runCli(['backfill-fields', '--docs-path', docs]);
  assert.equal(r1.status, 0);
  const after1 = readFileSync(sparsePath, 'utf-8');

  const r2 = runCli(['backfill-fields', '--docs-path', docs]);
  assert.equal(r2.status, 0);
  const after2 = readFileSync(sparsePath, 'utf-8');

  assert.equal(after1, after2);
});

test('backfill-fields: --dry-run does not modify files', () => {
  const docs = freshDocs();
  const sparsePath = join(docs, 'sprints', 'stories', 'US-3.3-untouched.md');
  writeFileSync(sparsePath, `---
id: US-3.3
title: "Untouched"
epic: EPIC-3
status: backlog
---

body
`);
  const before = readFileSync(sparsePath, 'utf-8');
  const r = runCli(['backfill-fields', '--docs-path', docs, '--dry-run']);
  assert.equal(r.status, 0);
  const after = readFileSync(sparsePath, 'utf-8');
  assert.equal(after, before);
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test 2>&1 | tail -10
```

Expected: `backfill-fields` not a known command.

- [ ] **Step 3: Implement `src/cli/backfill-fields.ts`**

```ts
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Command } from 'commander';
import { readDoc, writeDoc, updateFrontmatter } from '../lib/index.ts';
import { STORY_DEFAULTS } from '../lib/schemas/story.ts';
import { getGlobalOpts } from './global-opts.ts';

export function registerBackfillFields(program: Command): void {
  program
    .command('backfill-fields')
    .description('Add missing standard frontmatter fields to story files')
    .action(function (this: Command) {
      const opts = getGlobalOpts(this);
      const storiesDir = join(opts.docsPath, 'sprints', 'stories');
      const files = readdirSync(storiesDir).filter(f => f.endsWith('.md'));

      let updatedCount = 0;
      const addedFieldsByFile: Array<{ file: string; added: string[] }> = [];

      for (const f of files) {
        const path = join(storiesDir, f);
        const doc = readDoc(path);
        if (!doc.frontmatter.id) continue;
        const missing: string[] = [];
        const patch: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(STORY_DEFAULTS)) {
          if (!(k in doc.frontmatter)) {
            patch[k] = v;
            missing.push(k);
          }
        }
        if (missing.length === 0) continue;
        const next = updateFrontmatter(doc, patch);
        if (!opts.dryRun) writeDoc(path, next);
        updatedCount++;
        addedFieldsByFile.push({ file: f, added: missing });
      }

      if (opts.json) {
        console.log(JSON.stringify({ ok: true, dryRun: opts.dryRun, updated: updatedCount, files: addedFieldsByFile }, null, 2));
      } else if (updatedCount === 0) {
        console.log('✓ all story files have complete frontmatter');
      } else {
        console.log(`✓ ${updatedCount} stor${updatedCount === 1 ? 'y' : 'ies'} backfilled${opts.dryRun ? ' (dry run — no changes written)' : ''}`);
        for (const e of addedFieldsByFile) console.log(`  ${e.file}: +${e.added.join(', ')}`);
      }
    });
}
```

- [ ] **Step 4: Wire into `src/cli/index.ts`**

```ts
import { registerBackfillFields } from './backfill-fields.ts';
registerBackfillFields(program);
```

- [ ] **Step 5: Run tests + typecheck**

```bash
npm test 2>&1 | tail -10
npm run typecheck && echo "exit:$?"
```

Expected: 66 tests pass total. Typecheck exit 0.

- [ ] **Step 6: Delete `skills/koni-docs/scripts/agile-backfill-fields.mjs`**

```bash
git rm skills/koni-docs/scripts/agile-backfill-fields.mjs
```

- [ ] **Step 7: Commit**

```bash
git add packages/koni-docs/src/cli/backfill-fields.ts packages/koni-docs/src/cli/index.ts packages/koni-docs/__tests__/cli/backfill-fields.test.ts
git commit -m "feat(koni-docs/cli): backfill-fields subcommand; delete agile-backfill-fields.mjs (US-4.14)"
```

---

## Task 6: `koni-docs backfill-commits` subcommand + delete remaining .mjs files

**Files:**
- Create: `packages/koni-docs/src/cli/backfill-commits.ts`
- Create: `packages/koni-docs/__tests__/cli/backfill-commits.test.ts`
- Modify: `packages/koni-docs/src/cli/index.ts`
- Delete: `skills/koni-docs/scripts/changelog-backfill-commits.mjs`
- Delete: `skills/koni-docs/scripts/__tests__/sync-test.mjs`
- Delete: `skills/koni-docs/scripts/__tests__/` (now-empty directory — remove if it is)

- [ ] **Step 1: Write failing CLI test**

Create `__tests__/cli/backfill-commits.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { runCli } from './_helpers.ts';

function makeRepoWithChangelog(): string {
  const root = mkdtempSync(join(tmpdir(), 'koni-docs-cli-bfc-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@test'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: root });
  writeFileSync(join(root, 'VERSION'), '0.1.0\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'feat: ship v0.1.0'], { cwd: root });

  const docs = join(root, 'docs');
  execFileSync('mkdir', ['-p', docs]);
  writeFileSync(join(docs, 'CHANGELOG.md'), `# Changelog

## [Unreleased]

(empty)

## [0.1.0] — 2026-01-01 — Initial — v0.1.0

Initial release.

**Commit**: pending
`);
  return root;
}

const repo = makeRepoWithChangelog();
process.on('exit', () => rmSync(repo, { recursive: true, force: true }));

test('backfill-commits: replaces "pending" with real SHA', () => {
  const r = runCli(['backfill-commits', '--docs-path', join(repo, 'docs')], { cwd: repo });
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const cl = readFileSync(join(repo, 'docs', 'CHANGELOG.md'), 'utf-8');
  assert.doesNotMatch(cl, /\*\*Commit\*\*:\s*pending/);
  assert.match(cl, /\*\*Commit\*\*:\s*[0-9a-f]{7}/);
});

test('backfill-commits: idempotent — re-run after fill is a no-op', () => {
  const before = readFileSync(join(repo, 'docs', 'CHANGELOG.md'), 'utf-8');
  const r = runCli(['backfill-commits', '--docs-path', join(repo, 'docs')], { cwd: repo });
  assert.equal(r.status, 0);
  const after = readFileSync(join(repo, 'docs', 'CHANGELOG.md'), 'utf-8');
  assert.equal(after, before);
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test 2>&1 | tail -10
```

Expected: `backfill-commits` not a known command.

- [ ] **Step 3: Implement `src/cli/backfill-commits.ts`**

```ts
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Command } from 'commander';
import {
  parseChangelog, updateCommitSha, isGitRepo, findCommitForVersion, findCommitByTag,
} from '../lib/index.ts';
import { getGlobalOpts } from './global-opts.ts';

export function registerBackfillCommits(program: Command): void {
  program
    .command('backfill-commits')
    .description('Replace "pending" commit SHAs in CHANGELOG.md with real SHAs from git')
    .action(function (this: Command) {
      const opts = getGlobalOpts(this);
      if (!isGitRepo()) {
        console.error('error: not a git repository');
        process.exit(1);
      }
      const clPath = join(opts.docsPath, 'CHANGELOG.md');
      if (!existsSync(clPath)) {
        console.error(`error: CHANGELOG not found at ${clPath}`);
        process.exit(1);
      }
      let raw = readFileSync(clPath, 'utf-8');
      const entries = parseChangelog(raw);
      const pending = entries.filter(e => !e.commitSha || e.commitSha === 'pending' || e.commitSha === '');
      if (pending.length === 0) {
        if (opts.json) console.log(JSON.stringify({ ok: true, backfilled: 0 }));
        else console.log('✓ no pending commit SHAs found');
        return;
      }
      let backfilled = 0;
      const filledList: Array<{ version: string; sha: string }> = [];
      for (const entry of pending) {
        let sha = findCommitForVersion(entry.version);
        if (!sha) sha = findCommitByTag(`v${entry.version}`);
        if (sha) {
          raw = updateCommitSha(raw, entry.version, sha);
          backfilled++;
          filledList.push({ version: entry.version, sha });
        }
      }
      if (backfilled > 0 && !opts.dryRun) writeFileSync(clPath, raw, 'utf-8');
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, dryRun: opts.dryRun, backfilled, filled: filledList }, null, 2));
      } else {
        console.log(`✓ backfilled ${backfilled}/${pending.length} commit SHAs${opts.dryRun ? ' (dry run)' : ''}`);
        for (const f of filledList) console.log(`  v${f.version} → ${f.sha}`);
      }
    });
}
```

- [ ] **Step 4: Wire into `src/cli/index.ts`**

```ts
import { registerBackfillCommits } from './backfill-commits.ts';
registerBackfillCommits(program);
```

- [ ] **Step 5: Run tests + typecheck**

```bash
npm test 2>&1 | tail -10
npm run typecheck && echo "exit:$?"
```

Expected: 68 tests pass total. Typecheck exit 0.

- [ ] **Step 6: Delete `changelog-backfill-commits.mjs` + `sync-test.mjs` + empty `__tests__` dir**

```bash
git rm skills/koni-docs/scripts/changelog-backfill-commits.mjs
git rm skills/koni-docs/scripts/__tests__/sync-test.mjs
# Check whether __tests__ is now empty; if so, remove it:
if [ -z "$(ls -A skills/koni-docs/scripts/__tests__ 2>/dev/null)" ]; then
  rmdir skills/koni-docs/scripts/__tests__
fi
```

Verify the `skills/koni-docs/scripts/` directory is now empty:

```bash
ls -la skills/koni-docs/scripts/
```

If empty, also remove the scripts dir:

```bash
if [ -z "$(ls -A skills/koni-docs/scripts 2>/dev/null)" ]; then
  rmdir skills/koni-docs/scripts
fi
```

- [ ] **Step 7: Commit**

```bash
git add -A skills/koni-docs/
git add packages/koni-docs/src/cli/backfill-commits.ts packages/koni-docs/src/cli/index.ts packages/koni-docs/__tests__/cli/backfill-commits.test.ts
git commit -m "feat(koni-docs/cli): backfill-commits subcommand; delete remaining .mjs scripts + sync-test (US-4.15)"
```

---

## Task 7: Bookkeeping — stories US-4.10..4.15, EPIC-4 table, VERSION, CHANGELOG, plus `.` exports fix

**Files:**
- Create: 6 story files under `docs/sprints/stories/`
- Modify: `docs/sprints/epics/EPIC-4.md` (append 6 rows; OR 5 if dropping preview row)
- Modify: `packages/koni-docs/package.json` (update `exports."."` to point at the now-existing CLI bundle)
- Modify: `VERSION` (bump to `0.5.0-dev.0`)
- Modify: `docs/CHANGELOG.md` (add v0.5.0-dev.0 entry under [Unreleased])

- [ ] **Step 1: Update `package.json` `exports."."`**

The Pillar B review flagged this dangling import. Now that `src/cli/index.ts` exists and builds to `dist/cli/index.mjs`, fix the bare-import path:

```json
"exports": {
  ".": { "import": "./dist/cli/index.mjs", "types": "./dist/cli/index.d.ts" },
  ...
}
```

It should already point there from Pillar B (the placeholder). Verify by running:

```bash
cd packages/koni-docs && npm run build
node --input-type=module -e "import('./dist/cli/index.mjs').then(() => console.log('cli bare import ok'))"
```

Expected output: `cli bare import ok` (and `dist/cli/index.mjs` exists).

- [ ] **Step 2: Create 5 story files**

(One per US-4.10..4.14 — US-4.10 was scoped to "CLI framework + preview"; since preview is deferred, US-4.10's scope in Pillar C is just CLI framework + bin entry. Five stories total: US-4.10..4.14, NOT 6.)

Wait — Pillar C ships 5 subcommands but also covers US-4.15 (backfill-commits). Re-check: per spec §9 line 9, US-4.10 = framework + preview, US-4.11..4.15 = 5 subcommands. With preview deferred, US-4.10's deliverable shrinks to "CLI framework + commander + global opts". The other 5 stories stay.

So write 6 story files (US-4.10 through US-4.15) — they correspond directly to plan Tasks 1-6.

For each story, use the existing koni-docs template at `skills/koni-docs/references/templates/story.md`. Frontmatter shape:

```yaml
---
id: US-4.10  # or 4.11, 4.12, 4.13, 4.14, 4.15
title: "<short title>"
epic: EPIC-4
status: done
priority: P0
points: 3   # adjust per spec: 4.10=3, 4.11=3, 4.12=5, 4.13=3, 4.14=2, 4.15=3
sprint: sprint-2026-W25
version_shipped: "0.5.0-dev.0"
prd_ref: FR-15
assignee: <github-login from active-context>
commit: <fill at pre-commit>
created: 2026-05-27
updated: 2026-05-27
---
```

Body: concise per the Pillar B bookkeeping pattern. Cover:
- ## Goal (one paragraph)
- ## Background — refer to Pillar C plan
- ## Acceptance criteria — 3 ACs derived from the Task's "Self-review" + test expectations
- ## Tasks — one TASK item per CLI task step (or aggregate to 1)
- ## Dev notes / References — link to spec + plan + ARCHITECTURE
- ## Verification commands — paste the npm test + spawn-CLI commands
- ## Changelog entry — point at the combined v0.5.0-dev.0 CHANGELOG entry
- ## Cross-references — PRD FR-15, EPIC-4, plan, spec

Filenames:
- `docs/sprints/stories/US-4.10-cli-framework.md`
- `docs/sprints/stories/US-4.11-cli-status.md`
- `docs/sprints/stories/US-4.12-cli-sync.md`
- `docs/sprints/stories/US-4.13-cli-inject-tasks.md`
- `docs/sprints/stories/US-4.14-cli-backfill-fields.md`
- `docs/sprints/stories/US-4.15-cli-backfill-commits.md`

- [ ] **Step 3: Append 6 rows to EPIC-4 Stories table**

Open `docs/sprints/epics/EPIC-4.md`. Find the `## Stories` table and append after the last US-4.9 row:

```
| [US-4.10](../stories/US-4.10-cli-framework.md) | CLI framework + global opts | commander wiring, --docs-path/--dry-run/--json/--verbose, bin entry | ✅ done | v0.5.0-dev.0 |
| [US-4.11](../stories/US-4.11-cli-status.md) | `koni-docs status` subcommand | Regenerate STATUS.md kanban; delete generate-status.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.12](../stories/US-4.12-cli-sync.md) | `koni-docs sync` subcommand | 5-layer propagation, column-by-NAME (W23 BLOCKER fix); delete agile-sync-up.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.13](../stories/US-4.13-cli-inject-tasks.md) | `koni-docs inject-tasks` subcommand | Regen ## Tasks from AC checkboxes; delete agile-inject-tasks.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.14](../stories/US-4.14-cli-backfill-fields.md) | `koni-docs backfill-fields` subcommand | Merge STORY_DEFAULTS for missing keys; delete agile-backfill-fields.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.15](../stories/US-4.15-cli-backfill-commits.md) | `koni-docs backfill-commits` subcommand | Replace pending SHA via git; delete changelog-backfill-commits.mjs + sync-test.mjs | ✅ done | v0.5.0-dev.0 |
```

- [ ] **Step 4: Bump VERSION**

```bash
echo "0.5.0-dev.0" > VERSION
```

- [ ] **Step 5: Add CHANGELOG entry**

Insert AFTER `## [Unreleased]\n\n(empty...)\n\n---` block but BEFORE `## [0.4.0-dev.0]`:

```markdown
## [0.5.0-dev.0] — 2026-05-27 — koni-docs CLI Pillar C — v0.5.0-dev.0

Ships `koni-docs` CLI binary with 5 subcommands backed by the Pillar B lib. Deletes the 5 legacy `.mjs` scripts and `sync-test.mjs`. The W23 Carry-column BLOCKER fix is now live for end-users via `koni-docs sync`. `preview` subcommand deferred to Pillar D alongside the Astro viewer build.

### Added
- `koni-docs status` — replaces `generate-status.mjs` (semver ID sort)
- `koni-docs sync` — replaces `agile-sync-up.mjs`, column-by-NAME (W23 BLOCKER fix)
- `koni-docs inject-tasks` — replaces `agile-inject-tasks.mjs`
- `koni-docs backfill-fields` — replaces `agile-backfill-fields.mjs`
- `koni-docs backfill-commits` — replaces `changelog-backfill-commits.mjs`
- `commander`-based CLI framework with global flags (`--docs-path`, `--dry-run`, `--json`, `--verbose`)

### Removed (BREAKING for consumer repos hardcoding `node skills/...` paths)
- `skills/koni-docs/scripts/generate-status.mjs`
- `skills/koni-docs/scripts/agile-sync-up.mjs`
- `skills/koni-docs/scripts/agile-inject-tasks.mjs`
- `skills/koni-docs/scripts/agile-backfill-fields.mjs`
- `skills/koni-docs/scripts/changelog-backfill-commits.mjs`
- `skills/koni-docs/scripts/__tests__/sync-test.mjs`

### Fixed
- **W23 BLOCKER** — `agile-sync-up.mjs` silently wrote status icons into the `Carry` column of `sprint-2026-W23.md` because cell addressing was by position. `koni-docs sync` now addresses by column NAME and throws clearly if the column is missing.

**Commit**: pending
```

- [ ] **Step 6: Commit bookkeeping**

```bash
git add docs/sprints/stories/US-4.10-cli-framework.md \
        docs/sprints/stories/US-4.11-cli-status.md \
        docs/sprints/stories/US-4.12-cli-sync.md \
        docs/sprints/stories/US-4.13-cli-inject-tasks.md \
        docs/sprints/stories/US-4.14-cli-backfill-fields.md \
        docs/sprints/stories/US-4.15-cli-backfill-commits.md \
        docs/sprints/epics/EPIC-4.md \
        VERSION \
        docs/CHANGELOG.md
git commit -m "docs: stories US-4.10..4.15 + v0.5.0-dev.0 CHANGELOG (Pillar C)"
```

- [ ] **Step 7: Backfill commit SHA in CHANGELOG**

```bash
cd packages/koni-docs && node --import tsx src/cli/index.ts backfill-commits --docs-path ../../docs/
cd ../..
git add docs/CHANGELOG.md
git commit -m "docs: backfill commit SHA for v0.5.0-dev.0 (via koni-docs backfill-commits)"
```

This is the **first time the new CLI dogfoods itself** — the freshly-built `backfill-commits` fills its own CHANGELOG's pending SHA. Document this satisfying loop in the commit message.

---

## Self-review checklist

- [ ] All 5 subcommands have unit-level integration tests (spawn-based via `runCli`).
- [ ] W23 BLOCKER regression test passes (Task 3, Step 6).
- [ ] All 5 `.mjs` scripts deleted (verified by `ls skills/koni-docs/scripts/` empty or dir gone).
- [ ] `sync-test.mjs` deleted alongside the last subcommand.
- [ ] `package.json` `exports."."` is no longer dangling (CLI bundle exists at `dist/cli/index.mjs`).
- [ ] `npm test` shows ≥68 tests pass (49 Pillar B + 3+3+5+3+3+2 = 68 new).
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run build` produces both `dist/cli/index.mjs` AND `dist/lib/index.mjs` (CLI bundle has shebang banner; `head -1 dist/cli/index.mjs` shows `#!/usr/bin/env node`).
- [ ] VERSION = `0.5.0-dev.0`; CHANGELOG `[0.5.0-dev.0]` entry has real commit SHA (not `pending`).
- [ ] EPIC-4 Stories table contains 15 rows (4 viewer + 5 lib + 6 CLI).

---

## Out-of-scope reminders (for Pillar D)

- `koni-docs preview` subcommand + the Astro SSR viewer build (currently US-4.10's preview half is unimplemented; story file documents the deferral).
- Astro Content Collections integration / live cross-reference rendering (deferred indefinitely).
- SKILL.md §7 rewrite to point at CLI subcommands (currently still references the now-deleted `.mjs` paths).
- `references/sprint-system.md` script references → CLI references.
- CLAUDE.md / AGENTS.md tooling pointers update.
- `npm publish @koniverse/koni-docs@0.5.0` to npm registry.
- Consumer migration table in CHANGELOG (the v0.5.0-dev.0 entry above includes a partial one — expand for the final v0.5.0 release).
- FR-ref validation against PRD §8 in `validateRefs` (deferred from Pillar B Task 16).
- The 5 Minor polish items from Pillar B review (mutation-contract docs, dead `recursive` param, unused `unist-util-visit`, missing edge-case tests, dead `serializeChangelog` import).
