# SYSTEM PROTOCOL - DO NOT MODIFY ABOVE THIS LINE

# This section defines how this file must be used.

# Codex must follow these rules strictly.

## Maintenance Rule

This file must be updated after every meaningful change to the system.

It represents the current working state of the project, including:

- what is working
- what is partially working
- what is broken or needs improvement
- current UX condition
- immediate next priorities

## Codex Instruction

Before making any changes:

- Read this file (`current-state.md`)
- Read `next-step.md`
- Read `admin-architecture.md`

After completing a task:

- Update this file to reflect the new current state
- Do not leave outdated or misleading information here

# DO NOT EDIT ABOVE THIS LINE

---

# Current State Snapshot

## Working

### Architecture documentation

- A new architecture foundation set now exists in `docs/`:
    - `project-architecture-thesis.md`
    - `cms-architecture.md`
    - `admin-surface-design.md`
    - `payload-architecture.md`
    - `registry-architecture.md`
    - `admin/super-conscious-admin-layer.md`
    - `current-phase.md`
    - `architecture-guardrails.md`
    - `anti-patterns.md`
- `refactor-roadmap.md` now remains as historical context only. It is no longer
  the active roadmap or current phase guide.
- These documents now define the locked architecture direction for:
    - canonical scripture versus CMS separation
    - hybrid admin editing
    - the Super Conscious Admin Layer as the locked north-star for future admin
      awareness
    - admin surfaces and module attachment
    - controller/builder/mapper payload boundaries
    - registry use versus central switchboards
    - phased safe refactor sequencing
- `docs/admin/legacy-admin-removal.md` records the current deprecation stance:
  the old visible public scripture module layer is disabled by default, while
  backend write endpoints remain available as transitional service seams for the
  conscious admin layer.

### Cleanup wave status

- The broad cleanup/refactor wave is now largely complete.
- The project is now operating from a cleaned architecture-first base rather
  than from an active broad refactor stream.
- Several cleanup families are now considered stable enough to leave alone by
  default:
    - verse relation editor family
    - CMS helper cluster around shared module-form primitives
    - CMS composition shells already cleaned in this wave
    - shared scripture browse/display family
    - shared scripture admin/editor source-label/meta display family
- Remaining cleanup is now selective only:
    - reopen only when a narrow, behavior-preserving seam is clearly justified
    - do not resume broad cleanup for purity
    - protected canonical edit and transitional backend write endpoints are the
      remaining legacy pressure points, not the deleted old Full Edit pages

### Architecture

- Pages are still route shells, but the next architecture direction is now to
  reduce them further into data adapters over a universal rendering system.
- Universal Rendering Phase 1 has added inert frontend contracts and registry
  helpers under `resources/js/rendering/core/`:
    - focused page/region/section descriptor types
    - render context types
    - section renderer contract types
    - section renderer registry helpers
    - `UniversalPageRenderer`
    - `UniversalSectionRenderer`
- Universal Rendering Phase 2 has added descriptor-driven section renderers for
  repeated rail/panel structures:
    - `paper_panel`
    - `compact_list`
    - `action_panel`
    - `temporary_panel`
    - `support_rail_group`
- Side rail panel composition on home, book index, book show, chapter show, and
  verse show now uses shared descriptor builders plus `UniversalSectionStack`.
- Universal Rendering Phase 3 has added descriptor-driven renderers for intro
  and content-block paths:
    - `intro_text`
    - `content_block_item`
    - `content_blocks`
- Chapter and verse intro placements now use scripture descriptor builders that
  pass admin surface/quick-edit metadata into the shared `ScriptureIntroBlock`.
- Shared scripture content-block sections now render block stacks through
  universal descriptors while still delegating each block to `ContentBlockRenderer`.
- Universal Rendering Phase 4A has started thinning route pages through adapter
  extraction:
    - home rail descriptor assembly lives in `resources/js/rendering/adapters/`
    - books index descriptor grouping/rail assembly lives in `resources/js/rendering/adapters/`
    - book, chapter, and verse show descriptor assembly lives in `resources/js/rendering/scripture/adapters/`
- Route pages still render their existing top-level layout, hero, canonical
  lists, and verse support internals; they now call adapter builders for the
  descriptor stacks already migrated in earlier phases.
- The Phase 4B page-adapter/page-renderer direction is now stopped. The Phase
  4A adapters may remain as temporary cleanup, but they are not the future
  architecture model.
- The new active architecture direction is the Super Conscious Admin Layer:
  a universal admin awareness layer that is content-aware, block-aware,
  layout-aware, position-aware, schema-aware, action-aware, ordering-aware, and
  parent/child-aware without depending on route page names.
- `docs/admin/super-conscious-admin-layer.md` now documents this as the locked
  north-star architecture. It explicitly treats the current implementation as an
  early awareness foundation, not the complete admin brain.
- Future admin work should continue through awareness contracts, schema
  plugins, registries, resolver rules, overlay ownership, quick-edit adapters,
  structured editor modules, Full Edit fallback, and ordering/add-anchor
  manifests instead of page adapters or page-local admin behavior.
- Super Conscious Admin Layer Phase A has added inert awareness contracts and
  registry shells under `resources/js/admin/awareness/`.
- Super Conscious Admin Layer Phase B has added the shadow
  `AdminControlResolver`, which can resolve edit, create, reorder, delete,
  manage, and full-edit/navigation controls from awareness contexts.
- The resolver currently prepares future overlay integration and does not
  replace existing admin button rendering.
- Super Conscious Admin Layer Phase C has added the inert surface manifest and
  position provider layer:
    - `AdminAwarenessProvider` now hosts an in-memory
      `AdminSurfaceManifestProvider`
    - `AdminPositionProvider` / `AdminPositionBoundary` can supply layout and
      placement context to descendants
    - `AdminSurfaceEmitter` and `useRegisterAdminSurface` let reusable
      renderers register entity, surface, block, layout, action, ordering,
      schema, and quick-edit facts
    - `ScriptureIntroBlock` and `ContentBlockRenderer` now emit awareness facts
      when they already receive admin surface metadata
    - the shared public site layout mounts the awareness provider once so
      public renderers can register facts without page-specific wiring
- Phase C is observational only: it does not render controls, submit forms,
  resolve visible actions, or replace `AdminSurfaceBoundary`.
- Super Conscious Admin Layer Phase D has connected emitted awareness manifest
  entries to the shadow resolver:
    - `AdminResolvedControlsProvider` reads in-memory manifest entries and
      computes `resolveAdminControls()` output per surface
    - `AdminControlOwnership` classifies the future owner as
      quick-edit overlay, structured editor, full edit, mixed, none, or
      unresolved
    - diagnostics can flag duplicate surface emissions, same-layout quick edit
      metadata without a matching adapter, capabilities without resolved
      controls, ordering/create requests without ordering context, and future
      overlap risk with the current visible admin host
    - `useAdminResolvedControls()` exposes resolver output, ownership, and
      diagnostics for future tooling without rendering public UI
- Phase D was shadow-only at the time. The later cleanup removed the old visible
  module UI, so current visible public scripture controls now come from the
  Conscious schema-aware path.
- Super Conscious Admin Layer Phase E has added universal ordering and
  add-anchor awareness in shadow mode:
    - `AdminOrderingManifestProvider` tracks order groups, item positions, and
      add anchors in memory
    - focused contracts now model order groups, ordered items, add anchors, and
      ordering diagnostics without creating a giant admin object
    - reusable registration hooks allow block/list families to emit ordering
      facts without page-specific wiring
    - the universal `content_blocks` renderer now emits a block-family order
      group, per-block item positions, and before/after add anchors while
      leaving create/reorder/delete mutation disabled until explicit metadata is
      registered
    - `ContentBlockRenderer` now receives optional ordering context and passes
      it into the existing awareness surface emission
    - diagnostics can flag missing groups, duplicate item keys, unstable
      reorder groups, add anchors without allowed content types, placement
      conflicts, and accidental casual canonical reorder exposure
- Phase E is still shadow-only: no add buttons, reorder handles, delete
  controls, drag/drop, backend routes, schema changes, or public/admin visual
  changes were introduced.
- Super Conscious Admin Layer Phase F previously added old-vs-new visible
  control comparison during the handoff from the legacy visible module layer.
  That comparison layer has now been removed because the old visible module
  layer is gone; resolver ownership diagnostics remain the active awareness
  path.
- Super Conscious Admin Layer Phase G1 has started the first narrow
  awareness-owned overlay trial:
    - only `AdminEditableSurface` same-layout quick-edit surfaces can pass the
      ownership gate
    - the gate requires adapter-backed `same_layout` quick edit, resolver
      controls, known placement/mode, no duplicate risk, no blocking schema
      constraint, and quick/full-edit scope only
    - when the gate passes, the visible quick-edit and optional Full Edit
      controls come from resolver-decided controls
    - the same `AdminEditableSurface` component still owns edit mode, save,
      discard, adapter payload building, and fallback behavior
    - when the gate fails, `AdminEditableSurface` renders the previous local
      hardcoded controls exactly as before
    - structured module-host surfaces were not transferred; they were later
      removed from the active public-page admin UI
- Phase G1 does not transfer create, reorder, delete, manage media, manage
  relations, structured editor, ordering, add-anchor, or canonical hierarchy
  controls.
- Phase G1 validation has confirmed the handoff remains component-family only:
    - the gate still falls back to the previous local `AdminEditableSurface`
      controls whenever readiness fails
    - resolver-owned controls call the same edit/save/discard/full-edit paths
      as the previous controls
    - duplicate visible controls are prevented because the component chooses
      either resolver-owned controls or local controls for the same surface
    - ownership diagnostics now treat `quick_edit` plus `full_edit` as a valid
      quick-edit overlay owner with fallback, while `quick_edit` plus
      `structured_editor` remains mixed and blocked
- The first Conscious Admin Full Edit foundation now exists:
    - awareness-owned schema field Full Edit controls can point to the new
      `/admin/schema/{schemaFamily}/{entityType}/{id}/full-edit` route instead
      of the fragile old route-specific full-edit pages
    - the new shell renders through `resources/js/pages/admin/schema/full-edit.tsx`
      and schema-aware components under `resources/js/admin/conscious-full-edit/`
    - book, book section, chapter, chapter section, and verse records show field
      categories such as Basic Content, Canonical Identity, Structure &
      Parentage, Ordering, and Advanced / Technical
    - safe book/book-section/chapter/chapter-section/verse fields use the
      Conscious field route while slug, number, parentage, ordering, and
      technical fields are visible as protected or read-only
    - content blocks can reach the shell as a read-only first slice until
      parent-aware save routes are connected safely
    - old route-specific Full Edit GET routes for book/chapter/verse have now
      been deleted after app links moved directly to Conscious Full Edit
- The first admin-aware layout anchor structure now exists:
    - `AdminAnchorBoundary` and `AdminControlAnchor` define passive anchor levels
      and slots for page, region, section, card, block, and field controls
    - `AdminControlPlacementResolver` now resolves both legacy overlay zones and
      semantic anchor slots
    - schema field controls expose field-level slots for the local three-dot
      Conscious action menu and same quick-edit behavior
    - chronicle panels, editorial grids, side rails, section headings, universal
      section renderers, and content blocks now expose passive anchor boundaries
      from reusable components rather than route-page button placement
    - `docs/admin/admin-layout-anchors.md` documents the anchor levels, slots,
      and rule against page-specific control placement
- Awareness-owned schema field controls now have a new Full Edit navigation
  target when Conscious Full Edit supports the entity. Other awareness behavior
  remains intentionally narrow and fallback-safe.
- Conscious Admin Backend Phase 1 now exists as backend foundation only:
    - `PATCH /admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}`
      is registered behind the admin schema middleware group
    - backend scripture field definitions support safe updates for
      `books.title`, `books.description`, `book_sections.title`,
      `chapters.title`, `chapter_sections.title`, and `verses.text`
    - protected fields such as slug, number, parent relation ids, and canonical
      structure fields are registered as protected and blocked from generic
      safe field updates
    - canonical create/delete and structured legacy endpoints remain where no
      fully migrated Conscious submit path is proven; identity/details routes
      were later removed after metadata moved to Conscious routes
- Conscious Admin Backend Phase 2 has migrated schema-aware quick-edit saves for
  the first safe scripture fields to the generic field route:
    - `books.title`
    - `books.description`
    - `book_sections.title`
    - `chapters.title`
    - `chapter_sections.title`
    - `verses.text`
    - migrated quick-edit payloads now use `{ value }`
    - hidden `slug`, `number`, and parent-context payload fields are no longer
      sent for those safe quick-edit field saves
    - old identity/details update endpoints were later deleted after route
      metadata moved to Conscious field routes
- Conscious Admin Three-Dot Action Menu Phase 1 has replaced the always-visible
  schema-field pencil/full-edit icon cluster with one local surface action menu:
    - schema-aware fields now show one compact three-dot control at the local
      field anchor
    - `Edit` opens a compact Conscious field edit dialog that uses the existing
      schema field editor adapter and generic quick-edit save flow
    - `Full Edit` opens the Conscious Full Edit route when a supported href is
      available
    - delete, add, reorder, media, and relation actions remain absent until
      their Conscious Admin paths are implemented
    - the old black public-page module controls remain disabled and were not
      reintroduced
- `docs/admin/book-schema-conscious-controls.md` now catalogs the active book
  schema action surface before more controls are exposed:
    - books, book sections, chapters, chapter sections, verses, verse meta,
      translations, commentaries, content blocks, and media assignments are
      mapped by action family, control level, preferred UI, backend status,
      risk, route/service need, and Full Edit category
    - only safe field edit actions and Conscious Full Edit are marked ready for
      the current three-dot menu
    - create, reorder, delete, media, relation, support-entry, and protected
      canonical actions remain documented but hidden until Conscious backend
      services exist
- Conscious Admin Action Registry Phase 1 now exists as an inert TypeScript
  registry under `resources/js/admin/actions/`:
    - action definitions model action keys, entity types, families, labels,
      menu groups, control levels, UI modes, backend status, risk, capability,
      backend action, Full Edit category, and disabled reasons
    - current ready actions are registered for safe schema-field `Edit` and
      Conscious `Full Edit`
    - future add/delete/reorder/duplicate/media/verse-support actions are
      registered as unavailable placeholders and remain hidden
    - the schema-field three-dot menu now queries the registry before rendering
      `Edit` or `Full Edit`
- Conscious Admin Action Auto-Attachment Phase 1 now resolves enabled actions
  through a shared surface-action resolver:
    - schema-aware field surfaces pass schema family, entity type, field name,
      control level, edit-handler availability, and Full Edit href availability
      into the resolver
    - the resolver filters by metadata, enabled/menu flags, backend readiness,
      risk-ready runtime conditions, and field/entity control level
    - enabled safe field `Edit` and Conscious `Full Edit` auto-attach to the
      field three-dot menu
    - unavailable placeholders for add/delete/reorder/duplicate/media/relation
      and support actions remain hidden
- Conscious Admin Renderer Awareness Contract Phase 1 now defines how rendered
  schema content becomes admin-aware:
    - reusable components that render stored database fields must emit
      `AdminSchemaFieldDisplay` / `AdminSchemaFieldSurface`
    - computed or presentation-only labels must remain explicitly non-editable
      and cannot masquerade as schema fields
    - shared helpers in `resources/js/admin/schema/fields/` distinguish stored
      schema displays from computed/presentation-only displays
    - `docs/admin/conscious-admin-field-coverage.md` audits the active
      book-schema field coverage by field and reusable renderer, not URL
    - the shared schema field edit dialog now keeps click handling modal-local
      so cancel/close cannot accidentally trigger parent card/link navigation
- `docs/admin/super-conscious-awareness-automation.md` now locks the next
  Super Conscious Admin automation blueprint:
    - backend awareness should grow from schema metadata, model/entity
      definitions, field definitions, relationship definitions, action
      capability definitions, validation rules, Full Edit categories, and
      explicit import/export boundaries
    - frontend and CMS awareness should grow from renderer surfaces, CMS
      component contracts, admin anchor slots, action capability detection, and
      stored/computed/presentation-only display distinctions
    - discovery may produce safe suggestions, diagnostics, and coverage reports,
      but protected/canonical fields and destructive or structural actions must
      remain explicitly policy-gated
    - no controls, routes, schema/migrations, CMS behavior, or UI behavior were
      changed by the automation blueprint pass
- Super Conscious Backend Awareness Foundation Phase 1 is now active:
    - `ConsciousFullEditController` delegates payload construction to
      `ConsciousFullEditPayloadBuilder`
    - `ConsciousSchemaFieldUpdateController` delegates validation/write
      execution to `ConsciousFieldUpdateService` after registry lookup and
      protected-field policy checks
    - safe Conscious Full Edit fields now target the generic Conscious field
      route and submit the `value` payload contract instead of old hidden
      route-specific payloads
    - the final schema action route shape exists, backed by an inert
      `ConsciousActionRegistry` whose scripture create/delete/reorder/reparent
      placeholders are disabled
    - `ConsciousRelationshipRegistry` describes protected scripture
      parent/child relationships for awareness and future diagnostics without
      enabling structural mutations
- Super Conscious Backend Consolidation Big Patch 1 is now active:
    - `ConsciousSchemaActionController` delegates to
      `ConsciousActionDispatcher`
    - `protected_identity.update` is registered and enabled only for scripture
      book, book section, chapter, chapter section, and verse entities
    - `ProtectedIdentityAction` updates only `slug` and `number` after explicit
      protected identity policy and validation
    - Conscious Full Edit protected slug/number rows now save through the
      Conscious action route
    - parent/reparent, canonical order/reorder, create, delete, media,
      content-block, verse-support, translation, and commentary actions remain
      blocked
- Super Conscious Backend Consolidation Big Patch 2 is now active:
    - `content_block.create`, `content_block.update`, and
      `content_block.delete` are registered and enabled for scripture book,
      book section, chapter, chapter section, and verse owners
    - `ContentBlockAction` executes owner-scoped content block writes through
      the Conscious action dispatcher
    - `ConsciousContentBlockPolicy` enforces supported owners, owned-block
      mutation, allowed block types, stable region keys, rejected ownership
      payloads, and no canonical hierarchy mutation
    - `content_block.duplicate` and `content_block.reorder` are registered but
      disabled placeholders
    - old route-specific scripture content-block controllers remained in place
      at that stage and were later deleted in Big Patch 5
- Super Conscious Backend Consolidation Big Patch 3 is now active:
    - content-block `duplicate` and `reorder` actions are enabled for supported
      scripture owner entities, with reorder limited to the same owner and
      region
    - book media assignment `attach`, `replace`, `update`, and `detach` actions
      are enabled; media assignment reorder remains disabled
    - verse support actions now cover meta update, translation
      create/update/delete, and commentary create/update/delete
    - translation/commentary reorder remain disabled placeholders
    - old content-block, media assignment, verse meta, translation, and
      commentary controllers remained temporary behavior providers until the
      Big Patch 5 submit-path migration and usage audit deleted them
- Super Conscious Backend Consolidation Big Patch 4 is now active:
    - scripture route metadata now emits Conscious field routes for safe
      identity/details saves
    - book/chapter/verse Full Edit links now emit Conscious Full Edit directly
    - content-block, book media-assignment, verse meta, translation, and
      commentary metadata now points at Conscious action routes where backend
      replacements exist
    - old identity/details controllers, old identity/details request classes,
      and old redirect-only book/chapter/verse Full Edit controllers/routes
      were deleted after reference audit
    - canonical create/delete/reorder/reparent actions were not implemented
    - content-block, media-assignment, and verse-support old controllers/routes
      remain only as compatibility/non-migrated submit-method fallbacks
- Super Conscious Backend Consolidation Big Patch 5 is now active:
    - remaining content-block move-up/move-down metadata now submits to
      `content_block.reorder` with `direction=up/down` while owner context
      still comes from the schema action route
    - old content-block, book media-assignment, verse meta, translation, and
      commentary controllers/routes/request classes were deleted after a
      reference audit found no app/runtime references
    - the retained old scripture backend is now limited to canonical
      create/delete, protected book canonical edit, admin-context visibility,
      and postponed topic/character placeholder routes
    - CMS was untouched and canonical create/delete/reparent/reorder actions
      were not implemented
- The legacy purge / renderer coverage pass removed the old
  `AdminModuleHost` intro surface from the reusable book library card renderer:
    - book library/card titles now render through `ScriptureBookTitleDisplay`
      and emit `books.title` schema-aware surfaces
    - visible book descriptions in book cards now render through
      `ScriptureBookDescriptionDisplay` and emit `books.description`
      schema-aware surfaces
    - public scripture `AdminModuleHost` imports were later removed entirely
- Conscious Admin Legacy Frontend Quarantine Phase 1 first converted
  `AdminModuleHost` and `AdminModuleHostGroup` into no-op compatibility shims,
  and the later cleanup removed those old host files entirely:
    - old black/fallback module controls and inline structured panels cannot
      render through the public-page host path
    - `docs/admin/legacy-frontend-admin-quarantine.md` now records active
      Conscious Admin files, quarantined legacy UI files, CMS separation, kept
      backend/service seams, guardrails, and the future deletion checklist
- Conscious Admin Black Screen Recovery + Legacy Frontend Admin Eradication
  Phase 2 has removed old host imports from public scripture pages and reusable
  scripture renderers:
    - public scripture code no longer imports or renders
      `AdminModuleHost` / `AdminModuleHostGroup`
    - old scripture integration files no longer export legacy module arrays
      backed by old module imports
    - old book/chapter/verse route-specific Full Edit controllers now redirect
      to Conscious Full Edit for `scripture.book`, `scripture.chapter`, and
      `scripture.verse`
    - backend write endpoints remain intentionally in place as transitional
      service endpoints
- Super Conscious Admin Total Cleanup + Backend Organization Audit has removed
  the dead old frontend module UI files:
    - `AdminModuleHost`, `AdminModuleHostGroup`, `AdminModuleActionRenderer`
    - old module registry/action/qualification/type helpers
    - `resources/js/admin/modules/*`
    - unused old integration files for entity actions, sections, and books
    - CMS admin under `resources/js/admin/cms/*` was intentionally untouched
    - `docs/admin/super-conscious-admin-cleanup-audit.md` classifies frontend
      and backend leftovers
    - `docs/admin/super-conscious-backend-organization.md` defines the target
      backend structure and writing-capacity roadmap
- Super Conscious Admin Cleanup Phase 2B removed the dead old route-specific
  Full Edit frontend:
    - old book/chapter/verse Full Edit React pages were deleted because their
      GET controllers redirect to Conscious Full Edit
    - old editor/card components used only by those pages were deleted
    - old current-visible-control comparison/shadow handoff files were deleted
      now that the old visible module layer is gone
    - `resources/js/pages/scripture/books/canonical-edit.tsx` remains as a
      protected legacy workflow until a Conscious protected-canonical workflow
      replaces it
- Super Conscious Admin Cleanup Phase 3 completed the next import/backend audit:
    - remaining chapter/verse surface helper files moved from
      `resources/js/admin/integrations/scripture/*` into
      `resources/js/admin/surfaces/scripture/*/surface-resolvers`
    - the empty `*AdminModules` compatibility exports were removed
    - the dead always-visible `AdminFieldIconControls` cluster was deleted
      because schema fields now use `AdminSurfaceActionMenu`
    - backend scripture admin controllers/requests/routes are classified for
      migration into Conscious field services and registered actions, with no
      backend endpoints removed in this phase
- Full route pages have not been migrated to `UniversalPageRenderer` yet, so the
  current public visuals and behavior are intentionally preserved.
- Canonical scripture admin still attaches through semantic surfaces and module qualification.
- Canonical scripture pages remain schema-driven exceptions.
- Manual pages are now formally treated as CMS, not as a one-off feature direction.
- CMS composition is now formally independent from the canonical scripture schema.
- The locked CMS composition model is now:
    - `pages`
    - `page_containers`
    - `page_blocks`
- Dedicated CMS frontend registry/core/editor/renderer code now lives under `resources/js/admin/cms/`.
- The CMS module contract and module folder shape are now being treated as stable foundation seams for future external React/TSX module integration.
- `docs/cms-architecture.md` now exists as the focused CMS architecture brief that complements the broader project architecture doc.
- `docs/public-admin-page-authoring.md` now exists as the focused same-layout live authoring brief for public/admin page behavior.
- `docs/admin/content-aware-positional-authoring.md` now exists as the reusable architecture brief for live structured positional editing on real surfaces.
- `docs/admin/positional-authoring-implementation-guide.md` now exists as the practical implementation guide for inline item/list/tree positional authoring.
- `docs/public-region-policy.md` now exists as the declared global/page region policy for shell seams and canonical vs supplemental placement.
- `docs/scripture-admin-editing.md` now reflects the active canonical surface/module system instead of the retired public scripture block-authoring model.
- `docs/admin-module-integration.md` now documents the practical procedure for adapting outside React components into the canonical admin module system and the CMS module registry safely.

### Canonical scripture public flow

- Book list: `scripture.books.index`
- Chapter list: `scripture.books.show`
- Verse list: `scripture.chapters.show`
- Verse detail: `scripture.chapters.verses.show`
- Public pages now share one global site frame through the shared public site layout:
    - shared header with site identity, public navigation, and the scripture admin visibility toggle when available
    - shared footer with simple structured public links/info
    - scripture pages, the homepage, and public CMS pages now mount into the same shell instead of carrying duplicated page-specific headers
- The shared header navigation is now structured and data-driven:
    - navigation items live in `navigation_items`
    - the public header reads a shared tree from Inertia props instead of hardcoded JSX links
    - mobile navigation opens from the right and supports deeper child panels further right
    - authorized editors can now edit the real shared header in place when admin visibility is enabled:
        - tiny contextual controls appear next to the real nav items
        - labels can be edited inline in the live header
        - top-level items and child items can be added locally in the actual list position
        - move up/down and delete now work from the live header itself
        - structured link targets remain intact through a compact inline target editor
    - the navigation workspace remains available as support/fallback tooling, but the live shared header is now the active authoring path for routine nav edits
    - that live header model is now documented as a reusable admin/CMS authoring pattern rather than a one-off header implementation
- The shared footer is now part of the same structured global navigation system:
    - footer link groups now come from `navigation_items` through the `public_footer` menu key
    - header and footer now share the same typed link-target contract
    - footer rendering is no longer leftover hardcoded JSX links
    - footer editing currently stays in the shared navigation workspace rather than duplicating a second live positional editor prematurely
- A reusable link-target contract now exists for navigation and future action modules:
    - `url`
    - `cms_page`
    - `route`
    - `scripture`
- Local development browse state is back to the expected multi-book corpus baseline after `migrate:fresh --seed`; the development seed now imports all enabled scripture books before layering Bhagavad Gita-specific editorial fixtures.

### Canonical scripture admin state

- Verse translations/commentaries stay schema-driven from the real verse tables and relations.
- Verse-row admin controls on the chapter page are active and browser-validated for identity, intro, meta, translations, commentaries, nearby create, delete, and full edit launch.
- Chapter-row controls on the book page are active and browser-validated for identity, intro, delete confirmation, and editor-mode visibility.
- Intro dropdowns are active on book cards, book-section cards/groups, chapter cards, chapter-section cards/groups, and verse rows where intro content exists.
- The current book-schema CRUD slice remains active for books, book sections, chapters, chapter sections, verses, verse intro/meta, verse translations/commentaries, relevant note-block surfaces, and book media slots.
- Canonical scripture pages no longer carry book-specific CMS page bridge fields or overview-page linkage logic.
- The active edit-existing-content path has now been tightened across the book schema:
    - open-on-demand inline editors for books, sections, chapters, chapter sections, verses, verse meta, and verse relation editors still hydrate through activation/remount correctly
    - the first focused book-media authoring pattern now spans both the public
      book media surface and the protected book full-edit media section:
        - admins can attach hero/supporting media directly near the public book
          media section instead of jumping straight to full edit for the common
          case
        - existing book media assignments can be replaced or removed inline on that
          same public surface
        - the protected full-edit media cards now reuse the same media-record
          selection confidence pattern:
            - clearer picker labels
            - selected-record summary
            - inline media preview
            - quick attach / replace / remove actions where the narrow contracts fit
        - full edit remains the advanced path for title/caption overrides, publish
          state, sort order, and other slot behavior
        - those inline media actions now use focused action contracts instead of
          depending on full-record assignment form payloads:
            - attach sends only the media id and slot role
            - replace sends only the media id
            - remove stays a simple delete
    - grouped inline identity editing is now context-aware where it stays active on list pages:
        - chapter identity editing from the book page chapter list now mounts as a chapter-row editor instead of borrowing chapter-page semantics
        - the chapter-row save path now returns to the book page instead of detouring into the chapter page route
        - verse-row identity editing on the chapter page now uses row-specific wording instead of verse-detail wording
    - the real browser-path dummy-editor bug is now fixed for the active inline book-schema editors that shared the same reset pattern:
        - book identity
        - book intro
        - book section / chapter section grouped row details
        - chapter identity
        - verse identity
    - root cause: those inline editors were resetting from server metadata on re-render because their hydration `useEffect` depended on the live `useForm()` object, which made the current local edits snap back while typing and produced stale submit payloads
    - browser validation now confirms the active row identity editors submit real requests with edited values:
        - chapter identity from the book page chapter list sends a `PATCH` to the chapter identity route, updates the chapter row in the database, and re-renders the book page with the updated chapter title/slug/number
        - verse identity from the chapter page verse list sends a `PATCH` to the verse identity route, updates the verse row in the database, and re-renders the chapter page with the updated verse row
    - the always-mounted full-edit cards for book description, chapter identity, verse identity/meta, registered content blocks, and book media assignments now resync from fresh Inertia props after save instead of holding stale pre-save values in local form state
- The public admin surface/module system has had a focused cleanup pass:
    - the dead retired public scripture block-module registry branch was removed from the active admin module registry
    - the dead retired public scripture block surface builders and inline block-create helpers were removed
    - the old `CmsEligibleRegionExperiment` component was removed because exposed regions now resolve through the real shared region system
    - the active canonical registry cleanup is historical; the later Conscious
      cleanup removed the old public module registry entirely
    - book media slot editor defaults no longer hardcode the retired overview-video role as the create default in the active editor helpers
    - the shared intro helper re-home was a transitional step before the old
      module tree was removed
    - chapter/verse row-vs-page identity semantics now resolve through a shared typed integration helper instead of duplicated string branches
    - the remaining canonical full-edit content-block controllers and route-context helpers are now explicitly marked as transitional fallback seams in code/docs instead of looking like the active public authoring path
    - the legacy `overview_video` media role is now treated as explicit compatibility-only metadata in the active editor helpers instead of a normal create-path slot
    - a narrow headless Chrome smoke script now exists for the real inline admin path:
        - `scripts/scripture-admin-inline-smoke.mjs`
        - it covers book identity, chapter-row identity, verse-row identity, one intro editor, and the active media-slot path when a persisted assignment is available

### CMS page foundation and composition

- Authenticated CMS workspace exists at:
    - `/cms/pages`
    - `/cms/pages/{page:slug}`
- Public CMS page shell exists at:
    - `/pages/{page:slug}`
- Non-CMS pages can now declare shared CMS exposure regions that resolve supplementary CMS content without changing canonical page ownership.
- Published CMS pages now expose live composition controls for permitted users when admin visibility is enabled.
- Live CMS composition controls are now content-aware:
    - blank region: `Add Card` and `Add Button`
    - container edges: `Add Card` and `Add Button`
    - inside container block areas: `Add Block` and `Add Button`
- CMS page create works through the Add Page flow in the CMS workspace.
- Dashboard exposes a CMS pages entry point and Add Page link for admin-context users.
- CMS page records support:
    - `title`
    - `slug`
    - nullable `exposure_key`
    - `status`
    - optional `layout_key`
- CMS page workspace now supports:
    - create page
    - list pages
    - edit page identity/status/layout key
    - delete page
    - create a new container with its first block
    - create a new container above existing containers
    - create a new container below an existing container
    - add a block inside an existing container
    - add a block at the top of a container
    - add a block below an existing block
    - edit existing containers
    - edit existing blocks
    - move containers up/down
    - move blocks up/down
    - delete containers
    - delete blocks
    - open the public page when published
- The current CMS module registry supports:
    - `rich_text`
    - `button_group`
    - `media`
    - `card_list`
- `button_group` now uses the shared structured link-target contract:
    - `url`
    - `cms_page`
    - `route`
    - `scripture`
- `card_list` now also uses the shared structured link-target contract for optional per-card destinations instead of inventing a second link model.
- Shared link-target authoring is now faster across navigation and CMS modules:
    - pasted URLs or internal site paths can now be translated into the structured target model directly
    - shared picker data now exists for CMS pages, routes, books, dictionary entries, topics, and characters
    - button-group, card-list, header navigation, and footer navigation now all benefit from the same shared target options instead of leaning on manual slug entry as often
    - the shared target editor now also owns the common destination-type step for the main CMS CTA/list modules instead of leaving that choice duplicated at each module call site
    - destination summaries are now more human-readable across route, CMS page, and scripture targets instead of leaning only on raw href strings
- `button_group` authoring now has a cleaner common-vs-advanced CTA flow:
    - labels and destinations stay in the first editing step
    - per-button rows now support duplicate and move up/down for faster CTA-set shaping
    - structured destination details can stay collapsed until needed when the common paste/pick flow is enough
    - style and new-tab behavior now live behind an explicit advanced reveal instead of crowding the common path
- `card_list` authoring now follows the same cleaned product-facing pattern:
    - common card content stays focused on title, body, CTA label, and destination
    - per-card rows now support duplicate and move up/down for faster repeated-item editing
    - structured destination details can stay collapsed until needed
    - optional eyebrow polish now sits behind an explicit advanced reveal instead of competing with the common path
- The first stable CMS module set is now strong enough for real declared supplemental regions:
    - `rich_text` now supports eyebrow/title/lead plus structured body writing for stronger prose sections
    - `button_group` stays the structured CTA/action module on the shared target contract
    - `media` remains the practical image/video URL block for controlled early CMS use
    - `card_list` now provides repeatable grouped cards/list content for highlights, resource paths, and simple structured collections
- CMS module folders now follow a predictable portable shape under `resources/js/admin/cms/modules/<module>/`:
    - `manifest.ts`
    - `renderer.tsx`
    - `editor.tsx`
    - `types.ts`
    - `defaults.ts`
    - `index.tsx`
- CMS manifests now support the core module contract plus an optional `validate` hook.
- Public CMS pages now render ordered containers, and each container renders its ordered CMS blocks through the dedicated CMS renderer path.
- The same CMS composition engine can now be exposed directly on published CMS pages for permitted users, so section/block authoring no longer has to start from dashboard record hunting.
- The strict public-page-first CMS authoring rule is now locked:
    - admins and public users share the same core content-managed page layout
    - admin mode augments the real page instead of switching to a separate builder layout
    - the CMS workspace remains supportive management tooling, not the primary routine authoring surface
- The detached bottom-of-page live composition shell has been removed from the routine CMS page editing path.
- Live CMS adders are now attached directly to the real page layout:
    - blank page: `Add Card` and `Add Button`
    - existing container top: `Add Block` and `Add Button`
    - existing container bottom: `Add Block` and `Add Button`
- The default visible live adders are now compact attached buttons instead of inline mini-panels, and the chooser/config UI only opens after click.
- Live attached CMS CRUD now includes:
    - create from compact in-place add buttons
    - container edit and delete from compact attached actions
    - block edit and delete from compact attached actions
- Live Add Card, Add Button, Add Block, Edit card, and Edit block now stay on the same public-looking page instead of redirecting to the CMS workspace after submit.
- Shared exposed CMS regions on non-CMS pages now use the same compact in-place authoring model and same-page return path.
- The first non-CMS proof targets are now active:
    - home page exposes a shared CMS region
    - verse detail exposes a supplementary CMS region below the canonical verse flow
- The declared supplemental regions now have practical seeded development content to exercise the first CMS module set:
    - the home page supplementary region is now composed as a real supporting content flow instead of a small demo fragment:
        - orientation prose
        - CTA/button group
        - grouped highlight cards
        - supporting media
        - a closing next-step CTA section
    - a published development CMS page at `/pages/platform-guide` now reads like a real guide page instead of a module demo:
        - hero prose + actions
        - structured content-layer explanation
        - supporting media section
        - workflow prose
        - page-pattern card list
        - closing CTA section
    - the Bhagavad Gita verse-detail supplementary region for chapter 2 section 1 verse 1 now has seeded reflection, CTA, and related-path card content so scripture supplemental CMS usage can be evaluated on a real page
- Verse detail CMS activation is now understood and stable:
    - the shared exposed-region resolver does return the supplementary verse region and admin bootstrap payload
    - admin capability reaches verse detail through the normal shared admin context
    - the main activation problem was overlap with the older verse-owned note-block editing surface, not a missing CMS region payload
- Verse detail now treats the supplementary CMS region as the primary live in-place composition path on that page.
- The older verse-owned published-notes section still renders published canonical note blocks, but its live add/edit/move/delete controls have been removed from the verse detail page to reduce overlap with the supplementary CMS region.
- Placement context on the live CMS page is now inferred from the clicked zone:
    - page
    - container when applicable
    - top vs bottom placement
    - insertion mode
    - relative ordering target
- The live adder shell now uses progressive reveal:
    - card creation: choose container type first, then go deeper into the chosen type
    - button creation: button-group options are split into button and layout steps
    - block creation: choose a category first, then a block type inside that category
- The CMS composition foundation has now been browser-validated for:
    - Add Page create flow
    - page list visibility
    - page update flow
    - create container
    - create container above/below
    - add block at top of container
    - add block below an existing block
    - edit each current module type
    - edit container
    - move container up/down
    - move block up/down
    - delete block
    - delete container
    - draft-vs-published public route behavior
    - public page rendering
    - page delete
- CMS admin redirects and action hrefs now stay same-origin and relative, which keeps Inertia navigation stable even when the local host differs from `APP_URL`.
- Actual CMS migration/runtime validation has now run cleanly on the active MySQL database:
    - `pages`, `page_containers`, and `page_blocks` are applied
    - the normalized `pages` baseline now includes `exposure_key`
    - foreign keys are present
    - page delete cascades to its containers and blocks
    - container delete removes only that container and its blocks
    - block delete compacts ordering without corrupting unrelated records
    - container/block move up/down remains correct after deletes
- The focused CMS coupling audit did not find direct scripture-module imports or scripture-admin dependencies inside the CMS core, registry, renderers, editors, controllers, or requests. The remaining scripture-flavored CMS UI copy was cleaned up in this hardening pass.
- The incorrect book-specific CMS overview bridge direction was removed from schema, scripture payloads, scripture UI, and the development seed. A local database may still contain previously created `bhagavad-gita-overview` CMS data from that earlier wrong pass, but the application code no longer depends on it.
- The CMS page/exposed-region migration drift is now cleaned up: fresh rebuilds create the final intended `pages` schema directly, so verse detail and other exposed-region pages no longer depend on a missing follow-up migration.

## Partially working

### CMS composition workflow depth

- The core structure is real and active.
- The workspace now makes the same-container vs new-container decision explicit.
- The composition grammar is now frozen as page -> container -> block.
- The first live-page CMS composition exposure is now in place on published CMS pages for permitted users.
- Live CMS authoring now mounts directly into the actual container layout rather than through a detached control stack at the bottom of the page.
- Live CMS container and block update/delete no longer require leaving the real page just to reach the first attached affordance.
- Non-CMS page regions now resolve through a shared exposure-key model instead of the earlier verse-detail experiment shell.
- Container placement is structurally supported for:
    - above the current container list
    - below an existing container
- Block placement is structurally supported for:
    - at the top of a container block area
    - at the bottom of a container block area

But the CMS workflow is still intentionally narrow:

- no drag/drop reorder UI yet
- button-based move up/down is the active reorder control
- no block publish state or scheduling yet
- no richer page template system yet
- verse detail is only a first experiment mount; persisted universal region ownership outside CMS pages is not built yet

### CMS module UX

- Rich text now supports eyebrow/title/lead plus structured writing inside the same module, while still staying intentionally lighter than a full WYSIWYG.
- Button group works with multi-button config, alignment, layout options, generic destination typing, and progressive button-vs-layout steps.
- Media works with image/video URL fields plus width/aspect settings.
- Card list now supports a repeatable grouped card/list structure with per-item optional structured link targets.
- Rich-text authoring now feels closer to real writing:
    - write/preview modes now exist in the editor
    - quick insert helpers now exist for headings, bullets, and quotes
    - authors no longer have to write raw HTML for normal prose sections
- Shared link-target editing now feels less technical:
    - common internal targets can be picked from shared lists instead of typed manually
    - pasted internal paths can be resolved into the shared target contract directly
- The refreshed CMS browser smoke now proves both:
    - rich-text editing through the real CMS workspace editor
    - button/link editing through the real CMS workspace editor
- The CMS module contract and folder shape are now frozen enough for future portable-module work, but external module loading itself is still not built.
- Real composition usage now gives a clearer read on the first module set:
    - `rich_text` is already strong for section framing and guide-style prose when paired with eyebrow/title/lead
    - `button_group` is strong for next-step actions once the target is known
    - `card_list` is strong for lightweight structured highlights and related-path sections
    - `media` is usable in real page composition, but its URL-first editing flow still feels more technical than the other modules

But richer authoring is still postponed:

- no rich text WYSIWYG yet
- no media picker/upload flow yet
- no deeper module-specific validation UX beyond request errors

## Needs improvement / still watch closely

### CMS next capability gaps

- The public CMS shell is real, but broader public discovery/navigation is still not built.
- The global navigation system is now active for the shared header, but it is still intentionally narrow:
    - route/scripture target pickers are still basic and slug-driven
    - navigation ordering uses move up/down rather than drag/drop
    - desktop live header authoring is now the strong path, while mobile preserves browsing behavior rather than adding the same editing affordances there
    - footer authoring is real through the shared navigation workspace, but it does not yet have the same live positional editing layer as the header
- External or remote CMS module registration is still not built yet.
- CMS module categories are manifest-ready, but category-management UI is still postponed.
- The old public `scripture.books.overview` path and watch-overview dropdown behavior have been retired from the active scripture browsing experience.
- Page creation is still workspace-first; interactive attach-or-create page flows for buttons/links are not built yet.
- Shared region exposure is now real on home and verse detail, but it is still narrow:
    - backing CMS pages are internal region records resolved by exposure key
    - broader eligible-page rollout is not built yet
    - region-specific workspace cleanup and polish are not built yet
- Draft-safe same-layout CMS authoring is still transitional because live in-place composition currently centers on published CMS pages; a real draft preview path is still a future need.
- Live CMS pages now have in-place adders, but deeper inline editing of existing containers/blocks still leans on the workspace as a fallback.
- Workspace fallback still exists for broader CMS management and deeper utility work, but the routine live add/edit actions no longer default-redirect there.
- Live add flows are now compact by default, but the new-container path on nonblank pages is still not attached in this narrower pass.
- Verse detail now has one clearer live authoring path, but broader non-CMS region rollout and richer same-page editing depth are still future work.

### Remaining canonical polish

- This area is now watch closely / selective reassessment work, not the main
  active stream.
- The broader delete-heavy browser pass for some canonical structural/intro/media surfaces is still worth finishing when it protects the active editing path.
- Translation/commentary Full Edit still needs another usefulness review.
- The later detail-page intro-dropdown phase for canonical detail tops is still not built.
- Book/chapter full-edit owner-attached content-block management still exists as a transitional admin fallback, but the older public live add/edit block path is now being retired from the active scripture browsing experience.
- Verse detail no longer exposes the older live verse-owned block controls on the public page, but the underlying verse-owned note-block system still exists through full edit and other canonical admin routes.
- Legacy content-block models, routes, and full-edit tools still exist in the backend for canonical admin fallback and already-saved editorial data; they are no longer treated as the active public scripture authoring direction.
- Legacy canonical content-block backend controllers, route contexts, and duplication/reorder helpers still exist for full-edit/admin fallback and already-saved editorial data, but they are now clearly transitional rather than part of the active public admin module path.
- The repaired edit-existing-content path still needs a broader browser pass across the remaining active inline/grouped and full-edit surfaces so the on-page editors, mounted context copy, and post-save refresh behavior are confirmed outside feature tests.
- The new smoke layer is intentionally narrow; it is not a full E2E suite yet.

## Current UX condition

### Canonical scripture UX

- The active canonical admin UX is more local, more truthful, and less dependent on detouring into deeper pages for common edits.
- Intro presentation is more consistent across canonical cards.
- Verse detail is cleaner than before because the supplementary CMS region is now the only live composition path on that page; the older verse-owned notes remain visible without competing live authoring controls.
- Verse detail has now received the first compact aesthetics pass for the new visual-structure phase:
    - the top identity area is quieter and uses fewer repeated badges/explanatory labels
    - the canonical verse text remains prominent but sits in a slimmer reading panel
    - translation and commentary entries are tighter reading rows instead of bulky card stacks
    - study companion panels use compact headers, lighter chrome, smaller gaps, and denser metadata chips
    - admin launchers remain local to the same semantic surfaces and stay compact until an editor opens
- Phase 1 of the locked final public design is now implemented for the shared public shell, home page, and book library page:
    - the shared public shell now establishes the parchment/newspaper base, masthead styling, antique-gold accents, cream paper surfaces, and beige border language
    - reusable chronicle primitives now cover paper panels, masthead/ornaments, editorial grids, side rails, stat rows, and compact lists
    - the home page now follows the final newspaper direction with a featured reading area, library preview, study-resource panels, sidebar modules, and preserved CMS supplemental rendering
    - the book library page now uses grouped editorial book sections with a desktop side rail and mobile-friendly single-column flow
    - closed admin launchers remain compact and local, visually softened to sit behind the public reading/library design
- Phase 2 of the locked final public design is now implemented for the book/chapter listing page:
    - the book page now reads as an editorial book feature page with a chronicle paper hero, title treatment, ornament, compact stats, and clear reading entry points
    - the canonical chapter hierarchy is preserved while book sections render as cream paper groups with compact section headers and local admin controls
    - chapter entries now read as scripture-library entries instead of generic app cards
    - the desktop right rail provides current-data overview and temporary study/resource panels without changing backend contracts
    - tablet and mobile collapse back to clean single-column reading gateways
- Phase 3 of the locked final public design is now implemented for the chapter verse-list page:
    - the chapter page now uses a sacred editorial masthead with chronicle paper surfaces, ornament, compact metadata, and clear verse-reading entry points
    - the canonical chapter-section hierarchy is preserved while sections render as cream paper passage groups with compact local admin controls
    - verse reader cards now use the warm newspaper surface language instead of generic shadcn cards and app-list rows
    - the language/translation reader toggle remains intact and is restyled as a compact chronicle reader control
    - the desktop right rail now provides chapter overview, section jumps, reading navigation, and temporary study-resource panels from current data where available
    - tablet and mobile collapse into a clean single-column verse-reading gateway with compact verse cards and local Read verse actions
- Phase 4 of the locked final public design is now implemented for the verse detail page:
    - the verse detail page now centers the canonical verse in a large sacred cream-paper reading panel with serif typography, ornament, and warm editorial metadata
    - previous/next verse navigation now reads as local reading cards instead of generic button rows
    - translations and commentaries now render as compact reading notes/annotations on chronicle paper surfaces while preserving their admin relation surfaces
    - study notes, dictionary terms, topics, characters, recitations, and supplementary CMS content now share a compact support-panel treatment
    - the desktop right rail summarizes verse context, reading actions, study companion counts, recitations, translations, and commentaries from current data
    - tablet and mobile remain a clean single-column sacred reading flow with all support content still accessible
- Phase 5 final visual QA/polish is now complete across the mandatory public scripture flow:
    - shared chronicle title sizing is normalized through the existing feature/verse title utilities
    - the editorial grid and stat rows have been tightened so desktop rails and mobile/tablet divider rhythm are more consistent
    - the home, book library, book/chapter listing, chapter verse-list, and verse detail pages now share the same chronicle hierarchy, spacing, paper surfaces, and compact admin containment
    - remaining hardcoded editorial/support panels are intentionally temporary and should become CMS-backed when the content model is ready
- Book, chapter, and verse public scripture pages are also cleaner because the older owner-attached public add/edit block controls and watch-overview UI are being removed from the active browsing path.
- Book media authoring is now more consistent with the locked hybrid admin direction:
    - the public book media section now supports direct attach/replace/remove actions inline for the common media-assignment path
    - the protected book full-edit media section now reuses the same picker-confidence and quick-action pattern instead of forcing authors into a lower-confidence select-only flow
    - full edit is now more clearly reserved for advanced slot metadata and override work instead of being the first stop for basic media changes
    - the common inline media actions now speak smaller contracts than the advanced full-edit workflow, which makes the hybrid split more truthful
- The four main scripture pages now read with a clearer structure inside the shared site frame:
    - books index: library intro + available books
    - book page: canonical book intro + supplementary media + chapter list
    - chapter page: canonical chapter intro + grouped verse list
    - verse detail: canonical verse intro + study companion + translations + commentaries + supplementary CMS region
- The old page-level scripture admin mode banner is gone from those pages; editor-mode visibility now lives in the shared header toggle instead of taking a full content band above each canonical page.
- Book media now reads as supplemental book material rather than as a canonical or overview-video feature, and the verse CMS region now presents as supplementary content instead of implementation-facing “universal region” copy.
- The shared public header now behaves like a real site navigation system:
    - top-level items can be direct links or parent groups
    - parent items may also keep an overview target
    - nested navigation works on desktop and in the right-side mobile drawer
    - for authorized editors with admin visibility enabled, that same header now becomes the active navigation authoring surface instead of forcing routine edits through the workspace

### CMS page UX

- The CMS page flow is no longer just a record shell. It is now a real composition system that exists both in the workspace and, in a first narrow form, on the live published CMS page itself for permitted users.
- Editors can now decide locally whether content belongs in the same card/container or in a new one, and the UI only exposes the adders that make sense for the current structural state.
- On live CMS pages, routine add controls are now attached directly to the actual container layout instead of appearing in a detached composition shell below the content.
- Those live add controls now stay compact by default, and existing containers/blocks have their first attached edit/delete affordances on the real page.
- Home and verse detail now reuse the same CMS exposure component to render supplementary region content and in-place admin controls without changing their underlying page ownership.
- The CMS builder is now operational for core page/container/block CRUD and movement, but it is still foundation-first rather than feature-complete.
- The CMS workspace still exists for identity management, listing, diagnostics, and support editing, but it is no longer treated as the preferred authoring surface in architecture or workspace copy.
- CMS linking is now expected to happen through generic CMS modules, especially button destinations, instead of per-entity scripture schema linkage.
- Button-group authoring now feels more like a real CTA-editing flow than a raw config form:
    - editors get a quick per-button summary of the current destination before opening deeper fields
    - common label and destination editing stays visible without mixing in style/config controls too early
    - advanced style and new-tab options stay available without dominating the routine path
- Card-list authoring now uses the same common-vs-advanced discipline:
    - editors can shape repeated cards with title/body/CTA/destination first
    - per-card summaries now make the current destination easier to scan before opening deeper fields
    - duplicate and reorder actions reduce repeated-item authoring friction
    - optional eyebrow display polish stays secondary instead of crowding the main content path
- Shared link-target authoring now feels more consistent across `button_group` and `card_list`:
    - destination type selection now lives in the shared target editor instead of being duplicated differently in each module
    - compact details now reveals the same summary-first target flow in both modules
    - scripture-based targets read with clearer human-facing summaries before authors open the full structured fields
- The first real page-composition pass now confirms that the current module set can carry meaningful pages, but it also surfaced the next authoring friction points:
    - rich text is much more usable now, but it still stops short of a fuller editorial writing surface
    - media is useful in page layout, but its authoring flow is the least polished
    - link-target configuration is much faster now, but deeper scripture targets still become more field-heavy than route/cms-page linking
    - positional live editing works best once containers already exist; adding and shaping larger multi-section pages still benefits from another polish pass

## Important architecture reminders

### Locked rules

- Pages remain thin.
- Canonical pages expose surfaces, not feature logic.
- Canonical module behavior stays in the canonical admin module system.
- Canonical scripture pages remain schema-specific exceptions.
- Manual pages use the universal CMS page system.
- CMS composition uses its own page/container/block model.
- CMS modules stay in the dedicated `resources/js/admin/cms/` area.

### Schema truth

- Canonical scripture work must stay grounded in the real scripture tables and relations.
- CMS page work must stay grounded in:
    - `pages`
    - `page_containers`
    - `page_blocks`

Do not drift into fake abstractions detached from either the canonical schema or the CMS data model.

## Immediate next priority when resuming

0. Read the new architecture foundation docs before starting major refactor work:
    - `project-architecture-thesis.md`
    - `current-phase.md`
    - `architecture-guardrails.md`
1. Start from the cleaned base instead of reopening broad cleanup:
    - treat the broad cleanup wave as largely complete
    - reopen only selective reassessment seams when they are clearly justified
    - do not resume broad refactor work by default
2. Continue the site aesthetics and visual-structure phase from the Phase 1 shared shell/home/library pass:
    - keep canonical scripture pages thin and surface-driven
    - reduce excess chrome, repeated labels, and oversized spacing page by page
    - keep public reading hierarchy ahead of admin controls
    - keep admin controls local and compact until an editor is actively open
    - recommended next target: browser/device QA and CMS-backed replacement planning for temporary editorial/support panels, because the locked public scripture reading flow now shares the chronicle visual system
3. Use the real composition pass as the basis for the next CMS improvements:
    - improve the first module set based on authoring friction instead of adding many new modules
    - keep building inside declared supplemental regions instead of improvising new seams
    - continue using the shared public frame instead of reintroducing page-specific shells
4. Keep the active scripture admin path trustworthy while that phase begins:
    - extend browser validation across the remaining grouped/full-edit canonical surfaces as needed
    - preserve the new narrow smoke layer for the active inline editors
    - keep row/page semantics and same-page behavior honest
5. Treat protected canonical edit and transitional backend write endpoints as
   watch / reassess later only; do not recreate the deleted route-specific
   Full Edit React pages.
6. Extend the live CMS interaction model only where the real composition pass showed clear need:
    - keep published CMS pages interactive for permitted users
    - preserve the locked same-layout public-page-first authoring rule as live composition expands
    - preserve the stable `manifest.ts` / `renderer.tsx` / `editor.tsx` / `types.ts` / `defaults.ts` / `index.tsx` contract
7. Keep the restored scripture browse baseline trustworthy:
    - preserve the full enabled-corpus development seed baseline
    - avoid narrowing local browse state back to a Bhagavad Gita-only dataset unless a task explicitly needs a narrow test seeder
    - continue phasing out overlapping live canonical block controls only where a clear CMS/exposed-region replacement already exists

## Do not forget

- `admin-architecture.md` is the authoritative architecture document.
- `cms-architecture.md` is the focused CMS companion document for CMS-specific architecture work.
- `scripture-admin-editing.md` is the practical companion for the active canonical admin surface/module path.
- `admin-module-integration.md` is the practical companion for future outside React/component integration into the admin module system.
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first.
