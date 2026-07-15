#!/bin/sh
# WARN (never block) when a release ships a change to a security trust boundary, so it
# is not shipped without the koni-qc security review. Method:
# skills/koni-qc/references/security-review.md.
#
# Precise and opt-in by design — a noisy security reminder erodes trust, the exact
# failure koni-qc's own method warns against. So the boundary is *declared by the repo*,
# not guessed by a content heuristic:
#   .koni-harness/security-paths       — one shell glob per line; a changed file matching
#                                        any of them is a security-sensitive change.
#   .koni-harness/security-review-ack  — one path (or substring) per line to suppress
#                                        once its review is recorded.
# No security-paths file → this check is a documented no-op.
set -eu

cfg=.koni-harness/security-paths
[ -f "$cfg" ] || exit 0        # opt-in: a repo declares its boundaries, or nothing fires

changed=$(git diff --cached --name-only 2>/dev/null || true)
[ -n "$changed" ] || exit 0

hits=''
while IFS= read -r glob || [ -n "$glob" ]; do
  case "$glob" in ''|\#*) continue ;; esac
  for f in $changed; do
    # shell-glob match on the path (case handles the * / ? / [..] the repo wrote)
    # shellcheck disable=SC2254
    case "$f" in
      $glob) hits="$hits$f
" ;;
    esac
  done
done < "$cfg"

if [ -f .koni-harness/security-review-ack ] && [ -n "$hits" ]; then
  while IFS= read -r pat || [ -n "$pat" ]; do
    case "$pat" in ''|\#*) continue ;; esac
    hits=$(printf '%s' "$hits" | grep -vF "$pat" || true)
  done < .koni-harness/security-review-ack
fi

hits=$(printf '%s' "$hits" | grep -v '^$' | sort -u || true)
[ -n "$hits" ] || exit 0

echo "security-review: this release touches a security-sensitive path. Run the koni-qc"
echo "                 security review (skills/koni-qc/references/security-review.md) —"
echo "                 threat-model the boundary, derive + adversarially review the SEC"
echo "                 cases — then record the finding, or ack the path once reviewed in"
echo "                 .koni-harness/security-review-ack:"
printf '%s\n' "$hits" | sed 's/^/                   - /'
exit 1        # gates.conf marks this 'warn' → the runner prints WARN and does not block
