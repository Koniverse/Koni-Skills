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
HEADING = re.compile(r'^#{2,6} (.+)$', re.M)
ANCHOR_LINK = re.compile(r'\]\(#([^)]+)\)')
FILE_LINK = re.compile(r'\]\(([^)#\s]+\.md)(?:#([^)]+))?\)')
# `file.md` §Section — stop before any markdown link syntax so we don't swallow it.
SECTION_POINTER = re.compile(r'`([\w./-]+\.md)`\s*§([^\n,.;()\[\]|`+]+)')


def is_external(target: str) -> bool:
    """An http(s) URL is not ours to resolve."""
    return target.startswith(('http://', 'https://'))


def is_placeholder(target: str) -> bool:
    """`US-X.Y-<slug>.md` is a shape, not a path — it resolves in the generated
    document, not in the template that describes it."""
    return '<' in target or 'X.Y' in target or 'EPIC-N' in target


def strip_fences(text: str) -> str:
    """Blank out fenced blocks. A `## ` inside one is sample content, not a heading."""
    return FENCE.sub('', text)


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


def in_fence(text: str, index: int) -> bool:
    """A link inside a fence belongs to the *generated* document, not this one."""
    return text[:index].count('```') % 2 == 1


def check(root: Path) -> list[str]:
    problems: list[str] = []
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
            if in_fence(text, m.start()) or is_external(m.group(1)) or is_placeholder(m.group(1)):
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
            if in_fence(text, m.start()):
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
            wanted = github_slug(m.group(2).strip())
            headings = {github_slug(h.strip()) for h in HEADING.findall(strip_fences(read(target)))}
            # A §pointer matches if any heading starts with the named text —
            # "§Scripts reference" may be cited as "§Scripts".
            if not any(h == wanted or h.startswith(wanted) for h in headings):
                problems.append(f'{md}: dead §-pointer -> {m.group(1)} §{m.group(2).strip()}')

    return problems


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else 'skills/koni-docs')
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
