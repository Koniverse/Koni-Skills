# koni-qc — QC methodology & coverage-intelligence skill — Design Spec

**Date**: 2026-06-28
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: a new skill `skills/koni-qc/` (compose-first, additive)
**Builds on / composes**: koni-docs (test-cases + test-report templates, `docs/tests/`), gstack (`qa`/`qa-only`/`investigate`/`browse`), koni-harness (gate + loop + sprint), BMAD (plan). References two surveyed corpora: `koni-docs.backup` (the weak manual baseline to beat) and `Koni-Finance` (the production-grade "standard" to codify).

> Built by **dogfooding koni-harness**: this skill is itself produced by running
> the Koni Agentic Loop (frame → execute → review → doc-gate → commit) at tier 2.

---

## 1. Purpose

A full QC skill that turns koni-docs-standard inputs (PRD FRs, stories + AC,
ARCHITECTURE, epics) into **Silicon-Valley-grade test documentation** and drives
**quality-control execution** — covering all cases + edge cases so a product runs
smoothly.

It is **compose-first** (the session's invariant): it adds the one thing nothing
in the catalog has — the *methodology + coverage intelligence* to derive
exhaustive, traceable test coverage — and delegates everything else:

| Concern | Owner |
|---|---|
| Test-doc templates / structure / `docs/tests/` | **koni-docs** (`test-cases.md`, `test-report.md`) — invoked |
| Execution (browser/systematic QA, bug reports) | **gstack** (`qa`/`qa-only`/`investigate`/`browse`) — invoked |
| Commit/release gate, loop, epic selection | **koni-harness** — invoked |
| Plan artifacts (brief→PRD→story) | **BMAD** — invoked |
| **QC methodology, coverage model, traceability, NFR, rubric** | **koni-qc** (this) |

### Non-goals

- Not a new doc template or `docs/tests/` layout (koni-docs owns those).
- Not a new execution engine (gstack owns execution).
- No scripts/automation code in v1 — it is a methodology skill (prose + a
  rubric). A later version may add a coverage-lint script; YAGNI for the pilot.

---

## 2. The two reference corpora (what we beat / codify)

**`koni-docs.backup` — the floor to beat (12 gaps).** ~100 Notion-CSV manual
suites, ~70% happy-path. Gaps: no explicit TC IDs; implicit AC↔TC traceability;
thin negative/boundary (~25%); <5% non-functional; no coverage matrix; ad-hoc
test data; no entry/exit criteria; no test lifecycle; no risk-based
prioritization; undefined regression scope; no automation linkage; empty
reports. **Conventions to preserve**: platform variants (`[extension]`/`[mobile]`/
`[webapp]`/`[telegram]`), L1/L2/L3 sub-case hierarchy, explicit preconditions,
issue-tracker links, a master registry, test-type tags, native-language (VI)
steps allowed.

**`Koni-Finance` — the standard to codify.** `docs/features/EPIC-*/test-cases/`
(~4,033 lines, ~250 TCs; API + functional + security). Strengths: prefixed TC
IDs (`NONCE-`/`SIWE-`/`RLS-`/`SEC-A01-`); a **rich per-TC metadata table**
(priority · test-data · preconditions · request/action · expected · **actual** ·
status · **response-time** · **DB/side-effects** · **covered-by/automation**);
a **dedicated security suite**; concrete reusable test data; execution
instrumentation (coverage % by endpoint/HTTP-status/error-code). Residual gaps
koni-qc must close: **no full AC↔TC coverage matrix**; no env-setup/fixtures
playbook; partial a11y; no perf SLAs; no cadence.

**koni-qc target = "better than both"**: koni-docs' story/AC-centric 10-section
container + koni-finance's rich per-TC table + the **mandatory AC↔TC coverage
matrix neither has** + closing both gap-lists.

---

## 3. Deliverable shape & layout (additive)

```
skills/koni-qc/
├── SKILL.md                          # orchestrator: modes + owns/delegates + activation table
└── references/
    ├── qc-workflow.md                # the QC lifecycle (frame→design→review→execute→release gate)
    ├── test-design.md                # test-design techniques (how to derive cases from an AC)
    ├── edge-coverage.md              # the edge-case taxonomy (fixes "70% happy path")
    ├── traceability.md               # AC↔TC matrix contract + TC-ID scheme + risk/regression tagging + the canonical rich-TC table
    ├── nfr.md                        # non-functional coverage — security (lead) / perf / a11y / i18n / reliability / compatibility / observability
    └── quality-bar.md                # the Silicon-Valley rubric (the scored bar to beat both corpora)
```

Wired into this repo via mirrored `.claude` / `.agents` symlinks, like the other
skills. No existing skill or doc is modified except additive registration.

---

## 4. The methodology (references)

### 4.1 `test-design.md` — derive cases from requirements
Equivalence partitioning, boundary-value analysis, decision tables,
state-transition testing, pairwise/combinatorial, error-guessing. For each AC:
the procedure to enumerate positive + negative + boundary partitions into
concrete cases.

### 4.2 `edge-coverage.md` — the edge taxonomy (the headline coverage fix)
A checklist applied to every feature so coverage stops at thorough, not
happy-path: null/empty/zero/max/overflow; malformed/encoding/emoji/i18n;
injection/XSS/special-chars; concurrency/double-submit/race; permission/auth/
ownership; network flaky/offline/timeout/retry; state/lifecycle transitions;
timezone/locale; idempotency; pagination/large-data. Each maps to the backup gap
it closes.

### 4.3 `traceability.md` — the matrix + the canonical TC table
- **TC-ID scheme**: `TC-<EPIC>.<TYPE>-<n>` (TYPE ∈ E2E/FUNC/API/REG/SMK/SEC/PERF/
  A11Y), plus koni-finance-style domain prefixes allowed inside a suite.
- **Canonical rich-TC table** (adopted from koni-finance): `TC-ID | Name |
  Priority | Test data | Preconditions | Action/Request | Expected | Actual |
  Status | Perf | Side-effects | Covered-by`.
- **AC↔TC coverage matrix (MANDATORY — the thing both corpora lack)**: every AC
  (and FR) maps to ≥1 positive **and** ≥1 negative **and** ≥1 boundary TC; no
  orphan AC (untested) and no orphan TC (untraceable). The matrix is the gate.
- **Risk-based prioritization**: priority = impact × likelihood; the order to run
  if time is short. **Regression tagging** (`RC-`) marks the per-release baseline.
- Preserves koni conventions: platform-variant columns, L1/L2/L3 hierarchy,
  precondition discipline, issue links.

### 4.4 `nfr.md` — non-functional (security-led)
Security FIRST (codifying koni-finance's dedicated suite: authn/authz, token
storage/rotation, CSRF/SameSite, replay/nonce, rate-limit, RLS/data-isolation,
injection); then performance (with **SLA targets**, not just measurements),
accessibility (WCAG keyboard/screen-reader/contrast), i18n/l10n, reliability/
resilience (failure-mode tests), compatibility (cross-platform/browser),
observability. Per-category checklist + when each is required by risk.

### 4.5 `qc-workflow.md` — the lifecycle (composes everything)
1. **Frame** — read koni-docs inputs (PRD/stories/AC/ARCH); pick the epic
   (koni-harness `sprint.sh`); define scope + entry/exit criteria + test-data
   strategy/fixtures + environment.
2. **Design** — author the per-epic test-cases doc *into koni-docs'
   `docs/tests/test-cases/EPIC-N.md` template*, filling it with the rich-TC table
   (4.3), driven by test-design (4.1) + edge taxonomy (4.2) + NFR (4.4); build the
   AC↔TC coverage matrix.
3. **Self-review** — grade against `quality-bar.md`; no orphan AC/TC; edge +
   NFR coverage present.
4. **Execute** — drive gstack (`qa`/`investigate`/`browse`) per case; record
   results into koni-docs' `test-report.md` run template with execution
   instrumentation (coverage % by AC/type, pass/fail, perf vs SLA).
5. **Release gate** — entry/exit criteria met → koni-docs release report + ship
   decision; koni-harness `gate`. Test lifecycle: active/deprecated/archived.

### 4.6 `quality-bar.md` — the rubric ("better than both")
A scored checklist used to self-grade and in review. Three bands: (a) **beat the
backup's 12 gaps** (explicit TC IDs, AC↔TC matrix, ≥50% negative/boundary, NFR
present, coverage matrix, test-data strategy, entry/exit, lifecycle, risk order,
regression scope, automation linkage, real reports); (b) **match koni-finance's
strengths** (rich per-TC metadata, dedicated security, concrete test data,
execution instrumentation); (c) **close koni-finance's residual gaps** (full
AC↔TC matrix, env/fixtures playbook, a11y/i18n, perf SLA, cadence). A doc must
clear all of (a) and demonstrably exceed (b)/(c) to pass.

---

## 5. SKILL.md (orchestrator)

Frontmatter `name: koni-qc` + a pushy description (triggers on "write test
cases", "QC", "test plan", "coverage", "edge cases", "test this product/epic",
"QA the release", over koni-docs-standard inputs). Body: owns-vs-delegates;
modes — **author test-cases for EPIC-N** / **run QC execution for EPIC-N** /
**release gate for vX.Y.Z**; an activation table mapping intent → reference;
the reference index; the compose contract (invoke koni-docs/gstack/koni-harness,
never reproduce).

---

## 6. Pilot (proof it beats the manual docs)

Generate a koni-qc test-cases doc for **`customize-network`** (a backup feature:
58 manual cases, ~70% happy-path), authored from its requirements into the
koni-docs EPIC template, demonstrating: explicit TC IDs; the AC↔TC coverage
matrix; the added negative/boundary/injection/concurrency cases the backup
missed; an NFR+security section; risk-based priority; the rich-TC metadata table.
Produce a short **before/after delta** (manual 58 shallow → koni-qc N cases with
full traceability + edge + NFR). The pilot proves the **authoring** uplift;
execution wiring is defined (gstack) but not run live (the SubWallet product is
not in this repo).

---

## 7. Verification

Docs-only skill → no test suite. Verify via:
- **Self-grade** the pilot doc against `quality-bar.md` (all band-(a) items;
  exceeds (b)/(c)).
- **Author-blind review subagent**: confirm koni-qc references are coherent and
  self-contained; the pilot doc beats the backup `customize-network` suite on
  each of the 12 gaps AND matches the koni-finance strengths; and koni-qc does
  **not** duplicate koni-docs templates or gstack execution (compose-only).
- A grep self-check that koni-qc references the koni-docs templates + gstack by
  name (delegation present), not re-defined.

---

## 8. Build via koni-harness (dogfood) + ship

Open **EPIC-5 — Koniverse QC skill** + story **US-5.1** (koni-qc). Run the
koni-harness loop: `loop.sh start US-5.1 --tier 2` → execute (subagent-driven
write of SKILL.md + 6 references + pilot) → two-stage review → doc-gate
(koni-docs backfill: EPIC-5, US-5.1, PRD FR-26, CHANGELOG, sprint, STATUS) →
`gate work-commit` → ship at **v0.16.0**. Wire symlinks. Validate green.

---

## 9. Open questions (resolve during planning)

- **EPIC-5 vs extend EPIC-3**: EPIC-3 is `done`; koni-qc is a new catalog
  deliverable → new **EPIC-5** (EPIC-4 is the viewer). Confirm numbering in plan.
- **Pilot location**: write the pilot test-cases doc under a scratch/example path
  (it documents a SubWallet feature, not this repo's product) — e.g.
  `skills/koni-qc/references/examples/` or a `docs/tests/` example — decide in the
  plan so it doesn't pollute this repo's real `docs/tests/`. Lean: a
  `examples/` file inside the skill (illustrative, not this repo's QA).
