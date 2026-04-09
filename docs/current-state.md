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
  - create a new container with its first block
  - add a block inside an existing container
  - edit existing containers
  - edit existing blocks
  - delete containers
  - delete blocks
  - open the public page when published
- The current CMS module registry supports:
  - `rich_text`
  - `button_group`
  - `media`
- Public CMS pages now render ordered containers, and each container renders its ordered CMS blocks through the dedicated CMS renderer path.

## Partially working

### CMS composition workflow depth
- The core structure is real and active.
- The workspace now makes the same-container vs new-container decision explicit.
- Container placement is structurally supported for:
  - above the current container list
  - below an existing container
- Block placement is structurally supported for:
  - at the top of a container
  - below an existing block inside the same container

But the CMS workflow is still intentionally narrow:
- no drag/drop or move/reorder UI yet
- no page delete flow yet
- no container move flow for already-created containers
- no block publish state or scheduling yet
- no richer page template system yet

### CMS module UX
- Rich text works through a simple HTML-based editor.
- Button group works with multi-button config, alignment, and layout options.
- Media works with image/video URL fields plus width/aspect settings.

But richer authoring is still postponed:
- no rich text WYSIWYG yet
- no media picker/upload flow yet
- no deeper module-specific validation UX beyond request errors

## Needs improvement / still watch closely

### CMS browser validation
- The independent CMS composition flow still needs a real browser pass for:
  - Add Page create flow
  - page identity update flow
  - create container
  - add block inside container
  - edit container
  - edit block
  - delete container
  - delete block
  - draft-vs-published public route behavior

### CMS next capability gaps
- Reordering and movement are the next operational gap in the CMS builder.
- Page delete is still missing.
- The public CMS shell is real, but broader public discovery/navigation is still not built.

### Remaining canonical polish
- The broader delete-heavy browser pass for some canonical structural/intro/media surfaces is still worth finishing.
- Translation/commentary Full Edit still needs another usefulness review.
- The later detail-page intro-dropdown phase for canonical detail tops is still not built.

## Current UX condition

### Canonical scripture UX
- The active canonical admin UX is more local, more truthful, and less dependent on detouring into deeper pages for common edits.
- Intro presentation is more consistent across canonical cards.

### CMS page UX
- The CMS page flow is no longer just a record shell. It is now a real composition workspace.
- Editors can now decide locally whether content belongs in the same card/container or in a new one.
- The CMS builder is still foundation-first rather than feature-complete.

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
1. Browser-validate the CMS composition foundation end to end:
   - page create
   - page update
   - create container
   - add block
   - edit/delete container
   - edit/delete block
   - draft vs published public behavior
2. Add the next operational CMS basics without overbuilding:
   - container/block movement or reordering
   - page delete
3. Improve the first CMS module family only where it materially helps composition:
   - richer text editing
   - media selection/upload
   - better module-level validation UX
4. Reassess public CMS discovery/navigation only after the composition flow is stable.
5. Return to the remaining canonical delete/full-edit/detail-top polish items without reintroducing page-local hacks.

## Do not forget
- `admin-architecture.md` is the authoritative architecture document.
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first.
