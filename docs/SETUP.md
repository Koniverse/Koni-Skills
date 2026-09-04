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

### Iterate on this repo's own docs

```bash
# Regenerate STATUS.md from story frontmatter
npx koni-docs status --docs-path docs/

# Check the ID graph + FR references resolve
npx koni-docs validate --docs-path docs/
```

> **Do not run `koni-docs sync` in this repo.** At CLI 0.10.0 it over-aggregates the
> PRD/EPIC "Ship" column and overwrites curated `version_shipped` narrative. This repo
> runs `status` + `validate` only and hand-maintains the FR tables — see
> [CONTEXT D39](CONTEXT.md). Revisit when a newer CLI fixes the aggregation.

### Run the guards

Three layers, each with its own subject. CI runs all of them on every push and PR
([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)); run them locally before you
push so the feedback is seconds instead of minutes.

```bash
# 1. The gate's checks — runs every self-test AND proves the coverage.
#    Coverage is derived from gates.conf: a check with no suite fails the run.
sh skills/koni-harness/scripts/__tests__/run-all.sh

# 2. The skill docs — every link, anchor, §-pointer, and named script must resolve.
#    Run after editing ANY skill file.
python3 skills/koni-docs/scripts/check-references.py skills/<skill-name>

# 3. The CLI package
npm test --prefix packages/koni-docs
```

The gate itself can be run directly for any phase:

```bash
sh .koni-harness/gate-runner.sh --phase work-commit
sh .koni-harness/gate-runner.sh --phase release-commit
sh .koni-harness/gate-runner.sh --phase pre-push
```

> **Adding a check to the gate means adding its self-test.** `run-all.sh` reads
> `gates.conf` and reports any check no suite references as `UNCOVERED`, failing the run —
> so a new row without a test is a red build, not a quiet gap. The obligations (plant the
> defect first; pin the skip-passes *as* skip-passes; pin the tolerances) are in
> [`gate-catalog.md`](../skills/koni-harness/references/gate-catalog.md).

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
| `npx koni-docs validate` errors on a story | Story file lacks `id:` frontmatter | Fix the story file — RULE-6 requires `id` to match filename |
| `npx koni-docs status` ignores a story | Filename ≠ `id` frontmatter | Same as above — RULE-6 |
| `check-references.py` reports a wrong stated count | Prose count drifted from what it counts (rules / subcommands / release-commit-only checks) | Fix the number, or de-number the phrase if its ground truth is ambiguous (LESSONS §28, §36) |
| Sync test fails on Mac with EPERM | Tmpdir cleanup race | Re-run; pass `--keep` to inspect; file an issue if it persists |

For anything else, log a [`LESSONS.md`](LESSONS.md) entry once you've
chased the root cause — that is how this repo accumulates institutional
memory.

---

### Koni-docs CLI

This project's docs are managed by the `@koniverse/koni-docs` CLI. Install it locally:

```bash
npm install --save-dev @koniverse/koni-docs
```

Then any of the standard sync/status operations work via npx:

```bash
npx koni-docs status
npx koni-docs sync --story US-X.Y
npx koni-docs inject-tasks --story US-X.Y
npx koni-docs backfill-fields
npx koni-docs backfill-commits
```

For programmatic / library use:

```ts
import { loadCorpus, getStories } from '@koniverse/koni-docs/lib';
```
