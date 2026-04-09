# ⚠️ SYSTEM PROTOCOL — DO NOT MODIFY ABOVE THIS LINE
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

# 🚫 DO NOT EDIT ABOVE THIS LINE
-----------------------


# Next Step (When Resuming Work)

## First thing to do
Before any implementation prompt, tell Codex:

- read `admin-architecture.md` first
- treat it as the authoritative architecture instruction
- keep canonical scripture pages thin and surface-driven
- treat manual page creation as CMS, not as a one-off feature path

## Immediate focus

### 1. Browser-validate the first CMS page foundation
Check the new CMS flow in browser:
- dashboard CMS pages entry point
- Add Page create flow
- page list visibility after create
- page identity update flow
- draft page should not open publicly
- published page should open publicly at `/pages/{slug}`

If something breaks, fix it in the page model/controller/workspace path rather than papering over it with page-local hacks.

### 2. Add the first universal page-owned block workflow
The next CMS capability gap is page composition.

Use the existing content-block owner pattern and extend it to pages so that CMS pages can start managing their own blocks.

Direction:
- do not invent a second content system
- do not create page-specific CMS block systems
- keep the workflow universal for pages

### 3. Decide the next minimal CMS page shell polish
After the first block workflow exists, reassess:
- whether CMS pages need a light public index/discovery path
- whether layout/template hints need stricter semantics
- whether the public page shell needs stronger empty-state or presentation polish

Do not overbuild a full page builder in one jump.

### 4. Return to the remaining canonical polish items
Once the CMS foundation is stable, resume the still-open canonical cleanup:
- remaining delete-heavy browser validation
- re-check Full Edit usefulness for translations/commentaries
- later move the shared Intro dropdown concept to canonical detail-page tops

### 5. Keep architecture discipline
As new work continues:
- canonical scripture remains schema-driven
- CMS pages remain universal and page-record-driven
- pages stay thin
- admin logic stays out of page-local hacks
- shared content-block ownership stays shared

## Reminder of boundary
- Do not let CMS pages become the source of truth for canonical scripture structure.
- Do not redesign canonical routing into CMS routing.
- Do not bypass the universal page system with special standalone page features.

Safe direction:
- page record first
- block ownership second
- richer builder UX later

## Practical restart order
1. Browser-test create/update/public-route behavior for CMS pages
2. Add page-owned content-block management
3. Reassess minimal CMS page-shell polish
4. Resume outstanding canonical polish work

## Success condition for the next phase
When resuming, the goal is not “add lots of CMS quickly.”

The goal is:
- one real universal page model
- one shared content system
- clear separation from canonical scripture
- thin pages
- truthful UX
