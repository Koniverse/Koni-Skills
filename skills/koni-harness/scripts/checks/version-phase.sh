#!/bin/sh
# Block a VERSION bump that lacks a matching CHANGELOG section in the same staged commit.
set -eu
staged=$(git diff --cached --name-only 2>/dev/null || true)
printf '%s\n' "$staged" | grep -qx 'VERSION' || exit 0   # work commit, fine
newver=$(git show :VERSION 2>/dev/null | tr -d '[:space:]' || true)
[ -n "$newver" ] || { echo "version-phase: VERSION staged but empty"; exit 1; }
printf '%s\n' "$staged" | grep -qE '(^|/)CHANGELOG\.md$' || {
  echo "version-phase: VERSION bumped to $newver but no CHANGELOG.md staged"; exit 1; }
for f in docs/CHANGELOG.md CHANGELOG.md; do
  git show ":$f" 2>/dev/null | grep -Fq "[$newver]" && exit 0
done
echo "version-phase: staged CHANGELOG has no '[$newver]' entry"
exit 1
