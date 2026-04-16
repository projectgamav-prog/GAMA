# CMS Architecture

## Purpose

This document defines the purpose, boundaries, and composition model of the CMS
system in this project.

CMS is an independent composition system. It is not the canonical scripture
schema.

## CMS Purpose

CMS exists to provide:

- generic page composition
- supplemental content composition
- reusable content modules
- declared exposed regions on eligible pages

CMS is responsible for composition and presentation structure. It is not
responsible for canonical scripture truth.

## CMS Boundaries

CMS is allowed to do the following:

- create and render standalone content pages
- compose ordered containers and blocks
- power declared supplementary regions
- link to canonical scripture through clean routing contracts
- render portable modules through a dedicated CMS registry

CMS is not allowed to:

- define canonical scripture hierarchy
- replace canonical scripture routing truth
- own canonical scripture identity
- decide canonical scripture schema
- flatten canonical scripture into generic CMS composition

## CMS Structural Model

The CMS composition model is:

- `page`
- `page_container`
- `page_block`

This ownership model means:

- a page owns ordered containers
- a container owns ordered blocks
- a container is the structural seam that decides whether content stays in the
  same card/section or becomes a new card/section

## Container Versus Block

### Container

A container is a composition boundary.

It decides:

- a visible section/card grouping
- whether blocks belong together
- where new content becomes a new structural unit

### Block

A block is a module instance inside a container.

It decides:

- the content module used
- the data/config payload for that module
- ordered placement inside the owning container

Do not flatten the model into a single page-owned block list. The
container-versus-block distinction is intentional and must stay intact.

## CMS Editing Grammar

The active grammar is:

- create new container
- add block to container
- move up/down
- delete

Meaning:

- create new container = create a new card/section
- add block to container = keep content in the same structural unit
- move up/down = reorder within current ownership
- delete = remove only the selected CMS node and any children it owns

## CMS Module Registry System

CMS modules are registry-driven and manifest-oriented.

Current frontend registry entrypoint:

- [resources/js/admin/cms/core/module-registry.tsx](</c:/Users/SHREENATHJI/Documents/malay/gama/resources/js/admin/cms/core/module-registry.tsx:8>)

Current backend central registry under pressure:

- [app/Support/Cms/CmsModuleRegistry.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Cms/CmsModuleRegistry.php:7>)

Current stable module set:

- `rich_text`
- `button_group`
- `media`
- `card_list`

The registry should remain the discovery point, but module behavior should
progressively move into distributed definitions rather than deeper central
switchboards.

## CMS Module Contract

Each CMS module manifest should declare:

- `key`
- `label`
- `category`
- `description`
- `defaultData`
- `defaultConfig`
- `Renderer`
- `Editor`
- optional `validate`

These fields define the portable CMS module contract.

## Source Modes

The architecture should recognize three source modes for CMS modules.

### Manual

The module payload is authored directly by an editor.

Use when:

- prose
- CTAs
- media placement
- curated cards

### Context

The module payload is derived partly from the hosting page or declared region
context.

Use when:

- a CMS region needs local context such as current entity or page identity
- a module needs contextual defaults without changing canonical truth

### Query

The module payload is derived from a constrained query or runtime filter model.

Use when:

- the CMS needs dynamic lists or runtime-driven content
- the data source is supplemental and explicitly bounded

Context and query modes may read canonical data, but they must not redefine
canonical schema.

## How CMS Interacts With Scripture Schema

CMS may interact with scripture in the following safe ways:

- linking to scripture routes
- rendering supplemental regions on scripture pages
- using context-aware supplemental modules
- reading scripture-derived data in bounded query/context modes

CMS must not:

- own book/chapter/verse hierarchy
- turn canonical entities into CMS-managed nodes
- become the place where canonical identity is edited

The relationship is:

- scripture provides protected truth
- CMS provides supplemental composition around that truth

## What CMS Is Not Allowed To Do

- CMS must not define canonical scripture structure.
- CMS must not replace canonical route-context logic.
- CMS must not become the canonical editor for protected scripture identity.
- CMS must not bypass the dedicated canonical admin surface/module architecture.
- CMS must not grow by embedding scripture-specific hacks into generic module
  infrastructure.

## Architectural Direction

The CMS system should evolve toward:

- distributed module definitions
- clearer source-mode handling
- stronger same-layout live authoring
- reusable generic modules with explicit boundaries

It should not evolve toward:

- scripture-owned internals inside CMS modules
- page-specific CMS hacks
- canonical truth management through CMS composition
