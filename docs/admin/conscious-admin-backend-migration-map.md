# Conscious Admin Backend Migration Map

This audit classifies current admin write endpoints by their relationship to
the new Super Conscious Admin layer. Do not delete backend code from this map
without a separate implementation task and fresh usage check.

## Classification Legend

- `keep`: actively used by schema-aware quick edit or Conscious Full Edit.
- `legacy UI only`: tied to old visible admin modules or route-specific screens.
- `replace soon`: still useful behavior, but should move behind Conscious Admin
  schema/field/action services.
- `deleted`: removed after a reference audit proved Conscious replacements are
  the active route metadata.
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

## Active Conscious Admin Content Block Action Foundation

| Route/action key | Classification | Notes |
| --- | --- | --- |
| `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/content_block.create` | keep | Creates a content block owned by the current scripture schema entity. Owner is inferred from the route. |
| `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/content_block.update` | keep | Updates an owned block by `content_block_id`. Rejects ownership payloads and `sort_order`. |
| `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/content_block.delete` | keep | Deletes only a block owned by the current scripture schema entity and normalizes owner ordering. |
| `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/content_block.duplicate` | keep | Duplicates only a block owned by the current scripture schema entity. |
| `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/content_block.reorder` | keep | Reorders only within the same owner and region. |

Supported owner entities:

- `book`
- `book_section`
- `chapter`
- `chapter_section`
- `verse`

Policy rules:

- owner entity must be one of the supported scripture entities
- content block owner must match the route entity for update/delete
- `block_type` is limited to `text`, `quote`, and `image`
- `region` must be a stable region key
- payload must not provide `parent_type`, `parent_id`, `owner_type`,
  `owner_id`, `schema_family`, `entity_type`, or `entity_id`
- update does not accept `sort_order`
- no canonical hierarchy mutation is performed

## Active Conscious Admin Media Assignment Action Foundation

| Route/action key | Classification | Notes |
| --- | --- | --- |
| `media_assignment.attach` | keep | Book-only media assignment creation. Owner is inferred from route. |
| `media_assignment.replace` | keep | Replaces `media_id` on an assignment owned by the route book. |
| `media_assignment.update` | keep | Updates book-owned assignment metadata. |
| `media_assignment.detach` | keep | Deletes only an assignment owned by the route book. |
| `media_assignment.reorder` | disabled_placeholder | Registered for awareness only until same-owner/same-role ordering policy is ready. |

## Active Conscious Admin Verse Support Action Foundation

| Route/action key | Classification | Notes |
| --- | --- | --- |
| `verse_support.meta.update` | keep | Updates or creates the `verse_meta` row for the route verse. |
| `verse_support.translation.create` | keep | Creates a translation owned by the route verse. |
| `verse_support.translation.update` | keep | Updates a translation owned by the route verse. |
| `verse_support.translation.delete` | keep | Deletes a translation owned by the route verse. |
| `verse_support.translation.reorder` | disabled_placeholder | Registered for awareness only until ordering policy is ready. |
| `verse_support.commentary.create` | keep | Creates a commentary owned by the route verse. |
| `verse_support.commentary.update` | keep | Updates a commentary owned by the route verse. |
| `verse_support.commentary.delete` | keep | Deletes a commentary owned by the route verse. |
| `verse_support.commentary.reorder` | disabled_placeholder | Registered for awareness only until ordering policy is ready. |

## Route Usage Migration Big Patch 4

Scripture admin route metadata now emits Conscious URLs for replacement-backed
field, Full Edit, content-block, media-assignment, and verse-support actions.

- Safe field metadata emits
  `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`.
- Full Edit metadata emits
  `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`.
- Content-block, book media-assignment, verse meta, translation, and commentary
  metadata emits
  `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`.
- Existing item action URLs include the item id as query metadata, such as
  `content_block_id`, `media_assignment_id`, `translation_id`, or
  `commentary_id`, while owner identity still comes only from the schema route.

Deleted after audit:

- old identity/details routes and controllers for book, book section, chapter,
  chapter section, and verse
- old redirect-only book/chapter/verse Full Edit routes and controllers
- old identity/details request classes for those deleted controllers

Retained:

- canonical create/delete routes because Conscious canonical actions do not
  exist yet
- protected book canonical edit workflow
- topic/character postponed admin routes

## Editorial / Support Route Migration Big Patch 5

Remaining content-block move-up/move-down metadata now submits to
`content_block.reorder` with `direction=up|down`, while owner context still
comes only from the schema action route. A follow-up reference audit found no
app/runtime references to the old content-block, book media-assignment, verse
meta, translation, or commentary route names once generated route helper output
was excluded.

Deleted after audit:

- old content-block routes/controllers/request classes for book, book section,
  chapter, chapter section, and verse owners
- old book media-assignment routes/controller/request classes
- old verse meta, translation, and commentary routes/controllers/request
  classes

Retained:

- canonical create/delete routes because Conscious canonical actions do not
  exist yet
- protected book canonical edit workflow
- admin-context visibility route
- topic/character postponed admin routes

## Scripture Entity Field Writes

| Route name | Method/path | Controller | Classification | Current Conscious usage | Future target |
| --- | --- | --- | --- | --- | --- |
| `scripture.books.admin.identity.update` | `PATCH books/{book}/admin/identity` | deleted | deleted | Book title metadata now uses the Conscious field route; slug/number use `protected_identity.update`. | Done. |
| `scripture.books.admin.details.update` | `PATCH books/{book}/admin/details` | deleted | deleted | Book description metadata now uses the Conscious field route. | Done. |
| `scripture.book-sections.admin.details.update` | `PATCH books/{book}/sections/{bookSection}/admin/details` | deleted | deleted | Book section title metadata now uses the Conscious field route. | Done. |
| `scripture.chapters.admin.identity.update` | `PATCH books/{book}/sections/{bookSection}/chapters/{chapter}/admin/identity` | deleted | deleted | Chapter title metadata now uses the Conscious field route; slug/number use `protected_identity.update`. | Done. |
| `scripture.chapter-sections.admin.details.update` | `PATCH books/{book}/sections/{bookSection}/chapters/{chapter}/sections/{chapterSection}/admin/details` | deleted | deleted | Chapter section title metadata now uses the Conscious field route. | Done. |
| `scripture.chapters.verses.admin.identity.update` | `PATCH books/{book}/sections/{bookSection}/chapters/{chapter}/sections/{chapterSection}/verses/{verse}/admin/identity` | deleted | deleted | Verse text metadata now uses the Conscious field route; slug/number use `protected_identity.update`. | Done. |

These old identity/details routes were removed in Big Patch 4. Schema-aware
quick edit and Conscious Full Edit safe field saves use the generic Conscious
field route; protected slug/number saves remain action-gated.

## Deprecated Full Edit / Canonical Screens

| Route name | Method/path | Controller | Classification | Notes |
| --- | --- | --- | --- | --- |
| `scripture.books.admin.full-edit` | `GET books/{book}/admin/full-edit` | deleted | deleted | App links now use Conscious Full Edit directly. |
| `scripture.books.admin.canonical-edit` | `GET books/{book}/admin/canonical-edit` | `BookCanonicalEditController@show` | replace soon | Canonical identity behavior should become a protected Conscious Admin workflow. |
| `scripture.chapters.admin.full-edit` | `GET .../chapters/{chapter}/admin/full-edit` | deleted | deleted | App links now use Conscious Full Edit directly. |
| `scripture.chapters.verses.admin.full-edit` | `GET .../verses/{verse}/admin/full-edit` | deleted | deleted | App links now use Conscious Full Edit directly. |
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
| Book content blocks | deleted | deleted | Metadata uses `content_block.*` Conscious actions. |
| Book section content blocks | deleted | deleted | Metadata uses `content_block.*` Conscious actions. |
| Chapter content blocks | deleted | deleted | Metadata uses `content_block.*` Conscious actions. |
| Chapter section content blocks | deleted | deleted | Metadata uses `content_block.*` Conscious actions. |
| Verse content blocks | deleted | deleted | Metadata uses `content_block.*` Conscious actions. |

The Conscious Full Edit shell currently displays direct `content_block` records
as read-only, but owner-level route metadata now points at Conscious action
routes for creating, updating, deleting, duplicating, and reordering content
blocks from supported scripture owner entities. Old controllers/routes/request
classes were deleted in Big Patch 5 after reference audit.

## Verse Support Data

| Route family | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `scripture.chapters.verses.admin.meta.update` | deleted | deleted | Metadata uses `verse_support.meta.update`. |
| `scripture.chapters.verses.admin.translations.*` | deleted | deleted | Metadata uses `verse_support.translation.create/update/delete`; reorder remains disabled. |
| `scripture.chapters.verses.admin.commentaries.*` | deleted | deleted | Metadata uses `verse_support.commentary.create/update/delete`; reorder remains disabled. |

## Media Assignment Writes

| Route family | Controller | Classification | Notes |
| --- | --- | --- | --- |
| `scripture.books.admin.media-assignments.*` | deleted | deleted | Metadata uses `media_assignment.attach/replace/update/detach`; reorder remains disabled. |

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
- `ContentBlockAction`
  - policy-gated owner-scoped create/update/delete/duplicate/reorder for
    scripture content blocks
- `ConsciousContentBlockPolicy`
  - validates supported owners, owned block mutation, allowed block types,
    region keys, and rejected ownership payloads
- `MediaAssignmentAction`
  - policy-gated book-owned attach/replace/update/detach for media assignments
- `ConsciousMediaAssignmentPolicy`
  - validates book ownership, media assignment ownership, and allowed roles
- `VerseMetaAction`
  - policy-gated verse-only metadata update/create
- `VerseTranslationAction`
  - policy-gated verse-owned translation create/update/delete
- `VerseCommentaryAction`
  - policy-gated verse-owned commentary create/update/delete
- `ConsciousVerseSupportPolicy`
  - validates verse ownership for support rows
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
8. Content-block create/update/delete/duplicate/reorder now have Conscious
   owner-scoped action services.
9. Media assignment attach/replace/update/detach now have Conscious book-owned
   action services; media reorder remains disabled.
10. Verse meta, translation, and commentary create/update/delete support now
   have Conscious verse-owned action services; support reorder remains disabled.
11. Done in Big Patch 5: remove old content-block/media/verse-support
   routes/controllers/requests after submit metadata migration and audit.
12. Add canonical create/delete/reorder action services with protected policy
   gates.
13. Re-audit old route-specific controllers and remove or redirect only after
   no frontend payloads reference them.
