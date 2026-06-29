# Audit — `koni-docs` skill vs. Koni-ERP-02 practice

- **Date**: 2026-05-21
- **Auditor**: Claude (Koni-ERP-02 working session)
- **Purpose**: Koni-ERP-02 is the reference repo whose documentation
  workflow the `koni-docs` skill is meant to codify into a convention
  for every other Koniverse repo. This audit compares what the skill
  *specifies* against what Koni-ERP-02 *actually does* (22 shipped
  versions, 118 stories, 126 LESSONS entries), so the skill can be
  corrected before it is rolled out as the standard.

## Verdict

`koni-docs` is **~85% faithful** to Koni-ERP-02's battle-tested
practice. The core engine — the 9 rules, 5-layer consistency, naming
conventions, the pre-commit checklist — matches. The remaining 15% is:

- **4 skill bugs** — the skill contradicts itself or contradicts proven
  ERP practice (D1–D4).
- **1 skill bug** — a referenced file does not exist (D5).
- **3 unresolved decisions** — operating-model choices not locked down
  (D6–D8).
- **2 ERP gaps** — files the framework expects that Koni-ERP-02 never
  created (G1–G2).

None of this blocks adoption; it is a punch list to make the skill an
accurate convention rather than an aspirational one.

---

## 1. Framework files — expected vs. present

| Doc | `koni-docs` expects | Koni-ERP-02 has | Status |
|---|---|---|---|
| `VERSION`, `CHANGELOG`, `CONTEXT`, `LESSONS`, `PRD`, `SETUP`, `DESIGN`, `DEPLOY`, `.env.example` | yes | all present | ✅ match |
| `Docs/sprints/` (`epics/`, `stories/`, `sprint-*`, `STATUS.md`) | yes | present (118 stories) | ✅ match |
| `Docs/design/`, `Docs/okr/` | yes | present | ✅ match |
| `Docs/README.md` (doc hub) | yes | present | ✅ match |
| `AGENTS.md` | required | **missing** | ⚠️ ERP gap (G1) |
| `ARCHITECTURE.md` | template provided | **missing** (folded into `DESIGN.md` + `CONTEXT.md`) | ⚠️ ERP gap (G2) |
| `BRIEF.md` | template provided | **missing** (folded into `PRD §1`) | ⚠️ ERP gap (G2) |
| `Docs/superpowers/{specs,plans}/` | not in framework | present, actively used | ⚠️ convention gap (P2) |

---

## 2. The 9 core rules — substance aligned

| Rule | Summary | Koni-ERP-02 evidence | Status |
|---|---|---|---|
| RULE-1 | VERSION + CHANGELOG in same commit | CLAUDE.md doc-maintenance §1–2; LESSONS §65 | ✅ |
| RULE-2 | CHANGELOG commit hash mandatory, never `pending` | LESSONS §65c — **method differs**, see D1 | ⚠️ |
| RULE-5 | STATUS.md auto-generated, never hand-edit | `npm run agile:status`; LESSONS §65 | ✅ |
| RULE-6 | Story id matches filename + PRD entry | LESSONS §68 | ✅ (section number wrong — see D2) |
| RULE-7 | CONTEXT.md append-only | Honored — **entry format differs**, see D6 | ⚠️ |
| RULE-10 | Mark tasks `[x]` as completed | LESSONS §74 | ✅ |
| RULE-11 | New env var → SETUP + DEPLOY + .env.example | CLAUDE.md doc-maintenance §5 | ✅ |
| RULE-13 | English-only deliverables | CLAUDE.md "Language policy" | ✅ |
| RULE-14 | Conventional commit prefix | `feat:` / `fix:` / `docs:` used throughout | ✅ |

The 5-layer consistency model (Story → Epic → PRD → Sprint → STATUS) in
`sprint-system.md` is an **exact match** for Koni-ERP-02 LESSONS §69.
Naming conventions (`US-X.Y` / `TASK-X.Y.N` / `EPIC-N` /
`sprint-YYYY-WNN`) match LESSONS §68. Story frontmatter schema matches.

---

## 3. Scripts

| | Koni-ERP-02 | `koni-docs` |
|---|---|---|
| Location | repo `scripts/` | `skills/koni-docs/scripts/` (run in place) |
| Status generator | `agile-status.mjs` | `generate-status.mjs` |
| `agile-sync-up`, `agile-inject-tasks`, `agile-backfill-fields`, `changelog-backfill-commits` | same names | same names |
| Default `--docs-path` | `Docs/` | `docs/` |

Koni-ERP-02 **copied the scripts into the repo and renamed**
`generate-status` → `agile-status`. `koni-docs` explicitly says *never
copy — run from the skill path*. This operating-model split is
unresolved (D8).

---

## 4. Divergences

### D1 — RULE-2 hash method: `--amend` vs. two-commit `[skill bug]`

- **`koni-docs` (`rules.md` RULE-2)**: fill the CHANGELOG SHA via
  `git commit --amend`, then push.
- **Koni-ERP-02 (LESSONS §65c)**: a separate `docs: backfill commit
  hash <sha>` commit. `--amend` rewrites the very SHA being recorded,
  and forces a `--force` push if the feature commit was already pushed.
- **Recommendation**: change RULE-2 to the two-commit pattern. Also
  document ERP's accepted alternative — putting `— vX.Y.Z` in the
  commit subject so `git log --grep` resolves without a SHA.

### D2 — PRD section numbers are self-contradictory `[skill bug]`

- **`koni-docs`**: `SKILL.md` activation table says "PRD **§11**";
  `rules.md` RULE-6 says "PRD **§7**"; `agile-sync-up.mjs` comments say
  "PRD §11 table" + "PRD §8 FR"; the frontmatter cheatsheet says
  `prd_ref: FR-N — PRD §8 FR`.
- **Koni-ERP-02**: `§4` = Functional requirements (FR); `§7` = Epics &
  user stories. No `§8` FR, no `§11`.
- **Recommendation**: standardize the skill on **§4 = FR**, **§7 =
  Epics & stories**, and fix the script comments.

### D3 — `docs/` vs. `Docs/` is self-contradictory `[skill bug]`

- **`koni-docs`**: `SKILL.md §0` diagram uses lowercase `docs/`;
  `sprint-system.md` and the 5-layer table use `Docs/`; scripts default
  to `docs/`.
- **Koni-ERP-02**: `Docs/` (capital D) everywhere.
- **Recommendation**: standardize on `Docs/`; fix the script default.

### D4 — Pipeline says "Implementation → Superpowers" `[skill bug]`

- **`koni-docs` (`SKILL.md §1`)**: the pipeline table assigns the
  Implementation phase to Superpowers.
- **Koni-ERP-02 (LESSONS §120)**: Superpowers is used for
  brainstorm + planning **only**; implementation is done with Anthropic
  skills (`frontend-design`, etc.). The split is deliberate, for
  implementation consistency.
- **Recommendation**: update the pipeline row to reflect the split
  (Superpowers = plan; Anthropic skills = implement).

### D5 — `migration-from-bmad.md` is referenced but missing `[skill bug]`

- `SKILL.md §6` lists `references/migration-from-bmad.md`. The file does
  not exist (`references/` holds only `rules.md`, `sprint-system.md`,
  `templates.md`, `bmad-template-analysis.md`, `templates/`).
- **Recommendation**: create the file or drop the reference row.

### D6 — CONTEXT.md entry format: `D<N>` vs. date-headed `[decision]`

- **`koni-docs` (RULE-7 + `context.md` template)**: `### D<N>. Title`
  decision entries.
- **Koni-ERP-02**: 54 historical `### D<N>` entries, but **every recent
  entry** is `## YYYY-MM-DD — Title`. The repo drifted to date-headed.
- The append-only rule (RULE-7) is honored either way; only the heading
  format diverged.
- **Recommendation**: pick one canonical format. Date-headed is current
  ERP practice and reads better in a long log; `D<N>` cross-references
  more cleanly. Decide and align both.

### D7 — CLAUDE.md "Active Context" auto-update block `[decision]`

- **`koni-docs §4`**: every project's CLAUDE.md must carry a
  `## Koni-docs Integration` block and a
  `## Active Context <!-- koni-docs:auto-update -->` block, refreshed at
  triggers T1–T7.
- **Koni-ERP-02**: CLAUDE.md has **neither**. The Active Context
  mechanism was never adopted.
- **Recommendation**: it is genuinely useful for fast agent orientation
  — adopt it in Koni-ERP-02 and keep it in the convention, or drop it
  from the skill. Do not leave it specified-but-unused.

### D8 — Script operating model: copy-in vs. run-in-place `[decision]`

- **`koni-docs`**: scripts live in the skill; run them from
  `skills/koni-docs/scripts/`; never copy into the project.
- **Koni-ERP-02**: scripts were copied into repo `scripts/` and renamed.
- **Recommendation**: lock one model for all repos. Run-in-place keeps a
  single source of truth and auto-upgrades with the skill; copy-in
  survives without the skill installed. Pick one and document it.

---

## 5. Koni-ERP-02 practices worth promoting into the convention

| # | Practice | Note |
|---|---|---|
| P1 | `bin/check-design-system.sh` + `npm run lint:design` | Enforces DESIGN.md anti-slop (no inline hex, off-system fonts). A pre-commit guard the convention lacks. |
| P2 | `Docs/superpowers/{specs,plans}/` | Canonical home for brainstorm specs + implementation plans. The framework only has `design/` for design specs. |
| P3 | LESSONS §67 — read LESSONS + DESIGN before writing code | Pre-task discipline; pairs with the §3a "before writing any code" flow. |
| P4 | LESSONS §120 — skill workflow split | See D4. Worth stating as an explicit convention, not just a pipeline cell. |

---

## 6. Action summary

**Fix in the `koni-docs` skill (bugs):**

1. D1 — rewrite RULE-2 to the two-commit backfill pattern.
2. D2 — standardize PRD section numbers (§4 FR, §7 stories).
3. D3 — standardize on `Docs/` (capital).
4. D4 — correct the pipeline (Superpowers = plan only).
5. D5 — create or de-reference `migration-from-bmad.md`.

**Decisions to lock (then update the skill):**

6. D6 — CONTEXT entry format: `D<N>` or date-headed.
7. D7 — keep or drop the Active Context auto-update block.
8. D8 — script operating model: run-in-place or copy-in.

**Fix in Koni-ERP-02 (gaps):**

- G1 — add `AGENTS.md` (or confirm the repo is Claude-only and mark
  `AGENTS.md` optional in the convention).
- G2 — decide whether `ARCHITECTURE.md` / `BRIEF.md` are required or
  optional; today their content lives in `DESIGN.md` + `CONTEXT.md` +
  `PRD §1`.

**Consider promoting:** P1–P4 above.
