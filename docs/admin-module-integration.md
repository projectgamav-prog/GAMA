# Admin Module Integration Guide

Use this document when adapting outside React components into the project's
admin surface system.

This guide is practical on purpose. It is not a theory brief.

## 1. Two module systems

The project now has two distinct module systems.

Canonical scripture admin modules:
- live under `resources/js/admin/modules/`
- qualify from canonical semantic surfaces
- attach through `AdminModuleHost`

CMS modules:
- live under `resources/js/admin/cms/modules/<module>/`
- register through the CMS manifest registry
- render inside the CMS page/container/block system

Do not mix those systems casually.

## 2. Where outside React components should live

### Canonical admin components

If an outside React component is becoming a canonical scripture editor:
- place the reusable UI component near the owning module family under
  `resources/js/admin/modules/<domain>/`
- keep the adapter module file in the same domain folder

Examples:
- `resources/js/admin/modules/chapters/ChapterIdentityEditor.tsx`
- `resources/js/admin/modules/verses/VerseMetaEditor.tsx`

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

## 3. Canonical admin module shape

A canonical admin module should stay small and predictable.

Recommended shape:
- metadata reader import
- thin adapter component that reads the surface contract
- `defineAdminModule(...)` export

The module should receive only:
- `surface`
- `module`
- `activation`

from the shared host contract.

The module should get its real data from a metadata reader such as:
- `getIdentityContractMetadata`
- `getIntroContractMetadata`
- `getStructuredMetaContractMetadata`
- `getRelationRowsContractMetadata`
- section surface readers

Do not make an outside component depend directly on page props.

## 4. Canonical module registration

Canonical admin modules register in two steps:

1. Export the module from the relevant integration file:
   - `resources/js/admin/integrations/scripture/books.ts`
   - `resources/js/admin/integrations/scripture/chapters.ts`
   - `resources/js/admin/integrations/scripture/verses.ts`
   - `resources/js/admin/integrations/sections.ts`

2. Let the central registry include that integration:
   - `resources/js/admin/core/module-registry.ts`

If a module only applies to one domain, keep it out of unrelated integrations.

## 5. Props and data boundaries

Outside components adapted into this system should receive:
- semantic metadata
- already-shaped hrefs/actions
- already-shaped entity records
- activation/open-close controls from the host

They should not receive:
- whole Inertia page payloads
- controller-specific assumptions
- route-building logic that belongs in integrations/builders
- page-local layout state

Preferred boundary:
- integrations/builders shape metadata
- readers validate metadata
- modules render and submit

## 6. Surface qualification expectations

Modules should qualify by:
- `contractKeys`
- `entityScope`
- `surfaceSlots`
- `regionScope` when needed
- required capabilities
- optional `qualifies(surface)` checks

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

## 7. How to adapt an outside component safely

Recommended procedure:

1. Keep the outside component mostly pure.
2. Wrap it with a thin project adapter module.
3. Read project metadata through a reader helper.
4. Translate metadata into the props the outside component needs.
5. Keep submission logic module-owned and surface-driven.
6. Register the adapter in the proper integration.

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

## 11. Practical checklist before merging a new module

- The page stayed thin.
- The surface contract is semantic and truthful.
- The module qualifies from metadata, not page hacks.
- Row/page/group/full-edit semantics are correct.
- Same-page return behavior is explicit where intended.
- The component can be understood in isolation.
- The integration touchpoint is minimal and obvious.
