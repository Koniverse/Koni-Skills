# Versioning, release, compile & documentation

An EA is not "done" when it compiles — it is done when it is versioned,
registered, backtested, and documented. This is the discipline around a released
EA.

**Contents**: [Version scheme](#version-scheme) · [Commit = release](#commit--release) ·
[Registry & MagicNumber](#registry--magicnumber) · [Compile & backtest](#compile--backtest) ·
[Deploy](#deploy) · [The per-version doc](#the-per-version-doc)

## Version scheme

`v<X.YY>` — **X** one-digit major, **YY** two-digit zero-padded minor.

| Change | Bump | Requires |
|---|---|---|
| bug fix, new optional input, logging/perf | minor `YY` | new `v<X.YY>/` dir + fresh backtest |
| **`.set` parameter change on a live instance** | minor `YY` | same — a tuning change is a new version |
| breaking entry/exit-logic or architecture change | major `X`, minor → `00` | full re-test, not `.set`-compatible with the old |

The `#property version` string, the folder path, and the `.mq5`/`.set`/`.md`
basenames all carry the same `X.YY` — they must never disagree (the layout is in
[`inputs-naming-structure.md`](inputs-naming-structure.md#file--folder-layout)).

## Commit = release

**An EA version is released the moment its `.mq5` / `.set` / `.md` (and any
backtest) are committed under `algorithms/mql5/<ALGO>/v<X>/v<X.YY>/`.** There is no
separate publish step.

> Historical note: an older `ALGORITHM_RELEASE_SOP` doc describes a retired
> GitHub-Release + registry-sync + ClickHouse pipeline. That doc's own banner says
> *do not follow it*. Use the commit-is-release model; do not resurrect the
> deprecated checklist.

## Registry & MagicNumber

The registry (`algorithms/registry.yaml`, a mirror of Notion) is the source of
truth binding a MagicNumber to a version, symbol, timeframe, and account:

The file is a map keyed by the `UPPER_SNAKE` algo code (not a list); versions are
tracked at the **major** level (`"v1"`, `"v2"`), each carrying its registry magic:

```yaml
algorithms:
  EMA_CO:
    name: "EMA Crossover"          # human-readable name (a field, not the key)
    category: "Trend Following"
    type: mql5
    description: "Trend-following strategy based on EMA crossover signals"
    versions:
      - version: "v1"
        status: deprecated         # active | deprecated | in_development
        magic: 123456              # assigned by Notion — never hand-edited
      - version: "v8"
        status: active
        magic: 123456
    instances:                     # each live deployment binds a magic → symbol/tf/account
      - magic: 123456
        version: "v8"
        symbol: XAUUSD
        timeframe: M15
        account_id: null
        bot_name: null
        status: active
```

- **Never hand-assign a MagicNumber** — Notion generates it; an in-development EA
  carries `magic: null   # assigned by Notion at deploy`.
- The EA's `InpMagicNumber` **default** and its `.set` mirror the registry value.
- One magic per instance; reuse silently corrupts reporting
  ([`mql5-pitfalls.md`](mql5-pitfalls.md#magicnumber-collision)).

## Compile & backtest

**Compile** — two paths:
- **Local**: open the `.mq5` in MetaEditor → **Compile (F7)**. Zero errors
  required; treat warnings as errors for a release.
- **Automated (the Koni compile service)**: a MetaEditor CLI wrapper. Success is
  the parsed `Result: 0 errors` line, **not** the process exit code (MetaEditor's
  exit codes are unreliable). The one load-bearing flag: pass
  `/include:<MQL5 root>` — **not** `<MQL5 root>\Include` — because MetaEditor
  appends `\Include` itself, and double-nesting makes every `#include <Trade/Trade.mqh>`
  fail with error 106. Details in [`shared-library.md`](shared-library.md#compile-service).

**Backtest** — Strategy Tester, **"Every Tick Based on Real Ticks"**, live
timeframe, ≥ 3 months. Export the `.html` report into `backtest/` and record: Net
Profit, Max Drawdown, Profit Factor, Win Rate, Total Trades. "Open Prices Only" is
dev-iteration only and must never back a release
([`mql5-pitfalls.md`](mql5-pitfalls.md#backtest-mode-inflates-results)).

## Deploy

1. Copy the `.mq5` into the terminal's `MQL5/Experts/`; compile there.
2. Attach to the **correct symbol and timeframe**; load the `.set`.
3. Enable AutoTrading.
4. Verify the Journal shows **no** `INIT_FAILED`/`INVALID_HANDLE` and prints the
   expected magic from the `OnInit` startup line.

## The per-version doc

Every version ships a `<ALGO>_v<X.YY>.md` (Vietnamese is accepted for this doc).
Required sections, in order:

1. **Identity** — `# <EA> v<X.YY> — Tài Liệu Thuật Toán`, then bold metadata:
   `File`, `Phiên bản`, `Ngôn ngữ: MQL5`, `Ngày cập nhật: YYYY-MM-DD`.
2. **Strategy overview** — 1–2 paragraphs: the strategy type (breakout / grid /
   trend / time-based) and the money-management method (fixed lot / DCA / martingale).
3. **Version improvements** — for any version above `v1.00`: a change table
   (*Thay đổi / Chi tiết*) versus the previous version.
4. **Input parameters** — a table of every `Inp…`, **grouped by section**, columns
   *Input | Mặc Định | Kiểu | Mô tả*.
5. **Algorithm detail** — the entry/exit flow (ASCII or mermaid), the explicit
   **tick-vs-bar** trigger, the SL/TP formulas, and a warning if the SL is not
   hard-coded.
6. **Technical description** *(optional)* — structs, enums, global arrays, the
   `OnTick` order of operations.
7. **Recommended config** *(optional)* — a concrete setup (e.g. XAUUSD M15); state
   the **timezone in UTC**.
8. **Risk & backtest notes** *(optional)* — the backtest mode used and a
   `> [!WARNING]` block for repaint/blow-up risks.

Keep code identifiers in backticks; keep the numbered headings even when a section
is empty.
