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
- if the task touches canonical admin surface/module work, also read `scripture-admin-editing.md`
- if the task adapts outside React/components into admin or CMS modules, also read `admin-module-integration.md`

## Immediate focus

### 1. Keep the active book-schema edit path trustworthy
The next pass should stay focused on the active existing-content edit path before any new structural work:
- continue the browser pass across the repaired edit-existing-content surfaces across books, book sections, chapters, chapter sections, verses, verse meta, and active verse support editors
- pay special attention to grouped inline editors on public schema pages:
  - grouped section row editors on book and chapter pages
- keep confirming that grouped inline editors use the right mounted semantics and return to the correct page context after save
- use the same end-to-end standard that exposed the earlier dummy-editor bug:
  - actual browser submit
  - request fired
  - database row changed
  - UI visibly updated after save
- keep confirming that always-mounted full-edit cards keep showing refreshed values after save instead of stale pre-save form state
- keep ignoring retired public scripture block-authoring paths while auditing edit behavior
- do not reintroduce the retired public scripture block-module branch while cleaning or extending canonical admin surfaces
- leave canonical full-edit and protected schema editing intact where no safe replacement exists yet

This still needs to preserve the broader trustworthy state:
- keep the full enabled-corpus development seed baseline intact for local browse behavior
- do not narrow local browse state back to Bhagavad Gita only unless a task explicitly needs a narrow seeder
- continue tracing the shared exposed-region model on eligible pages so the CMS path is real, not just theoretically mounted
- keep removing overlapping legacy live canonical block controls only where a real CMS/exposed-region replacement already exists
- leave canonical full-edit and protected schema editing intact where no safe replacement exists yet

### 2. Extend the live CMS interaction model carefully
The CMS page/container/block foundation is now runtime-validated, and the first live-page composition exposure exists on published CMS pages for permitted users.

The next CMS task should focus on the live interaction seam:
- preserve the locked same-layout rule so admins compose on the real page layout with augmentation controls instead of a separate builder shell
- preserve the new in-place attachment rule so controls stay on the actual container/block area instead of drifting into detached bottom-of-page shells
- preserve the compact-controls rule so live add/edit affordances stay small by default and only expand after click
- preserve the no-dashboard-redirect rule so routine live add/edit flows stay on the same public-looking page
- extend the new shared exposed-region model across additional eligible live pages without making users hunt through dashboard page records first
- keep CMS composition interactive on published pages for permitted users
- preserve the page -> container -> block grammar while shifting the workflow toward in-place composition
- decide how more site regions should expose add-section / add-content / add-buttons entry points
- keep the normalized CMS page baseline stable and avoid reintroducing fresh migration drift in the page/exposed-region layer
- keep CMS integration touchpoints minimal and same-origin-safe
- decide the draft-safe same-layout preview path so draft authoring does not drift back into workspace-first habits

### 3. Improve the first CMS module family carefully
After the live composition flow is stable, improve the first registry modules where it materially helps authoring:
- richer text editing than raw HTML
- media selection/upload workflow
- stronger button group authoring polish and validation feedback
- richer generic destination authoring for button-driven links to CMS pages, scripture routes, and URLs
- attach-existing-page vs create-new-page flows while configuring buttons/links
- keep the progressive reveal pattern consistent as more modules are added

Do not overbuild category-management UI yet.
Do not move CMS modules into scripture module folders.

### 4. Reassess broader exposure and phase-outs
Once live composition and editing are stable, reassess:
- whether CMS pages need a light public index/discovery path
- whether layout keys need stricter semantics
- whether public page presentation needs stronger empty-state or layout polish
- which old canonical owner-attached block-add flows should stay canonical-specific and which should be phased out when universal content regions cover the same use case
- the remaining book and chapter live content-block regions, which are still transitional because they do not yet have a shared CMS-region replacement

Do not overbuild a full CMS site-builder in one jump.

### 5. Return to the remaining canonical polish items
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
1. Keep scripture browsing and exposed-region cleanup trustworthy
2. Extend live CMS composition exposure
3. Improve module authoring where it helps
4. Reassess broader exposure and phase-outs
5. Resume outstanding canonical polish work

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
