# security-review — deriving exhaustive, decision-grade security coverage

> **Load when**: the surface under QC touches a **security trust boundary** —
> authentication, authorization/multi-tenancy, money or asset movement, untrusted
> input, secrets/crypto, file upload, deserialization, or a new outbound call — and
> the 8-item checklist in [`nfr.md` §Security](nfr.md) is not enough. That checklist
> is the *trigger and the shortlist*; this file is the *method*.
>
> This is koni-qc's coverage intelligence pointed at security: derive the cases a
> threat model demands, review adversarially so a plausible-but-wrong finding cannot
> survive, and produce a report a ship decision can rest on. It **owns the method and
> the finding rubric**; it **delegates every running exploit** to gstack and the
> **blocking gate** to koni-harness — the same division `/security-review` uses.

**Contents**: [The stance](#the-stance) · [Threat model first](#threat-model-first) ·
[The category taxonomy — and how to derive cases from each](#the-category-taxonomy--and-how-to-derive-cases-from-each) ·
[The adversarial review — identify → refute → confidence-filter](#the-adversarial-review--identify--refute--confidence-filter) ·
[The finding schema](#the-finding-schema) ·
[Severity and confidence](#severity-and-confidence) ·
[False-positive discipline](#false-positive-discipline) ·
[A fixed vuln becomes a regression test](#a-fixed-vuln-becomes-a-regression-test) ·
[The security report](#the-security-report) ·
[When to run, and how deep](#when-to-run-and-how-deep) ·
[Composes, never reproduces](#composes-never-reproduces)

---

## The stance

Security is the one place in QC where **a false positive costs as much as a false
negative**. A suite that flags theoretical issues gets muted, and a muted suite
misses the real one — the same failure, from the other end. So the security method is
not "list every category and check the boxes"; it is:

1. **Threat model** the surface — enumerate the trust boundaries an attacker can reach.
2. **Derive** concrete test cases from each boundary, not from a generic checklist.
3. **Review adversarially** — every candidate finding must survive an independent
   attempt to *refute* its exploitability before it is reported.
4. **Filter by confidence** — on a 1–10 scale: raise a candidate at **≥7**, and
   after refutation **report only at ≥8**. A confidence-7 finding is not dropped and
   not reported as a vuln — it is raised to the author as an open question.
5. **Pin** every confirmed vuln with a red-first regression test, so a fix cannot
   silently regress.

The through-line: **a finding is a claim, and a claim needs an exploit path or it is
noise.** "This input is not validated" is not a finding. "This input reaches
`exec()` and an attacker controls it via the public `/import` endpoint" is.

---

## Threat model first

Before deriving a single case, draw the boundary map. Three questions, answered from
ARCHITECTURE.md + the story's data-flow:

- **What can an attacker reach?** Every entry point that accepts data an attacker can
  influence: public endpoints, authenticated-but-cross-tenant paths, file uploads,
  webhook receivers, message-queue consumers, deserialized payloads, URL/redirect
  params, CLI args fed by CI from a PR.
- **What is on the other side of each boundary?** A database (→ injection, RLS), a
  shell/subprocess (→ command injection), a filesystem (→ path traversal), an
  outbound HTTP client (→ SSRF), an HTML sink (→ XSS), a deserializer (→ code exec),
  a secret store (→ exposure).
- **Who is the attacker?** Anonymous, a low-privilege user, a tenant trying to reach
  another tenant, a malicious file, a compromised upstream. Each yields different
  cases against the same code.

Every SEC test case and every finding **names the boundary it crosses**. A case that
does not cross a trust boundary is a functional case wearing a `SEC-` prefix — move it.

---

## The category taxonomy — and how to derive cases from each

For each category: the **boundary** it lives on, how to **derive** the concrete cases
(attacker input → required rejection), the **required-when** trigger, and the
**highest-signal** check. Apply a category only when its trigger fires.

### Authentication (`SEC-` / `AUTHN-`)
- **Boundary**: anonymous → authenticated.
- **Derive**: valid / invalid / expired / malformed credential; session fixation (does
  the session id rotate on login?); logout actually invalidates server-side; password
  reset token single-use and expiring; no user-enumeration via differential responses.
  For **JWTs specifically**: `alg:none` (unsigned token accepted?), RS256→HS256 key
  confusion (public key used as an HMAC secret), an expired/`exp`-stripped token, and a
  token signed by the wrong key — each must be rejected.
- **Required when**: any login, token, or session surface.
- **Highest signal**: does an *expired* or *revoked* token still work anywhere?

### Authorization & IDOR (`SEC-` / `AUTHZ-`)
- **Boundary**: low-privilege → high-privilege, and user-A → user-B.
- **Derive**: for **every** protected path, run it three ways — as owner, as a
  *different* authenticated user, as anonymous. Horizontal (IDOR: swap the id in
  `/orders/{id}` for another user's) and vertical (a normal user hits an admin route).
  Test the *object*, not just the *route*: `GET /api/doc/42` and `PATCH /api/doc/42`
  may authorize differently.
- **Derive (write-side mass assignment / over-posting)**: POST/PATCH a field the caller
  should not control — `role=admin`, `isAdmin=true`, `balance=…`, `ownerId=<someone-else>`
  — and confirm the server *allowlists* bindable fields rather than binding the whole body
  into the ORM. This is privilege escalation, not just data exposure.
- **Required when**: any per-user or per-tenant data, or any endpoint that writes a model.
- **Highest signal**: change one id in a request and see another tenant's row; or set a
  privileged field the UI never sends and watch it stick.

### RLS / tenant isolation (`SEC-` / `RLS-`)
- **Boundary**: tenant A → tenant B.
- **Derive**: with **two real credentials** (see [`live-harness.md`](live-harness.md), the 2-credential recipe), tenant A attempts read *and* mutate on tenant B's rows through
  every data path — not just the API, but any RPC, background job, export, or search
  that could leak across the boundary.
- **Required when**: multi-tenant storage. Isolation is a hard requirement, not a
  nice-to-have — the highest-blast-radius defect a multi-tenant app can ship.
- **Highest signal**: a query that "filters by tenant in the app layer" but runs with a
  DB role that can see all tenants — bypass the app filter and the rows are there.

### Race conditions & TOCTOU on state that must not double-spend (`SEC-` / `RACE-`)
- **Boundary**: two concurrent requests → a check-then-act on a shared balance, quota, or
  one-time token.
- **Derive**: fire N concurrent requests at "redeem this voucher" / "withdraw" / "apply
  this coupon" / "accept this invite" and confirm exactly one succeeds — no double-spend,
  no negative balance, no coupon used twice. Replay an idempotency key and confirm the
  second call is a no-op, not a second charge.
- **Required when**: money/asset movement, a one-time token, a quota, or any
  check-then-act on shared mutable state.
- **Highest signal**: a balance read, an app-layer `if balance >= amount`, then a write —
  with no DB-level constraint or row lock between them. Two requests both pass the check.

### Injection — SQL / NoSQL / command / path / template / XXE (`SEC-` / `INJ-`)
- **Boundary**: untrusted string → an interpreter (SQL engine, shell, filesystem,
  template engine, XML parser).
- **Derive** per sink:
  - **SQLi**: `' OR '1'='1`, `'; DROP …`, stacked queries, boolean/time-blind on any
    param that reaches a query. Confirm parameterization, not escaping.
  - **NoSQLi**: `{"$ne": null}`, `{"$gt": ""}` where a value is used as a query object.
  - **Command**: `; id`, `$(id)`, `` `id` ``, `| cat /etc/passwd` on any value reaching
    a subprocess/`exec`/`system`.
  - **Path traversal**: `../../etc/passwd`, `%2e%2e%2f`, absolute paths, null bytes, on
    any value reaching a file open/read/write.
  - **Template (SSTI)**: `{{7*7}}`, `${7*7}`, `<%= 7*7 %>` on any value rendered by a
    server-side template engine.
  - **XXE**: an external entity / DOCTYPE in any XML the server parses.
- **Required when**: any untrusted value reaches any interpreter above.
- **Highest signal**: trace the value from the entry point to the sink and confirm the
  sink is *parameterized/escaped for that sink specifically* — SQL-escaping does not
  save you from a shell.

### XSS — stored / reflected / DOM (`SEC-` / `XSS-`)
- **Boundary**: untrusted string → an HTML/JS sink in a victim's browser.
- **Derive**: `<script>`, `<img src=x onerror=…>`, `javascript:` URIs, event handlers,
  on every field that is later rendered; test both the *store* and the *render*; DOM XSS
  via `innerHTML`/`document.write`/`dangerouslySetInnerHTML`/`bypassSecurityTrust*`.
- **Required when**: untrusted data rendered to any user (self or others).
- **Note**: React/Angular auto-escape in **text and attribute-value** position — a plain
  `{value}` there is safe, so do not manufacture findings for it. But they do **not**
  neutralize a `javascript:` URI in `href={value}` / `src={value}`, nor the named sinks
  (`dangerouslySetInnerHTML` / `bypassSecurityTrust*`) — those are live and must be flagged.

### Deserialization & code execution (`SEC-` / `RCE-`)
- **Boundary**: untrusted bytes → a deserializer or dynamic evaluator.
- **Derive**: `pickle.loads` / `yaml.load` (not `safe_load`) / Java/​PHP/Ruby native
  deserialization / `eval`/`Function`/`exec` on any attacker-influenced payload.
- **Required when**: the app deserializes anything from a request, a queue, or a file.
- **Highest signal**: any `yaml.load(...)` without `Loader=SafeLoader`, any `pickle`
  over the wire, any `eval` of a request-derived string.

### SSRF (`SEC-` / `SSRF-`)
- **Boundary**: an attacker-controlled **host or protocol** → the server's outbound
  client. (A path-only SSRF is not a finding — the host/protocol must be controllable.)
- **Derive**: internal-metadata URLs (`169.254.169.254`), `file://`, `gopher://`,
  DNS-rebinding, redirect-to-internal, on any URL the server fetches on the user's behalf.
- **Required when**: the server fetches a user-supplied URL (webhooks, "import from URL",
  avatar-by-URL, link previews).

### Secrets & crypto (`SEC-` / `CRYPTO-`)
- **Boundary**: secret material ↔ code, logs, responses, or weak algorithms.
- **Derive**: hardcoded key/token/password in source; secret echoed into a log or an
  error/response body; token in a URL or query string; weak/absent hashing for
  passwords (plain, MD5, SHA-1, unsalted); predictable randomness for a security token
  (`Math.random`, time-seeded); missing TLS cert validation on an outbound call.
- **Required when**: any secret handling, password storage, token minting, or crypto.
- **Highest signal**: a security token generated with a non-CSPRNG; a password stored
  with a fast/unsalted hash.

### Session & CSRF (`SEC-` / `SESS-`)
- **Boundary**: a state-changing request from a forged origin.
- **Derive**: state-changing request without / with a forged CSRF token → rejected;
  cookie `HttpOnly` / `Secure` / `SameSite` flags asserted; session timeout enforced
  server-side.
- **Required when**: cookie-based sessions with state-changing endpoints.

### Data exposure & PII (`SEC-` / `EXPO-`)
- **Boundary**: sensitive data → a response, log, or debug surface it should not reach.
- **Derive**: an endpoint returns more fields than the caller may see (over-posting /
  mass-assignment in reverse); a stack trace or debug page in production; PII in a log;
  a secret in an error body; an enumerable sequential id that leaks record counts.
- **Required when**: any endpoint returning per-user data, any error path in production.

### Also derive when the boundary is present
- **Business-logic authz** (`SEC-` / `LOGIC-`): negative quantity, a tampered price or
  discount, a step-skip in a multi-stage flow, a value the client computes that the
  server trusts. Required when money or a stateful workflow is involved.
- **CORS misconfiguration** (`SEC-` / `CORS-`): `Access-Control-Allow-Origin` reflecting
  an arbitrary Origin **with** `Allow-Credentials: true`. Required on any
  credentialed cross-origin API.
- **Open redirect** (`SEC-` / `REDIR-`): a `?next=`/`?return=` param that redirects to an
  attacker host (distinct from SSRF — the victim's browser is the target). Required on
  any post-login/logout redirect or a URL-valued param echoed into `Location`.
- **Inbound webhook signature** (`SEC-` / `HOOK-`): a webhook receiver that acts on the
  payload without verifying the sender's signature/HMAC. Required on any inbound webhook.

> **Deliberately out of scope here** (name them only if the specific surface has them):
> GraphQL-specific issues (introspection, batching, field-level authz), prototype
> pollution, web-cache poisoning, and dependency/CVE scanning (SCA is a separate concern,
> not this method). Say so in the review's coverage note rather than implying they were
> checked.

> **Not every feature needs every category.** The threat model decides. A pure
> read-only public docs page has one category (XSS on any rendered field) and none of
> the rest; a multi-tenant money-movement API has nearly all of them.

---

## The adversarial review — identify → refute → confidence-filter

This is the engine, and it is deliberately the same shape as `/security-review`'s
three-step fan-out and koni-qc's own multi-agent [`skill-grading.md`](skill-grading.md):
**independent agents, an honest bar, and a claim that must survive an attempt to
refute it.**

**Phase 1 — Identify (breadth).** From the threat model, one pass per boundary (or one
agent per category on a large surface) enumerates *candidate* findings — each with a
file:line and a hypothesized attack path. Breadth here; do not self-censor yet.

**Phase 2 — Refute (depth, adversarial).** For **each** candidate, an *independent*
agent is tasked to **disprove exploitability** — to find the validation, the
parameterization, the authz check, the framework auto-escaping, or the environmental
constraint that makes the attack fail. Default to *refuted* when uncertain. A finding
survives only if the refuter cannot break it. This is the phase that kills
plausible-but-wrong findings before they reach a human — the single most important step,
because an unrefuted security report is a report nobody will trust twice.

**Phase 3 — Confidence-filter.** Score each surviving finding 1–10 (rubric below).
The single cut: **report at ≥8, raise a confidence-7 finding as an open question,
drop below 7.** The output is short and every line is real.

For a high-risk surface, run Phase 2 with **≥2 independent refuters per finding** and
keep the finding only if it survives the majority — the same "diverse-lens verify"
koni-qc uses elsewhere. Refuters get *distinct lenses* where a vuln can fail more than
one way: "is the input actually reachable?", "is the sink actually dangerous here?",
"does the framework already neutralize it?"

---

## The finding schema

Every reported finding carries **all** of these — a finding missing its exploit
scenario is not decision-grade:

| Field | Content |
|---|---|
| **Title** | `<category>: <file>:<line>` — e.g. `authz_bypass: orders.route.ts:88` |
| **Severity** | HIGH / MEDIUM / LOW (definitions below) |
| **Confidence** | 1–10 (post-refutation) |
| **Category** | a slug: `sql_injection`, `idor`, `xss`, `ssrf`, `rce`, `secret_exposure`, … |
| **Description** | the defect in one sentence — the untrusted value, the sink, the missing control |
| **Exploit scenario** | the concrete attacker steps: the request, the payload, the observed compromise. This is what separates a finding from a lint |
| **Recommendation** | the specific fix — parameterize this query / add this authz check / use `safe_load` — not "validate input" |
| **Covered-by** | the regression test that will pin the fix (see below), once written |

---

## Severity and confidence

**Severity** — impact, assuming the exploit works:
- **HIGH** — directly exploitable to RCE, data breach, authentication bypass, or
  cross-tenant read/write. Ship-blocking.
- **MEDIUM** — significant impact but requires specific conditions (a particular role, a
  chained precondition). Fix before the next release.
- **LOW** — defense-in-depth, or impact bounded to the attacker's own data.

**Confidence** — how sure the attack path is real, *after* refutation:
- **8–10** — a concrete exploit path is identified; the refuter could not break it.
  **Report** it as a finding.
- **exactly 7** — a plausible path with an unresolved condition. **Raise it to the
  author as an open question**, never as a vuln — regardless of severity. This is the
  one tier that is neither reported nor silently dropped.
- **< 7** — too speculative. **Do not report.** Silence here is not a miss; it is the
  discipline that keeps the report trusted.

The bands do not overlap and severity does not move the cut — an unresolved condition is
an open question at *any* severity, so a HIGH-severity confidence-7 finding is a question,
not a vuln. Confidence measures "is the attack real?"; severity measures "how bad if it
is." They are filtered independently.

---

## False-positive discipline

The report is only as valuable as its precision. Apply the same hard exclusions and
precedents `/security-review` uses — they are what keep a security suite from becoming
noise:

**Hard exclusions** (do not report as vulnerabilities):
- DoS, resource exhaustion, memory/CPU.
- Secrets *at rest* that are otherwise secured; rate-limiting gaps.
- Memory-safety in memory-safe languages (Rust, Go, JS/TS, Python).
- Findings only in test files or documentation.
- Log-spoofing / logging non-PII; regex injection / ReDoS.
- Path-only SSRF (host/protocol must be controllable).
- Client-side "missing authz" — the server is responsible; do not flag the client.
- React/Angular XSS unless via `dangerouslySetInnerHTML` / `bypassSecurityTrust*`.
- Outdated-dependency CVEs (managed separately).

**Precedents**:
- Env vars and CLI flags are **trusted** — an attack that requires controlling them is
  invalid.
- UUIDs are unguessable; they do not need validation.
- Logging a URL is safe; logging a secret or PII is not.
- Command injection in a shell script is only a finding with a concrete untrusted-input
  path — most repo scripts never see untrusted input.

**The signal-quality bar** for every surviving finding: *is there a concrete,
exploitable path with a specific location and reproduction, that a security engineer
would confidently raise in a PR?* If not, cut it.

---

## A fixed vuln becomes a regression test

A confirmed vulnerability is an escaped bug, and koni-qc's rule holds:
[`regression-learning.md`](regression-learning.md) — **every confirmed finding becomes a
red-first `SEC`/`REG` test** before the fix lands, so a regression re-breaks the test
instead of shipping. The test asserts the *attack is rejected*: the injection payload is
stored escaped, the cross-tenant request returns 403, the expired token is refused. Wire
it into the epic's `test-cases/EPIC-N/` as a `TC-<EPIC>.SEC-<n>` (or `REG-<n>` for a
past incident) with a real `Covered-by` handle, and run the **class-generalization sweep**
— if one endpoint had an IDOR, grep every sibling endpoint for the same shape.

---

## The security report

Security findings are recorded in the koni-docs test-report structure
([koni-docs `templates/test-report.md`](../../koni-docs/references/templates/test-report.md)),
extended with the finding schema above. A security review of a release produces:

- a **per-review findings list** (confirmed, refuted-and-dropped noted with the reason —
  so the next reviewer does not re-raise them), and
- a **release security sign-off**: the named decision that the residual risk is
  acceptable to ship, or the blocking findings that are not. HIGH findings block;
  MEDIUM are triaged with an owner and a target release; LOW are logged.

Honesty rules from [`report-quality.md`](report-quality.md) apply in full: a "clean"
security review states **what surface was covered and what was not** — an unreviewed
boundary is a stated gap, never an implied pass.

---

## When to run, and how deep

The **risk trigger** decides both whether to run and how hard:

| Surface | Depth |
|---|---|
| Read-only, no untrusted input, no secrets | the [`nfr.md`](nfr.md) checklist; no full review |
| Untrusted input **or** per-user data | derive the relevant categories; identify, then refute in a **fresh context** (a self-refute by the agent that raised the finding is the motivated-reasoning trap the refute phase exists to break — use a clean context even at this tier) |
| Auth, money/asset movement, multi-tenant, crypto, file upload, deserialization, a new outbound call, or a past security incident in this area | the **full adversarial review** — threat model, per-category derivation, ≥2 independent refuters per finding, decision-grade report + sign-off |

Run it at **Design** (derive the SEC cases into the suite), at **Execute** (drive the
attacks via gstack), and at the **Release gate** (the sign-off). A new outbound call, a
new deserialization, or a new auth path added mid-sprint re-triggers it.

---

## Composes, never reproduces

security-review contributes the **coverage intelligence, the finding rubric, and the
adversarial method**. It delegates every engine, exactly as the rest of koni-qc does:

| Concern | Owner |
|---|---|
| Threat model, per-category case derivation, the finding + confidence rubric, false-positive discipline | **security-review** (this) |
| **Running** the exploit — driving the request, fuzzing the input, the browser payload | **gstack** — `/investigate`, `/qa`, `/browse` (invoke) |
| The **live 2-credential / RLS-as-a-real-user** harness | **koni-qc** [`live-harness.md`](live-harness.md) |
| The **author-blind** identify/refute passes | independent sub-agents · **`superpowers:code-reviewer`** for a content pass |
| The **gate** — `credential-scan` on staged secrets, and the warn-level `security-review` gate: a change to a repo-declared security boundary (`.koni-harness/security-paths`) that ships without this review gets a WARN pointing back here | **koni-harness** (`gate-catalog.md`) |
| The **report body** + the release sign-off doc | **koni-docs** `templates/test-report.md` |
| Turning a confirmed vuln into a REG test + the generalization sweep | **koni-qc** [`regression-learning.md`](regression-learning.md) |

This is the same boundary koni-qc keeps everywhere: it brings the *coverage and the
judgment*; it never re-implements the tools that run the tests or hold the gate. It is
the security-hardened sibling of [`nfr.md` §Security](nfr.md) — that section is the
trigger and the shortlist; this is the depth behind it.
