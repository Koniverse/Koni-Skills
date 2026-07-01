---
name: koni-agent-monitoring
description: >
  Use to install, configure, verify, or troubleshoot the **Koni Agent Ops monitoring
  client** on a staff machine — the thing that streams a content-free projection of
  Claude Code usage (who's running how many agents, on which model, at what token/cost
  burn) to the Koni ERP Agent Ops dashboard. Triggers: "install agent monitoring",
  "set up agent ops", "monitor Claude Code usage", "stream tokens/cost to the
  dashboard", "wire the monitoring hooks", "agent ops reporter/token", "my session
  isn't showing on the dashboard", "401 / token invalid on ingest", "how is token/cost
  usage computed", or "is the monitor leaking my prompts/code?" — even if they don't name
  koni-agent-monitoring. It NEVER sends prompt text, code, or tool input/output — only
  allowlisted metrics + a capped task summary.
---
# koni-agent-monitoring — content-free Claude Code usage reporter

> Streams **metrics + light activity, never content** from each staff machine's Claude
> Code sessions to the Koni ERP `POST /api/agent-ops/ingest` API, so the admin Agent Ops
> dashboard shows live agent count, model, and token/cost burn. It is an installer + four
> hooks + a small reporter — **no long-running daemon**. The privacy boundary (a strict
> field allowlist) is the whole point: see [`references/privacy-allowlist.md`](references/privacy-allowlist.md).

---

## 1. What this owns vs. delegates

| Concern | Owner |
|---|---|
| The client: installer, hooks, reporter, local queue, privacy projection | **koni-agent-monitoring** (this) |
| The ingest **contract** (schema, auth, limits, responses) | the **ERP** `POST /api/agent-ops/ingest` + `ingest-schema.ts` — **the schema wins** on any disagreement (mirror it in [`references/ingest-contract.md`](references/ingest-contract.md)) |
| Token mint / revoke, dashboard, server-side public-IP + `last_activity_at` | the **ERP** (Agent Ops → Settings / Live / History) |
| Build loop, gate, re-grade | **koni-harness** (this skill was built through it) |
| Model pricing source of truth | the [`claude-api`](../../) reference — keep [`references/pricing.md`](references/pricing.md) in sync |

The client is **content-free by construction**: it emits only the allowlisted fields, and
`agent-report-core.mjs` filters the final batch to that allowlist as a last line of defence.

---

## 2. Modes

| Mode | What it does | Uses |
|---|---|---|
| **Install / configure** | Copy the reporter to `~/.koni-agent-monitoring/`, write the local config (URL + per-employee token, chmod 600), wire the four Claude Code hooks | `scripts/install.sh` + [`references/install.md`](references/install.md) |
| **Verify (smoke test)** | Prove endpoint + token + dashboard before/after install with a single `curl`; confirm the session appears on Agent Ops → Live | [`install.md`](references/install.md#smoke-test-60-seconds) |
| **Troubleshoot** | "not showing on the dashboard" / `401 token invalid` / `429 rate-limited` / "is it leaking?" | [`install.md`](references/install.md#troubleshoot) + [`privacy-allowlist.md`](references/privacy-allowlist.md) |
| **Uninstall / disable** | Remove the reporter + strip the hooks (`--uninstall`), or stop reporting by clearing the token; revoke the token in the ERP | [`install.md`](references/install.md#uninstall) |
| **Explain the privacy boundary** | Show exactly what is and isn't sent, and the content-leak proof | [`references/privacy-allowlist.md`](references/privacy-allowlist.md) |
| **Understand / change the contract** | The POST body, auth, idempotency, limits, responses | [`references/ingest-contract.md`](references/ingest-contract.md) |

---

## 3. Activation — intent → reference

| User intent | Load |
|---|---|
| "install / set up agent monitoring" / "wire the hooks" | `references/install.md` |
| "smoke test the ingest" / "prove my token works" | `references/install.md` §Smoke test |
| "my session isn't on the dashboard" / "401 / 429" | `references/install.md` §Troubleshoot |
| "what does it send?" / "does it leak prompts/code?" / "privacy" | `references/privacy-allowlist.md` |
| "the ingest contract / schema / batch shape" | `references/ingest-contract.md` |
| "how does it read the transcript?" / "field names" | `references/transcript-parsing.md` |
| "cost / pricing / token math" | `references/pricing.md` |

---

## 4. Architecture (one look)

```
Claude Code (VS Code)  ── hooks: SessionStart · PostToolUse · Stop · SessionEnd
   └─ node ~/.koni-agent-monitoring/bin/report.mjs   (per event, NON-BLOCKING)
        1. read NEW transcript lines since last offset   (~/.claude/projects/…/<sid>.jsonl)
        2. project to the content-free allowlist          (agent-report-core.mjs)
        3. append event(s) to queue.jsonl                 (instant)
        4. spawn a DETACHED drain → POST batches → ERP ingest   (never awaited)
```

The hook returns before the network I/O resolves — a slow or unreachable ERP can never
stall the editor. Absolute totals in `session` are recomputed each push (last-write-wins);
per-event token/cost are deltas. `seq` is per-session monotonic (the idempotency key with
`session_id`), so resends never double-count.

---

## 5. Reference index

| File | When to load |
|---|---|
| [`references/install.md`](references/install.md) | Installing / configuring / verifying / troubleshooting the client (hooks, config, queue + delivery, smoke test, 401/429, open items) |
| [`references/privacy-allowlist.md`](references/privacy-allowlist.md) | The content-free boundary — the exact allowlist, what is never sent, and the mandatory content-leak test |
| [`references/ingest-contract.md`](references/ingest-contract.md) | The `POST /api/agent-ops/ingest` contract — batch body, auth, idempotency, limits, responses (mirror of the ERP schema, which wins) |
| [`references/transcript-parsing.md`](references/transcript-parsing.md) | Reading Claude Code's `.jsonl` transcript — line shapes, which fields to take (names/counts/paths only), version drift |
| [`references/pricing.md`](references/pricing.md) | Client-side cost math + the model pricing table (keep in sync with `claude-api`) |

**Scripts** (shipped + installed): `scripts/agent-report-core.mjs` (pure privacy
projection + pricing) · `scripts/report.mjs` (hook + queue + drain) · `scripts/install.sh`
(installer). Tests in `scripts/__tests__/` — the **content-leak assertion is mandatory**
(`leak-test.mjs`).

**Boundary reminder**: the ERP schema is the source of truth for the contract; this client
mirrors it and must stay byte-compatible. It never sends anything outside the allowlist —
when in doubt, send less.
