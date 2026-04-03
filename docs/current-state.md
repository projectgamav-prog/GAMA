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
- Inline quick edit works through the Verse surface/module/action system
- User-facing copy was cleaned up from schema-heavy wording

### Verse commentary support
- Schema-driven from `verse_commentaries`
- Source-aware from `commentary_sources`
- Inline quick edit works through the Verse surface/module/action system
- User-facing copy was cleaned up from schema-heavy wording

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
1. Re-check Full Edit experience for translations/commentaries and strengthen it if still weak
2. Continue polishing translation/commentary UX for editor-friendliness
3. Keep reducing page burden and hidden hardcoding
4. Continue long-term movement toward schema-derived modules and later CMS-integratable module families

## Do not forget
- `admin-architecture.md` is now the authoritative architecture document
- Future Codex prompts should explicitly tell Codex to read `admin-architecture.md` first