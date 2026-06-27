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
[ -d .git ] || { echo "install-gate: run from a git repo root" >&2; exit 2; }

# 1. vendor runner + checks + config (copy; do not overwrite an existing gates.conf)
mkdir -p .koni-harness/checks
cp "$SRC/gate-runner.sh" .koni-harness/gate-runner.sh
cp "$SRC"/checks/*.sh .koni-harness/checks/
chmod +x .koni-harness/gate-runner.sh .koni-harness/checks/*.sh
[ -f .koni-harness/gates.conf ] || cp "$SRC/gates.conf" .koni-harness/gates.conf

# 2. chain a git hook behind a marker block, preserving any existing content
chain_hook() {  # $1 hookname  $2 phase
  hook=".git/hooks/$1"
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
    printf '\n%s\n' "$block" >> "$hook"
  fi
  chmod +x "$hook"
}
chain_hook pre-commit work-commit
chain_hook pre-push   pre-push

echo "install-gate: koni-harness gate installed additively into .koni-harness/ + git hooks"
