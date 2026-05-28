---
id: US-4.30
title: "Frontmatter Reference Spec + RULE-17 + arch_ref / depends_on schema fields"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: "0.7.3"
prd_ref: []
arch_ref: []
depends_on:
  - US-4.29
assignee: saltict
commit: 66f9327
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Codify the per-field frontmatter contract diagnosed during US-4.29 cleanup
into a normative, written spec that every Koniverse project can be pointed
at when standardizing its own corpus. Add `arch_ref` and `depends_on`
schema fields so projects have a clean place to move AD-N references and
story-to-story dependencies out of the (FR-only) `prd_ref` field.
Backwards-compatible: the koni-docs script still accepts CSV-string and
array forms of `prd_ref`, so existing projects keep working while
migrating.

## Background

While shipping US-4.29 we ran `koni-docs sync` against Koni-Finance-Final
and surfaced a different failure class: stories were stuffing prose,
parenthetical qualifiers, dependency narratives, and architecture-decision
IDs into the `prd_ref` field. The parser splits on `,` and treats each
fragment as an FR lookup key — guaranteed table miss for fragments like
`"ARCH §External Services (Resend"` or `"FR-94 (shared with EPIC-5)"`.

The root cause is not the parser — it is that there was no written
contract specifying what `prd_ref` may contain, no convention for AD-N
refs that live in ARCHITECTURE.md (not PRD), and no place to put
cross-story dependencies. Story authors did the natural thing: piled
context into the only ref field they had.

The fix is documentation-first: write the spec, formalize a RULE, extend
the schema with the missing fields, and ship the change as a patch
(no parser behaviour change yet) so consumers can migrate at their own
pace.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-docs/references/frontmatter-spec.md` exists,
  defines the four canonical ID namespaces (FR / NFR / AD / US) with
  canonical regex, the per-document field contract (story / epic /
  sprint), the YAML list-form preference, an anti-pattern catalog with
  ≥5 real broken values from the Koni-Finance-Final corpus, and a
  migration playbook with grep audit recipe.
- [x] **AC-2** — RULE-17 added to `skills/koni-docs/references/rules.md`
  with BLOCKER severity, the exact compliance steps, grep checks for
  `prd_ref` / `arch_ref` / `depends_on`, and cross-link to the spec.
  The "9 rules" / "11 rules" counts in `rules.md` and `SKILL.md` are
  updated to "12 rules".
- [x] **AC-3** — `storySchema` extended with `arch_ref` and `depends_on`
  (both `z.union([z.string(), z.array(z.string())]).optional()`);
  `epicSchema` extended with `arch_ref`. `STORY_DEFAULTS` updated so
  `prd_ref` / `arch_ref` / `depends_on` default to `[]` (list form is
  the canonical default). All additive — existing string-form data
  keeps validating.
- [x] **AC-4** — `templates/story.md` §1 skeleton + filled example
  rewritten to use `prd_ref: [FR-N]`, `arch_ref: [AD-N]`,
  `depends_on: [US-X.Y]` list form, with per-section guidance pointing
  at the spec. `templates/epic.md` §1 skeleton + filled example
  rewritten to enumerate `prd_ref` entries (no `..` range syntax),
  with new `arch_ref` row.
- [x] **AC-5** — `SKILL.md` rules table includes RULE-17; reference-files
  table includes `frontmatter-spec.md` with explicit "when to load"
  trigger; activation table routes frontmatter-debugging intents to
  the spec.
- [x] **AC-6** — New unit tests in `__tests__/lib/schemas.test.ts`
  prove (a) `STORY_DEFAULTS.prd_ref/arch_ref/depends_on` default to
  `[]`, (b) `storySchema` accepts the new fields as YAML lists, and
  (c) `storySchema` accepts them as legacy CSV strings (backwards
  compat). Full suite passes (103/103).
- [x] **AC-7** — `VERSION` and `@koniverse/koni-docs` bumped to
  `0.7.3`. `KONI_DOCS_LIB_VERSION` constant updated. Smoke test
  asserts the new value.

## Tasks

- [x] **TASK-4.30.1** — Author `frontmatter-spec.md` (full per-field contract, anti-pattern catalog, migration playbook) (AC: 1)
- [x] **TASK-4.30.2** — Add RULE-17 to `rules.md` + bump rule count from 11 → 12 in both `rules.md` header and `SKILL.md` rules-table preamble (AC: 2)
- [x] **TASK-4.30.3** — Add `arch_ref` + `depends_on` to `storySchema` + `arch_ref` to `epicSchema`; update `STORY_DEFAULTS` so ID-list fields default to `[]` (AC: 3)
- [x] **TASK-4.30.4** — Rewrite `templates/story.md` §1 skeleton + filled mini-example + per-section guidance (AC: 4)
- [x] **TASK-4.30.5** — Rewrite `templates/epic.md` §1 skeleton + filled mini-example + per-section guidance (no `..` range syntax) (AC: 4)
- [x] **TASK-4.30.6** — Cross-link `frontmatter-spec.md` from `SKILL.md` reference-files table + add activation-table row for frontmatter intents (AC: 5)
- [x] **TASK-4.30.7** — Add 3 schema tests covering defaults + list form + CSV form acceptance (AC: 6)
- [x] **TASK-4.30.8** — Bump VERSION, package.json, KONI_DOCS_LIB_VERSION, smoke-test expectation to 0.7.3 (AC: 7)
- [x] **TASK-4.30.9** — Write CHANGELOG entry for v0.7.3

## References

- [`skills/koni-docs/references/frontmatter-spec.md`](../../../skills/koni-docs/references/frontmatter-spec.md) — the spec
- [`skills/koni-docs/references/rules.md`](../../../skills/koni-docs/references/rules.md) RULE-17 — the enforcement gate
- [US-4.29 — PRD label-only convention](US-4.29-prd-label-only-headings.md) — the cleanup that surfaced the underlying frontmatter problem

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.3](../../CHANGELOG.md)
