# SETUP.md — Koni-Skills Local Development

This document covers everything needed to clone the repo, restore
installed helper skills, and start iterating on a new or existing skill.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 LTS | The `npx skills` CLI and bundled `*.mjs` scripts target Node 20+. |
| Git | any recent | Standard checkout / commit / push workflow. |
| `npx` | bundled with Node | Used to invoke `skills` without a global install. |

This repo has **no runtime env vars and no deploy step** — it is a source
repository for distributable skills. If a future skill introduces env
vars or a server surface, RULE-11 from `koni-docs` requires
`SETUP.md` + `DEPLOY.md` + `.env.example` to land in the same commit.

---

## Initial setup

```bash
git clone https://github.com/Koniverse/Koni-Skills.git
cd Koni-Skills

# Restore installed helper skills (skill-creator) declared in skills-lock.json
npx skills experimental_install

# Verify everything is in place
npx skills list
```

Expected `npx skills list` output (abbreviated):

```
koni-docs        skills/koni-docs/SKILL.md             local
skill-creator    .agents/skills/skill-creator/SKILL.md  anthropics/skills
```

---

## Day-to-day workflows

### Run sync-script regression test

```bash
node skills/koni-docs/scripts/__tests__/sync-test.mjs
```

Exit code 0 = all 5 sync scripts pass against the in-tmp fixture.
Pass `--keep` to inspect the fixture after a failure.

### Iterate on this repo's own docs

```bash
# Regenerate STATUS.md from story frontmatter
node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/

# Propagate story status across epic, PRD §11, sprint, FR row
node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/

# Preview before writing
node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/ --dry-run
```

### Create a new skill in this repo

Invoke the `skill-creator` skill (it is installed via `npx skills
experimental_install`). The high-level loop is documented in
[AGENTS.md](../AGENTS.md) §"Creating and editing skills".

```bash
npx skills init koni-<name>       # scaffolds skills/<name>/SKILL.md
```

Then iterate inside `skills/<name>/` using `skill-creator`.

### Update an installed skill

```bash
npx skills update                  # update all installed skills
npx skills update koni-docs        # update one skill
```

---

## Environment variables

**None required.** This repo intentionally has no `.env*` files and no
`.env.example`. If you find yourself reaching for one, that is a signal
to (a) reconsider whether the value belongs inside a specific skill's
bundled assets, or (b) plan a proper RULE-11 commit that lands SETUP +
DEPLOY + .env.example together.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `npx skills list` shows nothing after clone | Lockfile not restored | `npx skills experimental_install` |
| `agile-sync-up.mjs` crashes with "missing id" | Story file lacks `id:` frontmatter | Fix the story file — RULE-6 requires `id` to match filename |
| `generate-status.mjs` ignores a story | Filename ≠ `id` frontmatter | Same as above — RULE-6 |
| Sync test fails on Mac with EPERM | Tmpdir cleanup race | Re-run; pass `--keep` to inspect; file an issue if it persists |

For anything else, log a [`LESSONS.md`](LESSONS.md) entry once you've
chased the root cause — that is how this repo accumulates institutional
memory.
