# Koni-docs CLI — Pillar E: Astro SSR Viewer + `preview` Subcommand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Astro SSR docs viewer at `packages/koni-docs/src/viewer/` and wire it to `koni-docs preview [path]` so any consumer with a `docs/` tree can run `npx koni-docs preview` and get a styled, navigable web UI of their koni-docs corpus. Lifts the proven UI pattern from `Koni-Finance-Final/apps/docs/`, adapts it for **SSR + runtime DOCS_DIR + Pillar B lib reuse**, and adds CLI ergonomics (port/host/open/watch flags + live reload).

**Architecture:** Astro 4 in `output: 'server'` mode (Node adapter), DOCS_DIR sourced from `process.env.KONI_DOCS_DIR` set by the CLI subcommand. Rendering engine composes `gray-matter` (already a Pillar B dep) + `marked` + `shiki` for HTML + syntax highlighting + mermaid passthrough. Corpus loading delegates to the Pillar B lib (`loadCorpus`/`getStories`/`getEpics`) — no duplicate scanner. Live reload uses a tiny chokidar watcher + SSE endpoint injected via Astro middleware.

**Tech Stack additions:** `astro@^4.16.18`, `@astrojs/node@^8.3.0`, `marked@^12.0.1`, `shiki@^1.1.7`, `chokidar@^3.6.0`. Added as **regular runtime deps** for v0.6.0 simplicity (can demote to peer deps in v0.6.1 if install size complaints arise).

**Scope covered:** US-4.1, US-4.2, US-4.3 (originally scoped to a viewer-only v0.1.0 in sprint W23 but never landed code) + a new US-4.19 (preview CLI subcommand).

**Not in scope (Pillar F):**
- `npm publish @koniverse/koni-docs@0.6.0` (deferred per the v0.5.0 pattern — manual user call).
- Config file `koni-docs.config.{json,mjs}` for title/ordering overrides — defer; v0.6.0 reads env + flags only.
- Full project-overview page (`project.astro` in the reference) — defer; v0.6.0 ships index + per-doc only.
- PRD §8 section-header lookup fix from Pillar D real-data testing (sync looks for "Functional requirements" not "Functional Requirements (FR)") — defer; not viewer-related.
- US-4.1..4.4 stub story files (in EPIC-4 table but never written) — defer; these were placeholders.

---

## Reference

Source pattern: `/Volumes/MacData/Workspace/AI/Koni-Finance-Final/apps/docs/`. Files lifted (with adaptations):

| Reference file | Lines | Adapted to |
|---|---|---|
| `src/utils/docs.ts` | 476 | `src/viewer/lib/render.ts` (marked+shiki+link rewrite) + DELEGATE to Pillar B lib for corpus/scan/aggregation |
| `src/layouts/Layout.astro` | 236 | `src/viewer/layouts/Layout.astro` (unchanged structure, runtime tree from env-driven DOCS_DIR) |
| `src/components/TreeNode.astro` | 116 | `src/viewer/components/TreeNode.astro` (verbatim) |
| `src/pages/index.astro` | 155 | `src/viewer/pages/index.astro` (dashboard — KPIs + epic grid) |
| `src/pages/docs/[...file].astro` | 97 | `src/viewer/pages/docs/[...file].astro` — **SSR mode** (no getStaticPaths) |
| `src/pages/project.astro` | 366 | DEFERRED (not in Pillar E scope) |
| `src/styles/global.css` | 297 | `src/viewer/styles/global.css` (verbatim — Tailwind v4 + design tokens) |
| `astro.config.mjs` | 9 | `src/viewer/astro.config.mjs` — **`output: 'server'`, `@astrojs/node` adapter** |

The reference is static (uses `getStaticPaths`, hardcoded `../../docs`). Our version is SSR (runtime DOCS_DIR from `process.env.KONI_DOCS_DIR`).

---

## File structure

```
packages/koni-docs/
├── package.json                       # ADD astro/node/marked/shiki/chokidar runtime deps
├── tsup.config.ts                     # unchanged — viewer ships separately via Astro
├── src/
│   ├── cli/
│   │   ├── index.ts                   # MODIFY: register preview subcommand
│   │   └── preview.ts                 # NEW: spawn astro dev with KONI_DOCS_DIR env
│   └── viewer/
│       ├── astro.config.mjs           # Astro Node SSR adapter
│       ├── tsconfig.json              # extends root tsconfig
│       ├── package.json               # OPTIONAL: minimal, defers to root deps
│       ├── lib/
│       │   ├── render.ts              # marked + shiki + link rewrite (NEW; ~150 LoC)
│       │   └── corpus.ts              # thin re-export of Pillar B lib for viewer pages (NEW; ~30 LoC)
│       ├── layouts/
│       │   └── Layout.astro           # lifted from Koni-Finance-Final
│       ├── components/
│       │   └── TreeNode.astro         # lifted verbatim
│       ├── pages/
│       │   ├── index.astro            # dashboard
│       │   └── docs/
│       │       └── [...file].astro    # per-doc SSR page
│       ├── styles/
│       │   └── global.css             # Tailwind v4 + design tokens
│       └── public/
│           └── favicon.svg
└── __tests__/
    └── cli/
        └── preview.test.ts            # spawn-based smoke test (no real HTTP, just verifies the CLI starts and responds to ctrl-c)
```

---

## Task 1: Add viewer runtime deps + create Astro scaffold

**Files:**
- Modify: `packages/koni-docs/package.json` (add astro + adapter + marked + shiki + chokidar)
- Create: `packages/koni-docs/src/viewer/astro.config.mjs`
- Create: `packages/koni-docs/src/viewer/tsconfig.json`
- Create: `packages/koni-docs/src/viewer/public/favicon.svg`
- Create: `packages/koni-docs/src/viewer/.gitkeep` (placeholder for future src/ contents)

- [ ] **Step 1: Install Astro + adapter + render libs + chokidar**

```bash
cd packages/koni-docs
npm install astro@^4.16.18 @astrojs/node@^8.3.0 marked@^12.0.1 shiki@^1.1.7 chokidar@^3.6.0
```

Expected: package.json `dependencies` grows by 5 entries. No vulnerabilities.

- [ ] **Step 2: Create `src/viewer/astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  srcDir: './',                   // viewer's pages/components live here
  publicDir: './public',
  outDir: './dist',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: {
    host: process.env.KONI_DOCS_HOST ?? 'localhost',
    port: Number(process.env.KONI_DOCS_PORT ?? 4321),
  },
  vite: {
    server: { fs: { allow: ['..', '../..', '../../..'] } },  // permit reading parent dirs in dev
  },
});
```

- [ ] **Step 3: Create `src/viewer/tsconfig.json`** (extends root)

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.astro"]
}
```

- [ ] **Step 4: Create a minimal `src/viewer/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1f2937"/><text x="16" y="22" text-anchor="middle" font-family="monospace" font-size="14" fill="#fbbf24">K</text></svg>
```

- [ ] **Step 5: Create a placeholder `src/viewer/pages/index.astro`** to make Astro happy

```astro
---
const docsDir = process.env.KONI_DOCS_DIR ?? '(not set)';
---
<html>
  <head><title>koni-docs viewer (scaffold)</title></head>
  <body>
    <h1>koni-docs viewer scaffold</h1>
    <p>DOCS_DIR: <code>{docsDir}</code></p>
    <p>This is a placeholder. Pillar E Tasks 2-5 lift the real pages.</p>
  </body>
</html>
```

- [ ] **Step 6: Verify the scaffold parses**

```bash
cd packages/koni-docs/src/viewer
npx astro check 2>&1 | tail -10
```

Expected: 0 errors. Warnings are OK.

- [ ] **Step 7: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/package.json packages/koni-docs/package-lock.json packages/koni-docs/src/viewer/
git commit -m "feat(koni-docs/viewer): scaffold Astro Node SSR + add render deps (US-4.1)"
```

---

## Task 2: Lift rendering engine (`render.ts`) — marked + shiki + link rewrite

**Files:**
- Create: `packages/koni-docs/src/viewer/lib/render.ts`

**Why this matters:** The rendering pipeline (markdown → HTML with syntax highlighting + mermaid passthrough + cross-doc link rewrite) is the heart of the viewer's content layer. We lift it as-is from Koni-Finance-Final but type-annotate strictly and detach from any hardcoded DOCS_DIR (we get the slug from the caller).

- [ ] **Step 1: Create `src/viewer/lib/render.ts`**

```ts
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'json', 'bash', 'yaml', 'markdown', 'css', 'html', 'sql', 'toml'],
    });
  }
  return highlighterInstance;
}

export interface DocMetadata {
  id?: string;
  title: string;
  epic?: string;
  status?: string;
  priority?: string;
  points?: number;
  sprint?: string;
  assignee?: string;
  version_shipped?: string;
  [key: string]: unknown;
}

export interface TocItem {
  text: string;
  id: string;
  level: number;
}

export interface DocContent {
  metadata: DocMetadata;
  html: string;
  toc: TocItem[];
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isExternal(href: string): boolean {
  return /^([a-z]+:|\/\/|#)/i.test(href);
}

/**
 * Rewrite relative .md links so docs cross-reference cleanly.
 * Resolves the link against the current doc's directory, strips `.md`,
 * and outputs `/docs/<resolved>` (preserving `#anchor` and `?query`).
 */
function rewriteDocLink(href: string, currentSlug: string): string {
  if (!href || isExternal(href) || href.startsWith('mailto:')) return href;
  let hash = '';
  let query = '';
  const hashIdx = href.indexOf('#');
  if (hashIdx >= 0) { hash = href.slice(hashIdx); href = href.slice(0, hashIdx); }
  const queryIdx = href.indexOf('?');
  if (queryIdx >= 0) { query = href.slice(queryIdx); href = href.slice(0, queryIdx); }
  const lineMatch = href.match(/^(.*\.md):(\d+)$/i);
  if (lineMatch && lineMatch[1]) href = lineMatch[1];
  if (!href.toLowerCase().endsWith('.md')) return href + query + hash;
  const currentDir = path.posix.dirname(currentSlug);
  const cleanHref = href.replace(/^\.\//, '');
  const resolved = path.posix.normalize(
    cleanHref.startsWith('/') ? cleanHref.slice(1) : path.posix.join(currentDir, cleanHref),
  );
  const withoutMd = resolved.replace(/\.md$/i, '');
  return `/docs/${withoutMd}${query}${hash}`;
}

export async function renderDocFromPath(absolutePath: string, slug: string): Promise<DocContent> {
  const fileContent = await fs.readFile(absolutePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const metadata: DocMetadata = { title: String(data.title ?? slug), ...data };

  const toc: TocItem[] = [];
  const shiki = await getHighlighter();
  const marked = new Marked();

  const renderer = {
    heading(text: string, level: number, raw: string) {
      const slugId = raw.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (level >= 2 && level <= 3) toc.push({ text: raw, id: slugId, level });
      return `<h${level} id="${slugId}">${text}</h${level}>`;
    },
    link(href: string, title: string | null | undefined, text: string) {
      const resolved = rewriteDocLink(href, slug);
      const external = isExternal(resolved) && !resolved.startsWith('/') && !resolved.startsWith('#');
      const attrs = [`href="${escapeHtml(resolved)}"`];
      if (title) attrs.push(`title="${escapeHtml(title)}"`);
      if (external) attrs.push('target="_blank"', 'rel="noopener noreferrer"');
      return `<a ${attrs.join(' ')}>${text}</a>`;
    },
    code(code: string, infostring: string | undefined) {
      const lang = (infostring || '').match(/\S*/)?.[0] || 'text';
      if (lang === 'mermaid') {
        return `<pre class="mermaid" data-mermaid-source="${escapeHtml(code)}">${escapeHtml(code)}</pre>`;
      }
      try {
        return shiki.codeToHtml(code, {
          lang: shiki.getLoadedLanguages().includes(lang) ? lang : 'text',
          theme: 'github-dark',
        });
      } catch {
        return `<pre class="shiki text"><code>${escapeHtml(code)}</code></pre>`;
      }
    },
  };

  marked.use({ renderer } as Parameters<typeof marked.use>[0]);
  const html = String(await marked.parse(content));
  return { metadata, html, toc };
}
```

- [ ] **Step 2: Verify it typechecks**

```bash
cd packages/koni-docs/src/viewer && npx astro check 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/src/viewer/lib/render.ts
git commit -m "feat(koni-docs/viewer): add render.ts — marked + shiki + link rewrite (US-4.2)"
```

---

## Task 3: Lift corpus adapter + file tree builder

**Files:**
- Create: `packages/koni-docs/src/viewer/lib/corpus.ts`

**Why this matters:** The viewer needs (a) a recursive file scan for the sidebar tree, and (b) corpus accessors for stories/epics aggregation. Our Pillar B lib does corpus loading; this adapter wraps it for the viewer's needs (file paths + tree structure) without duplicating scanner logic.

- [ ] **Step 1: Create `src/viewer/lib/corpus.ts`**

```ts
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { loadCorpus, getStories, getEpics, type Corpus } from '../../lib/index.ts';

const DOCS_DIR = process.env.KONI_DOCS_DIR ?? path.resolve(process.cwd(), 'docs');

export function getDocsDir(): string {
  return DOCS_DIR;
}

export interface DocNode {
  absolutePath: string;
  relativePath: string;
  slug: string;
  title: string;
  category: string;
}

export interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  path: string;
  href?: string;
  title?: string;
  children?: TreeNode[];
}

const TOP_LEVEL_ORDER = ['README', 'BRIEF', 'PRD', 'ARCHITECTURE', 'CONTEXT', 'DOMAIN-ENTITIES', 'SETUP', 'DEPLOY', 'CHANGELOG', 'LESSONS'];
const FOLDER_ORDER = ['sprints', 'decisions', 'superpowers', 'dev', 'reference', 'references'];

export async function scanDocFiles(dir: string = DOCS_DIR, baseDir: string = DOCS_DIR): Promise<DocNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: DocNode[] = [];
  for (const entry of entries) {
    const resPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'audit') continue;
      files.push(...(await scanDocFiles(resPath, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, resPath);
      const slug = relativePath.slice(0, -3);
      const parts = relativePath.split(path.sep);
      let category = 'Core Docs';
      if (parts.length > 1) {
        const part0 = parts[0];
        if (part0 === 'sprints') {
          if (parts[1] === 'stories') category = 'User Stories';
          else if (parts[1] === 'epics') category = 'Epics';
          else category = 'Sprints';
        } else if (part0) {
          category = part0.charAt(0).toUpperCase() + part0.slice(1);
        }
      }
      const fileContent = await fs.readFile(resPath, 'utf-8');
      const { data, content } = matter(fileContent);
      let title = String(data.title ?? '');
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        title = titleMatch?.[1] ?? entry.name.slice(0, -3);
      }
      files.push({ absolutePath: resPath, relativePath, slug, title, category });
    }
  }
  return files.sort((a, b) => a.title.localeCompare(b.title));
}

export function buildFileTree(files: DocNode[]): TreeNode[] {
  const root: TreeNode = { name: 'root', type: 'folder', path: '', children: [] };
  for (const file of files) {
    const parts = file.relativePath.split(path.sep);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');
      if (isLast) {
        cursor.children!.push({
          name: part.replace(/\.md$/, ''),
          type: 'file',
          path: currentPath,
          href: `/docs/${file.slug}`,
          title: file.title,
        });
      } else {
        let folder = cursor.children!.find(c => c.type === 'folder' && c.name === part);
        if (!folder) {
          folder = { name: part, type: 'folder', path: currentPath, children: [] };
          cursor.children!.push(folder);
        }
        cursor = folder;
      }
    }
  }
  const sortNode = (node: TreeNode): void => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (node.path === '' && a.type !== b.type) return a.type === 'file' ? -1 : 1;
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      if (node.path === '') {
        if (a.type === 'file' && b.type === 'file') {
          const ai = TOP_LEVEL_ORDER.indexOf(a.name);
          const bi = TOP_LEVEL_ORDER.indexOf(b.name);
          if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        }
        if (a.type === 'folder' && b.type === 'folder') {
          const ai = FOLDER_ORDER.indexOf(a.name);
          const bi = FOLDER_ORDER.indexOf(b.name);
          if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        }
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    node.children.forEach(sortNode);
  };
  sortNode(root);
  return root.children ?? [];
}

/**
 * Dashboard accessor — composes Pillar B lib's loadCorpus to extract story-level metadata
 * for the index page's KPI + epic-grid section.
 */
export interface DashboardData {
  corpus: Corpus;
  stories: Array<{
    id: string;
    title: string;
    epic: string;
    status: string;
    priority: string;
    points: number;
    sprint: string;
    assignee: string;
    version_shipped: string;
    slug: string;
  }>;
  epics: Array<{
    epic: string;
    total: number;
    done: number;
    inProgress: number;
    inReview: number;
    blocked: number;
    backlog: number;
    totalPoints: number;
    donePoints: number;
    shippedVersions: string[];
  }>;
}

export function loadDashboardData(): DashboardData {
  const corpus = loadCorpus(DOCS_DIR);
  const allStories = getStories(corpus).map(s => {
    const fm = s.frontmatter;
    return {
      id: String(fm.id ?? ''),
      title: String(fm.title ?? s.filename.replace(/\.md$/, '')),
      epic: String(fm.epic ?? '—'),
      status: String(fm.status ?? 'backlog'),
      priority: String(fm.priority ?? '—'),
      points: typeof fm.points === 'number' ? fm.points : 0,
      sprint: String(fm.sprint ?? '—'),
      assignee: String(fm.assignee ?? '—'),
      version_shipped: String(fm.version_shipped ?? ''),
      slug: `sprints/stories/${s.filename.replace(/\.md$/, '')}`,
    };
  }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

  // Aggregate by epic
  const buckets = new Map<string, typeof allStories>();
  for (const s of allStories) {
    const arr = buckets.get(s.epic) ?? [];
    arr.push(s);
    buckets.set(s.epic, arr);
  }
  const epics = [...buckets.entries()].map(([epic, list]) => {
    const counts = { done: 0, inProgress: 0, inReview: 0, blocked: 0, backlog: 0 };
    let totalPoints = 0, donePoints = 0;
    const versions = new Set<string>();
    for (const s of list) {
      totalPoints += s.points;
      switch (s.status) {
        case 'done': counts.done++; donePoints += s.points; break;
        case 'in-progress': counts.inProgress++; break;
        case 'in-review':
        case 'review': counts.inReview++; break;
        case 'blocked': counts.blocked++; break;
        default: counts.backlog++;
      }
      if (s.version_shipped) versions.add(s.version_shipped);
    }
    return { epic, total: list.length, ...counts, totalPoints, donePoints, shippedVersions: [...versions].sort() };
  }).sort((a, b) => a.epic.localeCompare(b.epic, undefined, { numeric: true }));

  return { corpus, stories: allStories, epics: epics.filter(e => e.epic && e.epic !== '—') };
}
```

- [ ] **Step 2: Verify**

```bash
cd packages/koni-docs/src/viewer && npx astro check 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/src/viewer/lib/corpus.ts
git commit -m "feat(koni-docs/viewer): corpus adapter — file tree + dashboard data via Pillar B lib (US-4.2)"
```

---

## Task 4: Lift Layout + TreeNode + global.css

**Files:**
- Create: `packages/koni-docs/src/viewer/layouts/Layout.astro`
- Create: `packages/koni-docs/src/viewer/components/TreeNode.astro`
- Create: `packages/koni-docs/src/viewer/styles/global.css`

These are direct copies from Koni-Finance-Final with two adaptations:
1. `Layout.astro`: replace any reference to "Koni Finance" with a generic "{title}" prop (no hardcoded brand).
2. `TreeNode.astro`: verbatim — already prop-driven.
3. `global.css`: verbatim — Tailwind v4 + design tokens, no brand coupling.

- [ ] **Step 1: Copy `TreeNode.astro` verbatim from reference**

Source: `/Volumes/MacData/Workspace/AI/Koni-Finance-Final/apps/docs/src/components/TreeNode.astro` (116 lines).

Destination: `packages/koni-docs/src/viewer/components/TreeNode.astro`.

```bash
cp /Volumes/MacData/Workspace/AI/Koni-Finance-Final/apps/docs/src/components/TreeNode.astro packages/koni-docs/src/viewer/components/TreeNode.astro
```

Then edit the import at the top of the file: change `import type { TreeNode } from '@/utils/docs';` to `import type { TreeNode } from '../lib/corpus.ts';`.

- [ ] **Step 2: Copy `Layout.astro` and de-brand**

```bash
cp /Volumes/MacData/Workspace/AI/Koni-Finance-Final/apps/docs/src/layouts/Layout.astro packages/koni-docs/src/viewer/layouts/Layout.astro
```

Then edit:
- Change `import TreeNode from '@/components/TreeNode.astro';` → `import TreeNode from '../components/TreeNode.astro';`
- Change `import type { TreeNode as TreeNodeType } from '@/utils/docs';` → `import type { TreeNode as TreeNodeType } from '../lib/corpus.ts';`
- Find any literal "Koni Finance" in the sidebar header or footer → replace with `{Astro.props.title ?? 'koni-docs'}` or similar. Read the file to find the exact location.
- Change CSS import `import '@/styles/global.css';` → `import '../styles/global.css';`

- [ ] **Step 3: Copy `global.css` verbatim**

```bash
cp /Volumes/MacData/Workspace/AI/Koni-Finance-Final/apps/docs/src/styles/global.css packages/koni-docs/src/viewer/styles/global.css
```

- [ ] **Step 4: Verify Astro can resolve everything**

```bash
cd packages/koni-docs/src/viewer && npx astro check 2>&1 | tail -10
```

Expected: 0 errors. If there are unresolved imports, fix the paths.

- [ ] **Step 5: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/src/viewer/layouts/ packages/koni-docs/src/viewer/components/ packages/koni-docs/src/viewer/styles/
git commit -m "feat(koni-docs/viewer): lift Layout + TreeNode + global.css from Koni-Finance-Final (US-4.1)"
```

---

## Task 5: Pages — index dashboard + per-doc SSR route

**Files:**
- Modify: `packages/koni-docs/src/viewer/pages/index.astro` (replace scaffold with dashboard)
- Create: `packages/koni-docs/src/viewer/pages/docs/[...file].astro`

**Why this matters:** These are the two pages an end-user actually visits. The index gives the dashboard view; `[...file]` renders any doc by slug.

- [ ] **Step 1: Replace `src/viewer/pages/index.astro` with dashboard**

Copy from `/Volumes/MacData/Workspace/AI/Koni-Finance-Final/apps/docs/src/pages/index.astro` (155 lines) with these adaptations:

- Change imports: `@/layouts/Layout.astro` → `../layouts/Layout.astro`; `@/utils/docs` → `../lib/corpus.ts`
- Replace `import { scanDocFiles, buildFileTree, extractAllUserStories, aggregateByEpic } from '@/utils/docs'` with:
  ```ts
  import { scanDocFiles, buildFileTree, loadDashboardData } from '../lib/corpus.ts';
  ```
- Replace the data-loading lines:
  ```ts
  const allDocs = await scanDocFiles();
  const tree = buildFileTree(allDocs);
  const { stories, epics } = loadDashboardData();
  ```
- Replace `Koni Finance` heading prefix with a `process.env.KONI_DOCS_TITLE ?? 'Koni-docs'` lookup if you want runtime title; otherwise hardcode `'Koni-docs'`.
- Everything else (KPI cards, epic grid layout) stays.

- [ ] **Step 2: Create `src/viewer/pages/docs/[...file].astro`**

This is the per-doc SSR route. Difference from the reference: **no `getStaticPaths`** — SSR resolves the slug at request time.

```astro
---
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import Layout from '../../layouts/Layout.astro';
import { scanDocFiles, buildFileTree, getDocsDir } from '../../lib/corpus.ts';
import { renderDocFromPath } from '../../lib/render.ts';

const slug = Array.isArray(Astro.params.file) ? Astro.params.file.join('/') : (Astro.params.file ?? '');
const docsDir = getDocsDir();
const absolutePath = path.resolve(docsDir, `${slug}.md`);

let metadata, html, toc;
try {
  await fs.access(absolutePath);
  const rendered = await renderDocFromPath(absolutePath, slug);
  metadata = rendered.metadata;
  html = rendered.html;
  toc = rendered.toc;
} catch {
  return new Response(`Doc not found: ${slug}`, { status: 404 });
}

const allDocs = await scanDocFiles();
const tree = buildFileTree(allDocs);
const crumbs = `${slug}`.split('/');
---

<Layout title={metadata.title} tree={tree}>
  <div class="mx-auto w-full max-w-screen-2xl px-6 py-8 md:px-10 md:py-10">
    <div class={`grid gap-10 ${toc.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_240px]' : ''}`}>
      <article class="min-w-0">
        <nav class="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <a href="/" class="hover:text-foreground">Docs</a>
          {crumbs.map((c, i) => (
            <>
              <span class="text-muted-foreground/40">/</span>
              <span class={i === crumbs.length - 1 ? 'font-medium text-foreground' : ''}>{c}</span>
            </>
          ))}
        </nav>
        <header class="mb-6">
          <h1 class="text-3xl font-bold tracking-tight md:text-4xl">{metadata.title}</h1>
          {metadata.id && (
            <div class="mt-5 grid gap-4 rounded-xl border border-border bg-card p-4 text-sm shadow-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <div><p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Story ID</p><p class="mt-0.5 font-mono text-xs">{metadata.id}</p></div>
              <div><p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Epic</p><p class="mt-0.5 truncate">{metadata.epic ?? '—'}</p></div>
              <div><p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sprint</p><p class="mt-0.5 truncate">{metadata.sprint ?? '—'}</p></div>
              <div><p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Assignee</p><p class="mt-0.5 truncate">{metadata.assignee ?? '—'}</p></div>
              <div><p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Points</p><p class="mt-0.5">{metadata.points ?? 0}</p></div>
              <div><p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</p><p class="mt-0.5"><span class={`badge badge-${metadata.status ?? 'backlog'}`}>{metadata.status ?? 'backlog'}</span></p></div>
            </div>
          )}
        </header>
        <div class="prose max-w-none" set:html={html} />
      </article>
      {toc.length > 0 && (
        <aside class="hidden lg:block">
          <div class="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm">
            <p class="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">On this page</p>
            <ul class="flex flex-col gap-1.5 text-sm">
              {toc.map((item) => (
                <li class={item.level === 3 ? 'pl-3' : ''}>
                  <a href={`#${item.id}`} class="block truncate text-muted-foreground transition hover:text-foreground">{item.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  </div>
</Layout>
```

- [ ] **Step 3: Verify Astro typecheck**

```bash
cd packages/koni-docs/src/viewer && npx astro check 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 4: Manual smoke test the viewer with this repo's docs**

```bash
cd packages/koni-docs/src/viewer && KONI_DOCS_DIR=/Volumes/MacData/Workspace/AI/Koni-Skills/docs npx astro dev --port 4321 &
SERVER_PID=$!
sleep 4
curl -s http://localhost:4321/ -o /tmp/index.html && head -5 /tmp/index.html
curl -s http://localhost:4321/docs/PRD -o /tmp/prd.html && head -5 /tmp/prd.html
kill $SERVER_PID 2>/dev/null
```

Expected: both responses contain HTML with our content (no 404 / no Astro error pages). If you get a 500 or 404, fix before committing.

- [ ] **Step 5: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/src/viewer/pages/
git commit -m "feat(koni-docs/viewer): dashboard index + per-doc SSR route (US-4.1 + US-4.3 graceful)"
```

---

## Task 6: CLI `preview` subcommand — spawn Astro dev

**Files:**
- Create: `packages/koni-docs/src/cli/preview.ts`
- Modify: `packages/koni-docs/src/cli/index.ts` (register preview)

**Why this matters:** This is the user-facing entry point. `npx koni-docs preview` spawns the Astro dev server with the right env vars.

- [ ] **Step 1: Create `src/cli/preview.ts`**

```ts
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import type { Command } from 'commander';
import { getGlobalOpts } from './global-opts.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// When running from dist: __dirname is packages/koni-docs/dist/cli — viewer source lives at ../../src/viewer
// When running from source (tsx): __dirname is packages/koni-docs/src/cli — viewer source lives at ../viewer
function findViewerDir(): string {
  const candidates = [
    path.resolve(__dirname, '..', 'viewer'),                    // dist/cli → dist/viewer (if we bundled it; we don't)
    path.resolve(__dirname, '..', '..', 'src', 'viewer'),       // dist/cli → src/viewer
    path.resolve(__dirname, '..', '..', '..', 'src', 'viewer'), // nested layouts
  ];
  for (const c of candidates) {
    if (existsSync(path.join(c, 'astro.config.mjs'))) return c;
  }
  throw new Error(`viewer directory not found near ${__dirname}`);
}

export function registerPreview(program: Command): void {
  program
    .command('preview [path]')
    .description('Launch the koni-docs Astro viewer for a docs/ tree')
    .option('--port <n>', 'HTTP port', '4321')
    .option('--host <h>', 'Bind host', 'localhost')
    .option('--open', 'Open browser on start', false)
    .action(function (this: Command, pathArg: string | undefined, cmdOpts: { port: string; host: string; open: boolean }) {
      const opts = getGlobalOpts(this);
      // Resolve DOCS_DIR: CLI positional arg > --docs-path > cwd/docs
      const docsDir = path.resolve(pathArg ?? opts.docsPath);
      if (!existsSync(docsDir)) {
        console.error(`error: docs directory not found: ${docsDir}`);
        process.exit(1);
      }
      const viewerDir = findViewerDir();
      const astroBin = path.resolve(viewerDir, 'node_modules', '.bin', 'astro');
      const astro = existsSync(astroBin) ? astroBin : 'npx';
      const args = existsSync(astroBin)
        ? ['dev', '--port', cmdOpts.port, '--host', cmdOpts.host, ...(cmdOpts.open ? ['--open'] : [])]
        : ['astro', 'dev', '--port', cmdOpts.port, '--host', cmdOpts.host, ...(cmdOpts.open ? ['--open'] : [])];

      console.log(`🌐 koni-docs preview`);
      console.log(`   docs:   ${docsDir}`);
      console.log(`   server: http://${cmdOpts.host}:${cmdOpts.port}`);
      console.log('');

      const child = spawn(astro, args, {
        cwd: viewerDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          KONI_DOCS_DIR: docsDir,
          KONI_DOCS_HOST: cmdOpts.host,
          KONI_DOCS_PORT: cmdOpts.port,
        },
      });

      const shutdown = () => {
        if (!child.killed) child.kill('SIGTERM');
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      child.on('exit', (code) => {
        process.exit(code ?? 0);
      });
    });
}
```

- [ ] **Step 2: Wire into `src/cli/index.ts`**

After the other `register*` imports:

```ts
import { registerPreview } from './preview.ts';
registerPreview(program);
```

- [ ] **Step 3: Smoke-test the CLI command end-to-end**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
node --import tsx packages/koni-docs/src/cli/index.ts preview docs/ --port 4321 &
SERVER_PID=$!
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/docs/PRD
kill $SERVER_PID 2>/dev/null
wait 2>/dev/null
```

Expected output: `200` for `/`, `200` for `/docs/PRD`.

- [ ] **Step 4: Run lib + CLI tests to confirm no regression**

```bash
cd packages/koni-docs && npm test 2>&1 | grep -E "tests|pass|fail" | head -4
npm run typecheck && echo "TC:$?"
```

Expected: 70 tests still pass (no new tests added for preview yet — Task 7 adds smoke test). Typecheck exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/src/cli/preview.ts packages/koni-docs/src/cli/index.ts
git commit -m "feat(koni-docs/cli): preview subcommand spawning Astro dev with runtime DOCS_DIR (US-4.19)"
```

---

## Task 7: Preview smoke test + tsup CLI build verification

**Files:**
- Create: `packages/koni-docs/__tests__/cli/preview.test.ts`

**Why this matters:** We don't want preview to silently break on a future change. The test boots the CLI, hits the server, and tears it down.

- [ ] **Step 1: Write `__tests__/cli/preview.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, '..', '..', 'src', 'cli', 'index.ts');
const FIXTURE_DOCS = join(__dirname, '..', 'lib', '_fixtures');  // re-use existing fixture

async function waitFor(predicate: () => Promise<boolean>, timeoutMs = 15_000, intervalMs = 250): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await predicate()) return true; } catch {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}

test('preview: serves a 200 on / for a real docs tree', { timeout: 30_000 }, async () => {
  // Use this repo's docs/ as the live fixture
  const docsDir = join(__dirname, '..', '..', '..', '..', 'docs');
  const port = '47321';  // unusual port to avoid collision

  const child = spawn(process.execPath, ['--import', 'tsx', CLI_ENTRY, 'preview', docsDir, '--port', port], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NO_COLOR: '1' },
  });

  const ready = await waitFor(async () => {
    try {
      const r = await fetch(`http://localhost:${port}/`);
      return r.status === 200;
    } catch { return false; }
  });

  try {
    assert.equal(ready, true, 'server did not become ready within 15s');
    const r = await fetch(`http://localhost:${port}/`);
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.match(html, /<html/i);
  } finally {
    child.kill('SIGTERM');
    await new Promise<void>(resolve => {
      const t = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000);
      child.on('exit', () => { clearTimeout(t); resolve(); });
    });
  }
});
```

- [ ] **Step 2: Run the new test in isolation**

```bash
cd packages/koni-docs && node --import tsx --test __tests__/cli/preview.test.ts 2>&1 | tail -8
```

Expected: `# pass 1` (the preview test). If timeout, debug — likely the viewer's `npm install` hasn't completed or Astro deps aren't reachable.

- [ ] **Step 3: Run full suite**

```bash
npm test 2>&1 | grep -E "tests|pass|fail" | head -4
npm run typecheck && echo "TC:$?"
```

Expected: 71 tests pass total. Typecheck exit 0.

- [ ] **Step 4: Verify tsup build (CLI still produces .mjs)**

```bash
npm run build 2>&1 | tail -5
head -1 dist/cli/index.mjs
```

Expected: build succeeds, shebang preserved. (Viewer is NOT bundled by tsup — it ships as-is via `files` field in package.json; see Task 8.)

- [ ] **Step 5: Commit**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add packages/koni-docs/__tests__/cli/preview.test.ts
git commit -m "test(koni-docs/cli): preview subcommand smoke test (US-4.19)"
```

---

## Task 8: Bookkeeping + VERSION 0.6.0 + CHANGELOG + Pillar F kickoff

**Files:**
- Modify: `packages/koni-docs/package.json` (`version` → `0.6.0`, ensure `files` includes `src/viewer/**`)
- Modify: `packages/koni-docs/src/lib/index.ts` (`KONI_DOCS_LIB_VERSION = '0.6.0'`)
- Modify: `packages/koni-docs/__tests__/smoke.test.ts` (assert `0.6.0`)
- Modify: `VERSION` → `0.6.0`
- Modify: `docs/CHANGELOG.md` (insert `[0.6.0]` entry)
- Create: `docs/sprints/stories/US-4.1-scaffold-and-ssr.md` (the placeholder that never landed — now done)
- Create: `docs/sprints/stories/US-4.2-cli-bin-and-config.md` (preview subcommand done; config-file portion DEFERRED to Pillar F)
- Create: `docs/sprints/stories/US-4.3-graceful-schema-and-live-reload.md` (graceful schema done implicitly; live reload DEFERRED to Pillar F)
- Create: `docs/sprints/stories/US-4.19-cli-preview.md`
- Modify: `docs/sprints/epics/EPIC-4.md` (4 new rows; also update US-4.1..4.3 if they were placeholders — should they have files now? Yes — recreate as done.)

- [ ] **Step 1: Update package.json `files` field** so the viewer ships in the npm tarball

Edit `packages/koni-docs/package.json`. Change:

```json
"files": ["dist", "README.md"],
```

to:

```json
"files": ["dist", "src/viewer", "README.md"],
```

This ensures `npx koni-docs preview` works post-install (the viewer source needs to be on disk for `astro dev` to read).

- [ ] **Step 2: Bump VERSION, package.json, KONI_DOCS_LIB_VERSION, smoke test**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
echo "0.6.0" > VERSION
```

Edit `packages/koni-docs/package.json`: `"version": "0.5.0"` → `"version": "0.6.0"`.

Edit `packages/koni-docs/src/lib/index.ts`: `KONI_DOCS_LIB_VERSION = '0.6.0'`.

Edit `packages/koni-docs/__tests__/smoke.test.ts`: `assert.equal(KONI_DOCS_LIB_VERSION, '0.6.0')`.

- [ ] **Step 3: Add CHANGELOG entry for v0.6.0**

Insert in `docs/CHANGELOG.md` AFTER `## [Unreleased]` and BEFORE `## [0.5.0]`:

```markdown
## [0.6.0] — 2026-05-27 — Pillar E ship: Astro SSR viewer + `preview` subcommand — v0.6.0

Adds the Astro SSR docs viewer at `packages/koni-docs/src/viewer/` and a new `koni-docs preview` subcommand. Lifts the proven UI pattern from `Koni-Finance-Final/apps/docs/`, adapted for SSR + runtime DOCS_DIR + Pillar B lib reuse.

### Added
- `koni-docs preview [path] --port <n> --host <h> --open` — spawns Astro dev with `KONI_DOCS_DIR` set
- `src/viewer/` Astro SSR project: `pages/index.astro` (dashboard), `pages/docs/[...file].astro` (per-doc SSR), `layouts/Layout.astro`, `components/TreeNode.astro`, `styles/global.css`
- `lib/render.ts`: marked + shiki + mermaid passthrough + relative-link rewrite
- `lib/corpus.ts`: file-tree builder + dashboard data composer (delegates to Pillar B lib)
- Runtime deps: `astro@^4.16.18`, `@astrojs/node@^8.3.0`, `marked@^12.0.1`, `shiki@^1.1.7`, `chokidar@^3.6.0`
- Preview smoke test in `__tests__/cli/preview.test.ts`

### Changed
- `package.json` `files` field includes `src/viewer/**` so the viewer ships in the npm tarball
- VERSION triple synced to `0.6.0` (root VERSION + package.json + KONI_DOCS_LIB_VERSION)

### Deferred (Pillar F)
- chokidar + SSE live-reload (`--watch` flag exists in CLI design but is a no-op for v0.6.0)
- `koni-docs.config.{json,mjs}` config file support (title/ordering overrides)
- Full `project.astro` overview page
- npm publish `@koniverse/koni-docs@0.6.0`

**Commit**: pending
```

- [ ] **Step 4: Run full test suite + typecheck**

```bash
cd packages/koni-docs && npm test 2>&1 | grep -E "tests|pass|fail" | head -4
npm run typecheck && echo "TC:$?"
```

Expected: 71 tests pass. Typecheck exit 0.

- [ ] **Step 5: Create story files**

Use the koni-docs story template (concise stubs same as Pillar B/C/D bookkeeping). 4 files:

- `docs/sprints/stories/US-4.1-scaffold-and-ssr.md` — frontmatter: `status: done`, `version_shipped: "0.6.0"`, `sprint: sprint-2026-W26`
- `docs/sprints/stories/US-4.2-cli-bin-and-config.md` — frontmatter: `status: in-progress`, `version_shipped: ""` (preview shipped; config file deferred)
- `docs/sprints/stories/US-4.3-graceful-schema-and-live-reload.md` — frontmatter: `status: in-progress`, `version_shipped: ""` (graceful schema implicit in 404 handler; live-reload deferred)
- `docs/sprints/stories/US-4.19-cli-preview.md` — frontmatter: `status: done`, `version_shipped: "0.6.0"`

Body for each: 1-paragraph Goal, 3-AC list (matching what shipped), Tasks list pointing at Pillar E plan tasks, References block, Cross-references.

Note: US-4.1..4.4 were previously listed in EPIC-4 Stories table as `🟢 ready` with no story files. Now US-4.1 lands as done. Update the corresponding row.

- [ ] **Step 6: Append/update EPIC-4 Stories table**

For US-4.1, find the existing row `| [US-4.1](../stories/US-4.1-scaffold-and-ssr.md) | ... | 🟢 ready | — |` and update to:

```
| [US-4.1](../stories/US-4.1-scaffold-and-ssr.md) | Scaffold `packages/koni-docs-viewer` + SSR migration | Astro SSR viewer scaffold + render engine + Layout/TreeNode lifted from Koni-Finance-Final | ✅ done | v0.6.0 |
```

For US-4.2 / US-4.3: update status to `🚧 in-progress` (preview shipped, config + live-reload deferred). Append a new US-4.19 row:

```
| [US-4.19](../stories/US-4.19-cli-preview.md) | `koni-docs preview` subcommand | Spawn Astro dev with runtime DOCS_DIR; --port/--host/--open flags | ✅ done | v0.6.0 |
```

Verify row count: should be 19 (18 prior + 1 new US-4.19; existing US-4.1..4.4 rows count unchanged).

- [ ] **Step 7: Commit the bookkeeping**

```bash
cd /Volumes/MacData/Workspace/AI/Koni-Skills/.claude/worktrees/koni-docs-cli-pillar-e
git add VERSION packages/koni-docs/package.json packages/koni-docs/src/lib/index.ts packages/koni-docs/__tests__/smoke.test.ts \
        docs/CHANGELOG.md docs/sprints/stories/US-4.1-scaffold-and-ssr.md docs/sprints/stories/US-4.2-cli-bin-and-config.md \
        docs/sprints/stories/US-4.3-graceful-schema-and-live-reload.md docs/sprints/stories/US-4.19-cli-preview.md \
        docs/sprints/epics/EPIC-4.md
git commit -m "feat: ship v0.6.0 — koni-docs Pillar E (Astro viewer + preview subcommand)"
```

- [ ] **Step 8: Dogfood — backfill the v0.6.0 SHA**

```bash
node --import tsx packages/koni-docs/src/cli/index.ts backfill-commits --docs-path docs/
git add docs/CHANGELOG.md
git commit -m "docs: backfill commit SHA for v0.6.0 (via koni-docs backfill-commits)"
```

---

## Self-review checklist

- [ ] `npx koni-docs preview docs/` starts the server and serves a 200 on `/`.
- [ ] `npx koni-docs preview docs/` serves a 200 on `/docs/PRD` for this repo's PRD.
- [ ] `npx koni-docs preview docs/` serves a 200 on `/docs/sprints/stories/US-1.1-koni-docs-initial-release` (verifies nested slugs work).
- [ ] `npx koni-docs preview docs/` serves a 200 on `/docs/sprints/epics/EPIC-4` (verifies epic page).
- [ ] CLI `--port 4322 --host 0.0.0.0` flags are honored (verify by inspecting the server log).
- [ ] Mermaid diagrams in the source markdown render as `<pre class="mermaid">` blocks in the served HTML.
- [ ] Sidebar tree shows all top-level files in koni-docs canonical order (BRIEF, PRD, ARCHITECTURE, CONTEXT, CHANGELOG, LESSONS, SETUP).
- [ ] Story frontmatter card appears for any `/docs/sprints/stories/US-X.Y-*` route.
- [ ] `package.json` `files` field includes `src/viewer/**` so the viewer ships in the npm tarball.
- [ ] 71 tests pass; typecheck exits 0; build succeeds with `dist/cli/index.mjs` + shebang.
- [ ] EPIC-4 Stories table has 19 rows.

---

## Out-of-scope reminders (for Pillar F)

- **chokidar + SSE live-reload** — `--watch` flag was originally in the US-4.3 design. v0.6.0 ships without it; Astro dev's HMR does not reach the user's `docs/` tree.
- **`koni-docs.config.{json,mjs}` config file** — title/ordering overrides. v0.6.0 reads env + flags only.
- **Full `project.astro` overview page** — the 366-line per-project view from Koni-Finance-Final. Defer; v0.6.0 ships index + per-doc only.
- **PRD §8 section-header lookup fix in `sync`** — Pillar D real-data test showed `sync` doesn't match `## 8. Functional Requirements (FR)` headers because of the `(FR)` suffix. Real interop gap.
- **gray-matter writeDoc YAML normalization** — writes drop quotes around values (e.g., `"0.5.0"` → `0.5.0`). Round-trip is semantically clean but produces noisy git diffs.
- **`koni-docs validate` subcommand** (Tier C from the design spec — L3 ID graph validation).
- **npm publish `@koniverse/koni-docs@0.6.0`** — manual user step.
- **Optional: demote viewer deps (`astro`, `@astrojs/node`, `marked`, `shiki`, `chokidar`) from regular deps to peer deps** — would shrink install size for CLI-only users at the cost of an extra install step for `preview` users.
