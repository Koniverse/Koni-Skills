#!/bin/sh
# Self-contained POSIX test for checks/story-lint.sh — freezes the D32 failure
# classes: missing points, story filed into an ended sprint, stale pending commit.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../checks/story-lint.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
assert_exit() {
  exp=$1; desc=$2; d=$3
  if ( cd "$d" && sh "$CHECK" >/dev/null 2>&1 ); then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
scaffold() {
  d=$(mktemp -d); mkdir -p "$d/docs/sprints/stories"
  cat > "$d/docs/sprints/sprint-2026-W27.md" <<'EOF'
---
id: sprint-2026-W27
status: in-progress
start: 2026-06-29T00:00:00.000Z
end: 2026-07-05T00:00:00.000Z
---
EOF
  cat > "$d/docs/sprints/sprint-2026-W26.md" <<'EOF'
---
id: sprint-2026-W26
status: closed
start: 2026-06-22T00:00:00.000Z
end: 2026-06-28T00:00:00.000Z
---
EOF
  printf '%s' "$d"
}
story() { # story <dir> <file> <extra-frontmatter-lines...> — writes a COMPLETE story then overrides
  cat > "$1/docs/sprints/stories/$2" <<EOF
---
id: ${3:-US-9.1}
title: "t"
epic: EPIC-9
status: ${4:-done}
priority: P1
points: ${5:-3}
sprint: ${6:-sprint-2026-W27}
assignee: t
commit: ${7:-abc1234}
version_shipped: "9.9.9"
created: ${8:-2026-07-01}
updated: ${9:-2026-07-01}
---
EOF
}

# 1. empty stories dir → pass (skip)
d=$(mktemp -d); assert_exit 0 "no stories dir skips" "$d"

# 2. complete story → pass
d=$(scaffold); story "$d" US-9.1-good.md; assert_exit 0 "complete story passes" "$d"

# 3. missing points → fail (the D32 class)
d=$(scaffold); story "$d" US-9.1-good.md
sed -i '' '/^points:/d' "$d/docs/sprints/stories/US-9.1-good.md" 2>/dev/null || sed -i '/^points:/d' "$d/docs/sprints/stories/US-9.1-good.md"
assert_exit 1 "missing points fails" "$d"

# 4. story created AFTER its sprint ended → fail (the D32 class)
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W26 abc1234 2026-07-03 2026-07-03
assert_exit 1 "created after sprint end fails" "$d"

# 5. created inside the sprint window → pass
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W26 abc1234 2026-06-27 2026-06-27
assert_exit 0 "created inside window passes" "$d"

# 6. sprint file absent → fail
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W99
assert_exit 1 "nonexistent sprint fails" "$d"

# 7. done + commit pending + updated today → pass (same-day backfill window)
d=$(scaffold); today=$(date +%Y-%m-%d)
story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W27 pending 2026-07-01 "$today"
assert_exit 0 "same-day pending tolerated" "$d"

# 8. done + commit pending + updated yesterday → fail
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W27 pending 2026-07-01 2026-07-01
assert_exit 1 "stale pending fails" "$d"

# 9. non-integer points → fail
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done TBD
assert_exit 1 "non-integer points fails" "$d"

# 10. id/filename mismatch → fail
d=$(scaffold); story "$d" US-9.2-wrong.md US-9.1
assert_exit 1 "id vs filename mismatch fails" "$d"

# 11. quoted sprint + trailing-space status → pass (get() strips quotes/space)
d=$(scaffold)
cat > "$d/docs/sprints/stories/US-9.7-quoted.md" <<'EOF'
---
id: US-9.7
title: "t"
epic: EPIC-9
status: done 
priority: P1
points: 3
sprint: "sprint-2026-W27"
assignee: t
commit: abc1234
version_shipped: "9.9.9"
created: 2026-07-01
updated: 2026-07-01
---
EOF
assert_exit 0 "quoted sprint + trailing-space status pass after stripping" "$d"

# 12. trailing-space "done " must still ENFORCE the done-branch (stale pending fails) —
# pre-fix, the unstripped status silently skipped every done check
d=$(scaffold)
cat > "$d/docs/sprints/stories/US-9.7-quoted.md" <<'EOF'
---
id: US-9.7
title: "t"
epic: EPIC-9
status: done 
priority: P1
points: 3
sprint: "sprint-2026-W27"
assignee: t
commit: pending
version_shipped: "9.9.9"
created: 2026-07-01
updated: 2026-07-01
---
EOF
assert_exit 1 "trailing-space done still enforces stale pending" "$d"

# 13. quoted sprint pointing at a MISSING file still fails (quotes must not mask lookup)
d=$(scaffold)
cat > "$d/docs/sprints/stories/US-9.8-missing.md" <<'EOF'
---
id: US-9.8
title: "t"
epic: EPIC-9
status: in-progress
priority: P1
points: 2
sprint: "sprint-2026-W98"
assignee: t
commit: pending
created: 2026-07-01
updated: 2026-07-01
---
EOF
assert_exit 1 "quoted missing sprint fails" "$d"

# 14. story created ON/AFTER 2026-07-04 without a "Lessons applied:" line → fail (D35)
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W27 abc1234 2026-07-04 2026-07-04
assert_exit 1 "new story without Lessons-applied fails" "$d"

# 15. same story WITH the line → pass
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W27 abc1234 2026-07-04 2026-07-04
printf '\n**Lessons applied**: §9, §12 — POSIX iteration + honest fields.\n' >> "$d/docs/sprints/stories/US-9.1-good.md"
assert_exit 0 "new story with Lessons-applied passes" "$d"

# 16. story created BEFORE the adoption date needs no line (no retro-fail)
d=$(scaffold); story "$d" US-9.1-good.md US-9.1 done 3 sprint-2026-W27 abc1234 2026-07-01 2026-07-01
assert_exit 0 "pre-adoption story exempt from Lessons-applied" "$d"

echo
echo "story-lint-test: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
