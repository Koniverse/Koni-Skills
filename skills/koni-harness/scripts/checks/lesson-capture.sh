#!/bin/sh
# lesson-capture — every completed development task leaves a LESSON VERDICT.
# The user rule (Koni-Skills CONTEXT D35): the loop must ALWAYS write LESSONS.md on
# task completion so the next session can re-learn. A gate cannot judge whether a
# lesson was *learned* (forced lessons breed filler — the depth bar), but it CAN
# enforce that the verdict was *recorded*. Silence is the only failure mode:
#
#   A release commit that touches anything outside docs/ (a development task) must
#   stage EITHER
#     (a) a LESSONS.md change (the lesson; a staged DELETION does not count), OR
#     (b) an ADDED line `Lessons: none new — <reason>` in this commit's staged
#         .md diff (the honest no-lesson verdict — typically in the story's
#         Implementation notes or the sprint note; pre-existing lines and
#         placeholder quotes never count).
#
# Docs-only commits (backfills, sprint bookkeeping) are exempt. Not in a git repo /
# nothing staged → pass (the gate only means something at commit time).
set -eu
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
staged=$(git diff --cached --name-only 2>/dev/null || true)
[ -n "$staged" ] || exit 0

# task-bearing = any staged path outside docs/ (code, skills, scripts, config).
# No shell loops over paths — spaced filenames must not word-split (LESSONS §9 class).
printf '%s\n' "$staged" | grep -qv '^docs/' || exit 0

# verdict (a): a LESSONS.md change staged — deletions do NOT count (--diff-filter=d)
if git diff --cached --name-only --diff-filter=d | grep -qxE '(docs/)?LESSONS\.md'; then
  exit 0
fi

# verdict (b): an explicit "Lessons: none new — <reason>" ADDED by THIS commit
# (scan the staged diff's +lines, never pre-existing file content — otherwise one
# old concrete example in a routinely-staged file neutralizes the gate forever).
# Placeholder forms quoting the syntax (<reason>, <why…>) never count, so a real
# reason must not contain '<' — fails closed; reword the reason.
if git diff --cached -U0 -- '*.md' '*.mdx' 2>/dev/null \
     | grep -E '^\+[[:space:]>*-]*Lessons:[[:space:]]*none new[[:space:]]*—' \
     | grep -vq '<'; then
  exit 0
fi

echo "lesson-capture: this commit completes a development task but records no lesson verdict."
echo "  Either append the lesson to docs/LESSONS.md (koni-docs templates/lessons.md),"
echo "  or record the honest no-lesson verdict in a staged story/sprint note:"
echo "    Lessons: none new — <why this task taught nothing reusable>"
echo "  (em-dash form, added in this commit; the reason may not contain '<')"
exit 1
