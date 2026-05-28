/**
 * Canonical PRD section labels — the unnumbered, label-based form adopted as
 * of koni-docs v0.7.2 (formalized into a cross-document frontmatter contract
 * in v0.7.3 — see references/frontmatter-spec.md). Older PRDs that still use numbered headings (e.g.
 * "## 8. Functional Requirements (FR)") continue to work via the
 * `legacyNumber` fallback on `findSectionByLabel`.
 */

export const PRD_FUNCTIONAL_REQUIREMENTS_LABEL = 'Functional Requirements';
export const PRD_FUNCTIONAL_REQUIREMENTS_LEGACY_NUMBER = 8;

export const PRD_EPICS_AND_STORIES_LABEL = 'Epics & User Stories';
export const PRD_EPICS_AND_STORIES_LEGACY_NUMBER = 11;
