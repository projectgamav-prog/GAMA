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

### Canonical scripture public flow
- Book list: `scripture.books.index`
- Chapter list: `scripture.books.show`
- Verse list: `scripture.chapters.show`
- Verse detail: `scripture.chapters.verses.show`

### Canonical scripture admin state
- Verse translations/commentaries stay schema-driven from the real verse tables and relations.
- Verse-row admin controls on the chapter page are active and browser-validated for identity, intro, meta, translations, commentaries, nearby create, delete, and full edit launch.
- Chapter-row controls on the book page are active and browser-validated for identity, intro, delete confirmation, and editor-mode visibility.
- Intro dropdowns are active on book cards, book-section cards/groups, chapter cards, chapter-section cards/groups, and verse rows where intro content exists.
- The current book-schema CRUD slice remains active for books, book sections, chapters, chapter sections, verses, verse intro/meta, verse translations/commentaries, relevant note-block surfaces, and book media slots.
- Canonical scripture pages no longer carry book-specific CMS page bridge fields or overview-page linkage logic.

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
- `button_group` now supports generic destination modes:
  - `url`
  - `cms_page`
  - `scripture_route`
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
- Rich text works through a simple HTML-based editor.
- Button group works with multi-button config, alignment, layout options, generic destination typing, and progressive button-vs-layout steps.
- Media works with image/video URL fields plus width/aspect settings.
- The CMS module contract and folder shape are now frozen enough for future portable-module work, but external module loading itself is still not built.

But richer authoring is still postponed:
- no rich text WYSIWYG yet
- no media picker/upload flow yet
- no deeper module-specific validation UX beyond request errors

## Needs improvement / still watch closely

### CMS next capability gaps
- The public CMS shell is real, but broader public discovery/navigation is still not built.
- External or remote CMS module registration is still not built yet.
- CMS module categories are manifest-ready, but category-management UI is still postponed.
- The legacy `scripture.books.overview` page still exists and should be reassessed separately from CMS once its long-term role is decided.
- Page creation is still workspace-first; interactive attach-or-create page flows for buttons/links are not built yet.
- Shared region exposure is now real on home and verse detail, but it is still narrow:
  - backing CMS pages are internal region records resolved by exposure key
  - broader eligible-page rollout is not built yet
  - region-specific workspace cleanup and polish are not built yet
- Draft-safe same-layout CMS authoring is still transitional because live in-place composition currently centers on published CMS pages; a real draft preview path is still a future need.
- Live CMS pages now have in-place adders, but deeper inline editing of existing containers/blocks still leans on the workspace as a fallback.
- Workspace fallback still exists for broader CMS management and deeper utility work, but the routine live add/edit actions no longer default-redirect there.
- Live add flows are now compact by default, but the new-container path on nonblank pages is still not attached in this narrower pass.

### Remaining canonical polish
- The broader delete-heavy browser pass for some canonical structural/intro/media surfaces is still worth finishing.
- Translation/commentary Full Edit still needs another usefulness review.
- The later detail-page intro-dropdown phase for canonical detail tops is still not built.
- Book/chapter/verse owner-attached content-block add flows still exist on canonical pages. They remain valid for canonical editorial blocks today, but they should be reassessed carefully if a broader universal content layer starts covering some of the same user-facing composition needs.

## Current UX condition

### Canonical scripture UX
- The active canonical admin UX is more local, more truthful, and less dependent on detouring into deeper pages for common edits.
- Intro presentation is more consistent across canonical cards.

### CMS page UX
- The CMS page flow is no longer just a record shell. It is now a real composition system that exists both in the workspace and, in a first narrow form, on the live published CMS page itself for permitted users.
- Editors can now decide locally whether content belongs in the same card/container or in a new one, and the UI only exposes the adders that make sense for the current structural state.
- On live CMS pages, routine add controls are now attached directly to the actual container layout instead of appearing in a detached composition shell below the content.
- Those live add controls now stay compact by default, and existing containers/blocks have their first attached edit/delete affordances on the real page.
- Home and verse detail now reuse the same CMS exposure component to render supplementary region content and in-place admin controls without changing their underlying page ownership.
- The CMS builder is now operational for core page/container/block CRUD and movement, but it is still foundation-first rather than feature-complete.
- The CMS workspace still exists for identity management, listing, diagnostics, and support editing, but it is no longer treated as the preferred authoring surface in architecture or workspace copy.
- CMS linking is now expected to happen through generic CMS modules, especially button destinations, instead of per-entity scripture schema linkage.

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
1. Extend the live CMS interaction model without widening CMS scope too quickly:
   - keep published CMS pages interactive for permitted users
   - preserve the locked same-layout public-page-first authoring rule as live composition expands
   - keep routine add/edit controls attached directly to eligible layout elements instead of drifting back into detached control shells
   - extend the new shared exposed-region model to more eligible pages without dragging canonical structure into CMS
   - preserve the stable `manifest.ts` / `renderer.tsx` / `editor.tsx` / `types.ts` / `defaults.ts` / `index.tsx` contract
2. Improve the first CMS module family only where it materially helps live authoring:
   - richer text editing
   - media selection/upload
   - better module-level validation feedback
   - stronger generic destination authoring polish for button-based linking
   - attach-existing-page vs create-new-page flows during button/link authoring
3. Reassess public CMS discovery/navigation only after the live composition flow is stable.
4. Return to the remaining canonical delete/full-edit/detail-top polish items without reintroducing page-local hacks.

## Do not forget
- `admin-architecture.md` is the authoritative architecture document.
- `cms-architecture.md` is the focused CMS companion document for CMS-specific architecture work.
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first.
