#!/bin/sh
# story-lint — every US story's frontmatter is COMPLETE and TRUE at write time.
# Born from a real audit (Koni-Skills CONTEXT D32): 8 stories shipped without the
# mandatory points: field and 12 were filed into a sprint that had already ended.
# A field filled wrong is worse than a field left visibly empty — so this is a gate.
#
# Per story file under docs/sprints/stories/US-*.md:
#   1. mandatory keys present: id, title, epic, status, priority, points, sprint,
#      assignee, commit, created, updated (+ version_shipped when status: done)
#   2. points is a positive integer (Fibonacci for a single-round story; a
#      consolidated story carries the SUM of its rounds)
#   3. id matches the filename prefix
#   4. the referenced sprint file exists, and its end date is not BEFORE the
#      story's created date (the D32 bug: filing new work into a closed sprint)
#   5. status: done ⇒ commit is a real ref — `pending` tolerated only while
#      updated == today (the same-day backfill window)
#   6. stories created on/after 2026-07-04 (the D35 adoption date) carry a
#      "Lessons applied:" line — evidence the repo's LESSONS.md was READ at
#      Frame (cited sections or an explicit "none — <why>"), not skimmed
set -eu
dir=docs/sprints/stories
[ -d "$dir" ] || exit 0
today=$(date +%Y-%m-%d)
rc=0
fail() { echo "story-lint: $1"; rc=1; }

for f in "$dir"/US-*.md; do
  [ -e "$f" ] || continue
  # frontmatter = lines between the first two --- fences
  fm=$(awk '/^---[[:space:]]*$/{n++; next} n==1{print} n>=2{exit}' "$f")

  # strip surrounding quotes + trailing space/CR — a quoted sprint: or a status
  # with a trailing blank must not silently skip or false-fail a check
  get() { printf '%s\n' "$fm" | awk -F': *' -v k="$1" '$1==k{sub(/^[^:]*: */,""); gsub(/\r/,""); sub(/[[:space:]]+$/,""); gsub(/^"|"$/,""); print; exit}'; }

  for key in id title epic status priority points sprint assignee commit created updated; do
    printf '%s\n' "$fm" | grep -Eq "^${key}:" || fail "$f: missing mandatory field '${key}:'"
  done

  status=$(get status); points=$(get points); id=$(get id)
  sprint=$(get sprint); created=$(get created); updated=$(get updated); commit=$(get commit)

  case "$points" in
    ''|*[!0-9]*) [ -z "$points" ] || fail "$f: points must be a positive integer (got '$points')" ;;
    0) fail "$f: points must be >= 1" ;;
  esac

  base=$(basename "$f")
  case "$base" in
    "$id"-*) : ;;
    *) [ -z "$id" ] || fail "$f: id '$id' does not match filename prefix" ;;
  esac

  if [ -n "$sprint" ]; then
    sf="docs/sprints/${sprint}.md"
    if [ ! -f "$sf" ]; then
      fail "$f: sprint '$sprint' has no file at $sf"
    elif [ -n "$created" ]; then
      send=$(awk -F': *' '$1=="end"{print substr($2,1,10); exit}' "$sf")
      if [ -n "$send" ] && [ "$send" \< "$created" ]; then
        fail "$f: created $created but sprint '$sprint' ended $send — open the next sprint file (LESSONS §12)"
      fi
    fi
  fi

  # rule 6 — read-evidence (date-gated: applies to stories born after the rule)
  if [ -n "$created" ] && [ ! "$created" \< "2026-07-04" ]; then
    grep -Eq '^[[:space:]>*-]*\**Lessons applied\**:' "$f" ||
      fail "$f: created $created but no 'Lessons applied:' line — cite the LESSONS.md sections read at Frame (or 'none — <why>'); D35"
  fi

  if [ "$status" = done ]; then
    printf '%s\n' "$fm" | grep -Eq '^version_shipped:' || fail "$f: status done but no version_shipped"
    if [ "$commit" = pending ] && [ "$updated" != "$today" ]; then
      fail "$f: status done with commit: pending beyond the same-day backfill window (updated: $updated)"
    fi
  fi
done
exit "$rc"
