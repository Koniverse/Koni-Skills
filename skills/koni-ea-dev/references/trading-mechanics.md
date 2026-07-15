# Trading mechanics

How a Koni EA places, sizes, and manages trades. Every idiom here is the
copy-target from the strategy corpus; the traps they avoid are cross-linked to
[`mql5-pitfalls.md`](mql5-pitfalls.md).

**Contents**: [CTrade](#ctrade) · [New-bar detection](#new-bar-detection) ·
[Indicators](#reading-indicators) · [Position sizing](#position-sizing) ·
[SL/TP & stop level](#sltp--the-broker-stop-level) ·
[Position-by-magic](#managing-positions-by-magic) · [DCA / grid](#dca--grid-layering) ·
[Breakout / range](#breakout--range-state)

## CTrade

Always `#include <Trade\Trade.mqh>` and drive orders through a single `CTrade`
instance — **never raw `OrderSend`**. Raw `OrderSend` forces you to hand-fill an
`MqlTradeRequest` (filling mode, deviation, magic, order type) and hand-decode an
`MqlTradeResult` — every field a place to get it silently wrong; `CTrade` centralizes
exactly that handling, and anything `OrderSend` can do it exposes (`Buy`/`Sell`,
`BuyLimit`/`SellLimit`, `PositionModify`/`PositionClose`/`PositionClosePartial`,
`OrderDelete`), so there is no case that legitimately needs the raw call. DCA/basket
EAs also include `<Trade\PositionInfo.mqh>` + `<Trade\OrderInfo.mqh>` and use
`CPositionInfo` / `COrderInfo` selectors.

Configure once in `OnInit` (see [`ea-lifecycle.md`](ea-lifecycle.md#oninit-order-of-operations)):

```mq5
trade.SetExpertMagicNumber(InpMagicNumber);
trade.SetDeviationInPoints(10);          // slippage cap in points
trade.SetTypeFillingBySymbol(_Symbol);   // prefer this over a hard ORDER_FILLING_IOC
```

Placement: `trade.Buy/Sell(lot,_Symbol,price,sl,tp,comment)`; pendings
`trade.BuyLimit/SellLimit(...)`; management `trade.PositionModify`,
`PositionClose`, `PositionClosePartial`, `OrderDelete`. **After every trade call,
check the boolean return AND** `trade.ResultRetcode()`:

```mq5
if(!trade.Buy(lot,_Symbol,0,sl,tp,"entry") || trade.ResultRetcode() != TRADE_RETCODE_DONE) {
   PrintFormat("[ENTRY] failed: %d %s", trade.ResultRetcode(), trade.ResultRetcodeDescription());
   return;
}
```

Only set a state flag (e.g. "position open") **after** confirming
`TRADE_RETCODE_DONE` — never before the call. **The boolean alone is not enough**:
CTrade's `bool` return says only that the request was *sent and accepted*, not that
the server *filled* it — a `Buy()` can return `true` on a requote, a partial, or a
placed-but-not-done order. Acting on the bool alone leaves you tracking a position
the server never completed (phantom state); the retcode is the server's verdict, the
bool is not.

## New-bar detection

Gate entries so the signal is evaluated once per **closed** bar:

```mq5
bool IsNewBar() {
   datetime t = iTime(_Symbol, _Period, 0);   // open time of the forming bar
   if(t == g_lastBarTime) return false;
   g_lastBarTime = t;
   return true;
}
```

`SeriesInfoInteger(_Symbol,_Period,SERIES_LASTBAR_DATE)` is an equivalent probe.

**Critical refinement**: the `IsNewBar()` above commits `g_lastBarTime`
immediately, which is correct **only** when the tick does no fallible read. When the
entry does a `CopyBuffer` that can fail, don't use the simple gate — **peek** the
bar, do the copies, and **commit only after they succeed**, or a failed read burns
the bar and the signal is skipped ([`mql5-pitfalls.md`](mql5-pitfalls.md#copybuffer-can-return-short)):

```mq5
datetime bar = iTime(_Symbol, _Period, 0);
if(bar == g_lastBarTime) return;                       // not a new bar
double ema1, ema2;
if(!EMAValue(h, 1, ema1) || !EMAValue(h, 2, ema2)) return;  // copy failed — bar NOT committed, retry next tick
g_lastBarTime = bar;                                   // commit only after every read succeeded
// …evaluate the signal on ema1 / ema2…
```

## Reading indicators

Create handles in `OnInit`, read them on closed bars:

```mq5
bool EMAValue(int handle, int shift, double &out) {
   double buf[];
   ArraySetAsSeries(buf, true);
   if(CopyBuffer(handle, 0, shift, 1, buf) < 1) return false;  // short read → signal it
   out = buf[0];
   return true;
}
```

Return a **bool + out-param**, not a bare `double` — a short read must be
distinguishable from a real `0.0`, or the caller cannot honour the "advance
`g_lastBarTime` only after the copy succeeds" refinement
([new-bar detection](#new-bar-detection)). On `false`, bail for this tick and retry.

- **`ArraySetAsSeries(buf, true)`** so `[0]` is newest; then index `[1]` = last
  closed bar, `[2]` = the one before (a cross is `[2]→[1]`).
- **Check the `CopyBuffer` return `>= count`** and bail on a short read.
- Evaluate crosses/comparisons on `[1]`/`[2]`, **never `[0]`** (the forming bar
  repaints).

## Position sizing

Two families — pick per strategy:

**Fixed lot**: an `InpLotSize` / `InpBaseLot`, normalized before use.

**Risk-% of equity** (the money-management default for non-DCA EAs):

```mq5
double CalcLotSize(double slDistPrice) {
   double tickVal  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double risk     = AccountInfoDouble(ACCOUNT_EQUITY) * InpRiskPercent / 100.0;
   double lot      = risk / (slDistPrice / tickSize * tickVal);
   // skip BEFORE NormLot — forcing a sub-min lot up to VOLUME_MIN breaks the risk contract:
   if(lot < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN)) {
      Print("[SIZE] risk too small for one min-lot — skipping this trade");
      return 0.0;   // caller MUST treat 0 as "do not trade", not as a lot
   }
   return NormLot(lot);
}
```

The sub-min **skip comes before `NormLot`** (as `STP_v1.00` does): `NormLot` clamps
*up* to `VOLUME_MIN`, so a lot that reached it would trade min-size and silently
break the risk contract — the caller can no longer tell a forced-min lot from a
legitimate one. Check `< VOLUME_MIN` in the risk path and return `0.0`; the entry
code skips on `0.0`. Then **normalize and clamp** a valid lot with `NormLot`:

```mq5
double NormLot(double lot) {
   double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double lo   = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double hi   = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   lot = MathFloor(lot / step) * step;                 // round DOWN — never exceed risk
   int digits = (int)MathRound(-MathLog10(step));
   return NormalizeDouble(MathMax(lo, MathMin(hi, lot)), digits);
}
```

- **Round down (`MathFloor`)**, so the actual lot never exceeds the risk budget.
  (`ALPHA_TREND` rounds up with `MathCeil` — do not copy; that overshoots risk.)
- If the computed lot `< SYMBOL_VOLUME_MIN`, **skip the trade** (do not silently
  force min lot — that breaks the risk contract; log and return).
- The `VOLUME_MAX` clamp is deliberately **omitted before a margin pre-check** so
  the pre-check can *see* an overflow and **block** it, instead of a silent up-front
  clamp hiding it — see [`risk-management.md`](risk-management.md#margin-pre-check).
  For the DCA/pending path, snap to step and clamp only the **minimum**, leaving
  `VOLUME_MAX` to that pre-check:
  ```mq5
  double NormLotNoMax(double lot) {   // step + VOLUME_MIN only; VOLUME_MAX left to the margin pre-check
     double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
     double lo   = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
     lot = MathFloor(lot / step) * step;
     int digits = (int)MathRound(-MathLog10(step));
     return NormalizeDouble(MathMax(lo, lot), digits);
  }
  ```
  Use `NormLot` on the standard single-entry path, `NormLotNoMax` on a lot that a
  margin pre-check must still be able to reject as too large.

## SL/TP & the broker stop level

Compute SL/TP as price **distances** (usually `ATR * mult`, `tp = slDist * RR`),
apply around bid/ask, and enforce the broker minimum:

```mq5
double stopsLevel = (double)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
double minStop    = stopsLevel * _Point;
double slDist     = MathMax(atr * InpAtrSLMult, minStop + 3 * _Point);  // +3pt safety
// long example — a buy fills at ASK, so base its stops on ask:
double sl = NormalizeDouble(ask - slDist, _Digits);
double tp = NormalizeDouble(ask + slDist * InpRR, _Digits);
// a short mirrors it off BID: sl = bid + slDist, tp = bid - slDist * InpRR
```

- **Base a side's stops on the price it fills at** — a buy at `ask`, a sell at
  `bid`; mixing the two shifts every stop by a half-spread.
- **`NormalizeDouble(price, _Digits)`** on every price sent to the server.
- A SL/TP closer than `SYMBOL_TRADE_STOPS_LEVEL` is rejected — always clamp with
  `MathMax(dist, minStop)` (+ a few points of safety).

## Managing positions by magic

The universal loop — iterate **downward** (positions reindex on close), filter by
symbol AND magic:

```mq5
int CountMyPositions() {
   int n = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--) {
      ulong ticket = PositionGetTicket(i);          // also selects the position
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL)  != _Symbol)        continue;
      if(PositionGetInteger(POSITION_MAGIC)  != InpMagicNumber) continue;
      n++;
   }
   return n;
}
```

- `PositionGetTicket(i)` **selects** as it returns — read `PositionGet*` right
  after. DCA EAs prefer `CPositionInfo::SelectByIndex(i)` then `.Symbol()` /
  `.Magic()`.
- When closing inside a loop, re-read `PositionsTotal()` if it changed mid-loop,
  and skip re-managing a side you just closed this tick.

## DCA / grid layering

Two shipped patterns — both key everything off the **magic number** and rebuild
after restart:

- **Fibonacci basket (ALPHA_TREND_DCA)** — level 0 is a **market** order; levels
  1..N are **limit** orders at `entry ∓ grid*i`; lot per level = `baseLot * Fib(i)`.
  Grid size is dynamic (`max(range/InpMaxDCA, InpGrid*_Point)`). The basket exits
  on a **weighted-average** TP: `avg = Σ(open·vol)/Σvol`, TP ratio shrinks as the
  count grows. A `BasketState` struct + `RecoverBasket()` reconstruct it from open
  positions on restart.
- **Zone/level grid (GRID_DCA)** — all **market** orders (no pendings), a
  `double ZoneVolume[zones][levels]` lot matrix, a `MAX_ORDERS_PER_SIDE` cap. Chain
  identity is **encoded in the order comment** (`{prefix}_{PERIOD}_{B|S}_{NN}`) and
  parsed back to group a chain.

For DCA the pending-fill margin trap is acute — read
[`mql5-pitfalls.md`](mql5-pitfalls.md#pending-limit-fills-carry-no-margin-guarantee)
before layering limits.

## Breakout / range state

Range/breakout EAs keep a `struct` of the session (`start_time`, `end_time`,
`high`, `low`, breakout flags) with a ctor initializer list, detect the session
window from tick time, and update the extreme inside the window. Guard entries
with a **restart-recovery check** (`HasOpenPositionByType(POSITION_TYPE_BUY)`) so a
recompile mid-range does not double-enter. Draw the range with chart objects
prefixed by the EA name and delete them in `OnDeinit`.
