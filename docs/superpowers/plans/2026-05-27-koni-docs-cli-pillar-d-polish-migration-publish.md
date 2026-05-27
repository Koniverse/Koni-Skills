# Koni-docs CLI — Pillar D: Polish, Migration, npm publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the v0.5.0 release loop. Fix the 5 Minor polish items surfaced in Pillar C's final review, rewrite agent-facing docs (SKILL.md / sprint-system.md / CLAUDE.md / AGENTS.md) to point at the new CLI instead of the deleted `.mjs` scripts, add a consumer migration table to the CHANGELOG, bump VERSION to a stable `0.5.0`, and publish `@koniverse/koni-docs@0.5.0` to npm.

**Architecture:** No new code modules. Polish task layer touches `src/cli/*.ts` (and one regex test in `src/lib/`), the migration task layer touches `skills/koni-docs/`, `docs/`, and root-level `CLAUDE.md`/`AGENTS.md`. The publish step uses standard npm tooling against the existing `dist/` output (no build changes).

**Tech Stack:** No new dependencies. Continues using TypeScript + commander + node:test from Pillar B/C, plus standard `npm publish` for the release step.

**Scope covered:** US-4.16 (migration docs), US-4.17 (publish), and **new** US-4.18 (CLI polish fixes — 3 points, surfaced by Pillar C code review).

**Not in scope (Pillar E):** `koni-docs preview` subcommand + Astro SSR viewer build (deferred by user-confirmed scope; the viewer was scoped to v0.6.0 to keep v0.5.0 ship-able).

---

## File structure

This plan does not introduce new files in `packages/koni-docs/src/`. It edits existing source + tests + docs:

```
packages/koni-docs/src/
├── cli/inject-tasks.ts          # ADD dryRun guard
├── cli/sync.ts                  # warnings → stderr; drop dead SyncStats fields
├── lib/index.ts                 # sync KONI_DOCS_LIB_VERSION with package.json
packages/koni-docs/__tests__/
├── cli/inject-tasks.test.ts     # ADD --dry-run regression test
├── lib/changelog.test.ts        # ADD pre-release semver unit test

skills/koni-docs/
├── SKILL.md                      # rewrite §7 to point at CLI
└── references/sprint-system.md   # rewrite §Scripts to CLI

CLAUDE.md                         # update Koni-Docs Integration block + tooling refs
AGENTS.md                         # same as CLAUDE.md
docs/
├── CHANGELOG.md                  # bump from 0.5.0-dev.0 → 0.5.0; consumer migration table
├── SETUP.md                      # OPTIONAL: add @koniverse/koni-docs install instructions
└── sprints/
    ├── epics/EPIC-4.md           # append 3 rows for US-4.16..4.18
    └── stories/                  # 3 new story files
VERSION                           # bump 0.5.0-dev.0 → 0.5.0
```

---

## Task 1: Fix `inject-tasks --dry-run` bypass (US-4.18 polish #1)

**Files:**
- Modify: `packages/koni-docs/src/cli/inject-tasks.ts`
- Modify: `packages/koni-docs/__tests__/cli/inject-tasks.test.ts`

**Why this matters:** `inject-tasks` currently writes files even when `--dry-run` is passed. This is a UX foot-gun.

- [ ] **Step 1: Add a failing `--dry-run` test**

Append to `__tests__/cli/inject-tasks.test.ts`:

```ts
test('inject-tasks: --dry-run does NOT modify files', () => {
  const docs = freshDocs();
  const storyPath = join(docs, 'sprints', 'stories', 'US-1.2-bar.md');
  const raw = readFileSync(storyPath, 'utf-8');
  writeFileSync(storyPath, raw + '\n## Tasks\n\n_placeholder_\n');
  const before = readFileSync(storyPath, 'utf-8');

  const r = runCli(['inject-tasks', '--story', 'US-1.2', '--docs-path', docs, '--dry-run']);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const after = readFileSync(storyPath, 'utf-8');
  assert.equal(after, before, 'dry-run must not modify the story');
});
```

- [ ] **Step 2: Run — expect failure**

```bash
cd packages/koni-docs && npm test 2>&1 | tail -10
```

Expected: the new test fails because `injectIntoStory` writes unconditionally.

- [ ] **Step 3: Thread `dryRun` into `injectIntoStory`**

Edit `src/cli/inject-tasks.ts`. Change the function signature:

```ts
function injectIntoStory(storyPath: string, dryRun: boolean): { id: string; acCount: number } | null {
  const doc = readDoc(storyPath);
  const id = String(doc.frontmatter.id ?? '');
  if (!id) return null;
  const ac = parseCheckboxes(doc, 'Acceptance criteria');
  if (ac.length === 0) return null;
  const tasksMd = generateTasksMarkdown(id, ac);
  const next = replaceSection(doc, 'Tasks', tasksMd);
  if (!dryRun) writeDoc(storyPath, next);
  return { id, acCount: ac.length };
}
```

Update the caller in the action handler:

```ts
for (const path of targets) {
  const r = injectIntoStory(path, opts.dryRun);
  if (r) results.push(r);
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test 2>&1 | tail -10
```

Expected: 69 tests pass total (68 prior + 1 new dry-run test).

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck && echo "exit:$?"
```

- [ ] **Step 6: Commit**

```bash
git add packages/koni-docs/src/cli/inject-tasks.ts packages/koni-docs/__tests__/cli/inject-tasks.test.ts
git commit -m "fix(koni-docs/cli): inject-tasks honors --dry-run (US-4.18)"
```

---

## Task 2: Route `sync` warnings to stderr + drop dead `SyncStats` fields (US-4.18 polish #2, #3)

**Files:**
- Modify: `packages/koni-docs/src/cli/sync.ts`

**Why this matters:** `sync` currently prints warnings (e.g., "epic EPIC-X not found") via `console.log` (stdout), which interleaves with success output and breaks `--json` consumers piping through `jq`. Also, `SyncStats` declares `prdStory` and `skipped` fields that are initialized to `0` and never incremented anywhere — dead struct fields.

- [ ] **Step 1: Edit `src/cli/sync.ts`**

Two changes in one file:

(a) Remove the unused fields from `SyncStats`:

```ts
// BEFORE
interface SyncStats {
  epic: number;
  prdStory: number;   // dead
  prdFr: number;
  sprint: number;
  skipped: number;    // dead
  warnings: string[];
}

// AFTER
interface SyncStats {
  epic: number;
  prdFr: number;
  sprint: number;
  warnings: string[];
}
```

Also remove their `0` initializations in `syncOne` and `totals` (search for `prdStory:` and `skipped:` — there should be 2 occurrences of each).

(b) Move warning prints to stderr in the action handler:

```ts
// BEFORE
for (const w of totals.warnings) console.log(`  ⚠ ${w}`);

// AFTER
for (const w of totals.warnings) console.error(`  ⚠ ${w}`);
```

- [ ] **Step 2: Run — expect pass (no test additions; behavior change is observable in `r.stderr`)**

```bash
cd packages/koni-docs && npm test 2>&1 | tail -10
```

Expected: 69 tests pass total (no regressions).

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck && echo "exit:$?"
```

- [ ] **Step 4: Commit**

```bash
git add packages/koni-docs/src/cli/sync.ts
git commit -m "fix(koni-docs/cli): route sync warnings to stderr + drop dead SyncStats fields (US-4.18)"
```

---

## Task 3: Add pre-release semver unit test + sync `KONI_DOCS_LIB_VERSION` (US-4.18 polish #4, #5)

**Files:**
- Modify: `packages/koni-docs/__tests__/lib/changelog.test.ts`
- Modify: `packages/koni-docs/src/lib/index.ts`
- Modify: `packages/koni-docs/package.json`

**Why this matters:**
- The Pillar C dogfood loop landed a fix to `parseChangelog`'s `HEADER_RE` for pre-release semver (`0.5.0-dev.0`), but no unit test locks the regression.
- `KONI_DOCS_LIB_VERSION = '0.2.0-dev.0'` in `src/lib/index.ts` is stale; the root `VERSION` is `0.5.0-dev.0` and the package will bump to `0.5.0` in Task 6. CLI `--version` should report the real package version.

- [ ] **Step 1: Add the pre-release semver test**

Append to `__tests__/lib/changelog.test.ts`:

```ts
test('parseChangelog: handles pre-release semver (0.5.0-dev.0)', () => {
  const raw = `# Changelog

## [Unreleased]

(empty)

## [0.5.0-dev.0] — 2026-05-27 — Pre-release entry — v0.5.0-dev.0

Body text.

**Commit**: abc1234

## [0.4.0-dev.0] — 2026-05-27 — Earlier — v0.4.0-dev.0

Older.

**Commit**: def5678
`;
  const entries = parseChangelog(raw);
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.version, '0.5.0-dev.0');
  assert.equal(entries[0]?.title, 'Pre-release entry');
  assert.equal(entries[0]?.commitSha, 'abc1234');
  assert.equal(entries[1]?.version, '0.4.0-dev.0');
});
```

- [ ] **Step 2: Run — expect pass (regex fix already in place; this just locks it)**

```bash
cd packages/koni-docs && npm test 2>&1 | tail -10
```

Expected: 70 tests pass total.

- [ ] **Step 3: Read package.json to capture the version**

```bash
node -e "console.log(JSON.parse(require('node:fs').readFileSync('packages/koni-docs/package.json', 'utf-8')).version)"
```

It will show `0.2.0-dev.0`. We will bump both `package.json` and `KONI_DOCS_LIB_VERSION` to `0.5.0-dev.1` here as an intermediate (Task 6 bumps further to `0.5.0`).

- [ ] **Step 4: Update `package.json` version to `0.5.0-dev.1`**

Edit `packages/koni-docs/package.json`. Change:

```json
"version": "0.2.0-dev.0",
```

to:

```json
"version": "0.5.0-dev.1",
```

- [ ] **Step 5: Update `src/lib/index.ts` to source the version from package.json at build time, or hardcode in sync with package.json**

The simplest approach (no JSON imports in ESM gymnastics): hardcode the version constant in `src/lib/index.ts` and keep it in sync with `package.json` by convention. This convention is documented in the CHANGELOG entry for v0.5.0 (Task 6).

Edit `src/lib/index.ts`:

```ts
export const KONI_DOCS_LIB_VERSION = '0.5.0-dev.1';
```

Update the smoke test at `__tests__/smoke.test.ts` to match:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KONI_DOCS_LIB_VERSION } from '../src/lib/index.ts';

test('smoke: lib version exported', () => {
  assert.equal(KONI_DOCS_LIB_VERSION, '0.5.0-dev.1');
});
```

- [ ] **Step 6: Run tests + typecheck**

```bash
npm test 2>&1 | tail -10
npm run typecheck && echo "exit:$?"
```

Expected: 70 tests pass total. Typecheck exit 0.

- [ ] **Step 7: Verify CLI `--version` now reports the new version**

```bash
node --import tsx src/cli/index.ts --version
```

Expected output: `0.5.0-dev.1`.

- [ ] **Step 8: Commit**

```bash
git add packages/koni-docs/src/lib/index.ts packages/koni-docs/package.json packages/koni-docs/__tests__/smoke.test.ts packages/koni-docs/__tests__/lib/changelog.test.ts
git commit -m "fix(koni-docs): sync lib + package version to 0.5.0-dev.1 + add pre-release semver test (US-4.18)"
```

---

## Task 4: Rewrite `skills/koni-docs/SKILL.md` §7 and `references/sprint-system.md` to point at CLI

**Files:**
- Modify: `skills/koni-docs/SKILL.md` (§7 Bundled scripts → §7 CLI)
- Modify: `skills/koni-docs/references/sprint-system.md` (Scripts section)
- Modify: `skills/koni-docs/SKILL.md` (§5 Activation table — replace `node skills/...` rows with `npx koni-docs ...`)

**Why this matters:** SKILL.md still references the now-deleted `.mjs` scripts. Agents reading this skill will be confused. Replace with CLI subcommand invocations.

- [ ] **Step 1: Open `skills/koni-docs/SKILL.md`**

Find §7 "Bundled scripts" (or whatever the script section is labeled). It currently lists the 5 `.mjs` invocations. Replace the section with this CLI-focused version (use Edit, anchor on the §7 heading):

```markdown
## 7. CLI tool — `@koniverse/koni-docs`

This skill ships with a companion CLI binary published as `@koniverse/koni-docs` (v0.5.0+). Install once per consumer repo (via `npm install --save-dev @koniverse/koni-docs`) or run on-demand via `npx koni-docs`.

### How to run

```bash
npx koni-docs <subcommand> --docs-path docs/
```

All subcommands accept:

- `--docs-path <path>` — override the default `docs/` root
- `--dry-run` — preview changes without writing files
- `--json` — machine-readable output
- `--verbose` — extra logging

### Subcommand inventory

| Subcommand | Purpose | Example |
|---|---|---|
| `status` | Regenerate `STATUS.md` kanban | `npx koni-docs status` |
| `sync` | Propagate story status through 5 doc layers | `npx koni-docs sync --story US-X.Y` |
| `inject-tasks` | Regen `## Tasks` from `## Acceptance criteria` | `npx koni-docs inject-tasks --story US-X.Y` |
| `backfill-fields` | Add missing frontmatter keys | `npx koni-docs backfill-fields` |
| `backfill-commits` | Fill `pending` commit SHAs in CHANGELOG via git | `npx koni-docs backfill-commits` |

(`preview` subcommand is planned for v0.6.0 — Pillar E.)

### Library API for programmatic use

Other Koniverse products can import the typed lib without the CLI:

```ts
import { loadCorpus, getStories, resolveById } from '@koniverse/koni-docs/lib';
import { storySchema, validateStory } from '@koniverse/koni-docs/lib/schemas';
import { findSection, updateCell, parseCheckboxes } from '@koniverse/koni-docs/lib/markdown';
```

The lib has zero CLI dependencies. Composes `gray-matter` + `unified`/`remark-gfm` + `zod`.
```

- [ ] **Step 2: Open `skills/koni-docs/references/sprint-system.md`**

Find the "Scripts reference" section (or equivalent). Replace each `node skills/koni-docs/scripts/<name>.mjs ...` line with `npx koni-docs <subcommand> ...`. Use the migration table:

| Old | New |
|---|---|
| `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/` | `npx koni-docs status --docs-path docs/` |
| `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/ --story US-X.Y` | `npx koni-docs sync --docs-path docs/ --story US-X.Y` |
| `node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --all` | `npx koni-docs inject-tasks --docs-path docs/ --all` |
| `node skills/koni-docs/scripts/agile-backfill-fields.mjs --docs-path docs/` | `npx koni-docs backfill-fields --docs-path docs/` |
| `node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/` | `npx koni-docs backfill-commits --docs-path docs/` |

- [ ] **Step 3: Search-and-replace SKILL.md §5 Activation table**

Look for lines in the activation table containing `node skills/koni-docs/scripts/`. Replace each with the CLI form per the table above. Use Edit per row.

- [ ] **Step 4: Verify no orphan references in skills/**

```bash
rg "skills/koni-docs/scripts/" skills/
```

Expected: zero results.

- [ ] **Step 5: Commit**

```bash
git add skills/koni-docs/SKILL.md skills/koni-docs/references/sprint-system.md
git commit -m "docs(skill): rewrite SKILL.md §7 + sprint-system.md to reference @koniverse/koni-docs CLI (US-4.16)"
```

---

## Task 5: Update `CLAUDE.md`, `AGENTS.md`, `docs/SETUP.md` tooling pointers + Consumer migration table in CHANGELOG

**Files:**
- Modify: `CLAUDE.md` (repo root)
- Modify: `AGENTS.md` (repo root)
- Modify: `docs/SETUP.md` (add npm install + npx usage notes)
- Modify: `docs/CHANGELOG.md` (insert consumer migration table near v0.5.0-dev.0 entry)

- [ ] **Step 1: Read `CLAUDE.md` to find any references to `skills/koni-docs/scripts/`**

```bash
rg "skills/koni-docs/scripts/" CLAUDE.md AGENTS.md
```

If matches: replace each with the CLI form (`npx koni-docs <subcommand>`). If no matches: skip the edit on those files.

- [ ] **Step 2: Update Koni-docs Integration block in `CLAUDE.md`**

Find the integration block in `CLAUDE.md`. The current state references the koni-docs SKILL.md. Add a one-line note:

```markdown
> **CLI**: install `@koniverse/koni-docs` (v0.5.0+) for the typed CLI binary. All sync / status / etc. operations described in this skill run via `npx koni-docs <subcommand>`.
```

Apply the same update to `AGENTS.md`'s equivalent block.

- [ ] **Step 3: Append to `docs/SETUP.md`**

Find the "Tools" or "Dependencies" section. Append:

```markdown
### Koni-docs CLI

This project's docs are managed by the `@koniverse/koni-docs` CLI. Install it locally:

```bash
npm install --save-dev @koniverse/koni-docs
```

Then any of the standard sync/status operations work via npx:

```bash
npx koni-docs status
npx koni-docs sync --story US-X.Y
npx koni-docs inject-tasks --story US-X.Y
npx koni-docs backfill-fields
npx koni-docs backfill-commits
```

For programmatic / library use:

```ts
import { loadCorpus, getStories } from '@koniverse/koni-docs/lib';
```
```

- [ ] **Step 4: Add consumer migration table to CHANGELOG**

Open `docs/CHANGELOG.md`. Find the `## [0.5.0-dev.0]` entry. APPEND a new subsection inside that entry (after the `### Fixed` section, before `**Commit**:`):

```markdown
### Migration table (for consumer repos updating from < 0.4.0)

The 5 legacy `.mjs` scripts under `skills/koni-docs/scripts/` are gone. Update any `package.json` `scripts` blocks, CI jobs, or git hooks that hard-coded their paths:

| Old | New |
|---|---|
| `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/` | `npx koni-docs status --docs-path docs/` |
| `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/ --story US-X.Y` | `npx koni-docs sync --docs-path docs/ --story US-X.Y` |
| `node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --all` | `npx koni-docs inject-tasks --docs-path docs/ --all` |
| `node skills/koni-docs/scripts/agile-backfill-fields.mjs --docs-path docs/` | `npx koni-docs backfill-fields --docs-path docs/` |
| `node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/` | `npx koni-docs backfill-commits --docs-path docs/` |

If you have an `npm run agile:status` script:

```diff
- "agile:status": "node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/"
+ "agile:status": "koni-docs status --docs-path docs/"
```

(Add `@koniverse/koni-docs` to your devDependencies; the `koni-docs` bin resolves locally without needing `npx` when listed in `scripts:`.)
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md AGENTS.md docs/SETUP.md docs/CHANGELOG.md
git commit -m "docs: update CLAUDE.md/AGENTS.md/SETUP.md tooling refs + consumer migration table (US-4.16)"
```

---

## Task 6: Bump VERSION to stable `0.5.0` + new CHANGELOG entry

**Files:**
- Modify: `VERSION`
- Modify: `packages/koni-docs/package.json`
- Modify: `packages/koni-docs/src/lib/index.ts`
- Modify: `packages/koni-docs/__tests__/smoke.test.ts`
- Modify: `docs/CHANGELOG.md`

- [ ] **Step 1: Bump `VERSION`**

```bash
echo "0.5.0" > VERSION
```

- [ ] **Step 2: Bump `packages/koni-docs/package.json` version**

Edit. Change `"version": "0.5.0-dev.1"` to `"version": "0.5.0"`.

- [ ] **Step 3: Bump `KONI_DOCS_LIB_VERSION` + smoke test**

`src/lib/index.ts`:

```ts
export const KONI_DOCS_LIB_VERSION = '0.5.0';
```

`__tests__/smoke.test.ts`:

```ts
test('smoke: lib version exported', () => {
  assert.equal(KONI_DOCS_LIB_VERSION, '0.5.0');
});
```

- [ ] **Step 4: Add a CHANGELOG entry for v0.5.0 (stable)**

Insert in `docs/CHANGELOG.md` AFTER `## [Unreleased]` and BEFORE `## [0.5.0-dev.0]`:

```markdown
## [0.5.0] — 2026-05-27 — Pillar D ship: polish + migration + npm publish — v0.5.0

Stable v0.5.0 release of `@koniverse/koni-docs`. Closes the CLI expansion epic with consumer-facing migration docs and an npm-published CLI binary.

### Added
- npm-published `@koniverse/koni-docs` v0.5.0 with bin `koni-docs` (5 subcommands) and lib subpath exports.
- `docs/SETUP.md` install + usage instructions.
- Consumer migration table in CHANGELOG (replaces `.mjs` paths).
- Unit test locking pre-release semver in `parseChangelog`.

### Fixed
- `inject-tasks` honors `--dry-run` (was silently writing files).
- `sync` non-fatal warnings now print to stderr (no longer interleaves with `--json` stdout).
- `KONI_DOCS_LIB_VERSION` synced with `package.json` version (was stuck at `0.2.0-dev.0`).
- `SyncStats` interface no longer carries dead `prdStory` / `skipped` fields.

### Documentation
- `skills/koni-docs/SKILL.md` §7 rewritten: bundled `.mjs` scripts → CLI subcommand reference.
- `skills/koni-docs/references/sprint-system.md` script paths → CLI paths.
- `CLAUDE.md` / `AGENTS.md` Koni-docs Integration blocks updated to mention CLI install.

**Commit**: pending
```

- [ ] **Step 5: Run tests + typecheck (no regressions expected)**

```bash
cd packages/koni-docs && npm test 2>&1 | tail -10
npm run typecheck && echo "exit:$?"
```

Expected: 70 tests pass total. Typecheck exit 0.

- [ ] **Step 6: Commit the version bump + CHANGELOG entry**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills
git add VERSION packages/koni-docs/package.json packages/koni-docs/src/lib/index.ts packages/koni-docs/__tests__/smoke.test.ts docs/CHANGELOG.md
git commit -m "feat: ship v0.5.0 — koni-docs CLI Pillar D close (US-4.17)"
```

- [ ] **Step 7: Backfill commit SHA in CHANGELOG via the dogfood CLI**

```bash
cd packages/koni-docs && node --import tsx src/cli/index.ts backfill-commits --docs-path ../../docs/
cd /Volumes/MacData/Workspace/AI/Koni-Skills
git add docs/CHANGELOG.md
git commit -m "docs: backfill commit SHA for v0.5.0 (via koni-docs backfill-commits)"
```

---

## Task 7: npm publish prep + actual publish (GATED ON USER CONFIRMATION)

**Files:**
- Modify: `packages/koni-docs/package.json` (verify `files` field excludes test fixtures)
- May modify: `packages/koni-docs/.npmignore` if needed

**Why this is gated**: `npm publish` is a real outward action. Once published, a version cannot be unpublished after 72 hours (npm policy), and the package becomes visible globally. **The implementer MUST STOP at Step 6 and surface the publish command to the user for explicit confirmation before running it.**

- [ ] **Step 1: Build the published artifact**

```bash
cd packages/koni-docs && npm run build
```

Verify outputs:

```bash
ls -la dist/
ls -la dist/cli/ dist/lib/
head -1 dist/cli/index.mjs    # should be: #!/usr/bin/env node
```

Expected: `dist/cli/index.mjs`, `dist/cli/index.d.ts`, `dist/lib/index.mjs`, `dist/lib/index.d.ts`, plus markdown + schemas subpath bundles. CLI bundle has shebang banner.

- [ ] **Step 2: `npm pack` dry-run — inspect what would ship**

```bash
npm pack --dry-run 2>&1 | tail -30
```

Expected output: a list of files that would be included in the tarball. Verify:
- `dist/**` is included
- `__tests__/**` is NOT included (tests don't ship)
- `src/**` is NOT included (only dist ships)
- `README.md` is included (if present; create a minimal one in Step 3 if not)

- [ ] **Step 3: Add a minimal `packages/koni-docs/README.md` if missing**

```bash
test -f packages/koni-docs/README.md || cat > packages/koni-docs/README.md <<'EOF'
# @koniverse/koni-docs

CLI tool + reusable TypeScript library for the `koni-docs` documentation framework.

## Install

```bash
npm install --save-dev @koniverse/koni-docs
```

## CLI usage

```bash
npx koni-docs status                          # regenerate sprints/STATUS.md
npx koni-docs sync --story US-X.Y             # propagate status to 5 doc layers
npx koni-docs inject-tasks --story US-X.Y     # regen ## Tasks from AC checkboxes
npx koni-docs backfill-fields                 # add missing frontmatter keys
npx koni-docs backfill-commits                # fill pending commit SHAs from git
```

All subcommands accept `--docs-path <path>`, `--dry-run`, `--json`, `--verbose`.

## Library usage

```ts
import { loadCorpus, getStories } from '@koniverse/koni-docs/lib';
import { findSection, updateCell } from '@koniverse/koni-docs/lib/markdown';
import { storySchema, validateStory } from '@koniverse/koni-docs/lib/schemas';
```

## Engines

Node.js >= 20.0.0

## License

MIT
EOF
```

Stage and commit if a new README was created:

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills
git add packages/koni-docs/README.md
git commit -m "docs(koni-docs): add npm README"
```

- [ ] **Step 4: Re-run `npm pack --dry-run`**

Confirm the README is now in the tarball file list. If everything else looks clean, proceed.

- [ ] **Step 5: Verify npm credentials + organization access (manual)**

The implementer must STOP here and surface this to the user:

```
The next step is `npm publish --access public` against the npm registry.
Before running it, please confirm:

1. You are logged into the @koniverse npm organization (run `npm whoami`).
2. You have publish rights for the @koniverse scope.
3. You are OK with the version 0.5.0 being permanent on npm (cannot unpublish after 72 hours).
4. The tarball file list from `npm pack --dry-run` is what you want to ship.

Reply "publish" to proceed with `npm publish --access public`, or "skip" to defer.
```

DO NOT RUN `npm publish` without the user's explicit "publish" reply.

- [ ] **Step 6: Wait for user confirmation**

If user replies "publish", proceed to Step 7.
If user replies "skip", proceed to Task 8 (bookkeeping) and document the deferral.

- [ ] **Step 7: Run `npm publish --access public`**

```bash
cd packages/koni-docs && npm publish --access public 2>&1 | tail -20
```

Expected output: `+ @koniverse/koni-docs@0.5.0`. Or surface any error verbatim.

- [ ] **Step 8: Commit nothing for the publish itself**

`npm publish` does not change tracked files (only emits a network call). No commit needed for the publish action itself.

---

## Task 8: Bookkeeping — stories US-4.16..4.18 + EPIC-4 table

**Files:**
- Create: `docs/sprints/stories/US-4.16-cli-migration-docs.md`
- Create: `docs/sprints/stories/US-4.17-cli-npm-publish.md`
- Create: `docs/sprints/stories/US-4.18-cli-polish-fixes.md`
- Modify: `docs/sprints/epics/EPIC-4.md` (append 3 rows)
- Modify: `docs/CHANGELOG.md` (commit SHA already backfilled in Task 6 Step 7)

- [ ] **Step 1: Create the 3 story files**

Follow the koni-docs story template at `skills/koni-docs/references/templates/story.md`. Concise stub bodies — same pattern as Pillar B/C bookkeeping.

Frontmatter shared across all 3:
- `epic: EPIC-4`
- `status: done`
- `priority: P1`
- `sprint: sprint-2026-W25`
- `version_shipped: "0.5.0"`
- `prd_ref: FR-15` (or FR-18 for US-4.17 if you split published from migration in PRD)
- `assignee: saltict`
- `created: 2026-05-27`
- `updated: 2026-05-27`

Per-story:

| Story | Title | Points | Slug | Pillar D Tasks covered |
|---|---|---|---|---|
| US-4.16 | Migration docs — SKILL.md / sprint-system.md / CLAUDE.md / SETUP.md | 3 | cli-migration-docs | Tasks 4, 5 |
| US-4.17 | Publish @koniverse/koni-docs@0.5.0 to npm | 2 | cli-npm-publish | Tasks 6, 7 |
| US-4.18 | CLI polish — 5 minor fixes from Pillar C review | 3 | cli-polish-fixes | Tasks 1, 2, 3 |

Each story should reference [Pillar D plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md).

- [ ] **Step 2: Append 3 rows to EPIC-4 Stories table**

After the last US-4.15 row, append:

```
| [US-4.16](../stories/US-4.16-cli-migration-docs.md) | Migration docs (SKILL.md / sprint-system.md / CLAUDE.md / SETUP.md) | Rewrite agent-facing docs to point at CLI; consumer migration table | ✅ done | v0.5.0 |
| [US-4.17](../stories/US-4.17-cli-npm-publish.md) | Publish @koniverse/koni-docs@0.5.0 to npm | npm publish --access public; verify install + npx koni-docs works | ✅ done | v0.5.0 |
| [US-4.18](../stories/US-4.18-cli-polish-fixes.md) | CLI polish — 5 minor fixes | inject-tasks dry-run; sync stderr; SyncStats fields; pre-release test; version skew | ✅ done | v0.5.0 |
```

- [ ] **Step 3: Verify EPIC-4 row count**

```bash
grep -c "^| \[US-" docs/sprints/epics/EPIC-4.md
```

Expected: 18 (4 viewer + 5 lib + 6 CLI + 3 Pillar D = 18).

- [ ] **Step 4: Commit**

```bash
git add docs/sprints/stories/US-4.16-cli-migration-docs.md docs/sprints/stories/US-4.17-cli-npm-publish.md docs/sprints/stories/US-4.18-cli-polish-fixes.md docs/sprints/epics/EPIC-4.md
git commit -m "docs: stories US-4.16..4.18 + EPIC-4 close at v0.5.0 (Pillar D)"
```

---

## Self-review checklist

- [ ] 5 polish items addressed (inject-tasks dry-run, sync warnings stderr, SyncStats dead fields, pre-release semver test, version skew).
- [ ] `rg "skills/koni-docs/scripts/" skills/ CLAUDE.md AGENTS.md docs/SETUP.md` returns zero results.
- [ ] `docs/CHANGELOG.md` has a consumer migration table inside the v0.5.0-dev.0 entry AND a new v0.5.0 entry.
- [ ] `VERSION = 0.5.0`. `packages/koni-docs/package.json` version = `0.5.0`. `KONI_DOCS_LIB_VERSION = '0.5.0'`. All three consistent.
- [ ] `npm pack --dry-run` shows `dist/`, `README.md`, `package.json` — and excludes `__tests__/`, `src/`.
- [ ] If `npm publish` was run: `npm view @koniverse/koni-docs@0.5.0` resolves; latest commit history is clean.
- [ ] If `npm publish` was deferred per user choice: documented in CHANGELOG (e.g., "v0.5.0 prepared locally, publish deferred to <date>"), task 7 marked DONE_WITH_CONCERNS in the report.
- [ ] EPIC-4 Stories table has 18 rows total.
- [ ] All 70 tests pass.

---

## Out-of-scope reminders (for Pillar E)

- `koni-docs preview` subcommand — the Astro SSR viewer build (US-4.1..4.3 lift to code; chokidar live reload; SSE; `--watch` flag; config file support).
- Astro Content Collections integration (long-term — replace hand-maintained cross-reference tables with rendered views).
- FR-ref validation against PRD §8 in `validateRefs` (deferred since Pillar B Task 16).
- The original 5 Minor polish items from Pillar B review that remain: mutation-contract docs, dead `recursive` param, unused `unist-util-visit`, missing edge-case tests for `updateCell` row-not-found / `parseChangelog` empty input / `validateRefs` broken refs, dead `serializeChangelog` import in changelog.test.ts.
- `koni-docs validate` subcommand (Tier C from the design spec — read-only validation for the L3 ID graph).
