# Anti-Patterns

## Purpose

This document lists the anti-patterns that are especially dangerous in this
project.

These are not generic style complaints. They are threats to this architecture.

## God Objects And God Files

### Why Dangerous Here

This project already has several architecture-heavy domains:

- canonical scripture schema
- CMS composition
- admin module/surface system
- payload assembly

If a single file starts owning too many of those concerns, it becomes the place
every future change must touch.

### Current Examples Under Pressure

- `app/Support/Scripture/Admin/Registry/AdminEntityRegistry.php`
- `app/Http/Controllers/Scripture/ChapterController.php`
- `resources/js/pages/scripture/chapters/verses/show.tsx`

## Central Registries Becoming Switchboards

### Why Dangerous Here

Registries are needed for discovery, but when they also own defaults,
validation, behavior branches, and policy, they block safe evolution.

### Current Examples Under Pressure

- `app/Support/Cms/CmsModuleRegistry.php`
- `resources/js/admin/surfaces/core/surface-keys.ts`

## Thick Controllers

### Why Dangerous Here

Thick controllers blur:

- orchestration
- payload building
- mapping
- admin wiring

That makes the page boundary unstable and fights the architecture goal of thin
controllers.

### Current Examples Under Pressure

- `app/Http/Controllers/Scripture/BookController.php`
- `app/Http/Controllers/Scripture/ChapterController.php`
- `app/Http/Controllers/Scripture/VerseController.php`

## Page-Level Business Logic

### Why Dangerous Here

When pages accumulate business rules and editing orchestration, the reusable
surface/module architecture stops mattering and every page becomes its own
system.

### Current Examples Under Pressure

- `resources/js/pages/scripture/chapters/verses/show.tsx`
- `resources/js/pages/scripture/books/full-edit.tsx`
- `resources/js/pages/scripture/chapters/verses/full-edit.tsx`

## Duplicated Editor Systems

### Why Dangerous Here

This project already has:

- canonical admin modules
- CMS modules
- inline editing
- full-edit fallbacks

If new features add one more ad hoc editor path instead of using the existing
mechanisms, the architecture fragments quickly.

## CMS Controlling Canonical Schema

### Why Dangerous Here

This is the most serious architectural failure mode.

If CMS starts controlling:

- canonical hierarchy
- canonical structure
- canonical routing anchors
- canonical identity rules

then the project loses the reason it separated canonical scripture from CMS in
the first place.

CMS may supplement canonical scripture. It may not define it.

## Oversized Shared Contracts

### Why Dangerous Here

Large shared contracts make every consumer depend on fields it does not need.
That increases coupling and makes refactors noisy.

### Current Examples Under Pressure

- `resources/js/types/scripture.ts`
- `resources/js/admin/surfaces/sections/surface-types.ts`

## False Abstraction

### Why Dangerous Here

The project does need architecture, but not empty interface layers or
"manager/service/factory" inflation with no real boundary value.

Bad abstraction here would:

- hide clear domain ownership
- make future work slower
- create more indirection without reducing coupling

The project should prefer focused concrete support classes when they express
real responsibilities clearly.

## Dead Architecture Left Behind

### Why Dangerous Here

Keeping obsolete imports, unused helpers, abandoned branches, stale comments,
or parallel old/new paths after a refactor makes the codebase teach the wrong
architecture.

In this project that is especially dangerous because contributors are already
working across protected canonical flows, CMS composition, and module-driven
admin seams. Dead structure makes future batches drift back toward the wrong
pattern.

### Rule

Cleanup is encouraged, but only inside the touched scope. It must not become a
reason to broaden a batch into unrelated systems.

