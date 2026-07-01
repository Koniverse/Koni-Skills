# install — set up, verify, and operate the client

> **Load when**: installing/configuring the reporter, running the smoke test, or
> troubleshooting ("not on the dashboard", `401`, `429`). v1 target: **macOS + VS Code**
> (handoff §5–§7, §10, §11). The installer is additive, idempotent, and never commits secrets.

**Contents**: [Install](#install) · [What it wires](#what-it-wires) · [Config + auth](#config--auth) ·
[Queue + delivery](#queue--delivery) · [Smoke test](#smoke-test-60-seconds) · [Troubleshoot](#troubleshoot) ·
[Uninstall](#uninstall) · [Open items](#open-items)

## Install

Mint a per-employee token in the ERP (**Agent Ops → Settings → Tokens → Generate**, shown
once), then:

```sh
sh scripts/install.sh \
  --url "https://<erp-origin>/api/agent-ops/ingest" \
  --token "kagt_...paste..." \
  --merge-hooks      # optional: auto-wire the 4 hooks via jq (backs up settings.json first)
```

Without `--merge-hooks` (the safe default — matching koni-harness's "settings.json is merged
manually" invariant) the installer writes the exact hooks block to
`~/.koni-agent-monitoring/claude-hooks.json` and prints how to paste it. Re-running is
idempotent (config preserved, hooks not duplicated).

## What it wires

The installer copies `report.mjs` + `agent-report-core.mjs` into
`~/.koni-agent-monitoring/bin/`, writes the config, and wires **four** Claude Code hooks —
all calling the *same* command (`node …/bin/report.mjs`), which reads `hook_event_name` from
stdin to decide the event:

| Hook | Reporter action |
|---|---|
| `SessionStart` | emit `session_start`; record the session header (cwd, branch) |
| `PostToolUse` | read new transcript lines → `usage_snapshot` (token deltas) + `tool_used` (name); refresh snapshot |
| `Stop` | refresh the snapshot + flush a `usage_snapshot` **when there are new usage lines** since the last fire (assistant turn finished); a no-op emits nothing (no empty events) |
| `SessionEnd` | emit `session_end`; final snapshot with `ended_at` |

No heartbeat hook is needed — the ERP derives Active/Idle from server receipt time (no
events >60 s ⇒ Idle). An optional low-frequency `heartbeat` while open-but-quiet is allowed,
not required for v1.

## Config + auth

`~/.koni-agent-monitoring/config.env` (chmod **600**, never committed):

```
KONI_AGENT_OPS_URL=<ERP origin>/api/agent-ops/ingest
KONI_AGENT_OPS_TOKEN=<minted per-employee token>
```

One token = one employee (the ERP maps `token_hash → employee_id + workspace_id`). The raw
token lives **only** in this file — never logged, never sent anywhere but the
`Authorization` header. **Rotate** by minting a new token, swapping the file, and revoking
the old one. Env vars of the same name override the file.

## Queue + delivery

- **Offsets** (`offsets.json`): per-session byte offset so each hook reads only new lines;
  survives restarts; advances only past complete lines (see
  [transcript-parsing.md](transcript-parsing.md#offset-discipline)).
- **Queue** (`queue.jsonl`, append-only): each hook appends its projected batch, then spawns
  a **detached** drain and returns — the POST never happens in the hook's process.
- **Drain**: group queued items by `session_id` (latest snapshot wins, events concatenated),
  POST in batches ≤500. `2xx` → drop; `401` → stop + write `WARN-token-invalid.txt`, keep
  the queue; `429`/`5xx`/network → keep + exponential backoff (jitter, cap ~5 min). A
  **buffer cap** (~5 MB) trims the oldest half if the ERP is down a long time — it never
  grows unbounded.
- **Non-blocking** is the invariant: a slow/unreachable ERP must never stall the editor.

## Smoke test (60 seconds)

Prove endpoint + token + dashboard **before** building/relying on hooks:

```sh
export KONI_AGENT_OPS_URL="https://<erp-origin>/api/agent-ops/ingest"
export KONI_AGENT_OPS_TOKEN="kagt_...paste..."
SID="smoke-$(date +%s)"
curl -sS -X POST "$KONI_AGENT_OPS_URL" \
  -H "Authorization: Bearer $KONI_AGENT_OPS_TOKEN" -H "Content-Type: application/json" \
  -d "{\"session\":{\"session_id\":\"$SID\",\"project_name\":\"koni-skills\",\"git_branch\":\"main\",\"primary_model\":\"claude-opus-4-8\",\"models\":[\"claude-opus-4-8\"],\"input_tokens\":1200,\"output_tokens\":400,\"total_tokens\":1600,\"cost_usd\":0.05,\"task_summary\":\"Smoke test\",\"started_at\":\"$(date -u +%FT%TZ)\"},\"events\":[{\"seq\":0,\"event_type\":\"session_start\",\"model\":\"claude-opus-4-8\"}]}"
# Expect: {"ok":true,"accepted":1}
```

Open **Agent Ops → Live** — the session appears (Active). Re-POST the same `session_id` with
`{"seq":1,"event_type":"session_end"}` to roll it into **History**.

## Troubleshoot

- **Nothing on the dashboard** — check `config.env` has a valid URL + token; run the smoke
  test; confirm the four hooks are in `~/.claude/settings.json`; look for
  `~/.koni-agent-monitoring/queue.jsonl` growing (drain failing) or `WARN-token-invalid.txt`.
- **`401`** — token bad/absent/revoked. Re-issue in Agent Ops → Settings, update
  `config.env`. The drain stops and keeps the queue until fixed.
- **`400`** — a stray/unknown key or a datetime without offset (must be ISO-8601 with
  offset). See [ingest-contract.md](ingest-contract.md) + [privacy-allowlist.md](privacy-allowlist.md).
- **`429`** — rate-limited; the drain backs off automatically (honor `Retry-After`).
- **"Is it leaking my prompts/code?"** — no; run `node scripts/__tests__/leak-test.mjs`
  and see [privacy-allowlist.md](privacy-allowlist.md).

## Uninstall

```sh
sh scripts/install.sh --uninstall
```

Removes `~/.koni-agent-monitoring/` (reporter + config + queue/offsets/state) and, if `jq`
is present, strips the four koni-agent-monitoring hook entries from `~/.claude/settings.json`
(backing it up first, preserving any other hooks). Without `jq`, it prints what to remove
manually. To stop reporting **without** uninstalling, just remove/blank the token in
`config.env` (the drain then no-ops). After uninstalling, **revoke the token** in the ERP
(Agent Ops → Settings) so it can't be reused.

## Open items

- Verify the exact cache-token field names on a **live** `.jsonl` for the installed Claude
  Code version (§10 / [transcript-parsing.md](transcript-parsing.md#version-drift)).
- v1 computes cost client-side; keep [pricing.md](pricing.md) synced to `claude-api`.
- Windows/Linux transcript paths if non-mac staff exist (v1 target is macOS + VS Code).
