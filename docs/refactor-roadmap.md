# Refactor Roadmap

## Purpose

This document records the phased safe refactor plan for improving SOLID
alignment without breaking the current architecture direction.

The roadmap is intentionally incremental. It is not a rewrite plan.

## Phase 1 - Controller Payload Extraction

### Objective

Extract nested page/admin payload assembly out of thick scripture controllers
into focused support builders while preserving response shape.

### Primary Target Files

- [app/Http/Controllers/Scripture/BookController.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Http/Controllers/Scripture/BookController.php:23>)
- [app/Http/Controllers/Scripture/ChapterController.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Http/Controllers/Scripture/ChapterController.php:28>)
- [app/Http/Controllers/Scripture/VerseController.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Http/Controllers/Scripture/VerseController.php:27>)

### Risks

- accidental response shape drift
- moving query decisions into builders
- turning extraction into one new mega service
- leaving replaced controller payload paths or dead helper code behind

## Phase 2 - Structural Registry Cleanup

### Objective

Break monolithic registries into distributed definitions while preserving stable
lookup APIs.

### Primary Target Files

- [app/Support/Scripture/Admin/Registry/AdminEntityRegistry.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/Admin/Registry/AdminEntityRegistry.php:14>)
- [app/Support/Cms/CmsModuleRegistry.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Cms/CmsModuleRegistry.php:7>)
- [resources/js/admin/cms/core/module-registry.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/cms/core/module-registry.tsx:8>)
- [app/Support/Cms/Regions/CmsExposedRegionRegistry.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Cms/Regions/CmsExposedRegionRegistry.php:8>)

### Risks

- registry API drift
- breaking current keyed discovery
- mixing backend and frontend registry redesign in one batch

## Phase 3 - Controller And Page Thinning

### Objective

Move page-specific orchestration and large rendering sections into focused
builders and components so pages/controllers become clearer orchestration layers.

### Primary Target Files

- [resources/js/pages/scripture/chapters/verses/show.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/pages/scripture/chapters/verses/show.tsx:51>)
- [resources/js/pages/scripture/books/full-edit.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/pages/scripture/books/full-edit.tsx:107>)
- [resources/js/pages/scripture/chapters/verses/full-edit.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/pages/scripture/chapters/verses/full-edit.tsx:508>)

### Risks

- leaking page logic into too many micro-components
- changing prop contracts while decomposing UI
- bypassing the module host with local editor rewiring

## Phase 4 - Workspace And Editor Decomposition

### Objective

Split large CMS/editor React files into reusable workflow pieces while
preserving current composition grammar and user flow.

### Primary Target Files

- [resources/js/admin/cms/components/CmsCompositionAdders.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/cms/components/CmsCompositionAdders.tsx:307>)
- [resources/js/admin/cms/components/CmsLivePageComposer.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/cms/components/CmsLivePageComposer.tsx:410>)
- [resources/js/admin/cms/workspace/CmsCompositionEditor.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/cms/workspace/CmsCompositionEditor.tsx:407>)
- [resources/js/components/scripture/scripture-admin-content-block-cards.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-admin-content-block-cards.tsx:174>)

### Risks

- breaking UX flow while splitting files
- duplicating form logic instead of extracting shared helpers
- introducing a second ad hoc editor system

## Phase 5 - Later Hardening

### Objective

Tighten contracts and reduce cross-layer drift after earlier extraction work
stabilizes the codebase.

### Primary Target Files

- [resources/js/types/scripture.ts](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/types/scripture.ts:1>)
- [resources/js/types/cms.ts](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/types/cms.ts:1>)
- [resources/js/admin/surfaces/sections/surface-types.ts](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/surfaces/sections/surface-types.ts:1>)
- [resources/js/admin/surfaces/core/contract-readers.ts](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/surfaces/core/contract-readers.ts:1>)

### Risks

- premature contract tightening
- large type churn with little architectural value
- coupling type cleanup to unrelated refactors

## Sequencing Rules

- Extract before redesign.
- Keep one stable payload contract per batch where possible.
- Remove dead code inside the touched scope as part of each batch, but do not
  widen cleanup into unrelated systems.
- Do not combine registry breakup and page thinning in one batch.
- Do not combine CMS backend registry redesign and CMS UI decomposition in one
  batch.
- Do not combine large type-hardening work with large file decomposition.
- Prefer behavior-preserving moves before contract-changing moves.

## Cross-Phase Risk Rules

- Never let CMS start controlling canonical schema as a side effect of
  refactors.
- Never bypass the admin module host architecture to “simplify” a page.
- Never turn canonical specialness into generic CMS structure.
- Never replace several focused support classes with one large new abstraction
  layer.
- Never leave accidental parallel old/new implementations behind after a
  behavior-preserving refactor.
