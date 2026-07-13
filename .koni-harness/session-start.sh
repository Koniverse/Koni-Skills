#!/bin/sh
# koni-harness session briefing (POSIX, read-only). Composes the context digest
# (context-load.sh) and the next-story suggestion (sprint.sh next) for session start.
# Usage: session-start.sh [--root <dir>] [--docs <dir>] [--sprint <id>]
set -eu
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=""; DOCS=""; SPRINT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT=${2:-}; shift 2 ;;
    --docs) DOCS=${2:-}; shift 2 ;;
    --sprint) SPRINT=${2:-}; shift 2 ;;
    *) echo "session-start: unknown arg: $1" >&2; exit 2 ;;
  esac
done

resolve() { # name -> path ("" if not found)
  if [ -f "$SELF_DIR/$1" ]; then printf '%s' "$SELF_DIR/$1"
  elif [ -f ".koni-harness/$1" ]; then printf '%s' ".koni-harness/$1"
  fi
}
set --
[ -n "$ROOT" ] && set -- "$@" --root "$ROOT"
[ -n "$DOCS" ] && set -- "$@" --docs "$DOCS"

cl=$(resolve context-load.sh)
if [ -n "$cl" ]; then sh "$cl" "$@" || true; else echo "_(context-load.sh not found)_"; fi
echo
echo "## Next"
echo
sp=$(resolve sprint.sh)
if [ -n "$sp" ]; then
  if [ -n "$SPRINT" ]; then sh "$sp" next "$@" --sprint "$SPRINT" || true
  else sh "$sp" next "$@" || true; fi
else
  echo "_(sprint.sh not found)_"
fi
