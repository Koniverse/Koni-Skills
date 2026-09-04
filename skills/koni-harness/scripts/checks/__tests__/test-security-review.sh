#!/bin/sh
# Prove the security-review check can speak — and stays silent when it should.
#
# A guard verified once by hand is a guard that rots silently (LESSONS §20, §24). This
# plants each case in a scratch repo and asserts the exit code, so a regression that
# blinds the check fails here instead of shipping. No network, no side effects outside
# its own tempdir.
set -eu

REAL=$(CDPATH= cd "$(dirname "$0")/.." && pwd)/security-review.sh
[ -f "$REAL" ] || { echo "no check at $REAL"; exit 2; }
CHECK=$REAL

fails=0
assert() { # want_rc  got_rc  label
  if [ "$1" -ne "$2" ]; then
    echo "  ✗ $3 — wanted exit $1, got $2"
    fails=$((fails + 1))
  fi
}

# The five cases live in a function so the SAME corpus can be re-run against a
# deliberately broken copy of the check. A suite that has only ever seen the correct
# implementation cannot tell you it would notice an incorrect one (LESSONS §24).
run_cases() {
tmp=$(mktemp -d)
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
cd /; rm -rf "$tmp"
}

# --- the real check must pass every case -------------------------------------
run_cases
real_fails=$fails
if [ "$real_fails" -ne 0 ]; then
  echo "$real_fails case(s) failed — the check is not trustworthy until these pass."
  exit 1
fi

# --- and three mutants must each DIE against that same corpus -----------------
# Without this, "5 cases passed" only means the check behaved once. A mutant that
# survives names a hole in the corpus, which is the thing being certified here.
mut_dir=$(mktemp -d)
trap 'rm -rf "$mut_dir"' EXIT
survivors=0
mutate() { # label  sed-expression
  m="$mut_dir/mutant.sh"
  sed "$2" "$REAL" > "$m"
  if cmp -s "$m" "$REAL"; then
    echo "  ✗ mutation [$1] changed nothing — the sed no longer matches the check"
    survivors=$((survivors + 1)); return
  fi
  # A dying mutant prints the case failures that killed it — expected noise, so it is
  # swallowed. Only a SURVIVOR is news, and then the detail is worth seeing.
  fails=0; CHECK=$m; run_cases >/dev/null 2>&1; CHECK=$REAL
  if [ "$fails" -eq 0 ]; then
    echo "  ✗ mutant SURVIVED: $1 — the corpus cannot see this regression"
    survivors=$((survivors + 1))
  fi
}

# 1. guard removed: the opt-in bail-out is deleted, so the check fires with no config
mutate "opt-in guard removed" 's#^\[ -f .*cfg.*exit 0.*#:#'
# 2. never warns: the warn exit is forced to 0, so a real boundary change goes silent
mutate "never warns (warn exit forced to 0)" 's#^exit 1  *#exit 0        #'
# 3. wrong reference path: the reminder points at a doc that does not exist
mutate "reminder names a nonexistent reference" 's#references/security-review\.md#references/GONE.md#'

if [ "$survivors" -eq 0 ]; then
  echo "✓ security-review check: 5 plant→assert cases pass, 3 mutants killed"
  exit 0
fi
echo "$survivors mutant(s) survived — the corpus certifies less than it claims."
exit 1
