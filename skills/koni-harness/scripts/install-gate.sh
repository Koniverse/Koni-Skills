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

# vendor the session briefing alongside the other helpers
cp "$SRC/session-start.sh" .koni-harness/session-start.sh
chmod +x .koni-harness/session-start.sh

# gitignore the ephemeral loop-state (additive, marker-bounded, idempotent)
gi=.gitignore
gbegin='# >>> koni-harness >>>'
gend='# <<< koni-harness <<<'
if [ ! -f "$gi" ] || ! grep -q "$gbegin" "$gi"; then
  if [ -s "$gi" ] && [ -n "$(tail -c1 "$gi")" ]; then printf '\n' >> "$gi"; fi
  printf '%s\n.koni-harness/loop-state\n%s\n' "$gbegin" "$gend" >> "$gi"
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
