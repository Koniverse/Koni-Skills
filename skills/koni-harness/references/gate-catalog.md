# Gate catalog — the built-in checks

The gate is driven by `gates.conf`, a line-oriented config read by
`gate-runner.sh`. This file documents the built-in checks that ship in the
default `gates.conf` (the one `install-gate.sh` vendors), the config grammar, and
how to add your own check. One check documented here — `skill-references` — is
**monorepo-only** (it audits skill docs) and is *not* in the vendored default; it
is flagged as such where it appears.

For how the runner is wired into git / Claude Code / Gemini / Codex, see
[`adapters.md`](adapters.md). For non-destructive install, see
[`adoption.md`](adoption.md).

**Contents**: [Phases and severities](#phases-and-severities) ·
[Invoking the release-commit phase](#invoking-the-release-commit-phase) ·
[The built-in checks](#the-built-in-checks) ·
[Config grammar](#config-grammar) · [Adding a custom check](#adding-a-custom-check)

---

## Phases and severities

Every check is tagged with one or more **phases** and exactly one **severity**.

**Phases** (the `--phase` value the runner is invoked with):

| Phase | When it runs | Typical adapter |
|---|---|---|
| `work-commit` | An ordinary commit during development | git `pre-commit` |
| `release-commit` | A commit that ships a version (VERSION + CHANGELOG) | git `pre-commit` (the same hook; phase chosen by the caller) or a release script |
| `pre-push` | Before pushing to a remote | git `pre-push` |

**Severities** (what a *failing* check does):

| Severity | Effect |
|---|---|
| `block` | The runner exits non-zero → the commit/push is stopped. Fix and retry. |
| `warn` | The runner prints `WARN: <name>` and keeps going. **A warn never blocks** — its exit is unaffected. Repos opt a check up from `warn` to `block` once they run clean. |

The runner prints `PASS: <name>` for a check that passes, `BLOCK: <name>` for a
failing `block` check, and `WARN: <name>` for a failing `warn` check. (These are
plain text prefixes, not glyphs.) Only a failing `block` check changes the exit
code.

---

## Invoking the release-commit phase

The git hooks installed by `install-gate.sh` only ever run two phases:
`pre-commit` runs `--phase work-commit` and `pre-push` runs `--phase pre-push`.
**Nothing in the installed hooks runs `--phase release-commit`.** That is by
design — `release-commit` is a heavier gate meant to be run *explicitly* by your
release process or CI, right before you bump `VERSION` / tag a release:

```sh
sh .koni-harness/gate-runner.sh --phase release-commit
```

What that means for what fires automatically on a normal `git commit`:

| Check | Phases | Runs on every commit? |
|---|---|---|
| `version-phase` | `work-commit`, `release-commit` | **Yes** — both phases |
| `credential-scan` | `work-commit`, `pre-push` | **Yes** — on commit and on push |
| `changelog-anchor` | `release-commit` | No — release-commit only |
| `story-status` | `release-commit` | No — release-commit only |
| `story-lint` | `release-commit` | No — release-commit only |
| `lesson-capture` | `release-commit` | No — release-commit only |
| `design-first` | `release-commit` | No — release-commit only |
| `koni-docs-validate` | `release-commit` | No — release-commit only |
| `security-review` | `release-commit` | No — release-commit only |
| `tests` | `pre-push` | No — on push only |

So `version-phase` — the critical 2-phase versioning gate — **does** run on
every commit through the `pre-commit` hook. The seven release-commit-only checks
(`changelog-anchor`, `story-status`, `story-lint`, `lesson-capture`,
`design-first`, `koni-docs-validate`, `security-review`) do **not** fire from
an ordinary commit; they are opt-in at release time, run only when you (or CI)
invoke `--phase release-commit`. Installing the hooks does not, on its own,
enforce release-time checks.

---

## The built-in checks

### `version-phase`

- **What it asserts**: two rules, both only when `VERSION` is staged.

  1. **The bump is described.** A `CHANGELOG.md` must also be staged *and* the
     staged CHANGELOG must contain a `[<newver>]` section matching the new
     VERSION (literal match on `[<version>]`, searched in `docs/CHANGELOG.md`
     then `CHANGELOG.md`). An empty staged `VERSION` blocks.
  2. **The bump goes forward.** The staged `VERSION` must be greater than or
     equal to `git show HEAD:VERSION`. Equal passes; strictly lower blocks,
     naming both values.

  If `VERSION` is not staged, the check passes immediately — an ordinary work
  commit is fine.

  Rule 2 compares **numerically, field by field**, never lexically: `0.9.0` →
  `0.10.0` is an increase and a string comparison says otherwise. Leading zeros
  are stripped with `${n#0}` rather than `$((n))`, because `$((08))` is a syntax
  error under `dash` and calver (`2026.08`) hits it. A version string it cannot
  order — `nightly`, a pre-release suffix — is **declined rather than guessed
  at**, and passes. During a merge no special case is needed: `HEAD` *is* the
  first parent, and the incoming side is `MERGE_HEAD`.

- **Why rule 2 lives here and not in a check of its own**: `install-gate.sh`
  copies every check it ships (`cp "$SRC"/checks/*.sh`) but **preserves an
  existing `gates.conf`**. A repo that adopted the harness earlier keeps its own
  config forever, so a *new* check file would ship and never run there — its row
  is not in the config it already has. Adding a rule to a check that is already
  wired is the only way a rule reaches an existing install.

  (Downstream, inside a repo, those same two lines argue the opposite: a
  repo-local fix must be a *new* file, because an edit to a vendored check is
  overwritten on the next upgrade. Same mechanism, opposite conclusion,
  depending on which side of the `cp` you are on.)

- **Where rule 2 came from**: koni-tao-data lowered `VERSION` twice in one day
  with this gate passing both times — `0.49.1 → 0.49.0` when a stale branch
  merged over a newer release, and `0.50.0 → 0.45.0` when a release commit
  picked up another file's version. The pairing rule asks whether `VERSION` and
  `CHANGELOG` moved *together*, never whether `VERSION` moved *forward*, so a
  backwards bump with a matching changelog entry is indistinguishable from a
  correct release. Both were caught by something **outside** the repository:
  git refusing a duplicate tag, then a CI step comparing the tag to `VERSION`.

- **Tests**: `scripts/checks/__tests__/test-version-phase.sh` — 15 cases in
  scratch repos, including both real incidents, both directions of the
  numeric-versus-lexical trap, calver leading zeros, the no-baseline case and a
  merge resolved to the older side.
- **Phase(s)**: `work-commit`, `release-commit`
- **Default severity**: `block`
- **Generalizes from**: Senti-Quant's `scripts/hooks/pre-commit` 2-phase
  versioning gate (a VERSION bump must carry its matching changelog section in
  the same commit).
- **`gates.conf` row**:
  ```
  version-phase        | checks/version-phase.sh            | work-commit,release-commit | block |
  ```

### `changelog-anchor`

- **What it asserts**: a `docs/CHANGELOG.md` (or root `CHANGELOG.md`) exists and
  contains an `[Unreleased]` anchor. Missing file or missing anchor blocks.
- **Phase(s)**: `release-commit`
- **Default severity**: `block`
- **Generalizes from**: koni-docs RULE-1 (the CHANGELOG `## [Unreleased]`
  surface that pending entries land under).
- **Self-test**: `checks/__tests__/test-changelog-anchor.sh`. Two assertions are
  the reason an eight-line check needed a suite at all: `docs/` **takes
  precedence** over a root copy even when the root copy would pass (a repo
  mid-D10 migration can hold both, and reading the stale one certifies nothing),
  and a repo with **no** CHANGELOG fails rather than skips.
- **`gates.conf` row**:
  ```
  changelog-anchor     | checks/changelog-anchor.sh         | release-commit             | block |
  ```

### `credential-scan`

- **What it asserts**: the staged **added** lines (`git diff --cached -U0`,
  `+`-prefixed, excluding the `+++` header) contain no high-confidence secret.
  It blocks on three patterns only: a PEM `BEGIN … PRIVATE KEY` block, an
  `AKIA…` AWS access-key id (`AKIA` + 16 upper/digits), and a quoted long
  secret-like assignment (`api_key` / `secret` / `token` `=`/`:` a 24+ char
  value). Low-confidence heuristics are deliberately out of scope to avoid
  false positives. A repo can add `.koni-harness/secret-allow` — one substring
  per line; matching added lines are filtered out before scanning.
- **Allowlist sharp edge**: the allowlist is a **substring** filter, so each entry
  must be the **full distinctive secret value** you are exempting — never a short
  common token. An entry like `api_key` would strip *every* added line containing
  that substring (including a line that also carries a real leaked value), silently
  defeating the scan. Allowlist the whole value (e.g. the exact test fixture
  string), not a generic word.
- **Phase(s)**: `work-commit`, `pre-push`
- **Default severity**: `block`
- **Generalizes from**: Senti-Quant's credential-isolation discipline.
- **Self-test**: `checks/__tests__/test-credential-scan.sh`.
  It pins both error directions, plus the boundary that makes the check usable:
  **removing** a secret must not block the commit that removes it (added lines
  only), the 24-char floor holds so `token = "abc"` does not fire, and an
  **empty** allowlist line does not disarm the scan — an empty pattern handed to
  `grep -vF` matches every line, which is how an escape hatch silently becomes an
  off switch.
- **Testing this check without weakening it**: secret-shaped fixtures in a file that is
  itself staged will trip the check — correctly. Do **not** reach for the allowlist to
  silence it. The allowlist has no file scoping, so exempting a PEM header for a fixture
  exempts a real leaked key's first line too, repo-wide, forever. Assemble the fixtures
  from concatenated halves instead (`'-----BEGIN RSA PRIVATE'' KEY-----'`): the exact
  string exists at runtime and never appears on a line in the file.
- **`gates.conf` row**:
  ```
  credential-scan      | checks/credential-scan.sh          | work-commit,pre-push       | block |
  ```

### `story-status`

- **What it asserts**: no story file under `docs/sprints/stories/` is marked
  `status: done` while it still has an unchecked acceptance-criteria/task box
  (`- [ ]`). The status match is tolerant (case-insensitive; emphasis is allowed
  on **either side of the colon** — `status: done`, `**status:** done`, and
  `**status**: done` all count), and `doneish` does not. Missing stories
  directory → pass.
- **Phase(s)**: `release-commit`
- **Default severity**: `warn`
- **Generalizes from**: the koni-docs sprint model (a `done` story should have
  all AC checked).
- **Self-test**: `checks/__tests__/test-story-status-consistency.sh`
  Writing it **found a live false negative**: the pattern
  accepted `**status:** done` but not `**status**: done` — the more common bold
  spelling — so a story written that way was skipped in silence. Both forms are
  now pinned, along with the `doneish` guard and the rule that an `in-progress`
  story is *supposed* to have open boxes.
- **`gates.conf` row**:
  ```
  story-status         | checks/story-status-consistency.sh | release-commit             | warn  |
  ```

### `story-lint`

- **What it asserts**: every US story's frontmatter is **complete and true at
  write time** — mandatory fields present (`id · title · epic · status ·
  priority · points · sprint · assignee · commit · created · updated`, +
  `version_shipped` when done); `points` a positive integer (Fibonacci for a
  single-round story; a consolidated story carries the sum of its rounds); `id`
  matches the filename prefix; the `sprint:` file exists **and did not end
  before `created:`** (the "filed into a closed sprint" bug); `status: done` ⇒
  a real `commit:` (`pending` tolerated only while `updated:` is today — the
  same-day backfill window); stories created on/after 2026-07-04 carry a
  `Lessons applied:` line — the **read half** of the lessons loop (cited
  sections or an explicit none-with-reason). Missing stories directory → pass.
- **Phase(s)**: `release-commit`
- **Default severity**: `block` — unlike style checks, an incomplete story is
  never a judgment call.
- **Generalizes from**: the Koni-Skills honesty audit (CONTEXT D32: 8 stories
  shipped without `points:`, 12 filed into an ended sprint; LESSONS §12). On
  its **first run** it caught the same drift from two months earlier (7
  v0.2.0 stories, D34) — the class recurs whenever it isn't gated.
- **Self-test**: `__tests__/story-lint-test.sh` (16 assertions freezing the
  D32 failure classes + the D35 read-evidence rule).
- **`gates.conf` row**:
  ```
  story-lint           | checks/story-lint.sh               | release-commit             | block |
  ```

### `lesson-capture`

- **What it asserts**: a **task-bearing release commit records a lesson
  verdict** — the write half of the lessons loop
  ([`agentic-loop-standard.md`](agentic-loop-standard.md)). If the staged diff
  touches anything outside `docs/` (a development task), the commit must stage
  **either** a `LESSONS.md` change (a staged *deletion* does not count) **or**
  an **added line** `Lessons: none new — <reason>` in this commit's staged .md/.mdx
  diff (the honest no-lesson verdict; em-dash form, the reason is mandatory and
  may not contain `<` — placeholder quotes never count, and pre-existing lines
  never count, so one old example cannot neutralize the gate). Known residual
  (adversarial-only): a pure **rename to `.md`** of a file whose old content
  held a concrete verdict line surfaces as all-added lines and would pass —
  no cheap POSIX fix; accepted and recorded here rather than hidden. Docs-only commits (backfills, sprint
  bookkeeping) are exempt; outside a git repo / nothing staged → pass. The
  check enforces **that the verdict was recorded, never which way it went** —
  "was a lesson learned?" stays human judgment (forced lessons breed filler).
- **Phase(s)**: `release-commit`
- **Default severity**: `block` — silence is the failure mode; the verdict
  costs one honest line.
- **Generalizes from**: the Koni-Skills lessons loop (CONTEXT D26 named the
  write step; D35 made both halves always-on after the user rule "luôn ghi
  LESSONS khi hoàn thành nhiệm vụ"). The read half is enforced by
  `story-lint`'s `Lessons applied:` rule on new stories.
- **Self-test**: `__tests__/lesson-capture-test.sh` (12 assertions: exemptions,
  both verdict forms, unstaged-verdict and missing-reason failures).
- **`gates.conf` row**:
  ```
  lesson-capture       | checks/lesson-capture.sh           | release-commit             | block |
  ```

### `design-first`

- **What it asserts**: UI code complies with the repo's design contract **at
  write time, not review time** — the other half of preventing UI rework
  ([`agentic-loop-standard.md`](agentic-loop-standard.md) design-first
  callout). A release commit staging UI source (`*.tsx *.jsx *.vue *.svelte
  *.css *.scss`), in a repo that has `DESIGN.md` (root or `docs/`), must also
  stage an **added** `Design applied: <sections + primitives + tokens>` line
  in a markdown file. Same anti-gaming mechanics as `lesson-capture`:
  added-lines only, placeholder forms containing `<` never count, loop-free
  path handling — and the same **documented residuals**: a rename-to-`.md`
  carrying an old citation passes (adversarial-only), and the extension
  boundary is deliberate — styling embedded in `.ts` template literals is
  invisible to this gate (adding `.ts` would false-positive all server code);
  `/design-review` remains the judge of what a grep cannot see. Deletion-only
  UI commits are exempt (`--diff-filter=d` — removing UI needs no citation).
  No `DESIGN.md` → pass (nothing to comply with; on a UI repo
  that absence is a koni-setup gap, not a license). `/design-review` at
  Review then **confirms** conformance rather than discovering violations.
- **Phase(s)**: `release-commit`
- **Default severity**: `block` — a stated design rule violated in shipped UI
  is never a judgment call.
- **Generalizes from**: the Koniverse UI rework loop the user named ("làm đi
  làm lại phần giao diện") — CONTEXT D36; the citation-evidence pattern of
  D35 (LESSONS §14/§15).
- **Self-test**: `__tests__/design-first-test.sh` (11 assertions, bash + dash).
- **`gates.conf` row**:
  ```
  design-first         | checks/design-first.sh             | release-commit             | block |
  ```

### `koni-docs-validate`

- **What it asserts**: when `koni-docs` is resolvable, runs
  `npx --no-install koni-docs validate --docs-path docs/` (ID graph + FR refs).
  It **skip-passes** (exit 0, no block) when any of these is true: there is no
  `docs/` directory, `npx` is unavailable, or `koni-docs` is resolvable
  **neither locally nor globally/ambiently**. Note that the probe
  (`npx --no-install koni-docs --version`) resolves *up* the directory tree and
  to *global* installs, so a repo with no `koni-docs` dependency of its own can
  still resolve an ambient/global `koni-docs` — and if any ambient `koni-docs`
  is on `PATH` or otherwise resolvable, the check runs against it rather than
  skip-passing. It never triggers a network install.
- **Phase(s)**: `release-commit`
- **Default severity**: `warn` (warn first; a repo opts into `block` once its
  docs validate clean)
- **Generalizes from**: the koni-docs `validate` CLI.
- **Self-test**: `checks/__tests__/test-koni-docs-validate.sh`,
  driven by a stub `npx` so no network or install is needed. Three skip-passes
  make it possible for this check to exit `0` forever without validating
  anything, so the suite's load-bearing assertion is the opposite one: **a
  failing validator fails the check**, and its exit code passes through
  unflattened. The stub also freezes the argv — `--no-install` on both the probe
  and the run — which is what keeps a pre-commit hook off the registry.
- **`gates.conf` row**:
  ```
  koni-docs-validate   | checks/koni-docs-validate.sh        | release-commit             | warn  |
  ```

### `skill-references` *(monorepo-only — not vendored)*

> **This check does not ship in the default `gates.conf`.** It lives in the
> Koni-Skills monorepo's **own** `.koni-harness/` (root), not in `scripts/gates.conf`,
> so `install-gate.sh` never vendors it into a consumer repo. It audits *skill docs*;
> a product repo has no `skills/` to check and does not receive it. Documented here
> because it is part of *this* repo's gate, but a consumer install will not have it.

- **What it asserts**: every markdown cross-reference in a changed skill resolves — a
  file link, an in-page anchor, a section pointer, a named script, and a count stated in
  prose — `N rules`, `N subcommands`, and `N release-commit-only checks` (or the
  `N release-only checks` alias), which must match the vendored `gates.conf`; that noun was
  added after a stale `six release-commit-only checks` survived several versions against a
  seven-row config. Runs `skills/koni-docs/scripts/check-references.py`
  over **every** skill (touch one, sweep all), and first runs that checker's own
  self-test, mutation test, and branch-coverage gate — refusing the checker's verdict
  if any fail, because a guard whose own tests fail proves nothing (LESSONS §19-§24, §28).
- **Phase(s)**: `work-commit`, `release-commit`
- **Severity**: `block`
- **Generalizes from**: three rounds of false greens where a dangling reference — a dead
  §-pointer, a ghost script, a drifted count — was invisible to the author who wrote it.
- **Row (in the monorepo's own `.koni-harness/gates.conf`, not the vendored default)**:
  ```
  skill-references     | checks/skill-references.sh          | work-commit,release-commit | block |
  ```

### `security-review`

- **What it asserts**: a release-commit does not ship a change to a **security trust
  boundary** without the koni-qc security review
  (`skills/koni-qc/references/security-review.md`). Precise and **opt-in**: the repo
  declares its boundaries as shell globs in `.koni-harness/security-paths` (one per line);
  a staged change matching any of them warns. A path is suppressed once its review is
  recorded by listing it (or a substring) in `.koni-harness/security-review-ack`. With no
  `security-paths` file the check is a **documented no-op** — a security reminder must be
  precise or it gets muted, the exact failure koni-qc's own method warns against, so the
  boundary is *declared by the repo*, never guessed by a content heuristic.
- **Why warn, not block**: whether a change truly needs a security review is a judgment,
  and a false trigger must never wedge a commit. It reminds; the author (or koni-qc) decides.
- **Phase(s)**: `release-commit`
- **Default severity**: `warn` (opt a repo up to `block` once its boundaries are declared
  and its reviews are consistently recorded)
- **Proven by**: `skills/koni-harness/scripts/checks/__tests__/test-security-review.sh` —
  five plant→assert cases (silent no-op, warns on a declared boundary, suppressed by ack,
  precise on a non-boundary path, `**`-glob nesting), and it is checked against three
  mutations (guard removed, never-warns, wrong reference path) so a regression fails the
  test instead of shipping.
- **Generalizes from**: the koni-qc security-review method naming koni-harness as the owner
  of the gate that enforces it.
- **`gates.conf` row**:
  ```
  security-review     | checks/security-review.sh          | release-commit             | warn  |
  ```

### `tests` (passthrough)

- **What it asserts**: runs a repo-provided command via `passthrough.sh` and
  passes its exit code through. The command comes from the `arg` column — here
  `npm test`. An empty `arg` makes the check a no-op (skip-pass).
- **Phase(s)**: `pre-push`
- **Default severity**: `block`
- **Generalizes from**: Senti-Quant CI (`tsc --noEmit` / `npm test`).
- **`gates.conf` row**:
  ```
  tests                | checks/passthrough.sh              | pre-push                   | block | npm test
  ```
- **Unit-coverage variant**: to enforce the koni-qc `unit-coverage.md` bar as a
  gate, add a second `passthrough` row whose `arg` runs the repo's coverage command
  with a threshold (it fails non-zero below the bar), e.g.
  ```
  unit-coverage        | checks/passthrough.sh              | work-commit                | warn  | npm run test:cov
  ```
  where `test:cov` is e.g. `vitest run --coverage --coverage.thresholds.lines=80 --coverage.thresholds.branches=80` (or `jest --coverage --coverageThreshold=…`, `pytest --cov --cov-fail-under=80`). Start at `warn`, graduate to `block` once the repo is clean. This is the deterministic backing for the Self-verify unit-coverage gate.

---

## Config grammar

`gates.conf` is line-oriented and pipe-delimited — no YAML, no `yq`, zero parser
dependency. One check per line:

```
name | script | phases(csv) | severity | arg
```

- **`name`** — display name printed by the runner.
- **`script`** — path to the check. A relative path is resolved against the
  runner's own directory (so `checks/foo.sh` resolves next to `gate-runner.sh`);
  an absolute path (`/…`) is used as-is.
- **`phases`** — comma-separated list of `work-commit` / `release-commit` /
  `pre-push`. The check runs only when the runner's `--phase` matches one of
  them. Whitespace inside the CSV is stripped.
- **`severity`** — `block` or `warn`.
- **`arg`** — a single optional argument passed to the check (e.g. the command
  for `passthrough.sh`). May be empty.

Parsing rules:

- Lines that are blank or start with `#` (after trimming leading whitespace) are
  skipped.
- Surrounding whitespace on each field is trimmed.
- A final line **without a trailing newline is still read** — the runner's read
  loop is `while IFS='|' read … || [ -n "$name" ]`, so a config that ends
  without a newline does not silently drop its last check.

---

## Testing a check

A check is a guard, and **a guard you wrote yourself is a hypothesis until you
try to break it** (LESSONS §20). Running it over a clean repo and getting `0`
proves nothing — a check that always prints `0` also prints `0`.

**The evaluator** runs every suite and then proves the set is complete:

```sh
sh skills/koni-harness/scripts/__tests__/run-all.sh          # run + coverage
sh skills/koni-harness/scripts/__tests__/run-all.sh --list   # just the suite paths
```

It does two things. It **runs** every `*-test.sh` / `test-*.sh` under
`scripts/__tests__/` and `scripts/checks/__tests__/` — previously a hand-run set,
so "all green" was a claim nobody could reproduce. And it **derives coverage from
`gates.conf`**: every row names a check script, and a script named by no suite is
reported `UNCOVERED` and fails the run. Adding a row without a test is a red
build, not a quiet gap.

Coverage is scoped to the **shipped** `gates.conf`. A consumer repo's vendored
config may carry local rows — this monorepo's own adds `skill-references` and a
repo-specific `tests` command — and the harness has no standing to demand a
shipped self-test for a check it does not ship.

Two floors (`MIN_SUITES`, `MIN_CHECKS`) sit at the top of the runner, for the
same reason koni-docs' fixture suites carry `MIN_CLASSES`: emptying a corpus used
to read as passing it. Raise them when the real number rises; never lower one to
turn a build green.

**Assertion counts are deliberately absent from these entries.** A number in prose is
a promise to stay in sync with something you do not control (LESSONS §28), and the
ground truth here is genuinely ambiguous — the suites report in three dialects and one
of them prints a single line covering five cases, so "how many assertions" has no single
right answer. `run-all.sh` prints the live count per suite; read it there rather than
re-numbering these entries. The counts that *are* mechanized — a stated
`N release-commit-only checks` against `gates.conf` — are enforced by
`check-references.py` (US-3.19).

**Writing the suite for a new check** — three obligations, in order of how often
they are skipped:

1. **Plant the defect and watch it fail.** Assert the failing exit code for each
   class the check claims to catch, *before* asserting the clean case passes.
   Silence is evidence only after you have made the thing speak (LESSONS §22).
2. **Pin the skip-passes as skip-passes, and pin at least one real failure.** Most
   of these checks no-op when their subject is absent (no `docs/`, no stories, no
   staged lines). Every such branch is defensible, and together they let a check
   exit `0` forever without ever running — so a suite that only exercises skips
   is a fifteenth way to print `0`.
3. **Pin the tolerances.** Every deliberate looseness in a pattern — allowed
   emphasis, case-insensitivity, a length floor — is a claim. An untested
   tolerance is indistinguishable from an accident, which is exactly how
   `story-status` shipped unable to read `**status**: done`.

CI reproduces all of it on every push and PR ([`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml)),
running the evaluator under **both `sh` (dash) and `bash`** — a suite that passes
only under the author's shell is not portable, it is lucky.

---

## Adding a custom check

1. Write a script that reads the staged state and exits `0` (pass) or `1`
   (fail). Keep it deterministic and grep-based — see the
   [engineering principles](agentic-loop-standard.md#harness-engineering-principles).
   Drop it in `.koni-harness/checks/your-check.sh` (in the consumer repo) and
   make it executable.
2. Add a row to `.koni-harness/gates.conf` pointing at it, choosing its phases
   and severity:
   ```
   your-check | checks/your-check.sh | work-commit | warn |
   ```
3. Dry-run to confirm it is wired:
   `sh .koni-harness/gate-runner.sh --phase work-commit --dry-run`
4. **Write its self-test** ([Testing a check](#testing-a-check)) — a
   `test-<name>.sh` beside the other suites in `scripts/checks/__tests__/`,
   planting each defect class before asserting the clean case. For a check being
   contributed *back* to the harness this is not optional: `run-all.sh` derives
   coverage from `gates.conf` and will report the new row `UNCOVERED` until a
   suite names its script.

The runner is the only orchestrator — checks never call each other. New checks
should start at `warn` and graduate to `block` once the repo runs clean.

> **Calling convention**: the runner always invokes a check as
> `sh <script> "<arg>"` — your check receives **exactly one positional argument**,
> which is the empty string when the `arg` column is blank. A `set -eu` check that
> shifts positionals should default it (`a=${1:-}`), not assume it is absent.

> **Path foot-gun**: a relative `script` is resolved against the **runner's**
> directory, *not* against the `gates.conf` location or the cwd. So a custom
> check must live in `.koni-harness/checks/` (next to the runner) or be named by
> an absolute path. If you test with `--config ./elsewhere/gates.conf`, a
> relative `checks/foo.sh` there will be looked up next to `gate-runner.sh`, not
> next to your config — use an absolute path in that case.
