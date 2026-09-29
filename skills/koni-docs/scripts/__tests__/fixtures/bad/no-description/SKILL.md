---
name: missing-description
---
# Missing description

Frontmatter with `name:` and no `description:`. A skill in this state loads with
no description at all, so it never triggers — the silent failure LESSONS §19
nearly shipped when a TOC generator wrote itself into the frontmatter block.
