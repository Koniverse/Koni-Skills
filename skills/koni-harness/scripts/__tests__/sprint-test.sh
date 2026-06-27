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
  mkstory() { # id status priority pts deps...
    f="$st/$1.md"; id=$1; status=$2; pri=$3; pts=$4; shift 4
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
