# pricing — client-side cost math (keep in sync with `claude-api`)

> **Load when**: cost looks wrong, pricing changed, or a new model appeared. v1 computes
> cost **client-side** (handoff §10, §14); the ERP stores what the client sends. The table
> lives in `agent-report-core.mjs` (`PRICING`) — this doc is its rationale + upkeep rule.

**Contents**: [The formula](#the-formula) · [Table](#starter-table) · [Matching](#model-matching) ·
[Upkeep](#upkeep)

## The formula

`cost_usd = Σ over token types ( tokens_of_type / 1e6 × price_of_type )`, summed over
input, output, cache-read, and cache-write. Cache reads are much cheaper than input; cache
writes a bit more than input. The reporter computes this for the **absolute** snapshot
(`session.cost_usd`) and for each **delta** event (`event.cost_usd`).

## Starter table

USD per **1e6 tokens** (approximate starters — confirm against current Anthropic pricing
before relying on the dollar figures):

| Model family (substring) | input | output | cache-read | cache-write |
|---|---:|---:|---:|---:|
| `opus`   | 15 | 75 | 1.50 | 18.75 |
| `sonnet` |  3 | 15 | 0.30 |  3.75 |
| `haiku`  |  1 |  5 | 0.10 |  1.25 |

## Model matching

Match the model id **case-insensitively by family substring** (`claude-opus-4-8` → `opus`).
An **unknown model → price 0** so a new/renamed model never crashes the reporter — cost is
best-effort, never fatal (`priceFor` returns `null` → `costUsd` → 0). The core does not log
(it is pure/side-effect-free); surface pricing drift by adding the unknown id to `PRICING`
when a new family ships (see Upkeep).

## Upkeep

- Tie this table to the ERP's **`claude-api`** reference so it stays current; when Anthropic
  pricing changes, update `PRICING` in `agent-report-core.mjs` and this table together.
- Adding a new family = one row here + one entry in `PRICING`, keyed by the substring that
  appears in the model id.
- `core-test.mjs` asserts the math (e.g. 1M opus input = $15) — update it if the numbers
  change so the test stays a real guard, not a rubber stamp.
