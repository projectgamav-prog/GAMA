# Project Architecture Thesis

## Purpose

This document is the master architectural thesis for the project.

It defines why the platform is structured the way it is, what problems the
structure solves, which boundaries are intentional, and which directions future
development must preserve.

## Platform Thesis

The platform exists to support two different but cooperating systems:

- a protected canonical scripture system that preserves truth, hierarchy,
  meaning, and stable navigation
- a flexible CMS system that composes supplemental content and layout without
  becoming the source of canonical truth

The project is intentionally not a generic CMS with scripture data pushed into
it. The scripture corpus has protected structure and protected meaning. The CMS
exists beside it, not above it.

The architecture therefore follows a dual-system model:

- canonical scripture owns truth
- CMS owns composition
- admin owns controlled editing workflows across both systems

## Why This System Exists

The project needs to solve several problems at once:

- preserve a stable canonical scripture hierarchy
- support editorial enrichment around that hierarchy
- allow admin users to edit real content close to the real page where possible
- avoid turning every page into a special-case editing implementation
- support future reusable modules instead of page-local editing code
- allow generic CMS page composition without flattening scripture into CMS

Without these boundaries, the project would drift toward one of two failures:

- canon becomes editable through generic page-building tools and loses
  structural protection
- admin becomes a collection of page-specific hacks that cannot scale

## Core Philosophical Commitments

### Canonical Truth Must Stay Protected

Canonical scripture structure is not presentation data.

The hierarchy:

- `book`
- `book_section`
- `chapter`
- `chapter_section`
- `verse`

is part of the product's protected truth model. It is not a CMS layout tree,
and it must not be re-expressed as one.

### CMS Must Remain Separate From Canonical Ownership

CMS is allowed to render supplemental content, compose standalone pages, and
augment declared regions.

CMS is not allowed to define:

- canonical hierarchy
- canonical routing truth
- canonical identity rules
- canonical scripture schema

CMS can support the scripture experience, but it cannot become the scripture
model.

### Admin Is A Hybrid Editing System

The admin model is intentionally hybrid:

- inline editing on the real page is preferred when the edit is narrow and safe
- protected full-edit fallbacks exist for deeper editorial work

This gives fast real-page editing without pretending every edit belongs in one
inline workflow.

### Modules Are The Reusable Editing Mechanism

Editing behavior should not live primarily in pages.

Pages expose semantic editing surfaces. Modules qualify against those surfaces
and attach reusable editor behavior. This keeps editor behavior portable and
keeps pages thinner over time.

### Pages Should Stay Thin

Pages and controllers should primarily:

- query
- orchestrate
- expose truthful view data
- expose surfaces

They should not become the permanent home for:

- deep editor logic
- ad hoc payload building
- registry logic
- business rules that belong in support layers

## System Model

### Canonical Scripture System

The canonical system owns:

- hierarchy
- identity
- protected routes
- canonical display structure
- editorial data directly attached to canonical entities where appropriate

Canonical scripture pages are schema-driven exceptions. They are not generic CMS
pages.

### CMS System

The CMS system owns:

- standalone page composition
- exposed supplementary regions
- generic container/block composition
- portable content modules

Its structural model is:

- `page`
- `page_container`
- `page_block`

This model is intentionally different from canonical scripture hierarchy.

### Admin System

The admin system bridges controlled editing across the two content systems.

It does so through:

- semantic surfaces
- reusable modules
- a qualification host
- route-context and payload builder support layers

The admin system is not allowed to collapse into page-specific editing code as a
default practice.

## Canonical Versus CMS Separation

### Canonical Owns Truth

Canonical scripture owns:

- structural identity
- canonical labels and ordering
- canonical navigation anchors
- protected schema invariants

### CMS Owns Composition

CMS owns:

- layout composition
- supplementary content blocks
- generic page-building concerns
- declared exposed regions on eligible pages

### Editorial Enrichment Lives Where It Belongs

Editorial behavior may live in reusable modules and canonical support models,
but editorial enrichment must not be allowed to redefine canonical structure.

This means:

- canonical intro/note/media/meta systems may exist
- CMS supplementary regions may exist
- neither may rewrite canonical structural truth

## Hybrid Admin Editing Model

The admin system intentionally has two editing modes.

### Inline Editing

Use inline editing when:

- the user is editing a small, local, page-truthful field or structured unit
- the edit can safely happen in context
- the real page is the best editing surface

### Full Edit Fallback

Use protected full-edit workflows when:

- the content is broader or more schema-heavy
- the edit spans multiple related pieces of data
- the live page should not absorb the full editing burden

Inline editing is the preferred routine path. Full edit is the safety valve, not
the architecture failure case.

## Module-Driven Architecture

The module system is the core editing mechanism for canonical admin behavior.

The pattern is:

- a page exposes a surface
- the surface advertises semantic identity and capabilities
- reusable modules qualify against the surface
- the host renders the qualifying modules

This keeps editor behavior reusable and keeps attachment driven by semantics
instead of page names.

CMS has its own registry-driven module system for content composition. These two
module systems are related in philosophy but separate in purpose.

## What Must Never Change

The following must remain true unless the project undergoes an explicit,
deliberate architectural reset:

- canonical scripture schema remains protected
- CMS never becomes the source of canonical truth
- canonical pages remain schema-driven exceptions
- admin remains a hybrid inline-plus-fallback system
- reusable editing behavior stays module-driven
- pages and controllers should trend thinner, not thicker
- new work should avoid central switchboard growth when distributed definitions
  are a better fit
- canonical scripture specialness is intentional and must not be flattened away

## Expected Evolution

The architecture is expected to evolve in the following direction:

- payload builders and mappers become more explicit, reducing thick controllers
- registries become more distributed, reducing central switchboards
- large page files and large editor workspaces are decomposed into focused parts
- CMS module definition on the backend becomes more manifest-like and less
  centralized
- admin surfaces become more semantically rich without becoming page-specific

The architecture is not expected to evolve toward:

- a giant rewrite
- interface-heavy abstraction for its own sake
- CMS ownership of canonical data
- page-level editor proliferation

## Long-Term Design Rule

When new capabilities are added, the preferred move is:

1. preserve the canonical/CMS boundary
2. expose truthful surface or payload seams
3. place reusable behavior in modules/builders/mappers
4. keep pages and controllers as orchestration layers
5. distribute definitions rather than deepening switchboards

That is the governing thesis of the project.



## Architectural Enforcement Rules

Architectural rules are not only conceptual; they must be enforceable in code structure.

### Canonical Protection Enforcement

The CMS must not be capable of:

- defining canonical entities (books, chapters, verses)
- modifying canonical hierarchy relationships
- redefining canonical identity or routing
- persisting canonical data

Enforcement strategy:

- canonical schema must be accessed only through canonical models and controllers
- CMS block schemas must not include canonical identity fields
- CMS queries must reference canonical data only through controlled read interfaces
- canonical mutations must go through schema-specific workflows, not generic CMS editors

Any feature that allows CMS to mutate canonical truth is a violation.

---

### Editing System Enforcement

Editing behavior must not be implemented directly in page components.

Enforcement strategy:

- all editing behavior must be attached through module system
- pages may expose surfaces only
- page-level editing logic must be treated as temporary and refactored into modules

---

### Registry Control Enforcement

Central registries must not become multi-purpose control systems.

Enforcement strategy:

- registries may aggregate definitions
- registries must not contain logic branches or validation switchboards
- new features must add new definition units, not extend central conditionals

---

### Page Thinness Enforcement

Pages must remain orchestration layers only.

Allowed in pages:

- data loading
- surface exposure
- layout composition

Not allowed in pages:

- payload building logic
- business rules
- editor workflows
- registry logic