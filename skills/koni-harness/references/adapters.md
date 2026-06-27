# Adapters — wiring the gate into a tool

The gate has one brain — the vendored `.koni-harness/gate-runner.sh` — and three
thin adapters that invoke it. All three call the **same** runner with the same
`--phase` contract; nothing about a check changes per tool. Pick the adapter(s)
for the tools your repo uses, or use more than one.

For the checks themselves see [`gate-catalog.md`](gate-catalog.md). For the
non-destructive install procedure see [`adoption.md`](adoption.md).

---

### git

`install-gate.sh` chains the runner into the repo's `pre-commit` and `pre-push`
hooks (located via `git rev-parse --git-path hooks`, so it respects a custom
`core.hooksPath`). It writes exactly this marker block — `pre-commit` runs the
`work-commit` phase, `pre-push` runs the `pre-push` phase:

```sh
# >>> koni-harness >>>
sh "$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh" --phase work-commit || exit 1
# <<< koni-harness <<<
```

(the `pre-push` hook is identical except `--phase pre-push`.)

Install behavior:

- If the hook does **not** exist, the installer creates it with a `#!/bin/sh`
  shebang followed by the marker block.
- If the hook already contains the `# >>> koni-harness >>>` marker, the
  installer no-ops (idempotent).
- If the hook exists and is a POSIX-shell hook (shebang `#!/bin/sh`,
  `#!/usr/bin/env sh`, `#!/bin/bash`, or `#!/usr/bin/env bash`), the marker
  block is **appended** — the original hook content is preserved and still runs.
- If the hook exists but is **not** a POSIX-shell hook (e.g. python, ruby,
  node), the installer **skips** it and prints a warning telling you to chain
  the gate manually:
  `sh "$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh" --phase <phase>`.
  It never injects an `sh` block into a non-`sh` hook.

---

### Claude Code

Claude Code runs the same runner via a `settings.json` hook. A `PreToolUse`
matcher on `Bash(git commit*)` runs the gate just before Claude executes a
`git commit`; a `Stop` hook runs it when a turn ends. Use the `PreToolUse`
form to gate commits at the moment they happen.

**Merge** this into the repo's existing `.claude/settings.json` — preserve every
existing key, never replace the file. Add (or extend) the `hooks.PreToolUse`
array:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "command": "sh \"$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh\" --phase work-commit"
          }
        ]
      }
    ]
  }
}
```

If a `PreToolUse` array already exists, append this object to it rather than
overwriting the array. (Alternatively, use a `Stop` hook with the same
`command` if you prefer the gate to run at end-of-turn instead of pre-commit.)

---

### Gemini / Codex / Cursor

These tools share no common hook spec, so there is nothing to merge into — the
**runner itself is the contract**. Invoke it directly as a documented one-liner
from the repo root, whenever the tool's workflow reaches a commit:

```sh
sh .koni-harness/gate-runner.sh --phase work-commit
```

Swap `--phase release-commit` or `--phase pre-push` as appropriate. A non-zero
exit means a `block` check failed — stop and fix. Add `--dry-run` to see what
would run without executing the checks.
