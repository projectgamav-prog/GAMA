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

## Quarantined Legacy Visible UI

These old public-page module UI entry points are now no-op compatibility shims:

- `resources/js/admin/core/AdminModuleHost.tsx`
- `resources/js/admin/core/AdminModuleHostGroup.tsx`

They intentionally return `null` immediately and do not import the old module
registry, action resolver, action renderer, quick-edit adapter checks, current
control registration, or inline editor panels.

This means the old public-page module UI cannot render even if a reusable
scripture renderer still imports the host temporarily.

## Legacy Files Still Present

The following frontend files remain for migration context, old protected
tooling, or future deletion after all imports and service dependencies are
removed:

- `resources/js/admin/core/AdminModuleActionRenderer.tsx`
- `resources/js/admin/core/module-registry.ts`
- `resources/js/admin/core/module-actions.ts`
- `resources/js/admin/core/qualify-module.ts`
- `resources/js/admin/core/module-types.ts`
- `resources/js/admin/modules/books/*`
- `resources/js/admin/modules/chapters/*`
- `resources/js/admin/modules/sections/*`
- `resources/js/admin/modules/verses/*`
- `resources/js/admin/modules/entity-actions/*`
- `resources/js/admin/modules/intros/*`
- `resources/js/admin/integrations/scripture/*`
- `resources/js/admin/integrations/sections.ts`
- `resources/js/admin/integrations/entity-actions.ts`

These are not the active public scripture admin UI. New public-page controls
must not be added through these files.

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

1. Remove remaining `AdminModuleHost` / `AdminModuleHostGroup` imports from
   shared scripture renderers.
2. Confirm translations, commentaries, media, relation, add, delete, and reorder
   paths have Conscious Admin replacements or are intentionally unsupported.
3. Confirm protected canonical maintenance screens no longer depend on old
   module editor components.
4. Confirm Conscious Full Edit no longer depends on old route-specific form
   logic.
5. Run typecheck, build, and browser validation across active public scripture
   admin surfaces.
