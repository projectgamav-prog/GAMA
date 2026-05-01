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
| `resources/js/components/scripture/verse/VerseFullEditIntroCard.tsx` | frontend | `dead_safe_to_delete` | Old route-specific verse Full Edit intro card; old verse Full Edit React page was removed. | None found by `rg VerseFullEditIntroCard`. | Delete after confirming no pending branch reintroduces old verse Full Edit page. | Phase 4 frontend dead-file purge. | Low. | Conscious Full Edit shell intro/summary components. |

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
| `app/Http/Controllers/Scripture/BookAdminIdentityController.php` | backend | `transitional_keep_until_replaced` | Old multi-field identity write endpoint. | `routes/scripture.php`; old fallback/full edit references. | Remove after book identity writes are Conscious field/action services. | Field/full-edit save migration. | Medium/high. | Field route for title; protected identity action for slug/number. |
| `app/Http/Controllers/Scripture/BookAdminDetailsController.php` | backend | `transitional_keep_until_replaced` | Old book details write endpoint. | `routes/scripture.php`; fallback/full edit references. | Remove after description saves use generic field route everywhere. | Field/full-edit save migration. | Medium. | `PATCH /admin/schema/.../fields/description`. |
| `app/Http/Controllers/Scripture/BookSectionAdminDetailsController.php` | backend | `transitional_keep_until_replaced` | Old book section title/details write endpoint. | `routes/scripture.php`. | Remove after Full Edit and fallback flows use Conscious field route/action. | Field/full-edit save migration. | Medium. | `PATCH /admin/schema/.../fields/title`. |
| `app/Http/Controllers/Scripture/ChapterAdminIdentityController.php` | backend | `transitional_keep_until_replaced` | Old chapter title/slug/number write endpoint. | `routes/scripture.php`; has old full-edit referer handling. | Remove after title uses field route and slug/number use protected action. | Protected identity migration. | Medium/high. | Field route plus protected identity action. |
| `app/Http/Controllers/Scripture/ChapterSectionAdminDetailsController.php` | backend | `transitional_keep_until_replaced` | Old chapter section title/details write endpoint. | `routes/scripture.php`. | Remove after Full Edit/fallback flows use Conscious field route/action. | Field/full-edit save migration. | Medium. | Field route plus protected identity action. |
| `app/Http/Controllers/Scripture/VerseAdminIdentityController.php` | backend | `transitional_keep_until_replaced` | Old verse text/slug/number write endpoint. | `routes/scripture.php`. | Remove after verse text uses field route everywhere and slug/number use protected action. | Protected identity migration. | Medium/high. | Field route plus protected identity action. |
| `app/Http/Controllers/Scripture/*AdminContentBlockController.php` | backend | `transitional_keep_until_replaced` | Old owner-specific content-block write/move/duplicate/delete endpoints. | `routes/scripture.php`; transitional full-edit/backoffice flows. | Remove after parent-aware Conscious content-block actions exist. | Content block action migration. | High. | `POST /admin/schema/.../actions/{actionKey}` content block services. |
| `app/Http/Controllers/Scripture/BookAdminMediaAssignmentController.php` | backend | `transitional_keep_until_replaced` | Old book media assignment attach/replace/update/delete endpoints. | `routes/scripture.php`. | Remove after Conscious media assignment action/picker exists. | Media action migration. | High if media management still needed. | Conscious `MediaAction`. |
| `app/Http/Controllers/Scripture/VerseAdminMetaController.php` | backend | `transitional_keep_until_replaced` | Old verse meta write endpoint. | `routes/scripture.php`. | Remove after verse meta becomes Conscious structured field/action group. | Verse support migration. | High for verse meta editing. | `VerseSupportAction` / schema group service. |
| `app/Http/Controllers/Scripture/VerseAdminTranslationController.php` | backend | `transitional_keep_until_replaced` | Old verse translations CRUD endpoint. | `routes/scripture.php`. | Remove after Conscious translation support action exists. | Verse support migration. | High for translation editing. | `VerseSupportAction`. |
| `app/Http/Controllers/Scripture/VerseAdminCommentaryController.php` | backend | `transitional_keep_until_replaced` | Old verse commentaries CRUD endpoint. | `routes/scripture.php`. | Remove after Conscious commentary support action exists. | Verse support migration. | High for commentary editing. | `VerseSupportAction`. |
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
| `app/Http/Controllers/Scripture/BookFullEditController.php` | backend | `redirect_only_legacy` | Old GET full edit route redirects to Conscious Full Edit. | `routes/scripture.php`; old route names may still be linked. | Delete route/controller after all old links are removed or route aliases are no longer needed. | Redirect cleanup phase. | Low/medium; old links may 404. | Conscious Full Edit route. |
| `app/Http/Controllers/Scripture/ChapterFullEditController.php` | backend | `redirect_only_legacy` | Old GET full edit route redirects to Conscious Full Edit. | `routes/scripture.php`; old route names may still be linked. | Delete route/controller after old route links are gone. | Redirect cleanup phase. | Low/medium. | Conscious Full Edit route. |
| `app/Http/Controllers/Scripture/VerseFullEditController.php` | backend | `redirect_only_legacy` | Old GET full edit route redirects to Conscious Full Edit. | `routes/scripture.php`; old route names may still be linked. | Delete route/controller after old route links are gone. | Redirect cleanup phase. | Low/medium. | Conscious Full Edit route. |
| `app/Http/Controllers/Scripture/BookCanonicalEditController.php` | backend | `protected_legacy_workflow` | Still renders protected book canonical edit page. | `routes/scripture.php`; `BookAdminRouteContext`. | Delete after Conscious protected canonical workflow replaces it. | Protected canonical migration. | High. | Conscious protected canonical action/full edit category. |
| `app/Http/Controllers/Scripture/PostponedAdminSurfaceController.php` | backend | `postponed_extension_placeholder` | Topic/character admin routes abort 404 but preserve route names. | topic/character postponed admin routes. | Remove after topic/character Conscious schema decisions are made. | Topic/character schema planning. | Low/medium; route-name compatibility may break. | Future Conscious schema/action modules or route removal. |
| `app/Http/Controllers/Scripture/TopicAdminDetailsController.php` | backend | `postponed_extension_placeholder` | Old/postponed topic detail controller exists, but postponed routes use placeholder. | No active route found in current scan. | Delete or migrate when topic schema work begins after fresh route/reference audit. | Topic schema planning. | Low/uncertain. | Future topic schema field route. |
| `app/Http/Controllers/Scripture/CharacterAdminDetailsController.php` | backend | `postponed_extension_placeholder` | Old/postponed character detail controller exists, but postponed routes use placeholder. | No active route found in current scan. | Delete or migrate when character schema work begins after fresh route/reference audit. | Character schema planning. | Low/uncertain. | Future character schema field route. |

### 4. Stale Docs To Fix

| Path | Layer | Status | Reason | Current imports/references | Deletion condition | Recommended cleanup phase | Risk if deleted now | Replacement target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `docs/admin-architecture.md` | docs | `stale_doc_update_needed` | Still says reusable canonical editor behavior lives in `resources/js/admin/modules`. | Documentation only. | Update to Super Conscious Admin + CMS split. | Docs cleanup phase. | Medium confusion if left stale. | `docs/admin/super-conscious-admin-layer.md`. |
| `docs/admin-surface-design.md` | docs | `stale_doc_update_needed` | Still teaches `AdminModuleHost`, `AdminModuleHostGroup`, and `qualify-module`. | Documentation only. | Rewrite or archive as historical surface-design doc. | Docs cleanup phase. | High confusion for future Codex. | Conscious schema surface/action menu docs. |
| `docs/architecture-guardrails.md` | docs | `stale_doc_update_needed` | Still warns about bypassing the admin module host as default architecture. | Documentation only. | Update guardrail to schema surfaces/action resolver. | Docs cleanup phase. | Medium confusion. | Conscious renderer awareness contract. |
| `docs/admin/admin-awareness-readiness.md` | docs | `stale_doc_update_needed` | Historical G0 audit still describes `AdminModuleHost` structured surfaces and old comparison readiness as active. | Documentation only. | Mark historical or update with legacy removal note. | Docs cleanup phase. | Medium confusion. | Current cleanup/backend docs. |
| `docs/admin/conscious-full-edit.md` | docs | `stale_doc_update_needed` | Says old route-specific Full Edit pages remain in codebase; they have been deleted. | Documentation only. | Update to redirect-only legacy routes and deleted React pages. | Docs cleanup phase. | Low/medium confusion. | Conscious Full Edit docs. |
| `docs/current-state.md` | docs | `stale_doc_update_needed` | Still contains some historical references to removed `AdminModuleHost` phases; mostly current but noisy. | Documentation only. | Trim or mark historical sections. | Docs hygiene phase. | Low. | Current cleanup docs. |
| `docs/current-phase.md` | docs | `stale_doc_update_needed` | Still contains historical module-host quarantine wording; mostly current but noisy. | Documentation only. | Trim old phase narrative. | Docs hygiene phase. | Low. | Current cleanup docs. |
| `docs/next-step.md` | docs | `stale_doc_update_needed` | Mostly current, still mentions old `AdminModuleHost` as a warning. | Documentation only. | Optional wording cleanup after garbage phase. | Docs hygiene phase. | Low. | Current Conscious Admin instructions. |
| `docs/admin-module-integration.md` | docs | `stale_doc_update_needed` | Recently updated, but should be reviewed once the garbage inventory is accepted. | Documentation only. | Confirm no old module registration instructions remain. | Docs hygiene phase. | Low. | Conscious action/surface integration guide. |
| `docs/scripture-admin-editing.md` | docs | `stale_doc_update_needed` | Recently updated, but should be reviewed once the garbage inventory is accepted. | Documentation only. | Confirm active scripture editing path only teaches Conscious Admin. | Docs hygiene phase. | Low. | Conscious scripture editing guide. |

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
| `app/Http/Requests/Scripture/*ContentBlock*` non-admin base requests | requests | `uncertain_needs_manual_review` | Some are shared bases for admin content-block controllers; not all carry `Admin` in the name. | Content-block controllers/request inheritance. | Remove only after content-block action migration and fresh class-reference audit. | Content block backend migration. | High if removed casually. | Conscious content block action validation policies. |
| `app/Http/Requests/Scripture/*Translation*` | requests | `uncertain_needs_manual_review` | Needed by old translation controllers until Conscious translation actions exist. | `VerseAdminTranslationController`. | Remove after verse translation action service. | Verse support migration. | High. | `VerseSupportAction` validation policy. |
| `app/Http/Requests/Scripture/*Commentary*` | requests | `uncertain_needs_manual_review` | Needed by old commentary controllers until Conscious commentary actions exist. | `VerseAdminCommentaryController`. | Remove after verse commentary action service. | Verse support migration. | High. | `VerseSupportAction` validation policy. |
| `app/Support/Scripture/Admin/*RouteContext.php` | backend | `uncertain_needs_manual_review` | Route-context helpers are used by old controllers and possibly public payload builders. | Multiple old controllers and page payloads. | Remove after backend action services own redirects/return targets. | Backend service migration. | Medium/high. | Conscious action response/navigation helpers. |

## Route Group Audit

| Route group | Current status | Currently needed? | Replacement target | Deletion condition |
| --- | --- | --- | --- | --- |
| `routes/web.php` `admin.schema.full-edit` | `active_conscious_keep` | Yes. | Already final read route. | Do not delete. |
| `routes/web.php` `admin.schema.fields.update` | `active_conscious_keep` | Yes. | Already final safe field route. | Do not delete. |
| `scripture.books.admin.store` | `transitional_keep_until_replaced` | Possibly for legacy/protected create paths. | `CreateChildAction`. | Conscious create-book action exists or route intentionally retired. |
| `scripture.books.admin.full-edit` | `redirect_only_legacy` | Only for old links. | Conscious Full Edit GET. | No old links need route name. |
| `scripture.books.admin.canonical-edit` | `protected_legacy_workflow` | Yes until replacement. | Protected canonical workflow/action. | Conscious protected-canonical flow exists. |
| `scripture.books.admin.identity.update` | `transitional_keep_until_replaced` | Yes for old fallback/full edit. | Field route plus protected identity action. | Full Edit and fallback no longer post here. |
| `scripture.books.admin.details.update` | `transitional_keep_until_replaced` | Yes for old fallback/full edit. | Field route. | Full Edit and fallback no longer post here. |
| `scripture.books.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists or delete retired. |
| `scripture.books.admin.content-blocks.*` | `transitional_keep_until_replaced` | Yes for transitional protected content-block maintenance. | Content block action services. | Parent-aware content-block actions exist. |
| `scripture.books.admin.media-assignments.*` | `transitional_keep_until_replaced` | Yes for old media assignment flows. | `MediaAction`. | Conscious media action/picker exists. |
| `scripture.book-sections.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add book-section action exists. |
| `scripture.book-sections.admin.details.update` | `transitional_keep_until_replaced` | Yes for old fallback/full edit. | Field route. | Full Edit/fallback no longer posts here. |
| `scripture.book-sections.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.book-sections.admin.content-blocks.*` | `transitional_keep_until_replaced` | Possibly for intro/content-block fallback. | Content block action services. | Parent-aware content-block actions exist. |
| `scripture.chapters.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add chapter action exists. |
| `scripture.chapters.admin.full-edit` | `redirect_only_legacy` | Only for old links. | Conscious Full Edit GET. | No old links need route name. |
| `scripture.chapters.admin.identity.update` | `transitional_keep_until_replaced` | Yes for old fallback/full edit. | Field route plus protected identity action. | Full Edit/fallback no longer posts here. |
| `scripture.chapters.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.chapters.admin.content-blocks.*` | `transitional_keep_until_replaced` | Yes for transitional protected content-block maintenance. | Content block action services. | Parent-aware content-block actions exist. |
| `scripture.chapter-sections.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add chapter-section action exists. |
| `scripture.chapter-sections.admin.details.update` | `transitional_keep_until_replaced` | Yes for old fallback/full edit. | Field route. | Full Edit/fallback no longer posts here. |
| `scripture.chapter-sections.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.chapter-sections.admin.content-blocks.*` | `transitional_keep_until_replaced` | Possibly for intro/content-block fallback. | Content block action services. | Parent-aware content-block actions exist. |
| `scripture.chapters.verses.admin.store` | `transitional_keep_until_replaced` | Possibly. | `CreateChildAction`. | Conscious add verse action exists. |
| `scripture.chapters.verses.admin.full-edit` | `redirect_only_legacy` | Only for old links. | Conscious Full Edit GET. | No old links need route name. |
| `scripture.chapters.verses.admin.identity.update` | `transitional_keep_until_replaced` | Yes for old fallback/full edit. | Field route plus protected identity action. | Full Edit/fallback no longer posts here. |
| `scripture.chapters.verses.admin.destroy` | `transitional_keep_until_replaced` | Possibly. | `DeleteEntityAction`. | Conscious delete action exists. |
| `scripture.chapters.verses.admin.meta.update` | `transitional_keep_until_replaced` | Yes for verse support editing. | `VerseSupportAction`. | Conscious verse meta action exists. |
| `scripture.chapters.verses.admin.translations.*` | `transitional_keep_until_replaced` | Yes for translation editing. | `VerseSupportAction`. | Conscious translation action exists. |
| `scripture.chapters.verses.admin.commentaries.*` | `transitional_keep_until_replaced` | Yes for commentary editing. | `VerseSupportAction`. | Conscious commentary action exists. |
| `scripture.chapters.verses.admin.content-blocks.*` | `transitional_keep_until_replaced` | Yes for transitional protected content-block maintenance. | Content block action services. | Parent-aware content-block actions exist. |
| `scripture.topics.admin.*` | `postponed_extension_placeholder` | No active behavior; returns 404. | Future topic Conscious schema or removal. | Topic admin decision made. |
| `scripture.characters.admin.*` | `postponed_extension_placeholder` | No active behavior; returns 404. | Future character Conscious schema or removal. | Character admin decision made. |

## Request Class Audit

| Path/pattern | Layer | Status | Reason | Current imports/references | Deletion condition | Replacement target |
| --- | --- | --- | --- | --- | --- | --- |
| `app/Http/Requests/Scripture/BookAdminIdentityUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old identity validation. | `BookAdminIdentityController`. | Protected identity action exists. | Field policy + protected identity action validation. |
| `app/Http/Requests/Scripture/BookAdminDetailsUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old details validation. | `BookAdminDetailsController`. | Full Edit/fallback saves use field route. | Field policy. |
| `app/Http/Requests/Scripture/BookSectionAdminDetailsUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old section title/details validation. | `BookSectionAdminDetailsController`. | Field/full edit migration complete. | Field policy. |
| `app/Http/Requests/Scripture/ChapterAdminIdentityUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old chapter identity validation. | `ChapterAdminIdentityController`. | Protected identity action exists. | Field policy + protected identity action validation. |
| `app/Http/Requests/Scripture/ChapterSectionAdminDetailsUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old section title/details validation. | `ChapterSectionAdminDetailsController`. | Field/full edit migration complete. | Field policy. |
| `app/Http/Requests/Scripture/VerseAdminIdentityUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old verse identity/text validation. | `VerseAdminIdentityController`. | Verse text fully uses field route and identity action exists. | Field policy + protected identity action validation. |
| `app/Http/Requests/Scripture/*AdminStoreRequest.php` | requests | `transitional_keep_until_replaced` | Old create validation. | create controllers. | Conscious create actions exist. | `CreateChildAction` policy/request. |
| `app/Http/Requests/Scripture/*AdminContentBlock*Request.php` and `*ContentBlock*Request.php` | requests | `transitional_keep_until_replaced` | Old content block validation. | content-block controllers. | Conscious content-block actions exist. | Content block action validation. |
| `app/Http/Requests/Scripture/BookAdminMediaAssignment*Request.php` | requests | `transitional_keep_until_replaced` | Old media assignment validation. | `BookAdminMediaAssignmentController`. | Conscious media action exists. | Media action validation. |
| `app/Http/Requests/Scripture/VerseAdminMetaUpdateRequest.php` | requests | `transitional_keep_until_replaced` | Old verse meta validation. | `VerseAdminMetaController`. | Verse meta action exists. | Verse support policy. |
| `app/Http/Requests/Scripture/VerseTranslation*Request.php` | requests | `transitional_keep_until_replaced` | Old translation validation. | `VerseAdminTranslationController`. | Translation action exists. | Verse support policy. |
| `app/Http/Requests/Scripture/VerseCommentary*Request.php` | requests | `transitional_keep_until_replaced` | Old commentary validation. | `VerseAdminCommentaryController`. | Commentary action exists. | Verse support policy. |

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

1. Delete `VerseFullEditIntroCard.tsx` after one final import check.
2. Update stale docs that still teach `AdminModuleHost`, `admin/modules`, or old
   Full Edit pages as active architecture.
3. Move Conscious Full Edit saves to the generic field route for safe fields.
4. Extract Conscious Full Edit payload building into backend services.
5. Replace old identity/details controllers and requests with field policies
   plus protected identity actions.
6. Build Conscious action services for content blocks, media assignments, verse
   meta, translations, and commentaries.
7. Build protected create/delete/reorder actions with policy gates.
8. Remove old redirect-only Full Edit controllers/routes after old links no
   longer need route-name compatibility.
9. Replace protected canonical edit with a Conscious protected-canonical
   workflow.
10. Decide whether topic/character postponed admin placeholders become real
    Conscious schemas or are removed.

## Count By Status

These counts are inventory rows/patterns, not a full line-by-line file count.

| Status | Count |
| --- | ---: |
| `active_conscious_keep` | 8 |
| `active_cms_keep` | 1 |
| `transitional_keep_until_replaced` | 42 |
| `redirect_only_legacy` | 3 |
| `protected_legacy_workflow` | 4 |
| `dead_safe_to_delete` | 1 |
| `stale_doc_update_needed` | 10 |
| `postponed_extension_placeholder` | 6 |
| `uncertain_needs_manual_review` | 4 |

## CMS Note

CMS references to `module-registry`, `module-types`, and legacy rich-text HTML
compatibility are active CMS architecture, not old scripture admin garbage.
Do not delete CMS admin code as part of this cleanup list.
