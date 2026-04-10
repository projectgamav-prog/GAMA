CMS Architecture Brief
Independent CMS composition model, module contract, and integration boundaries

Use this document alongside `admin-architecture.md` when work touches the CMS system.

Purpose: keep the CMS foundation independent, frozen, and safe for future external React/TSX module integration without drifting back into scripture-shaped assumptions.

## 1. CMS boundary
CMS is its own system.

- CMS is independent from canonical scripture internals.
- Canonical scripture pages remain schema-driven exceptions.
- CMS may integrate with scripture later only through clean bridges, adapters, or dedicated CMS modules.
- CMS must not depend on canonical admin/module internals.
- CMS must not import canonical surface builders, qualification rules, or page-local admin behaviors as permanent CMS architecture.
- CMS may link to scripture routes or reference scripture entities through clean data contracts, but that is not the same as sharing internals.
- CMS page association/linking should happen through generic CMS modules and destination contracts, not per-entity canonical schema foreign keys unless a later architecture decision explicitly requires one.

## 2. CMS composition model
The active CMS composition model is:

- Page
- Page Container
- Page Block

Meaning:

- a page owns ordered containers
- a container owns ordered blocks
- a container is the structural seam that decides whether content stays in the same card/section or becomes a new card/section
- a container may render as a card or a non-card section
- blocks render inside their owning container

Active ownership model:

- `pages`
- `page_containers`
- `page_blocks`

Do not flatten CMS composition back into a single page-owned block list.

## 3. CMS editing grammar
This is the active frozen CMS grammar for now:

- create new container
- add block to container
- move up/down
- delete

Meaning:

- create new container = create a new card/section
- add block to container = keep content inside the same card/section
- move up/down = reorder within the existing ownership model
- delete = remove only the selected CMS node and any children it owns

Do not introduce new composition abstractions in routine CMS work unless the architecture is being deliberately revised.

## 3.1 CMS interaction model
The composition grammar stays the same, but the preferred user-facing workflow is no longer dashboard-first.

- content-managed pages must render the same core page layout for public users and admins
- admins should edit in place on the real page and see the real final layout while editing
- admin mode may add controls, overlays, adders, and edit affordances to that real page
- admin mode must not switch routine composition into a fundamentally separate page-builder layout
- default visible live controls should stay compact, with deeper chooser/configuration UI revealed only after click
- permitted users should be able to compose on live CMS pages
- meaningful add-section and add-content controls should appear in place
- the CMS workspace still exists, but it is a supporting record-management view rather than the primary authoring experience
- page creation and page-linking should grow out of interactive composition flows, especially button/link authoring
- live composition controls should stay content-aware and minimal rather than exposing every adder everywhere

This does not mean canonical scripture structure becomes CMS-managed.
It means universal content composition should be exposed interactively where the content lives.

Same-layout rule:
- public users and admins share the same core content-managed page layout
- the admin experience is an augmentation layer on that page, not a separate builder shell
- routine live composition controls attach directly to the affected container/block area rather than appearing as a detached bottom-of-page shell

Dashboard/workspace rule:
- dashboard/workspace pages are valid for listing, search, management, diagnostics, and utilities
- dashboard/workspace must not become the primary place for routine page composition

Universal mechanism rule:
- the same public-plus-admin augmentation behavior should apply across eligible pages site-wide
- canonical scripture structure remains protected, but the universal content composition mechanism should stay consistent

Current content-aware adder grammar:
- blank region: show only `Add Card` and `Add Button`
- blank-region clicks derive page-level container insertion automatically
- existing containers expose top and bottom in-place controls for `Add Block` and `Add Button`
- top/bottom clicks should derive insertion mode and ordering automatically from the clicked zone
- existing live containers and blocks should expose compact attached edit/delete affordances where those actions already exist in CMS scope
- adders should use progressive reveal instead of dumping every field at once

## 4. CMS module contract
CMS modules are registry-based and manifest-driven.

The stable manifest fields are:

- `key`
- `label`
- `category`
- `description`
- `defaultData`
- `defaultConfig`
- `Renderer`
- `Editor`
- optional `validate`

Contract expectations:

- `key` is the stable identity for storage and registry lookup
- `label` is the editor-facing display name
- `category` is the stable grouping field for future module categorization
- `description` explains the module's purpose in authoring flow
- `defaultData` seeds the initial content payload
- `defaultConfig` seeds the initial presentation/config payload
- `Renderer` renders the module payload in admin/public contexts
- `Editor` owns the authoring UI for that module payload
- `validate` is optional and provides module-local validation feedback
- module-local linking behavior should stay generic and portable; for example, button-style modules may target CMS pages, scripture routes, or plain URLs through their own manifest-owned data contract
- module-local linking workflows should eventually support both attaching an existing CMS page and creating a new CMS page from within interactive authoring flows where appropriate

Do not hardcode module behavior into page files when it belongs in the manifest-driven module system.

## 5. CMS module folder structure
The stable CMS module folder structure is:

- `resources/js/admin/cms/modules/<module>/`
- `manifest.ts`
- `renderer.tsx`
- `editor.tsx`
- `types.ts`
- `defaults.ts`
- `index.tsx`

This folder shape is part of the portability promise:

- each module should be easy to locate
- each module should be easy to prototype in isolation
- each module should be easy to copy in from outside experimentation
- registry integration should require minimal touchpoints

## 6. External module integration direction
Future external React/TSX prototyping should target the same folder and manifest contract.

Preferred integration path:

- build the module as a self-contained folder
- keep renderer, editor, types, defaults, and manifest together
- copy the folder into `resources/js/admin/cms/modules/<module>/`
- register the manifest in the CMS registry

The goal is that integration mainly requires dropping in the module folder and registering its manifest, not rewriting it around project-specific scripture assumptions.

## 7. Current postponed items
These are intentionally postponed and should not be treated as missing architecture in routine CMS passes:

- drag-and-drop
- remote loading
- media upload
- WYSIWYG rebuild
- category-management UI
- public CMS discovery/index
- advanced publishing/scheduling depth

## 8. Preservation rules
Keep these rules locked unless the CMS architecture is being deliberately revised:

- CMS stays independent from canonical scripture internals
- CMS composition stays page -> container -> block
- container remains the same-card vs new-card structural seam
- CMS modules stay under `resources/js/admin/cms/`
- the manifest contract remains stable
- the module folder structure remains stable
- pages stay thin
- CMS behavior stays in CMS-local systems, not page-local hacks
- live-page composition is the preferred CMS interaction model for permitted users; the workspace remains supportive, not primary
- content-managed pages use the same core layout for public users and admins, with admin augmentation layered onto the real page
