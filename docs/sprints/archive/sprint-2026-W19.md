---
id: sprint-2026-W19
status: closed
start: 2026-05-04
end: 2026-05-26
goal: "Ship koni-docs skill v0.1.0 — SKILL.md + 9 rules + 13 templates + 5 scripts + npx skills distribution"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-1.1 | Koni-docs skill — initial release (v0.1.0) | EPIC-1 | P0 | 13 | ✅ done | [../stories/US-1.1-koni-docs-initial-release.md](../stories/US-1.1-koni-docs-initial-release.md) |

> **Note on sprint length**: this archived sprint covers a ~3-week span
> (2026-05-04 → 2026-05-26) rather than the standard 1-week window. The
> v0.1.0 work was the first cut of `koni-docs` itself, and sprint
> discipline only began retrospectively (it was always one big push to
> get something shippable). Subsequent sprints follow the canonical
> Mon–Sun ISO week.

## Sprint goal recap

Get the first usable cut of `koni-docs` out the door so downstream
Koniverse projects can start consuming it via `npx skills add`. The
deliverable was deliberately one consolidated story (US-1.1) rather
than ~15 micro-stories — at this stage the skill's surface was
shifting too quickly for fine-grained story breakdown to be useful.

**Outcome**: shipped — `koni-docs` v0.1.0 published, README updated,
self-contained regression test passing.

## Phased plan (retrospective)

1. **Phase 1 — Skill body + rules** (~3 days): SKILL.md draft, 9 rules
   in `references/rules.md`, sprint-system reference.
2. **Phase 2 — Template library** (~5 days): single mega-template file
   → split into 13 per-type files in `references/templates/`.
3. **Phase 3 — Bundled scripts** (~3 days): 5 sync scripts + helpers.
4. **Phase 4 — Regression test** (~2 days): self-contained sync-test
   with fixture in tmpdir; refined `epicStoryRowMatcher` boundary regex.
5. **Phase 5 — Distribution + audit** (~3 days): `npx skills` adoption,
   README rewrite, skills-lock.json schema, late-cycle audit against
   Koni-ERP-02 practice.

## Contributors

22 commits, 2 contributors. Per [RULE-15](../../../skills/koni-docs/references/rules.md),
GitHub login is the canonical identifier; git `user.name` may differ.

| GitHub login | Git name | Commits | % | Areas |
|---|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | 20 | 91% | Skill core, templates, automation, tests |
| [`bluezdot`](https://github.com/bluezdot) | bluezdot | 2 | 9% | Template robustness, script story-parsing fixes |

### Commit breakdown by area (all roll up into US-1.1 → v0.1.0)

**Phase 1 — Skill core + scaffolding** (saltict, 10 commits, 2026-05-06 .. 2026-05-13):
| Commit | Message |
|---|---|
| `5ee3bf7` | first commit |
| `f150ca7` | docs: add koni-docs skill design spec |
| `b5bfe95` | docs: update koni-docs spec with full pipeline integration |
| `72746cc` | docs: add koni-docs skill implementation plan |
| `3cf7d9d` | feat: add koni-docs core rules reference (9 project-agnostic rules) |
| `41832a0` | feat: add koni-docs templates reference (11 template types) |
| `9fd0607` | feat: add koni-docs sprint-system reference |
| `3937a47` | feat: add koni-docs SKILL.md — core documentation management skill |
| `6bd799f` | chore: add project scaffolding — README, AGENTS, CLAUDE, gitignore, skill-creator |
| `7819f42` | docs: add installation and setup instructions to README |
| `e443007` | docs: switch to npx skills CLI for installation instructions |

**Phase 2 — Template polish** (saltict, 5 commits, 2026-05-14 .. 2026-05-22):
| Commit | Message |
|---|---|
| `ab1adee` | feat: add ARCHITECTURE.md template following BMad format |
| `8d55421` | docs: add BRIEF.md template, complete PRD §1-§7, and BMad template analysis |
| `aeadfbe` | docs: add Goal column to Epic Stories table for story-level summaries |
| `435a012` | docs: expand PRD template §1-§11 to match BMad full output standard |
| `3b75119` | docs: split koni-docs templates into one file per document type |

**Phase 3 — Automation + tests** (saltict, 4 commits, 2026-05-23 .. 2026-05-26):
| Commit | Message |
|---|---|
| `3f62985` | feat: bundle automation scripts into koni-docs skill |
| `1b4127b` | fix(scripts): agile-sync-up handles new 5-col EPIC + per-epic PRD §11 table |
| `1ebaba0` | test(scripts): add self-contained integration test for sync scripts |
| `29898ca` | fix(scripts): refine epicStoryRowMatcher to ensure accurate row matching for story IDs |

**Phase 4 — Robustness + co-contributor pickup** (bluezdot, 2 commits, late W21):
| Commit | Message |
|---|---|
| `facd9a6` | feat(templates): add 'deprecated' status to story and changelog templates |
| `44f9c01` | fix(scripts): enhance story parsing to skip files without an 'id' frontmatter and log warnings |

## Retrospective

### What went well

- **Template-split decision (D4) paid off immediately.** Splitting
  templates one-file-per-type made each template independently
  reviewable and let agents load only what they needed. The mega-file
  approach would have hit token limits within a week.
- **Self-contained regression test caught a real bug before consumers
  did.** `epicStoryRowMatcher` falsely matched `US-1.1` against
  `US-1.11` — caught by the test fixture (commit `1ebaba0`), fixed in
  commit `29898ca`, not by a consumer team weeks later. Now codified
  as [LESSONS §1](../../LESSONS.md).
- **`npx skills` adoption (D2) cleaned up onboarding dramatically.**
  Earlier git-submodule path had 4 papercuts; the new path has 0.
- **Co-contributor onboarding worked the first try.** `bluezdot` landed
  2 commits (`facd9a6`, `44f9c01`) without prior context — both passed
  review and went straight to main. Sign that the skill's own
  conventions are discoverable from the templates alone.

### What didn't

- **Sprint discipline came late.** No sprint file existed during the
  actual 3-week push (2026-05-06 → 2026-05-26) — this archived file is
  retroactive. Future sprints should open a sprint file before the
  first story moves to `in-progress`.
- **Story-row matcher bug should have been caught at design time.**
  The regex was hand-rolled without thinking about dotted-ID boundary
  semantics. Caught by the test fixture only when the fixture pair
  `US-1.1`/`US-1.11` was added. Now there's a permanent fixture.
- **`agile-sync-up.mjs` crashed on stories without `id:` instead of
  warning.** Caused ~15 minutes of debug confusion. `bluezdot` fixed
  in `44f9c01` after running into it — now skips + warns. Codified as
  [LESSONS §2](../../LESSONS.md).
- **CHANGELOG location got wrong on first dogfood pass.** Initial
  v0.2.0-in-flight ship landed `CHANGELOG.md` at repo root; the
  canonical location per SKILL.md §0 is `docs/CHANGELOG.md`. Caught
  during the W22 retrospective pass — corrected as
  [CONTEXT D10](../../CONTEXT.md). The skill's own §0 orientation IS
  the source of truth and overrides intuition from other ecosystems
  (many OSS projects put CHANGELOG at root).

### Followups

- **Open EPIC-2** (`sprint-2026-W22`): dogfood `koni-docs` on this repo
  itself. Authorized by [CONTEXT D6](../../CONTEXT.md). In flight,
  expected to close end-of-week with v0.2.0 ship.
- **Open EPIC-3** (backlog): plugin-skill pattern + first non-docs
  Koniverse skill — actual story breakdown deferred to a future
  `/office-hours` brainstorm.
- **CI gate (open).** Consider adding a GitHub Action that runs the
  regression test on every PR. Currently runs locally only. Open
  question in [ARCHITECTURE.md](../../ARCHITECTURE.md).
- **RULE-16 (deferred).** Bare-semver `version_shipped:` would close
  [LESSONS §4](../../LESSONS.md) but needs template touch-ups across
  story / epic / sprint / PRD frontmatter. Filed for a later EPIC-1
  sprint.

## Cross-references

- [EPIC-1](../epics/EPIC-1.md) — parent epic (now ✅ done at v0.1.0)
- [Story US-1.1](../stories/US-1.1-koni-docs-initial-release.md)
- [CHANGELOG v0.1.0](../../CHANGELOG.md)
- [CONTEXT D1..D5](../../CONTEXT.md)
- [LESSONS §1, §2, §3](../../LESSONS.md)
