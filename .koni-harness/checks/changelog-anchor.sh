#!/bin/sh
# Require a CHANGELOG with an [Unreleased] anchor (koni-docs RULE-1 surface).
set -eu
cl=docs/CHANGELOG.md
[ -f "$cl" ] || cl=CHANGELOG.md
[ -f "$cl" ] || { echo "changelog-anchor: no CHANGELOG.md found"; exit 1; }
grep -q '\[Unreleased\]' "$cl" || { echo "changelog-anchor: missing '## [Unreleased]' anchor in $cl"; exit 1; }
exit 0
