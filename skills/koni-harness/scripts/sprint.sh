#!/bin/sh
# koni-harness sprint-sequencer (POSIX, read-only). Cross-story sprint queries.
# Usage: sprint.sh {next|status} [--sprint <id>] [--docs <dir>] [--root <dir>]
set -eu
cmd=${1:-}; [ $# -gt 0 ] && shift || true
ROOT=""; DOCS=""; SPRINT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT=${2:-}; shift 2 ;;
    --docs) DOCS=${2:-}; shift 2 ;;
    --sprint) SPRINT=${2:-}; shift 2 ;;
    *) echo "sprint: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$ROOT" ] || ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
[ -n "$DOCS" ] || DOCS="$ROOT/docs"
STORIES="$DOCS/sprints/stories"
if [ -z "$SPRINT" ] && [ -f "$ROOT/CLAUDE.md" ]; then
  SPRINT=$(grep -E '^[[:space:]]*active_sprint:' "$ROOT/CLAUDE.md" 2>/dev/null | head -n1 \
    | sed 's/^[^:]*://; s/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//' || true)
fi
[ -n "$SPRINT" ] || { echo "sprint: no sprint resolved (pass --sprint or set active_sprint in CLAUDE.md)" >&2; exit 2; }

field() { # field file -> trimmed value (quotes + trailing comment stripped)
  grep -E "^$1:" "$2" 2>/dev/null | head -n1 \
    | sed "s/^$1:[[:space:]]*//; s/[[:space:]]*#.*//; s/^[[:space:]]*//; s/[[:space:]]*\$//; s/^[\"']//; s/[\"']\$//"
}
deps_of() { # file -> space-separated dep ids
  awk '
    /^depends_on:/ { indep=1; next }
    indep==1 {
      if ($0 ~ /^[A-Za-z_]+:/) { indep=0; next }
      if ($0 ~ /^[[:space:]]*-[[:space:]]*/) {
        id=$0; sub(/^[[:space:]]*-[[:space:]]*/,"",id); sub(/[[:space:]].*/,"",id)
        sub(/#.*/,"",id); gsub(/["'\'']/,"",id); if (id!="") printf "%s ", id
      }
    }
  ' "$1"
}
prio_rank() { case "$1" in P0) echo 0 ;; P1) echo 1 ;; P2) echo 2 ;; P3) echo 3 ;; *) echo 9 ;; esac; }
status_of_id() { # id -> status of the story whose id matches (empty if none)
  for f in "$STORIES"/*.md; do
    [ -e "$f" ] || continue
    [ "$(field id "$f")" = "$1" ] && { field status "$f"; return; }
  done
}
in_sprint_files() { # echo story files whose sprint == $SPRINT
  for f in "$STORIES"/*.md; do
    [ -e "$f" ] || continue
    [ "$(field sprint "$f")" = "$SPRINT" ] && echo "$f"
  done
}

do_next() {
  ready=''
  for f in $(in_sprint_files); do
    [ "$(field status "$f")" = done ] && continue
    id=$(field id "$f"); title=$(field title "$f"); pr=$(field priority "$f")
    blocked=0
    for d in $(deps_of "$f"); do
      [ "$(status_of_id "$d")" = done ] || { blocked=1; break; }
    done
    [ "$blocked" -eq 0 ] && ready=$(printf '%s\n%s|%s|%s' "$ready" "$(prio_rank "$pr")" "$id" "$title")
  done
  if [ -z "$ready" ]; then
    echo "No ready stories in $SPRINT. Run 'sprint.sh status' to see blockers."
    return 0
  fi
  sorted=$(printf '%s\n' "$ready" | sed '/^$/d' | sort -t'|' -k1,1n -k2,2)
  echo "Ready stories in $SPRINT (priority order):"
  printf '%s\n' "$sorted" | sed 's/^[0-9]*|/- /; s/|/  —  /'
  first=$(printf '%s\n' "$sorted" | head -n1 | cut -d'|' -f2)
  echo
  echo "→ start: loop.sh start $first"
}

case "$cmd" in
  next) do_next ;;
  *) echo "usage: sprint.sh {next|status} [--sprint <id>] [--docs <dir>] [--root <dir>]" >&2; exit 2 ;;
esac
