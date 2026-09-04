#!/bin/sh
# Additively install the koni-harness gate into the current repo. Never clobbers.
set -eu
SRC=""
while [ $# -gt 0 ]; do
  case "$1" in
    --source) SRC=${2:-}; shift 2 ;;
    *) echo "install-gate: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$SRC" ] || SRC=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
git rev-parse --git-dir >/dev/null 2>&1 || { echo "install-gate: run from inside a git repo" >&2; exit 2; }
# Install at the repo root, not the cwd: the vendored files and the chained hook
# both anchor on the toplevel, so running from a subdirectory must not split them.
TOP=$(git rev-parse --show-toplevel) && CDPATH= cd -- "$TOP" || { echo "install-gate: cannot cd to repo root" >&2; exit 2; }
hooks=$(git rev-parse --git-path hooks)
mkdir -p "$hooks"

# 1. vendor runner + checks + config (copy; do not overwrite an existing gates.conf)
mkdir -p .koni-harness/checks
cp "$SRC/gate-runner.sh" .koni-harness/gate-runner.sh
cp "$SRC"/checks/*.sh .koni-harness/checks/
chmod +x .koni-harness/gate-runner.sh .koni-harness/checks/*.sh
[ -f .koni-harness/gates.conf ] || cp "$SRC/gates.conf" .koni-harness/gates.conf

# vendor the loop-runner helper alongside the gate
cp "$SRC/loop.sh" .koni-harness/loop.sh
chmod +x .koni-harness/loop.sh

# vendor the context-loader alongside the gate + loop helpers
cp "$SRC/context-load.sh" .koni-harness/context-load.sh
chmod +x .koni-harness/context-load.sh

# vendor the sprint-sequencer alongside the other helpers
cp "$SRC/sprint.sh" .koni-harness/sprint.sh
chmod +x .koni-harness/sprint.sh

# vendor the swarm planner (parallel/multi-agent dispatch; read-only, needs sprint.sh)
cp "$SRC/swarm.sh" .koni-harness/swarm.sh
chmod +x .koni-harness/swarm.sh

# vendor the session briefing alongside the other helpers
cp "$SRC/session-start.sh" .koni-harness/session-start.sh
chmod +x .koni-harness/session-start.sh

# gitignore the ephemeral harness working state (additive, marker-bounded, idempotent).
# Every path here is scratch the loop writes and the repo must never carry:
#   loop-state  — the single-story loop position
#   worktrees/  — swarm isolation checkouts
#   frame/      — Frame question files (the durable record is the story + CONTEXT)
gi=.gitignore
gbegin='# >>> koni-harness >>>'
gend='# <<< koni-harness <<<'
IGNORES='.koni-harness/loop-state
.koni-harness/worktrees/
.koni-harness/frame/'
if [ ! -f "$gi" ] || ! grep -q "$gbegin" "$gi"; then
  if [ -s "$gi" ] && [ -n "$(tail -c1 "$gi")" ]; then printf '\n' >> "$gi"; fi
  { printf '%s\n' "$gbegin"; printf '%s\n' "$IGNORES"; printf '%s\n' "$gend"; } >> "$gi"
else
  # The block already exists — a repo installed before a path was added would never
  # receive it, because "marker present" used to mean "nothing left to do". Add only
  # the missing lines, inside the existing block, leaving every other line untouched.
  printf '%s\n' "$IGNORES" | while IFS= read -r want; do
    [ -n "$want" ] || continue
    grep -qxF "$want" "$gi" && continue
    gtmp="$gi.koni-harness.$$"
    awk -v e="$gend" -v l="$want" '$0 == e { print l } { print }' "$gi" > "$gtmp" && mv "$gtmp" "$gi"
  done
fi

# 2. chain a git hook behind a marker block, preserving any existing content
chain_hook() {  # $1 hookname  $2 phase
  hook="$hooks/$1"
  begin='# >>> koni-harness >>>'
  end='# <<< koni-harness <<<'
  block="$begin
sh \"\$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh\" --phase $2 || exit 1
$end"
  if [ ! -f "$hook" ]; then
    printf '#!/bin/sh\n%s\n' "$block" > "$hook"
  elif grep -q "$begin" "$hook"; then
    :   # already installed → idempotent no-op
  else
    # Only chain onto an existing POSIX-shell hook; never inject an sh block
    # into a hook written in another language (python, ruby, node, …).
    first=$(head -n 1 "$hook")
    case "$first" in
      '#!/bin/sh'|'#!/usr/bin/env sh'|'#!/bin/bash'|'#!/usr/bin/env bash')
        printf '\n%s\n' "$block" >> "$hook" ;;
      *)
        echo "install-gate: existing $1 is not a POSIX-shell hook; chain the gate manually: sh \$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh --phase $2" >&2
        return 0 ;;
    esac
  fi
  chmod +x "$hook"
}
chain_hook pre-commit work-commit
chain_hook pre-push   pre-push

echo "install-gate: koni-harness gate installed additively into .koni-harness/ + git hooks"
