---
stepsCompleted:
  - brief
  - prd-v0.1
  - arch-v0.1
inputDocuments:
  - BRIEF.md
  - skills/koni-docs/SKILL.md
classification:
  projectType: Skill catalog / Developer tooling
  domain: AI agent skill distribution + documentation discipline
  complexity: Medium
  projectContext: Greenfield (skill catalog) + Brownfield (koni-docs already shipped)
workflowType: 'prd'
lastEdited: '2026-07-01'
editHistory:
  - date: '2026-05-27'
    changes: >-
      Initial PRD — codifies koni-docs v0.1.0 release + EPIC-2 dogfood scope +
      EPIC-3 catalog vision.
  - date: '2026-05-27'
    changes: Add EPIC-4 (Docs preview tooling — koni-docs-viewer) + FR-15..FR-18.
  - date: '2026-06-26'
    changes: >-
      EPIC-3 opens — add FR-20 (koni-setup bootstrapper) + mark FR-10 shipped;
      US-3.2 ships koni-setup v0.9.0 in sprint-2026-W26.
  - date: '2026-06-27'
    changes: >-
      Add FR-21 (koni-harness — Agentic Loop standard + portable gate); US-3.3
      ships koni-harness v0.10.0 in sprint-2026-W26.
  - date: '2026-06-27'
    changes: >-
      Add FR-22 (koni-harness Phase 2 — single-story loop-runner); US-3.4 ships
      koni-harness v0.11.0 in sprint-2026-W26.
  - date: '2026-06-27'
    changes: >-
      Add FR-23 (koni-harness P3a — context-loader); US-3.5 ships koni-harness
      v0.12.0 in sprint-2026-W26.
  - date: '2026-06-27'
    changes: >-
      Add FR-24 (koni-harness P2.5 — sprint-sequencer); US-3.6 ships
      koni-harness v0.13.0 in sprint-2026-W26.
  - date: '2026-06-28'
    changes: >-
      Add FR-25 (koni-harness P3b — multi-tool session adapters); US-3.7 ships
      koni-harness v0.14.0 in sprint-2026-W26 — harness roadmap complete.
  - date: '2026-06-28'
    changes: >-
      FR-9 shipped (plugin-skill pattern + koni-nextjs reference); US-3.1 ships
      v0.15.0 in sprint-2026-W26 — EPIC-3 fully delivered.
  - date: '2026-06-28'
    changes: >-
      Add EPIC-5 + FR-26 (koni-qc — QC methodology & coverage skill); US-5.1
      ships v0.16.0 in sprint-2026-W26 (built by dogfooding koni-harness).
  - date: '2026-06-30'
    changes: >-
      Refine FR-20 (no scope change): koni-setup's per-repo baseline is now the
      Koniverse core trio (koni-docs + koni-harness + koni-qc) wired in + the
      koni-harness gate installed at setup (was koni-docs alone). v0.20.0;
      CONTEXT D17. v0.20.1 graded-hardening (koni-qc skill-grading 84.5 →
      96.25/100): fixed a CRITICAL zsh word-split in the bootstrap loop + tree
      drift + CSO; LESSONS §9.
  - date: '2026-06-30'
    changes: >-
      Add FR-29 (unit-coverage layer): per-function unit testing below the AC↔TC
      matrix — koni-qc owns the standard, Dev authors, koni-harness drives it in
      Execute + gates it at Self-verify. US-5.4 ships v0.23.0 (EPIC-5); CONTEXT
      D20.
  - date: '2026-07-01'
    changes: >-
      Add FR-30 (koni-qc automation spine): generate → report → sync → CI,
      closing the gaps a real koni-qc deployment on koni-erp-02 exposed (specs
      authored but every TC manual, no tests/epic tree, empty test-reports, no
      story write-back, no CI). koni-qc now defines spec→test generation, a
      reporter contract, story write-back, and a CI-gate/runner bootstrap — the
      delegated "run/report tooling" becomes a contract, not a name-drop. US-5.5
      ships v0.24.0 (EPIC-5); CONTEXT D21.
  - date: '2026-07-01'
    changes: >-
      Add FR-31 (test-doc standardization): an ERP-02-vs-Senti-Quant audit found
      the standard drifts on fresh adoption because it was prose with no
      scaffold or checker. Feeds the fix into all three generators — koni-qc
      (report-path MUST + validator, STRATEGY.md home, tests/epic migration
      step, PROPOSED: 3rd Covered-by state, TC-ID reservation, non-GHA CI
      branch), koni-setup (scaffold both trees + STRATEGY.md + drift audits),
      koni-docs (reconcile the legacy test-reports/runs path to the unified
      EPIC-NN/<MMDDYYYY> layout). US-5.6 ships v0.25.0 (EPIC-5); CONTEXT D22.
      Refines FR-26/FR-28/FR-30.
  - date: '2026-07-01'
    changes: >-
      Add FR-32 (whole-project QC): a koni-qc learning note from Koni-ERP-02
      (ERP LESSONS §213) found whole-repo QC came out worse than Senti-Quant on
      five concerns left to operator memory. Adds references/whole-project-qc.md
      — the layer above the per-epic lifecycle: stand up the QA-tracking epic
      (coverage story per app epic + infra/process + ownership model), author
      the strategy, artifact-location MUSTs, require ≥1 execution, a
      Definition-of-Done, and a depth bar (no thin stubs). US-5.7 ships v0.26.0
      (EPIC-5); CONTEXT D23. Refines FR-26/FR-28/FR-30/FR-31.
  - date: '2026-07-01'
    changes: >-
      Add FR-33 (koni-harness multi-agent orchestration): the harness ran
      single-agent (one story at a time). Adds a parallel execution mode —
      swarm.sh (read-only wave planner over sprint.sh's ready set) + references/
      parallel-orchestration.md: Tier A sprint swarm (one worker per ready
      story, git worktree each, wave-by-wave over the DAG) + Tier B within-story
      fan-out, with a gate-per-worktree + integration-gate + human-merge
      contract. No stage or gate change. US-3.8 ships v0.27.0 (EPIC-3); CONTEXT
      D24. Extends FR-21/FR-22/FR-24.
  - date: '2026-07-03'
    changes: >-
      Add FR-36 (koni-qc field-hardening from the ERP 100% drive): frozen parse
      contract (exact TC regex + header-skip + self-test; two real field bugs),
      shipped reference reporter with the broken-handle enforcer (supersedes the
      D21 no-vendor clause), OPS-DEPLOY 4th Covered-by form, quality-bar Band D
      (density gate), design-docs-first mandate at Frame (read system design in
      full + TD contract + UI-state inventory, authored from code if absent),
      live-harness recipes, CI-with-services + typecheck gate, fan-out repoint
      contract, density telemetry + denominator honesty. US-5.9 ships v0.33.0
      (EPIC-5); CONTEXT D30; LESSONS §10.
  - date: '2026-07-03'
    changes: >-
      Add FR-37 (koni-qc learning harness): absorb the ERP-02 test-doc reorg
      (per-US spec split under test-cases/EPIC-N/, date-first reports + summary/
      rollups, test-plan folded into index.md, legacy accepted), DESIGN-REVIEW
      as the 5th Covered-by form, lane-aware env-pending enforcement + the
      covered formula, and regression-learning.md (bug -> REG TC + class finding
      + generalization sweep; four-mode miss post-mortem; mandatory CHANGELOG +
      git-log change sweep with the change-coverage ledger). US-5.10 ships
      v0.34.0 (EPIC-5); CONTEXT D31; LESSONS §11.
  - date: '2026-07-03'
    changes: >-
      Refine FR-21 (story-granularity rule, v0.35.0): koni-harness Frame gains
      the anti-sprawl hard rule (one story = one deliverable; rounds extend the
      anchor story; refinements get no story; retired IDs never reused).
      Applied: US-5.6 -> US-5.3 round 2; US-5.9 + US-5.10 -> US-5.8 rounds 2-3
      (EPIC-5 10 -> 7 stories, points preserved). CONTEXT D33; LESSONS §13.
  - date: '2026-07-03'
    changes: >-
      Refine FR-21 + FR-22 (story-lint, v0.36.0): US frontmatter completeness
      becomes a blocking release-commit gate — checks/story-lint.sh + a
      13-assertion self-test (mandatory fields, integer points, id-filename
      match, sprint-window sanity, same-day pending window).
  - date: '2026-07-04'
    changes: >-
      Refine FR-21 + FR-22 (lessons loop always-on, v0.37.0): read-with-citation
      at Frame/Execute entry (Lessons applied: line; story-lint rule 6,
      date-gated 2026-07-04) + write-with-verdict at the Doc gate (new
      lesson-capture release-commit check: a LESSONS.md entry or an explicit
      "Lessons: none new" with reason). The gate enforces recording, never
      judgment. CONTEXT D35; LESSONS §14.
  - date: '2026-07-04'
    changes: >-
      Refine FR-21 + FR-26 (design-first UI + doc-completeness bar, v0.38.0):
      DESIGN.md is an Execute input — component x state matrix enumerated and
      "Design applied:" cited before UI code (new design-first release-commit
      check, added-lines only); /design-review confirms instead of discovers.
      Doc gate gains the doc-completeness bar: diff-mapped doc surface,
      depth judged by koni-qc whole-project-qc §6 (act without the diff,
      evidence not adjectives). CONTEXT D36; LESSONS §15. First run caught
      the 2026-05 W21->W22 drift (7 v0.2.0 stories moved; correction notes).
      CONTEXT D34.
  - date: '2026-07-03'
    changes: >-
      Refine FR-26 + FR-35 (no new capability — derivation rules): close the 10x
      case-volume gap (exemplar 154 TC/US vs koni-qc ~3 TC/US on ERP-02).
      test-design step 9 makes cross-multiplying shared classes x surfaces
      (auth-guard x endpoints, validation x fields, RLS x tables x 3,
      error/status/event/provider/UI-state x each) a mandatory derivation step +
      atomicity rule; qc-workflow Self-review adds a density sanity warn (<~30
      atomic cases for an API/UI US = presumed under-derived); layered-suites
      adds the living-suite rule (round bugs feed cases back); traceability
      states the 3-slot rule is a floor, not a stopping criterion. v0.32.0;
      CONTEXT D29.
  - date: '2026-07-02'
    changes: >-
      Add FR-35 (koni-qc layered suites + report quality): lift authoring +
      reports to the exemplar bar (US-001.001 API/functional suites + the
      backup's checklist rounds). layered-suites.md — API/functional split,
      by-endpoint tables (real actuals, response time, DB changes), required API
      classes (auth guard/RLS/events/audit), orthogonal coverage matrices
      (endpoint/status-code/error-code · pages/components/a11y), named test-data
      registry, Open Questions, round-based bug-fix retest; report-quality.md —
      honest actuals + 9 required report sections + evidence rule. US-5.8 ships
      v0.31.0 (EPIC-5); CONTEXT D28. Extends FR-26/FR-28/FR-30.
  - date: '2026-07-01'
    changes: >-
      Refine FR-26 + FR-21 (no new capability): UI design-review must pass BOTH
      DESIGN.md AND the shadcn standard (mandatory). koni-qc — canonical
      criteria in nfr.md §UI (shadcn primitives + design tokens + cva/cn + Radix
      a11y), test-design step 8 makes a UI AC undone without a TC-*.UI-*
      design-review case, carried through traceability/qc-workflow/SKILL;
      koni-harness — the Review stage's /design-review now enforces DESIGN.md +
      shadcn (still a process step, not a gate). v0.30.0; CONTEXT D27.
  - date: '2026-07-01'
    changes: >-
      Refine FR-21 (koni-harness loop — no new capability): add an explicit
      lesson-capture step at the Doc + Version gate. The loop only read
      LESSONS.md (Execute skim); now it also WRITES one when Review/Execute
      surfaces a trap/pattern (via koni-docs templates/lessons.md, same commit)
      — a conditional process step, not a deterministic gate. v0.29.0; CONTEXT
      D26.
  - date: '2026-07-01'
    changes: >-
      Add EPIC-6 + FR-34 (koni-agent-monitoring): the catalog's first product/
      client skill — a per-machine Claude Code monitor that streams a
      content-free projection of session usage (agent count, model, token/cost)
      to the ERP Agent Ops ingest API. Ships runnable code (pure privacy core +
      reporter + installer + a mandatory content-leak test), built from the
      FINAL ERP handoff through koni-harness. US-6.1 ships v0.28.0; CONTEXT D25.
  - date: '2026-06-30'
    changes: >-
      Refine FR-21/FR-27: ≥95/100 skill-grading is the catalog pass standard
      (was ≥90), enforced by the harness Review stage; re-grade the whole skill
      after any change, not just the diff. v0.22.0; CONTEXT D19; LESSONS §8.
      (Also v0.21.1: re-grade fixes that returned koni-qc to 97 after it slipped
      to ~91.)
  - date: '2026-06-30'
    changes: >-
      Refine FR-26/FR-28 (no scope change): test coverage is organized by user
      story, not epic — US is the unit of coverage/traceability/QC planning,
      epic stays the file container; mandatory maps_to.us. v0.21.0; CONTEXT D18.
  - date: '2026-06-30'
    changes: >-
      Add FR-28 (test-organization standard): one canonical docs/tests taxonomy
      + by-epic test-code layout + 3-place sync rule; koni-qc owns the standard,
      koni-setup scaffolds it, koni-qc self-scaffolds otherwise. US-5.3 ships
      v0.19.0 (EPIC-5). TC-ID stays TYPE-based — CONTEXT D16.
  - date: '2026-06-30'
    changes: >-
      Add FR-27 (skill-grading — QC for skill artifacts, reusable): koni-qc
      gains a skill-grading rubric + the harness Review stage invokes it when
      building a skill; US-5.2 ships v0.18.0 in sprint-2026-W26 (EPIC-5).
  - date: '2026-06-30'
    changes: >-
      Refine FR-21 + FR-26 (no scope change): v0.17.0 tool-split rule (implement
      = Anthropic Skills only; Superpowers/gstack = brainstorm/review) +
      `/design-review` and koni-qc in the loop's review stage; v0.17.1 pins the
      review order + TDD-as-discipline; v0.17.2 graded-hardening lifts
      koni-harness to 96/100 and koni-qc to 97/100. Logged as CONTEXT D15 +
      LESSONS §8.
---
# Koni-Skills — Product Requirements Document

**Version:** 0.34.0 (see [VERSION](../VERSION) for the live value)
**Date:** 2026-06-28
**Status:** v0.1.0 → v0.8.0 shipped across sprint-2026-W21 (v0.2.0 dogfood) + sprint-2026-W22 (v0.3.0 → v0.8.0); v0.9.0 shipped in sprint-2026-W26. EPIC-1, EPIC-2, EPIC-4 all done at 100%. EPIC-4 closed at v0.8.0 with Pillar G shipping the full koni-erp-02 5-view `/project` tracker (Board + Calendar + Analysis + Warning validator + URL `?view=` + footer/UNION/sort). **EPIC-3** (catalog expansion) is **done**: v0.9.0 `koni-setup` (US-3.2, FR-10/FR-20) + v0.10.0–v0.14.0 `koni-harness` (US-3.3, FR-21..FR-25, five phases) + v0.15.0 the plugin-skill pattern & `koni-nextjs` (US-3.1, FR-9) — three non-docs skills plus the documented plugin-extension pattern. **EPIC-5** (QC tooling) is **done**: v0.16.0 `koni-qc` (US-5.1, FR-26) — a QC methodology & coverage-intelligence skill, built by dogfooding the koni-harness loop. **Post-ship refinements (v0.17.0–0.17.2)** hardened both non-docs skills: a tool-split rule (implement = Anthropic Skills only; Superpowers/gstack = brainstorm/review), a fixed review order with `/design-review` + koni-qc, and a multi-skill grading pass that lifted koni-harness to **96/100** and koni-qc to **97/100** (see [CONTEXT D15](CONTEXT.md), [LESSONS §8](LESSONS.md)). v0.18.0 then makes that grading **reusable** — `skill-grading` (US-5.2, FR-27): koni-qc QC for skill artifacts, invoked by the harness Review stage when building a skill. v0.19.0 adds the **test-organization standard** (US-5.3, FR-28): one canonical `docs/tests/` taxonomy + by-epic test-code layout + 3-place sync, owned by koni-qc and scaffolded by koni-setup (synthesized from the Senti-Quant QA reorg). v0.20.0 makes the **Koniverse core trio** (koni-docs + koni-harness + koni-qc) + the harness gate the **koni-setup baseline** — a new repo documents, gates, and QCs itself on day 0 (refines FR-20; CONTEXT D17).
**Dual-Audience:** Human stakeholders + LLM implementation agents

> **Scope boundary:** This PRD contains business requirements only.
> Implementation details (script internals, exact CLI argument shapes,
> Mermaid renderers) live in [`ARCHITECTURE.md`](ARCHITECTURE.md) and in
> the consuming skill's own `SKILL.md`.

---

## Executive Summary

### Vision

Koni-Skills is the **single source of truth for Koniverse-specific AI
agent skills**: a versioned, lockfile-tracked catalog that any Koniverse
product repo can consume via `npx skills add Koniverse/Koni-Skills --skill <name>` and update via `npx skills update`. The catalog grows
horizontally (more skills) without forcing consumer repos to refactor.

**Positioning Statement:** Koni-Skills — one repo, one upgrade path, for
every Koniverse agent-supported workflow.

### What Makes It Special

1. **Koniverse-specific by design** — the skills encode Koniverse's
   actual rules (9 in `koni-docs`), pipelines (BMad → GStack →
   Superpowers → Koni-docs), and tooling conventions. Generic skill
   libraries cannot.
2. **Distribution via `npx skills`** — content-hashed lockfile,
   experimental\_install on a fresh clone, agent-agnostic activation.
   No manual `git submodule`, no copy-paste decay.
3. **Plugin-ready** — `koni-docs` declares a plugin slot
   (`plugins: [supabase, nextjs]` (under the `koni-docs:` block)) so technology-specific
   rules ship as their own skills and extend the core rule set
   without forking it.

### Core Philosophies

| # | Philosophy                               | Implication                                                                                               |
| - | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1 | **Skill = self-contained directory**     | A skill bundles its own SKILL.md, scripts, references, assets; no cross-skill imports                     |
| 2 | **Rules > tribal knowledge**             | Every recurring "we always do X" gets codified into a numbered rule with a grep check                     |
| 3 | **Templates carry tone, not just shape** | Every template ships a filled mini-example that demonstrates voice, depth, and cross-reference discipline |
| 4 | **Pre-commit gate is the discipline**    | Doc updates that defer to "follow-up commits" are RULE-1 violations                                       |
| 5 | **Dogfood first**                        | This repo's own docs MUST be managed by `koni-docs` itself                                                |

### Project Classification

| Dimension    | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Project Type | Skill catalog / Developer tooling                             |
| Domain       | AI agent skill distribution + documentation discipline        |
| Complexity   | Medium — moderate surface, high enforcement bar               |
| Context      | Greenfield (catalog) + Brownfield (koni-docs already shipped) |
| Target Users | Koniverse engineers/PMs + AI coding agents                    |

### Why Now

- Multiple Koniverse projects (Koni-ERP-02, Koni-Finance-Final) have
  independently arrived at similar `Docs/` shapes — a catalogable
  pattern has emerged.
- The `npx skills` CLI matured to the point where lockfile-tracked,
  GitHub-sourced skill distribution is reliable end-to-end.
- Agents (Claude Code, Codex, Cursor, Gemini, Copilot) all converged on
  a `CLAUDE.md` / `AGENTS.md` activation surface, so a single
  integration block reaches every tool.

---

## Success Criteria

### User Success Metrics

| ID   | Metric                                                                     | Target                                | Measurement                                              |
| ---- | -------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| US-1 | Koniverse projects consuming `koni-docs` via `npx skills`                  | 3 in 3 months / 8 in 12 months        | Manual audit of `skills-lock.json` across consumer repos |
| US-2 | Time from "new project init" to "full docs scaffolding"                    | < 5 minutes                           | Stopwatch on a fresh clone                               |
| US-3 | Engineer can locate the canonical template for any doc type without asking | 100% via SKILL.md §5 activation table | Onboarding walkthrough                                   |

### Business Success Metrics

| ID   | Metric                                                  | Target                | Measurement                         |
| ---- | ------------------------------------------------------- | --------------------- | ----------------------------------- |
| BS-1 | Cross-project doc-layout divergence (audited quarterly) | 0 critical findings   | Manual audit                        |
| BS-2 | Re-implementations of sync scripts in consumer projects | 0                     | Grep `consumer/scripts/agile-*`     |
| BS-3 | Skills published from this repo                         | 1 (v0.1) → 4+ (12 mo) | `npx skills list` count             |

### Technical Success Metrics

| ID   | Metric                                              | Target      | Measurement                                                    |
| ---- | --------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| TS-1 | CLI + guard regression suites pass on every push     | 100%        | `npm test --prefix packages/koni-docs` exit 0 (pre-push gate) |
| TS-2 | Skill load size (SKILL.md core body)                | ≤ 500 lines | `wc -l skills/koni-docs/SKILL.md`                              |
| TS-3 | `koni-docs` 13 rules are individually grep-checkable | 100%        | Each rule in `references/rules.md` has a grep example          |

### Aha Moment Targets

1. **Aha Moment #1 — One-line install.** A Koniverse engineer in a new
   project runs `npx skills add Koniverse/Koni-Skills --skill koni-docs`,
   adds the 12-line integration block to `CLAUDE.md`, and the agent
   immediately produces docs in the canonical structure.
   *Target:* < 5 minutes from clone to first canonical PRD draft.
2. **Aha Moment #2 — `npx skills update` just works.** A skill author
   ships a template improvement; consumer projects run `npx skills
   update koni-docs` and pick up the change without merge conflicts in
   their own `Docs/`.
   *Target:* 0 manual reconciliation steps on a typical update.

---

## Product Scope

### Phase 1: MVP — koni-docs core (v0.1.0, SHIPPED)

**Goal:** Ship a usable `koni-docs` skill that any Koniverse project can
consume to standardize its docs.

| Area                 | Included                                                                                                                | Excluded                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Rules                | 9 project-agnostic rules with grep checks                                                                               | Tech-stack-specific rules (deferred to plugins)           |
| Templates            | 13 templates (brief, prd, arch, changelog, context, lessons, setup, epic, story, sprint, design-spec, okr, integration) | Project-specific templates (those live in consumer repos) |
| Scripts              | 5 bundled scripts: status, sync-up, inject-tasks, backfill-fields, changelog-backfill                                   | A CI integration GitHub Action (deferred)                 |
| Distribution         | `npx skills add` + `experimental_install` + lockfile                                                                    | Web UI / marketplace                                      |
| Pipeline integration | BMad / GStack / Superpowers mapping documented in SKILL.md                                                              | Auto-import of BMad artifacts (manual map for now)        |

**MVP Exit Criteria** (met as of v0.1.0):

- `skills/koni-docs/` directory complete with SKILL.md + references + scripts.
- Self-contained sync-script regression test passes.
- README.md documents `npx skills add` install path.

### Phase 2: Dogfood + integration polish — v0.2.0 (SHIPPED — sprint-2026-W22 archived)

**Goal:** Apply `koni-docs` to this repo itself, prove the integration
block + scripts work in a real project that is NOT a downstream consumer.

| Area                      | Additions                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo docs                 | Full `docs/` scaffolding (PRD, ARCH, BRIEF, CONTEXT D1–D10, LESSONS sections 1–4, SETUP, sprints subtree)                                                   |
| CLAUDE.md / AGENTS.md     | Slim CLAUDE.md (28 lines) + AGENTS.md as canonical source-of-truth + Active Context Pattern B in `.active-context.md`                                       |
| Root + docs/ artifacts    | `VERSION` at repo root (`0.2.0`) + `docs/CHANGELOG.md` (canonical per SKILL.md §0) with \[Unreleased] + \[0.2.0] + \[0.1.0] entries + real contributor data |
| Skill additions in flight | Active Context Pattern B (US-1.2) · RULE-15 catalog 9→10 (US-1.3) · AGENTS-canonical convention §3.1 (US-1.4)                                               |
| Sprint discipline         | At least one active sprint file driven by EPIC-2 stories                                                                                                    |

**Phase 2 Exit Criteria:**

- `agile-sync-up.mjs --docs-path docs/` runs clean against this repo.
- `STATUS.md` regenerates and accurately reflects EPIC-1 / EPIC-2 state.
- CLAUDE.md `Active Context` block matches story reality.

### Phase 3: Catalog expansion — v0.3+ (BACKLOG)

**Goal:** Move beyond `koni-docs` alone; ship plugin skills and the
first non-docs Koniverse skill.

| Area             | Additions                                                             |
| ---------------- | --------------------------------------------------------------------- |
| Plugin skills    | `koni-supabase`, `koni-nextjs` extending `koni-docs` rule set         |
| Domain skills    | At least one non-docs Koniverse skill (TBD candidate during planning) |
| Eval integration | `skill-creator` evals wired into CI for every skill in the catalog    |

### Scope Boundaries (All Phases)

**Permanently Out of Scope:**

- A hosted web UI for browsing skills — the GitHub repo + `npx skills list` is sufficient.
- A cross-vendor skill marketplace — Koni-Skills is Koniverse-internal-first.
- Auto-PR refactoring of consumer repos when a skill updates — opt-in pull, not push.

---

## User Journeys

### Journey 1: New Koniverse project adopts koni-docs (Primary persona)

**Persona:** Koniverse engineer starting `koni-newproduct` from scratch.

**Trigger:** First commit. The engineer wants the docs discipline of
Koni-ERP-02 from day one.

1. **Clone + scaffold:** `git init`, basic `package.json`, first commit.
2. **Install koni-docs:** `npx skills add Koniverse/Koni-Skills --skill koni-docs`.
   Lockfile (`skills-lock.json`) tracks the install.
3. **Wire CLAUDE.md:** copy the 12-line Koni-Docs Integration block,
   set `docs_path: docs/` and `active_sprint: sprint-YYYY-WNN`.
4. **Ask the agent for the BRIEF:** "Create the product brief." Agent
   loads `references/templates/brief.md`, produces a filled `docs/BRIEF.md`.
5. **Outcome:** within 5 minutes, the project has a canonical
   `docs/BRIEF.md`, a placeholder PRD, and a pre-commit checklist the
   agent will enforce on every commit going forward.

**Success Metric:** time-to-first-canonical-PRD-draft < 5 minutes.

### Journey 2: Skill author improves a template

**Persona:** Maintainer of this repo iterating on a `koni-docs` template.

**Trigger:** A consumer project's story file revealed a template gap.

1. **Edit `skills/koni-docs/references/templates/story.md`** with the
   improved guidance + new example.
2. **Run regression tests:** `npm test --prefix packages/koni-docs` (and, if a skill doc
   changed, `python3 skills/koni-docs/scripts/check-references.py <skill-dir>`).
3. **Bump VERSION + CHANGELOG** for the new koni-docs release (this repo's `VERSION`
   bumps in lockstep with the skill).
4. **Commit, tag, push.** GitHub release is now available.
5. **Outcome:** consumer projects run `npx skills update koni-docs` on
   their next sprint and pick up the improvement.

**Success Metric:** 0 merge conflicts in consumer `docs/` folders after update.

### Journey 3: Agent runs the pre-commit gate

**Persona:** Claude Code (or Codex / Cursor / Gemini / Copilot) in a
consumer project, about to commit a story-shipping diff.

**Trigger:** Agent finished implementing US-X.Y; calling commit.

1. **Read pre-commit checklist** from `docs/README.md` and the
   activation table in `skills/koni-docs/SKILL.md` §3c.
2. **Verify each item:** VERSION bumped, CHANGELOG entry, story
   `status: done`, all AC ticked, CLAUDE.md Active Context refreshed.
3. **Run the CLI:** `npx koni-docs validate` + `npx koni-docs status`
   (`sync` is deliberately not run — CONTEXT D39).
4. **Commit with conventional prefix** (RULE-14: `feat:` / `fix:` etc.).
5. **Outcome:** the commit lands with all 5 doc layers consistent. No
   "docs follow-up" PR is required.

**Success Metric:** RULE-1/2/5/6 violations caught at pre-commit, not at review.

---

## Personas

### P1 — Koniverse engineer/PM (primary)

- **Trigger:** starting a new product repo OR onboarding to an existing
  Koniverse repo that already consumes `koni-docs`.
- **Pain:** every project's docs layout drifted in subtly different ways;
  no shared upgrade path; sync scripts re-implemented N times.
- **Uses the product:** runs `npx skills add` once, then relies on the
  agent + bundled scripts for all subsequent doc work.
- **Won't pay if:** the install is more than 1 command; the integration
  block is more than \~12 lines; the upgrade path requires merge gymnastics.

### P2 — AI coding agent (secondary)

- **Trigger:** session-start when the project's `CLAUDE.md` references
  `koni-docs`.
- **Pain:** prior projects had agent-rules-in-a-million-places; no
  unambiguous activation table; rules and templates not co-located.
- **Uses the product:** reads the skill's `SKILL.md` body, loads only
  the template files matching the user's request (token-efficient),
  runs the bundled scripts deterministically.
- **Won't pay if:** the skill body exceeds 500 lines (defeats on-demand
  loading); rules conflict; activation table is ambiguous.

---

## Background & Strategic Decisions

Decisions that shaped this product. Full rationale lives in
[CONTEXT.md](CONTEXT.md); the table here is the AD-N summary surfaced for
reviewers.

| ID    | Decision                                                                 | Date       | Rationale                                                                                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AD-1  | Skill = self-contained directory with bundled scripts/references         | 2026-05-06 | Lets `npx skills add` work with a single source-of-truth path; no cross-skill imports                                                                                                                                            |
| AD-2  | Distribution via `npx skills add` + lockfile (`skills-lock.json`)        | 2026-05-07 | Content-hashed install matches the maturity of npm/pnpm; no submodule pain                                                                                                                                                       |
| AD-3  | 9 project-agnostic rules + plugin slot for stack-specific rules          | 2026-05-08 | Keeps the core rule set sharp; stack rules ship as their own skills                                                                                                                                                              |
| AD-4  | Templates split one-file-per-type under `references/templates/`          | 2026-05-22 | Lets agents load only the template matching the user's request (token efficiency)                                                                                                                                                |
| AD-5  | BMad pipeline integration (Koni-docs = output standardizer)              | 2026-05-06 | Don't replace BMad's planning power — standardize what it produces                                                                                                                                                               |
| AD-6  | This repo dogfoods its own skill (EPIC-2)                                | 2026-05-27 | If we can't run `koni-docs` on its own repo, consumer projects will hit the same gaps                                                                                                                                            |
| AD-7  | Active Context split: Pattern B (file-extracted) recommended for teams   | 2026-05-27 | Inline CLAUDE.md Active Context creates merge conflicts on every parallel-branch sprint update; gitignored `.active-context.md` makes conflicts zero                                                                             |
| AD-8  | Adopt RULE-15: `assignee:` is GitHub login, never git user.name          | 2026-05-27 | git `user.name` is per-machine; GitHub login is the only identifier surviving across @-mentions, PR reviewers, `gh api users/<login>`, CODEOWNERS, audit attribution                                                             |
| AD-9  | AGENTS-canonical / CLAUDE-pointer convention (recommended for consumers) | 2026-05-27 | AGENTS.md reaches Cursor/Gemini/Codex/Copilot natively; duplicating content in CLAUDE.md creates drift; slim CLAUDE.md = less merge churn (pairs with Active Context Pattern B from AD-7)                                        |
| AD-10 | Sync scripts MUST escape all dynamic input before regex construction     | 2026-05-27 | Discovered when `agile-sync-up.mjs` crashed on Koni-Finance-Final US-1.34 (story title contained `[`, `]`, `(`, `.`); BLOCKER class — any script building `new RegExp()` from story content must treat that content as untrusted |

---

## Domain-Specific Requirements

> Omitted — Koni-Skills has no domain-compliance constraints (no PII, no
> regulated workflows). If a future skill operates in a regulated domain
> (e.g. compliance-doc generation), that skill's own PRD section will
> introduce domain requirements scoped to it.

---

## Functional Requirements

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Priority | Status                                | Epic            |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- | --------------- |
| FR-1  | Ship `skills/koni-docs/SKILL.md` with 9 rules, activation table, pipeline map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P0       | ✅ shipped (v0.1.0)                    | EPIC-1          |
| FR-2  | Provide 13 BMad-grade templates under `references/templates/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P0       | ✅ shipped (v0.1.0)                    | EPIC-1          |
| FR-3  | Bundle 5 automation scripts (`generate-status`, `agile-sync-up`, `agile-inject-tasks`, `agile-backfill-fields`, `changelog-backfill-commits`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P0       | ✅ shipped (v0.1.0)                    | EPIC-1          |
| FR-4  | Self-contained sync-script regression test that builds its own fixture                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | P0       | ✅ shipped (v0.1.0)                    | EPIC-1          |
| FR-5  | Distribution via `npx skills add Koniverse/Koni-Skills --skill <name>` + lockfile                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | P0       | ✅ shipped (v0.1.0)                    | EPIC-1          |
| FR-6  | Apply koni-docs to this repo itself — full `docs/` scaffolding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | P0       | ✅ shipped (v0.2.0)                    | EPIC-2          |
| FR-7  | Wire koni-docs `Active Context` block into CLAUDE.md + AGENTS.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | P0       | ✅ shipped (v0.2.0)                    | EPIC-2          |
| FR-8  | Seed `VERSION` (repo root) + `docs/CHANGELOG.md` (per SKILL.md §0) from existing git history                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | P1       | ✅ shipped (v0.2.0)                    | EPIC-2          |
| FR-9  | Define plugin-skill pattern (Supabase, Next.js) with extension hooks + ship one reference plugin (`koni-nextjs`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | P1       | ✅ shipped (v0.15.0)                   | EPIC-3          |
| FR-10 | Ship at least one non-docs Koniverse skill                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | P2       | ✅ shipped (v0.9.0)                    | EPIC-3          |
| FR-11 | Document file-extracted Active Context pattern (Pattern B) so teams avoid CLAUDE.md merge churn                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | P0       | ✅ shipped (v0.2.0)                    | EPIC-1          |
| FR-12 | Adopt RULE-15: `assignee:` is GitHub login, never git user.name (rule catalog 9 → 10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | P0       | ✅ shipped (v0.2.0)                    | EPIC-1          |
| FR-13 | Document AGENTS-canonical / CLAUDE-pointer convention in skill + apply to this repo (CLAUDE.md slim, AGENTS.md canonical with absorbed Documentation section)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P1       | ✅ shipped (v0.2.0)                    | EPIC-1 + EPIC-2 |
| FR-14 | Real-world template + script audit: fix regex-escape BLOCKER, add Carry/Why/Parked/Closed/Risks sprint sections, multi-commit field, RULE-16 (bare semver), `*.vi.md` convention; robustness against 198+266-story reference repos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | P0       | ✅ shipped (v0.3.0)                    | EPIC-1          |
| FR-15 | `packages/koni-docs-viewer/` scaffold + Astro Node SSR — runtime-configurable docs path, no monorepo coupling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P0       | ✅ shipped (v0.4.0-dev.0)              | EPIC-4          |
| FR-16 | `koni-docs-viewer` CLI bin with `--port/--host/--open/--watch/--config` + optional `koni-docs.config.{json,mjs}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | P0       | ✅ shipped (v0.7.0)                    | EPIC-4          |
| FR-17 | Schema-graceful behavior (plain mode when no `sprints/`) + chokidar+SSE live reload on `.md` change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | P0       | ✅ shipped (v0.7.0)                    | EPIC-4          |
| FR-18 | Publish `@koniverse/docs-viewer@0.1.0` + dogfood `npm run docs:preview` in this repo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | P1       | 📋 Backlog                            | EPIC-4          |
| FR-19 | `/project` page multi-view expansion — wire Board (6-column kanban + group-by), Calendar (month grid + commits-per-day overlay via local `git log`), Analysis (KPIs, status breakdown, 30-day completion chart, 26-week commit heatmap, per-epic progress with UNION semantics), and Warning (replace US-4.20's filter-only impl with the koni-erp-02 §4.8 required-field-by-status validator). Add `?view=` URL persistence + legacy `?warn=1` compat shim + footer metadata strip + default sort (status → priority → updated). Reference design: koni-erp-02 `Docs/pod-project-screen.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                               | P0       | ✅ shipped (v0.8.0)                    | EPIC-4          |
| FR-20 | Ship `koni-setup` — a day-0 project bootstrapper/onboarder skill: detect repo profile (code / devops / content), scaffold the canonical skeleton + wire `.claude`/`.agents` skills + CLAUDE.md/AGENTS.md/`.active-context` integration + agile npm scripts + install the shared skill set (BMAD pack / gstack / koni-docs / profile extras), with an onboard/audit path for existing repos. Delegates all documentation-body templates to koni-docs (no duplication).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | P1       | ✅ shipped (v0.9.0)                    | EPIC-3          |
| FR-21 | Ship `koni-harness` (Phase 1) — the tool-neutral Koni Agentic Loop standard (6 stages + gates + context layers + portability contract) and a portable, dependency-free POSIX pre-commit/pre-push gate: a self-locating `gate-runner` + line-format `gates.conf` + 6 built-in checks (version-phase / changelog-anchor / credential-scan / koni-docs-validate / story-status / passthrough), installed **additively** (chain/merge behind marker blocks, never clobber). Claude-Code-first, tool-neutral core portable to Gemini/Codex. Composes BMAD/Superpowers/gstack/koni-docs; reproduces none.                                                                                                                                                                                                                                                                                                                                                                                                                                                         | P1       | ✅ shipped (v0.14.0; design-trio v0.63.0, graded ≥95 v0.64.0, count-guard v0.65.0, docs v0.65.1, review contract v0.66.0) | EPIC-3          |
| FR-22 | Ship `koni-harness` Phase 2 — a tier-aware **single-story loop-runner**: a dependency-free POSIX `loop.sh` state spine (`start`/`status`/`enter`/`gate`/`complete`, gitignored `.koni-harness/loop-state`) + an instruction brain (`loop-runner.md`) that drives one story through the six stages, Claude-first via subagents with a portable manual fallback; the Phase-1 gate is the commit backbone. Additive install (vendors `loop.sh`, gitignores loop-state).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | P1       | ✅ shipped (v0.14.0)                   | EPIC-3          |
| FR-23 | Ship `koni-harness` P3a — a **context-loader**: a portable, read-only POSIX `context-load.sh` emitting a concise session digest of the context layers (verbatim `.active-context` snapshot + VERSION/active\_sprint + `D<n>`/`<n>` decision & lesson title indexes + canonical pointers). Digest-not-dump, deterministic extraction, graceful on missing layers. Additive install (vendors `context-load.sh`); tool session-start wiring is P3b.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | P1       | ✅ shipped (v0.14.0)                   | EPIC-3          |
| FR-24 | Ship `koni-harness` P2.5 — a **sprint-sequencer**: a portable, read-only POSIX `sprint.sh` over koni-docs story frontmatter. `next` = dependency-ready story selection (not-`done` + all `depends_on` resolve to `done`) ordered by priority, suggesting `loop.sh start <id>` and distinguishing complete-vs-blocked; `status` = counts/points/blocked-with-reasons. Reads status (never writes); cross-story complement to `loop.sh`. Additive install (vendors `sprint.sh`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | P1       | ✅ shipped (v0.14.0)                   | EPIC-3          |
| FR-25 | Ship `koni-harness` P3b — **multi-tool session adapters**: a portable, read-only POSIX `session-start.sh` briefing (composes the P3a digest + P2.5 `next`) + `session-adapters.md` documenting per-tool session-start wiring (Claude `SessionStart` hook as a manual-merge JSON snippet; Gemini/Codex/Cursor equivalents). Additive (vendors `session-start.sh`); never auto-edits `settings.json`. Completes the koni-harness roadmap (P1/P2/P3a/P2.5/P3b).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | P1       | ✅ shipped (v0.14.0)                   | EPIC-3          |
| FR-26 | Ship `koni-qc` — a **compose-first QC methodology & coverage-intelligence skill**: turns koni-docs inputs into Silicon-Valley-grade, fully-traceable test docs (test-design techniques + edge taxonomy + a **mandatory AC↔TC coverage matrix** + security-led NFR + risk-based priority + a quality-bar rubric) and drives QC execution. Delegates templates→koni-docs, execution→gstack, gate/loop→koni-harness. Synthesizes the weak `koni-docs.backup` baseline + the `Koni-Finance` standard; pilot on customize-network proves the uplift. Built by dogfooding the koni-harness loop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | P1       | ✅ shipped (v0.16.0)                   | EPIC-5          |
| FR-27 | Ship **skill-grading** — QC for *skill artifacts* (not product features), reusable across the catalog: koni-qc gains a four-dimension rubric (triggering / rule-robustness / author-blind content / best-practices, each /25 → /100, to a hard bar) that **delegates** the eval engines (skill-creator, writing-skills, `superpowers:code-reviewer`, Anthropic best-practices) and never reproduces them; koni-harness invokes it in the **Review** stage when the deliverable is a skill, so the loop builds *and verifies the building of* new skills.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | P1       | ✅ shipped (v0.18.0)                   | EPIC-5          |
| FR-28 | Ship the **test-organization standard** — a single canonical `docs/tests/` taxonomy (test-plan / test-cases / test-reports/EPIC-NN/<date> / bug-bash / audits + standing docs), a by-epic + file-suffix test-code layout, and the 3-place sync rule (spec ↔ code ↔ coverage story). koni-qc owns the standard; koni-setup scaffolds the tree at setup; koni-qc self-scaffolds it when koni-setup isn't used; koni-docs owns the templates. Synthesized from the matured Senti-Quant QA reorg; TC-ID stays TYPE-based (CONTEXT D16).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | P1       | ✅ shipped (v0.19.0 + 0.25.0)          | EPIC-5          |
| FR-29 | Ship the **unit-coverage layer** — per-function unit testing *below* the AC↔TC matrix: koni-qc owns the standard (`unit-coverage.md` — the per-function rule + RED→GREEN→REFACTOR + a coverage bar), Dev authors the tests, and koni-harness drives it in Execute + gates it at Self-verify (new logic needs unit tests meeting the bar; a `unit-coverage` passthrough check is the deterministic backing). Closes the "green build, zero unit tests" hole. CONTEXT D20.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | P1       | ✅ shipped (v0.23.0)                   | EPIC-5          |
| FR-30 | Ship the **koni-qc automation spine** — generate → report → sync → CI, closing the gaps a real koni-qc deployment on koni-erp-02 exposed (specs authored but every TC manual, no `tests/epic/` tree, empty `test-reports/`, no story write-back, no CI). koni-qc defines the missing procedure in `test-automation.md`: §1 spec → runnable TC-ID-named test (+ materialise the tree), §2 the **reporter contract** (runner JSON → parse TC-ID → `report.md`), §3 story write-back (Status + coverage% + link), §4 CI gate + runner bootstrap (`test:cov` + `.github/workflows` + `gates.conf` rows). The delegated "run/report tooling" becomes a portable contract, not a name-drop; the repo runner executes, koni-harness/CI enforces. CONTEXT D21.                                                                                                                                                                                                                                                                                                      | P1       | ✅ shipped (v0.24.0)                   | EPIC-5          |
| FR-31 | Ship **test-doc standardization** — convert the koni-qc test-doc standard from *documented* to *generated + enforced* so it stops drifting on fresh adoption (an ERP-02-vs-Senti-Quant audit found 10 deviations because the standard was prose with no scaffold/checker). Feeds the fix into the three generators: **koni-qc** — report path is a MUST + validator (`EPIC-NN`/`MMDDYYYY`, no flat/ISO), `docs/tests/STRATEGY.md` as the one strategy home, `<app>/tests/epic/` migration as a step, `PROPOSED:` blessed as the 3rd `Covered-by` state, TC-ID reservation (spec is sole authority), a non-GitHub-Actions CI branch; **koni-setup** — scaffold *both* trees (`docs/tests/` + `<app>/tests/epic/`) + `STRATEGY.md`, plus onboarding drift checks; **koni-docs** — reconcile the legacy `test-reports/runs/…` path to the unified `test-reports/EPIC-NN/<MMDDYYYY>/report.md` layout (koni-qc owns the path, koni-docs the body). CONTEXT D22.                                                                                                 | P1       | ✅ shipped (v0.19.0 + 0.25.0)          | EPIC-5          |
| FR-32 | Ship **whole-project QC** — the koni-qc layer above the per-epic lifecycle so QC-ing a whole repo reaches the Senti-Quant bar by procedure, not diligence (from an ERP-02 learning note / ERP LESSONS §213 where whole-repo QC came out worse on five concerns left to operator memory). `references/whole-project-qc.md`: stand up the **QA-tracking epic** (a coverage story per app epic + infra/process stories + the QA ownership model), **author the strategy** (`STRATEGY.md` + per-epic `test-plan/`), **artifact-location MUSTs** (`audits/QC-PLAN-BY-US-<date>.md`, per-epic dated reports), **execution required** (≥1 real `report.md`, not specs-only), a whole-project **Definition-of-Done** checklist, and a **depth bar** ("creating a file is not authoring it" — no thin stubs, spot-check 3). CONTEXT D23.                                                                                                                                                                                                                             | P1       | ✅ shipped (v0.26.0)                   | EPIC-5          |
| FR-33 | Ship **koni-harness multi-agent orchestration** — a parallel execution mode so the harness stops running one story at a time: `scripts/swarm.sh` (a **read-only** wave planner that single-sources the dependency-ready set from `sprint.sh` and emits one worker per ready story — `git worktree add` + `loop.sh start <id> --state …` — priority-ordered, `--cap`-limited, plus the integrate + re-plan step) + `references/parallel-orchestration.md` (Tier A sprint swarm wave-by-wave over the DAG, one git worktree per story; Tier B within-story fan-out of a stage's independent sub-tasks; the gate-per-worktree + integration-gate + human-owns-final-merge contract; portable fallback = run the same plan sequentially). No stage or gate change — parallelism is orchestration around the loop; the planner is the tool-neutral core, spawning is the thin per-tool adapter (Claude Agent `isolation:'worktree'` / Workflow). CONTEXT D24.                                                                                                    | P1       | ✅ shipped (v0.27.0)                   | EPIC-3          |
| FR-34 | Ship **koni-agent-monitoring** — the catalog's first **product/client** skill: a per-machine Claude Code monitor that streams a **content-free** projection of session usage (agent count, model, token/cost burn, light activity — never prompt/code/tool-IO) to the ERP `POST /api/agent-ops/ingest`, so the admin Agent Ops dashboard shows live usage. Ships runnable code: `agent-report-core.mjs` (pure privacy projection + strict allowlist + pricing), `report.mjs` (4 Claude Code hooks + local queue + detached non-blocking drain with backoff/idempotency), `install.sh` (additive installer: chmod-600 config + hook wiring), a **mandatory content-leak test**, + SKILL.md/5 references. Mirrors the ERP ingest schema (the schema wins). Built from the FINAL ERP handoff through koni-harness. CONTEXT D25.                                                                                                                                                                                                                                | P1       | ✅ shipped (v0.28.0)                   | EPIC-6          |
| FR-35 | Ship **koni-qc layered suites + the report-quality bar** — lift test-case authoring and execution reports to the exemplar bar (the US-001.001 API/functional suites + the `koni-docs.backup` checklist-round practice). `layered-suites.md`: the **API/functional layer split** with mutual scope contracts, API **by-endpoint** tables (real Actual Response · Response Time · DB Changes) + four required API classes (auth guard · RLS isolation incl. write-rejection · events+idempotency · audit), functional **category prefixes** + UI-component traceability + per-case evidence, the **orthogonal coverage matrices** (endpoint/status-code/error-code · pages/components/validation+a11y), the **named test-data registry** with Used-In, `## Open Questions`, and **round-based bug-fix retest**. `report-quality.md`: the **honest-actuals rule**, nine required report sections (skipped/blocked reason+action · failed-by-category root cause · perf stats · implementation status · recommendations …), and the evidence rule. CONTEXT D28. | P1       | ✅ shipped (v0.31.0 + 0.33.0 + 0.34.0) | EPIC-5          |
| FR-36 | Ship **koni-qc field-hardening** — absorb the ERP-02 100% drive evidence: **frozen reporter parse contract** (exact TC regex — `[A-Z]+` dropped E2E/A11Y — + header-skip + shipped self-test) with the **reference reporter** `scripts/qc-report.mjs` and its **broken-handle enforcer** (automated Covered-by must resolve to a passing test; broken = 0); **`OPS-DEPLOY:<runbook>`** as the 4th Covered-by form (honest 100%); **Band D density gate**; **design-docs-first** Frame mandate (system design read in full + TD contract + UI-state inventory, authored from code if absent); **live-harness recipes** (2-credential RLS, tenant isolation, self-seed e2e, boot exclusions); CI-with-services + typecheck gate; per-epic fan-out repoint contract; density telemetry + denominator honesty. Supersedes the D21 no-vendored-reporter clause. CONTEXT D30.                                                                                                                                                                                     | P1       | ✅ shipped (v0.31.0 + 0.33.0 + 0.34.0) | EPIC-5          |
| FR-37 | Make **koni-qc a learning harness**: absorb the ERP-02 field reorg (per-US spec split `test-cases/EPIC-N/` with `index.md` frame; **date-first** `test-reports/YYYY-MM-DD/` + `auto-coverage.md` + `summary/` rollups; `test-plan/` folded into `index.md`; legacy shapes accepted); **`DESIGN-REVIEW:<ref>` as the 5th fixed Covered-by form** (🎨 own column); **lane-aware enforcement** (⏳ `env-pending`: live-cadence handles verified in their own CI lane, never broken locally; coverage formula `covered = automated + env-pending + design + ops-deploy`); and **`regression-learning.md`** — every escaped bug → red-first `REG` TC + class finding + step-9 generalization sweep, four-mode miss post-mortem, and the **mandatory CHANGELOG + git-log change sweep** with the change-coverage ledger (a fix with no REG TC = a confirmed miss). CONTEXT D31.                                                                                                                                                                                    | P1       | ✅ shipped (v0.31.0 + 0.33.0 + 0.34.0) | EPIC-5          |
| FR-38 | Give a story a **calendar commitment distinct from the sprint cadence**: an optional `due` frontmatter field (bare `YYYY-MM-DD`) for a deadline imposed from *outside* the weekly rhythm — a contract date, a customer demo, an audit window. A sprint is a cadence; `due` is a commitment. **No inheritance**: a story without `due` has no deadline, and `sprint.end` is never used as a fallback — an implicit deadline on every story would bury the two that carry a real one. `koni-docs status` renders a `## ⏰ Deadlines` section above the kanban (overdue / due-soon / on-track, `--due-soon-days` default 3); `koni-docs validate` **errors** on a value that is not a real date and **warns without blocking** on a story merely past its date — a gate that punishes recording a slip teaches people to delete the date. Moving an existing `due` requires a CONTEXT entry (old → new → why). CONTEXT D37. | P1 | ✅ shipped (v0.39.0 + v0.40.0) | EPIC-1 |
| FR-39 | Give **koni-qc a detailed, adversarial security-testing capability**: `references/security-review.md` — threat-model-first framing; a per-category case-derivation taxonomy (authn, authz/IDOR, RLS, injection {SQL/NoSQL/command/path/template/XXE}, XSS, deserialization/RCE, SSRF, secrets/crypto, session/CSRF, data-exposure/PII); the adversarial **identify → refute → confidence-filter** review (independent refuters must disprove exploitability before a finding is reported); a finding schema with a concrete **exploit scenario**; severity + confidence rubrics; a **false-positive discipline** (hard exclusions, precedents, a signal-quality bar) so the report stays trusted; escaped-vuln → red-first REG test; and the release security sign-off. Composes: gstack runs the exploit, `live-harness.md` supplies the 2-credential RLS harness, koni-harness holds the gate, koni-docs owns the report body. `nfr.md` §Security becomes the shortlist + trigger, pointing here. Adapts Anthropic's `/security-review` methodology. CONTEXT D38. | P1 | ✅ shipped (v0.53.0 + v0.54.0) | EPIC-5 |
| FR-40 | **koni-harness uses the koni-qc security-review**: a Review-stage trigger (run the security review when a change crosses a security trust boundary) + a **warn-level, opt-in `security-review` gate** — a staged change matching a repo-declared boundary glob (`.koni-harness/security-paths`) that ships without the review gets a WARN pointing at koni-qc `security-review.md`; suppressible via `.koni-harness/security-review-ack`; proven by a plant→assert test run against three mutations. Builds the gate koni-qc named as "koni-harness's to own". | P2 | ✅ shipped (v0.55.0) | EPIC-3 |
| FR-41 | Ship **koni-ea-dev** — the standard for **programming a correct MQL5 Expert Advisor** (MetaTrader 5): the EA lifecycle & event model (OnInit/OnTick/OnDeinit/OnTradeTransaction/OnTimer), input & naming conventions, CTrade order placement, new-bar/closed-bar signal discipline, indicator-handle lifecycle + `CopyBuffer`/`ArraySetAsSeries`, fixed & risk-% sizing, SL/TP with the broker stop level, DCA/grid/breakout/trend mechanics, position-by-magic management, risk & money-management coding (equity breaker, daily loss, spread/gap/session filters, the pending-fill **margin pre-check**), the MQL5 production pitfalls (repaint, backtest mode, filling mode, handle leak, self-recovery), compiling clean, and the shared Koni `.mqh` library conventions. Synthesized from the `Trading-Resources` strategy-EA archive + the `Senti-Quant` `terminal_manager` MQL5 library; a methodology skill (like koni-qc), not a code generator. **Scope is the programming**; the operational lifecycle is its sibling FR-42. (Shipped as `koni-ea` v0.57.0, scoped to programming v0.58.0, renamed to `koni-ea-dev` at the v0.59.0 split.) **Relocated to the `koni-ea` repo — further work happens there, not here.** | P2 | ✅ shipped (v0.57.0; renamed koni-ea-dev v0.59.0) · 📦 moved to `koni-ea` | EPIC-3 |
| FR-42 | Ship **koni-ea-ops** — the standard for the **operational lifecycle of an MQL5 Expert Advisor**: the `v<X.YY>` version scheme + folder layout, minor-vs-major bump rules (a `.set` change on a live instance is a new minor), the commit-is-release model, the `registry.yaml` / MagicNumber source-of-truth (Notion-assigned, never hand-picked) and instance bindings + the collision audit, deployment to a MetaTrader 5 terminal (attach / `.set` / AutoTrading / Journal verification) + production `.ex5` via the compile service, the release backtest requirements (Every Tick Based on Real Ticks, ≥3 months, metrics + HTML archive) and the deprecated release-SOP caveat, and the per-version EA documentation template. The operational sibling of FR-41; split out of the original koni-ea so a coding standard and an ops runbook stop sharing one skill (LESSONS §32). **Relocated to the `koni-ea` repo — further work happens there, not here.** | P2 | ✅ shipped (v0.59.0) · 📦 moved to `koni-ea` | EPIC-3 |
| FR-43 | **koni-setup reverse-engineering pass**: a brownfield onboard derives the repo's system model *from the code* before the repo is called onboarded — five ordered passes (business overview → architecture → interfaces → component inventory → interaction flows), an evidence-and-confidence discipline (`observed` / `(inferred)` / unknown, every claim carrying a path, unknowns becoming `backlog` stories rather than invented text), a user-approval gate before anything is written to `docs/`, and a landing map into **existing** koni-docs artifacts (BRIEF / ARCHITECTURE / CONTEXT D-entry) — no parallel doc tree. Wired into the SKILL.md mode table, §3 step 3, and the onboarding audit matrix. | P2 | ✅ shipped (v0.70.0) | EPIC-3 |
| FR-44 | **koni-harness Frame protocol + stage-applicability table**: the front half of the loop gets the specification the back half has. A stated bar for what is worth asking the user (different answers must produce different work; anything answerable from `AGENTS.md`/`CONTEXT.md`/`DESIGN.md` or a `grep` is unread context, not a question), a **frozen** question/answer file format (exact regexes, gitignored scratch at `.koni-harness/frame/`), an answer-routing table whose architectural entries become `CONTEXT.md` D-entries, and a per-element run/skip condition table so a skipped process step is skipped by a *named condition* recorded in the story rather than by silence. Documented, not gated (harness principle 2). | P1 | ✅ shipped (v0.70.0) | EPIC-3 |
| FR-45 | **koni-harness guard evaluator + CI**: one command (`scripts/__tests__/run-all.sh`) runs every harness self-test and then **derives coverage from `gates.conf`** — a check named by no suite is reported `UNCOVERED` and fails the run, so adding a gate row without a test is a red build rather than a quiet gap. Scoped to the *shipped* config (a consumer's local rows are exempt), with `MIN_SUITES`/`MIN_CHECKS` floors so an emptied corpus fails instead of passing. Closes the 5/10 self-test gap (4 new suites, 42 assertions) and adds the repo's first CI: three jobs on push/PR, the evaluator run under both dash and bash. | P1 | ✅ shipped (v0.70.0) | EPIC-3 |
| FR-46 | **koni-docs concern extensions — the second extension axis**: `plugins:` answers *what the repo is built with*; `concerns:` answers *what it must guarantee*, independent of stack. Both nested under `koni-docs:`. Defines the two enrolment modes (opt-in, and **trigger-enforced** — a repo cannot opt out of a review by omitting a line), requires each concern to name a machine-readable trigger surface, and documents `security` (koni-qc's method + `.koni-harness/security-paths` + the harness `security-review` gate) as the worked example. Names the axis the catalog already ran unnamed; adds no speculative concern packs. | P2 | ✅ shipped (v0.70.0) | EPIC-3 |

Priority: `P0` = must-ship/blocking, `P1` = high, `P2` = medium, `P3` = nice-to-have.

---

## Non-Functional Requirements

| ID    | Requirement                                                  | Target         | Status                                               |
| ----- | ------------------------------------------------------------ | -------------- | ---------------------------------------------------- |
| NFR-1 | `SKILL.md` body stays compact for on-demand loading          | ≤ 500 lines    | ✅ met (currently \~290 lines for koni-docs SKILL.md) |
| NFR-2 | Each rule has a grep-style verification example              | 10/10          | ✅ met (extends to RULE-15 in v0.2.0)                 |
| NFR-3 | Sync scripts complete on a 100-story repo in < 5 s wall time | < 5 s          | ✅ met (test fixture asserts)                         |
| NFR-4 | English-only across code/comments/docs/commits (RULE-13)     | 100%           | ✅ enforced manually; lint TBD                        |
| NFR-5 | Skill install is one command; upgrade is one command         | 1 command each | ✅ met via `npx skills add` / `update`                |

---

## Glossary

| Term                | Definition                                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill               | A self-contained directory with `SKILL.md` + bundled `scripts/` / `references/` / `assets/` that an agent loads at activation.                                                                                                         |
| Plugin skill        | A skill that extends another skill's rule set for a specific tech stack (e.g. `koni-supabase` extends `koni-docs`).                                                                                                                    |
| BMad                | Upstream brainstorming + planning toolset; produces brief, PRD, ARCH, epics, stories that koni-docs standardizes.                                                                                                                      |
| Active Context      | The 5-line block between `koni-docs:auto-update` markers that the agent refreshes at 7 trigger points. Lives inline in `CLAUDE.md` (Pattern A — solo dev) OR in a gitignored `.active-context.md` (Pattern B — recommended for teams). |
| 5-layer consistency | Story / Epic / PRD Epics & User Stories / PRD Functional Requirements / Sprint must all reflect the same story status.                                                                                                                 |

---

## Epics & User Stories

### EPIC-1 — Koni-docs skill (foundation + ongoing enhancements)

**Goal:** Ship and continuously evolve a usable, BMad-pipeline-compatible documentation skill that any Koniverse project can `npx skills add`.

**Status:** 🚧 in-progress (v0.1.0 shipped; v0.2.0 in flight with US-1.2)

| Story                                                                | Title                                                                  | Status | Version |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------ | ------- |
| [US-1.1](sprints/stories/US-1.1-koni-docs-initial-release.md)        | Koni-docs skill — initial release (v0.1.0)                             | ✅ done | v0.1.0  |
| [US-1.2](sprints/stories/US-1.2-active-context-split-pattern.md)     | Add file-extracted active-context pattern (Pattern B)                  | ✅ done | v0.2.0  |
| [US-1.3](sprints/stories/US-1.3-rule-15-assignee-github-login.md)    | Add RULE-15: assignee = GitHub login (catalog 9 → 10)                  | ✅ done | v0.2.0  |
| [US-1.4](sprints/stories/US-1.4-agents-canonical-convention.md)      | Document AGENTS-canonical / CLAUDE-pointer convention in skill         | ✅ done | v0.2.0  |
| [US-1.5](sprints/stories/US-1.5-real-world-template-script-audit.md) | Real-world template + script audit (Koni-Finance-Final + senti\_quant) | ✅ done | v0.3.0  |
| [US-1.6](sprints/stories/US-1.6-story-deadlines.md)                  | Story deadlines — a `due` date beside the sprint cadence               | ✅ done | v0.39.0 + v0.40.0 |

### EPIC-2 — Dogfood koni-docs on Koni-Skills repo

**Goal:** Apply `koni-docs` to this repo itself so the meta-repo lives by the same rules it ships.

**Status:** 🚧 in-progress (sprint-2026-W22)

| Story                                                        | Title                                                 | Status | Version |
| ------------------------------------------------------------ | ----------------------------------------------------- | ------ | ------- |
| [US-2.1](sprints/stories/US-2.1-bootstrap-docs-structure.md) | Bootstrap full `docs/` scaffolding on Koni-Skills     | ✅ done | v0.2.0  |
| [US-2.2](sprints/stories/US-2.2-wire-integration-blocks.md)  | Wire koni-docs integration into CLAUDE.md + AGENTS.md | ✅ done | v0.2.0  |
| [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md)   | Seed VERSION + CHANGELOG.md from git history          | ✅ done | v0.2.0  |
| [US-2.4](sprints/stories/US-2.4-apply-agents-canonical.md)   | Apply AGENTS-canonical convention to this repo        | ✅ done | v0.2.0  |

### EPIC-3 — Koniverse skill catalog expansion

**Goal:** Move beyond `koni-docs` alone; ship plugin skills and the first non-docs Koniverse skill.

**Status:** ✅ done (sprint-2026-W26 — US-3.1..3.7 across v0.9.0→v0.15.0: koni-setup + the full koni-harness roadmap (gate/loop-runner/context-loader/sprint-sequencer/session-adapters) + the plugin-skill pattern with the `koni-nextjs` reference; closes FR-9 / FR-10 / FR-20–FR-25. EPIC-3 fully delivered)

> **Open to post-completion enhancement.** Two pillars landed after the original close: multi-agent orchestration (US-3.8, v0.27.0) and the **AI-DLC absorption** (US-3.25–US-3.28, v0.70.0 — FR-43–FR-46), five patterns taken from a comparative read of `awslabs/aidlc-workflows`. See [CONTEXT D43](CONTEXT.md).

| Story                                                              | Title                                                                                 | Status | Version         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------ | --------------- |
| [US-3.1](sprints/stories/US-3.1-plugin-skill-pattern.md)           | Plugin-skill pattern + koni-nextjs reference                                          | ✅ done | v0.15.0         |
| [US-3.2](sprints/stories/US-3.2-koni-setup-bootstrapper.md)        | koni-setup — Koniverse project bootstrapper & onboarder                               | ✅ done | v0.9.0          |
| [US-3.3](sprints/stories/US-3.3-koni-harness-agentic-loop.md)      | koni-harness — portable agentic-loop harness (5 phases, FR-21..25)                    | ✅ done | v0.10.0–v0.14.0 |
| [US-3.8](sprints/stories/US-3.8-harness-parallel-orchestration.md) | koni-harness parallel orchestration — multi-agent sprint swarm + within-story fan-out | ✅ done | v0.27.0         |
| [US-3.25](sprints/stories/US-3.25-reverse-engineering-onboard.md) | koni-setup reverse-engineering pass — derive a brownfield repo's system model from its code | ✅ done | v0.70.0 |
| [US-3.26](sprints/stories/US-3.26-frame-protocol.md) | Frame protocol + stage-applicability table — specify the front half of the loop | ✅ done | v0.70.0 |
| [US-3.27](sprints/stories/US-3.27-guard-evaluator-ci.md) | Guard evaluator — run every check self-test, prove coverage from `gates.conf`, add CI | ✅ done | v0.70.0 |
| [US-3.28](sprints/stories/US-3.28-concern-extensions.md) | Concern extensions — the second koni-docs extension axis (`concerns:`) | ✅ done | v0.70.0 |

### EPIC-4 — Docs preview tooling (koni-docs CLI + Astro SSR viewer)

**Goal:** Ship `@koniverse/koni-docs` — a globally-installable npm package combining a typed CLI (`status` / `sync` / `inject-tasks` / `backfill-fields` / `backfill-commits` / `preview` / `validate`) with an Astro SSR viewer that renders any koni-docs-shaped `docs/` folder. Schema-graceful fallback for non-Koni layouts. Viewer's `/project` page exposes the full koni-erp-02 5-view tracker (Table / Board / Calendar / Analysis / Warning).

**Status:** ✅ done (sprint-2026-W22; 36/36 stories shipped across v0.4.0-dev.0 → v0.8.0 with `@koniverse/koni-docs@0.7.0` published and v0.8.0 ready to publish. Decisions logged as [D11](CONTEXT.md))

See [EPIC-4.md](sprints/epics/EPIC-4.md) for the full 36-story breakdown organized by pillar (B = lib foundation, C = CLI subcommands, D = migration + polish, E = viewer scaffold + preview, F = viewer polish + validate + cleanup, G = project page multi-view expansion). Highlights:

| Story                                                               | Title                                                             | Status   | Version |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- | -------- | ------- |
| [US-4.1](sprints/stories/US-4.1-scaffold-and-ssr.md)                | Scaffold `packages/koni-docs/src/viewer` + Astro Node SSR         | ✅ done   | v0.6.0  |
| [US-4.2](sprints/stories/US-4.2-cli-bin-and-config.md)              | CLI bin (`--port/--host/--open/--watch`) + optional config file   | ✅ done   | v0.7.0  |
| [US-4.3](sprints/stories/US-4.3-graceful-schema-and-live-reload.md) | Schema-graceful fallback + chokidar/SSE live reload               | ✅ done   | v0.7.0  |
| [US-4.25](sprints/stories/US-4.25-cli-validate.md)                  | `koni-docs validate` subcommand + `validateFrRefs`                | ✅ done   | v0.7.0  |
| [US-4.28](sprints/stories/US-4.28-publish-v0.7.0.md)                | Publish `@koniverse/koni-docs@0.7.0` to npm                       | ✅ done   | v0.7.0  |
| [US-4.31](sprints/stories/US-4.31-viewer-board-view.md)             | Viewer `/project` Board view — 6-column kanban + group-by         | 🚧 ready | v0.8.0  |
| [US-4.32](sprints/stories/US-4.32-viewer-calendar-view.md)          | Viewer `/project` Calendar view — month grid + commits overlay    | 🚧 ready | v0.8.0  |
| [US-4.33](sprints/stories/US-4.33-viewer-analysis-view.md)          | Viewer `/project` Analysis view — KPIs / status / heatmap / epics | 🚧 ready | v0.8.0  |
| [US-4.34](sprints/stories/US-4.34-viewer-warning-validator.md)      | Viewer `/project` Warning view — required-field validator         | 🚧 ready | v0.8.0  |
| [US-4.35](sprints/stories/US-4.35-viewer-url-view-persist.md)       | Viewer `/project` `?view=` URL persist + `?warn=1` shim           | 🚧 ready | v0.8.0  |
| [US-4.36](sprints/stories/US-4.36-viewer-footer-union-sort.md)      | Viewer `/project` footer + UNION buckets + default sort           | 🚧 ready | v0.8.0  |

### EPIC-5 — Koniverse QC tooling

**Goal:** Give the catalog a quality-control capability — a skill that turns koni-docs inputs into Silicon-Valley-grade, fully-traceable test documentation and drives QC execution.

**Status:** ✅ done (sprint-2026-W27 — v0.16.0 → v0.34.0 ship `koni-qc` + its hardening rounds across 7 stories after the D33 consolidation, FR-26 → FR-37 excl. FR-33/34). See [EPIC-5.md](sprints/epics/EPIC-5.md).

| Story                                                             | Title                                                                                                                          | Status | Version                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------- |
| [US-5.1](sprints/stories/US-5.1-koni-qc.md)                       | koni-qc — QC methodology & coverage-intelligence skill                                                                         | ✅ done | v0.16.0                     |
| [US-5.2](sprints/stories/US-5.2-skill-grading.md)                 | skill-grading — QC for skill artifacts, wired into the harness build/verify loop                                               | ✅ done | v0.18.0                     |
| [US-5.3](sprints/stories/US-5.3-test-organization.md)             | test-organization (2 rounds) — taxonomy + scaffolding; round 2: standardize + enforce across the catalog (was US-5.6)          | ✅ done | v0.19.0 + v0.25.0           |
| [US-5.4](sprints/stories/US-5.4-unit-coverage.md)                 | unit-coverage — per-function unit-test process + Self-verify gate                                                              | ✅ done | v0.23.0                     |
| [US-5.5](sprints/stories/US-5.5-test-automation.md)               | test-automation — spec→test→run→report→sync→CI spine (from koni-erp-02 deployment)                                             | ✅ done | v0.24.0                     |
| [US-5.7](sprints/stories/US-5.7-whole-project-qc.md)              | whole-project QC — QA-tracking epic + Definition-of-Done + depth bar (ERP-02 learning note)                                    | ✅ done | v0.26.0                     |
| [US-5.8](sprints/stories/US-5.8-layered-suites-report-quality.md) | koni-qc field absorption (3 rounds) — exemplar bar; ERP 100%-drive hardening (was US-5.9); reorg + learning loop (was US-5.10) | ✅ done | v0.31.0 + v0.33.0 + v0.34.0 |
| [US-5.11](sprints/stories/US-5.11-security-review-capability.md)  | koni-qc security-review — adversarial security-testing method (threat model, per-category derivation, identify/refute/confidence-filter, decision-grade report); round 2 hardened after review | ✅ done | v0.53.0 + v0.54.0           |

### EPIC-6 — Agent Ops monitoring client

**Goal:** Give the catalog a client-side agent-observability skill — a per-machine Claude Code monitor that streams a content-free projection of session usage to the Koni ERP Agent Ops dashboard.

**Status:** ✅ done (sprint-2026-W27 — v0.28.0 ships `koni-agent-monitoring`, FR-34). See [EPIC-6.md](sprints/epics/EPIC-6.md).

| Story                                                     | Title                                                                                      | Status | Version |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ | ------- |
| [US-6.1](sprints/stories/US-6.1-koni-agent-monitoring.md) | koni-agent-monitoring — content-free Claude Code usage reporter (client for ERP Agent Ops) | ✅ done | v0.28.0 |
