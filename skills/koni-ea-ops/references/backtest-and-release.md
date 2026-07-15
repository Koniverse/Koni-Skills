# Release backtest & the release record

The backtest that backs a *release* is a different artifact from the quick runs used
while developing: it must be realistic, on the real timeframe, over enough history,
and its numbers become part of the version's record.

**Contents**: [Release backtest mode](#release-backtest-mode) · [Metrics to record](#metrics-to-record) ·
[The backtest archive](#the-backtest-archive) · [The deprecated release SOP](#the-deprecated-release-sop)

## Release backtest mode

- **"Every Tick Based on Real Ticks"** — the only mode a release conclusion may
  rest on. It replays real tick sequences, so intrabar SL/TP ordering and fills are
  realistic. "Open Prices Only" inflates the win-rate by ~10–15% and is for dev
  iteration only. (Why the mode changes the result is explained on the programming
  side, in **koni-ea-dev**'s pitfalls.)
- **Live timeframe** — test on the timeframe the EA will actually run.
- **≥ 3 months** of history, covering varied regimes; more for a strategy whose edge
  depends on a specific condition (trend, range, session).

## Metrics to record

Capture, for the version's record, at least: **Net Profit**, **Max Drawdown**,
**Profit Factor**, **Win Rate**, **Total Trades**. Drawdown and Profit Factor are
the ones that decide whether a version is deployable; a high Net Profit with a Max
Drawdown the account cannot survive is not a release.

> This full metric set and the ≥ 3-month window above are the team's **carried-forward
> release bar** — their written source is the deprecated `ALGORITHM_RELEASE_SOP` (the
> current `ALGORITHM_DEPLOYMENT_SOP` asks only for "an appropriate period" and a shorter
> metric list). We keep the stricter bar deliberately; if a repo wants the looser one,
> that is its call to make explicitly, not by default.

## The backtest archive

Export the Strategy Tester **HTML report** into the version's `backtest/` directory
(see [`versioning.md`](versioning.md#folder--file-layout)). The report is committed
with the version — it is the evidence the release numbers were real, reproducible
from the same `.set` and history.

## The deprecated release SOP

The archive still contains an `ALGORITHM_RELEASE_SOP` doc describing a retired
process — a GitHub Release, a `registry`-sync script, a ClickHouse push. **Its own
banner says do not follow it.** The current model is simpler and is the one this
skill teaches: **commit is the release** (see
[`versioning.md`](versioning.md#commit--release)), the registry is maintained in
Notion and mirrored to `registry.yaml`, and there is no separate publish pipeline.
Do not resurrect the deprecated checklist because it looks more thorough or is still
physically present. Following it actively breaks the current model two ways: its
`registry`-sync step treats `registry.yaml` as an **authoritative write target** —
reviving the yaml-as-source-of-truth behaviour D9 retired and Rule 2 forbids
([`registry-and-magic.md`](registry-and-magic.md#magicnumber-rules)) — and its
Grafana / `sync_registry` / ClickHouse infrastructure is **gone**, so those steps
silently no-op against tooling that no longer exists.
