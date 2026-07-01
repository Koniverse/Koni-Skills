# ingest-contract — POST /api/agent-ops/ingest (mirror of the ERP schema; the schema wins)

> **Load when**: changing what the reporter posts, or debugging a `400`. This mirrors the
> **shipped ERP** endpoint + `src/lib/agent-ops/ingest-schema.ts` (Koni-ERP-02, through
> US-13.6). **If this doc and that schema ever disagree, the schema wins** — fix this doc.

**Contents**: [Request](#request) · [Batch body](#batch-body) · [Session vs events](#session-vs-events) ·
[Idempotency](#idempotency) · [Limits](#limits) · [Responses](#responses)

## Request

- **Method / URL**: `POST {KONI_AGENT_OPS_URL}` = `<ERP origin>/api/agent-ops/ingest`.
- **Auth**: `Authorization: Bearer {KONI_AGENT_OPS_TOKEN}` — minted per employee in the ERP
  (Agent Ops → Settings); the ERP stores only its SHA-256 hash. Unknown/revoked → `401`.
- **Content-Type**: `application/json`.

## Batch body

One batch object per POST: a `session` snapshot + an `events[]` delta log.

```jsonc
{
  "session": {
    "session_id": "≤200 (required — the Claude Code session id)",
    "host": "?", "project_path": "≤512?", "project_name": "≤200?", "git_branch": "≤200?",
    "models": ["…"], "primary_model": "?",          // models ≤20
    "started_at": "ISO-8601±offset?", "ended_at": "ISO-8601±offset?",
    "status": "active | idle | ended?",
    "local_ip": "≤200?", "account_email": "≤200?",
    "task_summary": "≤300? (capped topic, NOT the prompt)", "current_file": "≤512?",
    "recent_tools": ["≤80 each, ≤10 items"],
    // ABSOLUTE cumulative totals, recomputed from the transcript each push:
    "input_tokens": 0, "output_tokens": 0, "cache_read_tokens": 0,
    "cache_creation_tokens": 0, "total_tokens": 0, "cost_usd": 0
  },
  "events": [{
    "seq": 0,                       // required, per-session monotonic int ≥0
    "event_type": "session_start | tool_used | usage_snapshot | heartbeat | session_end",
    "model": "?",
    "input_tokens": 0, "output_tokens": 0, "cache_read_tokens": 0,
    "cache_creation_tokens": 0, "cost_usd": 0,     // per-event DELTA (not cumulative)
    "tool_name": "?", "ts": "ISO-8601±offset?",
    "metadata": { "cwd": "?", "project_name": "?", "git_branch": "?", "num_turns": 0, "duration_ms": 0 }
  }]
}
```

Every key here is on the [allowlist](privacy-allowlist.md); the schema is `.strict()`, so a
stray/unknown key fails the **whole** batch with `400`. `metadata` is scalar-only (those
five keys) — never a free-form blob (that would re-open the content hole).

## Session vs events

- **`session`** is the **latest absolute snapshot** — last-write-wins on the server, so the
  reporter **recomputes cumulative totals from the transcript each push**.
- **`events`** are the **delta log** for history (per-event token/cost are deltas).
- `last_activity_at` is stamped **server-side** — do **not** send it. Public IP is captured
  server-side too (see [privacy-allowlist.md](privacy-allowlist.md)).

## Idempotency

Events are deduped on `(session_id, seq)`. **Resending a batch is safe** — retry on failure
without tracking server acks. `seq` is per-session monotonic and **never reused** (it is the
idempotency key together with `session_id`). This is why the reporter persists a per-session
seq counter and only ever increments it.

## Limits

- ≤ **500 events per batch** (the reporter chunks larger drains).
- The ERP rate-limits ~**120 req/min per token** (`429` + `Retry-After`).
- Batch cadence: every ~2–5 s, or when ~50+ events queue.

## Responses

| Code | Meaning | Reporter action |
|---|---|---|
| `200 {ok:true, accepted:N}` | accepted | drop those events from the queue |
| `400` | invalid — a stray/unknown key or bad datetime (ISO-8601 **with offset**) | fix the projection; do not retry blindly |
| `401` | bad/absent/revoked token | **stop**, surface "token invalid — re-issue in Agent Ops → Settings", keep the queue |
| `429` | rate-limited | keep + back off (honor `Retry-After`) |
| `5xx` / network | transient | keep + exponential backoff (jitter, cap ~5 min) |
