#!/usr/bin/env python3
"""Assert every cross-reference in a skill points at something that exists.

Three defect classes, all found the hard way (LESSONS §18, §19), all invisible
to a human re-reading their own edit:

1. **Dead file links** — a doc routes to `references/migration-from-bmad.md`
   that was never written, or a moved file's link was not re-based.
2. **Dead anchors** — `](#some-heading)` where no such heading exists. The trap:
   `## ` lines *inside* a fenced code block are template skeletons, not headings,
   and GitHub emits no anchor for them. A checker that forgets this certifies
   150 dead links as green.
3. **Dead section pointers** — `See: templates.md §Story file` after
   `templates.md` became a thin index with no such section.

Run from the repo root:

    python3 skills/koni-docs/scripts/check-references.py skills/koni-docs

Exits non-zero if anything dangles. Silence means every pointer resolves.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

FENCE = re.compile(r'^(```|````).*?^\1', re.S | re.M)
HEADING = re.compile(r'^#{1,6} (.+)$', re.M)   # H1 too — `](#title)` is a legal link
ANCHOR_LINK = re.compile(r'\]\(#([^)]+)\)')
# Any relative target, not just .md — a dead `](scripts/ghost.py)` must fail too.
FILE_LINK = re.compile(r'\]\(([^)#\s]+)(?:#([^)]+))?\)')
# `file.md` §Section — and the LINKED form [`file.md`](path) §Section, which an
# earlier version of this script could not see at all. It certified 9 such pointers
# green, one of which was dead, on a BLOCKER rule's See line. The bug this script
# exists to catch, in the script itself.
SECTION_POINTER = re.compile(
    r'\[?`([\w./-]+\.md)`(?:\]\([^)]*\))?,?\s*§([^\n,.;()\[\]|`+]+)'
)

# A script the skill names as tooling must exist. `agile-sync-up.mjs` was cited as
# the enforcement mechanism of a BLOCKER rule for months; it never existed.
SCRIPT_NAME = re.compile(r'`([\w./-]+\.(?:mjs|py|sh))`')


def is_external(target: str) -> bool:
    """An http(s) URL is not ours to resolve."""
    return target.startswith(('http://', 'https://'))


def is_placeholder(target: str) -> bool:
    """`US-X.Y-<slug>.md` is a shape, not a path — it resolves in the generated
    document, not in the template that describes it. `checks/foo.sh` is an
    illustration of a file the reader would author, not a claim that it exists."""
    if '<' in target or 'X.Y' in target or 'X.Z' in target or 'EPIC-N' in target:
        return True
    stem = Path(target).stem.lower()
    return (stem in {'foo', 'bar', 'baz', 'example'}
            or stem.startswith(('your-', 'my-', 'example-', 'foo')))


def strip_fences(text: str) -> str:
    """Blank out fenced blocks. A `## ` inside one is sample content, not a heading."""
    out = list(text)
    for start, end in fence_spans(text):
        for i in range(start, end):
            if out[i] != '\n':
                out[i] = ' '
    return ''.join(out)


def github_slug(heading: str) -> str:
    """GitHub's algorithm: drop backticks and punctuation, then hyphenate EACH
    remaining space — it does not collapse runs. `a — b` → `a--b`, not `a-b`."""
    h = heading.replace('`', '')
    h = re.sub(r'[^\w\s-]', '', h.lower())
    return h.strip().replace(' ', '-')


def anchors_of(text: str) -> set[str]:
    """Every anchor GitHub will actually emit for this file."""
    seen: dict[str, int] = {}
    out: set[str] = set()
    for h in HEADING.findall(strip_fences(text)):
        slug = github_slug(h.strip())
        n = seen.get(slug, 0)
        seen[slug] = n + 1
        out.add(slug if n == 0 else f'{slug}-{n}')
    return out


def fence_spans(text: str) -> list[tuple[int, int]]:
    """Character ranges covered by a fenced block.

    A fence closes only on a marker of *at least* its own length, so a ``` block
    nested inside a ```` block does not close it. Counting ``` parity — which an
    earlier version of this script did — misreads exactly that case, which is the
    same defect class the script exists to catch. Fixed, not rationalized.
    """
    spans: list[tuple[int, int]] = []
    open_at: int | None = None
    open_len = 0
    for m in re.finditer(r'^(`{3,})', text, re.M):
        marker = len(m.group(1))
        if open_at is None:
            open_at, open_len = m.start(), marker
        elif marker >= open_len:
            spans.append((open_at, m.end()))
            open_at, open_len = None, 0
    if open_at is not None:
        spans.append((open_at, len(text)))
    return spans


def in_fence(text: str, index: int) -> bool:
    """A link inside a fence belongs to the *generated* document, not this one."""
    return any(start <= index < end for start, end in fence_spans(text))


def check(root: Path) -> list[str]:
    problems: list[str] = []
    repo = root.parent.parent  # repo root — a cited script may live in packages/ or scripts/
    cache: dict[Path, str] = {}

    def read(p: Path) -> str:
        if p not in cache:
            cache[p] = p.read_text(encoding='utf-8')
        return cache[p]

    for md in sorted(root.rglob('*.md')):
        text = read(md)
        own_anchors = anchors_of(text)

        for m in ANCHOR_LINK.finditer(text):
            if in_fence(text, m.start()):
                continue
            if m.group(1) not in own_anchors:
                problems.append(f'{md}: dead anchor #{m.group(1)}')

        for m in FILE_LINK.finditer(text):
            target_raw = m.group(1)
            # `](...)` / `](path)` in prose are illustrations, not links.
            if '/' not in target_raw and '.' not in target_raw:
                continue
            if set(target_raw) <= {'.'}:
                continue
            if in_fence(text, m.start()) or is_external(target_raw) or is_placeholder(target_raw):
                continue
            target = (md.parent / m.group(1)).resolve()
            if not target.exists():
                problems.append(f'{md}: dead link -> {m.group(1)}')
                continue
            if m.group(2) and target.suffix == '.md':
                if m.group(2) not in anchors_of(read(target)):
                    problems.append(f'{md}: dead anchor {m.group(1)}#{m.group(2)}')

        siblings = root.parent  # sibling skills — cross-skill pointers are legitimate
        for m in SECTION_POINTER.finditer(text):
            if in_fence(text, m.start()) or is_placeholder(m.group(1)):
                continue
            target = md.parent / m.group(1)
            if not target.exists():
                # The file may live elsewhere in this skill, or in a sibling skill
                # (koni-qc owns the test-doc references koni-docs points at).
                matches = list(root.rglob(Path(m.group(1)).name)) or \
                          list(siblings.rglob(Path(m.group(1)).name))
                if not matches:
                    problems.append(f'{md}: §-pointer to a file that does not exist -> {m.group(1)}')
                    continue
                target = matches[0]
            named = m.group(2).strip()
            if '–' in named or '—' in named:
                continue    # "§0–§1" is a range, not a heading
            # "§3 for the per-document contract" names section 3; the rest is prose.
            head = named.split()[0] if named.split() else named
            if re.fullmatch(r'\d+[a-z]?', head):
                named = head
            wanted = github_slug(named)
            headings = [h.strip() for h in HEADING.findall(strip_fences(read(target)))]
            slugs = [github_slug(h) for h in headings]
            if re.fullmatch(r'\d+[a-z]?', named):
                # "§3" means the section numbered 3 — match "## 3. Title", never "## 30.".
                # "§2b" is a sub-label a heading carries inline, e.g. "## Deadline (§2b …)".
                ok = any(re.match(rf'{re.escape(named)}\.\s', h) or f'§{named}' in h
                         for h in headings)
            else:
                # A §pointer may be shorter than the heading ("§Scripts" → "## Scripts
                # reference") or trail into prose ("§Alive for details" → "## Alive").
                # Accept either direction, on a word boundary.
                ok = any(sl == wanted
                         or sl.startswith(wanted + '-')
                         or wanted.startswith(sl + '-')
                         for sl in slugs)
            if not ok:
                problems.append(f'{md}: dead §-pointer -> {m.group(1)} §{named}')

        for m in SCRIPT_NAME.finditer(text):
            if in_fence(text, m.start()) or is_placeholder(m.group(1)):
                continue
            name = Path(m.group(1)).name
            if not (list(root.rglob(name)) or list(repo.rglob(name))):
                problems.append(f'{md}: names a script that does not exist -> {m.group(1)}')

    return problems


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else 'skills/koni-docs').resolve()
    if not root.is_dir():
        print(f'not a directory: {root}', file=sys.stderr)
        return 2
    problems = check(root)
    for p in problems:
        print(p)
    print(f'\n{len(problems)} dangling reference(s) in {root}')
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main())
