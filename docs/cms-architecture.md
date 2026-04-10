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
