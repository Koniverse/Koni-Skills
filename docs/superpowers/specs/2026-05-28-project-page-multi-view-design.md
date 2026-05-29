---
name: project-page-multi-view-design
stage: spec
parent_epic: EPIC-4
parent_stories: [US-4.31, US-4.32, US-4.33, US-4.34, US-4.35, US-4.36]
created: 2026-05-28
updated: 2026-05-28
---

# Project page multi-view expansion — design spec

> **Pillar G of EPIC-4.** Expands the read-only `/project` route in the
> `@koniverse/koni-docs` Astro viewer from a single Table view into the
> 5-view tracker pattern proven in Koni-ERP-02. Six user stories
> (US-4.31 … US-4.36) carve up the work; this spec is the shared
> contract they all reference.

## Background

US-4.20 (v0.7.0) ported the User Stories Tracker from
Koni-Finance-Final into the viewer. The toolbar already declares five
view tabs — **Table · Board · Calendar · Analysis · Warning** — but
only Table is wired. The other three are disabled (`title="Coming
soon"`) and Warning is a degenerate "filter by status ∈ {backlog,
blocked}" toggle, not the validator behaviour the tab title implies.

Meanwhile Koni-ERP-02 (`koni-erp-02/Docs/pod-project-screen.md`) has
been running the same 5-view tracker against real pods for two
months. The logic there is the design-of-record:

- All five views derive from one in-memory `stories[]` array
- Shared filter composition (sprint → search) feeds Table/Board/Calendar
- Analysis is search-unaffected; Warning ignores the sprint filter
- Group-by buckets Table and Board identically (epic / sprint /
  assignee / shipped, with `(no <field>)` placeholders sorted last)
- Default sort is `STORY_STATUS_ORDER asc → priority asc → updated desc`
- Required-field validation kicks in when a story leaves `backlog`

This spec ports those rules into the koni-docs viewer **without** the
parts that don't apply to a local file-based renderer: multi-repo
aggregation, DB-first caching, OAuth fallbacks, and the "background
inngest sync vs live API" branching. Our equivalent of "data is fresh"
is the chokidar+SSE live-reload shipped in US-4.21.

## Goals

1. Close the visual-affordance gap: every tab in the toolbar must do
   what its label says. No more `disabled` view tabs.
2. Match Koni-ERP-02 view semantics so a contributor moving between
   the two products sees the same mental model.
3. Stay schema-graceful — every view must render cleanly when the
   corpus has no sprints, no commits, or no `done` stories.
4. No new heavy dependencies. Reuse `lib/git` (US-4.9), `corpus.ts`
   accessors, and inline `<script>` islands. SSR-first, no React.

## Non-goals (defer)

- **People / per-assignee stats** in Analysis (Koni-ERP-02 has them;
  koni-docs deferred until a future story).
- **Multi-repo aggregation** — `KONI_DOCS_DIR` is one folder.
- **Background refresh / cache invalidation** — chokidar watch is
  sufficient; no manual Refresh button.
- **Hosted dashboard / authentication** — PRD §3 permanently out of
  scope.
- **PDF / printable export** — candidate for a later epic.

## Architecture

```
viewer/pages/project.astro          (existing — extended)
  ├── inline <script> islands       ─ view dispatcher
  └── Layout + sidebar              ─ unchanged
                                                   ┌─ lib/git (US-4.9)
viewer/lib/corpus.ts                (existing)     │
  └── loadDashboardData()                          │  loadDailyCommits()
                                                   │  loadCommitActivity()
viewer/lib/analysis.ts              (NEW)          │  buildAnalysisStats(...)
viewer/lib/calendar.ts              (NEW) ─────────┘  buildMonthGrid(...)
viewer/lib/warnings.ts              (NEW)             findStoryWarnings(...)
```

Each view tab becomes one render function inside `project.astro`'s
client `<script>`, dispatched from the existing tab-button click
handler. SSR builds the shell + each view's initial DOM; the client
swaps innerHTML on tab change. No router, no hydration framework.

## View contracts

### View tab dispatcher

URL param `?view=table|board|calendar|analysis|warning` (default
`table`). On click, the active view function renders into
`#stories-view-container`. The existing `#stories-table-wrapper` is
renamed to `#stories-view-container` to host any view's output.

Legacy `?warn=1` (US-4.20's filter-only impl) redirects silently to
`?view=warning` for one minor version. **US-4.35** owns this.

### Shared filter composition

```
stories
  └── sprint filter (if ≠ all)     → sprintFiltered
        └── search filter (if any) → tableBoardStories
```

- Table, Board, Calendar consume `tableBoardStories`
- Analysis consumes `sprintFiltered` (search-unaffected, per ERP §4.1)
- Warning consumes `stories` then `searchFilter` only (ignores sprint
  filter — global gap visibility)

### Default sort

`compareStories(a, b)`:
1. `STORY_STATUS_ORDER` rank asc (backlog → ready → in-progress →
   review → blocked → done → reverted → deprecated)
2. priority rank asc (P0 first, missing last)
3. `updated` desc (newest first, missing last)

Applied to Table, Board (within column), Calendar (within day), and
each group bucket. **US-4.36** owns the implementation.

### Group-by buckets (Table + Board)

| `group` | Bucket key         | Placeholder       |
| ------- | ------------------ | ----------------- |
| epic    | `s.epic`           | `(no epic)`       |
| sprint  | `s.sprint`         | `(no sprint)`     |
| assignee| `s.assignee`       | `(unassigned)`    |
| shipped | `s.version_shipped`| `(unshipped)`     |

Placeholder buckets sort last. UNION semantics for epic: bucket map
is **seeded from `loadDashboardData().epics`** so newly-created
`EPIC-N.md` files with zero stories still render as empty group
headers (parity with ERP §4.3). **US-4.36** owns the seeding.

### Board view (US-4.31)

Six kanban columns matching `STORY_STATUS_ORDER` minus `reverted` and
`deprecated`. Within a column: `compareStories`. Card content reads
directly from frontmatter: title, priority chip, epic, sprint,
assignee, commit (each only when present).

When `groupBy ≠ none`: render N stacked 6-column kanbans, one per
bucket, each with a collapsible header that mirrors the Table group
header (same labels, same sort, same `done/total` count).

### Calendar view (US-4.32)

Month grid (rows = weeks, cols = Sun-Sat). Each day cell shows:

- Story count: stories whose `updated` falls on that day (after
  sprint+search filter)
- Commit count: commits authored that day (from `loadDailyCommits`)

Clicking a day expands a popover/inline list of that day's
`[US-X.Y] title` rows and `<sha7> <subject>` rows. Prev/next month
buttons navigate; default month = today.

`loadDailyCommits()` is a new helper in `viewer/lib/calendar.ts` that
wraps `lib/git` from US-4.9. Returns `Map<dateISO, CommitMeta[]>`.

### Analysis view (US-4.33)

Five panels:

1. **Hero KPIs**: start date (earliest sprint start), days elapsed,
   `N/M done`, completion percentage + progress bar, warning count
   (links to Warning tab via `?view=warning`)
2. **Status breakdown**: horizontal bar per `STORY_STATUS_ORDER` value
3. **Stories completed (last 30 days)**: vertical bar chart, one bar
   per day, height = stories flipped to `done` (proxy: `updated` field
   on stories with `status: done`)
4. **Commit activity**: GitHub-style 26-week heatmap, rows = day of
   week, cols = weeks. Source: `loadCommitActivity()` in
   `viewer/lib/calendar.ts`
5. **Epic progress**: list of all epics (UNION with parsed
   `epics/EPIC-N.md` files), each with title, status, `done/total`,
   progress bar

Analysis is search-unaffected (per ERP §4.1) so the panel labels stay
stable while a user types in the search box for Table/Board.

### Warning view (US-4.34)

Replaces US-4.20's filter-only implementation. Logic in new
`viewer/lib/warnings.ts`:

```
findStoryWarnings(stories): StoryWarning[]
  for each story with status !== "backlog":
    required = ["priority", "points", "sprint", "assignee"]
    if status === "done":
      required += ["version_shipped", "commit"]
    missing = required.filter(field => isMissing(story[field]))
    if missing.length > 0: emit { id, title, epic, status, missing }
```

`isMissing(v)`:
- `undefined`, `null`, or whitespace-only string → missing
- `points: 0` → present (legit zero-point story)
- empty array → missing (for list-form fields)

Rendered table columns: `ID | Title | Epic | Status | Missing fields`.
Missing fields render as red chips. Sort: missing-count desc, then
status order. Warning ignores sprint filter (global) but does honor
search filter.

Empty-state when no warnings: `✓ No warnings — all non-backlog stories
have required fields.`

### URL state (US-4.35)

```
?view=table|board|calendar|analysis|warning   (default: table)
?sprint=<sprint-id>|all                       (default: all)
?group=none|epic|sprint|assignee|shipped      (default: none)
?search=<text>                                (optional)
?warn=1                                       (legacy → redirect ?view=warning)
```

All written via `history.replaceState` on change. Read on
`astro:page-load`. No URL change triggers a re-render directly — the
render function reads state on every call.

### Footer (US-4.36)

Strip below `#stories-view-container`:

```
N of M stories · K epics · S file(s) skipped · Updated <relative>
```

Counts come from `loadDashboardData()` meta. "Updated" is the file
mtime of the most-recently-modified story file (proxy for "data
freshness").

## Cross-cutting invariants (inherited)

- **Read-only contract**: no view ever writes to `KONI_DOCS_DIR`.
  Enforced by code review + the grep gate in the lib mutation
  contract from US-4.27.
- **Schema-graceful** (US-4.3): if no sprints/stories/commits, every
  view shows a polite empty-state panel.
- **No hard-coded Koni-specific paths**: `koni-docs.config.{json,mjs}`
  ordering still drives sidebar, but does not affect `/project` view
  logic.
- **English-only (RULE-13)**: all visible UI strings English.
- **RULE-17** (frontmatter ID hygiene): every new story's `prd_ref` /
  `arch_ref` / `depends_on` uses bare canonical IDs in list form.

## Story decomposition

| Story   | Surface                            | Pri | Pts | Deps                |
| ------- | ---------------------------------- | --- | --- | ------------------- |
| US-4.31 | Board view (kanban + group-by)     | P0  | 3   | —                   |
| US-4.32 | Calendar view + commits overlay    | P0  | 5   | US-4.9 (lib/git)    |
| US-4.33 | Analysis view (stats + heatmap)    | P0  | 5   | US-4.9, US-4.32     |
| US-4.34 | Warning view (full validator)      | P0  | 3   | US-4.7 (schemas)    |
| US-4.35 | `?view=` URL persist + legacy shim | P1  | 1   | —                   |
| US-4.36 | Footer + UNION + default sort      | P1  | 2   | —                   |

Total: **6 stories / 19 points**, all targeted at sprint-2026-W22
(reopened) under EPIC-4 Pillar G. Ship vehicle: **v0.8.0** (minor
bump from v0.7.3).

## Acceptance criteria propagated to stories

- [ ] No view tab in the toolbar carries `disabled` or "Coming soon"
- [ ] `?view=` round-trips on reload
- [ ] Legacy `?warn=1` redirects to `?view=warning` silently
- [ ] Empty-state panels render when corpus has no stories / no
      sprints / no commits
- [ ] `npm test` in `packages/koni-docs/` passes
- [ ] `koni-docs validate --include-warnings` against this repo:
      - if Warning view says "no warnings", validate must also exit 0
        for the field-completeness checks the view duplicates

## References

- [koni-erp-02 `pod-project-screen.md`](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md) — design of record
- [US-4.20 — Viewer `/project` page](../../sprints/stories/US-4.20-project-page.md) — the Table-only predecessor
- [US-4.9 — Lib changelog + git](../../sprints/stories/US-4.9-lib-changelog-git.md) — git utility surface reused by Calendar + Analysis
- [US-4.21 — `--watch` live reload](../../sprints/stories/US-4.21-live-reload.md) — equivalent of "background sync"
- [Pillar F design spec](2026-05-28-pillar-f-design.md) — predecessor pillar
