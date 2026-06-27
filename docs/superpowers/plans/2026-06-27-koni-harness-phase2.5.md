# koni-harness P2.5 (Sprint-Sequencer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a portable, read-only `sprint.sh` to the `koni-harness` skill that reads koni-docs story frontmatter and answers "what story is ready to start next?" (`sprint.sh next`, dependency-ready + priority-ordered) and "where is the sprint?" (`sprint.sh status`, counts/points/blocked-with-reasons).

**Architecture:** A dependency-free POSIX script scans `docs/sprints/stories/*.md`, parses `id`/`status`/`priority`/`points`/`sprint`/`depends_on` (multi-line YAML list via awk), filters to the active sprint, computes readiness (all deps `done`) and ordering. Read-only, stdout only. The existing `install-gate.sh` is extended to vendor it. It composes koni-docs (reads status; never writes) and complements the per-story `loop.sh`.

**Tech Stack:** POSIX `sh`, `git`, `grep`/`sed`/`awk`/`sort`. Tests are a self-contained POSIX harness (no `bats`).

---

## Design decisions locked from the spec

Resolves spec [§7 open questions](../specs/2026-06-27-koni-harness-phase2.5-sprint-sequencer-design.md):

- **Record format for sorting**: build lines `rank|id|title` and `sort -t'|' -k1,1n -k2,2`; rank from `prio_rank` (P0→0 … P3→3, missing→9).
- **`depends_on` awk**: enter on `^depends_on:`, collect `^[[:space:]]*-` item ids, **stop at the next top-level key** (`^[A-Za-z_]+:`). Inline `[]` or absent → no deps.
- **readiness**: a not-`done` story is ready iff every dep id resolves to a story whose `status` is `done`; an unresolvable/absent dep counts as *not satisfied*.
- **`set -e` safety**: `field()` is a `grep|head|sed` pipeline (exit = sed = 0, never aborts on no-match); loops over `$(deps_of …)` are safe.

## File Structure

```
skills/koni-harness/
├── SKILL.md                          # MODIFY: add a "Pick the next story" pointer (Task 4)
├── references/
│   └── sprint-sequencer.md           # CREATE: what sprint.sh computes + usage (Task 4)
└── scripts/
    ├── sprint.sh                     # CREATE: cross-story sprint query (Tasks 1–2)
    ├── install-gate.sh               # MODIFY: vendor sprint.sh (Task 3)
    └── __tests__/
        └── sprint-test.sh            # CREATE: self-contained POSIX tests (Tasks 1–3)
```

## Conventions

- `#!/bin/sh` + `set -eu`; no bashisms. Read-only; stdout only. Exit `0` on success (incl. "none ready"), `2` on usage error / unresolvable sprint.
- Canonical priority rank: `P0→0 P1→1 P2→2 P3→3`, missing→9.

---

### Task 1: `sprint.sh next` + test harness

**Files:**
- Create: `skills/koni-harness/scripts/sprint.sh`
- Create: `skills/koni-harness/scripts/__tests__/sprint-test.sh`

- [ ] **Step 1: Write the failing test harness**

Create `skills/koni-harness/scripts/__tests__/sprint-test.sh`:

```sh
#!/bin/sh
# Self-contained POSIX tests for sprint.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SP="$HERE/../sprint.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
have() { case "$2" in *"$1"*) ok "$3" ;; *) no "$3 (missing '$1')" ;; esac; }
hasnt() { case "$2" in *"$1"*) no "$3 (unexpected '$1')" ;; *) ok "$3" ;; esac; }

# fixture: a repo with a sprint of 4 stories
mkfix() {
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-X  # active\n' > "$d/CLAUDE.md"
  mkstory() { # file id status priority pts deps...
    f="$st/$1.md"; id=$2; status=$3; pri=$4; pts=$5; shift 5
    { printf -- '---\nid: %s\ntitle: "%s demo"\nstatus: %s\npriority: %s\npoints: %s\nsprint: sprint-X\n' "$id" "$id" "$status" "$pri" "$pts"
      if [ $# -gt 0 ]; then printf 'depends_on:\n'; for d2 in "$@"; do printf -- '  - %s\n' "$d2"; done
      else printf 'depends_on: []\n'; fi
      printf 'created: 2026-06-27\n---\nbody\n'
    } > "$f"
  }
  mkstory US-A done    P1 3
  mkstory US-B planned P1 5 US-A
  mkstory US-C planned P1 2 US-B
  mkstory US-D planned P0 1
  printf '%s' "$d"
}

test_next() {
  d=$(mkfix)
  out=$(sh "$SP" next --root "$d")
  have "US-D" "$out" "next: US-D ready (P0, no deps)"
  have "US-B" "$out" "next: US-B ready (dep US-A done)"
  hasnt "US-C" "$out" "next: US-C excluded (dep US-B not done)"
  hasnt "US-A" "$out" "next: US-A excluded (already done)"
  # US-D (P0) listed before US-B (P1)
  case "$out" in *US-D*US-B*) ok "next: P0 ordered before P1" ;; *) no "next: ordering (US-D before US-B)" ;; esac
  have "loop.sh start US-D" "$out" "next: suggests starting US-D"
  rm -rf "$d"
}
test_next

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run — expect FAIL** (script missing). `sh skills/koni-harness/scripts/__tests__/sprint-test.sh`

- [ ] **Step 3: Implement `sprint.sh` (`next` + shared helpers)**

```sh
#!/bin/sh
# koni-harness sprint-sequencer (POSIX, read-only). Cross-story sprint queries.
# Usage: sprint.sh {next|status} [--sprint <id>] [--docs <dir>] [--root <dir>]
set -eu
cmd=${1:-}; [ $# -gt 0 ] && shift || true
ROOT=""; DOCS=""; SPRINT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT=${2:-}; shift 2 ;;
    --docs) DOCS=${2:-}; shift 2 ;;
    --sprint) SPRINT=${2:-}; shift 2 ;;
    *) echo "sprint: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$ROOT" ] || ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
[ -n "$DOCS" ] || DOCS="$ROOT/docs"
STORIES="$DOCS/sprints/stories"
if [ -z "$SPRINT" ] && [ -f "$ROOT/CLAUDE.md" ]; then
  SPRINT=$(grep -E '^[[:space:]]*active_sprint:' "$ROOT/CLAUDE.md" 2>/dev/null | head -n1 \
    | sed 's/^[^:]*://; s/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//' || true)
fi
[ -n "$SPRINT" ] || { echo "sprint: no sprint resolved (pass --sprint or set active_sprint in CLAUDE.md)" >&2; exit 2; }

field() { # field file -> trimmed value (quotes + trailing comment stripped)
  grep -E "^$1:" "$2" 2>/dev/null | head -n1 \
    | sed "s/^$1:[[:space:]]*//; s/[[:space:]]*#.*//; s/^[[:space:]]*//; s/[[:space:]]*\$//; s/^[\"']//; s/[\"']\$//"
}
deps_of() { # file -> space-separated dep ids
  awk '
    /^depends_on:/ { indep=1; next }
    indep==1 {
      if ($0 ~ /^[A-Za-z_]+:/) { indep=0; next }
      if ($0 ~ /^[[:space:]]*-[[:space:]]*/) {
        id=$0; sub(/^[[:space:]]*-[[:space:]]*/,"",id); sub(/[[:space:]].*/,"",id)
        sub(/#.*/,"",id); gsub(/["'\'']/,"",id); if (id!="") printf "%s ", id
      }
    }
  ' "$1"
}
prio_rank() { case "$1" in P0) echo 0 ;; P1) echo 1 ;; P2) echo 2 ;; P3) echo 3 ;; *) echo 9 ;; esac; }
status_of_id() { # id -> status of the story whose id matches (empty if none)
  for f in "$STORIES"/*.md; do
    [ -e "$f" ] || continue
    [ "$(field id "$f")" = "$1" ] && { field status "$f"; return; }
  done
}
in_sprint_files() { # echo story files whose sprint == $SPRINT
  for f in "$STORIES"/*.md; do
    [ -e "$f" ] || continue
    [ "$(field sprint "$f")" = "$SPRINT" ] && echo "$f"
  done
}

do_next() {
  ready=''
  for f in $(in_sprint_files); do
    [ "$(field status "$f")" = done ] && continue
    id=$(field id "$f"); title=$(field title "$f"); pr=$(field priority "$f")
    blocked=0
    for d in $(deps_of "$f"); do
      [ "$(status_of_id "$d")" = done ] || { blocked=1; break; }
    done
    [ "$blocked" -eq 0 ] && ready=$(printf '%s%s|%s|%s\n' "$ready" "$(prio_rank "$pr")" "$id" "$title")
  done
  if [ -z "$ready" ]; then
    echo "No ready stories in $SPRINT. Run 'sprint.sh status' to see blockers."
    return 0
  fi
  echo "Ready stories in $SPRINT (priority order):"
  printf '%s\n' "$ready" | sort -t'|' -k1,1n -k2,2 | sed 's/^[0-9]*|/- /; s/|/  —  /'
  first=$(printf '%s\n' "$ready" | sort -t'|' -k1,1n -k2,2 | head -n1 | cut -d'|' -f2)
  echo
  echo "→ start: loop.sh start $first"
}

case "$cmd" in
  next) do_next ;;
  *) echo "usage: sprint.sh {next|status} [--sprint <id>] [--docs <dir>] [--root <dir>]" >&2; exit 2 ;;
esac
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/sprint-test.sh`
Expected: `PASS=6 FAIL=0`.

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/sprint.sh skills/koni-harness/scripts/__tests__/sprint-test.sh
git add skills/koni-harness/scripts/sprint.sh skills/koni-harness/scripts/__tests__/sprint-test.sh
git commit -m "feat(koni-harness): sprint.sh next — dependency-ready story selection + tests"
```

---

### Task 2: `sprint.sh status` + "none ready" case

**Files:**
- Modify: `skills/koni-harness/scripts/sprint.sh`
- Modify: `skills/koni-harness/scripts/__tests__/sprint-test.sh` (add tests)

- [ ] **Step 1: Add the failing tests** (insert before `echo "----"`)

```sh
test_status() {
  d=$(mkfix)
  out=$(sh "$SP" status --root "$d")
  have "1/4 done" "$out" "status: done/total count"
  have "US-C blocked by: US-B" "$out" "status: blocked names unmet dep"
  rm -rf "$d"
}
test_status

test_none_ready() {
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-Z\n' > "$d/CLAUDE.md"
  # only story is planned and depends on a missing story
  printf -- '---\nid: US-1\ntitle: "x"\nstatus: planned\npriority: P1\npoints: 1\nsprint: sprint-Z\ndepends_on:\n  - US-0\ncreated: 2026-06-27\n---\n' > "$st/US-1.md"
  out=$(sh "$SP" next --root "$d")
  have "No ready stories" "$out" "next: none-ready message"
  rm -rf "$d"
}
test_none_ready
```

- [ ] **Step 2: Run — expect FAIL** (status not implemented; `status` hits the usage default). `sh skills/koni-harness/scripts/__tests__/sprint-test.sh`

- [ ] **Step 3: Implement `do_status` and wire dispatch**

Add after `do_next` in `sprint.sh`:

```sh
do_status() {
  d=0; ip=0; pl=0; bl=0; ot=0; total=0; ptot=0; pdone=0; blist=''
  for f in $(in_sprint_files); do
    total=$((total+1))
    st=$(field status "$f"); id=$(field id "$f"); pts=$(field points "$f")
    case "$pts" in ''|*[!0-9]*) pts=0 ;; esac
    ptot=$((ptot+pts))
    case "$st" in
      done) d=$((d+1)); pdone=$((pdone+pts)) ;;
      in-progress) ip=$((ip+1)) ;;
      planned) pl=$((pl+1)) ;;
      blocked) bl=$((bl+1)) ;;
      *) ot=$((ot+1)) ;;
    esac
    if [ "$st" != done ]; then
      unmet=''
      for dep in $(deps_of "$f"); do
        [ "$(status_of_id "$dep")" = done ] || unmet="$unmet $dep"
      done
      [ -n "$unmet" ] && blist=$(printf '%s- %s blocked by:%s\n' "$blist" "$id" "$unmet")
    fi
  done
  echo "Sprint $SPRINT — $d/$total done, $pdone/$ptot pts"
  echo "  in-progress: $ip · planned: $pl · blocked(status): $bl · other: $ot"
  if [ -n "$blist" ]; then
    echo; echo "Blocked by unmet dependencies:"; printf '%s\n' "$blist"
  fi
}
```

Change the dispatch `case` to add the `status` arm:

```sh
case "$cmd" in
  next) do_next ;;
  status) do_status ;;
  *) echo "usage: sprint.sh {next|status} [--sprint <id>] [--docs <dir>] [--root <dir>]" >&2; exit 2 ;;
esac
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/sprint-test.sh`
Expected: `FAIL=0`.

- [ ] **Step 5: Commit**

```bash
git add skills/koni-harness/scripts/sprint.sh skills/koni-harness/scripts/__tests__/sprint-test.sh
git commit -m "feat(koni-harness): sprint.sh status — counts/points/blocked-with-reasons"
```

---

### Task 3: Extend `install-gate.sh` to vendor `sprint.sh`

**Files:**
- Modify: `skills/koni-harness/scripts/install-gate.sh`
- Modify: `skills/koni-harness/scripts/__tests__/sprint-test.sh` (add `test_install`)

- [ ] **Step 1: Add the failing test** (insert before `echo "----"`)

```sh
test_install() {
  INS="$HERE/../install-gate.sh"; SRC="$HERE/.."
  d=$(mktemp -d); ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  ( cd "$d" && sh "$INS" --source "$SRC" >/dev/null 2>&1 )
  [ -f "$d/.koni-harness/sprint.sh" ] && ok "install: vendors sprint.sh" || no "install: vendors sprint.sh"
  [ -x "$d/.koni-harness/sprint.sh" ] && ok "install: sprint.sh executable" || no "install: sprint.sh executable"
  rm -rf "$d"
}
test_install
```

- [ ] **Step 2: Run — expect FAIL.** `sh skills/koni-harness/scripts/__tests__/sprint-test.sh`

- [ ] **Step 3: Extend `install-gate.sh`**

In the vendoring section (right after the `cp "$SRC/context-load.sh" .koni-harness/context-load.sh` / `chmod` lines from P3a), add:

```sh
# vendor the sprint-sequencer alongside the other helpers
cp "$SRC/sprint.sh" .koni-harness/sprint.sh
chmod +x .koni-harness/sprint.sh
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/sprint-test.sh`

- [ ] **Step 5: Confirm no regression in the other suites**

Run each: `context-test.sh`, `loop-test.sh`, `gate-test.sh`.
Expected: all `FAIL=0`.

- [ ] **Step 6: Commit**

```bash
git add skills/koni-harness/scripts/install-gate.sh skills/koni-harness/scripts/__tests__/sprint-test.sh
git commit -m "feat(koni-harness): installer vendors sprint.sh (additive)"
```

---

### Task 4: `references/sprint-sequencer.md` + SKILL.md pointer

**Files:**
- Create: `skills/koni-harness/references/sprint-sequencer.md`
- Modify: `skills/koni-harness/SKILL.md`

- [ ] **Step 1: Write `references/sprint-sequencer.md`** (match the implemented script). Sections:
  1. `## What it computes` — `next` (ready = not-done + all `depends_on` resolve to `done`; ordered by priority then id; suggests `loop.sh start <id>`) and `status` (counts by status, points done/total, blocked list naming unmet deps). State it reads koni-docs story frontmatter and **never writes** — koni-docs owns status.
  2. `## Usage` — `sh .koni-harness/sprint.sh next|status [--sprint <id>] [--docs <dir>] [--root <dir>]`; defaults (sprint from CLAUDE.md `active_sprint`, root via git toplevel, docs `docs/`); exit 0 incl. "none ready", 2 on usage/unresolvable sprint.
  3. `## How it fits the loop` — `sprint.sh next` (pick) → `loop.sh start <id>` (run that story) → gate at commit. One line: the cross-story complement to the per-story loop-runner.
  4. `## Limits` — single sprint, no parallel fan-out (dropped, YAGNI); a dep on a story outside the corpus counts as unmet (reported as blocked).

- [ ] **Step 2: Add to `SKILL.md`** a short "Pick the next story" subsection: one line + `sh .koni-harness/sprint.sh next` / `status` + pointer to `references/sprint-sequencer.md`; add a reference-table row.

- [ ] **Step 3: Commit**

```bash
git add skills/koni-harness/references/sprint-sequencer.md skills/koni-harness/SKILL.md
git commit -m "docs(koni-harness): sprint-sequencer reference + SKILL.md pointer"
```

---

### Task 5: Author-blind sandbox verification

**Files:** (none — verification gate)

- [ ] **Step 1: Run all four suites**

Run each: `sprint-test.sh`, `context-test.sh`, `loop-test.sh`, `gate-test.sh`.
Expected: all `FAIL=0`.

- [ ] **Step 2: Run against THIS repo and eyeball**

Run: `sh skills/koni-harness/scripts/sprint.sh status --root "$(git rev-parse --show-toplevel)"` and `sh skills/koni-harness/scripts/sprint.sh next --root "$(git rev-parse --show-toplevel)"`.
Expected: `status` shows sprint-2026-W26 counts (US-3.2..3.6 etc.); `next` either suggests US-3.1's readiness or "none ready" depending on US-3.1's deps. Confirm output is sensible and no crash.

- [ ] **Step 3: Dispatch an author-blind subagent**

Prompt a fresh subagent: "Using only `skills/koni-harness/SKILL.md` + `references/sprint-sequencer.md`, install the harness into a NEW throwaway repo under the scratchpad, seed a sprint of 4 stories (one done, one ready via a satisfied dep, one blocked by an unmet dep, one P0 no-deps), run `.koni-harness/sprint.sh next` and `status`, and report whether the ready set, ordering, and blocked reasons are correct, plus any doc/CLI ambiguity. Do NOT touch any real repo."

- [ ] **Step 4: Fix any defects, re-run Step 1, commit**

```bash
git add -A skills/koni-harness
git commit -m "fix(koni-harness): address P2.5 sandbox verification findings"
```

---

### Task 6: koni-docs backfill + ship

**Files:**
- Modify: `VERSION`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/sprints/epics/EPIC-3.md`, `docs/sprints/sprint-2026-W26.md`
- Create: `docs/sprints/stories/US-3.6-koni-harness-sprint-sequencer.md`

- [ ] **Step 1: Bump VERSION**

```bash
echo "0.13.0" > VERSION
```

- [ ] **Step 2: Create story US-3.6** under EPIC-3 (status done, points 3, sprint-2026-W26, version_shipped 0.13.0, prd_ref FR-24, depends_on US-3.5), mirroring the US-3.5 file shape. AC mirror Tasks 1–5.

- [ ] **Step 3: Add FR-24 to PRD** (koni-harness P2.5 — sprint-sequencer: portable read-only `sprint.sh next`/`status` over koni-docs story frontmatter), add the US-3.6 row to the EPIC-3 index + EPIC-3.md FR coverage/stories, add US-3.6 to sprint-2026-W26 (now 5 stories / 19 pts), bump PRD version/date/editHistory to 0.13.0. Use the koni-docs shapes.

- [ ] **Step 4: Add CHANGELOG `## [0.13.0]`** entry describing the sprint-sequencer.

- [ ] **Step 5: Run koni-docs sync + status + validate**

```bash
npx koni-docs sync --docs-path docs/ --story US-3.6
npx koni-docs status --docs-path docs/
npx koni-docs validate --docs-path docs/
```
Expected: sync ok; status regenerates; validate green ("all references resolve").

- [ ] **Step 6: Commit + backfill SHA**

```bash
git add VERSION docs/ skills/koni-harness
git commit -m "feat(skills/koni-harness): sprint-sequencer (P2.5) — US-3.6, v0.13.0"
npx koni-docs backfill-commits --docs-path docs/
# set US-3.6 commit: field to the ship SHA, then:
git add docs/ && git commit -m "docs: backfill US-3.6 commit SHA for koni-harness v0.13.0"
```

---

## Self-Review

**1. Spec coverage** (spec § → task):
- §3 layout (sprint.sh, sprint-sequencer.md, installer mod, sprint-test.sh) → Tasks 1–4. ✓
- §4 next (readiness + ordering) + status (counts/points/blocked) + extraction rules → Tasks 1–2 (impl) + tests. ✓
- §5 CLI (`next`/`status`, `--sprint`/`--docs`/`--root`, defaults, exit codes) → Tasks 1–2. ✓
- §6 verification (next/none-ready/status/fallback/graceful/installer + author-blind) → Tasks 1–3 + 5. ✓
- §2 additive + read-only + single-responsibility → separate `sprint.sh`, Task 3 vendor-only, Task 6 additive docs. ✓
- §7 open questions → resolved in "Design decisions locked". ✓

**2. Placeholder scan:** Script tasks (1–3) carry complete code; doc task (4) names exact sections; Task 6 follows US-3.5 worked example. No "TBD"/"handle edge cases". ✓

**3. Type/name consistency:** subcommands `next`/`status`, flags `--sprint`/`--docs`/`--root`, helpers `field`/`deps_of`/`prio_rank`/`status_of_id`/`in_sprint_files`, record format `rank|id|title`, and the `.koni-harness/sprint.sh` vendored path are identical across Tasks 1–6 and match the spec. `field()` pipeline-exit-0 and the awk top-level-key stop are called out so `set -e` and multi-line `depends_on` are handled. ✓

**Note for executor:** Tasks 1–3 TDD POSIX shell; Task 4 docs; Task 5 verification; Task 6 the koni-docs ship — follow US-3.5 as the worked backfill example.
