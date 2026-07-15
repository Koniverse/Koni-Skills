---
name: koni-ea
description: >
  Use when writing, reviewing, versioning, or documenting an MQL5 Expert Advisor
  or custom indicator for MetaTrader 5 — the EA lifecycle skeleton
  (OnInit/OnTick/OnDeinit/OnTradeTransaction/OnTimer), input & naming conventions,
  CTrade order placement, new-bar detection, indicator handles, position sizing,
  SL/TP and broker stop-level handling, DCA/grid/breakout/trend mechanics,
  position-by-magic management, risk & money management (equity breaker, daily
  loss, spread/gap/session filters, margin pre-check), the MQL5 pitfalls
  (repaint, backtest-mode, filling mode, handle release, ArraySetAsSeries,
  self-recovery after restart), the v<X.YY> version/registry/MagicNumber scheme,
  compile & Strategy-Tester workflow, the per-version EA doc template, and the
  shared Koni .mqh library conventions — even without naming koni-ea.
---
# koni-ea — MQL5 Expert Advisor authoring standard

> koni-ea is the **standard for writing a Koniverse MQL5 Expert Advisor**: the
> lifecycle skeleton, the trading and risk mechanics, the MQL5 traps that only
> bite in production, and the version/registry/documentation discipline around a
> released EA. It is to MQL5 EAs what koni-qc is to test docs — a methodology,
> not a code generator.

This standard is **synthesized from two production corpora** and resolves the
places where they disagree (each reference calls out the divergence and the
chosen canonical form):

- **Strategy EAs** — the `Trading-Resources` archive of ~14 live EA families
  (EMA_CO, ORB, ALPHA_TREND_DCA, GRID_DCA, MFR_DCA, STP, TRB, …), each a
  self-contained `.mq5` including only the stock `<Trade\...>` classes.
- **The Koni MQL5 library** — the `Senti-Quant` `terminal_manager` header-only
  `Include/Koni/**` modules + a MetaEditor compile service, the reference for
  building **reusable `.mqh`** rather than a single-file strategy EA.

## When this applies

Writing a new EA or indicator, cutting a new version of one, reviewing an EA for
correctness/risk before it goes live, wiring order placement or position
management, chasing an MQL5-specific bug (a fill that never happened, a repaint,
a handle leak, a state loss after restart), or standardising an EA's inputs,
versioning, registry entry, or documentation.

## The two build modes

Pick the mode first — the conventions differ:

| Mode | You are building | Structure | Reference |
|---|---|---|---|
| **Strategy EA** | one algorithm's `.mq5` | single self-contained file, stock `<Trade\...>` includes only | all references below except the last |
| **Shared library** | a reusable `.mqh` module (net, streaming, a handler, a helper) | header-only, include-guarded, one class per file under `Include/Koni/` | [`shared-library.md`](references/shared-library.md) |

Most work is **Strategy EA** mode. Reach for library mode only when a module is
genuinely reused across EAs (the recurring copy-paste helpers — `CountMyPositions`,
`NormLot`, `IsNewBar` — are the migration candidates).

## The authoring loop

1. **Design before code.** Write (or read) the strategy design doc — entry/exit
   rules, the tick-vs-bar decision, SL/TP formulas, the money-management method,
   and the failure modes — before opening MetaEditor. A repaint or a
   martingale blow-up is a design flaw, not a coding one.
2. **Skeleton.** Lay down the lifecycle from [`ea-lifecycle.md`](references/ea-lifecycle.md)
   — the `#property` header, `OnInit` validation + handle creation, the `OnTick`
   new-bar gate, `OnDeinit` handle release.
3. **Inputs & naming.** Declare inputs and name everything per
   [`inputs-naming-structure.md`](references/inputs-naming-structure.md); place the
   file at `algorithms/mql5/<ALGO>/v<X>/v<X.YY>/`.
4. **Mechanics.** Implement entries/exits/management with
   [`trading-mechanics.md`](references/trading-mechanics.md) — CTrade, closed-bar
   signals, sizing, SL/TP with the broker stop-level, position-by-magic loops,
   DCA/grid layering.
5. **Risk.** Add the guards from [`risk-management.md`](references/risk-management.md)
   — position cap, equity breaker, daily loss, spread/gap/session filters, and
   the **margin pre-check** (never post-check).
6. **Self-verify against the pitfalls.** Walk [`mql5-pitfalls.md`](references/mql5-pitfalls.md)
   as a checklist — every item is a production bug that a green backtest hides.
7. **Compile & backtest.** Compile (MetaEditor F7 or the compile service), then
   Strategy-Test in **"Every Tick Based on Real Ticks"** — see
   [`versioning-release-docs.md`](references/versioning-release-docs.md#compile--backtest).
8. **Version, register, document.** Bump `v<X.YY>`, record the MagicNumber in the
   registry, and write the per-version doc — all in
   [`versioning-release-docs.md`](references/versioning-release-docs.md).

## Reference map

| Reference | Covers |
|---|---|
| [`ea-lifecycle.md`](references/ea-lifecycle.md) | `#property` header · OnInit/OnTick/OnDeinit/OnTradeTransaction/OnTimer · the standard order-of-operations · the canonical skeleton |
| [`inputs-naming-structure.md`](references/inputs-naming-structure.md) | `Inp` inputs · `input group` · enums · `g_`/`m_`/`C`/`ENUM_` naming · file/folder/`v<X.YY>` layout · English-code rule |
| [`trading-mechanics.md`](references/trading-mechanics.md) | CTrade · new-bar detection · indicator handles + `CopyBuffer` + `ArraySetAsSeries` · fixed & risk-% sizing · SL/TP + `SYMBOL_TRADE_STOPS_LEVEL` · position-by-magic · DCA/grid/breakout patterns |
| [`risk-management.md`](references/risk-management.md) | position cap · equity circuit breaker · daily-loss limit · spread/gap/session filters · cooldown · **margin pre-check** · slippage & filling mode |
| [`mql5-pitfalls.md`](references/mql5-pitfalls.md) | the production-only traps: repaint, backtest mode, pending-fill margin, handle release, `ArraySetAsSeries`, stop level, self-recovery, magic collision, normalization |
| [`versioning-release-docs.md`](references/versioning-release-docs.md) | `v<X.YY>` scheme · commit = release · registry & MagicNumber (Notion source of truth) · compile & Strategy-Tester · deploy · the per-version doc template |
| [`shared-library.md`](references/shared-library.md) | header-only `.mqh` · `KONI_*_MQH` include guards · init-vs-constructor DI · stack-global lifetime · Logger/JSON idioms · the compile service |

## Non-negotiables (the short list)

These hold for **every** Koni EA; each reference expands them:

- **Signals on closed bars, never the forming tick** — read bar `[1]`/`[2]`, gate
  entries behind a new-bar check. (Repaint and tick-noise both die here.)
- **CTrade, never raw `OrderSend`.** Set `SetExpertMagicNumber` in `OnInit`; set
  the filling mode with `SetTypeFillingBySymbol(_Symbol)`.
- **Release every indicator handle in `OnDeinit`**, guarded, reset to `INVALID_HANDLE`.
- **`NormalizeDouble(price, _Digits)`** on every price; snap lots to
  `SYMBOL_VOLUME_STEP` and clamp to `[min, max]`.
- **Enforce `SYMBOL_TRADE_STOPS_LEVEL`** as the minimum SL/TP distance.
- **Pre-check margin/volume, never post-check** — a pending limit's placement
  retcode says nothing about whether it will fill.
- **Survive a restart** — rebuild in-flight state by scanning open positions by
  magic; persist latches in GlobalVariables.
- **One MagicNumber per instance, assigned by the registry** — never hand-picked,
  never reused.
- **A `.set` parameter change on a live instance is a new minor version.**
- **English** for code, comments, and commits (operational SOPs may be Vietnamese).
