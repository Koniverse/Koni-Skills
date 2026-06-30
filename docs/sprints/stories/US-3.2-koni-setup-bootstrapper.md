---
id: US-3.2
title: "koni-setup — Koniverse project bootstrapper & onboarder skill (first non-docs skill)"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2026-W26
version_shipped: "0.9.0"
prd_ref:
  - FR-10
  - FR-20
arch_ref: []
depends_on:
  - US-3.1
assignee: jindo9986
commit: f3b8c34
created: 2026-06-26
updated: 2026-06-30
---

## Goal

Ship `skills/koni-setup/` — the first **non-docs** Koniverse skill, satisfying
EPIC-3's FR-10 ("ship at least one non-docs Koniverse skill"). It is the
**day-0 orchestrator**: it bootstraps a brand-new Koniverse repo, or onboards
an existing one, to the shared project standard — directory skeleton, skill
wiring (`.claude` / `.agents` symlinks), `CLAUDE.md` / `AGENTS.md` /
`.active-context` integration surface, `.gitignore`, `VERSION`, `_bmad`, the
installed skill set (BMAD pack + gstack + koni-docs + profile extras), and the
`package.json` agile scripts.

Its defining constraint — and the reason it can coexist with koni-docs without
conflict (cross-cutting invariant of EPIC-3) — is that it **delegates all
documentation-body templates to koni-docs** rather than duplicating them.
koni-setup gets a repo to the starting line; koni-docs runs the race.

## Background

The setup pattern was reverse-engineered from auditing six live Koniverse repos
(`koni-devops`, `Koni-ERP-02`, `koni-growth`, `koni-landing`, `koni-training`,
`Senti-Quant`). They share a common core (VERSION / CLAUDE.md / docs surface /
skills wiring / `_bmad`) plus per-profile additions, which the skill encodes as
three profiles: **code**, **devops**, **content**.

Until now every new Koni repo was scaffolded by hand by copying from a sibling
repo — slow, drift-prone, and easy to miss steps (the most common miss: running
`npx bmad-method install` so the ~40 `bmad-*` skills land). This skill captures
that tribal knowledge as a reusable, profile-aware, idempotent procedure.

This is the first concrete delivery under EPIC-3 (US-3.1 plugin-skill pattern
remains backlog), flipping the epic from "single-skill repo" toward "catalog".

## Acceptance criteria

- [x] **AC-1** — `skills/koni-setup/SKILL.md` exists with a pushy, koni-docs-
  boundary-aware `description`, and a body under 500 lines driving the flow
  `detect → (bootstrap | onboard/audit) → verify`.
- [x] **AC-2** — Repo-type detection classifies a repo into **code / devops /
  content** profiles (with hybrid union), each with its own expected file set,
  documented in `references/repo-types.md` and tied to a reference repo.
- [x] **AC-3** — **Bootstrap** path lays down the canonical skeleton via a
  single profile-aware, re-runnable `create-tree` command that matches its own
  tree diagram, initialises git, seeds `VERSION` + CHANGELOG `[Unreleased]`
  anchor, and keeps empty leaf dirs alive with `.gitkeep`
  (`references/scaffold-checklist.md`).
- [x] **AC-4** — **Onboard/Audit** path emits a present/missing matrix BEFORE
  writing, fills only gaps, never overwrites populated files, and explicitly
  permits *appending* the `## Koni-Docs Integration` block to an existing
  CLAUDE.md (`references/onboarding-audit.md`).
- [x] **AC-5** — Skill-set inventory documents WHICH skills to install and from
  WHICH source/mechanism: BMAD pack via `npx bmad-method install`, koni-docs
  wired per-repo, gstack confirmed **global** (never per-repo), plus profile
  extras (shadcn, Anthropic doc/design skills) — `references/skill-inventory.md`.
- [x] **AC-6** — Skill wiring covers the `.claude` → `.agents` → shared
  `Koni-Skills/skills` symlink chain, dangling-link repair, and the `agile:*`
  npm scripts + `@koniverse/koni-docs` devDep block (`references/skill-wiring.md`).
- [x] **AC-7** — The skill **never re-implements** koni-docs templates or the 12
  rules; every doc-body need hands off to the koni-docs skill. (EPIC-3
  cross-cutting invariant: plugin/sibling skills MUST NOT duplicate koni-docs
  core.)
- [x] **AC-8** — `koni-setup` is wired into this repo at
  `.claude/skills/koni-setup` + `.agents/skills/koni-setup` (mirrors koni-docs)
  and resolves.

## Tasks

- [x] **TASK-3.2.1** — Audit the 6 reference repos; extract common-core +
  per-profile setup patterns and the installed-skill inventory. (AC: 2, 5)
- [x] **TASK-3.2.2** — Write `SKILL.md` (detect / bootstrap / onboard / verify)
  with the koni-docs delegation boundary stated up front. (AC: 1, 7)
- [x] **TASK-3.2.3** — Write `references/repo-types.md` + `scaffold-checklist.md`
  + `skill-wiring.md` + `skill-inventory.md` + `onboarding-audit.md`. (AC: 2–6)
- [x] **TASK-3.2.4** — Sandboxed sanity test (1 bootstrap code repo + 1 onboard
  content repo via independent subagents); fix found defects (tree/command
  mismatch, CHANGELOG double-handling, `.gitkeep`, onboard CLAUDE.md append,
  `git init`, `active_sprint` default, version-pin single-source). (AC: 3, 4)
- [x] **TASK-3.2.5** — Wire `.claude` + `.agents` symlinks; verify resolve. (AC: 8)

## Post-ship refinements

No scope change to FR-20; see [CONTEXT D17](../../CONTEXT.md):

| Refinement | What | Version | Commit |
|---|---|---|---|
| Core-trio baseline | Setup now wires the **Koniverse core trio** (koni-docs + koni-harness + koni-qc) and runs koni-harness `install-gate.sh` (vendors `.koni-harness/` + git hooks), instead of koni-docs alone — SKILL.md step 5 + verify, skill-inventory baseline, skill-wiring commands | v0.20.0 | a59861a |

## References

- [Skill: skills/koni-setup/SKILL.md](../../../skills/koni-setup/SKILL.md)
- [US-3.1 — plugin-skill pattern](US-3.1-plugin-skill-pattern.md) — sibling EPIC-3 story (backlog)
- [CONTEXT D12 — koni-setup independent of koni-docs](../../CONTEXT.md)
- [LESSONS §6 — scaffold command must match its own tree](../../LESSONS.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.9.0](../../CHANGELOG.md) (ship) + [0.20.0] (core-trio refinement)
