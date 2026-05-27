---
id: sprint-2026-W23
status: in-progress
start: 2026-05-27
end: 2026-06-03
goal: "Ship @koniverse/docs-viewer v0.1.0 — first publishable npm package outside the skill catalog; open EPIC-4 (Docs preview tooling)"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-4.1 | Scaffold `packages/koni-docs-viewer` + Astro SSR migration | EPIC-4 | P0 | 5 | 🟢 ready | new | [stories/US-4.1-scaffold-and-ssr.md](stories/US-4.1-scaffold-and-ssr.md) |
| US-4.2 | CLI bin + `koni-docs.config.{json,mjs}` support | EPIC-4 | P0 | 5 | 🟢 ready | new | [stories/US-4.2-cli-bin-and-config.md](stories/US-4.2-cli-bin-and-config.md) |
| US-4.3 | Schema-graceful fallback + chokidar/SSE live reload | EPIC-4 | P0 | 5 | 🟢 ready | new | [stories/US-4.3-graceful-schema-and-live-reload.md](stories/US-4.3-graceful-schema-and-live-reload.md) |
| US-4.4 | Dogfood in Koni-Skills + publish `@koniverse/docs-viewer@0.1.0` | EPIC-4 | P1 | 3 | 🟢 ready | new | [stories/US-4.4-dogfood-and-publish.md](stories/US-4.4-dogfood-and-publish.md) |

**Total**: **18 points** across 4 stories, all under EPIC-4 (Docs preview tooling).

> Sprint scope uses the 7-column `Carry`-annotated shape (Koni-Finance-Final pattern) even with no carries this sprint — keeps the format consistent across sprints. AC + Tasks live in each story file.

## Sprint goal recap

W22 closed earlier today (2026-05-27) with **two releases stacked**:
v0.2.0 (dogfood + Pattern B + RULE-15 + AGENTS-canonical) AND a
reopened-mid-day v0.3.0 absorbing US-1.5 (real-world template + script
audit). EPIC-1 and EPIC-2 both close at 100%.

W23 opens **EPIC-4 (Docs preview tooling)** — the first non-skill
Koniverse publishable package. After this sprint a Koniverse engineer
can run `npx @koniverse/docs-viewer` in any project root with a `docs/`
folder and get a polished local preview without copying an Astro app
into every repo.

The deliverable cut for W23:

- **In**: scaffold + SSR + CLI + config + schema-graceful + live reload
  + dogfood + npm publish of `@koniverse/docs-viewer@0.1.0`.
- **Deferred**: full-text search, PDF export, multi-repo aggregation,
  CI publish gate, `@next` prerelease channel — all v0.2 candidates
  for `@koniverse/docs-viewer`.

Why this sprint matters: shipping a public npm package under
`@koniverse/` opens the org-scoped namespace and proves the catalog
supports more than skills. EPIC-3 (plugin-skill pattern) becomes
unblocked once EPIC-4 closes and the `packages/` vs `skills/`
distinction is established in working code, not just in [CONTEXT D11](../CONTEXT.md).

## Phased plan

1. **Phase 1 — Scaffold + SSR** (~1.5 days): US-4.1. Package skeleton,
   reference impl import from `Koni-Finance-Final/apps/docs/`, SSR
   migration, smoke against this repo's `docs/`. Gates the rest of EPIC-4.
2. **Phase 2 — CLI + config** (~1.5 days): US-4.2. `bin/` entry with
   `parseArgs`, `--port/--host/--open/--watch/--config`, optional
   `koni-docs.config.{json,mjs}` loader.
3. **Phase 3 — Graceful + live reload** (~2 days): US-4.3. Schema
   detection, plain-mode fallback, chokidar + SSE auto-reload, test
   fixtures (`minimal-docs/`, `koni-sprints-docs/`).
4. **Phase 4 — Dogfood + publish** (~1 day): US-4.4. `npm run
   docs:preview` wiring, README, LICENSE, `@koniverse` org check,
   `npm publish --access public`, smoke `npx @koniverse/docs-viewer@0.1.0`
   against `Koni-Finance-Final`.

Day budget: ~6 days against a 7-day sprint window; 1 day buffer for
mid-sprint scope creep (LESSONS §5 — W22 absorbed 4 mid-sprint pickups).

## Parked / deferred from W22

- ✅ **Closed in W22 (v0.3.0, reopened mid-day)**: [US-1.5](stories/US-1.5-real-world-template-script-audit.md) — real-world template + script audit landed alongside v0.3.0; no carry to W23.
- ✅ **Closed in W22 (v0.2.0)**: US-1.2 / US-1.3 / US-1.4 / US-2.1 / US-2.2 / US-2.3 / US-2.4 — all shipped 2026-05-27. See [W22 archive](sprint-2026-W22.md).

## Closed mid-sprint W23

_(filled as stories land — leave empty until the first ship)_

## Risks & dependencies

- **`@koniverse` npm org not yet provisioned** — *Impact*: US-4.4 publish step (TASK-4.4.3) blocks. *Mitigation*: provision the org on day 1 via `npm org create koniverse` so the gate is removed before Phase 4. *Owner*: @saltict.
- **Reference impl assumes Tailwind v4 + PostCSS** — *Impact*: copy-over in US-4.1 might surface TW4-specific build issues outside the monorepo. *Mitigation*: budget half a day for build-graph diagnosis; fall back to inline CSS only if TW4 standalone install fails, NOT preemptively. *Owner*: @saltict.
- **Mid-sprint scope creep risk (W22 absorbed 4 pickups)** — *Impact*: similar churn could derail EPIC-4. *Mitigation*: any new rule or convention surfaced during EPIC-4 work gets logged as a v0.4.0 candidate (CONTEXT D-pending), NOT bolted into W23. Sprint goal stays "ship `@koniverse/docs-viewer@0.1.0`". *Owner*: @saltict.

## Per-Epic Retrospective

_(filled at sprint close)_

| Epic | Retro Status | Notes |
|------|-------------|-------|
| EPIC-4 | in-progress | First sprint for EPIC-4; 4 stories committed, all `ready` at sprint open. Spec + plan + AC + Tasks fully drafted ahead of pickup. |

## Contributors

_(filled at sprint close — per RULE-15, GitHub login goes here, never git user.name)_

| GitHub login | Git name | Stories shipped | Points | Notes |
|---|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | _(tbd)_ | _(tbd)_ | Solo sprint by default — broadens if EPIC-3 work picks up in parallel |

## Cross-references

- [EPIC-4](epics/EPIC-4.md) — owns US-4.1..4.4 (docs preview tooling)
- [CONTEXT D11](../CONTEXT.md) — decisions: `@koniverse/docs-viewer` package name, `packages/` location, EPIC-4 separation from EPIC-3
- [Spec — koni-docs-viewer design](../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)
- [Plan — koni-docs-viewer implementation](../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [W22 archive](sprint-2026-W22.md) — previous sprint, v0.2.0 + v0.3.0 ships
