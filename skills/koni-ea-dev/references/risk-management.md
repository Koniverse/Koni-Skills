# Risk & money management

The guards that keep an EA from blowing an account. These are separate from the
entry logic on purpose — a strategy can be right and still ruin the account
without them. Add every guard that applies; each is a real mechanism from the
corpus.

**Contents**: [Position cap](#position-cap) · [Equity circuit breaker](#equity-circuit-breaker) ·
[Daily loss limit](#daily-loss-limit) · [Trades-per-day cap](#trades-per-day-cap) ·
[Operational filters](#operational-filters) · [Cooldown](#cooldown-after-a-loss) ·
[Margin pre-check](#margin-pre-check) · [Slippage & filling](#slippage--filling-mode)

## Position cap

State the maximum concurrent positions and enforce it before every entry:

- **Single-position strategies** (STP): `if(CountMyPositions() > 0) return;` at the
  top of the entry block.
- **DCA/grid**: cap the chain with `InpMaxDCA` / `MAX_ORDERS_PER_SIDE` and refuse a
  new layer past it (log `[DCA-BLOCK]`).

`CountMyPositions()` is the magic-filtered loop in
[`trading-mechanics.md`](trading-mechanics.md#managing-positions-by-magic).

## Equity circuit breaker

A **latched** drawdown breaker — once tripped it stays tripped until a manual
reset input, so a bad session cannot keep re-entering:

```mq5
// every tick:
double eq = AccountInfoDouble(ACCOUNT_EQUITY);
if(eq > g_equityPeak) g_equityPeak = eq;                     // ratchet the peak
double ddPct = (g_equityPeak - eq) / g_equityPeak * 100.0;
if(ddPct >= InpEquityBreakerPct) g_halt = true;             // LATCH — no auto-unlatch
// entry gate:  if(g_halt && !InpResetBreaker) return;
```

Persist `g_equityPeak` (and `g_halt`) in a GlobalVariable keyed by
prefix+magic+symbol+period so the latch survives a restart.

## Daily loss limit

Capture equity at the start of each trading day (a `RollDailyAnchor` on the first
new bar of a new day), then block entries once the day's PnL crosses the limit:

```mq5
double dayPnlPct = (eq - g_dayStartEquity) / g_dayStartEquity * 100.0;
if(dayPnlPct <= -InpDailyLossLimitPct) return;   // done trading for the day
```

## Trades-per-day cap

Count today's entry deals for this magic from history (restart-safe — do not keep
an in-memory counter that a recompile resets):

```mq5
int TradesToday() {
   datetime dayStart = /* today 00:00 server time */;
   HistorySelect(dayStart, TimeCurrent());
   int n = 0;
   for(int i = HistoryDealsTotal() - 1; i >= 0; i--) {
      ulong d = HistoryDealGetTicket(i);
      if(HistoryDealGetInteger(d, DEAL_MAGIC) != InpMagicNumber) continue;
      if(HistoryDealGetInteger(d, DEAL_ENTRY) == DEAL_ENTRY_IN)  n++;
   }
   return n;
}
```

## Operational filters

Cheap pre-trade gates, each an input-controlled toggle:

- **Spread**: `SymbolInfoInteger(_Symbol, SYMBOL_SPREAD) <= InpMaxSpreadPoints`.
- **Gap** (news/weekend open): `MathAbs(iOpen(_Symbol,_Period,0) - iClose(_Symbol,_Period,1)) / _Point <= InpMaxGapPoints`.
- **Session window**: gate on the hour via `TimeToStruct`. **Use UTC**, not server
  time — brokers differ, and a UTC window is reproducible. (The corpus mixes
  server-time and UTC; UTC is the standard. State the timezone in the EA doc.)
- **Day-of-week**: `InpMonday`…`InpFriday` toggles for strategies that avoid
  specific days.
- **Session close**: flat positions `InpCloseBeforeMinutes` before session end for
  intraday strategies (handle the midnight wrap).

## Cooldown after a loss

After an SL-closed deal, freeze new entries for `InpCooldownBars`. Detect the SL
close in [`OnTradeTransaction`](ea-lifecycle.md#ontradetransaction) and stamp the
bar/time; the entry gate checks the cooldown has elapsed.

## Margin pre-check

**The load-bearing rule.** A broker does **not** reserve margin when a `BuyLimit`
/ `SellLimit` is placed — placement returns `TRADE_RETCODE_DONE` regardless, and
rejection happens server-side at fill with **no client retcode**. So you cannot
learn from the placement whether the fill is affordable. **Pre-check, before
placing:**

```mq5
double margin;
// use the MARKET order type — the LIMIT variant returns ~0 and is useless here:
if(!OrderCalcMargin(ORDER_TYPE_BUY, _Symbol, lot, ask, margin)) {
   // FAIL-PERMISSIVE: the calc API itself failed (e.g. symbol not in MarketWatch).
   // Log and let placement proceed — the broker still rejects an unaffordable fill.
   // Blocking here would disarm a whole DCA chain for an unrelated reason.
   PrintFormat("[MARGIN] OrderCalcMargin failed: %d — allowing placement", GetLastError());
} else if(margin > AccountInfoDouble(ACCOUNT_MARGIN_FREE)) {
   Print("[MARGIN] insufficient free margin — blocking entry");
   return;   // the check SUCCEEDED and said no → block
}
if(lot > SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX)) { Print("[MARGIN] lot over VOLUME_MAX"); return; }
```

Two sub-rules the corpus learned the hard way:
- **Distinguish "the check failed to run" from "the check said no."** When
  `OrderCalcMargin` *returns a value* over free margin → **block**. When the call
  *itself fails* → **permit** (log + proceed): the corpus (EMA_MIRROR v1.03, LESSONS
  §6) chose fail-permissive because a calc failure for an unrelated reason (symbol
  not in MarketWatch) must not block a chain, and the broker still rejects a truly
  unaffordable fill. Never leave the `false` branch empty — that silently skips the
  gate without recording the choice.
- Compute the lot **without** the `VOLUME_MAX` clamp so this check can *see* the
  overflow and **block** it (the `lot > VOLUME_MAX` guard above). Nothing clamps it
  later — an over-max lot is rejected by the server (`TRADE_RETCODE_INVALID_VOLUME`),
  not silently reduced; the block here is what stops it reaching the order call.

## Slippage & filling mode

- **Slippage**: `trade.SetDeviationInPoints(10)` (points) in `OnInit`.
- **Filling mode**: `trade.SetTypeFillingBySymbol(_Symbol)` — it picks a mode the
  symbol supports. Prefer it over a hard-coded `ORDER_FILLING_IOC`/`FOK`, which a
  symbol may reject (order fails with an unfilled-mode error).
