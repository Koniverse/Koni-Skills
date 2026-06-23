# Repo profiles — classification & per-profile expectations

Every Koniverse repo shares a **common core** (below). On top of that, each
profile adds its own files. Classify the repo, then take the union of the
common core plus every profile that applies (repos can be hybrid).

## Common core — every profile has these

| File / dir | Purpose |
|---|---|
| `VERSION` | bare semver at repo root (no `v` prefix) |
| `CLAUDE.md` | thin pointer + Koni-Docs Integration block + Active Context pointer |
| `README.md` | human-facing overview + setup steps |
| `.gitignore` | node_modules / .env / build output / `.active-context.md` / `_bmad-output/` |
| `docs/` | koni-docs surface: `CHANGELOG.md`, `CONTEXT.md`, `LESSONS.md`, `sprints/` (README + STATUS.md + epics/ + stories/), `README.md` |
| `.claude/skills/` + `.agents/skills/` | skill wiring; at minimum a `koni-docs` link |
| `_bmad/` + `_bmad-output/` | BMAD framework (present even when lightly used; `_bmad-output/` is gitignored) |

`AGENTS.md` is **strongly recommended** for any repo with >1 AI tool or >1
contributor (AGENTS-canonical convention). koni-training and Koni-Skills use it
as the single source of truth; CLAUDE.md becomes a thin pointer.

`.active-context.example.md` (committed) + gitignored `.active-context.md` is the
team pattern (Pattern B). Solo repos may keep Active Context inline in CLAUDE.md
(Pattern A) and skip these two files.

---

## Profile: code

**Telltale**: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.
**Reference repos**: `Koni-ERP-02` (Next.js + Supabase), `Senti-Quant` (Wasp monorepo).

Adds on top of the common core:

| File / dir | Notes |
|---|---|
| `.env.example` | env var template (RULE-11: kept in sync with SETUP + DEPLOY) |
| `docs/ARCHITECTURE.md` | tech stack / components / data / ADs — required for code repos |
| `docs/PRD.md` | full agile PRD with Epics & User Stories index |
| `docs/SETUP.md` | clone → install → run dev |
| `DEPLOY.md` (root) | production runbook |
| `DESIGN.md` (root) | if the repo has UI |
| `Dockerfile` / `docker-compose` | if containerized |
| `package.json` agile scripts | `agile:status/sync/tasks/backfill` + `changelog:backfill` (see skill-wiring.md) |
| `@koniverse/koni-docs` devDep | so `npx koni-docs` works in CI |
| `.github/workflows/` | optional CI (Senti-Quant has deploy workflows) |

## Profile: devops

**Telltale**: shell-first, `.gitmodules`, deploy scripts, no app package manifest.
**Reference repo**: `koni-devops` (Dokploy vendored as submodule).

Adds on top of the common core:

| File / dir | Notes |
|---|---|
| `.gitmodules` + submodule | upstream vendored read-only; init with `git submodule update --init --recursive` |
| `.devenvironment/` | local secrets (SSH keys, API keys) — **gitignored**, never committed |
| `scripts/` | deployment automation (`*.sh`) |
| `.env.example` | env template |
| `DEPLOY.md` (root) | the primary doc for this profile — VPS access + secret placement + deploy run |
| `docs/SETUP.md` | focuses on access + secret management, not app install |

Often **no** `docs/PRD.md` / `ARCHITECTURE.md` if it's pure infra glue — judge
by whether there's a product being specced vs. just deployment wiring.

## Profile: content

**Telltale**: Markdown / HTML / static assets, no package manifest at root.
**Reference repos**: `koni-growth` (marketing strategy), `koni-landing` (landing pages + generators), `koni-training` (HTML lecture decks + BMAD).

Adds on top of the common core:

| File / dir | Notes |
|---|---|
| `REPO_STRUCTURE.md` (root) | detailed file-organization conventions — content repos lean on this instead of ARCHITECTURE.md |
| domain dirs | e.g. `pod/`, `research/`, `strategies/`, `okr/` (growth); `landing-pages/`, `blog/`, `guides/`, `shared/` (landing); `content/lecture-*/` (training) |
| lighter `docs/` | usually **no** ARCHITECTURE.md; PRD.md minimal or absent (not software) |
| heavier skill set | content repos vendor many skills (design, copywriting, CRO, bmad) — see skill-wiring.md |

Content repos typically have **no** `.env.example`, `Dockerfile`, or CI — they
are open-in-Claude-Code-and-go, skills auto-load, no build step.

---

## Hybrid repos

`Senti-Quant` is code + content (app/ + blog/). Take the union: code profile
scaffolding for `app/`, plus content conventions for `blog/`. When in doubt,
classify by the **primary deliverable** and add the secondary profile's
specific dirs only where they exist.
