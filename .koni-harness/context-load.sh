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
