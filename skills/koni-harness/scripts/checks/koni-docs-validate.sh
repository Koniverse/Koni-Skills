#!/bin/sh
# Thin wrapper: run `koni-docs validate` when available. No-op (pass) otherwise.
set -eu
[ -d docs ] || exit 0
command -v npx >/dev/null 2>&1 || { echo "koni-docs-validate: npx unavailable, skipping"; exit 0; }
npx --no-install koni-docs validate --docs-path docs/ 2>/dev/null \
  || npx koni-docs validate --docs-path docs/
