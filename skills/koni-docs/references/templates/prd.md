# PRD — Product Requirements Document Template

> **File location**: `docs/PRD.md`
>
> **Use when**: User asks to create/update PRD, product spec, or after
> BMad produces PRD artifacts that need standardization.
>
> **Source**: Maps from BMad `prd.md` + extracts §1 from `brief.md`. The
> PRD is the canonical product specification — it absorbs the Brief's
> executive summary and expands it with detailed requirements, personas,
> and the epic/story index.
>
> **Scope boundary**: This PRD contains business requirements only.
> Implementation details (schema, framework names, API endpoint paths,
> infrastructure mechanisms) belong in `ARCHITECTURE.md` and downstream
> task descriptions.

---

## 1. Full template skeleton (§1–§11)

````markdown
---
stepsCompleted: []
inputDocuments: []
classification:
  projectType: '{SaaS B2B / Mobile B2C / Web3 / Marketplace / API Platform / ...}'
  domain: '{primary business domain}'
  complexity: '{Low / Medium / High}'
  projectContext: '{Greenfield / Brownfield}'
workflowType: 'prd'
lastEdited: 'YYYY-MM-DD'
editHistory:
  - date: 'YYYY-MM-DD'
    changes: '{summary of what changed in this edit}'
---

# {Project Name} — Product Requirements Document

**Version:** X.Y.Z
**Date:** YYYY-MM-DD
**Status:** {Live at URL / In development / Regenerated vX.Y}
**Dual-Audience:** Human stakeholders + LLM implementation agents

> **Scope boundary:** This PRD contains business requirements only. Implementation
> details (schema, framework names, API endpoint paths, infrastructure mechanisms)
> belong in `architecture.md` and downstream task descriptions.

---

## 1. Executive Summary

### Vision

[1 paragraph: The long-term vision. What does this product become?
What's the north star?]

**Positioning Statement:** {Product Name} — {one-line value proposition}.

### What Makes It Special

[2-3 paragraphs: Key differentiators vs alternatives. What strategic
advantages does this product have? Why this approach over others?]

1. **{Advantage 1}** — {explanation}
2. **{Advantage 2}** — {explanation}
3. **{Advantage 3}** — {explanation}

### Core Philosophies

| # | Philosophy | Implication |
|---|-----------|-------------|
| 1 | {principle name} | {what this means in practice} |
| 2 | {principle name} | {what this means in practice} |
| 3 | {principle name} | {what this means in practice} |

### Project Classification

| Dimension | Value |
|-----------|-------|
| Project Type | {type} |
| Domain | {domain} |
| Complexity | {complexity} |
| Context | {greenfield / brownfield} |
| Target Users | {who this is for} |

### Why Now

- {Market trend or regulatory pressure driving urgency}
- {Technology enabler that makes this possible now}
- {Competitive window or execution advantage}

---

## 2. Success Criteria

### User Success Metrics

| ID | Metric | Target | Measurement |
|----|--------|--------|-------------|
| US-1 | {user-facing metric} | {quantified target} | {how measured} |
| US-2 | {user-facing metric} | {quantified target} | {how measured} |

### Business Success Metrics

| ID | Metric | Target | Measurement |
|----|--------|--------|-------------|
| BS-1 | {business metric} | {quantified target} | {how measured} |
| BS-2 | {business metric} | {quantified target} | {how measured} |

### Technical Success Metrics

| ID | Metric | Target | Measurement |
|----|--------|--------|-------------|
| TS-1 | {technical metric} | {quantified target} | {how measured} |
| TS-2 | {technical metric} | {quantified target} | {how measured} |

### Aha Moment Targets

1. **Aha Moment #1 — {Name}:** {What the user experiences. Why it's magical.}
   Target: {quantified time or action}.
2. **Aha Moment #2 — {Name}:** {What the user experiences.}
   Target: {quantified time or action}.

---

## 3. Product Scope

### Phase 1: MVP — {MVP theme / goal}

**Goal:** {1 sentence — what MVP proves}

| Area | Included | Excluded |
|------|----------|----------|
| {Area 1} | {MVP scope} | {Deferred} |
| {Area 2} | {MVP scope} | {Deferred} |

**MVP Exit Criteria:**
- {Measurable criterion}
- {Measurable criterion}

### Phase 2: {Beta / Growth} — {Phase theme}

**Goal:** {1 sentence — what this phase achieves}

| Area | Additions |
|------|-----------|
| {Area 1} | {What's added beyond MVP} |
| {Area 2} | {What's added beyond MVP} |

**{Phase 2} Exit Criteria:**
- {Measurable criterion}
- {Measurable criterion}

### Phase 3: {Release / Scale} — {Phase theme}

**Goal:** {1 sentence — what this phase achieves}

| Area | Additions |
|------|-----------|
| {Area 1} | {What's added beyond previous phase} |
| {Area 2} | {What's added beyond previous phase} |

### Scope Boundaries (All Phases)

**Permanently Out of Scope:**
- {Feature / capability that will never be in this product}
- {Rationale — brief}

---

## 4. User Journeys

### Journey 1: {Journey Name} ({Primary Persona})

**Persona:** {1-2 sentences describing who this is and what they need}

**Trigger:** {What prompts this journey — an event, a notification, a task}

1. **{Step name}:** {What the user does. Key interaction detail.}
2. **{Step name}:** {What the user does. Key interaction detail.}
3. **{Step name}:** {What the user does. Key interaction detail.}
4. **{Step name}:** {What the user does. Key interaction detail.}
5. **Outcome:** {What the user achieves at the end}

**Success Metric:** {Quantified measure of journey success}

### Journey 2: {Journey Name} ({Persona})

**Persona:** {description}

**Trigger:** {what prompts this}

1. **{Step}:** {action}
2. ...
5. **Outcome:** {result}

**Success Metric:** {quantified measure}

### Journey 3: {Journey Name} ({Persona})

[... repeat pattern for 3-7 journeys covering all major user flows]

---

## 5. Personas

### P1 — {Primary persona name} ({user segment})
- **Trigger**: {what prompts them to seek a solution}
- **Pain**: {concrete pain points — what hurts today}
- **Uses the product**: {how they interact, key jobs-to-be-done}
- **Won't pay if**: {deal-breakers — what would make them walk away}

### P2 — {Secondary persona name} ({user segment})
- **Trigger**: {what prompts them}
- **Pain**: {concrete pain points}
- **Uses**: {how they interact}
- **Won't pay if**: {deal-breakers}

---

## 6. Background & Strategic Decisions

[Key decisions that shaped the product direction. Each decision gets
an ID, description, date, and rationale. Maps from BMad Architecture
ADs and CONTEXT.md entries.]

| ID | Decision | Date | Rationale |
|----|----------|------|-----------|
| A1 | {decision title} | YYYY-MM-DD | {1-2 sentence rationale} |
| A2 | {decision title} | YYYY-MM-DD | {1-2 sentence rationale} |

---

## 7. Domain-Specific Requirements

> **Note:** This section is **optional**. Include it ONLY when the product domain
> has specific compliance, regulatory, or technical constraints (crypto, healthcare,
> fintech, legal, etc.). For generic SaaS/web apps, omit this entire section.

### {Domain Category 1}

| ID | Requirement | Rationale |
|----|-------------|-----------|
| D-1 | {domain-specific requirement} | {why this matters in this domain} |

### {Domain Category 2} (if applicable)

| ID | Requirement | Rationale |
|----|-------------|-----------|
| D-2 | {requirement} | {rationale} |

---

## 8. Functional Requirements (FR)

| ID | Requirement | Priority | Status | Epic |
|----|-------------|----------|--------|------|
| FR-1 | {requirement description} | P0/P1/P2/P3 | {status} (vX.Y.Z) | EPIC-N |

Priority: `P0` = must-ship/blocking, `P1` = high, `P2` = medium, `P3` = nice-to-have.
Status: `✅ shipped (vX.Y.Z)` / `🚧 in-progress` / `📋 backlog` / `⏪ reverted in vX.Y.Z` / `🗑️ deprecated vX.Y.Z`.

---

## 9. Non-Functional Requirements (NFR)

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-1 | {requirement} | {measurable target} | {status} |

---

## 10. Glossary

> **Note:** This section is **optional**. Include it when the domain has specialized
> terminology that both human stakeholders and AI agents need clarified.

| Term | Definition |
|------|------------|
| {Term 1} | {1-2 sentence definition in business terms} |
| {Term 2} | {1-2 sentence definition in business terms} |

---

## 11. Epics & User Stories

### EPIC-1: {Epic Title}

**Goal**: {1 sentence — the user outcome this epic delivers}

**Status**: {📋 backlog / 🚧 in-progress / ✅ Done (vX.Y.Z)}

| Story | Title | Status | Version |
|-------|-------|--------|---------|
| [US-1.1](../sprints/stories/US-1.1-<slug>.md) | {title} | {status} | {version} |
| [US-1.2](../sprints/stories/US-1.2-<slug>.md) | {title} | {status} | {version} |

### EPIC-2: {Epic Title}

**Goal**: {1 sentence}

**Status**: {status}

| Story | Title | Status | Version |
|-------|-------|--------|---------|
| [US-2.1](../sprints/stories/US-2.1-<slug>.md) | {title} | {status} | {version} |

[Repeat for all epics]
````

---

## 2. Updating PRD.md

- **When**: After BMad produces PRD artifacts, when scope changes, or when
  a new epic/story is added.
- **How**: Edit the relevant section in-place. Update `lastEdited` and
  `editHistory` in frontmatter.
- **Sections 1-6**: Updated during initial PRD creation from BMad output.
  Rarely change after.
- **Section 8 (FR)**: Updated every time a story ships or scope changes
  (add rows, update status).
- **Section 11 (epic/story index)**: Updated when stories are created,
  status changes, or new epics are added.
- **Cross-reference**: Link to BRIEF.md from §1 header. Link to
  ARCHITECTURE.md from §6. Link to CONTEXT.md for individual decisions.

---

## 3. FR table row (§8)

```markdown
| FR-N | <Requirement description> | P0/P1/P2/P3 | 🚧 In progress / ✅ shipped (vX.Y.Z) / 📋 Backlog | EPIC-N |
```

Priority: `P0` = must-ship/blocking, `P1` = high, `P2` = medium, `P3` = nice-to-have.

---

## 4. Story entry in PRD §11

```markdown
### US-X.Y — <Story title>

**Status**: 🚧 In progress / ✅ Done (vX.Y.Z) / 📋 Backlog / ⏪ Reverted in vX.Y.Z

**Epic**: EPIC-N

**Goal**: <one sentence — what user outcome this delivers>

**Acceptance criteria**:
- [ ] <criterion 1 — use "Given/When/Then" or declarative>
- [ ] <criterion 2>

**Story file**: [docs/sprints/stories/US-X.Y-<slug>.md](sprints/stories/US-X.Y-<slug>.md)
```

### Removal / revert entry

```markdown
**Status**: ⏪ Reverted in vX.Y.Z — see CONTEXT D<N>

<One sentence why it was removed. Link to the CONTEXT entry.>
```

---

## 5. §11 Epics & Stories Index

This index lives in PRD §11. Each story entry links to its canonical
story file in `docs/sprints/stories/`. The index is updated when stories
are created or their status changes.

```markdown
## 11. Epics & User Stories

### EPIC-1 — {Epic Title}
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-1.1 | {title} | 📋 Backlog | — |
| US-1.2 | {title} | 🚧 in-progress | — |

### EPIC-2 — {Epic Title}
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-2.1 | {title} | 📋 Backlog | — |
```

> **Sync rule**: When the `agile-sync-up.mjs` script runs, it propagates
> story status changes to this index. The index is the single source of
> truth for "what stories exist."

---

## 6. Filled example (§1 + §11 snippet)

> The full PRD spans 11 sections and grows to 1500+ lines on a mature
> project. The snippet below shows the *shape* of §1 Executive Summary
> and §11 Epics & User Stories — the two sections most often updated.

```markdown
# Koni-ERP-02 — Product Requirements Document

> **Version**: 0.76.0 — see [VERSION](../VERSION) for the live value.
> Notable additions since v0.20.0:
> - Workspace → Pod → Foundation roadmap landed (v0.21–v0.25)
> - Notion connector reshaped via generic `data_tables` JSONB abstraction (v0.28)
> - Dashboard Studio MVP — pin chat answers as charts (v0.33+)
> - Per-pod product context surface — 6 tabs per pod (v0.44–v0.47)
>
> See [CHANGELOG.md](CHANGELOG.md) for the complete release history.
> **Status**: Live at https://erp.koni.studio.

---

## 1. Executive Summary

**Koni ERP** = a self-serve AI data layer for tech teams under 1000
employees — a chat box that answers business questions in plain English,
drawing data from the SaaS tools the team already uses (GitHub, Linear,
Stripe).

**Wedge V1**: GitHub + Linear for founders / Heads of Engineering. NL→SQL
on top of ingested data, multi-tenant with Row-Level Security from day one.

**Differentiators**:
- **Self-serve setup** (vs Glean's 8-week procurement cycle)
- **BYOK multi-provider** — Anthropic / OpenAI / Gemini / Qwen, no lock-in
- **Self-host friendly** (Supabase + Vercel + Inngest, all OSS-equivalent)

### Project Classification

| Dimension | Value |
|-----------|-------|
| Project Type | SaaS B2B |
| Domain | Internal analytics / ERP |
| Complexity | High |
| Context | Greenfield |
| Target Users | Tech-comfortable founders, Heads of Engineering / Data |

---

## 11. Epics & User Stories

### EPIC-1 — Authentication, Workspaces, Permissions
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-1.1 | Auth + auto-create workspace on sign-up | ✅ done | v0.2.0 |
| US-1.4 | Multi-workspace per user (1 user → N workspaces) | ✅ done | v0.21.0 |
| US-1.7 | Capability gating (Owner / Admin / Member) | ✅ done | v0.54.0 |
| US-1.8 | Invitation email auto-send via Resend | 🚧 in-progress | — |

### EPIC-3 — GitHub Connector
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-3.1 | Connect GitHub OAuth, sync repos/PRs/commits/issues | ✅ done | v0.5.0 |
| US-3.7 | Per-pod project management view (Projects v2-style) | ✅ done | v0.45.1 |
| US-3.10 | Project Table polish — full-width + group-by | ✅ done | v0.48.0 |
```
