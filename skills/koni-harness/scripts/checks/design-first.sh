#!/bin/sh
# design-first — UI code complies with the repo's design contract AT WRITE TIME,
# not at review time. The user rule (Koni-Skills CONTEXT D36): conformance
# discovered by /design-review is REWORK ("làm đi làm lại phần giao diện");
# conformance cited at Execute entry is compliance — review only confirms.
#
#   A release commit that stages UI source (*.tsx *.jsx *.vue *.svelte *.css
#   *.scss), in a repo that HAS a design contract (DESIGN.md or docs/DESIGN.md),
#   must also stage an ADDED line
#     `Design applied: <DESIGN.md sections + shadcn primitives + tokens used>`
#   in a markdown file (typically the story's Implementation notes) — evidence
#   the contract was read and built-to, mirroring lesson-capture's verdict
#   mechanics: added lines only (pre-existing citations never count), and
#   placeholder forms containing '<' never count.
#
# No DESIGN.md in the repo → pass (nothing to comply with — but koni-setup
# vendors one into UI repos, so absence on a UI repo is itself a setup gap).
# Not in a git repo / nothing staged → pass.
set -eu
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
staged=$(git diff --cached --name-only 2>/dev/null || true)
[ -n "$staged" ] || exit 0

# UI source staged — deletions excluded (removing UI needs no design citation;
# --diff-filter=d mirrors lesson-capture). No shell loops over paths (LESSONS §9).
git diff --cached --name-only --diff-filter=d 2>/dev/null \
  | grep -Eq '\.(tsx|jsx|vue|svelte|css|scss)$' || exit 0

# a design contract exists?
[ -f DESIGN.md ] || [ -f docs/DESIGN.md ] || exit 0

# evidence: a "Design applied:" line ADDED by THIS commit in staged .md content
if git diff --cached -U0 -- '*.md' '*.mdx' 2>/dev/null \
     | grep -E '^\+[[:space:]>*-]*\**Design applied\**:' \
     | grep -vq '<'; then
  exit 0
fi

echo "design-first: this commit ships UI code but cites no design compliance."
echo "  Read the repo's DESIGN.md (+ the shadcn standard) BEFORE the UI code and"
echo "  record what was built to, in a staged story/sprint note:"
echo "    Design applied: DESIGN.md \\S<n> tokens/typography; shadcn Button+Dialog; states enumerated"
echo "  (added in this commit; placeholder text with '<' does not count)"
echo "  /design-review at the Review stage then CONFIRMS conformance — it must not discover it."
exit 1
