#!/bin/sh
# Self-contained POSIX test for checks/lesson-capture.sh — freezes the D35 rule:
# a task-bearing release commit must stage a LESSONS.md change or an explicit
# "Lessons: none new — <reason>" verdict; docs-only commits are exempt.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../checks/lesson-capture.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
assert_exit() {
  exp=$1; desc=$2; d=$3
  if ( cd "$d" && sh "$CHECK" >/dev/null 2>&1 ); then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
repo() { # fresh git repo with an initial commit
  d=$(mktemp -d); (
    cd "$d"; git init -q; git config user.email t@t; git config user.name t
    mkdir -p docs skills/x
    echo start > README.md; git add -A; git commit -qm init
  ) >/dev/null 2>&1; printf '%s' "$d"
}

# 1. not a git repo → pass
d=$(mktemp -d); assert_exit 0 "non-git dir passes" "$d"

# 2. git repo, nothing staged → pass
d=$(repo); assert_exit 0 "nothing staged passes" "$d"

# 3. docs-only staged → exempt, pass
d=$(repo); ( cd "$d"; echo note > docs/CONTEXT.md; git add docs/CONTEXT.md ) >/dev/null
assert_exit 0 "docs-only commit exempt" "$d"

# 4. code staged + LESSONS.md staged → pass (verdict a)
d=$(repo); ( cd "$d"; echo code > skills/x/a.sh; echo "## 1. x" > docs/LESSONS.md; git add -A ) >/dev/null
assert_exit 0 "code + staged LESSONS.md passes" "$d"

# 5. code staged + staged story carrying the no-lesson verdict → pass (verdict b)
d=$(repo); ( cd "$d"; echo code > skills/x/a.sh
  printf 'notes\n\nLessons: none new — mechanical rename, nothing reusable\n' > docs/story.md
  git add -A ) >/dev/null
assert_exit 0 "code + staged 'none new' verdict passes" "$d"

# 6. code staged, no verdict anywhere → FAIL
d=$(repo); ( cd "$d"; echo code > skills/x/a.sh; git add -A ) >/dev/null
assert_exit 1 "code with no verdict fails" "$d"

# 7. verdict only in an UNSTAGED file → FAIL (the verdict must ship with the commit)
d=$(repo); ( cd "$d"; echo code > skills/x/a.sh; git add skills/x/a.sh
  printf 'Lessons: none new — later\n' > docs/story.md ) >/dev/null
assert_exit 1 "unstaged verdict does not count" "$d"

# 8. verdict line without a reason (no em-dash) → FAIL (reason is mandatory)
d=$(repo); ( cd "$d"; echo code > skills/x/a.sh
  printf 'Lessons: none new\n' > docs/story.md; git add -A ) >/dev/null
assert_exit 1 "verdict without a reason fails" "$d"

# 9. a doc QUOTING the placeholder syntax at line start is not a verdict
d=$(repo); ( cd "$d"; echo code > skills/x/a.sh
  printf 'usage:\n  Lessons: none new — <reason>\n' > docs/guide.md; git add -A ) >/dev/null
assert_exit 1 "placeholder-form quote does not count as a verdict" "$d"

# 10. a PRE-EXISTING concrete verdict in a committed doc no longer counts —
# only lines ADDED by this commit are verdicts (the neutralized-gate class)
d=$(repo); ( cd "$d"
  printf 'history:\nLessons: none new — mechanical rename\n' > docs/old.md
  git add -A; git commit -qm seed
  echo code > skills/x/a.sh; echo tweak >> docs/old.md; git add -A ) >/dev/null 2>&1
assert_exit 1 "pre-existing verdict line does not count" "$d"

# 11. staged DELETION of LESSONS.md is not a verdict
d=$(repo); ( cd "$d"
  echo "## 1. x" > docs/LESSONS.md; git add -A; git commit -qm seed
  echo code > skills/x/a.sh; git rm -q docs/LESSONS.md; git add -A ) >/dev/null 2>&1
assert_exit 1 "deleting LESSONS.md is not a verdict" "$d"

# 12. docs-only commit with a SPACED filename stays exempt (no word-split false block)
d=$(repo); ( cd "$d"; printf 'note\n' > "docs/my note.md"; git add -A ) >/dev/null 2>&1
assert_exit 0 "spaced docs filename still exempt" "$d"

echo
echo "lesson-capture-test: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
