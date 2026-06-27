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
  have "all remaining are blocked" "$out" "next: blocked-branch message"
  rm -rf "$d"
}
test_none_ready

test_sprint_complete() {
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-C\n' > "$d/CLAUDE.md"
  # every story is done -> sprint complete
  i=1
  for s in 1 2 3; do
    printf -- '---\nid: US-%s\ntitle: "x"\nstatus: done\npriority: P1\npoints: 1\nsprint: sprint-C\ndepends_on: []\ncreated: 2026-06-27\n---\n' "$s" > "$st/US-$s.md"
    i=$((i+1))
  done
  out=$(sh "$SP" next --root "$d")
  have "is complete" "$out" "next: all-done says sprint complete"
  hasnt "blocked" "$out" "next: all-done not a blocked message"
  rm -rf "$d"
}
test_sprint_complete

test_install() {
  INS="$HERE/../install-gate.sh"; SRC="$HERE/.."
  d=$(mktemp -d); ( cd "$d" && git init -q && git config user.email t@t && git config user.name t )
  ( cd "$d" && sh "$INS" --source "$SRC" >/dev/null 2>&1 )
  [ -f "$d/.koni-harness/sprint.sh" ] && ok "install: vendors sprint.sh" || no "install: vendors sprint.sh"
  [ -x "$d/.koni-harness/sprint.sh" ] && ok "install: sprint.sh executable" || no "install: sprint.sh executable"
  rm -rf "$d"
}
test_install

test_inline_empty_deps() {
  # FIX #4 (a): depends_on: [] immediately followed by --- must NOT yield a phantom '--' dep.
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-E\n' > "$d/CLAUDE.md"
  # closing --- directly after the inline [] value
  printf -- '---\nid: US-E\ntitle: "x"\nstatus: planned\npriority: P0\npoints: 1\nsprint: sprint-E\ndepends_on: []\n---\n' > "$st/US-E.md"
  out=$(sh "$SP" next --root "$d")
  have "US-E" "$out" "inline-[]: story is ready (not blocked by phantom '--')"
  have "loop.sh start US-E" "$out" "inline-[]: suggests starting US-E"
  hasnt "blocked" "$out" "inline-[]: no blocked message"
  rm -rf "$d"
}
test_inline_empty_deps

test_multiline_deps_to_marker() {
  # FIX #4 (b): a multiline depends_on list terminated directly by --- must not append '--'.
  d=$(mktemp -d); st="$d/docs/sprints/stories"; mkdir -p "$st"
  printf 'koni-docs:\n  active_sprint: sprint-M\n' > "$d/CLAUDE.md"
  # list closes directly into the --- marker (no trailing field line)
  printf -- '---\nid: US-M\ntitle: "x"\nstatus: planned\npriority: P1\npoints: 1\nsprint: sprint-M\ndepends_on:\n  - US-0\n---\n' > "$st/US-M.md"
  out=$(sh "$SP" status --root "$d")
  have "US-M blocked by: US-0" "$out" "multiline-marker: blocked names real dep US-0"
  hasnt "blocked by: US-0 --" "$out" "multiline-marker: blocked line has no phantom '--'"
  rm -rf "$d"
}
test_multiline_deps_to_marker

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
