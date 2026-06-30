# Skill wiring — `.claude` / `.agents`, symlinks, agile scripts

**Contents**: [Three wiring strategies](#three-wiring-strategies--pick-one) ·
[Wiring commands (central symlink)](#wiring-commands-central-symlink) ·
[Repair a dangling link](#repair-a-dangling-link-onboardaudit) ·
[Agile scripts (package.json block)](#agile-scripts-code-repos--packagejson-block)

Koniverse repos expose skills to every AI tool through two parallel dirs:

- `.claude/skills/` — read by Claude Code
- `.agents/skills/` — read by the other agents (Cursor, Gemini, Codex, Copilot)

The observed convention chains them so one physical copy serves both:
`.claude/skills/<name>` → `../../.agents/skills/<name>`, and
`.agents/skills/<name>` is either a symlink to the central `Koni-Skills/skills/<name>`
or a vendored copy.

## Three wiring strategies — pick one

| Strategy | How | When |
|---|---|---|
| **Central symlink (recommended)** | `.agents/skills/koni-docs` → the shared `Koni-Skills/skills/koni-docs`; `.claude/skills/koni-docs` → `../../.agents/skills/koni-docs` | Dev machine that has the `Koni-Skills` repo checked out beside this one. Always tracks the latest skill. |
| **Absolute symlink** | `.claude/skills/koni-docs` → `/abs/path/Koni-Skills/skills/koni-docs` (koni-devops does this) | Quick single-tool wiring; less portable across machines |
| **Vendored copy** | real copy of the skill committed into `.claude/skills/` (koni-training does this — 61 skills) | CI / clone-and-go repos that must not depend on a sibling checkout. Trade-off: must re-sync on skill updates |

Symlinks keep one source of truth but break if the target moves or isn't
checked out. Vendoring is self-contained but drifts. For repos developed on the
same machine as `Koni-Skills`, prefer the central symlink.

## Wiring commands (central symlink)

Run from the consumer repo root. Adjust `KONI_SKILLS` to wherever the shared
repo lives.

```bash
KONI_SKILLS="$(cd ../Koni-Skills && pwd)"      # resolve the shared repo
mkdir -p .agents/skills .claude/skills

# Koniverse core trio — wire all three (physical link in .agents, relative hop from .claude)
for s in koni-docs koni-harness koni-qc; do
  ln -sfn "$KONI_SKILLS/skills/$s" ".agents/skills/$s"
  ln -sfn "../../.agents/skills/$s" ".claude/skills/$s"
done

# koni-harness also vendors its gate — guarded so it only runs once the docs/
# tree + VERSION exist (the gate's version/changelog/validate checks read them):
if [ -f VERSION ] && [ -d docs ]; then
  sh .claude/skills/koni-harness/scripts/install-gate.sh   # → .koni-harness/ + chained git hooks (additive, idempotent)
else
  echo "gate install skipped — create docs/ + VERSION first (bootstrap §2–3), then re-run install-gate.sh"
fi

# repeat the loop for any extra skills (koni-setup itself, koni-nextjs, domain skills)
```

For **BMAD** skills (planning) and **Anthropic/gstack** skills, follow the same
pattern or vendor them — match whatever the reference repos of the same profile
already do (content repos vendor a large set; code repos keep it lean).

## Repair a dangling link (onboard/audit)

The #1 onboarding find is a `koni-docs` symlink pointing at a path that no
longer exists (repo moved, sibling not checked out).

```bash
# detect
for s in .claude/skills/* .agents/skills/*; do
  [ -L "$s" ] && { t="$(readlink "$s")"; [ -e "$s" ] || echo "DANGLING: $s -> $t"; }
done
# repair: re-point the core trio to the current Koni-Skills location
for s in koni-docs koni-harness koni-qc; do
  ln -sfn "$KONI_SKILLS/skills/$s" ".agents/skills/$s"
  ln -sfn "../../.agents/skills/$s" ".claude/skills/$s"
done
```

`ln -sfn` is the safe re-point: `-f` replaces, `-n` treats an existing symlinked
dir as a file so you don't nest a link inside it.

## Agile scripts (code repos) — `package.json` block

Code repos invoke the koni-docs CLI through npm aliases (Senti-Quant pattern).
Add the devDep and the scripts:

```jsonc
{
  "scripts": {
    "agile:status":      "koni-docs status --docs-path docs/",
    "agile:sync":        "koni-docs sync --docs-path docs/",
    "agile:tasks":       "koni-docs inject-tasks --docs-path docs/",
    "agile:backfill":    "koni-docs backfill-fields --docs-path docs/",
    "changelog:backfill":"koni-docs backfill-commits --docs-path docs/"
  },
  "devDependencies": {
    "@koniverse/koni-docs": "^0.8.1"
  }
}
```

Then `npm install` and verify with `npx koni-docs --version`.

**One source for the version**: don't hardcode a literal in two places. Read the
current version from the shared `Koni-Skills/VERSION` (it tracks the published
npm version) and write that into `package.json` — e.g.
`v="$(cat ../Koni-Skills/VERSION)"` then pin `"^$v"`. The `^0.8.1` above is
illustrative of the format, not a value to copy blindly; a stale literal is how
two repos drift apart.

Non-code repos can't use npm scripts — they call the CLI directly
(`koni-docs status --docs-path docs/`) with koni-docs installed globally, or
via the symlinked skill's instructions. Don't add a `package.json` to a content
repo just for these aliases.
