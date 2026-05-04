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

---

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
- if the task designs or implements live structured inline editing on the real rendered surface, also read:
    - `docs/admin/super-conscious-admin-layer.md`
    - `docs/admin/content-aware-positional-authoring.md`
    - `docs/admin/positional-authoring-implementation-guide.md`
- if the task affects global shell seams or page-level placement policy, also read:
    - `docs/public-region-policy.md`

Also tell Codex:

- the broad cleanup/refactor wave is largely complete
- do not resume broad cleanup by default
- reopen cleanup only when a narrow seam is clearly justified
- protected canonical edit and transitional backend write endpoints are the
  remaining legacy pressure points; do not recreate deleted route-specific Full
  Edit React pages

## Immediate focus

### 1. Continue the universal admin awareness foundation from the cleaned base

The Super Conscious Admin Layer is now the locked north-star architecture for
admin work. The current implementation is only an early awareness foundation,
not the complete admin brain. Future admin implementation should keep expanding
schema/content/block/layout/position/order/action/user awareness through
contracts, registries, resolver rules, overlay ownership, quick-edit adapters,
structured editor modules, Full Edit fallback, and ordering/add-anchor
manifests.

The shared public frame, structured header navigation, structured footer system, live header authoring path, declared region policy, locked chronicle public design, admin overlay controls, and first same-layout quick-edit slice are now active. The next pass should build the universal rendering/editing system instead of continuing page-by-page rendering work:

- keep the public/admin same-layout rule intact
- keep canonical scripture pages thin and surface-driven
- keep route page files as adapters only
- stop expanding page-family adapters as the main architecture path
- make admin controls resolve from content/block/layout/schema/action metadata
  instead of page names
- continue with awareness/resolver/overlay ownership work before any visible
  control replacement
- do not revive the old visible `AdminModuleHost` public-page layer; it is now
  a quarantined no-op compatibility shim, and future visible admin controls
  should come from the conscious schema-aware layer
- keep backend write endpoints that conscious quick edit or Conscious Full Edit
  still use, but treat them as service endpoints rather than the old UI
  architecture
- use `docs/admin/super-conscious-awareness-automation.md` as the blueprint for
  the next automation layer: discovery can suggest schema/content/UI awareness,
  but protected and destructive action enablement must stay policy-gated
- build backend migration through Conscious services and registries:
  controllers orchestrate, registries describe, policies decide safety,
  services execute writes, and diagnostics report missing coverage
- schema-aware quick edit now uses the generic
  `/admin/schema/{schemaFamily}/{entityType}/{id}/fields/{fieldName}` route for
  the first safe scripture fields; next backend migration target is moving
  remaining Conscious Full Edit and structured writes away from old endpoints
- schema-aware public fields now expose routine actions through one local
  Conscious Admin three-dot menu; keep expanding that menu only with real
  supported actions, not placeholder delete/add/reorder/media/relation entries
- use `docs/admin/book-schema-conscious-controls.md` as the control/action
  catalog before adding any new book-schema menu actions; actions marked
  `needs_conscious_backend`, `old_endpoint_only`, or `future` must stay hidden
  from the Conscious menu until their backend service and policy are real
- use the inert TypeScript action registry in `resources/js/admin/actions/` as
  the extension seam for future menu actions; do not hardcode new action buttons
  into schema field components
- attach visible actions through the shared surface-action resolver so controls
  appear from schema/content/surface metadata, not from route-page placement
- do not auto-enable create, reorder, reparent, delete, media, relation,
  import, export, or protected canonical edits from discovered model/table/UI
  surfaces alone
- use the active dispatcher-backed
  `POST /admin/schema/{schemaFamily}/{entityType}/{id}/actions/{actionKey}`
  route shape for future action services instead of adding page-family backend
  routes
- `protected_identity.update` is the first enabled action; keep it limited to
  `slug` and `number`, and do not let parent/reparent/order/create/delete
  payloads pass through it
- use `docs/admin/conscious-admin-field-coverage.md` before treating a missing
  control as a bug; missing controls should usually be fixed by reusable
  renderer coverage, not URL/page-specific controls
- keep public scripture pages and reusable renderers free of legacy module UI
  imports; the old frontend module host/action/registry system has been removed
  and must not be recreated
- use `docs/admin/legacy-frontend-admin-quarantine.md` as the guardrail for
  old frontend admin files; CMS admin is separate and should not be removed as
  part of scripture legacy module cleanup
- use `docs/admin/super-conscious-admin-cleanup-audit.md` and
  `docs/admin/super-conscious-backend-organization.md` before deleting backend
  admin code; many old controllers remain transitional write endpoints until
  Conscious services replace them
- old book/chapter/verse route-specific Full Edit GET routes now redirect to
  Conscious Full Edit; do not reintroduce old page-specific full-edit React
  pages as primary admin surfaces
- old book/chapter/verse Full Edit React pages and their private editor/card
  components have been deleted; keep future Full Edit work in the Conscious
  schema-aware shell
- the old `admin/integrations/scripture` frontend path has been removed; live
  chapter/verse surface resolvers now live under `admin/surfaces/scripture`
- the dead always-visible `AdminFieldIconControls` cluster has been removed;
  schema-field actions should continue through the three-dot menu
- backend scripture admin controllers are classified but intentionally kept
  until Conscious services/actions replace them
- protected canonical edit remains legacy until a Conscious protected-canonical
  workflow exists; do not delete its backend/frontend path blindly
- keep CMS exposure generic and supplementary on non-CMS pages
- keep the active inline editors on the real page instead of detouring back into workspace-first habits
- preserve the shared header/footer shell instead of reintroducing page-local public chrome
- preserve the structured header/footer trees instead of falling back to hardcoded nav JSX
- preserve the shared link-target contract so future buttons/footer nav/modules reuse the same target model
- preserve the live shared header as the primary navigation authoring surface for routine nav edits
- preserve the declared global/page region seams instead of introducing ad hoc CMS placement
- treat canonical page sections as:
    - canonical reading structure first
    - supplemental regions second
- avoid page-by-page rendering/editing implementations
- reduce duplicated page-specific sections only when the replacement is driven
  by reusable content/block awareness, not by new page-family adapters
- keep admin launchers small and attached to their semantic surfaces until an editor is actively open
- use the completed chronicle public-flow implementation as the current visual foundation and preserve its output while migration begins

Do not restart broad cleanup here. The goal is to use the cleaned base for
universal rendering progress.

### 2. Keep the active scripture editing path trustworthy while that work begins

- continue the browser pass across the remaining grouped inline editors and the always-mounted full-edit cards that still matter
- use the same end-to-end standard that exposed the earlier dummy-editor bug:
    - actual browser submit
    - request fired
    - database row changed
    - UI visibly updated after save
- keep the new narrow smoke layer alive:
    - `scripts/scripture-admin-inline-smoke.mjs`
- extend it only where it materially protects the active public/admin editing path
- keep ignoring retired public scripture block-authoring paths while auditing edit behavior
- leave canonical full-edit and protected schema editing intact where no safe replacement exists yet

Reassess-later pressure points only:

- protected canonical edit workflow
- transitional backend scripture write endpoints
- revisit them only if a narrow, behavior-preserving Conscious replacement is
  clearly worth taking

### 3. Extend live CMS interaction only where real product-facing need is now clear

- preserve the locked same-layout rule so admins compose on the real page layout with augmentation controls instead of a separate builder shell
- preserve the in-place attachment rule so controls stay on the actual container/block area instead of drifting into detached shells
- preserve the compact-controls rule so live add/edit affordances stay small by default and only expand after click
- preserve the no-dashboard-redirect rule so routine live add/edit flows stay on the same public-looking page
- keep the normalized CMS page baseline stable and avoid reintroducing fresh migration drift in the page/exposed-region layer

### 4. Improve the first CMS module family carefully when it materially helps authoring

- build on the first stable module set now in place:
    - stronger prose/rich-text authoring beyond the new structured writing baseline only when real editing pain still remains
    - shared-target CTA/button authoring
    - practical media blocks
    - grouped card/list content
- the first real composition pass on home, `/pages/platform-guide`, and the verse supplementary region now gives a more honest priority order:
    - keep refining rich-text authoring ergonomics without breaking the current structured body contract
    - improve media authoring before adding many more module families
    - keep refining shared link-target configuration, especially for deeper scripture destinations
    - keep using current modules on real pages before expanding the module set again
- next meaningful improvements should come from real product use:
    - media selection/upload workflow
    - richer destination authoring for links to CMS pages, internal routes, scripture targets, and raw URLs
    - attach-existing-page vs create-new-page flows while configuring buttons/links
    - stronger module-specific validation and authoring polish where real friction appears
- when later media authoring work expands, build from the now-proven inline
  book-media pattern instead of inventing a separate media editing path
- keep the newer focused inline media contracts for common actions instead of
  falling back to full-record assignment payloads on every surface
- keep the progressive reveal pattern consistent as more modules are added

Do not overbuild category-management UI yet.
Do not move CMS modules into scripture module folders.

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

1. Continue the compact aesthetics pass from the now-shared public frame, structured header nav, and cleaned canonical page structure
2. Keep scripture editing/browser confidence healthy with the narrow smoke layer and targeted browser checks
3. Extend live CMS composition exposure only where the next product-facing phase needs it
4. Reuse the shared link-target contract when new buttons/navigation/footer work appears
5. Extend the structured navigation system outward only where a real product need now exists:
    - richer route/scripture target selection if authoring pain appears
    - keep move up/down simple unless a real drag/drop need emerges
6. Improve module authoring where it helps
7. Reassess canonical polish only when a narrow, clearly justified seam or validation need appears

Recommended next universal admin awareness target:

- Browser-validate the new Conscious Full Edit path from awareness-owned schema
  field controls for book, book section, chapter, chapter section, verse, and
  read-only content-block records.
- Use the new admin-aware layout anchor structure for future control placement:
  renderers expose page/region/section/card/block/field anchors, while resolver
  and overlay ownership decide which controls attach to those slots.
- Continue replacing old full-edit dependency with schema-aware field/category
  modules rather than patching route-specific full-edit pages.
- Keep inline quick edit stable for one safe field in place and keep
  structured/module, media, relation, ordering, and canonical controls outside
  awareness ownership until their metadata is complete.

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
