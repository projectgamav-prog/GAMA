# Admin Module Integration Guide

Use this document when adapting outside React components into the project's
admin surface system.

This guide is practical on purpose. It is not a theory brief.

Read alongside:
- `docs/admin-architecture.md`
- `docs/admin/content-aware-positional-authoring.md` when the component edits a real list/tree on the live surface
- `docs/admin/positional-authoring-implementation-guide.md` when the component needs local item insertion/reorder/delete behavior

## 1. Two admin systems

The project now has two active admin/editing architectures.

Super Conscious Admin:
- uses schema field surfaces, action registries, surface resolvers, and
  Conscious Full Edit
- lives under `resources/js/admin/actions/`,
  `resources/js/admin/schema/`, `resources/js/admin/surfaces/`,
  `resources/js/admin/awareness/`, and `resources/js/admin/conscious-full-edit/`
- attaches public-page controls through schema-aware surfaces and
  `AdminSurfaceActionMenu`

CMS modules:
- live under `resources/js/admin/cms/modules/<module>/`
- register through the CMS manifest registry
- render inside the CMS page/container/block system

The old public scripture `AdminModuleHost` / `resources/js/admin/modules/*`
architecture has been removed. Do not recreate it.

## 2. Where outside React components should live

### Super Conscious scripture admin components

If an outside React component is becoming a Super Conscious scripture editor:
- expose schema fields through `AdminSchemaFieldDisplay` /
  `AdminSchemaFieldSurface`
- place surface builders/resolvers under `resources/js/admin/surfaces/`
- register field/action metadata under `resources/js/admin/schema/` and
  `resources/js/admin/actions/`
- keep visible actions behind `AdminSurfaceActionMenu`

Examples:
- `resources/js/admin/surfaces/scripture/chapters/surface-resolvers.ts`
- `resources/js/admin/surfaces/scripture/verses/surface-resolvers.ts`
- `resources/js/admin/schema/scripture/scripture-schema-fields.ts`

### CMS modules

If an outside React component is becoming a CMS module:
- place it inside a self-contained module folder under
  `resources/js/admin/cms/modules/<module-key>/`

Required stable CMS folder shape:
- `manifest.ts`
- `renderer.tsx`
- `editor.tsx`
- `types.ts`
- `defaults.ts`
- `index.tsx`

## 3. Conscious admin shape

A Conscious admin surface should stay small and predictable.

Recommended shape:
- schema field metadata
- reusable surface/display component
- action registry entry
- field editor adapter where editing is safe
- backend field/action service when mutation is supported

Do not make an outside component depend directly on page props.

## 4. Canonical module registration

Conscious Admin actions and fields register through schema/action registries.
Do not register new public scripture editing behavior through the removed
module-host system.

1. Register schema fields in the schema field registry.
2. Register available actions in the Conscious action registry.
3. Emit surface metadata from reusable renderers or surface resolvers.
4. Let the shared action resolver decide what the three-dot menu can show.

If an action only applies to one domain, keep it scoped to that schema/entity
family in the registry.

## 5. Props and data boundaries

Outside components adapted into this system should receive:
- semantic metadata
- already-shaped hrefs/actions
- already-shaped entity records
- dialog/open-close controls from the Conscious surface/action components

They should not receive:
- whole Inertia page payloads
- controller-specific assumptions
- route-building logic that belongs in schema/action/surface builders
- page-local layout state

Preferred boundary:
- schema/surface builders shape metadata
- policies/registries validate what is editable
- shared Conscious components render and submit

If the adapted component is becoming a positional live editor:
- keep the rendered item/list/tree as the main editing surface
- attach tiny local controls near the real item position
- keep draft insertion local to the truthful list seam
- preserve structured payload/config contracts instead of flattening them for inline convenience

## 6. Surface qualification expectations

Conscious actions should qualify by:
- schema family
- entity type
- field name when field-level
- control level
- required capability
- backend readiness
- risk/policy status

Do not rely on:
- page component names
- route names alone
- fragile layout structure

If two contexts are semantically different, shape them as different surfaces or
at least give them distinct context metadata.

Examples:
- chapter page identity is not the same semantic context as chapter row
  identity on the book page
- verse detail identity is not the same semantic context as verse row identity
  on the chapter page

Preferred implementation pattern:
- keep the page-level vs row-level semantic distinction in a shared surface
  resolver or typed context resolver
- let surface builders receive already-resolved semantic context metadata rather
  than duplicating string branches in page files

## 7. How to adapt an outside component safely

Recommended procedure:

1. Keep the outside component mostly pure.
2. Wrap it with a thin project adapter/surface component.
3. Read project metadata through schema/surface helpers.
4. Translate metadata into the props the outside component needs.
5. Keep submission logic registry/policy-owned and surface-driven.
6. Register the field/action through the proper Conscious registry.

This preserves reuse without letting a generic component dictate the page
architecture.

## 8. What belongs inside vs outside the component

Belongs inside the adapted component:
- rendering logic
- local form state
- field interaction behavior
- module-local validation display

Belongs outside the adapted component:
- deciding where the module mounts
- deciding which page/row/group context it represents
- deciding the update/store/destroy hrefs
- deciding return-to behavior
- deciding whether the module qualifies at all

## 9. CMS module contract reminder

For CMS modules, keep these concerns separate:
- `types.ts`
  module-owned data/config types
- `defaults.ts`
  `defaultData` and `defaultConfig`
- `renderer.tsx`
  public/admin rendering
- `editor.tsx`
  authoring UI
- `manifest.ts`
  registration contract
- `index.tsx`
  stable barrel export

CMS manifests should declare:
- `key`
- `label`
- `category`
- `description`
- `defaultData`
- `defaultConfig`
- `Renderer`
- `Editor`
- optional `validate`

## 10. What to avoid

Do not:
- import canonical page files into modules
- import CMS internals into canonical scripture modules
- hardcode page-specific hacks into reusable module infrastructure
- let an outside component own routing semantics that should come from surfaces
- bypass metadata readers with ad hoc object access everywhere
- route new work through transitional full-edit content-block fallback
  controllers when the task is really about the active live canonical module
  path

## 11. Practical checklist before merging a new module

- The page stayed thin.
- The surface contract is semantic and truthful.
- The module qualifies from metadata, not page hacks.
- Row/page/group/full-edit semantics are correct.
- Same-page return behavior is explicit where intended.
- The component can be understood in isolation.
- The integration touchpoint is minimal and obvious.
