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
