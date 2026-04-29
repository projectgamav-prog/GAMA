# Super Conscious Admin Cleanup Audit

## Purpose

This audit keeps the project aligned with the two active editing architectures:

1. Super Conscious Admin
2. CMS admin

The canonical/public scripture rendering system remains normal product code. It
is not a third admin architecture.

## Frontend Classification

### `active_conscious_admin`

- `resources/js/admin/actions/*`
- `resources/js/admin/awareness/*`
- `resources/js/admin/conscious-full-edit/*`
- `resources/js/admin/schema/*`
- `resources/js/admin/core/AdminSchemaFieldDisplay.tsx`
- `resources/js/admin/core/AdminSchemaFieldSurface.tsx`
- `resources/js/admin/core/AdminSchemaFieldEditDialog.tsx`
- `resources/js/admin/core/AdminSurfaceActionMenu.tsx`
- `resources/js/admin/core/AdminFieldEditorRegistry.tsx`
- `resources/js/admin/core/AdminLayoutAnchors.tsx`
- `resources/js/admin/core/AdminControlPlacementResolver.ts`
- `resources/js/admin/surfaces/scripture/*/surface-resolvers.ts`
- schema-aware scripture display components under
  `resources/js/components/scripture/*`

### `active_cms_admin`

- `resources/js/admin/cms/*`

CMS module registries, live composer, workspace editors, adders, and CMS module
renderers are not old scripture admin. They remain active and separate.

### `transitional_type_or_metadata`

- `resources/js/admin/surfaces/*`
- `resources/js/admin/surfaces/scripture/chapters/surface-resolvers.ts`
- `resources/js/admin/surfaces/scripture/verses/surface-resolvers.ts`
- `resources/js/admin/surfaces/scripture/identity-surface-context.ts`

These files still build admin surface contracts used by intro/header descriptor
flows. They must not render controls or import legacy module UI.

Phase 3 moved the remaining chapter/verse integration helpers into the
scripture surface layer and removed their empty `*AdminModules` exports. They
are transitional metadata helpers, not visible admin UI.

### `obsolete_after_three_dot_menu`

- `resources/js/admin/core/AdminFieldIconControls.tsx`

This component belonged to the always-visible circular field icon cluster era.
The active schema-field control path now uses `AdminSurfaceActionMenu` and
`AdminSchemaFieldEditDialog`, so the unreferenced icon cluster was deleted.

### Import Graph Audit Notes

- `AdminEditableSurface` remains active as the same-layout quick-edit
  compatibility boundary for non-schema intro/content surfaces and as the
  wrapper used by `AdminSurfaceBoundary`.
- `AdminSurfaceBoundary` remains active for reusable intro/content-block
  renderers that receive surface contracts.
- `AdminQuickEditRegistry` remains active because both the schema field dialog
  and awareness diagnostics use the quick-edit adapter registry.
- `AdminControlPlacementResolver` remains active for the three-dot menu and
  field anchor placement.
- `AdminOverlayActionButton`, `AdminOverlayControlStrip`, and
  `AdminOverlayEditFooter` remain transitional for non-schema same-layout
  quick-edit surfaces. They should not be expanded for new schema-field UI.

### `legacy_visible_admin_ui`

Removed in this phase:

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

Removed in Phase 2B:

- `resources/js/pages/scripture/books/full-edit.tsx`
- `resources/js/pages/scripture/chapters/full-edit.tsx`
- `resources/js/pages/scripture/chapters/verses/full-edit.tsx`
- old content-block/media/editor card components used only by those pages
- old row-admin no-op components
- old inline admin sheet/region editor components
- old awareness current-control comparison provider/hooks/types
- `resources/js/admin/core/AdminFieldIconControls.tsx`
- `resources/js/admin/integrations/scripture/*` after the remaining live
  helpers were moved into `resources/js/admin/surfaces/scripture/*`

### `dead_safe_to_remove`

The removed files above had no live public/CMS/Conscious imports after the
previous quarantine phase. The CMS module registry is separate and was not
removed.

### `uncertain_needs_review`

- `resources/js/pages/scripture/books/canonical-edit.tsx` remains a protected
  legacy workflow because `BookCanonicalEditController` still renders it.
- some backend route-specific write endpoints remain as transitional service
  endpoints. Do not delete them until Conscious backend services fully replace
  them.

## Backend Classification

### `conscious_active`

- `Admin\ConsciousFullEditController`
- `Admin\ConsciousSchemaFieldUpdateController`
- `app/Admin/Conscious/Schema/*`
- `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`
- `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`

### `cms_active`

- CMS controllers/routes in `routes/cms.php`
- Navigation admin in `routes/navigation.php`

These are intentionally separate from Super Conscious scripture admin cleanup.

### `transitional_write_endpoint`

Keep until Conscious actions replace them:

- `BookAdminIdentityController`
- `BookAdminDetailsController`
- `BookSectionAdminDetailsController`
- `ChapterAdminIdentityController`
- `ChapterSectionAdminDetailsController`
- `VerseAdminIdentityController`
- `VerseAdminMetaController`
- `VerseAdminTranslationController`
- `VerseAdminCommentaryController`
- `BookAdminMediaAssignmentController`
- `BookAdminContentBlockController`
- `BookSectionAdminContentBlockController`
- `ChapterAdminContentBlockController`
- `ChapterSectionAdminContentBlockController`
- `VerseAdminContentBlockController`
- matching request classes under `app/Http/Requests/Scripture/*Admin*`

These remain as backend service endpoints only. They should migrate into
`FieldUpdateService`, `EntityWriteService`, or registered Conscious actions
before deletion.

### `old_full_edit_redirect_only`

- `BookFullEditController`
- `ChapterFullEditController`
- `VerseFullEditController`

These controllers now redirect old GET full-edit routes to Conscious Full Edit
for the mapped schema entity.

### `replace_with_conscious_action`

- `BookAdminCreateController`
- `BookAdminDeleteController`
- `BookSectionAdminCreateController`
- `BookSectionAdminDeleteController`
- `ChapterAdminCreateController`
- `ChapterAdminDeleteController`
- `ChapterSectionAdminCreateController`
- `ChapterSectionAdminDeleteController`
- `VerseAdminCreateController`
- `VerseAdminDeleteController`

Create/delete/reparent/reorder work should move to registered Conscious actions
with protected canonical policy.

### `replace_with_conscious_service`

- route-specific identity/details request classes that validate multi-field
  payloads
- route context helpers under `App\Support\Scripture\Admin`
- content-block move/duplicate helpers currently owned by legacy controllers

These are still useful behavior, but their final home should be Conscious
services and policies rather than page-family controllers.

### `uncertain`

- topic and character postponed admin routes/controllers
- route-specific protected canonical edit screens

Keep stable until topic/character schema awareness or protected canonical
workflows are designed.

## Guardrail

Public scripture pages and reusable scripture renderers must not import old
legacy admin module UI. They must use Conscious schema surfaces, the Conscious
action registry/resolver, Conscious Full Edit, and CMS only where CMS is the
actual architecture.

## Remaining Cleanup List

1. Move Conscious Full Edit saves to the generic field route where field policy
   permits it.
2. Replace route-specific write controllers with Conscious field/action
   services.
3. Move content block, media, relation, translation, and commentary writes into
   schema/action services.
4. Add backend action registry support before exposing create/delete/reorder.
5. Re-audit topic/character postponed admin routes when those schemas become
   active.
