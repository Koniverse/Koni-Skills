#!/bin/sh
# koni-harness gate-runner (POSIX). Reads gates.conf, runs checks for a phase.
# Usage: gate-runner.sh --phase <work-commit|release-commit|pre-push> [--config PATH] [--dry-run]
set -eu
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PHASE=""; CONFIG=""; DRY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --phase)   PHASE=${2:-}; shift 2 ;;
    --config)  CONFIG=${2:-}; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) echo "gate-runner: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$PHASE" ] || { echo "gate-runner: --phase required" >&2; exit 2; }
if [ -z "$CONFIG" ]; then
  if [ -f "$SELF_DIR/gates.conf" ]; then CONFIG="$SELF_DIR/gates.conf"
  elif [ -f gates.conf ]; then CONFIG=gates.conf
  else echo "gate-runner: no gates.conf found" >&2; exit 2; fi
fi
[ -f "$CONFIG" ] || { echo "gate-runner: config not found: $CONFIG" >&2; exit 2; }

trim() { printf '%s' "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'; }
fail=0
while IFS='|' read -r name script phases severity arg || [ -n "$name" ]; do
  name=$(trim "${name:-}")
  case "$name" in ''|\#*) continue ;; esac
  script=$(trim "${script:-}")
  phases=$(printf '%s' "${phases:-}" | tr -d '[:space:]')
  severity=$(trim "${severity:-}")
  arg=$(trim "${arg:-}")
  echo ",$phases," | grep -q ",$PHASE," || continue
  case "$script" in /*) cmd="$script" ;; *) cmd="$SELF_DIR/$script" ;; esac
  if [ "$DRY" -eq 1 ]; then echo "DRY [$severity] $name -> $cmd ${arg}"; continue; fi
  if sh "$cmd" "$arg"; then
    echo "PASS: $name"
  elif [ "$severity" = block ]; then
    echo "BLOCK: $name" >&2; fail=1
  else
    echo "WARN: $name" >&2
  fi
done < "$CONFIG"
exit "$fail"
