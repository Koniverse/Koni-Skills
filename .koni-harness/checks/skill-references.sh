#!/bin/sh
# Every link, anchor, §-pointer, and named script in a skill must resolve.
#
# Why this is a gate and not a habit: the class it catches is invisible to the
# author. A rewrite lands in the file where a rule is *defined* and not in the
# files where it is *read*; a moved section leaves its routers dangling; a
# BLOCKER rule cites a script that has never existed. Each of those shipped in
# this repo (LESSONS §18), and a hand-written audit certified 150 dead anchors
# as green because it shared its author's blind spot (LESSONS §19).
set -eu

CHECKER=skills/koni-docs/scripts/check-references.py
SELFTEST=skills/koni-docs/scripts/__tests__/test-check-references.py
MUTANTS=skills/koni-docs/scripts/__tests__/test-mutations.py

command -v python3 >/dev/null 2>&1 || { echo "skill-references: python3 not found, skipping"; exit 0; }

# Their ABSENCE is a hard failure, not a skip. A guard you can disarm by deleting a
# file is not a guard — and this check's whole thesis is that a silent guard and a
# broken one are indistinguishable (LESSONS §19, §20, §22).
for required in "$CHECKER" "$SELFTEST" "$MUTANTS"; do
  [ -f "$required" ] || {
    echo "skill-references: $required is missing — the guard cannot be trusted without it"
    exit 1
  }
done

# The checker is trusted only because its planted-defect suite passes, and the suite is
# trusted only because mutant checkers die against it. Prove both before believing a `0`.
python3 "$SELFTEST" >/dev/null 2>&1 || {
  echo "skill-references: the checker's OWN self-test fails — its green means nothing"
  python3 "$SELFTEST" || true
  exit 1
}
python3 "$MUTANTS" >/dev/null 2>&1 || {
  echo "skill-references: a mutant checker SURVIVED the self-test — the suite has a hole"
  python3 "$MUTANTS" || true
  exit 1
}

# Both suites enforce their own floor (MIN_CLASSES / MIN_MUTANTS), because emptying a
# corpus used to read as passing it: "0 planted defect classes all caught", rc=0. The
# floors are the bottom turtle — without them the whole tower is a way to print 0.

# Touch ANY skill and every skill is swept. Scanning only what the commit touched
# let a sibling sit red indefinitely while SKILL.md advertised the guard as
# covering "every link, anchor, section pointer, and named script". A guard with a
# blind spot it does not disclose is worse than no guard.
touched=$(git diff --cached --name-only | awk -F/ '$1=="skills" && NF>1 {print $2}' | sort -u)
[ -n "$touched" ] || exit 0

tmp=$(mktemp)
rc=0
for skill in $(ls skills); do
  [ -d "skills/$skill" ] || continue
  python3 "$CHECKER" "skills/$skill" >"$tmp" 2>&1 || rc=1
  grep -v '^0 dangling' "$tmp" | grep -v '^$' || true
done
rm -f "$tmp"
[ "$rc" -eq 0 ] || echo "skill-references: fix the dangling references above"
exit "$rc"
