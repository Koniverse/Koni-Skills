# test-automation — the loop that makes authored specs run and self-update

> **Load when**: you have authored `test-cases/EPIC-N.md` specs (TC-IDs + AC↔TC
> matrix) and now need to **automate** them end-to-end. The authoring refs
> ([`traceability.md`](traceability.md), [`test-design.md`](test-design.md),
> [`edge-coverage.md`](edge-coverage.md)) produce the specs; **this file is the
> chain that turns a spec into a running, self-reporting, CI-gated suite.**
> Without it koni-qc stops at "specs written, `— (manual)`, `test-reports/` empty".

**Contents**: [The automation spine](#the-automation-spine) ·
[1. Generate](#1-generate-spec--runnable-test) · [2. Report](#2-the-reporter-contract) ·
[3. Sync](#3-story-write-back-code--story) · [4. CI gate](#4-ci-gate--runner-bootstrap) ·
[Ownership](#ownership--why-a-contract-not-a-vendored-tool)

## The automation spine

Five steps; **1→2→3 is the unbroken spine** (generate → report → sync), tree-scaffold
is a prerequisite of 1, CI makes it enforced:

```
authored spec (TC-IDs)               ← authoring refs (done)
   │  §1 GENERATE
   ▼
tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts   (test name STARTS with the TC-ID)
   │  run with the repo runner (vitest / jest / pytest / playwright) → JSON
   ▼  §2 REPORT (the reporter contract)
docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/report.md   (reporter is the ONLY writer)
   │  §3 SYNC (story write-back)
   ▼
docs/sprints/stories/US-*.md   ← Status + coverage% + report link updated
   │  §4 CI GATE
   ▼
.github/workflows/*.yml   ← runs the suite + coverage threshold on every push/PR
```

> **Do NOT delegate this to "gstack `qa`".** gstack `qa` / `/design-review` is
> interactive **browser** QA — it does not generate unit/integration tests, parse a
> TC-ID → pass/fail, or write `report.md`. Those are the contracts below.

## 1. Generate: spec → runnable test

For each `TC-<EPIC>.<TYPE>-<n>` row in `test-cases/EPIC-N.md`:

- **Materialize the code tree** first (it is NOT created by the doc scaffold in
  [`test-organization.md`](test-organization.md) §6): `mkdir -p <app>/tests/epic/EPIC-NN`.
- **Emit one test whose name STARTS with the TC-ID** so the reporter (§2) can parse
  it — `test('TC-2.SEC-1 — tampered ciphertext is rejected', …)`. File:
  `<app>/tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts`, where the **cadence-suffix is
  how/when the case runs** (`.integration` per-commit · `.e2e` per-PR · `.smoke`
  per-deploy) — **not** the TC-ID TYPE (suffix ≠ TYPE, per
  [`test-organization.md`](test-organization.md) §2). This step generates the AC↔TC
  spec tests only; it does **not** emit `.unit.test.ts` files (those are Dev-authored,
  see the Ownership note below).
- **Map the canonical columns → arrange/act/assert**: `Test data` + `Preconditions`
  → arrange/fixtures; `Action/Request` → act; `Expected` → assert; `Side-effects` →
  post-assert. Group cases by feature with `describe`.
- **Write the `Covered-by` handle back** into the spec row: `<path>.spec.ts::<name>`
  (per [`traceability.md`](traceability.md)); flip the row from `— (manual)`.

**Ownership.** The **AC↔TC-spec tests** (integration/e2e/smoke authored from
`EPIC-N.md`) are **koni-qc-driven generation** — the agent generates them under this
step. The **per-function unit tests** ([`unit-coverage.md`](unit-coverage.md)) stay
**Dev-authored** alongside the code. Two authorship models, one runner + reporter.

## 2. The reporter contract

Turns a run into `report.md` — deterministic, no hand-editing.

- **Input**: the runner's machine output — `vitest run --reporter=json`,
  `jest --json`, `pytest --json-report` (needs the `pytest-json-report` plugin
  installed — it is **not** in pytest core), or `playwright test --reporter=json`.
- **Parse rule (per test)**: take the **leading `TC-<EPIC>.<TYPE>-<n>` token** of the
  test name → `{tcId, result: passed|failed|skipped, durationMs, error?}`. A test whose
  name has no TC-ID is an **orphan test** (flag it, per traceability).
- **Aggregate to one row per TC-ID** (a TC-ID can back several tests — a `describe`
  group or parametrized cases). Fold its tests: **any `failed` ⇒ the TC is `failed`**;
  else **any `skipped` ⇒ `blocked`**; else **`passed`**. One TC-ID → one report row.
- **Reconcile against the spec, not just the run.** Enumerate every `TC-<EPIC>.<TYPE>-<n>`
  in `test-cases/EPIC-N.md`; a TC with **no test in the JSON** is `not-written` (or, if
  the spec row is flagged manual-only `📋`, `manual`) — emit the row anyway. This is
  mandatory: coverage % (§3) is computed over the **spec's** TC list, so an un-generated
  TC must count as uncovered instead of silently vanishing.
- **Status mapping** — one canonical table from the TC outcome → `report.md` icon → the
  US plain-word legend (test-organization §5), so the write-back (§3) is deterministic
  and **lossless** (each report status has a *distinct* US plain-word — `blocked` and
  `not-written` do not both collapse to `pending`):

  | TC outcome | Source | `report.md` icon | US plain-word |
  |---|---|---|---|
  | all tests `passed` | fold (§2) | ✅ pass | `done` |
  | any `failed` | fold (§2) | ❌ fail | `failed` |
  | any `skipped` (precondition/dependency unmet) | fold (§2) | ⏸️ blocked | `blocked` |
  | no test for a spec TC | spec-reconcile | — not-written | `pending` |
  | spec row flagged manual-only `📋` | spec flag | 📋 manual-only | `manual` |
  | spec row flagged impl-gap `🚧` | spec flag | 🚧 impl-gap | `impl-gap` |

  The runner's fold (§2) only ever yields `passed`/`failed`/`blocked`; `manual` and
  `impl-gap` come from a **spec-row flag** (like manual-only), never guessed from an
  error string; `not-written` comes from the spec-reconcile step.

- **Output**: write `docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/report.md` in the
  koni-docs `test-report.md` template shape — a row per TC (id · status icon · time ·
  failure detail) + the run header (commit, env, runner). `report.md` is the
  **reporter's exclusive artifact**; manual `MAN-*` runs go in `report-manual.md`.
- **Build it as**: a thin script over the runner's JSON reporter (≈40 lines), or a
  repo `/run-test EPIC-NN` skill that wraps `<runner> → parse → aggregate → reconcile →
  write`. koni-qc specifies the *contract*; the repo owns the *script*.

## 3. Story write-back (Code → story)

The second half of the reporter — this is what the 3-place sync's "Code → story is
automated" ([`test-organization.md`](test-organization.md) §3) actually **is**:

- After `report.md`, patch each covered `docs/sprints/stories/US-*.md`: set the TC's
  **Status** — always the **plain-word** value from the §2 mapping table (`done` /
  `failed` / `blocked` / `pending` / `impl-gap` / `manual`), never an icon in a US file
  (test-organization §5) — the **coverage %** (per US = its covered ACs ÷ its ACs,
  where a TC with no passing test is *not* covered), and the **report link**. Runs are
  automated → never hand-edit these back.
- This makes [`quality-bar.md`](quality-bar.md)'s Band-A **"Coverage % reported"**
  tickable at Execute — it was un-satisfiable before because nothing computed it.

## 4. CI gate + runner bootstrap

The local koni-harness git-hook gate is the fast path; **CI is the enforced gate for
a cloud repo** (a fresh repo has neither by default — bootstrap both):

1. **Coverage script**: add a `test:cov` script that **enforces** the unit-coverage bar
   ([`unit-coverage.md`](unit-coverage.md), default ≥80% line-and-branch). The threshold
   lives in **config**, not a dotted CLI flag — for vitest/jest set
   `test.coverage.thresholds` / `coverageThreshold` in `vitest.config`/`jest.config`
   (then `test:cov` = `vitest run --coverage` / `jest --coverage`); only pytest takes it
   on the CLI (`pytest --cov --cov-fail-under=80`). A run below the bar must exit non-zero.
2. **CI workflow**: emit `.github/workflows/test.yml` that runs the TC suite + `test:cov`
   on every push/PR (optionally typecheck — `tsc --noEmit` — if the repo is typed); it
   fails the PR below the bar. This is the server-side counterpart to koni-harness's
   `pre-push` hook.
3. **Local gate rows**: add the `tests` + `unit-coverage` `passthrough` rows to
   `.koni-harness/gates.conf` (koni-harness [`gate-catalog.md`](../../koni-harness/references/gate-catalog.md)).

> **Monorepo / multi-app.** `<app>` is the epic's owning package, not the repo root:
> `test:cov` goes in **that package's** `package.json`, its `tests/epic/` tree and
> config live under the package, and the workflow runs it per-app (a matrix or a
> per-package job). Report paths stay repo-rooted at
> `docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/`.

**"A CI test gate exists"** is a Release-stage exit criterion (see
[`qc-workflow.md`](qc-workflow.md) §5) — without it the suite silently rots.

## Ownership — why a *contract*, not a vendored tool

koni-qc **defines these contracts + the procedure** (portable across vitest / jest /
pytest / playwright); the **repo's runner executes**; **koni-harness / CI enforces**.
It does not ship a vendored reporter binary — the parse rule (TC-ID = the test-name
prefix) and the report/story shapes are specified tightly enough that an agent builds
the ≈40-line script deterministically on any repo. What it must **not** do is what the
old wording did: assert that "gstack `qa` or a repo `/run-test`" already automates this
when a fresh repo has neither.
