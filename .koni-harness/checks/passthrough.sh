#!/bin/sh
# Run a repo-provided command (test/typecheck/lint); pass its exit code through.
set -eu
cmd=${1:-}
[ -n "$cmd" ] || { echo "passthrough: no command configured, skipping"; exit 0; }
sh -c "$cmd"
