#!/bin/sh
# Block staged ADDED lines containing high-confidence secrets. Allowlist: .koni-harness/secret-allow
set -eu
added=$(git diff --cached -U0 2>/dev/null | grep '^+' | grep -v '^+++' || true)
[ -n "$added" ] || exit 0
if [ -f .koni-harness/secret-allow ]; then
  while IFS= read -r pat; do
    [ -n "$pat" ] || continue
    added=$(printf '%s\n' "$added" | grep -vF "$pat" || true)
  done < .koni-harness/secret-allow
fi
hit=0
printf '%s\n' "$added" | grep -Eq 'BEGIN [A-Z ]*PRIVATE KEY' && { echo "credential-scan: PEM private key"; hit=1; }
printf '%s\n' "$added" | grep -Eq 'AKIA[0-9A-Z]{16}' && { echo "credential-scan: AWS access key id"; hit=1; }
printf '%s\n' "$added" | grep -Eq '(api[_-]?key|secret|token)[[:space:]]*[:=][[:space:]]*["'\'']?[A-Za-z0-9/+_=-]{24,}' \
  && { echo "credential-scan: hardcoded secret-like assignment"; hit=1; }
exit "$hit"
