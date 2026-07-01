#!/bin/sh
# koni-harness swarm planner (POSIX, read-only). Turns the sprint's dependency-ready
# set into a PARALLEL dispatch plan — one worker per ready story, each in its own git
# worktree — so a tool that can spawn agents (Claude Agent/Workflow) runs a whole wave
# concurrently. Readiness is single-sourced from sprint.sh (this never re-derives the DAG).
#
# Usage: swarm.sh {plan|status} [--cap N] [--sprint <id>] [--docs <dir>] [--root <dir>]
#   plan    emit the current wave: ready stories (priority order, capped) → per-worker
#           worktree + loop.sh command; then the integrate + re-plan step for the next wave.
#   status  the wave view (delegates to sprint.sh status: done / blocked-by).
#
# It is a PLANNER only: it never spawns an agent, adds a worktree, or writes state — the
# per-tool adapter (parallel-orchestration.md) consumes this plan and does the spawning.
set -eu

SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SPRINT_SH="$SELF_DIR/sprint.sh"; [ -f "$SPRINT_SH" ] || SPRINT_SH=".koni-harness/sprint.sh"

cmd=${1:-}; [ $# -gt 0 ] && shift || true
CAP=4; ROOT=""; DOCS=""; SPRINT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --cap)    CAP=${2:-}; case "$CAP" in ''|*[!0-9]*) echo "swarm: --cap needs a positive integer" >&2; exit 2 ;; esac; shift 2 ;;
    --root)   ROOT=${2:-}; shift 2 ;;
    --docs)   DOCS=${2:-}; shift 2 ;;
    --sprint) SPRINT=${2:-}; shift 2 ;;
    *) echo "swarm: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ "$CAP" -ge 1 ] 2>/dev/null || { echo "swarm: --cap must be >= 1" >&2; exit 2; }
[ -f "$SPRINT_SH" ] || { echo "swarm: sprint.sh not found (need it for the ready set)" >&2; exit 2; }

# Build the sprint.sh passthrough args (only those set).
set --
[ -n "$ROOT" ]   && set -- "$@" --root "$ROOT"
[ -n "$DOCS" ]   && set -- "$@" --docs "$DOCS"
[ -n "$SPRINT" ] && set -- "$@" --sprint "$SPRINT"

do_status() { sh "$SPRINT_SH" status "$@"; }

do_plan() {
  # Reuse sprint.sh's readiness (single source of truth). Its `next` prints the ready
  # set as "- <id>  —  <title>" lines in priority order; parse those ids.
  out=$(sh "$SPRINT_SH" next "$@") || { printf '%s\n' "$out"; return 1; }
  ready=$(printf '%s\n' "$out" | sed -n 's/^- \([^ ]*\)  *—.*/\1/p')
  if [ -z "$ready" ]; then
    # Not-ready reason (complete / all-blocked) comes straight from sprint.sh.
    printf '%s\n' "$out"
    return 0
  fi
  total=$(printf '%s\n' "$ready" | sed '/^$/d' | wc -l | tr -d ' ')
  wave=$(printf '%s\n' "$ready" | sed '/^$/d' | head -n "$CAP")
  n=$(printf '%s\n' "$wave" | wc -l | tr -d ' ')
  echo "# koni-harness swarm — current wave: $n concurrent worker(s) (of $total ready, cap $CAP)"
  echo "# Each worker runs the FULL loop (frame→commit) in its own worktree, in parallel."
  echo
  base=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)   # the integration base (current branch)
  int="koni/integration"
  echo "# BASE=$base   INTEGRATION=$int   (workers branch off BASE; the wave integrates onto INTEGRATION)"
  echo
  # NB: iterate the wave with heredoc-fed 'while read', NOT 'for id in $wave' — an
  # unquoted-var 'for' is NOT word-split under zsh (SH_WORD_SPLIT off), which would fuse
  # the whole list into one bad id (LESSONS §9). read-splits on newlines in every shell.
  i=0
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    i=$((i+1))
    wt=".koni-harness/worktrees/$id"
    echo "## worker $i — $id   (own worktree · full loop · runs in parallel)"
    echo "git worktree remove --force \"$wt\" 2>/dev/null || true; git branch -D \"loop/$id\" 2>/dev/null || true   # idempotent: clear a stale retry"
    echo "git worktree add \"$wt\" -b \"loop/$id\" \"$base\""
    echo "( cd \"$wt\" && sh .koni-harness/loop.sh start $id --state .koni-harness/loop-state )   # then drive its stages → 'loop.sh gate work-commit' (exactly as single-agent)"
    echo
  done <<EOF
$wave
EOF
  echo "# ── integrate this wave (after every worker passed its in-worktree work-commit gate) ──"
  echo "git branch -f \"$int\" \"$base\" && git switch \"$int\"   # (re)create the integration branch off BASE"
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    echo "git merge --no-ff \"loop/$id\"   # on CONFLICT: resolve on $int then re-gate, OR 'git merge --abort' and defer $id to a later wave"
  done <<EOF
$wave
EOF
  echo "sh .koni-harness/gate-runner.sh --phase pre-push   # RE-RUN the gate on the integrated result — catches cross-story breakage a per-worktree gate cannot"
  echo "# a human then reviews + merges $int → $base; the swarm NEVER auto-pushes the default branch."
  echo "# after that merge lands, clean up each worktree + re-plan the next wave:"
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    echo "git worktree remove --force \".koni-harness/worktrees/$id\" || true; git branch -d \"loop/$id\" 2>/dev/null || true"
  done <<EOF
$wave
EOF
  echo "# then mark the merged stories done and run 'swarm.sh plan' again (stories this wave unblocked lead the next wave)."
  [ "$total" -gt "$n" ] && echo "# NOTE: $((total - n)) more ready now but held by --cap $CAP; they lead the next wave."
  return 0
}

case "$cmd" in
  plan)   do_plan "$@" ;;
  status) do_status "$@" ;;
  *) echo "usage: swarm.sh {plan|status} [--cap N] [--sprint <id>] [--docs <dir>] [--root <dir>]" >&2; exit 2 ;;
esac
