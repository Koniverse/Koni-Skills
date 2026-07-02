# test-design — derive cases from requirements

> **Load when**: you are turning a story's acceptance criteria into concrete
> test cases (the **Design** stage of [`qc-workflow.md`](qc-workflow.md)).
> This file is the *how* of case derivation; [`edge-coverage.md`](edge-coverage.md)
> is the checklist that guarantees you also cover the unhappy paths;
> [`traceability.md`](traceability.md) is where the derived cases are recorded
> (TC-ID + the canonical table) and proven complete (the AC↔TC matrix).

A test case is never invented; it is *derived* from a requirement by a named
technique. Naming the technique is what makes coverage auditable — a reviewer
can ask "which partition is this?" and "where is its boundary case?" instead of
trusting that the author thought of everything. The backup suite skipped this
step, which is why it landed at ~70% happy-path with no boundary or negative
coverage. koni-qc makes derivation explicit.

**Contents**: [Deriving cases from an AC](#deriving-cases-from-an-ac) ·
[Equivalence partitioning](#equivalence-partitioning) ·
[Boundary-value analysis](#boundary-value-analysis) ·
[Decision tables](#decision-tables) ·
[State-transition testing](#state-transition-testing) ·
[Pairwise / combinatorial](#pairwise--combinatorial) ·
[Error-guessing](#error-guessing)

---

## Deriving cases from an AC

The procedure, run once per acceptance criterion:

1. **Restate the AC as an input → expected-output contract.** Name every input
   variable (field, parameter, precondition state) and the observable output
   (UI state, response, side-effect, error).
2. **Partition each input** into equivalence classes — the valid classes and
   *every* invalid class (empty, wrong type, out of range, malformed). One
   representative per class. (See *Equivalence partitioning* below.)
3. **Find the boundaries** of every ordered/sized input and add a case at each
   edge and just past it. (See *Boundary-value analysis*.)
4. **Combine inputs** when the output depends on more than one — build a
   decision table or a pairwise set so you test the *combinations*, not just
   each input alone.
5. **Walk the states** if the feature has a lifecycle (draft→saved→deleted) —
   one case per legal transition and the illegal ones.
6. **Guess the errors** — run the AC through the
   [`edge-coverage.md`](edge-coverage.md) taxonomy and add the classes it flags
   (injection, encoding, concurrency, network failure, permission).
7. **Classify every derived case** as positive / negative / boundary-or-edge and
   assign it a `TC-<EPIC>.<TYPE>-<n>` ID. The matrix rule
   ([`traceability.md`](traceability.md)) requires *each AC* to end with **≥1
   positive AND ≥1 negative AND ≥1 boundary-or-edge** case (a `BND` *or* an `EDGE`
   case fills the third slot) — if any is missing, the AC is not done.
8. **If the AC is UI-bearing, add a design-review conformance case (MANDATORY).**
   Any AC that renders or changes UI **must** get a `TC-<EPIC>.UI-<n>` (or fold it into
   the relevant `FUNC`/`A11Y` case, per [`nfr.md`](nfr.md) §UI) whose pass condition is:
   **passes gstack `/design-review` against the repo's `DESIGN.md` AND the shadcn
   standard** (the full criteria are [`nfr.md`](nfr.md) §UI). The
   test design is **not done** for a UI AC until this case exists — a UI feature
   that is functionally green but fails design-review (drifts from DESIGN.md, or
   hand-rolls a component / bypasses the shadcn tokens) is a failure, so the case
   that would catch it must be authored up front, not discovered at Execute.

The output of this procedure is rows in the canonical test-case table, ready to
fill in the koni-docs `test-cases/EPIC-N.md` container.

---

## Equivalence partitioning

**What it is**: split each input domain into classes that the system should
treat identically, then test one representative per class. The premise: if one
value in a class works, they all do — so testing every value is waste, and
testing only the easy class is a gap.

**When to use**: every input with a "valid range / set" notion — text fields,
enums, numeric ranges, file types. Always your first pass.

**Worked example** — AC: *"RPC URL must be a reachable http(s) endpoint."*
Partitions: {reachable https} (valid) · {reachable http} (valid) · {well-formed
but unreachable} (invalid) · {malformed scheme e.g. `ftp://`} (invalid) ·
{empty} (invalid). Cases: positive `https://rpc.example.io` → saved; negative
`https://does-not-exist.invalid` → "Cannot connect to this provider"; negative
`ftp://x` → reject. Three classes, three cases — none of them happy-path-only.

---

## Boundary-value analysis

**What it is**: errors cluster at the edges of a range, so test the minimum, the
maximum, and the values immediately inside and outside each (`min-1, min,
min+1`). Pairs with partitioning: partition finds the classes, boundary tests
their seams.

**When to use**: any ordered or sized input — string length, numeric limits,
counts, decimals, pagination size, timeouts.

**Worked example** — AC: *"Token decimals is an integer 0–18."* The BVA probes
are `0`/`18` (just-valid, accepted) and `-1`/`19` (just-invalid, rejected) —
together these are **one boundary (`BND`) case** that asserts both the just-valid
accept *and* the just-invalid reject at each edge (this is how the matrix's
boundary slot is filled; see the no-double-counting rule in
[`traceability.md`](traceability.md)). A **negative (`NEG`)** case is different:
it rejects a value from a *wrong partition* — wrong type or malformed, e.g.
decimals = `"abc"` — not a value one step past a numeric edge. The backup tested
only "decimals = 18".

---

## Decision tables

**What it is**: enumerate the combinations of conditions and the action each
combination should produce, as a table — rows are rules, columns are
conditions + outcome. Forces you to cover combinations a per-input pass misses.

**When to use**: when the output depends on **multiple** conditions interacting
(flags, roles × states, validation rules that compound).

**Worked example** — AC: *"Save a network only if RPC reachable AND name
non-empty AND not a duplicate."*

| RPC reachable | Name present | Duplicate | → Outcome |
|---|---|---|---|
| Y | Y | N | save (positive) |
| N | Y | N | "Cannot connect" |
| Y | N | N | "Name required" |
| Y | Y | Y | "Network already exists" |

Four rules → four cases, one positive, three negative — each independently
verifiable.

---

## State-transition testing

**What it is**: model the feature as states + the events that move between them,
then test every legal transition and assert that illegal transitions are
refused. Catches lifecycle bugs (acting on a deleted record, editing while
saving).

**When to use**: any feature with a lifecycle — created/active/deprecated,
draft/published, linked/unlinked, in-use/idle.

**Worked example** — AC: *"Cannot delete a network currently in use."* States:
`idle → (delete) → removed`; `in-use → (delete) → BLOCKED`. Cases: positive
delete an idle custom network → removed; negative delete an in-use/active
network → refused with a clear message and the network still present.

---

## Pairwise / combinatorial

**What it is**: when full combination testing explodes, generate the smallest
set of cases that covers every *pair* of parameter values — most defects are
triggered by a single value or a pair, so pairwise gets ~the coverage of
exhaustive at a fraction of the cases.

**When to use**: many independent parameters (platform × chain-type × override
× network-state) where the full cross-product is infeasible.

**Worked example** — parameters: platform {extension, mobile} × chain-type
{EVM, Substrate} × user-override {none, name, decimals}. Full cross-product =
2×2×3 = 12; a pairwise set covers every pair in ~6 cases — e.g. (extension, EVM,
none), (extension, Substrate, name), (mobile, EVM, decimals), (mobile,
Substrate, none), (extension, EVM, decimals), (mobile, Substrate, name). Tag the
platform dimension in the canonical table's platform-variant column.

---

## Error-guessing

**What it is**: the experience-driven pass — deliberately try the inputs known
to break software: empty, whitespace-only, paste of 10k chars, emoji, leading
zeros, a script tag, a doubled tap, the back button mid-save. Structured here as
the [`edge-coverage.md`](edge-coverage.md) taxonomy so it is a checklist, not a
mood.

**When to use**: last pass on every AC, after the systematic techniques — it
catches what the model missed.

**Worked example** — AC: *"Enter a network name."* Error-guesses → name =
`<script>alert(1)</script>` (injection → must be sanitized/escaped, see
[`nfr.md`](nfr.md) §Security); name = `"  "` (whitespace-only → reject); name =
`日本語ネット🌐` (encoding/emoji → stored and rendered intact); name = 256× `a`
(boundary → length cap enforced). Each becomes a real `TC-CN.*` row in the
pilot.
