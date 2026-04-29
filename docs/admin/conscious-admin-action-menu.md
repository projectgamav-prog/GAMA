# Conscious Admin Action Menu

The Conscious Admin action menu is the active visible control pattern for
schema-aware public surfaces.

## Rule

Each editable field/card/block surface should expose one compact local action
menu instead of multiple always-visible action icons.

The menu belongs to the rendered surface itself. It must be driven by
schema/awareness metadata and resolver-ready surface facts, not by route-page
JSX.

The menu trigger is always icon-only. Field labels, region names, and helper
labels such as `Intro` belong inside content or menu items, not on the trigger.

## Current Phase 1 Scope

Phase 1 applies to schema-aware field surfaces for the current safe scripture
fields:

- `books.title`
- `books.description`
- `book_sections.title`
- `chapters.title`
- `chapter_sections.title`
- `verses.text`

The menu currently exposes only actions that work through the Conscious Admin
path:

- `Edit`
- `Full Edit`

Unsupported actions are intentionally absent.

## Edit Flow

`Edit` opens a compact field dialog for the current schema-backed field.

The dialog:

- shows the human field label
- optionally shows a small schema diagnostic such as `verse.text`
- renders the field through the existing schema field editor adapter
- saves through the schema-aware quick-edit flow
- posts `{ value }` to the generic Conscious field update route for migrated
  safe fields
- closes after a successful save
- discards local edits on cancel

Protected fields such as slug, number, canonical ordering, parent relations,
media structures, relation metadata, and JSON/meta structures are not exposed in
this menu as quick-edit fields.

## Full Edit Flow

`Full Edit` opens:

`/admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`

The menu must not route new awareness-owned controls to deprecated old Full
Edit pages. If a Conscious Full Edit href is not available, the action should
not be shown.

## Future Actions

Future actions may be added only when their Conscious Admin path is real:

- delete
- add
- reorder
- manage media
- manage relations

Do not add fake menu actions ahead of working resolver/backend/editor support.
