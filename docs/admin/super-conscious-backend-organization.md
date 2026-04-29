# Super Conscious Backend Organization

## Purpose

The backend should converge on a schema/action-driven Conscious Admin system.
Old route-specific scripture controllers may remain temporarily as write
services, but new admin capabilities should not grow through page-specific
controllers.

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
Edit controller, and generic field update controller.

## Current Backend Classification

### `conscious_active`

- `Admin\ConsciousFullEditController`
- `Admin\ConsciousSchemaFieldUpdateController`
- `app/Admin/Conscious/Schema/*`
- `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`
- `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`

### `transitional_write_endpoint`

- scripture identity/details update controllers
- scripture content-block controllers
- verse meta, translation, and commentary controllers
- book media-assignment controllers
- matching `app/Http/Requests/Scripture/*Admin*` request classes

These endpoints are intentionally kept until Conscious services/actions cover
their behavior.

### `redirect_only_old_full_edit`

- `BookFullEditController`
- `ChapterFullEditController`
- `VerseFullEditController`

These old GET controllers redirect to Conscious Full Edit and should not render
route-specific React pages.

### `replace_with_conscious_action`

- canonical create/delete controllers
- future add-child, delete, reorder, move/reparent, duplicate, media, relation,
  and verse-support operations

### `replace_with_conscious_service`

- route-specific validation/request classes once their rules are represented by
  field/action policies
- route context helpers once response navigation is owned by Conscious actions
- full-edit payload assembly currently centralized in the controller

## Target Routes

Current:

- `GET /admin/schema/{schemaFamily}/{entityType}/{id}/full-edit`
- `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`

Future:

- `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`

Action keys should be registered, policy checked, and schema constrained. Do
not create one route per page family for new admin behavior.

## Writing Capacity Roadmap

### Safe field update

Already started through the generic field route. It should remain limited to
registered quick-edit-safe fields.

### Full entity update

Conscious Full Edit should submit grouped field changes through field/action
services, not old route-specific identity/details controllers.

### Create child

Use registered actions such as `add_book_section`, `add_chapter`,
`add_chapter_section`, and `add_verse`. These must pass protected canonical
policy and parent/child schema checks.

### Delete entity

Use registered dangerous actions with confirmation, dependency checks, and
protected canonical policy. Do not expose casual delete from field menus.

### Reorder

Use order-group-aware actions. Canonical ordering defaults protected until a
specific workflow permits mutation.

### Move / reparent

Use protected structural actions with parent/child constraints. This must not be
field quick edit.

### Duplicate

Use action services for content blocks or CMS-like objects only when ownership,
new keys, and ordering are explicit.

### Manage media

Use media actions/pickers. Media assignment structure is not a quick-edit field.

### Manage relations

Use relation actions/pickers. Source/relation fields are not casual field quick
edit.

### Verse meta / translations / commentaries

Use structured Conscious actions or future schema groups. They should not
revive the old public module host.

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
not be casual quick-edit fields.

## Migration Order

1. Keep the generic safe field update route as the write foundation.
2. Move Conscious Full Edit field saves to the generic field route.
3. Extract Full Edit payload building into schema payload builders.
4. Add a backend Conscious action registry.
5. Move content block writes into owner-aware action services.
6. Move media, relation, translation, commentary, and verse meta writes into
   structured Conscious actions.
7. Add create/delete/reorder actions only after policy and diagnostics exist.
8. Delete old route-specific write controllers only when no frontend or
   fallback service path references them.
