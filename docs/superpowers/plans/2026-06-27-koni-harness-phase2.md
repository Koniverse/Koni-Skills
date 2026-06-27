# koni-harness Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tier-aware single-story loop-runner to the `koni-harness` skill — a thin POSIX `loop.sh` state helper (start/status/enter/gate/complete) plus an instruction brain (`loop-runner.md`) that drives one story through the six-stage Koni Agentic Loop, Claude-first with a portable manual fallback.

**Architecture:** `loop.sh` is a dependency-free POSIX helper that records loop position in a gitignored `.koni-harness/loop-state` (line `key=value`), warns on out-of-order stage transitions, and shells out to the Phase-1 `gate-runner.sh` for the commit gate. The actual stage work stays agent-driven (the brain doc tells the agent how); `loop.sh` is the deterministic spine any tool can read. Adoption is additive — the existing `install-gate.sh` is extended to vendor `loop.sh` and gitignore the state file behind a marker block.

**Tech Stack:** POSIX `sh`, `git`, `grep`/`sed`; reuses the Phase-1 `gate-runner.sh`. Tests are a self-contained POSIX harness (no `bats`).

---

## Design decisions locked from the spec

Resolves spec [§8 open questions](../specs/2026-06-27-koni-harness-phase2-loop-runner-design.md):

- **State-file override flag**: `--state <path>` (consistent across all subcommands) instead of the spec's loose `--config`. Default: `.koni-harness/loop-state`.
- **`enter` order rule** (minimal, tier-aware): warn (stderr, exit 0) when (a) the entered stage is strictly *before* the current stage in the canonical order `frame execute self-verify review doc-gate commit` (going backward), or (b) entering `commit` at tier ≥ 1 without `self-verify` already entered. Forward *skips* are allowed and silent (tier 0 legitimately skips self-verify/review).
- **`status` "next" derivation**: computed from current stage + the static `STAGES` order in `loop.sh` (next stage in sequence; at `commit`, hint to run the gate).
- **Timestamp**: `loop.sh` uses `date +%Y-%m-%d` with an `|| echo -` fallback (the state file is ephemeral/gitignored, so wall-clock is fine here).

---

## File Structure

```
skills/koni-harness/
├── SKILL.md                              # MODIFY: add "Run a story through the loop" section (Task 6)
├── references/
│   └── loop-runner.md                    # CREATE: orchestration brain (Task 5)
└── scripts/
    ├── loop.sh                           # CREATE: POSIX loop-state helper (Tasks 1–3)
    ├── install-gate.sh                   # MODIFY: vendor loop.sh + gitignore loop-state (Task 4)
    └── __tests__/
        └── loop-test.sh                  # CREATE: self-contained POSIX tests (Tasks 1–4)
```

`loop.sh` has one responsibility (track loop state + invoke the gate); the brain doc is prose; the installer change is a small additive block. The Phase-1 gate files are untouched.

## Conventions (same as Phase 1)

- `#!/bin/sh` + `set -eu`; no bashisms (`[[`, arrays, `local`). Exit `0` ok, `1` check/gate fail, `2` usage error.
- Canonical stage order: `frame execute self-verify review doc-gate commit`.

---

### Task 1: `loop.sh` core — `start` + `status` + test harness

**Files:**
- Create: `skills/koni-harness/scripts/loop.sh`
- Create: `skills/koni-harness/scripts/__tests__/loop-test.sh`

- [ ] **Step 1: Write the failing test harness with start/status cases**

Create `skills/koni-harness/scripts/__tests__/loop-test.sh`:

```sh
#!/bin/sh
# Self-contained POSIX tests for loop.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
LOOP="$HERE/../loop.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
# assert_contains <substring> <desc> <command...>
assert_contains() {
  sub=$1; desc=$2; shift 2
  out=$("$@" 2>&1 || true)
  case "$out" in *"$sub"*) ok "$desc" ;; *) no "$desc (missing '$sub' in: $out)" ;; esac
}
newstate() { d=$(mktemp -d); printf '%s/loop-state' "$d"; }

test_start_status() {
  st=$(newstate)
  sh "$LOOP" start US-9.9 --tier 1 --state "$st" >/dev/null
  # state file well-formed
  grep -q '^story=US-9.9$' "$st" && ok "start: writes story" || no "start: writes story"
  grep -q '^tier=1$' "$st" && ok "start: writes tier" || no "start: writes tier"
  grep -q '^stage=frame$' "$st" && ok "start: stage=frame" || no "start: stage=frame"
  grep -q '^entered=frame$' "$st" && ok "start: entered=frame" || no "start: entered=frame"
  assert_contains "story:   US-9.9" "status: shows story" sh "$LOOP" status --state "$st"
  assert_contains "stage:   frame" "status: shows stage" sh "$LOOP" status --state "$st"
  assert_contains "next:    enter execute" "status: next is execute" sh "$LOOP" status --state "$st"
  rm -rf "$(dirname "$st")"
}
test_start_status

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run to confirm it fails**

Run: `sh skills/koni-harness/scripts/__tests__/loop-test.sh`
Expected: FAIL — `loop.sh` missing.

- [ ] **Step 3: Implement `loop.sh` with shared helpers + `start` + `status`**

Create `skills/koni-harness/scripts/loop.sh`:

```sh
#!/bin/sh
# koni-harness loop-state helper (POSIX). Tracks one story through the six-stage loop.
# Usage: loop.sh {start <id> [--tier N]|status|enter <stage>|gate <phase>|complete} [--state PATH]
set -eu

STAGES="frame execute self-verify review doc-gate commit"
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
STATE=".koni-harness/loop-state"

now() { date +%Y-%m-%d 2>/dev/null || echo -; }
kv_get() { # key file
  [ -f "$2" ] || return 0
  sed -n "s/^$1=//p" "$2" | head -n1
}
kv_set() { # key value file
  f=$3; tmp="$f.tmp.$$"
  if [ -f "$f" ] && grep -q "^$1=" "$f"; then
    sed "s|^$1=.*|$1=$2|" "$f" > "$tmp" && mv "$tmp" "$f"
  else
    printf '%s=%s\n' "$1" "$2" >> "$f"
  fi
}
idx_of() { # stage -> 1-based index, 0 if unknown
  i=0; for s in $STAGES; do i=$((i+1)); [ "$s" = "$1" ] && { echo "$i"; return; }; done; echo 0
}

do_start() {
  story=""; tier=2
  while [ $# -gt 0 ]; do case "$1" in
    --tier) tier=$2; shift 2 ;;
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop start: unknown $1" >&2; exit 2 ;;
    *) story=$1; shift ;;
  esac; done
  [ -n "$story" ] || { echo "loop start: <story-id> required" >&2; exit 2; }
  mkdir -p "$(dirname "$STATE")"; : > "$STATE"
  kv_set story "$story" "$STATE"; kv_set tier "$tier" "$STATE"
  kv_set stage frame "$STATE"; kv_set entered frame "$STATE"; kv_set updated "$(now)" "$STATE"
  echo "loop: started $story (tier $tier) at stage frame"
}

do_status() {
  while [ $# -gt 0 ]; do case "$1" in --state) STATE=$2; shift 2 ;; *) shift ;; esac; done
  [ -f "$STATE" ] || { echo "loop: no active loop ($STATE not found)"; return 0; }
  echo "story:   $(kv_get story "$STATE")"
  echo "tier:    $(kv_get tier "$STATE")"
  stage=$(kv_get stage "$STATE")
  echo "stage:   $stage"
  echo "entered: $(kv_get entered "$STATE")"
  if [ "$stage" = commit ]; then
    echo "next:    run 'loop.sh gate work-commit' (or release-commit), then commit"
  elif [ "$stage" = complete ]; then
    echo "next:    (loop complete)"
  else
    ci=$(idx_of "$stage"); ni=$((ci+1)); nxt=""; i=0
    for s in $STAGES; do i=$((i+1)); [ "$i" -eq "$ni" ] && nxt=$s; done
    echo "next:    enter $nxt"
  fi
}

cmd=${1:-}; [ $# -gt 0 ] && shift || true
case "$cmd" in
  start)    do_start "$@" ;;
  status)   do_status "$@" ;;
  *) echo "usage: loop.sh {start|status|enter|gate|complete} [--state PATH] ..." >&2; exit 2 ;;
esac
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `sh skills/koni-harness/scripts/__tests__/loop-test.sh`
Expected: `PASS=7 FAIL=0`.

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/loop.sh skills/koni-harness/scripts/__tests__/loop-test.sh
git add skills/koni-harness/scripts/loop.sh skills/koni-harness/scripts/__tests__/loop-test.sh
git commit -m "feat(koni-harness): loop.sh core — start/status + loop-state + test harness"
```

---

### Task 2: `loop.sh enter` — ordered stage transitions with warnings

**Files:**
- Modify: `skills/koni-harness/scripts/loop.sh`
- Modify: `skills/koni-harness/scripts/__tests__/loop-test.sh` (add `test_enter`)

- [ ] **Step 1: Add the failing test** (insert before the `echo "----"` line)

```sh
test_enter() {
  st=$(newstate); sh "$LOOP" start US-9.9 --tier 2 --state "$st" >/dev/null
  # in-order enter is silent on stderr and updates stage
  err=$(sh "$LOOP" enter execute --state "$st" 2>&1 >/dev/null || true)
  [ -z "$err" ] && ok "enter: in-order is silent" || no "enter: in-order silent (got: $err)"
  grep -q '^stage=execute$' "$st" && ok "enter: updates stage" || no "enter: updates stage"
  case "$(kv=$(sed -n 's/^entered=//p' "$st"); echo "$kv")" in *execute*) ok "enter: appends entered" ;; *) no "enter: appends entered" ;; esac
  # backward enter warns
  err=$(sh "$LOOP" enter frame --state "$st" 2>&1 >/dev/null || true)
  case "$err" in *WARN*backward*) ok "enter: backward warns" ;; *) no "enter: backward warns (got: $err)" ;; esac
  # commit without self-verify at tier 2 warns
  st2=$(newstate); sh "$LOOP" start US-9.8 --tier 2 --state "$st2" >/dev/null
  sh "$LOOP" enter execute --state "$st2" >/dev/null
  err=$(sh "$LOOP" enter commit --state "$st2" 2>&1 >/dev/null || true)
  case "$err" in *WARN*self-verify*) ok "enter: commit-without-self-verify warns" ;; *) no "enter: commit warn (got: $err)" ;; esac
  # tier 0 commit without self-verify is silent
  st3=$(newstate); sh "$LOOP" start US-9.7 --tier 0 --state "$st3" >/dev/null
  sh "$LOOP" enter execute --state "$st3" >/dev/null
  err=$(sh "$LOOP" enter commit --state "$st3" 2>&1 >/dev/null || true)
  [ -z "$err" ] && ok "enter: tier0 commit silent" || no "enter: tier0 commit silent (got: $err)"
  rm -rf "$(dirname "$st")" "$(dirname "$st2")" "$(dirname "$st3")"
}
test_enter
```

- [ ] **Step 2: Run — expect FAIL** (`enter` unknown subcommand). `sh skills/koni-harness/scripts/__tests__/loop-test.sh`

- [ ] **Step 3: Implement `do_enter` and wire it into the dispatch**

Add this function after `do_status` in `loop.sh`:

```sh
do_enter() {
  stage=""
  while [ $# -gt 0 ]; do case "$1" in
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop enter: unknown $1" >&2; exit 2 ;;
    *) stage=$1; shift ;;
  esac; done
  [ -n "$stage" ] || { echo "loop enter: <stage> required" >&2; exit 2; }
  [ -f "$STATE" ] || { echo "loop enter: no active loop; run 'loop.sh start' first" >&2; exit 2; }
  ni=$(idx_of "$stage")
  [ "$ni" -gt 0 ] || { echo "loop enter: unknown stage '$stage' (one of: $STAGES)" >&2; exit 2; }
  cur=$(kv_get stage "$STATE"); ci=$(idx_of "$cur")
  tier=$(kv_get tier "$STATE"); entered=$(kv_get entered "$STATE")
  [ "$ni" -lt "$ci" ] && echo "loop WARN: entering '$stage' is before current '$cur' (going backward)" >&2
  if [ "$stage" = commit ] && [ "${tier:-2}" -ge 1 ]; then
    echo ",$entered," | grep -q ",self-verify," || \
      echo "loop WARN: entering 'commit' without 'self-verify' (tier $tier)" >&2
  fi
  kv_set stage "$stage" "$STATE"
  echo ",$entered," | grep -q ",$stage," || kv_set entered "$entered,$stage" "$STATE"
  kv_set updated "$(now)" "$STATE"
  echo "loop: entered $stage"
}
```

Then add `enter) do_enter "$@" ;;` to the `case "$cmd"` dispatch (before the `*)` default).

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/loop-test.sh`
Expected: `FAIL=0`.

- [ ] **Step 5: Commit**

```bash
git add skills/koni-harness/scripts/loop.sh skills/koni-harness/scripts/__tests__/loop-test.sh
git commit -m "feat(koni-harness): loop.sh enter — ordered transitions with backward/commit warnings"
```

---

### Task 3: `loop.sh gate` (passthrough to gate-runner) + `complete`

**Files:**
- Modify: `skills/koni-harness/scripts/loop.sh`
- Modify: `skills/koni-harness/scripts/__tests__/loop-test.sh` (add `test_gate_complete`)

- [ ] **Step 1: Add the failing test** (insert before `echo "----"`)

```sh
test_gate_complete() {
  st=$(newstate); d=$(dirname "$st")
  sh "$LOOP" start US-9.6 --tier 1 --state "$st" >/dev/null
  # stub a gate-runner next to loop.sh's resolution path: use a local .koni-harness with a stub
  mkdir -p "$d/.koni-harness"
  printf '#!/bin/sh\nexit 0\n' > "$d/.koni-harness/gate-runner.sh"; chmod +x "$d/.koni-harness/gate-runner.sh"
  # run from $d so the fallback './.koni-harness/gate-runner.sh' resolves
  ( cd "$d" && sh "$LOOP" gate work-commit --state "$st" >/dev/null ) \
    && ok "gate: pass exits 0" || no "gate: pass exits 0"
  grep -q '^gate_work-commit=pass$' "$st" && ok "gate: records pass" || no "gate: records pass"
  # failing gate → exit 1, records block
  printf '#!/bin/sh\nexit 1\n' > "$d/.koni-harness/gate-runner.sh"
  if ( cd "$d" && sh "$LOOP" gate work-commit --state "$st" >/dev/null 2>&1 ); then no "gate: block exits non-zero"; else ok "gate: block exits non-zero"; fi
  grep -q '^gate_work-commit=block$' "$st" && ok "gate: records block" || no "gate: records block"
  # complete
  sh "$LOOP" complete --state "$st" >/dev/null
  grep -q '^stage=complete$' "$st" && ok "complete: stage=complete" || no "complete: stage=complete"
  rm -rf "$d"
}
test_gate_complete
```

- [ ] **Step 2: Run — expect FAIL.** `sh skills/koni-harness/scripts/__tests__/loop-test.sh`

- [ ] **Step 3: Implement `do_gate` + `do_complete` and wire dispatch**

Add after `do_enter` in `loop.sh`:

```sh
do_gate() {
  phase=""
  while [ $# -gt 0 ]; do case "$1" in
    --state) STATE=$2; shift 2 ;;
    -*) echo "loop gate: unknown $1" >&2; exit 2 ;;
    *) phase=$1; shift ;;
  esac; done
  [ -n "$phase" ] || { echo "loop gate: <phase> required" >&2; exit 2; }
  runner="$SELF_DIR/gate-runner.sh"
  [ -f "$runner" ] || runner=".koni-harness/gate-runner.sh"
  [ -f "$runner" ] || { echo "loop gate: gate-runner.sh not found" >&2; exit 2; }
  if sh "$runner" --phase "$phase"; then rc=0; res=pass; else rc=$?; res=block; fi
  [ -f "$STATE" ] && kv_set "gate_$phase" "$res" "$STATE"
  exit "$rc"
}

do_complete() {
  while [ $# -gt 0 ]; do case "$1" in --state) STATE=$2; shift 2 ;; *) shift ;; esac; done
  [ -f "$STATE" ] || { echo "loop complete: no active loop" >&2; exit 2; }
  kv_set stage complete "$STATE"; kv_set updated "$(now)" "$STATE"
  echo "loop: complete"
}
```

Then add to the dispatch `case`: `gate) do_gate "$@" ;;` and `complete) do_complete "$@" ;;`.

Note: in `do_gate`, `rc=$?` is the FIRST statement in the `else` branch so it captures the runner's exit code before any assignment resets `$?`.

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/loop-test.sh`
Expected: `FAIL=0`.

- [ ] **Step 5: Commit**

```bash
git add skills/koni-harness/scripts/loop.sh skills/koni-harness/scripts/__tests__/loop-test.sh
git commit -m "feat(koni-harness): loop.sh gate (passthrough to gate-runner) + complete"
```

---

### Task 4: Extend `install-gate.sh` — vendor `loop.sh` + gitignore `loop-state`

**Files:**
- Modify: `skills/koni-harness/scripts/install-gate.sh`
- Modify: `skills/koni-harness/scripts/__tests__/loop-test.sh` (add `test_install_loop`)

- [ ] **Step 1: Add the failing test** (insert before `echo "----"`)

```sh
test_install_loop() {
  INS="$HERE/../install-gate.sh"; SRC="$HERE/.."
  d=$(mktemp -d); ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  ( cd "$d" && sh "$INS" --source "$SRC" >/dev/null 2>&1 )
  [ -f "$d/.koni-harness/loop.sh" ] && ok "install: vendors loop.sh" || no "install: vendors loop.sh"
  grep -q '.koni-harness/loop-state' "$d/.gitignore" && ok "install: gitignores loop-state" || no "install: gitignores loop-state"
  # idempotent: re-run keeps a single gitignore marker block
  ( cd "$d" && sh "$INS" --source "$SRC" >/dev/null 2>&1 )
  n=$(grep -c '>>> koni-harness >>>' "$d/.gitignore")
  [ "$n" -eq 1 ] && ok "install: gitignore marker idempotent" || no "install: gitignore marker idempotent (got $n)"
  rm -rf "$d"
}
test_install_loop
```

- [ ] **Step 2: Run — expect FAIL** (loop.sh not vendored, no gitignore entry). `sh skills/koni-harness/scripts/__tests__/loop-test.sh`

- [ ] **Step 3: Extend `install-gate.sh`**

In `install-gate.sh`, in the vendoring section (right after the checks are copied and `chmod`-ed, before the hook-chaining), add:

```sh
# vendor the loop-runner helper alongside the gate
cp "$SRC/loop.sh" .koni-harness/loop.sh
chmod +x .koni-harness/loop.sh

# gitignore the ephemeral loop-state (additive, marker-bounded, idempotent)
gi=.gitignore
gbegin='# >>> koni-harness >>>'
gend='# <<< koni-harness <<<'
if [ ! -f "$gi" ] || ! grep -q "$gbegin" "$gi"; then
  printf '%s\n.koni-harness/loop-state\n%s\n' "$gbegin" "$gend" >> "$gi"
fi
```

(The `$SRC` variable and the `.koni-harness/` dir already exist in the Phase-1 installer; this block reuses them.)

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/loop-test.sh`
Expected: `FAIL=0`.

- [ ] **Step 5: Run the Phase-1 suite too — confirm no regression**

Run: `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: `PASS=34 FAIL=0` (installer change must not break Phase-1 install tests).

- [ ] **Step 6: Commit**

```bash
git add skills/koni-harness/scripts/install-gate.sh skills/koni-harness/scripts/__tests__/loop-test.sh
git commit -m "feat(koni-harness): installer vendors loop.sh + gitignores loop-state (additive)"
```

---

### Task 5: Write the orchestration brain — `references/loop-runner.md`

**Files:**
- Create: `skills/koni-harness/references/loop-runner.md`

Prose artifact (no TDD). Read the shipped `loop.sh` first so the doc matches the real CLI.

- [ ] **Step 1: Write the document** with these required `##` sections:

1. `## Driving a story through the loop` — the six-stage drive table (stage | what the runner does, incl. the exact `loop.sh` call | tool), exactly per spec §5.1: `frame` (find/flip story → in-progress, pick tier, `loop.sh start <id> --tier N`), `execute` (`loop.sh enter execute`; Superpowers TDD, subagent for tier ≥ 1), `self-verify` (`loop.sh enter self-verify`; tests/build green), `review` (`loop.sh enter review`; spec-compliance then code-quality subagent), `doc-gate` (`loop.sh enter doc-gate`; koni-docs backfill + `koni-docs validate`), `commit` (`loop.sh enter commit`; `loop.sh gate work-commit`; commit only if it passes).
2. `## Tier-awareness` — restate the right-sizing table from the Standard and map each tier to the stage set it runs (tier 0: frame→execute→commit+gate; tier 1: + self-verify + single-pass review + doc-gate; tier 2: full incl. two-stage review + koni-docs backfill). State plainly: the gate stage runs at every tier.
3. `## Portable fallback` — Claude drives stages via Task/subagents; Gemini/Codex/Cursor run each stage manually but call the same `loop.sh enter` / `loop.sh gate` so the spine + gate are identical. Subagent fan-out is a Claude optimization, never required.
4. `## Resumability` — an interrupted loop resumes from `loop.sh status` (position lives in `.koni-harness/loop-state`, not the agent's memory).
5. `## Command reference` — the five `loop.sh` subcommands with their exact signatures and the `--state` override, copied from the implemented script.

- [ ] **Step 2: Commit**

```bash
git add skills/koni-harness/references/loop-runner.md
git commit -m "docs(koni-harness): loop-runner orchestration brain (six-stage drive + tiers + fallback)"
```

---

### Task 6: Add the loop section to `SKILL.md`

**Files:**
- Modify: `skills/koni-harness/SKILL.md`

- [ ] **Step 1: Add a "Run a story through the loop" section** after the existing "Run / verify the gate" section. Content:
  - One paragraph: the loop-runner drives a single story through the six stages, tier-aware, with `loop.sh` as the deterministic spine and the Phase-1 gate as the commit backbone.
  - The quickstart sequence:
    ```sh
    sh .koni-harness/loop.sh start US-X.Y --tier 2
    sh .koni-harness/loop.sh status
    sh .koni-harness/loop.sh enter execute      # …self-verify, review, doc-gate, commit
    sh .koni-harness/loop.sh gate work-commit
    sh .koni-harness/loop.sh complete
    ```
  - A pointer to `references/loop-runner.md` for the full stage-by-stage drive + tiers + fallback.
  - Add `references/loop-runner.md` as a row in the SKILL.md reference table.

- [ ] **Step 2: Commit**

```bash
git add skills/koni-harness/SKILL.md
git commit -m "docs(koni-harness): SKILL.md — Run a story through the loop section"
```

---

### Task 7: Author-blind sandbox verification

**Files:** (none — verification gate)

- [ ] **Step 1: Run both suites**

Run: `sh skills/koni-harness/scripts/__tests__/loop-test.sh` and `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: both `FAIL=0`.

- [ ] **Step 2: Dispatch an author-blind subagent**

Prompt a fresh subagent: "Using only `skills/koni-harness/SKILL.md` + `references/loop-runner.md`, install the harness into a NEW throwaway git repo under the scratchpad, then drive a fake tier-1 story `US-0.1` through the loop using the vendored `.koni-harness/loop.sh`: start → enter each stage in order → run the gate (stage a clean change so it passes) → complete. After each step run `loop.sh status` and confirm it tracks position. Also try entering a stage out of order and confirm it warns. Report the `loop-state` contents at the end, the status outputs, exit codes, and any place the brain doc or CLI was ambiguous or didn't match. Do NOT touch any real repo."

- [ ] **Step 3: Fix any defects found, re-run Step 1, commit fixes**

```bash
git add -A skills/koni-harness
git commit -m "fix(koni-harness): address Phase 2 sandbox verification findings"
```

---

### Task 8: koni-docs backfill + ship

**Files:**
- Modify: `VERSION`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/sprints/epics/EPIC-3.md`, `docs/sprints/sprint-2026-W26.md`
- Create: `docs/sprints/stories/US-3.4-koni-harness-loop-runner.md`

- [ ] **Step 1: Bump VERSION**

```bash
echo "0.11.0" > VERSION
```

- [ ] **Step 2: Create story US-3.4** under EPIC-3 (status done, points 3, sprint-2026-W26, version_shipped 0.11.0, prd_ref FR-22, depends_on US-3.3), mirroring the US-3.3 file shape. AC mirror Tasks 1–7.

- [ ] **Step 3: Add FR-22 to PRD** (koni-harness Phase 2 — single-story loop-runner: `loop.sh` state spine + `loop-runner.md` brain; tier-aware; additive install), add the US-3.4 row to the EPIC-3 index + EPIC-3.md FR coverage/stories, add US-3.4 to sprint-2026-W26 (now 3 stories / 13 pts), bump PRD version/date/editHistory to 0.11.0. Use the koni-docs templates/shapes (do not hand-author template text).

- [ ] **Step 4: Add CHANGELOG `## [0.11.0]`** entry describing the loop-runner.

- [ ] **Step 5: Run koni-docs sync + status + validate**

```bash
npx koni-docs sync --docs-path docs/ --story US-3.4
npx koni-docs status --docs-path docs/
npx koni-docs validate --docs-path docs/
```
Expected: sync ok; status regenerates; validate shows only the pre-existing US-1.1→sprint-2026-W19 warning (unrelated).

- [ ] **Step 6: Commit + backfill SHA**

```bash
git add VERSION docs/ skills/koni-harness
git commit -m "feat(skills/koni-harness): single-story loop-runner (US-3.4, v0.11.0)"
npx koni-docs backfill-commits --docs-path docs/
# set US-3.4 commit: field to the ship SHA, then:
git add docs/ && git commit -m "docs: backfill US-3.4 commit SHA for koni-harness v0.11.0"
```

---

## Self-Review

**1. Spec coverage** (spec § → task):
- §3 layout (loop.sh, loop-runner.md, install-gate.sh mod, loop-test.sh) → Tasks 1–6. ✓
- §4 loop-state helper (format, CLI start/status/enter/gate/complete, `--state`, exit codes) → Tasks 1–3. ✓
- §5 orchestration brain (stage drive, tiers, fallback, resumability) → Task 5. ✓
- §6 installer extension (vendor loop.sh + gitignore marker, idempotent) → Task 4. ✓
- §7 verification (loop-test, installer regression, author-blind) → Tasks 1–4 + 7. ✓
- §2 additive invariant → Task 4 (marker-bounded gitignore, reuse installer) + Task 8 (additive docs). ✓
- §8 open questions → resolved in "Design decisions locked". ✓

**2. Placeholder scan:** Script tasks (1–4) carry complete code; doc tasks (5–6) specify exact required sections; Task 8 follows the US-3.3 worked example. No "TBD"/"handle edge cases". ✓

**3. Type/name consistency:** subcommands `start|status|enter|gate|complete`, `--state`/`--tier`, state keys `story|tier|stage|entered|gate_<phase>|updated`, stage order `frame execute self-verify review doc-gate commit`, and the `.koni-harness/loop-state` path are identical across Tasks 1–8 and match the spec. The `do_gate` `rc=$?`-first ordering is called out to avoid the `$?`-reset bug. ✓

**Note for executor:** Tasks 1–4 are TDD POSIX shell; Tasks 5–6 are docs (no TDD); Task 7 is a verification gate; Task 8 is the koni-docs ship — follow US-3.3 as the worked backfill example and use the koni-docs skill for template bodies.
