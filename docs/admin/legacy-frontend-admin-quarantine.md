# Legacy Frontend Admin Quarantine

## Purpose

The old public-page React admin module UI is quarantined. Conscious Admin is now
the only active public scripture admin UI path.

This is a frontend architecture cleanup only. Backend write endpoints remain in
place while Conscious quick edit and Conscious Full Edit migrate off older
route-specific services.

## Active Conscious Admin

These areas are the active public-page admin path:

- `resources/js/admin/actions/*`
- `resources/js/admin/conscious-full-edit/*`
- `resources/js/admin/schema/fields/*`
- `resources/js/admin/schema/scripture/*`
- `resources/js/admin/core/AdminSchemaFieldDisplay.tsx`
- `resources/js/admin/core/AdminSchemaFieldSurface.tsx`
- `resources/js/admin/core/AdminSchemaFieldEditDialog.tsx`
- `resources/js/admin/core/AdminSurfaceActionMenu.tsx`
- `resources/js/admin/core/AdminFieldEditorRegistry.tsx`
- `resources/js/admin/core/AdminLayoutAnchors.tsx`
- the generic Conscious field update route used by schema-aware quick edit

Reusable public renderers should expose stored schema fields through these
components and helpers, not through legacy module hosts.

## Removed Legacy Visible UI

These old public-page module UI files have been removed after the public
scripture import graph no longer referenced them:

- `resources/js/admin/core/AdminModuleHost.tsx`
- `resources/js/admin/core/AdminModuleHostGroup.tsx`
- `resources/js/admin/core/AdminModuleActionRenderer.tsx`
- `resources/js/admin/core/module-registry.ts`
- `resources/js/admin/core/module-actions.ts`
- `resources/js/admin/core/module-types.ts`
- `resources/js/admin/core/qualify-module.ts`
- `resources/js/admin/core/semantic-action-labels.ts`
- `resources/js/admin/modules/*`
- `resources/js/admin/integrations/entity-actions.ts`
- `resources/js/admin/integrations/sections.ts`
- `resources/js/admin/integrations/scripture/books.ts`

This means the old public-page module UI no longer has an easy import path.

## Legacy Files Still Present

The following frontend files remain for transitional surface metadata, now under
the scripture surface layer rather than the removed old integration folder:

- `resources/js/admin/surfaces/scripture/chapters/surface-resolvers.ts`
- `resources/js/admin/surfaces/scripture/verses/surface-resolvers.ts`
- `resources/js/admin/surfaces/scripture/identity-surface-context.ts`

These are not the active public scripture admin UI. New public-page controls
must not be added through these files.

These scripture surface resolver files may still build surface contracts for
Conscious renderers, but they must not import old module UI.

## CMS Admin Is Separate

The CMS admin system is not part of this purge:

- `resources/js/admin/cms/*`

CMS workspace, live composer, module registry, adders, and CMS module editors
remain active where they are currently used. Do not classify CMS module code as
old scripture module UI.

## Transitional Write / Metadata Areas

These areas can remain while Conscious Admin migrates safely:

- old backend scripture update routes used by Conscious Full Edit or existing
  service flows
- surface builders under `resources/js/admin/surfaces/*`
- awareness contracts and providers under `resources/js/admin/awareness/*`
- schema field metadata and action registry definitions

Keeping a backend endpoint does not mean the old visible React module UI is
active. Treat retained endpoints as service/write seams until Conscious backend
services replace them.

## Old Full Edit Route Safety

The old route-specific full-edit controllers now redirect to Conscious Full
Edit where the schema/entity mapping is known:

- `BookFullEditController` -> `admin.schema.full-edit` for `scripture.book`
- `ChapterFullEditController` -> `admin.schema.full-edit` for
  `scripture.chapter`
- `VerseFullEditController` -> `admin.schema.full-edit` for `scripture.verse`

The old React full-edit pages may remain in the source tree during the
transition, but the old GET routes no longer render them as the primary full
edit path.

Phase 2B removed the old book/chapter/verse route-specific Full Edit React pages
after their GET controllers were redirected to Conscious Full Edit. The
book canonical edit page remains because it is still rendered by the protected
canonical edit controller.

Old editor/card components used only by the removed Full Edit pages were also
deleted. This includes old content-block/media editor cards, old row-admin
shims, old verse identity/meta cards, and old inline admin sheet/region editor
components.

Phase 3 removed the dead `AdminFieldIconControls` circular icon cluster because
schema-field controls now use the three-dot action menu. The remaining
`AdminOverlay*` helpers are transitional support for non-schema same-layout
quick-edit surfaces and should not be used for new schema-field controls.

## Guardrail

Public scripture pages and reusable scripture renderers must not introduce new
imports of the legacy module UI. They should use:

- `AdminSchemaFieldDisplay`
- `AdminSchemaFieldSurface`
- `AdminSurfaceActionMenu`
- Conscious action registry / resolver
- Conscious Full Edit
- schema-aware renderer coverage helpers

No public scripture renderer should add controls by URL, route name, page
family, or old module launcher.

## Future Deletion Checklist

Before deleting legacy frontend module files entirely:

1. Confirm translations, commentaries, media, relation, add, delete, and reorder
   paths have Conscious Admin replacements or are intentionally unsupported.
2. Confirm protected canonical maintenance screens no longer depend on old
   module editor components.
3. Confirm Conscious Full Edit no longer depends on old route-specific form
   logic.
4. Run typecheck, build, and browser validation across active public scripture
   admin surfaces.
