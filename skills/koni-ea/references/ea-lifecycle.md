# EA lifecycle — the canonical skeleton

Every Koni strategy EA is a single self-contained `.mq5` with the same
lifecycle backbone. This is the skeleton; the mechanics that fill it live in
[`trading-mechanics.md`](trading-mechanics.md) and [`risk-management.md`](risk-management.md).

**Contents**: [Header block](#header-block) · [Event functions](#event-functions) ·
[OnInit order](#oninit-order-of-operations) · [OnTick shapes](#ontick-shapes) ·
[OnDeinit](#ondeinit) · [OnTradeTransaction](#ontradetransaction) ·
[OnTimer](#ontimer) · [The skeleton](#the-skeleton)

## Header block

Before any include, at the very top of the file:

```mq5
//+------------------------------------------------------------------+
//|                                                    STP_v1.00.mq5 |
//|                         Safe Trend Pullback (STP) Expert Advisor |
//+------------------------------------------------------------------+
#property version     "1.00"          // MUST equal the file's minor version "X.YY"
#property description "Safe Trend Pullback (STP) — trend pullback, no DCA. M15."
#property copyright   "<author/org>"   // NOT the MetaEditor template default
```

Rules:
- **`#property version` string equals the file's version** as `"X.YY"` (`"1.09"`,
  `"3.02"`) — keep the two in sync so the source states its own version truthfully.
- **`#property strict` is inert in MQL5** — it is an MQL4 directive; the MQL5
  compiler is always strict. Some corpus EAs carry it as a harmless carryover.
  Leaving it out is correct; adding it changes nothing. Do not rely on it for
  anything.
- `#property description` is a one-line human summary; include the recommended
  timeframe/symbol. It shows in the EA's "Common" tab.
- Set `#property copyright` to the real author/org — **not** the MetaEditor
  template default `"Copyright 2026, MetaQuotes Ltd."` (six EAs shipped with the
  unedited default; do not add a seventh).

## Event functions

Use only the callbacks the strategy needs, declared in this order:

| Callback | When | Use it for |
|---|---|---|
| `OnInit()` | attach / recompile / param change | validate inputs, create handles, config CTrade, seed/recover state |
| `OnDeinit(const int reason)` | detach / recompile / shutdown | **release handles**, kill timer, clear chart objects |
| `OnTick()` | every incoming tick | manage open positions per-tick; gate entries behind a new-bar check |
| `OnTradeTransaction(...)` | a deal/order/position event | detect an SL-closed deal for a cooldown; audit fills |
| `OnTimer()` | `EventSetTimer` interval | slow housekeeping (legacy DCA); prefer per-tick management in new EAs |

Do not use `OnTester`/`OnChartEvent` unless the strategy specifically needs them.

## OnInit order of operations

The fixed sequence — deviating from it is how EAs ship with leaked handles or
unvalidated inputs:

1. **Validate inputs.** Bad *parameter* → `return(INIT_PARAMETERS_INCORRECT);`
   (MT5 reopens the inputs dialog). Bad *environment* (wrong timeframe, missing
   symbol) → `return(INIT_FAILED);`. Factor non-trivial validation into a
   `bool ValidateInputs()`.
2. **Create indicator handles** (`iMA`/`iATR`/`iCustom`/…). Check **each** against
   `INVALID_HANDLE` and `return(INIT_FAILED);` on any failure.
3. **`ArraySetAsSeries(buf, true)`** on any persistent buffer arrays you keep as
   members (per-call local buffers can set it locally instead).
4. **Configure CTrade**: `trade.SetExpertMagicNumber(InpMagicNumber);` then
   `trade.SetDeviationInPoints(...)` and `trade.SetTypeFillingBySymbol(_Symbol);`.
5. **Seed / recover state** — rebuild in-flight state from open positions by magic
   (a DCA basket) and read persisted latches from GlobalVariables (equity peak,
   day anchor). See [self-recovery](mql5-pitfalls.md#self-recovery-after-restart).
6. **Log a startup line** with `PrintFormat(...)` echoing symbol / timeframe /
   magic, so the Journal proves which instance started.
7. `return(INIT_SUCCEEDED);`

## OnTick shapes

**Shape A — manage per-tick, enter on new bar** (the default; STP/ORB):

```mq5
void OnTick() {
   ManageOpenPositions();          // trailing, partial TP, chain SL — every tick
   UpdateEquityPeakAndBreaker();   // risk latches — every tick

   if(!IsNewBar()) return;         // everything below runs once per closed bar
   RollDailyAnchorIfNeeded();
   if(CountMyPositions() > 0) return;      // one-position strategies bail here
   if(BreakerLatched()) return;            // circuit breaker
   if(!PassesOperationalFilters()) return; // spread / gap / session
   int signal = Signal();                  // evaluated on CLOSED bars [1]/[2]
   if(signal != 0) OpenTrade(signal);
}
```

**Shape B — fully new-bar-gated** (EMA_CO/MCTP): the first line is
`if(!IsNewBar()) return;` and all logic follows. Use it when there is nothing to
manage between bars.

Either way: **the entry signal is read from closed bars**, never bar `[0]`. See
[`trading-mechanics.md`](trading-mechanics.md#new-bar-detection).

## OnDeinit

Release everything `OnInit` acquired — this is not optional, a leaked handle
survives recompiles:

```mq5
void OnDeinit(const int reason) {
   if(g_emaHandle != INVALID_HANDLE) { IndicatorRelease(g_emaHandle); g_emaHandle = INVALID_HANDLE; }
   // …release every handle the same way…
   if(UsesTimer) EventKillTimer();
   ObjectsDeleteAll(NULL, "myprefix_");   // remove chart objects this EA drew
   Comment("");                            // clear the on-chart comment
}
```

## OnTradeTransaction

The idiom for reacting to a closed deal (e.g. an SL hit → start a cooldown):

```mq5
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result) {
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;
   if(!HistoryDealSelect(trans.deal)) return;
   if(HistoryDealGetInteger(trans.deal, DEAL_MAGIC)  != InpMagicNumber) return;
   if(HistoryDealGetString (trans.deal, DEAL_SYMBOL) != _Symbol)        return;
   if(HistoryDealGetInteger(trans.deal, DEAL_ENTRY)  != DEAL_ENTRY_OUT) return;
   if(HistoryDealGetInteger(trans.deal, DEAL_REASON) == DEAL_REASON_SL) StartCooldown();
}
```

## OnTimer

Only for slow, wall-clock-paced housekeeping. `EventSetTimer(3600)` in `OnInit`,
`EventKillTimer()` in `OnDeinit`. New EAs prefer per-tick management (the modern
DCA EAs dropped `OnTimer` for it); reach for a timer only when the cadence must
be time-based rather than tick-based.

## The skeleton

Copy this shape into a new EA and fill the marked sections:

```mq5
#property version     "1.00"
#property description "<one line>"
#property copyright   "<author/org>"

#include <Trade\Trade.mqh>

input group "==== General ===="
input long   InpMagicNumber = 0;      // unique per instance; validate > 0
input double InpLotSize     = 0.01;   // base lot
// …strategy inputs (see inputs-and-naming.md)…

CTrade   trade;
datetime g_lastBarTime = 0;
// …handles (INVALID_HANDLE), state structs…

int OnInit() {
   if(InpMagicNumber <= 0) { Alert("MagicNumber must be > 0"); return INIT_PARAMETERS_INCORRECT; }
   // create + check handles → INIT_FAILED on INVALID_HANDLE
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFillingBySymbol(_Symbol);
   // seed/recover state
   PrintFormat("[INIT] %s %s magic=%d", _Symbol, EnumToString((ENUM_TIMEFRAMES)_Period), InpMagicNumber);
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) {
   // IndicatorRelease every handle, guarded + reset to INVALID_HANDLE
   Comment("");
}

bool IsNewBar() {
   datetime t = iTime(_Symbol, _Period, 0);
   if(t == g_lastBarTime) return false;
   g_lastBarTime = t;
   return true;
}

void OnTick() {
   ManageOpenPositions();
   if(!IsNewBar()) return;
   // filters → signal (closed bars) → OpenTrade
}
```
