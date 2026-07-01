# privacy-allowlist — the content-free boundary (what is and isn't sent)

> **Load when**: someone asks *"what does the monitor send?"*, *"does it leak my
> prompts/code?"*, or you're changing what the reporter emits. This boundary is the whole
> point of the skill — the client streams **metrics + light activity, never content**.

**Contents**: [The rule](#the-rule) · [Allowlist](#the-allowlist-the-only-things-sent) ·
[Never sent](#never-sent) · [The one exception: task_summary](#the-one-exception-task_summary) ·
[Two IPs, one identity](#two-ips-one-identity) · [The mandatory leak test](#the-mandatory-content-leak-test) ·
[Defence in depth](#defence-in-depth)

## The rule

The ERP ingest schema is `.strict()`: **any key not on the allowlist fails the whole batch
with `400`.** So the client emits *only* allowlisted fields — and, as a second line of
defence, `agent-report-core.mjs` filters the final batch to the allowlist regardless of
what upstream produced. When in doubt, send less.

## The allowlist (the only things sent)

**`session`** (the latest absolute snapshot): `session_id`, `host`, `project_path`,
`project_name`, `git_branch`, `models[]`, `primary_model`, `started_at`, `ended_at`,
`status`, `local_ip`, `account_email`, `task_summary`, `current_file`, `recent_tools[]`,
and the cumulative counters `input_tokens`, `output_tokens`, `cache_read_tokens`,
`cache_creation_tokens`, `total_tokens`, `cost_usd`.

**`events[]`** (the delta log): `seq`, `event_type`, `model`, the four per-event token
deltas, `cost_usd` (delta), `tool_name`, `ts`, and `metadata` — a **strict, scalar-only**
object of exactly `cwd`, `project_name`, `git_branch`, `num_turns`, `duration_ms`.

Everything here is a name, a count, a path, a model id, a timestamp, or the capped summary.
None of it is content.

## Never sent

Never emit — and never even read into a variable that could be logged:

- prompt / user message text, assistant response text, `message.content`, `messages`, the
  system prompt (the **only** prompt-derived thing allowed is the capped `task_summary`);
- file **contents**, diffs, code, patch bodies, tool **inputs/outputs** (only the tool
  *name* is allowed);
- env values, secrets, tokens, `.env` / keychain contents.

Paths are allowed (`project_path`, `cwd`, and the single `current_file`) — **paths only,
never their contents**, and only the *current* file, not every file the session touched.

## The one exception: `task_summary`

`task_summary` is an admin-approved, **capped content descriptor** (≤300 chars, single
line) — a short topic so managers can spot off-topic use. It is **not** the full prompt.
The reporter prefers a Claude-generated session `summary`; only if none exists does it fall
back to the first user prompt, **truncated to ≤300 and stripped of newlines**
(`capTaskSummary`). Set it **once** per session; never overwrite it with churn, and never
emit the raw prompt/response/code. This is the single bounded exception — everything else
in "Never sent" stays out.

> **Caveat — bounded by volume, not sensitivity.** On the first-prompt fallback the cap
> limits *how much* ships (≤300, one line) but not *what kind* — if a user pastes a secret
> into their first prompt, the capped slice can carry it. Inherent to the admin-approved
> descriptor (US-13.6). Mitigate by preferring the Claude `summary`, keeping the cap tight,
> and telling staff the first-prompt topic is admin-visible. The leak test asserts the cap
> truncates anything past 300 chars (so a secret placed *after* the cap never ships).

## Two IPs, one identity

- **`local_ip`** (LAN, e.g. `192.168.1.20`) IS client-sent, from the machine's primary
  interface.
- **Public IP is NOT client-sent** — the ERP captures it server-side from request headers
  (`x-forwarded-for`) so it can't be spoofed. Never put a public IP in the payload.
- **`account_email`** is an account *identity* (which Anthropic subscription the session is
  logged in as) — never a password or API key. Those must never leave the machine.

## The mandatory content-leak test

The implementation **ships** `scripts/__tests__/leak-test.mjs` (handoff §8): it feeds the
extractor a fixture transcript containing real prompt text, assistant responses, tool
inputs/outputs, and file contents, then asserts the serialized batch contains **none** of
those strings and **only** allowlisted keys. This is the client-side half of the ERP's own
ingest-schema content-rejection suite (ERP LESSONS §214). It is not optional — a change
that weakens the boundary fails this test. Run it: `node scripts/__tests__/leak-test.mjs`.

## Defence in depth

Three independent layers keep content out: (1) **projection** — `projectLine` extracts only
names/counts/paths and never returns text; (2) **construction** — `buildBatch` writes only
allowlisted keys; (3) **filter** — `pick(obj, ALLOWLIST_*)` strips any stray key from the
final `session`/`events`/`metadata` before it can be serialized. A bug in any one layer is
caught by the next, and the leak test proves the whole chain.
