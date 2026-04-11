Codex Architecture Brief
Scripture platform + independent CMS composition context, rules, and guardrails

Use this document as the source-of-truth brief in a fresh Codex window.

Purpose: preserve the locked semantic-surface admin architecture for canonical scripture while the independent universal CMS page system grows beside it.

Current priority: keep canonical scripture pages thin and schema-driven, and build CMS pages through their own page/container/block composition system with a dedicated CMS module registry.

Implementation companions:
- `docs/scripture-admin-editing.md` for the active canonical public/admin surface system
- `docs/admin-module-integration.md` for adapting outside React components into the admin module architecture
- `docs/public-admin-page-authoring.md` for the locked same-layout public/admin authoring rules on eligible pages
- `docs/admin/content-aware-positional-authoring.md` for the reusable live structured authoring pattern
- `docs/admin/positional-authoring-implementation-guide.md` for implementation-facing positional authoring rules
- `docs/public-region-policy.md` for declared global and page-level region seams

## 0. Admin documentation set
Treat the admin docs as one maintained set instead of isolated notes.

- `docs/admin-architecture.md`
  Top-level source of truth for canonical admin and CMS boundaries.
- `docs/scripture-admin-editing.md`
  Practical guide for the active canonical scripture surface/module path.
- `docs/admin-module-integration.md`
  Implementation guide for adapting inside-project or outside React components into the canonical admin and CMS module systems.
- `docs/public-admin-page-authoring.md`
  Same-layout and in-place authoring rules for public/admin page behavior.
- `docs/admin/content-aware-positional-authoring.md`
  Reusable product/architecture brief for live positional structured editing.
- `docs/admin/positional-authoring-implementation-guide.md`
  Implementation guide for item/list/tree positional authoring.
- `docs/public-region-policy.md`
  Declared global shell regions and page-level canonical vs supplemental seams.

When touching canonical scripture admin work:
- read `admin-architecture.md`
- read `scripture-admin-editing.md`
- read `admin-module-integration.md` if the task affects reusable modules or outside-component adaptation
- read the positional authoring docs if the task affects live structured editing on the real surface

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

The active CMS editing grammar is:
- create a new container = create a new card/section
- add a block to a container = keep content inside the same card/section
- move up/down = reorder containers or blocks without changing the ownership model
- delete = remove only the selected CMS node and any children it owns

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
- optional `validate`

Future helpers/validation can extend this contract, but do not hardcode modules into page files.

The CMS module folder shape is now treated as stable for the current foundation:
- `resources/js/admin/cms/modules/<module-key>/manifest.ts`
- `resources/js/admin/cms/modules/<module-key>/renderer.tsx`
- `resources/js/admin/cms/modules/<module-key>/editor.tsx`
- `resources/js/admin/cms/modules/<module-key>/types.ts`
- `resources/js/admin/cms/modules/<module-key>/defaults.ts`
- `resources/js/admin/cms/modules/<module-key>/index.tsx`

This folder shape is part of the CMS portability goal:
- modules should be easy to prototype outside the project
- then copied in with minimal refactoring
- then registered through the CMS manifest registry
- without touching scripture admin modules

CMS integration policy:
- CMS may link to canonical scripture routes or entities through clean URLs and normal data contracts.
- Future scripture-aware CMS content should arrive through dedicated CMS modules or bridge adapters.
- CMS modules must not directly depend on canonical admin module internals, surface builders, or qualification logic.

## 5. Canonical admin philosophy
- Canonical pages expose semantic facts.
- Canonical integrations normalize schema context.
- Canonical modules define qualification and actions.
- Canonical hosts resolve placement and render buttons/actions.
- Canonical shared intro helpers live in the intro module family, not in a generic block family.
- Button labels should not be page-hardcoded where avoidable.
- Closed-state launchers should stay compact and grouped.
- Open editor forms may remain larger.

## 6. Content architecture rule
There are now two content systems with different purposes.

Canonical/editorial owner-attached blocks:
- reusable editorial units
- attach through the existing polymorphic `content_blocks` owner pattern
- remain appropriate for canonical scripture and related editorial entities
- the remaining canonical content-block controllers/routes are transitional full-edit fallback seams, not the active public authoring path

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

CMS admin now has two interaction layers:
- live CMS page composition on published CMS pages for permitted users
- a dedicated CMS workspace for supporting record management and deeper composition work

The dedicated CMS workspace remains:
- `cms.pages.index`
- `cms.pages.show`

This does not replace the canonical page-local host system. It is the universal CMS direction for non-canonical pages only.

The public-page-first CMS rule is now locked:
- content-managed pages must use the same core layout for public users and admins
- admin mode may augment that real page with controls, overlays, adders, and edit affordances
- admin mode must not rely on a fundamentally separate builder layout for routine composition
- CMS workspace pages remain supportive utilities for listing, search, diagnostics, and management rather than the primary authoring surface
- this same-layout plus admin-augmentation behavior should stay consistent across eligible pages site-wide
- routine live authoring controls should attach directly to the relevant layout element instead of appearing as a detached builder shell below the page

The reusable positional authoring pattern is also now part of the active
direction for structured live editing:
- the real rendered item/list/tree can become the active editing surface
- tiny contextual controls attach near the actual item or list position
- inline edit and draft insertion should happen where the item really lives
- move up/down and delete should stay local when the structured surface supports it
- structured data contracts must survive local inline editing
- workspace/full-edit remains supportive fallback rather than the routine path

## 9. What Codex must preserve
- Canonical scripture pages remain thin and surface-driven.
- Verse/book/chapter admin behavior stays inside the canonical admin module system.
- CMS pages remain generic and page-record-driven.
- CMS composition stays page -> container -> block.
- CMS modules stay in the dedicated CMS registry structure.
- CMS module manifests and folder shape stay stable unless a deliberate architecture change is required.
- Future canonical pages should expose semantic surfaces and let reusable modules qualify rather than importing editor implementations directly.
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
- If work touches manual pages, route it through the CMS page/container/block model and the live page first, with the CMS workspace as support tooling.
- Prefer exposing CMS composition on the real page layout; use the workspace as a support surface, not the routine authoring path.
- If a workflow needs new CMS content in the same card, add a block inside the container.
- If a workflow needs a new card/section, create a new container.
- If CMS modules expand, add them through the registry/manifest path rather than special page code.
- If CMS module folders change, keep the manifest/renderer/editor/types/defaults contract predictable.
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
