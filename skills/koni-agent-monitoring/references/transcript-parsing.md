# transcript-parsing — reading Claude Code's `.jsonl` (names/counts/paths only)

> **Load when**: implementing or debugging the extractor, or a token/model/tool field
> looks wrong. Field names have **drifted across Claude Code versions** — always verify
> against a real transcript (handoff §10, §13). Extraction lives in
> `agent-report-core.mjs` `projectLine()`; this is the map it implements.

**Contents**: [Where the transcript is](#where-the-transcript-is) · [Line shapes](#line-shapes) ·
[Extraction map](#extraction-map) · [Offset discipline](#offset-discipline) · [Version drift](#version-drift)

## Where the transcript is

`~/.claude/projects/<project-hash>/<session-id>.jsonl` — the file name minus `.jsonl` **is**
the `session_id`. Claude Code appends one JSON object per line (user turn, assistant turn
with `message.usage` + `model`, tool calls, a header/summary, …).

## Line shapes

- **assistant** → `{"type":"assistant","message":{"model":"claude-…","usage":{"input_tokens":N,"output_tokens":N,"cache_read_input_tokens":N,"cache_creation_input_tokens":N},"content":[…]}}`.
  Take `model`; take `usage.*` (per-message, i.e. the **delta** for that turn). `content[]`
  may hold `{"type":"tool_use","name":"Edit","input":{…}}` → take **`name` only**, never
  `input`. For an `Edit`/`Write`/`Read`/`NotebookEdit` tool_use, `input.file_path` MAY set
  `current_file` (path only — never read the file or its `content`).
- **user** → the first one is usually the task prompt. Use it **only** to derive
  `task_summary` (truncate ≤300, strip newlines); never emit it whole. Later `user` lines
  carry `tool_result` — **ignore their content entirely**.
- **header / summary** → some versions put `cwd`, `gitBranch`, `version`, and a generated
  `summary`/title on the first line or a `{"type":"summary"}` line. Prefer a Claude-generated
  `summary` for `task_summary`; else the truncated first prompt. Use `cwd` for
  `project_path` + `project_name` = basename; `git_branch` = `git -C <cwd> rev-parse
  --abbrev-ref HEAD`.

## Extraction map

| Need | Take from | Emit as |
|---|---|---|
| model | assistant `message.model` | `model` + add to `models`/`primary_model` |
| token counts | assistant `message.usage.{input_tokens,output_tokens,cache_read_input_tokens,cache_creation_input_tokens}` | per-event **deltas** + session **absolute** sums |
| cost | tokens × price ([pricing.md](pricing.md)) | `cost_usd` |
| tool used | `tool_use` block **name only** | `tool_name` + `event_type: tool_used` |
| project / branch | `cwd` (header) + git branch of that dir | `project_path/name`, `git_branch`, `metadata` |
| local IP | primary LAN interface (OS API) | `local_ip` |
| account | the Anthropic login the session runs as | `account_email` |
| task summary | Claude summary, else first prompt **≤300** | `task_summary` |
| current file | path of the latest edit/read (**path only**) | `current_file` |
| recent tools | last few tool-use **names** | `recent_tools` (≤10) |
| lifecycle | first line / hook | `session_start` / `session_end` |

If a field is missing in a given version, **omit it** — all are optional except
`session_id` and per-event `seq`/`event_type`. Anything not in this table is not emitted.

## Offset discipline

Per-session, store a byte offset (`offsets.json: {session_id → offset}`) so each hook reads
only **new** lines. Two rules keep counts exact:

- **Advance only to the last complete line.** The reporter consumes up to the final `\n`
  and leaves a partial (mid-write) trailing line for next time — no lost lines, **no
  double-count**. (`report.mjs readNewLines`.)
- **Truncation/rotation** (`offset > file size`) → reset the offset to 0.

Because usage is per-message, summing the *new* assistant lines gives the delta since the
last hook; the session snapshot accumulates the absolute total.

## Version drift

The four cache field names (`cache_read_input_tokens`, `cache_creation_input_tokens`) and
whether a `summary` line exists vary by Claude Code version — this is an open item (§10).
**Verify on a live `.jsonl`** before trusting the dollar figures, and keep `projectLine`'s
field reads matched to the installed version. Unknown shapes degrade safely: a line that
doesn't parse or doesn't match is skipped, never guessed.
