---
name: koni-ea-dev
description: >
  Use when programming or reviewing an MQL5 Expert Advisor or custom indicator for
  MetaTrader 5 and the code must be correct to the MQL5 standard. Triggers:
  structuring OnInit/OnTick/OnDeinit/OnTradeTransaction/OnTimer, placing orders with
  CTrade, new-bar / closed-bar signal timing, indicator handles and
  CopyBuffer/ArraySetAsSeries, position sizing and SL/TP with the broker stop level,
  DCA/grid/breakout/trend mechanics, selecting or closing positions by magic in EA
  code, risk & money-management coding (equity breaker, daily loss,
  spread/gap/session filters, the pending-fill margin pre-check), the MQL5 pitfalls
  that only bite in production (repaint, backtest mode, filling mode, handle leak,
  self-recovery after restart), compiling clean, or writing a reusable Koni `.mqh`
  module — even without naming koni-ea-dev.
---
# koni-ea-dev — programming a correct MQL5 Expert Advisor

> koni-ea-dev is the **standard for programming a Koniverse MQL5 Expert Advisor
> correctly**: the lifecycle and event model, the trading and risk mechanics, the
> MQL5 traps that only bite in production, and how to compile clean and test
> honestly. It is to MQL5 EAs what koni-qc is to test docs — a methodology for
> writing correct code, not a code generator. It is deliberately scoped to the
> *programming*; the operational lifecycle around a released EA (versioning,
> registry, deployment, per-version docs) is its sibling skill **koni-ea-ops**.

The standard is **synthesized from two production corpora** and resolves the places
where they disagree (each reference names the divergence and the chosen canonical
form):

- **Strategy EAs** — the `Trading-Resources` archive of ~14 live EA families
  (EMA_CO, ORB, ALPHA_TREND_DCA, GRID_DCA, MFR_DCA, STP, TRB, …), each a
  self-contained `.mq5` including only the stock `<Trade\...>` classes.
- **The Koni MQL5 library** — the `Senti-Quant` `terminal_manager` header-only
  `Include/Koni/**` modules, the reference for building **reusable `.mqh`** rather
  than a single-file strategy EA.

## The two build modes

Pick the mode first — the conventions differ:

| Mode | You are building | Structure | Reference |
|---|---|---|---|
| **Strategy EA** | one algorithm's `.mq5` | single self-contained file, stock `<Trade\...>` includes only | all references below except the last |
| **Shared library** | a reusable `.mqh` module (net, streaming, a handler, a helper) | header-only, include-guarded, one class per file under `Include/Koni/` | [`shared-library.md`](references/shared-library.md) |

Most work is **Strategy EA** mode. Reach for library mode only when a module is
genuinely reused across EAs (the recurring copy-paste helpers — `CountMyPositions`,
`NormLot`, `IsNewBar` — are the migration candidates).

## The programming loop

1. **Design before code.** Know the entry/exit rules, the tick-vs-bar decision, the
   SL/TP formulas, and the money-management method before opening MetaEditor. A
   repaint or a martingale blow-up is a design flaw, not a coding one.
2. **Skeleton.** Lay down the lifecycle from [`ea-lifecycle.md`](references/ea-lifecycle.md)
   — the `#property` header, `OnInit` validation + handle creation, the `OnTick`
   new-bar gate, `OnDeinit` handle release.
3. **Inputs & naming.** Declare inputs and name everything per
   [`inputs-and-naming.md`](references/inputs-and-naming.md).
4. **Mechanics.** Implement entries/exits/management with
   [`trading-mechanics.md`](references/trading-mechanics.md) — CTrade, closed-bar
   signals, sizing, SL/TP with the broker stop level, position-by-magic loops,
   DCA/grid layering.
5. **Risk.** Add the guards from [`risk-management.md`](references/risk-management.md)
   — position cap, equity breaker, daily loss, spread/gap/session filters, and the
   **margin pre-check** (never post-check).
6. **Self-verify against the pitfalls.** Walk [`mql5-pitfalls.md`](references/mql5-pitfalls.md)
   as a checklist — every item is a production bug that a green backtest hides.
7. **Compile clean & test honestly.** Zero errors, warnings-as-errors, and a
   realistic Strategy-Tester run — see
   [`compilation-and-testing.md`](references/compilation-and-testing.md).

## Reference map

| Reference | Covers |
|---|---|
| [`ea-lifecycle.md`](references/ea-lifecycle.md) | `#property` header · OnInit/OnTick/OnDeinit/OnTradeTransaction/OnTimer · the standard order-of-operations · the canonical skeleton |
| [`inputs-and-naming.md`](references/inputs-and-naming.md) | `Inp` inputs · `input group` · enums · `g_`/`m_`/`C`/`ENUM_` naming · the English-code rule |
| [`trading-mechanics.md`](references/trading-mechanics.md) | CTrade · new-bar detection · indicator handles + `CopyBuffer` + `ArraySetAsSeries` · fixed & risk-% sizing · SL/TP + `SYMBOL_TRADE_STOPS_LEVEL` · position-by-magic · DCA/grid/breakout patterns |
| [`risk-management.md`](references/risk-management.md) | position cap · equity circuit breaker · daily-loss limit · spread/gap/session filters · cooldown · **margin pre-check** · slippage & filling mode |
| [`mql5-pitfalls.md`](references/mql5-pitfalls.md) | the production-only traps: repaint, backtest mode, pending-fill margin, handle release, `ArraySetAsSeries`, stop level, self-recovery, magic collision, normalization |
| [`compilation-and-testing.md`](references/compilation-and-testing.md) | compile clean (warnings-as-errors) · the include-path/error-106 trap · testing honestly ("Every Tick Based on Real Ticks") |
| [`shared-library.md`](references/shared-library.md) | header-only `.mqh` · `KONI_*_MQH` include guards · init-vs-constructor DI · stack-global lifetime · Logger/JSON idioms · the compile service |

## Non-negotiables (the short list)

These hold for **every** Koni EA; each reference expands them:

- **Signals on closed bars, never the forming tick** — read bar `[1]`/`[2]`, gate
  entries behind a new-bar check. (Repaint and tick-noise both die here.)
- **CTrade, never raw `OrderSend`.** Hand-filling `MqlTradeRequest` and hand-decoding
  `MqlTradeResult` is a silent-error site; CTrade centralizes it and does everything
  `OrderSend` can (see [trading-mechanics](references/trading-mechanics.md#ctrade)).
  Set `SetExpertMagicNumber` in `OnInit`; set the filling mode with
  `SetTypeFillingBySymbol(_Symbol)`.
- **Check `ResultRetcode()`, not just the boolean** — CTrade's `bool` says the request
  was *accepted*, not *filled* (a `Buy()` can return `true` on a requote or partial);
  set state flags only after `TRADE_RETCODE_DONE`, or you track a position the server
  never opened.
- **Release every indicator handle in `OnDeinit`**, guarded, reset to `INVALID_HANDLE`.
- **`ArraySetAsSeries(buf, true)`** before every `CopyBuffer`, and check its return
  `>= count` before using the data.
- **`NormalizeDouble(price, _Digits)`** on every price; snap lots to
  `SYMBOL_VOLUME_STEP` and clamp to `[min, max]`.
- **Enforce `SYMBOL_TRADE_STOPS_LEVEL`** as the minimum SL/TP distance.
- **Pre-check margin/volume, never post-check** — a pending limit's placement
  retcode says nothing about whether it will fill.
- **Survive a restart** — rebuild in-flight state by scanning open positions by
  magic; persist latches in GlobalVariables.
- **One MagicNumber per instance, never reused** — MT5 does not enforce uniqueness,
  and a shared magic silently merges two EAs' positions.
- **Compile clean** (zero errors, warnings-as-errors) and test in **"Every Tick
  Based on Real Ticks"** before trusting a result.
- **English** for code, comments, and commits.
