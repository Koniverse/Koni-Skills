#!/bin/sh
# koni-harness loop-state helper (POSIX). Tracks one story through the six-stage loop.
# Usage: loop.sh {start <id> [--tier N]|status|enter <stage>|gate <phase>|complete} [--state PATH]
set -eu

STAGES="frame execute self-verify review doc-gate commit"
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
STATE=".koni-harness/loop-state"

now() { date +%Y-%m-%d 2>/dev/null || echo -; }
kv_get() { # key file
  [ -f "$2" ] || return 0
  sed -n "s/^$1=//p" "$2" | head -n1
}
kv_set() { # key value file
  f=$3; tmp="$f.tmp.$$"
  if [ -f "$f" ] && grep -q "^$1=" "$f"; then
    sed "s|^$1=.*|$1=$2|" "$f" > "$tmp" && mv "$tmp" "$f"
  else
    printf '%s=%s\n' "$1" "$2" >> "$f"
  fi
}
idx_of() { # stage -> 1-based index, 0 if unknown
  i=0; for s in $STAGES; do i=$((i+1)); [ "$s" = "$1" ] && { echo "$i"; return; }; done; echo 0
}

do_start() {
  story=""; tier=2
  while [ $# -gt 0 ]; do case "$1" in
    --tier) tier=$2; shift 2 ;;
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop start: unknown $1" >&2; exit 2 ;;
    *) story=$1; shift ;;
  esac; done
  [ -n "$story" ] || { echo "loop start: <story-id> required" >&2; exit 2; }
  mkdir -p "$(dirname "$STATE")"; : > "$STATE"
  kv_set story "$story" "$STATE"; kv_set tier "$tier" "$STATE"
  kv_set stage frame "$STATE"; kv_set entered frame "$STATE"; kv_set updated "$(now)" "$STATE"
  echo "loop: started $story (tier $tier) at stage frame"
}

do_status() {
  while [ $# -gt 0 ]; do case "$1" in --state) STATE=$2; shift 2 ;; *) shift ;; esac; done
  [ -f "$STATE" ] || { echo "loop: no active loop ($STATE not found)"; return 0; }
  echo "story:   $(kv_get story "$STATE")"
  echo "tier:    $(kv_get tier "$STATE")"
  stage=$(kv_get stage "$STATE")
  echo "stage:   $stage"
  echo "entered: $(kv_get entered "$STATE")"
  if [ "$stage" = commit ]; then
    echo "next:    run 'loop.sh gate work-commit' (or release-commit), then commit"
  elif [ "$stage" = complete ]; then
    echo "next:    (loop complete)"
  else
    ci=$(idx_of "$stage"); ni=$((ci+1)); nxt=""; i=0
    for s in $STAGES; do i=$((i+1)); [ "$i" -eq "$ni" ] && nxt=$s; done
    echo "next:    enter $nxt"
  fi
}

cmd=${1:-}; [ $# -gt 0 ] && shift || true
case "$cmd" in
  start)    do_start "$@" ;;
  status)   do_status "$@" ;;
  *) echo "usage: loop.sh {start|status|enter|gate|complete} [--state PATH] ..." >&2; exit 2 ;;
esac
