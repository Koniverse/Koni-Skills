# Versioning & the folder layout

How an EA's artifacts are named and where they live, and the rule for when a change
earns a new version. This is bookkeeping that stays honest only if it is mechanical.

**Contents**: [Version scheme](#version-scheme) · [Minor vs major](#minor-vs-major) ·
[Folder & file layout](#folder--file-layout) · [Commit = release](#commit--release)

## Version scheme

`v<X.YY>` — **X** is a one-digit major, **YY** a two-digit zero-padded minor
(`v1.00`, `v1.09`, `v3.02`). The `#property version` string inside the `.mq5`, the
folder path, and the `.mq5` / `.set` / `.md` basenames all carry the same `X.YY`.
They must never disagree — a file that states one version while living in another's
directory is the first sign the archive has drifted.

## Minor vs major

| Change | Bump | Requires |
|---|---|---|
| bug fix, new optional input, logging/perf | **minor `YY`** | new `v<X.YY>/` dir + a fresh backtest |
| **`.set` parameter change on a live instance** | **minor `YY`** | same — a tuning change *is* a new version |
| breaking entry/exit-logic or architecture change, not `.set`-compatible with the old | **major `X`** (reset minor → `00`) | full re-test |

The one that is missed most often: **a `.set` tweak on a running EA is a new
version.** The parameters are part of the released artifact; changing them without
cutting a version means the live behaviour no longer matches any committed record.

> Provenance: this `.set`-is-a-version rule is mandated by the **live**
> `LESSONS.md §4` ("minor bump required when changing `.set` parameters only") and
> the *deprecated* `ALGORITHM_RELEASE_SOP`; the current `ALGORITHM_DEPLOYMENT_SOP`
> defines a minor bump as a bug fix / new backward-compatible input / perf-logging
> and does not itself name a `.set` tweak. The rule is current team practice, not a
> deprecated leftover — an untracked live parameter change is a real reproducibility
> hole.

## Folder & file layout

A version is a directory of sibling artifacts, all sharing the `X.YY`:

```
algorithms/mql5/<ALGO>/v<X>/v<X.YY>/
    <ALGO>_v<X.YY>.mq5     # source
    <ALGO>_v<X.YY>.set     # default inputs incl. MagicNumber
    <ALGO>_v<X.YY>.md      # per-version doc (see documentation.md)
    backtest/              # exported MT5 HTML report(s)
```

- `<ALGO>` is `UPPER_SNAKE_CASE` (`EMA_CO`, `ALPHA_TREND_DCA`).
- Note the **double nesting**: the major dir `v<X>/` contains the minor dirs
  `v<X.YY>/`. Every basename repeats the full version.
- A custom indicator follows the same scheme under `indicators/<NAME>/…`.

## Commit = release

**An EA version is released the moment its `.mq5` / `.set` / `.md` (and its
backtest) are committed under `algorithms/mql5/<ALGO>/v<X>/v<X.YY>/`.** There is no
separate publish step — the commit is the release event. It follows that **an
instance must not run live before its version is committed** — a live, uncommitted
instance is an unreleased instance in production, and nothing in the archive records
what it is running.

> Historical note: an older `ALGORITHM_RELEASE_SOP` doc describes a retired
> GitHub-Release + registry-sync + ClickHouse pipeline. That doc's own banner says
> *do not follow it*. Use the commit-is-release model; do not resurrect the
> deprecated checklist. See [`backtest-and-release.md`](backtest-and-release.md#the-deprecated-release-sop).
