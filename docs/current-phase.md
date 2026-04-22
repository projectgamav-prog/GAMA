# Current Phase

## Active Phase

Post-cleanup stabilization and selective reassessment from a cleaned base.

## What This Means

The broad cleanup/refactor wave is complete enough to pause.

The project is no longer in the old controller-payload-extraction phase. The
current phase is:

- keep the cleaned architecture truthful
- avoid reopening healthy cleanup areas for purity
- reassess only when a real pressure point reappears
- shift primary attention toward product-facing CMS/module authoring and
  selective validation of active editing paths

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

The next real focus is product-facing work from the cleaned base:

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
- product-facing CMS/module work advances from the current stable foundation
- active scripture editing remains trustworthy
- documentation matches the actual repo state
