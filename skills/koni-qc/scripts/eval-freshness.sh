#!/bin/sh
# Assert no skill has been edited since its behavioural evals were last run.
#
# CI has no agent, so CI cannot run an eval. Claiming otherwise would produce the exact
# thing this catalog keeps rediscovering: a check that cannot fail. What a runner-less CI
# *can* assert is freshness — and that is a real claim, because the failure being guarded
# is "the skill changed and nobody re-checked its behaviour".
#
#   skill edited  ->  every Runs table for that skill is stale  ->  red
#
# Method: skills/koni-qc/references/eval-gate.md §5.
# Usage: sh skills/koni-qc/scripts/eval-freshness.sh [--list]
set -eu

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "eval-freshness: not a git repo, skipping"; exit 0; }
cd "$ROOT"
[ -d skills ] || { echo "eval-freshness: no skills/ directory, skipping"; exit 0; }

# A floor, for the same reason every other corpus here carries one: "0 skills with evals,
# 0 stale" and "everything is fresh" have the same exit code. Deleting an evals/ directory
# must fail rather than quietly reduce the scope of the check.
MIN_SUITES=1

LIST=${1:-}
rc=0
suites=0

for evaldir in skills/*/evals; do
  [ -d "$evaldir" ] || continue
  skill=$(dirname "$evaldir")
  suites=$((suites + 1))

  # When the skill last changed — EXCLUDING its own evals/, or filling a Runs table would
  # itself re-stale the suite it just refreshed, and the check could never go green.
  skill_epoch=$(git log -1 --format=%ct -- "$skill" ":(exclude)$evaldir" 2>/dev/null || true)
  [ -n "$skill_epoch" ] || { echo "eval-freshness: $skill has no commit history, skipping"; continue; }

  # The newest run recorded anywhere in the suite. Runs tables are markdown rows whose
  # first cell is an ISO date; anything else (the empty template row, the header, the
  # separator) yields nothing and is ignored.
  newest=$(grep -ho '^| *[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} *|' "$evaldir"/*.md 2>/dev/null \
           | tr -d '| ' | sort | tail -n1 || true)

  if [ -z "$newest" ]; then
    echo "eval-freshness: $skill — NO RUNS RECORDED. A scenario with an empty Runs table is"
    echo "                a specification, not a test; it has discriminated nothing."
    rc=1
    continue
  fi

  # Compare dates, not timestamps: a run recorded on the same day as the edit is accepted.
  # Runs are recorded by hand to a day's precision, so demanding a later *instant* would
  # fail every same-day re-run — which is the normal case when a fix and its re-run ship
  # together.
  skill_date=$(git log -1 --format=%cs -- "$skill" ":(exclude)$evaldir" 2>/dev/null || true)
  [ -n "$skill_date" ] || skill_date=$(date -u -r "$skill_epoch" +%Y-%m-%d 2>/dev/null || echo 1970-01-01)

  if [ "$newest" \< "$skill_date" ]; then
    echo "eval-freshness: $skill — STALE. Last edited $skill_date, evals last run $newest."
    echo "                Re-run the suite (eval-gate.md §3) and record the results."
    rc=1
  elif [ -n "$LIST" ]; then
    echo "fresh    $skill  (edited $skill_date, evals run $newest)"
  fi
done

if [ "$suites" -lt "$MIN_SUITES" ]; then
  echo "eval-freshness: found $suites eval suite(s), floor is $MIN_SUITES — a suite went missing"
  rc=1
fi

[ "$rc" -eq 0 ] && [ -z "$LIST" ] && echo "eval-freshness: $suites suite(s), all fresh"
exit "$rc"
