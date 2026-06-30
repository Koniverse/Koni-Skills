# test-organization — the standard test-doc & test-code layout

> **Load when**: setting up a repo's test surface, or deciding *where* a test
> doc / test file goes. This is the **compass** — the folder taxonomy, the
> by-epic + suffix code layout, the 3-place sync rule, and the status legend.
> It is the standing standard; [`traceability.md`](traceability.md) owns the
> TC-ID scheme and the AC↔TC matrix, this owns *where things live*.

**Contents**: [docs/tests taxonomy](#1-the-docstests-taxonomy) ·
[Test-code layout](#2-test-code-layout-by-epic-type-in-the-suffix) ·
[The 3-place sync rule](#3-the-3-place-sync-rule) ·
[State cleanup](#4-state-cleanup--idempotent-tests) ·
[Status legend](#5-status-legend) · [Scaffolding](#6-scaffolding-who-creates-the-tree) ·
[Ownership](#7-ownership-boundary)

Synthesized from the matured Senti-Quant QA reorg (2026-06-30) and generalized
for any Koniverse repo.

## 1. The `docs/tests/` taxonomy

```
docs/tests/
├── README.md             ← QA hub (entry point; links the coverage epic)
├── test-organization.md  ← STANDING: this standard (points here)
├── findings.md           ← STANDING: open QA findings tracker
├── test-plan/            ← strategy per epic — EPIC-NN-<slug>.md (scope · risk · priority)
├── test-cases/           ← specs per epic — EPIC-NN.md + README.md (koni-qc authored: TC-IDs + AC↔TC matrix + gherkin)
├── test-reports/         ← one folder per run
│   └── EPIC-NN/<MMDDYYYY>/
│       ├── report.md / img/            ← AUTOMATED — the test runner/reporter is the ONLY writer
│       └── report-manual.md / img-manual/  ← MANUAL run — written by its skill, not by hand
├── bug-bash/             ← end-of-sprint bug-bash reports — sprint-YYYY-WNN.md
└── audits/               ← point-in-time analyses (dated, historical; not maintained)
```

| Folder | Owner | Purpose |
|---|---|---|
| `test-plan/` | QA | per-epic strategy: scope, out-of-scope, risk map, priority order |
| `test-cases/` | koni-qc (Dev/PM) | the source specs — TC-IDs, AC↔TC matrix, Given/When/Then |
| `test-reports/` | the runner (auto) | per-run output; **never hand-edited** (manual runs use `report-manual.md`) |
| `bug-bash/` | whole team | end-of-sprint break-it-together findings |
| `audits/` | QA | dated one-off analyses (e.g. a koni-qc quality-bar grade); kept for history |

> **Root holds only standing docs + the framework subdirs.** Dated one-offs go in
> `audits/`; run output goes in `test-reports/EPIC-NN/<MMDDYYYY>/` — never at root.

## 2. Test-code layout: by epic, type in the suffix

Test **code** (not docs) is organized **by epic, never by test type**:

```
<app>/tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts
```

The **run cadence** is encoded in the file SUFFIX (not a sub-folder):

| Suffix | Cadence / runner | When |
|---|---|---|
| `*.integration.spec.ts` | API / server-side (calls actions directly) | per commit |
| `*.e2e.spec.ts` | end-to-end via real UI | per PR |
| `*.smoke.spec.ts` | light post-deploy smoke (real anchor) | per deploy / release |
| `*.unit.test.ts` | pure logic (Dev owns; QA skips) | — |

- **No `integration/` or `e2e/` sub-folders** — keep files flat in the epic folder;
  group cases inside a file with `describe`.
- **Suffix ≠ TC-ID TYPE.** The TC-ID TYPE (`FUNC`/`NEG`/`BND`/`SEC`/`EDGE`/… per
  [`traceability.md`](traceability.md)) says *what the case tests*; the file suffix
  says *how/when it runs*. A `TC-NN.SEC-1` can live in an `.integration.spec.ts`
  or `.e2e.spec.ts` file depending on its cadence. Keep koni-qc's TYPE-based TC-ID;
  feature grouping (LINK/CRED/…) is expressed via the domain-prefix allowance in
  `traceability.md`, not by moving type out of the code.

## 3. The 3-place sync rule

One TC-ID threads through **three** places; change one → change all three:

1. **Source spec** — `docs/tests/test-cases/EPIC-NN.md` (the source of truth: TC-ID + gherkin + yaml `maps_to {fr, ac}`). Written *before* coding.
2. **Test code** — `…/tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts`; the test name **starts with the TC-ID** so the reporter can parse it.
3. **Coverage story** — the `docs/sprints/stories/US-*.md` row: TC-ID → Status + coverage % + report link.

- **Spec ↔ code** is manual (the drift-prone direction — check on PR review).
- **Code → story** is automated by the run/report tooling (gstack `qa` or a repo
  `/run-test`): run → report → parse TC-IDs → update Status + coverage % + link.
  Never hand-edit `test-reports/`.

## 4. State cleanup / idempotent tests

**What a test creates, the same test removes.** A test that links an account,
deploys, or creates a share-link MUST delete exactly that data when done, in an
`afterEach`/`finally` (runs even on mid-test failure) via a fixture cleanup
helper — only what it created, never pre-existing data. Tests must be idempotent:
same outcome every run. Read-only cases need no cleanup. (This is the operational
half of the reliability axis in [`nfr.md`](nfr.md).)

## 5. Status legend

- **Test-case spec files** (`test-cases/EPIC-*.md`) — icons OK: ✅ pass · ❌ fail
  (reproducible) · ⚠️ flaky · ⏸️ blocked · 🚧 impl-gap · 📋 manual-only · ⊘ retired ·
  — not-written.
- **US story files** (`sprints/stories/US-*.md`) — **plain words, no icons**
  (machine-parsed, diff-able): `done` · `failed` · `pending` · `impl-gap` ·
  `manual` · `covered-by X` · `in-progress`.
- **Run reports** — icons follow what the reporter emits; do not hand-edit.

## 6. Scaffolding: who creates the tree

- **If the repo is set up with koni-setup** — koni-setup creates this `docs/tests/`
  skeleton at bootstrap (it owns the directory skeleton; bodies come from koni-docs
  templates and this standard).
- **If the repo does NOT use koni-setup** — koni-qc **self-scaffolds** the missing
  tree (additive, only writes absent paths):

```sh
mkdir -p docs/tests/test-cases docs/tests/test-plan docs/tests/bug-bash docs/tests/audits
[ -f docs/tests/README.md ]            || printf '# docs/tests — QA hub\n\n> See test-organization.md for the standard.\n' > docs/tests/README.md
[ -f docs/tests/test-organization.md ] || printf '# Test organization\n\n> Follows koni-qc references/test-organization.md.\n' > docs/tests/test-organization.md
[ -f docs/tests/findings.md ]          || printf '# Open QA findings\n' > docs/tests/findings.md
[ -f docs/tests/test-cases/README.md ] || printf '# Test cases\n\n> EPIC-NN.md specs — via koni-docs templates/test-cases.md\n' > docs/tests/test-cases/README.md
# per-epic report folders are created on first run: docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/
```

> **READMEs**: the three root standing docs always exist; `test-cases/` also
> carries a one-line `README.md` (it's the most-edited subdir). The other empty
> framework dirs (`test-plan/`, `bug-bash/`, `audits/`) are kept in git with a
> `.gitkeep` rather than a stub, and `test-reports/` isn't created until a run.

Only create `test-reports/EPIC-NN/<MMDDYYYY>/` when a run actually produces a
report — don't pre-create empty dated folders.

## 7. Ownership boundary

koni-qc owns this **standard** (where test docs live + the conventions);
**koni-docs** owns the doc-body **templates** that fill `test-cases/` /
`test-report.md`; **koni-setup** **scaffolds** the tree at setup; **gstack** runs
the tests and emits reports; **koni-harness** gates the commit. koni-qc composes
them — it never reproduces a template, a runner, or the scaffolder.
