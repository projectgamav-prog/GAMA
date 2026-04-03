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
- do not reintroduce page-local admin logic or page-hardcoded actions

## Immediate focus

### 1. Validate and strengthen Full Edit
Check whether Full Edit for:
- translations
- commentaries

is truly functioning as a meaningful deeper editing path.

If it still feels weak, improve it so that it becomes a real deeper workspace rather than a routed duplicate of inline quick edit.

### 2. Continue UX cleanup
Keep translation/commentary editing:
- user-friendly
- editor-facing
- free from schema/debug language leaks

Audit labels, helper text, empty states, and action wording again when needed.

### 3. Keep architecture discipline
As new work continues:
- pages should expose surfaces only
- modules should define actions
- host should render actions
- schema truth should remain in the real tables/relations
- page-specific hardcoding should keep shrinking

## Next likely implementation direction after that
Move further toward schema-derived module families such as:
- book module
- book-section module
- chapter module
- chapter-section module
- verse module
- verse detail support modules

Long-term aim:
these schema-driven render/edit units should become increasingly reusable and later more naturally integratable into a broader CMS-driven page system.

## Reminder of boundary
Do not try to fully redesign canonical routing into CMS routing yet.

Safe direction:
- modular rendering first
- route abstraction later

## Practical restart order
1. Review current translation/commentary Full Edit behavior in browser
2. Confirm whether it is genuinely good enough
3. Fix only what is still weak
4. Then resume larger module-direction work

## Success condition for the next phase
When resuming, the goal is not “add more things quickly.”

The goal is:
- truthful UX
- architecture consistency
- less page burden
- stronger schema-driven module behavior