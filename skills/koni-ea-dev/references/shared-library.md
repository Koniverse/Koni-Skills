# Shared library conventions (reusable `.mqh`)

For **library mode** — building a reusable module rather than a single-file
strategy EA. This is the engineering standard from the Koni `terminal_manager`
`Include/Koni/**` library. Reach for it only when a module is genuinely shared
across EAs; a one-off strategy stays a self-contained `.mq5`.

**Contents**: [Module layout](#module-layout) · [Include guards](#include-guards) ·
[Naming](#naming) · [Init vs constructor](#init-vs-constructor) ·
[Object lifetime](#object-lifetime) · [Logging](#logging) · [JSON](#json) ·
[Handler / base-class pattern](#handler--base-class-pattern) ·
[Compile service](#compile-service)

## Module layout

One class per file, one responsibility per file, **header-only** `.mqh` under
`Include/Koni/<Category>/` (`Common/`, `Net/`, `Handlers/`, `Streaming/`,
`Crypto/`). There is **no C++ `namespace`** — "Koni" is a directory + include-path
+ `KONI_` macro convention. Cross-category includes use absolute angle brackets
(`#include <Koni/Common/JSON.mqh>`); same-directory siblings use quoted-relative
(`#include "Winsock.mqh"`). Every file opens with a banner box naming the file,
copyright, and its purpose.

## Include guards

Every `.mqh` is guarded, `KONI_<FILE>_MQH` uppercase, closed with a trailing
comment:

```mq5
#ifndef KONI_ORDERHANDLER_MQH
#define KONI_ORDERHANDLER_MQH
// …class…
#endif // KONI_ORDERHANDLER_MQH
```

## Naming

| Kind | Convention | Example |
|---|---|---|
| Class | `C` + PascalCase | `COrderHandler`, `CTCPServer`, `CJSONBuilder` |
| Member var | `m_` + camelCase | `m_listenSocket`, `m_needComma` |
| Global | `g_` + camelCase | `g_server`, `g_logLevel` |
| Method | PascalCase | `Handle()`, `Poll()`, `AddRoute()` |
| Constant `#define` | `UPPER_SNAKE` | `TCP_MAX_CLIENTS`, `WS_PING_INTERVAL_MS` |
| Enum | `ENUM_` + UPPER members | `ENUM_LOG_LEVEL { LOG_DEBUG, … }` |
| Struct | PascalCase, no prefix | `HTTPRequest`, `WSClient` |

Name **every** limit/tunable as a `#define` constant — no magic numbers in the
logic. This aligns with the strategy-EA naming in
[`inputs-and-naming.md`](inputs-and-naming.md#naming).

## Init vs constructor

MQL5 constructs file-scope globals **before** `OnInit()`, so a class cannot wire
its collaborators in its constructor. Split it:

- **Constructor** — only zero/`NULL` members: `CTickStreamer() : m_wsClients(NULL), m_cacheCount(0) {}`.
- **`Init(deps…)`** — the real wiring (dependency injection), called from the EA's
  `OnInit`: `streamer.Init(&g_wsClients);`.

Stateless utilities (`CJSONParser`, `CHTTPParser`, `CBase64`) are **all-`static`**
and never instantiated.

## Object lifetime

**Stack-allocated globals, `new`/`delete`-free by design.** Long-lived objects are
file-scope globals in the EA; collaboration is by **raw pointer to a global**,
injected via `Set*`/`Init`, and **always NULL-guarded** before use
(`if(m_router == NULL) return;`). This sidesteps MQL5 heap-leak risk entirely.
Containers are **fixed-capacity dynamic arrays** (`ArrayResize` to a `#define` max
in the constructor) with a `Reset()` method per slot struct for recycling — not
`CArrayObj`. The one manual resource that must be released symmetrically is a
`MarketBookAdd` → `MarketBookRelease` pair (release on both unsubscribe and client
removal so a disconnect cannot orphan a DOM subscription).

## Logging

Four free functions gated by one global level — not a class:

```mq5
enum ENUM_LOG_LEVEL { LOG_DEBUG=0, LOG_INFO=1, LOG_WARN=2, LOG_ERROR=3 };
ENUM_LOG_LEVEL g_logLevel = LOG_INFO;   // set once from InpLogLevel in OnInit
void LogError(string tag, string msg){ if(g_logLevel <= LOG_ERROR) Print("[ERROR][",tag,"] ",msg); }
```

Signature is always `Log*(string tag, string msg)` → `[LEVEL][tag] msg`. The `tag`
is a short subsystem code used consistently (`"TCP"`, `"WS"`, `"HTTP"`, `"TM"`).

## JSON

`CJSONBuilder` is a **stateful streaming builder** (not a tree): a `string
m_buffer`, a `bool m_needComma`, an `int m_depth`. `Start*` resets the comma flag,
`Add*`/`End*` set it — so commas are correct without bookkeeping at call sites.
API: `StartObject([key])`/`EndObject()`, `StartArray(key)`/`EndArray()`,
`AddString/AddInt/AddDouble(key,val,digits)/AddBool/AddRaw`, array-element
`AddArray*`, `ToString()`, `Clear()`. Every key/value is `EscapeString`'d. Prices
serialize with per-symbol `SYMBOL_DIGITS`, money/volume with `2`. `CJSONParser` is
a deliberately lightweight flat string-scanner (all `static`), used only for small
inbound control messages.

## Handler / base-class pattern

The extension seam is an **abstract base with a pure-virtual method**, subclassed
per resource:

```mq5
class CRouteHandler { public: virtual string Handle(HTTPRequest &req) = 0; };
class COrderHandler : public CRouteHandler {
   CTrade m_trade;
   public: string Handle(HTTPRequest &req) override { /* branch on method+path */ }
};
```

The transport (`CTCPServer`) declares `virtual void OnClientData(...) = 0;` and
knows nothing about the protocol layered on top — the EA subclasses it in-file.
The reusable **order/position/deal enumeration idioms** (index loops,
`PositionGetTicket` select-as-return, `HistorySelect` gating, magic filtering)
match the strategy side in
[`trading-mechanics.md`](trading-mechanics.md#managing-positions-by-magic).

## Compile service

Production `.ex5` come from a FastAPI wrapper around the MetaEditor CLI on a
dedicated, credential-free interactive Windows desktop session (MetaEditor is a
GUI app — never a session-0 service). Contract highlights a skill author must know:

- Invocation: `metaeditor.exe /compile:<mq5> /include:<MQL5 root> /log:<log>`.
- **`/include` points at the MQL5 root, not `…\Include`** — MetaEditor appends
  `\Include` itself; double-nesting breaks every `#include <Trade/Trade.mqh>` with
  error 106.
- **Success = parsed `Result: 0 errors` line**, not the process exit code. Compile
  errors are returned as **structured data** (`ok:false` + `diagnostics[]`), not an
  exception; only infra/auth/timeout are hard failures.
- The MetaEditor log is **UTF-16LE**; decode BOM-tolerantly. Diagnostics match
  `file(line,col) : error CODE: msg`.
- Each job runs in a fresh, isolated dir that is always cleaned up in a `finally`;
  MetaEditor is invoked once on the primary (it auto-compiles `#resource` deps).
