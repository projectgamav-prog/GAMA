# Conscious Admin Backend Migration Map

This audit classifies current admin write endpoints by their relationship to
the new Super Conscious Admin layer. Do not delete backend code from this map
without a separate implementation task and fresh usage check.

## Classification Legend

- `keep`: actively used by schema-aware quick edit or Conscious Full Edit.
- `legacy UI only`: tied to old visible admin modules or route-specific screens.
- `replace soon`: still useful behavior, but should move behind Conscious Admin
  schema/field/action services.
- `unknown`: keep until a runtime/product usage pass proves the owner.

## Active Conscious Admin Read Path

| Route | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit` | `Admin\ConsciousFullEditController@show` -> `ConsciousFullEditPayloadBuilder` | keep | New schema-aware Full Edit shell for `book`, `book_section`, `chapter`, `chapter_section`, `verse`, and read-only `content_block`. Controller orchestrates only. |

## Active Conscious Admin Field Update Foundation

| Route | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}` | `Admin\ConsciousSchemaFieldUpdateController` -> `ConsciousFieldUpdateService` | keep | Generic safe field update route. Schema-aware quick edit and the first Conscious Full Edit safe fields use this route. |

## Active Conscious Admin Action Route Foundation

| Route | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}` | `Admin\ConsciousSchemaActionController` -> `ConsciousActionDispatcher` | keep | Final action route shape exists. Unknown or unavailable actions reject safely. `protected_identity.update` is enabled for supported scripture entities; create/delete/reorder/reparent placeholders remain disabled. |

Phase 1 backend services:

- `ConsciousSchemaFieldRegistry`
- `ConsciousSchemaFieldDefinition`
- `ScriptureConsciousSchemaFields`
- `ConsciousSchemaEntityResolver`
- `ConsciousProtectedCanonicalFieldPolicy`
- `ConsciousFieldUpdateService`
- `ConsciousFullEditPayloadBuilder`
- `ConsciousActionRegistry`
- `ConsciousActionDefinition`
- `ConsciousActionDispatcher`
- `ConsciousActionHandler`
- `ScriptureConsciousActionDefinitions`
- `Scripture\ProtectedIdentityAction`
- `ConsciousProtectedIdentityPolicy`
- `ConsciousRelationshipRegistry`
- `ConsciousRelationshipDefinition`
- `ScriptureConsciousRelationshipDefinitions`

Supported safe fields:

- `books.title`
- `books.description`
- `book_sections.title`
- `chapters.title`
- `chapter_sections.title`
- `verses.text`

Protected fields are registered but blocked from the generic field route:

- `slug`
- `number`
- parent relation ids
- canonical relation/path fields

Schema-aware quick edit and Conscious Full Edit safe fields now submit
`{ value: ... }` to this route for the safe fields above. Hidden `slug`,
`number`, and parent-context payload fields are no longer required for these
migrated safe field saves. The backend still tolerates the field name as a
transitional payload key, but `value` is the active frontend contract. It
updates only the registry-approved column.

Protected identity fields now save through:

- `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/protected_identity.update`

Supported protected identity fields:

- `slug`
- `number`

Supported scripture entities:

- `book`
- `book_section`
- `chapter`
- `chapter_section`
- `verse`

The action rejects unknown payload keys and accepts no parent/reparent/order,
create, delete, media, content-block, verse-meta, translation, or commentary
mutation.

## Scripture Entity Field Writes

| Route name | Method/path | Controller | Classification | Current Conscious usage | Future target |
| --- | --- | --- | --- | --- | --- |
| `scripture.books.admin.identity.update` | `PATCH books/{book}/admin/identity` | `BookAdminIdentityController@update` | keep | `books.title` quick edit and Conscious Full Edit. Hidden payload still carries `slug` and `number`. | Replace with field update for `books.title`; protect `slug` and `number` behind canonical identity policy. |
| `scripture.books.admin.details.update` | `PATCH books/{book}/admin/details` | `BookAdminDetailsController@update` | keep | `books.description` quick edit and Conscious Full Edit. | Replace with generic field update for `books.description`. |
| `scripture.book-sections.admin.details.update` | `PATCH books/{book}/sections/{bookSection}/admin/details` | `BookSectionAdminDetailsController@update` | keep | `book_sections.title` quick edit and Conscious Full Edit. Hidden payload still carries `number`. | Replace with field update for `book_sections.title`; protect `number`. |
| `scripture.chapters.admin.identity.update` | `PATCH books/{book}/sections/{bookSection}/chapters/{chapter}/admin/identity` | `ChapterAdminIdentityController@update` | keep | `chapters.title` quick edit and Conscious Full Edit. Hidden payload still carries `slug` and `number`. | Replace with field update for `chapters.title`; protect `slug` and `number`. |
| `scripture.chapter-sections.admin.details.update` | `PATCH books/{book}/sections/{bookSection}/chapters/{chapter}/sections/{chapterSection}/admin/details` | `ChapterSectionAdminDetailsController@update` | keep | `chapter_sections.title` quick edit and Conscious Full Edit. Hidden payload still carries `number`. | Replace with field update for `chapter_sections.title`; protect `number`. |
| `scripture.chapters.verses.admin.identity.update` | `PATCH books/{book}/sections/{bookSection}/chapters/{chapter}/sections/{chapterSection}/verses/{verse}/admin/identity` | `VerseAdminIdentityController@update` | keep | `verses.text` quick edit and Conscious Full Edit. Hidden payload still carries `slug` and `number`. | Replace with field update for `verses.text`; protect `slug` and `number`. |

These routes remain in the codebase as temporary behavior providers.
Schema-aware quick edit, the first Conscious Full Edit safe field saves, and
Conscious Full Edit slug/number saves no longer need these old identity/details
endpoints for those fields. Non-migrated structured flows may still reference
old route-specific endpoints until Conscious actions replace them.

## Deprecated Full Edit / Canonical Screens

| Route name | Method/path | Controller | Classification | Notes |
| --- | --- | --- | --- | --- |
| `scripture.books.admin.full-edit` | `GET books/{book}/admin/full-edit` | `BookFullEditController@show` | old_full_edit_redirect_only | Redirects to Conscious Full Edit for `scripture.book`. |
| `scripture.books.admin.canonical-edit` | `GET books/{book}/admin/canonical-edit` | `BookCanonicalEditController@show` | replace soon | Canonical identity behavior should become a protected Conscious Admin workflow. |
| `scripture.chapters.admin.full-edit` | `GET .../chapters/{chapter}/admin/full-edit` | `ChapterFullEditController@show` | old_full_edit_redirect_only | Redirects to Conscious Full Edit for `scripture.chapter`. |
| `scripture.chapters.verses.admin.full-edit` | `GET .../verses/{verse}/admin/full-edit` | `VerseFullEditController@show` | old_full_edit_redirect_only | Redirects to Conscious Full Edit for `scripture.verse`. |
| `scripture.characters.admin.full-edit` | `GET characters/{character}/admin/full-edit` | `PostponedAdminSurfaceController` | unknown | Postponed proof surface. No active Conscious schema module yet. |
| `scripture.topics.admin.full-edit` | `GET topics/{topic}/admin/full-edit` | `PostponedAdminSurfaceController` | unknown | Postponed proof surface. No active Conscious schema module yet. |

## Create / Delete Canonical Structure

| Route name | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `scripture.books.admin.store` | `BookAdminCreateController@store` | replace soon | Canonical create flow should become a schema action with protected hierarchy rules. |
| `scripture.books.admin.destroy` | `BookAdminDeleteController@destroy` | replace soon | Destructive canonical action; keep disabled from public inline controls until resolver/action policy is complete. |
| `scripture.book-sections.admin.store` | `BookSectionAdminCreateController@store` | replace soon | Future Conscious add-child action with canonical constraints. |
| `scripture.book-sections.admin.destroy` | `BookSectionAdminDeleteController@destroy` | replace soon | Protected destructive structure action. |
| `scripture.chapters.admin.store` | `ChapterAdminCreateController@store` | replace soon | Future Conscious add-child action. |
| `scripture.chapters.admin.destroy` | `ChapterAdminDeleteController@destroy` | replace soon | Protected destructive structure action. |
| `scripture.chapter-sections.admin.store` | `ChapterSectionAdminCreateController@store` | replace soon | Future Conscious add-child action. |
| `scripture.chapter-sections.admin.destroy` | `ChapterSectionAdminDeleteController@destroy` | replace soon | Protected destructive structure action. |
| `scripture.chapters.verses.admin.store` | `VerseAdminCreateController@store` | replace soon | Future Conscious add-child action. |
| `scripture.chapters.verses.admin.destroy` | `VerseAdminDeleteController@destroy` | replace soon | Protected destructive structure action. |

## Content Block Writes

| Route family | Controllers | Classification | Notes |
| --- | --- | --- | --- |
| Book content blocks | `BookAdminContentBlockController` | replace soon | Transitional fallback for already-saved book editorial blocks. Move to schema action services plus ordering/add-anchor policies. |
| Book section content blocks | `BookSectionAdminContentBlockController` | replace soon | Intro block create/update/delete behavior should become owner-aware block services. |
| Chapter content blocks | `ChapterAdminContentBlockController` | replace soon | Transitional fallback for chapter note blocks; includes move/duplicate/delete. |
| Chapter section content blocks | `ChapterSectionAdminContentBlockController` | replace soon | Intro block create/update/delete behavior should become owner-aware block services. |
| Verse content blocks | `VerseAdminContentBlockController` | replace soon | Transitional fallback for verse note blocks; includes move/duplicate/delete. |

The Conscious Full Edit shell currently displays `content_block` records as
read-only because a generic parent-aware save route is not available yet.

## Verse Support Data

| Route family | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `scripture.chapters.verses.admin.meta.update` | `VerseAdminMetaController@update` | replace soon | Useful data, but should move to schema field groups and field policy before visible controls return. |
| `scripture.chapters.verses.admin.translations.*` | `VerseAdminTranslationController` | replace soon | Structured list editor behavior; not a field quick-edit target yet. |
| `scripture.chapters.verses.admin.commentaries.*` | `VerseAdminCommentaryController` | replace soon | Structured list editor behavior; not a field quick-edit target yet. |

## Media Assignment Writes

| Route family | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `scripture.books.admin.media-assignments.*` | `BookAdminMediaAssignmentController` | replace soon | Media assignment management should move to a structured Conscious media service/picker. Keep endpoints for existing protected fallback use. |

## Admin Context / Postponed Surfaces

| Route name | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `scripture.admin-context.visibility.update` | `AdminContextVisibilityController@update` | keep | Controls admin visibility/session behavior, not legacy content editing. |
| `scripture.characters.admin.details.update` | `PostponedAdminSurfaceController` | unknown | Stubbed/postponed. Keep stable until character schema awareness exists. |
| `scripture.characters.admin.content-blocks.*` | `PostponedAdminSurfaceController` | unknown | Stubbed/postponed. |
| `scripture.topics.admin.details.update` | `PostponedAdminSurfaceController` | unknown | Stubbed/postponed. Keep stable until topic schema awareness exists. |
| `scripture.topics.admin.content-blocks.*` | `PostponedAdminSurfaceController` | unknown | Stubbed/postponed. |

## CMS And Navigation Admin Routes

CMS and navigation write routes are not part of the scripture legacy UI removal.
Classify them separately when the Conscious Admin schema layer expands beyond
scripture:

- `routes/cms.php`: `Cms\PageAdmin*`, `PageContainerAdminController`,
  `PageBlockAdminController`, and exposed region container writes.
- `routes/navigation.php`: `Navigation\SiteNavigationItemController`.

Current classification: `unknown` for Conscious Admin migration, `keep` for
existing CMS/navigation product behavior.

## Proposed Conscious Admin Backend Architecture

### Routes

The schema-aware field write namespace now exists for safe fields:

- `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`

The final schema action route shape now exists:

- `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`

Dedicated children/order routes should not be added for new behavior. Add,
reorder, delete, reparent, media, relation, verse-support, import, and export
work should register action keys and pass through the generic action route once
explicit policy and services exist.

### Core Services

Suggested service layer:

- `AdminSchemaEntityResolver`
  - resolves `schemaFamily`, `entityType`, and id into a model plus schema
    definition
  - verifies parent/ownership context when an entity depends on canonical
    hierarchy
- `AdminSchemaFieldRegistry`
  - backend counterpart to the frontend field registry
  - declares field kind, column, payload key, validation policy, edit mode, and
    protection
- `AdminSchemaFieldUpdateController`
  - tiny controller that delegates to resolver, policy, validator, and updater
- `AdminSchemaFieldValidationPolicy`
  - validates by field kind and schema-specific rule
  - prevents quick editing protected fields such as slug, number, canonical
    order, parent relations, block type, and source relations
- `AdminSchemaFieldUpdateAction`
  - applies single-field updates with hidden/context fields removed from the
    public contract
- `AdminProtectedCanonicalPolicy`
  - centralizes canonical mutation protection and warning reasons
- `ConsciousFullEditPayloadBuilder`
  - builds Full Edit categories outside controllers and points safe editable
    fields at the generic field route
- `ConsciousActionRegistry`
  - describes possible create child, delete, reorder, duplicate, manage media,
    manage relations, and support actions without enabling them
- `ConsciousActionDispatcher`
  - resolves action definition and entity, rejects disabled actions, and calls
    the registered action handler
- `ProtectedIdentityAction`
  - policy-gated `slug` and `number` updates for supported scripture entities
- `ConsciousRelationshipRegistry`
  - describes protected parent/child metadata for diagnostics and future
    policy checks

### Protected Canonical Handling

Protected fields should be known to the backend registry even when they are
displayed in Full Edit:

- `slug`
- `number`
- canonical order / `sort_order`
- parent relation ids
- structural path fields
- block type
- relation/source fields
- media assignment structure
- JSON/meta structures unless explicitly allowed

Single-field quick edit should reject these fields. Conscious Full Edit may show
them as protected or route them to an advanced structured action later.

## Recommended Migration Order

1. Backend schema field registry, entity resolver, protected-field policy, and
   generic field update route now exist for the first safe scripture fields.
2. Schema-aware quick edit now uses the generic field route for the first safe
   scripture fields and sends `{ value }`.
3. Phase 3 import/backend audit keeps all old write endpoints but classifies
   them as transitional until Conscious services/actions replace them.
4. Conscious Full Edit safe field saves now use the generic field route.
5. Conscious Full Edit payload building is now outside
   `ConsciousFullEditController`.
6. The final action route, dispatcher, and initial action/relationship
   registries now exist.
7. Protected identity action now handles `slug` and `number` for supported
   scripture entities.
8. Migrate content block title/body updates to parent-aware schema action
   services.
9. Add Conscious structured services for verse meta, translations,
   commentaries, and media assignments.
10. Add canonical create/delete/reorder action services with protected policy
   gates.
11. Re-audit old route-specific controllers and remove or redirect only after
   no frontend payloads reference them.
