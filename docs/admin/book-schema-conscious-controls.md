# Book Schema Conscious Admin Control Catalog

This catalog defines the future Conscious Admin action map for the active book
schema. It is a planning and safety document. It does not add visible controls.

The current visible Conscious Admin menu may expose only actions with a working
Conscious Admin path. Today that means:

- safe schema-field `Edit`
- schema-aware `Full Edit`

All create, delete, reorder, media, relation, support-entry, and protected
canonical actions remain hidden until their Conscious backend route/service and
resolver policy are implemented.

## Classification Fields

Each action is classified by:

- `entityType`: schema entity that owns the action
- `action key`: stable action identifier
- `human label`: employee-facing label
- `action family`: edit, full_edit, identity, create, reorder, delete, manage,
  duplicate, move
- `control level`: field, entity, card, section, region, or page
- `menu placement`: preferred local menu/anchor placement
- `preferred UI`: inline, modal, drawer, full edit category, confirmation
- `backend status`: available_now, old_endpoint_only, needs_conscious_backend,
  or future
- `risk level`: safe, protected, or dangerous
- `show now`: whether it may appear in the three-dot menu now
- `backend route/service`: route/service needed to execute the action
- `Full Edit category`: related Conscious Full Edit category
- `old backend dependency`: whether old route-specific endpoints still exist
- `notes`: implementation guidance

## Global Rules

- Quick edit is only for safe human-facing fields.
- Quick edit may not edit `slug`, `number`, canonical ordering, `sort_order`,
  parent relations, `block_type`, status/workflow fields, relation/source
  fields, media assignment structures, or JSON/meta structures.
- Protected canonical changes require Full Edit category review or a dedicated
  protected action workflow.
- Delete, reparent, and reorder actions require confirmation and protected
  workflow gates.
- Do not expose an action in the three-dot menu until its Conscious backend path
  is ready.
- Old backend endpoints may remain as temporary service seams, but new visible
  controls must not depend on old UI architecture.

## Ready Now

| entityType | action key | label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| book | `book.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | `PATCH /admin/schema/scripture/book/{id}/fields/title` | Basic Content | no for quick edit | Payload `{ value }`. |
| book | `book.field.description.edit` | Edit description | edit | field | field top-right menu | modal | available_now | safe | yes | `PATCH /admin/schema/scripture/book/{id}/fields/description` | Basic Content | no for quick edit | Payload `{ value }`. |
| book_section | `book_section.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | `PATCH /admin/schema/scripture/book_section/{id}/fields/title` | Basic Content | no for quick edit | Payload `{ value }`. |
| chapter | `chapter.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | `PATCH /admin/schema/scripture/chapter/{id}/fields/title` | Basic Content | no for quick edit | Payload `{ value }`. |
| chapter_section | `chapter_section.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | `PATCH /admin/schema/scripture/chapter_section/{id}/fields/title` | Basic Content | no for quick edit | Payload `{ value }`. |
| verse | `verse.field.text.edit` | Edit verse text | edit | field | field top-right menu | modal | available_now | safe | yes | `PATCH /admin/schema/scripture/verse/{id}/fields/text` | Basic Content | no for quick edit | Payload `{ value }`. |
| book | `book.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | `GET /admin/schema/scripture/book/{id}/full-edit` | all categories | old fallback link may exist | Conscious route only. |
| book_section | `book_section.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | `GET /admin/schema/scripture/book_section/{id}/full-edit` | all categories | old fallback may exist | Conscious route only. |
| chapter | `chapter.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | `GET /admin/schema/scripture/chapter/{id}/full-edit` | all categories | old fallback link may exist | Conscious route only. |
| chapter_section | `chapter_section.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | `GET /admin/schema/scripture/chapter_section/{id}/full-edit` | all categories | old fallback may exist | Conscious route only. |
| verse | `verse.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | `GET /admin/schema/scripture/verse/{id}/full-edit` | all categories | old fallback link may exist | Conscious route only. |

## Book Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `book.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | generic field route | Basic Content | no quick-edit dependency | Safe quick edit. |
| `book.field.description.edit` | Edit description | edit | field | field top-right menu | modal | available_now | safe | yes | generic field route | Basic Content | no quick-edit dependency | Safe quick edit. |
| `book.full_edit` | Full Edit | full_edit | entity | entity/menu secondary | full edit category | available_now | protected | yes | Conscious Full Edit route | all categories | deprecated fallback exists | Whole-record review. |
| `book.identity.edit` | Edit canonical identity | identity | entity | entity menu | full edit category or protected drawer | old_endpoint_only | protected | no | future protected identity service | Canonical Identity | `BookAdminIdentityController` | Covers slug/number. Not quick edit. |
| `book.book_section.create` | Add book section | create | section | section header / bottom-edge | modal | needs_conscious_backend | protected | no | future child create service | Structure & Parentage | old create endpoint exists | Needs hierarchy policy. |
| `book.book_sections.reorder` | Reorder book sections | reorder | section | section between-items | drawer or ordering mode | needs_conscious_backend | protected | no | future order service | Ordering | old structural endpoints exist | Canonical ordering protected. |
| `book.delete` | Delete book | delete | entity | entity danger group | confirmation | needs_conscious_backend | dangerous | no | future delete action service | Advanced / Technical | old delete endpoint exists | Requires strong confirmation. |
| `book.content_blocks.manage` | Manage book content blocks | manage | region | region/menu | drawer or full edit category | old_endpoint_only | protected | no | future block action service | Support Data | old content block controller exists | Current block backend is transitional. |
| `book.media.manage` | Manage book media assignments | manage | region | region/menu | drawer/media picker | old_endpoint_only | protected | no | future media assignment service | Media | old media assignment controller exists | Media structure is not field quick edit. |

## Book Section Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `book_section.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | generic field route | Basic Content | no quick-edit dependency | Safe quick edit. |
| `book_section.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | Conscious Full Edit route | all categories | deprecated fallback may exist | Whole-record review. |
| `book_section.identity.edit` | Edit canonical identity | identity | entity | entity menu | protected drawer or full edit category | old_endpoint_only | protected | no | future protected identity service | Canonical Identity | old details endpoint handles some fields | Covers slug/number/parent context. |
| `book_section.chapter.create` | Add chapter | create | section | section header / bottom-edge | modal | needs_conscious_backend | protected | no | future child create service | Structure & Parentage | old create endpoint exists | Needs parent book section policy. |
| `book_section.chapters.reorder` | Reorder chapters | reorder | section | between-items | ordering mode | needs_conscious_backend | protected | no | future order service | Ordering | old structural endpoints exist | Canonical order protected. |
| `book_section.move` | Move/reparent section | move | entity | entity advanced group | drawer/confirmation | needs_conscious_backend | dangerous | no | future reparent service | Structure & Parentage | none as Conscious service | Must preserve canonical hierarchy. |
| `book_section.delete` | Delete section | delete | entity | entity danger group | confirmation | needs_conscious_backend | dangerous | no | future delete action service | Advanced / Technical | old delete endpoint exists | Requires child-impact warning. |

## Chapter Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `chapter.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | generic field route | Basic Content | no quick-edit dependency | Safe quick edit. |
| `chapter.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | Conscious Full Edit route | all categories | deprecated fallback exists | Whole-record review. |
| `chapter.identity.edit` | Edit canonical identity | identity | entity | entity menu | protected drawer or full edit category | old_endpoint_only | protected | no | future protected identity service | Canonical Identity | `ChapterAdminIdentityController` | Covers slug/number. |
| `chapter.chapter_section.create` | Add chapter section | create | section | section header / bottom-edge | modal | needs_conscious_backend | protected | no | future child create service | Structure & Parentage | old create endpoint exists | Needs chapter parent policy. |
| `chapter.chapter_sections.reorder` | Reorder chapter sections | reorder | section | between-items | ordering mode | needs_conscious_backend | protected | no | future order service | Ordering | old structural endpoints exist | Canonical order protected. |
| `chapter.move` | Move/reparent chapter | move | entity | entity advanced group | drawer/confirmation | needs_conscious_backend | dangerous | no | future reparent service | Structure & Parentage | none as Conscious service | Must preserve book-section hierarchy. |
| `chapter.delete` | Delete chapter | delete | entity | entity danger group | confirmation | needs_conscious_backend | dangerous | no | future delete action service | Advanced / Technical | old delete endpoint exists | Requires child-impact warning. |
| `chapter.content_blocks.manage` | Manage chapter content blocks | manage | region | region/menu | drawer or full edit category | old_endpoint_only | protected | no | future block action service | Support Data | old content block controller exists | Transitional backend. |

## Chapter Section Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `chapter_section.field.title.edit` | Edit title | edit | field | field top-right menu | modal | available_now | safe | yes | generic field route | Basic Content | no quick-edit dependency | Safe quick edit. |
| `chapter_section.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | Conscious Full Edit route | all categories | deprecated fallback may exist | Whole-record review. |
| `chapter_section.identity.edit` | Edit canonical identity | identity | entity | entity menu | protected drawer or full edit category | old_endpoint_only | protected | no | future protected identity service | Canonical Identity | old details endpoint handles some fields | Covers slug/number/parent context. |
| `chapter_section.verse.create` | Add verse | create | section | section header / bottom-edge | modal | needs_conscious_backend | protected | no | future child create service | Structure & Parentage | old create endpoint exists | Needs canonical verse policy. |
| `chapter_section.verses.reorder` | Reorder verses | reorder | section | between-items | ordering mode | needs_conscious_backend | protected | no | future order service | Ordering | old structural endpoints exist | Canonical order protected. |
| `chapter_section.move` | Move/reparent section | move | entity | entity advanced group | drawer/confirmation | needs_conscious_backend | dangerous | no | future reparent service | Structure & Parentage | none as Conscious service | Must preserve chapter hierarchy. |
| `chapter_section.delete` | Delete section | delete | entity | entity danger group | confirmation | needs_conscious_backend | dangerous | no | future delete action service | Advanced / Technical | old delete endpoint exists | Requires verse-impact warning. |

## Verse Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `verse.field.text.edit` | Edit verse text | edit | field | field top-right menu | modal | available_now | safe | yes | generic field route | Basic Content | no quick-edit dependency | Safe human-facing text field. |
| `verse.full_edit` | Full Edit | full_edit | entity | field/entity menu | full edit category | available_now | protected | yes | Conscious Full Edit route | all categories | deprecated fallback exists | Whole-record review. |
| `verse.identity.edit` | Edit canonical identity | identity | entity | entity menu | protected drawer or full edit category | old_endpoint_only | protected | no | future protected identity service | Canonical Identity | `VerseAdminIdentityController` | Covers slug/number; not quick edit. |
| `verse.meta.manage` | Manage verse meta | manage | entity | entity/support group | drawer or full edit category | old_endpoint_only | protected | no | future meta service | Support Data | `VerseAdminMetaController` | Dialogue/tone/etc. need schema grouping. |
| `verse.translations.manage` | Manage translations | manage | section | section/menu | drawer/list editor | old_endpoint_only | protected | no | future translation service | Relations / Support Data | old translation controller exists | Structured list, not field quick edit. |
| `verse.commentaries.manage` | Manage commentaries | manage | section | section/menu | drawer/list editor | old_endpoint_only | protected | no | future commentary service | Relations / Support Data | old commentary controller exists | Structured list, not field quick edit. |
| `verse.content_blocks.manage` | Manage verse content blocks | manage | region | region/menu | drawer or full edit category | old_endpoint_only | protected | no | future block action service | Support Data | old content block controller exists | Transitional backend. |
| `verse.support_entries.create` | Add support entry | create | section | section header / bottom-edge | modal | needs_conscious_backend | protected | no | future support-entry service | Support Data | old specific controllers exist | Must know support type. |
| `verse.support_entries.delete` | Delete support entry | delete | card | card danger group | confirmation | needs_conscious_backend | dangerous | no | future support-entry service | Support Data | old specific controllers exist | Needs ownership and impact copy. |
| `verse.support_entries.reorder` | Reorder support entries | reorder | section | between-items | ordering mode | needs_conscious_backend | protected | no | future order service | Ordering | none as generic Conscious service | Must be per support family. |
| `verse.delete` | Delete verse | delete | entity | entity danger group | confirmation | needs_conscious_backend | dangerous | no | future delete action service | Advanced / Technical | old delete endpoint exists | Requires canonical impact warning. |

## Content Block Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `content_block.field.title.edit` | Edit block title | edit | field | field top-right menu | modal | needs_conscious_backend | safe | no | future parent-aware block field route | Basic Content | old content block controllers exist | Frontend may know field, backend generic route not ready. |
| `content_block.field.body.edit` | Edit block body | edit | field | field top-right menu | modal | needs_conscious_backend | safe | no | future parent-aware block field route | Basic Content | old content block controllers exist | Needs owner context. |
| `content_block.full_edit` | Full Edit block | full_edit | card/block | block menu | full edit category | available_now | protected | no | Conscious Full Edit route is read-only first slice | all categories | old full-edit/block tools exist | Show only when editable backend exists. |
| `content_block.duplicate` | Duplicate block | duplicate | card/block | block menu | modal/confirmation | old_endpoint_only | protected | no | future block action service | Advanced / Technical | old duplicate helpers exist | Needs Conscious action route. |
| `content_block.delete` | Delete block | delete | card/block | block danger group | confirmation | old_endpoint_only | dangerous | no | future block action service | Advanced / Technical | old block controllers exist | Must confirm owner/region. |
| `content_block.reorder` | Reorder block | reorder | section | between-items | ordering mode | old_endpoint_only | protected | no | future order service | Ordering | old reorder helpers exist | Existing shadow ordering awareness is inert. |
| `content_block.move_region` | Move block to region | move | block/region | block advanced group | drawer | future | protected | no | future region move service | Structure & Parentage | none as generic Conscious service | Needs region registry. |
| `content_block.type_config.edit` | Edit block type/config/status | manage | block/entity | block advanced group | full edit category | old_endpoint_only | protected | no | future block config service | Advanced / Technical | old block controllers exist | `block_type` and status are not quick edit. |

## Media Assignment Actions

| action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `media_assignment.attach` | Attach media | manage | region/card | media region menu | media picker drawer | old_endpoint_only | protected | no | future media assignment service | Media | old media assignment controller exists | Not a field quick edit. |
| `media_assignment.replace` | Replace media | manage | card | media card menu | media picker drawer | old_endpoint_only | protected | no | future media assignment service | Media | old controller exists | Requires media picker confidence. |
| `media_assignment.overrides.edit` | Edit media overrides | edit | card/field | media card menu | modal/drawer | old_endpoint_only | protected | no | future media assignment service | Media | old controller exists | Caption/title override may become safe later. |
| `media_assignment.remove` | Remove assignment | delete | card | media danger group | confirmation | old_endpoint_only | dangerous | no | future media assignment service | Media | old controller exists | Must not delete media asset unless explicit. |
| `media_assignment.reorder` | Reorder media slot | reorder | section | between-items | ordering mode | needs_conscious_backend | protected | no | future order service | Ordering | old slot ordering may exist | Needs slot/order policy. |

## Verse Meta / Translation / Commentary Domains

| entityType | action key | human label | family | level | placement | UI | backend status | risk | show now | route/service | Full Edit category | old dependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| verse_meta | `verse_meta.manage` | Manage verse meta | manage | entity | support menu | drawer/full edit category | old_endpoint_only | protected | no | future verse meta service | Support Data | old meta controller exists | Needs field registry before visible actions. |
| verse_translation | `verse_translation.create` | Add translation | create | section | section header | modal/list editor | old_endpoint_only | protected | no | future translation service | Relations / Support Data | old controller exists | Structured list. |
| verse_translation | `verse_translation.edit` | Edit translation | edit | card/field | card menu | drawer/list editor | old_endpoint_only | protected | no | future translation service | Relations / Support Data | old controller exists | Translation text not migrated to quick edit yet. |
| verse_translation | `verse_translation.delete` | Delete translation | delete | card | card danger group | confirmation | old_endpoint_only | dangerous | no | future translation service | Relations / Support Data | old controller exists | Requires confirmation. |
| verse_commentary | `verse_commentary.create` | Add commentary | create | section | section header | modal/list editor | old_endpoint_only | protected | no | future commentary service | Relations / Support Data | old controller exists | Structured list. |
| verse_commentary | `verse_commentary.edit` | Edit commentary | edit | card/field | card menu | drawer/list editor | old_endpoint_only | protected | no | future commentary service | Relations / Support Data | old controller exists | Commentary content not migrated to quick edit yet. |
| verse_commentary | `verse_commentary.delete` | Delete commentary | delete | card | card danger group | confirmation | old_endpoint_only | dangerous | no | future commentary service | Relations / Support Data | old controller exists | Requires confirmation. |

## Future Registry Shape

The TypeScript Conscious Admin action registry now exists as an inert shared
foundation under `resources/js/admin/actions/`. It starts with ready definitions
for safe field `Edit` and Conscious `Full Edit`, plus hidden placeholders for
future catalog actions. The PHP action registry remains future work.

Action registries should remain inert metadata first and visible UI second.

### TypeScript Shape

```ts
type ConsciousAdminActionDefinition = {
    key: string;
    schemaFamily: 'scripture' | string;
    entityType: string;
    capability:
        | 'edit'
        | 'full_edit'
        | 'create'
        | 'reorder'
        | 'delete'
        | 'manage'
        | 'move'
        | 'duplicate';
    uiMode:
        | 'inline'
        | 'modal'
        | 'drawer'
        | 'full_edit_category'
        | 'confirmation'
        | 'disabled';
    backendAction:
        | { type: 'field_route'; fieldName: string }
        | { type: 'schema_action'; actionKey: string }
        | { type: 'conscious_full_edit' }
        | { type: 'old_endpoint_fallback'; routeName: string }
        | { type: 'none' };
    risk: 'safe' | 'protected' | 'dangerous';
    controlLevel: 'field' | 'entity' | 'card' | 'section' | 'region' | 'page';
    menuGroup: 'content' | 'identity' | 'structure' | 'media' | 'relations' | 'danger';
    fullEditCategory:
        | 'Basic Content'
        | 'Canonical Identity'
        | 'Structure & Parentage'
        | 'Ordering'
        | 'Publishing / Visibility'
        | 'Media'
        | 'Relations'
        | 'Support Data'
        | 'Advanced / Technical';
    showInSurfaceMenu: boolean;
    requiresConfirmation?: boolean;
    protectedReason?: string;
};
```

### PHP Shape

```php
final class ConsciousAdminActionDefinition
{
    public function __construct(
        public readonly string $key,
        public readonly string $schemaFamily,
        public readonly string $entityType,
        public readonly string $capability,
        public readonly string $uiMode,
        public readonly string $backendAction,
        public readonly string $risk,
        public readonly string $controlLevel,
        public readonly string $menuGroup,
        public readonly string $fullEditCategory,
        public readonly bool $showInSurfaceMenu = false,
        public readonly bool $requiresConfirmation = false,
        public readonly ?string $protectedReason = null,
    ) {}
}
```

The PHP registry should authorize and execute actions. The TypeScript registry
should describe available UI affordances and menu grouping. Both must share
stable action keys.

## Recommended Implementation Order

1. Keep the current Phase 1 menu limited to safe field `Edit` and `Full Edit`.
2. Move Conscious Full Edit field saves to the generic field route.
3. Extract the Conscious Full Edit payload/category builder into reusable schema
   metadata services.
4. Add inert TypeScript/PHP action registry definitions from this catalog.
5. Implement protected canonical identity actions for book, book section,
   chapter, chapter section, and verse.
6. Implement child create services in hierarchy order:
   book section, chapter, chapter section, verse.
7. Implement ordering services with canonical protection and diagnostics.
8. Implement content block parent-aware field/update/action services.
9. Implement media assignment Conscious services.
10. Implement verse meta, translation, and commentary structured services.
11. Add delete actions last, with confirmation and child-impact warnings.
