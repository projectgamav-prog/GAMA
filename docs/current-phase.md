# Current Phase

## Active Phase

Universal rendering foundation from the cleaned chronicle base.

## What This Means

The broad cleanup/refactor wave is complete enough to pause, the locked
chronicle public design is complete, and the next architecture phase has
started.

The project is no longer in the old controller-payload-extraction phase. The
current phase is:

- keep the cleaned architecture truthful
- avoid reopening healthy cleanup areas for purity
- reassess only when a real pressure point reappears
- introduce one universal rendering/editing foundation without redesigning
  public pages
- keep route page files as thin adapters over shared rendering contracts
- continue selective validation of active editing paths as product-facing UI
  changes land

Super Conscious Admin Layer now includes the first Conscious Full Edit
foundation:

- the visible legacy `AdminModuleHost` public-page UI is quarantined as a no-op
  compatibility shim so old black module launchers and inline structured panels
  cannot render through the public-page host path
- awareness-owned schema field Full Edit controls should prefer the new
  `/admin/schema/{schemaFamily}/{entityType}/{id}/full-edit` route where a
  supported schema entity exists
- admin-aware layout anchors are now being introduced as the structural layer
  for future clean control placement
- reusable renderers should expose page/region/section/card/block/field anchor
  levels and slots instead of placing buttons in route pages
- the old route-specific Full Edit pages are deprecated fallback tooling, not
  the primary path for new awareness-owned controls
- the first Conscious Full Edit shell is schema-aware and field-category driven
  for book, book section, chapter, chapter section, verse, and read-only
  content-block records
- inline quick edit remains the path for one safe field in place
- Conscious Full Edit is the path for broader entity-record review and protected
  canonical field visibility
- old structured module components and backend write endpoints remain in the
  codebase as transitional service/fallback seams, but they are not the active
  visible public scripture admin layer
- the first backend Conscious Admin field update foundation is now in place for
  safe scripture fields, and schema-aware quick edit now sends `{ value }` to
  the generic field route for those fields
- schema-aware public field controls now use one local three-dot Conscious Admin
  action menu instead of multiple always-visible icon buttons
- the first menu actions are intentionally narrow: `Edit` opens a compact
  schema-field dialog using the existing quick-edit save flow, and `Full Edit`
  opens the Conscious Full Edit route when available
- the book-schema Conscious Admin control catalog now defines which future
  actions exist, which are ready, and which must stay hidden until their
  Conscious backend service exists
- the first inert Conscious Admin TypeScript action registry now backs the
  schema-field three-dot menu for ready `Edit` and `Full Edit` actions while
  keeping future placeholder actions unavailable and hidden
- ready actions now auto-attach through a shared surface-action resolver instead
  of page-specific JSX or direct menu hardcoding
- renderer awareness is now an explicit contract: stored schema values must be
  rendered through schema-aware field surfaces, while computed/presentation-only
  labels must stay non-editable and separate
- the reusable book library card renderer now emits Conscious schema-aware
  surfaces for stored book title and description values instead of relying on
  the disabled legacy module host intro surface
- `docs/admin/legacy-frontend-admin-quarantine.md` now classifies active
  Conscious Admin, quarantined legacy visible UI, CMS admin, transitional
  write/metadata seams, and future deletion steps
- public scripture pages and reusable scripture renderers no longer import or
  render `AdminModuleHost` / `AdminModuleHostGroup`; remaining legacy module UI
  files are source-tree quarantine only
- old route-specific book/chapter/verse Full Edit GET routes now redirect to
  Conscious Full Edit instead of rendering deprecated page-specific React forms
- dead legacy frontend module UI files have now been removed where safe:
  module host/group, action renderer, module registry/action/type helpers, the
  old `resources/js/admin/modules/*` tree, and unused old integration files
- the future Super Conscious backend organization is documented, with new write
  capability expected to move through schema field/action registries and
  services rather than page-specific controllers
- old book/chapter/verse Full Edit React pages and their private editor/card
  components are removed; Conscious Full Edit is the active Full Edit frontend
- the old awareness comparison layer for old-vs-new visible-control handoff is
  removed; resolver/ownership diagnostics remain the active awareness path
- the remaining live scripture surface resolver helpers have moved from the old
  `admin/integrations/scripture` path into the `admin/surfaces/scripture`
  layer, and the dead circular `AdminFieldIconControls` cluster is removed now
  that schema fields use the three-dot action menu
- backend scripture admin controllers and requests are now classified as
  Conscious active, transitional write endpoints, old full-edit redirect-only,
  replace-with-Conscious-action, or replace-with-Conscious-service; no backend
  endpoints were deleted in this phase
- `docs/admin/super-conscious-awareness-automation.md` now locks the next
  automation direction: schema/model/field/relation/renderer/CMS discovery may
  produce awareness and diagnostics, while action enablement stays explicit and
  policy-gated
- Super Conscious Backend Awareness Foundation Phase 1 has started replacing
  old route-specific backend responsibility:
    - `ConsciousFullEditPayloadBuilder` now owns schema-aware Full Edit payload
      assembly outside the controller
    - `ConsciousFieldUpdateService` now owns generic safe field validation and
      writes
    - `ConsciousActionRegistry` and `ConsciousRelationshipRegistry` provide
      inert metadata foundations for future action and relationship awareness
    - `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`
      exists as the disabled final action route shape
- Super Conscious Backend Consolidation Big Patch 1 makes the action route an
  active safe dispatcher:
    - unknown action keys return 404
    - disabled/unavailable actions reject before execution
    - enabled actions resolve their entity and registered handler
    - `protected_identity.update` can save `slug` and `number` for supported
      scripture entities after explicit policy and validation
- Super Conscious Backend Consolidation Big Patch 2 adds owner-scoped
  content-block actions:
    - `content_block.create`, `content_block.update`, and
      `content_block.delete` are enabled for supported scripture owner entities
    - `content_block.duplicate` and `content_block.reorder` remain disabled
      placeholders
    - old content-block controllers remained temporary fallback behavior at
      that point and were later deleted in Big Patch 5
- Super Conscious Backend Consolidation Big Patch 3 completes the
  non-canonical/editorial/support backend action families:
    - content-block duplicate/reorder are now enabled with owner/region policy
    - book media assignment attach/replace/update/detach are enabled, while
      media reorder remains disabled
    - verse meta update and translation/commentary create/update/delete are
      enabled, while support reorder remains disabled
- Super Conscious Backend Consolidation Big Patch 4 migrates route metadata and
  begins deletion readiness cleanup:
    - safe identity/details save metadata now emits the Conscious field route
    - book/chapter/verse Full Edit links now emit Conscious Full Edit directly
    - content-block, book media-assignment, verse meta, translation, and
      commentary metadata now points at Conscious action routes where backend
      replacements exist
    - old identity/details controllers, their request classes, and old
      redirect-only book/chapter/verse Full Edit controllers/routes were deleted
    - old content-block/media/verse-support controllers remained temporarily
      for compatibility and were later deleted in Big Patch 5
- Super Conscious Backend Consolidation Big Patch 5 completes editorial/support
  route migration and legacy endpoint deletion:
    - remaining content-block move metadata now targets
      `content_block.reorder` with route-owner-scoped direction payloads
    - old content-block, book media-assignment, verse meta, translation, and
      commentary routes/controllers/request classes were deleted after a
      reference audit found no app/runtime references
    - canonical create/delete/reparent/reorder actions were not implemented
    - protected book canonical edit, admin-context visibility, and postponed
      topic/character placeholders remain
- create/reorder/delete/manage controls remain outside awareness ownership for
  now

## Completed In This Cleanup Wave

- scripture controllers were thinned and page-data/builder extraction was
  completed
- the public scripture mapper/builder boundary was tightened where real drift
  existed
- the verse show page was decomposed into focused presentational sections
- the CMS composition area was cleaned up across:
    - add-flow internals
    - workspace editor internals
    - live composer internals
    - tiny shared CMS helper primitives
- verse full-edit pressure was reduced with durable section extraction
- verse relation editors were cleaned up and their last safe shared seams were
  extracted
- shared scripture browse/display components were decomposed where needed and
  are now considered stable
- shared scripture admin/editor source-label/meta display seams were cleaned up,
  including removal of the no-op `BookAdminSourceLabel` alias

## Considered Done - Do Not Reopen By Default

These areas are currently healthy enough and should not be reopened unless a new
real problem appears:

- verse relation editor family
- CMS helper cluster around module-form primitives
- CMS composition shells already cleaned in the current wave
- shared scripture browse/display family
- shared scripture admin/editor source-label/meta display family
- scripture book/chapter and chapter/verse row extractions already completed

Broad cleanup should now pause in these areas.

## Watch / Reassess Later Only

These are pressure points to watch, not automatic next tasks:

- protected canonical edit workflow currently rendered by
  `resources/js/pages/scripture/books/canonical-edit.tsx`
- retained transitional backend write endpoints documented in
  `docs/admin/conscious-admin-backend-migration-map.md`, especially canonical
  create/delete and protected canonical edit

Treat them as reassess-later files only. Do not reopen them automatically just
because they are large.

Other remaining cleanup should be selective only:

- only if a narrow, behavior-preserving seam is clearly justified
- only if the cleanup improves the real single-CMS / thin-page direction
- only if the batch does not drift into speculative abstraction

## Next Real Focus

The next real focus is the Super Conscious Admin Layer from the cleaned base:

- build from the completed Phase 1-5 chronicle public-flow implementation
- treat `docs/admin/super-conscious-admin-layer.md` as the locked north-star
  for future admin awareness
- remember that the current awareness implementation is only the first
  foundation layer, not final/current complete intelligence
- do not continue page-family adapter extraction as the main architecture path
- make admin behavior content/block/layout/schema/action aware rather than
  page-aware
- build automation from metadata, renderer/CMS contracts, coverage reports, and
  explicit policies; do not treat model/table/route existence as permission to
  create controls or enable actions
- continue replacing old backend controllers with Conscious services/actions;
  preserve old endpoints only as temporary behavior providers until replacement
  and usage audits are complete
- keep all canonical create/delete/reorder/reparent action definitions disabled
  until explicit services, policies, and diagnostics exist
- keep media assignment and verse-support reorder disabled until ordering
  policy and diagnostics are ready
- old non-canonical editorial/support controllers, old identity/details
  controllers, and old redirect-only full-edit controllers are removed
- continue with awareness, resolver, diagnostics, and overlay ownership before
  visible control replacement
- keep route pages thin and data-adapter oriented
- keep public/admin balance clear: public reading first, admin controls local
  and compact until an editor is actively open
- improve CMS/module authoring where real authoring friction appears
- keep the single CMS direction intact
- keep canonical scripture pages thin and surface-driven
- keep active inline/full-edit scripture paths trustworthy through selective
  validation, not broad refactor churn
- prefer selective reassessment over another wide cleanup pass

## Success Condition For This Phase

This phase is going well if:

- healthy cleanup areas stay closed
- only real pressure points are reopened
- public pages become cleaner, denser, and more truthful from the current
  stable foundation
- active scripture editing remains trustworthy
- documentation matches the actual repo state
