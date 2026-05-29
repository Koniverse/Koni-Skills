---
id: sprint-2026-W22
status: in-progress
start: 2026-05-25T00:00:00.000Z
end: 2026-05-31T00:00:00.000Z
goal: >-
  Six ships in one sprint window — v0.3.0 → v0.4.0-dev.0 → v0.5.0-dev.0 → v0.5.0
  → v0.6.0 → v0.7.0 — taking @koniverse/koni-docs from a skill-only artifact
  into a published npm package with typed CLI + Astro SSR viewer + L3 ID-graph
  validator. Then reopened 2026-05-28 with Pillar G (project-page multi-view
  expansion: Board / Calendar / Analysis / Warning-as-validator + URL `?view=` +
  footer/UNION/sort) to ship v0.8.0 before sprint close. 36 stories / 124 pts /
  1 contributor. Continues directly from W21 (v0.2.0 dogfood + RULE-15 +
  AGENTS-canonical + Pattern B).
---
## Sprint scope

Stories are listed by ID; the `Pillar` column shows the natural execution group (A = skill follow-on, B = lib foundation, C = CLI subcommands, D = migration + polish, E = viewer scaffold, F = viewer polish). Each pillar maps cleanly to one published version.

| US      | Title                                                                 | Epic   | Pri | Points | Status   | Pillar | Ship         | Story file                                                                                               |
| ------- | --------------------------------------------------------------------- | ------ | --- | ------ | -------- | ------ | ------------ | -------------------------------------------------------------------------------------------------------- |
| US-1.5  | Real-world template + script audit (KFF + senti\_quant)               | EPIC-1 | P0  | 8      | ✅ done   | A      | v0.3.0       | [stories/US-1.5-real-world-template-script-audit.md](stories/US-1.5-real-world-template-script-audit.md) |
| US-4.5  | Lib core — corpus + doc module                                        | EPIC-4 | P0  | 5      | ✅ done   | B      | v0.4.0-dev.0 | [stories/US-4.5-lib-corpus-doc.md](stories/US-4.5-lib-corpus-doc.md)                                     |
| US-4.6  | Lib core — sections + tables (column-by-NAME, W22 fix)                | EPIC-4 | P0  | 5      | ✅ done   | B      | v0.4.0-dev.0 | [stories/US-4.6-lib-sections-tables.md](stories/US-4.6-lib-sections-tables.md)                           |
| US-4.7  | Lib core — checkboxes + Zod schemas                                   | EPIC-4 | P0  | 3      | ✅ done   | B      | v0.4.0-dev.0 | [stories/US-4.7-lib-checkboxes-schemas.md](stories/US-4.7-lib-checkboxes-schemas.md)                     |
| US-4.8  | Lib core — refs (L3 ID graph)                                         | EPIC-4 | P0  | 3      | ✅ done   | B      | v0.4.0-dev.0 | [stories/US-4.8-lib-refs.md](stories/US-4.8-lib-refs.md)                                                 |
| US-4.9  | Lib core — changelog + git utilities                                  | EPIC-4 | P0  | 3      | ✅ done   | B      | v0.4.0-dev.0 | [stories/US-4.9-lib-changelog-git.md](stories/US-4.9-lib-changelog-git.md)                               |
| US-4.10 | CLI framework + global opts                                           | EPIC-4 | P0  | 3      | ✅ done   | C      | v0.5.0-dev.0 | [stories/US-4.10-cli-framework.md](stories/US-4.10-cli-framework.md)                                     |
| US-4.11 | `koni-docs status` subcommand                                         | EPIC-4 | P0  | 3      | ✅ done   | C      | v0.5.0-dev.0 | [stories/US-4.11-cli-status.md](stories/US-4.11-cli-status.md)                                           |
| US-4.12 | `koni-docs sync` subcommand (W22 BLOCKER fix)                         | EPIC-4 | P0  | 5      | ✅ done   | C      | v0.5.0-dev.0 | [stories/US-4.12-cli-sync.md](stories/US-4.12-cli-sync.md)                                               |
| US-4.13 | `koni-docs inject-tasks` subcommand                                   | EPIC-4 | P0  | 3      | ✅ done   | C      | v0.5.0-dev.0 | [stories/US-4.13-cli-inject-tasks.md](stories/US-4.13-cli-inject-tasks.md)                               |
| US-4.14 | `koni-docs backfill-fields` subcommand                                | EPIC-4 | P0  | 2      | ✅ done   | C      | v0.5.0-dev.0 | [stories/US-4.14-cli-backfill-fields.md](stories/US-4.14-cli-backfill-fields.md)                         |
| US-4.15 | `koni-docs backfill-commits` subcommand                               | EPIC-4 | P0  | 3      | ✅ done   | C      | v0.5.0-dev.0 | [stories/US-4.15-cli-backfill-commits.md](stories/US-4.15-cli-backfill-commits.md)                       |
| US-4.16 | Migration docs (SKILL/sprint-system/CLAUDE/SETUP)                     | EPIC-4 | P1  | 3      | ✅ done   | D      | v0.5.0       | [stories/US-4.16-cli-migration-docs.md](stories/US-4.16-cli-migration-docs.md)                           |
| US-4.17 | Publish @koniverse/koni-docs\@0.5.0 to npm                            | EPIC-4 | P1  | 2      | ✅ done   | D      | v0.5.0       | [stories/US-4.17-cli-npm-publish.md](stories/US-4.17-cli-npm-publish.md)                                 |
| US-4.18 | CLI polish — 5 minor fixes                                            | EPIC-4 | P1  | 3      | ✅ done   | D      | v0.5.0       | [stories/US-4.18-cli-polish-fixes.md](stories/US-4.18-cli-polish-fixes.md)                               |
| US-4.1  | Scaffold `packages/koni-docs/src/viewer` + Astro SSR                  | EPIC-4 | P0  | 5      | ✅ done   | E      | v0.6.0       | [stories/US-4.1-scaffold-and-ssr.md](stories/US-4.1-scaffold-and-ssr.md)                                 |
| US-4.19 | `koni-docs preview` subcommand                                        | EPIC-4 | P0  | 3      | ✅ done   | E      | v0.6.0       | [stories/US-4.19-cli-preview.md](stories/US-4.19-cli-preview.md)                                         |
| US-4.2  | CLI bin + `koni-docs.config.{json,mjs}`                               | EPIC-4 | P0  | 5      | ✅ done   | F      | v0.7.0       | [stories/US-4.2-cli-bin-and-config.md](stories/US-4.2-cli-bin-and-config.md)                             |
| US-4.3  | Schema-graceful fallback + chokidar/SSE live reload                   | EPIC-4 | P0  | 5      | ✅ done   | F      | v0.7.0       | [stories/US-4.3-graceful-schema-and-live-reload.md](stories/US-4.3-graceful-schema-and-live-reload.md)   |
| US-4.20 | Viewer `/project` page — User Stories Tracker                         | EPIC-4 | P0  | 3      | ✅ done   | F      | v0.7.0       | [stories/US-4.20-project-page.md](stories/US-4.20-project-page.md)                                       |
| US-4.21 | Viewer `--watch` live-reload (chokidar + SSE)                         | EPIC-4 | P0  | 5      | ✅ done   | F      | v0.7.0       | [stories/US-4.21-live-reload.md](stories/US-4.21-live-reload.md)                                         |
| US-4.22 | `koni-docs.config.{json,mjs}` viewer config loader                    | EPIC-4 | P0  | 3      | ✅ done   | F      | v0.7.0       | [stories/US-4.22-viewer-config.md](stories/US-4.22-viewer-config.md)                                     |
| US-4.23 | `findSectionStartingWith` + PRD §8 prefix lookup                      | EPIC-4 | P0  | 3      | ✅ done   | F      | v0.7.0       | [stories/US-4.23-section-prefix.md](stories/US-4.23-section-prefix.md)                                   |
| US-4.24 | YAML quoting preservation in parseDoc/writeDoc                        | EPIC-4 | P0  | 5      | ✅ done   | F      | v0.7.0       | [stories/US-4.24-yaml-quoting.md](stories/US-4.24-yaml-quoting.md)                                       |
| US-4.25 | `koni-docs validate` subcommand + `validateFrRefs`                    | EPIC-4 | P0  | 3      | ✅ done   | F      | v0.7.0       | [stories/US-4.25-cli-validate.md](stories/US-4.25-cli-validate.md)                                       |
| US-4.26 | Lib cleanup — drop dead code                                          | EPIC-4 | P1  | 3      | ✅ done   | F      | v0.7.0       | [stories/US-4.26-lib-cleanup.md](stories/US-4.26-lib-cleanup.md)                                         |
| US-4.27 | Mutation-contract docblock on `lib/index.ts`                          | EPIC-4 | P1  | 1      | ✅ done   | F      | v0.7.0       | [stories/US-4.27-mutation-contract.md](stories/US-4.27-mutation-contract.md)                             |
| US-4.28 | Publish `@koniverse/koni-docs@0.7.0` to npm                           | EPIC-4 | P2  | 1      | ✅ done   | F      | v0.7.0       | [stories/US-4.28-publish-v0.7.0.md](stories/US-4.28-publish-v0.7.0.md)                                   |
| US-4.29 | Label-only PRD heading convention + legacy-number fallback in sync    | EPIC-4 | P0  | 3      | ✅ done   | F      | v0.7.2       | [stories/US-4.29-prd-label-only-headings.md](stories/US-4.29-prd-label-only-headings.md)                 |
| US-4.30 | Frontmatter Reference Spec + RULE-17 + arch\_ref / depends\_on schema | EPIC-4 | P0  | 3      | ✅ done   | F      | v0.7.3       | [stories/US-4.30-frontmatter-spec-rule17.md](stories/US-4.30-frontmatter-spec-rule17.md)                 |
| US-4.31 | Viewer `/project` Board view — 6-column kanban + group-by             | EPIC-4 | P0  | 3      | 🟢 ready | G      | v0.8.0       | [stories/US-4.31-viewer-board-view.md](stories/US-4.31-viewer-board-view.md)                             |
| US-4.32 | Viewer `/project` Calendar view — month grid + commits overlay        | EPIC-4 | P0  | 5      | 🟢 ready | G      | v0.8.0       | [stories/US-4.32-viewer-calendar-view.md](stories/US-4.32-viewer-calendar-view.md)                       |
| US-4.33 | Viewer `/project` Analysis view — KPIs, status, heatmap, epics        | EPIC-4 | P0  | 5      | 🟢 ready | G      | v0.8.0       | [stories/US-4.33-viewer-analysis-view.md](stories/US-4.33-viewer-analysis-view.md)                       |
| US-4.34 | Viewer `/project` Warning view — required-field validator             | EPIC-4 | P0  | 3      | 🟢 ready | G      | v0.8.0       | [stories/US-4.34-viewer-warning-validator.md](stories/US-4.34-viewer-warning-validator.md)               |
| US-4.35 | Viewer `/project` `?view=` URL persist + `?warn=1` shim               | EPIC-4 | P1  | 1      | 🟢 ready | G      | v0.8.0       | [stories/US-4.35-viewer-url-view-persist.md](stories/US-4.35-viewer-url-view-persist.md)                 |
| US-4.36 | Viewer `/project` footer + UNION buckets + default sort               | EPIC-4 | P1  | 2      | 🟢 ready | G      | v0.8.0       | [stories/US-4.36-viewer-footer-union-sort.md](stories/US-4.36-viewer-footer-union-sort.md)               |

**Total**: **36 stories / 124 points** — 30 shipped at v0.7.x (28 at v0.7.0 + US-4.29 at v0.7.2 + US-4.30 at v0.7.3); **6 ready (US-4.31 … US-4.36) targeting v0.8.0** under Pillar G. EPIC-1 closes at 100% via US-1.5 (5/5 stories, 27/27 pts cumulative including W21 + W19); EPIC-4 reopens for Pillar G after closing Pillars B–F (30/30 done + 6 ready ⇒ 36/36 once v0.8.0 ships, 116/116 pts).

## Sprint goal recap (post-mortem)

W21 closed v0.2.0 (dogfood + Pattern B + RULE-15 + AGENTS-canonical + CHANGELOG-at-docs). W22 picks up at v0.3.0 and compresses 6 more ships into a 4-day single-contributor push, taking `koni-docs` from a meta-skill rule book into a **published npm package** — `@koniverse/koni-docs@0.7.0` — with:

- **CLI**: 7 subcommands (`status`, `sync`, `inject-tasks`, `backfill-fields`, `backfill-commits`, `preview`, `validate`) replacing 5 historical `.mjs` scripts in the skill folder.
- **Lib**: typed `Doc` / `Corpus` value model with column-by-NAME table addressing, Zod schemas for story/epic/sprint/changelog-entry, L3 ID-graph + FR-ref validator, and changelog + git utilities — all pure-by-default (one documented exception in `parseTable(...).node`).
- **Viewer**: Astro SSR `packages/koni-docs/src/viewer/` shipped inside the same package, with `/project` User Stories Tracker, dashboard, file tree, syntax-highlighted code, Mermaid, chokidar+SSE live-reload, and optional `koni-docs.config.{json,mjs}` overrides.
- **Real-world audit**: v0.3.0 closed the W21 followup by dry-running `agile-sync-up.mjs` against Koni-Finance-Final (198 stories) and senti\_quant (266 stories) — caught the `escapeRegExp` BLOCKER + standardized 6 new sprint sections + RULE-16 (bare semver).

After this sprint, the dogfood loop is closed end-to-end: every artifact `koni-docs` claims to manage exists in this repo (carried from W21), and the CLI that manages those artifacts is the same one downstream consumers will install via `npm i -g @koniverse/koni-docs`.

**Why this sprint mattered**: continuation of [CONTEXT D6](../CONTEXT.md) — every gap should be caught here, not by a downstream consumer team. **4 mid-sprint pickups + 1 column-by-NAME BLOCKER + 1 BLOCKER-class regex-escape bug** were all caught and codified during this window — none reached a consumer.

## Pillar plan (executed in 6 phases mapping 1:1 to published versions)

| Pillar | Focus                                                                                                                  | Stories                                    | Ship             | Result                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A**  | Real-world template + script audit (W21 follow-on)                                                                     | US-1.5 (1 story)                           | **v0.3.0**       | ✅ Done. BLOCKER fix on regex-escape; KFF + senti\_quant exit 0 in dry-run; 6 new sprint sections standardized; RULE-16 (bare semver) catalog 10 → 11.                                                                                                                                                                                                                                                                  |
| **B**  | Lib foundation — parse/section/table/checkbox/schema/refs/changelog                                                    | US-4.5..4.9 (5 stories)                    | **v0.4.0-dev.0** | ✅ All 5 done. Typed `Doc`/`Corpus`, column-by-NAME tables (W22 BLOCKER fix root cause), Zod schemas, L3 ID graph, changelog + git utils.                                                                                                                                                                                                                                                                               |
| **C**  | CLI subcommands replacing `.mjs` scripts                                                                               | US-4.10..4.15 (6 stories)                  | **v0.5.0-dev.0** | ✅ All 6 done. `commander` wiring + `status` / `sync` (W22 BLOCKER fix delivered to end-users) / `inject-tasks` / `backfill-fields` / `backfill-commits`. 5 historical `.mjs` scripts deleted.                                                                                                                                                                                                                          |
| **D**  | Migration docs + Pillar C polish + first publish                                                                       | US-4.16, US-4.17, US-4.18 (3 stories)      | **v0.5.0**       | ✅ All 3 done. Agent-facing docs (SKILL.md / sprint-system.md / CLAUDE.md / SETUP.md) point at CLI; consumer migration table shipped; v0.5.0 npm publish (US-4.17).                                                                                                                                                                                                                                                     |
| **E**  | Viewer scaffold + preview subcommand                                                                                   | US-4.1, US-4.19 (2 stories)                | **v0.6.0**       | ✅ Both done. Astro SSR `packages/koni-docs/src/viewer/` with runtime `KONI_DOCS_DIR`. `koni-docs preview` spawns Astro dev with `--port` / `--host` / `--open` / `--watch`.                                                                                                                                                                                                                                            |
| **F**  | Viewer polish + CLI validate + lib cleanup + v0.7.0 publish                                                            | US-4.2, US-4.3, US-4.20..4.28 (11 stories) | **v0.7.0**       | ✅ All 11 done. `/project` page, `--watch` live-reload (no longer no-op), config loader, `findSectionStartingWith`, YAML-quote preservation, `koni-docs validate`, dead-code drop, mutation-contract docblock, v0.7.0 published (US-4.28).                                                                                                                                                                              |
| **G**  | Project page multi-view expansion (Board / Calendar / Analysis / Warning validator + URL `?view=` + Footer/UNION/sort) | US-4.31..4.36 (6 stories)                  | **v0.8.0**       | 🚧 Ready. Closes the three disabled tabs from US-4.20 (Board / Calendar / Analysis), replaces the filter-only Warning with the koni-erp-02 §4.8 required-field validator, persists active view via `?view=`, adds footer metadata + UNION-semantics epic buckets + default sort. Reference design: [koni-erp-02 pod-project-screen.md](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md). |

**Day budget**: planned 7 (W22 calendar window 2026-05-25 → 2026-05-31). Pillars A–F closed 2026-05-28 (4 days, all shipped through v0.7.3). Pillar G reopened the sprint on 2026-05-28 for the remaining 3-day window (close target 2026-05-31). Compression for A–F was possible because each pillar gated the next (B before C, C before D, E before F); G runs as a pure-frontend pillar with no upstream dependency on lib/CLI changes.

## Closed mid-sprint W22

- **Pickup #1 — Real-world script audit (US-1.5)** — carried from W21 as a v0.3.0 candidate after `jindo9986`'s Koni-ERP-02 audit signal. Ran `agile-sync-up.mjs` against KFF + senti\_quant, exposed `escapeRegExp` BLOCKER, fixed + shipped as v0.3.0.
- **Pickup #2 — Column-by-NAME table BLOCKER** — surfaced during Pillar B impl of US-4.6. Position-based table column access in `agile-sync-up.mjs` silently wrote status icons into the wrong `Carry` column when frontmatter reordered columns. Fixed at the lib layer (US-4.6) + delivered to end-users via the CLI (US-4.12). Regression test locked in `__tests__/cli/sync.test.ts`.
- **Pickup #3 — Viewer `/project` page (dead 404 since v0.6.0)** — surfaced during Pillar F polish. Sidebar link to "Project Stories" in `Layout.astro` line 126 was 404 since v0.6.0. Ported 366-line tracker from Koni-Finance-Final (US-4.20). Triggered later UI tweaks (border-radius reduction + filter ↔ URL search-param sync).
- **Pickup #4 — `--watch` flag was a no-op** — surfaced during Pillar F polish. The documented `--watch` flag took no actual effect since v0.6.0. Wired chokidar + SSE reload-bus + EventSource subscribe in US-4.21. Flag is now functional.
- **Pickup #5 — Three disabled tabs on `/project` (Board / Calendar / Analysis) + degenerate Warning** — surfaced on 2026-05-28 while dogfooding the v0.7.3 viewer. US-4.20 ported the toolbar with all five view buttons but only Table was wired; Board / Calendar / Analysis carried `disabled` + "Coming soon"; the Warning tab was a misnamed `status ∈ {backlog, blocked}` filter, not the validator the label implied. Spawned Pillar G (US-4.31..4.36) referencing [koni-erp-02 `pod-project-screen.md`](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md) as the design of record.

## Per-Epic Retrospective

| Epic   | Retro Status | Notes                                                                                                                                                                                                                                                                       |
| ------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EPIC-1 | done         | US-1.5 shipped at v0.3.0 — closes the epic (5/5 stories, 27/27 pts cumulative across W19 + W21 + W22).                                                                                                                                                                      |
| EPIC-4 | in-progress  | Pillars B–F shipped (30/30 stories across v0.4.0-dev.0 → v0.7.3; US-4.28 published `@koniverse/koni-docs@0.7.0`). Pillar G reopened 2026-05-28 for the `/project` multi-view expansion (US-4.31..4.36, 6 stories / 19 pts) targeting v0.8.0 before sprint close 2026-05-31. |

## Contributors

Sprint-2026-W22: **1 primary contributor, 28 shipped stories, 99 points, 0 outside-help** across 6 published versions (v0.3.0, v0.4.0-dev.0, v0.5.0-dev.0, v0.5.0, v0.6.0, v0.7.0).

| GitHub login                            | Git name | Stories shipped                                                | Points | Notes                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | -------- | -------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`saltict`](https://github.com/saltict) | AnhMTV   | US-1.5, US-4.1..4.3, US-4.5..4.28 (skipping US-4.4 deprecated) | 99     | Solo single-session push with the AI agent across the 4-day window. Note: post-sprint `jindo9986` PR-merged a policy update softening RULE-15 to "assignee = commit AUTHOR from `git log %an`, not session user" — see [post-sprint cross-contributor activity](#post-sprint-cross-contributor-activity). |

### Post-sprint cross-contributor activity

After the v0.7.0 ship on 2026-05-28, two non-sprint-scoped policy updates were merged via PR from `jindo9986`:

| PR | Commit                                                             | Change                                                                       | Status                                                                                                                                                                                                                                             |
| -- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #2 | [df88d59](https://github.com/Koniverse/Koni-Skills/commit/df88d59) | feat(koni-docs): add story-sizing evaluation rule for sales + marketing work | Originally landed in W21 directly to `main`; PR #2 formalizes the same rule into the canonical skill template post-v0.7.0.                                                                                                                         |
| #3 | [056b10f](https://github.com/Koniverse/Koni-Skills/commit/056b10f) | docs(koni-docs): require story assignee from commit author, not session user | Softens RULE-15 (introduced in W21 v0.2.0) — assignee should be the commit AUTHOR (`git log -1 --format=%an <sha>`), not the session user (`gh api user`). Reflected in [story.md template](../../skills/koni-docs/references/templates/story.md). |

These post-sprint commits are not assigned to a US in W22 — they're cross-repo policy adjustments folded into the skill template after EPIC-4 closed. Future sprints should either pre-size such adjustments or open `collab/` stories.

## Retrospective

> Six ships in this sprint window. Retros are condensed per-ship below — full per-pillar narratives live in the story files and in CHANGELOG entries.

### v0.7.0 (Pillar F — viewer polish + validate + cleanup + publish) — What went well

- **`/project` page port closed the dashboard loop.** The dead 404 in `Layout.astro` line 126 became a working User Stories Tracker (35 rows) in a single story (US-4.20). UI tweaks (border-radius reduction, filter ↔ URL search-param sync) landed as a follow-up against the same page.
- **`--watch` finally works.** Chokidar + SSE single-watcher + 300 ms-debounced reload-bus + EventSource subscribe pattern is reusable for any future Astro SSR feature that needs server-pushed reloads (US-4.21).
- **`koni-docs validate` separates read-only checks from mutating ops.** Catches dangling FR-refs and L3 ID graph violations without touching disk (US-4.25). `--json` flag opens the door to CI integration without scraping stdout.
- **YAML quoting preservation removed a class of round-trip diff noise** (US-4.24). `Doc.frontmatterQuoting` Map preserves `"` vs `'` per field across `parseDoc → writeDoc`. Several future CLI commands depend on this.
- **Lib cleanup paid down latent debt** (US-4.26 + US-4.27). `serializeChangelog` stub + `recursive` param + `unist-util-visit` dep all dropped. Mutation-contract docblock on `lib/index.ts` documents the pure-by-default convention + names the `parseTable(...).node` exception explicitly.
- **v0.7.0 published** (US-4.28). Closes EPIC-4 100%.

### v0.7.0 — What didn't

- **Pillar F absorbed mid-sprint scope (US-4.20 + US-4.21).** Originally only US-4.2 / US-4.3 were planned for the viewer polish phase. The dead-link 404 and the no-op `--watch` flag were both discovered while QA-ing the v0.6.0 ship. Each was small enough to absorb, but a stricter sprint discipline would have parked them for a v0.8.

### v0.6.0 (Pillar E — viewer scaffold + preview) — Highlights

- **`packages/` namespace established.** US-4.1 lifted `Koni-Finance-Final/apps/docs/` into a reusable package skeleton inside this monorepo. Decoupled `DOCS_DIR` from monorepo paths (sourced from `process.cwd()/docs` or `KONI_DOCS_DIR`).
- **`koni-docs preview`** (US-4.19) added an Astro SSR-spawning subcommand with `--port` / `--host` / `--open` / `--watch` flags.
- **Notable**: `--watch` was wired in v0.6.0 as flag-only (no-op behavior); the watcher itself landed in Pillar F (US-4.21). Logged as Pillar E debt at the time.

### v0.5.0 (Pillar D — migration docs + polish + first publish) — Highlights

- **`.mjs` script deletion was definitive** (US-4.16). `agile-sync-up.mjs`, `agile-inject-tasks.mjs`, `agile-backfill-fields.mjs`, `changelog-backfill-commits.mjs`, `sync-test.mjs`, `generate-status.mjs` — all removed. CLI subcommands replace them 1:1 with strictly-typed counterparts.
- **Five polish fixes from code review** (US-4.18): `inject-tasks --dry-run` previewed before write, `sync` stderr on partial fail, `SyncStats` fields normalized, pre-release tests added, version skew between `package.json` and CLI banner caught.
- **First npm publish** (US-4.17): `@koniverse/koni-docs@0.5.0` shipped to the `@koniverse` org. Establishes the publish workflow that v0.6.0 / v0.7.0 then reuse.

### v0.5.0-dev.0 (Pillar C — CLI subcommands) — Highlights

- **6 subcommands in one phase**: `status` (US-4.11) regenerates STATUS.md kanban; `sync` (US-4.12) propagates story status through 5 doc layers via column-by-NAME (delivers the W22 BLOCKER fix to end-users); `inject-tasks` (US-4.13) regenerates `## Tasks` from AC checkboxes; `backfill-fields` (US-4.14) merges `STORY_DEFAULTS` for missing keys; `backfill-commits` (US-4.15) replaces pending SHA via git. All built on top of Pillar B lib primitives.
- **`commander` wiring + global flags** (US-4.10): `--docs-path` / `--dry-run` / `--json` / `--verbose` consistent across all subcommands. The `--dry-run` discipline (preview-before-write) catches surprises before they hit disk.
- **What didn't**: the BLOCKER regression test was almost shipped without locking the actual failing column-order fixture. Caught in code review during US-4.12 — fixture added to `__tests__/cli/sync.test.ts` before merge.

### v0.4.0-dev.0 (Pillar B — lib foundation) — Highlights

- **Typed `Doc` / `Corpus` value model** (US-4.5) replaced ad-hoc `gray-matter` calls scattered across the old `.mjs` scripts. All downstream callers see the same parsed shape.
- **Column-by-NAME table addressing** (US-4.6) eliminated the position-dependency root cause of the W22 BLOCKER. Old code: `cells[2]` (Status). New code: `getColumn(table, "Status")`. The `Carry` column reorder in real-world sprints (caught in US-1.5 audit) becomes a no-op.
- **L3 ID graph** (US-4.8): `listChildrenOf` / `listReferrersTo` / `validateRefs` for cross-doc IDs (EPIC↔Story, FR↔Story, sprint↔Story). Powers `koni-docs validate` in Pillar F.
- **What didn't**: changelog parse round-trip (US-4.9) initially round-tripped *almost* losslessly — bullets order preserved, but heading-anchor blank lines were collapsed. Fixed via explicit `keepBlankLines` flag on the remark stringify step.

### v0.3.0 (Pillar A — real-world template + script audit) — What went well

- **Real-world data caught the BLOCKER first try.** The `escapeRegExp` bug existed since v0.1.0 but the small in-repo test fixtures never triggered it. One dry-run against Koni-Finance-Final's 198 stories exposed it within seconds. Lesson: **regression tests built from controlled fixtures are necessary but not sufficient — periodic dry-runs against real consumer repos are the only way to surface the trap class** ([LESSONS §5](../LESSONS.md)).
- **Two reference repos provided complementary signal.** KFF (multi-dev team-sprint, messy data) caught the BLOCKER. senti\_quant (single maintainer, cleaner data) confirmed the script worked end-to-end at scale (266 stories). Neither alone would have surfaced everything.
- **Template additions came from observed practice, not aspiration.** Every new sprint section (`Carry`, `Why <US>`, `Parked`, `Closed mid-sprint`, `Risks`, `Carry-overs`) was already in use by at least one of the two reference repos. We just standardized them.
- **RULE-16 finally landed.** Deferred 3 times since v0.2.0; the real-world retro made the trade-off (template touch-ups vs. long-term `vv` corruption) obvious. Sweep across this repo's existing `version_shipped:` values was zero-touch — all already bare semver per the [LESSONS §4](../LESSONS.md) fix.

### v0.3.0 — What didn't

- **Single-session shipped 8 pts in one sitting.** AC-1..15 implemented + 30-line LESSONS entry + 200-line CHANGELOG without a checkpoint. The WIP-limit guidance update (AC-13, declared limit = 3) was written WHILE exceeding it. Excused as before (atomic ship at sprint close), but a cleaner story breakdown would have been: US-1.5a (BLOCKER fix only, ship as v0.2.1 patch) → US-1.5b (template additions) → US-1.5c (RULE-16). Filed as retro note for future single-agent sprints.
- **PRD §11 entry-finder still imperfect.** AC-4 reduced KFF warning count from \~190 → 0 (via downgrade to info), but the underlying script doesn't actually *match* KFF's per-epic-only PRD layout — it just doesn't complain. Filed as future story when picked up.

## Followups (status at sprint close)

- ✅ **RULE-16 shipped** in v0.3.0 (US-1.5 AC-10). Catalog 10 → 11.
- ✅ **Real-world script audit shipped** in v0.3.0 (US-1.5). BLOCKER fix on regex-escape; KFF + senti\_quant exit 0 in dry-run.
- ✅ **Column-by-NAME BLOCKER fix shipped** to lib in v0.4.0-dev.0 (US-4.6) and to end-users in v0.5.0-dev.0 (US-4.12).
- ✅ **`.mjs` script removal complete** (Pillar D, US-4.16). CLI is now the only supported surface.
- ✅ **Viewer scaffold + preview subcommand** (Pillar E, v0.6.0).
- ✅ **Viewer polish + validate + cleanup + v0.7.0 publish** (Pillar F).
- ✅ **`@koniverse/koni-docs@0.5.0` published** (US-4.17, v0.5.0).
- ✅ **`@koniverse/koni-docs@0.7.0` published** (US-4.28, v0.7.0). EPIC-4 Pillars B–F close 100% (30/30 done at v0.7.3).
- 🚧 **Pillar G reopened** (US-4.31..4.36, 6 stories / 19 pts) targeting v0.8.0 — `/project` multi-view expansion (Board / Calendar / Analysis / Warning validator + URL `?view=` + footer/UNION/sort) per [koni-erp-02 pod-project-screen.md](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md). Spec: [2026-05-28-project-page-multi-view-design.md](../superpowers/specs/2026-05-28-project-page-multi-view-design.md).
- 📋 **EPIC-3** — US-3.1 (plugin-skill pattern: Supabase / Next.js) still backlog, **not assigned to any sprint** because no concrete execution plan is locked yet. Next planning gate.
- 🚧 **Assignee policy clarified post-v0.7.0** — RULE-15 originally said "GitHub login from `gh api user`". Updated policy from PR #3 (`jindo9986`): "commit AUTHOR from `git log -1 --format=%an <sha>`, NOT the session user". See [story.md template](../../skills/koni-docs/references/templates/story.md). Sweep RULE-15 references in SKILL.md if any stale.

## Cross-references

- [EPIC-1](epics/EPIC-1.md) — closed at v0.3.0 (5/5 stories, 27/27 pts; W19 + W21 + W22)
- [EPIC-2](epics/EPIC-2.md) — closed at v0.2.0 in W21 (4/4 stories, 11/11 pts)
- [EPIC-3](epics/EPIC-3.md) — backlog, no sprint assignment yet (awaits concrete plan)
- [EPIC-4](epics/EPIC-4.md) — Pillars B–F closed at v0.7.3 (30/30 done, 97/97 pts); Pillar G in-progress for v0.8.0 (6 ready, +19 pts)
- All 28 sprint stories: see [Sprint scope](#sprint-scope) table above
- [PRD FR-1..FR-18, AD-1..AD-10](../PRD.md#8-functional-requirements)
- [CONTEXT D1..D11](../CONTEXT.md)
- [LESSONS §1..§5](../LESSONS.md) — §4 → RULE-16; §5 = regex-escape trap
- [CHANGELOG](../CHANGELOG.md) — v0.3.0, v0.4.0-dev.0, v0.5.0-dev.0, v0.5.0, v0.6.0, v0.7.0
- [Previous sprint: W21](sprint-2026-W21.md) — v0.2.0 (dogfood + Pattern B + RULE-15 + AGENTS-canonical)
- [Archived sprint: W19](archive/sprint-2026-W19.md) — koni-docs initial release (v0.1.0)
- [Pillar B spec](../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md) — lib foundation design
- [Pillar B plan](../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md)
- [Pillar C plan](../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md)
- [Pillar F plan](../superpowers/plans/2026-05-28-pillar-f.md)
- [README.md](../README.md) — sprint schema + scripts
- [STATUS.md](STATUS.md) — current auto-generated kanban
