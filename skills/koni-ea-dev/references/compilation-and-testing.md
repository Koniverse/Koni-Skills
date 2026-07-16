# Compile clean & test honestly

The two correctness gates a Koni EA passes before it is trusted: it **compiles with
zero errors** (and no warnings you have not consciously accepted), and its logic is
validated in a **realistic** Strategy-Tester run — not one whose mode flatters the
result. Both are part of programming correctly; neither is optional.

**Contents**: [Compile clean](#compile-clean) · [Compile in the loop (MCP)](#compile-in-the-loop-an-mql5-mcp-server) ·
[The include-path trap](#the-include-path-trap) · [Test honestly](#test-honestly)

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
- **In the loop (MCP)**: when an MQL5-compile MCP server is wired, don't leave the
  compile to a human — close the loop yourself (next section).

## Compile in the loop (an MQL5 MCP server)

An MQL5-compile MCP server turns "compile clean" from a prescription into a **loop
the agent closes itself**: write the EA → compile → read the real MetaEditor
diagnostics → fix → recompile, until **zero errors and zero warnings**. Do this
before claiming an EA compiles — a compile you did not run is not evidence.

**Division of labor.** The server does **not** write code — that is this skill's job.
It is a *verification* engine, not a generator: **this skill authors the EA to the
rules here; the MCP compiles it and looks up the docs.** That is exactly the server's
headline "auto-fixing loops" — it feeds the real MetaEditor errors back so the agent
fixes and recompiles. The better you author to the [non-negotiables](../SKILL.md) and
[pitfalls](mql5-pitfalls.md) up front, the faster the loop converges (fewer round-trips).

The reference implementation is `mcp-server-mql5`
([github.com/elliottwaves-20/mcp-server-mql5](https://github.com/elliottwaves-20/mcp-server-mql5)),
a small **Python** server that shells out to a local `metaeditor64.exe`. Two tools:

- **`compile_mql5(code, filename="ExpertAdvisor")`** — takes the EA **source as a string**, writes it
  to a temp `.mq5`, runs MetaEditor `/compile`, and returns the log (errors +
  warnings). Feed it the draft, read the diagnostics, fix, recompile.
- **`search_mql5_docs(search_term)`** — searches `mql5.com/docs` and returns the
  **matched page's actual text** (source URL + content, truncated), not just a link.
  Use it to **verify an unfamiliar function or constant against the real docs before
  you write the call** — the same anti-hallucination discipline this skill applies
  everywhere (a plausible API is not a real one).

**What it can and cannot compile.** The server writes the source to an **isolated
temp dir** and passes **no `/include` root**, so only the editor's **stock**
`<Trade\...>` includes resolve. That is exactly right for a **self-contained strategy
EA** (this skill's default mode — stock includes only). It will **not** resolve a
quoted-relative `#include "sibling.mqh"`, a `#resource`, or a Koni `<Koni/...>`
include, so it does **not** cover [`shared-library.md`](shared-library.md) mode —
compile those with the full `/include` contract instead.

**Config — corrected.** The config circulated for this server has three errors; the
working form:

- it is a **Python** package → run it with **`uvx`**, not `npx` (there is no
  `package.json`, so an `npx` command fails to start it);
- the env var is **`MQL5_EDITOR_PATH`**, not `METAEDITOR_PATH` — and it is
  **optional**: the server auto-detects `metaeditor64.exe` in the common MT5 install
  paths, so set it explicitly only if detection fails or you run several terminals;
- there is **no `MQL5_DIR`** — the server ignores it.

Windows only (it drives `metaeditor64.exe`; use double-backslash paths):

```json
{
  "mcpServers": {
    "mql5-server": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/elliottwaves-20/mcp-server-mql5.git", "mcp-server-mql5"],
      "env": {
        "MQL5_EDITOR_PATH": "C:\\Program Files\\MetaTrader 5\\metaeditor64.exe"
      }
    }
  }
}
```

The server hands back a decoded log string — read it for `error` / `warning` lines
and the `Result: N errors` summary; the MetaEditor foot-guns (unreliable exit code,
UTF-16 log) are its problem, not yours.

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
