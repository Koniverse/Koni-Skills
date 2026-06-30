# traceability — the AC↔TC matrix, TC-ID scheme, and the canonical table

> **Load when**: you are recording derived cases and proving the suite complete
> (the **Design** + **Self-review** stages of [`qc-workflow.md`](qc-workflow.md)).
> This is the spine of koni-qc — the one artifact **neither** corpus had. The
> backup left AC↔TC traceability implicit; Koni-Finance had rich per-TC tables
> but no full coverage matrix. koni-qc makes the matrix mandatory and the gate.

Traceability answers two questions a reviewer must be able to answer in seconds:
*"is every requirement tested?"* (no orphan AC) and *"does every test trace to a
requirement?"* (no orphan TC). Without it, a 250-case suite can still leave a
critical AC untested and nobody notices. With it, coverage is provable.

---

## TC-ID scheme

Every test case carries a stable ID: `TC-<EPIC>.<TYPE>-<n>`.

- `<EPIC>` — the epic number (`02`) or a short domain slug for a feature suite
  (`CN` for customize-network). Domain prefixes (Koni-Finance style — `NONCE-`,
  `RLS-`, `SEC-A01-`) are allowed *inside* a suite for sub-areas.
- `<TYPE>` — one of:

  | TYPE | Meaning |
  |---|---|
  | `E2E` | end-to-end flow spanning ≥2 stories |
  | `FUNC` | functional behaviour of a single capability |
  | `API` | request/response contract at a service boundary |
  | `REG` | regression — guards a previously-fixed bug or invariant |
  | `SMK` | smoke — fast post-deploy sanity |
  | `SEC` | security — authn/authz, injection, data isolation |
  | `PERF` | performance — latency/throughput vs an SLA |
  | `A11Y` | accessibility — keyboard, screen-reader, contrast |

- `<n>` — sequential within (epic, type), starting at `1`.

**Never renumber.** A removed TC keeps its number (marked deprecated) so
cross-references in test-reports, lessons, and PRs survive. This matches the
koni-docs `test-cases/EPIC-N.md` convention exactly — koni-qc adds the extra
TYPEs (FUNC/API/SEC/PERF/A11Y) on top of koni-docs' core set, it does not
replace the scheme.

---

## The canonical test-case table

The rich per-TC table, adopted verbatim from the Koni-Finance production
standard. Every functional/edge case is one row. The columns are fixed:

`TC-ID | Name | Priority | Test data | Preconditions | Action/Request | Expected | Actual | Status | Perf | Side-effects | Covered-by`

| TC-ID | Name | Priority | Test data | Preconditions | Action/Request | Expected | Actual | Status | Perf | Side-effects | Covered-by |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-CN.FUNC-1 | Add reachable EVM network | P0 | `https://rpc.ankr.com/eth` | Manage Network open, network not present | + → paste RPC → auto-detect → Save | EVM detected; name/symbol/decimals/chainId auto-filled; network appears in selector | — | ready | detect < 3s | 1 row added to custom-network store | — (manual) |
| TC-CN.SEC-1 | Reject script in network name | P0 | name `<script>alert(1)</script>` | Manage Network open | enter name → Save | name stored escaped; rendered as literal text; no script executes | — | ready | n/a | no DOM injection in selector | `e2e/customize-network.spec.ts::xss-name` |

Column contract:
- **Priority** — `P0..P3`, derived from risk (see §Risk-based priority).
- **Test data** — a concrete, reusable value, never "some valid input".
- **Preconditions** — the system state before the action (the Gherkin *Given*).
- **Action/Request** — the user action or the API request (the *When*).
- **Expected** — the observable outcome + invariant (the *Then*).
- **Actual / Status** — filled at execution; `ready/draft/pass/fail/blocked`.
  Execution *history* lives in koni-docs `test-report.md`, not here — this
  column is only the current state.
- **Perf** — measured time **or** the SLA target the case asserts (see
  [`nfr.md`](nfr.md) §Performance).
- **Side-effects** — DB writes, store mutations, events, files — the things a
  reviewer can't see in the UI.
- **Covered-by** — the automation handle (`*.spec.ts::name`) or `— (manual)`.

> The koni-docs `test-cases/EPIC-N.md` container also supports a Gherkin
> Given/When/Then block per scenario. Use the canonical table for the dense
> per-case grid; promote a flow to a full Gherkin H3 when it spans ≥2 stories.
> koni-qc supplies the columns; koni-docs supplies the file structure — do not
> duplicate the koni-docs template here, fill it.

---

## AC↔TC coverage matrix

**The mandatory artifact. The gate. The thing both corpora lacked.**

Every story's acceptance criteria are listed, each mapped to the TCs that cover
it and the case *types* those TCs span.

| Story | AC | AC description | TC(s) | Types covered |
|---|---|---|---|---|
| US-X.Y | AC-1 | Add a reachable network → appears in selector | TC-CN.FUNC-1, TC-CN.FUNC-7, TC-CN.FUNC-9 | positive, negative, boundary |
| US-X.Y | AC-2 | Reject unreachable / invalid / duplicate RPC | TC-CN.FUNC-3, TC-CN.FUNC-4, TC-CN.FUNC-5 | negative, negative, boundary |

**The completeness rule (non-negotiable):**

> Every AC has **≥1 positive AND ≥1 negative AND ≥1 boundary** TC.
> **No orphan AC** (an AC with no TC). **No orphan TC** (a TC that maps to no
> AC). If any holds, the suite is incomplete and does not pass the gate.

How it is enforced:
- An AC missing any of positive/negative/boundary → return to
  [`test-design.md`](test-design.md) and derive the missing class (boundary via
  boundary-value analysis, negative via partitioning + the
  [`edge-coverage.md`](edge-coverage.md) taxonomy).
- An orphan TC → either it tests an unwritten requirement (raise it as a
  PRD/story gap) or it is dead weight (remove it).
- An orphan AC → write the cases; until then it is logged in *Open / deferred*
  with an owner and target.

This matrix is checked in **Self-review** against
[`quality-bar.md`](quality-bar.md) (Band-A) and again by the author-blind review.
It is the single most important difference between a koni-qc suite and the backup.

---

## Risk-based priority & regression

**Priority = impact × likelihood.** Impact = blast radius if it breaks (data
loss, fund loss, auth bypass = high). Likelihood = how often the path runs ×
how fragile it is. The product sets the `P0..P3` in the canonical table:

| | High impact | Med impact | Low impact |
|---|---|---|---|
| **High likelihood** | P0 | P0 | P1 |
| **Med likelihood** | P0 | P1 | P2 |
| **Low likelihood** | P1 | P2 | P3 |

**Run-order under time pressure**: P0 first (release-blockers), then P1; P2/P3
only if time remains. The order is the value of the priority column — a suite
that can't all run still runs the cases that matter.

**Regression tagging (`RC-`)**: cases that guard the per-release baseline — a
fixed bug must never return, a cross-story invariant must hold — are tagged
`RC-<n>` in addition to their TC-ID and collected into the release regression
set. This is the "undefined regression scope" gap from the backup, closed: the
`RC-` set *is* the regression scope, run every release.

---

## koni conventions preserved

koni-qc adds rigor on top of the existing koni conventions — it does not discard
them:

- **Platform-variant columns** — a case that differs by surface keeps the
  `[extension]` / `[mobile]` / `[webapp]` / `[telegram]` variant tag; one row may
  fan out per platform (pairwise, see [`test-design.md`](test-design.md)).
- **L1/L2/L3 sub-case hierarchy** — a parent case may have indented sub-cases for
  step-level detail; the parent TC-ID owns the matrix entry.
- **Explicit preconditions** — the Preconditions column is mandatory, never
  blank, never "logged in" alone — name the exact state.
- **Issue-tracker links** — a case born from a bug links the issue in *Notes* /
  Covered-by; an `RC-` regression cites the bug it guards.
- **Native-language steps** — Vietnamese (or other) step text is allowed in
  internal suites; the canonical docs (koni-docs templates) remain English-only
  per RULE-13.
