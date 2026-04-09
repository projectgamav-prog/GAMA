Codex Architecture Brief
Scripture platform + CMS page foundation context, rules, and guardrails

Use this document as the source-of-truth brief in a fresh Codex window.

Purpose: preserve the locked semantic-surface admin architecture for canonical scripture while the first universal CMS page system begins.

Current priority: keep canonical scripture pages thin and schema-driven, and treat all manually created pages as CMS pages backed by a dedicated page record plus shared content-block ownership.

## 1. Locked architecture context
This project is not greenfield. The admin system already has a locked direction, and Codex must work inside it rather than improvising page-specific patterns.

- Pages are render shells and should stay thin.
- Admin attaches through semantic surfaces.
- Modules qualify by semantic identity plus capabilities.
- Reusable editor behavior lives in `resources/js/admin/modules`.
- Semantic attachment specs, builders, and contracts live in `resources/js/admin/surfaces`.
- Schema-family assembly lives in `resources/js/admin/integrations`.
- Runtime host and qualification engine live in `resources/js/admin/core`.
- Do not reintroduce local page hooks, bridge/session behavior, or page-fragile wrappers.

## 2. Domain boundary
- Canonical scripture pages are schema-driven exceptions.
- Canonical uniqueness is hierarchical/composite, not globally name-based:
  `book > book_section > chapter > chapter_section > verse`.
- Canonical scripture routing and hierarchy must not be flattened into generic CMS assumptions.
- Manually created pages belong to one universal CMS page system.
- CMS must not become the source of truth for canonical scripture structure.
- Do not redesign canonical routing into CMS routing during this phase.

## 3. CMS page foundation
The CMS direction is now active and formal.

- A page is created first as a CMS record.
- Page identity currently means:
  - `title`
  - `slug`
  - `status`
  - optional `layout_key`
- The backend foundation uses a dedicated `pages` table.
- The public CMS route is currently `/pages/{page:slug}`.
- The authenticated CMS workspace is currently:
  - `/cms/pages`
  - `/cms/pages/{page:slug}`
- Pages act as content owners/containers.
- Content blocks belong to pages through the existing polymorphic owner pattern on `content_blocks.parent_type` and `content_blocks.parent_id`.
- Do not invent a second content system for CMS pages.
- Do not invent many page-specific CMS types in this phase.

This first CMS pass is intentionally narrow:
- page identity
- slug/routing identity
- publish state
- page ownership of content blocks

Still postponed:
- full page-builder UX
- rich page block editing workflows
- page templates beyond a minimal optional layout hint
- public CMS page discovery/navigation systems

## 4. Canonical admin philosophy
- Pages expose semantic facts.
- Integrations normalize schema context.
- Modules define qualification and actions.
- Hosts resolve placement and render buttons/actions.
- Button labels should not be page-hardcoded where avoidable.
- Closed-state launchers should stay compact and grouped.
- Open editor forms may remain larger.

## 5. Content-block architecture rule
- Content blocks are reusable owner-attached editorial units.
- Reuse the current block ownership model wherever possible.
- When a new owner type is added, prefer extending the owner pattern instead of branching into a new block architecture.
- Canonical scripture owners and CMS page owners may both use the same underlying content-block table.
- Differences between canonical surfaces and CMS surfaces should be handled semantically, not by duplicating the storage model.

## 6. Active public flows
Canonical scripture:
- `scripture.books.index`
- `scripture.books.show`
- `scripture.chapters.show`
- `scripture.chapters.verses.show`

CMS:
- `pages.show`

Do not bring back old chapter-section gateway pages or similar canonical detours.

## 7. Active admin flows
Canonical scripture admin remains contextual and surface-attached on the canonical pages.

CMS page admin currently uses a dedicated workspace:
- `cms.pages.index`
- `cms.pages.show`

This does not replace the canonical page-local host system. It begins the universal CMS direction for non-canonical pages only.

## 8. What Codex must preserve
- Canonical scripture pages remain thin and surface-driven.
- Verse/book/chapter admin behavior stays inside the admin module system.
- CMS pages remain generic and page-record-driven.
- Content blocks remain reusable across owner types.
- New CMS work should extend the universal page system, not create isolated one-off features.

## 9. What Codex must not do
- Do not move canonical scripture behavior into the CMS page system.
- Do not let CMS pages masquerade as canonical scripture nodes.
- Do not reintroduce page-local admin hacks on canonical pages.
- Do not create a second content-block architecture for CMS.
- Do not hardcode many standalone page types in the first CMS phase.
- Do not silently drift the architecture.

## 10. Practical guardrails for the next passes
- If work touches canonical scripture pages, keep using semantic surfaces and module qualification.
- If work touches manual pages, route it through the CMS page model and workspace.
- If a workflow needs content, attach it through page-owned content blocks instead of page-specific columns whenever practical.
- If a later CMS workflow needs richer editing, extend the universal page/block system rather than creating a special page feature.

## 11. Reporting expectations
When a CMS page task is completed, report:
- whether page creation is being treated as CMS
- what page model fields exist
- how page-owned content blocks fit the current architecture
- what was implemented now
- what was intentionally postponed
- what docs changed
- what verification ran
