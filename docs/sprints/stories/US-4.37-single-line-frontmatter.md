---
id: US-4.37
title: "Single-line frontmatter — stop js-yaml folding long scalars in serializeDoc"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2026-W30
due:
version_shipped: "0.67.0"
prd_ref: []
arch_ref: [AD-12]
depends_on: [US-4.24]
assignee: bluezdot
commit: b7135fe
created: 2026-07-22
updated: 2026-07-22
external_deps:
---

## Goal

Stop `koni-docs` re-writing long frontmatter values as YAML folded block scalars.

An epic title over 80 characters comes back from any CLI write looking like this:

```yaml
title: >-
  Admin System-wide Statistics — Population-filtered Performance Aggregate +
  Platform Composition
```

Nobody authors that. External tools read epic/story/sprint state straight from the
frontmatter and several use a **line-based reader rather than a YAML parser**, so the fold
renders literally as `>-` — the title disappears from every downstream view.

## Background

**Lessons applied:** §36 (a guard that advertises a class but implements
an instance is a false green) — the frame for reading `reapplyQuoting`'s bail-out; §39
was written by this story as its sibling. Marker line backfilled 2026-08-02; the
citations themselves were already in Dev notes and Implementation notes.

### Who folds them

`serializeDoc()` called `matter.stringify(newBody, doc.frontmatter)` with **no options**.
gray-matter forwards its options object straight to `js-yaml.safeDump`, whose default
`lineWidth` is **80** — so every plain scalar longer than that is re-emitted as a folded
block. A no-op `readDoc()` → `writeDoc()` round-trip is enough to trigger it, which is why
titles *created* correctly flip later, inside unrelated commits that happened to run
`sync`. Reproduced against the resolved `gray-matter@4.0.3`:

```
default        → title: >-\n  Admin System-wide Statistics — …\n  Platform Composition
lineWidth: -1  → title: Admin System-wide Statistics — Population-filtered Performance Aggregate + Platform Composition
```

`writeDoc` is the single choke point — `cli/sync.ts` (3 sites), `cli/backfill-fields.ts`
and `cli/inject-tasks.ts` all route through it — so one option covers every writer.

### Why the existing guard missed it

[US-4.24](US-4.24-yaml-quoting.md) added `detectQuotedKeys` / `reapplyQuoting` (AD-12) to
stop gray-matter churning quote styles. It records that `title` was `"`-quoted, then on
the way out re-applies the quote — except it returns early on block scalars:

```ts
if (/^[>|][-+]?$/.test(value)) return line;   // ← sees `>-`, gives up
```

The bail-out is *correct* (quoting `>-` would orphan the continuation lines) but it means
**the field the serializer promised to preserve is the exact field it reformats**. A guard
that advertises a class and silently exits on its hardest member is a false green — see
[LESSONS §39](../../LESSONS.md), the sibling of §36.

### Scope of the damage

Found downstream first: `Koniverse/Senti-Quant` had 4 epic titles + 14 sprint goals
folded, restored its own corpus, and specified this fix upstream
([their US-28.18](https://github.com/Koniverse/Senti-Quant/pull/377), whose AC-7 stays open
until this ships). **This repo was affected too** — 7 sprint files carried `goal: >-`.

Long *story* titles were never affected despite running past 250 characters: they contain
a `:` or a backtick, so js-yaml must quote them, and a quoted scalar is emitted on one line
at any width. Only quote-free long values fold.

## Acceptance criteria

- [x] **AC-1** — `serializeDoc` serializes with `lineWidth: -1`; a >80-char frontmatter
  value is emitted whole, on one physical line, with no `>`/`|` indicator.
- [x] **AC-2** — quote preservation is intact: a long value containing a `:` still
  round-trips quoted *and* single-line; the US-4.24 tests still pass on their original
  intent.
- [x] **AC-3** — a value carrying real newlines is still emitted as a `|` literal block and
  re-parses with newlines intact — proving the `reapplyQuoting` bail-out is load-bearing,
  not dead code.
- [x] **AC-4** — 0 folded frontmatter scalars anywhere under `docs/`; every unfolded file
  proven meaning-preserving by a gray-matter round-trip assertion (identical `data`,
  byte-identical `content`), not by eye.
- [x] **AC-5** — the fix is proven to **speak and fail**: a full `sync` write pass over a
  copy of the corpus yields **0** folds with the fix and **6** without it.
- [x] **AC-6** — `koni-docs validate` exits 0 and `STATUS.md` regenerates against the
  unfolded corpus.
- [x] **AC-7** — AD-12 describes what the serializer now does; CONTEXT D41 + LESSONS §39
  recorded.
- [x] **AC-8** — `@koniverse/koni-docs@0.12.0` published to npm. Verified 2026-07-22:
  `npm view @koniverse/koni-docs version` → `0.12.0`, and the published version list now
  reads `… 0.8.0, 0.8.1, 0.12.0` — closing the registry gap described below in one jump.
- [x] **AC-9** — `Koniverse/Senti-Quant` consuming the fix and closing its own US-28.18
  AC-7. Closed on the owner's confirmation, 2026-07-22.

  Recorded for whoever picks this up: the upgrade there is **not** automatic. Senti-Quant
  pinned `"@koniverse/koni-docs": "^0.8.1"`, and a caret on a `0.x` version is locked by
  semver to that minor — `^0.8.1` does not range over `0.12.0`, so `npm update` is a no-op
  and it takes an explicit `npm i @koniverse/koni-docs@^0.12.0`. The same trap applies to
  every other consumer still on a `^0.8.x` pin.

## Tasks

- [x] **TASK-4.37.1** — verify `lineWidth: -1` against the resolved `gray-matter@4.0.3`:
  unfolds, still quotes on content, still emits `|` for real newlines (AC: 1, 2, 3)
- [x] **TASK-4.37.2** — pass `SINGLE_LINE_YAML` in `serializeDoc`; rewrite the
  `reapplyQuoting` bail-out comment to say what is now true (AC: 1, 3)
- [x] **TASK-4.37.3** — 3 new tests + 2 rewritten in `__tests__/lib/doc.test.ts` (AC: 1, 2, 3)
- [x] **TASK-4.37.4** — unfold the 7 sprint `goal:` values with a round-trip-asserting
  normalizer (AC: 4)
- [x] **TASK-4.37.5** — prove speak-and-fail by running `sync` over a throwaway corpus copy
  with and without the fix (AC: 5)
- [x] **TASK-4.37.6** — AD-12 + release-procedure correction, CONTEXT D41, LESSONS §39,
  CHANGELOG, VERSION + CLI bump (AC: 6, 7)
- [x] **TASK-4.37.7** — publish `@koniverse/koni-docs@0.12.0`; verify by `npm view` rather
  than by having run the command (AC: 8)
- [x] **TASK-4.37.8** — downstream: bump `Koniverse/Senti-Quant` to `^0.12.0` explicitly
  (a caret on `^0.8.1` will not reach it), re-run their AC-1 grep, close their AC-7 (AC: 9)

## Dev notes

### Architecture constraints

Amends **AD-12**, which recorded the serializer as one that *survives* js-yaml folded
output. That was an accurate description of a guard, and the wrong goal: surviving a fold
still writes the fold to disk. The serializer now **prevents** it at the source, and the
quote-preserving pass simply stops meeting width-folded blocks.

`lineWidth: -1` is asserted through a narrow named type
(`MatterStringifyOptions`) rather than `any` on the call — gray-matter's own JSDoc
documents the js-yaml pass-through ("Options to pass to gray-matter and [js-yaml]") but its
`GrayMatterOption` interface types only gray-matter's own keys. Asserting one small object
keeps a typo in a gray-matter key an error.

### Cross-story dependencies

Depends on [US-4.24](US-4.24-yaml-quoting.md), whose `reapplyQuoting` this story
re-scopes rather than replaces. Downstream, `Koniverse/Senti-Quant` US-28.18 AC-7 closes
once `@koniverse/koni-docs@0.12.0` is consumed there.

### What we explicitly did NOT do

- **Did not collapse literal `|` blocks.** They carry real newlines; the downstream spec
  floated "make it collapse the block instead of returning early", which would be a
  data-loss bug. The bail-out stays and is now covered by a test that locks the reason.
- **Did not add a `koni-docs validate` check for folded scalars.** With the fold gone at
  the source, the check would only catch a hand-authored one. It also needs `corpus.ts` to
  retain `raw`, which it deliberately does not. Deferred until a real instance appears.
- **Did not shorten or rename any title.** That treats the symptom and silently constrains
  how epics may be named.
- **Did not fix `npm run typecheck`.** It fails on a clean tree with TS2209 and, once
  unblocked, exposes the viewer self-importing `@koniverse/koni-docs/lib` through the
  export map. Pre-existing, unrelated, and not a one-liner — filed as
  [US-4.38](US-4.38-typecheck-script-broken.md) rather than folded into this story or left
  unmentioned.

### References

- [Source: US-4.24](US-4.24-yaml-quoting.md) — the guard this story re-scopes
- [Source: LESSONS §36](../../LESSONS.md) — a guard that advertises a class but implements
  an instance is a false green; §39 records this sibling
- Downstream report: `Koniverse/Senti-Quant` PR #377 / US-28.18

## Verification commands

| AC | Command | Result |
|---|---|---|
| AC-1..3 | `cd packages/koni-docs && node --import tsx --test __tests__/lib/doc.test.ts` | 13/13 pass |
| AC-4 | frontmatter block-scalar detector over `git ls-files 'docs/**/*.md'` | 0 hits |
| AC-5 | `sync --docs-path <copy>` then the detector — with the fix, and with `doc.ts` stashed | **0** with · **6** without |
| AC-6 | `node --import tsx src/cli/index.ts validate --docs-path ../../docs` | `✓ all references resolve` |

The AC-5 pair is the one that matters: `sync` is the exact operation that caused the
defect, so a green there is proof the class is closed rather than the symptom cleaned.

## Changelog entry

### Fixed
- **`koni-docs` no longer folds long frontmatter values.** `serializeDoc` serialized through
  gray-matter → `js-yaml.safeDump` with default options, and js-yaml's default `lineWidth`
  of 80 re-emitted any longer plain scalar as a folded block (`title: >-`) — which
  line-based external readers render literally as `>-`. A no-op read→write round-trip was
  enough, so `sync` silently folded titles nobody had asked it to touch. Now serialized
  with `lineWidth: -1`. Quoting is unchanged (js-yaml quotes on content, not width) and a
  value with real newlines is still a `|` literal block. Reported downstream by
  `Koniverse/Senti-Quant` (US-28.18).
- **This repo's own 7 folded sprint goals** (`W19/21/22/26/27/29/30`) unfolded, each proven
  meaning-preserving by a gray-matter round-trip assertion.

### Changed
- **AD-12 amended** — the serializer *prevents* the fold instead of *surviving* it. The
  `reapplyQuoting` block-scalar bail-out stays, now scoped to genuine multi-line values,
  with a test locking why it must not be "fixed" into collapsing them.
- **LESSONS §39** — a guard that bails out on the case it was written for is a false green.

> **Consumers**: the first `sync` after upgrading produces a **one-time, formatting-only
> reflow** — every long value unfolds at once. Review it as formatting.

## Implementation notes

Proven the way this repo requires — the change was made to **speak** (a full `sync` over a
corpus copy with `doc.ts` stashed re-folds 6 sprint goals immediately) and to **hold** (the
same `sync` with the fix yields 0), with the round-trip assertion making the corpus edit a
formatting change and nothing else.

Two pre-existing failures were found and left alone, both confirmed identical on a clean
tree: the two `preview` tests time out waiting on the Astro dev server (145/147 pass), and
`npm run typecheck` errors before it starts ([US-4.38](US-4.38-typecheck-script-broken.md)).
`packages/koni-docs/package-lock.json` was 5 minors stale (`0.6.1` against a `0.11.10`
manifest) and was repaired by `npm install`.

### The registry gap — found here, closed by the publish

While verifying, `npm view @koniverse/koni-docs version` returned **`0.8.1`**, while
`package.json` read `0.11.10` before this story bumped it. **The package had been
version-bumped ~12 times without being published.** That is why `Koniverse/Senti-Quant`
reported the defect against 0.8.1: not a stale pin on their side, but the newest release
that existed. Every consumer was running a serializer four minors behind the source.

Closed by the AC-8 publish — the version list now reads `… 0.8.0, 0.8.1, 0.12.0`, jumping
the whole gap at once. The consequence is that **a consumer's first upgrade carries four
minors of unrelated CLI change alongside this fix**, so the one-time reflow warning in the
CHANGELOG will not be the only thing they see.

**And the upgrade is not automatic.** A `^0.8.1` dependency — which is what Senti-Quant
pinned — does not range over `0.12.0`: semver locks a caret on a `0.x` version to that
minor, so `npm update` is a no-op and the bump has to be explicit. That is why AC-9 is a
separate criterion rather than a formality that follows from AC-8, and it is the first
thing to check on any consumer that reports still seeing folded titles.

The underlying process question — should a version bump imply a publish? — is a
release-process decision this story has no standing to make, and it is *not* answered by
having published once. The [release procedure in ARCHITECTURE](../../ARCHITECTURE.md) was
corrected only on the point this story could verify: that `VERSION` and the package version
are independent tracks. The rest is recorded here and in CHANGELOG v0.67.0 for whoever
takes it.

## Files modified

- `packages/koni-docs/src/lib/doc.ts` — `SINGLE_LINE_YAML` + honest bail-out comment
- `packages/koni-docs/__tests__/lib/doc.test.ts` — 3 new tests, 2 rewritten
- `docs/sprints/sprint-2026-W{19,21,22,26,27,29,30}.md` — `goal:` unfolded
- `docs/ARCHITECTURE.md` · `docs/CONTEXT.md` · `docs/LESSONS.md` · `docs/CHANGELOG.md`
- `VERSION` · `packages/koni-docs/package.json` · `packages/koni-docs/package-lock.json`

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [US-4.24](US-4.24-yaml-quoting.md) — the quote-preservation guard this re-scopes
- [US-4.38](US-4.38-typecheck-script-broken.md) — the broken typecheck found on the way
- [CONTEXT D41](../../CONTEXT.md) · [LESSONS §39](../../LESSONS.md)
- [CHANGELOG v0.67.0](../../CHANGELOG.md)
