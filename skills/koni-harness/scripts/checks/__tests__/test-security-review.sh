#!/bin/sh
# Prove the security-review check can speak — and stays silent when it should.
#
# A guard verified once by hand is a guard that rots silently (LESSONS §20, §24). This
# plants each case in a scratch repo and asserts the exit code, so a regression that
# blinds the check fails here instead of shipping. No network, no side effects outside
# its own tempdir.
set -eu

CHECK=$(CDPATH= cd "$(dirname "$0")/.." && pwd)/security-review.sh
[ -f "$CHECK" ] || { echo "no check at $CHECK"; exit 2; }

fails=0
assert() { # want_rc  got_rc  label
  if [ "$1" -ne "$2" ]; then
    echo "  ✗ $3 — wanted exit $1, got $2"
    fails=$((fails + 1))
  fi
}

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cd "$tmp"
git init -q
# Identity is set on the throwaway repo, not inherited. `git commit` (case 4) fails with
# "empty ident name" wherever no global user.name/user.email exists — which is every CI
# runner and every fresh container. The suite passed for the same reason it was broken:
# it was only ever run on a machine that happened to have a global git identity.
git config user.email t@t
git config user.name t
mkdir -p .koni-harness src/auth

# 1. No security-paths file → the check is a documented no-op: exit 0 AND no output.
#    (Asserting output, not just the code, is what catches a check that leaks a
#    missing-config error on every release-commit — noise erodes a warn's credibility.)
echo x > src/auth/login.ts
git add -A
rc=0; out=$(sh "$CHECK" 2>&1) || rc=$?; assert 0 "$rc" "exit 0 with no security-paths declared"
if [ -n "$out" ]; then echo "  ✗ silent no-op emitted output: $out"; fails=$((fails + 1)); fi

# 2. Boundary declared + a matching change staged → WARN (exit 1).
printf 'src/auth/*\nsrc/crypto/**\n' > .koni-harness/security-paths
git add -A
rc=0; out=$(sh "$CHECK" 2>&1) || rc=$?; assert 1 "$rc" "warns when a declared boundary changes"
# the reminder must point at a koni-qc doc that actually exists, or it points nowhere
case "$out" in
  *skills/koni-qc/references/security-review.md*) : ;;
  *) echo "  ✗ warn does not name the koni-qc security-review reference"; fails=$((fails + 1)) ;;
esac

# 3. Same change, path acknowledged → silent again.
echo src/auth/login.ts > .koni-harness/security-review-ack
git add -A
rc=0; sh "$CHECK" >/dev/null 2>&1 || rc=$?; assert 0 "$rc" "suppressed once the path is acked"

# 4. A non-boundary change with boundaries declared → silent (precision).
#    Commit first so the boundary file is not itself in the staged diff — otherwise the
#    check correctly fires on the staged deletion, which is a security change too.
rm .koni-harness/security-review-ack
git commit -qam wip
echo y >> README.md
git add README.md
rc=0; sh "$CHECK" >/dev/null 2>&1 || rc=$?; assert 0 "$rc" "does not fire on a non-sensitive path"

# 5. A glob with ** matches nested paths.
mkdir -p src/crypto/aead
echo z > src/crypto/aead/seal.ts
git add -A
rc=0; sh "$CHECK" >/dev/null 2>&1 || rc=$?; assert 1 "$rc" "** glob matches a nested boundary path"

if [ "$fails" -eq 0 ]; then
  echo "✓ security-review check: warns on a declared boundary, silent otherwise (5 cases)"
  exit 0
fi
echo "$fails case(s) failed — the check is not trustworthy until these pass."
exit 1
