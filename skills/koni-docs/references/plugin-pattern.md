# Plugin-skill pattern


**Contents**: [Two axes of extension](#two-axes-of-extension) · [What a plugin skill is](#what-a-plugin-skill-is) · [Where it lives](#where-it-lives) · [Discovery](#discovery) · [Composition contract](#composition-contract) · [Authoring a new plugin](#authoring-a-new-plugin) · [Concern extensions](#concern-extensions) · [Reference](#reference)

How a skill extends koni-docs without forking or restating its rules. Read this
before authoring a `koni-<tech>` plugin or a concern extension, and when a
project sets `plugins:` or `concerns:` under its `koni-docs:` block and you need
to know what that loads.

---

## Two axes of extension

A repo needs extra rules for two unrelated reasons, and collapsing them into one
list is how a rule ends up in the wrong place.

| Axis | Answers | Keyed by | Namespaced | Example |
|---|---|---|---|---|
| **Stack plugin** | *what the repo is built with* | `plugins: [nextjs]` | `NX-`, `SB-` | `next build` is the ship gate; only `NEXT_PUBLIC_*` reaches the client |
| **Concern extension** | *what the repo must guarantee* | `concerns: [security]` | `SEC-`, `RES-` | a change crossing a trust boundary gets an adversarial security review |

The distinction is not cosmetic. A stack plugin is **implied by the code** — a
repo either has a `next.config` or it does not, and the rule set follows
mechanically. A concern is **imposed on the code** — nothing in a Next.js repo
tells you whether it moves money, and that fact decides whether a whole class of
review is owed. Keeping the two in one list means a repo that switches frameworks
silently drops its security posture.

Both axes obey the same composition contract below: namespaced rules, no
restating the 13 core rules, and the koni-harness gate is *declared* into, never
rebuilt.

---

## What a plugin skill is

A plugin skill is a tech-specific rule set that **extends** koni-docs for one
stack — Supabase, Next.js, and so on. It carries the rules that only apply to
that technology (a Next.js app's `next build` gate, Supabase's RLS
discipline) and leaves the universal concerns to koni-docs.

It **adds** rules; it never replaces the core set. The 13 core rules
(RULE-1 through RULE-18, with 3/4/8/9/12 retired) stay the single source of truth for versioning,
changelog, story/PRD wiring, env-var propagation, commit hygiene, and the
rest. A plugin layers stack-specific rules on top of that floor — it does not
re-open it.

---

## Where it lives

```
skills/koni-<tech>/
├── SKILL.md            # the plugin's rules + composition note
└── references/         # optional, only if the plugin needs depth
```

The plugin is **self-contained** (AD-1): its `SKILL.md` must stand on its own
with no cross-skill imports. It may *reference* a koni-docs `RULE-n` or the
koni-harness gate catalog by name, but it never reaches into another skill's
files to pull text in. A reader who opens only `skills/koni-<tech>/SKILL.md`
gets every plugin rule in full.

---

## Discovery

A project opts in by declaring the plugin in its CLAUDE.md `koni-docs:` block:

```yaml
koni-docs:
  plugins: [nextjs]      # loads skills/koni-nextjs alongside koni-docs
```

When the agent reads a project's CLAUDE.md and sees a non-empty
`plugins:` list, it loads each
named plugin's `SKILL.md` **alongside** koni-docs — not instead of it. Both
rule sets are then in force for that project: the core 13 plus the plugin's
namespaced rules.

---

## Composition contract

A plugin **extends and specializes**; it must never duplicate or override the
13 core rules.

- **Namespacing.** Plugin rules use their own prefix — `NX-` for Next.js,
  `SB-` for Supabase — so they never collide with `RULE-n`. A plugin rule may
  *reference* a core rule it builds on (e.g. "specializes `RULE-11`"), but it
  copies no core-rule text. If you find yourself restating what `RULE-n`
  says, stop: reference it instead.
- **No re-opening the core.** A plugin does not redefine versioning,
  changelog, or env-var rules. It points at the core rule and adds only the
  stack-specific delta.
- **The gate.** A plugin MAY plug into the existing koni-harness gate by
  prescribing a `gates.conf` row (e.g. a `passthrough` check that runs a
  stack-specific command). It does **not** build its own gate runner — the
  harness owns the gate; the plugin only declares the check.

---

## Authoring a new plugin

Checklist for a new `koni-<tech>` plugin:

1. **Name** — `koni-<tech>` (e.g. `koni-nextjs`, `koni-supabase`).
2. **Frontmatter** — `name: koni-<tech>` plus a pushy, boundary-aware
   `description` that says it extends koni-docs (never replaces it) and names
   the triggers that should load it.
3. **Namespaced rule table** — columns `Rule | Asserts | Why | How to check`,
   one row per rule, using the plugin's prefix (`NX-`, `SB-`, …). Each rule's
   "how to check" is a concrete, grep-able or review-able step.
4. **"Composes with koni-docs" section** — state the discovery key (`plugins: [<tech>]`
   under the repo's `koni-docs:` block in CLAUDE.md), affirm the plugin extends and
   never duplicates the 13 core rules, and name any koni-harness gate row it relies on.
5. **When-to-use triggers** — the stack signals that should activate the
   skill (e.g. "Next.js work in a Koni repo").
6. **Wiring** — mirror the existing skills' symlinks
   (`.agents/skills/koni-<tech>` → `../../skills/koni-<tech>`, then
   `.claude/skills/koni-<tech>` → `../../.agents/skills/koni-<tech>`), and have
   the consuming project declare `plugins: [<tech>]` under its CLAUDE.md
   `koni-docs:` block:

   ```yaml
   koni-docs:
     plugins: [<tech>]
   ```

---

## Concern extensions

A **concern** is a cross-cutting guarantee a repo owes regardless of its stack —
security, resiliency, accessibility, data retention. It carries the same shape as
a stack plugin (namespaced rules, a gate row, no restating the core) and differs
in three ways that matter.

### 1. Discovery, and the always-on case

```yaml
koni-docs:
  plugins:  [nextjs]      # what it is built with
  concerns: [security]    # what it must guarantee
```

`concerns:` is a sibling of `plugins:`, nested under `koni-docs:` in CLAUDE.md —
**not** a top-level key. (The one time this skill invented a top-level key that
did not exist, four files taught it and the plugin reference had to paper over
the gap for months — LESSONS §21. State the nesting every time you state the key.)

Two enrolment modes, and the second is the point of the axis:

- **Opt-in** — the repo lists the concern. Most concerns work this way; a repo
  with no payment flow owes nothing to a PCI concern.
- **Trigger-enforced** — the concern applies **whenever its trigger surface is
  present**, listed or not. A repo does not get to opt out of security review by
  omitting a line from CLAUDE.md; what it opts into is the *declaration* of where
  its boundaries are, which is a different thing.

Write the mode in the concern's own rule table. An unstated mode reads as opt-in,
which is the failure direction.

### 2. The trigger surface is declared, not guessed

A stack plugin knows it applies because `next.config.ts` exists. A concern has no
such tell, so it names its trigger surface explicitly — and that declaration is a
file in the repo, so a check can read it.

The `security` concern's surface is `.koni-harness/security-paths` (one glob per
line). Declaring it activates the harness's `security-review` gate, which is
**dormant until declared**. That is the whole mechanism: the repo says where its
trust boundaries are; the gate watches those paths; koni-qc supplies the method
when one changes.

### 3. Worked example — the `security` concern

This axis is being *named*, not invented: Koniverse has run exactly this shape for
several versions without a word for it, spread across three skills. Naming it is
what makes the next one cheap to add.

| Piece | Owner | What it contributes |
|---|---|---|
| Method — threat model, per-category case derivation, identify → refute → confidence-filter | **koni-qc** [`security-review.md`](../../koni-qc/references/security-review.md) | the intelligence; how to find a real finding and kill a plausible-but-wrong one |
| Trigger surface | the repo's `.koni-harness/security-paths` | which globs are trust boundaries |
| Gate row | **koni-harness** `security-review` (warn-level, `release-commit`) | reminds when a declared boundary changes; never blocks |
| Loop placement | **koni-harness** Review stage, and the applicability table in [`frame-protocol.md`](../../koni-harness/references/frame-protocol.md) §5 | *when* the concern fires: auth, authz/multi-tenancy, money movement, untrusted input, secrets/crypto, upload, deserialization, a new outbound call |

Note what no piece does: none of them restates a core rule, and none builds a
second gate runner. That is the contract holding across the axis change.

### 4. Authoring a new concern

1. **Name it for the guarantee**, not the technique — `security`, `resiliency`,
   `accessibility`. `property-based-testing` is a technique; the concern it serves
   is `correctness`.
2. **Pick a rule prefix** that cannot collide with `RULE-n` or a stack plugin's
   (`SEC-`, `RES-`, `A11Y-`).
3. **Name the trigger surface** — the file, glob list, or code shape that says
   "this concern applies here". If you cannot name one, the concern is not ready:
   an obligation nobody can locate is decoration (LESSONS §20).
4. **State the enrolment mode** — opt-in or trigger-enforced — in the rule table.
5. **Declare a gate row** if the concern has a mechanizable surface, per the
   composition contract above. Start at `warn`; graduate to `block` when the repo
   runs clean. A concern whose only enforcement is prose will drift.
6. **Point at the method, do not restate it.** The concern registers *when* and
   *where*; the owning skill keeps *how*. Two copies of a method is
   [LESSONS §21](../../../docs/LESSONS.md) waiting to happen, and the convenient
   copy is the one that gets obeyed.

---

## Reference

See [`../../koni-nextjs/SKILL.md`](../../koni-nextjs/SKILL.md) for the worked
example on the stack axis — the first reference plugin, carrying
`NX-`-namespaced Next.js rules that extend koni-docs. The worked example on the
concern axis is `security`, above.
