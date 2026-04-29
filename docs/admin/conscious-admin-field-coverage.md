# Conscious Admin Field Coverage

This audit tracks schema-backed content by reusable renderer/component, not by
route or URL.

## Renderer Awareness Contract

When a reusable component renders database-backed schema content, it must choose
one explicit contract:

1. **Stored schema value**
   - The visible text is the same value stored in the database field.
   - The renderer should emit a schema-aware surface through
     `AdminSchemaFieldDisplay` / `AdminSchemaFieldSurface`.
   - Quick edit may attach only when the field registry marks the field safe.

2. **Computed schema display**
   - The visible text is derived, formatted, aliased, translated, or combined
     from schema data.
   - The renderer must not attach direct schema quick edit unless a safe
     explicit field mapping exists.

3. **Presentation-only label**
   - The visible text is hardcoded or editorial UI copy such as `Chapters`,
     `All Verses`, `Browse chapters`, `Intro`, or `Section 1`.
   - The renderer must not attach schema quick edit to this text.

Silent ambiguity is not allowed. Reusable renderers should use the shared
rendered-field helpers in `resources/js/admin/schema/fields/` when deciding
whether a visible value may own a schema surface.

## Active Field Coverage

| Field | Registry status | Displayed by reusable component | Emits schema-aware surface | Visible text equals stored value | Computed/presentation-only cases | Quick edit allowed | Full Edit available | Missing / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `books.title` | registered, quick-edit safe | `ScriptureBookTitleDisplay`; used by book hero and book library cards | yes, via `AdminSchemaFieldDisplay` | yes | none in this renderer | yes | yes when admin full edit href exists | Covered through reusable component; route pages should not render raw book title admin controls. |
| `books.description` | registered, quick-edit safe | `ScriptureBookDescriptionDisplay`; used by book hero and book library cards when description is visible | yes, via `AdminSchemaFieldDisplay` | yes | empty/missing descriptions render normal public fallback outside the field value | yes | yes when admin full edit href exists | Covered for visible stored descriptions. |
| `book_sections.title` | registered, quick-edit safe | `ScriptureBookSectionTitleDisplay` | yes only when stored title is visibly rendered | yes when attached | presentation labels such as `Chapters` must stay outside this field surface | yes when stored title is shown | yes through Conscious Full Edit when available | Covered by guard; missing controls indicate renderer is showing presentation copy instead of the stored title. |
| `chapters.title` | registered, quick-edit safe | `ScriptureChapterTitleDisplay` | yes, via `AdminSchemaFieldDisplay` | yes | none in this renderer | yes | yes when admin full edit href exists | Covered in reusable chapter title component. |
| `chapter_sections.title` | registered, quick-edit safe | `ScriptureChapterSectionTitleDisplay` | yes only when stored title is visibly rendered | yes when attached | presentation labels such as `All Verses` or `Verse List` must stay outside this field surface | yes when stored title is shown | yes through Conscious Full Edit when available | Covered by guard; missing controls indicate renderer is showing presentation copy instead of the stored title. |
| `verses.text` | registered, quick-edit safe | `ScriptureVerseTextDisplay` | yes, via `AdminSchemaFieldDisplay` | yes | none in this renderer | yes | yes when admin full edit href exists | Covered for verse detail hero text and verse reader rows that use this component. |
| `content_blocks.title` | registered frontend, quick-edit safe in concept | `ContentBlockRenderer` | yes, via `AdminSchemaFieldDisplay` when a block title is rendered and update context exists | yes | media/type badges are presentation-only and not field surfaces | conditionally; backend generic route is not ready for content blocks | Conscious Full Edit is read-only first slice today | Needs parent-aware Conscious block backend before broad menu enablement. |
| `content_blocks.body` | registered frontend, quick-edit safe in concept | `ContentBlockRenderer` | yes, via `AdminSchemaFieldDisplay` when body text is rendered and update context exists | yes | image captions from block data JSON may be presentation/media metadata, not `content_blocks.body` unless explicitly mapped | conditionally; backend generic route is not ready for content blocks | Conscious Full Edit is read-only first slice today | Needs parent-aware Conscious block backend before broad menu enablement. |

## Current Renderer Coverage Summary

Covered reusable renderers:

- `ScriptureBookTitleDisplay`
- `ScriptureBookDescriptionDisplay`
- `ScriptureBookLibraryGrid` / `ScriptureBookLibraryCard` through the shared
  book title and description display components
- `ScriptureChapterTitleDisplay`
- `ScriptureBookSectionTitleDisplay`
- `ScriptureChapterSectionTitleDisplay`
- `ScriptureVerseTextDisplay`
- `ContentBlockRenderer` for block title/body when update metadata exists

Presentation-only or computed labels must remain outside schema quick edit:

- `Chapters`
- `All Verses`
- `Verse List`
- `Browse chapters`
- `Intro`
- `Section 1`
- block type badges such as `Text`, `Quote`, `Image`, `Video`
- region badges and helper labels

## Known Gaps

- Some public scripture renderers still import legacy `AdminModuleHost`, but the
  host is now a quarantined no-op compatibility shim. It returns `null`
  immediately and does not import legacy module/action/rendering machinery.
  Those imports should still be removed later through reusable Conscious
  renderer coverage, not page-specific controls.
- Content block title/body fields have frontend renderer coverage but need a
  parent-aware Conscious backend route/action before they should be considered
  ready in the public three-dot menu.
- Presentation labels can still appear near schema values; they must remain
  visually separate and non-editable.
- Future renderers for translations, commentaries, media assignments, verse
  meta, topics, and characters need their own schema field coverage audits
  before controls are enabled.
- Full Edit field save behavior is not yet fully migrated to the generic field
  route.

## Modal/Menu Stability Rule

The field edit modal is shared architecture. Close/cancel must never navigate,
must not call `router.visit`, and must not trigger parent card/link click
handlers. Full Edit navigation may happen only from an intentional Full Edit
menu selection.
