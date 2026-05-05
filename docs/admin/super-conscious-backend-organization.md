# Super Conscious Backend Organization

## Purpose

The backend should converge on a schema/action-driven Conscious Admin system.
Old route-specific scripture controllers may remain temporarily as write
services, but new admin capabilities should not grow through page-specific
controllers.

Automation direction is locked in
`docs/admin/super-conscious-awareness-automation.md`: backend discovery may
suggest schema/entity/field/relationship awareness, but protected field edits
and dangerous actions remain explicit policy decisions.

## Target Structure

```text
app/Admin/Conscious/
  Schema/
    EntityDefinitions/
    FieldDefinitions/
    SchemaRegistry.php
    EntityResolver.php
  Actions/
    ActionRegistry.php
    ActionDefinition.php
    FieldUpdateAction.php
    CreateChildAction.php
    DeleteEntityAction.php
    ReorderAction.php
    MediaAction.php
    RelationAction.php
  Policies/
    ProtectedCanonicalPolicy.php
    FieldEditPolicy.php
    ActionPermissionPolicy.php
  Services/
    FieldUpdateService.php
    FullEditPayloadBuilder.php
    EntityWriteService.php
  Diagnostics/
    CoverageReporter.php
    LegacyDependencyReporter.php
```

The current implementation already has the first schema field registry,
definition, entity resolver, protected canonical field policy, Conscious Full
Edit controller, generic field update controller, field update service, Full
Edit payload builder, action dispatcher/registry, relationship registry, and
policy-gated action services for protected identity, content blocks, book media
assignments, and verse support.

## Phase 1 Backend Awareness Foundation

Phase 1 moves backend responsibility away from route-specific controllers and
into Conscious backend contracts:

- `ConsciousFullEditPayloadBuilder` builds the schema-aware Full Edit payload
  outside the controller.
- `ConsciousFieldUpdateService` validates and writes registered safe fields for
  the generic field route.
- `ConsciousActionDispatcher` resolves action definitions, rejects unknown or
  unavailable actions, resolves the entity, and calls the registered handler.
- `ConsciousActionRegistry` and `ConsciousActionDefinition` describe actions
  and their handler/policy metadata.
- `ProtectedIdentityAction` is the first enabled protected action, limited to
  `slug` and `number` for scripture book, book section, chapter, chapter
  section, and verse entities.
- `ContentBlockAction` implements the first Conscious content-block action
  family for scripture owner entities: `content_block.create`,
  `content_block.update`, and `content_block.delete`.
- `ConsciousRelationshipRegistry` and `ConsciousRelationshipDefinition`
  describe protected scripture parent/child relationships without enabling
  create, reorder, reparent, or delete.
- `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}` now
  exists as the final action route shape and safely dispatches enabled actions.
  Registered canonical create/delete/reorder/reparent placeholders remain
  disabled until explicit policy and services exist.

Old route-specific controllers are no longer treated as architecture. They are
temporary behavior providers only and must move toward one of three outcomes:

- replaced by the Conscious field route
- replaced by the Conscious action route
- deleted when no frontend or fallback behavior references them

Big Patch 4 deleted the old identity/details write controllers, their request
classes, and the redirect-only book/chapter/verse Full Edit controllers/routes
after route metadata moved to Conscious field/full-edit/action URLs.

Big Patch 5 deleted the old content-block, book media-assignment, verse meta,
verse translation, and verse commentary controllers/routes/request classes after
the remaining submit metadata moved to Conscious action URLs and a reference
audit found no app/runtime references.

Big Patch 6 moved canonical hierarchy create/delete into policy-gated
Conscious actions and deleted the old canonical create/delete
controllers/routes/request classes after metadata migration and reference
audit. Protected book canonical edit remains a separate legacy workflow.

## Future Awareness Automation Helpers

The backend may grow read-only or policy-bound helpers for automation, but these
helpers must stay separated by responsibility:

- `SchemaDiscoveryService`
- `ModelFieldIntrospector`
- `ConsciousEntityDefinitionRegistry`
- `ConsciousRelationshipRegistry`
- `ConsciousActionCapabilityRegistry`
- `ConsciousCoverageReporter`

Discovery helpers can identify candidate schema metadata such as
`schemaFamily`, `entityType`, `modelClass`, `tableName`, field kinds, labels,
relationships, validation hints, Full Edit categories, and import/export
boundaries. Explicit schema definitions override discovered conventions.

Create, reorder, reparent, delete, media, relation, import, export, and
protected canonical field edits must never become enabled only because a model,
table, route, or relation exists.

## Current Backend Classification

### `conscious_active`

- `Admin\ConsciousFullEditController`
- `Admin\ConsciousSchemaFieldUpdateController`
- `Admin\ConsciousSchemaActionController`
- `app/Admin/Conscious/Schema/*`
- `app/Admin/Conscious/Services/*`
- `app/Admin/Conscious/Actions/*`
- `app/Admin/Conscious/Relationships/*`
- `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`
- `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`
- `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`

### `transitional_write_endpoint`

- none for active scripture write families; old route-specific write endpoints
  have been deleted where Conscious replacements exist

Identity/details endpoints were deleted in Big Patch 4. Content-block,
media-assignment, and verse-support endpoints were deleted in Big Patch 5.
Canonical create/delete endpoints were deleted in Big Patch 6.

### `deleted_old_full_edit`

- `BookFullEditController`
- `ChapterFullEditController`
- `VerseFullEditController`

These old GET controllers/routes were removed in Big Patch 4. App links now
point directly to `admin.schema.full-edit`.

### `replace_with_conscious_action`

- future reorder, move/reparent, relation, import, and export operations

### `replace_with_conscious_service`

- route-specific validation/request classes once their rules are represented by
  field/action policies
- route context helpers once response navigation is owned by Conscious actions
- full-edit payload assembly currently centralized in the controller

## Target Routes

Current final route shapes:

- `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`
- `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`
- `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`

Action keys should be registered, policy checked, and schema constrained. Do
not create one route per page family for new admin behavior.

The action route rejects unavailable registered actions. It currently executes
policy-gated protected identity, owner-scoped content-block actions, book media
assignment actions, verse support actions, and canonical create/delete actions.
It does not execute canonical reorder, move/reparent, relation, import, or
export behavior yet.

## Writing Capacity Roadmap

### Safe field update

Already started through the generic field route. It should remain limited to
registered quick-edit-safe fields.

### Full entity update

Conscious Full Edit should submit grouped field changes through field/action
services, not old route-specific identity/details controllers. The first safe
Full Edit fields now point at the generic Conscious field route and submit
`value` instead of old hidden route-specific payloads.

Public scripture admin metadata now emits Conscious field URLs for safe
identity/details saves and Conscious Full Edit URLs for book, chapter, and
verse Full Edit navigation.

### Create child

Canonical create now uses registered Conscious actions:

- `canonical.create_book`
- `canonical.create_book_section`
- `canonical.create_chapter`
- `canonical.create_chapter_section`
- `canonical.create_verse`

Parent context comes from the route entity for every child create action, and
payload parent overrides are prohibited.

### Delete entity

Canonical delete now uses `canonical.delete` for book, book section, chapter,
chapter section, and verse entities. It is explicitly policy-gated and delegates
cascade behavior to `ConsciousCanonicalDeleteService`, which preserves the old
redirect destinations.

### Reorder

Use order-group-aware actions. Canonical ordering defaults protected until a
specific workflow permits mutation.

### Move / reparent

Use protected structural actions with parent/child constraints. This must not be
field quick edit.

### Duplicate

Use action services for content blocks or CMS-like objects only when ownership,
new keys, and ordering are explicit.

### Content blocks

Content-block behavior now has a Conscious action foundation:

- `content_block.create`
- `content_block.update`
- `content_block.delete`
- `content_block.duplicate`
- `content_block.reorder`

Owner route metadata now points at these action URLs for supported owners, with
existing block ids carried as action payload/query metadata. Legacy
content-block routes/controllers/request classes were deleted in Big Patch 5.
Move-up/move-down submit metadata is represented as `content_block.reorder`
with a route-owner-scoped `direction` payload.

These actions operate on content blocks owned by the current schema entity only.
The owner is inferred from the schema action route. Payloads must not provide
`parent_type`, `parent_id`, `owner_type`, or `owner_id`, and these actions must
not mutate canonical hierarchy.

### Manage media

Use media actions/pickers. Media assignment structure is not a quick-edit field.

Book media assignments now have a Conscious action foundation:

- `media_assignment.attach`
- `media_assignment.replace`
- `media_assignment.update`
- `media_assignment.detach`
- `media_assignment.reorder` registered but disabled

The owner is inferred from the route entity. This patch supports book-owned
media assignments only. Assignment ids must belong to the route book, media ids
must reference existing media records, and reorder remains disabled until
same-owner/same-role ordering policy and UI contracts are ready.

### Manage relations

Use relation actions/pickers. Source/relation fields are not casual field quick
edit.

### Verse meta / translations / commentaries

Use structured Conscious actions or future schema groups. They should not
revive the old public module host.

Verse support now has Conscious action coverage:

- `verse_support.meta.update`
- `verse_support.translation.create`
- `verse_support.translation.update`
- `verse_support.translation.delete`
- `verse_support.translation.reorder` registered but disabled
- `verse_support.commentary.create`
- `verse_support.commentary.update`
- `verse_support.commentary.delete`
- `verse_support.commentary.reorder` registered but disabled

All verse-support actions require the route entity to be `verse`. Translation
and commentary updates/deletes must target rows owned by that verse.

### Audit / activity

Add after the action registry and services are stable. Activity should observe
field/action services rather than page controllers.

## Policies

Protected canonical fields include:

- slug
- number
- parent relation ids
- canonical ordering
- structural path fields
- block type
- media assignment structure
- relation/source fields
- JSON/meta blobs unless explicitly made safe

These fields may appear in Conscious Full Edit with warnings, but they should
not be casual quick-edit fields. `slug` and `number` may save only through the
`protected_identity.update` Conscious action. Parent/reparent fields and
canonical order fields remain read-only in this patch.

## Migration Order

1. Keep the generic safe field update route as the write foundation.
2. Move Conscious Full Edit field saves to the generic field route.
3. Extract Full Edit payload building into schema payload builders.
4. Add a backend Conscious action registry.
5. Add backend relationship metadata for protected parent/child awareness.
6. Move remaining protected identity fallback usage to the Conscious action
   route where safe.
7. Done in Big Patch 5: frontend/backend submit metadata for
   content-block/media/verse-support replacements now uses Conscious actions,
   and the old route-specific endpoint families were deleted after audit.
8. Add media and verse-support reorder only after ordering policy and
   diagnostics are ready.
9. Done in Big Patch 6: add canonical create/delete actions after policy and
   service boundaries existed.
10. Delete old route-specific write controllers only when no frontend or
   fallback service path references them.
