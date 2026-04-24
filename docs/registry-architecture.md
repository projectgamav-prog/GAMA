# Registry Architecture

## Purpose

This document defines what a registry means in this project, when registries are
useful, when they become harmful, and how current central registries should
evolve safely.

## What A Registry Is In This Project

A registry is a lookup or composition point for distributed definitions that
need stable discovery.

Valid examples include:

- admin module registration
- CMS module registration
- admin entity/schema definition lookup
- exposed region definition lookup

A registry should answer:

- what is available
- how it is identified
- how callers discover it

It should not become the place where all domain behavior is manually
implemented.

## When To Use A Registry

Use a registry when:

- the system needs stable keyed discovery
- multiple modules or definitions must be enumerated
- the caller should not know concrete implementation locations
- extension is expected over time

## When Not To Use A Registry

Do not use a registry when:

- the problem is really payload building
- the problem is route ownership
- the problem is a small mapper concern
- the registry would only centralize branching logic with no real discovery
  benefit

## Central Switchboard Problem

A registry becomes a central switchboard when it accumulates:

- keyed discovery
- defaults
- validation logic
- type branching
- business rules
- policy decisions
- per-domain implementation details

At that point, the registry stops being a composition seam and becomes a god
file.

Current examples under pressure:

- `app/Support/Cms/CmsModuleRegistry.php`
- `app/Support/Scripture/Admin/Registry/AdminEntityRegistry.php`
- `resources/js/admin/surfaces/core/surface-keys.ts`

## Distributed Definition Approach

The preferred long-term pattern is:

- definitions live close to their domain
- the registry composes them
- callers still use one stable registry entrypoint

### Example Direction

Instead of one monolithic admin entity registry file:

- `book` definition lives in a book definition file
- `chapter` definition lives in a chapter definition file
- `verse` definition lives in a verse definition file
- the registry aggregates them into keyed lookup

Instead of one CMS module registry with `match` branches for all modules:

- each module owns defaults and validation in its own definition
- the registry composes keyed module definitions

## Registry Rules

- Keep the caller-facing API stable where possible.
- Move implementation detail out of the registry before changing public usage.
- Prefer composition over large `switch` and `match` growth.
- Keep definitions near the domain they describe.
- Do not make the registry the only place where the system can evolve.

## Safe Refactor Strategy For Current Registries

### AdminEntityRegistry

Safe refactor:

- split per-entity definitions into focused files
- keep `AdminEntityRegistry` as the lookup/composition entrypoint
- preserve `definition(key)` and `definitions()` behavior

### CmsModuleRegistry

Safe refactor:

- introduce per-module PHP definitions
- let the registry compose them
- preserve current caller-facing methods until migration is complete

### Surface Key Switchboards

Safe refactor:

- move toward declarative maps or distributed semantic-key metadata where it
  reduces central branching without hiding meaning

### Exposed Region Registry

Safe refactor:

- keep curated regions explicit
- separate region definitions from the main registry if the set grows
  materially

## What Not To Do

Do not:

- replace one central switchboard with one larger “manager” class
- abstract current registries behind meaningless interfaces
- split registries so aggressively that discovery becomes opaque

Do:

- distribute definitions
- keep lookup simple
- preserve explicit architectural boundaries




### Forbidden Registry Pattern

A registry must never become a central switchboard that:

- contains conditional logic per entity/module
- performs validation branching
- normalizes payloads based on type
- owns business rules

Example anti-pattern:

- large match/switch statements inside a registry
- registry knowing how each module/entity behaves

---

### Correct Registry Pattern

A registry should:

- collect distributed definitions
- provide lookup and iteration
- remain declarative

Behavior must live in:

- module definition classes
- entity-specific builders
- validators attached to definitions

---

### Migration Rule

When a registry grows beyond simple definition aggregation:

- split definitions into per-entity/per-module classes
- move behavior out of registry into those classes
- keep registry as a thin composition layer

