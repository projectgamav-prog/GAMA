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


# Current State Snapshot

## Working

### Architecture
- Pages are thin render shells.
- Canonical scripture admin still attaches through semantic surfaces and module qualification.
- Canonical scripture pages remain schema-driven exceptions.
- Manual page creation is now formally treated as CMS, not as a one-off feature direction.
- A dedicated `pages` table now exists as the foundation for universal CMS pages.
- Page-owned content uses the same polymorphic `content_blocks.parent_*` ownership pattern already used by canonical entities.

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

### CMS page foundation
- Authenticated CMS workspace now exists at:
  - `/cms/pages`
  - `/cms/pages/{page:slug}`
- Public CMS page shell now exists at:
  - `/pages/{page:slug}`
- CMS page create works through the new Add Page flow in the CMS workspace.
- Dashboard now exposes a CMS pages entry point and Add Page link for admin-context users.
- CMS page records currently support:
  - `title`
  - `slug`
  - `status`
  - optional `layout_key`
- CMS page workspace currently supports:
  - create page
  - list pages
  - edit page identity/status/layout key
  - open the public page when published
  - review published block preview
- Page-owned block ownership is established even though the universal page block editor is not built yet.

## Partially working

### CMS page composition
- Pages already own content blocks through the shared owner model.
- Public CMS pages already render published page-owned blocks if they exist.

But the actual universal page block management workflow is still not built:
- no CMS page block create/edit/delete UI yet
- no dedicated CMS page block ordering workflow yet
- no page-specific block regions or page-builder UX yet

### Full Edit for canonical verse translations/commentaries
- Deep-link targeting was added.
- Full-edit page can open the intended translation/commentary editor automatically.
- Routing is now more truthful in principle.

But it still needs product-level validation to prove it is meaningfully deeper than inline quick edit.

## Needs improvement / still watch closely

### CMS page browser validation
- The CMS page foundation needs a real browser pass for:
  - dashboard entry point
  - Add Page create flow
  - page identity update flow
  - draft-vs-published public route behavior
  - empty-state page shell behavior

### CMS page next capability gap
- Universal page-owned block CRUD is the main remaining CMS gap after this foundation pass.
- The current page workspace shows ownership and preview, but not composition tooling yet.

### Remaining canonical polish
- The broader delete-heavy browser pass for some canonical structural/intro/media surfaces is still worth finishing.
- Translation/commentary Full Edit still needs another usefulness review.
- The later detail-page intro-dropdown phase for canonical detail tops is still not built.

## Current UX condition

### Canonical scripture UX
- The active canonical admin UX is more local, more truthful, and less dependent on detouring into deeper pages for common edits.
- Intro presentation is more consistent across canonical cards.

### CMS page UX
- The CMS page flow is intentionally minimal and foundation-first.
- Editors can now create and identify universal pages, but they cannot yet compose them through an in-app block editor.
- The public CMS shell is real, but still sparse by design in this phase.

## Important architecture reminders

### Locked rules
- Pages remain thin.
- Canonical pages expose surfaces, not feature logic.
- Canonical module behavior stays in the admin module system.
- Canonical scripture pages remain schema-specific exceptions.
- Manual pages use the universal CMS page system.
- Content blocks remain reusable across owner types.

### Schema truth
- Canonical scripture work must stay grounded in the real scripture tables and relations.
- CMS page work must stay grounded in the dedicated `pages` table plus shared content-block ownership.

Do not drift into fake abstractions detached from either the canonical schema or the CMS page model.

## Immediate next priority when resuming
1. Browser-validate the CMS page foundation end to end:
   - dashboard entry point
   - page create
   - page update
   - published page open
   - draft page gating
2. Add the first universal CMS page-owned block management path without inventing a second content system.
3. Decide the next minimal public-navigation/discovery step for CMS pages only after the block workflow is clearer.
4. Return to the remaining canonical delete/full-edit/detail-top polish items without reintroducing page-local hacks.

## Do not forget
- `admin-architecture.md` is the authoritative architecture document.
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first.
