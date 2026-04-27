# Super Conscious Admin Layer

## Purpose

The Super Conscious Admin Layer is the long-term architecture for admin behavior
across canonical scripture, CMS pages, future schemas, and future modules.

The current implementation is only the early awareness foundation. It gives the
frontend a way to describe rendered content, collect those facts, run a shadow
resolver, and diagnose future control ownership. It is not the complete admin
brain.

The admin layer must continue gaining awareness over time until it can decide,
from metadata and registries, what controls belong on a surface, where they
belong, which edit mode they use, and which schema rules protect or allow an
action.

## Core Philosophy

Admin decisions must come from awareness metadata, schema rules, registries, and
resolver contracts. They must not come from page-specific JSX or route-page
conditionals.

The admin must not be page-aware. It must be schema/content/block/layout/
position/order/action/user-aware.

Pages may exist as route shells and data adapters. They must not decide:

- what admin controls appear
- where controls appear
- which editor opens
- whether quick edit is available
- whether add/reorder/delete is safe
- whether canonical rules protect mutation
- whether CMS rules allow flexible layout editing

Those decisions belong to the universal admin awareness layer.

## Awareness Categories

The final admin system should accumulate many focused kinds of awareness. Each
category should stay small and replaceable.

### Schema Awareness

Schema awareness describes the data family and its mutation rules. Scripture,
CMS, topics, characters, users, media, activity, and future schemas should
register their own capabilities and constraints instead of pushing those rules
into pages.

### Entity Awareness

Entity awareness describes what object is being rendered or edited:

- entity type
- entity id
- schema family
- label
- parent entity where available

### Surface Awareness

Surface awareness describes the editable region:

- surface key
- contract key
- region key
- slot
- owner
- capabilities
- bridge to existing `AdminSurfaceContract`

### Block And Content Awareness

Block/content awareness describes what kind of rendered content is present:

- block type
- content kind
- field kind
- module key
- block id
- editable fields

### Layout And Position Awareness

Layout/position awareness describes where the rendered thing lives:

- layout zone
- visual role
- preferred placement
- local surface position
- future responsive/device context

### Action And Capability Awareness

Action awareness describes what actions are possible:

- quick edit
- structured edit
- full edit
- create before/after/inside
- reorder
- delete
- manage media
- manage relations

### Ordering And Add-Anchor Awareness

Ordering awareness describes order groups, item positions, insertion anchors,
and protected ordering rules. It must work for CMS block lists, content-block
stacks, card lists, media lists, relation lists, nested block items, and
canonical scripture lists.

Canonical ordering must default to protected. CMS/block ordering can be flexible
only when explicit metadata and backend workflows support it.

### Quick-Edit Awareness

Quick-edit awareness describes which fields can become editable in the same
visible layout, which adapter can render them, and what payload shape is needed.

### Structured-Editor Awareness

Structured-editor awareness decides when content is too complex for same-layout
editing and should open an inline panel, sheet, drawer, or existing structured
module.

### CMS Awareness

CMS awareness must eventually include pages, regions, containers, blocks, block
items, module keys, nested item structures, layout slots, ordering, publish
states, and quick-editable fields.

### User, Role, And Permission Awareness

The admin layer must later understand:

- current user
- roles
- permissions
- ownership
- team or editorial scope
- per-action visibility

### Activity, Audit, And History Awareness

The admin layer must eventually be aware of edit history, audit trails, activity
feeds, changed fields, and who performed an action.

### Workflow And Publishing Awareness

Workflow awareness should include drafts, review states, approvals, scheduled
publishing, published/unpublished states, and protected transitions.

### Media Awareness

Media awareness should include media slots, captions, alt text, assignment
rules, media type, replacement safety, and source metadata.

### Relation Awareness

Relation awareness should include translations, commentaries, dictionary terms,
topics, characters, related verses, and future relation families.

## Current Implemented Awareness

The current foundation includes:

- focused awareness contracts for entity, surface, block, layout, action,
  quick edit, ordering, and schema constraints
- registry shells for entity, surface manifest, layout/position, structured
  editors, and schema plugins
- `AdminControlResolver` in shadow mode
- `AdminAwarenessProvider`
- `AdminSurfaceManifestProvider`
- `AdminPositionProvider`
- `AdminSurfaceEmitter`
- `AdminResolvedControlsProvider`
- resolver ownership diagnostics
- `AdminOrderingManifestProvider`
- order group, item position, and add-anchor shadow awareness
- content-block stack ordering emission in shadow mode
- quick-edit metadata and adapter foundation
- same-layout text adapters for simple supported content kinds

## Current Awareness Level

The current system should be treated as roughly the first awareness layer, not
the complete admin brain.

It can collect facts, resolve shadow controls, classify ownership, and diagnose
some future overlay risks. It does not yet own visible admin controls, decide all
schema rules, model all users and workflows, or replace existing structured
editors.

This is maybe the first ten percent of the final system.

## Target Architecture Flow

The locked long-term flow is:

```text
Renderer emits facts
-> Admin awareness providers collect facts
-> Registries add schema/content/action rules
-> AdminControlResolver resolves controls
-> Overlay layer renders controls
-> Quick edit / structured editor / full edit executes action
-> Activity/audit layer records changes later
```

Each step depends on contracts, not page names.

## Schema Awareness Direction

Admin awareness should grow into a schema section/family system. A future
structure may look like:

```text
resources/js/admin/schema/
  books/
  cms/
  topics/
  characters/
  users/
  activity/
```

Equivalent folder names are acceptable if they preserve the same separation.

Schema-specific rules belong in schema plugins/modules, not page files. A
renderer should emit facts; the schema plugin should decide what those facts
mean.

Book schema awareness comes first because the active canonical admin path already
has real surfaces, modules, routes, and protected canonical rules.

## Book Schema Awareness First

The first full schema-awareness target should be the book/scripture schema:

- books
- book_sections
- chapters
- chapter_sections
- verses
- verse_meta
- verse_translations
- verse_commentaries
- content_blocks
- media assignments where relevant

Start with CRUD awareness and protected canonical rules:

- what can be created
- what can be edited
- what can be deleted
- what can be reordered
- what must stay canonical/protected
- what is quick editable
- what requires a structured editor
- what should fall back to Full Edit

Canonical hierarchy rules must remain protected. The awareness layer can expose
diagnostics or advanced workflows, but it must not make canonical ordering
casually mutable.

## CMS Awareness Direction

The admin layer must eventually be fully aware of CMS structure:

- pages
- regions
- containers
- blocks
- block items
- module keys
- nested items
- layouts
- slots
- ordering
- add anchors
- publish states
- quick editable fields

CMS awareness should allow flexible layout editing when CMS schema rules permit
it. It should not borrow canonical scripture assumptions.

## User And Activity Awareness Direction

The admin layer must later be aware of:

- users
- roles
- permissions
- ownership
- edit history
- audit trail
- activity feed
- approvals and review
- workflow states

This should be modeled as focused awareness contracts and registries, not as
ad hoc checks scattered through pages.

## Position And Layout Intelligence

Admin controls should be placed from context:

- layout zone
- visual role
- block type
- field kind
- order group
- preferred placement
- future device/responsive context

Examples:

- hero content may prefer top-right or bottom-edge controls
- section headers may own create/manage controls
- list rows may prefer inline-end actions
- block stacks may expose between-item insertion anchors
- media surfaces may prefer floating local proofing chips
- rail panels may prefer compact top-right controls

## Control Decision Intelligence

The resolver should choose between:

- same-layout quick edit
- structured editor
- drawer or sheet
- Full Edit fallback
- disabled/protected action
- create/add controls
- reorder controls
- delete controls
- manage-media controls
- manage-relation controls

The decision should come from capabilities, quick-edit metadata, schema
constraints, ordering context, user permissions, and registered adapters.

## SOLID Requirements

Every future implementation must follow SOLID.

### SRP

Each part has one responsibility:

- renderers render content and emit facts
- surfaces describe editable regions
- providers collect facts
- registries describe schema/content/action rules
- resolver decides controls
- overlay layer renders controls
- quick-edit adapters render simple field editing and build payloads
- structured modules handle complex editing

### OCP

New schemas, blocks, content kinds, layouts, and edit modes should be added by
registration, adapters, and plugins. They should not require editing every page.

### LSP

Every registered renderer, schema plugin, adapter, and resolver rule must obey
stable contracts so it can be replaced without breaking the universal flow.

### ISP

Do not create a giant admin object. Keep contracts focused:

- entity context
- surface context
- block context
- layout/position context
- action capability context
- quick-edit context
- ordering context
- schema constraint context
- user/activity/workflow context later

### DIP

High-level render and admin systems must depend on abstractions, contracts, and
registries. They must not depend on concrete route pages or page-specific admin
code.

## What To Stop Doing

Stop:

- page-based admin implementation
- page-by-page quick edit
- page-local control placement
- topic/character page-specific admin architecture
- treating book/chapter/verse as the universal model
- giant god objects
- making public pages responsible for admin intelligence
- expanding page-family adapters as the main architecture path
- inventing page-specific renderers for admin behavior

## What To Do Instead

Use:

- renderer-owned awareness emission
- schema plugins
- registries
- resolver rules
- overlay ownership
- quick-edit adapters
- structured editor modules
- Full Edit fallback
- ordering and add-anchor manifests
- focused diagnostics before visible replacement

## Future Implementation Roadmap

### Phase 1: Awareness Contracts

Add focused contracts for entity, surface, block, layout, action, quick edit,
ordering, and schema constraints.

### Phase 2: Control Resolver

Add a shadow resolver that decides which controls would exist from awareness
facts.

### Phase 3: Surface And Position Providers

Collect surface facts and layout/position context from reusable renderers.

### Phase 4: Resolver Diagnostics

Compute resolver output, ownership, and duplicate-control diagnostics without
changing visible UI.

### Phase 5: Ordering And Add-Anchor Awareness

Collect order groups, item positions, and insertion anchors in shadow mode.

### Phase 6: Overlay Ownership Comparison

Compare current visible controls to resolver-owned controls at the component
family level and identify safe ownership handoffs.

### Phase 7: Resolver-Driven Overlay Controls

Begin rendering controls from resolver output only where behavior is identical
and duplicate controls are prevented.

### Phase 8: Full Book Schema CRUD Awareness

Register book/scripture schema CRUD awareness, protected canonical rules, and
structured editor fallbacks.

### Phase 9: CMS Awareness Expansion

Expand CMS page/container/block/module awareness, ordering, publish states,
quick-edit fields, and layout slots.

### Phase 10: User, Activity, And Workflow Awareness

Add user/role/permission awareness, audit/activity history, review states, and
publishing workflow intelligence.

## Relationship To Existing Docs

This document is the locked north-star for the universal admin awareness layer.

It complements:

- `docs/admin-architecture.md`: broad canonical admin/module architecture
- `docs/scripture-admin-editing.md`: practical canonical scripture admin module
  behavior
- `docs/admin-module-integration.md`: adapting outside React/components into
  the admin module system
- `docs/admin/content-aware-positional-authoring.md`: same-layout positional
  authoring model
- `docs/admin/positional-authoring-implementation-guide.md`: implementation
  guide for positional authoring
- `docs/current-state.md`, `docs/current-phase.md`, and `docs/next-step.md`:
  live status and immediate next direction

When these documents appear to overlap, this document controls the long-term
direction for admin awareness: the admin must become schema/content/block/
layout/position/order/action/user-aware, not page-aware.
