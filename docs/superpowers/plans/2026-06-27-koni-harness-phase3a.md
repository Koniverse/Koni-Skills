# koni-harness P3a (Context-Loader) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a portable `context-load.sh` to the `koni-harness` skill that emits a concise, deterministic session digest of the project's context layers (live `.active-context` snapshot + VERSION/active_sprint + decision/lesson title indexes + canonical pointers) to stdout.

**Architecture:** A dependency-free POSIX script reads the context-layer files under a resolved repo root and prints a Markdown digest — verbatim live snapshot, extracted titles (not bodies), graceful notes for any missing layer. It only *produces* the digest; wiring it into a tool's session start is P3b. The existing `install-gate.sh` is extended to vendor it into `.koni-harness/`.

**Tech Stack:** POSIX `sh`, `git`, `grep`/`sed`. Tests are a self-contained POSIX harness (no `bats`).

---

## Design decisions locked from the spec

Resolves spec [§8 open questions](../specs/2026-06-27-koni-harness-phase3a-context-loader-design.md):

- **Marker strings**: `<!-- koni-docs:auto-update -->` … `<!-- /koni-docs:auto-update -->` (confirmed against `.active-context.example.md`). The extractor prints lines between them and drops the two marker lines.
- **`active_sprint` parsing**: take the `active_sprint:` line in `CLAUDE.md`, strip everything after the first `#` (trailing comment), then trim.
- **`set -e` + grep**: section greps that may legitimately match nothing get `|| true` so an empty index doesn't abort the script.

## File Structure

```
skills/koni-harness/
├── SKILL.md                          # MODIFY: add a "Load session context" pointer (Task 4)
├── references/
│   └── context-load.md               # CREATE: what the digest contains + usage (Task 4)
└── scripts/
    ├── context-load.sh               # CREATE: digest generator (Tasks 1–2)
    ├── install-gate.sh               # MODIFY: vendor context-load.sh (Task 3)
    └── __tests__/
        └── context-test.sh           # CREATE: self-contained POSIX tests (Tasks 1–3)
```

## Conventions (same as the rest of koni-harness)

- `#!/bin/sh` + `set -eu`; no bashisms. Exit `0` on a readable repo (missing layers are notes), `2` on usage error.
- Output is Markdown to stdout only; the script never writes files.

---

### Task 1: `context-load.sh` core + test harness (full-repo digest)

**Files:**
- Create: `skills/koni-harness/scripts/context-load.sh`
- Create: `skills/koni-harness/scripts/__tests__/context-test.sh`

- [ ] **Step 1: Write the failing test harness**

Create `skills/koni-harness/scripts/__tests__/context-test.sh`:

```sh
#!/bin/sh
# Self-contained POSIX tests for context-load.sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CL="$HERE/../context-load.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
have() { case "$2" in *"$1"*) ok "$3" ;; *) no "$3 (missing '$1')" ;; esac; }

# build a full fixture repo
mkfull() {
  d=$(mktemp -d)
  ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  printf '0.9.9\n' > "$d/VERSION"
  printf '## Koni-Docs Integration\n\nkoni-docs:\n  active_sprint: sprint-2026-W26     # active window\n' > "$d/CLAUDE.md"
  printf 'name: AGENTS\n' > "$d/AGENTS.md"
  cat > "$d/.active-context.md" <<EOF
# Active Context
## Project sprint context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W26
- Active Stories: US-9.9 demo
<!-- /koni-docs:auto-update -->
EOF
  mkdir -p "$d/docs"
  printf '# Context\n\n### D1. First decision\n\nbody\n\n### D2. Second decision\n\nbody\n' > "$d/docs/CONTEXT.md"
  printf '# Lessons\n\n## 1. First lesson\n\nbody\n\n## 2. Second lesson\n\nbody\n' > "$d/docs/LESSONS.md"
  printf '%s' "$d"
}

test_full() {
  d=$(mkfull)
  out=$(sh "$CL" --root "$d")
  have "VERSION: 0.9.9" "$out" "full: shows VERSION"
  have "active_sprint: sprint-2026-W26" "$out" "full: shows active_sprint (comment stripped)"
  have "Active Stories: US-9.9 demo" "$out" "full: live snapshot verbatim"
  have "D1. First decision" "$out" "full: decision title D1"
  have "D2. Second decision" "$out" "full: decision title D2"
  have "1. First lesson" "$out" "full: lesson title 1"
  have "Canonical references" "$out" "full: canonical refs section"
  # marker lines themselves must NOT leak into the digest
  case "$out" in *"koni-docs:auto-update"*) no "full: marker lines stripped" ;; *) ok "full: marker lines stripped" ;; esac
  rm -rf "$d"
}
test_full

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run — expect FAIL** (script missing). `sh skills/koni-harness/scripts/__tests__/context-test.sh`

- [ ] **Step 3: Implement `context-load.sh`**

```sh
#!/bin/sh
# koni-harness context-loader (POSIX). Emits a concise session digest of the
# context layers to stdout. Reads only; never writes. Missing layers -> notes.
set -eu
ROOT=""; DOCS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT=${2:-}; shift 2 ;;
    --docs) DOCS=${2:-}; shift 2 ;;
    *) echo "context-load: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$ROOT" ] || ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
[ -n "$DOCS" ] || DOCS="$ROOT/docs"
B='koni-docs:auto-update'

repo=$(basename "$ROOT")
ver='-'; [ -f "$ROOT/VERSION" ] && ver=$(tr -d '[:space:]' < "$ROOT/VERSION")
sprint='-'
if [ -f "$ROOT/CLAUDE.md" ]; then
  s=$(grep -E '^[[:space:]]*active_sprint:' "$ROOT/CLAUDE.md" 2>/dev/null | head -n1 \
      | sed 's/^[^:]*://; s/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//' || true)
  [ -n "$s" ] && sprint=$s
fi

printf '# Session context — %s\n\n' "$repo"
printf -- '- VERSION: %s\n- active_sprint: %s\n\n' "$ver" "$sprint"

emit_block() { sed -n "/<!-- $B -->/,/<!-- \/$B -->/p" "$1" | grep -v "$B" || true; }

printf '## Live state\n\n'
if [ -f "$ROOT/.active-context.md" ] && grep -q "$B" "$ROOT/.active-context.md" 2>/dev/null; then
  emit_block "$ROOT/.active-context.md"
elif [ -f "$ROOT/CLAUDE.md" ] && grep -q "$B" "$ROOT/CLAUDE.md" 2>/dev/null; then
  emit_block "$ROOT/CLAUDE.md"
else
  printf '_(no active-context snapshot)_\n'
fi
printf '\n## Decisions\n\n'
if [ -f "$DOCS/CONTEXT.md" ]; then
  grep -E '^### D[0-9]+\.' "$DOCS/CONTEXT.md" | sed 's/^### /- /' || true
  printf '\n_full bodies in docs/CONTEXT.md_\n'
else
  printf '_(docs/CONTEXT.md not found)_\n'
fi
printf '\n## Lessons\n\n'
if [ -f "$DOCS/LESSONS.md" ]; then
  grep -E '^## [0-9]+\.' "$DOCS/LESSONS.md" | sed 's/^## /- /' || true
  printf '\n_full bodies in docs/LESSONS.md_\n'
else
  printf '_(docs/LESSONS.md not found)_\n'
fi
printf '\n## Canonical references\n\n'
printf -- '- AGENTS.md — project conventions, structure, commit discipline (read for any non-trivial work)\n'
printf -- '- skills/koni-harness — the Koni Agentic Loop standard + gate\n'
printf -- '- This digest is a summary; open the named files for detail.\n'
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/context-test.sh`
Expected: `PASS=8 FAIL=0`.

- [ ] **Step 5: Commit**

```bash
chmod +x skills/koni-harness/scripts/context-load.sh skills/koni-harness/scripts/__tests__/context-test.sh
git add skills/koni-harness/scripts/context-load.sh skills/koni-harness/scripts/__tests__/context-test.sh
git commit -m "feat(koni-harness): context-load.sh — session digest of context layers + tests"
```

---

### Task 2: Fallback + missing-layer graceful behavior

**Files:**
- Modify: `skills/koni-harness/scripts/__tests__/context-test.sh` (add two tests)

(The implementation from Task 1 already handles these; these tests lock the behavior.)

- [ ] **Step 1: Add the tests** (insert before the `echo "----"` line)

```sh
test_fallback_claude() {
  d=$(mktemp -d)
  ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  printf '0.1.0\n' > "$d/VERSION"
  # no .active-context.md; Pattern-A block lives in CLAUDE.md
  cat > "$d/CLAUDE.md" <<EOF
## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W26
- Active Stories: US-1.1 inline
<!-- /koni-docs:auto-update -->
EOF
  out=$(sh "$CL" --root "$d")
  have "US-1.1 inline" "$out" "fallback: uses CLAUDE.md Pattern-A block"
  rm -rf "$d"
}
test_fallback_claude

test_missing_layers() {
  d=$(mktemp -d)
  ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  printf '0.1.0\n' > "$d/VERSION"   # no CLAUDE.md, no .active-context, no docs/
  out=$(sh "$CL" --root "$d" 2>&1) && rc=0 || rc=$?
  [ "$rc" -eq 0 ] && ok "missing: exits 0" || no "missing: exits 0 (got $rc)"
  have "no active-context snapshot" "$out" "missing: live-state note"
  have "docs/CONTEXT.md not found" "$out" "missing: CONTEXT note"
  have "docs/LESSONS.md not found" "$out" "missing: LESSONS note"
  rm -rf "$d"
}
test_missing_layers
```

- [ ] **Step 2: Run — expect PASS** (Task-1 impl already supports these).
Run: `sh skills/koni-harness/scripts/__tests__/context-test.sh`
Expected: `FAIL=0` (now 13 assertions).

- [ ] **Step 3: Commit**

```bash
git add skills/koni-harness/scripts/__tests__/context-test.sh
git commit -m "test(koni-harness): context-load fallback + missing-layer graceful cases"
```

---

### Task 3: Extend `install-gate.sh` to vendor `context-load.sh`

**Files:**
- Modify: `skills/koni-harness/scripts/install-gate.sh`
- Modify: `skills/koni-harness/scripts/__tests__/context-test.sh` (add `test_install`)

- [ ] **Step 1: Add the failing test** (insert before `echo "----"`)

```sh
test_install() {
  INS="$HERE/../install-gate.sh"; SRC="$HERE/.."
  d=$(mktemp -d); ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  ( cd "$d" && sh "$INS" --source "$SRC" >/dev/null 2>&1 )
  [ -f "$d/.koni-harness/context-load.sh" ] && ok "install: vendors context-load.sh" || no "install: vendors context-load.sh"
  [ -x "$d/.koni-harness/context-load.sh" ] && ok "install: context-load.sh executable" || no "install: context-load.sh executable"
  rm -rf "$d"
}
test_install
```

- [ ] **Step 2: Run — expect FAIL** (not vendored yet). `sh skills/koni-harness/scripts/__tests__/context-test.sh`

- [ ] **Step 3: Extend `install-gate.sh`**

In the vendoring section (where `loop.sh` is already copied — right after the `cp "$SRC/loop.sh" .koni-harness/loop.sh` / `chmod` lines), add:

```sh
# vendor the context-loader alongside the gate + loop helpers
cp "$SRC/context-load.sh" .koni-harness/context-load.sh
chmod +x .koni-harness/context-load.sh
```

- [ ] **Step 4: Run — expect PASS.** `sh skills/koni-harness/scripts/__tests__/context-test.sh`

- [ ] **Step 5: Run the other two suites — confirm no regression**

Run: `sh skills/koni-harness/scripts/__tests__/loop-test.sh` and `sh skills/koni-harness/scripts/__tests__/gate-test.sh`
Expected: `loop-test` `FAIL=0`, `gate-test` `FAIL=0`.

- [ ] **Step 6: Commit**

```bash
git add skills/koni-harness/scripts/install-gate.sh skills/koni-harness/scripts/__tests__/context-test.sh
git commit -m "feat(koni-harness): installer vendors context-load.sh (additive)"
```

---

### Task 4: `references/context-load.md` + SKILL.md pointer

**Files:**
- Create: `skills/koni-harness/references/context-load.md`
- Modify: `skills/koni-harness/SKILL.md`

- [ ] **Step 1: Write `references/context-load.md`** with these sections (match the implemented script):
  1. `## What it emits` — the five digest sections (header w/ VERSION + active_sprint; Live state = verbatim `.active-context` block with CLAUDE.md Pattern-A fallback; Decisions = `D<n>` titles; Lessons = `<n>` titles; Canonical references), and the rule "digest, not dump — bodies are referenced, not inlined".
  2. `## Usage` — `sh .koni-harness/context-load.sh [--root <dir>] [--docs <dir>]`; defaults (root via `git rev-parse --show-toplevel` else cwd, docs `docs/`); stdout-only; exit 0 on a readable repo (missing layers become notes).
  3. `## Graceful degradation` — each missing layer prints a `_(... not found)_` note; a fresh clone without the gitignored `.active-context.md` falls back to the CLAUDE.md Pattern-A block.
  4. `## Wiring (P3b)` — one line: wiring the digest into a tool's session start (Claude `SessionStart` hook, Gemini/Codex equivalents) is P3b; P3a only produces the digest, runnable manually or by any adapter.

- [ ] **Step 2: Add to `SKILL.md`** a short "Load session context" subsection: one line on what it does + `sh .koni-harness/context-load.sh` + pointer to `references/context-load.md`; add a `references/context-load.md` row to the reference table.

- [ ] **Step 3: Commit**

```bash
git add skills/koni-harness/references/context-load.md skills/koni-harness/SKILL.md
git commit -m "docs(koni-harness): context-load reference + SKILL.md pointer"
```

---

### Task 5: Author-blind sandbox verification

**Files:** (none — verification gate)

- [ ] **Step 1: Run all four suites**

Run each of: `context-test.sh`, `loop-test.sh`, `gate-test.sh` under `skills/koni-harness/scripts/__tests__/`.
Expected: all `FAIL=0`.

- [ ] **Step 2: Run the loader against THIS repo and eyeball the digest**

Run: `sh skills/koni-harness/scripts/context-load.sh --root "$(git rev-parse --show-toplevel)"`
Expected: a digest showing the real VERSION, active_sprint (sprint-2026-W26), the live `.active-context` block (or the `_(no active-context snapshot)_` note if the gitignored file is absent on this machine), the real D1–D13 decision titles, the §1–§6 lesson titles, and the canonical references. Confirm no marker lines leak and bodies are not inlined.

- [ ] **Step 3: Dispatch an author-blind subagent**

Prompt a fresh subagent: "Using only `skills/koni-harness/SKILL.md` + `references/context-load.md`, install the harness into a NEW throwaway repo under the scratchpad, seed minimal context layers (VERSION, CLAUDE.md with a koni-docs block, a `.active-context.md`, docs/CONTEXT.md with two `### D` decisions, docs/LESSONS.md with two `## n.` lessons), run the vendored `.koni-harness/context-load.sh`, and report the digest plus any place the doc/CLI was ambiguous or didn't match. Then delete a layer and confirm the digest degrades gracefully (note, no crash). Do NOT touch any real repo."

- [ ] **Step 4: Fix any defects, re-run Step 1, commit**

```bash
git add -A skills/koni-harness
git commit -m "fix(koni-harness): address P3a sandbox verification findings"
```

---

### Task 6: koni-docs backfill + ship

**Files:**
- Modify: `VERSION`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/sprints/epics/EPIC-3.md`, `docs/sprints/sprint-2026-W26.md`
- Create: `docs/sprints/stories/US-3.5-koni-harness-context-loader.md`

- [ ] **Step 1: Bump VERSION**

```bash
echo "0.12.0" > VERSION
```

- [ ] **Step 2: Create story US-3.5** under EPIC-3 (status done, points 3, sprint-2026-W26, version_shipped 0.12.0, prd_ref FR-23, depends_on US-3.4), mirroring the US-3.4 file shape. AC mirror Tasks 1–5.

- [ ] **Step 3: Add FR-23 to PRD** (koni-harness P3a — context-loader: portable `context-load.sh` emitting a session digest of the context layers; digest-not-dump; additive install), add the US-3.5 row to the EPIC-3 index + EPIC-3.md FR coverage/stories, add US-3.5 to sprint-2026-W26 (now 4 stories / 16 pts), bump PRD version/date/editHistory to 0.12.0. Use the koni-docs shapes (don't hand-author template text).

- [ ] **Step 4: Add CHANGELOG `## [0.12.0]`** entry describing the context-loader.

- [ ] **Step 5: Run koni-docs sync + status + validate**

```bash
npx koni-docs sync --docs-path docs/ --story US-3.5
npx koni-docs status --docs-path docs/
npx koni-docs validate --docs-path docs/
```
Expected: sync ok; status regenerates; validate green ("all references resolve").

- [ ] **Step 6: Commit + backfill SHA**

```bash
git add VERSION docs/ skills/koni-harness
git commit -m "feat(skills/koni-harness): context-loader (P3a) — US-3.5, v0.12.0"
npx koni-docs backfill-commits --docs-path docs/
# set US-3.5 commit: field to the ship SHA, then:
git add docs/ && git commit -m "docs: backfill US-3.5 commit SHA for koni-harness v0.12.0"
```

---

## Self-Review

**1. Spec coverage** (spec § → task):
- §3 layout (context-load.sh, context-load.md, install-gate.sh mod, context-test.sh) → Tasks 1–4. ✓
- §4 digest sections + extraction rules → Task 1 (impl) + Tasks 1–2 (tests). ✓
- §5 CLI (`--root`/`--docs`, defaults, exit codes) → Task 1. ✓
- §6 verification (full / fallback / missing / installer + author-blind) → Tasks 1–3 + 5. ✓
- §2 additive invariant → Task 3 (vendor only) + Task 6 (additive docs). ✓
- §8 open questions → resolved in "Design decisions locked". ✓

**2. Placeholder scan:** Script tasks (1–3) carry complete code; doc task (4) names exact sections; Task 6 follows the US-3.4 worked example. No "TBD"/"handle edge cases". ✓

**3. Type/name consistency:** flags `--root`/`--docs`, marker `koni-docs:auto-update`, section headings (`Live state`/`Decisions`/`Lessons`/`Canonical references`), grep patterns (`^### D[0-9]+\.`, `^## [0-9]+\.`), and the `.koni-harness/context-load.sh` vendored path are identical across Tasks 1–6 and match the spec. The `|| true` guards on the section greps are included so `set -e` doesn't abort on an empty index. ✓

**Note for executor:** Tasks 1–3 are TDD POSIX shell; Task 4 is docs; Task 5 is verification; Task 6 is the koni-docs ship — follow US-3.4 as the worked backfill example and use the koni-docs skill for template bodies.
