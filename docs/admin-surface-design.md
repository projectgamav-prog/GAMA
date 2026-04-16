# Admin Surface Design

## Purpose

This document defines the admin surface system used by the project.

It explains what a surface is, what it exposes, how modules attach, and how
pages should participate in the admin architecture without owning editor logic.

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
- a stable contract that reusable modules can qualify against

## Why Surfaces Exist

Surfaces exist so that:

- pages can stay thin
- modules can stay reusable
- editor behavior can attach by semantics instead of fragile page wiring
- the same editor family can work across page and row contexts

## Surface Responsibilities

A surface should define:

- entity identity
- region identity
- contract kind
- placement/slot hints
- allowed capabilities
- metadata required by qualifying modules

A surface should not define:

- page-level business logic unrelated to the edit
- view composition unrelated to editing
- concrete module implementations

## Current Surface Contract

The canonical TypeScript contract lives in:

- [resources/js/admin/surfaces/core/surface-contracts.ts](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/surfaces/core/surface-contracts.ts:1>)

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
- call integration helpers or builders
- pass resulting surfaces to `AdminModuleHost` or `AdminModuleHostGroup`

Pages should not:

- import many concrete editor modules directly
- contain large qualification branches
- own editor lifecycle behavior as page logic

Good current examples:

- [resources/js/pages/scripture/books/show.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/pages/scripture/books/show.tsx:13>)
- [resources/js/pages/scripture/chapters/show.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/pages/scripture/chapters/show.tsx:17>)

## How Modules Attach To Surfaces

Modules qualify against surfaces through shared metadata-driven rules.

The qualification host lives in:

- [resources/js/admin/core/AdminModuleHost.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/core/AdminModuleHost.tsx:29>)
- [resources/js/admin/core/qualify-module.ts](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/core/qualify-module.ts:47>)

Qualification can depend on:

- surface key
- contract key
- entity scope
- slot
- region scope
- presentation metadata
- required capabilities
- an optional custom predicate

Modules must qualify from surface truth, not from page component identity.

## Relationship Between Surfaces And Modules

Surfaces and modules have distinct roles.

### Surface Role

Surfaces say:

- what this thing is
- what can happen here
- what metadata is available

### Module Role

Modules say:

- which surfaces they can attach to
- what editing behavior they provide
- what actions they expose
- how they render and submit

Pages expose surfaces. Modules attach to surfaces. The host resolves the match.

## Surface Design Rules

- Surfaces must be semantic, not cosmetic.
- Surfaces must be truthful to the domain.
- Pages should expose surfaces rather than concrete editors.
- Reusable module behavior should not move into pages.
- If two contexts are semantically different, reflect that in surface metadata
  or in separate surfaces.
- Keep surface metadata focused on what modules need.

## Surface Boundaries

Do not use surfaces to:

- disguise page-local hacks as architecture
- pass giant page payloads into modules
- leak unrelated view state into editor contracts
- bypass the module host with one-off direct editor mounting as the default

## Future Direction

The surface system should evolve by:

- adding clearer distributed builders
- reducing large page-specific surface assembly code
- tightening oversized metadata contracts where modules consume only slices

It should not evolve toward:

- page-owned editor orchestration
- a giant universal metadata bag
- route-name-driven editor behavior
