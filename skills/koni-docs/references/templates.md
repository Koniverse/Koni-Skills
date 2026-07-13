# Document Templates — Index

> Each Koniverse document type has its own template file under
> [`templates/`](templates/). This index lists what exists, when to use
> each, and where the canonical content lives. Load only the template
> file the user's request needs.


**Contents**: [Template files](#template-files) · [Conventions every template follows](#conventions-every-template-follows) · [Activation](#activation) · [Quick frontmatter cheatsheet](#quick-frontmatter-cheatsheet)

---

## Template files

| Template | File | Use when |
|---|---|---|
| **CHANGELOG entry** | [templates/changelog.md](templates/changelog.md) | Writing a changelog entry, shipping a version, closing a story |
| **CONTEXT.md — Decision Log** | [templates/context.md](templates/context.md) | Recording a product/architecture decision or revision (append-only, RULE-7) |
| **LESSONS.md — Lessons Learned** | [templates/lessons.md](templates/lessons.md) | Codifying a recurring trap, library quirk, or pattern that would save someone 30 minutes |
| **BRIEF.md — Product Brief** | [templates/brief.md](templates/brief.md) | Creating/updating the executive brief (precedes PRD §1) |
| **PRD — Product Requirements Document** | [templates/prd.md](templates/prd.md) | Creating/updating the full PRD section set; FR table rows; the PRD `Epics & User Stories` index |
| **ARCHITECTURE.md — System Architecture** | [templates/architecture.md](templates/architecture.md) | Documenting tech stack, components, data flow, AD-N summary table |
| **DESIGN Spec for a Story** | [templates/design-spec.md](templates/design-spec.md) | A story has visual/interaction complexity warranting a dedicated spec |
| **Epic File — Full Template** | [templates/epic.md](templates/epic.md) | Creating/updating an epic (BMad-grade: Mermaid maps, invariants, budgets) |
| **Story File — Full Template** | [templates/story.md](templates/story.md) | Creating/stubbing/updating a story (AC + Tasks + Verification commands) |
| **Sprint File** | [templates/sprint.md](templates/sprint.md) | Opening a sprint, planning scope, closing with retrospective |
| **SETUP.md + DEPLOY.md + .env.example** | [templates/setup.md](templates/setup.md) | Adding an env var (RULE-11 — all three files in same commit) |
| **OKR — File-Native Quarterly Ledger** | [templates/okr.md](templates/okr.md) | Project adopts file-native OKRs in `docs/okr/YYYY-QN.md` |
| **CLAUDE.md + AGENTS.md integration blocks** | [templates/integration.md](templates/integration.md) | Wiring koni-docs into a new project, refreshing Active Context |
| **Test Cases — per-epic scenarios** | [templates/test-cases.md](templates/test-cases.md) | Capturing end-to-end + regression + smoke scenarios at the EPIC level (complements per-story AC) |
| **Test Report — per-execution + per-release** | [templates/test-report.md](templates/test-report.md) | Recording an execution run (`test-reports/EPIC-NN/<MMDDYYYY>/report.md`) or aggregating a release (`releases/`) |

---

## Conventions every template follows

- **Frontmatter** (where applicable) lives at the top in YAML. `id` MUST
  match the filename. Status emojis are stable across the system:
  `📋 backlog / 🚧 in-progress / ✅ done / ⏪ reverted / 🗑️ deprecated`.
- **English-only** (RULE-13). Templates, prose, and generated content
  are all English even on Vietnamese-led projects.
- **Cross-references use markdown links** (`[text](path)`) — not inline
  backticks for file paths. Reviewers must be able to click through.
- **Filled examples are condensed**, not raw copies. The point is to
  show shape and tone; for a full real-world reference, link to the
  upstream repo (Koni-Finance-Final / Koni-ERP-02).
- **Templates are loaded on demand.** Never pre-load every template;
  load the single file that matches the user's intent.

---

## Activation

**Single source: [SKILL.md §5](../SKILL.md).** A mirror that must be kept in sync is
a mirror that will not be.

## Quick frontmatter cheatsheet

**Single source: [`frontmatter-spec.md`](frontmatter-spec.md) §3** — the per-document
contract, field by field, with the pattern each value must match.

A second copy used to live here, and it had already drifted: it described `due` and
`version_shipped` in words the spec does not use, and — worse — it taught two things
RULE-17 forbids (`AD-N` inside `prd_ref`, and `FR-X.1 .. FR-X.N` range syntax). It was
billed as the shortcut for agents who skip the full template, which made it the copy
most likely to be obeyed and the one least likely to be checked.

The lesson generalizes: **a cheatsheet that restates a contract is a second contract.**
Read the spec.
