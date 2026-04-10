# SYSTEM PROTOCOL - DO NOT MODIFY ABOVE THIS LINE
# This section defines how this file must be used.
# Codex must follow these rules strictly.

## Maintenance Rule
This file defines the immediate development direction.

It must be updated whenever:
- priorities change
- a major task is completed
- a new phase begins

## Codex Instruction
Before starting any implementation:
- Read `admin-architecture.md`
- Read `current-state.md`
- Read this file (`next-step.md`)

Follow the priority order defined here unless explicitly instructed otherwise.

After completing a task:
- Update this file if the next priorities have changed
- Remove completed steps and add new ones

# DO NOT EDIT ABOVE THIS LINE
-----------------------


# Next Step (When Resuming Work)

## First thing to do
Before any implementation prompt, tell Codex:

- read `admin-architecture.md` first
- treat it as the authoritative architecture instruction
- keep canonical scripture pages thin and surface-driven
- treat manual pages as CMS
- keep CMS composition independent from canonical scripture assumptions
- if the task touches CMS architecture or CMS modules, also read `cms-architecture.md`

## Immediate focus

### 1. Extend the live CMS interaction model carefully
The CMS page/container/block foundation is now runtime-validated, and the first live-page composition exposure exists on published CMS pages for permitted users.

The next CMS task should focus on the live interaction seam:
- preserve the locked same-layout rule so admins compose on the real page layout with augmentation controls instead of a separate builder shell
- preserve the new in-place attachment rule so controls stay on the actual container/block area instead of drifting into detached bottom-of-page shells
- preserve the compact-controls rule so live add/edit affordances stay small by default and only expand after click
- preserve the no-dashboard-redirect rule so routine live add/edit flows stay on the same public-looking page
- define how universal composition regions appear across live pages without making users hunt through dashboard page records first
- keep CMS composition interactive on published pages for permitted users
- preserve the page -> container -> block grammar while shifting the workflow toward in-place composition
- decide how future site regions will expose add-section / add-content / add-buttons entry points
- turn the current verse-detail experiment into a persisted universal region model if that direction still holds
- keep CMS integration touchpoints minimal and same-origin-safe
- decide the draft-safe same-layout preview path so draft authoring does not drift back into workspace-first habits

### 2. Improve the first CMS module family carefully
After the live composition flow is stable, improve the first registry modules where it materially helps authoring:
- richer text editing than raw HTML
- media selection/upload workflow
- stronger button group authoring polish and validation feedback
- richer generic destination authoring for button-driven links to CMS pages, scripture routes, and URLs
- attach-existing-page vs create-new-page flows while configuring buttons/links
- keep the progressive reveal pattern consistent as more modules are added

Do not overbuild category-management UI yet.
Do not move CMS modules into scripture module folders.

### 3. Reassess broader exposure and phase-outs
Once live composition and editing are stable, reassess:
- whether CMS pages need a light public index/discovery path
- whether layout keys need stricter semantics
- whether public page presentation needs stronger empty-state or layout polish
- whether the legacy `scripture.books.overview` page should be retired or repurposed on its own merits
- which old canonical owner-attached block-add flows should stay canonical-specific and which should be phased out when universal content regions cover the same use case

Do not overbuild a full CMS site-builder in one jump.

### 4. Return to the remaining canonical polish items
Once the CMS foundation is stable, resume the still-open canonical cleanup:
- remaining delete-heavy browser validation
- re-check Full Edit usefulness for translations/commentaries
- later move the shared Intro dropdown concept to canonical detail-page tops

### 5. Keep architecture discipline
As new work continues:
- canonical scripture remains schema-driven
- CMS composition remains page -> container -> block
- CMS modules remain registry-based under `resources/js/admin/cms/`
- CMS modules remain independent from canonical admin internals
- CMS-to-scripture linking should happen through generic CMS module destinations, not per-entity scripture schema foreign keys
- live-page composition is preferred over dashboard-first CMS record hunting
- content-managed pages should keep the same core layout for admin and public, with admin augmentation layered onto the real page
- routine live authoring controls should be attached to real layout elements, with insertion context derived from click location where possible
- routine live controls should stay compact by default, with deeper configuration revealed only after click
- pages stay thin
- admin logic stays out of page-local hacks

## Reminder of boundary
- Do not let CMS pages become the source of truth for canonical scripture structure.
- Do not redesign canonical routing into CMS routing.
- Do not entangle CMS modules with scripture module folders.
- Do not flatten CMS pages back into a single block list.

Safe direction:
- page record first
- container structure second
- block composition third
- richer authoring UX later
- remote/external module integration through the frozen CMS manifest contract after that

## Practical restart order
1. Extend live CMS composition exposure
2. Improve module authoring where it helps
3. Reassess broader exposure and phase-outs
4. Resume outstanding canonical polish work

## Success condition for the next phase
When resuming, the goal is not "add lots of CMS quickly."

The goal is:
- one real universal page model
- one clear container layer
- one extensible CMS module registry
- one portable CMS module contract
- clear separation from canonical scripture
- thin pages
- truthful UX
