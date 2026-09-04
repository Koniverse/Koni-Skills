#!/bin/sh
# Self-contained POSIX test for checks/koni-docs-validate.sh, driven by a stub `npx`.
#
# This check has three skip-passes (no docs/, no npx, package not installed) and
# exactly one path that can fail. Every skip is defensible on its own, and
# together they make it possible for the check to exit 0 forever without once
# running a validation — the shape LESSONS §16 names, where a guard that has
# matched nothing looks identical to a guard that found nothing.
#
# So the assertion that matters is #6: given a real validator that fails, the
# check FAILS. A stub `npx` is what makes that testable without a network, and it
# doubles as the way to freeze the argv — `--no-install` is what keeps a
# pre-commit hook from silently reaching for the registry.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK="$HERE/../koni-docs-validate.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }

# run <dir> <path> — run the check in <dir> with <path> as PATH, echo its exit code
run() { if ( cd "$1" && PATH="$2" /bin/sh "$CHECK" >/dev/null 2>&1 ); then echo 0; else echo $?; fi; }
assert_exit() { # <expected> <desc> <dir> <path>
  got=$(run "$3" "$4")
  [ "$got" -eq "$1" ] && ok "$2 (exit $got)" || no "$2 (want $1 got $got)"
}
# stub_npx <dir> <version-rc> <validate-rc> — installs a fake npx, logs argv to $dir/argv
stub_npx() {
  mkdir -p "$1/bin"
  cat > "$1/bin/npx" <<EOF
#!/bin/sh
printf '%s\n' "\$*" >> "$1/argv"
case "\$*" in
  *--version*) exit $2 ;;
  *validate*)  exit $3 ;;
esac
exit 0
EOF
  chmod +x "$1/bin/npx"
}
REALPATH=/usr/bin:/bin

# 1. no docs/ directory → skip-pass, and npx is never consulted
d=$(mktemp -d); stub_npx "$d" 0 1
assert_exit 0 "no docs/ skips" "$d" "$d/bin:$REALPATH"
[ ! -f "$d/argv" ] && ok "no docs/: npx not invoked at all" || no "no docs/: npx was invoked"
rm -rf "$d"

# 2. docs/ present but npx unavailable → skip-pass (never a hard failure on a
#    machine that simply has no node)
d=$(mktemp -d); mkdir -p "$d/docs"
assert_exit 0 "npx unavailable skips" "$d" "/nonexistent-path-for-this-test"
rm -rf "$d"

# 3. docs/ + npx present, but the package is not installed → skip-pass
d=$(mktemp -d); mkdir -p "$d/docs"; stub_npx "$d" 1 1
assert_exit 0 "package not installed skips" "$d" "$d/bin:$REALPATH"
grep -q 'validate' "$d/argv" 2>/dev/null \
  && no "package absent: validate must not be attempted" \
  || ok "package absent: validate not attempted"
rm -rf "$d"

# 4. the probe never reaches the registry — `--no-install` is on the version call
d=$(mktemp -d); mkdir -p "$d/docs"; stub_npx "$d" 0 0
assert_exit 0 "installed + clean docs passes" "$d" "$d/bin:$REALPATH"
head -n1 "$d/argv" | grep -q -- '--no-install' \
  && ok "version probe passes --no-install" || no "version probe passes --no-install"

# 5. …and so does the validate call, with the docs path pinned
grep -q -- '--no-install koni-docs validate --docs-path docs/' "$d/argv" \
  && ok "validate argv is frozen (--no-install, --docs-path docs/)" \
  || no "validate argv is frozen (got: $(tr '\n' ';' < "$d/argv"))"
rm -rf "$d"

# 6. THE assertion: a validator that fails makes the check fail. Without this,
#    every other case above is a way of proving the check can print 0.
d=$(mktemp -d); mkdir -p "$d/docs"; stub_npx "$d" 0 1
assert_exit 1 "a failing validator fails the check" "$d" "$d/bin:$REALPATH"
rm -rf "$d"

# 7. the exit code is passed through, not flattened to 1
d=$(mktemp -d); mkdir -p "$d/docs"; stub_npx "$d" 0 3
assert_exit 3 "validator exit code passes through" "$d" "$d/bin:$REALPATH"
rm -rf "$d"

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
