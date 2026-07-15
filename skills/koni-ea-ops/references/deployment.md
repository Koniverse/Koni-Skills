# Deployment

Getting a released version running on a MetaTrader 5 terminal, and producing the
production `.ex5` it deploys from. The goal is a running instance whose identity
(version, symbol, timeframe, magic) is verifiable from the Journal, not assumed.

**Contents**: [Producing the `.ex5`](#producing-the-ex5) · [Deploy to a terminal](#deploy-to-a-terminal) ·
[Verify the Journal](#verify-the-journal)

## Producing the `.ex5`

- **Local**: open the `.mq5` in MetaEditor → **Compile (F7)**. A release compiles
  with **zero errors and no unaddressed warnings**. (The correctness side of
  compiling — warnings-as-errors, the include-path trap — is in the **koni-ea-dev**
  skill; here it is a release gate: an EA that does not compile clean is not
  releasable.)
- **Production (the Koni compile service)**: a MetaEditor CLI wrapper on a
  dedicated Windows host that emits the `.ex5` headlessly. Two operational facts
  matter when reading its output:
  - **Success is the parsed `Result: 0 errors` line, not the process exit code** —
    MetaEditor's exit codes are unreliable; never gate a pipeline on `$?`.
  - Compile errors come back as **structured data** (`ok:false` + diagnostics), not
    a crash — treat a failed compile as a normal, inspectable outcome.

## Deploy to a terminal

1. Copy the `.mq5` (or `.ex5`) into the terminal's `MQL5/Experts/` tree; compile
   there if you copied source.
2. Attach the EA to the **correct symbol and timeframe** — the instance's identity
   in the registry must match the chart it runs on.
3. Load the version's **`.set`** file (this carries the MagicNumber and the tuned
   parameters).
4. Enable **AutoTrading**.

## Verify the Journal

A deploy is not done until the Journal confirms the instance came up clean:

- **No `INIT_FAILED`** and **no `INVALID_HANDLE`** — either means the EA aborted or
  an indicator handle did not build; the instance is not trading.
- The **startup line prints the expected magic** (the `OnInit` log echoing
  symbol / timeframe / magic). If the printed magic does not match the registry
  entry for this instance, stop — you are about to run the wrong identity.

Only once the Journal is clean and the magic matches is the instance considered
live; record or confirm its `instances[]` row in
[`registry-and-magic.md`](registry-and-magic.md#instances).
