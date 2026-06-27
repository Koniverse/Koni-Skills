# Gate catalog — the built-in checks

The gate is driven by `gates.conf`, a line-oriented config read by
`gate-runner.sh`. This file documents the six built-in checks that ship in the
default `gates.conf`, the config grammar, and how to add your own check.

For how the runner is wired into git / Claude Code / Gemini / Codex, see
[`adapters.md`](adapters.md). For non-destructive install, see
[`adoption.md`](adoption.md).

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

## The six built-in checks

### `version-phase`

- **What it asserts**: if `VERSION` is staged in this commit, a `CHANGELOG.md`
  must also be staged *and* the staged CHANGELOG must contain a `[<newver>]`
  section matching the new VERSION (literal match on `[<version>]`, searched in
  `docs/CHANGELOG.md` then `CHANGELOG.md`). If `VERSION` is not staged, the
  check passes immediately (an ordinary work commit is fine). An empty staged
  `VERSION` blocks.
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
- **Phase(s)**: `work-commit`, `pre-push`
- **Default severity**: `block`
- **Generalizes from**: Senti-Quant's credential-isolation discipline.
- **`gates.conf` row**:
  ```
  credential-scan      | checks/credential-scan.sh          | work-commit,pre-push       | block |
  ```

### `story-status`

- **What it asserts**: no story file under `docs/sprints/stories/` is marked
  `status: done` while it still has an unchecked acceptance-criteria/task box
  (`- [ ]`). The status match is tolerant (case-insensitive, allows surrounding
  markdown emphasis like `**status:** done`). Missing stories directory → pass.
- **Phase(s)**: `release-commit`
- **Default severity**: `warn`
- **Generalizes from**: the koni-docs sprint model (a `done` story should have
  all AC checked).
- **`gates.conf` row**:
  ```
  story-status         | checks/story-status-consistency.sh | release-commit             | warn  |
  ```

### `koni-docs-validate`

- **What it asserts**: when the `koni-docs` package is locally available, runs
  `npx --no-install koni-docs validate --docs-path docs/` (ID graph + FR refs).
  It **skip-passes** (exit 0, no block) when any of these is true: there is no
  `docs/` directory, `npx` is unavailable, or the `koni-docs` package is not
  installed (probed via `npx --no-install koni-docs --version`). It never
  triggers a network install.
- **Phase(s)**: `release-commit`
- **Default severity**: `warn` (warn first; a repo opts into `block` once its
  docs validate clean)
- **Generalizes from**: the koni-docs `validate` CLI.
- **`gates.conf` row**:
  ```
  koni-docs-validate   | checks/koni-docs-validate.sh        | release-commit             | warn  |
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

The runner is the only orchestrator — checks never call each other. New checks
should start at `warn` and graduate to `block` once the repo runs clean.
