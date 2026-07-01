#!/bin/sh
# Tests for install.sh — additive, idempotent, secret-safe (handoff §5/§7).
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
INSTALL="$HERE/../install.sh"
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "ok   - $1"; }
no() { FAIL=$((FAIL+1)); echo "FAIL - $1"; }
have() { case "$2" in *"$1"*) ok "$3" ;; *) no "$3 (missing '$1')" ;; esac; }

H=$(mktemp -d)
export KONI_AGENT_OPS_HOME="$H/.koni-agent-monitoring"
export KONI_CLAUDE_DIR="$H/.claude"

# 1. install with url+token
sh "$INSTALL" --url "https://erp.example/api/agent-ops/ingest" --token "kagt_secret123" >/dev/null 2>&1
[ -f "$KONI_AGENT_OPS_HOME/bin/report.mjs" ] && ok "copies report.mjs" || no "report.mjs missing"
[ -f "$KONI_AGENT_OPS_HOME/bin/agent-report-core.mjs" ] && ok "copies core" || no "core missing"
[ -f "$KONI_AGENT_OPS_HOME/config.env" ] && ok "writes config.env" || no "config.env missing"
have "kagt_secret123" "$(cat "$KONI_AGENT_OPS_HOME/config.env")" "config has token"
# config is chmod 600 (secret-safe)
perm=$(stat -f '%Lp' "$KONI_AGENT_OPS_HOME/config.env" 2>/dev/null || stat -c '%a' "$KONI_AGENT_OPS_HOME/config.env" 2>/dev/null)
[ "$perm" = "600" ] && ok "config.env is chmod 600" || no "config.env perms = $perm (want 600)"
[ -f "$KONI_AGENT_OPS_HOME/claude-hooks.json" ] && ok "writes hooks block" || no "hooks block missing"
have "report.mjs" "$(cat "$KONI_AGENT_OPS_HOME/claude-hooks.json")" "hooks block references report.mjs"
have "SessionStart" "$(cat "$KONI_AGENT_OPS_HOME/claude-hooks.json")" "hooks block has SessionStart"
have "SessionEnd" "$(cat "$KONI_AGENT_OPS_HOME/claude-hooks.json")" "hooks block has SessionEnd"

# 2. default run does NOT touch settings.json (safe: manual-merge invariant)
[ -f "$KONI_CLAUDE_DIR/settings.json" ] && no "default run wrote settings.json (should not)" || ok "default run leaves settings.json untouched"

# 3. --merge-hooks (needs jq) merges into settings.json, idempotently, with a backup
if command -v jq >/dev/null 2>&1; then
  mkdir -p "$KONI_CLAUDE_DIR"; printf '{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"echo existing"}]}]}}' > "$KONI_CLAUDE_DIR/settings.json"
  sh "$INSTALL" --url "https://erp.example/api/agent-ops/ingest" --token "kagt_secret123" --merge-hooks >/dev/null 2>&1
  s=$(cat "$KONI_CLAUDE_DIR/settings.json")
  have "report.mjs" "$s" "merge: our command added"
  have "echo existing" "$s" "merge: preserved the pre-existing hook (additive)"
  ls "$KONI_CLAUDE_DIR"/settings.json.bak.* >/dev/null 2>&1 && ok "merge: backed up settings.json" || no "merge: no backup"
  n1=$(grep -o 'report.mjs' "$KONI_CLAUDE_DIR/settings.json" | wc -l | tr -d ' ')
  sh "$INSTALL" --url "https://erp.example/api/agent-ops/ingest" --token "kagt_secret123" --merge-hooks >/dev/null 2>&1
  n2=$(grep -o 'report.mjs' "$KONI_CLAUDE_DIR/settings.json" | wc -l | tr -d ' ')
  [ "$n1" = "$n2" ] && ok "merge: idempotent (no duplicate hooks on re-run)" || no "merge: duplicated ($n1 → $n2)"
else
  ok "merge: skipped (jq not installed)"
fi

# 4. re-run without url/token keeps existing config (idempotent, non-destructive)
sh "$INSTALL" >/dev/null 2>&1
have "kagt_secret123" "$(cat "$KONI_AGENT_OPS_HOME/config.env")" "re-run: config preserved"

# 5. --uninstall removes the home dir and (if jq) strips our hooks, keeping others
sh "$INSTALL" --uninstall >/dev/null 2>&1
[ -d "$KONI_AGENT_OPS_HOME" ] && no "uninstall: home dir still present" || ok "uninstall: removed home dir"
if command -v jq >/dev/null 2>&1 && [ -f "$KONI_CLAUDE_DIR/settings.json" ]; then
  s=$(cat "$KONI_CLAUDE_DIR/settings.json")
  case "$s" in *report.mjs*) no "uninstall: our hooks still in settings.json" ;; *) ok "uninstall: our hooks stripped from settings.json" ;; esac
  case "$s" in *"echo existing"*) ok "uninstall: preserved the pre-existing hook" ;; *) no "uninstall: clobbered a foreign hook" ;; esac
fi

rm -rf "$H"
echo; echo "install-test: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
