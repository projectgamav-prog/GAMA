Codex Architecture Brief
Scripture platform + independent CMS composition context, rules, and guardrails

Use this document as the source-of-truth brief in a fresh Codex window.

Purpose: preserve the locked semantic-surface admin architecture for canonical scripture while the independent universal CMS page system grows beside it.

Current priority: keep canonical scripture pages thin and schema-driven, and build CMS pages through their own page/container/block composition system with a dedicated CMS module registry.

## 1. Locked architecture context
This project is not greenfield. The admin system already has a locked direction, and Codex must work inside it rather than improvising page-specific patterns.

- Pages are render shells and should stay thin.
- Admin attaches through semantic surfaces.
- Modules qualify by semantic identity plus capabilities.
- Reusable canonical editor behavior lives in `resources/js/admin/modules`.
- Semantic attachment specs, builders, and contracts live in `resources/js/admin/surfaces`.
- Schema-family assembly lives in `resources/js/admin/integrations`.
- Runtime host and qualification engine live in `resources/js/admin/core`.
- Do not reintroduce local page hooks, bridge/session behavior, or page-fragile wrappers.

## 2. Domain boundary
- Canonical scripture pages are schema-driven exceptions.
- Canonical uniqueness is hierarchical/composite, not globally name-based:
  `book > book_section > chapter > chapter_section > verse`.
- Canonical scripture routing and hierarchy must not be flattened into generic CMS assumptions.
- Manually created pages belong to one universal CMS system.
- CMS must not become the source of truth for canonical scripture structure.
- Do not redesign canonical routing into CMS routing.

## 3. CMS composition system
The CMS direction is now active and formal.

- A page is created first as a CMS record.
- CMS page identity currently means:
  - `title`
  - `slug`
  - `status`
  - optional `layout_key`
- The backend foundation uses:
  - `pages`
  - `page_containers`
  - `page_blocks`
- The public CMS route is `/pages/{page:slug}`.
- The authenticated CMS workspace is:
  - `/cms/pages`
  - `/cms/pages/{page:slug}`

The locked CMS composition model is:
- Page
- Page Container
- Page Block

Meaning:
- a page owns ordered containers
- a container may behave like a card or a non-card section
- a container owns ordered page blocks
- blocks render inside their container

This is the structural seam that decides whether content:
- stays inside the same card/container
- or becomes a new card/container

Do not flatten CMS composition back into a single page-owned block list.

## 4. CMS module architecture
CMS modules must stay independent from scripture admin modules.

- CMS module frontend code lives under `resources/js/admin/cms/`.
- Registry/core/renderer/editor concerns stay separate from scripture admin folders.
- Modules are registry-based and manifest-driven.
- Modules should be easy to build in isolation and easy to integrate later.

Each CMS module manifest should declare, at minimum:
- `key`
- `label`
- `category`
- `description`
- `defaultData`
- `defaultConfig`
- `Renderer`
- `Editor`

Future helpers/validation can extend this contract, but do not hardcode modules into page files.

## 5. Canonical admin philosophy
- Canonical pages expose semantic facts.
- Canonical integrations normalize schema context.
- Canonical modules define qualification and actions.
- Canonical hosts resolve placement and render buttons/actions.
- Button labels should not be page-hardcoded where avoidable.
- Closed-state launchers should stay compact and grouped.
- Open editor forms may remain larger.

## 6. Content architecture rule
There are now two content systems with different purposes.

Canonical/editorial owner-attached blocks:
- reusable editorial units
- attach through the existing polymorphic `content_blocks` owner pattern
- remain appropriate for canonical scripture and related editorial entities

CMS page composition blocks:
- belong to `page_containers`
- live in `page_blocks`
- render through the dedicated CMS registry and renderer path
- must not inherit scripture-flavored renderer assumptions as their permanent architecture

Do not try to force CMS page composition back through the canonical `content_blocks` model.
Do not let canonical scripture routing or structure leak into CMS composition.

## 7. Active public flows
Canonical scripture:
- `scripture.books.index`
- `scripture.books.show`
- `scripture.chapters.show`
- `scripture.chapters.verses.show`

CMS:
- `pages.show`

Do not bring back old chapter-section gateway pages or similar canonical detours.

## 8. Active admin flows
Canonical scripture admin remains contextual and surface-attached on the canonical pages.

CMS admin now uses a dedicated workspace:
- `cms.pages.index`
- `cms.pages.show`

This does not replace the canonical page-local host system. It is the universal CMS direction for non-canonical pages only.

## 9. What Codex must preserve
- Canonical scripture pages remain thin and surface-driven.
- Verse/book/chapter admin behavior stays inside the canonical admin module system.
- CMS pages remain generic and page-record-driven.
- CMS composition stays page -> container -> block.
- CMS modules stay in the dedicated CMS registry structure.
- New CMS work should extend the universal page system, not create isolated one-off features.

## 10. What Codex must not do
- Do not move canonical scripture behavior into the CMS page system.
- Do not let CMS pages masquerade as canonical scripture nodes.
- Do not reintroduce page-local admin hacks on canonical pages.
- Do not entangle CMS modules with scripture module folders.
- Do not flatten CMS pages back into a single page-owned block list.
- Do not use scripture renderers as the permanent CMS renderer path.
- Do not hardcode many standalone page types in early CMS phases.
- Do not silently drift the architecture.

## 11. Practical guardrails for the next passes
- If work touches canonical scripture pages, keep using semantic surfaces and module qualification.
- If work touches manual pages, route it through the CMS page/container/block model and the dedicated CMS workspace.
- If a workflow needs new CMS content in the same card, add a block inside the container.
- If a workflow needs a new card/section, create a new container.
- If CMS modules expand, add them through the registry/manifest path rather than special page code.
- If a later CMS workflow needs richer editing, extend the universal CMS module system rather than inventing a special page feature.

## 12. Reporting expectations
When a CMS composition task is completed, report:
- the CMS composition model in use
- how page/container/block ownership works
- how same-container vs new-container decisions work
- what CMS modules were added or changed
- what was intentionally postponed
- what docs changed
- what verification ran
