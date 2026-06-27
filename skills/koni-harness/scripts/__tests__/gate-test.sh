#!/bin/sh
# Self-contained POSIX test harness for koni-harness gates.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SCRIPTS=$(CDPATH= cd -- "$HERE/.." && pwd)
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); echo "ok   - $1"; }
no()   { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
# assert_exit <expected> <description> <command...>
assert_exit() {
  exp=$1; desc=$2; shift 2
  if "$@" >/dev/null 2>&1; then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
# new throwaway git repo, prints its path
newrepo() {
  d=$(mktemp -d)
  ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  printf '%s' "$d"
}

# ---- Task 1: runner dispatch ----
test_runner_dispatch() {
  d=$(newrepo)
  mkdir -p "$d/.koni-harness/checks"
  cp "$SCRIPTS/gate-runner.sh" "$d/.koni-harness/gate-runner.sh"
  # a check that always passes and one that always fails
  printf '#!/bin/sh\nexit 0\n' > "$d/.koni-harness/checks/pass.sh"
  printf '#!/bin/sh\nexit 1\n' > "$d/.koni-harness/checks/failer.sh"
  cat > "$d/.koni-harness/gates.conf" <<EOF
ok-check     | checks/pass.sh   | work-commit | block |
warn-check   | checks/failer.sh | work-commit | warn  |
EOF
  # only warn fails → runner exits 0
  assert_exit 0 "runner: warn-only failure does not block" \
    sh "$d/.koni-harness/gate-runner.sh" --phase work-commit --config "$d/.koni-harness/gates.conf"
  # now make it a block
  cat > "$d/.koni-harness/gates.conf" <<EOF
bad-check | checks/failer.sh | work-commit | block |
EOF
  assert_exit 1 "runner: block failure exits non-zero" \
    sh "$d/.koni-harness/gate-runner.sh" --phase work-commit --config "$d/.koni-harness/gates.conf"
  # phase filter: nothing runs for a non-matching phase → exit 0
  assert_exit 0 "runner: non-matching phase runs nothing" \
    sh "$d/.koni-harness/gate-runner.sh" --phase pre-push --config "$d/.koni-harness/gates.conf"
  rm -rf "$d"
}

test_runner_dispatch

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
