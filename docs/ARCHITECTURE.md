# ARCHITECTURE — Koni-Skills

> Last updated: 2026-05-27 (v0.1.0)
> Maintainer: @AnhMTV

## System overview

Koni-Skills is a **GitHub-hosted skill catalog** — a flat collection of
self-contained skill directories under `skills/<name>/`, distributed via
the `npx skills` CLI. There is no server, no runtime, and no build step
for the catalog itself; each skill is content-addressed by a hash
recorded in `skills-lock.json`. The repo also dogfoods its own
`koni-docs` skill: this repo's `docs/` folder is structured and managed
by exactly the rules and templates the skill publishes.

Architectural drivers: (a) **agent-agnostic loading** — every major
coding agent (Claude Code, Codex, Cursor, Gemini, Copilot) must
activate the same skill the same way; (b) **token-efficient activation**
— skill body ≤ 500 lines, on-demand template loading; (c) **zero
divergence across consumer repos** — one upgrade command, lockfile-tracked.

## Tech stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Runtime | Node.js | ≥ 20 LTS | Required by `npx skills` CLI and bundled `*.mjs` scripts |
| Distribution CLI | `npx skills` | latest | Lockfile-tracked install/update/remove; GitHub as source-of-truth |
| Skill spec | `SKILL.md` (YAML frontmatter + Markdown body) | — | Format agreed across `anthropics/skills`, gstack skills, and Koni-Skills |
| Automation | Node ES modules (`*.mjs`) | — | Zero-dependency scripts; same runtime as the CLI |
| Test runner | Plain Node + custom assertions | — | Self-contained — no Jest/Vitest dependency for sync-test |
| Hosting | GitHub (public repo) | — | `npx skills` reads `github.com/<org>/<repo>` directly |
| Versioning | Semantic versioning, file: `VERSION` | — | Bumped in lockstep with CHANGELOG (RULE-1) |

## Component architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                       Koni-Skills repository                       │
│                                                                    │
│  ┌──────────────────┐    ┌─────────────────────────────────────┐   │
│  │   skills/<name>/ │    │  .agents/skills/<installed-helper>/ │   │
│  │  ┌────────────┐  │    │  (e.g. skill-creator)               │   │
│  │  │ SKILL.md   │  │    │  managed by `npx skills`            │   │
│  │  │ references/│  │    └─────────────────────────────────────┘   │
│  │  │ scripts/   │  │                                              │
│  │  │ assets/    │  │    ┌─────────────────────────────────────┐   │
│  │  └────────────┘  │    │  skills-lock.json                   │   │
│  └──────────────────┘    │  hash + source per installed skill  │   │
│         ▲                └─────────────────────────────────────┘   │
│         │ dogfood                                                  │
│  ┌──────┴──────────────────────────────────────────────────────┐   │
│  │                          docs/                              │   │
│  │  Brief / PRD / Arch / Context / Lessons / Sprints / STATUS  │   │
│  │  managed by the very `skills/koni-docs/` skill above        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ `npx skills add Koniverse/Koni-Skills --skill <name>`
                              ▼
                  ┌─────────────────────────────┐
                  │  Consumer Koniverse project │
                  │  reads SKILL.md at agent    │
                  │  session-start              │
                  └─────────────────────────────┘
```

| Component | Responsibility | Tech | Key files |
|-----------|---------------|------|-----------|
| Skill source | Per-skill instructions + bundled resources | Markdown + YAML + `.mjs` | `skills/<name>/` |
| Helper skills | Third-party skills (e.g. `skill-creator`) used during development | Markdown + Python/JS | `.agents/skills/<name>/` |
| Lockfile | Records installed skills, sources, content hashes | JSON | `skills-lock.json` |
| Dogfood docs | This repo's own canonical documentation | Markdown + YAML | `docs/` |
| Agent guides | Entry points for AI agents | Markdown | `CLAUDE.md`, `AGENTS.md` |

## Skill anatomy

Every skill in `skills/<name>/` follows the same shape:

```
skills/<name>/
├── SKILL.md            ← required: YAML frontmatter + body, ≤ 500 lines
├── references/         ← optional: loaded on demand
│   ├── rules.md
│   ├── templates.md
│   └── templates/      ← one file per document type
├── scripts/            ← optional: bundled automation, executed directly
│   ├── *.mjs
│   └── __tests__/      ← regression tests
└── assets/             ← optional: files referenced from output
```

**Activation contract** (consumed by every coding agent):
1. Agent reads project's `CLAUDE.md` / `AGENTS.md` at session start.
2. Agent encounters a Koni-Docs Integration block referencing
   `skills/<name>/SKILL.md`.
3. On a matching user request, agent loads `SKILL.md` body, then loads
   the specific reference file from the activation table on demand.
4. Agent never loads bundled scripts as text — it executes them via
   `node skills/<name>/scripts/<file>.mjs`.

## Data architecture

### Lockfile schema (`skills-lock.json`)

```json
{
  "version": 1,
  "skills": {
    "<skill-name>": {
      "source": "<org>/<repo>",
      "sourceType": "github",
      "skillPath": "skills/<name>/SKILL.md",
      "computedHash": "<sha256 hex>"
    }
  }
}
```

| Field | Purpose | Indexes |
|-------|---------|---------|
| `source` | GitHub `org/repo` the skill was installed from | — |
| `sourceType` | Currently always `github`; reserved for future sources | — |
| `skillPath` | Path within the source repo to the skill's `SKILL.md` | — |
| `computedHash` | SHA-256 of the resolved SKILL.md content at install time | Drift detection on `npx skills update` |

### Doc layer schema (5-layer consistency)

The `koni-docs` 5-layer consistency contract: every story status change
must propagate through these layers. Implemented by
[`agile-sync-up.mjs`](../skills/koni-docs/scripts/agile-sync-up.mjs).

| Layer | File | Schema element |
|-------|------|----------------|
| 1 — Story | `docs/sprints/stories/US-X.Y-*.md` | `status`, `version_shipped`, AC + Tasks `[x]` |
| 2 — Epic | `docs/sprints/epics/EPIC-N.md` | Stories table row matching the story id |
| 3 — PRD §11 | `docs/PRD.md` | Per-epic Stories table row |
| 4 — PRD §8 | `docs/PRD.md` | FR row referencing the story |
| 5 — Sprint | `docs/sprints/sprint-YYYY-WNN.md` | Sprint scope row |

A sixth artifact, `docs/sprints/STATUS.md`, is auto-generated by
[`generate-status.mjs`](../skills/koni-docs/scripts/generate-status.mjs)
— never hand-edited (RULE-5).

## API architecture

> Koni-Skills exposes no HTTP API. The "API" the catalog has is the
> `npx skills` CLI surface — install, update, remove, list. That CLI's
> contract is owned upstream (it is not part of this repo). The table
> below names the CLI invocations the catalog supports.

| Invocation | Effect |
|------------|--------|
| `npx skills add <org>/<repo> --skill <name>` | Resolve skill, install into `.agents/skills/<name>/`, record in lockfile |
| `npx skills add <org>/<repo> --list` | Browse skills available in a source repo without installing |
| `npx skills experimental_install` | Restore every skill declared in `skills-lock.json` (used on fresh clone) |
| `npx skills update [<name>]` | Refresh installed skill(s); update lockfile hash |
| `npx skills remove --skill <name>` | Remove an installed skill |
| `npx skills list [--json]` | List installed skills (human or machine-readable) |
| `npx skills init koni-<name>` | Scaffold `skills/<name>/SKILL.md` for a new skill |

## Security architecture

| Concern | Approach | Detail |
|---------|----------|--------|
| Source authenticity | GitHub repo URL | `npx skills add` resolves against a specific `org/repo` — no third-party registry hop |
| Content integrity | SHA-256 lockfile hash | Stored in `skills-lock.json`; recomputed on update; mismatch surfaces as drift |
| Skill code execution | Skills are read by the agent; bundled scripts run only when agent invokes `node ...` | No auto-exec; agents must explicitly call scripts |
| Secrets in skills | Forbidden — skills are public artifacts | No `.env` files inside `skills/<name>/`; reviewers reject |
| Doc rule enforcement | `koni-docs` rules (RULE-1..14) | Pre-commit checklist + grep-style verification in `references/rules.md` |

## Deployment architecture

This repo is **not deployed**. It is consumed by:

```
Koniverse/Koni-Skills (this repo, GitHub)
  │
  │ `npx skills add Koniverse/Koni-Skills --skill koni-docs`
  ▼
Consumer project (any Koniverse repo)
  └── .agents/skills/koni-docs/   ← installed copy
      skills-lock.json            ← hash + source recorded
```

The "release" of a new skill version is:
1. Bump `VERSION` in this repo.
2. Add a `docs/CHANGELOG.md` entry with the real commit SHA.
3. `git tag v<X.Y.Z>` and push.
4. Consumer projects run `npx skills update` on their next sprint.

## Integration architecture

| External tool | Purpose | Activation | Fallback |
|---------------|---------|------------|----------|
| BMad | Upstream brainstorm → brief → PRD → epics/stories pipeline | Manual map: BMad artifacts → koni-docs templates | Templates work standalone if BMad is not used |
| GStack | Plan / design / QA review skills | Optional; koni-docs is independent | Pre-commit checklist works without GStack |
| Superpowers | Implementation skills (TDD, dispatching, etc.) | Optional; complements koni-docs | Plain implementation works without |
| `skill-creator` (anthropics/skills) | Develop / evaluate / package skills in this repo | Installed via `npx skills` in this repo only | Skills can be developed by hand |
| `npx skills` CLI | Distribution + lockfile | Required for consumers | — |

## Architecture decisions

| ID  | Topic | Summary | Version | CONTEXT Ref |
|-----|-------|---------|---------|-------------|
| AD-1 | Skill = self-contained directory | Each skill ships SKILL.md + references + scripts in one path; no cross-skill imports | v0.1.0 | [D1](CONTEXT.md) |
| AD-2 | Distribution via `npx skills` + lockfile | Content-hashed install/update; GitHub is the source-of-truth | v0.1.0 | [D2](CONTEXT.md) |
| AD-3 | 9 project-agnostic rules + plugin slot | Core rules stay sharp; stack rules ship as separate plugin skills | v0.1.0 | [D3](CONTEXT.md) |
| AD-4 | Templates split one-file-per-type | Agents load only the template matching a user request — token efficiency | v0.1.0 | [D4](CONTEXT.md) |
| AD-5 | Pipeline integration as standardizer (not replacement) | Koni-docs maps BMad/GStack/Superpowers output to canonical docs; doesn't replace them | v0.1.0 | [D5](CONTEXT.md) |
| AD-6 | Dogfood `koni-docs` on this repo itself | If we can't run the skill on its own home, consumers will hit the same gaps | v0.2.0 (planned) | [D6](CONTEXT.md) |

Individual decisions are recorded in [CONTEXT.md](CONTEXT.md). Link new
architecture decisions from CONTEXT.md here as they are recorded.

## Open architecture questions

- [ ] How should plugin skills (`koni-supabase`, `koni-nextjs`) declare
      they *extend* `koni-docs` rules without copy-pasting them?
      Candidate: a `koni-docs-plugins:` array in the integration block
      that the agent reads as a load directive.
- [ ] Should sync scripts also be exposed via `npx skills exec
      koni-docs:sync-up`? Currently the canonical invocation is `node
      skills/koni-docs/scripts/agile-sync-up.mjs` — works, but is verbose.
- [ ] What is the right CI gate? Today the regression test runs locally;
      a GitHub Action would catch drift on PRs.
