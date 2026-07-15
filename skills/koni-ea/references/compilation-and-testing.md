# Compile clean & test honestly

The two correctness gates a Koni EA passes before it is trusted: it **compiles with
zero errors** (and no warnings you have not consciously accepted), and its logic is
validated in a **realistic** Strategy-Tester run — not one whose mode flatters the
result. Both are part of programming correctly; neither is optional.

**Contents**: [Compile clean](#compile-clean) · [The include-path trap](#the-include-path-trap) ·
[Test honestly](#test-honestly)

## Compile clean

- **Local**: open the `.mq5` in **MetaEditor → Compile (F7)**. Zero errors is the
  bar; **treat warnings as errors** — an implicit narrowing conversion or an unused
  result is exactly the kind of thing that misbehaves live.
- **Automated (the Koni compile service)**: a MetaEditor CLI wrapper used to produce
  `.ex5` headlessly. Two things about it are load-bearing for anyone reading its
  output:
  - **Success is the parsed `Result: 0 errors` line, not the process exit code** —
    MetaEditor's exit codes are unreliable. Do not gate on `$?`.
  - The MetaEditor log is **UTF-16LE**; decode it BOM-tolerantly or every line reads
    as mojibake. Diagnostics match `file(line,col) : error CODE: msg`.
  - Full contract (isolation, `#resource` deps, the GUI-session requirement):
    [`shared-library.md`](shared-library.md#compile-service).

## The include-path trap

The single most common build failure is **error 106 — cannot open include file**,
and it is almost always a path mistake, not a missing file:

- When compiling from the CLI, pass `/include:<MQL5 root>` — **not**
  `<MQL5 root>\Include`. MetaEditor appends `\Include` itself, so pointing at the
  `Include` dir double-nests to `…\Include\Include\Trade\Trade.mqh` and every
  `#include <Trade/Trade.mqh>` fails.
- In source, cross-library includes use angle brackets resolved from that root
  (`#include <Trade\Trade.mqh>`, `#include <Koni/Common/JSON.mqh>`); same-directory
  siblings use quoted-relative (`#include "Winsock.mqh"`). Mixing them up is the
  other half of error 106.

## Test honestly

A backtest is a **correctness check on your logic**, and its mode decides whether it
tells the truth:

- **"Every Tick Based on Real Ticks"** for any test you draw a conclusion from —
  it replays real tick sequences, so intrabar SL/TP ordering and fill behaviour are
  realistic.
- **"Open Prices Only"** is for fast dev iteration **only**. It fakes intrabar
  order and inflates win-rate by ~10–15%; a number from it is not evidence.
- Test on the **live timeframe** the EA will run, over a window long enough to cover
  varied regimes (the corpus standard is ≥ 3 months).
- A green backtest does **not** clear the [MQL5 pitfalls](mql5-pitfalls.md) — repaint,
  a handle leak, or a lost-state-after-restart bug can all pass a backtest and fail
  live. The tester validates the *strategy logic*; the pitfalls checklist validates
  the *code*. Both must pass.
