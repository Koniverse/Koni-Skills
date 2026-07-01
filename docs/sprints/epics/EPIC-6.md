---
id: EPIC-6
title: "Agent Ops monitoring client"
status: done
prd_ref: 'FR-34'
created: 2026-07-01T00:00:00.000Z
updated: 2026-07-01T00:00:00.000Z
---
## Goal

Give the Koniverse catalog a **client-side agent-observability skill**: a per-machine
Claude Code monitor that streams a **content-free** projection of session usage (agent
count, model, token/cost burn, light activity) to the Koni ERP Agent Ops dashboard — so
admins get live visibility without any prompt/code ever leaving the machine. The first
(and defining) delivery is `koni-agent-monitoring`.

## Overview

### Business context

The ERP side of Agent Ops (ingest API, token minting, Live/History dashboard) shipped in
Koni-ERP-02 (EPIC-13, through US-13.6). What was missing is the **client**: the thing on
each staff machine that watches Claude Code transcripts and reports usage. The handoff
`Koni-ERP-02/docs/handoffs/2026-07-01-koni-agent-monitoring-client.md` is the FINAL spec;
the ERP endpoint + `ingest-schema.ts` are the source of truth for the contract. This is
the first **product/client** skill in the catalog (vs the meta-skills koni-docs/qc/
harness/setup) — it ships real runnable code (a reporter + installer), not just method.

### Feature pillars

| # | Pillar                          | Stories                                                | Purpose                                                                                                                                                                                                  |
| - | ------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **Content-free usage reporter** | [US-6.1](../stories/US-6.1-koni-agent-monitoring.md) ✅ | `koni-agent-monitoring` — installer + 4 Claude Code hooks + a non-blocking reporter that projects transcripts to a strict allowlist and POSTs batches the live ERP accepts; mandatory content-leak proof |

### Out of scope

- The ERP ingest API, token minting, and the dashboard (owned by Koni-ERP-02, EPIC-13).
- A long-running daemon (the design is hooks + a fire-and-forget reporter — no daemon).
- Windows/Linux support in v1 (target: macOS + VS Code; paths noted as an open item).
- Server-side pricing (v1 computes cost client-side; the ERP stores what is sent).

## FR Coverage

| FR    | Story                                                | Status              |
| ----- | ---------------------------------------------------- | ------------------- |
| FR-34 | [US-6.1](../stories/US-6.1-koni-agent-monitoring.md) | ✅ shipped (v0.28.0) |

## Stories

| ID                                                   | Title                 | Goal                                                                                                                                                                                  | Status | Version |
| ---------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| [US-6.1](../stories/US-6.1-koni-agent-monitoring.md) | koni-agent-monitoring | Ship the content-free Claude Code usage reporter (installer + hooks + reporter + pure privacy core), byte-compatible with the ERP ingest contract, with a mandatory content-leak test | ✅ done | v0.28.0 |

## Cross-cutting invariants

- **Content-free by construction** — the client emits only allowlisted fields; the pure
  core filters the final batch to the allowlist as defence in depth; a mandatory
  content-leak test proves no prompt/code/tool-IO ever appears (only a capped task summary).
- **Never block the editor** — the hook enqueues locally and returns; all network I/O is
  detached with a short timeout. A slow/unreachable ERP never stalls Claude Code.
- **The ERP schema wins** — the client mirrors `POST /api/agent-ops/ingest`; on any
  disagreement the schema is authoritative and the client's docs are updated.

## Acceptance criteria (propagated from stories)

- [x] Installer copies the reporter, writes chmod-600 config, and wires the four hooks (US-6.1)
- [x] Reporter projects only allowlisted fields + posts batches the contract accepts; idempotent resends, offset no-double-count, backoff (US-6.1)
- [x] Mandatory content-leak test ships and passes; skill graded ≥95 (US-6.1)
