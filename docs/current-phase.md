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
- Conscious Full Edit saves still use the old route-specific update endpoints
  until the next migration slice
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

- `resources/js/pages/scripture/chapters/full-edit.tsx`
- `resources/js/pages/scripture/chapters/verses/full-edit.tsx`

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
