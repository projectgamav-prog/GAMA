# Conscious Admin Full Edit

## Purpose

Conscious Full Edit is the new schema-aware replacement path for awareness-owned Full Edit controls.

Inline quick edit edits one safe field in the same visual place. Conscious Full Edit edits the wider entity record through schema-aware field categories. It must be schema-aware, not page-aware.

## Current Foundation

The first route is:

`/admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`

The initial supported scripture entities are:

- `book`
- `book_section`
- `chapter`
- `chapter_section`
- `verse`
- `content_block`

Book, book section, chapter, chapter section, and verse use existing update routes where those routes are already safe. Content blocks currently open in the shell with read-only fields when parent-aware save routes are not available.

## Field Categories

Fields are grouped by schema meaning:

- Basic Content
- Canonical Identity
- Structure & Parentage
- Ordering
- Publishing / Visibility
- Media
- Relations
- Support Data
- Advanced / Technical

## Protected Canonical Fields

Protected fields may be visible in Conscious Full Edit, but they are not casual quick-edit fields.

Protected examples:

- slug
- canonical number
- canonical order
- parent relation
- structural path fields

These fields should route to explicit advanced identity workflows later. They should not appear in inline quick edit and should not be mixed into the field-level public reading flow.

## Old Full Edit Deprecation

Old route-specific Full Edit pages remain in the codebase as deprecated fallback tooling. New awareness-owned schema field controls should prefer Conscious Full Edit when a supported schema entity is available. If Conscious Full Edit is unavailable, the control should hide or disable rather than sending editors into a fragile old path.

## Roadmap

1. Keep quick edit stable for safe individual fields.
2. Expand Conscious Full Edit schema modules by entity, not by page.
3. Move protected identity editing into explicit schema-aware advanced sections.
4. Connect parent-aware content-block save routes safely.
5. Keep old Full Edit pages as fallback until each entity family is replaced.
