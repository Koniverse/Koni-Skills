# Registry & MagicNumber

`algorithms/registry.yaml` is the operational source of truth: it binds every
MagicNumber to a version, a symbol, a timeframe, and an account. If an EA is
running and it is not here, ops cannot see it.

**Contents**: [The registry shape](#the-registry-shape) · [MagicNumber rules](#magicnumber-rules) ·
[Instances](#instances) · [The collision audit](#the-collision-audit)

## The registry shape

The file mirrors Notion. It is a **map keyed by the `UPPER_SNAKE` algo code** (not
a list). Each entry lists its `versions[]`, whose `version:` string mirrors whatever
granularity Notion tracks — often major-only (`v1`, `v8` for EMA_CO/ORB) but
minor-level strings also appear (`v2.1`, `v1.00`). Match the string the registry
actually uses; do not assume major-only. Each version carries its magic:

```yaml
algorithms:
  EMA_CO:
    name: "EMA Crossover"          # human-readable name (a field, not the key)
    category: "Trend Following"
    type: mql5
    description: "Trend-following strategy based on EMA crossover signals"
    versions:
      - version: "v1"
        status: deprecated         # active | deprecated | in_development
        magic: 123456              # assigned by Notion — never hand-edited
      - version: "v8"
        status: active
        magic: 123456
    instances:                     # each live deployment binds a magic → symbol/tf/account
      - magic: 123456
        version: "v8"
        symbol: XAUUSD
        timeframe: M15
        account_id: null
        bot_name: null
        status: active
```

## MagicNumber rules

- **Notion assigns it — never hand-pick one.** An in-development EA carries
  `magic: null   # assigned by Notion at deploy` until it is registered.
- The EA's `InpMagicNumber` **default** and its `.set` mirror the registry value —
  the code, the params file, and the registry state the same number.
- **One magic per running instance; never reuse.** MT5 does not enforce
  uniqueness, so two instances on the same magic silently merge in every
  position/deal query and in reporting. (The programming side of this hazard —
  filtering positions by magic — is in the **koni-ea-dev** skill.)

## Instances

An `instances[]` entry is the record of a *live deployment*: which magic is running
which version, on which symbol/timeframe, under which account. Keeping this current
is what makes the registry answer "what is live right now?" — the question a deploy
or an incident starts from. When an instance is stopped or replaced, update its
`status`, do not delete the row (the history is the audit trail).

## The collision audit

Before deploying, confirm no two EAs in the tree ship the same magic default:

```bash
grep -rh "MagicNumber=" algorithms/mql5/ | sort | uniq -c | sort -rn
```

Any count `> 1` on a real magic (not a `0`/placeholder) is a collision waiting to
merge two instances — resolve it before the second one goes live.
