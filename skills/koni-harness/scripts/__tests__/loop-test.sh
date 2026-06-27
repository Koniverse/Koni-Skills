#!/bin/sh
# Self-contained POSIX tests for loop.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
LOOP="$HERE/../loop.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
# assert_contains <substring> <desc> <command...>
assert_contains() {
  sub=$1; desc=$2; shift 2
  out=$("$@" 2>&1 || true)
  case "$out" in *"$sub"*) ok "$desc" ;; *) no "$desc (missing '$sub' in: $out)" ;; esac
}
newstate() { d=$(mktemp -d); printf '%s/loop-state' "$d"; }

test_start_status() {
  st=$(newstate)
  sh "$LOOP" start US-9.9 --tier 1 --state "$st" >/dev/null
  # state file well-formed
  grep -q '^story=US-9.9$' "$st" && ok "start: writes story" || no "start: writes story"
  grep -q '^tier=1$' "$st" && ok "start: writes tier" || no "start: writes tier"
  grep -q '^stage=frame$' "$st" && ok "start: stage=frame" || no "start: stage=frame"
  grep -q '^entered=frame$' "$st" && ok "start: entered=frame" || no "start: entered=frame"
  assert_contains "story:   US-9.9" "status: shows story" sh "$LOOP" status --state "$st"
  assert_contains "stage:   frame" "status: shows stage" sh "$LOOP" status --state "$st"
  assert_contains "next:    enter execute" "status: next is execute" sh "$LOOP" status --state "$st"
  rm -rf "$(dirname "$st")"
}
test_start_status

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
