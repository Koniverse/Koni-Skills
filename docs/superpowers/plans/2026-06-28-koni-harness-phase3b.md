# koni-harness P3b (Session Adapters) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a portable `session-start.sh` "briefing" (composes `context-load.sh` + `sprint.sh next`) plus a `session-adapters.md` reference documenting how to wire it into each tool's session start — the final koni-harness roadmap piece.

**Architecture:** A dependency-free POSIX script resolves the two sibling helpers (`$SELF_DIR` then `.koni-harness/`), runs the P3a digest, then a `## Next` section from P2.5, forwarding `--root`/`--docs` to both and `--sprint` to `sprint.sh`. Read-only, stdout only. The installer vendors it; per-tool wiring is documented (Claude `SessionStart` as a manual-merge JSON snippet; settings.json is never auto-edited).

**Tech Stack:** POSIX `sh`, `git`. Tests are a self-contained POSIX harness (no `bats`).

---

## Design decisions locked from the spec

Resolves spec [§7 open questions](../specs/2026-06-28-koni-harness-phase3b-session-adapters-design.md):

- **Sub-script resolution**: `$SELF_DIR/<name>` first, else `.koni-harness/<name>`, else a `_(... not found)_` note (mirrors `loop.sh gate`). In the source tree the siblings resolve directly, so tests need no vendoring.
- **Flag forwarding**: `--root`/`--docs` → both sub-scripts; `--sprint` → `sprint.sh` only (`context-load.sh` has no `--sprint`). Forwarded via an unquoted `$common` (values are flags/paths without spaces).
- **`set -e` safety**: both sub-script invocations get `|| true` so a non-zero sub-script never aborts the briefing.

## File Structure

```
skills/koni-harness/
├── SKILL.md                          # MODIFY: add a "Brief a new session" pointer (Task 3)
├── references/
│   └── session-adapters.md           # CREATE: per-tool session-start wiring (Task 3)
└── scripts/
    ├── session-start.sh              # CREATE: briefing composer (Task 1)
    ├── install-gate.sh               # MODIFY: vendor session-start.sh (Task 2)
    └── __tests__/
        └── session-test.sh           # CREATE: self-contained POSIX tests (Tasks 1–2)
```

## Conventions

- `#!/bin/sh` + `set -eu`; no bashisms. Read-only; stdout only. Exit `0` on success, `2` on usage error.

---

### Task 1: `session-start.sh` + test harness

**Files:**
- Create: `skills/koni-harness/scripts/session-start.sh`
- Create: `skills/koni-harness/scripts/__tests__/session-test.sh`

- [ ] **Step 1: Write the failing test harness**

Create `skills/koni-harness/scripts/__tests__/session-test.sh`:

```sh
#!/bin/sh
# Self-contained POSIX tests for session-start.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SS="$HERE/../session-start.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
have() { case "$2" in *"$1"*) ok "$3" ;; *) no "$3 (missing '$1')" ;; esac; }

mkfix() {
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf '0.0.1\n' > "$d/VERSION"
  printf 'koni-docs:\n  active_sprint: sprint-Q  # active\n' > "$d/CLAUDE.md"
  printf '# Context\n\n### D1. A decision\n' > "$d/docs/CONTEXT.md"
  printf '# Lessons\n\n## 1. A lesson\n' > "$d/docs/LESSONS.md"
  printf -- '---\nid: US-1\ntitle: "x"\nstatus: planned\npriority: P0\npoints: 1\nsprint: sprint-Q\ndepends_on: []\n---\n' > "$st/US-1.md"
  printf '%s' "$d"
}

test_briefing() {
  d=$(mkfix)
  out=$(sh "$SS" --root "$d")
  have "VERSION: 0.0.1" "$out" "briefing: includes the P3a digest"
  have "active_sprint: sprint-Q" "$out" "briefing: digest has active_sprint"
  have "## Next" "$out" "briefing: has Next section"
  have "loop.sh start US-1" "$out" "briefing: Next suggests the ready story"
  rm -rf "$d"
}
test_briefing

test_graceful() {
  # session-start.sh alone in a dir with no sibling sub-scripts and no .koni-harness
  tmp=$(mktemp -d); cp "$SS" "$tmp/session-start.sh"
  out=$(cd "$tmp" && sh ./session-start.sh --root "$tmp" 2>&1) && rc=0 || rc=$?
  [ "$rc" -eq 0 ] && ok "graceful: exits 0 with no sub-scripts" || no "graceful: exits 0 (got $rc)"
  have "context-load.sh not found" "$out" "graceful: notes missing context-load"
  have "sprint.sh not found" "$out" "graceful: notes missing sprint"
  rm -rf "$tmp"
}
test_graceful

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run — expect FAIL** (script missing). `sh skills/koni-harness/scripts/__tests__/session-test.sh`

- [ ] **Step 3: Implement `session-start.sh`**

```sh
#!/bin/sh
# koni-harness session briefing (POSIX, read-only). Composes the context digest
# (context-load.sh) and the next-story suggestion (sprint.sh next) for session start.
# Usage: session-start.sh [--root <dir>] [--docs <dir>] [--sprint <id>]
set -eu
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=""; DOCS=""; SPRINT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT=${2:-}; shift 2 ;;
    --docs) DOCS=${2:-}; shift 2 ;;
    --sprint) SPRINT=${2:-}; shift 2 ;;
    *) echo "session-start: unknown arg: $1" >&2; exit 2 ;;
  esac
done

resolve() { # name -> path ("" if not found)
  if [ -f "$SELF_DIR/$1" ]; then printf '%s' "$SELF_DIR/$1"
  elif [ -f ".koni-harness/$1" ]; then printf '%s' ".koni-harness/$1"
  fi
}
common=""
[ -n "$ROOT" ] && common="$common --root $ROOT"
[ -n "$DOCS" ] && common="$common --docs $DOCS"

cl=$(resolve context-load.sh)
if [ -n "$cl" ]; then sh "$cl" $common || true; else echo "_(context-load.sh not found)_"; fi
echo
echo "## Next"
echo
sp=$(resolve sprint.sh)
if [ -n "$sp" ]; then
  if [ -n "$SPRINT" ]; then sh "$sp" next $common --sprint "$SPRINT" || true
  else sh "$sp" next $common || true; fi
else
  echo "_(sprint.sh not found)_"
fi
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/session-test.sh`
Expected: `PASS=7 FAIL=0`.

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/session-start.sh skills/koni-harness/scripts/__tests__/session-test.sh
git add skills/koni-harness/scripts/session-start.sh skills/koni-harness/scripts/__tests__/session-test.sh
git commit -m "feat(koni-harness): session-start.sh — briefing (context digest + next story) + tests"
```

---

### Task 2: Extend `install-gate.sh` to vendor `session-start.sh`

**Files:**
- Modify: `skills/koni-harness/scripts/install-gate.sh`
- Modify: `skills/koni-harness/scripts/__tests__/session-test.sh` (add `test_install`)

- [ ] **Step 1: Add the failing test** (insert before `echo "----"`)

```sh
test_install() {
  INS="$HERE/../install-gate.sh"; SRC="$HERE/.."
  d=$(mktemp -d); ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  ( cd "$d" && sh "$INS" --source "$SRC" >/dev/null 2>&1 )
  [ -f "$d/.koni-harness/session-start.sh" ] && ok "install: vendors session-start.sh" || no "install: vendors session-start.sh"
  [ -x "$d/.koni-harness/session-start.sh" ] && ok "install: session-start.sh executable" || no "install: session-start.sh executable"
  # and the vendored briefing actually composes the vendored sub-scripts
  out=$(cd "$d" && sh .koni-harness/session-start.sh --root "$d" 2>&1 || true)
  have "## Next" "$out" "install: vendored briefing runs"
  rm -rf "$d"
}
test_install
```

- [ ] **Step 2: Run — expect FAIL** (not vendored). `sh skills/koni-harness/scripts/__tests__/session-test.sh`

- [ ] **Step 3: Extend `install-gate.sh`**

In the vendoring section (right after the `cp "$SRC/sprint.sh" .koni-harness/sprint.sh` / `chmod` lines from P2.5), add:

```sh
# vendor the session briefing alongside the other helpers
cp "$SRC/session-start.sh" .koni-harness/session-start.sh
chmod +x .koni-harness/session-start.sh
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/session-test.sh`

- [ ] **Step 5: Confirm no regression in the other suites**

Run each: `sprint-test.sh`, `context-test.sh`, `loop-test.sh`, `gate-test.sh`.
Expected: all `FAIL=0`.

- [ ] **Step 6: Commit**

```bash
git add skills/koni-harness/scripts/install-gate.sh skills/koni-harness/scripts/__tests__/session-test.sh
git commit -m "feat(koni-harness): installer vendors session-start.sh (additive)"
```

---

### Task 3: `references/session-adapters.md` + SKILL.md pointer

**Files:**
- Create: `skills/koni-harness/references/session-adapters.md`
- Modify: `skills/koni-harness/SKILL.md`

- [ ] **Step 1: Write `references/session-adapters.md`** with sections:
  1. `## What the briefing contains` — `sh .koni-harness/session-start.sh` prints the P3a context digest followed by a `## Next` section (P2.5 ready-story suggestion); read-only; flags `--root`/`--docs`/`--sprint`.
  2. `## Claude Code` — a `settings.json` `SessionStart` hook entry that runs `sh .koni-harness/session-start.sh`, shown as JSON to **merge manually** (never auto-written). One-line recap that the *gate* hooks (PreToolUse/Stop) live in [`adapters.md`](adapters.md). Use a concrete, valid JSON snippet, e.g.:
     ```json
     {
       "hooks": {
         "SessionStart": [
           { "hooks": [ { "type": "command", "command": "sh .koni-harness/session-start.sh" } ] }
         ]
       }
     }
     ```
  3. `## Gemini / Codex / Cursor` — if the tool has a session-start mechanism, point it at the same command; otherwise run `sh .koni-harness/session-start.sh` at the start of a session by hand. The script is the contract; the adapter is whatever each tool offers.
  4. `## Composition` — one line: this is the thin adapter layer over the portable core (gate + loop-runner + context-loader + sprint-sequencer); each tool gets the same briefing.

- [ ] **Step 2: Add to `SKILL.md`** a short "Brief a new session" subsection: one line + `sh .koni-harness/session-start.sh` + pointer to `references/session-adapters.md`; add a reference-table row.

- [ ] **Step 3: Commit**

```bash
git add skills/koni-harness/references/session-adapters.md skills/koni-harness/SKILL.md
git commit -m "docs(koni-harness): session-adapters reference + SKILL.md pointer"
```

---

### Task 4: Author-blind sandbox verification

**Files:** (none — verification gate)

- [ ] **Step 1: Run all five suites**

Run each: `session-test.sh`, `sprint-test.sh`, `context-test.sh`, `loop-test.sh`, `gate-test.sh`.
Expected: all `FAIL=0`.

- [ ] **Step 2: Run the briefing against THIS repo and eyeball**

Run: `sh skills/koni-harness/scripts/session-start.sh --root "$(git rev-parse --show-toplevel)"`
Expected: the P3a digest (real VERSION, active_sprint sprint-2026-W26, D1..D13, lessons) followed by `## Next` showing the sprint's ready/complete state. No crash.

- [ ] **Step 3: Dispatch an author-blind subagent**

Prompt a fresh subagent: "Using only `skills/koni-harness/SKILL.md` + `references/session-adapters.md`, install the harness into a NEW throwaway repo under the scratchpad, seed minimal context layers + a small sprint, run `.koni-harness/session-start.sh`, and confirm the briefing shows both the digest and the `## Next` section. Validate that the Claude `SessionStart` JSON snippet in session-adapters.md parses as valid JSON (e.g. `python3 -c 'import json,sys; json.load(sys.stdin)'`). Report any doc/CLI ambiguity. Do NOT touch any real repo."

- [ ] **Step 4: Fix any defects, re-run Step 1, commit**

```bash
git add -A skills/koni-harness
git commit -m "fix(koni-harness): address P3b sandbox verification findings"
```

---

### Task 5: koni-docs backfill + ship

**Files:**
- Modify: `VERSION`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/sprints/epics/EPIC-3.md`, `docs/sprints/sprint-2026-W26.md`
- Create: `docs/sprints/stories/US-3.7-koni-harness-session-adapters.md`

- [ ] **Step 1: Bump VERSION**

```bash
echo "0.14.0" > VERSION
```

- [ ] **Step 2: Create story US-3.7** under EPIC-3 (status done, points 2, sprint-2026-W26, version_shipped 0.14.0, prd_ref FR-25, depends_on US-3.5 and US-3.6, created 2026-06-28), mirroring the US-3.6 file shape. AC mirror Tasks 1–4.

- [ ] **Step 3: Add FR-25 to PRD** (koni-harness P3b — multi-tool session adapters: `session-start.sh` briefing + `session-adapters.md` per-tool wiring), add the US-3.7 row to the EPIC-3 index + EPIC-3.md FR coverage/stories, add US-3.7 to sprint-2026-W26 (now 6 stories / 21 pts), bump PRD version/date/editHistory to 0.14.0. Note in the status line that the koni-harness roadmap is complete (P1/P2/P3a/P2.5/P3b). Use the koni-docs shapes.

- [ ] **Step 4: Add CHANGELOG `## [0.14.0]`** entry describing the session adapters + noting the harness roadmap is complete.

- [ ] **Step 5: Run koni-docs sync + status + validate**

```bash
npx koni-docs sync --docs-path docs/ --story US-3.7
npx koni-docs status --docs-path docs/
npx koni-docs validate --docs-path docs/
```
Expected: sync ok; status regenerates; validate green ("all references resolve").

- [ ] **Step 6: Commit + backfill SHA**

```bash
git add VERSION docs/ skills/koni-harness
git commit -m "feat(skills/koni-harness): multi-tool session adapters (P3b) — US-3.7, v0.14.0"
npx koni-docs backfill-commits --docs-path docs/
# set US-3.7 commit: field to the ship SHA, then:
git add docs/ && git commit -m "docs: backfill US-3.7 commit SHA for koni-harness v0.14.0"
```

---

## Self-Review

**1. Spec coverage** (spec § → task):
- §3 layout (session-start.sh, session-adapters.md, installer mod, session-test.sh) → Tasks 1–3. ✓
- §4 briefing (output, CLI, resolution, graceful) → Task 1. ✓
- §5 session-adapters.md (Claude manual-merge snippet, Gemini/Codex/Cursor, composition) → Task 3. ✓
- §6 verification (briefing/flag/graceful/installer + author-blind + JSON-valid) → Tasks 1–2 + 4. ✓
- §2 additive + read-only + no settings auto-edit → Task 2 (vendor only) + Task 3 (manual-merge snippet) + Task 5 (additive docs). ✓
- §7 open questions → resolved in "Design decisions locked". ✓

**2. Placeholder scan:** Script tasks (1–2) carry complete code; doc task (3) names exact sections + a concrete JSON snippet; Task 5 follows US-3.6 worked example. No "TBD"/"handle edge cases". ✓

**3. Type/name consistency:** flags `--root`/`--docs`/`--sprint`, `resolve()` + `$SELF_DIR`/`.koni-harness` order, the `## Next` heading, sub-script names `context-load.sh`/`sprint.sh`, and the `.koni-harness/session-start.sh` vendored path are identical across Tasks 1–5 and match the spec. The `|| true` guards + unquoted `$common` forwarding are called out. ✓

**Note for executor:** Tasks 1–2 TDD POSIX shell; Task 3 docs; Task 4 verification; Task 5 the koni-docs ship — follow US-3.6 as the worked backfill example. This completes the koni-harness roadmap.
