#!/bin/sh
# Block a VERSION bump that lacks a matching CHANGELOG section in the same staged
# commit, and a VERSION that moves *backwards* relative to the commit it builds on.
#
# The two rules are here together, and not in two checks, for a reason that is
# about how this harness is installed rather than about versioning:
#
#   install-gate.sh:  cp "$SRC"/checks/*.sh .koni-harness/checks/     # clobbers
#   install-gate.sh:  [ -f .koni-harness/gates.conf ] || cp ...       # preserves
#
# A repo that already adopted the harness keeps its own `gates.conf` forever. So
# a *new* check file would ship and never run there — its row is not in the
# config it already has. Adding a rule to a check that is already wired is the
# only way a rule reaches an existing install.
#
# (Downstream, in a repo, the same two lines argue the opposite: a local fix must
# be a new file, because an edit to a vendored check is overwritten on upgrade.
# Same mechanism, opposite conclusion, depending on which side of `cp` you are.)
set -eu
staged=$(git diff --cached --name-only 2>/dev/null || true)
printf '%s\n' "$staged" | grep -qx 'VERSION' || exit 0   # work commit, fine
newver=$(git show :VERSION 2>/dev/null | tr -d '[:space:]' || true)
[ -n "$newver" ] || { echo "version-phase: VERSION staged but empty"; exit 1; }

# --- the version must not move backwards -----------------------------------
# Caught nothing for a long time because the pairing rule below asks whether
# VERSION and CHANGELOG moved *together*, never whether VERSION moved *forward*.
# A stale branch merging over a newer release, or a release commit that picks up
# some other file's version, passes that rule while lowering the number. Both
# happened in koni-tao-data on 2026-08-11, and both were caught by something
# outside the repo — git refusing a duplicate tag, then a CI step comparing the
# tag to VERSION.
oldver=$(git show HEAD:VERSION 2>/dev/null | tr -d '[:space:]' || true)
if [ -n "$oldver" ] && [ "$oldver" != "$newver" ]; then
  # Numeric, field by field — never lexical. "0.9.0" > "0.10.0" as strings, and
  # a string compare would refuse a legitimate release. Leading zeros are
  # stripped with ${n#0} rather than $((n)), because `$((08))` is a syntax error
  # under dash and calver (2026.08) hits it.
  older=0
  IFS_OLD=$IFS; IFS=.
  # shellcheck disable=SC2086
  set -- $oldver; a1=${1:-0} a2=${2:-0} a3=${3:-0}
  # shellcheck disable=SC2086
  set -- $newver; b1=${1:-0} b2=${2:-0} b3=${3:-0}
  IFS=$IFS_OLD
  for pair in "$a1 $b1" "$a2 $b2" "$a3 $b3"; do
    # shellcheck disable=SC2086
    set -- $pair
    x=${1#"${1%%[!0]*}"}; y=${2#"${2%%[!0]*}"}   # strip leading zeros
    x=${x:-0}; y=${y:-0}
    case "$x$y" in *[!0-9]*) older=0; break ;; esac   # not numeric — decline to judge
    if [ "$x" -gt "$y" ]; then older=1; break; fi
    if [ "$x" -lt "$y" ]; then older=0; break; fi
  done
  [ "$older" -eq 0 ] || {
    echo "version-phase: VERSION moves backwards — staged $newver is lower than HEAD $oldver"
    exit 1; }
fi

# --- the bump must be described --------------------------------------------
printf '%s\n' "$staged" | grep -qE '(^|/)CHANGELOG\.md$' || {
  echo "version-phase: VERSION bumped to $newver but no CHANGELOG.md staged"; exit 1; }
for f in docs/CHANGELOG.md CHANGELOG.md; do
  git show ":$f" 2>/dev/null | grep -Fq "[$newver]" && exit 0
done
echo "version-phase: staged CHANGELOG has no '[$newver]' entry"
exit 1
