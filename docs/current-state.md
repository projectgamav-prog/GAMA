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

### CMS page foundation and composition
- Authenticated CMS workspace exists at:
  - `/cms/pages`
  - `/cms/pages/{page:slug}`
- Public CMS page shell exists at:
  - `/pages/{page:slug}`
- CMS page create works through the Add Page flow in the CMS workspace.
- Dashboard exposes a CMS pages entry point and Add Page link for admin-context users.
- CMS page records support:
  - `title`
  - `slug`
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
- CMS module folders now follow a predictable portable shape under `resources/js/admin/cms/modules/<module>/`:
  - `manifest.ts`
  - `renderer.tsx`
  - `editor.tsx`
  - `types.ts`
  - `defaults.ts`
  - `index.tsx`
- CMS manifests now support the core module contract plus an optional `validate` hook.
- Public CMS pages now render ordered containers, and each container renders its ordered CMS blocks through the dedicated CMS renderer path.
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
  - foreign keys are present
  - page delete cascades to its containers and blocks
  - container delete removes only that container and its blocks
  - block delete compacts ordering without corrupting unrelated records
  - container/block move up/down remains correct after deletes
- The focused CMS coupling audit did not find direct scripture-module imports or scripture-admin dependencies inside the CMS core, registry, renderers, editors, controllers, or requests. The remaining scripture-flavored CMS UI copy was cleaned up in this hardening pass.

## Partially working

### CMS composition workflow depth
- The core structure is real and active.
- The workspace now makes the same-container vs new-container decision explicit.
- The composition grammar is now frozen as page -> container -> block.
- Container placement is structurally supported for:
  - above the current container list
  - below an existing container
- Block placement is structurally supported for:
  - at the top of a container
  - below an existing block inside the same container

But the CMS workflow is still intentionally narrow:
- no drag/drop reorder UI yet
- button-based move up/down is the active reorder control
- no block publish state or scheduling yet
- no richer page template system yet

### CMS module UX
- Rich text works through a simple HTML-based editor.
- Button group works with multi-button config, alignment, and layout options.
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

### Remaining canonical polish
- The broader delete-heavy browser pass for some canonical structural/intro/media surfaces is still worth finishing.
- Translation/commentary Full Edit still needs another usefulness review.
- The later detail-page intro-dropdown phase for canonical detail tops is still not built.

## Current UX condition

### Canonical scripture UX
- The active canonical admin UX is more local, more truthful, and less dependent on detouring into deeper pages for common edits.
- Intro presentation is more consistent across canonical cards.

### CMS page UX
- The CMS page flow is no longer just a record shell. It is now a real and browser-validated composition workspace.
- Editors can now decide locally whether content belongs in the same card/container or in a new one.
- The CMS builder is now operational for core page/container/block CRUD and movement, but it is still foundation-first rather than feature-complete.

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
1. Use the frozen CMS foundation to define the next extension seam without widening CMS scope too quickly:
   - decide how future external/remote CMS modules register into the current manifest registry
   - preserve the stable `manifest.ts` / `renderer.tsx` / `editor.tsx` / `types.ts` / `defaults.ts` / `index.tsx` contract
   - keep module integration touchpoints minimal and same-origin-safe
2. Improve the first CMS module family only where it materially helps authoring:
   - richer text editing
   - media selection/upload
   - better module-level validation feedback
3. Reassess public CMS discovery/navigation only after the composition flow is stable.
4. Return to the remaining canonical delete/full-edit/detail-top polish items without reintroducing page-local hacks.

## Do not forget
- `admin-architecture.md` is the authoritative architecture document.
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first.
