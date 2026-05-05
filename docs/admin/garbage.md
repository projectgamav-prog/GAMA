# Old Admin Garbage Inventory

## Purpose

This is the cleanup inventory for old, dead, transitional, and postponed admin
code now that the project has only two active editing architectures:

1. Super Conscious Admin
2. CMS architecture

CMS is separate and intentionally untouched. Public scripture rendering/domain
code is platform code, not a third admin architecture.

Do not delete anything from this list without a focused cleanup task, a fresh
import/reference audit, and verification.

Automation note: `docs/admin/super-conscious-awareness-automation.md` now locks
the rule that discovery and coverage reports may identify cleanup or awareness
gaps, but must not remove endpoints, add controls, or enable protected actions.

Backend foundation note: old route-specific admin controllers are temporary
behavior providers only. New architecture should replace them through
Conscious field services or policy-gated action services, then delete them only
after usage audits prove they are unused.

Big Patch 1 note: the Conscious action dispatcher and
`protected_identity.update` action now cover protected `slug`/`number` updates
for book, book section, chapter, chapter section, and verse Full Edit paths.
Old identity/details endpoints remain temporarily for fallback and
non-migrated flows, but are now partially replaceable later.

Big Patch 2 note: Conscious content-block actions now cover owner-scoped
`content_block.create`, `content_block.update`, and `content_block.delete` for
book, book section, chapter, chapter section, and verse owners. Old
content-block controllers remained temporarily for fallback, duplicate/reorder,
and non-migrated flows at that point; they were later deleted in Big Patch 5.

Big Patch 3 note: Conscious actions now cover content-block duplicate/reorder,
book media assignment attach/replace/update/detach, verse meta update,
translation create/update/delete, and commentary create/update/delete. Old
content-block, media assignment, verse meta, translation, and commentary
controllers remained temporarily for non-migrated flows at that point; they
were later deleted in Big Patch 5. Media/translation/commentary reorder remain
disabled placeholders.

Big Patch 4 note: visible Full Edit links and scripture admin save/action
metadata now prefer the Conscious route family where replacements exist.
Old identity/details update routes, redirect-only book/chapter/verse Full Edit
routes, and their controller/request classes were deleted after a reference
audit showed app payloads no longer needed them. Content-block, media,
verse-support, canonical create/delete, protected canonical edit, and
topic/character postponed routes remain.

Big Patch 5 note: remaining content-block move metadata now uses the Conscious
`content_block.reorder` action with route-owner context. A fresh reference audit
found no app/runtime references to the old content-block, book media assignment,
or verse-support submit routes after generated helper exclusions. Those old
route groups, controllers, and route-specific request classes were deleted.
Canonical create/delete, protected book canonical edit, admin-context
visibility, and postponed topic/character placeholder routes remain.

## Status Legend

- `active_conscious_keep`: active Super Conscious Admin code.
- `active_cms_keep`: active CMS architecture; not old scripture admin garbage.
- `transitional_keep_until_replaced`: still used or useful until a Conscious
  replacement exists.
- `redirect_only_legacy`: old route exists only to redirect to Conscious Admin.
- `protected_legacy_workflow`: old protected workflow still reachable.
- `dead_safe_to_delete`: no current imports/references found; delete in a
  cleanup-only pass.
- `stale_doc_update_needed`: documentation still teaches or references removed
  architecture.
- `postponed_extension_placeholder`: placeholder for future schema/domain work.
- `uncertain_needs_manual_review`: do not remove without product/runtime review.

## Summary

### 1. Safe To Delete Now

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None currently. | frontend | `dead_safe_to_delete` | Phase 1 deleted the only file previously listed here. | N/A | Re-run import/reference audit before adding anything here. | Future garbage cleanup pass. | N/A | N/A |

### Deleted In Garbage Cleanup Phase 1

| Path | Layer | Previous status | Reason | Replacement target |
| --- | --- | --- | --- | --- |
| `resources/js/components/scripture/verse/VerseFullEditIntroCard.tsx` | frontend | `dead_safe_to_delete` | Old route-specific verse Full Edit intro card; no imports/references remained. | Conscious Full Edit shell intro/summary components. |

### Deleted In Backend Consolidation Big Patch 4

| Path/route | Layer | Previous status | Reason | Replacement target |
| --- | --- | --- | --- | --- |
| `app/Http/Controllers/Scripture/BookAdminIdentityController.php` | backend | `transitional_keep_until_replaced` | Book title saves now emit the Conscious field route; slug/number are policy-gated by `protected_identity.update`. | `PATCH /admin/schema/scripture/book/{id}/fields/title`; `protected_identity.update`. |
| `app/Http/Controllers/Scripture/BookAdminDetailsController.php` | backend | `transitional_keep_until_replaced` | Book description saves now emit the Conscious field route. | `PATCH /admin/schema/scripture/book/{id}/fields/description`. |
| `app/Http/Controllers/Scripture/BookSectionAdminDetailsController.php` | backend | `transitional_keep_until_replaced` | Book section title saves now emit the Conscious field route. | `PATCH /admin/schema/scripture/book_section/{id}/fields/title`. |
| `app/Http/Controllers/Scripture/ChapterAdminIdentityController.php` | backend | `transitional_keep_until_replaced` | Chapter title saves now emit the Conscious field route; slug/number are policy-gated by `protected_identity.update`. | `PATCH /admin/schema/scripture/chapter/{id}/fields/title`; `protected_identity.update`. |
| `app/Http/Controllers/Scripture/ChapterSectionAdminDetailsController.php` | backend | `transitional_keep_until_replaced` | Chapter section title saves now emit the Conscious field route. | `PATCH /admin/schema/scripture/chapter_section/{id}/fields/title`. |
| `app/Http/Controllers/Scripture/VerseAdminIdentityController.php` | backend | `transitional_keep_until_replaced` | Verse text saves now emit the Conscious field route; slug/number are policy-gated by `protected_identity.update`. | `PATCH /admin/schema/scripture/verse/{id}/fields/text`; `protected_identity.update`. |
| `app/Http/Controllers/Scripture/BookFullEditController.php` | backend | `redirect_only_legacy` | App payloads now link directly to Conscious Full Edit. | `GET /admin/schema/scripture/book/{id}/full-edit`. |
| `app/Http/Controllers/Scripture/ChapterFullEditController.php` | backend | `redirect_only_legacy` | App payloads now link directly to Conscious Full Edit. | `GET /admin/schema/scripture/chapter/{id}/full-edit`. |
| `app/Http/Controllers/Scripture/VerseFullEditController.php` | backend | `redirect_only_legacy` | App payloads now link directly to Conscious Full Edit. | `GET /admin/schema/scripture/verse/{id}/full-edit`. |
| `app/Http/Requests/Scripture/*IdentityUpdateRequest.php` / `*DetailsUpdateRequest.php` for the deleted controllers | requests | `transitional_keep_until_replaced` | Old route-specific validation moved to Conscious field/action policies. | Conscious field registry, `ConsciousFieldUpdateService`, `ConsciousProtectedIdentityPolicy`. |
| `scripture.*.admin.identity.update`, `scripture.*.admin.details.update`, old book/chapter/verse `*.admin.full-edit` routes | routes | `transitional_keep_until_replaced` / `redirect_only_legacy` | Route metadata no longer emits these names and replacements exist. | Conscious field/full-edit/action route family. |

### Deleted In Backend Consolidation Big Patch 5

| Path/route | Layer | Previous status | Reason | Replacement target |
| --- | --- | --- | --- | --- |
| `app/Http/Controllers/Scripture/*AdminContentBlockController.php` | backend | `transitional_keep_until_replaced` | Content-block create/update/delete/duplicate/reorder submit metadata now uses the Conscious action route. | `content_block.*` Conscious actions. |
| `app/Http/Controllers/Scripture/BookAdminMediaAssignmentController.php` | backend | `transitional_keep_until_replaced` | Book media attach/replace/update/detach metadata now uses Conscious actions. | `media_assignment.attach/replace/update/detach`. |
| `app/Http/Controllers/Scripture/VerseAdminMetaController.php` | backend | `transitional_keep_until_replaced` | Verse meta save metadata now uses the Conscious action route. | `verse_support.meta.update`. |
| `app/Http/Controllers/Scripture/VerseAdminTranslationController.php` | backend | `transitional_keep_until_replaced` | Verse translation create/update/delete metadata now uses Conscious actions. | `verse_support.translation.create/update/delete`. |
| `app/Http/Controllers/Scripture/VerseAdminCommentaryController.php` | backend | `transitional_keep_until_replaced` | Verse commentary create/update/delete metadata now uses Conscious actions. | `verse_support.commentary.create/update/delete`. |
| `app/Http/Requests/Scripture/*ContentBlock*Request.php` old content-block request family | requests | `transitional_keep_until_replaced` / `uncertain_needs_manual_review` | Only referenced by deleted content-block controllers after audit. | `ContentBlockAction` validation and `ConsciousContentBlockPolicy`. |
| `app/Http/Requests/Scripture/BookAdminMediaAssignment*Request.php` | requests | `transitional_keep_until_replaced` | Only referenced by deleted media controller after audit. | `MediaAssignmentAction` validation and `ConsciousMediaAssignmentPolicy`. |
| `app/Http/Requests/Scripture/VerseAdminMetaUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Only referenced by deleted verse meta controller after audit. | `VerseMetaAction` validation and `ConsciousVerseSupportPolicy`. |
| `app/Http/Requests/Scripture/VerseTranslation*Request.php` | requests | `transitional_keep_until_replaced` | Only referenced by deleted translation controller after audit. | `VerseTranslationAction` validation and `ConsciousVerseSupportPolicy`. |
| `app/Http/Requests/Scripture/VerseCommentary*Request.php` | requests | `transitional_keep_until_replaced` | Only referenced by deleted commentary controller after audit. | `VerseCommentaryAction` validation and `ConsciousVerseSupportPolicy`. |
| `scripture.*.admin.content-blocks.*`, `scripture.books.admin.media-assignments.*`, `scripture.chapters.verses.admin.meta.update`, `scripture.chapters.verses.admin.translations.*`, `scripture.chapters.verses.admin.commentaries.*` | routes | `transitional_keep_until_replaced` | No app/runtime references remained and Conscious replacements exist. | Final schema action route family. |

### 2. Keep Until Conscious Replacement Exists

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `resources/js/admin/core/AdminEditableSurface.tsx` | frontend | `transitional_keep_until_replaced` | Still wraps non-schema same-layout quick-edit surfaces and keeps old intro/content quick edit stable. | `AdminSurfaceBoundary`; awareness ownership gate. | Remove only after intro/content block quick edit moves fully into schema/action surfaces or is intentionally retired. | Later frontend simplification. | Medium; intro/content quick edit could disappear. | `AdminSchemaFieldSurface`, `AdminSurfaceActionMenu`, schema/content action registry. |
| `resources/js/admin/core/AdminSurfaceBoundary.tsx` | frontend | `transitional_keep_until_replaced` | Used by reusable intro/content-block renderers to apply surface contracts. | `ScriptureIntroBlock`, `ContentBlockRenderer`, `AdminFieldQuickEditSurface`. | Remove only after these renderers emit/schema-wrap fields directly. | Renderer coverage completion. | Medium; intro/block admin surfaces may stop wrapping. | Schema-aware field/content surface components. |
| `resources/js/admin/core/AdminOverlayActionButton.tsx` | frontend | `transitional_keep_until_replaced` | Still used by non-schema quick-edit footer/strip. | `AdminEditableSurface`, `AdminOverlayEditFooter`. | Delete after `AdminOverlayControlStrip` and `AdminOverlayEditFooter` are removed. | Post same-layout transition cleanup. | Medium for non-schema same-layout quick edit. | `AdminSurfaceActionMenu`, dialog/footer buttons. |
| `resources/js/admin/core/AdminOverlayControlStrip.tsx` | frontend | `transitional_keep_until_replaced` | Old awareness-owned strip for non-schema quick edit. | `AdminEditableSurface`. | Delete after non-schema strip path is migrated or retired. | Post same-layout transition cleanup. | Medium. | Three-dot menu or schema/content action menus. |
| `resources/js/admin/core/AdminOverlayEditFooter.tsx` | frontend | `transitional_keep_until_replaced` | Old same-layout edit footer for non-schema quick edit. | `AdminEditableSurface`. | Delete after non-schema same-layout editing uses dialog/menu or schema field dialog. | Post same-layout transition cleanup. | Medium. | `AdminSchemaFieldEditDialog` or shared Conscious modal footer. |
| `resources/js/admin/core/AdminQuickEditRegistry.tsx` | frontend | `active_conscious_keep` | Active adapter registry for quick edit payload/rendering. | `AdminSchemaFieldEditDialog`, awareness diagnostics, ownership gate. | Not deletion target. | None. | High. | Keep; may later become `AdminFieldEditorRegistry`/service split. |
| `resources/js/admin/core/AdminControlPlacementResolver.ts` | frontend | `active_conscious_keep` | Active menu/anchor placement resolver. | `AdminSurfaceActionMenu`, schema placement helpers. | Not deletion target. | None. | High. | Keep. |
| `resources/js/admin/awareness/core/AdminResolvedControlsProvider.tsx` | frontend | `active_conscious_keep` | Active resolver output provider/diagnostics. | Mounted by `AdminAwarenessProvider`. | Not deletion target. | None. | Medium/high. | Keep until resolver ownership design changes. |
| `resources/js/admin/awareness/core/AdminControlResolver.ts` | frontend | `active_conscious_keep` | Active shadow/control resolver. | `AdminResolvedControlsProvider`, exports. | Not deletion target. | None. | Medium/high. | Keep. |
| `resources/js/admin/awareness/core/AdminOrderingManifestProvider.tsx` | frontend | `active_conscious_keep` | Active shadow ordering/add-anchor manifest. | Mounted by `AdminAwarenessProvider`; hooks. | Not deletion target. | None. | Medium. | Keep for future add/reorder work. |
| `resources/js/admin/awareness/core/useRegisterAdminAddAnchor.ts` | frontend | `active_conscious_keep` | Active shadow add-anchor hook. | Exported for reusable renderers. | Not deletion target. | None. | Low/medium. | Keep until add-anchor architecture changes. |
| `resources/js/admin/awareness/core/useRegisterAdminOrderGroup.ts` | frontend | `active_conscious_keep` | Active shadow order-group hook. | Exported for reusable renderers. | Not deletion target. | None. | Low/medium. | Keep until ordering architecture changes. |
| `resources/js/admin/surfaces/scripture/chapters/surface-resolvers.ts` | frontend | `transitional_keep_until_replaced` | Builds chapter header/intro/action surfaces; moved out of old integration path. | `resources/js/pages/scripture/chapters/show.tsx`. | Replace with renderer-owned schema/content surface emission. | Renderer surface coverage phase. | Medium; chapter intro/header metadata may disappear. | Renderer-level schema/content surface contracts. |
| `resources/js/admin/surfaces/scripture/verses/surface-resolvers.ts` | frontend | `transitional_keep_until_replaced` | Builds verse header/intro/meta/relation/text surfaces; moved out of old integration path. | `resources/js/pages/scripture/chapters/verses/show.tsx`; verse row helpers may use exported functions later. | Replace with renderer-owned schema/content/relation surface emission. | Renderer surface coverage phase. | Medium/high; verse text/support surfaces may lose metadata. | Renderer-level schema/content/relation surface contracts. |
| `resources/js/admin/surfaces/scripture/identity-surface-context.ts` | frontend | `transitional_keep_until_replaced` | Typed row/page context metadata for chapter/verse identity surfaces. | Chapter/verse surface resolvers. | Remove after identity/advanced workflows move to schema action metadata. | Protected identity workflow phase. | Medium. | Conscious protected identity action metadata. |
| `resources/js/pages/scripture/books/canonical-edit.tsx` | frontend | `protected_legacy_workflow` | Still rendered by protected canonical edit controller. | `BookCanonicalEditController`; route `scripture.books.admin.canonical-edit`. | Delete after a Conscious protected-canonical workflow replaces it. | Protected canonical migration. | High; current protected book canonical workflow would break. | Conscious protected canonical workflow/full edit category. |
| `resources/js/components/scripture/scripture-admin-field-meta.tsx` | frontend | `protected_legacy_workflow` | Helper used by canonical edit page. | `books/canonical-edit.tsx`. | Delete with canonical edit page. | Protected canonical migration. | Medium. | Conscious Full Edit protected field metadata component. |
| `resources/js/components/scripture/scripture-admin-method-family-grid.tsx` | frontend | `protected_legacy_workflow` | Helper used by canonical edit page. | `books/canonical-edit.tsx`. | Delete with canonical edit page. | Protected canonical migration. | Medium. | Conscious Full Edit protected workflow explanation. |

### 3. Backend Endpoints Still Used Or Kept

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `app/Http/Controllers/Admin/ConsciousFullEditController.php` | backend | `active_conscious_keep` | Active Conscious Full Edit read path. | `routes/web.php`. | Not deletion target. | None. | High. | Keep; extract payload builder later. |
| `app/Http/Controllers/Admin/ConsciousSchemaFieldUpdateController.php` | backend | `active_conscious_keep` | Active generic safe field update route. | `routes/web.php`. | Not deletion target. | None. | High. | Keep; delegate to service later. |
| `app/Admin/Conscious/Schema/*` | backend | `active_conscious_keep` | Active backend schema field registry, resolver, and protected policy. | Conscious controllers. | Not deletion target. | None. | High. | Keep; expand into final structure. |
| `routes/web.php` admin schema group | routes | `active_conscious_keep` | Owns active Conscious Full Edit and field update routes. | Runtime routes. | Not deletion target. | None. | High. | Keep. |
| `app/Http/Controllers/Scripture/BookAdminCreateController.php` | backend | `transitional_keep_until_replaced` | Old canonical create endpoint. | `routes/scripture.php`. | Remove after Conscious create action exists. | Create action migration. | Medium/high. | `CreateChildAction`. |
| `app/Http/Controllers/Scripture/BookAdminDeleteController.php` | backend | `transitional_keep_until_replaced` | Old destructive delete endpoint. | `routes/scripture.php`. | Remove after Conscious delete action with policy/confirmation exists. | Delete action migration. | Medium/high. | `DeleteEntityAction`. |
| `app/Http/Controllers/Scripture/BookSectionAdminCreateController.php` | backend | `transitional_keep_until_replaced` | Old add book section endpoint. | `routes/scripture.php`. | Remove after Conscious add-child action exists. | Create action migration. | Medium. | `CreateChildAction`. |
| `app/Http/Controllers/Scripture/BookSectionAdminDeleteController.php` | backend | `transitional_keep_until_replaced` | Old delete book section endpoint. | `routes/scripture.php`. | Remove after Conscious delete/reparent policy exists. | Delete action migration. | Medium/high. | `DeleteEntityAction`. |
| `app/Http/Controllers/Scripture/ChapterAdminCreateController.php` | backend | `transitional_keep_until_replaced` | Old add chapter endpoint. | `routes/scripture.php`. | Remove after Conscious add-child action exists. | Create action migration. | Medium. | `CreateChildAction`. |
| `app/Http/Controllers/Scripture/ChapterAdminDeleteController.php` | backend | `transitional_keep_until_replaced` | Old delete chapter endpoint. | `routes/scripture.php`. | Remove after Conscious delete policy exists. | Delete action migration. | Medium/high. | `DeleteEntityAction`. |
| `app/Http/Controllers/Scripture/ChapterSectionAdminCreateController.php` | backend | `transitional_keep_until_replaced` | Old add chapter section endpoint. | `routes/scripture.php`. | Remove after Conscious add-child action exists. | Create action migration. | Medium. | `CreateChildAction`. |
| `app/Http/Controllers/Scripture/ChapterSectionAdminDeleteController.php` | backend | `transitional_keep_until_replaced` | Old delete chapter section endpoint. | `routes/scripture.php`. | Remove after Conscious delete policy exists. | Delete action migration. | Medium/high. | `DeleteEntityAction`. |
| `app/Http/Controllers/Scripture/VerseAdminCreateController.php` | backend | `transitional_keep_until_replaced` | Old add verse endpoint. | `routes/scripture.php`. | Remove after Conscious add-child verse action exists. | Create action migration. | Medium. | `CreateChildAction`. |
| `app/Http/Controllers/Scripture/VerseAdminDeleteController.php` | backend | `transitional_keep_until_replaced` | Old delete verse endpoint. | `routes/scripture.php`. | Remove after Conscious delete policy exists. | Delete action migration. | Medium/high. | `DeleteEntityAction`. |
| `app/Http/Controllers/Scripture/AdminContextVisibilityController.php` | backend | `active_conscious_keep` | Admin visibility/session toggle, not old content editing. | `routes/scripture.php`. | Not deletion target unless visibility system changes. | None. | Medium. | Keep or move under Conscious admin context later. |
| `app/Http/Controllers/Scripture/BookCanonicalEditController.php` | backend | `protected_legacy_workflow` | Still renders protected book canonical edit page. | `routes/scripture.php`; `BookAdminRouteContext`. | Delete after Conscious protected canonical workflow replaces it. | Protected canonical migration. | High. | Conscious protected canonical action/full edit category. |
| `app/Http/Controllers/Scripture/PostponedAdminSurfaceController.php` | backend | `postponed_extension_placeholder` | Topic/character admin routes abort 404 but preserve route names. | topic/character postponed admin routes. | Remove after topic/character Conscious schema decisions are made. | Topic/character schema planning. | Low/medium; route-name compatibility may break. | Future Conscious schema/action modules or route removal. |
| `app/Http/Controllers/Scripture/TopicAdminDetailsController.php` | backend | `postponed_extension_placeholder` | Old/postponed topic detail controller exists, but postponed routes use placeholder. | No active route found in current scan. | Delete or migrate when topic schema work begins after fresh route/reference audit. | Topic schema planning. | Low/uncertain. | Future topic schema field route. |
| `app/Http/Controllers/Scripture/CharacterAdminDetailsController.php` | backend | `postponed_extension_placeholder` | Old/postponed character detail controller exists, but postponed routes use placeholder. | No active route found in current scan. | Delete or migrate when character schema work begins after fresh route/reference audit. | Character schema planning. | Low/uncertain. | Future character schema field route. |

### 4. Stale Docs To Fix

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `docs/current-state.md` | docs | `stale_doc_update_needed` | Still contains some historical references to removed `AdminModuleHost` phases; mostly current but noisy. | Documentation only. | Trim or mark historical sections. | Docs hygiene phase. | Low. | Current cleanup docs. |
| `docs/current-phase.md` | docs | `stale_doc_update_needed` | Still contains historical module-host quarantine wording; mostly current but noisy. | Documentation only. | Trim old phase narrative. | Docs hygiene phase. | Low. | Current cleanup docs. |
| `docs/next-step.md` | docs | `stale_doc_update_needed` | Mostly current, still mentions old `AdminModuleHost` as a warning. | Documentation only. | Optional wording cleanup after garbage phase. | Docs hygiene phase. | Low. | Current Conscious Admin instructions. |
| `docs/admin-module-integration.md` | docs | `stale_doc_update_needed` | Recently updated, but should be reviewed once the garbage inventory is accepted. | Documentation only. | Confirm no old module registration instructions remain. | Docs hygiene phase. | Low. | Conscious action/surface integration guide. |
| `docs/scripture-admin-editing.md` | docs | `stale_doc_update_needed` | Recently updated, but should be reviewed once the garbage inventory is accepted. | Documentation only. | Confirm active scripture editing path only teaches Conscious Admin. | Docs hygiene phase. | Low. | Conscious scripture editing guide. |

### Docs Cleaned In Garbage Cleanup Phase 1

| Path | Previous status | Cleanup |
| --- | --- | --- |
| `docs/admin-architecture.md` | `stale_doc_update_needed` | Replaced removed `admin/modules` / host architecture with Super Conscious Admin schema/action/surface path. |
| `docs/admin-surface-design.md` | `stale_doc_update_needed` | Replaced `AdminModuleHost` / `qualify-module` attachment instructions with Conscious action resolver and `AdminSurfaceActionMenu`. |
| `docs/architecture-guardrails.md` | `stale_doc_update_needed` | Replaced admin module host guardrail with Super Conscious schema surface/action resolution guardrail. |
| `docs/admin/admin-awareness-readiness.md` | `stale_doc_update_needed` | Marked as historical Phase G0 audit for the old resolver-to-legacy-control handoff. |
| `docs/admin/conscious-full-edit.md` | `stale_doc_update_needed` | Updated old Full Edit section to say book/chapter/verse React pages were deleted and old GET routes are redirect-only compatibility paths. |

### 5. Postponed Extension Placeholders

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `routes/scripture.php` character admin group | routes | `postponed_extension_placeholder` | Route names preserved, but controller aborts 404. | `PostponedAdminSurfaceController`. | Remove or replace when character Conscious schema exists. | Character schema planning. | Low/medium route compatibility risk. | Future character schema routes/actions. |
| `routes/scripture.php` topic admin group | routes | `postponed_extension_placeholder` | Route names preserved, but controller aborts 404. | `PostponedAdminSurfaceController`. | Remove or replace when topic Conscious schema exists. | Topic schema planning. | Low/medium route compatibility risk. | Future topic schema routes/actions. |
| `app/Http/Requests/Scripture/TopicAdminDetailsUpdateRequest.php` | requests | `postponed_extension_placeholder` | Old topic detail request. | No active route found in scan. | Delete or migrate after topic schema decision. | Topic schema planning. | Low/uncertain. | Future topic field policy. |
| `app/Http/Requests/Scripture/CharacterAdminDetailsUpdateRequest.php` | requests | `postponed_extension_placeholder` | Old character detail request. | No active route found in scan. | Delete or migrate after character schema decision. | Character schema planning. | Low/uncertain. | Future character field policy. |

### 6. Unknown / Manual Review

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `app/Support/Scripture/Admin/*RouteContext.php` | backend | `uncertain_needs_manual_review` | Route-context helpers are used by old controllers and possibly public payload builders. | Multiple old controllers and page payloads. | Remove after backend action services own redirects/return targets. | Backend service migration. | Medium/high. | Conscious action response/navigation helpers. |

## Route Group Audit

| Route group | Current status | Currently needed? | Replacement target | Deletion condition |
| --- | --- | --- | --- | --- |
| `routes/web.php` `admin.schema.full-edit` | `active_conscious_keep` | Yes. | Already final read route. | Do not delete. |
| `routes/web.php` `admin.schema.fields.update` | `active_conscious_keep` | Yes. | Already final safe field route. | Do not delete. |
| `scripture.books.admin.store` | `transitional_keep_until_replaced` | Possibly for legacy/protected create paths. | `CreateChildAction`. | Conscious create-book action exists or route intentionally retired. |
| `scripture.books.admin.full-edit` | `deleted_big_patch_4` | No. | Conscious Full Edit GET. | Deleted after payloads moved to `admin.schema.full-edit`. |
| `scripture.books.admin.canonical-edit` | `protected_legacy_workflow` | Yes until replacement. | Protected canonical workflow/action. | Conscious protected-canonical flow exists. |
| `scripture.books.admin.identity.update` | `deleted_big_patch_4` | No. | Field route plus protected identity action. | Deleted after route metadata moved to Conscious routes. |
| `scripture.books.admin.details.update` | `deleted_big_patch_4` | No. | Field route. | Deleted after route metadata moved to Conscious routes. |
| `scripture.books.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists or delete retired. |
| `scripture.books.admin.content-blocks.*` | `deleted_big_patch_5` | No. | Content block action services. | Deleted after metadata moved to Conscious actions. |
| `scripture.books.admin.media-assignments.*` | `deleted_big_patch_5` | No. | `MediaAssignmentAction`. | Deleted after metadata moved to Conscious actions. |
| `scripture.book-sections.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add book-section action exists. |
| `scripture.book-sections.admin.details.update` | `deleted_big_patch_4` | No. | Field route. | Deleted after route metadata moved to Conscious routes. |
| `scripture.book-sections.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.book-sections.admin.content-blocks.*` | `deleted_big_patch_5` | No. | Content block action services. | Deleted after metadata moved to Conscious actions. |
| `scripture.chapters.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add chapter action exists. |
| `scripture.chapters.admin.full-edit` | `deleted_big_patch_4` | No. | Conscious Full Edit GET. | Deleted after payloads moved to `admin.schema.full-edit`. |
| `scripture.chapters.admin.identity.update` | `deleted_big_patch_4` | No. | Field route plus protected identity action. | Deleted after route metadata moved to Conscious routes. |
| `scripture.chapters.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.chapters.admin.content-blocks.*` | `deleted_big_patch_5` | No. | Content block action services. | Deleted after metadata moved to Conscious actions. |
| `scripture.chapter-sections.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add chapter-section action exists. |
| `scripture.chapter-sections.admin.details.update` | `deleted_big_patch_4` | No. | Field route. | Deleted after route metadata moved to Conscious routes. |
| `scripture.chapter-sections.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.chapter-sections.admin.content-blocks.*` | `deleted_big_patch_5` | No. | Content block action services. | Deleted after metadata moved to Conscious actions. |
| `scripture.chapters.verses.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add verse action exists. |
| `scripture.chapters.verses.admin.full-edit` | `deleted_big_patch_4` | No. | Conscious Full Edit GET. | Deleted after payloads moved to `admin.schema.full-edit`. |
| `scripture.chapters.verses.admin.identity.update` | `deleted_big_patch_4` | No. | Field route plus protected identity action. | Deleted after route metadata moved to Conscious routes. |
| `scripture.chapters.verses.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.chapters.verses.admin.meta.update` | `deleted_big_patch_5` | No. | `VerseSupportAction`. | Deleted after metadata moved to Conscious actions. |
| `scripture.chapters.verses.admin.translations.*` | `deleted_big_patch_5` | No. | `VerseSupportAction`. | Deleted after metadata moved to Conscious actions. |
| `scripture.chapters.verses.admin.commentaries.*` | `deleted_big_patch_5` | No. | `VerseSupportAction`. | Deleted after metadata moved to Conscious actions. |
| `scripture.chapters.verses.admin.content-blocks.*` | `deleted_big_patch_5` | No. | Content block action services. | Deleted after metadata moved to Conscious actions. |
| `scripture.topics.admin.*` | `postponed_extension_placeholder` | No active behavior; returns 404. | Future topic Conscious schema or removal. | Topic admin decision made. |
| `scripture.characters.admin.*` | `postponed_extension_placeholder` | No active behavior; returns 404. | Future character Conscious schema or removal. | Character admin decision made. |

## Request Class Audit

| Path/pattern | Layer | Status | Reason | Current imports/references | Deletion condition | Replacement target |
| --- | --- | --- | --- | --- | --- | --- |
| Deleted Big Patch 4 identity/details requests | requests | `deleted_big_patch_4` | Old route-specific identity/details validation. | None after route/controller deletion. | Already deleted. | Conscious field policy + protected identity action validation. |
| `app/Http/Requests/Scripture/*AdminStoreRequest.php` | requests | `transitional_keep_until_replaced` | Old create validation. | create controllers. | Conscious create actions exist. | `CreateChildAction` policy/request. |
| Deleted Big Patch 5 content-block/media/verse-support requests | requests | `deleted_big_patch_5` | Old route-specific validation moved into Conscious action validation and policies. | None after route/controller deletion. | Already deleted. | Conscious action policies. |

## Replacement Target Map

| Old thing | Replacement |
| --- | --- |
| Old route-specific field updates | `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}` |
| Old route-specific full edit | `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit` |
| Old create/delete/reorder/content/media/relation actions | `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}` |
| Old request validation classes | `app/Admin/Conscious/Policies` and action/field services |
| Old route-specific payload builders | `app/Admin/Conscious/Services/FullEditPayloadBuilder` or entity payload builders |
| Old content-block controllers | Conscious content block action services |
| Old media assignment controllers | Conscious `MediaAction` and media picker/service |
| Old verse meta/translation/commentary controllers | Conscious `VerseSupportAction` family |
| Old protected canonical edit page | Conscious protected canonical workflow/action |
| Old public module-host/module-registry UI | `AdminSchemaFieldDisplay`, `AdminSchemaFieldSurface`, `AdminSurfaceActionMenu`, Conscious action registry/resolver |

## Recommended Cleanup Order

1. Update stale docs that still teach `AdminModuleHost`, `admin/modules`, or old
   Full Edit pages as active architecture.
2. Move Conscious Full Edit saves to the generic field route for safe fields.
3. Extract Conscious Full Edit payload building into backend services.
4. Deleted in Big Patch 4: old identity/details controllers and requests after
   route metadata moved to Conscious field routes and protected identity actions.
5. Done in Big Patches 2-5: Conscious action services now own content blocks,
   media assignments, verse meta, translations, and commentaries, and old
   route-specific controllers/routes/requests were deleted after audit.
6. Build protected create/delete/reorder actions with policy gates.
7. Deleted in Big Patch 4: old redirect-only book/chapter/verse Full Edit
   controllers/routes after links moved to Conscious Full Edit.
8. Replace protected canonical edit with a Conscious protected-canonical
   workflow.
9. Decide whether topic/character postponed admin placeholders become real
    Conscious schemas or are removed.

## Count By Status

These counts are inventory rows/patterns, not a full line-by-line file count.

| Status | Count |
| --- | ---: |
| `active_conscious_keep` | 8 |
| `active_cms_keep` | 1 |
| `transitional_keep_until_replaced` | 23 |
| `redirect_only_legacy` | 3 |
| `protected_legacy_workflow` | 4 |
| `dead_safe_to_delete` | 0 |
| `stale_doc_update_needed` | 5 |
| `postponed_extension_placeholder` | 6 |
| `uncertain_needs_manual_review` | 1 |

## CMS Note

CMS references to `module-registry`, `module-types`, and legacy rich-text HTML
compatibility are active CMS architecture, not old scripture admin garbage.
Do not delete CMS admin code as part of this cleanup list.
