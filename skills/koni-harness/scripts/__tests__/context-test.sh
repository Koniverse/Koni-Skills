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

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
