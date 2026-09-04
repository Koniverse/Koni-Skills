#!/bin/sh
# Warn if any story file has status: done but an unchecked acceptance-criteria box.
set -eu
dir=docs/sprints/stories
[ -d "$dir" ] || exit 0
rc=0
for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  # Emphasis may sit on either side of the colon: `status: done`, `**status:** done`,
  # and `**status**: done` are all the same claim. The colon-before-emphasis form was
  # the only one this pattern could not read, so the most common bold spelling in a
  # hand-written story body passed silently — a false negative, which for a guard is
  # the expensive direction (LESSONS §20: an untested tolerance is not a tolerance).
  grep -Eiq '^[*_ ]*status[*_ ]*:?[*_ ]*[[:space:]]*done([^a-z]|$)' "$f" || continue
  if grep -q '^- \[ \]' "$f"; then
    echo "story-status: $f is done but has unchecked AC/tasks"
    rc=1
  fi
done
exit "$rc"
