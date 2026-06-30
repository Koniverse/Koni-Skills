# nfr — non-functional coverage (security-led)

> **Load when**: the **Design** stage of [`qc-workflow.md`](qc-workflow.md) needs
> the non-functional cases that the backup corpus almost entirely lacked (<5%).
> Functional + edge coverage is necessary but not sufficient — a feature that is
> correct can still be insecure, slow, inaccessible, or unobservable. Security
> leads because it is where the highest-blast-radius defects hide.
>
> Each section is a tight checklist plus a **required when** risk trigger. Apply a
> section only when its trigger fires — not every feature needs every category.

---

## Security

The lead. Codifies the Koni-Finance dedicated security suite. Every case here is
a `TC-<EPIC>.SEC-<n>` row in the canonical table ([`traceability.md`](traceability.md)).

- [ ] **Authn** — valid/invalid/expired credentials; session fixation; logout invalidates.
- [ ] **Authz** — every protected path tested as owner / other-user / anonymous; no horizontal or vertical privilege escalation.
- [ ] **Token storage & rotation** — at-rest location, expiry, refresh, revocation; no token in URL/log.
- [ ] **CSRF / SameSite** — state-changing request without/with forged token rejected; cookie flags asserted.
- [ ] **Replay / nonce** — a captured request replayed is rejected; nonce single-use.
- [ ] **Rate-limiting** — burst past the limit is throttled (429); limit resets.
- [ ] **RLS / data-isolation** — tenant A cannot read or mutate tenant B's rows.
- [ ] **Input injection** — SQLi, XSS (stored + reflected), command/path injection on every input; output rendered escaped.

> **Required when**: any feature with authentication, money/asset movement,
> multi-tenant data, or untrusted input. When the suite has ≥5 SEC cases, emit a
> standalone **`<feature>-security-test-cases.md`** alongside the epic file.

---

## Performance

Assert against an **SLA target**, not just a measured number — a green run with
no budget proves nothing.

- [ ] **Latency** — p50 / p95 / p99 vs budget (e.g. p95 read < 300 ms, write < 800 ms).
- [ ] **Throughput** — sustained req/s at target concurrency without error-rate climb.
- [ ] **Payload / cold start** — bundle size, first-load, cold-path budget.
- [ ] **Resource ceilings** — memory / CPU under load stays within limit.

The asserted SLA goes in the canonical table's **Perf** column.

> **Required when**: a user-facing latency expectation, a hot path, or a documented
> SLA exists. Default p95 budget if unstated: interactive < 1 s, background < 5 s.

---

## Accessibility

WCAG 2.1 AA as the floor.

- [ ] **Keyboard nav** — every action reachable and operable without a mouse; no trap.
- [ ] **Screen-reader labels** — controls, images, and live regions have accessible names.
- [ ] **Contrast** — text ≥ 4.5:1, large text / UI ≥ 3:1.
- [ ] **Focus order** — logical, visible focus ring; modal returns focus on close.

> **Required when**: any user-facing UI. A11Y cases are `TC-<EPIC>.A11Y-<n>`.

---

## UI / visual conformance to DESIGN.md

The product's `DESIGN.md` is the visual contract; a feature that "works" but
drifts from it is a defect.

- [ ] **Design-review pass** — for every UI-bearing case, run gstack
  `/design-review` against the repo's `DESIGN.md` and confirm layout, spacing,
  type hierarchy, color tokens, component states (hover/focus/disabled/loading/
  empty/error), and motion match the spec.
- [ ] **No AI-slop / inconsistency** — flag generic or off-system patterns
  `/design-review` surfaces.
- [ ] **Deviations are failures** — each mismatch is logged against its TC-ID,
  not waved through.

> **Required when**: any UI changes. These are `TC-<EPIC>.UI-<n>` (or fold into
> the relevant `FUNC`/`A11Y` case). koni-qc does not eyeball pixels itself — it
> **delegates to gstack `/design-review`**; `DESIGN.md` is the source of truth.

---

## Internationalization

- [ ] **Locale** — number / date / currency formatting per locale.
- [ ] **RTL** — layout mirrors for right-to-left scripts.
- [ ] **Encoding** — UTF-8 / emoji / multi-byte input round-trips intact.
- [ ] **Timezone** — display + storage correct across DST and offset boundaries.

> **Required when**: the product ships in >1 locale, or stores user-entered text /
> timestamps. (Native-language step text stays internal per RULE-13.)

---

## Reliability & resilience

Failure-mode tests — prove graceful degradation, not just the happy path.

- [ ] **Offline** — action while disconnected surfaces a clear state, no data loss.
- [ ] **Timeout** — slow dependency hits timeout → handled, not hung.
- [ ] **Retry / idempotency** — retried request does not double-apply.
- [ ] **Partial failure** — one leg of a multi-step op fails → consistent rollback or compensation.

> **Required when**: the feature spans a network call, multi-step transaction, or
> external dependency.

---

## Compatibility

A cross-platform / cross-browser matrix, not a single environment.

- [ ] **Browsers** — Chromium / Firefox / Safari (+ last-2-versions) per supported set.
- [ ] **Platforms** — `[extension]` / `[mobile]` / `[webapp]` / `[telegram]` variants run.
- [ ] **Viewport** — responsive breakpoints; touch vs pointer.

> **Required when**: the feature renders UI or runs across >1 surface. Use the
> platform-variant columns from [`traceability.md`](traceability.md).

---

## Observability

Assert that the system tells you what happened.

- [ ] **Logs** — key events logged at the right level; no secret leakage.
- [ ] **Metrics** — counters / latency emitted for the critical path.
- [ ] **Traces** — a request is traceable end-to-end across service boundaries.

> **Required when**: a service boundary, a money/asset path, or anything an
> on-call engineer must debug in production.
