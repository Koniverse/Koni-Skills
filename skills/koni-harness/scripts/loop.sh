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
  if [ -f "$f" ]; then grep -v "^$1=" "$f" > "$tmp" || true; else : > "$tmp"; fi
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  mv "$tmp" "$f"
}
idx_of() { # stage -> 1-based index, 0 if unknown
  i=0; for s in $STAGES; do i=$((i+1)); [ "$s" = "$1" ] && { echo "$i"; return; }; done; echo 0
}

do_start() {
  story=""; tier=2
  while [ $# -gt 0 ]; do case "$1" in
    --tier) tier=${2:-}; case "$tier" in ''|-*) echo "loop start: --tier needs an integer value" >&2; exit 2 ;; esac; shift 2 ;;
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop start: unknown $1" >&2; exit 2 ;;
    *) story=$1; shift ;;
  esac; done
  [ -n "$story" ] || { echo "loop start: <story-id> required" >&2; exit 2; }
  case "$tier" in ''|*[!0-9]*) echo "loop start: --tier must be an integer (got '$tier')" >&2; exit 2 ;; esac
  mkdir -p "$(dirname "$STATE")"; : > "$STATE"
  kv_set story "$story" "$STATE"; kv_set tier "$tier" "$STATE"
  kv_set stage frame "$STATE"; kv_set entered frame "$STATE"; kv_set updated "$(now)" "$STATE"
  echo "loop: started $story (tier $tier) at stage frame"
}

do_status() {
  while [ $# -gt 0 ]; do case "$1" in --state) STATE=$2; shift 2 ;; *) echo "loop status: unexpected arg '$1'" >&2; exit 2 ;; esac; done
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

do_enter() {
  stage=""
  while [ $# -gt 0 ]; do case "$1" in
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop enter: unknown $1" >&2; exit 2 ;;
    *) [ -z "$stage" ] || { echo "loop enter: unexpected extra arg '$1'" >&2; exit 2; }; stage=$1; shift ;;
  esac; done
  [ -n "$stage" ] || { echo "loop enter: <stage> required" >&2; exit 2; }
  [ -f "$STATE" ] || { echo "loop enter: no active loop; run 'loop.sh start' first" >&2; exit 2; }
  ni=$(idx_of "$stage")
  [ "$ni" -gt 0 ] || { echo "loop enter: unknown stage '$stage' (one of: $STAGES)" >&2; exit 2; }
  cur=$(kv_get stage "$STATE"); ci=$(idx_of "$cur")
  if [ "$cur" = complete ]; then
    echo "loop WARN: loop is already complete; run 'loop.sh start' to begin a new one (not entering '$stage')" >&2
    exit 0
  fi
  tier=$(kv_get tier "$STATE"); entered=$(kv_get entered "$STATE")
  case "$tier" in ''|*[!0-9]*) tier=2 ;; esac   # harden against a corrupted/hand-edited state
  [ "$ni" -lt "$ci" ] && echo "loop WARN: entering '$stage' is before current '$cur' (going backward)" >&2
  if [ "$stage" = commit ] && [ "$tier" -ge 1 ]; then
    echo ",$entered," | grep -q ",self-verify," || \
      echo "loop WARN: entering 'commit' without 'self-verify' (tier $tier)" >&2
  fi
  kv_set stage "$stage" "$STATE"
  echo ",$entered," | grep -q ",$stage," || kv_set entered "$entered,$stage" "$STATE"
  kv_set updated "$(now)" "$STATE"
  echo "loop: entered $stage"
}

do_gate() {
  phase=""
  while [ $# -gt 0 ]; do case "$1" in
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop gate: unknown $1" >&2; exit 2 ;;
    *) [ -z "$phase" ] || { echo "loop gate: unexpected extra arg '$1'" >&2; exit 2; }; phase=$1; shift ;;
  esac; done
  [ -n "$phase" ] || { echo "loop gate: <phase> required" >&2; exit 2; }
  runner="$SELF_DIR/gate-runner.sh"
  [ -f "$runner" ] || runner=".koni-harness/gate-runner.sh"
  [ -f "$runner" ] || { echo "loop gate: gate-runner.sh not found" >&2; exit 2; }
  if sh "$runner" --phase "$phase"; then rc=0; res=pass; else rc=$?; res=block; fi
  [ -f "$STATE" ] && kv_set "gate_$phase" "$res" "$STATE"
  exit "$rc"
}

do_complete() {
  while [ $# -gt 0 ]; do case "$1" in --state) STATE=$2; shift 2 ;; *) echo "loop complete: unexpected arg '$1'" >&2; exit 2 ;; esac; done
  [ -f "$STATE" ] || { echo "loop complete: no active loop" >&2; exit 2; }
  kv_set stage complete "$STATE"; kv_set updated "$(now)" "$STATE"
  echo "loop: complete"
}

cmd=${1:-}; [ $# -gt 0 ] && shift || true
case "$cmd" in
  start)    do_start "$@" ;;
  status)   do_status "$@" ;;
  enter)    do_enter "$@" ;;
  gate)     do_gate "$@" ;;
  complete) do_complete "$@" ;;
  *) echo "usage: loop.sh {start|status|enter|gate|complete} [--state PATH] ..." >&2; exit 2 ;;
esac
