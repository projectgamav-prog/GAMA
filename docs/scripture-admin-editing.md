# Scripture Admin Editing

Use this document when work touches the active canonical scripture admin system.

This is the implementation-facing companion to:
- `docs/admin-architecture.md`
- `docs/public-admin-page-authoring.md`

It describes the current live scripture admin surface architecture after the
retired public block-authoring path was removed from active scripture pages.

Read alongside:
- `docs/admin-architecture.md`
- `docs/admin-module-integration.md`
- `docs/public-admin-page-authoring.md` when the task touches same-layout live authoring rules

## Scope

This document covers the active canonical editing path for:
- books
- book sections
- chapters
- chapter sections
- verses
- active verse support editors such as meta, translations, and commentaries

It does not cover:
- CMS page/container/block composition
- retired public scripture content-block authoring
- postponed topic/character admin reactivation

## Current model

Canonical scripture pages stay thin.

They expose semantic surfaces and mount shared hosts. Reusable editor behavior
lives in the admin module system, not in the page file.

The active live scripture editing model is:
- page and row wrappers emit semantic `AdminSurfaceContract` values
- integration helpers assemble the right surfaces for the current context
- `AdminModuleHost` and `AdminModuleHostGroup` qualify reusable modules
- inline editors save back to canonical routes and stay on the intended page
- full-edit pages remain the protected fallback for deeper canonical/supporting work

## Active infrastructure

Core runtime:
- `resources/js/admin/core/AdminModuleHost.tsx`
- `resources/js/admin/core/AdminModuleHostGroup.tsx`
- `resources/js/admin/core/module-registry.ts`
- `resources/js/admin/core/module-types.ts`
- `resources/js/admin/core/qualify-module.ts`
- `resources/js/admin/core/module-actions.ts`

Surface contracts and builders:
- `resources/js/admin/surfaces/core/surface-contracts.ts`
- `resources/js/admin/surfaces/core/surface-builders.ts`
- `resources/js/admin/surfaces/core/surface-keys.ts`
- `resources/js/admin/surfaces/core/contract-readers.ts`

Canonical integrations:
- `resources/js/admin/integrations/scripture/books.ts`
- `resources/js/admin/integrations/scripture/chapters.ts`
- `resources/js/admin/integrations/scripture/verses.ts`
- `resources/js/admin/integrations/sections.ts`

## Surface contract

The host only depends on the surface contract, not on page-local implementation.

Each active surface may expose:
- `surfaceKey`
- `contractKey`
- `entity`
- `entityId`
- `slot`
- `regionKey`
- `owner` when a surface is attached inside a parent entity context
- `capabilities`
- `presentation`
- `metadata`

Important rule:
- pages should emit semantic metadata
- modules should read semantic metadata through readers
- page files should not manually choose concrete editor implementations

## Active slots and contracts

Active slots:
- `inline_editor`
- `sheet_editor`

Active contract families:
- `identity`
- `intro`
- `structured_meta`
- `entity_actions`
- `relation_rows`
- `media_slots`
- `section_collection`
- `section_group`

The earlier public scripture block-region contracts were retired from the active
public scripture path and are no longer part of the working module registry.

## Semantics

The main semantic distinction is not "which page rendered this," but "what kind
of editing context is this surface describing."

### Page surfaces

Use page surfaces when the editor is attached to the main canonical entity
header or top-level entity region.

Examples:
- book identity on the book page
- chapter identity on the chapter page
- verse identity on the verse detail page

Expected behavior:
- page wording should describe the real page context
- save should stay on the same public-looking page unless canonical routing
  requires a truthful redirect after a slug change

### Row surfaces

Use row surfaces when the editor is mounted inside a list/card row on a parent
page.

Examples:
- chapter identity on the book page chapter list
- verse identity on the chapter page verse list

Expected behavior:
- row wording should describe the row context, not the child detail page
- the surface should carry the correct `returnToHref`
- save should return to the parent list page and re-render the updated row

### Group/list surfaces

Use grouped/list surfaces for shared row shells that summarize or edit grouped
schema structures.

Examples:
- book-section grouped rows on the book page
- chapter-section grouped rows on the chapter page
- collection/group summary panels

Expected behavior:
- grouped metadata should stay generic enough to work across list shells
- row detail and intro editing should come from group/list metadata rather than
  page-local wiring

### Full-edit surfaces

Full-edit pages are still active, but they are not the primary route for common
live editing.

Use them for:
- protected canonical workflows
- deeper supporting/editorial management
- transitional fallback where an in-place affordance is intentionally not built

Do not reuse full-edit assumptions as the default semantics for page or row
surfaces.

## Return-to and same-page behavior

Live scripture editing should be truthful to the mounted context.

Rules:
- row/list editing must send a same-page `return_to` when the backend supports it
- page editing may redirect to the updated canonical route after a slug change
- editor copy must match the mounted context
- the same module may serve multiple contexts only if the surface metadata
  carries the correct context semantics

This is especially important for chapter-row and verse-row identity editing.

## Current active module families

Canonical book modules:
- `BookIdentityEditor`
- `BookIntroEditor`
- `MediaSlotsEditor`

Canonical chapter modules:
- `ChapterIdentityEditor`
- `ChapterIntroEditor`

Canonical verse modules:
- `VerseIdentityEditor`
- `VerseIntroEditor`
- `VerseMetaEditor`
- `VerseTranslationsEditor`
- `VerseCommentariesEditor`
- `VerseRowActions`

Shared section modules:
- `SectionCollectionPanel`
- `SectionGroupPanel`
- `HierarchyCreateEditor`
- `SectionIntroEditor`
- `SectionRowDetailEditor`

Shared entity action modules:
- `EntityDeleteAction`

Shared intro helpers used by active modules:
- `resources/js/admin/modules/intros/`
- `RegisteredEntityIntroEditor`
- `RegisteredIntroBlockEditor`

## What is retired from the active public scripture path

These are no longer part of the active public scripture authoring direction:
- the old owner-attached public add/edit/move/delete content-block path
- the old public scripture block module registry branch
- the old watch-overview public behavior

Important nuance:
- canonical full-edit content-block management still exists as a transitional
  admin fallback
- backend content-block routes/controllers still exist where full edit still
  needs them
- those remaining controllers and route-context helpers should be treated as
  fallback-only seams, not as the primary mental model for new public/admin work
- that backend fallback is not the same thing as the retired public live path

## How future scripture pages should expose surfaces

When adding or cleaning a future canonical page:

1. Keep the page thin.
2. Put shape/semantics in a surface builder or integration helper.
3. Choose the real semantic context:
   - page
   - row
   - grouped/list
   - full-edit fallback
4. Pass truthful route metadata such as `returnToHref`.
5. Mount `AdminModuleHost` or `AdminModuleHostGroup`.
6. Let modules qualify from the contract instead of hardcoding editor imports in
   the page.

## Guardrails

Do:
- keep canonical schema editing inside the canonical admin module system
- keep row semantics distinct from page semantics
- keep same-page behavior explicit where intended
- keep CMS exposure separate from canonical schema editing

Do not:
- reintroduce page-local editor hacks
- mount a child detail-page editor semantically unchanged inside a parent row
- treat retired public block-authoring code as active architecture
- let CMS supplementary regions mutate canonical scripture structure

