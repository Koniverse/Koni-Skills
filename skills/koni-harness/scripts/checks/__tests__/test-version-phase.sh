#!/bin/sh
# Prove version-phase blocks a backwards VERSION — and still does its original job.
#
# The monotonicity rule was added after koni-tao-data lowered VERSION twice in one
# day with the gate passing both times: once from a stale branch merging over a
# newer release, once from a release commit that picked up another file's version.
# Neither was caught here; both were caught outside the repo, by git refusing a
# duplicate tag and then by a CI step comparing the tag to VERSION.
#
# Every case runs in a scratch repo under its own tempdir. No network, no side
# effects, no dependency on the repo this is checked out into.
set -eu

CHECK=$(CDPATH= cd "$(dirname "$0")/.." && pwd)/version-phase.sh
[ -f "$CHECK" ] || { echo "no check at $CHECK"; exit 2; }

fails=0
assert() { # want_rc  got_rc  label
  if [ "$1" -ne "$2" ]; then
    echo "  ✗ $3 — wanted exit $1, got $2"
    fails=$((fails + 1))
  else
    echo "  ✓ $3"
  fi
}

# repo <old-version> <new-version> [changelog-version]
# Builds a repo whose HEAD carries <old>, then stages <new> plus a CHANGELOG
# naming <changelog-version> (defaulting to <new>). Prints the tempdir.
repo() {
  d=$(mktemp -d)
  ( cd "$d"
    git init -q . && git config user.email t@t && git config user.name t
    if [ -n "$1" ]; then printf '%s\n' "$1" > VERSION; fi
    printf '# c\n\n## [%s]\n' "${1:-0.0.0}" > CHANGELOG.md
    git add -A && git commit -qm base
    printf '%s\n' "$2" > VERSION
    printf '# c\n\n## [%s]\n' "${3:-$2}" > CHANGELOG.md
    git add -A ) >/dev/null 2>&1
  printf '%s\n' "$d"
}

# `|| rc=$?` and not a bare call: `set -e` kills the script the moment the check
# exits non-zero, which is precisely the outcome half these cases assert.
run() {
  rc=0
  ( cd "$1" && sh "$CHECK" >/dev/null 2>&1 ) || rc=$?
  return 0
}

echo "version-phase:"

# --- the rule that was missing ---------------------------------------------
d=$(repo 0.51.0 0.45.0); run "$d"; assert 1 "$rc" "backwards 0.51.0 -> 0.45.0 blocks"; rm -rf "$d"
d=$(repo 0.49.1 0.49.0); run "$d"; assert 1 "$rc" "backwards 0.49.1 -> 0.49.0 blocks (the merge incident)"; rm -rf "$d"
d=$(repo 0.51.0 0.52.0); run "$d"; assert 0 "$rc" "forwards 0.51.0 -> 0.52.0 passes"; rm -rf "$d"

# Numeric, not lexical. Each direction alone is passed by the wrong
# implementation, so both are needed to pin it.
d=$(repo 0.9.0 0.10.0);  run "$d"; assert 0 "$rc" "0.9.0 -> 0.10.0 passes (lexical would block)"; rm -rf "$d"
d=$(repo 0.10.0 0.9.0);  run "$d"; assert 1 "$rc" "0.10.0 -> 0.9.0 blocks (lexical would pass)"; rm -rf "$d"
d=$(repo 1.2.9 1.2.10);  run "$d"; assert 0 "$rc" "1.2.9 -> 1.2.10 passes"; rm -rf "$d"
d=$(repo 9.0.0 10.0.0);  run "$d"; assert 0 "$rc" "9.0.0 -> 10.0.0 passes"; rm -rf "$d"

# Leading zeros: $((08)) is a syntax error under dash, and calver hits it.
d=$(repo 2026.07 2026.08); run "$d"; assert 0 "$rc" "calver 2026.07 -> 2026.08 passes"; rm -rf "$d"
d=$(repo 2026.08 2026.07); run "$d"; assert 1 "$rc" "calver 2026.08 -> 2026.07 blocks"; rm -rf "$d"

# No baseline: a repo whose first commit introduces VERSION.
d=$(repo "" 0.1.0); run "$d"; assert 0 "$rc" "no HEAD:VERSION passes — absent is not backwards"; rm -rf "$d"

# Unordered version strings are declined rather than guessed at.
d=$(repo nightly nightly-2); run "$d"; assert 0 "$rc" "non-numeric versions are not judged"; rm -rf "$d"

# --- the original pairing rule, unchanged ----------------------------------
d=$(repo 0.1.0 0.2.0 0.1.0); run "$d"; assert 1 "$rc" "CHANGELOG without the new entry blocks"; rm -rf "$d"

d=$(mktemp -d)
( cd "$d"; git init -q .; git config user.email t@t; git config user.name t
  printf '0.1.0\n' > VERSION; printf 'x\n' > a.txt; git add -A; git commit -qm base
  printf 'y\n' > a.txt; git add -A ) >/dev/null 2>&1
run "$d"; assert 0 "$rc" "a work commit that does not stage VERSION is ignored"; rm -rf "$d"

d=$(mktemp -d)
( cd "$d"; git init -q .; git config user.email t@t; git config user.name t
  printf '0.1.0\n' > VERSION; git add -A; git commit -qm base
  printf '\n' > VERSION; git add -A ) >/dev/null 2>&1
run "$d"; assert 1 "$rc" "an empty staged VERSION blocks"; rm -rf "$d"

# --- a merge compares against the first parent -----------------------------
# No special case in the check: during a merge HEAD *is* the first parent, and
# the incoming side is MERGE_HEAD. This proves that rather than assuming it.
d=$(mktemp -d)
( cd "$d"; git init -q .; git config user.email t@t; git config user.name t
  printf '0.8.0\n' > VERSION; printf '# c\n\n## [0.8.0]\n' > CHANGELOG.md
  git add -A; git commit -qm base
  git checkout -qb side
  printf '0.9.0\n' > VERSION; printf '# c\n\n## [0.9.0]\n' > CHANGELOG.md
  git add -A; git commit -qm side
  git checkout -q master 2>/dev/null || git checkout -q main
  printf '0.10.0\n' > VERSION; printf '# c\n\n## [0.10.0]\n' > CHANGELOG.md
  git add -A; git commit -qm main
  git merge --no-commit --no-ff side >/dev/null 2>&1 || true
  printf '0.9.0\n' > VERSION; printf '# c\n\n## [0.9.0]\n' > CHANGELOG.md
  git add -A ) >/dev/null 2>&1
run "$d"; assert 1 "$rc" "a merge resolved to the side's older VERSION blocks"; rm -rf "$d"

[ "$fails" -eq 0 ] || { echo "$fails failed"; exit 1; }
echo "  all cases passed"
