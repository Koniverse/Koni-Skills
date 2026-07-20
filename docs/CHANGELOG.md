# Changelog

All notable changes to **Koni-Skills** are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **RULE-1 / RULE-2 (koni-docs)**: every code-shipping commit bumps `VERSION`
> AND adds an entry here in the same commit, with a real commit SHA — never
> `pending`.

---

## [Unreleased]

(empty — track here while in dev but not yet shipped)

---

## [0.65.1] — 2026-07-20 — retroactive record for the doc-surface pass (`01fae57`) — v0.65.1

**Process correction, filed after the fact.** The doc-surface pass shipped in `01fae57`
with no story and no version, on the reasoning "docs-only, so no story needed". That
reasoning was wrong — the commit fixed four real defects, including a **pre-commit
checklist that no longer ran**. `01fae57` is not rewritten (LESSONS §12); this entry and
[US-3.21](sprints/stories/US-3.21-koni-docs-standard-pass.md) are its record, and
[LESSONS §37](LESSONS.md) states the test that was misapplied.

### Fixed
- **Doc-surface pass to the koni-docs standard** (shipped `01fae57`, recorded here). The
  pre-commit checklist in `docs/README.md` — and the Scripts block in
  `docs/sprints/README.md` — invoked `.mjs` scripts removed in the AD-7 CLI migration, so
  following it verbatim failed with command-not-found. Replaced with `npx koni-docs …` +
  `check-references.py`, with the `sync` omission explained ([CONTEXT D39](CONTEXT.md)).
  `PRD` TS-1 now measures a command that exists and passes (144/144); TS-3 corrected
  9 → **13** rules. `SETUP` troubleshooting updated; `ARCHITECTURE`'s false claim "No more
  `scripts/` inside skills" corrected. `PRD` / `EPIC-3` FR-21 record the v0.63.0–v0.65.0
  refinements. Historical records (CHANGELOG AD-7 table, closed stories, append-only
  CONTEXT, frozen superpowers plans) left exactly as written.
- **Residual gap filed, not dropped** — the sweep still stops at `skills/`, so `docs/`
  remains unguarded: [US-3.20](sprints/stories/US-3.20-extend-reference-sweep-to-docs.md)
  (backlog), which needs a policy for history-bearing paths, not a wider glob.

### Documentation
- **[LESSONS §37](LESSONS.md)** — *"docs-only" describes which files moved, not whether
  the change earns a story.* The test is whether the change fixed defects or altered what
  a reader will do, not whether code moved.

---

## [0.65.0] — 2026-07-20 — mechanize the check-count drift class (the guard that would have caught v0.64.0's defect) — v0.65.0

US-3.18's count drift ("six release-commit-only checks" against a seven-row `gates.conf`)
survived every gate for several versions and was found only by a manual re-grade. That class
is now mechanically impossible to ship
([US-3.19](sprints/stories/US-3.19-mechanize-check-count-drift.md), FR-21).

### Added
- **`skills/koni-docs/scripts/check-references.py`** — `STATED_COUNT` now also counts
  **`N release-commit-only checks`** (and the `release-only` variant) against the **vendored**
  `skills/koni-harness/scripts/gates.conf`, counting rows whose phase field is exactly
  `release-commit`. The word-number set widened (`six|eight|nine|ten`). Composes with the
  guard that already owned count-drift rather than adding a parallel check.
  - Proven to **speak and fail**: a new planted defect class (MIN_CLASSES 37→38) plus a new
    mutant that drops the noun (MIN_MUTANTS 20→21), both killed by the suite; branch-coverage
    gate still green (252 lines). Reproduced and caught the *real* historical defect.
  - **`N built-in checks` is deliberately excluded** — ambiguous ground truth (is the `tests`
    passthrough a built-in check?); §28's answer there is de-numbering, already done. The
    exclusion is argued in-source so it is scope, not a silent hole.
- **`__tests__/fixtures/koni-harness/`** — ground-truth fixture (`scripts/gates.conf` + a
  correct claim), exercising the primary resolution path; `fixtures/bad` exercises the
  sibling-glob fallback.
- **LESSONS §36** — a guard that advertises a class but implements an instance is a false
  green (its stated scope is read as its actual scope).

### Changed
- **`skills/koni-harness/references/gate-catalog.md`** — the `skill-references` entry now
  enumerates the counted nouns, so the doc matches the guard.

---

## [0.64.0] — 2026-07-17 — koni-harness skill-grading pass: verify the design-trio change, fix surfaced drift to ≥95 — v0.64.0

Verified the v0.63.0 design-trio change to koni-harness with koni-qc skill-grading (4
dimensions, re-graded the *whole* skill). Round 1 = **83.9 → FAIL** surfaced real drift the
diff-only review missed; after the fix round, **96.25 → PASS**
([US-3.18](sprints/stories/US-3.18-harness-skill-grading.md), FR-21).

### Fixed
- **`skills/koni-harness/references/gate-catalog.md`** — flagged `skill-references` as
  **monorepo-only / not vendored** (it was documented as a default-shipped check but is not
  in the vendored `scripts/gates.conf`; a consumer install never receives it — per US-3.10).
- **Check-count staleness** (LESSONS §28): de-numbered "eight built-in checks" (SKILL.md);
  corrected "six release-commit-only checks" → **seven** incl. `security-review` in
  gate-catalog + example-loop; added `security-review`/`tests` to the release-phase table.
- **`references/agentic-loop-standard.md`** — the gstack-role enumerations now name
  `/design-consultation` at Frame; added an **objective `/design-consultation` skip test**
  and an **enforcement-boundary** note (the `design-first` gate is a presence-check;
  `/design-review` is the judge of whether desktop **and** mobile truly conform).
- **`references/parallel-orchestration.md`** — Review passes reconciled with the conditional
  `security-review` step.
- **`SKILL.md`** description — bound the UI trigger to "a **story's UI work in the loop**"
  (closes a `frontend-design` triggering over-reach; 1023 bytes, ≤ cap).
- **`references/adapters.md`** — added the missing Contents TOC.

---

## [0.63.0] — 2026-07-17 — koni-harness: UI features always run the design-skill trio (desktop + mobile) — v0.63.0

Made the harness loop always invoke the three popular design skills for any UI feature
([US-3.17](sprints/stories/US-3.17-harness-design-trio.md), FR-21).

### Changed
- **`skills/koni-harness/`** — a UI feature now runs the **design-skill trio**, one per
  stage: gstack **`/design-consultation`** at Frame/Design (establish/confirm the design
  system) → Anthropic **`frontend-design`** at Execute (build it, **desktop AND mobile**) →
  gstack **`/design-review`** at Review (designer's-eye QA on both breakpoints). All to
  `DESIGN.md` **+ the repo's design LESSONS**. Formalised across `SKILL.md` (description +
  owner table + tool-rule), `agentic-loop-standard.md` (the design-first callout + stage
  table), `loop-runner.md`, and `example-loop.md`; the `design-first` citation now records
  the trio. The gate stays a presence-check (unchanged); the implement-only tool invariant
  is preserved (both gstack skills are Frame/Review, `frontend-design` is the implementer).

---

## [0.62.0] — 2026-07-16 — koni-ea-dev: refine the MCP compile section from a deeper read — v0.62.0

Sharpened koni-ea-dev's MCP compile section with facts from reading the server's whole
source ([US-3.16](sprints/stories/US-3.16-koni-ea-dev-mcp-refine.md), FR-41).

### Changed
- **`skills/koni-ea-dev/references/compilation-and-testing.md`** — added the **division of
  labor** (the MCP is a compile + docs *verification* engine with no code-generation tool —
  **this skill authors the EA**, the MCP runs the "auto-fixing loops"); noted that
  `MQL5_EDITOR_PATH` is **optional** (the server auto-detects `metaeditor64.exe`); and that
  `search_mql5_docs` returns the matched page's **text** (truncated), not just a link. Every
  claim author-blind-verified against the upstream `server.py`/README; koni-ea-dev holds ≥95.

---

## [0.61.0] — 2026-07-15 — koni-ea-dev: compile-in-the-loop via an MQL5 MCP server — v0.61.0

Taught koni-ea-dev to close the compile loop — verify an EA compiles rather than only
prescribing it — by wiring an MQL5-compile MCP server
([US-3.15](sprints/stories/US-3.15-koni-ea-dev-mcp-compile.md), FR-41). Re-graded: koni-ea-dev
holds at **98.1/100**.

### Added
- **`skills/koni-ea-dev/references/compilation-and-testing.md`** — a "Compile in the loop (an
  MQL5 MCP server)" section: `compile_mql5(code, filename)` (source string → MetaEditor
  diagnostics) and `search_mql5_docs(search_term)`, framed as an optional accelerator that
  turns "compile clean" into a write→compile→fix loop. Documents the **verified, corrected**
  config — the server is a **Python** package (`uvx`, not `npx`), reads **`MQL5_EDITOR_PATH`**
  (not `METAEDITOR_PATH`), and ignores `MQL5_DIR` — with the honest scope boundary (temp-dir /
  no-`/include` compile resolves stock `<Trade\...>` includes only; library-mode compiles use
  the `/include` contract).
- **LESSONS §35** — a handed-over integration config is an unverified claim; the server's code
  and packaging are the authority (three of the four supplied config keys were wrong, and the
  code won over the README).

---

## [0.60.0] — 2026-07-15 — koni-ea-dev + koni-ea-ops skill-grading pass (clear the ≥95 bar) — v0.60.0

Graded both EA skills against koni-qc's four-dimension skill-grading rubric and hardened them
to clear the ≥95/100 catalog bar — koni-ea-dev **~97**, koni-ea-ops **96.4**
([US-3.14](sprints/stories/US-3.14-koni-ea-skill-grading.md), FR-41 + FR-42). Three grading
rounds; every author-blind Critical/Important resolved.

### Changed
- **`skills/koni-ea-ops/`** — reframed `registry.yaml` as **Notion's git-tracked mirror**
  (Notion is the source of truth post-CONTEXT D9; the old "registry is source of truth" claim
  was backwards); reordered the release lifecycle so **Commit precedes Deploy** (no live run
  on an uncommitted version); cited the *live* LESSONS §4 for the `.set`-is-a-minor-bump rule;
  gave all eight non-negotiables an explicit named failure mode; rewrote the description into a
  `Triggers:` form.
- **`skills/koni-ea-dev/`** — `CalcLotSize` now **skips below `VOLUME_MIN`** instead of
  silently forcing min-lot (was breaking the risk contract); added `NormLotNoMax` for the DCA
  path and a worked new-bar example that commits only after `CopyBuffer` succeeds; `EMAValue`
  returns bool+out-param; corrected a false "VOLUME_MAX clamped at the order call" claim (an
  over-max lot is *rejected*); hardened the CTrade and `ResultRetcode` non-negotiables.

### Added
- **LESSONS §34** — on a uniform-criterion grading axis, harden *every* item to the criterion,
  not the one a grader happened to name (a flat score with a rotating nominated defect is
  grader variance, not a real defect); distinct from the §8 fix-cascade.

---

## [0.59.0] — 2026-07-15 — split koni-ea into koni-ea-dev + koni-ea-ops — v0.59.0

Split the single koni-ea skill into two named skills so the coding standard and the ops
runbook are separate — the clean execution of the v0.58.0 scope narrowing
([US-3.13](sprints/stories/US-3.13-koni-ea-split-dev-ops.md), FR-41 + FR-42, LESSONS §32).

### Changed
- **Renamed `koni-ea` → `koni-ea-dev`** (the MQL5 **programming** methodology; content
  unchanged, `name:` + self-references updated). Past CHANGELOG entries and stories keep the
  `koni-ea` name they shipped under — the rename is recorded forward (LESSONS §12/§33).
- **PRD FR-41** renamed to koni-ea-dev; **AGENTS.md** catalog updated to list both skills.

### Added
- **`koni-ea-ops`** — the EA **operational-lifecycle** skill: `SKILL.md` + five references —
  `versioning.md` (the `v<X.YY>` scheme, minor-vs-major, folder layout, commit=release),
  `registry-and-magic.md` (the `registry.yaml` shape, MagicNumber as Notion source-of-truth,
  instance bindings, the collision audit), `deployment.md` (deploy to a terminal + production
  `.ex5` via the compile service), `backtest-and-release.md` (release backtest mode, metrics,
  the archive, the deprecated release SOP), and `documentation.md` (the per-version doc
  template). Cross-references koni-ea-dev by name, not path.
- **PRD FR-42** (koni-ea-ops) and **LESSONS §33** (renaming a shipped skill: correct forward;
  cross-reference siblings by name, not path).

---

## [0.58.0] — 2026-07-15 — koni-ea refocus: scope to the MQL5 programming methodology — v0.58.0

Narrowed koni-ea (shipped v0.57.0) to focus purely on **programming a correct MQL5 EA**,
per user feedback — the operational lifecycle around a released EA (versioning, registry,
deployment, per-version docs) is a trading-ops SOP, not this skill
([US-3.12](sprints/stories/US-3.12-koni-ea-programming-focus.md), refines FR-41).

### Changed
- **`skills/koni-ea/`** — removed the ops reference `versioning-release-docs.md` (version
  scheme, commit=release, registry/Notion MagicNumber, deploy, per-version doc template);
  added a focused **`compilation-and-testing.md`** (compile clean + warnings-as-errors, the
  error-106 include-path trap, honest "Every Tick Based on Real Ticks" testing); renamed
  `inputs-naming-structure.md` → **`inputs-and-naming.md`** with the file-layout/version
  sections removed; reframed `SKILL.md` to "programming a correct MQL5 EA" and stated the
  ops lifecycle is out of scope. The MagicNumber-uniqueness rule is kept as a **correctness**
  rule (MT5 enforces no uniqueness), not a registry-assignment rule.
- **PRD FR-41** description and **AGENTS.md** catalog row updated to the programming scope.

### Added
- **LESSONS §32** — scope a skill to the single question it answers; a coding standard and
  an ops runbook in one file serve neither (the tell: the `description` needs "and" to list
  two jobs).

---

## [0.57.0] — 2026-07-15 — koni-ea: the MQL5 Expert Advisor authoring standard skill — v0.57.0

A new catalog skill, **koni-ea**, capturing how to write a Koniverse MQL5 Expert Advisor for
MetaTrader 5 to a standard — the methodology equivalent for EAs of what koni-qc is for test
docs ([US-3.11](sprints/stories/US-3.11-koni-ea-mql5-standard.md), FR-41). Synthesized from
two production corpora (the `Trading-Resources` strategy-EA archive and the `Senti-Quant`
`terminal_manager` MQL5 library) and hardened by an author-blind technical review against
both.

### Added
- **`skills/koni-ea/`** — `SKILL.md` + seven references:
  - `ea-lifecycle.md` — `#property` header, OnInit/OnTick/OnDeinit/OnTradeTransaction/OnTimer, the standard order-of-operations, the canonical skeleton.
  - `inputs-naming-structure.md` — `Inp` inputs, `input group`, enums, naming, the `v<X.YY>` file/folder layout, the English-code rule.
  - `trading-mechanics.md` — CTrade, closed-bar signals, indicator handles + `CopyBuffer` + `ArraySetAsSeries`, fixed & risk-% sizing, SL/TP with `SYMBOL_TRADE_STOPS_LEVEL`, position-by-magic, DCA/grid/breakout patterns.
  - `risk-management.md` — position cap, latched equity breaker, daily loss, spread/gap/session filters, cooldown, the fail-permissive **margin pre-check**, slippage & filling mode.
  - `mql5-pitfalls.md` — the production-only traps (repaint, backtest mode, pending-fill margin, handle leak, `ArraySetAsSeries`, stop level, normalization, filling mode, self-recovery, magic collision).
  - `versioning-release-docs.md` — the `v<X.YY>` scheme, commit = release, registry & MagicNumber (Notion source of truth), compile & Strategy-Tester, deploy, the per-version doc template.
  - `shared-library.md` — header-only `.mqh`, `KONI_*_MQH` include guards, init-vs-constructor DI, stack-global lifetime, Logger/JSON idioms, the compile service.
- **PRD FR-41** — ship koni-ea (EPIC-3, catalog expansion).
- **LESSONS §31** — a standard synthesized from a corpus must verify each convention's effect, not inherit its frequency (the `#property strict` cargo-cult, a guessed registry shape, a wrong-way margin-check — all caught by author-blind review, none visible to the reference checker).

---

## [0.56.0] — 2026-07-15 — koni-setup docs sync: surface koni-qc security-review + the vendored security-review gate — v0.56.0

koni-qc gained a security-review method (US-5.11) and koni-harness's `install-gate.sh` now
vendors a `security-review` gate (US-3.9), but koni-setup — the skill that onboards a repo to
the standard — still described neither. A documentation sync so koni-setup's picture of the
trio matches what the trio does ([US-3.10](sprints/stories/US-3.10-koni-setup-security-review-sync.md),
FR-20). No scope change; no new scaffolding.

### Changed
- **`skills/koni-setup/references/skill-inventory.md`** — the koni-qc bullet now lists the
  **security review** (threat-model a surface; derive injection / IDOR / SSRF / XSS /
  auth-bypass / RLS test cases). The koni-harness bullet now states the vendored default
  `gates.conf` carries an opt-in `security-review` warn check — a no-op until the repo
  declares boundaries in `.koni-harness/security-paths` — and calls out that the
  monorepo-only `skill-references` check is **not** vendored into a scaffolded product repo.
- **`skills/koni-setup/references/onboarding-audit.md`** — an optional audit item points a
  repo with trust boundaries at `.koni-harness/security-paths` to activate the gate, framed
  as opt-in (absence is not a scaffolding gap) and never-blocking.

### Added
- **LESSONS §30** — what a scaffolded repo inherits is defined by the *vendored* config the
  installer copies, not the source repo's live one; asserting a consumer inherits a
  source-only gate is an over-claim a resolving reference check cannot catch (§29).

---

## [0.55.0] — 2026-07-13 — koni-harness: use the new koni-qc security-review — a Review trigger + a warn gate — v0.55.0

koni-qc gained a security-review method in v0.53.0–0.54.0, but the harness loop had no way
to *use* it, and koni-qc's own composes-table named a harness gate as "proposed, not yet
built". This closes both ([US-3.9](sprints/stories/US-3.9-harness-security-review-gate.md),
FR-40).

### Added
- **`security-review` gate** (`release-commit`, **warn**, opt-in). A staged change matching
  a repo-declared boundary glob (`.koni-harness/security-paths`, one per line) that ships
  without the koni-qc security review gets a WARN pointing at
  `skills/koni-qc/references/security-review.md`. Suppress a reviewed path via
  `.koni-harness/security-review-ack`. With no `security-paths` file it is a documented
  no-op — precise and opt-in, because a noisy security reminder gets muted (the exact
  failure koni-qc's method warns against), so the boundary is *declared*, never guessed.
  **Warn, not block**: whether a change needs a review is a judgment; a false trigger must
  never wedge a commit.
- **A plant→assert test** for the check (`checks/__tests__/test-security-review.sh`) — five
  behaviours (silent no-op, warns on a declared boundary, ack-suppressed, precise on a
  non-boundary path, `**`-glob nesting), proven to *fail* against three mutations (guard
  removed, never-warns, wrong reference path). A guard's green means nothing until you have
  made it both speak and fail (LESSONS §20, §24).
- **Review-stage wiring**: the loop's Review stage (`agentic-loop-standard.md`) and the
  SKILL.md Review/QA row now name koni-qc security-review, triggered when a change crosses a
  security trust boundary (auth, authz/multi-tenancy, money movement, untrusted input,
  secrets/crypto, file upload, deserialization, a new outbound call).

### Fixed
- **`gate-catalog.md` said "eight built-in checks"** — there are now ten, and two
  (`skill-references`, `security-review`) were undocumented. De-numbered the heading so the
  count cannot drift (LESSONS §28) and documented both.
- **koni-qc `security-review.md` cited the harness gate as "proposed, not yet built"** — it
  now exists (warn-level, opt-in), so the composes table reflects reality. The two skills
  are consistent: koni-qc names the method, koni-harness holds the gate.

All six skills: **0 dangling references**; the shared guard suite (37 classes · 20 mutants ·
full branch coverage) stays green.


---

## [0.54.0] — 2026-07-13 — koni-qc: security-review hardened after an author-blind review — v0.54.0

A review-and-improve round on the v0.53.0 security capability ([US-5.11](sprints/stories/US-5.11-security-review-capability.md),
FR-39). An author-blind content review scored it 21/25 and a blind-router triggering
pass 22/25; both surfaced concrete, fixable defects. Rounds extend the anchor story
(LESSONS §13).

### Fixed
- **The confidence rule contradicted itself** — three passages disagreed on the same
  cut (a HIGH-severity confidence-7 finding was both *dropped* and *reported*), and one
  used a 0–1 scale while the rest used 1–10. Now a single deterministic rule on one
  scale: **report at ≥8, raise a confidence-7 finding as an open question, drop below 7**
  — severity never moves the cut (confidence = "is the attack real?", severity = "how
  bad if it is", filtered independently).
- **The "composes" table cited a koni-harness security-review gate that does not exist.**
  `credential-scan` is real; the "security-review-required on high-risk change" gate is
  **proposed, not yet built** — now marked as such, not asserted as present. (The same
  gate US-5.11 explicitly deferred; the table wrongly read it as shipped.)
- **The description read as if koni-qc *runs* the exploit** — the derive-vs-run boundary
  lived in the body, so a blind router pulled koni-qc for "run the SQL-injection attack
  against staging" (gstack's job). The frontmatter now states it: koni-qc derives + reviews;
  running the exploit is gstack, remediation is not QC.
- **A portability leak**: the RLS section cited "FR-93" — a Koni-Finance-Final requirement
  absent from this repo's PRD and meaningless in a skill that ships elsewhere. Restated as
  the principle (multi-tenant isolation is the highest-blast-radius defect), not an FR.

### Added
- **Two categories the taxonomy lacked, both against its own "money movement" emphasis**:
  write-side **mass assignment / over-posting** (POST `role=admin` → privilege escalation;
  EXPO had covered only the read direction) and **race / TOCTOU** (concurrent double-spend,
  idempotency-key replay).
- **JWT algorithm confusion** (`alg:none`, RS256→HS256 key confusion) under Authentication.
- **Four boundary-triggered categories**: business-logic authz (negative quantity / price
  tampering), CORS misconfiguration, open redirect (distinct from SSRF), inbound webhook
  signature verification — plus an explicit **out-of-scope** note (GraphQL-specific,
  prototype pollution, cache poisoning, dependency/CVE scanning) so a clean review never
  *implies* coverage it did not do.
- Tightened the React/Angular XSS carve-out — `{value}` is safe in text/attribute position
  but **not** in `href`/`src` (`javascript:` URI) — and required the mid-tier refute to run
  in a **fresh context** (a self-refute is the motivated-reasoning trap the phase exists to break).

All six skills: **0 dangling references**; the shared guard suite (37 classes · 20 mutants
· full branch coverage) stays green.


---

## [0.53.0] — 2026-07-13 — koni-qc: a detailed, adversarial security-review capability — v0.53.0

Ships **FR-39** ([US-5.11](sprints/stories/US-5.11-security-review-capability.md),
[CONTEXT D38](CONTEXT.md)). Brings the rigor of Anthropic's `/security-review` into
koni-qc's coverage-intelligence idiom.

koni-qc could name the security categories a suite should cover — an 8-item checklist —
but not derive the cases, run a rigorous review, or write a finding a ship decision could
rest on. A checklist is not a method.

### Added
- **`skills/koni-qc/references/security-review.md`** — the security method:
  - **Threat-model-first**: enumerate the trust boundaries an attacker can reach; every
    test case and finding names the boundary it crosses.
  - **A per-category derivation taxonomy** — authn, authz/IDOR, RLS/tenant-isolation,
    injection (SQL/NoSQL/command/path/template/XXE), XSS (stored/reflected/DOM),
    deserialization/RCE, SSRF, secrets/crypto, session/CSRF, data-exposure/PII — each with
    the boundary it lives on, the concrete attacker inputs, the required-when trigger, and
    the highest-signal check.
  - **The adversarial review** — identify → **refute** (independent agents must disprove
    exploitability before a finding is reported) → confidence-filter (drop < 8/10). The
    same shape as koni-qc's `skill-grading.md` and `/security-review`'s three-step fan-out.
  - **A decision-grade finding schema** — file:line, severity, confidence, category, and a
    concrete **exploit scenario** ("a finding without an exploit path is noise").
  - **A false-positive discipline as a first-class rule** — the hard exclusions, the
    precedents, and the signal-quality bar, because a security suite that cries wolf gets
    muted, and a muted suite misses the real one.
  - Escaped-vuln → red-first REG test + class-generalization sweep; the release security
    sign-off.
- koni-qc SKILL.md: a **Security-review** mode, an ownership row, activation + reference
  rows, and security triggers in the `description` (threat model, injection, IDOR, SSRF,
  XSS, auth bypass, RLS, "is this safe to ship").

### Changed
- `nfr.md` §Security is now the **shortlist + trigger**, pointing to `security-review.md`
  for the method — single-source, no duplicated depth (LESSONS §21).

### Composition
- The method owns the coverage intelligence and the finding rubric; it **delegates every
  engine** — the running exploit to gstack, the live 2-credential RLS harness to
  `live-harness.md`, the blocking gate to koni-harness, the report body to koni-docs. No
  scanner, no SAST tool, no new gate in this story.

All six skills: **0 dangling references** (the shared `check-references.py` gate caught a
dead §-pointer in the first draft; fixed).


---

## [0.52.0] — 2026-07-13 — koni-docs: a machine enumerates the claim surface — v0.52.0

Round 10: **D4 23/25** (22.5 + 23.5 — a new high). **D3 5/25** — a collapse, and correct.
Extends [US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Added
- **`scripts/__tests__/test-coverage.py` — a branch-coverage gate.** Three rounds running, a
  reviewer planted narrowings and most survived both suites; the hole rate never moved
  (**63% → 58% → 71%**). The diagnosis: *"the corpus was widened to cover my report, not the
  checker's claim surface."* My standing rule only guarded **future** branches — nobody had
  enumerated the existing ones — and the mutation test could not save me, because the same
  memory wrote the fixtures and the mutants.

  So: a line of `check-references.py` that never executes while the checker runs over the
  fixtures is a line no fixture pins. The gate ran in seconds and named **50 unpinned
  lines** — more than three rounds of adversarial human review had found. Driven to **zero**.
  Every exemption carries a written reason; an unexplained exclusion is how a coverage gate
  becomes decoration. See [LESSONS §28](LESSONS.md).

### Fixed
- **The retired-form check was a no-op on real prose.** Its "explanatory mention" escape
  hatch scanned a ±160-char window for words including `not ` and `→` — **ordinary
  English** — so it exempted **15 of the 17** real §-pointers in this skill. A reviewer
  reinstalled the original defect in the original file and the gate reported 0. The hatch is
  now the only one that is not a loophole: **a quoted mention**. The regex also matches the
  label however it is dressed — `PRD.md §8`, `docs/PRD §8`, `**PRD** §8`, `[PRD](…) §8` —
  each of which broke adjacency and was structurally invisible.
- **The script check could not see a path-qualified script.** `agile-sync-up.mjs`, the ghost
  it was written for, would survive today if anyone had written its path.
- **A second piece of dead code, named by the coverage gate**: the `Next.js` guard could
  never fire, because the script regex matches only `.mjs`/`.py`/`.sh`. Deleted, not
  exempted — an exemption is a confession, not a solution.
- **"the 12 rules" had drifted into five files across two sibling skills** (koni-setup,
  koni-harness). There are 13. Nothing checked it; the new `stated count` check now does,
  and an eval run found it independently on the same day.

### Changed
- **The evals were run.** Two of six, both PASS — and both exceeded their criteria. Eval 2
  (resist a `due` that is really the sprint end) refused, named the signal cost in the rule's
  own terms, and proved the change would not even have worked. Eval 6 (RULE-7 append-only)
  appended a revision rather than editing, and found the drifted rule count nobody was
  looking for. Results recorded — including a false claim one agent made, because an eval
  that records only successes is a brochure.

**37 defect classes · 20 mutants · full branch coverage · six skills, 0 dangling references.**

koni-docs CLI **0.11.9 → 0.11.10**.

---

## [0.51.0] — 2026-07-13 — koni-docs: derive the corpus from the claim surface — v0.51.0

Round 9 D3: **20/25** (from 18). Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **The corpus covered the last bug report, not the checker's claim surface.** 27 classes
  and 12 mutants felt complete; a reviewer planted 18 fresh narrowings and **seven
  survived**, each deleting a behaviour the checker documents **in its own source** — H1
  anchors, explicit `id=` attributes, numeric §-pointer precision (`§3` must never match
  `## 30.`), same-directory links, non-greedy comment spans, a §-pointer to a file that
  exists nowhere. The hole rate had not moved across rounds (63% → 58%): I had been adding
  fixtures for whatever the last reviewer found and calling it coverage.

  The corpus is now derived from the branches — every `problems.append` and every
  behaviour asserted in a comment gets a fixture, and **a new branch requires a new entry
  in the same commit**. **36 defect classes, 19 mutants, all killed.** See
  [LESSONS §27](LESSONS.md).
- **An equivalent mutant exposed dead code.** A mutation deleting the slugger's backtick
  strip survived — not because a fixture was missing, but because the line did nothing:
  the punctuation regex already removed backticks. A surviving mutant is usually a hole in
  the tests; sometimes it is a lie in the code.
- **`PRD §8` — the numbered form the label-only convention retired — survived in three
  files**, including `templates/story.md`, which is **copied verbatim into every generated
  story in every consumer repo**. The rule was updated (US-4.29); the template was updated;
  the siblings never were. The checker could not see the class at all, because
  `SECTION_POINTER` required a `.md` token and bare `PRD §8` has none. It now checks for
  the retired form directly — and tolerates a doc that *names* it while explaining that it
  is retired.

All six skills: **0 dangling references.**

koni-docs CLI **0.11.8 → 0.11.9**.

---

## [0.50.0] — 2026-07-13 — koni-docs: behavioural evals — verify the output, not the apparatus — v0.50.0

Round 9: **D1 25/25 · D2 25/25 · D4 22/25** (22.5 + 21.5 — a new high). Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Added
- **`evals/` — five behavioural scenarios.** Two independent graders named the same
  absence: *"655 lines test the linter; zero lines test whether an agent handed this skill
  actually produces a conformant story file, appends a CONTEXT entry instead of editing
  one, or resists setting `due:` for 'must land this sprint'."* The three tiers of rigor
  verified **a tool the skill ships**; the skill's actual product is **behaviour in
  another agent**, and that had no test at all.

  Each scenario is a realistic request **with the pressure that makes the rule hard** —
  a delivery manager who wants the empty Deadlines board "fixed", a CEO pushing a date
  before a flight, a tech lead who says to just `--amend` the SHA in. Pass criteria are
  observable facts about the artifact ("zero `+due:` lines in the diff"), never
  impressions. Two hard rules: never tell the agent what is being measured, and a partial
  pass is a fail — these test BLOCKERs, and a BLOCKER that holds four times in five ships
  the fifth. See [LESSONS §26](LESSONS.md).

### Fixed
- **SKILL.md's own sentence about the guard said "11 broken checkers". There are 12.** The
  one sentence whose job is to vouch for the guard's trustworthiness carried a stale
  integer — and `bmad-template-analysis.md`, the file *just rewritten to purge staleness*,
  still said "the 12 enforced rules" (there are 13). Third drift of the same class. The
  durable fix is not to correct the numbers but to **stop writing them in prose**: the
  scripts assert their own floors, and the docs now say so instead of restating a count
  they cannot keep in sync.
- `templates.md`'s file table was a third statement of a map SKILL.md §5 and §6 already
  carry. 59 → 46 lines; it now holds only what those two cannot: the conventions every
  template follows.
- The pre-commit checklist had grown four lines explaining the checker's self-validation
  architecture. That belongs in the script's docstring; the checklist gets one line.
- An unowned "filed as followup for a future story" in `sprint-system.md` — the same class
  of fossil removed from `bmad-template-analysis.md` last round (LESSONS §25).

koni-docs CLI **0.11.7 → 0.11.8**.

---

## [0.49.0] — 2026-07-13 — koni-docs: a closed to-do list is not a reference — v0.49.0

Continuing to the ≥95 bar. Extends [US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **`bmad-template-analysis.md` shipped an 85-line to-do list of work that was already
  done.** "Add a `§7` index to the PRD", "add Given/When/Then to the story template",
  "add FR Coverage to the epic" — all of it landed months ago, in section numbers a later
  migration retired, citing an `examples/` directory that does not exist. A work artifact
  frozen at the moment its work was authorized, wearing the costume of documentation.
  Replaced by its outcome: what koni-docs adopted, what it kept, and the one thing it
  deliberately does differently. 268 → 218 lines. See [LESSONS §25](LESSONS.md).
- **Explicit HTML anchors** (`<a name="x">`, `id="x"`) emit real GitHub anchors and the
  checker collected none — so a live link read as dead. A false positive trains people to
  ignore the gate, which ends exactly where silence ends.
- **The repo root was found by counting directory levels** (`root.parent.parent`), which
  silently moved the script-search root when the checker was invoked on a path of a
  different shape. It now locates `.git` — bounded, so a sandbox copy falls back to the
  scan root instead of walking to `/` and rglob-ing the filesystem.
- RULE-18's obligations and rationale were restated in full in `sprint-system.md`.
  `rules.md` is the rule's home; sprint-system keeps only the model it rests on
  (cadence vs commitment) and the derived-state table it uniquely owns.

**27 planted defect classes, all caught. 12 mutant checkers, all killed.** Six skills, 0
dangling references.

koni-docs CLI **0.11.6 → 0.11.7**.

---

## [0.48.0] — 2026-07-13 — koni-docs: a mutation suite is a lock, not a net — v0.48.0

Round 8: **D1 25/25 · D2 25/25 · D3 18/25 · D4 20.5/25.** D1 and D2 are maxed and stable.
D3 rose 14 → 18. D4 slipped 1.5 for one reason, and it was right to. Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **The mutation suite proved six mutants die and printed "all mutants killed".** A
  reviewer planted eight; **five survived both suites** — including one that deleted,
  verbatim, the `#fragment` check shipped the round before. Nothing in the corpus planted
  a dead *fragment*, only dead *paths*, so the fix was unverified by the very suite that
  existed to verify it. A mutation test measures the **corpus**, not the code: a
  surviving mutant is a named hole in your test data. Fixtures now pin every claimed
  behaviour — **27 defect classes, 11 mutants, all killed.**
- **The guard was writing to the thing it guards.** `test-mutations.py` wrote each mutant
  into the live, git-tracked `check-references.py` and restored it in a `finally` — inside
  a *blocking pre-commit hook*. One Ctrl-C and the working tree keeps a deliberately
  blinded checker that still prints `0`. (`import tempfile` sat at the top of that file,
  unused: the safe design had been considered and dropped.) It now mutates a **sandbox
  copy** and never touches the tree.
- **The tower had no bottom turtle.** Emptying `MUST_CATCH` printed *"✓ 0 planted defect
  classes all caught"*, rc=0, gate green, checker fully blind. `MIN_CLASSES` /
  `MIN_MUTANTS` floors close it — a corpus that shrinks is a corpus that lies.
- **Two more false greens, both live**: the checker resolved references **into its own
  fake fixtures** (a real doc citing `ok.md` §Alive was quietly satisfied by a test file),
  and `Path.exists()` on macOS is **case-blind**, so `](References/ok.md)` passed locally
  and 404s on GitHub and every Linux CI checkout. A checker whose thesis is "a link that
  looks fine to its author is dead in production" cannot itself depend on the author's
  filesystem.
- Setext detection read a YAML frontmatter `---` as a heading underline, inventing
  anchors; `cli.md` pinned versions in a live table while SKILL.md refuses to pin any;
  `sprint-system.md` carried roadmap rot; `bmad-template-analysis.md` cited an
  `examples/` directory that does not exist.

### Changed
- SKILL.md §3c now names **all three** scripts. The checker's `0` is evidence only
  because two others prove it can still speak. See [LESSONS §24](LESSONS.md).

All six skills: **0 dangling references** — including two in `koni-agent-monitoring` that
only the case-sensitive resolver could see.

koni-docs CLI **0.11.5 → 0.11.6**.

---

## [0.47.0] — 2026-07-13 — koni-docs: the test suite that formalized the blind spot — v0.47.0

Round 7: **D4 22/25** (both graders — the highest yet). **D3 14/25**, and its Critical is
the one that matters. Extends [US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **My own test suite was a fifteenth way to print `0` — and a reviewer proved it.** All
  three §-pointer syntaxes (backticked / linked / bare) asserted on the same substring,
  so *any one surviving satisfied all three*. The reviewer regressed `SECTION_POINTER`
  to backticks-only — blinding the checker to two of three forms, in the exact class it
  was written for — and **the suite passed**. LESSONS §22's fix ("ship the planted
  defects") did not close the hole; it formalized it. Every needle now asserts on the
  **classified report line** (`dead §-pointer -> ok.md §GhostLinked`), unique per planted
  line.
- **The fifth false green, self-inflicted.** To stop `Next.js` being flagged as a missing
  script, I exempted every capitalized stem — which blinded the checker to `SKILL.md`,
  `README.md`, and therefore to `[SKILL.md §5](../SKILL.md)`: **the very pointer that had
  just replaced a deleted mirror.** A fix that opened a bigger hole than it closed. The
  exemption is now scoped to the script pass alone.
- **RULE-16's new blocker was enforced on 1 of 57 stories.** I nested it inside the
  `created >= 2026-07-04` gate that exists for an unrelated rule. Versioning has no
  adoption date — and the `vv0.7.0` corruption it cites (LESSONS §4) happened in a story
  that predates the gate, so the blocker **would not have caught the very bug its own
  comment names**. Dedented; verified against a 2026-05-27 story.
- **The gate could be disarmed by deleting a file.** A missing checker or self-test made
  it print "skipping" and return 0. Their absence is now a hard failure — a guard you can
  quietly remove is not a guard.
- Linked §-pointers resolved the backticked *label* instead of the link *href*; setext
  headings (`Title\n====`) were invisible, so live anchors read as dead; GitHub keeps the
  gap a stripped leading emoji leaves (`## 🚀 Deploy` → `#-deploy`) and the slugger did
  not; `#fragments` inside HTML `href`s and reference-style definitions were split off
  and never validated.

### Added
- **`scripts/__tests__/test-mutations.py` — a test for the tests.** It deliberately
  narrows the checker one rule at a time (fences to backticks-only, script names to
  backticked-only, the §-pointer regex to one of three forms) and asserts the suite
  **kills** each mutant. All 6 mutants die. The gate now runs it: a surviving mutant
  blocks the commit, because a suite a broken checker can pass is not a suite.
  See [LESSONS §23](LESSONS.md).

20 planted defect classes, all caught. 6 mutant checkers, all killed. All six skills:
**0 dangling references.**

koni-docs CLI **0.11.4 → 0.11.5**.

---

## [0.46.0] — 2026-07-13 — koni-docs: D4 hits 22/25 — the same defect, in the third file nobody re-read — v0.46.0

D4 run A: **22/25** — the highest yet, with the verdict *"the skill is now genuinely
good by Anthropic's standards"*. Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **The rule count was corrected in two files and missed in the third.**
  `plugin-pattern.md` still said "the core 12" and "`RULE-1` … `RULE-17`" — the same
  stale-count defect the previous round fixed in `rules.md` and `SKILL.md`. LESSONS
  §18 for the third time: **a fix lands where you look, not where the fact lives.**
  Swept across every skill this time rather than patched file by file.
- **Prose mangled by my own find/replace.** Purging the nonexistent
  `koni-docs-plugins:` key left ungrammatical fragments behind — including, in
  `bmad-template-analysis.md`, a sentence saying the file "already covers the
  migration procedure … to complement that file", i.e. complementing itself. **A regex
  sweep changes text, not meaning; the meaning has to be re-read.**
- **The tombstones were rewritten when the graders asked for them to be deleted.**
  `templates.md`'s epitaphs for its removed cheatsheet were 19% of the file — a memo to
  a future editor, sitting in the file agents load to ask "what templates exist?". A
  pointer needs no epitaph. `templates.md`: 69 → 59 lines.
- `rules.md` pinned live guidance to this repo's history ("since v0.37.0").

All six skills in the repo: **0 dangling references.** The `skill-references` gate
caught the one dead anchor this round introduced (a TOC entry for a renamed heading)
before it could ship — which is the entire point of it.

---

## [0.45.0] — 2026-07-13 — koni-docs: round 6 — D1 and D2 hit 25/25; the guard finally ships its own tests — v0.45.0

Re-grade after v0.44.0: **D1 25/25** (blind router 18/18 — precision and recall both
1.00) and **D2 25/25** (all six rule families held under multi-pressure scenarios,
including all three RULE-18 obligations). D3 15/25 with two Criticals, both about the
guard. Extends [US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **The checker's FOURTH consecutive false green.** Each round I widened it, ran it on
  a clean corpus, read `0`, and called it fixed; each round an author-blind reviewer
  planted a syntax I had not imagined. It could not see: reference-style definitions
  (`[x]: gone.md`), title-attribute links (`](x.md "T")`), angle-bracket destinations,
  HTML `<a href>` / `<img src>`, `~~~` fences (whose `##` lines became **phantom
  anchors**), bare script names, or a §-pointer whose path was fiction (it "rescued"
  wrong paths by basename).
- **A silent trapdoor**: a fence closed by an *indented* marker never closed, so
  everything to EOF counted as fenced — **every check for the rest of that file was
  skipped, with no warning.** Latent, file-scoped, triggered by ordinary markdown, and
  the single most likely source of the next false green.
- **koni-qc had been red for four rounds and nobody was told**, because the gate swept
  only the skills a commit *touched*. All 10 of its dangling references are now fixed,
  and the gate sweeps **every** skill whenever any skill is touched.
- **RULE-16 was a BLOCKER with no blocker.** `story-lint` asserted `version_shipped` was
  *present*, never that it was bare — so `v0.7.0` would have shipped and surfaced as
  `vv0.7.0` in the synced Stories table. That is LESSONS §4, in the repo that wrote it.
- **The specs that would have regenerated the `koni-docs-plugins` bug.** EPIC-3 is the
  *unbuilt* plugin epic; it will be implemented from that text. PRD, EPIC-1, EPIC-3
  de-ghosted. (CONTEXT / CHANGELOG / LESSONS are append-only history — correctly left.)

### Added
- **`scripts/__tests__/` — the guard's own planted-defect suite.** One defect per class
  it claims to catch (15 of them), plus a clean control that must stay quiet. The tests
  were written **first** and failed 10 of 15 against the then-current checker, naming
  the same misses the reviewer found by hand.
- **The gate runs the self-test before trusting the checker.** Sabotage the checker and
  the gate refuses its green rather than believing it — verified by actually
  sabotaging it. A validator's silence is evidence only once you have proven it can
  speak (LESSONS §22).

### Changed
- The script check's scope is now **stated**: it covers runnable tooling a skill tells
  you to execute (`.sh` / `.py` / `.mjs`), not every source file a doc may cite. `.ts` /
  `.js` were briefly in scope and produced false positives on legitimate cross-repo
  references. A guard that cries wolf gets ignored — which ends where silence ends.

**All six skills in the repo: 0 dangling references.**

koni-docs CLI **0.11.3 → 0.11.4**.

---

## [0.44.0] — 2026-07-13 — koni-docs: round 5 of skill-grading — the skill taught a config key that does not exist — v0.44.0

Re-grade after v0.43.0: D4 rose to **21.25** (20.5 + 22, the highest yet; one grader
called the skill "in good shape by Anthropic's standards"). Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **SKILL.md taught a CLAUDE.md key that does not exist.** It said a project
  declares `koni-docs-plugins: [supabase, nextjs]`. The real key is `plugins:`
  nested under `koni-docs:`. It was wrong in four places in the always-loaded file,
  wrong again across `plugin-pattern.md` and `koni-nextjs`, and the plugin reference
  had to paper over the gap ("this is the `koni-docs-plugins` declaration"). The
  CHANGELOG had recorded the correct key years earlier. A name repeated confidently
  in prose is not a verified name. See [LESSONS §21](LESSONS.md).
- **The frontmatter cheatsheet — 107 of `templates.md`'s 169 lines — was a second
  contract, and it was the wrong one.** Billed as the shortcut "for agents that just
  need the shape without loading the full template", it had drifted from
  `frontmatter-spec.md` and taught **two things RULE-17 forbids** (`AD-N` in
  `prd_ref`; the banned `FR-X.1 .. FR-X.N` range). The copy designed to be obeyed in
  a hurry was the copy nobody audited. Replaced by a pointer. `templates.md`:
  169 → 69 lines.
- **A dead `SKILL.md §3a-bis` pointer — inside the story template's skeleton**, so it
  was being copied into every story generated in every consumer repo. The checker
  could not see it: it required the filename in backticks, and skipped fenced
  content by design. Both holes closed; the checker now also knows which docs live
  in the *consumer's* repo (`DESIGN.md`, `LESSONS.md`, …) and are not the skill's to
  resolve.
- `rules.md` still said "These 12 rules" — stale in the very commit that added
  RULE-18. Now 13, with a note that RULE-3/4/8/9/12 were retired and their numbers
  are not reused.
- Version annotations decorating the *live* library surface in `cli.md`; a
  `CONTEXT D37` link that only resolves inside this repo; RULE-15's full `gh api`
  procedure sitting in a routing-table cell.

### Changed
- The three "tombstone" paragraphs left by earlier de-duplications now state the
  rule ("Single source: X") instead of narrating the autopsy. `cli.md` no longer
  claims "no other file keeps a second copy" — SKILL.md §7 does keep a menu, and the
  honest framing is "when they disagree, §4 wins".

koni-docs CLI **0.11.2 → 0.11.3**.

---

## [0.43.0] — 2026-07-13 — koni-docs: round 4 of skill-grading — a guard you wrote yourself is a hypothesis — v0.43.0

Re-grade after v0.42.0: **79/100** (D1 22 · D2 23 · D3 14 · D4 20). D1 and D2 both
*fell* from 25 — which is the whole reason the rubric forbids inferring "still ≥95"
from a review of the fix alone. Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **The checker I shipped last round reported a false green.** It could see
  `` `file.md` §Section `` but not the *linked* form
  `` [`file.md`](file.md) §Section `` — which this skill uses **nine times**, one of
  them genuinely dead, on the See line of a BLOCKER rule. It also only matched
  `.md` targets (so a dead `](scripts/ghost.py)` passed), ignored H1 headings, and
  changed its verdict depending on the directory it was invoked from. Same defect
  class as LESSONS §19, one layer up. Now hardened and — the part that matters —
  **proven against planted defects** rather than trusted because it printed 0.
- **The three `due` obligations were correct, well-argued, and ungreppable.** They
  lived as prose in a reference file, so `grep RULE-` found nothing, and the only
  surface an agent reads at commit time phrased the CONTEXT-entry obligation as
  *"no story overdue-and-silent"* — conditioned on the story being **already
  late**, so a proactive date push read straight past it. They are now **RULE-18**,
  numbered, unconditional, with grep checks and a machine backstop.
- `agile-sync-tests.mjs` — a second ghost script, same family as the one purged
  last round.
- **RULE-2 had no way out for someone who had already amended.** The grep says
  `UNREACHABLE` and stopped there. It now says what to do next (find the real
  commit, re-record it in a follow-up — and do *not* amend again).
- Templates emitted dead links into every document generated from them:
  `epic.md` used the legacy numbered PRD anchor that this skill's own label-only
  convention forbids; `test-report.md`'s release skeleton was missing the
  `sprints/` hop, so every generated release report linked to
  `docs/tests/stories/…`, which never exists.
- Five dead §-pointers the strengthened checker surfaced, including RULE-1's
  (`§CHANGELOG safe insertion` — the real heading transposes the words).

### Added
- **`skill-references` gate check** (`work-commit` + `release-commit`, blocking).
  The checker is no longer something a reader has to know about: it runs on every
  commit that touches a skill. It also now appears in SKILL.md §3c and §6 — last
  round it was shipped but mentioned in no markdown file at all, so a Claude
  loading the skill would never have run it.

### Changed
- **SKILL.md: 325 → 268 lines.** §4 inlined the whole of `integration.md` (both
  CLAUDE.md blocks, the Pattern A/B table, the T1-T7 triggers) and §6 re-routed the
  same 15 templates §5 already routes. Both are pointers now.
- Deleted the last two self-declared mirrors: `templates.md`'s "Activation table
  (mirrors SKILL.md §5)" (a 16-row copy of a 29-row table — it had already
  drifted) and `cli.md` §6's third intent→command map.
- `cli.md`'s subcommand inventory no longer carries a `Since` column or inline
  version history — it is a live reference, not a changelog.
- `description`: added "release notes" and "ADR" (both common phrasings with no
  trigger vocabulary), and sharpened the koni-setup boundary — it claimed `SETUP`
  as an artifact while disclaiming "repo bootstrap" in the same breath.

koni-docs CLI **0.11.1 → 0.11.2**.

---

## [0.42.0] — 2026-07-13 — koni-docs: round 3 of skill-grading — I validated with the same wrong function that generated — v0.42.0

Re-grade after v0.41.0: **80.25/100** (D1 **25** · D2 **25** · D3 11 · D4 19.25).
D1 and D2 are now perfect — the blind router routed 18/18, and all 9 hard rules
held under adversarial pressure, including the three `due` rules and the rewritten
RULE-2. D3 and D4 still block the ≥95 bar. Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **The TOCs shipped in v0.41.0 had ~150 dead anchors, and my own audit certified
  them green.** The generator scraped `## ` lines from *inside* ` ```markdown `
  fences — template skeletons, which emit no anchor on GitHub — and the audit
  computed "valid" targets with the same broken function. A checker that shares
  its bug with the thing it checks always passes. It also used the wrong slug
  algorithm (GitHub hyphenates *each* space; I collapsed runs, so every em-dash
  heading silently missed). Regenerated fence-aware: **0 dead anchors**.
- **The same generator wrote a TOC into SKILL.md's YAML frontmatter**, between
  `---` and `name:` — destroying it. The skill lost its `description` entirely,
  which means it would no longer have triggered for anything. See
  [LESSONS §19](LESSONS.md).
- **`agile-sync-up.mjs` — a script that does not exist anywhere in the repo — was
  named as the enforcement mechanism in five places**, including as the *why* of
  BLOCKER RULE-16. All replaced with `koni-docs sync`.
- **RULE-2's body was rewritten; its heading was not.** It still read "Commit hash
  in CHANGELOG mandatory" above a body whose preferred path is *no `**Commit**:`
  line at all* — the first thing an agent grepping `RULE-2` reads. LESSONS §18,
  committed one round earlier, names exactly this failure.
- **Deleting the duplicated Scripts table left every pointer into it dangling.**
  SKILL.md's activation table — the primary routing surface — still sent
  "regenerate status", "inject tasks", and "backfill changelog SHAs" to a section
  this project had just gutted.
- **Cross-skill breakage:** removing the dead `--include-warnings` flag from the
  CLI broke `koni-setup`, which still instructed agents to run it. Fixed there.
- Residual PII (`@jindo9986`, a real name in an OKR example) in template worked
  examples; `Docs/` casing; a `See references/...` link that resolved to
  `references/references/...`; the changelog example's version disagreeing with
  its own annotation.

### Added
- **`scripts/check-references.py`** — asserts every `](link.md)`, `](#anchor)`, and
  `` `file.md` §Section `` in a skill resolves to something that exists. It knows
  that headings inside fences are not headings, that GitHub does not collapse
  whitespace when slugging, and that placeholder paths (`US-X.Y-<slug>.md`) belong
  to the *generated* document. This is the mechanical check that would have caught
  15 of this round's findings, and it is the reason the class should not recur.
  Currently green on koni-docs, koni-harness, koni-setup, koni-nextjs; **koni-qc
  has 4 dangling references** — pre-existing debt, reported not silently fixed.

koni-docs CLI **0.11.0 → 0.11.1**.

---

## [0.41.0] — 2026-07-13 — koni-docs: round 2 of skill-grading — the skill told agents to break its own BLOCKER rule — v0.41.0

Re-grade after v0.40.0: **72.5/100** (D1 24 · D2 25 · D3 5 · D4 18.5) — still short
of the ≥95 bar, and D3 went *down*, because a round-1 *minor* turned out to be
Critical on verification. Exactly what LESSONS §8 predicts: each fix surfaces the
next finding. Extends [US-1.6](sprints/stories/US-1.6-story-deadlines.md).

### Fixed
- **CRITICAL — the skill instructed agents to violate RULE-15, citing RULE-15 as
  the justification.** RULE-15 (BLOCKER) says `assignee:` is the GitHub **login**
  and explicitly forbids git `user.name`. Three places prescribed
  `git log -1 --format=%an <sha>` — which *is* `user.name`. The rule's own
  rationale names the failure (`user.name = AnhMTV`, login = `saltict`), so the
  recipe produced the documented bug. It survived because on the author's machine
  all three values coincide. Now resolves the commit author to a login via
  `gh api repos/{owner}/{repo}/commits/<sha> --jq .author.login`.
- **The RULE-2 rewrite had landed in two files and nowhere else.** The changelog
  template, SKILL.md's rule summary / pre-commit checklist / banner, and the story
  template's §12 all still taught the impossible "fill the SHA at pre-commit"
  flow — and the changelog template is the one an agent reaches *without* loading
  rules.md. Propagated everywhere; no self-referential `**Commit**:` line survives
  anywhere in the skill.
- **Repaired the `--amend` scar RULE-2 was rewritten to prevent.** US-4.29 carried
  `commit: e37c590` — not a valid git object. Real SHA: `a1ffc77`. Found by
  RULE-2's own reachability grep; the whole 44-SHA corpus now passes it.
- **A real person's name, email, and machine path shipped inside the skill**
  (`templates/integration.md`'s filled example). Replaced with placeholders.
- `--include-warnings` was declared on `validate` and **never read** — a flag the
  docs taught in the audit loop, which did nothing. Removed.
- `findRedundantDue` shipped in v0.40.0 and was documented nowhere: the lib export
  was absent from cli.md's import block and `validate`'s new warning class was
  unexplained. An agent would see a warning the docs never mention. Documented in
  cli.md, sprint-system.md, and frontmatter-spec.md §5.7.
- Every hardcoded CLI version removed from the skill — including from the file
  that says "Don't hardcode a version anywhere else." Run `npx koni-docs --version`.
- `rules.md`'s LESSONS citations (the evidence for two BLOCKER rules) resolved to
  `skills/docs/LESSONS.md`. Fixed. RULE-6's "PRD §7" references predate the
  label-only heading migration (US-4.29). Fixed.
- The orphaned JSDoc block in `lib/deadlines.ts` — the `RedundantDue` insertion had
  split `findMalformedDue`'s doc comment from its function, so the interface
  carried the function's docs.

### Changed
- **`description`: 1024 → 727 bytes.** The v0.40.0 rewrite had pushed it to the
  spec's hard 1024-char cap with 4 characters of headroom — buying trigger surface
  it mostly already had. Trimmed the ownership preamble; kept the triggers and the
  NOT-clauses.
- **SKILL.md: 528 → 325 lines.** Beyond v0.40.0's §7 extraction, the `.vi.md`
  convention moved to rules.md (it is RULE-13's detail) and the story-sizing
  doctrine — including a dated case study — moved to sprint-system.md.
- **De-duplicated what the extraction had forked.** The pre-commit checklist and
  the CLI subcommand table each existed in three places and had already drifted
  apart. Each now has one home and pointers.
- Table of contents on every reference file over 100 lines — including the three
  largest, which v0.40.0's auto-pass had skipped. All 100+ anchors resolve under
  GitHub's slug rules (the first generator collapsed whitespace where GitHub does
  not — its TOCs were themselves broken).

koni-docs CLI **0.10.0 → 0.11.0**.

---

## [0.40.0] — 2026-07-13 — koni-docs: the skill-grading round on US-1.6 — a guardrail that waved its own anti-pattern through — v0.40.0

The koni-harness Review stage grades a skill deliverable with koni-qc's
four-dimension rubric (bar ≥95). Running it on `koni-docs` scored **72/100**
(D1 22 · D2 25 · D3 8 · D4 17.5) and produced findings the author could not have
found by re-reading their own work. This entry is that round. Extends
[US-1.6](sprints/stories/US-1.6-story-deadlines.md) — a round extends the anchor
story, it does not become a new one (LESSONS §13).

### Fixed
- **`normalizeDue` silently accepted a date with prose stapled to it.**
  `due: 2026-07-20 (pending customer confirmation)` — the *exact* value
  `frontmatter-spec.md` §5.6 promises `validate` will reject — was normalized to
  `2026-07-20` and rendered in STATUS.md as a clean deadline. Cause: the
  `slice(0, 10)` tolerance added for round-tripped ISO timestamps swallowed any
  trailing text. Both accepted shapes are now anchored (bare day, or a full ISO
  timestamp), with a regression test. A guardrail that waves the documented
  anti-pattern through is worse than none — the reader stops looking.
- **RULE-2 prescribed a procedure that cannot work.** "Commit → read the SHA →
  `git commit --amend` to fill it in" is a fixed-point that never converges:
  amending mints a *new* SHA, orphaning the one just written. It had been a
  BLOCKER rule for months and had produced at least one story pointing at a
  commit reachable from nothing. Rewritten to the two honest shapes (omit the
  SHA, or backfill it in a follow-up commit). See [LESSONS §17](LESSONS.md).
- **`references/templates.md`'s frontmatter cheatsheet taught the anti-patterns
  RULE-17 forbids** — `prd_ref: FR-N # …and/or AD-N IDs` and the banned range
  syntax `FR-X.1 .. FR-X.N` — and never received `due` at all. It is billed as
  the shortcut for agents who skip the full template, so it was the copy most
  likely to be obeyed. Regenerated from `frontmatter-spec.md` §3.1.
- `SKILL.md` §7 claimed the CLI was "current: v0.7.0" while the same section
  documented v0.9.0 behaviour, told readers to install a `.tgz` filename that
  never existed, and hardcoded one developer's absolute path
  (`/Volumes/MacData/…`). The library-API listing omitted every deadline export.
- `external_deps` was documented as populating a "STATUS risk flag" the CLI has
  never read. Marked planning-only, the honest framing already used for
  `arch_ref` / `depends_on`.
- The worked example in `templates/story.md` broke three of the skill's own rules
  (empty `assignee` on a `done` story — RULE-15; `commit: a1b2c3d4e5f6...` — an
  ellipsis, not a SHA; `AD-06` cited to PRD.md when the skill's own namespace
  table puts AD-N in ARCHITECTURE.md).
- `references/rules.md` addressed `Docs/` (capital D) throughout — every grep
  check in it silently returned empty on a case-sensitive filesystem, which is
  indistinguishable from passing.
- Dead route: `SKILL.md` §6 sent agents to `references/migration-from-bmad.md`,
  which does not exist.

### Added
- **`validate` warns when a `due` merely restates its sprint's end date.** The
  "no inheritance from `sprint.end`" rule was prose-only, with no machine
  backstop, so a bulk `due = sprint.end` edit — the exact failure that turns the
  Deadlines board into a second copy of the sprint table — passed every gate.
  Warned, never blocked: it is a judgment call. `findRedundantDue` is exported
  from the lib.
- Table of contents on 13 reference files over 100 lines.

### Changed
- `SKILL.md` **528 → 365 lines** (back under the 500-line bar). §7's CLI
  reference — install modes, flags, the commit loops, the typed lib API,
  troubleshooting — moved to `references/cli.md` and is now loaded on demand
  rather than on every activation. SKILL.md keeps a seven-line subcommand table.
- The skill `description` never mentioned deadlines, so the entire shipped `due`
  surface had zero router visibility: "we have a contractual date we can't miss —
  where do I put it so it warns us?" routed to koni-harness. Added deadline
  triggers plus explicit near-miss carve-outs (not koni-qc / koni-harness /
  koni-setup).

koni-docs CLI **0.9.0 → 0.10.0**.

---

## [0.39.0] — 2026-07-13 — koni-docs: story deadlines — a `due` date beside the sprint cadence — v0.39.0

Ships **FR-38** ([US-1.6](sprints/stories/US-1.6-story-deadlines.md), [CONTEXT D37](CONTEXT.md)).
koni-docs CLI **0.8.1 → 0.9.0**.

A sprint is a *cadence* — it repeats, and `sprint.end` is where the week stops,
not a promise made to anyone. A deadline is a *commitment* — a date imposed from
outside that rhythm. koni-docs could express the first and never the second, so
work carrying a contract date, a customer demo, or an audit window was invisible
to every tool in the framework.

### Added
- **`due`** — optional story frontmatter field, a bare `YYYY-MM-DD` deadline
  imposed from outside the sprint cadence. **No inheritance**: a story without
  `due` has no deadline, and `sprint.end` is never a fallback. An implicit
  deadline on every story would bury the two that carry a real one — the field
  earns its power by being rare.
- **`koni-docs status`**: a `## ⏰ Deadlines` section above the kanban columns
  (🔴 overdue / 🟠 due-soon / 🟢 on-track, most overdue first), a deadline line in
  the Summary, and `--due-soon-days <n>` (default 3). Quiet, not absent, when
  nothing is dated. Derived state is recomputed every run — never stored, so it
  cannot go stale.
- **`koni-docs validate`**: `due` checking with two severities. A value that is
  not a real date is an **error** (exit 1). A story merely past its date is a
  **warning** that leaves the exit code alone — deadlines inform, they never
  block a commit. A gate that punishes recording a slip teaches people to delete
  the date.
- `lib/deadlines.ts` — `getDeadlines`, `findMalformedDue`, `normalizeDue`,
  `isValidIsoDate`, exported from `@koniverse/koni-docs/lib`.
- Skill docs: frontmatter-spec §1.1 (the Iron Law extended from ID-typed to
  date-typed fields) + §3.1 `due` row + §5.6/§5.7 anti-patterns; story template
  §2b Deadline; sprint-system §Deadlines vs sprint cadence, including the rule
  that **moving a `due` requires a CONTEXT entry** (old → new → why).

### Fixed
- `sprintSchema` had been rejecting **every real sprint file**. YAML parses an
  unquoted `start: 2026-06-29` into a JS `Date`, which a `^\d{4}-\d{2}-\d{2}$`
  *string* regex can never match — so the rule had silently matched nothing for
  months. Both forms are now accepted. Same root cause as the `due` work; see
  [LESSONS §16](LESSONS.md).

### Known limits
- An **unquoted** impossible date (`due: 2026-02-31`) is silently rolled over by
  YAML to `2026-03-03` before koni-docs sees it; the typo cannot be recovered
  downstream. Only the quoted form is caught. Documented and pinned by a test.
- Deferred: `due_type` (hard/soft), `due_source`, epic/sprint-level deadlines,
  and viewer rendering — one field until one field proves insufficient.

---

## [0.38.0] — 2026-07-04 — design-first UI + the doc-completeness bar (refines FR-21 + FR-26) — v0.38.0

Two user directives: (1) always learn from the project's own documents — LESSONS
**and DESIGN.md** — so known mistakes never recur and UI never gets reworked after
review; (2) finish the project docs meticulously after every feature, never "just
enough". CONTEXT D36.

### Changed — `skills/koni-harness/`

- **`agentic-loop-standard.md`** — two new hard-rule callouts:
  - **Design-first UI (Execute)**: conformance *discovered* by `/design-review` is
    rework; before the first line of UI code — read `DESIGN.md` in full + the
    component contracts, enumerate the component × state matrix, name the shadcn
    primitives, tokens only — then cite it: `Design applied: <sections +
    primitives + tokens>`. Review *confirms*; a first-pass failure on a stated
    rule is a process failure → lesson.
  - **The doc-completeness bar (Doc + Version gate)**: every completed feature
    updates its whole doc surface, mapped from the diff (CHANGELOG = behaviour
    never file lists · CONTEXT for decisions · ARCHITECTURE for structure ·
    DESIGN for UI patterns · README/SETUP for usage · koni-qc surface for
    coverage), judged by koni-qc's depth bar — each doc must let the next reader
    act **without opening the diff**; evidence, not adjectives.
- **NEW `scripts/checks/design-first.sh`** (release-commit, block): staged UI
  source (`tsx/jsx/vue/svelte/css/scss`) in a repo with `DESIGN.md` requires an
  **added** `Design applied:` citation — same anti-gaming mechanics as
  lesson-capture (added-lines only, placeholder guard, loop-free).
  + `__tests__/design-first-test.sh` (11 assertions, bash + dash green).
- **`gate-catalog.md`** §design-first (eight built-in checks; six
  release-commit-only); **`gates.conf`** design-first row; **`loop-runner.md`**
  doc-gate row carries the doc-completeness bar; **`example-loop.md`** UI step
  cites; **`SKILL.md`** description gains design-first / doc-bar triggers
  (1003/1024).

### Added — `docs/`

- **LESSONS §15** — a contract discovered at review is rework; feed contracts in
  at entry with citation, review only confirms.

## [0.37.0] — 2026-07-04 — the lessons loop is always-on: read-with-citation + write-with-verdict, both gated (refines FR-21 + FR-22) — v0.37.0

Two user directives: (1) always READ the repo's LESSONS.md before a development
task; (2) always WRITE LESSONS.md on task completion so the loop re-learns.
Built by dogfooding koni-harness on itself. CONTEXT D35.

### Changed — `skills/koni-harness/`

- **`agentic-loop-standard.md`** — the lessons-loop callout replaces the old
  capture note: **read at entry is evidenced** (open the LESSONS sections whose
  titles touch the task — the context-load digest is the index — and cite them in
  the plan/story: `Lessons applied: §N — <how>` or `none — <why>`; per-repo when
  working across repos) and **write at exit is a verdict** (same commit as
  code+VERSION+CHANGELOG+CONTEXT: a LESSONS entry, or the honest
  `Lessons: none new — <reason>` line). The gate enforces that the verdict was
  recorded, never which way it went — forced lessons breed filler.
- **NEW `scripts/checks/lesson-capture.sh`** (release-commit, block): a staged
  diff touching anything outside docs/ must stage a LESSONS.md change or a
  staged `Lessons: none new — <reason>` line; docs-only commits exempt.
  + `__tests__/lesson-capture-test.sh` (12 assertions, bash + dash green).
- **`checks/story-lint.sh`** — rule 6 (read evidence): stories created on/after
  2026-07-04 must carry a `Lessons applied:` line; self-test 13 → 16 assertions.
- **`gate-catalog.md`** §lesson-capture + updated §story-lint; **`gates.conf`**
  lesson-capture row; **`context-load.md`** digest = read *index*, not the read;
  **`SKILL.md`** description gains learn-from-past-mistakes / LESSONS triggers
  (1009/1024).

### Added — `docs/`

- **LESSONS §14** — a lessons file only works as memory if reading is evidenced
  and writing is a verdict; skimming and silence are the failure modes.

## [0.36.0] — 2026-07-03 — story-lint: US field completeness is a blocking gate (refines FR-21 + FR-22) — v0.36.0

User directive: koni-harness must always verify story fields are fully filled —
never repeat the D32 incomplete-US incident. Per LESSONS §10, the rule ships as
code + gate, not prose. CONTEXT D34.

### Added — `skills/koni-harness/`

- **`scripts/checks/story-lint.sh`** (+ `__tests__/story-lint-test.sh`, 10
  assertions): per US story — mandatory frontmatter present (id/title/epic/
  status/priority/points/sprint/assignee/commit/created/updated +
  version_shipped when done), points a positive integer, id matches filename,
  the sprint file exists **and did not end before `created:`**, done ⇒ real
  commit (`pending` only within the same-day backfill window). Default
  `release-commit` / **block** in `gates.conf`; gate-catalog gains check §7
  (six → seven built-ins); the Doc + Version gate entry and the
  story-granularity callout point at it.

### Changed — `docs/` (first-run catch)

- On its first run against this very repo, story-lint caught the **same D32
  drift from two months earlier**: the 7 v0.2.0 stories (US-1.2 → US-1.4,
  US-2.1 → US-2.4) were filed in sprint-2026-W21 (ended 05-24) but shipped
  05-27, inside W22. Moved to sprint-2026-W22 (now 43 stories / 141 pts) with
  correction notes in both sprint files (D34). Repo now lints clean.

## [0.35.0] — 2026-07-03 — story-granularity rule in koni-harness + US consolidation (refines FR-21) — v0.35.0

User directive: stop fragmenting work into unnecessary tiny stories; consolidate
where possible. CONTEXT D33; LESSONS §13.

### Changed — `skills/koni-harness/`

- **`agentic-loop-standard.md`** — new hard rule at Frame: **one story = one
  deliverable, not one work-session**. A follow-up round extends the anchor story
  (`## Round N` + points + appended version/commit), never a new US; refinements of
  an existing FR get no story at all; existing sprawl is consolidated (merge, repoint
  every reference, sum points, retire IDs forever with a visible "was US-X.Y" note).
- **`SKILL.md`** — description gains the consolidate/merge-stories/story-sprawl
  triggers (1015/1024).

### Changed — `docs/` (the consolidation itself)

- **US-5.6 → US-5.3 round 2** (test-doc standardization was a second round of the
  test-organization theme; 3+3 = 6 pts).
- **US-5.9 + US-5.10 → US-5.8 rounds 2–3** (three same-theme ERP-absorption rounds
  in 2 days; 3+5+3 = 11 pts). EPIC-5 now 7 stories; sprint-2026-W27 now 9 rows /
  42 pts (points preserved). Retired IDs `US-5.6`/`US-5.9`/`US-5.10` are never
  reused; epic pillars/FR/story tables, PRD index, CONTEXT links, and `depends_on`
  all repointed.

## [0.34.0] — 2026-07-03 — koni-qc: field reorg absorbed + the regression-learning harness loop (US-5.10, FR-37) — v0.34.0

Three user directives: absorb the ERP-02 test-doc reorg; make koni-qc a harness that
learns from real bugs; always sweep CHANGELOG + git log for missed cases. CONTEXT D31.

### Added — `skills/koni-qc/`

- **`references/regression-learning.md`** — the QC harness loop (Observe → Capture →
  Derive → Generate → Enforce): every escaped bug becomes THREE things (red-first
  `REG` TC + class-named finding + step-9 generalization sweep); the four-mode miss
  post-mortem (enumeration/density/layer/execution gap — fix the class, not the
  instance); the **mandatory change sweep** (CHANGELOG **and** git log diffed every
  round; a fix commit with no REG TC = a confirmed miss) + the change-coverage
  ledger in findings.md; bug-bash intake.

### Changed — `skills/koni-qc/`

- **`test-organization.md`** — §1 adopts the ERP-02 field layout as canonical:
  `test-cases/EPIC-N/` per-US split (`index.md` frame + `US-x.y.md` rows),
  **date-first** `test-reports/YYYY-MM-DD/` (+ `auto-coverage.md`, per-US execution
  docs, `summary/` latest-state rollups), `test-plan/` removed (per-epic framing →
  `index.md`), legacy shapes accepted; §5 legend + the coverage formula
  `covered = automated + env-pending + design + ops-deploy`.
- **`traceability.md`** — `DESIGN-REVIEW:<ref>` is the **5th fixed Covered-by form**
  (🎨 design, own column; /design-review + design lint); "do not invent a sixth".
- **`test-automation.md`** — §2: the enforcer is **lane-aware** (⏳ env-pending: a
  live-cadence handle missing in an env-less lane is covered-pending-env, never
  broken; the full lane enforces), status map + env-pending/design rows, recursive
  spec reconcile, date-first output + path validator (legacy accepted).
- **`scripts/qc-report.mjs`** — `--lane` (closed set, fails closed), recursive scan
  (generated-tree guard), design class (fallback-only free-text reading — no
  laundering through PROPOSED/automated cells), `env-pending` bucket (unit lane
  only; cadence read from the path part), malformed-TC-ID flagging, coverage-formula
  line, date-first path validator (real month/day digits; date-level
  report-manual); self-test **42 → 61 assertions**.
- **`qc-workflow.md`** — Frame: the change sweep is a mandatory input + exit item;
  Design: author into `EPIC-N/` (index vs US files); Release gate: "close the
  learning loop" exit item. **`layered-suites.md`** — siblings live inside the epic
  dir; per-run `test-reports/.../US-x.y/` docs are generated instantiations.
  **`SKILL.md`** — learning-loop mode + activation/index rows; description rewritten
  (1012/1024). **`quality-bar.md`/`whole-project-qc.md`** — five-form updates;
  koni-setup vocab check updated.

### Added — `docs/`

- **LESSONS §11** — the standard follows the field: absorb an adopter's reorg
  promptly, keep the old shape legacy-accepted, never fork the layout.

## [0.33.0] — 2026-07-03 — koni-qc field-hardening from the ERP 100% drive (US-5.9, FR-36) — v0.33.0

Absorbs the five ERP-02 audit docs written back after their real 9.3%→100% automation
drive — incl. TWO real bugs in our own reporter contract. Supersedes D21's no-vendored-
reporter clause. CONTEXT D30; LESSONS §10.

### Added — `skills/koni-qc/`

- **`scripts/qc-report.mjs`** — the reference reporter (node stdlib): frozen TC-token
  regex, header-skip spec scan, **broken-handle enforcer** (automated Covered-by must
  resolve to a PASSING test; broken = 0 or exit non-zero), duplicate-ID guard, 4-class
  counters, density telemetry, denominator-honesty line. + **contract self-test**
  (`scripts/__tests__/qc-report-test.mjs`, 42 assertions) freezing both field bugs.
- **`references/live-harness.md`** — the live-stack recipes: 2-credential RLS-as-user,
  per-test tenant isolation, self-seeding e2e, boot exclusions, prod-safety rules.

### Changed — `skills/koni-qc/`

- **`test-automation.md`** — §2: exact parse regex (`TC-[0-9A-Z]+\.[A-Z][A-Z0-9]*-\d+`
  — `[A-Z]+` silently dropped E2E/A11Y), spec-scan first-cell rule, the enforcer,
  reference-impl pointer; status map + ops-deploy row; §4: CI job with services for the
  live suites + a `typecheck` passthrough gate.
- **`traceability.md`** — `OPS-DEPLOY:<runbook>` is the **4th fixed Covered-by form**
  (own column, never lumped with manual, exhaust-local-first) + "N scenarios may share
  one test" (spec carries N TC-IDs).
- **`quality-bar.md`** — **Band D — density & exhaustiveness** (gate): step-9 done,
  matrix completeness 100%, full BVA discrete rows, full error/status coverage,
  one-row-per-scenario, density plausible; pass rule updated (Band A green + Band D
  red = thin → Design).
- **`qc-workflow.md`** — §Frame: **read the system-design docs IN FULL before test
  design** + the two enumeration inputs (TD contract w/ error-code table + UI-state
  inventory), authored from code if absent — Design may not start without them; §Execute:
  per-epic fan-out with the JSON repoint contract (orchestrator-only spec edits).
- **`layered-suites.md`** (+field×validation & state-transition matrices),
  **`test-design.md`** (full-BVA discrete rows + legal/illegal transitions),
  **`report-quality.md`** (density telemetry + denominator honesty),
  **`test-organization.md`** (ops-deploy in the US legend), **`SKILL.md`** (live-harness
  routing + enforcer/index notes); koni-setup vocab check updated.

### Changed — re-grade round (D19, 4 graders + adversarial re-verify)

- **`qc-report.mjs` hardening from the D2/D3 findings**: `broken` is its own counter
  (buckets now SUM to total), fifth-form/free-text Covered-by flagged broken (never
  laundered to not-written), orphan run-IDs surfaced, duplicates counted once,
  Covered-by resolved from the header column (Notes-after-Covered-by safe), timing +
  first-failure captured per TC and rendered, en-dash manual tolerated, --out path
  validator; self-test 25→42 assertions.
- **Consistency fixes**: test-automation §Ownership rewritten (ships-the-reference
  stance — the old "no vendored reporter" text contradicted §2), "first TC token in
  the full name" wording, live-lane-must-not-all-skip rule (test-automation §4 ↔
  live-harness prop 4), traceability "three→four fixed forms", whole-project-qc DoD
  4-form + enforcer, quality-bar Band B captured-actual+timing target + Band D
  de-duplicated to step-9 pointers, qc-workflow §3 names Band D + Frame inputs scoped
  to the US's real surfaces, report-quality honest reference-scope, test-organization
  density-is-doc-driven note + status-vocab reconciliation + 🏗️, layered-suites
  per-doc execution summary, description +NFR triggers (1012/1024).

### Added — `docs/`

- **LESSONS §10** — machine-parse contracts ship as exact regex + self-test fixture.

Whole koni-qc re-graded ≥95 (CONTEXT D19).

---

## [0.32.0] — 2026-07-03 — koni-qc case-volume derivation: cross-multiply classes × surfaces (refines FR-26 + FR-35) — v0.32.0

Closes the **10× case-volume gap** between koni-qc output (~3 TC/US on ERP-02) and the
exemplar/backup reality (154 TC for one US): the 3-slot rule was a floor acting as a
stopping criterion, and derivation was per-AC only. CONTEXT D29.

### Changed — `skills/koni-qc/`

- **`references/test-design.md`** — new **step 9 (the volume step)**: after per-AC
  derivation, **cross-multiply every shared class across every surface** (auth-guard ×
  endpoints · validation × fields × rules · RLS × tables × 3 · error-codes/statuses/
  events/providers/UI-states × each), with a class×surface table; plus the **atomicity
  rule** (one case = one observable behaviour — no bundled Expecteds).
- **`references/qc-workflow.md`** — §3 Self-review gains a **density sanity check**
  (warn, not gate): an API/UI US under ~30 atomic cases is presumed under-derived until
  justified (exemplar density ~150/US).
- **`references/layered-suites.md`** — **living-suite rule** (every round bug feeds the
  case that would have caught it back into `test-cases/` before graduation); auth-guard
  wording fixed (cases multiply per endpoint; only the section placement is shared).
- **`references/traceability.md`** — the completeness rule now states **the 3-slot rule
  is a floor, not a stopping criterion** (points at step 9 + the density sanity).

Whole koni-qc re-graded ≥95 (CONTEXT D19).

---

## [0.31.0] — 2026-07-02 — koni-qc layered suites + report-quality bar (from the US-001.001 exemplars + backup checklist rounds) (US-5.8, FR-35) — v0.31.0

Lifts koni-qc's test-case authoring and execution reports to the bar set by two exemplar
suites (US-001.001 API + functional) and the matured SubWallet checklist-round practice in
`koni-docs.backup`. Opens FR-35 under EPIC-5; CONTEXT D28.

### Added — `skills/koni-qc/`

- **`references/layered-suites.md`** — the suite-structure standard: **API + functional
  layer split** with mutual scope contracts; API **by-endpoint** tables (Request
  Headers/Payload, **real Actual Response**, **Response Time**, **DB Changes**) + four
  required API classes (auth guard · RLS isolation incl. write-rejection · events +
  idempotency · audit); functional **category prefixes** (`[Happy Path]/[Error]/
  [Validation]/[Verification]`) + UI-component traceability + per-case evidence; the
  **orthogonal coverage matrices** (endpoint / HTTP status-code / error-code · pages /
  components / validation+a11y — surface coverage next to the AC↔TC's requirements
  coverage); the **named test-data registry** (fixture → state → Used-In + acquisition
  notes); **`## Open Questions`**; **round-based bug-fix retest** (rounds until clean →
  survivors graduate to `RC-`).
- **`references/report-quality.md`** — the execution-report **content bar**: the
  **honest-actuals rule** (Actual = real observed output, never a copy of Expected),
  nine required sections (overview % · results-by-group · skipped/blocked with
  reason+action · failed-by-category root cause · contract-coverage verification · perf
  min/max/avg · implementation status · recommendations · command reference), and the
  evidence rule (every failure links spec `file:line` + video/screenshot/log). Applies to
  auto `report.md` + manual `report-manual.md`.

### Changed — `skills/koni-qc/`

- **`SKILL.md`** (Author mode + activation + index), **`test-design.md`** (output shapes
  into the layers), **`traceability.md`** (requirements- vs surface-coverage pairing),
  **`qc-workflow.md`** (§Design shapes by layer; §Execute exits only with a bar-meeting
  report), **`test-automation.md`** (§2 output → the content bar), **`quality-bar.md`**
  ("Real execution reports" graded against report-quality) — criteria live once, all
  point at the two new references.

Whole koni-qc re-graded ≥95 (CONTEXT D19).

---

## [0.30.0] — 2026-07-01 — UI design-review must pass DESIGN.md + the shadcn standard (refines FR-26 + FR-21) — v0.30.0

Made shadcn conformance a **mandatory, authored, enforced** half of the UI design-review
gate (it was an unstated expectation). Every UI-bearing case must now pass gstack
`/design-review` against **both** `DESIGN.md` and the shadcn standard. Refines FR-26 (koni-qc)
+ FR-21 (koni-harness); CONTEXT D27.

### Changed — `skills/koni-qc/`

- **`references/nfr.md`** — the canonical UI-conformance criteria are now **DESIGN.md + the
  shadcn standard** (shadcn/ui primitives, design tokens/theme, `cva`+`cn()` variants,
  preserved Radix a11y) — a hard requirement; everything else points here.
- **`references/test-design.md`** — new **step 8**: a UI-bearing AC is not done until it has a
  `TC-<EPIC>.UI-<n>` whose pass condition is passing `/design-review` vs DESIGN.md + shadcn
  (authored up front, not discovered at Execute).
- **`references/qc-workflow.md`** (Design + Execute), **`references/traceability.md`** (`UI`
  type), **`SKILL.md`** (owner row / activation / Execute mode / description) — all carry the
  two-part requirement.

### Changed — `skills/koni-harness/`

- **`references/agentic-loop-standard.md`** (Review stage + tool-split), **`loop-runner.md`**,
  **`example-loop.md`**, **`references/parallel-orchestration.md`**, **`SKILL.md`** — the
  Review stage's `/design-review` step now reads "UI vs DESIGN.md **+ the shadcn standard**,
  both mandatory" (criteria delegated to koni-qc `nfr.md` §UI). Stays a process step, not a gate.

Both changed skills re-graded ≥95 (CONTEXT D19).

---

## [0.29.0] — 2026-07-01 — koni-harness: explicit lesson-capture step at the Doc + Version gate (refines FR-21) — v0.29.0

An audit found the koni-harness loop only **read** `LESSONS.md` (Execute skims it) but had
no explicit step to **write** one — lesson-writing lived only as a conditional koni-docs
pre-commit checklist line, not a named loop step. This adds the capture step, closing the
read→write loop. Refines FR-21 (a process step, no new capability); CONTEXT D26.

### Changed — `skills/koni-harness/`

- **`references/agentic-loop-standard.md`** — added the **capture-lessons rule** at the
  Doc + Version gate (append a `LESSONS.md` entry via koni-docs `templates/lessons.md`, same
  commit, **if** Review/Execute surfaced a trap/pattern) + noted the `LESSONS.md`
  context-layer is now **read at Execute, written at Doc-gate**. Deliberately a **process
  exit-criterion, not a deterministic gate** ("was a lesson learned?" is a judgment; a check
  firing on every commit would be noise).
- **`references/loop-runner.md`** — the `doc-gate` drive step now includes the conditional
  `LESSONS.md` append (alongside story/CHANGELOG/VERSION/CONTEXT).
- **`references/example-loop.md`** — the worked example captures a lesson at the doc-gate.
- **`SKILL.md`** — notes the loop reads `LESSONS.md` at Execute and writes at the Doc-gate.

koni-docs is unchanged (it already owns the LESSONS.md template + checklist item; the harness
just names *when in the loop* it happens). Whole koni-harness re-graded ≥95 (CONTEXT D19).

---

## [0.28.0] — 2026-07-01 — koni-agent-monitoring: content-free Claude Code usage reporter (US-6.1, FR-34) — v0.28.0

The catalog's **first product/client skill**: a per-machine Claude Code monitor that streams
a content-free projection of session usage (agent count, model, token/cost) to the Koni ERP
Agent Ops dashboard. Built from the FINAL ERP handoff spec, through koni-harness. Opens FR-34
under the new EPIC-6; CONTEXT D25.

### Added — `skills/koni-agent-monitoring/`

- **`scripts/agent-report-core.mjs`** — the pure, privacy-critical core: strict
  session/event/metadata **allowlists**, `projectLine` (transcript → names/counts/paths only,
  never text/tool-IO), `buildBatch` (accumulate → absolute snapshot + delta events),
  `costUsd`/`PRICING`, and `pick()` filtering the final batch to the allowlist (defence in
  depth). Node stdlib-only.
- **`scripts/report.mjs`** — the reporter: a Claude Code hook entrypoint that reads only new
  transcript lines from a per-session byte offset, enqueues a batch, and **spawns a detached
  drain** (never blocks the editor). Drain POSTs ≤500-event batches with `2xx`→drop /
  `401`→stop+warn / `429`/`5xx`/network→keep+exponential-backoff + buffer-cap trim.
- **`scripts/install.sh`** — additive/idempotent installer: copies the reporter, writes
  chmod-600 config, wires the four hooks (`--merge-hooks` via jq + backup, else prints the
  block — matching koni-harness's "settings.json merged manually" invariant).
- **`scripts/__tests__/`** — the **mandatory content-leak test** (`leak-test.mjs`) + core,
  reporter-io (e2e), and installer tests. **89 assertions, all green (sh + zsh).**
- **`SKILL.md`** + 5 references (`privacy-allowlist`, `ingest-contract`, `transcript-parsing`,
  `pricing`, `install`), each with a Load-when + Contents TOC.

### Added — `docs/`

- **EPIC-6** (Agent Ops monitoring client) + **US-6.1** + **FR-34**.

Skill graded ≥95 (CONTEXT D19) via skill-grading + an author-blind code review of the reporter.

---

## [0.27.0] — 2026-07-01 — koni-harness multi-agent: parallel sprint swarm + within-story fan-out (US-3.8, FR-33) — v0.27.0

koni-harness drove work single-agent (one story at a time). This adds a **multi-agent
execution mode**: a whole wave of dependency-ready stories runs in parallel, one worker
per story in its own git worktree, plus within-story fan-out — without changing the six
stages or the gates. Opens FR-33 under EPIC-3; CONTEXT D24.

### Added — `skills/koni-harness/`

- **`scripts/swarm.sh`** — a **read-only** wave planner. `plan` turns the dependency-ready
  set (single-sourced from `sprint.sh`, priority-ordered, `--cap` default 4) into one
  worker block per story — `git worktree add` + `loop.sh start <id> --state …` — then the
  integrate + re-plan step; `status` delegates to `sprint.sh`. Never spawns an agent, adds
  a worktree, or writes state.
- **`references/parallel-orchestration.md`** — the two-tier standard (Tier A sprint swarm
  wave-by-wave over the DAG; Tier B within-story fan-out of a stage's independent
  sub-tasks), the isolation + integration contract (worktree per story; gate per worktree
  + again at integration; human owns the final merge), orchestrator/worker roles, and the
  portable fallback (tools without parallel agents run the same plan sequentially).
- **`scripts/__tests__/swarm-test.sh`** — 20 deterministic assertions (wave/cap/ordering/
  blocked-exclusion/passthrough/guards).

### Changed — `skills/koni-harness/`

- **`SKILL.md`** — new "Run a sprint in parallel (multi-agent swarm)" section + reference
  row + an owned-vs-delegated row (koni-harness plans the wave; the tool runtime spawns);
  "The standard" now names both execution modes.
- **`scripts/install-gate.sh`** — vendors `swarm.sh`; gitignores `.koni-harness/worktrees/`.
- **`references/agentic-loop-standard.md`** — an execution-modes note (single-agent vs
  swarm; parallelism adds no stage, weakens no gate).
- **`references/loop-runner.md`** — `loop.sh --state` is the per-worker spine of the swarm.
- **`references/sprint-sequencer.md`** — `sprint.sh next` is the single source of the ready
  set the swarm consumes.
- **`references/adapters.md`** — pointer to the swarm's agent-spawning adapter.

Fixed a `set -e` bug in `swarm.sh` (trailing `[ test ] && echo` → non-zero exit) caught by
the new test. Whole koni-harness re-graded to ≥95 (CONTEXT D19).

---

## [0.26.0] — 2026-07-01 — whole-project QC: QA-tracking epic + Definition-of-Done + depth bar (US-5.7, FR-32) — v0.26.0

A koni-qc learning note from Koni-ERP-02 (ERP LESSONS §213) found that running koni-qc
end-to-end still came out **worse than Senti-Quant** on five whole-project concerns the
skill left to operator memory — no dedicated QA-tracking epic, empty strategy, misplaced
artifacts, no execution (specs-only declared "done"), and 21 thin-stub stories. This adds
the layer above the per-epic lifecycle. Opens FR-32 under EPIC-5; CONTEXT D23.

### Added — `skills/koni-qc/`

- **`references/whole-project-qc.md`** — QC an entire repo (not one epic): §1 stand up
  the **QA-tracking epic** (Senti `EPIC-37` model — a coverage story per app epic +
  infra/process stories + the QA ownership model); §2 **author the strategy**
  (`STRATEGY.md` + per-epic `test-plan/`); §3 **artifact-location MUSTs**
  (`audits/QC-PLAN-BY-US-<date>.md`, per-epic dated reports); §4 **execution required**
  (≥1 real `report.md`, not specs-only); §5 a whole-project **Definition-of-Done**
  checklist; §6 the **depth bar** ("creating a file is not authoring it" — no thin stubs,
  spot-check 3).

### Changed — `skills/koni-qc/`

- **`SKILL.md`** — new "QC a whole project" mode + activation + reference-index rows +
  description trigger (856 chars, under the 1024 limit).
- **`references/qc-workflow.md`** — §Frame routes whole-repo scope through
  whole-project-qc (QC not "done" on specs alone).
- **`references/test-organization.md`** — §0 makes `audits/QC-PLAN-BY-US-<date>.md` a
  MUST (never the tests root); points at whole-project-qc.
- **`references/quality-bar.md`** — added the depth-bar rule (no thin stubs; ground,
  don't template; spot-check 3), cross-linked to whole-project-qc §6.

Whole skill re-graded to ≥95 (CONTEXT D19).

---

## [0.25.0] — 2026-07-01 — test-doc standardization: scaffold + enforce (from ERP-02-vs-Senti audit) (US-5.6, FR-31) — v0.25.0

A second real deployment (Koni-ERP-02) adopted the koni-qc test-doc standard but
**drifted from Senti-Quant**, the reference repo the standard was synthesized from. An
author-blind audit of both `docs/tests/` trees found 10 deviations; the root cause was
uniform — the skills *stated* the standard in prose but nothing scaffolded the shape or
rejected the drift. This release feeds the learnings back into the three skills that
*generate* the structure so a future run produces it automatically. Opens FR-31 under
EPIC-5; CONTEXT D22.

### Changed — `skills/koni-qc/`

- **`references/test-organization.md`** — added `docs/tests/STRATEGY.md` as the
  whole-repo strategy home (`test-plan/` now strictly per-epic); made the report path a
  **MUST** with the `EPIC-NN`/`MMDDYYYY` rationale (flat `<date>/` and ISO forbidden);
  made the `<app>/tests/epic/` migration a real adoption **step** (flat layout
  non-conformant); the self-scaffold + koni-setup now create **both** trees; added a
  TC-ID reservation rule (spec is the sole authority — the ERP F-12 collision).
- **`references/test-automation.md`** — §2 reporter: report-path validator regex,
  off-tree-suite conformance flag, orphan-ID/collision detection, `PROPOSED:` handled as
  `not-written`; §4 CI: a **non-GitHub-Actions / Dockerfile branch** so container-built
  repos (like ERP) get a blessed gate.
- **`references/traceability.md`** — blessed `PROPOSED:<path>::name` as the third
  `Covered-by` state (planned automation, counts *uncovered*); documented the three
  fixed forms + the "spec owns the TC-ID" rule.

### Changed — `skills/koni-setup/`

- **`references/scaffold-checklist.md`** + **`SKILL.md`** — bootstrap now scaffolds the
  `<app>/tests/epic/` **code** root and `docs/tests/STRATEGY.md` (+ `test-cases/README`),
  not just the doc tree; `test-plan/` relabelled per-epic; `APP` var for monorepos.
- **`references/onboarding-audit.md`** — added test-doc drift checks (flat report path,
  flat test layout, strategy home, `Covered-by` vocabulary) to catch the ERP patterns.

### Changed — `skills/koni-docs/`

- **`references/templates/test-report.md`** (+ `SKILL.md`, `references/sprint-system.md`,
  `references/templates.md`, `references/templates/test-cases.md`) — reconciled the
  legacy `test-reports/runs/YYYY-MM-DD-EPIC-N-runN.md` path to the unified
  `test-reports/EPIC-NN/<MMDDYYYY>/report.md` layout (koni-qc owns the *path*, koni-docs
  owns the *body*). The pervasive `Docs/`→`docs/` casing is logged as a separate
  follow-up (out of scope).

All three changed skills re-graded whole to ≥95 (CONTEXT D19).

---

## [0.24.0] — 2026-07-01 — koni-qc automation spine: generate → report → sync → CI (US-5.5, FR-30) — v0.24.0

Closes the gaps a **real koni-qc deployment on koni-erp-02** exposed: the agent could
author specs + run a coverage audit but **could not automate the test workflow** —
every TC `— (manual)`, no `tests/epic/` tree, `test-reports/` empty, zero story
write-back, no CI. koni-qc was complete on *authoring* yet delegated running/gating to
tooling it named but never defined ("gstack `qa`", "a repo `/run-test`"). This release
ships the missing spine. Opens FR-30 under EPIC-5; CONTEXT D21.

### Added — `skills/koni-qc/`

- **`references/test-automation.md`** — the **automation spine** (generate → report →
  sync → CI): §1 **Generate** (spec → runnable TC-ID-named test + materialise
  `tests/epic/EPIC-NN/`, write `Covered-by` back), §2 the **reporter contract** (runner
  JSON — `vitest run --reporter=json` / `jest --json` / `pytest --json-report` /
  `playwright --reporter=json` — parse the leading TC-ID token → `report.md`), §3
  **story write-back** (Status + coverage% + link), §4 **CI gate + runner bootstrap**
  (`test:cov` at ≥80% + `.github/workflows/test.yml` + `gates.conf` rows). Ends the
  "specs written, nothing runs" stall.

### Changed — `skills/koni-qc/`

- **`references/qc-workflow.md`** — added a **§3b Generate** stage (spec → runnable test,
  before Execute); rewrote §4 Execute to run code tests via the runner + reporter
  contract (gstack `/design-review` scoped to UI); added "a CI test gate exists" as a
  §5 Release exit criterion; added Generation/Execution/CI-gate rows to entry/exit.
- **`references/test-organization.md`** — §3 sync: "Spec → code" is now a generation
  step and "Code → story" is automated by the reporter contract; removed the phantom
  "automated by gstack `qa` or a repo `/run-test`" assertion.
- **`references/unit-coverage.md`** — the coverage/CI bootstrap now points at
  test-automation.md §4 (`test:cov` + CI workflow + `passthrough` gate rows).
- **`SKILL.md`** — added an "Automate the test loop" mode + activation + reference-index
  rows; added the automation trigger to the description (re-tightened to 734 chars,
  under the 1024 frontmatter limit).

Whole-skill re-graded to ≥95 (CONTEXT D19).

---

## [0.23.0] — 2026-06-30 — per-function unit-test process + Self-verify gate (US-5.4, FR-29) — v0.23.0

Adds the missing **unit layer**: the loop had a TDD *discipline* line + a "tests
green" Self-verify, but no per-function unit-test process and no unit-coverage gate
(a logic change with zero unit tests passed if the build was green). Now Execute
drives per-function TDD and Self-verify gates unit coverage — the layer *below*
koni-qc's per-US AC↔TC matrix. Opens FR-29 under EPIC-5; CONTEXT D20.

### Added — `skills/koni-qc/`

- **`references/unit-coverage.md`** — the unit-coverage standard: the two-layer
  model (unit per-function vs AC↔TC per-US), the **per-function rule** (happy +
  each branch + boundary + error path), RED→GREEN→REFACTOR, the **coverage gate**
  (new/changed logic has unit tests; default ≥80% line-and-branch on changed code),
  and the exemptions. koni-qc owns the standard + gate; **Dev authors**; the repo's
  runner executes.
- **SKILL.md** activation + reference-index + description trigger; `test-organization.md`
  `*.unit.test.ts` row reframed "Dev owns; QA skips" → **"Dev authors; koni-qc gates
  unit coverage"**.

### Changed — `skills/koni-harness/`

- **Execute** now does per-function TDD (agentic-loop-standard §Execute note +
  loop-runner execute row + example-loop).
- **Self-verify** is a real gate — new/changed functions must have unit tests
  meeting the bar (stage-table entry gate + loop-runner self-verify row +
  example-loop); "build green" alone no longer passes.
- **gate-catalog.md** documents a `unit-coverage` `passthrough` row (repo coverage
  command with a threshold, warn→block) as the deterministic backing.

### Verification (CONTEXT D19 whole-skill re-grade)

- Both koni-qc and koni-harness re-graded whole after the change; both remain ≥95.

### Docs

- VERSION 0.22.0 → 0.23.0; CONTEXT D20; US-5.4 story; PRD FR-29 + EPIC-5 row; this
  entry. validate green.

---

## [0.22.0] — 2026-06-30 — ≥95 skill-grading is the catalog standard, enforced at Review — v0.22.0

Makes **≥95/100 the hard pass bar** for any skill reviewed by koni-qc skill-grading,
and bakes in the whole-skill re-grade rule that the 97→91→97 koni-qc regression
taught. Refines FR-21 (harness Review) + FR-27 (skill-grading); CONTEXT D19.

### Changed — `skills/koni-qc/`

- **`references/skill-grading.md`** — the bar is now **"≥95/100, non-negotiable for
  every skill"** (was "≥90 ship; ≥95 foundational"); a skill <95 does not pass.
  Added the **re-grade-the-whole-skill-not-just-the-diff** rule and made the
  scorecard PASS condition explicitly `≥95`.
- **`SKILL.md`** — the "Grade a skill" mode states the ≥95 catalog standard + the
  whole-skill re-grade.

### Changed — `skills/koni-harness/`

- The **Review stage** now states skill-grading **must clear ≥95 to pass**
  (`agentic-loop-standard.md` tool-split note, `loop-runner.md` review drive row,
  `SKILL.md` Review row) — a skill deliverable doesn't pass Review below 95.

### Decision (CONTEXT D19) + lesson

- ≥95 is the Koniverse catalog standard; re-grade the whole skill (all 4
  dimensions) after any change, never infer "still ≥95" from a passing review of the
  diff alone. LESSONS §8 updated with the 97→91→97 regression-and-recovery.

### Docs

- VERSION 0.21.1 → 0.22.0; CONTEXT D19; LESSONS §8 addendum; this entry. validate green.

---

## [0.21.1] — 2026-06-30 — koni-qc: re-grade fixes back to ≥95 after the by-US change — v0.21.1

A **full 4-dimension re-grade** of koni-qc (not just the change-review) found it had
slipped to **~91/100** after the v0.18–0.21 additions (skill-grading + test-organization
+ by-US): the "boundary-or-edge" doctrine hadn't propagated to all files, a trigger
gap routed "where do tests live?" to the wrong skill, and two scoring lines read as
fake-precise formulas. Fixed back to **97.25/100** (D1 25 · D2 24 · D3 24 · D4 24.25).

### Fixed — `skills/koni-qc/`

- **Completeness-rule drift**: `test-design.md` + `qc-workflow.md` said "≥1 boundary";
  reconciled to the canonical **"≥1 boundary-or-edge"** (matches `traceability.md` +
  the pilot, which fills the third slot with EDGE cases).
- **`edge-coverage.md` mis-slotting**: EDGE cases (concurrency / network-failure /
  state-race) were filed under the *negative* slot and network-failure was typed
  `FUNC/E2E`; now EDGE fills the **boundary-or-edge** slot and maps to the **`EDGE`**
  TYPE.
- **Triggering gap (D1)**: koni-qc's description now triggers on "where test files /
  specs / reports live" and "how to organize tests" — `test-organization` queries no
  longer mis-route to koni-harness.
- **Degrees-of-freedom (D4)**: the per-dimension `/25` scoring lines in
  `skill-grading.md` are reframed as **heuristics** ("use judgment — there's no
  validator"), not fake formulas. SKILL.md §2 now states epic = container, US = unit.

### Docs

- VERSION 0.21.0 → 0.21.1; this entry. validate green. Re-grade dogfooded via
  koni-qc skill-grading (4 dimensions, D4 ×2 variance-averaged).

---

## [0.21.0] — 2026-06-30 — koni-qc: coverage organized by user story, not epic — v0.21.0

Re-checking Senti-Quant's matured QA practice (the by-US `QC-PLAN-BY-US`) showed
the epic is too coarse for *coverage* — "epic tested" hides untested stories.
Shifts koni-qc's granularity: the **unit of coverage, traceability, and QC
planning is the user story (US)**; the epic stays the file container. Refines
FR-26/FR-28; CONTEXT D18; no file moves, no TC-ID change.

### Changed — `skills/koni-qc/`

- **`references/test-organization.md`** — new **§0 "Granularity: the unit is the
  user story, not the epic"**: coverage % = done-stories-with-a-TC ÷ done-stories;
  the QC backlog is a per-US, risk-tiered list (`audits/QC-PLAN-BY-US-<date>.md`);
  epic is the *container*, US the *unit*. §3 sync rule now requires
  `maps_to {us, fr, ac}` (the `us` is mandatory — it makes per-US coverage computable).
- **`references/traceability.md`** — the AC↔TC matrix is explicitly anchored per US;
  mandatory `maps_to.us`; coverage % computed per US.
- **`references/qc-workflow.md`** — Frame picks the **US** as the unit and builds a
  per-US risk-tiered coverage plan (not "epic by epic").
- **`references/quality-bar.md`** — the Coverage % item is reported per US.

### Unchanged (deliberately)

- Spec files stay `test-cases/EPIC-NN.md`, code `…/epic/EPIC-NN/`, reports
  `test-reports/EPIC-NN/<date>/`. **TC-ID stays TYPE-based** (`TC-<EPIC>.<TYPE>-<n>`)
  — the epic prefix is an ID namespace, not the coverage unit.

### Docs

- VERSION 0.20.1 → 0.21.0; CONTEXT D18; US-5.3 refinement note; this entry. validate green.

---

## [0.20.1] — 2026-06-30 — koni-setup graded-hardening to ≥95/100 — v0.20.1

Graded koni-setup with koni-qc skill-grading (the dogfood) — it scored **84.5/100**,
below the foundational ≥95 bar, surfacing a real correctness bug. Fixed to
**96.25/100**.

### Fixed — `skills/koni-setup/`

- **CRITICAL (correctness): the bootstrap doc-stub loop is now zsh-safe.** It used
  `for f in $unquoted_var`, which **zsh does not word-split** (SH_WORD_SPLIT off by
  default) → under the default macOS shell it created one mis-named file and **zero**
  doc stubs. Rewritten to iterate **literal word lists** (split by the parser in
  every shell) via a `stub_doc` helper. Verified under zsh: 7 stubs created.
- **zsh no-match glob**: the `bmad-*` audit used a bare `ls .claude/skills/bmad-*`
  (zsh errors on no-match — exactly the "0 bmad skills" case the audit detects).
  Replaced with `find … -name 'bmad-*'` in the verify blocks **and** the two prose
  snippets that had it.
- **docs/tests tree drift**: SKILL.md's inline tree + `onboarding-audit.md` still
  showed the legacy `test-reports/{runs,releases}`; reconciled to the koni-qc
  test-organization standard (test-plan/test-cases/bug-bash/audits + EPIC-NN/<date>
  on first run); dropped the false "mirrors koni-docs §0 exactly" claim. koni-qc
  `test-organization.md` now states the report-layout ownership vs koni-docs
  (legacy `runs/releases` superseded; koni-docs body templates reconcile as a
  tracked follow-up).

### Changed (best-practices)

- Description rewritten **triggers-only** (was enumerating deliverables + ownership);
  Contents TOCs added to the three >100-line references (scaffold-checklist,
  skill-inventory, skill-wiring); onboard quick-audit now checks the full core trio
  + the `.koni-harness` gate.

### Docs

- VERSION 0.20.0 → 0.20.1; LESSONS §9 (the zsh word-split gotcha); US-3.2 note; this
  entry. validate green.

---

## [0.20.0] — 2026-06-30 — koni-setup installs the Koniverse core trio + the harness gate at setup — v0.20.0

Refines FR-20 (koni-setup): the **baseline a new repo gets is now the Koniverse
core trio — koni-docs + koni-harness + koni-qc — all wired in, plus the
koni-harness commit/release gate vendored** (`install-gate.sh` → `.koni-harness/`
+ git hooks). Previously only koni-docs was baseline. No new story (refinement of
FR-20 per CONTEXT D14); decision logged as CONTEXT D17. Built via the koni-harness
loop; deliverable is a skill, so Review used koni-qc skill-grading.

### Changed — `skills/koni-setup/`

- **`SKILL.md`** — description + bootstrap step 5 ("Install the skill set") now
  wire the trio and run `install-gate.sh` after the docs tree + VERSION exist;
  the Verify + Onboard/Audit + gap-report surfaces check all three + the
  `.koni-harness/` gate.
- **`references/skill-inventory.md`** — "Baseline — every repo" is now the core
  trio (was koni-docs only); install-order + audit blocks updated.
- **`references/skill-wiring.md`** — the central-symlink command loops the trio and
  runs `install-gate.sh`; the dangling-link repair re-points all three.

### Docs

- VERSION 0.19.0 → 0.20.0; CONTEXT D17; US-3.2 post-ship-refinement note; this
  entry. validate green; harness suites 113/113 (no script change).

---

## [0.19.0] — 2026-06-30 — test-organization: standard docs/tests layout + scaffolding (US-5.3, FR-28) — v0.19.0

Folds the matured Senti-Quant test-doc organization (2026-06-30 reorg) into the
catalog as a koni-qc standard, and wires it into setup so every Koniverse repo
gets the right test folders. Opens FR-28 under EPIC-5; CONTEXT D16.

### Added — `skills/koni-qc/`

- **`references/test-organization.md`** — the standing standard: the `docs/tests/`
  taxonomy (`test-plan/` · `test-cases/` · `test-reports/EPIC-NN/<MMDDYYYY>/` with
  report.md+img / report-manual.md+img-manual · `bug-bash/` · `audits/` + standing
  README / test-organization / findings), the **by-epic + file-suffix** test-code
  layout (`.e2e`/`.smoke`/`.integration`/`.unit`), the **3-place sync rule** (spec ↔
  code ↔ coverage story), the state-cleanup/idempotency rule, the status legend, and
  the scaffolding rule.
- **SKILL.md** — "Set up / standardize test docs" mode + activation row + reference
  index row + a koni-setup delegate row.

### Changed — `skills/koni-setup/`

- `scaffold-checklist.md` now creates the standard `docs/tests/` tree (`test-plan/` /
  `test-cases/` / `bug-bash/` / `audits/` + README / test-organization.md / findings.md
  stubs; `test-reports/EPIC-NN/<MMDDYYYY>/` created on first run, not pre-made) and
  points at the koni-qc standard — replacing the older `test-reports/{runs,releases}`.

### Decisions (CONTEXT D16)

- **TC-ID stays TYPE-based** (`TC-<EPIC>.<TYPE>-<n>`) — *not* Senti-Quant's
  GROUP-based codes; the file suffix carries run cadence (orthogonal to TC TYPE),
  so the two coexist. `traceability.md` is unchanged.
- **Scaffolding**: koni-setup creates the tree when used; koni-qc self-scaffolds it
  otherwise. koni-docs still owns the doc-body templates.

### Docs

- VERSION 0.18.0 → 0.19.0; PRD FR-28 + EPIC-5 story row; US-5.3 story; this entry.
  validate green.

---

## [0.18.0] — 2026-06-30 — skill-grading: QC for skill artifacts, wired into the build/verify loop (US-5.2, FR-27) — v0.18.0

Turns the v0.17.2 multi-skill grading method (which lived only in a transcript +
LESSONS §8) into a **reusable capability**, so the harness can build *and verify
the building of* future skills the same way it just graded koni-harness (96/100)
and koni-qc (97/100). Opens FR-27 under EPIC-5; compose-first per CONTEXT D15.

### Added — `skills/koni-qc/`

- **`references/skill-grading.md`** — QC for a *skill artifact* (not a product
  feature): a four-dimension rubric (D1 triggering · D2 rule-robustness under
  pressure · D3 author-blind content · D4 best-practices), each scored /25 → /100,
  to a hard bar (≥90 ship, ≥95 foundational). Documents the delegated engine per
  dimension and the non-negotiable method — one independent agent per dimension,
  re-verify every fix round, average the subjective axis (≥2×), stop on
  Suggestions-only. The skill-artifact analog of `quality-bar.md`.
- **SKILL.md** — a new **"Grade a skill (skill-QC)"** mode, an activation row, a
  delegates row (skill-creator · writing-skills · `superpowers:code-reviewer`), a
  reference-index row, and a description trigger.

### Changed — `skills/koni-harness/`

- Review stage now runs **koni-qc skill-grading** (not the product AC↔TC gate)
  when the deliverable is a skill — stated in the standard's tool-split note, the
  `loop-runner.md` review drive row, and `SKILL.md`. This is how the harness
  verifies new skills it builds.

### Composition (not duplication)

skill-grading **delegates** every eval to the tool that owns it — `skill-creator`
(triggering), `writing-skills` (pressure-tests + the Anthropic best-practices doc),
`superpowers:code-reviewer` (author-blind content) — and contributes only the
rubric + the multi-dimension method. Same boundary koni-qc keeps everywhere.

### Docs

- VERSION 0.17.2 → 0.18.0; PRD FR-27 + EPIC-5 story row; US-5.2 story; this entry.
  validate green; harness suites 113/113.

---

## [0.17.2] — 2026-06-28 — koni-harness & koni-qc: graded hardening to ≥95/100 — v0.17.2

Acted on a multi-skill grading pass (skill-creator triggering eval · writing-skills
pressure-tests · author-blind code-review · Anthropic best-practices rubric).
Fixes every blocking/medium finding on both skills and lifts each to ≥95/100.
Refines FR-21 + FR-26; no new story.

### Changed — `skills/koni-harness/`

- **install-gate.sh** now `cd`s to the repo toplevel before vendoring, so running
  it from a subdirectory installs at the root (was: split `.koni-harness/` vs
  hook path → every commit failed). New regression test in `gate-test.sh`.
- **loop.sh** `--tier` now rejects a missing/flag value instead of swallowing the
  next flag.
- **Docs corrected**: `settings.json` is a **manual** merge (the installer never
  edits it); the additive invariant clarifies vendored files are refreshed in
  place; credential-allowlist substring foot-gun and custom-check relative-path
  foot-gun documented in `gate-catalog.md`; stale `sprint.sh` "none ready"
  message and stale "Superpowers executes" intro fixed.
- **CSO + structure**: description rewritten to triggers-only (no owns/delegates
  summary); SKILL.md ownership de-duplicated; TOCs added to the 3 long
  references; new worked end-to-end example `references/example-loop.md`.

### Changed — `skills/koni-qc/`

- **AC↔TC rule made airtight**: the completeness rule is now "≥1 positive AND
  ≥1 negative AND ≥1 **boundary-or-edge**", with an explicit **no-double-counting**
  clause; the ≥50% Band-A gate is defined as off-path = NEG+BND+EDGE everywhere.
- **Pilot complies strictly**: added `TC-CN.NEG-6` so AC-2 has an independent
  negative (was double-counting BND); 25 cases, 13 off-path (52%); standardized
  `Covered-by` to `.spec.ts::`; matrix notes the EDGE-for-boundary cases as
  rule-sanctioned.
- **Vocabulary unified**: priority is Critical/High/Medium/Low everywhere
  (removed residual P0..P3 in `quality-bar.md`/`qc-workflow.md`); canonical-table
  demo rows use placeholder IDs (`TC-XX.*`) + consistent SLA; phantom *Notes*
  column reference removed; "above 50%" → "at or above".
- **Gaps closed**: a "derive ACs from FRs when none are written" step in Frame;
  CSO description rewrite (triggers-only); TOCs on the 5 long references; the
  SKILL.md quality-bar narration trimmed to a pointer.

### Graded result (multi-skill grading, 3 review rounds + variance-averaged rubric)

- **koni-harness 96/100**, **koni-qc 97/100** — both ≥95. Per dimension (/25):
  triggering 25/25 both (blind-router 17/17, perfect precision+recall);
  hard-rule-under-pressure 24 both (3/3 GREEN); author-blind review 24 both
  ("ship-ready", no Critical/Important findings left); best-practices rubric 23
  (harness) / 24 (qc), stable across two independent passes.

### Docs

- VERSION 0.17.1 → 0.17.2; this entry. validate green; harness suites 113/113.

---

## [0.17.1] — 2026-06-28 — koni-harness: fixed review order + TDD-as-discipline — v0.17.1

Follow-up to v0.17.0 — pins the Review-stage order and clarifies TDD's place in
Execute. Refines FR-21; no new story.

### Changed — `skills/koni-harness/`

- **Review runs in a fixed order**: (1) spec-compliance subagent → (2) **koni-qc**
  (AC↔TC coverage gate) → (3) gstack `/design-review` for UI → (4) code-quality
  subagent. So the only thing *before* koni-qc is the spec-compliance pass.
  (Standard six-stage table + tool-split note; `loop-runner.md` review drive row.)
- **TDD stays the discipline in Execute** (write the failing test first), but TDD
  is the *practice* — the implementation **tool** is an Anthropic Skill, never the
  Superpowers TDD skill. (Standard tool-split note; `loop-runner.md` execute row.)

### Docs

- VERSION 0.17.0 → 0.17.1; this entry. validate green.

---

## [0.17.0] — 2026-06-28 — koni-harness × koni-qc tool-integration refinements — v0.17.0

Refines the koni-harness loop's tool mapping and wires koni-qc + gstack
`/design-review` into the loop's review stage. Enhances FR-21 (koni-harness) and
FR-26 (koni-qc); no new FR/story (a refinement of shipped skills, per CONTEXT
D14 — a story is a deliverable, not every edit).

### Changed — `skills/koni-harness/`

- **Implement = Anthropic Skills only; Superpowers/gstack = brainstorm/review.**
  New hard rule in the Standard (six-stage table note + new engineering
  principle #7), `loop-runner.md` (execute/review drive rows), and `SKILL.md`
  (description + owns/delegates table): the **Execute** stage uses Anthropic
  Skills only (`frontend-design` for UI); Superpowers and gstack are
  brainstorm/plan tools and **never write feature code**.
- **Review stage gains `/design-review` + koni-qc.** Review now runs gstack
  `/design-review` (UI must track the repo's `DESIGN.md`) and **koni-qc** (the
  AC↔TC test-coverage gate) on top of code review.

### Changed — `skills/koni-qc/`

- **`/design-review` for UI verification.** `SKILL.md` (delegates + modes +
  activation), `qc-workflow.md` §Execute, and `nfr.md` (new "UI / visual
  conformance to DESIGN.md" section) now delegate UI checks to gstack
  `/design-review` against the repo's `DESIGN.md`; koni-qc never eyeballs pixels
  itself.
- **`UI` test type added** to the `traceability.md` TC-ID scheme
  (`TC-<EPIC>.UI-<n>`) for visual-conformance cases.

### Docs

- VERSION 0.16.0 → 0.17.0; this entry. validate green.

---

## [0.16.0] — 2026-06-28 — koni-qc: QC methodology & coverage-intelligence skill (EPIC-5) — v0.16.0

The catalog's quality-control capability. `koni-qc` turns koni-docs-standard
inputs into Silicon-Valley-grade, fully-traceable test documentation and drives
QC execution — covering every case and edge case. Compose-first: it contributes
the methodology nothing else has and delegates the rest. Opens EPIC-5, closes
FR-26. **Built by dogfooding the koni-harness loop** (US-5.1 tracked via
`loop.sh`; the harness review gate even caught the pilot failing koni-qc's own
AC↔TC-completeness rule — fixed before ship).

### Added — `skills/koni-qc/`

- **SKILL.md** — orchestrator with 3 modes (author test-cases / run QC execution /
  release gate), an owns-vs-delegates table (methodology = koni-qc; templates =
  koni-docs; execution = gstack; gate/loop = koni-harness), and an activation
  table. Composes; never reproduces.
- **6 methodology references** — `test-design.md` (partitioning/BVA/decision-
  tables/state-transition/pairwise/error-guessing), `edge-coverage.md` (a 10-class
  edge taxonomy), `traceability.md` (TC-ID scheme + the canonical 12-column rich-TC
  table + the **mandatory AC↔TC coverage matrix** — the artifact neither corpus
  had — + risk priority + `RC-` regression tagging), `nfr.md` (security-led:
  security/perf-SLA/a11y/i18n/reliability/compatibility/observability),
  `qc-workflow.md` (the 5-stage lifecycle naming each delegate), `quality-bar.md`
  (a 3-band rubric: beat the backup / match Koni-Finance / close its gaps).
- **Pilot** — `references/customize-network-test-cases.example.md`: a worked
  test-cases doc for a real feature (24 typed cases, a complete AC↔TC matrix with
  positive+negative+boundary for every AC, injection/SSRF/concurrency/
  network-failure/atomic-save edge cases, perf SLA + a11y), with a before/after
  delta vs the 58-case ~70%-happy-path manual backup and a self-grade = PASS.

### Validation

Synthesized two surveyed corpora — `koni-docs.backup` (weak manual baseline, 12
gaps) and `Koni-Finance` (production standard: rich per-TC table + dedicated
security). Target: **better than both**. Author-blind review APPROVED after one
round of fixes (the pilot's AC↔TC matrix is now complete — no phantom TCs, every
AC has positive+negative+boundary; TYPE scheme + priority/status vocab reconciled
to the Koni-Finance standard; `RC-` regression tag applied). Compose-not-duplicate
verified: koni-qc references koni-docs/gstack/koni-harness by name and reproduces
none of them.

### Docs

- EPIC-5 + US-5.1 opened; PRD FR-26 + Epics index; sprint-2026-W26 gains US-5.1;
  spec + plan under `docs/superpowers/`.

---

## [0.15.2] — 2026-06-28 — LESSONS §7: a story is a deliverable, not a release — v0.15.2

Captures the lesson behind the v0.15.1 story consolidation as a reusable trap +
pattern. **LESSONS §7** ("A story is a deliverable, not a release — don't open
one story per version"): why the koni-harness build sprawled into five
phase-stories (one per shipped version), how to avoid it (one story per
deliverable, append a per-phase AC + `version→commit` row at each ship), and how
to fix it after the fact append-only-safely. Complements LESSONS §6 and pairs
with the [CONTEXT D14](CONTEXT.md) decision.

---

## [0.15.1] — 2026-06-28 — docs: consolidate the 5 koni-harness phase-stories into one — v0.15.1

Story-tracker hygiene (no code change). The koni-harness skill had been tracked
as five separate stories (US-3.3 P1 · US-3.4 P2 · US-3.5 P3a · US-3.6 P2.5 ·
US-3.7 P3b) — one per ship increment of a single skill — which inflated the
EPIC-3 story count. Per [CONTEXT D14](CONTEXT.md), phase-built work is now tracked
as **one story** with per-phase sub-sections.

### Changed

- **US-3.4..US-3.7 merged into US-3.3** — the consolidated koni-harness story
  (16 pts, covers FR-21..FR-25, shipped across v0.10.0–v0.14.0) now carries a
  version→commit table + AC grouped by phase. The four phase-story files were
  removed. EPIC-3, the PRD Epics index, and sprint-2026-W26 collapsed the five
  rows to one (sprint now **3 stories / 24 pts**, same point total).
- **CONTEXT D14** records the convention to prevent re-fragmentation.

This is append-only-safe: the per-phase v0.10.0–v0.14.0 CHANGELOG entries above
are untouched — they remain the increment-level release history. Only the live
story tracker was consolidated. `koni-setup` (US-3.2) and the plugin pattern +
`koni-nextjs` (US-3.1) stay separate (distinct skills, not phases).

---

## [0.15.0] — 2026-06-28 — Plugin-skill pattern + koni-nextjs reference (EPIC-3 plugin pillar) — v0.15.0

Closes **FR-9** and the last open EPIC-3 pillar. koni-docs always *mentioned*
plugins but never defined or demonstrated the pattern; this ships both — the
contract and a worked example — so the catalog has a documented, repeatable way
to extend koni-docs per tech stack.

### Added

- **`skills/koni-docs/references/plugin-pattern.md`** — the plugin-skill pattern:
  what a plugin is, where it lives (`skills/koni-<tech>/`, self-contained AD-1),
  discovery (a project declares `plugins: [<tech>]` under its CLAUDE.md
  `koni-docs:` block), the composition contract (extend-never-duplicate the 12
  core rules; namespaced rules `NX-`/`SB-`; may reference the koni-harness gate
  rather than build its own), and an authoring checklist.
- **`skills/koni-nextjs/`** — the reference plugin (Next.js rules extending
  koni-docs, namespace `NX-`): **NX-1** ship gate runs `next build`, not just
  `tsc --noEmit` (the documented koni-docs LESSON), wired as a koni-harness
  `gates.conf` `passthrough` row at `pre-push`; **NX-2** only `NEXT_PUBLIC_*`
  reaches the client, no secret in a client component (composes with the gate's
  `credential-scan` + RULE-11); **NX-3** App Router server-components-by-default;
  **NX-4** env-var sync into `.env.example` (specializes RULE-11). Wired via
  mirrored `.claude` / `.agents` symlinks.

### Changed

- **koni-docs `SKILL.md`** — two additive one-line pointers (§2, §6) to
  `plugin-pattern.md`; no core-rule text changed, no renumbering.

### Validation

Docs-only (no scripts → no test suite). Author-blind review APPROVED: the pattern
doc is complete and coherent, koni-nextjs follows it and **does not duplicate any
of the 12 core rules** (grep-verified — every `RULE-n` is a reference), the
discovery key + NX-1 gate row are accurate against the real koni-docs SKILL.md
and koni-harness gate-catalog. One follow-up fix applied: the literal discovery
key is the nested `plugins:` under `koni-docs:` (`koni-docs-plugins` is prose
shorthand only).

### Docs

- US-3.1 flipped to done; PRD FR-9 → shipped; EPIC-3 fully delivered for its
  shipped pillars; sprint-2026-W26 (now 7 stories / 24 pts).

---

## [0.14.0] — 2026-06-28 — koni-harness P3b: multi-tool session adapters (roadmap complete) — v0.14.0

P3b — the final koni-harness roadmap piece. P3a produces a context digest, P2.5
picks the next story; P3b wires them into a tool's session start so a fresh
session is briefed automatically. Closes FR-25. With this, the harness roadmap
is complete: **gate (P1) + loop-runner (P2) + context-loader (P3a) +
sprint-sequencer (P2.5) + session adapters (P3b)**.

### Added — `skills/koni-harness/`

- **`scripts/session-start.sh`** — a dependency-free, **read-only** POSIX
  briefing that composes `context-load.sh` (the digest) with `sprint.sh next`
  (a `## Next` section) into one command. Resolves the sub-scripts from its own
  dir then `.koni-harness/`; **space-safe** flag forwarding (positional `set --`
  + quoted pass-through); graceful per-section notes; flags `--root`/`--docs`
  (both) + `--sprint` (sprint only).
- **`references/session-adapters.md`** — per-tool session-start wiring, all
  calling the same vendored `session-start.sh`: a Claude Code `SessionStart` hook
  as a **valid, manual-merge** `settings.json` snippet (never auto-written), and
  Gemini / Codex / Cursor equivalents or a manual one-liner.
- **`SKILL.md`** — a "Brief a new session" pointer.
- **Installer** — `install-gate.sh` now additively vendors `session-start.sh`
  alongside the gate / `loop.sh` / `context-load.sh` / `sprint.sh`.

### Fixed

- **`sprint.sh deps_of()` phantom `--` dependency** (latent since P2.5, surfaced
  by P3b fixtures): a story with inline `depends_on: []`, or a multiline list
  terminated directly by the closing `---`, was wrongly reported blocked-by `--`
  (and excluded from `next`). The `deps_of` awk now enters collection only on an
  empty `depends_on:` value and ends the block on YAML doc markers (`---`/`...`).
  Real koni-docs stories (which carry keys after `depends_on`) never triggered
  it, but a freshly `koni-setup`-bootstrapped story could.

### Validation

12-assertion `session-test.sh` incl. a space-path fixture (green under `sh` and
`dash`); the other four suites green (sprint now 18 with the two new `deps_of`
cases; context 15, loop 31, gate 34). Combined spec + code-quality review
APPROVED after two blocking fixes (space-safe forwarding, `deps_of`); briefing
validated against this repo and the Claude `SessionStart` JSON snippet parses.

### Docs

- US-3.7 story + EPIC-3 (FR-25) + sprint-2026-W26 (now 6 stories / 21 pts);
  spec + plan under `docs/superpowers/`.

---

## [0.13.0] — 2026-06-27 — koni-harness P2.5: sprint-sequencer — v0.13.0

P2.5 of the koni-harness roadmap: dependency-ordered story selection at the
sprint level — the cross-story complement to the per-story loop-runner. The
loop-runner answers "run this story"; the sprint-sequencer answers "which story
next?". Closes FR-24. (The original Phase 2.5 "parallel fan-out" was dropped as
non-portable / YAGNI; this ships the portable, valuable core.)

### Added — `skills/koni-harness/`

- **`scripts/sprint.sh`** — a dependency-free, **read-only** POSIX helper over
  koni-docs story frontmatter. `sprint.sh next` lists the **ready** stories in the
  active sprint (not-`done` and every `depends_on` resolves to a `done` story),
  ordered by priority then id, and suggests `loop.sh start <id>`; it distinguishes
  a **complete** sprint from one where all remaining work is **blocked**.
  `sprint.sh status` reports counts by status, points done/total, and a blocked
  list naming each story's unmet dependency ids. Flags `--sprint` / `--docs` /
  `--root`; active sprint falls back to `CLAUDE.md active_sprint:`. Reads only;
  never writes (koni-docs owns status). Deterministic extraction (a `set -e`-safe
  `field()` pipeline + a `depends_on` awk that stops at the next top-level key);
  space-safe story iteration.
- **`references/sprint-sequencer.md`** — what it computes, usage, how it fits the
  loop, and limits.
- **`SKILL.md`** — a "Pick the next story" pointer.
- **Installer** — `install-gate.sh` now additively vendors `sprint.sh` alongside
  the gate / `loop.sh` / `context-load.sh`.

### Validation

13-assertion `sprint-test.sh` (green under `sh` and `dash`); the other three
suites (context 15, loop 31, gate 34) still green. Combined spec + code-quality
review APPROVED; three plan-vs-implementation bugs were caught and fixed during
build (test-fixture arity, and command-substitution stripping trailing newlines
in the `next`/`status` accumulators), plus space-safe iteration and
complete-vs-blocked wording. Validated against this repo.

### Docs

- US-3.6 story + EPIC-3 (FR-24) + sprint-2026-W26 (now 5 stories / 19 pts);
  spec + plan under `docs/superpowers/`.

---

## [0.12.0] — 2026-06-27 — koni-harness P3a: context-loader (session digest) — v0.12.0

P3a of the koni-harness roadmap: a portable context-loader that automates the
context-layer load the Standard documents. Phase 1 gave the loop a standard +
gate, Phase 2 a runner; P3a gives a session **a digest of where the project is**.
Closes FR-23.

### Added — `skills/koni-harness/`

- **`scripts/context-load.sh`** — a dependency-free, **read-only** POSIX script
  emitting a concise Markdown session digest to stdout: header (VERSION +
  `active_sprint` from the CLAUDE.md koni-docs block), **Live state** (the
  `.active-context.md` snapshot verbatim, with a CLAUDE.md Pattern-A fallback and
  a `_(no active-context snapshot)_` note for a fresh clone), a **Decisions**
  index (`D<n>` titles), a **Lessons** index (`<n>` titles), and **Canonical
  references**. Digest-not-dump: the big bodies are pointed to, never inlined;
  extraction is deterministic (grep/sed), not LLM-summarized. `--root` / `--docs`
  flags; graceful `_(... not found)_` notes for any missing layer (never crashes).
- **`references/context-load.md`** — what it emits, usage, graceful degradation,
  and the P3b wiring note.
- **`SKILL.md`** — a "Load session context" pointer.
- **Installer** — `install-gate.sh` now additively vendors `context-load.sh`
  alongside the gate + `loop.sh`.

### Validation

15-assertion `context-test.sh` (green under `sh` and `dash`); `loop-test.sh`
(31) + `gate-test.sh` (34) still green. Combined spec + code-quality review
APPROVED — read-only invariant (writes nothing), POSIX correctness, `set -e`
grep guards on empty indexes, `active_sprint` comment-strip, and marker-line
stripping all verified; the digest was validated against this very repo.

### Docs

- US-3.5 story + EPIC-3 (FR-23) + sprint-2026-W26 (now 4 stories / 16 pts);
  spec + plan under `docs/superpowers/`.

---

## [0.11.1] — 2026-06-27 — docs hygiene: resolve the last validate warning — v0.11.1

Moved `docs/sprints/sprint-2026-W19.md` out of `archive/` back to the
`docs/sprints/` root, matching the other closed sprints (W21, W22) which live
there. `koni-docs validate` resolves sprint references in the root only, so
US-1.1's `sprint: sprint-2026-W19` was the one lingering `(not_found)` warning;
`validate` is now fully green ("all references resolve"). No content change to
the sprint or the story — purely a relocation for consistency.

---

## [0.11.0] — 2026-06-27 — koni-harness Phase 2: single-story loop-runner — v0.11.0

Phase 2 of koni-harness adds the **runner**: a repeatable, tier-aware way to
drive one story through the six-stage Koni Agentic Loop. Phase 1 gave the loop a
*standard* and a *gate*; Phase 2 gives it a *spine* and a *brain*. Closes FR-22.

### Added — `skills/koni-harness/`

- **`scripts/loop.sh`** — a dependency-free POSIX loop-state helper, the loop's
  deterministic, tool-neutral spine. Five subcommands: `start <id> [--tier N]`,
  `status`, `enter <stage>`, `gate <phase>`, `complete` (+ a `--state <path>`
  override). State lives in the gitignored `.koni-harness/loop-state` as line
  `key=value`. `enter` warns (never hard-blocks) on a backward move or on
  committing at tier ≥ 1 without `self-verify`; `complete` is terminal and can't
  be clobbered. `gate` shells to the Phase-1 `gate-runner.sh` and passes its exit
  code through.
- **`references/loop-runner.md`** — the orchestration brain: the six-stage drive
  (with the exact `loop.sh` call per stage), tier-awareness (process stages scale
  to the tier; the gate runs at every tier), the portable fallback (Claude drives
  via Task/subagents, other tools run stages manually but call the same
  `loop.sh`), resumability (an interrupted loop resumes from `loop.sh status`),
  and the command reference.
- **`SKILL.md`** — a "Run a story through the loop" section + quickstart.
- **Installer** — `install-gate.sh` now additively vendors `loop.sh` and
  gitignores `.koni-harness/loop-state` behind a marker block (idempotent,
  newline-safe, non-clobbering).

### Validation

31-assertion `loop-test.sh` (green under `sh` and `dash`); Phase-1 `gate-test.sh`
still 34/0 (no regression). Two-stage review caught and fixed real issues before
ship: a `.gitignore` append that corrupted a file lacking a trailing newline, a
`kv_set` that broke on `|`/`&` in values (now delimiter-safe via
delete-then-append), unvalidated `--tier`, and — found by author-blind sandbox
verification — `enter` silently clobbering a completed loop (now `complete` is
terminal).

### Docs

- US-3.4 story + EPIC-3 (FR-22) + sprint-2026-W26 (now 3 stories / 13 pts);
  spec + Phase-2 plan under `docs/superpowers/`.

---

## [0.10.1] — 2026-06-27 — koni-harness: "Right-sizing the loop" tiers in the Standard — v0.10.1

Adds a **Right-sizing the loop** section to the Koni Agentic Loop standard
([`agentic-loop-standard.md`](../skills/koni-harness/references/agentic-loop-standard.md)):
a 3-tier model (0 trivial / 1 small / 2 substantial) for how much of the loop to
run, with the rule that **process steps scale to risk × size while the
deterministic gate is always on at every tier**. Codifies the answer to "do we
need the full SOP every time?" — no: right-size the judgment-heavy stages, never
skip the cheap gate. Enhancement to US-3.3 / FR-21; no behavior change to the gate.

---

## [0.10.0] — 2026-06-27 — koni-harness: Koni Agentic Loop standard + portable pre-commit gate (Phase 1) — v0.10.0

The second non-docs Koniverse skill, and the **connective tissue** of the
agentic loop. Koni already owned every loop *stage* (BMAD plan, Superpowers
execute, gstack review, koni-docs doc/version gate, koni-setup bootstrap) but
each repo wired them — and its verification gates — ad-hoc. `koni-harness`
standardizes the loop and ships a portable gate that catches agent mistakes
before they land. Reverse-engineered from `Koni-ERP-02`, `Senti-Quant`, and
`koni-devops`. Closes FR-21.

### Added — `skills/koni-harness/`

- **The Koni Agentic Loop standard** ([`references/agentic-loop-standard.md`](../skills/koni-harness/references/agentic-loop-standard.md))
  — tool-neutral: the six loop stages + the entry gate between each, the context
  layer load order (`AGENTS.md → CLAUDE.md → LESSONS → CONTEXT → .active-context`),
  the portability contract (portable core vs. thin tool adapter), and the
  harness-engineering principles. Composes the existing toolchain; reproduces
  none of it (see [CONTEXT D13](CONTEXT.md)).
- **Portable pre-commit gate** — a self-locating POSIX [`gate-runner.sh`](../skills/koni-harness/scripts/gate-runner.sh)
  reading a line-format `gates.conf` (no YAML/`yq` dependency), dispatching
  checks by *phase* (`work-commit` / `release-commit` / `pre-push`) and *severity*
  (`block` → non-zero exit, `warn` → never blocks). Six built-in checks, each
  judging the **staged** state: `version-phase` (2-phase versioning, generalized
  from Senti-Quant), `changelog-anchor`, `credential-scan` (PEM / AWS / quoted
  secrets, with a `.koni-harness/secret-allow` escape hatch), `koni-docs-validate`
  (skip-passes when koni-docs is unresolvable; never network-installs),
  `story-status-consistency`, `passthrough`.
- **Additive (non-destructive) installer** ([`install-gate.sh`](../skills/koni-harness/scripts/install-gate.sh))
  — vendors the runner + checks into the consumer repo's `.koni-harness/`, chains
  git `pre-commit`/`pre-push` behind reversible `# >>> koni-harness >>>` marker
  blocks **preserving any existing hook**, is idempotent, **skips a non-POSIX-shell
  hook with a manual-chain warning rather than corrupting it**, never overwrites an
  existing `gates.conf`, and is worktree/submodule-safe.
- **Adapters** ([`references/adapters.md`](../skills/koni-harness/references/adapters.md))
  — git hook, Claude Code `settings.json` (documented as a manual *merge*), and a
  Gemini/Codex/Cursor one-liner, all calling the same vendored runner.
- **Wiring**: installed into this repo at `.claude/skills/koni-harness` +
  `.agents/skills/koni-harness` (mirrors koni-docs / koni-setup).

### Validation

34-assertion self-contained POSIX test harness (green under `sh` and `dash`).
Two-stage review (spec compliance + code quality) caught and fixed real
correctness/portability holes before ship: a config line without a trailing
newline being silently dropped, a BRE dot over-matching the CHANGELOG version,
the installer corrupting a non-`sh` hook, a fragile npm-error-string match that
blocked instead of skip-passing on modern npm, and a non-POSIX `\b` in the
story-status pattern. Two author-blind sandbox verifications (bootstrap: four
gate scenarios + dry-run; adopt: A–E non-destructive guarantees incl. a
byte-intact foreign hook) both passed.

### Docs

- US-3.3 story + EPIC-3 (FR-21) + sprint-2026-W26 (2 stories / 10 pts);
  spec + Phase-1 plan under `docs/superpowers/`; CONTEXT D13.

---

## [0.9.0] — 2026-06-26 — koni-setup: first non-docs Koniverse skill (project bootstrapper & onboarder) — v0.9.0

Until now Koni-Skills shipped exactly one skill — `koni-docs`. EPIC-3 ("move
beyond koni-docs alone") opens here with `koni-setup`, the first **non-docs**
Koniverse skill and the catalog's proof that the repo is a multi-skill home.
It captures the previously-tribal "stand up a new Koni repo" procedure —
reverse-engineered from six live repos (`koni-devops`, `Koni-ERP-02`,
`koni-growth`, `koni-landing`, `koni-training`, `Senti-Quant`) — as a reusable,
profile-aware, idempotent skill. Closes FR-10, adds FR-20.

### Added — `skills/koni-setup/`

- **SKILL.md** — the day-0 orchestrator: `detect → (bootstrap | onboard/audit)
  → verify`. Two modes (new repo vs. existing repo), three repo profiles
  (**code / devops / content**, hybrid-aware). The defining constraint, and the
  reason it never conflicts with koni-docs, is that it **delegates all
  documentation-body templates to koni-docs** rather than duplicating them (see
  [CONTEXT D12](CONTEXT.md)).
- **references/repo-types.md** — common-core + per-profile expected file sets,
  each tied to the reference repo to copy the pattern from.
- **references/scaffold-checklist.md** — one profile-aware, re-runnable
  `create-tree` command that matches its own tree diagram, runs `git init`,
  seeds `VERSION` + CHANGELOG `[Unreleased]` anchor, and keeps empty leaf dirs
  in git with `.gitkeep`.
- **references/skill-inventory.md** — *which* AI skills to install and from
  *which* source/mechanism: the ~40-skill BMAD pack via `npx bmad-method
  install`, koni-docs wired per-repo, **gstack confirmed global (never
  per-repo)**, plus profile extras (shadcn for UI code, the Anthropic doc/design
  skills for content repos).
- **references/skill-wiring.md** — the `.claude` → `.agents` → shared
  `Koni-Skills/skills` symlink chain, dangling-link repair, and the `agile:*`
  npm scripts + `@koniverse/koni-docs` devDep block.
- **references/onboarding-audit.md** — present/missing audit matrix that an
  onboard run emits *before* writing, filling only gaps and never overwriting
  populated files (appending the integration block to an existing CLAUDE.md is
  explicitly allowed).
- **Wiring**: `koni-setup` is itself installed into this repo at
  `.claude/skills/koni-setup` + `.agents/skills/koni-setup` (mirrors koni-docs).

### Validation

Sandboxed sanity test — two independent subagents ran a bootstrap (new code
repo) and an onboard (existing content repo). They converged on a cluster of
real first-draft defects (scaffold command not matching its own tree, CHANGELOG
double-handling, empty-dir `.gitkeep`, onboard CLAUDE.md append-vs-overwrite,
missing `git init`, `active_sprint` default, doubly-specified version pin), all
fixed before ship. Captured as [LESSONS §6](LESSONS.md).

### Docs

- US-3.2 story + sprint-2026-W26 opened; EPIC-3 flips backlog → in-progress;
  PRD FR-10 marked shipped + FR-20 added; CLAUDE.md `active_sprint` → W26.

---

## [0.8.1] — 2026-05-29 — Viewer Mermaid diagrams: click-to-open fullscreen modal with zoom + pan — v0.8.1

Reading docs with Mermaid diagrams on a high-density screen was painful:
the rendered SVG honours its intrinsic size, but in an 800px column a
12-node flow diagram becomes unreadable, and there was no way to enlarge
it without zooming the whole browser viewport. This release adds a
focused fullscreen viewer that pops over the rest of the page.

### Added — fullscreen diagram modal

- **Click affordance on every rendered Mermaid diagram**
  ([`layouts/Layout.astro`](packages/koni-docs/src/viewer/layouts/Layout.astro)
  attaches a click handler in `attachMermaidExpand()` after each
  `mermaid.run()` pass). The `pre.mermaid` block picks up a
  `cursor-zoom-in`, a hover outline + tint, a top-right `⤢` glyph,
  `role="button"`, `tabindex="0"`, and keyboard-equivalent
  Enter / Space activation. Text-selection inside the SVG still works —
  the click handler bails when `window.getSelection().toString()` is
  non-empty.
- **Modal at the document root** with a separate clone of the SVG so the
  in-flow diagram stays untouched. The clone has its `width` / `height`
  attributes stripped + `width: 100%; height: 100%` to fit the stage.
- **Toolbar (top-right)**: zoom out (–), live "100%" zoom label,
  zoom in (+), reset, and a close button (separator + Esc-shortcut
  tooltip).
- **Backdrop** is `bg-background/92` + `backdrop-filter: blur(6px)` so
  the surrounding doc text fades but the modal stays anchored to the
  page context.
- **Hint strip** at the bottom: "Scroll to zoom · drag to pan · Esc to
  close".

### Added — interactions

- **Wheel zoom** centered on cursor (factor `1.1` per notch, clamped to
  `[0.2, 6]`). The wheel handler is `passive: false` so the page does
  not scroll behind the modal.
- **Drag-to-pan** with Pointer Events + `setPointerCapture` so the drag
  survives even if the cursor leaves the stage mid-drag. Cursor flips
  to `grabbing` while dragging.
- **Three close paths**: Esc key (only fires when `is-open` to avoid
  swallowing the key elsewhere), backdrop click (`ev.target === modal`),
  and the X button. Body scroll is locked via `overflow: hidden` while
  the modal is open and restored on close.
- **Toolbar buttons**: ± step 25%, Reset clears scale + translate back
  to identity.

### Implementation notes

- **No extra JS dependency.** The whole feature is ~120 lines of inline
  module script in `Layout.astro` and ~120 lines of CSS in `global.css`.
  Mermaid itself is still loaded from the jsdelivr ESM bundle once per
  page; the modal hooks live in the same `astro:page-load` listener
  that already drives `renderMermaid()` so they survive Astro view
  transitions.
- **Idempotent decoration.** `attachMermaidExpand()` and
  `setupMermaidModalControls()` each guard with a `dataset` flag
  (`expandBound`, `bound`) so repeated `astro:page-load` events (theme
  flip, SSE reload) don't pile up duplicate listeners.
- **No state collision with theme toggle.** `koni:theme` triggers a
  re-render of the underlying SVGs only; the modal itself caches no
  reference to the old SVG (it always reads from the live `pre.mermaid`
  at open time).

### Changed — `VERSION`, `package.json`, `KONI_DOCS_LIB_VERSION`, smoke test

- All bumped to `0.8.1`. Test suite still 121/121.

### Commit

[`23b3fa2`](https://github.com/Koniverse/Koni-Skills/commit/23b3fa2) — ship commit. This entry's SHA backfilled in a follow-up per the existing ship
pattern.

---

## [0.8.0] — 2026-05-29 — Viewer `/project` multi-view expansion: Board + Calendar + Analysis + Warning validator + URL `?view=` + footer/UNION/sort — v0.8.0

Pillar G of EPIC-4. Closes out the three disabled view tabs that have been
sitting in the `/project` toolbar since US-4.20 ported the Stories Tracker
from Koni-Finance-Final at v0.7.0, and replaces the misnamed "Warning"
filter with the actual required-field-by-status validator from
[koni-erp-02 `Docs/pod-project-screen.md`](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md).

Six stories ship together — **US-4.31 … US-4.36** — under a single minor
bump because each view shares the same data pipeline, sort comparator,
URL state machine, and footer; splitting them across patch releases
would have churned the same files four times without ever landing the
user-visible promise of "Board / Calendar / Analysis / Warning all work."

### Added — Board view (US-4.31)

- **Six kanban columns** matching `STORY_STATUS_ORDER` minus `reverted`
  and `deprecated`: `Backlog`, `Ready`, `In progress`, `In review`,
  `Blocked`, `Done`. Within a column, cards sort by `compareStories`
  (priority asc → updated desc → id asc).
- **Card content reads directly from frontmatter** — title (linked to
  `/docs/<slug>`), priority chip, epic, sprint, assignee, commit short-SHA.
  Missing fields render nothing rather than a placeholder, so a card
  with only `id + title` collapses cleanly.
- **Group-by support**: `epic` / `sprint` / `assignee` / `shipped` each
  render N stacked 6-column kanbans, one per bucket, each with a
  collapsible header mirroring the Table group-header style.

### Added — Calendar view (US-4.32)

- **Month grid** (7 × 6) laid out by `updated` date for stories +
  commits-per-day overlay from local `git log`. Each day cell shows two
  chips (`Ns` stories + `Nc` commits) when non-zero; the cell body is
  empty when both are zero.
- **Click-to-expand day panel**: shows that day's stories as
  `[US-X.Y] <title>` links and commits as `<sha7> <subject>` rows.
  Toggleable per-day; multiple days can be expanded at once.
- **Prev/next month navigation** via the new `?month=YYYY-MM` URL param;
  default = today's month.
- **`viewer/lib/calendar.ts`** — new helper module exporting
  `loadDailyCommits()` (`Map<dateISO, CommitMeta[]>`),
  `loadCommitActivity(weeks)` (for the heatmap), and `buildMonthGrid()`.
  Wraps `lib/git`'s `isGitRepo` + raw `git log -n 2000 --date=short
  --pretty=format:%H<US>%ad<US>%an<US>%s` (delimited with U+001F to
  survive subjects containing pipes or colons). Module-cached for the
  process lifetime; `--watch` (US-4.21) invalidates by restart.

### Added — Analysis view (US-4.33)

- **Hero KPI row**: start date (earliest sprint `start`), days elapsed,
  `N / M done`, completion % with a filled progress bar, warning count
  (the card itself links to `?view=warning`).
- **Status breakdown card**: horizontal bars per `STORY_STATUS_ORDER`
  value, count right-aligned. Statuses with zero stories still render
  (length-zero bar) — same UNION rationale as the epic progress card.
- **Stories completed (last 30 days)**: vertical bar chart, one bar per
  day, height proportional to stories flipped to `status: done` that day
  (proxy: `updated` field). Empty days render a 2 px stub for visual
  continuity.
- **Commit activity heatmap** — 26 weeks × 7 days, GitHub-style with 5
  intensity buckets. Hover tooltip per cell shows `<count> commits on
  <YYYY-MM-DD>`.
- **Epic progress card** with UNION semantics: every epic from
  `loadDashboardData().epics` (UNION of parsed `EPIC-N.md` files +
  story-referenced ids) renders with title, status badge, `done/total`,
  and progress bar — even when an epic has zero stories.
- **Search-unaffected by design** (ERP §4.1): panel numbers stay stable
  while a user types in the search box for Table/Board. Sprint filter
  still applies.
- **`viewer/lib/analysis.ts`** — new helper module exporting
  `buildAnalysisStats({stories, epics, sprints})` returning the typed
  `AnalysisStats` shape consumed by the inline renderer.

### Changed — Warning view (US-4.34) — replaces US-4.20's filter-only impl

- **Dedicated warning table**, not a status-filter on top of Table. The
  tab now answers "what's actually broken" instead of "rows where status
  happens to be `blocked` or `backlog`".
- **`viewer/lib/warnings.ts`** — new helper module exporting
  `findStoryWarnings(stories)` implementing the required-field-by-status
  contract from koni-erp-02 §4.8:
  - non-backlog (ready / in-progress / review / blocked / reverted /
    deprecated): require `priority`, `points`, `sprint`, `assignee`
  - `done`: additionally require `version_shipped`, `commit`
  - `points: 0` is **present** (legit zero-point story); whitespace and
    `—` placeholder are missing; empty arrays count as missing for
    list-form fields.
- **Columns**: `ID · Title · Epic · Status · Missing fields (chips)`.
  Each missing field renders as a red-tinted chip. Sort: missing-count
  desc → status order → id asc.
- **Warning view ignores the sprint filter** (global visibility) so a
  contributor can see all gaps at once regardless of the active sprint.
  Search filter still applies.
- **Empty-state panel** when `findStoryWarnings(stories)` returns zero:
  `✓ No warnings — all non-backlog stories have required fields.`
- **Warning-count chip in the toolbar tab** — a small destructive-tinted
  badge with the live count, hidden when the count is zero.

### Added — URL state (US-4.35)

- **`?view=table|board|calendar|analysis|warning`** persists the active
  view across reload and deep-link share. Default = `table`. Unknown
  values fall back silently to `table` with no console error.
- **Legacy `?warn=1` compat shim**: on `astro:page-load` we detect the
  legacy param, rewrite the URL to `?view=warning` via
  `history.replaceState`, and activate the Warning tab. Supported for
  one minor version (v0.8.x); v0.9.0 may drop the shim.
- **All other params preserved** unchanged when `?view=` is added or
  removed: `?search`, `?sprint`, `?group`, `?month`.
- **`?month=YYYY-MM`** added for Calendar month navigation; defaults to
  today's month when absent.

### Added — Footer + UNION buckets + default sort (US-4.36)

- **Footer metadata strip** below `#stories-view-container`:
  `<N> of <M> stories · <K> epics · <S> sprints · Updated <relative>`.
  `<N>` reflects the current view's filtered count; `<M>` the corpus
  total. Relative-time formatter rolls `seconds → m → h → d` ago.
- **UNION-semantics epic buckets**: when `group=epic` is active, the
  bucket map is seeded from `loadDashboardData().epicFiles` BEFORE
  stories are distributed. Epics with zero stories render as group
  headers with `0 stories · 0 pts · 0/0 done` and an empty body
  (collapsible like any other bucket).
- **`viewer/lib/sort.ts`** — new module exporting `STORY_STATUS_ORDER`,
  `statusRank(s)`, `priorityRank(p)`, and `compareStories(a, b)`.
  Applied in Table, Board (within column), and inside each group
  bucket. Tie-break chain: status asc → priority asc → updated desc →
  id asc (numeric collation).
- **Placeholder buckets always sort last** regardless of alphabetical
  position: `(no epic)`, `(no sprint)`, `(unassigned)`, `(unshipped)`.

### Added — corpus + viewer lib infrastructure

- **`viewer/lib/corpus.ts`** — `loadDashboardData()` now returns
  `epicFiles: EpicMeta[]` alongside `stories` and `epics`. The `epics`
  array gains `title` and `status` from the parsed `EPIC-N.md`
  frontmatter (previously only stat-counts). Story shape gains the
  `updated: string` field (normalised to `YYYY-MM-DD`) needed by the
  sort comparator.

### Added — tests

- **`__tests__/viewer/sort.test.ts`** (8 cases) covers `statusRank`,
  `priorityRank`, and the four-level `compareStories` tie-break chain.
- **`__tests__/viewer/warnings.test.ts`** (10 cases) covers the full
  required-field-by-status matrix: backlog never flags, non-backlog
  flags 4 fields, done flags 6, `points: 0` is present, whitespace and
  `—` are missing.
- Test suite total: **121 / 121 pass** (was 103, +18 new).

### Changed — VERSION + skill manifest

- `VERSION` → `0.8.0`. `packages/koni-docs/package.json` → `0.8.0`.
  `KONI_DOCS_LIB_VERSION` constant → `0.8.0`. Smoke test asserts new
  value.

### What's still TODO for v0.9

- **Per-assignee Analysis panel** (koni-erp-02 §4.7 "people stats") —
  deferred. The current Analysis dashboard intentionally omits this.
- **Story-level commit links** on Board cards — currently the SHA short
  hash is plain text. Link target needs configurable upstream remote.
- **Test coverage for `calendar.ts` + `analysis.ts`** — both depend on
  git, which is hard to mock. Currently covered by the live smoke test.

### Reference design

[koni-erp-02 `Docs/pod-project-screen.md`](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md)
— the read-only Project screen that ships the same 5-view tracker
against pod-attached GitHub repos. Our deltas from ERP (all intentional):
no multi-repo aggregation, no DB-first caching, no OAuth fallback, no
per-assignee people stats, no manual Refresh button (`--watch` from
US-4.21 covers that role).

### Commit

[`a213df9`](https://github.com/Koniverse/Koni-Skills/commit/a213df9) —
ship commit. This entry's SHA backfilled in commit follow-up per the
v0.7.3 / v0.7.2 ship pattern.

---

## [0.7.4] — 2026-05-28 — Lib resilience: surface YAML parse-failure paths + guard block-scalar quoting — v0.7.4

Two small but load-bearing lib fixes that had been sitting in the working tree as in-flight WIP. Both ship as a single patch since each pairs source + regression test and neither changes the public API.

### Fixed — corpus.ts

- **YAML parse failures now name the offending file**. `loadCorpus`, `readFolderMatter`, and `readSingleton` all funnel `matter()` calls through a new `parseMatterWithPath(raw, path)` helper that catches gray-matter parse errors and rethrows as `Failed to parse frontmatter in <path>: <cause>`. Before this fix, a corrupt YAML block in any story / epic / sprint / singleton crashed the CLI with a raw js-yaml message and no file context — debuggers had to bisect the docs tree by hand. Regression coverage: two new tests in `__tests__/lib/corpus.test.ts` write deliberately broken frontmatter (the exact `goal: ">-"` + orphan-line corruption shape from the `reapplyQuoting` bug below) and assert the path appears in the thrown message for both the sprint scan path and the generic `readFolderMatter` path.

### Fixed — doc.ts (`reapplyQuoting`)

- **Stop wrapping YAML block-scalar indicators in quotes**. When js-yaml serializes a long string in folded (`>-`, `>`, `>+`) or literal (`|-`, `|`, `|+`) style, the value on the scalar line is just the indicator — the actual content lives in the indented continuation lines below. The prior `reapplyQuoting` heuristic wrapped *any* unquoted value of a previously-quoted key in quotes, which turned `goal: >-` into `goal: ">-"` and orphaned the continuation lines at column 1, corrupting the frontmatter. The fix is a single guard regex (`^[>|][-+]?$`) that skips the re-quote step when the value matches a block-scalar indicator. Regression coverage: two new tests in `__tests__/lib/doc.test.ts` exercise long double-quoted and single-quoted values through a full round-trip, asserting (a) the bug signature `goal: ">-"` does not appear in the output and (b) a second parse recovers the original value verbatim.

### No public-API change

`KONI_DOCS_LIB_VERSION` bumped to `0.7.4`; no exported symbol added, removed, or renamed. Test suite still 103/103 — the four regression tests covered by this patch were already passing against the in-tree source (they're the tests that locked the fixes in before commit).

---

## [0.7.3] — 2026-05-28 — Frontmatter Reference Spec + RULE-17 + `arch_ref` / `depends_on` schema fields — v0.7.3

Single shipped story — **US-4.30**. Promotes the per-field frontmatter contract diagnosed during US-4.29 cleanup into a written, normative spec that every Koniverse project must follow. The change is documentation-first; the koni-docs script remains backwards-compatible (still accepts CSV-string + array forms of `prd_ref`), so existing projects keep working while they migrate.

### Added — authoritative spec

- **`skills/koni-docs/references/frontmatter-spec.md`** — single source of truth for what every ID-typed frontmatter field on `stories/*.md`, `epics/*.md`, `sprints/*.md` may contain. Defines the four canonical ID namespaces (FR / NFR / AD / US), the canonical regex for each, the per-document field contract (story / epic / sprint), the YAML list-form preference, a five-item anti-pattern catalog (prose-in-`prd_ref`, dangling parenthetical, story-as-PRD-ref, slash-joined IDs, range syntax) with real broken values pulled from the Koni-Finance-Final corpus, and a step-by-step migration playbook + grep audit recipe.
- **RULE-17 — Frontmatter ID fields are bare canonical IDs only, never prose** ([rules.md](skills/koni-docs/references/rules.md)). BLOCKER severity. Covers the failure modes that `koni-docs sync` cannot diagnose itself (lookup misses on garbage tokens), with grep checks that catch malformed `prd_ref` / `arch_ref` / `depends_on` before they hit sync. Rule count goes from 11 → 12.

### Added — schema (additive, backwards-compatible)

- **`arch_ref` and `depends_on`** on `storySchema` ([`src/lib/schemas/story.ts`](packages/koni-docs/src/lib/schemas/story.ts)) — both `z.union([z.string(), z.array(z.string())]).optional()`. `arch_ref` carries `AD-N` IDs (ARCHITECTURE.md Architecture Decisions); `depends_on` carries `US-X.Y` IDs (other stories whose artifacts this story consumes). The script currently does not sync these (no analog to FR-row update yet), but stories adopting them today are forward-compatible.
- **`arch_ref`** on `epicSchema` ([`src/lib/schemas/epic.ts`](packages/koni-docs/src/lib/schemas/epic.ts)) — same shape.
- **`STORY_DEFAULTS`** ([`src/lib/schemas/story.ts`](packages/koni-docs/src/lib/schemas/story.ts)) — `prd_ref` default changed from `''` to `[]`; `arch_ref` and `depends_on` added as `[]`. `koni-docs backfill-fields` now adds these three list fields to sparse story files. Existing stories that already declare `prd_ref:` as a string keep working — the default applies only when the key is absent.

### Changed — templates

- **`templates/story.md`** — §1 skeleton switched to `prd_ref: [FR-N]` list form; added `arch_ref: [AD-N]` and `depends_on: [US-X.Y]` rows with inline guidance pointing to `frontmatter-spec.md`. Per-section guidance rewritten to enforce the contract. Filled mini-example migrated: `prd_ref: AD-06, FR-93, FR-94` → `prd_ref: [FR-93, FR-94] / arch_ref: [AD-06]`.
- **`templates/epic.md`** — §1 skeleton switched to YAML list form for `prd_ref`; added `arch_ref` row. Per-section guidance forbids range syntax (`FR-28 .. FR-45`) and mixed namespaces. Filled mini-example (`EPIC-3 Treasury Visibility`) migrated from `prd_ref: FR-28 .. FR-45, FR-82 .. FR-89, FR-114, FR-117 .. FR-120` to an enumerated YAML list.

### Changed — SKILL.md cross-links

- Rules table now shows 12 rules including RULE-17.
- Reference-files table gains a row for `frontmatter-spec.md` with explicit "when to load" trigger.
- Activation table gains a row for frontmatter-debugging intents ("fix prd_ref", "what goes in arch_ref / depends_on", "AD-N in story frontmatter", "sync warns row not found", "migrate frontmatter") routing to the spec + RULE-17.

### Tests

- `__tests__/lib/schemas.test.ts` — three new cases: `STORY_DEFAULTS` ID-list fields default to `[]`, `storySchema` accepts `arch_ref` + `depends_on` as lists, and as CSV strings (backwards-compat). Suite passes 103/103.

### Migration note for downstream projects

The spec ships unenforced for now — `koni-docs sync` / `validate` keep their current behaviour (silently skip non-FR-prefixed entries). A future minor bump will add a `koni-docs lint frontmatter` subcommand that fails fast on malformed values per RULE-17. Adopting the spec now (move AD-N to `arch_ref`, prose to body, switch to list form) future-proofs your repo and immediately removes the noisy "row not found" warnings from `sync`.

---

## [0.7.2] — 2026-05-28 — PRD heading convention: label-only + legacy-number fallback — v0.7.2

Single shipped story — **US-4.29**. Aligns the Koni-Skills PRD heading style with the convention used by Koni-Finance-Final (label-only H2s) and removes a long-standing class of `sync` warnings caused by the prior hardcoded `## 8.` lookup. Patch bump (not minor) because the change is fully backwards-compatible: legacy numbered PRDs keep working via the new `legacyNumber` fallback.

### Added — koni-docs library

- **`findSectionByLabel(doc, label, { level?, legacyNumber? })`** in `packages/koni-docs/src/lib/markdown/sections.ts` (US-4.29). Locates an H2 by its clean label (e.g. `Functional Requirements`); when `legacyNumber` is supplied, falls back to a numeric-prefix scan (`## 8.`) so older PRDs continue to work without forced migration.
- **`packages/koni-docs/src/lib/prd-constants.ts`** — new module exporting the canonical PRD section labels (`PRD_FUNCTIONAL_REQUIREMENTS_LABEL`, `PRD_EPICS_AND_STORIES_LABEL`) plus their legacy numbers (`8`, `11`). Replaces the magic-string `'## 8.'` literals previously sprinkled across `sync.ts` and `refs.ts`.

### Changed — koni-docs library + CLI

- **`cli/sync.ts`** now uses `findSectionByLabel(..., { legacyNumber: PRD_FUNCTIONAL_REQUIREMENTS_LEGACY_NUMBER })` for the FR-row section lookup. Warning text rewritten from `PRD §8 FR …: section "## 8." not found` to `PRD Functional Requirements FR …: section "## Functional Requirements" not found` (now references the canonical heading name).
- **`lib/refs.ts` `validateFrRefs`** same migration as above.
- **`cli/validate.ts`** help text + missing-FR output reworded (`in PRD §8` → `in PRD Functional Requirements`).

### Changed — documentation convention

- **`docs/PRD.md`** rewritten with label-only H2 headings: `## Executive Summary`, `## Success Criteria`, `## Product Scope`, `## User Journeys`, `## Personas`, `## Background & Strategic Decisions`, `## Domain-Specific Requirements`, `## Functional Requirements`, `## Non-Functional Requirements`, `## Glossary`, `## Epics & User Stories`. Internal `§N` references updated. Old numbered form is no longer canonical.
- **`skills/koni-docs/references/templates/prd.md`** rewritten — adds a leading "Heading convention" section that documents the rule explicitly, replaces the embedded skeleton's numbered H2s with the label form, and ends with a "Migrating an older PRD with numbered headings" section.
- **Active cross-references updated** to the new label form: `AGENTS.md`, `docs/README.md`, `docs/ARCHITECTURE.md` (5-layer table + AST table + L3 ID-graph table + sync sink graph + tree comment), `docs/SETUP.md`, `docs/LESSONS.md`, `docs/sprints/README.md`, `skills/koni-docs/SKILL.md` (rules table + activation table + 7.4 subcommand inventory + 7.7 library API + 7.8 troubleshooting), `skills/koni-docs/references/sprint-system.md` (also fixes pre-existing typos `PRD §7` and `PRD §4 FR` that referenced sections that never existed at those numbers).
- Historic `§N` references inside `docs/CONTEXT.md` are intentionally left as-is — those are point-in-time decision records, not active cross-references.

### Tests

- New cases in `__tests__/lib/markdown/sections.test.ts` cover `findSectionByLabel`: exact-label match wins, legacy fallback resolves numbered headings (incl. the `(FR)` suffix), `legacyNumber` is opt-in (no fallback when omitted), missing on both axes returns `null`.
- Fixture `__tests__/lib/_fixtures/build-fixture.ts` updated to emit label-only PRD headings.
- `__tests__/lib/refs.test.ts` assertions updated to match the new wording.
- Full suite passes (100/100).

### Verified

- `node packages/koni-docs/dist/cli/index.mjs sync --docs-path docs/ --dry-run` reports **0** `section "..." not found` warnings against `docs/PRD.md`. (Remaining warnings — `prd_ref: AD-N` rows missing from the FR table and the `sprint-2026-W19` archive-path issue — are unrelated pre-existing data problems and out of scope for this story.)

---

## [0.7.0] — 2026-05-28 — Pillar F: viewer polish + CLI fixes + lib cleanup — v0.7.0

Closes the v0.6.x deferred backlog. Nine shipped stories (US-4.20 through US-4.28) across four sub-clusters:

### Added — viewer polish (F.1)

- **`/project` page** (US-4.20). Lifts the 366-line User Stories Tracker from `Koni-Finance-Final/apps/docs/src/pages/project.astro`, adapted for koni-docs (sync `loadDashboardData().stories` instead of async `extractAllUserStories`; commit SHA rendered as plain text since it isn't a URL). Closes the dead `/project` sidebar nav link that 404'd since v0.6.0. Provides table + search + sprint filter + group-by-{epic, sprint, assignee, shipped}.
- **`--watch` live-reload** (US-4.21). `koni-docs preview --watch` now actually works (was a no-op declared in v0.6.0). chokidar singleton watches `KONI_DOCS_DIR` with `{ ignored: /(\/node_modules\/|\/\.git\/|\/\.astro\/)/, ignoreInitial: true }` feeding a 300 ms-debounced EventEmitter. New Astro API route at `/koni-docs-rt/reload` streams SSE (`data: reload\n\n`); Layout.astro subscribes via `EventSource` and calls `location.reload()` on event. Subscriber cleanup via `request.signal.addEventListener('abort', ...)` prevents leaks across tab churn.
  - Note: route prefix is `/koni-docs-rt/` (not `/__koni-docs/`) because Astro excludes any `pages/_*` directory from routing.
- **`koni-docs.config.{json,mjs}`** (US-4.22). Optional config file at the docs-tree root with zod-validated shape `{ title?: string; folderOrder?: string[]; topLevelOrder?: string[] }`. Overrides the hardcoded `TOP_LEVEL_ORDER` / `FOLDER_ORDER` constants in `viewer/lib/corpus.ts` and the page `<title>`. Missing file falls back to current defaults — opt-in only, no migration needed.
- `commit: string` field added to `loadDashboardData().stories` (sourced from `frontmatter.commit ?? frontmatter.pr`) so the `/project` page can render per-row commit SHAs.

### Added — CLI correctness (F.2)

- **`findSectionStartingWith(doc, prefix)`** lib helper (US-4.23). Matches the first heading whose text starts with the given `## <num>.` prefix. `sync.ts` now uses it for PRD §8 FR-row lookups — real PRDs use `## 8. Functional Requirements (FR)`, the prior literal lookup couldn't match. Both casing variants (`Functional Requirements (FR)`, `Functional requirements`) now resolve through one call site.
- **YAML quoting preservation in `parseDoc`/`writeDoc`** (US-4.24). `Doc.frontmatterQuoting?: Map<string, '"' | "'">` records which keys carried which quote style in the original raw frontmatter. On serialize, gray-matter's bare output is re-wrapped to match. Eliminates the v0.5.x–v0.6.x noisy git diffs where `version_shipped: "0.6.0"` became `version_shipped: 0.6.0` after every CLI write. Best-effort heuristic — plain scalar values only; multi-line and block scalars are not preserved (none used in the corpus).
- **`koni-docs validate` subcommand** (US-4.25). Runs `validateRefs(corpus)` (L3 ID-graph integrity — already in the lib) plus the new `validateFrRefs(corpus)` (each story's `prd_ref` frontmatter resolves to a real FR-row in PRD §8). Flags: `--json`, `--include-warnings`. Exits non-zero on any error. Dogfooded against this repo's `docs/` — surfaces dangling ID refs where prior tooling silently glossed over.

### Removed — lib cleanup (F.3)

- `serializeChangelog` (US-4.26). The stub function in `lib/changelog.ts` that always threw `"not implemented in Pillar B"`. The re-export from `lib/index.ts` goes too. Unused import in `__tests__/lib/changelog.test.ts` removed.
- `recursive` parameter from `readFolderMatter` signature (US-4.26). Never read; the trailing `// recursive walk omitted` comment also drops. Function body unchanged.
- `unist-util-visit` dependency (US-4.26). Not imported anywhere under `src/` or `__tests__/`. Lockfile updates.

### Added — lib documentation (F.3)

- **Mutation-contract comment** at the top of `lib/index.ts` (US-4.27). Documents the convention: all exports are pure unless a call-site comment says otherwise; `update*` returns a new value, never mutates the input. The sole exception (`parseTable(...).node` mutates `doc.ast`) is called out explicitly.

### Changed — build config

- `tsconfig.json` `include` now scopes to `src/cli/**`, `src/lib/**`, `__tests__/**` and excludes `src/viewer`. The viewer has its own astro-strict tsconfig and the package-level typecheck was choking on TS2209 from the viewer's self-reference to `@koniverse/koni-docs/lib`. Astro's own check command continues to cover the viewer.

### Verification

- 71 → **92** tests pass (21 new across the 9 stories). `npm run typecheck` exits 0.
- `koni-docs --version` reports `0.7.0` from a fresh global install. `koni-docs preview docs --watch` confirmed end-to-end: SSE event arrives within 1 s of editing a doc file.
- `koni-docs validate ../../docs` runs cleanly against this repo (surfaces real-data issues already known and tracked).

### Deferred (Pillar G)

- Astro 6 upgrade.
- Per-doc TOC scrollspy.
- Cross-doc search (Fuse.js index or similar).
- Plugin system (Supabase / Next.js per EPIC-3).
- Optional demotion of viewer-only deps (astro, @astrojs/node, marked, shiki, chokidar) from `dependencies` to `peerDependencies` to shrink the install for CLI-only consumers.
- `npm publish @koniverse/koni-docs@0.7.0` — gated manual step (see Task 12 in the Pillar F plan).

**Commit**: adc16ad

---

## [0.6.1] — 2026-05-28 — Hotfix: viewer install-blocking import + tsup shebang leak — v0.6.1

Fixes two bugs that prevented the v0.6.0 viewer from running after `npm install` / `npm link`.

### Fixed
- `src/viewer/lib/corpus.ts` imported from `../../lib/index.ts` — a TS source path not shipped in the npm tarball (`files` whitelist is `dist` + `src/viewer` + `README.md`). Repointed to the package's own subpath export `@koniverse/koni-docs/lib` so the viewer resolves to `dist/lib/index.mjs` whether running from a checkout or an installed copy.
- `tsup.config.ts` applied the CLI shebang `#!/usr/bin/env node` to **every** ESM output via top-level `banner`, including `dist/lib/index.mjs`. Vite SSR parsing the lib entry as JavaScript threw `SyntaxError: Invalid or unexpected token` and rendered a 500 error page on `/`. Split the tsup config into two builds: the CLI entry keeps the shebang; the lib entries (`lib/index`, `lib/markdown/index`, `lib/schemas/index`) ship clean.

### Verification
- `npm run build` produces shebang only on `dist/cli/index.mjs`; lib entries start with plain `import {`.
- `koni-docs preview docs --port 47330` returns HTTP 200, 187 KB rendered HTML.
- 71/71 tests pass (`npm test`).

### Consumer impact
Anyone who installed v0.6.0 must upgrade — the viewer is unusable on that release. Reinstall via `npm link` (re-run from `packages/koni-docs`) or rebuild the tarball with `npm pack`.

### Also in this hotfix
- `KONI_DOCS_LIB_VERSION` constant synced to `0.6.1` (was still `0.6.0` because the prior version-triple step missed `src/lib/index.ts`). The triple sync is now: root `VERSION` + `packages/koni-docs/package.json` + `KONI_DOCS_LIB_VERSION`.
- `package.json` `files` field tightened from `["dist", "src/viewer", "README.md"]` to explicit subpaths under `src/viewer/` (`components/**`, `layouts/**`, `lib/**`, `pages/**`, `public/**`, `styles/**` + the config files). v0.6.0 tarball included `src/viewer/node_modules/.vite/deps_temp_*/` and `src/viewer/.astro/` because the broad `src/viewer` glob caught dev-time caches. New tarball: 34 files (was 45).

**Commit**: 7543e42

---

## [0.6.0] — 2026-05-28 — Pillar E ship: Astro SSR viewer + `preview` subcommand — v0.6.0

Adds the Astro SSR docs viewer at `packages/koni-docs/src/viewer/` and a new `koni-docs preview` subcommand. Lifts the proven UI pattern from `Koni-Finance-Final/apps/docs/`, adapted for SSR + runtime DOCS_DIR + Pillar B lib reuse.

### Added
- `koni-docs preview [path] --port <n> --host <h> --open` — spawns Astro dev with `KONI_DOCS_DIR` set
- `src/viewer/` Astro SSR project: `pages/index.astro` (dashboard with KPIs + epic grid), `pages/docs/[...file].astro` (per-doc SSR with story frontmatter card + TOC), `layouts/Layout.astro`, `components/TreeNode.astro`, `styles/global.css`
- `lib/render.ts`: marked + shiki (github-dark) + mermaid passthrough + relative-link rewrite
- `lib/corpus.ts`: file-tree builder + dashboard data composer (delegates to Pillar B lib)
- Runtime deps: `astro@^4.16.18`, `@astrojs/node@^8.3.0`, `marked@^12.0.1`, `shiki@^1.1.7`, `chokidar@^3.6.0`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `tw-animate-css`
- Preview smoke test in `__tests__/cli/preview.test.ts`

### Changed
- `package.json` `files` field includes `src/viewer/**` so the viewer ships in the npm tarball
- VERSION triple synced to `0.6.0` (root VERSION + package.json + KONI_DOCS_LIB_VERSION)

### Deferred (Pillar F)
- chokidar + SSE live-reload (`--watch` flag in CLI design but no-op for v0.6.0)
- `koni-docs.config.{json,mjs}` config file (title/ordering overrides)
- Full `project.astro` overview page
- npm publish `@koniverse/koni-docs@0.6.0`

**Commit**: bc0168b

---

## [0.5.0] — 2026-05-27 — Pillar D ship: polish + migration + npm publish — v0.5.0

Stable v0.5.0 release of `@koniverse/koni-docs`. Closes the CLI expansion epic with consumer-facing migration docs and an npm-published CLI binary.

### Added
- npm-published `@koniverse/koni-docs` v0.5.0 with bin `koni-docs` (5 subcommands) and lib subpath exports.
- `docs/SETUP.md` install + usage instructions.
- Consumer migration table in CHANGELOG (replaces `.mjs` paths).
- Unit test locking pre-release semver in `parseChangelog`.

### Fixed
- `inject-tasks` honors `--dry-run` (was silently writing files).
- `sync` non-fatal warnings now print to stderr (no longer interleaves with `--json` stdout).
- `KONI_DOCS_LIB_VERSION` synced with `package.json` version (was stuck at `0.2.0-dev.0`).
- `SyncStats` interface no longer carries dead `prdStory` / `skipped` fields.

### Documentation
- `skills/koni-docs/SKILL.md` §7 rewritten: bundled `.mjs` scripts → CLI subcommand reference.
- `skills/koni-docs/references/sprint-system.md` script paths → CLI paths.
- `CLAUDE.md` / `AGENTS.md` Koni-docs Integration blocks updated to mention CLI install.

**Commit**: 72c973f

---

## [0.5.0-dev.0] — 2026-05-27 — koni-docs CLI Pillar C — v0.5.0-dev.0

Ships `koni-docs` CLI binary with 5 subcommands backed by the Pillar B lib. Deletes the 5 legacy `.mjs` scripts and `sync-test.mjs`. The W22 Carry-column BLOCKER fix is now live for end-users via `koni-docs sync`. `preview` subcommand deferred to Pillar D alongside the Astro viewer build.

### Added
- `koni-docs status` — replaces `generate-status.mjs` (semver ID sort)
- `koni-docs sync` — replaces `agile-sync-up.mjs`, column-by-NAME (W22 BLOCKER fix)
- `koni-docs inject-tasks` — replaces `agile-inject-tasks.mjs`
- `koni-docs backfill-fields` — replaces `agile-backfill-fields.mjs`
- `koni-docs backfill-commits` — replaces `changelog-backfill-commits.mjs`
- `commander`-based CLI framework with global flags (`--docs-path`, `--dry-run`, `--json`, `--verbose`)

### Removed (BREAKING for consumer repos hardcoding `node skills/...` paths)
- `skills/koni-docs/scripts/generate-status.mjs`
- `skills/koni-docs/scripts/agile-sync-up.mjs`
- `skills/koni-docs/scripts/agile-inject-tasks.mjs`
- `skills/koni-docs/scripts/agile-backfill-fields.mjs`
- `skills/koni-docs/scripts/changelog-backfill-commits.mjs`
- `skills/koni-docs/scripts/__tests__/sync-test.mjs`

### Fixed
- **W22 BLOCKER** — `agile-sync-up.mjs` silently wrote status icons into the `Carry` column of `sprint-2026-W22.md` because cell addressing was by position. `koni-docs sync` now addresses by column NAME and throws clearly if the column is missing.

### Migration table (for consumer repos updating from < 0.4.0)

The 5 legacy `.mjs` scripts under `skills/koni-docs/scripts/` are gone. Update any `package.json` `scripts` blocks, CI jobs, or git hooks that hard-coded their paths:

| Old | New |
|---|---|
| `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/` | `npx koni-docs status --docs-path docs/` |
| `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/ --story US-X.Y` | `npx koni-docs sync --docs-path docs/ --story US-X.Y` |
| `node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --all` | `npx koni-docs inject-tasks --docs-path docs/ --all` |
| `node skills/koni-docs/scripts/agile-backfill-fields.mjs --docs-path docs/` | `npx koni-docs backfill-fields --docs-path docs/` |
| `node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/` | `npx koni-docs backfill-commits --docs-path docs/` |

If you have an `npm run agile:status` script:

```diff
- "agile:status": "node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/"
+ "agile:status": "koni-docs status --docs-path docs/"
```

(Add `@koniverse/koni-docs` to your devDependencies; the `koni-docs` bin resolves locally without needing `npx` when listed in `scripts:`.)

**Commit**: 7bc86ce

---

## [0.4.0-dev.0] — 2026-05-27 — koni-docs CLI Pillar B lib foundation — v0.4.0-dev.0

Ships `packages/koni-docs/src/lib/` — the reusable typed library that backs the Pillar C CLI subcommands. Composes gray-matter + unified/remark/remark-gfm + zod; replaces the hand-rolled YAML parser and position-based table addressing slated for deletion in Pillar D. 50 exports / 49 unit tests / typecheck clean / .mjs build verified.

### Added
- `@koniverse/koni-docs/lib` exports: corpus / doc / markdown / schemas / refs / changelog / git (9 modules)
- Zod schemas for story, epic, sprint, changelog-entry
- Column-by-NAME table addressing (foundation for the W22 Carry-bug fix to ship in Pillar C `sync`)
- L3 ID-graph traversal: `listChildrenOf` / `listReferrersTo` / `validateRefs`
- Thin git wrappers using `execFileSync` (no shell injection surface)

**Commit**: 074d26b

---

## [0.3.0] — 2026-05-27 — Real-world audit: BLOCKER fix + RULE-16 + 4 new sprint sections + 198/266-story script robustness — v0.3.0

Third release. Ships the **US-1.5 audit** of two production Koniverse
repos (Koni-Finance-Final 198 stories / 9 epics / 8 sprints; senti_quant
266 stories / 35 epics / 10 sprints), fixing one BLOCKER script bug, two
WARNING-tier robustness gaps, and consolidating template patterns the
two repos invented but the koni-docs skill didn't yet document.

Sprint-2026-W22 reopened mid-day 2026-05-27 to absorb US-1.5 (8 pts P0)
after v0.2.0 closed earlier in the day. EPIC-1 (foundation + ongoing
enhancements) closes again at 100%: 5/5 stories, 27/27 pts.

### Added

**Skill — new rule: RULE-16 (`version_shipped:` is bare semver)**
- `skills/koni-docs/references/rules.md` adds RULE-16 (Severity BLOCKER):
  `version_shipped:` MUST be bare semver (`0.7.0`), NEVER `v`-prefixed.
  Catalog count: 10 → 11. `v` prefix is reserved for narrative
  surfaces (git tags, prose, Active Context summary lines). Closes
  the long-deferred [LESSONS §4](LESSONS.md) trap from v0.2.0.
- `SKILL.md` §2 rule table grows to 11 rows.
- `references/templates/story.md` frontmatter comment for
  `version_shipped:` rewritten: bare semver mandatory, `v` prefix
  explicitly forbidden.

**Skill — sprint template additions (5 new optional sections)**
- `templates/sprint.md` §sprint-scope: documents both the canonical
  6-column shape and the extended **7-column shape with `Carry` column**
  (Koni-Finance-Final pattern). Values: `from W<N>` / `new` / `substrate` /
  prose. Documents inline title annotations: `_(added YYYY-MM-DD)_`,
  `_(closed mid-sprint vX.Y.Z)_`, `_(carry W21←W20←W19)_`.
- `templates/sprint.md` 4 new optional sections (senti_quant pattern):
  - `## Why <US-X.Y> in W<N>` — narrativize single load-bearing mid-sprint commitment
  - `## Parked / deferred from W<N-1>` — explicit carry-over audit with status emojis
  - `## Closed mid-sprint W<N>` — date + version per mid-sprint landing
  - `## Risks & dependencies` — per-risk mitigation
- `templates/sprint.md` close-out: optional `## Carry-overs to W<N+1>`
  section (Koni-Finance-Final pattern).

**Skill — story template additions**
- `templates/story.md`: optional `## Story refresh — YYYY-MM-DD` block
  for mid-implementation re-scopes (Koni-Finance-Final pattern).
- `templates/story.md`: multi-commit `commit:` field documented
  (comma-separated SHAs for stories with multiple landing commits).
- `templates/story.md`: `assignee:` comment elevated to MANDATORY (RULE-15);
  `version_shipped:` comment elevated to MANDATORY (RULE-16).

**Skill — convention additions**
- `SKILL.md` §1: **Vietnamese counterpart `*.vi.md`** convention
  documented. English (`*.md`) is canonical (RULE-13); `*.vi.md`
  siblings are optional translations, never authoritative, skipped
  by sync scripts.
- `references/sprint-system.md`: **WIP limit as team-configurable**
  via `koni-docs.agile.wip_limit` key in CLAUDE.md Integration block
  (defaults to 3; raise for atomic-ship sprints).
- `references/sprint-system.md`: **hybrid EPIC numbering** convention
  (zero-padded `EPIC-01..13` from BMad era + plain `EPIC-14+`
  post-koni-docs) documented + fallback behavior of
  `agile-backfill-fields.mjs`.

### Changed

**Script — `agile-sync-up.mjs` regex-escape contract**
- Adds `escapeRegExp(str)` helper at top of script. Applied to every
  dynamic input before `new RegExp(...)` construction:
  - `epicStoryRowMatcher` (was: `\\.`-only escape; now: full escape)
  - `updatePRDStoryEntry` section-header regex
  - `updatePRDFRRow` table-row regex
- `updatePRDFRRow` now **extracts every well-formed `FR-N` token** from
  `prd_ref:` via `/\bFR-[0-9]+(?:\.[0-9]+)?\b/g`. Supports comma-separated
  multi-FR (`prd_ref: FR-1, FR-2`); ignores `AD-N` tokens (PRD §6 AD table
  is hand-maintained); ignores free-form prose (Koni-Finance-Final
  US-1.34 pattern). Each extracted FR row is updated independently.
- `updateSprintScopeTable` switches from hardcoded position-from-end
  to **header-name-based column lookup** via new `findColumnIndex`
  helper. Works on canonical 6-col AND Koni-Finance-Final 7-col Carry
  shape without configuration.
- `updateSprintScopeTable` also searches `<docs>/sprints/archive/` for
  sprint files (some projects move closed sprints there but still
  reference them from done stories).
- "PRD story entry not found" downgraded from `⚠` to `-` (info) when
  story has `prd_ref` set, and **silenced entirely** when `prd_ref`
  is empty. Legacy projects that track stories only in Epic Stories
  tables no longer drown the sync output (Koni-Finance-Final +
  senti_quant pattern).

**Script — `agile-backfill-fields.mjs` infers `epic:` from story ID**
- New `inferEpicFromId(id)` helper: `US-3.7` → `EPIC-3`; nested
  `US-8.0.1` → `EPIC-8`. When `epic:` is missing, backfill emits the
  inferred value (instead of blank `""`).
- Validation step suggests the inferred value when both `id:` and
  `epic:` blank: `⚠ ... missing required field "epic" (suggest \`epic:
  EPIC-X\` from id US-X.Y)`.

**Regression test — sync-test.mjs**
- Test 7 added: agile-sync-up regex-escape robustness. Two new fixture
  stories cover the exact crash shape (regex-special title + multi-FR
  prd_ref; prose `prd_ref:` with brackets/parens/AD-N tokens — the
  Koni-Finance-Final US-1.34 shape). Assertion count: 21 → 28.

### Fixed

**BLOCKER — `agile-sync-up.mjs` no longer crashes on regex-special story content**
- Was: `SyntaxError: Range out of order in character class` at
  `agile-sync-up.mjs:254` `updatePRDFRRow` when a story's `prd_ref:`
  contained `[`, `]`, `(`, `.`, etc. (Koni-Finance-Final US-1.34).
  Mid-run abort left some files synced and others not.
- Now: zero crashes against 198-story Koni-Finance-Final + 266-story
  senti_quant. Both reference repos exit 0 in dry-run.
- Root cause + fix codified as [LESSONS §5](LESSONS.md) and PRD AD-10
  ("sync scripts MUST escape all dynamic input before regex construction").

**Real-world dry-run delta (before → after, BLOCKER fix)**:
| Reference repo | Stories | Before | After |
|---|---|---|---|
| Koni-Finance-Final | 198 | Crashed at story #34 (SyntaxError) | Exit 0; 164 epic + 168 FR + 78 sprint rows updated, 1 skipped (legitimate — story without `id:`) |
| senti_quant | 266 | Exit 0 but ~190 noisy `⚠ PRD story entry not found` warnings | Exit 0; downgraded to silent/`-` info; only data-hygiene warnings remain (264 PRD FR not found — stories pointing at PRDs that don't list those FRs) |

### Notes

Decision recorded as [CONTEXT D11](CONTEXT.md) — adopt real-world
template additions wholesale (rather than picking one-at-a-time) +
formalize the regex-escape contract as AD-10. Both originated from the
US-1.5 retro against Koni-Finance-Final + senti_quant.

PRD added: FR-14 (US-1.5 deliverable), AD-10 (regex-escape contract).

### Followups (deferred to next sprint, EPIC-1 or EPIC-3)

- **CI gate** — GitHub Action running
  `skills/koni-docs/scripts/__tests__/sync-test.mjs` on every PR.
  Currently runs locally only. Open question in
  [ARCHITECTURE.md](ARCHITECTURE.md).
- **Consumer-repo cleanup** — Koni-Finance-Final + senti_quant will
  pick up the BLOCKER fix on their next `npx skills update koni-docs`.
  Their data-hygiene gaps (stories missing `epic:`, `prd_ref:` pointing
  at non-existent FRs, sprint scope rows missing for done stories)
  remain for each repo to clean up locally.
- **Auto-detect padded EPIC-NN format** in `agile-backfill-fields.mjs`
  (currently emits plain `EPIC-N`; padded projects hand-correct).

### Contributors

Sprint-2026-W22 extension: same single contributor as the v0.2.0 ship.

| GitHub login | Git name | Stories shipped | Points (v0.3.0) |
|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | US-1.5 | 8 |

Sprint-W22 total across v0.2.0 + v0.3.0: 8 stories, 25 points,
1 contributor.

**Commit**: v0.3.0 release commit — to be tagged at sprint-W22
close. SHA backfilled by `changelog-backfill-commits.mjs` at
pre-commit.

---

## [0.2.0] — 2026-05-27 — Dogfood koni-docs on its own repo + 2 conventions + RULE-15 — v0.2.0

Second release of Koni-Skills. **Sprint-2026-W22** ships 7 stories (17
points across EPIC-1 + EPIC-2). The release applies the `koni-docs` skill
to its own home repo end-to-end, adds two recommended-for-teams
conventions (file-extracted Active Context, AGENTS-canonical / CLAUDE-pointer),
adds a new BLOCKER-severity rule (RULE-15: `assignee:` = GitHub login),
and corrects the CHANGELOG home path per skill canon.

After this release:
- The Koni-Skills repo itself is a worked example of a fully scaffolded
  Koni-Skills consumer — every artifact the skill claims to manage exists
  here, the integration block + Active Context are wired in their
  recommended shape, and the sprint discipline runs against the skill's
  own bundled scripts.
- The catalog ships **10 rules** (was 9) and **two project-level
  conventions** documented in `references/templates/integration.md`.
- EPIC-1 (koni-docs skill foundation + ongoing enhancements) and EPIC-2
  (repo dogfood) both close at 100%. EPIC-3 (catalog expansion: plugin
  skills + first non-docs Koniverse skill) remains backlog for a future
  brainstorm.

### Added

**Skill — new convention: file-extracted Active Context (Pattern B)**
- `skills/koni-docs/references/templates/integration.md` §0/§2/§5
  documents Pattern B (file-extracted Active Context) — recommended for
  multi-developer teams to eliminate `CLAUDE.md` merge churn on
  parallel-branch sprint updates. Pattern A (inline in `CLAUDE.md`)
  preserved as solo-dev fallback.
- `SKILL.md` §4 grew a pattern-picker table and §5 activation table now
  routes "adopt active-context split" to `integration.md` §2.
- Story: [US-1.2](sprints/stories/US-1.2-active-context-split-pattern.md).

**Skill — new rule: RULE-15 (`assignee:` = GitHub login)**
- `skills/koni-docs/references/rules.md` adds RULE-15 (Severity BLOCKER)
  — every `assignee:` in koni-docs artifacts MUST be the contributor's
  GitHub login, never git `user.name`, never a display name. Catalog
  count: 9 → 10. `SKILL.md` §2 rule table updated to match.
- `references/templates/story.md` frontmatter comment for `assignee:`
  changed from `# GitHub login (optional)` to `# MANDATORY (RULE-15):
  GitHub login from \`gh api user --jq .login\` — never git user.name`.
- Story: [US-1.3](sprints/stories/US-1.3-rule-15-assignee-github-login.md).

**Skill — new convention: AGENTS-canonical / CLAUDE-pointer**
- `references/templates/integration.md` §3 split into §3.1 (new
  convention — AGENTS.md as single source of truth; CLAUDE.md as thin
  pointer that holds only the Koni-Docs Integration config + Active
  Context pointer + optional Claude-Code-only routing) and §3.2
  (existing AGENTS.md Koni-Docs Reference Block).
- `SKILL.md` §5 activation table routes "make AGENTS.md canonical /
  slim CLAUDE.md / AGENTS-canonical convention" to `integration.md` §3.1.
- Story: [US-1.4](sprints/stories/US-1.4-agents-canonical-convention.md).

**This repo — full `docs/` scaffolding (dogfood)**
- `docs/README.md` (doc hub + pre-commit checklist), `BRIEF.md`
  (product brief), `PRD.md` (§1–§11 + epic/story index + FR table),
  `ARCHITECTURE.md` (skill repo + distribution architecture),
  `CONTEXT.md` (decision log D1–D10), `LESSONS.md` (§1–§4 traps +
  patterns), `SETUP.md` (local dev environment).
- `docs/sprints/` subtree: `README.md` (sprint schema pointer),
  `STATUS.md` (auto-generated kanban — RULE-5),
  `epics/EPIC-1.md`, `EPIC-2.md`, `EPIC-3.md`,
  7 story files: `US-1.1`, `US-1.2`, `US-1.3`, `US-1.4`, `US-2.1`,
  `US-2.2`, `US-2.3`, `US-2.4`, plus backlog `US-3.1`,
  active-then-archived `sprint-2026-W22.md`, archived `sprint-2026-W19.md`.
- Story: [US-2.1](sprints/stories/US-2.1-bootstrap-docs-structure.md).

**This repo — file-extracted Active Context (Pattern B)**
- `.active-context.example.md` (committed template) + `.active-context.md`
  (gitignored snapshot) at repo root. `.gitignore` updated.
- Story: [US-2.2](sprints/stories/US-2.2-wire-integration-blocks.md).

**This repo — VERSION + CHANGELOG seeded**
- `VERSION` at repo root (`0.2.0` on this release; was `0.1.0`).
- `docs/CHANGELOG.md` (canonical location per skill SKILL.md §0;
  initially shipped at repo root in error, relocated mid-sprint per
  [CONTEXT D10](CONTEXT.md)) — header, RULE-1/2 reminder, retroactive
  v0.1.0 entry covering the 22-commit koni-docs skill initial release,
  and this v0.2.0 entry.
- Story: [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md).

### Changed

**Project file architecture (this repo)**
- `CLAUDE.md` slimmed **40 → 28 lines**: kept only the AGENTS.md-is-canonical
  pointer paragraph, the `Koni-Docs Integration` config block, and the
  Active Context pointer (Pattern B). Removed `## Quick start` and
  `## Documentation` sections (duplicated content moved to AGENTS.md).
- `AGENTS.md` grew a canonical-source-of-truth blockquote preamble at the
  top, a consolidated `## Documentation` section listing every artifact
  in docs/ + VERSION + CHANGELOG with markdown links, an updated Project
  structure diagram (adds VERSION, .active-context.example.md,
  .active-context.md, docs/), and a `## Koni-Docs` section naming the
  two conventions adopted by this repo (Pattern B from US-1.2 +
  AGENTS-canonical from US-1.4) with pointers into the skill template.
- Story: [US-2.4](sprints/stories/US-2.4-apply-agents-canonical.md).

**This repo — `assignee:` migration to GitHub login**
- 4 pre-existing story files (US-1.1, US-2.1, US-2.2, US-2.3) updated
  `assignee: AnhMTV` (git `user.name`) → `assignee: saltict` (GitHub login).
- US-1.1 implementation notes updated: 24 commits → **22 commits** (actual
  count); added contributor table attributing 20 commits to `saltict`
  and 2 commits to `bluezdot`.
- Story: [US-1.3](sprints/stories/US-1.3-rule-15-assignee-github-login.md).

**This repo — CHANGELOG.md location**
- Relocated `CHANGELOG.md` from repo root → `docs/CHANGELOG.md` to match
  the skill's §0 orientation. Six cross-references updated (docs/README.md,
  AGENTS.md, US-1.1, US-2.3, archive/sprint-2026-W19.md, PRD). No
  dangling root references survive. Decision recorded as
  [CONTEXT D10](CONTEXT.md).
- Story: folded into [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md)
  (AC-2 rewritten "at repo root" → "at docs/, not repo root"; new AC-5
  for cross-reference cleanup; TASK-2.3.4 for the relocation).

**Skill — EPIC-1 reopened then closed**
- EPIC-1 (`koni-docs foundation`) was `done` at v0.1.0; reopened in
  sprint-2026-W22 to track three new stories (US-1.2 active-context
  split, US-1.3 RULE-15, US-1.4 AGENTS-canonical convention). All three
  ship in v0.2.0; EPIC-1 closes at 100% (`status: done`).

### Fixed

**Cosmetic — `vv0.1.0` double-prefix in synced epic table**
- First sync pass against US-1.1 (which had `version_shipped: v0.1.0`)
  produced `vv0.1.0` in the EPIC-1 Stories table — `agile-sync-up.mjs`
  unconditionally prepends `v` to whatever `version_shipped` contains.
  Fixed by changing US-1.1 frontmatter to bare semver (`0.1.0`).
  Codified as [LESSONS §4](LESSONS.md). RULE-16 (formalize bare-semver
  `version_shipped`) remains deferred for a later EPIC-1 sprint.

### Notes

Decisions recorded in [CONTEXT.md](CONTEXT.md) (append-only per RULE-7):

| ID | Decision | Story |
|---|---|---|
| D6 | Dogfood koni-docs on this repo | sets up EPIC-2 |
| D7 | Adopt file-extracted Active Context pattern (Pattern B) | US-1.2 / US-2.2 |
| D8 | Adopt RULE-15 — `assignee:` is GitHub login | US-1.3 |
| D9 | AGENTS-canonical / CLAUDE-pointer convention | US-1.4 / US-2.4 |
| D10 | Relocate `CHANGELOG.md` from root → `docs/` per skill canon | folded into US-2.3 |

Architecture decisions surfaced in PRD §6: AD-6, AD-7, AD-8, AD-9.

### Followups (deferred to next sprint)

- **RULE-16** (bare-semver `version_shipped:`) — would close
  [LESSONS §4](LESSONS.md) cleanly. Needs template touch-ups across
  story / epic / sprint / PRD frontmatter and a sweep of existing
  `version_shipped` values across consumer repos. Filed for a later
  EPIC-1 sprint.
- **EPIC-3** (catalog expansion: plugin-skill pattern + first non-docs
  Koniverse skill) — backlog. Needs an `/office-hours` brainstorm to
  scope US-3.1 + identify the second skill candidate. Will likely open
  sprint-2026-W2x once EPIC-3 stories are scoped.
- **CI gate** — GitHub Action running
  `skills/koni-docs/scripts/__tests__/sync-test.mjs` on every PR.
  Currently runs locally only. Open question in
  [ARCHITECTURE.md](ARCHITECTURE.md).

### Contributors

Sprint-2026-W22: **1 contributor, 7 stories, 17 points, 0 outside-help**.

| GitHub login | Git name | Stories shipped | Points |
|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-2.4 | 17 |

Sprint retrospective: see
[sprints/archive/sprint-2026-W22.md §Retrospective](sprints/archive/sprint-2026-W22.md).

**Commit**: v0.2.0 release commit — to be tagged at sprint-W22 close. SHA
will be backfilled by `changelog-backfill-commits.mjs` at pre-commit.

---

## [0.1.0] — 2026-05-27 — koni-docs skill — initial release — v0.1.0

First public cut of the `koni-docs` skill: a documentation-management skill
that standardizes how Koniverse projects produce and maintain PRD,
ARCHITECTURE, CHANGELOG, CONTEXT, LESSONS, SETUP, and sprint artifacts.
Distributable via `npx skills add Koniverse/Koni-Skills --skill koni-docs`.

### Added
- `skills/koni-docs/SKILL.md` — core skill instructions, 9 project-agnostic
  rules, 7 CLAUDE.md trigger points, pipeline integration map
  (BMad → GStack → Superpowers → Koni-docs).
- `skills/koni-docs/references/rules.md` — 9 enforced rules with severity,
  compliance steps, and grep checks.
- `skills/koni-docs/references/sprint-system.md` — agile conventions,
  5-layer consistency check, script inventory.
- `skills/koni-docs/references/templates.md` + per-type template files
  (`brief.md`, `prd.md`, `architecture.md`, `changelog.md`, `context.md`,
  `lessons.md`, `setup.md`, `epic.md`, `story.md`, `sprint.md`,
  `design-spec.md`, `okr.md`, `integration.md`) — BMad-grade templates,
  one file per document type, each with section index, per-section
  guidance, and a filled mini-example.
- `skills/koni-docs/references/bmad-template-analysis.md` — BMad pipeline →
  koni-docs mapping reference.
- `skills/koni-docs/scripts/` — bundled automation:
  `generate-status.mjs` (regenerate STATUS.md kanban),
  `agile-sync-up.mjs` (propagate story status through 5 doc layers),
  `agile-inject-tasks.mjs` (regenerate Tasks from AC),
  `agile-backfill-fields.mjs` (backfill frontmatter fields),
  `changelog-backfill-commits.mjs` (replace `pending` SHAs with real ones).
- `skills/koni-docs/scripts/__tests__/sync-test.mjs` — self-contained
  integration test that exercises all 5 sync scripts against a fixture in
  tmpdir.
- `README.md`, `AGENTS.md`, `CLAUDE.md` — project scaffolding for the
  Koni-Skills meta-repo.
- `docs/superpowers/specs/2026-05-06-koni-docs-skill-design.md` and
  `docs/superpowers/plans/2026-05-06-koni-docs-skill-implementation.md` —
  early design + implementation plan, preserved for reference.

### Changed
- Distribution moved from manual file copy to `npx skills add` /
  `npx skills experimental_install`, with `skills-lock.json` tracking
  installed skills and content hashes.
- Epic template Stories table extended from 4 to 5 columns (added Goal).
- PRD template expanded §1–§11 to match BMad full output standard.
- Story + CHANGELOG status emojis extended with `🗑️ deprecated` for
  stories retired before shipping.
- `agile-sync-up.mjs` handles both 4-col and new 5-col EPIC tables and
  per-epic PRD §11 tables.

### Fixed
- `agile-sync-up.mjs` story-row matcher no longer false-matches `US-1.1`
  against `US-1.11` (refined boundary regex).
- Sync scripts now skip story files that lack an `id` frontmatter field
  and log a warning instead of crashing.

### Contributors

**22 commits** landed between 2026-05-06 and 2026-05-26 across **2
contributors**. Per [RULE-15](../skills/koni-docs/references/rules.md),
GitHub login is the canonical identifier (the git `user.name` may
differ — `AnhMTV` is `saltict` on GitHub; see
[CONTEXT D8](CONTEXT.md)).

| GitHub login | Git name | Commits | Areas |
|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | 20 | Skill core, templates, automation, tests |
| [`bluezdot`](https://github.com/bluezdot) | bluezdot | 2 | Template robustness, script story-parsing fixes |

**Commit breakdown by area** (all rolled up into [US-1.1](sprints/stories/US-1.1-koni-docs-initial-release.md)):

- **Skill core + scaffolding** (`saltict`, 10 commits):
  `5ee3bf7` first commit · `f150ca7` design spec · `b5bfe95` pipeline integration
  spec update · `72746cc` implementation plan · `3cf7d9d` 9 rules reference ·
  `41832a0` templates reference · `9fd0607` sprint-system reference ·
  `3937a47` SKILL.md core · `6bd799f` README/AGENTS/CLAUDE scaffolding ·
  `7819f42` install instructions in README · `e443007` npx skills CLI switch.
- **Template polish** (`saltict`, 5 commits):
  `ab1adee` ARCHITECTURE template · `8d55421` BRIEF + PRD §1-§7 + BMad analysis ·
  `aeadfbe` Goal column in Epic Stories table · `435a012` PRD §1-§11 expansion ·
  `3b75119` per-type template split (one file per doc type, AD-4).
- **Automation + tests** (`saltict`, 4 commits):
  `3f62985` bundle automation scripts · `1b4127b` agile-sync-up 5-col EPIC +
  per-epic PRD §11 · `1ebaba0` self-contained integration test ·
  `29898ca` `epicStoryRowMatcher` boundary regex refinement
  ([LESSONS §1](LESSONS.md)).
- **Template + script robustness** (`bluezdot`, 2 commits):
  `facd9a6` `🗑️ deprecated` status for story + changelog templates ·
  `44f9c01` sync scripts skip files missing `id:` instead of crashing
  ([LESSONS §2](LESSONS.md)).

**Commit**: v0.1.0 release commit — git tag `v0.1.0` to be applied at
sprint-2026-W22 close alongside v0.2.0.
