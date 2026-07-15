---
id: US-3.12
title: "koni-ea refocus — scope to the MQL5 programming methodology, drop the ops layer"
epic: EPIC-3
status: done
priority: P2
points: 2
sprint: sprint-2026-W29
due:
version_shipped: 0.58.0
prd_ref: [FR-41]
arch_ref: []
depends_on: [US-3.11]
assignee: jindo9986
commit: pending
created: 2026-07-15
updated: 2026-07-15
external_deps:
---

## Goal

koni-ea (US-3.11) shipped as a broad "authoring standard" that mixed the MQL5
**programming methodology** with the **operational lifecycle** around a released EA
(versioning, registry/Notion, deployment, the per-version doc SOP). The user's
feedback: focus it on programming correctly to the MQL5 standard — the ops is a
trading-ops SOP, not this skill. This narrows the scope accordingly.

## Background

A skill that tries to be both a coding standard and an ops runbook serves neither:
the reader who wants "how do I write a correct EA" wades through registry and
deployment process, and the reader who wants the release SOP finds it half-told
inside a coding skill. The operational content also *belongs elsewhere* — it is
`Trading-Resources`' own SOPs, which this skill was only mirroring. Cutting it makes
koni-ea a sharp programming standard and removes a second copy of the ops rules that
would drift (LESSONS §28).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §32
(documented here — scope a skill to one job; the first koni-ea cut mixed programming
methodology with ops SOP and had to be narrowed); §28 (a mirrored copy of another
repo's SOP is a drift source — remove it, don't maintain two).

## Acceptance criteria

- [x] **AC-1** — the operational reference `versioning-release-docs.md` (version
  scheme, commit=release, registry & MagicNumber/Notion, deploy, per-version doc
  template) is **removed**; no reference or link to it remains.
- [x] **AC-2** — a focused `compilation-and-testing.md` reference replaces the
  programming-relevant slice of it: compiling clean (warnings-as-errors), the
  error-106 include-path trap, and testing honestly ("Every Tick Based on Real
  Ticks"). Nothing about versioning/registry/deploy/docs.
- [x] **AC-3** — `inputs-naming-structure.md` is renamed to `inputs-and-naming.md`
  with the file-layout and version-scheme (ops) sections removed; the programming
  content (inputs, enums, naming, English-code rule) is kept.
- [x] **AC-4** — `SKILL.md` is reframed to "programming a correct MQL5 EA": the
  intro states the ops lifecycle is explicitly out of scope, the loop drops the
  "version, register, document" step, and the reference map + non-negotiables carry
  no registry/versioning ops rule. The MagicNumber rule is kept as a **correctness**
  rule (uniqueness), not a registry-assignment rule.
- [x] **AC-5** — `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea`
  → 0 dangling; the shared checker's self-test / mutation / coverage suites pass; all
  skills 0 dangling; the `description` stays under the 1024-byte cap.
- [x] **AC-6** — `AGENTS.md`'s koni-ea catalog row reflects the programming scope.

## Tasks

- [x] **TASK-3.12.1** — remove `versioning-release-docs.md`; add `compilation-and-testing.md` (AC: 1, 2)
- [x] **TASK-3.12.2** — rename + trim the inputs reference (AC: 3)
- [x] **TASK-3.12.3** — reframe SKILL.md; repoint every inbound link (AC: 4)
- [x] **TASK-3.12.4** — check-references + author-blind review of the refactor; update the catalog (AC: 5, 6)

## Dev notes

### What we explicitly did NOT do

- **Did not delete any programming-correctness content.** The MagicNumber-uniqueness
  rule (a real MT5 correctness hazard — no enforced uniqueness) stays in both
  `mql5-pitfalls.md` and `inputs-and-naming.md`; the compile/test correctness slice
  moved into `compilation-and-testing.md`. Only the *process* material left.
- **Did not touch the other five references' bodies** beyond repointing links — they
  were already programming-focused.
- **Did not relocate the ops content into `docs/`.** It is `Trading-Resources`' SOP
  to own; duplicating it here in any form is the drift this change removes.

### References

- [Source: PRD FR-41](../../PRD.md#functional-requirements)
- [Source: US-3.11](US-3.11-koni-ea-mql5-standard.md) — the skill this narrows
- [Source: LESSONS §28, §32](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `test ! -e skills/koni-ea/references/versioning-release-docs.md && ! grep -rq versioning-release-docs skills/koni-ea` |
| AC-2, AC-3 | `ls skills/koni-ea/references/` shows `compilation-and-testing.md` + `inputs-and-naming.md`, no `versioning-release-docs.md` / `inputs-naming-structure.md` |
| AC-5 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea` → 0 dangling |
| AC-6 | `grep koni-ea AGENTS.md` shows the programming-scope row |

## Changelog entry

### Changed
- koni-ea narrowed to the MQL5 **programming** methodology: removed the ops reference (versioning/registry/deploy/per-version-doc SOP), added a focused `compilation-and-testing.md`, renamed `inputs-naming-structure.md` → `inputs-and-naming.md`, and reframed SKILL.md. The operational lifecycle is a trading-ops SOP, out of scope.

## Implementation notes

A scope-narrowing refactor: one reference removed, one added, one renamed+trimmed,
SKILL reframed, links repointed. Verified by the reference checker (0 dangling) and
an author-blind review of the result against the source repos.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.11](US-3.11-koni-ea-mql5-standard.md)
- [CHANGELOG v0.58.0](../../CHANGELOG.md)
