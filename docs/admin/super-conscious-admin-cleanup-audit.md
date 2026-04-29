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
- schema-aware scripture display components under
  `resources/js/components/scripture/*`

### `active_cms_admin`

- `resources/js/admin/cms/*`

CMS module registries, live composer, workspace editors, adders, and CMS module
renderers are not old scripture admin. They remain active and separate.

### `transitional_type_or_metadata`

- `resources/js/admin/surfaces/*`
- `resources/js/admin/integrations/scripture/chapters.ts`
- `resources/js/admin/integrations/scripture/verses.ts`
- `resources/js/admin/integrations/scripture/identity-surface-context.ts`

These files still build admin surface contracts used by intro/header descriptor
flows. They must not render controls or import legacy module UI.

Phase 2B retained the chapter and verse integration helpers because current
chapter/verse pages still pass intro surfaces into universal intro descriptor
flows. They are transitional metadata helpers, not visible admin UI.

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

1. Remove old route-specific full-edit React pages once old route names are no
   longer needed for redirects or protected maintenance.
2. Replace route-specific write controllers with Conscious field/action
   services.
3. Move content block, media, relation, translation, and commentary writes into
   schema/action services.
4. Add backend action registry support before exposing create/delete/reorder.
5. Re-audit topic/character postponed admin routes when those schemas become
   active.
