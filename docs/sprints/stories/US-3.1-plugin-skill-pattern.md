---
id: US-3.1
title: "Define plugin-skill pattern + ship koni-nextjs reference"
epic: EPIC-3
status: done
priority: P1
points: 3
sprint: sprint-2026-W26
version_shipped: "0.15.0"
prd_ref:
  - FR-9
arch_ref: []
depends_on: []
assignee: jindo9986
commit: 504ed8b
created: 2026-05-27
updated: 2026-06-28
---

## Goal

Document how a plugin skill (e.g. `koni-supabase`, `koni-nextjs`) extends
`koni-docs` for a specific tech stack, and ship one reference implementation.
After this story the mechanism is a documented contract — a Koniverse Next.js
project declares `plugins: [nextjs]` in its CLAUDE.md `koni-docs:` block and the
agent loads both the core 12 rules and the Next.js-specific `NX-` rules, without
forking or duplicating the core skill.

Delivered docs-only (no scripts): the **pattern**
([`skills/koni-docs/references/plugin-pattern.md`](../../../skills/koni-docs/references/plugin-pattern.md))
and the **reference plugin**
([`skills/koni-nextjs/SKILL.md`](../../../skills/koni-nextjs/SKILL.md)).

## Background

koni-docs SKILL.md §2/§6 reserved a plugin slot (`koni-docs:` `plugins:` key) but
the mechanism was sketched, not specified, and no plugin existed. This story
turns the sketch into a contract + a worked example. Design + plan:
[spec](../../superpowers/specs/2026-06-28-koni-plugin-pattern-nextjs-design.md)
· [plan](../../superpowers/plans/2026-06-28-koni-plugin-pattern-nextjs.md).
Boundary invariants per [CONTEXT D12/D13](../../CONTEXT.md) and the EPIC-3
cross-cutting rules (compose, never duplicate; self-contained AD-1).

## Acceptance criteria

- [x] **AC-1** — `skills/koni-docs/references/plugin-pattern.md` describes the
  pattern in six sections: what a plugin skill is, where it lives
  (`skills/koni-<tech>/`, self-contained AD-1), discovery (`plugins: [<tech>]`
  under the CLAUDE.md `koni-docs:` block), the composition contract
  (extend-not-duplicate; namespaced rules; may reference the koni-harness gate),
  an authoring checklist, and the reference example.
- [x] **AC-2** — One plugin ships: `skills/koni-nextjs/SKILL.md` with `NX-`
  rules — NX-1 `next build` ship gate (not just `tsc --noEmit`; the koni-docs
  LESSON), NX-2 `NEXT_PUBLIC_`/secret boundary, NX-3 App Router server-default,
  NX-4 env sync (specializes RULE-11).
- [x] **AC-3** — `koni-nextjs/SKILL.md` declares it composes with koni-docs and
  lists only its own `NX-`-namespaced rules; it **references, never restates**,
  the 12 core `RULE-n` (verified by grep — every `RULE-n` hit is a reference).
- [x] **AC-4** — koni-nextjs is wired (`.claude/skills/koni-nextjs` +
  `.agents/skills/koni-nextjs`, mirrored symlinks) and resolves; an author-blind
  review confirmed the pattern is coherent, koni-nextjs follows it, the discovery
  key (`plugins:` nested under `koni-docs:`) is accurate, and NX-1's gate row
  matches the koni-harness `gates.conf` grammar. (Replaces the original
  synthetic-`npx skills add` fixture AC — verification is review-based since the
  deliverable is docs, not code.)

## Tasks

- [x] **TASK-3.1.1** — Brainstorm + design the plugin pattern (spec).
- [x] **TASK-3.1.2** — Write `plugin-pattern.md`.
- [x] **TASK-3.1.3** — Implement the first plugin skill (`koni-nextjs`) + wire symlinks.
- [x] **TASK-3.1.4** — Additive koni-docs §2/§6 pointers + author-blind review + discovery-key consistency fix.

## Dev notes

### Architecture constraints

- [AD-1] — plugin skills are self-contained directories; no cross-skill imports.
  Composition happens at the agent's activation step (load both SKILL.md when
  `plugins:` declares the tech), not at build time.
- [AD-3] — plugin rules EXTEND, never REPLACE, core `RULE-n`. Namespace adopted:
  `NX-` (Next.js); future plugins use their own (`SB-` for Supabase, etc.).

### What we explicitly did NOT do

- No `koni-supabase` (FR-9 needs one reference; deferred — a future story follows
  `plugin-pattern.md`).
- No scripts in the plugin (rule-only reference; YAGNI). No synthetic
  `npx skills add` fixture (verification is review-based for docs).

## Changelog entry

See [CHANGELOG v0.15.0](../../CHANGELOG.md) — plugin-skill pattern + koni-nextjs
reference; closes FR-9 and the EPIC-3 plugin pillar.

## Cross-references

- [PRD FR-9](../../PRD.md) · [Epic EPIC-3](../epics/EPIC-3.md)
- [plugin-pattern.md](../../../skills/koni-docs/references/plugin-pattern.md) · [koni-nextjs SKILL.md](../../../skills/koni-nextjs/SKILL.md)
