# MQL5 pitfalls — the production-only bug list

Every item here is a bug that a **green backtest hides** and that only surfaces on
a live account. Walk this as a self-verify checklist before compiling
(step 6 of the [programming loop](../SKILL.md)). Ordered roughly by how often it
bites.

**Contents**: [Repaint / bar-close](#repaint--evaluate-on-bar-close) ·
[Backtest mode](#backtest-mode-inflates-results) ·
[Pending-fill margin](#pending-limit-fills-carry-no-margin-guarantee) ·
[Handle leak](#indicator-handle-leak) · [CopyBuffer short](#copybuffer-can-return-short) ·
[Series order](#arraysetasseries-is-not-default) · [Stop level](#stops_level-minimum-distance) ·
[Normalization](#price--lot-normalization) · [Filling mode](#filling-mode-rejection) ·
[Self-recovery](#self-recovery-after-restart) · [Magic collision](#magicnumber-collision)

## Repaint — evaluate on bar close

Repainting indicators (AlphaTrend and friends) redraw the current bar as new
ticks arrive, so a signal read from bar `[0]` looks perfect in a backtest and
evaporates live. **Read closed bars only** — index `[1]`/`[2]` — and gate entries
behind a [new-bar check](trading-mechanics.md#new-bar-detection). For a known
repainter, add a `> [!WARNING]` block to the EA doc and mentally discount the
backtest win-rate by 20–30%.

## Backtest mode inflates results

"Open Prices Only" over-states win-rate by 10–15% because intra-bar SL/TP order is
faked. **Any release-grade backtest runs in "Every Tick Based on Real Ticks"** on
the live timeframe, minimum 3 months. "Open Prices Only" is for fast dev
iteration only. Record the mode in the EA doc.

## Pending-limit fills carry no margin guarantee

A `BuyLimit`/`SellLimit` placement returns `TRADE_RETCODE_DONE` **whether or not
the eventual fill is affordable** — the broker reserves no margin at placement and
signals rejection only server-side at fill, with no client retcode you can read.
Consequences:
- **Pre-check margin/volume before placing**, using the **market** order type in
  `OrderCalcMargin` (the LIMIT variant returns ~0). Full pattern:
  [`risk-management.md`](risk-management.md#margin-pre-check).
- Do not treat a `DONE` placement retcode as "the layer is safely on."

## Indicator handle leak

An `iMA`/`iATR`/`iCustom` handle created in `OnInit` **survives a recompile** if
not released. Release **every** handle in `OnDeinit`, guarded and reset:

```mq5
if(g_h != INVALID_HANDLE) { IndicatorRelease(g_h); g_h = INVALID_HANDLE; }
```

## CopyBuffer can return short

`CopyBuffer` may return fewer values than requested (data not yet built, history
still loading). **Check the return `>= count`** and bail for this tick. Crucially,
if new-bar detection and the copy are in the same tick, **advance `g_lastBarTime`
only after the copy succeeds** — otherwise a transient short read burns the bar
and the signal is silently skipped forever on that bar.

## ArraySetAsSeries is not default

A freshly declared array is **not** series-indexed — `[0]` is the oldest element,
not the newest. Call `ArraySetAsSeries(buf, true)` before/around every
`CopyBuffer`/`CopyRates` so `[0]` is the newest bar and `[1]` is the last closed
one. Forgetting it inverts every signal.

## STOPS_LEVEL minimum distance

A SL or TP closer to price than `SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL)`
points is **rejected** by the server. Clamp every stop distance with
`MathMax(dist, stopsLevel * _Point)` (+ a few points of safety). Details:
[`trading-mechanics.md`](trading-mechanics.md#sltp--the-broker-stop-level).

## Price & lot normalization

- **Prices**: `NormalizeDouble(price, _Digits)` on everything sent to the server —
  an unnormalized price is an "invalid price" rejection.
- **Lots**: snap to `SYMBOL_VOLUME_STEP` with `MathFloor(lot/step)*step`, then
  `NormalizeDouble(lot, digits)` where `digits = round(-log10(step))`, then clamp
  to `[VOLUME_MIN, VOLUME_MAX]`. Round **down** so risk is never exceeded. Full
  `NormLot`: [`trading-mechanics.md`](trading-mechanics.md#position-sizing).

## Filling mode rejection

A hard-coded `ORDER_FILLING_IOC`/`FOK` is rejected by symbols that do not support
it (the order fails with an unsupported-filling error). Use
`trade.SetTypeFillingBySymbol(_Symbol)` so the mode matches the symbol.

## Self-recovery after restart

A recompile, terminal restart, or `REASON_PARAMETERS` re-init **wipes all
in-memory state** while positions stay open. The EA must rebuild:
- **In-flight trade state** (a DCA basket, a breakout side) by scanning open
  positions filtered by magic (`RecoverBasket()`), and **guard against
  double-entry** (`HasOpenPositionByType(...)`) when a signal re-fires mid-recovery.
- **Latches and anchors** (equity peak, day-start equity, cooldown, SL freeze) from
  **GlobalVariables** keyed by prefix+magic+symbol+period — check
  `GlobalVariableCheck` before `GlobalVariableGet`.

## MagicNumber collision

MT5 does **not** enforce magic uniqueness. Two instances sharing a magic merge in
every position/deal query — every `PositionGetInteger(POSITION_MAGIC)` filter
matches both, so one EA manages the other's positions. Silent and corrupting. Give
each running instance its own magic, `> 0`, and never reuse one. (Assigning magics
and auditing a tree of EAs for duplicates is an operational task — see the
**koni-ea-ops** skill.)
