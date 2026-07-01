#!/bin/sh
# Self-contained POSIX tests for swarm.sh (the parallel wave planner).
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SW="$HERE/../swarm.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
have() { case "$2" in *"$1"*) ok "$3" ;; *) no "$3 (missing '$1')" ;; esac; }
hasnt() { case "$2" in *"$1"*) no "$3 (unexpected '$1')" ;; *) ok "$3" ;; esac; }

# fixture: 4 stories — US-A done, US-B ready (dep A done), US-C blocked (dep B), US-D P0 ready
mkfix() {
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-X  # active\n' > "$d/CLAUDE.md"
  mkstory() { # id status priority pts deps...   (st_status, not 'status' — 'status' is read-only in zsh)
    f="$st/$1.md"; id=$1; st_status=$2; pri=$3; pts=$4; shift 4
    { printf -- '---\nid: %s\ntitle: "%s demo"\nstatus: %s\npriority: %s\npoints: %s\nsprint: sprint-X\n' "$id" "$id" "$st_status" "$pri" "$pts"
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

test_plan_wave() {
  d=$(mkfix)
  out=$(sh "$SW" plan --root "$d")
  have "worker 1 — US-D" "$out" "plan: US-D is worker 1 (P0 first)"
  have "worker 2 — US-B" "$out" "plan: US-B is a worker (dep US-A done)"
  hasnt "US-C" "$out" "plan: US-C excluded (dep US-B not done)"
  hasnt "US-A" "$out" "plan: US-A excluded (already done)"
  have "git worktree add" "$out" "plan: emits a per-worker worktree"
  have "loop.sh start US-D --state" "$out" "plan: worker cmd carries its own --state"
  have "worktrees/US-D" "$out" "plan: worktree path namespaced by story id"
  have "integrate" "$out" "plan: emits the integrate step"
  have "re-plan" "$out" "plan: emits the re-plan step"
  have "2 concurrent worker" "$out" "plan: reports the wave size"
  rm -rf "$d"
}
test_plan_wave

test_plan_cap() {
  d=$(mkfix)
  out=$(sh "$SW" plan --cap 1 --root "$d")
  have "worker 1 — US-D" "$out" "cap: 1 worker present"
  hasnt "worker 2" "$out" "cap: 2nd worker held by --cap 1"
  have "held by --cap 1" "$out" "cap: notes the held-over ready story"
  rm -rf "$d"
}
test_plan_cap

test_status_delegates() {
  d=$(mkfix)
  out=$(sh "$SW" status --root "$d")
  have "1/4 done" "$out" "status: delegates to sprint.sh"
  have "US-C blocked by: US-B" "$out" "status: shows blocked-by"
  rm -rf "$d"
}
test_status_delegates

test_complete_passthrough() {
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-C\n' > "$d/CLAUDE.md"
  printf -- '---\nid: US-1\ntitle: "x"\nstatus: done\npriority: P1\npoints: 1\nsprint: sprint-C\ndepends_on: []\ncreated: 2026-06-27\n---\n' > "$st/US-1.md"
  out=$(sh "$SW" plan --root "$d")
  have "complete" "$out" "plan: passes sprint.sh 'complete' through"
  hasnt "worker 1" "$out" "plan: no workers when nothing ready"
  rm -rf "$d"
}
test_complete_passthrough

test_guards() {
  out=$(sh "$SW" 2>&1 || true);          have "usage: swarm.sh" "$out" "guard: no command → usage"
  out=$(sh "$SW" plan --cap 0 2>&1 || true); have "--cap must be >= 1" "$out" "guard: --cap 0 rejected"
  out=$(sh "$SW" bogus 2>&1 || true);     have "usage: swarm.sh" "$out" "guard: unknown command → usage"
}
test_guards

# zsh leg — swarm.sh must word-split the wave correctly under zsh too (LESSONS §9: an
# unquoted-var 'for' fuses the list into one bad id under zsh). Run the planner with zsh
# and assert two DISTINCT worker lines, not one fused "US-D\nUS-B".
test_zsh_wordsplit() {
  command -v zsh >/dev/null 2>&1 || { ok "zsh: skipped (zsh not installed)"; return; }
  d=$(mkfix)
  out=$(zsh "$SW" plan --root "$d" 2>&1 || true)
  have "worker 1 — US-D" "$out" "zsh: worker 1 is US-D (no word-split fusion)"
  have "worker 2 — US-B" "$out" "zsh: worker 2 is US-B (list split into 2 workers)"
  hasnt "US-D
US-B" "$out" "zsh: ids not fused into one worker"
  hasnt "worktrees/US-D
US-B" "$out" "zsh: worktree path not fused"
  rm -rf "$d"
}
test_zsh_wordsplit

echo; echo "swarm-test: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
