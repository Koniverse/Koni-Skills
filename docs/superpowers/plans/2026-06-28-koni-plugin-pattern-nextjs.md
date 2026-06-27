# US-3.1 — Plugin-skill pattern + koni-nextjs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. This story is **docs-only** (no scripts/TDD) — tasks are doc-writing + an author-blind review + the koni-docs ship.

**Goal:** Define the plugin-skill pattern (a koni-docs reference) and ship one reference plugin (`koni-nextjs`) that proves it, closing FR-9 and the last EPIC-3 pillar.

**Architecture:** A new `skills/koni-docs/references/plugin-pattern.md` documents how plugin skills extend koni-docs (location, discovery via `koni-docs-plugins`, compose-not-duplicate, namespaced rules, authoring checklist). A new self-contained `skills/koni-nextjs/SKILL.md` carries `NX-`-namespaced Next.js rules and a "Composes with koni-docs" section. koni-docs SKILL.md gains additive pointers; koni-nextjs is wired via mirrored symlinks.

**Tech Stack:** Markdown only. Verification is an author-blind review subagent + a `grep` self-check (no test suite — there is no executable code).

---

## Design decisions locked from the spec

Resolves spec [§7 open questions](../specs/2026-06-28-koni-plugin-pattern-nextjs-design.md):

- **NX-1 LESSON citation**: the "`next build` catches errors `tsc --noEmit` misses" lesson is the filled example in `skills/koni-docs/references/templates/lessons.md`; cite that as the rationale for NX-1.
- **koni-docs pointer placement**: add a one-line pointer in BOTH §2 (after the "Technology-specific rules … live in plugin skills" sentence) and §6 ("Plugin skills:" note), without renumbering rules or editing core-rule text.

## File Structure

```
skills/koni-docs/
├── SKILL.md                          # MODIFY (Task 3): additive pointers in §2 + §6
└── references/
    └── plugin-pattern.md             # CREATE (Task 1)

skills/koni-nextjs/
└── SKILL.md                          # CREATE (Task 2)

.claude/skills/koni-nextjs            # CREATE symlink (Task 2)
.agents/skills/koni-nextjs            # CREATE symlink (Task 2)
```

---

### Task 1: Write `skills/koni-docs/references/plugin-pattern.md`

**Files:**
- Create: `skills/koni-docs/references/plugin-pattern.md`

- [ ] **Step 1: Write the document** with these `##` sections (per spec §4):

  1. `## What a plugin skill is` — a tech-specific rule set that *extends* koni-docs for one stack (Supabase, Next.js, …); it adds rules, it does not replace the core 12.
  2. `## Where it lives` — `skills/koni-<tech>/SKILL.md` (+ optional `references/`), self-contained (AD-1: no cross-skill imports).
  3. `## Discovery` — a project opts in via `koni-docs-plugins: [<tech>]` inside its CLAUDE.md `koni-docs:` block; the agent then loads that plugin's SKILL.md alongside koni-docs. Show the CLAUDE.md snippet:
     ```yaml
     koni-docs:
       plugins: [nextjs]      # loads skills/koni-nextjs alongside koni-docs
     ```
  4. `## Composition contract` — extends/specializes; MUST NOT duplicate or override the 12 core rules; plugin rules are namespaced (`NX-`, `SB-`, …) so they never collide with `RULE-n`; a plugin MAY reference the koni-harness gate (add a `gates.conf` row / check) but does NOT build its own gate.
  5. `## Authoring a new plugin` — a checklist: name `koni-<tech>`; SKILL.md frontmatter (`name` + a pushy `description`); a namespaced rule table (`rule id · asserts · why · how to check`); a "Composes with koni-docs" section; when-to-use triggers; wiring (mirrored `.claude`/`.agents` symlinks + the `koni-docs-plugins: [<tech>]` declaration).
  6. `## Reference` — point to `skills/koni-nextjs/SKILL.md` as the worked example.

- [ ] **Step 2: Commit**

```bash
git add skills/koni-docs/references/plugin-pattern.md
git commit -m "docs(koni-docs): define the plugin-skill pattern (location/discovery/composition/authoring)"
```

---

### Task 2: Write `skills/koni-nextjs/SKILL.md` + wire it

**Files:**
- Create: `skills/koni-nextjs/SKILL.md`
- Create: symlinks `.claude/skills/koni-nextjs`, `.agents/skills/koni-nextjs`

- [ ] **Step 1: Write the skill** — YAML frontmatter then body.

  Frontmatter:
  - `name: koni-nextjs`
  - `description:` pushy + boundary-aware, e.g. "Next.js-specific rules that extend koni-docs for a Koni Next.js repo (App Router, `next build`, env / `NEXT_PUBLIC_`, server vs client components). Use this whenever working in a Koni repo that declares `koni-docs-plugins: [nextjs]` or is a Next.js app — alongside koni-docs, never replacing it."

  Body sections:
  1. `## What this owns vs. koni-docs` — adds Next.js rules; does NOT restate koni-docs core rules; load both when the project declares `koni-docs-plugins: [nextjs]`. References the koni-harness gate rather than rebuilding one.
  2. `## Rules` — a table `Rule | Asserts | Why | How to check`, with exactly:
     - **NX-1** — ship gate runs `next build`, not just `tsc --noEmit` | `tsc` passes on code that `next build` rejects (RSC/route/config errors) | check: a `pre-push` gate step runs `next build` — add a koni-harness `gates.conf` row `nextjs-build | checks/passthrough.sh | pre-push | block | next build`. Cite the koni-docs LESSONS "`next build` vs `tsc`" entry.
     - **NX-2** — only `NEXT_PUBLIC_*` env vars reach the client; no secret in a client component or a `NEXT_PUBLIC_` var | client bundles are public | check: composes with the harness `credential-scan` + RULE-11; grep changed client files / `NEXT_PUBLIC_` assignments.
     - **NX-3** — App Router: server components by default; add `"use client"` only when interactivity / browser APIs require it | over-clienting leaks work to the bundle + breaks server-only imports | check: review `"use client"` directives in the diff.
     - **NX-4** — every new env var lands in `.env.example` (+ `next.config` if needed) in the same commit | specializes RULE-11 for Next | check: new `process.env.X` ⇒ `X` present in `.env.example`.
  3. `## Composes with koni-docs` — discovery via `koni-docs-plugins: [nextjs]`; extends, never duplicates the 12 rules; NX-1 plugs into the koni-harness gate (`gates.conf` passthrough); follows the [plugin pattern](../koni-docs/references/plugin-pattern.md).
  4. `## When to use` — triggers (Next.js work in a Koni repo) + a one-line wire note (declare the plugin in CLAUDE.md; symlinked like the other skills).

  Keep it self-contained and tight (no `references/` needed). It MUST reference, not restate, any `RULE-n` it mentions.

- [ ] **Step 2: Wire the symlinks** (mirror koni-docs / koni-setup / koni-harness)

```bash
cd /Users/jindo9986/Documents/GitHub/Koni-Skills
ln -sfn ../../skills/koni-nextjs .agents/skills/koni-nextjs
ln -sfn ../../.agents/skills/koni-nextjs .claude/skills/koni-nextjs
test -e .claude/skills/koni-nextjs/SKILL.md && echo wired-ok
```

- [ ] **Step 3: Commit**

```bash
git add skills/koni-nextjs/SKILL.md .claude/skills/koni-nextjs .agents/skills/koni-nextjs
git commit -m "feat(skills/koni-nextjs): reference plugin — Next.js rules (NX-*) extending koni-docs"
```

---

### Task 3: Additive pointers in koni-docs SKILL.md

**Files:**
- Modify: `skills/koni-docs/SKILL.md`

- [ ] **Step 1: Add the pointers** (additive; do NOT renumber rules or edit core-rule text):
  - In **§2** (after the "Technology-specific rules (Supabase, Next.js) live in plugin skills" sentence): add one line — "See [`references/plugin-pattern.md`](references/plugin-pattern.md) for how plugin skills are structured, discovered (`koni-docs-plugins:`), and composed; `koni-nextjs` is the reference."
  - In **§6** (the "Plugin skills:" note): add one line pointing to `references/plugin-pattern.md` for the pattern + `koni-nextjs` as the example.

- [ ] **Step 2: Commit**

```bash
git add skills/koni-docs/SKILL.md
git commit -m "docs(koni-docs): point plugin mentions (§2/§6) at plugin-pattern + koni-nextjs"
```

---

### Task 4: Author-blind review

**Files:** (none — verification gate)

- [ ] **Step 1: Self-check no core-rule duplication**

Run: `grep -nE 'RULE-[0-9]+' skills/koni-nextjs/SKILL.md`
Expected: any hit is a *reference* to a core rule (e.g. "composes with RULE-11"), never a restatement/redefinition. If a hit restates a rule, fix it to reference instead.

- [ ] **Step 2: Dispatch an author-blind review subagent**

Prompt a fresh subagent: "Review `skills/koni-docs/references/plugin-pattern.md` and `skills/koni-nextjs/SKILL.md` against the spec `docs/superpowers/specs/2026-06-28-koni-plugin-pattern-nextjs-design.md`. Confirm: (1) plugin-pattern.md has all six sections (what/where/discovery/composition/authoring/reference) and is coherent; (2) koni-nextjs follows the pattern it documents — self-contained, `NX-`-namespaced rules table (NX-1..NX-4 as specified), a 'Composes with koni-docs' section, valid frontmatter (name + description); (3) CRITICAL — koni-nextjs does NOT duplicate or redefine any of koni-docs' 12 core rules (it may reference them); (4) the discovery mechanism (`koni-docs-plugins: [nextjs]`) and the NX-1 harness-gate reference (`gates.conf` passthrough `next build`) are accurate against the real koni-docs SKILL.md and koni-harness gate-catalog; (5) koni-docs SKILL.md §2/§6 pointer edits are additive (no core-rule text changed). Read the actual files. Report issues by severity; end APPROVED or CHANGES_REQUESTED."

- [ ] **Step 3: Fix any findings, commit**

```bash
git add -A skills/koni-nextjs skills/koni-docs
git commit -m "fix(koni-nextjs): address plugin-pattern review findings"
```

---

### Task 5: koni-docs backfill + ship

**Files:**
- Modify: `VERSION`, `docs/CHANGELOG.md`, `docs/PRD.md`, `docs/sprints/epics/EPIC-3.md`, `docs/sprints/sprint-2026-W26.md`
- Modify: `docs/sprints/stories/US-3.1-plugin-skill-pattern.md` (flip to done — it already exists)

- [ ] **Step 1: Bump VERSION**

```bash
echo "0.15.0" > VERSION
```

- [ ] **Step 2: Update the existing story US-3.1** (`docs/sprints/stories/US-3.1-plugin-skill-pattern.md`): set `status: done`, `sprint: sprint-2026-W26`, `version_shipped: "0.15.0"`, `assignee: jindo9986`, `commit: pending`, points (3), `prd_ref: [FR-9]`; fill AC = pattern doc shipped + koni-nextjs reference shipped + no core-rule duplication + discovery/compose accurate; mark all `[x]`. Keep its existing intent; just complete it.

- [ ] **Step 3: Mark FR-9 shipped in PRD** (FR table row → `✅ shipped (v0.15.0)`), flip the EPIC-3 index row for US-3.1 to done/v0.15.0, update EPIC-3.md (FR-9 coverage row → shipped, US-3.1 story row → done, pillar 1 → delivered, AC checkboxes), add US-3.1 to sprint-2026-W26 scope (now 7 stories / 24 pts), bump PRD version/date/editHistory to 0.15.0. Note EPIC-3 is now fully delivered (all FRs except none remain). Use koni-docs shapes.

- [ ] **Step 4: Add CHANGELOG `## [0.15.0]`** describing the plugin pattern + koni-nextjs, noting FR-9 closed and the EPIC-3 plugin pillar delivered.

- [ ] **Step 5: Run koni-docs sync + status + validate**

```bash
npx koni-docs sync --docs-path docs/ --story US-3.1
npx koni-docs status --docs-path docs/
npx koni-docs validate --docs-path docs/
```
Expected: sync ok; status regenerates; validate green ("all references resolve").

- [ ] **Step 6: Commit + backfill SHA**

```bash
git add VERSION docs/ skills/koni-docs skills/koni-nextjs .claude/skills/koni-nextjs .agents/skills/koni-nextjs
git commit -m "feat(skills/koni-nextjs): ship plugin-skill pattern + koni-nextjs reference (US-3.1, v0.15.0)"
npx koni-docs backfill-commits --docs-path docs/
# set US-3.1 commit: field to the ship SHA, then:
git add docs/ && git commit -m "docs: backfill US-3.1 commit SHA for v0.15.0"
```

---

## Self-Review

**1. Spec coverage** (spec § → task):
- §4 pattern doc (6 sections) → Task 1. ✓
- §5 koni-nextjs (frontmatter + NX-1..4 + composes + when-to-use) → Task 2. ✓
- §3 layout + wiring + additive koni-docs pointers → Tasks 2–3. ✓
- §6 verification (no-duplication grep + author-blind review + accuracy) → Task 4. ✓
- §2 invariants (compose-not-duplicate, AD-1, namespacing, additive) → enforced in Tasks 1–4. ✓
- §7 open questions → resolved in "Design decisions locked". ✓

**2. Placeholder scan:** Doc tasks specify exact required sections + the NX-1..4 rule content + the CLAUDE.md/`gates.conf` snippets; Task 5 follows the prior US-3.x ship pattern (US-3.1 already exists, so it is *updated* not created). No "TBD". ✓

**3. Consistency:** the namespace `NX-`, the discovery key `koni-docs-plugins: [nextjs]`, the gate row `nextjs-build … passthrough … next build`, and the `skills/koni-nextjs/` path are identical across Tasks 1–5 and match the spec. Wiring mirrors the existing skills' symlink convention. ✓

**Note for executor:** Tasks 1–3 are doc-writing (no TDD — there is no executable code); Task 4 is the verification gate (grep + review subagent); Task 5 is the koni-docs ship (US-3.1 already exists → update it to done; follow US-3.7 as the worked backfill example). This closes FR-9 and EPIC-3's plugin pillar.
