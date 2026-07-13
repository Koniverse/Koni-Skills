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
[ -f "$CHECKER" ] || { echo "skill-references: no checker at $CHECKER, skipping"; exit 0; }
command -v python3 >/dev/null 2>&1 || { echo "skill-references: python3 not found, skipping"; exit 0; }

# Only the skills touched by this commit — a clean skill stays out of the way.
touched=$(git diff --cached --name-only | awk -F/ '$1=="skills" && NF>1 {print $2}' | sort -u)
[ -n "$touched" ] || exit 0

rc=0
for skill in $touched; do
  [ -d "skills/$skill" ] || continue
  python3 "$CHECKER" "skills/$skill" >/tmp/skillrefs.$$ 2>&1 || rc=1
  grep -v '^0 dangling' /tmp/skillrefs.$$ | grep -v '^$' || true
done
rm -f /tmp/skillrefs.$$
[ "$rc" -eq 0 ] || echo "skill-references: fix the dangling references above"
exit "$rc"
