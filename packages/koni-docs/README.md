# @koniverse/koni-docs

CLI tool + reusable TypeScript library for the `koni-docs` documentation framework.

## Install

```bash
npm install --save-dev @koniverse/koni-docs
```

## CLI usage

```bash
npx koni-docs status                          # regenerate sprints/STATUS.md
npx koni-docs sync --story US-X.Y             # propagate status to 5 doc layers
npx koni-docs inject-tasks --story US-X.Y     # regen ## Tasks from AC checkboxes
npx koni-docs backfill-fields                 # add missing frontmatter keys
npx koni-docs backfill-commits                # fill pending commit SHAs from git
```

All subcommands accept `--docs-path <path>`, `--dry-run`, `--json`, `--verbose`.

## Library usage

```ts
import { loadCorpus, getStories } from '@koniverse/koni-docs/lib';
import { findSection, updateCell } from '@koniverse/koni-docs/lib/markdown';
import { storySchema, validateStory } from '@koniverse/koni-docs/lib/schemas';
```

## Engines

Node.js >= 20.0.0

## License

MIT
