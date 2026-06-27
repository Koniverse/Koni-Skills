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
  printf -- '---\nid: US-1\ntitle: "x"\nstatus: planned\npriority: P0\npoints: 1\nsprint: sprint-Q\ndepends_on: []\ncreated: 2026-06-27\n---\n' > "$st/US-1.md"
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
