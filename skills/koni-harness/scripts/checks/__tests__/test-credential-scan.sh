#!/bin/sh
# Self-contained POSIX test for checks/credential-scan.sh.
#
# This is the only BLOCKING check whose subject is an attacker-shaped string, and
# it had no test. Both of its error directions are expensive and they are not
# symmetric: a miss leaks a credential into history permanently, while a false
# positive on a plausible-looking constant blocks a commit until someone
# allowlists it. So both are pinned here, and so is the boundary that makes the
# check tractable at all — it reads ADDED lines only, never the working tree.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../credential-scan.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
assert_exit() { # <expected> <desc> <dir>
  exp=$1; desc=$2; d=$3
  if ( cd "$d" && sh "$CHECK" >/dev/null 2>&1 ); then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
newrepo() {
  d=$(mktemp -d)
  ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  printf '%s' "$d"
}
# staged <dir> <content...> — writes and stages a file containing the given line
staged() { d=$1; shift; printf '%s\n' "$*" > "$d/f.txt"; ( cd "$d" && git add f.txt ); }

# The fixtures are ASSEMBLED, never written literally — this file is itself staged on
# every commit that touches it, and a literal fixture would trip the very check it
# tests. The allowlist is the documented escape hatch, and it is the WRONG one here:
# it filters by substring, so exempting a PEM header would exempt a real leaked key's
# first line too, in every future commit. Splitting each pattern across a concatenation
# keeps the guard at full strength and still produces the exact string at runtime.
PEM_HEAD='-----BEGIN RSA PRIVATE'' KEY-----'
PEM_BARE='-----BEGIN PRIVATE'' KEY-----'
AKIA_EXAMPLE='AKIA''IOSFODNN7EXAMPLE'      # AWS's canonical documentation key
AKIA_SECOND='AKIA''1234567890ABCDEF'
LONGVAL='sk_live_''51H8xQ2K3mNpQrStUvWxYz09'
KEYNAME='api_''key'                        # so this line is not itself an assignment

# 1. nothing staged → pass
d=$(newrepo); assert_exit 0 "nothing staged passes" "$d"; rm -rf "$d"

# 2. ordinary staged code → pass
d=$(newrepo); staged "$d" 'const timeout = 30_000; // milliseconds'
assert_exit 0 "innocuous staged line passes" "$d"; rm -rf "$d"

# --- the three patterns the check claims to catch ---

# 3. PEM private key header
d=$(newrepo); staged "$d" "$PEM_HEAD"
assert_exit 1 "PEM private key header blocks" "$d"; rm -rf "$d"

# 4. AWS access key id (exactly 16 chars after AKIA)
d=$(newrepo); staged "$d" "AWS_KEY = $AKIA_EXAMPLE"
assert_exit 1 "AWS access key id blocks" "$d"; rm -rf "$d"

# 5. hardcoded secret-like assignment, >= 24 chars of secret alphabet
d=$(newrepo); staged "$d" "$KEYNAME = \"$LONGVAL\""
assert_exit 1 "long api_key assignment blocks" "$d"; rm -rf "$d"

# 6. …and the length floor is real: a short assignment is not a secret.
#    Without this, the check would fire on every `token = "abc"` in a test fixture.
d=$(newrepo); staged "$d" "$KEYNAME = \"short\""
assert_exit 0 "short api_key assignment passes (length floor holds)" "$d"; rm -rf "$d"

# 7. AKIA with too few trailing chars is not an access key id
d=$(newrepo); staged "$d" "note = AKIASHORT"
assert_exit 0 "AKIA prefix alone is not a key id" "$d"; rm -rf "$d"

# --- the ADDED-lines-only boundary ---

# 8. A secret being REMOVED must not block the commit that removes it. Getting
#    this backwards makes the check un-passable exactly when someone is cleaning
#    up a leak — the one moment it must not stand in the way.
d=$(newrepo)
printf '%s\n' "$KEYNAME = \"$LONGVAL\"" > "$d/f.txt"
( cd "$d" && git add f.txt && git commit -qm seed )
printf '%s\n' "$KEYNAME = process.env.API_KEY" > "$d/f.txt"
( cd "$d" && git add f.txt )
assert_exit 0 "removing a secret does not block" "$d"; rm -rf "$d"

# 9. unstaged working-tree changes are out of scope
d=$(newrepo)
( cd "$d" && printf 'x\n' > seed.txt && git add seed.txt && git commit -qm seed )
printf '%s\n' "$PEM_BARE" > "$d/loose.txt"   # written, never staged
assert_exit 0 "unstaged secret is out of scope" "$d"; rm -rf "$d"

# --- the allowlist escape hatch ---

# 10. an allowlisted literal is filtered out
d=$(newrepo); mkdir -p "$d/.koni-harness"
printf '%s\n' "$AKIA_EXAMPLE" > "$d/.koni-harness/secret-allow"
staged "$d" "docs: the canonical example key is $AKIA_EXAMPLE"
assert_exit 0 "allowlisted literal passes" "$d"; rm -rf "$d"

# 11. the allowlist is narrow — it exempts the listed string, not the file
d=$(newrepo); mkdir -p "$d/.koni-harness"
printf '%s\n' "$AKIA_EXAMPLE" > "$d/.koni-harness/secret-allow"
printf '%s\n%s\n' "$AKIA_EXAMPLE" "$AKIA_SECOND" > "$d/f.txt"
( cd "$d" && git add f.txt )
assert_exit 1 "a second, unlisted key still blocks" "$d"; rm -rf "$d"

# 12. an empty allowlist file must not swallow everything (an empty pattern
#     passed to `grep -vF` matches every line — the classic way an escape hatch
#     silently disarms the guard it was added to narrow)
d=$(newrepo); mkdir -p "$d/.koni-harness"
printf '\n\n' > "$d/.koni-harness/secret-allow"
staged "$d" "$AKIA_EXAMPLE"
assert_exit 1 "empty allowlist lines do not disarm the check" "$d"; rm -rf "$d"

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
