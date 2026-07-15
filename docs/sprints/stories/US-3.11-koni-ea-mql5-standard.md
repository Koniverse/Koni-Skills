---
id: US-3.11
title: "koni-ea — the MQL5 Expert Advisor authoring standard skill"
epic: EPIC-3
status: done
priority: P2
points: 5
sprint: sprint-2026-W29
due:
version_shipped: 0.57.0
prd_ref: [FR-41]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: c8a55c8
created: 2026-07-15
updated: 2026-07-15
external_deps:
---

## Goal

Add a catalog skill, **koni-ea**, that captures how to write a Koniverse MQL5
Expert Advisor for MetaTrader 5 to a standard: the lifecycle skeleton, the trading
and risk mechanics, the MQL5 traps that only bite in production, and the
version/registry/documentation discipline around a released EA. It is to MQL5 EAs
what koni-qc is to test docs — a methodology, not a code generator.

## Background

Two production corpora hold the knowledge but neither is a teachable standard: the
`Trading-Resources` archive (~14 live EA families, each a self-contained `.mq5`)
and the `Senti-Quant` `terminal_manager` MQL5 library (header-only `Include/Koni/**`
modules + a MetaEditor compile service). The knowledge was **distributed across
files and, worse, divergent** — input prefixes, `#property strict`, lot-rounding
direction, session timezone, and margin-check direction all differed EA-to-EA. A
standard has to *resolve* those, not just describe them.

The skill was synthesized by two author-blind exploration passes (one per corpus)
and then hardened by an author-blind technical review against the source files —
which caught three faithfulness/correctness defects before ship (see Dev notes).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §19 (never
trust a self-review: the review against the source repos caught a no-op directive
claimed as mandatory, a wrong registry shape, and a margin-check direction that
contradicted the corpus); §31 (documented here — a standard synthesized from a
corpus must verify each convention's actual effect, because copy-pasted cargo-cult
looks like signal).

## Acceptance criteria

- [x] **AC-1** — `skills/koni-ea/SKILL.md` exists with a WHEN-to-trigger
  `description` under the 1024-byte cap, names the two build modes (strategy EA vs
  shared library), the authoring loop, and a reference map; under 500 lines.
- [x] **AC-2** — seven references cover the standard:
  `ea-lifecycle.md`, `inputs-naming-structure.md`, `trading-mechanics.md`,
  `risk-management.md`, `mql5-pitfalls.md`, `versioning-release-docs.md`,
  `shared-library.md`.
- [x] **AC-3** — the standard is **prescriptive**: where the corpus diverges (input
  prefix, `#property strict`, `MathFloor` vs `MathCeil` lot rounding, UTC vs server
  time, `VOLUME_MAX`-clamp omission, `int` vs `long` magic) it states the canonical
  form and flags the divergence, rather than documenting both silently.
- [x] **AC-4** — every MQL5 API/idiom is technically correct and faithful to the
  sources: the pending-fill **margin pre-check** (market-type `OrderCalcMargin`,
  fail-permissive on calc failure, per LESSONS §6), closed-bar signals,
  `ArraySetAsSeries` + `CopyBuffer` return check, `SYMBOL_TRADE_STOPS_LEVEL`,
  position-by-magic loops, handle release, the registry/MagicNumber shape, and the
  compile-service `/include` gotcha — all verified against the source repos.
- [x] **AC-5** — `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea`
  → 0 dangling; the shared checker's self-test / mutation / coverage suites pass; all
  skills 0 dangling.
- [x] **AC-6** — the skill is registered in `AGENTS.md`'s Current-skills catalog.

## Tasks

- [x] **TASK-3.11.1** — survey both corpora; two author-blind extraction passes (AC: 4)
- [x] **TASK-3.11.2** — write SKILL.md + the seven references (AC: 1, 2, 3)
- [x] **TASK-3.11.3** — author-blind technical review vs sources; apply the fixes (AC: 4)
- [x] **TASK-3.11.4** — check-references + register in the catalog (AC: 5, 6)

## Dev notes

### The three review fixes (author-blind, against the source repos)

1. **`#property strict` was claimed "mandatory" with false semantics.** It is an
   inert MQL4 directive in MQL5 (the compiler is always strict). Corrected to
   "inert; harmless carryover; do not rely on it." A corpus copy-paste habit had
   looked like a convention.
2. **The registry example had the wrong YAML shape** (a list with full-minor
   versions and an invented magic). The real `registry.yaml` is a map keyed by the
   algo code with a `name:` field, major-level `version: "vN"`, and a Notion-assigned
   magic. Replaced with the real shape — a copyable artifact must be right.
3. **The margin pre-check showed fail-block**; the corpus (EMA_MIRROR v1.03) and
   LESSONS §6 chose **fail-permissive** when `OrderCalcMargin` itself fails (log +
   proceed; the broker still rejects an unaffordable fill), so a calc failure for an
   unrelated reason can't disarm a whole DCA chain. Switched the canonical to
   fail-permissive with the reasoning inline.

### What we explicitly did NOT do

- **No code generator, no template `.mq5` file.** The user scoped this as a *full
  standard* (methodology), not a scaffold — skeleton code lives inline in the
  references as illustration, the way a coding standard carries examples.
- **No hard-coded paths into the source repos.** The skill is portable (it ships to
  other repos); it encodes the standard and cites the corpora as provenance only.
- **No enforcement gate.** koni-ea is guidance; a future harness check could assert
  EA conventions, but that is out of scope here.

### References

- [Source: PRD FR-41](../../PRD.md#functional-requirements)
- [Source: koni-ea SKILL.md](../../../skills/koni-ea/SKILL.md)
- [Source: LESSONS §19, §31](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2 | `ls skills/koni-ea/SKILL.md skills/koni-ea/references/` shows SKILL.md + 7 references; `wc -l skills/koni-ea/SKILL.md` < 500 |
| AC-5 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea` → 0 dangling |
| AC-5 | the checker's self-test / mutation / coverage suites under `skills/koni-docs/scripts/__tests__/` pass |
| AC-6 | `grep koni-ea AGENTS.md` shows the catalog row |

## Changelog entry

### Added
- **koni-ea** — MQL5 Expert Advisor authoring standard skill (SKILL.md + 7 references), synthesized from the Trading-Resources strategy-EA archive and the Senti-Quant terminal_manager MQL5 library, hardened by an author-blind review against both.

## Implementation notes

Built by two author-blind exploration passes (one per corpus) → synthesis →
author-blind technical review against the source files → three fixes → ship. The
review step was load-bearing: it caught an inert directive dressed up as a rule, a
wrong registry shape, and a margin-check direction that contradicted the very lesson
it cited — none of which the reference checker (which verifies structure, not
meaning — LESSONS §29) could see.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.57.0](../../CHANGELOG.md)
