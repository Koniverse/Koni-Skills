# Adoption — non-destructive install procedure

The hard invariant: **adopting the harness in any repo makes only additive
changes.** It MUST NOT overwrite, rewrite, or delete an existing hook, setting,
doc, or config. It chains, wraps, and merges — never clobbers. Every action is
idempotent and safe to re-run.

`install-gate.sh` enforces this for you; this file is the procedure it follows
(and the manual steps for the cases it leaves to you).

---

## Procedure (checklist)

- [ ] **Run from inside the target git repo.** The installer locates the hooks
      directory with `git rev-parse --git-path hooks` (so it respects a custom
      `core.hooksPath`) and aborts if you are not inside a git repo.

- [ ] **Vendor the runner + checks + config into `.koni-harness/`.**
      `gate-runner.sh` and every `checks/*.sh` are copied in (and made
      executable). `gates.conf` is copied **only if absent** — an existing
      `.koni-harness/gates.conf` is left untouched, so your local check
      selection is never overwritten.

- [ ] **Detect any existing harness before touching a shared file.** Look for an
      existing `.git/hooks/pre-commit` / `pre-push`, a Senti-Quant-style
      `scripts/hooks/pre-commit`, `.claude/settings.json` hooks, and an existing
      `.koni-harness/gates.conf`.

- [ ] **Chain git hooks behind a marker block — never replace.** For each of
      `pre-commit` / `pre-push`:
  - No hook yet → create it with a `#!/bin/sh` shebang + the marker block.
  - Hook already has the `# >>> koni-harness >>>` marker → no-op (idempotent).
  - Hook exists and is a POSIX-shell hook → **append** the marker block; the
    original hook content is preserved and runs first.
  - Hook exists but is **not** a POSIX-shell hook (python/ruby/node/…) → the
    installer **SKIPS** it and prints a warning with manual-chain instructions.
    It never injects an `sh` block into a non-`sh` hook. Chain it yourself by
    adding inside the existing hook's language:
    `sh "$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh" --phase <phase>`.

- [ ] **Merge Claude `settings.json` — never replace.** Append the gate's
      `PreToolUse` (or `Stop`) hook object into the existing array, preserving
      every current key. If a conflicting hook already exists, print the snippet
      and ask rather than overwrite. (See [`adapters.md`](adapters.md) for the
      exact JSON.)

- [ ] **Leave existing gate config untouched.** If the repo already has a
      `.koni-harness/gates.conf`, do not overwrite it; if you want to suggest
      additions, show a diff of proposed rows.

---

## Marker-block discipline

Every edit the harness makes to a *shared* file is bounded by reversible
markers:

```
# >>> koni-harness >>>
…koni-harness lines…
# <<< koni-harness <<<
```

This makes every addition (a) recognizable on re-run, so the installer no-ops
instead of duplicating, and (b) cleanly reversible — removing the block between
the markers restores the original file. The presence of the begin marker is
exactly what the idempotency check keys on.

---

## Recognize a prior 2-phase gate (don't duplicate)

If the repo already enforces 2-phase versioning — the clearest case is
**Senti-Quant's `scripts/hooks/pre-commit`** — do **not** add a duplicate
`version-phase` check that fights it. Adopt or wrap the existing gate instead:
chain the koni-harness runner alongside it behind a marker block, and remove (or
leave at `warn`) the overlapping built-in check in `.koni-harness/gates.conf` so
the two do not double-enforce the same rule. The harness composes the existing
gate; it does not replace it.

---

## Idempotency

Re-running `install-gate.sh` is always safe:

- Re-vendoring refreshes `gate-runner.sh` and the checks but leaves an existing
  `gates.conf` alone.
- A hook that already carries the marker block is detected and skipped — you get
  a single marker block, never a second.

---

## In *this* repo

Registration of the koni-harness skill itself is additive only: a new skill
directory plus mirrored `.claude` / `.agents` symlinks, and doc updates that go
through koni-docs as **new** story / CHANGELOG entries — never rewriting an
existing doc. The same additive-only rule that governs adopting the gate into a
consumer repo governs landing the skill here.
