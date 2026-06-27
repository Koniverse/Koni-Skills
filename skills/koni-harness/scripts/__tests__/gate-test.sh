#!/bin/sh
# Self-contained POSIX test harness for koni-harness gates.
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SCRIPTS=$(CDPATH= cd -- "$HERE/.." && pwd)
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); echo "ok   - $1"; }
no()   { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
# assert_exit <expected> <description> <command...>
assert_exit() {
  exp=$1; desc=$2; shift 2
  if "$@" >/dev/null 2>&1; then got=0; else got=$?; fi
  [ "$got" -eq "$exp" ] && ok "$desc (exit $got)" || no "$desc (want $exp got $got)"
}
# new throwaway git repo, prints its path
newrepo() {
  d=$(mktemp -d)
  ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  printf '%s' "$d"
}

# ---- Task 1: runner dispatch ----
test_runner_dispatch() {
  d=$(newrepo)
  mkdir -p "$d/.koni-harness/checks"
  cp "$SCRIPTS/gate-runner.sh" "$d/.koni-harness/gate-runner.sh"
  # a check that always passes and one that always fails
  printf '#!/bin/sh\nexit 0\n' > "$d/.koni-harness/checks/pass.sh"
  printf '#!/bin/sh\nexit 1\n' > "$d/.koni-harness/checks/failer.sh"
  cat > "$d/.koni-harness/gates.conf" <<EOF
ok-check     | checks/pass.sh   | work-commit | block |
warn-check   | checks/failer.sh | work-commit | warn  |
EOF
  # only warn fails → runner exits 0
  assert_exit 0 "runner: warn-only failure does not block" \
    sh "$d/.koni-harness/gate-runner.sh" --phase work-commit --config "$d/.koni-harness/gates.conf"
  # now make it a block
  cat > "$d/.koni-harness/gates.conf" <<EOF
bad-check | checks/failer.sh | work-commit | block |
EOF
  assert_exit 1 "runner: block failure exits non-zero" \
    sh "$d/.koni-harness/gate-runner.sh" --phase work-commit --config "$d/.koni-harness/gates.conf"
  # phase filter: nothing runs for a non-matching phase → exit 0
  assert_exit 0 "runner: non-matching phase runs nothing" \
    sh "$d/.koni-harness/gate-runner.sh" --phase pre-push --config "$d/.koni-harness/gates.conf"
  rm -rf "$d"
}

test_runner_dispatch

test_version_phase() {
  CH="$SCRIPTS/checks/version-phase.sh"
  # (a) VERSION not staged → pass
  d=$(newrepo); ( cd "$d" && echo x > a && git add a )
  assert_exit 0 "version-phase: no VERSION change passes" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # (b) VERSION staged, no CHANGELOG staged → block
  d=$(newrepo); ( cd "$d" && echo 0.2.0 > VERSION && git add VERSION )
  assert_exit 1 "version-phase: VERSION bump without CHANGELOG blocks" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # (c) VERSION staged + matching CHANGELOG section → pass
  d=$(newrepo)
  ( cd "$d" && echo 0.2.0 > VERSION && mkdir -p docs \
    && printf '## [0.2.0]\n' > docs/CHANGELOG.md && git add VERSION docs/CHANGELOG.md )
  assert_exit 0 "version-phase: VERSION bump with matching CHANGELOG passes" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # (d) fixed-string match: '.' must not act as a BRE wildcard ([0a2a0] != 0.2.0) → block
  d=$(newrepo)
  ( cd "$d" && echo 0.2.0 > VERSION && mkdir -p docs \
    && printf '## [0a2a0]\n' > docs/CHANGELOG.md && git add VERSION docs/CHANGELOG.md )
  assert_exit 1 "version-phase: dot is literal, not a wildcard" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
}
test_version_phase

test_changelog_anchor() {
  CH="$SCRIPTS/checks/changelog-anchor.sh"
  d=$(newrepo); ( cd "$d" && mkdir -p docs && printf '# Changelog\n## [Unreleased]\n' > docs/CHANGELOG.md )
  assert_exit 0 "changelog-anchor: present passes" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  d=$(newrepo); ( cd "$d" && mkdir -p docs && printf '# Changelog\n' > docs/CHANGELOG.md )
  assert_exit 1 "changelog-anchor: missing anchor blocks" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
}
test_changelog_anchor

test_credential_scan() {
  CH="$SCRIPTS/checks/credential-scan.sh"
  # clean staged change → pass
  d=$(newrepo); ( cd "$d" && echo "const x = 1" > a.js && git add a.js )
  assert_exit 0 "credential-scan: clean diff passes" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # AWS key id in added line → block
  d=$(newrepo); ( cd "$d" && echo 'key = "AKIAIOSFODNN7EXAMPLE"' > a.txt && git add a.txt )
  assert_exit 1 "credential-scan: AWS key blocks" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # PEM private key → block
  d=$(newrepo); ( cd "$d" && printf -- '-----BEGIN RSA PRIVATE KEY-----\n' > k.pem && git add k.pem )
  assert_exit 1 "credential-scan: PEM private key blocks" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # generic api_key assignment with a long fake value → block
  d=$(newrepo); ( cd "$d" && printf 'api_key = "AKIAFAKEFAKE0000DEADBEEFCAFE1234"\n' > cfg.txt && git add cfg.txt )
  assert_exit 1 "credential-scan: generic api_key assignment blocks" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # same diff, but the fake token is allowlisted → pass
  d=$(newrepo)
  ( cd "$d" && mkdir -p .koni-harness \
    && printf 'AKIAFAKEFAKE0000DEADBEEFCAFE1234\n' > .koni-harness/secret-allow \
    && printf 'api_key = "AKIAFAKEFAKE0000DEADBEEFCAFE1234"\n' > cfg.txt && git add cfg.txt )
  assert_exit 0 "credential-scan: allowlisted token passes" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
}
test_credential_scan

test_koni_docs_validate() {
  CH="$SCRIPTS/checks/koni-docs-validate.sh"
  d=$(newrepo)   # no docs/ dir
  assert_exit 0 "koni-docs-validate: no docs/ → skip-pass" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
  # docs/ present but koni-docs not installed (stub npx --version → exit 1) → skip-pass
  d=$(newrepo); ( cd "$d" && mkdir -p docs )
  stub=$(mktemp -d)
  printf '#!/bin/sh\nexit 1\n' > "$stub/npx"; chmod +x "$stub/npx"
  assert_exit 0 "koni-docs-validate: not installed → skip-pass" \
    sh -c "cd '$d' && PATH='$stub':\"\$PATH\" sh '$CH'"
  rm -rf "$d" "$stub"
  # docs/ present and koni-docs installed (stub npx: --version & validate both exit 0) → pass
  d=$(newrepo); ( cd "$d" && mkdir -p docs )
  stub=$(mktemp -d)
  printf '#!/bin/sh\nexit 0\n' > "$stub/npx"; chmod +x "$stub/npx"
  assert_exit 0 "koni-docs-validate: installed + validate ok → pass" \
    sh -c "cd '$d' && PATH='$stub':\"\$PATH\" sh '$CH'"
  rm -rf "$d" "$stub"
}
test_koni_docs_validate

test_story_status() {
  CH="$SCRIPTS/checks/story-status-consistency.sh"
  d=$(newrepo); ( cd "$d" && mkdir -p docs/sprints/stories )
  # done story, all AC checked → pass
  printf -- 'status: done\n## Acceptance criteria\n- [x] AC-1\n' > "$d/docs/sprints/stories/US-1.md"
  assert_exit 0 "story-status: done + all AC checked passes" sh -c "cd '$d' && sh '$CH'"
  # done story with an unchecked AC → warn-fail (exit 1)
  printf -- 'status: done\n## Acceptance criteria\n- [ ] AC-1\n' > "$d/docs/sprints/stories/US-2.md"
  assert_exit 1 "story-status: done + unchecked AC fails" sh -c "cd '$d' && sh '$CH'"
  rm -f "$d/docs/sprints/stories/US-2.md"
  # markdown **Status:** Done form + unchecked AC → warn-fail (exit 1)
  printf -- '**Status:** Done\n## Acceptance criteria\n- [ ] AC-1\n' > "$d/docs/sprints/stories/US-3.md"
  assert_exit 1 "story-status: **Status:** Done + unchecked AC fails" sh -c "cd '$d' && sh '$CH'"
  rm -f "$d/docs/sprints/stories/US-3.md"
  # 'status: not done' must NOT match 'done' → no over-match even with an unchecked box
  printf -- 'status: not done\n## Acceptance criteria\n- [ ] AC-1\n' > "$d/docs/sprints/stories/US-4.md"
  assert_exit 0 "story-status: 'not done' + unchecked AC does not fail" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
}
test_story_status

test_passthrough() {
  CH="$SCRIPTS/checks/passthrough.sh"
  assert_exit 0 "passthrough: true command passes" sh "$CH" "true"
  assert_exit 1 "passthrough: false command fails" sh "$CH" "false"
  assert_exit 0 "passthrough: empty command no-ops" sh "$CH" ""
}
test_passthrough

test_install_nondestructive() {
  INS="$SCRIPTS/install-gate.sh"
  d=$(newrepo)
  mkdir -p "$d/.git/hooks"
  printf '#!/bin/sh\necho ORIGINAL_HOOK\n' > "$d/.git/hooks/pre-commit"
  chmod +x "$d/.git/hooks/pre-commit"
  ( cd "$d" && sh "$INS" --source "$SCRIPTS" >/dev/null 2>&1 )
  # original hook content preserved
  grep -q 'ORIGINAL_HOOK' "$d/.git/hooks/pre-commit" \
    && ok "install: original pre-commit preserved" || no "install: original pre-commit preserved"
  # koni-harness marker added
  grep -q '>>> koni-harness >>>' "$d/.git/hooks/pre-commit" \
    && ok "install: koni-harness marker block added" || no "install: koni-harness marker block added"
  # pre-push hook also got a marker block
  grep -q '>>> koni-harness >>>' "$d/.git/hooks/pre-push" \
    && ok "install: pre-push marker block added" || no "install: pre-push marker block added"
  # runner vendored
  [ -f "$d/.koni-harness/gate-runner.sh" ] \
    && ok "install: runner vendored" || no "install: runner vendored"
  # re-run is idempotent (no duplicate marker)
  ( cd "$d" && sh "$INS" --source "$SCRIPTS" >/dev/null 2>&1 )
  n=$(grep -c '>>> koni-harness >>>' "$d/.git/hooks/pre-commit")
  [ "$n" -eq 1 ] && ok "install: idempotent (single marker)" || no "install: idempotent (got $n markers)"
  rm -rf "$d"
}
test_install_nondestructive

test_install_nonshell_hook() {
  INS="$SCRIPTS/install-gate.sh"
  d=$(newrepo)
  mkdir -p "$d/.git/hooks"
  printf '#!/usr/bin/env python3\nprint("py hook")\n' > "$d/.git/hooks/pre-commit"
  chmod +x "$d/.git/hooks/pre-commit"
  ( cd "$d" && sh "$INS" --source "$SCRIPTS" >/dev/null 2>&1 )
  # python hook is NOT modified (no marker appended)
  grep -q '>>> koni-harness >>>' "$d/.git/hooks/pre-commit" \
    && no "install: python pre-commit left untouched" \
    || ok "install: python pre-commit left untouched"
  # original python content still intact
  grep -q 'py hook' "$d/.git/hooks/pre-commit" \
    && ok "install: python hook content preserved" || no "install: python hook content preserved"
  # install still vendored the runner
  [ -f "$d/.koni-harness/gate-runner.sh" ] \
    && ok "install: runner vendored despite non-shell hook" || no "install: runner vendored despite non-shell hook"
  rm -rf "$d"
}
test_install_nonshell_hook

test_runner_dry_run() {
  d=$(newrepo)
  mkdir -p "$d/.koni-harness/checks"
  cp "$SCRIPTS/gate-runner.sh" "$d/.koni-harness/gate-runner.sh"
  printf '#!/bin/sh\nexit 1\n' > "$d/.koni-harness/checks/failer.sh"
  cat > "$d/.koni-harness/gates.conf" <<EOF
bad-check | checks/failer.sh | work-commit | block |
EOF
  # --dry-run: exits 0 even though the block check would fail, and runs no check
  assert_exit 0 "runner: --dry-run skips checks (exit 0)" \
    sh "$d/.koni-harness/gate-runner.sh" --phase work-commit --config "$d/.koni-harness/gates.conf" --dry-run
  out=$(sh "$d/.koni-harness/gate-runner.sh" --phase work-commit --config "$d/.koni-harness/gates.conf" --dry-run)
  printf '%s\n' "$out" | grep -q '^DRY ' \
    && ok "runner: --dry-run prints a DRY line" || no "runner: --dry-run prints a DRY line"
  rm -rf "$d"
}
test_runner_dry_run

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
