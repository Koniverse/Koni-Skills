#!/bin/sh
# Run `koni-docs validate` when the package is locally available. Never triggers a
# network install; skip-passes (exit 0) when docs/, npx, or the package is absent.
set -eu
[ -d docs ] || exit 0
command -v npx >/dev/null 2>&1 || { echo "koni-docs-validate: npx unavailable, skipping"; exit 0; }
if ! npx --no-install koni-docs --version >/dev/null 2>&1; then
  echo "koni-docs-validate: koni-docs not installed, skipping"
  exit 0
fi
npx --no-install koni-docs validate --docs-path docs/
