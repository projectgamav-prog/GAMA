# ⚠️ SYSTEM PROTOCOL — DO NOT MODIFY ABOVE THIS LINE
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

# 🚫 DO NOT EDIT ABOVE THIS LINE
-----------------------





# Current State Snapshot (Before Pause)

## Working

### Architecture
- Pages are thin render shells.
- Admin attaches through semantic surfaces.
- Modules qualify by semantic identity + capabilities.
- Runtime host resolves and renders module actions.
- Buttons/actions are module-driven instead of page-hardcoded in the main active flows.

### Public reading flow
- Book list: `scripture.books.index`
- Chapter list: `scripture.books.show`
- Verse list: `scripture.chapters.show`
- Verse detail: `scripture.chapters.verses.show`

### Verse translation support
- Schema-driven from `verse_translations`
- Source-aware from `translation_sources`
- Inline quick edit works through the Verse surface/module/action system on verse detail and chapter verse-list rows
- Successful inline create/save now closes back to the normal display state
- User-facing copy was cleaned up from schema-heavy wording

### Verse commentary support
- Schema-driven from `verse_commentaries`
- Source-aware from `commentary_sources`
- Inline quick edit works through the Verse surface/module/action system on verse detail and chapter verse-list rows
- Successful inline create/save now closes back to the normal display state
- User-facing copy was cleaned up from schema-heavy wording

### Book media slot support
- Schema-driven from the existing media-slot contract and module wiring
- Inline create/save/delete now closes back to the normal display state
- Page shells remain thin while the module owns the editing lifecycle

### Chapter-page verse row admin
- Each visible verse row on `scripture.chapters.show` now exposes its own verse admin controls through verse surfaces
- Verse identity, intro, structured notes/meta, translations, commentaries, nearby verse create, delete, and full edit launcher now attach directly to the rendered verse rows/cards
- Verse-row controls stay attached to the corresponding verse instead of drifting back to chapter-section-only controls or page-local action hacks

### Intro surface CRUD
- Verse intro, chapter intro, book-section intro, and chapter-section intro now support create/update/delete through the shared registered intro editor where the backend route exists
- Intro delete remains module-driven and surface-driven rather than being hardcoded into page shells

### Current book-schema CRUD coverage
- `books`: create, identity/details update, editorial content-block CRUD, media-slot CRUD, and delete are active
- `book_sections`: create, detail update, intro CRUD, and delete are active
- `chapters`: create, identity update, intro CRUD, chapter note-block CRUD, and delete are active
- `chapter_sections`: create, detail update, intro CRUD, and delete are active
- `verses`: create, identity update, delete, intro CRUD, structured notes/meta edit, translation CRUD, commentary CRUD, and verse note-block CRUD are active
- `verse intro/notes`: intro and structured notes/meta now edit inline from the chapter verse list as well as verse detail; published note blocks still stay on verse detail/full edit
- `relevant media slot surfaces`: book media slots now support create/update/delete in the active module path

### Structural delete coverage
- Shared `entity_actions` delete controls now attach to the current structural admin surfaces instead of page-local buttons
- Book delete is available from the book shell
- Chapter delete is available from the chapter shell
- Book-section and chapter-section delete are available from their existing section-group wrappers
- Destructive cleanup now removes entity-owned editorial data before deleting structural rows so morph-owned content does not orphan silently

### Module/action UI
- Compact grouped launcher layout works
- Full-width stacked launcher bug was fixed
- Buttons no longer occupy separate full-width rows in the touched intro/header areas
- Verse list density improved
- Duplicate verse-number display was removed

## Partially working

### Full Edit for translations/commentaries
- Deep-link targeting was added
- Full-edit page can open the intended translation/commentary editor automatically
- Routing is now truthful in principle

But this still needs real product-level validation:
- it may still feel weaker than a true deeper editing workspace
- the UX needs to be checked again before trusting it as fully solved

## Needs improvement / still watch closely

### Full Edit experience
- Must feel meaningfully deeper than inline quick edit
- Must not regress into a decorative jump or weak duplicate shell
- Needs future review to confirm that it is genuinely useful

### Inline editor lifecycle validation
- Close-on-success behavior is now wired for the active module-based create/save editors audited in this pass
- Browser validation is still needed to confirm there are no remaining lifecycle regressions on the touched surfaces, especially the new chapter-page verse-row controls and the new intro/media delete actions

### Remaining scope watchpoints
- No open CRUD gap remains in the current active book-schema entity list after this pass
- Verse published note-block CRUD still lives on verse detail/full edit rather than as compact row-local controls on the chapter page; that is now a UX/scope choice, not a missing schema CRUD path

### User-friendly editing UX
- Translation/commentary wording improved, but all new edit flows should keep being checked for schema-heavy language leaks
- Editors should feel content-oriented, not table-oriented

### Button presentation
- Current compact launcher layout is correct
- Possible future polish: slightly stronger white/high-contrast visual treatment without reintroducing heavy full-row behavior

## Important architecture reminders

### Locked rules
- Pages remain thin
- Pages expose surfaces, not feature logic
- Modules own editing behavior
- Module actions should stay module-driven
- Canonical scripture/book pages remain schema-specific exceptions
- Future non-canonical work should move toward one universal CMS-driven page system

### Schema truth
Current feature work must remain grounded in real tables and relations, especially for verse support:
- `verse_translations`
- `translation_sources`
- `verse_commentaries`
- `commentary_sources`

Do not drift into fake generic abstractions detached from the schema.

## Immediate next priority when resuming
1. Validate the chapter-page verse-row controls in browser: identity, intro, notes/meta, nearby create, delete, translations, commentaries, and full edit
2. Validate delete flows on the active surfaces: book, book section, chapter, chapter section, verse, intro, and media slot
3. Re-check Full Edit experience for translations/commentaries and verse note depth from the chapter page
4. Continue UX cleanup without reintroducing page-local admin behavior

## Do not forget
- `admin-architecture.md` is now the authoritative architecture document
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first
