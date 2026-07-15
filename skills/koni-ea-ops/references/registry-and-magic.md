# MagicNumber & the registry

**Notion is the source of truth** for MagicNumbers (and the instance rows, where
tracked — D9 scoped the old live-instance *registry* role out of the yaml itself).
`algorithms/registry.yaml` is its **git-tracked mirror** — still maintained as the
version-controlled record of magic-per-version, but note its *live-instance-registry*
role was formally retired (Trading-Resources CONTEXT D9, which superseded the earlier
"registry.yaml as source of truth" decision). What survives and stays in scope is the
**MagicNumber-via-Notion workflow** and the git mirror; the old automation around it
(Grafana, a `sync_registry` job) is gone, so the checks below are manual.

**Contents**: [MagicNumber rules](#magicnumber-rules) · [The registry mirror shape](#the-registry-mirror-shape) ·
[Instances](#instances) · [The collision audit](#the-collision-audit)

## MagicNumber rules

- **Notion assigns it — never hand-pick one.** A new row in the Notion algorithm
  table generates the magic; an in-development EA carries `magic: null` until Notion
  assigns it at deploy.
- The EA's `InpMagicNumber` **default**, its `.set`, and the registry mirror all
  state the **same** number Notion issued — the code, the params file, and the
  mirror agree.
- **One magic per running instance; never reuse.** MT5 does not enforce uniqueness,
  so two instances on the same magic silently merge in every position/deal query and
  in reporting. (The programming side of this hazard — filtering positions by magic
  in EA code — is in the **koni-ea-dev** skill.)
- **Never treat `registry.yaml` as authoritative, and never edit a magic or
  instance-state there first.** It is a mirror only: read from Notion, write to
  Notion, then mirror to the yaml. If the yaml drifts ahead of Notion, a deploy
  driven off the stale mirror runs a magic or version Notion never issued — silently
  colliding with an instance Notion *does* track (the exact merge hazard above). On
  any disagreement, Notion wins and the yaml is corrected — never the reverse.

## The registry mirror shape

`registry.yaml` is a **map keyed by the `UPPER_SNAKE` algo code** (not a list). Each
entry lists its `versions[]`, whose `version:` string mirrors whatever granularity
Notion tracks — often major-only (`v1`, `v8`) but minor-level strings also appear
(`v2.1`, `v1.00`). Match the string Notion/the mirror actually uses; do not assume
major-only. The `instances[]` list mirrors the live deployments Notion tracks.

```yaml
algorithms:
  MY_ALGO:                           # UPPER_SNAKE algo code is the key
    name: "My Algo"                  # human-readable name (a field, not the key)
    category: "Trend Following"
    type: mql5
    description: "…"
    versions:
      - version: "v1"
        status: deprecated           # active | deprecated | in_development
        magic: 41                     # Notion-assigned (a small integer); never hand-edited
      - version: "v2"
        status: active
        magic: 58
    instances:                       # illustrative — mirrors what Notion tracks per live deploy
      - magic: 58
        version: "v2"
        symbol: XAUUSD
        timeframe: H1
        account_id: null
        bot_name: null
        status: active
```

(The values above are illustrative — real magics are the small integers Notion
issues, not a placeholder like `123456`, and an EA with no live deploy has
`instances: []`.)

## Instances

An `instances[]` entry mirrors a *live deployment* row Notion tracks: which magic is
running which version, on which symbol/timeframe, under which account. Notion is
authoritative (D9 retired the yaml's own live-instance-registry role); the mirror
just records the rows for git history, it does not own them. When an instance is
stopped or replaced, update its `status` rather than deleting the row — the history
is the audit trail.

## The collision audit

Automated collision detection (the retired monitoring/sync stack) is **no longer
available**, so audit by hand before deploying — confirm no two EAs in the tree ship
the same magic default:

```bash
grep -rh "MagicNumber=" algorithms/mql5/ | sort | uniq -c | sort -rn
```

Any count `> 1` on a real magic (not a `0`/placeholder) is a collision waiting to
merge two instances — resolve it against Notion before the second one goes live.
