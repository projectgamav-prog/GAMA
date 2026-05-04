# Admin Surface Design

## Purpose

This document defines the admin surface system used by the project.

It explains what a surface is, what it exposes, how Conscious Admin actions
attach, and how pages should participate in the admin architecture without
owning editor logic.

## What A Surface Is

A surface is a semantic editing contract exposed by a page or page region.

A surface is not:

- a React component name
- a route name
- a page-specific hack
- a raw UI slot with no meaning

A surface is:

- a description of what is editable
- a description of where it lives
- a description of what capabilities are allowed there
- a stable contract that reusable Conscious actions can qualify against

## Why Surfaces Exist

Surfaces exist so that:

- pages can stay thin
- action definitions and renderers can stay reusable
- editor behavior can attach by semantics instead of fragile page wiring
- the same editor family can work across page and row contexts

## Surface Responsibilities

A surface should define:

- entity identity
- region identity
- contract kind
- placement/slot hints
- allowed capabilities
- metadata required by qualifying actions, schema field displays, or protected workflows

A surface should not define:

- page-level business logic unrelated to the edit
- view composition unrelated to editing
- concrete module implementations

## Current Surface Contract

The canonical TypeScript contract lives in:

- `resources/js/admin/surfaces/core/surface-contracts.ts`

The current contract shape includes:

- `surfaceKey`
- `contractKey`
- `entity`
- `entityId`
- `slot`
- `regionKey`
- `blockType`
- `owner`
- `capabilities`
- `presentation`
- `label`
- `metadata`

## Surface Keys

Surface keys provide semantic identity where the surface meaning needs to be
stable across contexts.

Examples:

- `book.identity`
- `book.intro`
- `chapter.identity`
- `verse.translations`

Surface keys should express semantic purpose, not page implementation detail.

## Contract Keys

Contract keys express the kind of editor/data behavior a module should expect.

Examples:

- `identity`
- `intro`
- `structured_meta`
- `relation_rows`
- `media_slots`
- `section_collection`
- `section_group`

## Capabilities

Capabilities define what the surface allows.

Examples:

- `edit`
- `create_row`
- `full_edit`
- `add_block`
- `delete`
- `manage_media`
- `manage_relations`

Capabilities are workflow hints for reusable modules. They must stay
higher-level than button names or route names.

## How Surfaces Are Defined

Surface builders live under:

- `resources/js/admin/surfaces/core/`
- `resources/js/admin/surfaces/scripture/`
- `resources/js/admin/surfaces/sections/`

Pages should not hand-roll raw surface objects unless there is a compelling
reason. Prefer builders so surface shape stays predictable.

## How Pages Expose Surfaces

Pages should:

- resolve the relevant domain data
- call surface builders/resolvers or render schema-aware field components
- pass resulting schema/content surface metadata to `AdminSchemaFieldDisplay`,
  `AdminSchemaFieldSurface`, `AdminSurfaceActionMenu`, or Conscious Full Edit flows

Pages should not:

- import many concrete editor components directly
- contain large qualification branches
- own editor lifecycle behavior as page logic

Good current examples:

- `resources/js/pages/scripture/books/show.tsx`
- `resources/js/pages/scripture/chapters/show.tsx`

## How Actions Attach To Surfaces

Conscious actions qualify against surfaces through shared metadata-driven rules.

The active qualification/action path lives in:

- `resources/js/admin/actions/conscious-action-registry.ts`
- `resources/js/admin/actions/conscious-surface-action-resolver.ts`
- `resources/js/admin/core/AdminSurfaceActionMenu.tsx`

Qualification can depend on:

- schema family
- entity type
- field name when field-level
- control level
- required capability
- backend status
- risk level
- runtime availability such as edit handler or Full Edit href

Actions must qualify from surface truth, not from page component identity.

## Relationship Between Surfaces And Actions

Surfaces and actions have distinct roles.

### Surface Role

Surfaces say:

- what this thing is
- what can happen here
- what metadata is available

### Action Role

Actions say:

- which surfaces they can attach to
- what action family they represent
- whether they are available now or hidden until backend support exists
- what UI mode they use
- what backend route/action service they require

Pages and renderers expose surfaces. The Conscious action resolver decides what
can appear. `AdminSurfaceActionMenu` renders only enabled actions.

## Surface Design Rules

- Surfaces must be semantic, not cosmetic.
- Surfaces must be truthful to the domain.
- Pages should expose surfaces rather than concrete editors.
- Reusable action/editor behavior should not move into pages.
- If two contexts are semantically different, reflect that in surface metadata
  or in separate surfaces.
- Keep surface metadata focused on what actions need.

## Surface Boundaries

Do not use surfaces to:

- disguise page-local hacks as architecture
- pass giant page payloads into modules
- leak unrelated view state into editor contracts
- bypass schema surfaces/action resolution with one-off direct editor mounting
  as the default

## Future Direction

The surface system should evolve by:

- adding clearer distributed builders
- reducing large page-specific surface assembly code
- tightening oversized metadata contracts where actions consume only slices

It should not evolve toward:

- page-owned editor orchestration
- a giant universal metadata bag
- route-name-driven editor behavior

