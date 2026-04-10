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

## Immediate focus

### 1. Use the frozen CMS module contract for future external module work
The CMS page/container/block foundation is now browser-validated and runtime-validated on the applied MySQL schema.

The next CMS task should focus on the extension seam:
- define how future external or remote React/TSX modules plug into the current manifest registry
- keep module folders portable and easy to copy in
- preserve the frozen local module shape:
  - `manifest.ts`
  - `renderer.tsx`
  - `editor.tsx`
  - `types.ts`
  - `defaults.ts`
  - `index.tsx`
- keep CMS integration touchpoints minimal
- preserve same-origin-safe CMS navigation behavior
- do not casually change the page -> container -> block grammar while doing this

### 2. Improve the first CMS module family carefully
After the composition flow is stable, improve the first registry modules where it materially helps authoring:
- richer text editing than raw HTML
- media selection/upload workflow
- stronger button group authoring polish and validation feedback

Do not overbuild category-management UI yet.
Do not move CMS modules into scripture module folders.

### 3. Reassess the next public CMS shell step
Once composition and editing are stable, reassess:
- whether CMS pages need a light public index/discovery path
- whether layout keys need stricter semantics
- whether public page presentation needs stronger empty-state or layout polish

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
1. Define the next CMS external-module integration seam
2. Improve module authoring where it helps
3. Reassess public CMS shell polish
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
