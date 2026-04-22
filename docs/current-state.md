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
-----------------------


# Current State Snapshot

## Working

### Architecture documentation
- A new architecture foundation set now exists in `docs/`:
  - `project-architecture-thesis.md`
  - `cms-architecture.md`
  - `admin-surface-design.md`
  - `payload-architecture.md`
  - `registry-architecture.md`
  - `refactor-roadmap.md`
  - `current-phase.md`
  - `architecture-guardrails.md`
  - `anti-patterns.md`
- These documents now define the locked architecture direction for:
  - canonical scripture versus CMS separation
  - hybrid admin editing
  - admin surfaces and module attachment
  - controller/builder/mapper payload boundaries
  - registry use versus central switchboards
  - phased safe refactor sequencing

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
  - treat `resources/js/pages/scripture/chapters/full-edit.tsx` and
    `resources/js/pages/scripture/chapters/verses/full-edit.tsx` as
    reassess-later pressure points, not automatic next tasks

### Architecture
- Pages are thin render shells.
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
  - the active canonical registry now reflects the real working module families instead of carrying dead public-block compatibility files
  - book media slot editor defaults no longer hardcode the retired overview-video role as the create default in the active editor helpers
  - the remaining shared intro helpers were re-homed from `resources/js/admin/modules/blocks/` into `resources/js/admin/modules/intros/` so the active module families read more honestly
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
   - `refactor-roadmap.md`
1. Start from the cleaned base instead of reopening broad cleanup:
   - treat the broad cleanup wave as largely complete
   - reopen only selective reassessment seams when they are clearly justified
   - do not resume broad refactor work by default
2. Use the real composition pass as the basis for the next CMS improvements:
   - improve the first module set based on authoring friction instead of adding many new modules
   - keep building inside declared supplemental regions instead of improvising new seams
   - continue using the shared public frame instead of reintroducing page-specific shells
3. Keep the active scripture admin path trustworthy while that phase begins:
   - extend browser validation across the remaining grouped/full-edit canonical surfaces as needed
   - preserve the new narrow smoke layer for the active inline editors
   - keep row/page semantics and same-page behavior honest
4. Treat the remaining larger canonical full-edit files as watch / reassess later only:
   - `resources/js/pages/scripture/chapters/full-edit.tsx`
   - `resources/js/pages/scripture/chapters/verses/full-edit.tsx`
   - do not treat them as automatic next tasks
5. Extend the live CMS interaction model only where the real composition pass showed clear need:
   - keep published CMS pages interactive for permitted users
   - preserve the locked same-layout public-page-first authoring rule as live composition expands
   - preserve the stable `manifest.ts` / `renderer.tsx` / `editor.tsx` / `types.ts` / `defaults.ts` / `index.tsx` contract
6. Keep the restored scripture browse baseline trustworthy:
   - preserve the full enabled-corpus development seed baseline
   - avoid narrowing local browse state back to a Bhagavad Gita-only dataset unless a task explicitly needs a narrow test seeder
   - continue phasing out overlapping live canonical block controls only where a clear CMS/exposed-region replacement already exists

## Do not forget
- `admin-architecture.md` is the authoritative architecture document.
- `cms-architecture.md` is the focused CMS companion document for CMS-specific architecture work.
- `scripture-admin-editing.md` is the practical companion for the active canonical admin surface/module path.
- `admin-module-integration.md` is the practical companion for future outside React/component integration into the admin module system.
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first.
