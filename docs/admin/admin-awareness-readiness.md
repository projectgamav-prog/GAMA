# Admin Awareness Readiness

## Purpose

This note audits the current Super Conscious Admin Layer readiness before any
visible ownership transfer. It is based on the Phase F shadow comparison model:
current visible controls are summarized, resolver-decided controls are computed,
and readiness is assessed by reusable component/surface family.

No visible controls should be replaced from this audit alone.

## Readiness Scale

- `ready`: safe candidate for a narrow awareness-owned overlay trial.
- `almost_ready`: most metadata exists, but one or two ownership gaps remain.
- `structured_only`: should keep using structured modules for now.
- `insufficient_metadata`: not enough awareness or current-control metadata.
- `not_ready`: blocked by duplicate risk, missing fallback, schema protection,
  or unresolved ownership.

## Summary

Current best first ownership target:

`AdminEditableSurface` same-layout quick-edit surfaces, specifically the simple
text-like surfaces already backed by `quickEdit` metadata and a quick-edit
adapter.

Why this target:

- it is component-family based, not page based
- it already renders through the shared `AdminEditableSurface`
- resolver controls exist when quick-edit metadata is complete
- current visible control summaries exist from `AdminEditableSurface`
- placement is local and known
- edit mode is known as `quick_edit`
- Full Edit fallback can be present through `quickEdit.fullEditHref`
- the current behavior is already isolated from `AdminModuleHost` because
  `AdminModuleHost` returns `null` when a quick-edit adapter exists

Do not expand beyond this family until Phase F diagnostics show a clean handoff
for each target surface.

## Family Audit

### ScriptureIntroBlock Surfaces

Classification: `almost_ready`

Readiness:

1. Resolver controls exist: yes, when `adminSurface` includes `quickEdit` or
   edit/full-edit capabilities.
2. Current visible control summaries exist: yes, through `AdminEditableSurface`
   for quick-edit surfaces and through `AdminModuleHost` for structured
   surfaces.
3. Placement matches: mostly. The emitted awareness placement is `top-right`.
   Header variants currently emit `layoutZone: hero` but still prefer
   `top-right`.
4. Edit mode matches: yes for same-layout quick edit; structured intro editors
   remain structured.
5. Duplicate risk exists: low for quick-edit surfaces because
   `AdminModuleHost` suppresses itself when a quick-edit adapter exists.
6. Quick-edit metadata complete: only where surface builders provide
   `quickEdit.updateHref`, `fields`, `contentKind`, and adapter-supported
   content kinds.
7. Structured/full-edit fallback exists: structured module fallback exists for
   non-quick-edit intro surfaces; Full Edit exists only where metadata provides
   it.
8. Ordering/add-anchor metadata exists where needed: not needed for intro text.
9. Schema constraints block ownership: not currently emitted in enough detail to
   make this fully schema-aware.
10. Ready for awareness-owned overlay controls: not globally. Simple intro
    quick-edit surfaces are a good candidate subset.

Missing metadata:

- explicit schema constraint context for protected/readonly intro fields
- consistent Full Edit href metadata on all intro surfaces
- device/responsive placement confirmation

### ContentBlockRenderer Surfaces

Classification: `almost_ready`

Readiness:

1. Resolver controls exist: yes when `adminSurface` is present.
2. Current visible control summaries exist: yes through `AdminEditableSurface`
   for quick-edit surfaces and `AdminModuleHost` for structured surfaces.
3. Placement matches: mostly `top-right`; media blocks emit `layoutZone: media`
   but still prefer `top-right`.
4. Edit mode matches: yes for quick-edit text/quote blocks; structured/media
   cases should remain structured.
5. Duplicate risk exists: low for adapter-backed quick edit; higher for mixed
   content blocks until diagnostics confirm per-surface ownership.
6. Quick-edit metadata complete: only for text-like content kinds that match the
   quick-edit adapter.
7. Structured/full-edit fallback exists: structured fallback exists through
   current modules where capabilities qualify; Full Edit depends on metadata.
8. Ordering/add-anchor metadata exists where needed: item-level ordering context
   can flow in from the universal `content_blocks` renderer.
9. Schema constraints block ownership: not yet rich enough for complete
   schema-aware CRUD decisions.
10. Ready for awareness-owned overlay controls: quick-edit text/quote content
    blocks may be candidate surfaces; media and structured blocks are not.

Missing metadata:

- richer content-kind profiles for image/video/media behavior
- explicit structured editor registry ownership
- schema constraints for delete/manage/reorder behavior
- clearer Full Edit fallback metadata for every block family

### `content_blocks` Universal Renderer Emissions

Classification: `insufficient_metadata`

Readiness:

1. Resolver controls exist: indirectly for emitted child block surfaces; the
   order group itself is currently manifest-only.
2. Current visible control summaries exist: only for child block surfaces, not
   for the order group or anchors.
3. Placement matches: item controls are mostly `top-right`; add anchors prefer
   `between-items` or `bottom-edge` but are not visible yet.
4. Edit mode matches: item edit mode can match; add/reorder/delete modes are
   intentionally disabled.
5. Duplicate risk exists: low for pure shadow ordering, but unresolved for
   future add/reorder controls.
6. Quick-edit metadata complete: depends on child block surfaces.
7. Structured/full-edit fallback exists: child block fallback may exist; order
   group fallback is not modeled.
8. Ordering/add-anchor metadata exists where needed: yes, in shadow mode only.
9. Schema constraints block ownership: ordering is protected by default because
   mutation metadata is not registered.
10. Ready for awareness-owned overlay controls: no.

Missing metadata:

- create/reorder/delete action metadata
- accepted content types for add anchors
- backend action/fallback mapping for ordering mutations
- schema rules for block-family order groups
- duplicate-control prevention strategy for future visible add anchors

### AdminEditableSurface-Owned Surfaces

Classification: `ready` for narrow same-layout quick-edit trial

Readiness:

1. Resolver controls exist: yes when `quickEdit.mode` is `same_layout`, fields
   are editable, and an adapter matches.
2. Current visible control summaries exist: yes, emitted by
   `AdminEditableSurface`.
3. Placement matches: yes, currently `top-right`.
4. Edit mode matches: yes, `quick_edit`; Full Edit summary is `full_edit`.
5. Duplicate risk exists: low because `AdminModuleHost` suppresses itself when a
   quick-edit adapter exists.
6. Quick-edit metadata complete: yes for adapter-backed surfaces with
   `updateHref`, method, fields, and content kind.
7. Structured/full-edit fallback exists: Full Edit exists where
   `quickEdit.fullEditHref` is present.
8. Ordering/add-anchor metadata exists where needed: not required for simple
   same-layout fields.
9. Schema constraints block ownership: resolver can read schema constraints, but
   most current surfaces do not yet emit rich constraints.
10. Ready for awareness-owned overlay controls: yes for the narrow subset where
    Phase F marks readiness cleanly.

Recommended first target:

Use this family for the first ownership trial, not a page. The trial should
target simple text-like same-layout quick-edit surfaces that already pass
adapter matching and have current/resolver control agreement.

Risks:

- missing Full Edit href on some surfaces
- incomplete schema constraints
- current quick-edit save/discard behavior must remain identical
- duplicate controls must stay prevented

### AdminModuleHost Structured Surfaces

Classification: `structured_only`

Readiness:

1. Resolver controls exist: yes for surfaces with edit/create/manage/delete/full
   edit capabilities.
2. Current visible control summaries exist: yes, emitted by `AdminModuleHost`.
3. Placement matches: partially. Current `inline/header/dropdown` placements are
   mapped into awareness placements, but this is still approximate.
4. Edit mode matches: mostly `structured_editor`, with `drawer` and `full_edit`
   where declared.
5. Duplicate risk exists: medium. Multiple modules may qualify for one surface,
   and resolver ownership may classify mixed paths.
6. Quick-edit metadata complete: not relevant for structured-only surfaces.
7. Structured/full-edit fallback exists: yes through existing module editors and
   action definitions.
8. Ordering/add-anchor metadata exists where needed: only for families that emit
   ordering context.
9. Schema constraints block ownership: not yet fully registered by schema
   family.
10. Ready for awareness-owned overlay controls: no. Keep these on the existing
    structured module host until schema/structured-editor ownership is richer.

Missing metadata:

- structured editor registry ownership per action family
- exact placement mapping from module actions to future overlay placements
- schema-aware protected mutation reasons
- module-level fallback declarations

### Other Emitted Awareness Surface Families

Classification: `insufficient_metadata`

This currently includes any future or indirect surfaces emitted through shared
renderers without full current-control summaries, schema constraints, or
fallback metadata.

Before ownership transfer, each family needs:

- resolver controls
- visible-control summaries
- placement agreement
- mode agreement
- duplicate-risk diagnostics
- fallback metadata
- schema constraints
- user/permission awareness where relevant

## Ready Families

- `AdminEditableSurface` same-layout quick-edit surfaces with complete metadata
  and matching adapters.

## Almost Ready Families

- `ScriptureIntroBlock` quick-edit intro surfaces.
- `ContentBlockRenderer` text/quote quick-edit surfaces.

These are almost ready because they already flow through
`AdminEditableSurface`, but they still need richer schema constraints and a
surface-by-surface Phase F readiness check before ownership transfer.

## Blocked Families

- `AdminModuleHost` structured surfaces: keep structured-only for now.
- `content_blocks` ordering/add-anchor surfaces: shadow metadata exists, but no
  visible ownership should transfer.
- media blocks: keep structured/manage-media behavior for now.
- relation surfaces: keep structured modules for now.
- canonical ordering surfaces: protected by default.

## Missing Metadata Before Ownership

- richer schema constraints per schema family
- Full Edit fallback metadata consistency
- structured editor registry ownership per action
- exact current-to-resolver placement mapping for structured modules
- create/reorder/delete action metadata for block lists
- allowed content types for add anchors
- user/role/permission awareness
- activity/audit/workflow awareness
- device/responsive placement strategy

## Recommended First Ownership Target

First target:

`AdminEditableSurface` same-layout quick-edit controls for simple text-like
surfaces.

This target is component-family based because it applies to every renderer that
emits a compatible surface and delegates to `AdminEditableSurface`. It is not
tied to book, chapter, verse, topic, character, or any route page.

Recommended trial boundary:

- only adapter-backed quick-edit surfaces
- only `quick_edit` and optional `full_edit` controls
- no create/reorder/delete/manage controls
- no media or relation controls
- no canonical ordering behavior
- no page-specific overrides

## Risks Before Visible Ownership Transfer

- duplicate controls if ownership suppression is not exact
- subtle save/discard regressions in same-layout editing
- missing fallback links on some surfaces
- incomplete schema constraints may expose controls too eagerly
- structured module surfaces still have mixed ownership semantics
- add anchors are not ready for visible controls
- current placement mapping for structured modules is approximate

## Phase G Gate

Phase G should not begin with a page. It should begin with a component-family
trial for the narrow `AdminEditableSurface` same-layout quick-edit subset, and
only after diagnostics show:

- resolver controls match current controls
- placement matches
- edit mode matches
- duplicate risk is absent
- fallback behavior is present
- schema constraints do not block the action

## Phase G1 Validation Note

The first ownership trial is active only for the `AdminEditableSurface`
same-layout quick-edit family.

Validation tightened the ownership classifier so `quick_edit` plus a `full_edit`
fallback is not treated as mixed ownership. Full Edit is allowed as a fallback
inside this family. `quick_edit` plus `structured_editor` remains mixed and must
not pass the G1 gate.

The gate remains fallback-safe: if resolver data, comparison readiness, adapter
matching, placement, mode, or schema safety is missing, the component keeps the
previous local controls.
