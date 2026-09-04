#!/bin/sh
# Self-contained POSIX test for checks/story-status-consistency.sh.
#
# The check answers one question — "does any story claim `done` while an AC box is
# still empty?" — and it answers it with a regex carrying two deliberate
# tolerances that nothing pinned: emphasis markers around the field
# (`**status**: done`, written by hand and by more than one doc tool), and a
# trailing-context guard so `done-ish` is not read as `done`. An untested
# tolerance is indistinguishable from an accident.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../story-status-consistency.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
assert_exit() { # <expected> <desc> <dir>
  exp=$1; desc=$2; d=$3
  if ( cd "$d" && sh "$CHECK" >/dev/null 2>&1 ); then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
scaffold() { d=$(mktemp -d); mkdir -p "$d/docs/sprints/stories"; printf '%s' "$d"; }
story() { # story <dir> <name> <status-line> <ac-line>
  cat > "$1/docs/sprints/stories/$2" <<EOF
---
id: US-9.1
$3
---
## Acceptance criteria

$4
EOF
}

# 1. no stories directory → skip-pass (the check is opt-in on repo shape)
d=$(mktemp -d); assert_exit 0 "missing stories dir skips" "$d"; rm -rf "$d"

# 2. empty stories directory → pass (the unmatched glob must not crash under set -eu)
d=$(scaffold); assert_exit 0 "empty stories dir passes" "$d"; rm -rf "$d"

# 3. done + every box ticked → pass
d=$(scaffold); story "$d" US-9.1-a.md 'status: done' '- [x] AC-1'
assert_exit 0 "done with all AC checked passes" "$d"; rm -rf "$d"

# 4. done + an empty box → WARN-level failure (the class the check exists for)
d=$(scaffold); story "$d" US-9.1-a.md 'status: done' '- [ ] AC-1'
assert_exit 1 "done with an unchecked AC fails" "$d"; rm -rf "$d"

# 5. not done + an empty box → pass. An in-progress story is SUPPOSED to have
#    open boxes; flagging it would make the check noise and get it disabled.
d=$(scaffold); story "$d" US-9.1-a.md 'status: in-progress' '- [ ] AC-1'
assert_exit 0 "in-progress with an unchecked AC passes" "$d"; rm -rf "$d"

# 6. emphasis around the field is tolerated on purpose
d=$(scaffold); story "$d" US-9.1-a.md '**status**: done' '- [ ] AC-1'
assert_exit 1 "bold '**status**: done' is still done" "$d"; rm -rf "$d"

# 7. …and case is not significant
d=$(scaffold); story "$d" US-9.1-a.md 'Status: DONE' '- [ ] AC-1'
assert_exit 1 "'Status: DONE' is still done" "$d"; rm -rf "$d"

# 8. the trailing-context guard: a longer word starting with `done` is not `done`
d=$(scaffold); story "$d" US-9.1-a.md 'status: doneish' '- [ ] AC-1'
assert_exit 0 "'doneish' does not match done" "$d"; rm -rf "$d"

# 9. one bad story among good ones is still caught (the loop does not stop at the
#    first pass, and `set -eu` does not abort it at the first non-match)
d=$(scaffold)
story "$d" US-9.1-a.md 'status: done' '- [x] AC-1'
story "$d" US-9.2-b.md 'status: done' '- [ ] AC-1'
story "$d" US-9.3-c.md 'status: backlog' '- [ ] AC-1'
assert_exit 1 "a single bad story among good ones fails" "$d"
out=$( cd "$d" && sh "$CHECK" 2>&1 || true )
printf '%s\n' "$out" | grep -q 'US-9.2-b.md' \
  && ok "the message names the offending file" || no "the message names the offending file"
printf '%s\n' "$out" | grep -q 'US-9.1-a.md' \
  && no "the message wrongly names a clean file" || ok "the message does not name clean files"
rm -rf "$d"

# 10. an unchecked box that is not an AC line (nested/indented) is not the
#     pattern the check claims — only top-level `- [ ]` counts.
d=$(scaffold); story "$d" US-9.1-a.md 'status: done' '  - [ ] a nested note'
assert_exit 0 "indented unchecked box is not a top-level AC" "$d"; rm -rf "$d"

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
