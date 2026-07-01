# Onboarding audit — present/missing matrix for an existing repo

Use this when a repo already exists and the user wants it brought up to the
Koniverse standard. The discipline: **report first, then fill gaps, never
overwrite real content.**

## Legend

```
✅ present (real content)   ⚠️ stub / partial   ⬜ missing
```

## Audit matrix — walk every row

Classify the repo profile first (see repo-types.md), then check each expected
artifact. Rows tagged *(code)*, *(devops)*, *(content)* only apply to that
profile; untagged rows apply to all.

### Core
- [ ] `VERSION` (bare semver at root)
- [ ] `CLAUDE.md` (has a `## Koni-Docs Integration` block)
- [ ] `AGENTS.md` (recommended — canonical source of truth)
- [ ] `README.md`
- [ ] `.gitignore` covers `.active-context.md`, `node_modules/`, `.env`, `_bmad-output/`

### Docs surface
- [ ] `docs/README.md` (doc hub)
- [ ] `docs/CHANGELOG.md` (has `## [Unreleased]` anchor)
- [ ] `docs/CONTEXT.md`
- [ ] `docs/LESSONS.md`
- [ ] `docs/SETUP.md`
- [ ] `docs/BRIEF.md`
- [ ] `docs/PRD.md` *(code; content optional)*
- [ ] `docs/ARCHITECTURE.md` *(code; content usually omit)*
- [ ] `docs/sprints/README.md`
- [ ] `docs/sprints/STATUS.md` (auto-generated — RULE-5)
- [ ] `docs/sprints/{epics,stories,archive}/`
- [ ] `docs/tests/{README.md,test-organization.md,STRATEGY.md,findings.md,test-plan/,test-cases/,bug-bash/,audits/}` (koni-qc test-organization standard; `test-reports/EPIC-NN/<date>/` is created on first run, not scaffolded)
- [ ] `<app>/tests/epic/` — the test **code** root exists (koni-qc §2); code repos only
- [ ] `docs/design/`

### Test-doc drift (the ERP-02 patterns — flag, don't silently pass)
- [ ] **Report path** — run folders are `test-reports/EPIC-NN/<MMDDYYYY>/`, **not** a flat
  `test-reports/<date>/` and **not** ISO `YYYY-MM-DD` (koni-qc test-automation §2 validator)
- [ ] **Code layout** — tests live under `<app>/tests/epic/EPIC-NN/`, **not** flat
  `tests/*.test.ts` (a flat layout is non-conformant — migrate it, koni-qc §2)
- [ ] **Strategy home** — whole-repo strategy is in `docs/tests/STRATEGY.md`, **not**
  overloaded into `test-plan/README.md`
- [ ] **Covered-by vocabulary** — only `<path>.spec.ts::name`, `PROPOSED:<path>::name`,
  or `— (manual)`; no ad-hoc free-text markers

### Skills & agents
- [ ] `.claude/skills/koni-docs` resolves (not dangling)
- [ ] `.agents/skills/koni-docs` resolves
- [ ] `_bmad/` present, `_bmad-output/` gitignored

### Active Context
- [ ] Pattern A: inline `<!-- koni-docs:auto-update -->` block in CLAUDE.md, **or**
- [ ] Pattern B: `.active-context.example.md` committed + `.active-context.md` gitignored

### Profile extras
- [ ] `.env.example` *(code, devops)*
- [ ] `DEPLOY.md` *(code, devops)*
- [ ] `Dockerfile` *(code, if containerized)*
- [ ] agile npm scripts + `@koniverse/koni-docs` devDep *(code)*
- [ ] `.devenvironment/` gitignored + `.gitmodules` initialized *(devops)*
- [ ] `REPO_STRUCTURE.md` *(content)*

## Quick audit script

```bash
echo "## koni-setup audit"
chk(){ [ -e "$1" ] && echo "✅ $1" || echo "⬜ $1"; }
chk VERSION; chk CLAUDE.md; chk AGENTS.md; chk README.md
chk docs/README.md; chk docs/CHANGELOG.md; chk docs/CONTEXT.md; chk docs/LESSONS.md
chk docs/SETUP.md; chk docs/PRD.md; chk docs/ARCHITECTURE.md
chk docs/sprints/README.md; chk docs/sprints/STATUS.md
chk docs/sprints/epics; chk docs/sprints/stories
chk docs/tests/test-cases; chk docs/tests/STRATEGY.md; chk docs/design
# test-doc drift (ERP-02 patterns) — warn, don't fail
[ -d docs/tests/test-reports ] && ls docs/tests/test-reports 2>/dev/null | grep -Eqv '^EPIC-' && echo "⚠ test-reports/ has non-EPIC-NN folders (flat/ISO date drift — koni-qc test-automation §2)"
A="${APP:-.}"; { [ -d "$A/tests" ] && ls "$A"/tests/*.test.* >/dev/null 2>&1 && [ ! -d "$A/tests/epic" ]; } && echo "⚠ flat tests/*.test.* with no tests/epic/ (migrate to by-epic — koni-qc §2)"
# core trio skill links resolve? + the harness gate vendored?
for s in koni-docs koni-harness koni-qc; do
  for d in ".claude/skills/$s" ".agents/skills/$s"; do
    [ -e "$d" ] && echo "✅ $d -> $(readlink "$d" 2>/dev/null)" || echo "⬜ $d (missing/dangling)"
  done
done
chk .koni-harness/gate-runner.sh
echo "bmad pack: $(find .claude/skills -maxdepth 1 -name 'bmad-*' 2>/dev/null | wc -l | tr -d ' ')"
grep -q "Koni-Docs Integration" CLAUDE.md 2>/dev/null && echo "✅ integration block" || echo "⬜ integration block"
[ -f .active-context.example.md ] && echo "✅ active-context (Pattern B)" || \
  (grep -q "koni-docs:auto-update" CLAUDE.md 2>/dev/null && echo "✅ active-context (Pattern A)" || echo "⬜ active-context")
```

## Filling rules

- **⬜ missing scaffolding** → create the skeleton (this skill) and hand the
  *content* to koni-docs templates.
- **⚠️ stub / partial** → ask the user before editing. A populated-but-thin PRD
  is theirs to extend, not yours to replace.
- **✅ present** → leave it. Do not "improve" working files during onboarding.
- **Doc-content backfill** (missing story frontmatter, pending CHANGELOG SHAs,
  broken ID refs) → not this skill's job. Run koni-docs' own audit loop:
  `koni-docs validate --include-warnings`, `koni-docs backfill-fields`,
  `koni-docs status`.

## Output: the diff summary

End every onboarding with a short report: what was already there, what you
created, what you intentionally left for koni-docs or for the user. The user
should be able to see exactly what changed without running `git diff`.
