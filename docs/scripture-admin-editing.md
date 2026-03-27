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

- [scripture-admin-surface.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-admin-surface.tsx)
  Attaches the local admin shell to a region or block.
- [scripture-inline-region-editor.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-inline-region-editor.tsx)
  Shared inline frame for save/cancel/full-edit behavior.
- [scripture-content-blocks-section.tsx](/c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/components/scripture/scripture-content-blocks-section.tsx)
  Renders block sections, insertion points, inline create, and block-local actions.
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
