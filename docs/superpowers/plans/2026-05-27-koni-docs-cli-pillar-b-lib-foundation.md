# Koni-docs CLI — Pillar B: Lib Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the reusable `@koniverse/koni-docs/lib` TypeScript library that owns all L1/L2/L3 markdown-document operations, fully unit-tested. Lib is the foundation Pillar C (CLI) consumes and external products can import without depending on the CLI or Astro viewer.

**Architecture:** New npm package at `packages/koni-docs/` (TypeScript, ESM, tsup-bundled). Nine lib modules compose existing third-party libs (gray-matter, unified+remark+remark-gfm, unist-util-visit, mdast-util-to-string, zod) — no hand-rolled YAML or table parsing. Pure-functional style: read → transform → write; `Doc` value type passes through transformations.

**Tech Stack:** TypeScript 5 strict ESM · tsup bundler · gray-matter (frontmatter) · unified + remark-parse + remark-stringify + remark-gfm (markdown AST + tables) · unist-util-visit + mdast-util-to-string (AST traversal) · zod (schemas) · node:test built-in runner.

**Scope covered:** US-4.5, US-4.6, US-4.7, US-4.8, US-4.9 (5 stories, 19 points).

**Not in scope (Pillar C/D):** CLI binary, subcommands, deletion of old `.mjs` scripts, viewer migration, npm publish.

---

## File structure

This plan creates one new directory tree under repo root:

```
packages/koni-docs/
├── package.json                       # npm package metadata + subpath exports
├── tsconfig.json                      # strict ESM config
├── tsup.config.ts                     # bundler config (lib-only for now)
├── .gitignore                         # node_modules, dist
├── src/
│   └── lib/
│       ├── index.ts                   # public lib entry; re-exports everything
│       ├── types.ts                   # shared types: Doc, MatterEntry, Corpus, ...
│       ├── doc.ts                     # readDoc/writeDoc/parseDoc/serializeDoc/updateFrontmatter
│       ├── corpus.ts                  # loadCorpus, readFolderMatter, accessors, resolveById
│       ├── markdown/
│       │   ├── ast.ts                 # shared remark processor + helpers
│       │   ├── sections.ts            # find/get/replace/append/remove section + replaceSectionWithTable
│       │   ├── tables.ts              # parseTable/findRow/updateCell/appendRow/removeRow/updateSectionTable
│       │   └── checkboxes.ts          # parseCheckboxes/setCheckboxState/appendCheckbox/replaceCheckboxes
│       ├── schemas/
│       │   ├── index.ts               # barrel
│       │   ├── story.ts               # storySchema + STORY_DEFAULTS + Story type
│       │   ├── epic.ts                # epicSchema + Epic type
│       │   ├── sprint.ts              # sprintSchema + Sprint type
│       │   └── changelog-entry.ts     # changelogEntrySchema + ChangelogEntry type
│       ├── refs.ts                    # validateRefs/listChildrenOf/listReferrersTo
│       ├── changelog.ts               # parseChangelog/formatVersionHeader/findEntryByVersion/updateCommitSha/serializeChangelog
│       └── git.ts                     # isGitRepo/findCommitForVersion/findCommitByTag/listVersionBumps
└── __tests__/
    └── lib/
        ├── _fixtures/                 # shared mini docs/ tree for corpus tests
        │   ├── docs/
        │   │   ├── PRD.md
        │   │   ├── CHANGELOG.md
        │   │   └── sprints/
        │   │       ├── epics/EPIC-1.md
        │   │       ├── stories/US-1.1-foo.md
        │   │       ├── stories/US-1.2-bar.md
        │   │       └── sprint-2026-W01.md
        │   └── build-fixture.ts       # function that writes the fixture to a tmpdir
        ├── doc.test.ts
        ├── corpus.test.ts
        ├── markdown/
        │   ├── sections.test.ts
        │   ├── tables.test.ts
        │   └── checkboxes.test.ts
        ├── schemas.test.ts
        ├── refs.test.ts
        ├── changelog.test.ts
        └── git.test.ts
```

**File ownership rule:** every `.ts` file in `src/lib/` is a pure module that exports named functions/types. No top-level side effects. No `process.exit`. No console logging from lib. Errors are thrown with descriptive messages.

---

## Task 1: Initialize `packages/koni-docs/` package skeleton

**Files:**
- Create: `packages/koni-docs/package.json`
- Create: `packages/koni-docs/tsconfig.json`
- Create: `packages/koni-docs/tsup.config.ts`
- Create: `packages/koni-docs/.gitignore`
- Create: `packages/koni-docs/src/lib/index.ts`
- Create: `packages/koni-docs/__tests__/smoke.test.ts`

- [ ] **Step 1: Create `packages/koni-docs/package.json`**

```json
{
  "name": "@koniverse/koni-docs",
  "version": "0.2.0-dev.0",
  "type": "module",
  "description": "Koni-docs framework CLI + reusable lib for managing structured documentation",
  "license": "MIT",
  "engines": { "node": ">=20.0.0" },
  "exports": {
    ".": { "import": "./dist/cli/index.mjs", "types": "./dist/cli/index.d.ts" },
    "./lib": { "import": "./dist/lib/index.mjs", "types": "./dist/lib/index.d.ts" },
    "./lib/markdown": { "import": "./dist/lib/markdown/index.mjs", "types": "./dist/lib/markdown/index.d.ts" },
    "./lib/schemas": { "import": "./dist/lib/schemas/index.mjs", "types": "./dist/lib/schemas/index.d.ts" }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "test": "node --import tsx --test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.5",
    "tsup": "^8.0.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 2: Create `packages/koni-docs/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "outDir": "./dist",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "__tests__/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/koni-docs/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
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
});
```

- [ ] **Step 4: Create `packages/koni-docs/.gitignore`**

```
node_modules/
dist/
*.tsbuildinfo
.tmp/
```

- [ ] **Step 5: Create `packages/koni-docs/src/lib/index.ts`** (placeholder)

```ts
// Public surface — populated in subsequent tasks.
export const KONI_DOCS_LIB_VERSION = '0.2.0-dev.0';
```

- [ ] **Step 6: Create `packages/koni-docs/__tests__/smoke.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KONI_DOCS_LIB_VERSION } from '../src/lib/index.ts';

test('smoke: lib version exported', () => {
  assert.equal(KONI_DOCS_LIB_VERSION, '0.2.0-dev.0');
});
```

- [ ] **Step 7: Install dev deps and run smoke test**

```bash
cd packages/koni-docs && npm install
npm test
```

Expected output: `ok 1 - smoke: lib version exported` + `# tests 1` + `# pass 1`.

- [ ] **Step 8: Commit**

```bash
git add packages/koni-docs/
git commit -m "feat(koni-docs): scaffold @koniverse/koni-docs package (US-4.5 step)"
```

---

## Task 2: Install runtime dependencies

**Files:**
- Modify: `packages/koni-docs/package.json` (dependencies section)

- [ ] **Step 1: Install lib runtime deps**

```bash
cd packages/koni-docs
npm install gray-matter@^4.0.3 unified@^11.0.4 remark-parse@^11.0.0 remark-stringify@^11.0.0 remark-gfm@^4.0.0 unist-util-visit@^5.0.0 mdast-util-to-string@^4.0.0 zod@^3.22.4
npm install --save-dev @types/mdast@^4.0.3
```

- [ ] **Step 2: Verify package.json**

Expected `dependencies` block:

```json
"dependencies": {
  "gray-matter": "^4.0.3",
  "mdast-util-to-string": "^4.0.0",
  "remark-gfm": "^4.0.0",
  "remark-parse": "^11.0.0",
  "remark-stringify": "^11.0.0",
  "unified": "^11.0.4",
  "unist-util-visit": "^5.0.0",
  "zod": "^3.22.4"
}
```

- [ ] **Step 3: Re-run smoke test to confirm install did not break tooling**

```bash
npm test
```

Expected: `# pass 1`.

- [ ] **Step 4: Commit**

```bash
git add packages/koni-docs/package.json packages/koni-docs/package-lock.json
git commit -m "feat(koni-docs): add runtime deps (gray-matter, unified, remark, zod)"
```

---

## Task 3: Shared types + markdown AST processor

**Files:**
- Create: `packages/koni-docs/src/lib/types.ts`
- Create: `packages/koni-docs/src/lib/markdown/ast.ts`

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
import type { Root } from 'mdast';

export interface Doc {
  /** Absolute or repo-relative path the doc was read from. */
  path: string;
  /** Parsed YAML frontmatter, plain object. */
  frontmatter: Record<string, unknown>;
  /** Markdown body without the frontmatter block. */
  body: string;
  /** mdast root parsed from `body` via remark+remark-gfm. */
  ast: Root;
  /** Original raw file content as read from disk. */
  raw: string;
}

export interface MatterEntry {
  filename: string;
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface Corpus {
  docsPath: string;
  stories: MatterEntry[];
  epics: MatterEntry[];
  sprints: MatterEntry[];
  /** Singleton docs: PRD, ARCHITECTURE, CHANGELOG, CONTEXT, LESSONS, BRIEF, SETUP. Keyed by base filename without extension, lowercase. */
  singletons: Record<string, MatterEntry | null>;
}
```

- [ ] **Step 2: Write `src/lib/markdown/ast.ts`**

```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';

/** Shared parser: GFM-enabled (tables, task lists). Pure read. */
export function createParser() {
  return unified().use(remarkParse).use(remarkGfm);
}

/** Shared stringifier: GFM + stable bullet/emphasis output. */
export function createStringifier() {
  return unified()
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '*',
      strong: '*',
      fence: '`',
      fences: true,
      listItemIndent: 'one',
      rule: '-',
    })
    .use(remarkGfm);
}

export function parseMarkdown(body: string): Root {
  return createParser().parse(body) as Root;
}

export function stringifyMarkdown(ast: Root): string {
  return String(createStringifier().stringify(ast));
}
```

- [ ] **Step 3: Smoke test the parser round-trips a trivial doc**

Create `packages/koni-docs/__tests__/lib/markdown/ast.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, stringifyMarkdown } from '../../../src/lib/markdown/ast.ts';

test('ast: parses and stringifies a trivial doc', () => {
  const md = '# Hello\n\nWorld.\n';
  const ast = parseMarkdown(md);
  assert.equal(ast.type, 'root');
  assert.equal(ast.children[0]?.type, 'heading');
});

test('ast: round-trip preserves table structure', () => {
  const md = '| A | B |\n| - | - |\n| 1 | 2 |\n';
  const ast = parseMarkdown(md);
  const out = stringifyMarkdown(ast);
  assert.match(out, /\| A \| B \|/);
  assert.match(out, /\| 1 \| 2 \|/);
});
```

- [ ] **Step 4: Run the new tests**

```bash
npm test
```

Expected: 3 passes (smoke + 2 ast).

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/types.ts packages/koni-docs/src/lib/markdown/ast.ts packages/koni-docs/__tests__/lib/markdown/ast.test.ts
git commit -m "feat(koni-docs/lib): add shared types and remark AST processor (US-4.5)"
```

---

## Task 4: `lib/doc.ts` — readDoc / parseDoc / serializeDoc

**Files:**
- Create: `packages/koni-docs/src/lib/doc.ts`
- Create: `packages/koni-docs/__tests__/lib/doc.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/lib/doc.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readDoc, parseDoc, serializeDoc } from '../../src/lib/doc.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-doc-'));
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('readDoc: reads frontmatter + body', () => {
  const p = join(root, 'a.md');
  writeFileSync(p, '---\nid: US-1.1\nstatus: done\n---\n\n# Hello\n');
  const doc = readDoc(p);
  assert.equal(doc.frontmatter.id, 'US-1.1');
  assert.equal(doc.frontmatter.status, 'done');
  assert.match(doc.body, /# Hello/);
  assert.equal(doc.ast.type, 'root');
});

test('parseDoc: pure parse of raw string', () => {
  const raw = '---\nid: US-2.1\n---\n\nbody text\n';
  const doc = parseDoc(raw, '/virtual/path.md');
  assert.equal(doc.frontmatter.id, 'US-2.1');
  assert.equal(doc.path, '/virtual/path.md');
});

test('serializeDoc: round-trip preserves content when AST untouched', () => {
  const raw = '---\nid: US-3.1\ntitle: "T"\n---\n\n# Heading\n\nParagraph.\n';
  const doc = parseDoc(raw, '/x.md');
  const out = serializeDoc(doc);
  assert.match(out, /^---\n/);
  assert.match(out, /id: US-3.1/);
  assert.match(out, /# Heading/);
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test
```

Expected: module-not-found error on `src/lib/doc.ts`.

- [ ] **Step 3: Implement `src/lib/doc.ts`**

```ts
import { readFileSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { parseMarkdown, stringifyMarkdown } from './markdown/ast.ts';
import type { Doc } from './types.ts';

export function readDoc(path: string): Doc {
  const raw = readFileSync(path, 'utf-8');
  return parseDoc(raw, path);
}

export function parseDoc(raw: string, path: string): Doc {
  const parsed = matter(raw);
  const body = parsed.content;
  return {
    path,
    frontmatter: { ...parsed.data },
    body,
    ast: parseMarkdown(body),
    raw,
  };
}

export function serializeDoc(doc: Doc): string {
  // Re-stringify AST → body to capture any AST edits.
  const newBody = stringifyMarkdown(doc.ast);
  // gray-matter.stringify handles the frontmatter block.
  return matter.stringify(newBody, doc.frontmatter);
}

export function writeDoc(path: string, doc: Doc): void {
  writeFileSync(path, serializeDoc(doc), 'utf-8');
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test
```

Expected: 3 doc tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/doc.ts packages/koni-docs/__tests__/lib/doc.test.ts
git commit -m "feat(koni-docs/lib): doc.ts readDoc/parseDoc/serializeDoc (US-4.5)"
```

---

## Task 5: `lib/doc.ts` — updateFrontmatter + writeDoc integration test

**Files:**
- Modify: `packages/koni-docs/src/lib/doc.ts`
- Modify: `packages/koni-docs/__tests__/lib/doc.test.ts`

- [ ] **Step 1: Add failing tests for updateFrontmatter + writeDoc**

Append to `__tests__/lib/doc.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { updateFrontmatter, writeDoc } from '../../src/lib/doc.ts';

test('updateFrontmatter: merges and preserves existing keys', () => {
  const doc = parseDoc('---\nid: US-1.1\nstatus: backlog\n---\n\nbody\n', '/x.md');
  const next = updateFrontmatter(doc, { status: 'done', version_shipped: 'v0.1.0' });
  assert.equal(next.frontmatter.id, 'US-1.1');
  assert.equal(next.frontmatter.status, 'done');
  assert.equal(next.frontmatter.version_shipped, 'v0.1.0');
});

test('writeDoc: writes serialized doc to disk', () => {
  const p = join(root, 'wd.md');
  const doc = parseDoc('---\nid: US-1.2\n---\n\n# Hi\n', p);
  const next = updateFrontmatter(doc, { status: 'done' });
  writeDoc(p, next);
  const onDisk = readFileSync(p, 'utf-8');
  assert.match(onDisk, /id: US-1\.2/);
  assert.match(onDisk, /status: done/);
  assert.match(onDisk, /# Hi/);
});
```

- [ ] **Step 2: Run — expect failure**

`npm test` → reports `updateFrontmatter` not exported.

- [ ] **Step 3: Implement updateFrontmatter**

Append to `src/lib/doc.ts`:

```ts
export function updateFrontmatter(doc: Doc, partial: Record<string, unknown>): Doc {
  return { ...doc, frontmatter: { ...doc.frontmatter, ...partial } };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test
```

Expected: 5 doc tests pass total.

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/doc.ts packages/koni-docs/__tests__/lib/doc.test.ts
git commit -m "feat(koni-docs/lib): updateFrontmatter + writeDoc (US-4.5)"
```

---

## Task 6: `lib/corpus.ts` — readFolderMatter

**Files:**
- Create: `packages/koni-docs/src/lib/corpus.ts`
- Create: `packages/koni-docs/__tests__/lib/_fixtures/build-fixture.ts`
- Create: `packages/koni-docs/__tests__/lib/corpus.test.ts`

- [ ] **Step 1: Write the fixture builder**

```ts
// __tests__/lib/_fixtures/build-fixture.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function buildFixture(root: string): string {
  const docs = join(root, 'docs');
  mkdirSync(join(docs, 'sprints', 'stories'), { recursive: true });
  mkdirSync(join(docs, 'sprints', 'epics'), { recursive: true });

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
---

## Goal

Foo.

## Acceptance criteria

- [x] AC-1: First criterion
- [x] AC-2: Second criterion
`);

  writeFileSync(join(docs, 'sprints', 'stories', 'US-1.2-bar.md'), `---
id: US-1.2
title: "Bar"
epic: EPIC-1
status: in-progress
priority: P1
points: 3
sprint: sprint-2026-W01
prd_ref: FR-2
---

## Goal

Bar.

## Acceptance criteria

- [ ] AC-1: Pending criterion
`);

  // Helpful: a non-story file in stories/ that should be skipped
  writeFileSync(join(docs, 'sprints', 'stories', 'README.md'), `# Stories\n`);

  writeFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), `---
id: EPIC-1
title: "Epic 1"
status: in-progress
prd_ref: FR-1, FR-2
---

## Goal

Epic 1 goal.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-1.1](../stories/US-1.1-foo.md) | Foo | foo goal | 📋 backlog | — |
| [US-1.2](../stories/US-1.2-bar.md) | Bar | bar goal | 📋 backlog | — |
`);

  writeFileSync(join(docs, 'sprints', 'sprint-2026-W01.md'), `---
id: sprint-2026-W01
status: in-progress
start: 2026-01-01
end: 2026-01-07
goal: "Ship foo + bar"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-1.1 | Foo | EPIC-1 | P0 | 5 | 📋 backlog | new | [link](stories/US-1.1-foo.md) |
| US-1.2 | Bar | EPIC-1 | P1 | 3 | 🚧 in-progress | new | [link](stories/US-1.2-bar.md) |
`);

  writeFileSync(join(docs, 'PRD.md'), `# PRD

## 8. Functional requirements

| ID | Requirement | Priority | Status | Epic |
|---|---|---|---|---|
| FR-1 | Foo support | P0 | 📋 Backlog | EPIC-1 |
| FR-2 | Bar support | P1 | 📋 Backlog | EPIC-1 |

## 11. Epics & User Stories

### EPIC-1 — Epic 1
| Story | Title | Status | Version |
|---|---|---|---|
| US-1.1 | Foo | 📋 Backlog | — |
| US-1.2 | Bar | 📋 Backlog | — |
`);

  writeFileSync(join(docs, 'CHANGELOG.md'), `# Changelog

## [Unreleased]

(empty)

## [0.1.0] — 2026-01-05 — Initial release — v0.1.0

Shipped foo and bar.

### Added
- Foo
- Bar

**Commit**: pending
`);

  return docs;
}
```

- [ ] **Step 2: Write the failing readFolderMatter test**

```ts
// __tests__/lib/corpus.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from './_fixtures/build-fixture.ts';
import { readFolderMatter } from '../../src/lib/corpus.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-corpus-'));
const docs = buildFixture(root);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('readFolderMatter: reads all .md, returns matter entries', () => {
  const entries = readFolderMatter(join(docs, 'sprints', 'stories'));
  assert.equal(entries.length, 3); // US-1.1, US-1.2, README.md
  const ids = entries.map(e => e.frontmatter.id);
  assert.ok(ids.includes('US-1.1'));
  assert.ok(ids.includes('US-1.2'));
});
```

- [ ] **Step 3: Run — expect failure**

`npm test` → `readFolderMatter` not exported.

- [ ] **Step 4: Implement `src/lib/corpus.ts` (readFolderMatter only for now)**

```ts
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import type { Corpus, MatterEntry } from './types.ts';

export function readFolderMatter(dir: string, opts: { recursive?: boolean } = {}): MatterEntry[] {
  if (!existsSync(dir)) return [];
  const out: MatterEntry[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name.endsWith('.md')) {
      const raw = readFileSync(full, 'utf-8');
      const parsed = matter(raw);
      out.push({
        filename: name,
        path: full,
        frontmatter: { ...parsed.data },
        body: parsed.content,
      });
    }
    // recursive walk omitted — current koni-docs layout is flat per dir
  }
  return out;
}
```

- [ ] **Step 5: Run — expect pass**

```bash
npm test
```

- [ ] **Step 6: Commit**

```bash
git add packages/koni-docs/src/lib/corpus.ts packages/koni-docs/__tests__/lib/_fixtures/build-fixture.ts packages/koni-docs/__tests__/lib/corpus.test.ts
git commit -m "feat(koni-docs/lib): corpus.readFolderMatter + test fixture (US-4.5)"
```

---

## Task 7: `lib/corpus.ts` — loadCorpus + typed accessors + resolveById

**Files:**
- Modify: `packages/koni-docs/src/lib/corpus.ts`
- Modify: `packages/koni-docs/__tests__/lib/corpus.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `__tests__/lib/corpus.test.ts`:

```ts
import { loadCorpus, getStories, getEpics, getSprints, resolveById } from '../../src/lib/corpus.ts';

test('loadCorpus: populates stories, epics, sprints, singletons', () => {
  const c = loadCorpus(docs);
  assert.equal(c.stories.filter(s => s.frontmatter.id).length, 2);
  assert.equal(c.epics.length, 1);
  assert.equal(c.sprints.length, 1);
  assert.ok(c.singletons.prd);
  assert.ok(c.singletons.changelog);
});

test('getStories filters non-story files (no id)', () => {
  const c = loadCorpus(docs);
  const stories = getStories(c);
  assert.equal(stories.length, 2);
  assert.ok(stories.every(s => typeof s.frontmatter.id === 'string'));
});

test('resolveById resolves US-/EPIC-/sprint- prefixes', () => {
  const c = loadCorpus(docs);
  assert.equal(resolveById(c, 'US-1.1')?.frontmatter.id, 'US-1.1');
  assert.equal(resolveById(c, 'EPIC-1')?.frontmatter.id, 'EPIC-1');
  assert.equal(resolveById(c, 'sprint-2026-W01')?.frontmatter.id, 'sprint-2026-W01');
  assert.equal(resolveById(c, 'US-9.9'), null);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement loadCorpus + accessors + resolveById**

Replace the contents of `src/lib/corpus.ts`:

```ts
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import type { Corpus, MatterEntry } from './types.ts';

export function readFolderMatter(dir: string, opts: { recursive?: boolean } = {}): MatterEntry[] {
  if (!existsSync(dir)) return [];
  const out: MatterEntry[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name.endsWith('.md')) {
      const raw = readFileSync(full, 'utf-8');
      const parsed = matter(raw);
      out.push({
        filename: name,
        path: full,
        frontmatter: { ...parsed.data },
        body: parsed.content,
      });
    }
  }
  return out;
}

function readSingleton(path: string): MatterEntry | null {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf-8');
  const parsed = matter(raw);
  return {
    filename: basename(path),
    path,
    frontmatter: { ...parsed.data },
    body: parsed.content,
  };
}

const SINGLETON_NAMES = ['PRD', 'ARCHITECTURE', 'CHANGELOG', 'CONTEXT', 'LESSONS', 'BRIEF', 'SETUP'];

export function loadCorpus(docsPath: string): Corpus {
  const stories = readFolderMatter(join(docsPath, 'sprints', 'stories'));
  const epics = readFolderMatter(join(docsPath, 'sprints', 'epics'));
  const sprintsDir = join(docsPath, 'sprints');
  const sprints = existsSync(sprintsDir)
    ? readdirSync(sprintsDir)
        .filter(n => n.startsWith('sprint-') && n.endsWith('.md'))
        .map(n => {
          const full = join(sprintsDir, n);
          const raw = readFileSync(full, 'utf-8');
          const parsed = matter(raw);
          return {
            filename: n,
            path: full,
            frontmatter: { ...parsed.data },
            body: parsed.content,
          };
        })
    : [];

  const singletons: Record<string, MatterEntry | null> = {};
  for (const name of SINGLETON_NAMES) {
    singletons[name.toLowerCase()] = readSingleton(join(docsPath, `${name}.md`));
  }

  return { docsPath, stories, epics, sprints, singletons };
}

export function getStories(corpus: Corpus): MatterEntry[] {
  return corpus.stories.filter(s => typeof s.frontmatter.id === 'string');
}

export function getEpics(corpus: Corpus): MatterEntry[] {
  return corpus.epics.filter(e => typeof e.frontmatter.id === 'string');
}

export function getSprints(corpus: Corpus): MatterEntry[] {
  return corpus.sprints.filter(s => typeof s.frontmatter.id === 'string');
}

export function getActiveSprint(corpus: Corpus): MatterEntry | null {
  return getSprints(corpus).find(s => s.frontmatter.status === 'in-progress') ?? null;
}

export function resolveById(corpus: Corpus, id: string): MatterEntry | null {
  if (id.startsWith('US-')) return getStories(corpus).find(s => s.frontmatter.id === id) ?? null;
  if (id.startsWith('EPIC-')) return getEpics(corpus).find(e => e.frontmatter.id === id) ?? null;
  if (id.startsWith('sprint-')) return getSprints(corpus).find(s => s.frontmatter.id === id) ?? null;
  return null;
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/corpus.ts packages/koni-docs/__tests__/lib/corpus.test.ts
git commit -m "feat(koni-docs/lib): loadCorpus + accessors + resolveById (US-4.5)"
```

---

## Task 8: Export public surface from `lib/index.ts`

**Files:**
- Modify: `packages/koni-docs/src/lib/index.ts`

- [ ] **Step 1: Replace placeholder with real exports**

```ts
export const KONI_DOCS_LIB_VERSION = '0.2.0-dev.0';

export type { Doc, MatterEntry, Corpus } from './types.ts';

export { readDoc, parseDoc, serializeDoc, writeDoc, updateFrontmatter } from './doc.ts';

export {
  readFolderMatter,
  loadCorpus,
  getStories,
  getEpics,
  getSprints,
  getActiveSprint,
  resolveById,
} from './corpus.ts';
```

- [ ] **Step 2: Run tests + typecheck**

```bash
npm test && npm run typecheck
```

Expected: all tests pass + tsc reports zero errors.

- [ ] **Step 3: Commit**

```bash
git add packages/koni-docs/src/lib/index.ts
git commit -m "feat(koni-docs/lib): public exports for US-4.5 surface"
```

---

## Task 9: `lib/markdown/sections.ts` — findSection + getSectionText

**Files:**
- Create: `packages/koni-docs/src/lib/markdown/sections.ts`
- Create: `packages/koni-docs/__tests__/lib/markdown/sections.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/markdown/sections.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc } from '../../../src/lib/doc.ts';
import { findSection, getSectionText } from '../../../src/lib/markdown/sections.ts';

const md = `---
id: US-1.1
---

## Goal

The goal paragraph.

## Acceptance criteria

- [ ] AC-1: First
- [ ] AC-2: Second

## Tasks

Placeholder.
`;

test('findSection: returns the section node by heading text', () => {
  const doc = parseDoc(md, '/x.md');
  const sec = findSection(doc, 'Goal');
  assert.ok(sec);
  assert.equal(sec!.heading.type, 'heading');
});

test('findSection: returns null for missing heading', () => {
  const doc = parseDoc(md, '/x.md');
  assert.equal(findSection(doc, 'Nope'), null);
});

test('getSectionText: returns the markdown of the section body', () => {
  const doc = parseDoc(md, '/x.md');
  const text = getSectionText(doc, 'Goal');
  assert.match(text, /The goal paragraph\./);
  assert.doesNotMatch(text, /Acceptance criteria/);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement findSection + getSectionText**

Create `src/lib/markdown/sections.ts`:

```ts
import type { Root, Heading, Content } from 'mdast';
import { toString as nodeToString } from 'mdast-util-to-string';
import { stringifyMarkdown } from './ast.ts';
import type { Doc } from '../types.ts';

export interface SectionMatch {
  heading: Heading;
  /** Index of the heading node in root.children. */
  headingIndex: number;
  /** Slice of root.children that belongs to this section (excluding the heading). */
  body: Content[];
  /** Index in root.children where the section ends (exclusive). */
  endIndex: number;
}

function findSectionNodes(ast: Root, heading: string, level?: number): SectionMatch | null {
  for (let i = 0; i < ast.children.length; i++) {
    const node = ast.children[i];
    if (node?.type !== 'heading') continue;
    if (level !== undefined && node.depth !== level) continue;
    if (nodeToString(node) !== heading) continue;
    const startDepth = node.depth;
    let end = ast.children.length;
    for (let j = i + 1; j < ast.children.length; j++) {
      const next = ast.children[j];
      if (next?.type === 'heading' && next.depth <= startDepth) {
        end = j;
        break;
      }
    }
    return {
      heading: node,
      headingIndex: i,
      body: ast.children.slice(i + 1, end) as Content[],
      endIndex: end,
    };
  }
  return null;
}

export function findSection(doc: Doc, heading: string, level?: number): SectionMatch | null {
  return findSectionNodes(doc.ast, heading, level);
}

export function getSectionText(doc: Doc, heading: string): string {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return '';
  const partialAst: Root = { type: 'root', children: match.body as any };
  return stringifyMarkdown(partialAst);
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/markdown/sections.ts packages/koni-docs/__tests__/lib/markdown/sections.test.ts
git commit -m "feat(koni-docs/lib): sections.findSection + getSectionText (US-4.6)"
```

---

## Task 10: `lib/markdown/sections.ts` — replaceSection + appendToSection + removeSection

**Files:**
- Modify: `packages/koni-docs/src/lib/markdown/sections.ts`
- Modify: `packages/koni-docs/__tests__/lib/markdown/sections.test.ts`

- [ ] **Step 1: Add failing tests**

Append:

```ts
import { replaceSection, appendToSection, removeSection } from '../../../src/lib/markdown/sections.ts';
import { serializeDoc } from '../../../src/lib/doc.ts';

test('replaceSection: replaces section body, preserves heading', () => {
  const doc = parseDoc(md, '/x.md');
  const next = replaceSection(doc, 'Goal', 'Replaced.\n');
  const out = serializeDoc(next);
  assert.match(out, /## Goal\n\nReplaced\./);
  assert.doesNotMatch(out, /The goal paragraph\./);
});

test('appendToSection: appends to existing section content', () => {
  const doc = parseDoc(md, '/x.md');
  const next = appendToSection(doc, 'Goal', '\nAdditional sentence.\n');
  const out = serializeDoc(next);
  assert.match(out, /The goal paragraph\./);
  assert.match(out, /Additional sentence\./);
});

test('removeSection: removes heading and body', () => {
  const doc = parseDoc(md, '/x.md');
  const next = removeSection(doc, 'Tasks');
  const out = serializeDoc(next);
  assert.doesNotMatch(out, /## Tasks/);
  assert.match(out, /Acceptance criteria/);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement section mutators**

Append to `src/lib/markdown/sections.ts`:

```ts
import { parseMarkdown } from './ast.ts';

export function replaceSection(doc: Doc, heading: string, newContent: string): Doc {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return doc;
  const newAst = parseMarkdown(newContent);
  const next: Root = {
    type: 'root',
    children: [
      ...doc.ast.children.slice(0, match.headingIndex + 1),
      ...(newAst.children as Content[]),
      ...doc.ast.children.slice(match.endIndex),
    ] as any,
  };
  return { ...doc, ast: next };
}

export function appendToSection(doc: Doc, heading: string, content: string): Doc {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return doc;
  const newAst = parseMarkdown(content);
  const next: Root = {
    type: 'root',
    children: [
      ...doc.ast.children.slice(0, match.endIndex),
      ...(newAst.children as Content[]),
      ...doc.ast.children.slice(match.endIndex),
    ] as any,
  };
  return { ...doc, ast: next };
}

export function removeSection(doc: Doc, heading: string): Doc {
  const match = findSectionNodes(doc.ast, heading);
  if (!match) return doc;
  const next: Root = {
    type: 'root',
    children: [
      ...doc.ast.children.slice(0, match.headingIndex),
      ...doc.ast.children.slice(match.endIndex),
    ] as any,
  };
  return { ...doc, ast: next };
}

export function replaceSectionWithTable(doc: Doc, heading: string, tableMarkdown: string): Doc {
  // Convenience wrapper — tableMarkdown is a valid GFM table source.
  return replaceSection(doc, heading, tableMarkdown);
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/markdown/sections.ts packages/koni-docs/__tests__/lib/markdown/sections.test.ts
git commit -m "feat(koni-docs/lib): replaceSection/appendToSection/removeSection/replaceSectionWithTable (US-4.6)"
```

---

## Task 11: `lib/markdown/tables.ts` — parse + findRow + updateCell (column-by-NAME)

**Files:**
- Create: `packages/koni-docs/src/lib/markdown/tables.ts`
- Create: `packages/koni-docs/__tests__/lib/markdown/tables.test.ts`

- [ ] **Step 1: Write failing tests covering the W23 Carry-column scenario**

```ts
// __tests__/lib/markdown/tables.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc, serializeDoc } from '../../../src/lib/doc.ts';
import { findTable, parseTable, findRow, updateCell } from '../../../src/lib/markdown/tables.ts';

const sprintMd = `---
id: sprint-2026-W23
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-4.1 | Foo | EPIC-4 | P0 | 5 | 🟢 ready | new | [link](stories/US-4.1.md) |
| US-4.2 | Bar | EPIC-4 | P0 | 5 | 🟢 ready | new | [link](stories/US-4.2.md) |
`;

test('findTable: finds the GFM table inside the section', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const tbl = findTable(doc, { inSection: 'Sprint scope' });
  assert.ok(tbl);
});

test('parseTable: returns headers + rows as cell text', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const tbl = findTable(doc, { inSection: 'Sprint scope' })!;
  const parsed = parseTable(tbl);
  assert.deepEqual(parsed.headers, ['US', 'Title', 'Epic', 'Pri', 'Points', 'Status', 'Carry', 'Story file']);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0]?.[0], 'US-4.1');
});

test('findRow: matches by column NAME, not position', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const tbl = findTable(doc, { inSection: 'Sprint scope' })!;
  const parsed = parseTable(tbl);
  assert.equal(findRow(parsed, { column: 'US', value: 'US-4.2' }), 1);
  assert.equal(findRow(parsed, { column: 'US', value: 'US-9.9' }), -1);
});

test('updateCell: writes by column NAME — Status, not Carry (W23 BLOCKER fix)', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const next = updateCell(doc, {
    tableLocator: { inSection: 'Sprint scope' },
    rowMatcher: { column: 'US', value: 'US-4.1' },
    column: 'Status',
    value: '✅ done',
  });
  const out = serializeDoc(next);
  assert.match(out, /US-4\.1 \| Foo \| EPIC-4 \| P0 \| 5 \| ✅ done \| new \|/);
  // Carry stays "new", NOT overwritten:
  assert.match(out, /✅ done \| new \|/);
});

test('updateCell: throws when column name not in header', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  assert.throws(
    () => updateCell(doc, {
      tableLocator: { inSection: 'Sprint scope' },
      rowMatcher: { column: 'US', value: 'US-4.1' },
      column: 'NoSuchColumn',
      value: 'x',
    }),
    /column "NoSuchColumn" not found/,
  );
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `src/lib/markdown/tables.ts`**

```ts
import type { Root, Table, TableRow, TableCell, Content } from 'mdast';
import { toString as nodeToString } from 'mdast-util-to-string';
import { findSection } from './sections.ts';
import type { Doc } from '../types.ts';

export interface TableLocator {
  inSection?: string;
  afterHeading?: string;
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
  /** Reference to the mdast Table node — mutations on `node` mutate `doc.ast`. */
  node: Table;
}

export interface RowMatcher {
  column: string;
  value: string | RegExp;
}

export function findTable(doc: Doc, opts: TableLocator): Table | null {
  let searchSpace: Content[] = doc.ast.children as Content[];
  if (opts.inSection) {
    const sec = findSection(doc, opts.inSection);
    if (!sec) return null;
    searchSpace = sec.body;
  }
  for (const node of searchSpace) {
    if (node.type === 'table') return node;
  }
  return null;
}

function cellText(cell: TableCell): string {
  return nodeToString(cell).trim();
}

export function parseTable(node: Table): ParsedTable {
  const [headerRow, ...dataRows] = node.children;
  const headers = (headerRow?.children ?? []).map(cellText);
  const rows = dataRows.map(r => r.children.map(cellText));
  return { headers, rows, node };
}

export function findRow(table: ParsedTable, matcher: RowMatcher): number {
  const colIdx = table.headers.indexOf(matcher.column);
  if (colIdx === -1) return -1;
  for (let i = 0; i < table.rows.length; i++) {
    const cell = table.rows[i]?.[colIdx] ?? '';
    if (matcher.value instanceof RegExp) {
      if (matcher.value.test(cell)) return i;
    } else if (cell === matcher.value || cell.includes(matcher.value)) {
      return i;
    }
  }
  return -1;
}

function buildTextCell(value: string): TableCell {
  return {
    type: 'tableCell',
    children: [{ type: 'text', value }],
  };
}

export interface UpdateCellOpts {
  tableLocator: TableLocator;
  rowMatcher: RowMatcher;
  column: string;
  value: string;
}

export function updateCell(doc: Doc, opts: UpdateCellOpts): Doc {
  const node = findTable(doc, opts.tableLocator);
  if (!node) throw new Error(`table not found in ${opts.tableLocator.inSection ?? 'doc root'}`);
  const parsed = parseTable(node);
  const colIdx = parsed.headers.indexOf(opts.column);
  if (colIdx === -1) {
    throw new Error(
      `column "${opts.column}" not found in table header [${parsed.headers.join(', ')}]`,
    );
  }
  const rowIdx = findRow(parsed, opts.rowMatcher);
  if (rowIdx === -1) {
    throw new Error(
      `row with ${opts.rowMatcher.column}="${String(opts.rowMatcher.value)}" not found`,
    );
  }
  // node.children: index 0 is header, data rows start at index 1
  const dataRow = node.children[rowIdx + 1] as TableRow;
  dataRow.children[colIdx] = buildTextCell(opts.value);
  return doc;
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test
```

Expected: 5 tables tests pass, including the W23 BLOCKER regression check.

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/markdown/tables.ts packages/koni-docs/__tests__/lib/markdown/tables.test.ts
git commit -m "feat(koni-docs/lib): tables.findTable/parseTable/findRow/updateCell — column by NAME, fixes W23 BLOCKER (US-4.6)"
```

---

## Task 12: `lib/markdown/tables.ts` — appendRow + removeRow + updateSectionTable

**Files:**
- Modify: `packages/koni-docs/src/lib/markdown/tables.ts`
- Modify: `packages/koni-docs/__tests__/lib/markdown/tables.test.ts`

- [ ] **Step 1: Add failing tests**

Append:

```ts
import { appendRow, removeRow, updateSectionTable } from '../../../src/lib/markdown/tables.ts';

test('appendRow: appends row by column-name map', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const next = appendRow(doc, {
    tableLocator: { inSection: 'Sprint scope' },
    row: { US: 'US-4.3', Title: 'Baz', Epic: 'EPIC-4', Pri: 'P1', Points: '3', Status: '🟢 ready', Carry: 'new', 'Story file': '[link](stories/US-4.3.md)' },
  });
  const out = serializeDoc(next);
  assert.match(out, /\| US-4\.3 \| Baz \|/);
});

test('removeRow: removes matched row', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const next = removeRow(doc, {
    tableLocator: { inSection: 'Sprint scope' },
    rowMatcher: { column: 'US', value: 'US-4.2' },
  });
  const out = serializeDoc(next);
  assert.doesNotMatch(out, /US-4\.2/);
  assert.match(out, /US-4\.1/);
});

test('updateSectionTable: batches multiple cell updates', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const next = updateSectionTable(doc, 'Sprint scope', [
    { rowMatcher: { column: 'US', value: 'US-4.1' }, column: 'Status', value: '✅ done' },
    { rowMatcher: { column: 'US', value: 'US-4.2' }, column: 'Status', value: '🚧 in-progress' },
  ]);
  const out = serializeDoc(next);
  assert.match(out, /US-4\.1 \| Foo \| EPIC-4 \| P0 \| 5 \| ✅ done/);
  assert.match(out, /US-4\.2 \| Bar \| EPIC-4 \| P0 \| 5 \| 🚧 in-progress/);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement appendRow / removeRow / updateSectionTable**

Append to `src/lib/markdown/tables.ts`:

```ts
export interface AppendRowOpts {
  tableLocator: TableLocator;
  row: Record<string, string>;
}

export function appendRow(doc: Doc, opts: AppendRowOpts): Doc {
  const node = findTable(doc, opts.tableLocator);
  if (!node) throw new Error(`table not found`);
  const parsed = parseTable(node);
  const cells: TableCell[] = parsed.headers.map(h => buildTextCell(opts.row[h] ?? ''));
  node.children.push({ type: 'tableRow', children: cells });
  return doc;
}

export interface RemoveRowOpts {
  tableLocator: TableLocator;
  rowMatcher: RowMatcher;
}

export function removeRow(doc: Doc, opts: RemoveRowOpts): Doc {
  const node = findTable(doc, opts.tableLocator);
  if (!node) throw new Error(`table not found`);
  const parsed = parseTable(node);
  const rowIdx = findRow(parsed, opts.rowMatcher);
  if (rowIdx === -1) return doc;
  // Data rows start at children[1]
  node.children.splice(rowIdx + 1, 1);
  return doc;
}

export interface TableUpdate {
  rowMatcher: RowMatcher;
  column: string;
  value: string;
}

export function updateSectionTable(doc: Doc, sectionHeading: string, updates: TableUpdate[]): Doc {
  for (const u of updates) {
    updateCell(doc, {
      tableLocator: { inSection: sectionHeading },
      rowMatcher: u.rowMatcher,
      column: u.column,
      value: u.value,
    });
  }
  return doc;
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/markdown/tables.ts packages/koni-docs/__tests__/lib/markdown/tables.test.ts
git commit -m "feat(koni-docs/lib): tables.appendRow/removeRow/updateSectionTable (US-4.6)"
```

---

## Task 13: `lib/markdown/checkboxes.ts` — parse + state ops

**Files:**
- Create: `packages/koni-docs/src/lib/markdown/checkboxes.ts`
- Create: `packages/koni-docs/__tests__/lib/markdown/checkboxes.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/markdown/checkboxes.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc, serializeDoc } from '../../../src/lib/doc.ts';
import { parseCheckboxes, setCheckboxState, appendCheckbox, replaceCheckboxes } from '../../../src/lib/markdown/checkboxes.ts';

const storyMd = `---
id: US-1.1
---

## Acceptance criteria

- [ ] **AC-1** — Given X, When Y, Then Z
- [x] **AC-2** — Declarative criterion
- [ ] **AC-3** — Edge case
`;

test('parseCheckboxes: extracts id, text, done', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const items = parseCheckboxes(doc, 'Acceptance criteria');
  assert.equal(items.length, 3);
  assert.equal(items[0]?.id, 'AC-1');
  assert.equal(items[1]?.done, true);
  assert.match(items[0]?.text ?? '', /Given X, When Y/);
});

test('setCheckboxState: toggles by AC ID', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const next = setCheckboxState(doc, { heading: 'Acceptance criteria', id: 'AC-1', done: true });
  const out = serializeDoc(next);
  assert.match(out, /- \[x\] \*\*AC-1\*\*/);
});

test('appendCheckbox: appends a new AC', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const next = appendCheckbox(doc, { heading: 'Acceptance criteria', id: 'AC-4', text: 'New criterion' });
  const out = serializeDoc(next);
  assert.match(out, /- \[ \] \*\*AC-4\*\* — New criterion/);
});

test('replaceCheckboxes: regenerates the full list', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const next = replaceCheckboxes(doc, 'Acceptance criteria', [
    { id: 'AC-1', text: 'Rewritten one', done: false },
    { id: 'AC-2', text: 'Rewritten two', done: true },
  ]);
  const out = serializeDoc(next);
  assert.match(out, /- \[ \] \*\*AC-1\*\* — Rewritten one/);
  assert.match(out, /- \[x\] \*\*AC-2\*\* — Rewritten two/);
  assert.doesNotMatch(out, /AC-3/);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `src/lib/markdown/checkboxes.ts`**

```ts
import type { List, ListItem, Paragraph, Text } from 'mdast';
import { toString as nodeToString } from 'mdast-util-to-string';
import { findSection } from './sections.ts';
import type { Doc } from '../types.ts';

export interface CheckboxItem {
  id: string | null;
  text: string;
  done: boolean;
}

const ID_REGEX = /^\s*\*?\*?(AC|TASK)-[\d.]+\*?\*?\s*[—-]\s*(.+)$/;

function extractIdAndText(itemText: string): { id: string | null; text: string } {
  const m = itemText.match(ID_REGEX);
  if (!m) return { id: null, text: itemText.trim() };
  // capture group rebuild — full id is the first capture plus matched dashes
  const idMatch = itemText.match(/(AC|TASK)-[\d.]+/);
  return { id: idMatch?.[0] ?? null, text: (m[2] ?? '').trim() };
}

function findChecklistInSection(doc: Doc, heading: string): { list: List; sectionIndex: number; sectionEnd: number } | null {
  const sec = findSection(doc, heading);
  if (!sec) return null;
  for (let i = 0; i < sec.body.length; i++) {
    const n = sec.body[i];
    if (n?.type === 'list') {
      return { list: n as List, sectionIndex: sec.headingIndex, sectionEnd: sec.endIndex };
    }
  }
  return null;
}

export function parseCheckboxes(doc: Doc, heading: string): CheckboxItem[] {
  const found = findChecklistInSection(doc, heading);
  if (!found) return [];
  return found.list.children.map((li: ListItem) => {
    const raw = nodeToString(li);
    const { id, text } = extractIdAndText(raw);
    return { id, text, done: li.checked === true };
  });
}

function buildItemNode(item: CheckboxItem): ListItem {
  const textValue = item.id ? `**${item.id}** — ${item.text}` : item.text;
  return {
    type: 'listItem',
    checked: item.done,
    spread: false,
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: textValue }],
      } as Paragraph,
    ],
  };
}

export function setCheckboxState(doc: Doc, opts: { heading: string; id: string; done: boolean }): Doc {
  const found = findChecklistInSection(doc, opts.heading);
  if (!found) return doc;
  for (const li of found.list.children) {
    const raw = nodeToString(li);
    if (raw.includes(opts.id)) {
      (li as ListItem).checked = opts.done;
    }
  }
  return doc;
}

export function appendCheckbox(doc: Doc, opts: { heading: string; id: string; text: string }): Doc {
  const found = findChecklistInSection(doc, opts.heading);
  if (!found) return doc;
  found.list.children.push(buildItemNode({ id: opts.id, text: opts.text, done: false }));
  return doc;
}

export function replaceCheckboxes(doc: Doc, heading: string, items: CheckboxItem[]): Doc {
  const found = findChecklistInSection(doc, heading);
  if (!found) return doc;
  found.list.children = items.map(buildItemNode);
  return doc;
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/markdown/checkboxes.ts packages/koni-docs/__tests__/lib/markdown/checkboxes.test.ts
git commit -m "feat(koni-docs/lib): checkboxes parse/set/append/replace by AC-N id (US-4.7)"
```

---

## Task 14: `lib/schemas/story.ts` + barrel

**Files:**
- Create: `packages/koni-docs/src/lib/schemas/story.ts`
- Create: `packages/koni-docs/src/lib/schemas/index.ts`
- Create: `packages/koni-docs/__tests__/lib/schemas.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/schemas.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storySchema, validateStory, STORY_DEFAULTS } from '../../src/lib/schemas/story.ts';

test('storySchema: accepts a full valid story', () => {
  const data = {
    id: 'US-1.1', title: 'Foo', epic: 'EPIC-1', status: 'done',
    priority: 'P0', points: 5, sprint: 'sprint-2026-W01',
    version_shipped: '0.1.0', prd_ref: 'FR-1', created: '2026-01-01', updated: '2026-01-05',
  };
  const r = validateStory(data);
  assert.equal(r.ok, true);
});

test('storySchema: rejects bad id format', () => {
  const r = validateStory({ id: 'us1', title: 'x', epic: 'EPIC-1', status: 'backlog' });
  assert.equal(r.ok, false);
});

test('STORY_DEFAULTS: has every field listed', () => {
  assert.equal(STORY_DEFAULTS.status, 'backlog');
  assert.equal(STORY_DEFAULTS.priority, 'P2');
  assert.equal(STORY_DEFAULTS.points, '');
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `src/lib/schemas/story.ts`**

```ts
import { z } from 'zod';

export const storySchema = z.object({
  id: z.string().regex(/^US-\d+\.\d+$/),
  title: z.string(),
  epic: z.string().regex(/^EPIC-\d+$/),
  status: z.enum(['backlog', 'ready', 'in-progress', 'review', 'done', 'blocked', 'deprecated']),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  points: z.union([
    z.literal(''), z.literal(1), z.literal(2), z.literal(3),
    z.literal(5), z.literal(8), z.literal(13),
  ]).optional(),
  sprint: z.union([z.string().regex(/^sprint-\d{4}-W\d{2}$/), z.literal('')]).optional(),
  version_shipped: z.union([z.string().regex(/^v?\d+\.\d+\.\d+$/), z.literal('')]).optional(),
  prd_ref: z.union([z.string(), z.array(z.string())]).optional(),
  assignee: z.string().optional(),
  commit: z.string().optional(),
  created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type Story = z.infer<typeof storySchema>;

export const STORY_DEFAULTS: Record<string, unknown> = {
  status: 'backlog',
  priority: 'P2',
  points: '',
  sprint: '',
  version_shipped: '',
  prd_ref: '',
  assignee: '',
  commit: '',
  created: '',
  updated: '',
};

export type ValidateResult<T> = { ok: true; data: T } | { ok: false; errors: z.ZodError };

export function validateStory(data: unknown): ValidateResult<Story> {
  const r = storySchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
```

- [ ] **Step 4: Implement barrel `src/lib/schemas/index.ts`**

```ts
export * from './story.ts';
```

- [ ] **Step 5: Run — expect pass**

- [ ] **Step 6: Commit**

```bash
git add packages/koni-docs/src/lib/schemas/
git add packages/koni-docs/__tests__/lib/schemas.test.ts
git commit -m "feat(koni-docs/lib): schemas/story.ts with Zod + STORY_DEFAULTS (US-4.7)"
```

---

## Task 15: `lib/schemas/epic.ts` + `sprint.ts` + `changelog-entry.ts`

**Files:**
- Create: `packages/koni-docs/src/lib/schemas/epic.ts`
- Create: `packages/koni-docs/src/lib/schemas/sprint.ts`
- Create: `packages/koni-docs/src/lib/schemas/changelog-entry.ts`
- Modify: `packages/koni-docs/src/lib/schemas/index.ts`
- Modify: `packages/koni-docs/__tests__/lib/schemas.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `schemas.test.ts`:

```ts
import { validateEpic } from '../../src/lib/schemas/epic.ts';
import { validateSprint } from '../../src/lib/schemas/sprint.ts';
import { validateChangelogEntry } from '../../src/lib/schemas/changelog-entry.ts';

test('validateEpic: accepts a minimal valid epic', () => {
  const r = validateEpic({ id: 'EPIC-1', title: 'E', status: 'backlog' });
  assert.equal(r.ok, true);
});

test('validateSprint: accepts a minimal valid sprint', () => {
  const r = validateSprint({
    id: 'sprint-2026-W23', status: 'planned',
    start: '2026-05-27', end: '2026-06-03',
    goal: 'ship epic-4 viewer',
  });
  assert.equal(r.ok, true);
});

test('validateChangelogEntry: accepts entry with full commit SHA', () => {
  const r = validateChangelogEntry({ version: '0.2.0', date: '2026-06-10', title: 'Lib core', commitSha: 'abc1234' });
  assert.equal(r.ok, true);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `epic.ts`**

```ts
// src/lib/schemas/epic.ts
import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const epicSchema = z.object({
  id: z.string().regex(/^EPIC-\d+$/),
  title: z.string(),
  status: z.enum(['backlog', 'in-progress', 'done']),
  prd_ref: z.union([z.string(), z.array(z.string())]).optional(),
  created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type Epic = z.infer<typeof epicSchema>;

export function validateEpic(data: unknown): ValidateResult<Epic> {
  const r = epicSchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
```

- [ ] **Step 4: Implement `sprint.ts`**

```ts
// src/lib/schemas/sprint.ts
import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const sprintSchema = z.object({
  id: z.string().regex(/^sprint-\d{4}-W\d{2}$/),
  status: z.enum(['planned', 'in-progress', 'closed']),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goal: z.string(),
});

export type Sprint = z.infer<typeof sprintSchema>;

export function validateSprint(data: unknown): ValidateResult<Sprint> {
  const r = sprintSchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
```

- [ ] **Step 5: Implement `changelog-entry.ts`**

```ts
// src/lib/schemas/changelog-entry.ts
import { z } from 'zod';
import type { ValidateResult } from './story.ts';

export const changelogEntrySchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
  commitSha: z.string().regex(/^[0-9a-f]{7,40}$/).nullable(),
});

export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;

export function validateChangelogEntry(data: unknown): ValidateResult<ChangelogEntry> {
  const r = changelogEntrySchema.safeParse(data);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: r.error };
}
```

- [ ] **Step 6: Update `src/lib/schemas/index.ts`**

```ts
export * from './story.ts';
export * from './epic.ts';
export * from './sprint.ts';
export * from './changelog-entry.ts';
```

- [ ] **Step 7: Run — expect pass**

- [ ] **Step 8: Commit**

```bash
git add packages/koni-docs/src/lib/schemas/ packages/koni-docs/__tests__/lib/schemas.test.ts
git commit -m "feat(koni-docs/lib): schemas/epic + sprint + changelog-entry (US-4.7)"
```

---

## Task 16: `lib/refs.ts` — listChildrenOf + listReferrersTo

**Files:**
- Create: `packages/koni-docs/src/lib/refs.ts`
- Create: `packages/koni-docs/__tests__/lib/refs.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/refs.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from './_fixtures/build-fixture.ts';
import { loadCorpus } from '../../src/lib/corpus.ts';
import { listChildrenOf, listReferrersTo, validateRefs } from '../../src/lib/refs.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-refs-'));
const docs = buildFixture(root);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('listChildrenOf: stories of an epic', () => {
  const c = loadCorpus(docs);
  const kids = listChildrenOf(c, 'EPIC-1');
  assert.equal(kids.length, 2);
  assert.ok(kids.some(s => s.frontmatter.id === 'US-1.1'));
});

test('listReferrersTo: stories of an FR', () => {
  const c = loadCorpus(docs);
  const refs = listReferrersTo(c, 'FR-1');
  assert.equal(refs.length, 1);
  assert.equal(refs[0]?.frontmatter.id, 'US-1.1');
});

test('validateRefs: clean corpus reports no broken refs', () => {
  const c = loadCorpus(docs);
  const broken = validateRefs(c);
  assert.equal(broken.length, 0);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `src/lib/refs.ts`**

```ts
import type { Corpus, MatterEntry } from './types.ts';
import { getStories, getEpics, getSprints, resolveById } from './corpus.ts';

export type RefKind = 'epic' | 'sprint' | 'prd_ref' | 'sibling';

export interface RefValidationResult {
  source: string;   // file path
  ref: string;
  kind: RefKind;
  error: 'not_found' | 'wrong_type';
}

function refsFromStory(s: MatterEntry): Array<{ ref: string; kind: RefKind }> {
  const out: Array<{ ref: string; kind: RefKind }> = [];
  const fm = s.frontmatter;
  if (typeof fm.epic === 'string') out.push({ ref: fm.epic, kind: 'epic' });
  if (typeof fm.sprint === 'string' && fm.sprint.length > 0) out.push({ ref: fm.sprint, kind: 'sprint' });
  if (typeof fm.prd_ref === 'string' && fm.prd_ref.length > 0) {
    for (const r of fm.prd_ref.split(',').map(x => x.trim()).filter(Boolean)) {
      out.push({ ref: r, kind: 'prd_ref' });
    }
  } else if (Array.isArray(fm.prd_ref)) {
    for (const r of fm.prd_ref) {
      if (typeof r === 'string') out.push({ ref: r, kind: 'prd_ref' });
    }
  }
  return out;
}

export function listChildrenOf(corpus: Corpus, parentId: string): MatterEntry[] {
  if (parentId.startsWith('EPIC-')) {
    return getStories(corpus).filter(s => s.frontmatter.epic === parentId);
  }
  if (parentId.startsWith('sprint-')) {
    return getStories(corpus).filter(s => s.frontmatter.sprint === parentId);
  }
  return [];
}

export function listReferrersTo(corpus: Corpus, id: string): MatterEntry[] {
  const out: MatterEntry[] = [];
  for (const s of getStories(corpus)) {
    const refs = refsFromStory(s);
    if (refs.some(r => r.ref === id)) out.push(s);
  }
  return out;
}

export function validateRefs(corpus: Corpus): RefValidationResult[] {
  const out: RefValidationResult[] = [];
  for (const s of getStories(corpus)) {
    for (const r of refsFromStory(s)) {
      if (r.kind === 'epic') {
        if (!resolveById(corpus, r.ref)) out.push({ source: s.path, ref: r.ref, kind: r.kind, error: 'not_found' });
      } else if (r.kind === 'sprint') {
        if (!resolveById(corpus, r.ref)) out.push({ source: s.path, ref: r.ref, kind: r.kind, error: 'not_found' });
      }
      // FR refs validated against PRD §8 — out of scope for this initial validator (Pillar C may extend)
    }
  }
  return out;
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/refs.ts packages/koni-docs/__tests__/lib/refs.test.ts
git commit -m "feat(koni-docs/lib): refs.listChildrenOf/listReferrersTo/validateRefs (US-4.8)"
```

---

## Task 17: `lib/git.ts` — isGitRepo + execFile wrapper + findCommitForVersion

**Files:**
- Create: `packages/koni-docs/src/lib/git.ts`
- Create: `packages/koni-docs/__tests__/lib/git.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/git.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isGitRepo, findCommitForVersion, findCommitByTag } from '../../src/lib/git.ts';

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), 'koni-docs-git-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@test'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: root });
  writeFileSync(join(root, 'VERSION'), '0.1.0\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'feat: v0.1.0'], { cwd: root });
  writeFileSync(join(root, 'VERSION'), '0.2.0\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'feat: v0.2.0'], { cwd: root });
  execFileSync('git', ['tag', 'v0.2.0'], { cwd: root });
  return root;
}

const repo = makeRepo();
process.on('exit', () => rmSync(repo, { recursive: true, force: true }));
const oldCwd = process.cwd();
process.chdir(repo);
process.on('exit', () => process.chdir(oldCwd));

test('isGitRepo: detects git repo', () => {
  assert.equal(isGitRepo(), true);
});

test('findCommitForVersion: finds the commit that set VERSION=0.2.0', () => {
  const sha = findCommitForVersion('0.2.0');
  assert.ok(sha);
  assert.match(sha!, /^[0-9a-f]{7}$/);
});

test('findCommitByTag: finds tagged commit', () => {
  const sha = findCommitByTag('v0.2.0');
  assert.ok(sha);
  assert.match(sha!, /^[0-9a-f]{7}$/);
});

test('findCommitForVersion: returns null when version not in history', () => {
  assert.equal(findCommitForVersion('9.9.9'), null);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `src/lib/git.ts`**

```ts
import { execFileSync } from 'node:child_process';

function safeExec(args: string[]): string | null {
  try {
    return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export function isGitRepo(): boolean {
  return safeExec(['rev-parse', '--git-dir']) !== null;
}

export function findCommitForVersion(version: string, versionFile = 'VERSION'): string | null {
  // List recent commits that touched VERSION; find the one whose +version is `version`.
  const log = safeExec(['log', '--all', '--diff-filter=AM', '--pretty=%H', '--', versionFile]);
  if (!log) return null;
  for (const fullSha of log.split('\n').filter(Boolean)) {
    const diff = safeExec(['show', fullSha, '--', versionFile]);
    if (diff && diff.includes(`+${version}`)) return fullSha.slice(0, 7);
  }
  return null;
}

export function findCommitByTag(tag: string): string | null {
  const sha = safeExec(['rev-list', '-n', '1', tag]);
  return sha ? sha.slice(0, 7) : null;
}

export interface VersionBump {
  sha: string;
  version: string;
}

export function listVersionBumps(versionFile = 'VERSION', limit = 50): VersionBump[] {
  const log = safeExec(['log', '--all', '--diff-filter=AM', '--pretty=%H', '--', versionFile]);
  if (!log) return [];
  const out: VersionBump[] = [];
  for (const fullSha of log.split('\n').filter(Boolean).slice(0, limit)) {
    const diff = safeExec(['show', fullSha, '--', versionFile]);
    if (!diff) continue;
    const m = diff.match(/^\+(\d+\.\d+\.\d+)$/m);
    if (m && m[1]) out.push({ sha: fullSha.slice(0, 7), version: m[1] });
  }
  return out;
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/git.ts packages/koni-docs/__tests__/lib/git.test.ts
git commit -m "feat(koni-docs/lib): git.isGitRepo/findCommitForVersion/findCommitByTag/listVersionBumps (US-4.9)"
```

---

## Task 18: `lib/changelog.ts` — parseChangelog + findEntryByVersion

**Files:**
- Create: `packages/koni-docs/src/lib/changelog.ts`
- Create: `packages/koni-docs/__tests__/lib/changelog.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/changelog.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseChangelog, findEntryByVersion, formatVersionHeader } from '../../src/lib/changelog.ts';

const cl = `# Changelog

## [Unreleased]

(empty)

## [0.2.0] — 2026-06-10 — Lib core + CLI — v0.2.0

Body content here.

### Added
- Lib

**Commit**: pending

## [0.1.0] — 2026-05-27 — Initial — v0.1.0

Initial release.

**Commit**: abc1234
`;

test('parseChangelog: returns entries newest-first', () => {
  const entries = parseChangelog(cl);
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.version, '0.2.0');
  assert.equal(entries[1]?.version, '0.1.0');
});

test('parseChangelog: extracts commit SHA + detects "pending"', () => {
  const entries = parseChangelog(cl);
  assert.equal(entries[0]?.commitSha, 'pending');
  assert.equal(entries[1]?.commitSha, 'abc1234');
});

test('findEntryByVersion: locates by version', () => {
  const entries = parseChangelog(cl);
  assert.equal(findEntryByVersion(entries, '0.1.0')?.commitSha, 'abc1234');
  assert.equal(findEntryByVersion(entries, '9.9.9'), null);
});

test('formatVersionHeader: produces the canonical header', () => {
  const h = formatVersionHeader({ version: '0.3.0', date: '2026-07-01', title: 'New' });
  assert.equal(h, '## [0.3.0] — 2026-07-01 — New — v0.3.0');
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement `src/lib/changelog.ts`**

```ts
export interface ChangelogEntryParsed {
  version: string;
  date: string;
  title: string;
  commitSha: string | null;
  body: string;
  headerLine: number;
  commitLine: number | null;
}

const HEADER_RE = /^## \[(\d+\.\d+\.\d+)\]\s+—\s+(\d{4}-\d{2}-\d{2})\s+—\s+(.+?)(?:\s+—\s+v?\d+\.\d+\.\d+)?\s*$/;
const COMMIT_RE = /^\*\*Commit\*\*:\s*(\S+)/;

export function parseChangelog(raw: string): ChangelogEntryParsed[] {
  const lines = raw.split('\n');
  const out: ChangelogEntryParsed[] = [];
  let current: ChangelogEntryParsed | null = null;
  let bodyStart = -1;

  const flush = (i: number) => {
    if (current) {
      current.body = lines.slice(bodyStart, i).join('\n').trim();
      out.push(current);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const m = line.match(HEADER_RE);
    if (m) {
      flush(i);
      current = {
        version: m[1] ?? '',
        date: m[2] ?? '',
        title: m[3] ?? '',
        commitSha: null,
        body: '',
        headerLine: i,
        commitLine: null,
      };
      bodyStart = i + 1;
      continue;
    }
    if (current) {
      const cm = line.match(COMMIT_RE);
      if (cm) {
        current.commitSha = cm[1] ?? null;
        current.commitLine = i;
      }
    }
  }
  flush(lines.length);
  return out;
}

export function findEntryByVersion(entries: ChangelogEntryParsed[], version: string): ChangelogEntryParsed | null {
  return entries.find(e => e.version === version) ?? null;
}

export function formatVersionHeader(opts: { version: string; date: string; title: string }): string {
  return `## [${opts.version}] — ${opts.date} — ${opts.title} — v${opts.version}`;
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/changelog.ts packages/koni-docs/__tests__/lib/changelog.test.ts
git commit -m "feat(koni-docs/lib): changelog.parseChangelog/findEntryByVersion/formatVersionHeader (US-4.9)"
```

---

## Task 19: `lib/changelog.ts` — updateCommitSha + serializeChangelog

**Files:**
- Modify: `packages/koni-docs/src/lib/changelog.ts`
- Modify: `packages/koni-docs/__tests__/lib/changelog.test.ts`

- [ ] **Step 1: Add failing tests**

Append:

```ts
import { updateCommitSha, serializeChangelog } from '../../src/lib/changelog.ts';

test('updateCommitSha: replaces "pending" with real sha; preserves other content', () => {
  const updated = updateCommitSha(cl, '0.2.0', 'def5678');
  assert.match(updated, /## \[0\.2\.0\][^\n]+v0\.2\.0/);
  assert.match(updated, /\*\*Commit\*\*: def5678/);
  assert.doesNotMatch(updated, /\*\*Commit\*\*: pending/);
  assert.match(updated, /\*\*Commit\*\*: abc1234/); // unchanged
});

test('updateCommitSha: returns unchanged input when version not found', () => {
  const updated = updateCommitSha(cl, '9.9.9', 'deadbee');
  assert.equal(updated, cl);
});
```

- [ ] **Step 2: Run — expect failure**

- [ ] **Step 3: Implement updateCommitSha + serializeChangelog**

Append to `src/lib/changelog.ts`:

```ts
export function updateCommitSha(raw: string, version: string, sha: string): string {
  const entries = parseChangelog(raw);
  const entry = findEntryByVersion(entries, version);
  if (!entry || entry.commitLine === null) return raw;
  const lines = raw.split('\n');
  lines[entry.commitLine] = `**Commit**: ${sha}`;
  return lines.join('\n');
}

/**
 * Stub: serializing parsed entries back to a CHANGELOG file is not used by
 * Pillar B. Pillar C subcommands operate on raw + line-level updates (see
 * updateCommitSha). Exported for API completeness; throws if called.
 */
export function serializeChangelog(_entries: ChangelogEntryParsed[]): string {
  throw new Error('serializeChangelog: not implemented in Pillar B; use raw + updateCommitSha');
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add packages/koni-docs/src/lib/changelog.ts packages/koni-docs/__tests__/lib/changelog.test.ts
git commit -m "feat(koni-docs/lib): changelog.updateCommitSha (US-4.9)"
```

---

## Task 20: Create markdown barrel + finalize public exports + full test + typecheck

**Files:**
- Create: `packages/koni-docs/src/lib/markdown/index.ts`
- Modify: `packages/koni-docs/src/lib/index.ts`

- [ ] **Step 0: Create `src/lib/markdown/index.ts` barrel for subpath export**

```ts
export * from './sections.ts';
export * from './tables.ts';
export * from './checkboxes.ts';
```

- [ ] **Step 1: Update `src/lib/index.ts` to export the full surface**

```ts
export const KONI_DOCS_LIB_VERSION = '0.2.0-dev.0';

// Core types
export type { Doc, MatterEntry, Corpus } from './types.ts';

// Doc I/O
export {
  readDoc, parseDoc, serializeDoc, writeDoc, updateFrontmatter,
} from './doc.ts';

// Corpus
export {
  readFolderMatter, loadCorpus, getStories, getEpics, getSprints,
  getActiveSprint, resolveById,
} from './corpus.ts';

// Markdown primitives
export {
  findSection, getSectionText, replaceSection, appendToSection,
  removeSection, replaceSectionWithTable,
} from './markdown/sections.ts';
export type { SectionMatch } from './markdown/sections.ts';

export {
  findTable, parseTable, findRow, updateCell, appendRow, removeRow,
  updateSectionTable,
} from './markdown/tables.ts';
export type {
  TableLocator, ParsedTable, RowMatcher, UpdateCellOpts,
  AppendRowOpts, RemoveRowOpts, TableUpdate,
} from './markdown/tables.ts';

export {
  parseCheckboxes, setCheckboxState, appendCheckbox, replaceCheckboxes,
} from './markdown/checkboxes.ts';
export type { CheckboxItem } from './markdown/checkboxes.ts';

// Schemas
export * as Schemas from './schemas/index.ts';

// Refs
export { validateRefs, listChildrenOf, listReferrersTo } from './refs.ts';
export type { RefKind, RefValidationResult } from './refs.ts';

// Changelog
export {
  parseChangelog, findEntryByVersion, formatVersionHeader,
  updateCommitSha, serializeChangelog,
} from './changelog.ts';
export type { ChangelogEntryParsed } from './changelog.ts';

// Git
export {
  isGitRepo, findCommitForVersion, findCommitByTag, listVersionBumps,
} from './git.ts';
export type { VersionBump } from './git.ts';
```

- [ ] **Step 2: Run full test suite + typecheck**

```bash
cd packages/koni-docs
npm test
npm run typecheck
```

Expected output:
- All tests pass (smoke + doc + corpus + ast + sections + tables + checkboxes + schemas + refs + git + changelog).
- tsc reports zero errors.

If anything fails, fix in place and re-run before committing.

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
ls dist/
```

Expected: `dist/lib/index.mjs`, `dist/lib/index.d.ts`, `dist/lib/markdown/index.mjs`, `dist/lib/schemas/index.mjs`.

- [ ] **Step 4: Commit**

```bash
git add packages/koni-docs/src/lib/index.ts
git commit -m "feat(koni-docs/lib): finalize public surface for Pillar B (US-4.5..4.9)"
```

---

## Task 21: Update the EPIC-4 stories + sprint board

**Files:**
- Modify: `docs/sprints/stories/US-4.5-lib-corpus-doc.md` (new)
- Modify: `docs/sprints/stories/US-4.6-lib-sections-tables.md` (new)
- Modify: `docs/sprints/stories/US-4.7-lib-checkboxes-schemas.md` (new)
- Modify: `docs/sprints/stories/US-4.8-lib-refs.md` (new)
- Modify: `docs/sprints/stories/US-4.9-lib-changelog-git.md` (new)
- Modify: `docs/sprints/epics/EPIC-4.md` (Stories table — append 5 rows)
- Modify: `VERSION` (bump from 0.3.0 → 0.4.0-dev.0)
- Modify: `docs/CHANGELOG.md` (entry for v0.4.0-dev.0)

> **Note:** This task is the koni-docs framework's own pre-commit
> bookkeeping (RULE-1, RULE-6, RULE-10). Execute it ONLY AFTER all
> previous tasks pass — it documents what shipped.

- [ ] **Step 1: Create the 5 stub story files using the koni-docs story template**

Use the template at `skills/koni-docs/references/templates/story.md` as the
skeleton. Each story file MUST have frontmatter:

```yaml
---
id: US-4.5  # or 4.6, 4.7, 4.8, 4.9
title: "<from EPIC-4 expansion design §9>"
epic: EPIC-4
status: done
priority: P0
points: 5  # or 5, 3, 3, 3
sprint: sprint-2026-W24  # or W24 / W25 depending on allocation
version_shipped: "0.4.0-dev.0"
prd_ref: FR-15  # adjust per spec
assignee: <github-login>
commit: <fill at pre-commit>
created: 2026-05-27
updated: <today>
---
```

Body uses the standard sections (Goal, Background, Acceptance criteria,
Tasks, Dev notes, Verification commands, Changelog entry, Implementation
notes, Files modified, Cross-references). Cross-references must include:

- [Spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md)

- [ ] **Step 2: Append 5 rows to `docs/sprints/epics/EPIC-4.md` Stories table**

Each row follows the existing 5-col `| ID | Title | Goal | Status | Version |` format.

- [ ] **Step 3: Bump `VERSION`**

```bash
echo "0.4.0-dev.0" > VERSION
```

- [ ] **Step 4: Add CHANGELOG entry**

Append after `## [Unreleased]`:

```markdown
## [0.4.0-dev.0] — <today> — koni-docs CLI Pillar B lib foundation — v0.4.0-dev.0

Ships `packages/koni-docs/src/lib/` — the reusable typed library that
will back the Pillar C CLI subcommands. Composes gray-matter +
unified/remark/remark-gfm + zod; replaces the hand-rolled YAML parser
and position-based table addressing planned for deletion in Pillar D.

### Added
- `@koniverse/koni-docs/lib` exports: corpus / doc / markdown / schemas / refs / changelog / git
- Zod schemas for story, epic, sprint, changelog-entry
- Column-by-NAME table addressing (foundation for W23 Carry bug fix)

**Commit**: pending
```

- [ ] **Step 5: Run the existing koni-docs scripts to sync state (last time before Pillar D deletes them)**

```bash
node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/
node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/
```

Note: `agile-sync-up.mjs` may write status into the wrong sprint-scope
cell if W23 sprint is still 8-col. That's expected and is what Pillar C
will fix. Hand-correct the sprint scope rows for US-4.5..4.9 if the
sync writes them wrong.

- [ ] **Step 6: Commit (this is the doc commit; previous task commits cover code)**

```bash
git add docs/ VERSION
git commit -m "docs: add stories US-4.5..4.9 and v0.4.0-dev.0 changelog (Pillar B)"
```

- [ ] **Step 7: Backfill commit SHA in CHANGELOG**

```bash
SHA=$(git log -1 --format=%h)
sed -i.bak "s/\*\*Commit\*\*: pending$/\*\*Commit\*\*: ${SHA}/" docs/CHANGELOG.md
rm docs/CHANGELOG.md.bak
git add docs/CHANGELOG.md
git commit -m "docs: backfill commit SHA for v0.4.0-dev.0"
```

---

## Self-review checklist (run after the plan is committed but before kick-off)

- [ ] **Spec coverage**: Every spec §5.x lib module has at least one task — confirmed (Task 4-19).
- [ ] **W23 BLOCKER fix**: Task 11 includes a regression test that asserts Status, not Carry, is updated.
- [ ] **No placeholders**: No "TBD" / "implement later" markers in any task.
- [ ] **Type consistency**: `Doc`, `Corpus`, `MatterEntry`, `Table`, `TableLocator`, `RowMatcher`, `CheckboxItem`, `RefValidationResult`, `ChangelogEntryParsed` are defined once and used consistently across tasks.
- [ ] **Test fixture reuse**: `_fixtures/build-fixture.ts` is created in Task 6 and reused in Task 16 — no duplicate fixtures.
- [ ] **Library composition**: every module uses an existing lib (gray-matter / unified / remark-gfm / unist-util-visit / mdast-util-to-string / zod) — no hand-rolled parser.

---

## Out-of-scope reminders (for Pillar C / D follow-up plans)

- CLI binary, commander wiring, subcommand files — Pillar C.
- Astro viewer port from `packages/koni-docs-viewer/` to `packages/koni-docs/src/viewer/` — Pillar C/D.
- Deletion of the five `.mjs` scripts in `skills/koni-docs/scripts/` — Pillar D.
- `npm publish @koniverse/koni-docs@0.2.0` — Pillar D.
- FR-ref validation against PRD §8 — deferred from Task 16 (`validateRefs` currently covers epic and sprint refs only; FR validation arrives with Pillar C `validate` subcommand if scoped in).

## Known issues to resolve in Pillar C

Pillar B's final code review surfaced one Important issue and several Minor polish items. They are not Pillar B regressions — they are deferred work.

**Important — `.` root export placeholder** ([Task 1 package.json](#task-1-initialize-packages-koni-docs--package-skeleton)):
The `package.json` `exports."."` entry points at `./dist/cli/index.mjs`, which does not exist in Pillar B (no CLI binary yet). Bare `import '@koniverse/koni-docs'` will fail `MODULE_NOT_FOUND`. Subpath imports (`/lib`, `/lib/markdown`, `/lib/schemas`) all resolve correctly. Resolved when Pillar C ships `src/cli/index.ts` and tsup adds the `cli/index` entry.

**Minor — polish items deferred to Pillar C or a separate polish PR**:
- `updateCell` mutates `doc.ast` in place while `updateFrontmatter`/`replaceSection`/`appendToSection`/`removeSection` return new Doc values. Document the contract at the function signature, or refactor to immutable.
- `readFolderMatter` accepts `opts.recursive` but never reads it. Either implement (if Pillar C needs nested folders) or drop the parameter.
- `unist-util-visit` listed in `dependencies` but never imported. Drop or wire into a future primitive that needs tree walking.
- Missing edge-case tests: `updateCell` row-not-found path; `parseChangelog` empty input; `validateRefs` with a broken epic/sprint ref.
- `serializeChangelog` imported but never called in `changelog.test.ts` — dead import.
