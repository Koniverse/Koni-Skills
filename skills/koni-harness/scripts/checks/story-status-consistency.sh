#!/bin/sh
# Warn if any story file has status: done but an unchecked acceptance-criteria box.
set -eu
dir=docs/sprints/stories
[ -d "$dir" ] || exit 0
rc=0
for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  grep -Eiq '^[*_ ]*status:?[*_ ]*[[:space:]]*done([^a-z]|$)' "$f" || continue
  if grep -q '^- \[ \]' "$f"; then
    echo "story-status: $f is done but has unchecked AC/tasks"
    rc=1
  fi
done
exit "$rc"
