# Legacy Admin Removal

The visible legacy admin module layer is now deprecated and quarantined on
public scripture surfaces. The active public-page admin direction is the Super
Conscious Admin Layer:

- schema-aware field quick edit
- awareness-owned field icon controls
- Conscious Full Edit
- admin layout anchors
- schema field registry definitions

## Disabled Visible Layer

The old public-page module UI is no longer rendered:

- `AdminModuleHost`
- `AdminModuleHostGroup` through `AdminModuleHost`
- old black diagnostic module launchers
- old inline structured module panels launched from public scripture surfaces
- fallback local `AdminEditableSurface` controls when awareness ownership is not
  ready

`AdminModuleHost` and `AdminModuleHostGroup` are now explicit no-op
compatibility shims. They return `null` immediately and intentionally do not
import the old module registry, action resolver, action renderer, inline editor
panels, or current-control comparison hooks.

Some old module files are not deleted yet because their contracts, routes, and
write endpoints still help bridge existing data and protected maintenance
tooling.

The current frontend audit still finds imports/usages of the legacy host in
some reusable scripture support components:

- verse support sections for translations, commentaries, and study notes
- scripture section/group wrappers
- chapter/verse row admin helpers
- book/chapter list helpers
- protected full-edit pages
- book public media fallback components

These are classified as legacy visible UI traces. They may remain temporarily
where they describe old structured-editor seams or backend service
dependencies, but they now flow into no-op host shims and must not render
visible public controls in normal admin mode.

The book library grid no longer imports or renders `AdminModuleHost` for the old
book-card intro surface. Book card title and description now use the Conscious
schema field display path instead.

## Endpoints Kept

Backend update endpoints remain in place when the conscious admin layer still
uses them for quick edit or Full Edit saves. These endpoints should be treated
as service/write endpoints during the migration, not as proof that the old
visible module UI remains active.

## Active Public Admin Path

Visible public scripture admin controls should now come from:

- `AdminSchemaFieldSurface`
- `AdminSchemaFieldDisplay`
- `AdminSurfaceActionMenu`
- schema-field edit dialogs
- Conscious Full Edit route:
  `/admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`

## Still To Migrate Later

- structured editors for translations, commentaries, media, and relations
- create/add flows
- reorder controls
- delete controls
- any remaining protected canonical maintenance screens

Those systems should migrate through awareness contracts, schema metadata,
resolver rules, and layout anchors instead of reviving page-local module
launchers.

See `docs/admin/legacy-frontend-admin-quarantine.md` for the current file
classification, quarantine boundary, CMS separation note, and future deletion
checklist.
