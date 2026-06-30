---
id: EPIC-5
title: "Koniverse QC tooling"
status: done
prd_ref: 'FR-26'
created: 2026-06-28T00:00:00.000Z
updated: 2026-06-28T00:00:00.000Z
---
## Goal

Give the Koniverse catalog a quality-control capability: a skill that turns
koni-docs-standard inputs into Silicon-Valley-grade, fully-traceable test
documentation and drives QC execution — covering every case and edge case so
products ship smoothly. The first delivery is `koni-qc`.

## Overview

### Business context

Koni had the *templates* (koni-docs `test-cases`/`test-report`), the *execution
engine* (gstack `qa`/`investigate`/`browse`), and the *gate* (koni-harness) — but
nothing that derives **exhaustive, traceable coverage from requirements**. The
hand-made QC docs in `koni-docs.backup` were \~70% happy-path with no TC IDs, no
AC↔TC matrix, and <5% non-functional testing; even the deliberately-authored
`Koni-Finance` suite lacked a complete AC↔TC matrix, an env/fixtures playbook,
a11y/i18n, and perf SLAs. EPIC-5 closes that gap with a methodology skill that is
**better than both**.

### Feature pillars

| # | Pillar                   | Stories                                  | Purpose                                                                                                                                             |
| - | ------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **QC methodology skill** | [US-5.1](../stories/US-5.1-koni-qc.md) ✅ | `koni-qc` — test-design techniques + edge taxonomy + mandatory AC↔TC matrix + NFR/security + quality rubric; composes koni-docs/gstack/koni-harness |

### Out of scope

- A QC execution engine (gstack owns execution; koni-qc drives it).
- New test-doc templates (koni-docs owns them; koni-qc fills them).
- Per-stack QC plugins (e.g. a security-only or perf-only plugin) — future work,
  following the koni-docs `plugin-pattern.md`.

## FR Coverage

| FR    | Story                                  | Status              |
| ----- | -------------------------------------- | ------------------- |
| FR-26 | [US-5.1](../stories/US-5.1-koni-qc.md) | ✅ shipped (v0.16.0) |

## Stories

| ID                                     | Title   | Goal                                                                                                                                   | Status | Version |
| -------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| [US-5.1](../stories/US-5.1-koni-qc.md) | koni-qc | Compose-first QC methodology + coverage-intelligence skill; pilot on customize-network proving the uplift over the manual backup suite | ✅ done | v0.16.0 |

## Cross-cutting invariants

- **Compose, never duplicate** (D12/D13/D14): koni-qc invokes koni-docs (templates),
  gstack (execution), koni-harness (gate/loop); it never reproduces them.
- **The AC↔TC coverage matrix is mandatory** — every AC has ≥1 positive, ≥1
  negative, ≥1 boundary test case; no orphan AC, no orphan TC.

## Acceptance criteria (propagated from stories)

- [x] koni-qc ships with 6 methodology references + SKILL.md + a worked pilot (US-5.1)
- [x] The pilot beats the `koni-docs.backup` manual suite on all 12 gaps and matches the `Koni-Finance` strengths (US-5.1)
