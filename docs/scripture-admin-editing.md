# Scripture Admin Editing

## Scope

This document describes the current live admin editing system for:

- books
- chapters
- verses
- shared admin infrastructure used by those pages

Topics and characters remain postponed and are intentionally excluded from the
active architecture described here.

## Current Model

The live admin experience is intentionally mixed:

- simple text-first regions and published text note blocks edit directly on the page
- more complex structures still fall back to the existing sheet editors

This is a deliberate transition state. The goal is to keep the page itself as
the primary editing surface without forcing every structure into inline editing
before the CMS model is ready.

## Module-Host Architecture

Live scripture pages no longer import most concrete editors directly. They now
expose surface contracts and mount `AdminModuleHost`, which resolves qualifying
modules from the shared registry.

The current attachment flow is:

1. A page or shared section renderer builds an `AdminSurfaceContract`.
2. `AdminModuleHost` asks the registry for modules that qualify for that surface.
3. Qualification checks entity, slot, region, block type, and required
   capabilities.
4. Matching modules render in deterministic order.

This keeps pages thin and makes the module engine the stable attachment point
for future editors.

## Surface Contract

Each module-ready surface currently exposes:

- `entity` and `entityId`
- `slot`
- `regionKey`
- `blockType` when the surface represents a block
- `owner` when the surface belongs to a parent scripture entity
- `capabilities`
- `label`
- `metadata`

The host and qualification engine depend only on this contract, not on page
components.

## Slots

The current module engine uses four slots:

- `inline_editor`
  For true in-place editors such as book intro, chapter intro, verse notes, and
  safe text-block editing.
- `sheet_editor`
  For the existing sheet fallback when a structure is still too rich for the
  inline path.
- `insert_control`
  For add-block controls at valid start, between, and bottom insertion points.
- `block_actions`
  For local block operations such as reorder, drag reorder, duplicate, delete,
  and full edit.

## Registry And Qualification

`module-registry.ts` is the central list of reusable admin modules. Modules are
grouped by domain (`books`, `chapters`, `verses`, `blocks`) and then composed
into one deterministic registry.

`qualify-module.ts` attaches a module only when the surface passes all relevant
checks:

- entity scope
- slot
- region scope
- block type
- required capabilities

This means a future page can inherit existing editor behavior by exposing the
same valid surface metadata rather than by manually wiring buttons and editors.

## Surface Model

`ScriptureAdminSurface` is the shared wrapper used to attach admin controls to a
specific public-page region or block.

The surface does not own editing state. It only renders:

- the local `Edit` action
- the local `Full edit` fallback
- optional block management actions
- active editing state
- brief local feedback such as `Saved` or `Block added`

The page-level session hooks decide what is editable, what stays inline, what
falls back to a sheet, and which actions are safe for a given block.

The module host does not replace `ScriptureAdminSurface`. The surface still
owns visible wrapper behavior; the module host only resolves editor and
operation modules that belong inside that wrapper.

## Editing Lifecycle

The current lifecycle is:

1. View
   The public page renders published content plus optional admin payloads when
   admin visibility is enabled.
2. Edit
   The session hook opens either:
   - an inline editor for a safe text-first region or text block
   - a sheet editor for anything still considered structurally richer
3. Save or cancel
   Inline editors own local form state. `Save` keeps the editor open until the
   mutation succeeds. `Cancel` resets the local form and closes the session.
   For unsaved inline creates, `Discard` removes the temporary create UI.
4. Feedback
   After a successful save, create, reorder, duplicate, or delete, the session
   hook shows a short-lived local success badge on the affected region or
   section.

## Block Creation Flow

The current create flow is page-attached:

1. The editor chooses an insertion point on the page.
2. The editor chooses a block type.
3. The new block immediately enters its create state in that location.

Current behavior by block type:

- simple text blocks open the inline editor directly on the page
- more complex block types can still use the sheet fallback

This keeps creation visually attached to the content it affects while preserving
the existing backend mutation contracts.

## Block Management Rules

Block management is intentionally conservative on live public pages.

### Reorder

- Reorder uses the visible published sequence that the editor can currently see.
- `Move up` and `Move down` stay within the same region.
- Hidden, draft, or unsupported blocks do not become invisible reorder anchors.

### Duplicate

- Duplication is currently enabled only for the simple text blocks that already
  fit the inline model safely.
- The duplicate keeps region, body, and status.
- Titles receive a `Copy` suffix when a title exists.

### Delete

- Delete requires an explicit local confirmation.
- Deletion immediately removes the block and closes the ordering gap.
- There is currently no undo layer; the safe path is the confirmation step plus
  the existing `Full edit` fallback for deeper editorial work.

## Shared Files

- [AdminModuleHost.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/shared/AdminModuleHost.tsx)
  Resolves qualifying modules for a surface contract.
- [module-registry.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/shared/module-registry.ts)
  Central registry composed from grouped module folders.
- [module-types.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/shared/module-types.ts)
  Declares module scope, capabilities, and editor-component contracts.
- [surface-contracts.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/shared/surface-contracts.ts)
  Defines the stable host-readable surface metadata shape.
- [surface-builders.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/shared/surface-builders.ts)
  Shared builders that keep page-level surface wiring small and consistent.
- [qualify-module.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/shared/qualify-module.ts)
  Shared qualification rules for capability-driven module attachment.
- [scripture-admin-surface.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-admin-surface.tsx)
  Attaches the local admin shell to a region or block.
- [scripture-inline-region-editor.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-inline-region-editor.tsx)
  Shared inline frame for save/cancel/full-edit behavior.
- [scripture-content-blocks-section.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-content-blocks-section.tsx)
  Renders block sections, insertion points, inline create, and block-local actions.
- [surface-builders.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/modules/blocks/surface-builders.ts)
  Shared builders for insert-control and block-action module surfaces.
- [scripture-text-content-block-inline-editor.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-text-content-block-inline-editor.tsx)
  Inline editor for safe text block create/edit flows.
- [use-book-admin-edit-session.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/hooks/use-book-admin-edit-session.ts)
  Book public-page session orchestration.
- [use-chapter-admin-edit-session.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/hooks/use-chapter-admin-edit-session.ts)
  Chapter public-page session orchestration.
- [use-verse-admin-edit-session.ts](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/hooks/use-verse-admin-edit-session.ts)
  Verse public-page session orchestration.
- [RegisteredContentBlockOrdering.php](/c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/Admin/RegisteredContentBlockOrdering.php)
  Shared create/reorder/remove ordering rules.
- [VisibleContentBlockSequence.php](/c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/Admin/VisibleContentBlockSequence.php)
  Defines the visible sequence used for block move rules.
- [ContentBlockDuplicate.php](/c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/Admin/ContentBlockDuplicate.php)
  Shared duplication policy for live block management.

## Boundaries Before The Next CMS Phase

This system is intentionally not the final universal CMS.

Still deferred:

- nested block items
- richer structural block editing on the public page
- broader non-scripture admin scope reactivation
- canonical schema changes

The current goal is maintainable continuity: a clean, documented inline-first
editing foundation for books, chapters, and verses.
