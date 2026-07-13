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
[ -f "$CHECKER" ] || { echo "skill-references: no checker at $CHECKER, skipping"; exit 0; }
command -v python3 >/dev/null 2>&1 || { echo "skill-references: python3 not found, skipping"; exit 0; }

# The guard is only trusted because its own planted-defect suite passes. A checker
# that has quietly stopped catching things prints the same `0` as a clean corpus
# (LESSONS §19, §20) — so prove it can still speak before believing its silence.
if [ -f "$SELFTEST" ]; then
  python3 "$SELFTEST" >/dev/null 2>&1 || {
    echo "skill-references: the checker's OWN self-test fails — its green means nothing"
    python3 "$SELFTEST" || true
    exit 1
  }
fi

# Touch ANY skill and every skill is swept. Scanning only what the commit touched
# let a sibling sit red indefinitely while SKILL.md advertised the guard as
# covering "every link, anchor, section pointer, and named script". A guard with a
# blind spot it does not disclose is worse than no guard.
touched=$(git diff --cached --name-only | awk -F/ '$1=="skills" && NF>1 {print $2}' | sort -u)
[ -n "$touched" ] || exit 0

rc=0
for skill in $(ls skills); do
  [ -d "skills/$skill" ] || continue
  python3 "$CHECKER" "skills/$skill" >/tmp/skillrefs.$$ 2>&1 || rc=1
  grep -v '^0 dangling' /tmp/skillrefs.$$ | grep -v '^$' || true
done
rm -f /tmp/skillrefs.$$
[ "$rc" -eq 0 ] || echo "skill-references: fix the dangling references above"
exit "$rc"
