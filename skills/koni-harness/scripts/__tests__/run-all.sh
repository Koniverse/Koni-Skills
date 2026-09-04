#!/bin/sh
# koni-harness guard evaluator — run every self-test, then prove the set is complete.
#
# Usage: sh skills/koni-harness/scripts/__tests__/run-all.sh [--list]
#
# Two jobs, and the second is the one that did not exist before.
#
#   1. RUN every suite under scripts/__tests__/ and scripts/checks/__tests__/.
#      There was no single command for this; each suite was run by hand, which
#      means "all green" was a claim nobody could reproduce and CI could not make.
#
#   2. PROVE the suite set covers the shipped gate. Coverage is derived from
#      `gates.conf` — the machine, not a memory. Every row names a check script;
#      a check whose script name appears in no suite is an unpinned guard, and
#      this evaluator fails naming it. That is the whole point: adding a row to
#      gates.conf without a test is now a red build instead of a quiet gap.
#
# The precedent is koni-docs' `test-coverage.py`, which made branch coverage of
# check-references.py a gate after three rounds of hand-written fixture lists
# failed to move the hole rate. Same lesson, one layer out: a corpus written from
# memory lags the code it claims to cover, because the same memory writes both.
set -eu

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SCRIPTS=$(CDPATH= cd -- "$HERE/.." && pwd)
CONF="$SCRIPTS/gates.conf"
SUITE_DIRS="$SCRIPTS/__tests__ $SCRIPTS/checks/__tests__"

# Floors. Emptying a corpus used to read as passing it — "0 suites, 0 failures",
# exit 0. These are the bottom turtle: without them every assertion below is an
# elaborate way to print 0. Raise them when the real number rises; never lower
# one to make a red build green.
MIN_SUITES=12
MIN_CHECKS=8

list_suites() {
  # No `for f in $var` — that word-splits differently under zsh (LESSONS §9).
  find $SUITE_DIRS -name '*-test.sh' -o -name 'test-*.sh' 2>/dev/null \
    | grep -v '/run-all\.sh$' | sort
}

if [ "${1:-}" = "--list" ]; then list_suites; exit 0; fi

# The suites predate this runner and report in three dialects: `PASS=n FAIL=n`,
# `<name>: n passed, m failed`, and version-phase's bare `all cases passed`.
# Counting the per-assertion lines works across all three and needs no churn in
# nine existing files — and an assertion count of 0 is itself a useful signal.
assertions_in() { grep -cE '^[[:space:]]*(ok[[:space:]]|✓ )' "$1" || true; }

tmp=$(mktemp); list=$(mktemp)
trap 'rm -f "$tmp" "$list"' EXIT INT TERM

# ---------------------------------------------------------------- 1. run them
list_suites > "$list"
RAN=0; FAILED=0
# Redirect, never pipe: a piped `while` runs in a subshell and loses the counters.
while IFS= read -r suite; do
  [ -n "$suite" ] || continue
  RAN=$((RAN + 1))
  rel=${suite#"$SCRIPTS"/}
  if sh "$suite" > "$tmp" 2>&1; then
    printf 'PASS  %s  (%s assertions)\n' "$rel" "$(assertions_in "$tmp")"
  else
    FAILED=$((FAILED + 1))
    printf 'FAIL  %s\n' "$rel"
    sed 's/^/      | /' "$tmp"
  fi
done < "$list"

if [ "$RAN" -lt "$MIN_SUITES" ]; then
  printf 'EVALUATOR: found %s suites, floor is %s — suites went missing\n' "$RAN" "$MIN_SUITES"
  FAILED=$((FAILED + 1))
fi

# ------------------------------------------------- 2. coverage, from gates.conf
echo "----"
if [ ! -s "$CONF" ]; then
  echo "EVALUATOR: $CONF is missing or empty — coverage cannot be derived"
  exit 1
fi

CHECKS=0; UNCOVERED=0
while IFS= read -r line; do
  case "$line" in '' | \#*) continue ;; esac
  name=$(printf '%s\n'   "$line" | awk -F'|' '{gsub(/^[ \t]+|[ \t]+$/, "", $1); print $1}')
  script=$(printf '%s\n' "$line" | awk -F'|' '{gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2}')
  base=${script##*/}
  [ -n "$base" ] || continue
  CHECKS=$((CHECKS + 1))
  if grep -rlF -- "$base" $SUITE_DIRS >/dev/null 2>&1; then
    printf 'COVERED    %-22s %s\n' "$name" "$base"
  else
    printf 'UNCOVERED  %-22s %s  <-- no suite references this check\n' "$name" "$base"
    UNCOVERED=$((UNCOVERED + 1))
  fi
done < "$CONF"

if [ "$CHECKS" -lt "$MIN_CHECKS" ]; then
  printf 'EVALUATOR: gates.conf declares %s checks, floor is %s — rows went missing\n' \
    "$CHECKS" "$MIN_CHECKS"
  UNCOVERED=$((UNCOVERED + 1))
fi

echo "----"
printf 'suites: %s run, %s failed | checks: %s declared, %s uncovered\n' \
  "$RAN" "$FAILED" "$CHECKS" "$UNCOVERED"

# Coverage is scoped to the SHIPPED gates.conf on purpose. A consumer repo's
# vendored config may carry local rows (this monorepo's own adds `skill-references`
# and a repo-specific `tests` command) — demanding a shipped self-test for a
# repo-local check would be a rule the harness has no standing to make.
[ "$FAILED" -eq 0 ] && [ "$UNCOVERED" -eq 0 ]
