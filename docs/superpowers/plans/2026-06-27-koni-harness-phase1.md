# koni-harness Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `skills/koni-harness/` — the tool-neutral "Koni Agentic Loop" standard plus a portable, dependency-free POSIX pre-commit gate that catches agent mistakes (bad version bumps, missing changelog, leaked secrets, broken doc refs) before they land, installable additively into any repo.

**Architecture:** A self-locating POSIX `gate-runner.sh` reads a line-oriented `gates.conf` (no YAML/`yq` dependency) and dispatches small single-purpose check scripts by *phase* (work-commit / release-commit / pre-push) and *severity* (block / warn). The runner + checks are **vendored** into a consumer repo's `.koni-harness/` so they are self-contained and portable to any tool. Adoption is strictly additive — git hooks and settings are chained/merged behind reversible `# >>> koni-harness >>>` marker blocks, never overwritten.

**Tech Stack:** POSIX `sh`, `git`, `grep`/`sed`/`awk`; optional `npx koni-docs` for one check. Tests are a self-contained POSIX shell harness (no `bats`).

---

## Design decisions locked from the spec

Resolves spec [§9 open questions](../specs/2026-06-27-koni-harness-agentic-loop-design.md):

- **Config format**: line-oriented, pipe-delimited `gates.conf` (not YAML) → zero parser dependency. Grammar:
  `name | script | phases(csv) | severity | arg`. Blank lines and `#`-leading lines ignored.
- **Vendoring**: `install-gate.sh` copies `gate-runner.sh` + `checks/` into the consumer repo's `.koni-harness/`. The runner self-locates checks via `dirname "$0"`. Source of truth stays in `skills/koni-harness/scripts/`.
- **`credential-scan`**: blocks only on **high-confidence** patterns (PEM private-key blocks, `AKIA…` AWS IDs, quoted long secret assignments). Heuristics that would false-positive are out of Phase 1. A repo may add `.koni-harness/secret-allow` (substrings to ignore).

---

## File Structure

```
skills/koni-harness/
├── SKILL.md                              # orchestrator (Task 11)
├── references/
│   ├── agentic-loop-standard.md          # THE STANDARD (Task 9)
│   ├── gate-catalog.md                   # check library reference (Task 10)
│   ├── adapters.md                       # git/Claude/Gemini/Codex shims (Task 10)
│   └── adoption.md                       # non-destructive adopt procedure (Task 10)
└── scripts/
    ├── gate-runner.sh                     # engine (Task 1)
    ├── gates.conf                         # default/template config (Task 1)
    ├── install-gate.sh                    # additive installer (Task 8)
    ├── checks/
    │   ├── version-phase.sh               # Task 2
    │   ├── changelog-anchor.sh            # Task 3
    │   ├── credential-scan.sh             # Task 4
    │   ├── koni-docs-validate.sh          # Task 5
    │   ├── story-status-consistency.sh    # Task 6
    │   └── passthrough.sh                 # Task 7
    └── __tests__/
        └── gate-test.sh                   # POSIX test harness (grows each task)
```

Each file has one responsibility. Checks never call each other; the runner is the only orchestrator. Tests build their own throwaway git repos with `mktemp -d`.

---

## Conventions for every script

- First line `#!/bin/sh`; then `set -eu`. No bashisms (no `[[`, no arrays, no `local` — use functions + positional args).
- Exit `0` = pass, `1` = check failed, `2` = usage/internal error.
- A check reads the staged state via `git diff --cached` / `git show :<path>` so it judges *what is about to be committed*, not the working tree.
- Keep each check < 40 lines.

---

### Task 0: Scaffold the skill directory

**Files:**
- Create: `skills/koni-harness/scripts/checks/` (dir), `skills/koni-harness/scripts/__tests__/` (dir), `skills/koni-harness/references/` (dir)

- [ ] **Step 1: Create the directory skeleton**

```bash
cd /Users/jindo9986/Documents/GitHub/Koni-Skills
mkdir -p skills/koni-harness/scripts/checks skills/koni-harness/scripts/__tests__ skills/koni-harness/references
```

- [ ] **Step 2: Commit the skeleton placeholder**

```bash
printf '# koni-harness (WIP — see docs/superpowers/specs/2026-06-27-koni-harness-agentic-loop-design.md)\n' > skills/koni-harness/SKILL.md
git add skills/koni-harness
git commit -m "chore(koni-harness): scaffold skill directory"
```

---

### Task 1: Gate-runner engine + test harness

**Files:**
- Create: `skills/koni-harness/scripts/gate-runner.sh`
- Create: `skills/koni-harness/scripts/gates.conf`
- Create: `skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 1: Write the failing test harness with the first two cases**

Create `skills/koni-harness/scripts/__tests__/gate-test.sh`:

```sh
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

echo "----"
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run it to confirm it fails (runner doesn't exist yet)**

Run: `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: FAIL — `gate-runner.sh` missing, cases error out / `FAIL>0`.

- [ ] **Step 3: Implement `gate-runner.sh`**

Create `skills/koni-harness/scripts/gate-runner.sh`:

```sh
#!/bin/sh
# koni-harness gate-runner (POSIX). Reads gates.conf, runs checks for a phase.
# Usage: gate-runner.sh --phase <work-commit|release-commit|pre-push> [--config PATH] [--dry-run]
set -eu
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PHASE=""; CONFIG=""; DRY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --phase)   PHASE=${2:-}; shift 2 ;;
    --config)  CONFIG=${2:-}; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) echo "gate-runner: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$PHASE" ] || { echo "gate-runner: --phase required" >&2; exit 2; }
if [ -z "$CONFIG" ]; then
  if [ -f "$SELF_DIR/gates.conf" ]; then CONFIG="$SELF_DIR/gates.conf"
  elif [ -f gates.conf ]; then CONFIG=gates.conf
  else echo "gate-runner: no gates.conf found" >&2; exit 2; fi
fi
[ -f "$CONFIG" ] || { echo "gate-runner: config not found: $CONFIG" >&2; exit 2; }

trim() { printf '%s' "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'; }
fail=0
while IFS='|' read -r name script phases severity arg; do
  name=$(trim "${name:-}")
  case "$name" in ''|\#*) continue ;; esac
  script=$(trim "${script:-}")
  phases=$(printf '%s' "${phases:-}" | tr -d '[:space:]')
  severity=$(trim "${severity:-}")
  arg=$(trim "${arg:-}")
  echo ",$phases," | grep -q ",$PHASE," || continue
  case "$script" in /*) cmd="$script" ;; *) cmd="$SELF_DIR/$script" ;; esac
  if [ "$DRY" -eq 1 ]; then echo "DRY [$severity] $name -> $cmd ${arg}"; continue; fi
  if sh "$cmd" "$arg"; then
    echo "✓ $name"
  elif [ "$severity" = block ]; then
    echo "✗ BLOCK: $name" >&2; fail=1
  else
    echo "⚠ warn: $name" >&2
  fi
done < "$CONFIG"
exit "$fail"
```

- [ ] **Step 4: Create the default `gates.conf` template**

Create `skills/koni-harness/scripts/gates.conf`:

```
# koni-harness gates — line format: name | script | phases(csv) | severity | arg
# phases: work-commit, release-commit, pre-push   severity: block | warn
version-phase        | checks/version-phase.sh            | work-commit,release-commit | block |
changelog-anchor     | checks/changelog-anchor.sh         | release-commit             | block |
credential-scan      | checks/credential-scan.sh          | work-commit,pre-push       | block |
story-status         | checks/story-status-consistency.sh | release-commit             | warn  |
koni-docs-validate   | checks/koni-docs-validate.sh        | release-commit             | warn  |
tests                | checks/passthrough.sh              | pre-push                   | block | npm test
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: `PASS=3 FAIL=0`, harness exits 0.

- [ ] **Step 6: Commit**

```bash
chmod +x skills/koni-harness/scripts/gate-runner.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git add skills/koni-harness/scripts/gate-runner.sh skills/koni-harness/scripts/gates.conf skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): POSIX gate-runner + line-format config + test harness"
```

---

### Task 2: Check — `version-phase`

**Files:**
- Create: `skills/koni-harness/scripts/checks/version-phase.sh`
- Modify: `skills/koni-harness/scripts/__tests__/gate-test.sh` (add `test_version_phase`)

- [ ] **Step 1: Add the failing test**

Insert before the `echo "----"` summary line in `gate-test.sh`:

```sh
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
}
test_version_phase
```

- [ ] **Step 2: Run — expect FAIL (check missing)**

Run: `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: the three version-phase cases error; `FAIL>0`.

- [ ] **Step 3: Implement `version-phase.sh`**

```sh
#!/bin/sh
# Block a VERSION bump that lacks a matching CHANGELOG section in the same staged commit.
set -eu
staged=$(git diff --cached --name-only 2>/dev/null || true)
printf '%s\n' "$staged" | grep -qx 'VERSION' || exit 0   # work commit, fine
newver=$(git show :VERSION 2>/dev/null | tr -d '[:space:]' || true)
[ -n "$newver" ] || { echo "version-phase: VERSION staged but empty"; exit 1; }
printf '%s\n' "$staged" | grep -q 'CHANGELOG.md' || {
  echo "version-phase: VERSION bumped to $newver but no CHANGELOG.md staged"; exit 1; }
for f in docs/CHANGELOG.md CHANGELOG.md; do
  git show ":$f" 2>/dev/null | grep -q "\[$newver\]" && exit 0
done
echo "version-phase: staged CHANGELOG has no '## [$newver]' section"
exit 1
```

- [ ] **Step 4: Run — expect PASS**

Run: `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: all version-phase cases ok; `FAIL=0`.

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/checks/version-phase.sh
git add skills/koni-harness/scripts/checks/version-phase.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): version-phase check (2-phase versioning gate)"
```

---

### Task 3: Check — `changelog-anchor`

**Files:**
- Create: `skills/koni-harness/scripts/checks/changelog-anchor.sh`
- Modify: `gate-test.sh` (add `test_changelog_anchor`)

- [ ] **Step 1: Add the failing test** (insert before the summary line)

```sh
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
```

- [ ] **Step 2: Run — expect FAIL.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 3: Implement `changelog-anchor.sh`**

```sh
#!/bin/sh
# Require a CHANGELOG with an [Unreleased] anchor (koni-docs RULE-1 surface).
set -eu
cl=docs/CHANGELOG.md
[ -f "$cl" ] || cl=CHANGELOG.md
[ -f "$cl" ] || { echo "changelog-anchor: no CHANGELOG.md found"; exit 1; }
grep -q '\[Unreleased\]' "$cl" || { echo "changelog-anchor: missing '## [Unreleased]' anchor in $cl"; exit 1; }
exit 0
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/checks/changelog-anchor.sh
git add skills/koni-harness/scripts/checks/changelog-anchor.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): changelog-anchor check"
```

---

### Task 4: Check — `credential-scan`

**Files:**
- Create: `skills/koni-harness/scripts/checks/credential-scan.sh`
- Modify: `gate-test.sh` (add `test_credential_scan`)

- [ ] **Step 1: Add the failing test** (insert before summary)

```sh
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
}
test_credential_scan
```

- [ ] **Step 2: Run — expect FAIL.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 3: Implement `credential-scan.sh`**

```sh
#!/bin/sh
# Block staged ADDED lines containing high-confidence secrets. Allowlist: .koni-harness/secret-allow
set -eu
added=$(git diff --cached -U0 2>/dev/null | grep '^+' | grep -v '^+++' || true)
[ -n "$added" ] || exit 0
if [ -f .koni-harness/secret-allow ]; then
  while IFS= read -r pat; do
    [ -n "$pat" ] || continue
    added=$(printf '%s\n' "$added" | grep -vF "$pat" || true)
  done < .koni-harness/secret-allow
fi
hit=0
printf '%s\n' "$added" | grep -Eq 'BEGIN [A-Z ]*PRIVATE KEY' && { echo "credential-scan: PEM private key"; hit=1; }
printf '%s\n' "$added" | grep -Eq 'AKIA[0-9A-Z]{16}' && { echo "credential-scan: AWS access key id"; hit=1; }
printf '%s\n' "$added" | grep -Eq '(api[_-]?key|secret|token)[[:space:]]*[:=][[:space:]]*["'\'']?[A-Za-z0-9/+_=-]{24,}' \
  && { echo "credential-scan: hardcoded secret-like assignment"; hit=1; }
exit "$hit"
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/checks/credential-scan.sh
git add skills/koni-harness/scripts/checks/credential-scan.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): credential-scan check (high-confidence secrets)"
```

---

### Task 5: Check — `koni-docs-validate` (thin wrapper)

**Files:**
- Create: `skills/koni-harness/scripts/checks/koni-docs-validate.sh`
- Modify: `gate-test.sh` (add `test_koni_docs_validate`)

- [ ] **Step 1: Add the failing test** — wrapper must no-op (pass) when there is no `docs/` or no `npx`:

```sh
test_koni_docs_validate() {
  CH="$SCRIPTS/checks/koni-docs-validate.sh"
  d=$(newrepo)   # no docs/ dir
  assert_exit 0 "koni-docs-validate: no docs/ → skip-pass" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
}
test_koni_docs_validate
```

- [ ] **Step 2: Run — expect FAIL (script missing).** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 3: Implement `koni-docs-validate.sh`**

```sh
#!/bin/sh
# Thin wrapper: run `koni-docs validate` when available. No-op (pass) otherwise.
set -eu
[ -d docs ] || exit 0
command -v npx >/dev/null 2>&1 || { echo "koni-docs-validate: npx unavailable, skipping"; exit 0; }
npx --no-install koni-docs validate --docs-path docs/ 2>/dev/null \
  || npx koni-docs validate --docs-path docs/
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/checks/koni-docs-validate.sh
git add skills/koni-harness/scripts/checks/koni-docs-validate.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): koni-docs-validate check wrapper"
```

---

### Task 6: Check — `story-status-consistency`

**Files:**
- Create: `skills/koni-harness/scripts/checks/story-status-consistency.sh`
- Modify: `gate-test.sh` (add `test_story_status`)

- [ ] **Step 1: Add the failing test** — a story marked `done` with an unchecked AC must fail:

```sh
test_story_status() {
  CH="$SCRIPTS/checks/story-status-consistency.sh"
  d=$(newrepo); ( cd "$d" && mkdir -p docs/sprints/stories )
  # done story, all AC checked → pass
  printf -- 'status: done\n## Acceptance criteria\n- [x] AC-1\n' > "$d/docs/sprints/stories/US-1.md"
  assert_exit 0 "story-status: done + all AC checked passes" sh -c "cd '$d' && sh '$CH'"
  # done story with an unchecked AC → warn-fail (exit 1)
  printf -- 'status: done\n## Acceptance criteria\n- [ ] AC-1\n' > "$d/docs/sprints/stories/US-2.md"
  assert_exit 1 "story-status: done + unchecked AC fails" sh -c "cd '$d' && sh '$CH'"
  rm -rf "$d"
}
test_story_status
```

- [ ] **Step 2: Run — expect FAIL.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 3: Implement `story-status-consistency.sh`**

```sh
#!/bin/sh
# Warn if any story file has status: done but an unchecked acceptance-criteria box.
set -eu
dir=docs/sprints/stories
[ -d "$dir" ] || exit 0
rc=0
for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  grep -Eq '^status:[[:space:]]*done' "$f" || continue
  if grep -q '^- \[ \]' "$f"; then
    echo "story-status: $f is done but has unchecked AC/tasks"
    rc=1
  fi
done
exit "$rc"
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/checks/story-status-consistency.sh
git add skills/koni-harness/scripts/checks/story-status-consistency.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): story-status-consistency check"
```

---

### Task 7: Check — `passthrough`

**Files:**
- Create: `skills/koni-harness/scripts/checks/passthrough.sh`
- Modify: `gate-test.sh` (add `test_passthrough`)

- [ ] **Step 1: Add the failing test**

```sh
test_passthrough() {
  CH="$SCRIPTS/checks/passthrough.sh"
  assert_exit 0 "passthrough: true command passes" sh "$CH" "true"
  assert_exit 1 "passthrough: false command fails" sh "$CH" "false"
  assert_exit 0 "passthrough: empty command no-ops" sh "$CH" ""
}
test_passthrough
```

- [ ] **Step 2: Run — expect FAIL.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 3: Implement `passthrough.sh`**

```sh
#!/bin/sh
# Run a repo-provided command (test/typecheck/lint); pass its exit code through.
set -eu
cmd=${1:-}
[ -n "$cmd" ] || { echo "passthrough: no command configured, skipping"; exit 0; }
sh -c "$cmd"
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/checks/passthrough.sh
git add skills/koni-harness/scripts/checks/passthrough.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): passthrough check"
```

---

### Task 8: Non-destructive installer

**Files:**
- Create: `skills/koni-harness/scripts/install-gate.sh`
- Modify: `gate-test.sh` (add `test_install_nondestructive`)

Behavior: vendor runner+checks+config into the target's `.koni-harness/`; write a root `koni-harness.gates.conf` pointer only if absent; chain git `pre-commit`/`pre-push` behind marker blocks, **preserving any existing hook**.

- [ ] **Step 1: Add the failing test — install must NOT destroy an existing pre-commit hook**

```sh
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
```

- [ ] **Step 2: Run — expect FAIL (installer missing).** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 3: Implement `install-gate.sh`**

```sh
#!/bin/sh
# Additively install the koni-harness gate into the current repo. Never clobbers.
set -eu
SRC=""
while [ $# -gt 0 ]; do
  case "$1" in
    --source) SRC=${2:-}; shift 2 ;;
    *) echo "install-gate: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$SRC" ] || SRC=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
[ -d .git ] || { echo "install-gate: run from a git repo root" >&2; exit 2; }

# 1. vendor runner + checks + config (copy; do not overwrite an existing gates.conf)
mkdir -p .koni-harness/checks
cp "$SRC/gate-runner.sh" .koni-harness/gate-runner.sh
cp "$SRC"/checks/*.sh .koni-harness/checks/
chmod +x .koni-harness/gate-runner.sh .koni-harness/checks/*.sh
[ -f .koni-harness/gates.conf ] || cp "$SRC/gates.conf" .koni-harness/gates.conf

# 2. chain a git hook behind a marker block, preserving any existing content
chain_hook() {  # $1 hookname  $2 phase
  hook=".git/hooks/$1"
  begin='# >>> koni-harness >>>'
  end='# <<< koni-harness <<<'
  block="$begin
sh \"\$(git rev-parse --show-toplevel)/.koni-harness/gate-runner.sh\" --phase $2 || exit 1
$end"
  if [ ! -f "$hook" ]; then
    printf '#!/bin/sh\n%s\n' "$block" > "$hook"
  elif grep -q "$begin" "$hook"; then
    :   # already installed → idempotent no-op
  else
    printf '\n%s\n' "$block" >> "$hook"
  fi
  chmod +x "$hook"
}
chain_hook pre-commit work-commit
chain_hook pre-push   pre-push

echo "install-gate: koni-harness gate installed additively into .koni-harness/ + git hooks"
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/gate-test.sh`

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/install-gate.sh
git add skills/koni-harness/scripts/install-gate.sh skills/koni-harness/scripts/__tests__/gate-test.sh
git commit -m "feat(koni-harness): additive (non-destructive) gate installer"
```

---

### Task 9: Write the Standard — `references/agentic-loop-standard.md`

**Files:**
- Create: `skills/koni-harness/references/agentic-loop-standard.md`

This is a prose artifact (no TDD). It must contain exactly the four parts from spec §4.

- [ ] **Step 1: Write the document with these required sections**

Required headings and content:
1. `## The six stages` — the spec §4.1 table verbatim (stage, owner tool, entry gate), plus one paragraph that the *value is the gates between stages*, not the stages.
2. `## Context layers and load order` — the chain `AGENTS.md → CLAUDE.md → LESSONS.md → CONTEXT.md → .active-context.md`, one line each on what it is authoritative for; note automating the load is Phase 3.
3. `## Portability contract` — a table with columns *Element | Portable core | Tool adapter*, rows for: loop definition (this doc / —), gate (`gate-runner.sh`+`gates.conf` / git hook + Claude `settings.json` + Gemini/Codex one-liner), context load (the layer files / each tool's session-start mechanism). State the rule: a capability is "in the harness" only if its core is tool-neutral and its adapter is thin.
4. `## Harness engineering principles` — restate spec §2's six principles as practitioner guidance (when to add a gate, keep checks deterministic & grep-able, additive-only, degrade Claude-first features to a portable fallback).

- [ ] **Step 2: Commit**

```bash
git add skills/koni-harness/references/agentic-loop-standard.md
git commit -m "docs(koni-harness): the Koni Agentic Loop standard (tool-neutral)"
```

---

### Task 10: Write the reference trio — catalog / adapters / adoption

**Files:**
- Create: `skills/koni-harness/references/gate-catalog.md`
- Create: `skills/koni-harness/references/adapters.md`
- Create: `skills/koni-harness/references/adoption.md`

- [ ] **Step 1: Write `gate-catalog.md`** — one section per built-in check (the six from `gates.conf`). For each: *what it asserts*, *phase(s)*, *default severity*, *what it generalizes from*, and the exact one-line `gates.conf` row. Include the config grammar (`name | script | phases(csv) | severity | arg`) and how to add a custom check (drop a `*.sh` in `.koni-harness/checks/`, add a row).

- [ ] **Step 2: Write `adapters.md`** — three subsections, all calling the same vendored `.koni-harness/gate-runner.sh`:
  - `### git` — the `pre-commit`/`pre-push` marker block (copy from `install-gate.sh`).
  - `### Claude Code` — a `settings.json` snippet (PreToolUse matcher `Bash(git commit*)` or a `Stop` hook) that runs the runner; instruct to **merge** into existing settings, never replace; show the JSON to add.
  - `### Gemini / Codex / Cursor` — the documented one-liner `sh .koni-harness/gate-runner.sh --phase work-commit`; note these tools have no shared hook spec so the runner *is* the contract.

- [ ] **Step 3: Write `adoption.md`** — the spec §6 procedure as a checklist: detect existing harness, chain/wrap/merge rules, marker-block discipline, recognizing a prior 2-phase gate (Senti-Quant) and wrapping rather than duplicating, and the rule that in any repo only additive changes are allowed.

- [ ] **Step 4: Commit**

```bash
git add skills/koni-harness/references/gate-catalog.md skills/koni-harness/references/adapters.md skills/koni-harness/references/adoption.md
git commit -m "docs(koni-harness): gate-catalog + adapters + non-destructive adoption references"
```

---

### Task 11: Write `SKILL.md` (orchestrator)

**Files:**
- Modify: `skills/koni-harness/SKILL.md` (replace the WIP stub)

- [ ] **Step 1: Write the skill** with frontmatter + body

Frontmatter `description` must be pushy and boundary-aware (cf. koni-setup), triggering on: "set up the harness", "add the gate", "agentic loop", "pre-commit gate", "harness engineering", "wire verification gates", "make the loop portable". Body sections:
1. **What this owns vs. delegates** — owns the loop standard + gate; delegates doc bodies to koni-docs, scaffold to koni-setup, plan to BMAD, execute to Superpowers, review to gstack. Never reproduces them.
2. **The standard** — one-paragraph summary + pointer to `references/agentic-loop-standard.md`.
3. **Install the gate** — run `scripts/install-gate.sh` from the target repo root; explain additive behavior; pointer to `references/adoption.md`.
4. **Run / verify the gate** — `sh .koni-harness/gate-runner.sh --phase <phase> --dry-run`; pointer to `references/gate-catalog.md` + `adapters.md`.
5. **Hard invariant** — additive-only; restate the marker-block + chain/merge rule.
6. **Reference table** — the four `references/*.md` with when-to-load.

- [ ] **Step 2: Commit**

```bash
git add skills/koni-harness/SKILL.md
git commit -m "docs(koni-harness): SKILL.md orchestrator + activation surface"
```

---

### Task 12: End-to-end sandbox verification (spec §7) via independent subagents

**Files:**
- (no repo files; this is a verification gate)

- [ ] **Step 1: Run the full harness test suite**

Run: `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: all cases ok, `FAIL=0`, exit 0.

- [ ] **Step 2: Dispatch an author-blind bootstrap subagent**

Prompt a fresh subagent: "Follow `skills/koni-harness/SKILL.md` to install the gate into a NEW throwaway git repo under the scratchpad, create the four spec §7 fixtures (clean commit; VERSION bump w/o changelog; staged fake AWS key; release commit missing `[Unreleased]`), run the matching gate phase on each, and report the exit codes + any place the skill/docs were ambiguous or wrong." Capture defects.

- [ ] **Step 3: Dispatch an author-blind adopt subagent**

Prompt a second subagent: "Seed a throwaway repo that already has a `.git/hooks/pre-commit` printing a marker AND a populated `.claude/settings.json`. Run `install-gate.sh`. Verify the original hook still runs, settings JSON kept all prior keys, koni-harness additions are inside marker blocks, and re-running is idempotent. Report any non-additive behavior."

- [ ] **Step 4: Fix any defects found, re-run Step 1, commit fixes**

```bash
git add -A skills/koni-harness
git commit -m "fix(koni-harness): address sandbox verification findings"
```

---

### Task 13: Wire into this repo + koni-docs backfill + ship

**Files:**
- Create: symlinks `.claude/skills/koni-harness`, `.agents/skills/koni-harness`
- Create: `docs/sprints/stories/US-3.3-koni-harness-agentic-loop.md`
- Modify: `VERSION`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/sprints/epics/EPIC-3.md`, `docs/sprints/sprint-2026-W26.md`, `CLAUDE.md` (active sprint unchanged), `docs/CONTEXT.md` (D13 optional)

- [ ] **Step 1: Wire skill symlinks (mirror koni-docs / koni-setup)**

```bash
cd /Users/jindo9986/Documents/GitHub/Koni-Skills
ln -sfn ../../skills/koni-harness .agents/skills/koni-harness
ln -sfn ../../.agents/skills/koni-harness .claude/skills/koni-harness
test -e .claude/skills/koni-harness/SKILL.md && echo wired-ok
```

- [ ] **Step 2: Bump VERSION**

```bash
echo "0.10.0" > VERSION
```

- [ ] **Step 3: Create story US-3.3** under EPIC-3 (status done, points 5, sprint-2026-W26, version_shipped 0.10.0, prd_ref FR-21), following the koni-docs story template and the US-3.2 file as the shape reference. Acceptance criteria mirror this plan's Tasks 1–12.

- [ ] **Step 4: Add CHANGELOG `## [0.10.0]` entry, add PRD FR-21 + EPIC-3 row for US-3.3, add the story row to `sprint-2026-W26.md`, set EPIC-3 FR coverage.** Use the koni-docs skill for the exact template shapes (do NOT hand-author template text).

- [ ] **Step 5: Run koni-docs sync + status + validate**

```bash
npx koni-docs sync --docs-path docs/ --story US-3.3
npx koni-docs status --docs-path docs/
npx koni-docs validate --docs-path docs/
```

- [ ] **Step 6: Commit, then backfill the CHANGELOG/story SHA**

```bash
git add VERSION CLAUDE.md docs/ .claude/skills/koni-harness .agents/skills/koni-harness skills/koni-harness
git commit -m "feat(skills/koni-harness): ship Koni Agentic Loop standard + portable gate (US-3.3, v0.10.0)"
npx koni-docs backfill-commits --docs-path docs/
# set US-3.3 commit field to the ship SHA, then:
git add docs/ && git commit -m "docs: backfill US-3.3 commit SHA for koni-harness v0.10.0"
```

---

## Self-Review

**1. Spec coverage** (each spec section → task):
- §3 layout → Tasks 0–11 create every listed file. ✓
- §4 Standard (6 stages, context layers, portability contract, principles) → Task 9. ✓
- §5 gate-runner + config + check library + adapters → Tasks 1–7 (runner+checks), Task 10 (`adapters.md`, `gate-catalog.md`). ✓
- §6 non-destructive adoption → Task 8 (installer + idempotency/preserve tests) + Task 10 (`adoption.md`). ✓
- §7 verification → Task 12 (suite + two author-blind subagents matching the four fixtures + the non-destructive install test). ✓
- §2.5 additive invariant → enforced in Task 8 code + Task 13 (symlink/backfill only, no rewrites). ✓
- §9 open questions → resolved in "Design decisions locked" (config format, vendoring, credential ruleset). ✓

**2. Placeholder scan:** Prose-doc tasks (9–11) specify exact required headings + content rather than code; all script tasks contain complete runnable code. No "TBD"/"handle edge cases". ✓

**3. Type/name consistency:** `gate-runner.sh --phase`, phases `work-commit|release-commit|pre-push`, severities `block|warn`, vendored path `.koni-harness/`, check filenames, and `gates.conf` rows are identical across Tasks 1, 8, 10, 12. The config rows in Task 1's `gates.conf` reference exactly the six check scripts created in Tasks 2–7. ✓

**Note for executor:** Tasks 1–8 are pure POSIX shell + tests (fully TDD). Tasks 9–11 are docs (no TDD; write to the specified outline). Task 12 is a verification gate. Task 13 is the koni-docs ship — use the koni-docs skill for template bodies and follow the US-3.2 backfill as the worked example.
