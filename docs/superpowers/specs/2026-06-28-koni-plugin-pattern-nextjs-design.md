# US-3.1 — Plugin-skill pattern + `koni-nextjs` reference plugin — Design Spec

**Date**: 2026-06-28
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: a new reference under `skills/koni-docs/references/` + a new skill `skills/koni-nextjs/` (both additive)
**Builds on**: koni-docs SKILL.md §2/§6 (which already reference `koni-docs-plugins`) · [EPIC-3](../../sprints/epics/EPIC-3.md) cross-cutting invariants · [CONTEXT D12/D13](../../CONTEXT.md) (the compose-and-delegate boundary)

> Closes **FR-9** and the last open EPIC-3 pillar (plugin-skill pattern). The
> koni-harness roadmap is already complete; this is the catalog's
> plugin-extension story.

---

## 1. Purpose

koni-docs already *mentions* plugins — "technology-specific rules (Supabase,
Next.js) live in plugin skills; when a project declares `koni-docs-plugins:
[...]` in CLAUDE.md, load those plugin skills for the additional rules" — but the
pattern was never defined or demonstrated. US-3.1 makes it concrete in two parts:

1. **The pattern** (`skills/koni-docs/references/plugin-pattern.md`): how a plugin
   skill is structured, discovered, and composed with koni-docs without
   duplicating it — plus a checklist for authoring a new one.
2. **A reference plugin** (`skills/koni-nextjs/`): a real, useful Next.js rule set
   that extends koni-docs, proving the pattern.

This turns "we run a catalog" from aspiration into a demonstrated, repeatable
extension mechanism.

### Non-goals

- **Not a second plugin** — FR-9 needs *one* reference; `koni-supabase` is
  explicitly deferred (a future story can follow the now-documented pattern).
- **No new scripts / executables** — both deliverables are prose (rules +
  pattern doc). A plugin *may* add scripts later, but the reference is rule-only
  (YAGNI).
- **No changes to the 12 koni-docs core rules** — plugins extend, never
  redefine; koni-docs SKILL.md gets only an additive pointer.

---

## 2. First principles (inherited, unchanged)

1. **Compose, don't duplicate** — a plugin extends/specializes koni-docs; it
   MUST NOT restate the 12 core rules (EPIC-3 cross-cutting invariant).
2. **Self-contained directory (AD-1)** — a plugin ships its own SKILL.md (+
   references) under `skills/koni-<tech>/`; no cross-skill imports.
3. **Namespaced rules** — plugin rules use a tech namespace (`NX-`, `SB-`) so
   they never collide with koni-docs `RULE-n`.
4. **Additive-only** — only new files; koni-docs gains one reference + a pointer,
   no rewrite of existing rule content.
5. **Reuse, don't rebuild** — a plugin may *reference* the koni-harness gate
   (e.g. add a `gates.conf` row) rather than build its own gate.

---

## 3. Deliverable shape & layout (additive)

```
skills/koni-docs/
├── SKILL.md                          # MODIFY: point §2/§6 plugin mentions at the new reference
└── references/
    └── plugin-pattern.md             # NEW — the plugin-skill pattern + authoring checklist

skills/koni-nextjs/                    # NEW skill (reference plugin)
└── SKILL.md                          # Next.js rules (NX-*) + composition note

.claude/skills/koni-nextjs            # NEW symlink (mirror koni-docs/koni-setup/koni-harness)
.agents/skills/koni-nextjs            # NEW symlink
```

The koni-harness skill, gate, and all other skills are untouched.

---

## 4. The pattern doc (`skills/koni-docs/references/plugin-pattern.md`)

Defines, for an agent or author:

1. **What a plugin skill is** — a tech-specific rule set that *extends* koni-docs
   for one stack (Supabase, Next.js, …).
2. **Where it lives** — `skills/koni-<tech>/SKILL.md` (+ optional `references/`),
   self-contained (AD-1).
3. **Discovery** — a project opts in via `koni-docs-plugins: [<tech>]` in its
   CLAUDE.md `koni-docs:` block; the agent then loads that plugin's SKILL.md
   alongside koni-docs for the extra rules.
4. **Composition contract** — the plugin extends/specializes; it MUST NOT
   duplicate or override the 12 core rules. Plugin rules are namespaced
   (`NX-1`, `SB-1`, …). A plugin may reference the koni-harness gate (add a
   `gates.conf` row / a check) but does not build its own gate.
5. **Authoring checklist** — name (`koni-<tech>`), SKILL.md frontmatter
   (`name`/pushy `description`), a namespaced rule table (rule id · what it
   asserts · why · how to check), a "Composes with koni-docs" section, when-to-use
   triggers, and wiring (`.claude`/`.agents` symlinks + the
   `koni-docs-plugins: [<tech>]` declaration).
6. **Example pointer** — `koni-nextjs` as the worked reference.

koni-docs SKILL.md §2 ("Technology-specific rules … live in plugin skills") and
§6 ("Plugin skills: …") gain a one-line pointer to this reference. No core-rule
text changes.

---

## 5. The reference plugin (`skills/koni-nextjs/SKILL.md`)

A self-contained skill. Frontmatter `name: koni-nextjs` + a pushy, boundary-aware
`description` (triggers on Next.js work in a Koni repo: App Router, `next build`,
env/`NEXT_PUBLIC_`, server/client components). Body:

1. **What this owns vs. koni-docs** — it adds Next.js rules; it does NOT restate
   koni-docs core rules; load both when a project declares
   `koni-docs-plugins: [nextjs]`.
2. **Rules (namespace `NX-`)** — a table, each row with what it asserts / why /
   how to check:
   - **NX-1** — ship gate: `next build` must pass, not just `tsc --noEmit`
     (`tsc` misses Next-specific build errors — the documented koni-docs LESSON).
     Wire it as a koni-harness `gates.conf` `passthrough` row (`next build`) at
     `pre-push`.
   - **NX-2** — secrets: only `NEXT_PUBLIC_*` env vars reach the client; never put
     a secret in a client component or a `NEXT_PUBLIC_` var (composes with the
     gate's `credential-scan` + RULE-11).
   - **NX-3** — App Router: server components by default; add `"use client"` only
     when interactivity/browser APIs require it.
   - **NX-4** — env sync: every new env var lands in `.env.example` +
     `next.config` as needed, same commit (specializes RULE-11 for Next).
3. **Composes with koni-docs** — discovery via `koni-docs-plugins: [nextjs]`;
   extends, never duplicates; references the harness gate rather than rebuilding.
4. **When to use** — triggers + a one-line install/wire note.

Keep SKILL.md tight and self-contained; a `references/` is optional and omitted
for the reference (rules fit in the body).

---

## 6. Verification

This story is **docs-only** (no scripts), so there is no POSIX test suite. Verify
via an author-blind review subagent that confirms:

- `plugin-pattern.md` is coherent and complete (location, discovery,
  composition, namespacing, authoring checklist, example).
- `koni-nextjs/SKILL.md` follows the pattern it documents: self-contained,
  `NX-`-namespaced rules, a "Composes with koni-docs" section, and — critically —
  **does not duplicate or restate any of the 12 koni-docs core rules** (it may
  reference them).
- The discovery mechanism (`koni-docs-plugins: [nextjs]`) and the harness-gate
  reference (NX-1 → `gates.conf` `passthrough`) are accurate against the real
  koni-docs SKILL.md and koni-harness gate.
- The koni-docs SKILL.md pointer edits are additive (no core-rule text changed).

Plus a self-check: `grep` koni-nextjs/SKILL.md for `RULE-1`..`RULE-17` to confirm
it references (not redefines) any core rule it mentions.

---

## 7. Open questions (resolve during planning)

- **NX-1 LESSON reference**: cite the koni-docs LESSONS "`next build` vs `tsc`"
  entry precisely (it appears as the filled example in
  `templates/lessons.md`); confirm the exact wording/location in the plan.
- **koni-docs SKILL.md pointer placement**: §2 (rules summary, "Technology-
  specific rules") and §6 (reference table, "Plugin skills") — add the pointer in
  both, as one line each, without renumbering rules.

---

## 8. After US-3.1

EPIC-3 is then fully delivered for its shipped pillars: catalog has koni-docs +
koni-setup + koni-harness + the plugin pattern with one reference (koni-nextjs).
A future story can add `koni-supabase` by following `plugin-pattern.md` — now a
documented, repeatable path.
