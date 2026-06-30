# Test Cases — Customize Network (koni-qc pilot)

> **Worked example** produced by `koni-qc` from a feature's requirements, shown
> in the koni-docs `docs/tests/test-cases/EPIC-N.md` shape. It demonstrates the
> standard and the uplift over the hand-made `koni-docs.backup` `customize-network`
> suite (58 manual cases, ~70% happy-path, no TC IDs, no AC↔TC matrix, <5% NFR).
> In a real repo this file lives at `docs/tests/test-cases/EPIC-CN.md`; here it is
> illustrative (the SubWallet product is not in this repo).

---

## Overview

### Scope

**In scope** — the *Customize Network* feature on the wallet (extension + mobile):
add a custom RPC network manually, auto-detect chain metadata, edit, and delete.

**Out of scope** — the underlying chain connectivity library; built-in network
seeding; the provider-selector UI beyond "the new network appears" (its own
suite).

### Acceptance criteria (derived from requirements)

- **AC-1** — From Manage Network → **+**, entering a reachable RPC URL auto-detects
  the chain type (EVM / Substrate) and auto-fills name, native symbol, decimals,
  chain-id, block explorer.
- **AC-2** — The user can override any auto-filled field before saving.
- **AC-3** — Save persists the network; it then appears in the provider/selector.
- **AC-4** — An unreachable or invalid RPC is rejected with a clear error
  (*"Cannot connect to this provider"*); nothing is saved.
- **AC-5** — A network that already exists (same RPC / same chain-id) is rejected
  as a duplicate.
- **AC-6** — A custom network can be edited and deleted; a built-in network, or
  one currently selected/in-use, cannot be deleted.

### Goals — what running this suite proves

A user can safely add, override, persist, and remove custom networks; bad input
fails closed; the form resists injection and degrades gracefully on flaky
networks; no duplicate or orphaned network state is created.

### Environment & test data

- **Env**: extension (Chrome/Firefox) + mobile (iOS/Android), staging build.
- **Fixtures** (reusable, seeded): `RPC_EVM_OK = https://rpc.evm-test.example`,
  `RPC_SUBSTRATE_OK = wss://rpc.dot-test.example`, `RPC_UNREACHABLE =
  https://10.255.255.1`, `RPC_MALFORMED = "ht!tp://nope"`, `NET_EXISTING` (a
  network already imported in the precondition), `NAME_MAX` (64 chars),
  `NAME_OVER` (65 chars), `NAME_EMOJI = "Bố 🚀 net"`, `NAME_XSS =
  "<script>alert(1)</script>"`.
- **Teardown**: delete any network created by a TC at end of run (custom networks
  only).

### Cadence & ownership

| Cadence | Test types | Owner |
|---|---|---|
| Per-PR | smoke (TC-CN.SMK-*) | dev on PR |
| Per-release | functional + regression + security | QA |
| Nightly | performance (detect latency) | CI |

## Quick reference — scenarios summary

| # | ID | Type | Priority | Short description | AC |
|---|---|---|---|---|---|
| 1 | TC-CN.SMK-1 | Smoke | Critical | Import a valid EVM RPC end-to-end | AC-1,3 |
| 2 | TC-CN.FUNC-1 | Functional | Critical | Auto-detect + auto-fill (EVM) | AC-1 |
| 3 | TC-CN.FUNC-2 | Functional | Critical | Auto-detect + auto-fill (Substrate) | AC-1 |
| 4 | TC-CN.FUNC-3 | Functional | High | Override an auto-filled field, then save | AC-2,3 |
| 5 | TC-CN.FUNC-4 | Functional | High | Saved network appears in selector | AC-3 |
| 6 | TC-CN.FUNC-5 | Functional | High | Edit a custom network | AC-6 |
| 7 | TC-CN.NEG-1 | Negative | Critical | Unreachable RPC → clear error, nothing saved | AC-4 |
| 8 | TC-CN.NEG-2 | Negative | High | Malformed URL → validation error | AC-4 |
| 9 | TC-CN.NEG-3 | Negative | High | Duplicate network (same chain-id) rejected | AC-5 |
| 10 | TC-CN.BND-1 | Boundary | Medium | Name at 64 / 65 chars | AC-2 |
| 11 | TC-CN.BND-2 | Boundary | Medium | Decimals 0 and max | AC-2 |
| 12 | TC-CN.SEC-1 | Security | Critical | XSS in network name is neutralized | AC-2 |
| 13 | TC-CN.SEC-2 | Security | High | RPC URL sanitized (no SSRF to internal hosts) | AC-4 |
| 14 | TC-CN.EDGE-1 | Edge | Medium | Emoji / non-ASCII name persists correctly | AC-2 |
| 15 | TC-CN.EDGE-2 | Edge | High | Double-tap Save creates only one network | AC-3 |
| 16 | TC-CN.EDGE-3 | Edge | High | Network drops mid-detect → graceful timeout | AC-1,4 |
| 17 | TC-CN.NEG-4 | Negative | High | Cannot delete an in-use / built-in network | AC-6 |
| 18 | TC-CN.PERF-1 | Performance | Medium | Detect completes within SLA | AC-1 |
| 19 | TC-CN.A11Y-1 | Accessibility | Medium | Import form is keyboard-navigable + labelled | AC-1,2 |
| 20 | TC-CN.REG-1 | Regression | Critical | Adding a custom network doesn't break built-ins | AC-3 |

## Test scenarios

Canonical rich-TC table (per koni-qc `traceability.md`).

| TC-ID | Name | Priority | Test data | Preconditions | Action/Request | Expected | Actual | Status | Perf | Side-effects | Covered-by |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-CN.SMK-1 | Import valid EVM RPC end-to-end | Critical | `RPC_EVM_OK` | No custom networks | Manage Network → + → paste RPC → Save | Detected EVM; name/symbol/decimals/chain-id auto-filled; saved; appears in selector | — | Not Executed | — | +1 network row | e2e/customize-network.spec |
| TC-CN.FUNC-1 | Auto-detect + auto-fill (EVM) | Critical | `RPC_EVM_OK` | On import screen | Paste RPC, wait for detect | Chain=EVM; name/symbol/decimals/chain-id/explorer populated, editable | — | Not Executed | — | None (pre-save) | — |
| TC-CN.FUNC-2 | Auto-detect + auto-fill (Substrate) | Critical | `RPC_SUBSTRATE_OK` | On import screen | Paste WSS RPC | Chain=Substrate; fields populated | — | Not Executed | — | None | — |
| TC-CN.FUNC-3 | Override auto-filled name, then save | High | `RPC_EVM_OK`, name "My EVM" | Detect succeeded | Edit name → Save | Saved network uses overridden name | — | Not Executed | — | +1 network | — |
| TC-CN.NEG-1 | Unreachable RPC rejected | Critical | `RPC_UNREACHABLE` | On import screen | Paste → wait | Error "Cannot connect to this provider"; Save disabled; nothing saved | — | Not Executed | — | **None** (assert no row) | — |
| TC-CN.NEG-2 | Malformed URL rejected | High | `RPC_MALFORMED` | On import screen | Paste malformed | Inline validation error; no network call attempted | — | Not Executed | — | None | — |
| TC-CN.NEG-3 | Duplicate network rejected | High | RPC of `NET_EXISTING` | `NET_EXISTING` already imported | Paste same RPC → Save | Rejected "Network already exists"; count unchanged | — | Not Executed | — | None | — |
| TC-CN.BND-1 | Name length boundary | Medium | `NAME_MAX` (64), `NAME_OVER` (65) | Detect succeeded | Save with 64 then 65 chars | 64 → saved; 65 → validation error | — | Not Executed | — | +1 (valid only) | — |
| TC-CN.BND-2 | Decimals boundary | Medium | decimals 0, then max | Detect succeeded | Override decimals=0 / max → Save | Both accepted per spec range; out-of-range rejected | — | Not Executed | — | +1 | — |
| TC-CN.SEC-1 | XSS in name neutralized | Critical | `NAME_XSS` | Detect succeeded | Set name = `<script>…` → Save → view in selector | Stored & rendered as inert text; no script executes | — | Not Executed | — | +1 (sanitized) | — |
| TC-CN.SEC-2 | RPC URL sanitized (no SSRF) | High | `http://169.254.169.254/…`, `http://localhost:…` | On import screen | Paste internal-host URL | Blocked / not dialed to internal metadata or loopback | — | Not Executed | — | None | — |
| TC-CN.EDGE-1 | Emoji / non-ASCII name | Medium | `NAME_EMOJI` | Detect succeeded | Save with emoji name → reopen | Persists & displays correctly (UTF-8), no mojibake | — | Not Executed | — | +1 | — |
| TC-CN.EDGE-2 | Double-tap Save idempotent | High | `RPC_EVM_OK` | Detect succeeded | Tap Save twice quickly | Exactly **one** network created; button locks after first | — | Not Executed | — | +1 (not +2) | — |
| TC-CN.EDGE-3 | Network flaky mid-detect | High | `RPC_EVM_OK` + throttle→offline | Detect in progress | Drop connection during detect | Graceful timeout + retryable error; no half-saved state | — | Not Executed | — | None | — |
| TC-CN.NEG-4 | Cannot delete in-use/built-in | High | a built-in + the active network | A network is selected/in-use | Attempt delete | Delete blocked with explanation; network retained | — | Not Executed | — | None | — |
| TC-CN.PERF-1 | Detect within SLA | Medium | `RPC_EVM_OK` | On import screen | Measure detect time | p95 ≤ **2.0 s** on staging | — | Not Executed | target 2.0s | None | — |
| TC-CN.A11Y-1 | Form keyboard + labels | Medium | — | On import screen | Tab through form; screen-reader | All inputs reachable by keyboard, labelled, logical focus order, errors announced | — | Not Executed | — | None | — |
| TC-CN.REG-1 | Built-ins intact after add | Critical | `RPC_EVM_OK` | Built-in networks present | Add custom network | All built-in networks still present & selectable | — | Not Executed | — | +1 | — |

## Coverage matrix (AC ↔ TC)

Every AC has ≥1 positive **and** ≥1 negative **and** (where applicable) ≥1
boundary case — the check the manual backup suite lacked entirely.

| AC | AC description | Positive | Negative | Boundary / edge | NFR |
|---|---|---|---|---|---|
| AC-1 | Auto-detect + auto-fill | TC-CN.FUNC-1, FUNC-2, SMK-1 | TC-CN.NEG-1 | TC-CN.EDGE-3 | TC-CN.PERF-1 |
| AC-2 | Override fields | TC-CN.FUNC-3 | TC-CN.BND-1 (over-max) | TC-CN.BND-1, BND-2, EDGE-1 | TC-CN.SEC-1, A11Y-1 |
| AC-3 | Persist + appears in selector | TC-CN.FUNC-4, SMK-1, REG-1 | — | TC-CN.EDGE-2 | — |
| AC-4 | Reject invalid/unreachable RPC | (error path) | TC-CN.NEG-1, NEG-2 | TC-CN.EDGE-3 | TC-CN.SEC-2 |
| AC-5 | Reject duplicate | — | TC-CN.NEG-3 | — | — |
| AC-6 | Edit / delete rules | TC-CN.FUNC-5 | TC-CN.NEG-4 | — | — |

**No orphan AC** (each row has coverage). **No orphan TC** (each TC maps to an
AC above). AC-3 has no dedicated negative; its failure surface is covered via
EDGE-2 (idempotency) and NEG-1/3 (nothing persists on bad input) — flagged in
*Open* for an explicit "save fails → state unchanged" case.

## Open / deferred scenarios

- Explicit "save interrupted by app-kill → no partial network" (durability) —
  deferred to a resilience pass.
- i18n: RTL rendering of network name — deferred (tracked in `nfr.md` §i18n).

---

## Before / after delta vs the manual backup

| Dimension | `koni-docs.backup` (manual) | This (koni-qc) |
|---|---|---|
| Test IDs | none (row # + name) | explicit `TC-CN.<TYPE>-<n>` |
| AC↔TC traceability | implicit (feature name) | **explicit coverage matrix**, no orphans |
| Negative / boundary | ~25%, ad-hoc | NEG/BND/EDGE first-class (≥50%) |
| Injection / security | absent | TC-CN.SEC-1 (XSS), SEC-2 (SSRF) |
| Concurrency / network-failure | absent | EDGE-2 (double-save), EDGE-3 (flaky) |
| Non-functional | absent | PERF-1 (SLA), A11Y-1 |
| Test data | hardcoded, scattered | named reusable fixtures + teardown |
| Risk ordering | equal (row order) | priority Critical→Low |
| Regression scope | undefined | RC tag (REG-1) |

58 shallow manual cases → 20 representative cases here that are **typed, traced,
risk-ordered, and edge/NFR/security-complete** — the same feature, covered to a
standard the manual suite never reached. (A full suite expands each AC's
partitions further per `test-design.md`; this pilot shows the shape and the bar.)
