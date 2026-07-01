#!/bin/sh
# koni-agent-monitoring installer — additive / non-destructive. Copies the reporter into
# a per-machine home, writes the local config, and wires the four Claude Code hooks.
# Never blocks, never commits secrets. Re-running is idempotent. (handoff §5/§7)
#
# Usage:
#   sh install.sh --url <ERP>/api/agent-ops/ingest --token kagt_xxx [--merge-hooks] [--node <path>]
#   --merge-hooks   auto-merge the hooks into ~/.claude/settings.json via jq (backs it up first).
#                   Without it (default, matching koni-harness's "settings.json is merged
#                   manually" invariant) the exact hooks block is written + printed to paste.
set -eu

URL=""; TOKEN=""; MERGE=0; NODE_BIN=""; UNINSTALL=0
while [ $# -gt 0 ]; do
  case "$1" in
    --url) URL=${2:-}; shift 2 ;;
    --token) TOKEN=${2:-}; shift 2 ;;
    --merge-hooks) MERGE=1; shift ;;
    --node) NODE_BIN=${2:-}; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    *) echo "install: unknown arg: $1" >&2; exit 2 ;;
  esac
done

DIR=${KONI_AGENT_OPS_HOME:-"$HOME/.koni-agent-monitoring"}
CLAUDE_DIR=${KONI_CLAUDE_DIR:-"$HOME/.claude"}
SETTINGS="$CLAUDE_DIR/settings.json"

# ── uninstall: remove the state/home + strip our hooks (backup); leaves nothing behind ──
if [ "$UNINSTALL" -eq 1 ]; then
  if [ -f "$SETTINGS" ] && grep -q 'koni-agent-monitoring/bin/report.mjs' "$SETTINGS" 2>/dev/null; then
    if command -v jq >/dev/null 2>&1; then
      cp "$SETTINGS" "$SETTINGS.bak.$(date +%Y%m%d%H%M%S 2>/dev/null || echo bak)"
      tmp="$SETTINGS.tmp.$$"
      # drop every hook entry whose command mentions our reporter, from all four events
      jq '
        (.hooks // {}) as $h
        | .hooks = ($h | with_entries(.value |= map(select((.hooks // []) | any(.command? // "" | test("koni-agent-monitoring/bin/report.mjs")) | not))))
      ' "$SETTINGS" > "$tmp" && mv "$tmp" "$SETTINGS"
      echo "uninstall: stripped koni-agent-monitoring hooks from $SETTINGS (backup kept)."
    else
      echo "uninstall: jq not found — remove the hook entries mentioning report.mjs from $SETTINGS manually." >&2
    fi
  fi
  rm -rf "$DIR"
  echo "uninstall: removed $DIR. Done. (Revoke the token in the ERP: Agent Ops → Settings.)"
  exit 0
fi

SRC=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
[ -n "$NODE_BIN" ] || NODE_BIN=$(command -v node || echo node)
# NOTE: the node path + $DIR must be space-free — the Claude Code hook `command` is
# word-split by the runner. The default (~/.koni-agent-monitoring) is safe; avoid a
# --node path containing spaces.

# 1. per-machine home + reporter (copy the pure core + the reporter; no deps to install)
mkdir -p "$DIR/bin"
cp "$SRC/agent-report-core.mjs" "$DIR/bin/agent-report-core.mjs"
cp "$SRC/report.mjs" "$DIR/bin/report.mjs"
chmod +x "$DIR/bin/report.mjs"

# 2. local config (chmod 600 — holds the bearer token; never committed, never logged)
CFG="$DIR/config.env"
if [ -n "$URL" ] || [ -n "$TOKEN" ]; then
  umask 077
  {
    printf '# koni-agent-monitoring config — DO NOT COMMIT. Rotate: mint a new token in the ERP, swap here, revoke old.\n'
    [ -n "$URL" ]   && printf 'KONI_AGENT_OPS_URL=%s\n' "$URL"
    [ -n "$TOKEN" ] && printf 'KONI_AGENT_OPS_TOKEN=%s\n' "$TOKEN"
  } > "$CFG"
  chmod 600 "$CFG"
  echo "install: wrote config → $CFG (chmod 600)"
else
  echo "install: NOTE no --url/--token given; set KONI_AGENT_OPS_URL + KONI_AGENT_OPS_TOKEN in $CFG before data flows."
fi

# 3. the hooks block (one command handles all four events; it reads hook_event_name from stdin)
CMD="$NODE_BIN $DIR/bin/report.mjs"
HOOKS_JSON="$DIR/claude-hooks.json"
cat > "$HOOKS_JSON" <<JSON
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "$CMD" }] }],
    "PostToolUse":  [{ "matcher": "*", "hooks": [{ "type": "command", "command": "$CMD" }] }],
    "Stop":         [{ "hooks": [{ "type": "command", "command": "$CMD" }] }],
    "SessionEnd":   [{ "hooks": [{ "type": "command", "command": "$CMD" }] }]
  }
}
JSON
echo "install: wrote hooks block → $HOOKS_JSON"

if [ "$MERGE" -eq 1 ]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "install: --merge-hooks needs jq (not found). Merge $HOOKS_JSON into $SETTINGS manually." >&2
    exit 0
  fi
  mkdir -p "$CLAUDE_DIR"
  [ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
  if grep -q 'koni-agent-monitoring/bin/report.mjs' "$SETTINGS" 2>/dev/null; then
    echo "install: hooks already present in $SETTINGS (idempotent no-op)."
  else
    cp "$SETTINGS" "$SETTINGS.bak.$(date +%Y%m%d%H%M%S 2>/dev/null || echo bak)"   # backup before editing
    tmp="$SETTINGS.tmp.$$"
    jq --arg cmd "$CMD" '
      .hooks = (.hooks // {})
      | .hooks.SessionStart = ((.hooks.SessionStart // []) + [{hooks:[{type:"command",command:$cmd}]}])
      | .hooks.PostToolUse  = ((.hooks.PostToolUse  // []) + [{matcher:"*",hooks:[{type:"command",command:$cmd}]}])
      | .hooks.Stop         = ((.hooks.Stop         // []) + [{hooks:[{type:"command",command:$cmd}]}])
      | .hooks.SessionEnd   = ((.hooks.SessionEnd   // []) + [{hooks:[{type:"command",command:$cmd}]}])
    ' "$SETTINGS" > "$tmp" && mv "$tmp" "$SETTINGS"
    echo "install: merged the four hooks into $SETTINGS (backup kept)."
  fi
else
  echo "install: to wire the hooks, either re-run with --merge-hooks, or add the contents of"
  echo "         $HOOKS_JSON to $SETTINGS (merge under the \"hooks\" key; additive)."
fi

echo "install: done. Verify with the §11 smoke test, then start a Claude Code session — it should appear on Agent Ops → Live."
