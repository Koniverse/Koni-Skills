#!/bin/sh
# Require a CHANGELOG with an [Unreleased] anchor (koni-docs RULE-1 surface).
set -eu
# Read the STAGED content, not the worktree — at release-commit the subject is what
# ships. A worktree CHANGELOG carrying the anchor as an unstaged edit would pass here and
# ship without it; a staged fix to a file that is dirty on disk would be invisible. Both
# directions are real, and principle 3 names `git show :<path>` for exactly this.
# Outside a git repo (a tarball, a sandbox) fall back to the worktree rather than failing
# on an environment issue.
read_doc() {  # $1 path -> stdout, staged if possible
  if git rev-parse --git-dir >/dev/null 2>&1 && git show ":$1" 2>/dev/null; then
    return 0
  fi
  [ -f "$1" ] && cat "$1"
}

cl=docs/CHANGELOG.md
content=$(read_doc "$cl" || true)
if [ -z "$content" ]; then cl=CHANGELOG.md; content=$(read_doc "$cl" || true); fi
[ -n "$content" ] || { echo "changelog-anchor: no CHANGELOG.md found (staged or on disk)"; exit 1; }
printf '%s\n' "$content" | grep -q '\[Unreleased\]' \
  || { echo "changelog-anchor: missing '## [Unreleased]' anchor in the STAGED $cl"; exit 1; }
exit 0
