#!/bin/sh
# Self-contained POSIX test for checks/changelog-anchor.sh.
#
# The check is eight lines, which is exactly why it went untested: it looks too
# small to be wrong. Its two real behaviours are invisible at that size — the
# docs/-over-root *precedence*, and the fact that a repo with no CHANGELOG at all
# must FAIL rather than skip. A check that skips when its subject is missing is
# the failure mode LESSONS §16 names: silence that reads like a pass.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../changelog-anchor.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
assert_exit() { # <expected> <desc> <dir>
  exp=$1; desc=$2; d=$3
  if ( cd "$d" && sh "$CHECK" >/dev/null 2>&1 ); then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}

# 1. no CHANGELOG anywhere → fail (absence is a finding, not a skip)
d=$(mktemp -d)
assert_exit 1 "no CHANGELOG at all fails" "$d"
rm -rf "$d"

# 2. docs/CHANGELOG.md with the anchor → pass
d=$(mktemp -d); mkdir -p "$d/docs"
printf '# Changelog\n\n## [Unreleased]\n' > "$d/docs/CHANGELOG.md"
assert_exit 0 "docs/CHANGELOG.md with anchor passes" "$d"
rm -rf "$d"

# 3. docs/CHANGELOG.md without the anchor → fail
d=$(mktemp -d); mkdir -p "$d/docs"
printf '# Changelog\n\n## [0.1.0]\n' > "$d/docs/CHANGELOG.md"
assert_exit 1 "docs/CHANGELOG.md without anchor fails" "$d"
rm -rf "$d"

# 4. root CHANGELOG.md is the documented fallback when docs/ has none
d=$(mktemp -d)
printf '# Changelog\n\n## [Unreleased]\n' > "$d/CHANGELOG.md"
assert_exit 0 "root CHANGELOG.md fallback passes" "$d"
rm -rf "$d"

# 5. PRECEDENCE — docs/ wins even when the root copy would pass.
#    This is the assertion the check's size hides: a repo mid-migration (D10 moved
#    CHANGELOG.md root → docs/) can hold both, and reading the wrong one certifies
#    a stale file.
d=$(mktemp -d); mkdir -p "$d/docs"
printf '# Changelog\n\n## [0.1.0]\n'      > "$d/docs/CHANGELOG.md"   # no anchor
printf '# Changelog\n\n## [Unreleased]\n' > "$d/CHANGELOG.md"        # anchor
assert_exit 1 "docs/ takes precedence over root (root anchor does not rescue)" "$d"
rm -rf "$d"

# 6. …and the mirror image, so #5 cannot pass for the wrong reason
d=$(mktemp -d); mkdir -p "$d/docs"
printf '# Changelog\n\n## [Unreleased]\n' > "$d/docs/CHANGELOG.md"
printf '# Changelog\n\n## [0.1.0]\n'      > "$d/CHANGELOG.md"
assert_exit 0 "docs/ anchor passes despite an anchorless root copy" "$d"
rm -rf "$d"

# 7. the anchor is matched as a literal bracketed token, not as the bare word
d=$(mktemp -d); mkdir -p "$d/docs"
printf '# Changelog\n\nNothing is Unreleased yet.\n' > "$d/docs/CHANGELOG.md"
assert_exit 1 "the bare word 'Unreleased' is not the anchor" "$d"
rm -rf "$d"

# 8. an empty CHANGELOG file exists but carries nothing → fail
d=$(mktemp -d); mkdir -p "$d/docs"
: > "$d/docs/CHANGELOG.md"
assert_exit 1 "empty CHANGELOG fails" "$d"
rm -rf "$d"

# --- the index is the subject, not the worktree (principle 3) ---
# Both directions are real at release-commit and neither is exotic: anyone with WIP has
# a dirty worktree. The old check read the file on disk and got both backwards.
newrepo() { d=$(mktemp -d); ( cd "$d" && git init -q && git config user.email t@t && git config user.name t ); printf '%s' "$d"; }

# 9. anchor exists ONLY as an unstaged edit -> must FAIL (it would ship without it)
d=$(newrepo); mkdir -p "$d/docs"
printf '# Changelog\n\n## [0.1.0]\n' > "$d/docs/CHANGELOG.md"
( cd "$d" && git add -A && git commit -qm seed )
printf '# Changelog\n\n## [Unreleased]\n' > "$d/docs/CHANGELOG.md"   # written, NOT staged
assert_exit 1 "anchor present only in the dirty worktree fails" "$d"
rm -rf "$d"

# 10. anchor STAGED while the worktree copy lost it -> must PASS (the staged fix ships)
d=$(newrepo); mkdir -p "$d/docs"
printf '# Changelog\n\n## [Unreleased]\n' > "$d/docs/CHANGELOG.md"
( cd "$d" && git add -A )
printf '# Changelog\n\n## [0.1.0]\n' > "$d/docs/CHANGELOG.md"        # worktree regressed
assert_exit 0 "staged anchor passes despite a regressed worktree copy" "$d"
rm -rf "$d"

# 11. outside a git repo the worktree is the only truth available -> graceful fallback
d=$(mktemp -d); mkdir -p "$d/docs"
printf '# Changelog\n\n## [Unreleased]\n' > "$d/docs/CHANGELOG.md"
assert_exit 0 "falls back to the worktree outside a git repo" "$d"
rm -rf "$d"

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
