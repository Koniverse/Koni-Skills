#!/bin/sh
# Self-contained POSIX test for checks/design-first.sh — freezes the D36 rule:
# staged UI code in a repo WITH a design contract requires an added
# "Design applied:" citation; no contract / no UI → exempt.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../checks/design-first.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
assert_exit() {
  exp=$1; desc=$2; d=$3
  if ( cd "$d" && sh "$CHECK" >/dev/null 2>&1 ); then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
repo() {
  d=$(mktemp -d); (
    cd "$d"; git init -q; git config user.email t@t; git config user.name t
    mkdir -p docs src/components
    echo start > README.md; git add -A; git commit -qm init
  ) >/dev/null 2>&1; printf '%s' "$d"
}

# 1. not a git repo → pass
d=$(mktemp -d); assert_exit 0 "non-git dir passes" "$d"

# 2. no UI files staged (server code) → pass
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; echo code > src/api.ts; git add -A ) >/dev/null
assert_exit 0 "non-UI code exempt" "$d"

# 3. UI staged but repo has NO design contract → pass (nothing to comply with)
d=$(repo); ( cd "$d"; echo ui > src/components/Card.tsx; git add -A ) >/dev/null
assert_exit 0 "no DESIGN.md exempt" "$d"

# 4. UI staged + DESIGN.md at repo root + no citation → FAIL
d=$(repo); ( cd "$d"; echo "# rules" > DESIGN.md; git add -A; git commit -qm seed
  echo ui > src/components/Card.tsx; git add -A ) >/dev/null 2>&1
assert_exit 1 "UI without Design-applied citation fails" "$d"

# 5. UI staged + docs/DESIGN.md + ADDED citation → pass
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; git add -A; git commit -qm seed
  echo ui > src/components/Card.tsx
  printf 'notes\n\nDesign applied: DESIGN.md tokens + shadcn Card; states enumerated\n' > docs/story.md
  git add -A ) >/dev/null 2>&1
assert_exit 0 "UI with added citation passes" "$d"

# 6. bold list-item citation form → pass
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; git add -A; git commit -qm seed
  echo ui > src/components/Card.tsx
  printf -- '- **Design applied**: tokens only; shadcn Dialog\n' > docs/story.md
  git add -A ) >/dev/null 2>&1
assert_exit 0 "bold list-item citation passes" "$d"

# 7. PRE-EXISTING citation in a committed doc does not count (added lines only)
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md
  printf 'Design applied: old round\n' > docs/story.md
  git add -A; git commit -qm seed
  echo ui > src/components/Card.tsx; echo tweak >> docs/story.md; git add -A ) >/dev/null 2>&1
assert_exit 1 "pre-existing citation does not count" "$d"

# 8. placeholder form quoting the syntax never counts
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; git add -A; git commit -qm seed
  echo ui > src/components/Card.tsx
  printf 'Design applied: <sections + primitives>\n' > docs/story.md
  git add -A ) >/dev/null 2>&1
assert_exit 1 "placeholder citation fails" "$d"

# 9. spaced UI filename still detected (no word-split miss)
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; git add -A; git commit -qm seed
  echo ui > "src/components/My Card.tsx"; git add -A ) >/dev/null 2>&1
assert_exit 1 "spaced UI filename still gated" "$d"

# 10. deletion-only UI commit is exempt (removing UI needs no design citation)
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; echo ui > src/components/Old.tsx
  git add -A; git commit -qm seed
  git rm -q src/components/Old.tsx ) >/dev/null 2>&1
assert_exit 0 "deletion-only UI commit exempt" "$d"

# 11. citation in an .mdx file counts
d=$(repo); ( cd "$d"; echo "# rules" > docs/DESIGN.md; git add -A; git commit -qm seed
  echo ui > src/components/Card.tsx
  printf 'Design applied: DESIGN.md tokens; shadcn Card\n' > docs/story.mdx
  git add -A ) >/dev/null 2>&1
assert_exit 0 "mdx citation counts" "$d"

echo
echo "design-first-test: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
