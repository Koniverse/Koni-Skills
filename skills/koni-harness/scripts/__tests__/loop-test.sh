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

test_enter() {
  st=$(newstate); sh "$LOOP" start US-9.9 --tier 2 --state "$st" >/dev/null
  # in-order enter is silent on stderr and updates stage
  err=$(sh "$LOOP" enter execute --state "$st" 2>&1 >/dev/null || true)
  [ -z "$err" ] && ok "enter: in-order is silent" || no "enter: in-order silent (got: $err)"
  grep -q '^stage=execute$' "$st" && ok "enter: updates stage" || no "enter: updates stage"
  case "$(kv=$(sed -n 's/^entered=//p' "$st"); echo "$kv")" in *execute*) ok "enter: appends entered" ;; *) no "enter: appends entered" ;; esac
  # backward enter warns
  err=$(sh "$LOOP" enter frame --state "$st" 2>&1 >/dev/null || true)
  case "$err" in *WARN*backward*) ok "enter: backward warns" ;; *) no "enter: backward warns (got: $err)" ;; esac
  # commit without self-verify at tier 2 warns
  st2=$(newstate); sh "$LOOP" start US-9.8 --tier 2 --state "$st2" >/dev/null
  sh "$LOOP" enter execute --state "$st2" >/dev/null
  err=$(sh "$LOOP" enter commit --state "$st2" 2>&1 >/dev/null || true)
  case "$err" in *WARN*self-verify*) ok "enter: commit-without-self-verify warns" ;; *) no "enter: commit warn (got: $err)" ;; esac
  # tier 0 commit without self-verify is silent
  st3=$(newstate); sh "$LOOP" start US-9.7 --tier 0 --state "$st3" >/dev/null
  sh "$LOOP" enter execute --state "$st3" >/dev/null
  err=$(sh "$LOOP" enter commit --state "$st3" 2>&1 >/dev/null || true)
  [ -z "$err" ] && ok "enter: tier0 commit silent" || no "enter: tier0 commit silent (got: $err)"
  rm -rf "$(dirname "$st")" "$(dirname "$st2")" "$(dirname "$st3")"
}
test_enter

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
