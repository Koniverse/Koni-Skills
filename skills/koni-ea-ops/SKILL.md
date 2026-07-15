---
name: koni-ea-ops
description: >
  Use when you need to version, register, deploy, backtest-for-release, or
  document a Koniverse MQL5 Expert Advisor — the operational lifecycle of a
  released EA, not writing its code (that is the sibling skill koni-ea-dev).
  Triggers: "cut a new EA version", "is this a minor or major bump?", "assign or
  register a MagicNumber", "deploy this EA to MT5", "attach and verify the
  Journal", "produce a production .ex5", "release backtest requirements or
  metrics", "write the per-version EA doc", "run the release checklist", "organise
  the EA version folders or the registry" — even without naming koni-ea-ops.
---
# koni-ea-ops — the operational lifecycle of an MQL5 EA

> koni-ea-ops is the standard for **organising a Koniverse MQL5 Expert Advisor as
> a released, deployed, tracked asset** — versioning, registry & MagicNumber,
> deployment, release backtesting, and per-version documentation. It is the
> operational half; **writing the EA correctly is its sibling skill
> [koni-ea-dev]**. An EA is not "done" when it compiles — it is done when it is
> versioned, registered, backtested, deployed, and documented.

This standard is drawn from the `Trading-Resources` archive's SOPs
(`ALGORITHM_DEPLOYMENT_SOP`, `BOT_DOCUMENT_SOP`, the deprecated
`ALGORITHM_RELEASE_SOP`) and its `registry.yaml`, plus the Koni compile-service
conventions from the `Senti-Quant` library corpus (for producing production `.ex5`).
It governs how EA artifacts are named, tracked, and shipped — never how their logic
is written.

## koni-ea-dev vs koni-ea-ops

| Question | Skill |
|---|---|
| How do I write this EA correctly? (lifecycle, mechanics, risk coding, pitfalls, compile clean) | **koni-ea-dev** |
| How do I version / register / deploy / backtest / document a released EA? | **koni-ea-ops** (this skill) |

The seam: koni-ea-dev ends when the `.mq5` compiles clean and passes its
self-verify; koni-ea-ops begins with cutting the version directory and ends with a
deployed, documented, registered instance. The MagicNumber is the shared token —
koni-ea-dev *uses* it (unique per instance, `> 0`); koni-ea-ops *records and
tracks* it (Notion assigns it).

## The release lifecycle

1. **Cut the version.** Decide minor vs major, create the `v<X.YY>/` directory,
   place the `.mq5` / `.set` — see [`versioning.md`](references/versioning.md).
2. **Assign the MagicNumber & register.** Record the version and instance in
   `registry.yaml` with its Notion-assigned magic —
   [`registry-and-magic.md`](references/registry-and-magic.md).
3. **Backtest for release.** "Every Tick Based on Real Ticks", export the report,
   record the metrics — [`backtest-and-release.md`](references/backtest-and-release.md).
4. **Document the version.** Write the per-version `.md` from the template —
   [`documentation.md`](references/documentation.md).
5. **Commit = release.** The version is released the moment its artifacts are
   committed under the version directory — [`versioning.md`](references/versioning.md#commit--release).
   **This comes before going live** — an instance must never run on an uncommitted version.
6. **Deploy.** Only now attach to the terminal, load the `.set`, enable AutoTrading,
   and verify the Journal — [`deployment.md`](references/deployment.md).

## Reference map

| Reference | Covers |
|---|---|
| [`versioning.md`](references/versioning.md) | the `v<X.YY>` scheme · minor vs major bump · the folder/file layout · commit = release |
| [`registry-and-magic.md`](references/registry-and-magic.md) | `registry.yaml` shape · MagicNumber as Notion source-of-truth · never hand-assign · instance bindings · the collision audit |
| [`deployment.md`](references/deployment.md) | deploy to a terminal (attach · `.set` · AutoTrading · Journal check) · production `.ex5` via the compile service |
| [`backtest-and-release.md`](references/backtest-and-release.md) | release backtest mode · timeframe & window · metrics to record · the backtest archive · the deprecated release SOP |
| [`documentation.md`](references/documentation.md) | the per-version `<ALGO>_v<X.YY>.md` template (identity · strategy · inputs · algorithm detail · risk notes) |

## Non-negotiables (the short list)

- **One MagicNumber per instance, assigned by Notion, never hand-picked, never
  reused.** MT5 does not enforce uniqueness; a shared magic merges two EAs in every
  query and in reporting.
- **Notion is the source of truth** for MagicNumbers (and instance rows where
  tracked); `registry.yaml` is its git-tracked mirror (its live-registry role was
  retired at CONTEXT D9, but the magic-per-version record is still maintained — keep
  it in sync, and never treat the yaml as authoritative).
- **A `.set` parameter change on a live instance is a new minor version** — a
  tuning change is a new version, with its own directory and backtest.
- **A release backtest is "Every Tick Based on Real Ticks"** on the live timeframe,
  ≥ 3 months. "Open Prices Only" never backs a release.
- **Commit is the release** — the version ships when its `.mq5` / `.set` / `.md`
  (and backtest) are committed under `algorithms/mql5/<ALGO>/v<X>/v<X.YY>/`; an
  instance must not run live before its version is committed.
- **Every version carries its `.md` doc.** An undocumented version is not released —
  without it an operator can't reconcile the running `.set` against what the inputs
  mean, so the wrong parameters run live unnoticed.
