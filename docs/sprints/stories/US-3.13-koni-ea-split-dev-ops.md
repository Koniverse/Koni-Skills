---
id: US-3.13
title: "Split koni-ea into koni-ea-dev (programming) + koni-ea-ops (operations)"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2026-W29
due:
version_shipped: 0.59.0
prd_ref: [FR-41, FR-42]
arch_ref: []
depends_on: [US-3.12]
assignee: jindo9986
commit: pending
created: 2026-07-15
updated: 2026-07-15
external_deps:
---

## Goal

Split the single koni-ea skill into two named skills so there is no room for
confusion between the two jobs: **koni-ea-dev** (how to *program* a correct MQL5 EA
— the renamed, unchanged programming skill) and **koni-ea-ops** (how to *organise*
an EA as a released, deployed, tracked asset — a new skill). Requested by the user
after the v0.58.0 scope narrowing; this completes it by giving the ops half its own
home rather than deleting it.

## Background

US-3.12 removed the operational content from koni-ea to sharpen it to programming.
That content — versioning, registry/MagicNumber, deployment, release backtesting,
per-version docs — is real and worth keeping; it just does not belong in a coding
standard (LESSONS §32). Rather than leave it only in `Trading-Resources`' SOPs, this
story gives it a dedicated skill so an agent asked to "cut a version" or "deploy this
EA" has a standard to follow, cleanly separated from "how do I write the EA".

The rename follows the correct-forward discipline (LESSONS §12): historical records
(the v0.57.0/v0.58.0 CHANGELOG entries, US-3.11/US-3.12) keep the name the skill had
when they shipped; only living/current-state docs (PRD FRs, AGENTS.md catalog, this
story, the v0.59.0 CHANGELOG) carry the new names. Sibling skills cross-reference by
**name**, not by file path, so the per-skill reference checker does not choke and a
directory move never breaks a link.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §32 (this
story *executes* the one-skill-per-job rule the split was named for); §33 (documented
here — renaming a shipped skill: correct forward, cross-reference siblings by name);
§12 (historical records are not rewritten to look tidy).

## Acceptance criteria

- [x] **AC-1** — `skills/koni-ea/` is renamed to `skills/koni-ea-dev/`; its `name:`
  frontmatter is `koni-ea-dev` and every self-mention of the old name is updated; its
  internal reference links (relative) still resolve.
- [x] **AC-2** — a new `skills/koni-ea-ops/` ships `SKILL.md` + five references
  (`versioning.md`, `registry-and-magic.md`, `deployment.md`,
  `backtest-and-release.md`, `documentation.md`) covering the EA operational
  lifecycle, faithful to the `Trading-Resources` SOPs and `registry.yaml`.
- [x] **AC-3** — each skill states the seam: koni-ea-dev points to koni-ea-ops for the
  ops lifecycle; koni-ea-ops points to koni-ea-dev for the programming. Cross-references
  are by **skill name**, not file path; the MagicNumber rule is stated compatibly in
  both (dev uses it / uniqueness; ops assigns & tracks it) with no contradiction.
- [x] **AC-4** — both `description` frontmatters stay under the 1024-byte cap;
  `python3 skills/koni-docs/scripts/check-references.py` → 0 dangling on both skills and
  on all skills; the shared checker's self-test / mutation / coverage suites pass.
- [x] **AC-5** — living docs carry the new names: PRD FR-41 → koni-ea-dev + new FR-42
  → koni-ea-ops; AGENTS.md catalog lists both; EPIC-3 FR coverage + stories updated.
  Historical records (US-3.11/US-3.12, the v0.57/v0.58 CHANGELOG) are left as shipped.

## Tasks

- [x] **TASK-3.13.1** — `git mv` koni-ea → koni-ea-dev; update `name:` + self-mentions (AC: 1)
- [x] **TASK-3.13.2** — write koni-ea-ops SKILL.md + 5 references from the recovered ops content + the SOPs (AC: 2, 3)
- [x] **TASK-3.13.3** — check-references + author-blind review of koni-ea-ops vs the source SOPs (AC: 4)
- [x] **TASK-3.13.4** — living-doc plumbing: FR-41 rename + FR-42, AGENTS.md, EPIC-3 (AC: 5)

## Dev notes

### What we explicitly did NOT do

- **Left koni-ea-dev's content as the finished programming skill from US-3.12**, changing
  only the name, the sibling pointer, and one seam fix from the author-blind review: the
  MagicNumber collision-**audit command** (an ops task) moved to koni-ea-ops, and dev now
  cross-references it by name — removing a verbatim duplicate that would otherwise drift.
- **Did not rewrite historical records.** The v0.57.0/v0.58.0 CHANGELOG entries and
  US-3.11/US-3.12 keep the `koni-ea` name they shipped under; the v0.59.0 entry records
  the rename forward (LESSONS §12).
- **Did not copy the ops content into `docs/`.** koni-ea-ops *teaches* the SOP and
  points at `Trading-Resources` as the owner of the live registry/Notion; it is not a
  second copy of the data.

### References

- [Source: PRD FR-41, FR-42](../../PRD.md#functional-requirements)
- [Source: US-3.12](US-3.12-koni-ea-programming-focus.md) — the narrowing this completes
- [Source: LESSONS §12, §32, §33](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `test -d skills/koni-ea-dev && test ! -d skills/koni-ea && grep '^name: koni-ea-dev' skills/koni-ea-dev/SKILL.md` |
| AC-2 | `ls skills/koni-ea-ops/references/` shows versioning / registry-and-magic / deployment / backtest-and-release / documentation |
| AC-4 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea-dev` and `… skills/koni-ea-ops` → 0 dangling each |
| AC-5 | `grep -E 'koni-ea-dev\|koni-ea-ops' AGENTS.md` shows both catalog rows |

## Changelog entry

### Changed
- Renamed the `koni-ea` skill to **`koni-ea-dev`** (programming methodology; content unchanged).

### Added
- **`koni-ea-ops`** — the EA operational-lifecycle skill (SKILL.md + 5 references: versioning, registry & MagicNumber, deployment, backtest & release, per-version docs), split out of the original koni-ea so the coding standard and the ops runbook are separate skills.
- **PRD FR-42** (koni-ea-ops) and **LESSONS §33** (renaming a shipped skill: correct forward, cross-reference siblings by name).

## Implementation notes

A rename + a new sibling skill. The ops content was recovered from the pre-narrowing
version and reorganised into five focused references; an author-blind review checked
it against the `Trading-Resources` SOPs and confirmed the dev/ops seam has no drift-risk
duplication. Verified: 0 dangling on both skills and all skills.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.12](US-3.12-koni-ea-programming-focus.md)
- [CHANGELOG v0.59.0](../../CHANGELOG.md)
