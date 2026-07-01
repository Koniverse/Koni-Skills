---
id: US-6.1
title: "koni-agent-monitoring — content-free Claude Code usage reporter (client for ERP Agent Ops)"
epic: EPIC-6
status: done
priority: P1
prd_ref:
  - FR-34
arch_ref: []
depends_on: []
assignee: jindo9986
commit: pending
sprint: sprint-2026-W26
version_shipped: "0.28.0"
created: 2026-07-01
updated: 2026-07-01
---

## Goal

Build the **client** half of Koni Agent Ops: a Claude Code skill that, on each staff
machine, watches session transcripts and streams a **content-free** projection (metrics +
light activity — never prompt/code) to the ERP `POST /api/agent-ops/ingest`, so the admin
dashboard shows who's running how many agents, on which model, at what token/cost burn. It
is an installer + four hooks + a non-blocking reporter — no daemon.

## Background

The ERP side (ingest API, token mint, Live/History) shipped in Koni-ERP-02 (EPIC-13, through
US-13.6). The FINAL client spec is
`Koni-ERP-02/docs/handoffs/2026-07-01-koni-agent-monitoring-client.md`; the shipped endpoint
+ `src/lib/agent-ops/ingest-schema.ts` are the source of truth (the schema wins). Built
through koni-harness (tier-2; deliverable is a skill → Review = koni-qc skill-grading ≥95).
This is the first **product/client** catalog skill (ships runnable code, not just method);
new EPIC-6, CONTEXT D25.

## Acceptance criteria

- [x] **AC-1 (privacy core)** — `scripts/agent-report-core.mjs`: a pure, testable module —
  the strict session/event/metadata **allowlists**, `projectLine` (transcript line →
  names/counts/paths only, never text/tool-IO), `buildBatch` (accumulate → absolute
  snapshot + delta events), `costUsd`/`PRICING`, and `pick()` filtering the final batch to
  the allowlist (defence in depth).
- [x] **AC-2 (reporter I/O)** — `scripts/report.mjs`: hook entrypoint (reads the Claude Code
  hook JSON from stdin) → read new transcript lines from a per-session **byte offset**
  (advance only past complete lines; reset on truncation) → enqueue a batch → **spawn a
  detached drain and return** (never blocks). Drain: group by session, POST ≤500-event
  batches, `2xx`→drop, `401`→stop+warn+keep, `429`/`5xx`/network→keep+exponential backoff
  (jitter, cap ~5 min), buffer-cap trim.
- [x] **AC-3 (installer)** — `scripts/install.sh`: additive/idempotent — copy the reporter to
  `~/.koni-agent-monitoring/bin/`, write `config.env` (chmod 600, never committed), wire the
  four hooks (`--merge-hooks` via jq with a backup, else write+print the block; matches
  koni-harness's "settings.json merged manually" invariant).
- [x] **AC-4 (mandatory content-leak test)** — `scripts/__tests__/leak-test.mjs`: a fixture
  transcript full of prompt text, assistant responses, tool inputs/outputs, and file
  contents → assert the serialized batch contains **none** of them and **only** allowlisted
  keys (the client half of ERP LESSONS §214). Plus `core-test.mjs` (cost/projection/
  offset-no-double-count/idempotent-seq), `reporter-io-test.mjs` (hook e2e), `install-test.sh`.
- [x] **AC-5 (skill surface)** — `SKILL.md` (modes: install/verify/troubleshoot/privacy/
  contract; activation; reference index; description <1024) + 5 references
  (privacy-allowlist, ingest-contract, transcript-parsing, pricing, install), each with a
  Load-when + Contents TOC.
- [x] **AC-6** — all tests green (**89 assertions** across leak/core/reporter-io/install,
  sh+zsh); the skill graded **whole** ≥95 (D19 skill-grading + author-blind code review of
  the reporter); koni-docs updated + validate.

## Tasks

- [x] **TASK-6.1.1** — Read the handoff; design the skill (pure core + I/O reporter + installer + refs).
- [x] **TASK-6.1.2** — Build `agent-report-core.mjs` (allowlist projection + accumulate + pricing) TDD-first with the leak + core tests.
- [x] **TASK-6.1.3** — Build `report.mjs` (offset/queue/detached drain/backoff) + `install.sh` (hooks + chmod-600 config); e2e + install tests.
- [x] **TASK-6.1.4** — SKILL.md + 5 references.
- [x] **TASK-6.1.5** — koni-docs layer (EPIC-6/FR-34/version/CONTEXT/CHANGELOG/PRD/sprint) + whole-skill re-grade (D19).

## Implementation notes

- **Pure-core / thin-I/O split** is deliberate: all privacy logic lives in
  `agent-report-core.mjs` so the mandatory leak test exercises the exact code that builds the
  wire payload; `report.mjs` is only fs/queue/network. Node stdlib-only (no deps).
- **Non-blocking** is enforced by the hook spawning a `--drain` child (`detached` + `unref`)
  and `process.exit(0)` — the POST resolves in the child.
- **No double-count**: offsets advance only to the last `\n`; a partial trailing line is
  re-read next fire. `seq` is per-session monotonic (idempotency key with `session_id`).
- **Defence in depth**: projection never returns content, `buildBatch` writes only
  allowlisted keys, and `sanitizeSession()` drops any stray nested object / non-string array
  item from the final session — three layers, all covered by the leak test.
- **Review-round hardening** (from the D19 re-grade): populate `host`/`local_ip`/
  `account_email`/`started_at` (were allowlisted but unset); drop `400`/other-4xx batches
  instead of retrying forever; honor `Retry-After` on `429`; steal a stale drain lock (TTL);
  log buffer-cap gaps; cap tool names ≤80; `costUsd` coerces non-numeric fields → 0 (no NaN);
  add `--uninstall`; extend the leak test to the first-prompt fallback (proves the cap).

## Files modified

- Create: `skills/koni-agent-monitoring/SKILL.md`, `references/{privacy-allowlist,ingest-contract,transcript-parsing,pricing,install}.md`, `scripts/{agent-report-core.mjs,report.mjs,install.sh}`, `scripts/__tests__/{leak-test.mjs,core-test.mjs,reporter-io-test.mjs,install-test.sh,fixtures/transcript.jsonl}`

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [CONTEXT D25](../../CONTEXT.md) · [CHANGELOG 0.28.0](../../CHANGELOG.md)
- Spec: `Koni-ERP-02/docs/handoffs/2026-07-01-koni-agent-monitoring-client.md` (ERP EPIC-13 / US-13.1–13.6)
