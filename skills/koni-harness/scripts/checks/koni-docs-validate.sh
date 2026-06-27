#!/bin/sh
# Thin wrapper: run `koni-docs validate` when available. No-op (pass) otherwise.
set -eu
[ -d docs ] || exit 0
command -v npx >/dev/null 2>&1 || { echo "koni-docs-validate: npx unavailable, skipping"; exit 0; }
# Never trigger a network install from a hook: run with --no-install only.
# If the package isn't installed, npx --no-install exits non-zero before running
# the binary; treat that as a skip-pass rather than failing or installing.
out=$(npx --no-install koni-docs validate --docs-path docs/ 2>&1); rc=$?
[ "$rc" -eq 0 ] && exit 0
case "$out" in
  *"could not determine executable"*|*"not found"*|*"npm ERR"*|*"command not found"*)
    echo "koni-docs-validate: koni-docs not installed, skipping"; exit 0 ;;
esac
printf '%s\n' "$out" >&2
exit "$rc"
