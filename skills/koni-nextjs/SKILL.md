---
name: koni-nextjs
description: >
  Next.js-specific rules that extend koni-docs for a Koni Next.js repo (App
  Router, `next build`, env / `NEXT_PUBLIC_`, server vs client components). Use
  this whenever working in a Koni repo that declares `plugins: [nextjs]` in its
  `koni-docs:` block or is a Next.js app — alongside koni-docs, never replacing it.
---
# koni-nextjs — Next.js plugin for koni-docs

> Reference plugin built on the [plugin pattern](../koni-docs/references/plugin-pattern.md).
> It carries `NX-`-namespaced Next.js rules and rides on top of koni-docs; it
> does not restate the 13 core rules.

---

## What this owns vs. koni-docs

This skill owns the **Next.js-specific** rules: the `next build` ship gate,
the `NEXT_PUBLIC_` / secret boundary, App Router server-vs-client defaults,
and env-var landing for a Next app. It does **not** restate koni-docs' 12 core
rules (versioning, changelog, story/PRD wiring, commit hygiene, the universal
env-var propagation rule) — those still apply unchanged, and koni-docs remains
their single source of truth.

Load both skills when the project declares `plugins: [nextjs]` under its
CLAUDE.md `koni-docs:` block: the
core 13 from koni-docs plus the `NX-` rules below. For the ship gate, this
plugin **references the existing koni-harness gate** (it prescribes a
`gates.conf` row) rather than building a gate of its own.

---

## Rules

| Rule | Asserts | Why | How to check |
| ---- | ------- | --- | ------------ |
| **NX-1** | The ship gate runs `next build`, not just `tsc --noEmit`. | `tsc` validates types only — it passes on code that `next build` rejects (RSC/Client-boundary, route, and config errors that webpack's bundle topology surfaces). | A `pre-push` gate step runs `next build`. Add a koni-harness `gates.conf` row: `nextjs-build \| checks/passthrough.sh \| pre-push \| block \| next build`. Rationale is the koni-docs LESSONS "`next build` vs `tsc`" entry. |
| **NX-2** | Only `NEXT_PUBLIC_*` env vars reach the client; no secret lands in a client component or in a `NEXT_PUBLIC_` var. | Client bundles are public — anything `NEXT_PUBLIC_` or imported into a client component ships to the browser verbatim. | Composes with the koni-harness `credential-scan` check and `RULE-11`; grep changed client files and `NEXT_PUBLIC_` assignments for secret-shaped values. |
| **NX-3** | App Router: server components by default; add `"use client"` only when interactivity or browser APIs require it. | Over-clienting leaks work into the bundle and breaks server-only imports (e.g. `next/headers`). | Review the `"use client"` directives introduced in the diff — each must be justified by interactivity or a browser API. |
| **NX-4** | Every new env var lands in `.env.example` (and `next.config` if needed) in the same commit. | Specializes `RULE-11` for Next: a missing `.env.example` entry breaks the next clone's build. | New `process.env.X` ⇒ `X` is present in `.env.example` in the same commit. |

---

## Composes with koni-docs

- **Discovery.** A project opts in by declaring `plugins: [nextjs]` under its
  CLAUDE.md `koni-docs:` block; the agent
  then loads this skill alongside koni-docs:

  ```yaml
  koni-docs:
    plugins: [nextjs]
  ```
- **Extends, never duplicates.** The `NX-` rules add a Next.js layer on top of
  koni-docs' 13 core rules. Where an `NX-` rule builds on a core rule it
  *references* it (NX-2 composes with `RULE-11`; NX-4 specializes `RULE-11`) —
  it never copies core-rule text.
- **Gate.** NX-1 plugs into the existing koni-harness gate via a `gates.conf`
  `passthrough` row (`next build` at `pre-push`); this plugin declares the
  check, the harness owns the runner.
- Follows the [plugin pattern](../koni-docs/references/plugin-pattern.md).

---

## When to use

Use this skill for any Next.js work in a Koni repo — App Router changes, env /
`NEXT_PUBLIC_` handling, server-vs-client component decisions, or wiring the
ship gate — especially when the project declares `plugins: [nextjs]` in its
`koni-docs:` block.

**Wire note:** declare `plugins: [nextjs]` under the project's CLAUDE.md
`koni-docs:` block:

```yaml
koni-docs:
  plugins: [nextjs]
```

Then symlink the skill like the other Koni skills
(`.agents/skills/koni-nextjs` → `../../skills/koni-nextjs`, then
`.claude/skills/koni-nextjs` → `../../.agents/skills/koni-nextjs`).
