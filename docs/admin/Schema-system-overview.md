# Schema System Overview

## Status

This document is now a **compact reference note** rather than a planning
document.

The schema boundaries it describes are still active, but the repo has moved
past the earlier "planned" framing for media and related authoring flows.

Use `docs/current-state.md` for the live implementation snapshot and
`docs/admin-architecture.md` for the locked boundary rules.

---

## Purpose

This document defines the major schemas in the system, their responsibilities,
and boundaries.

---

## 1. Canonical Scripture Schema (Protected)

### Structure

book -> book_section -> chapter -> chapter_section -> verse

### Purpose

* represent authentic scripture structure
* define canonical hierarchy
* provide stable navigation and linking

### Rules

* cannot be modified by CMS
* must remain structured and hierarchical
* no layout responsibility

---

## 2. CMS Schema (Layout + Content)

### Structure

page -> container -> block

### Purpose

* control layout and composition
* render content modules
* support flexible page building

### Rules

* does not alter canonical data
* only used in declared regions
* module-driven

---

## 3. Navigation Schema

### Structure

navigation_items:

* label
* target_json
* parent_id
* sort_order
* menu_key

### Purpose

* power header and footer navigation
* provide structured global navigation

### Rules

* data-driven
* reusable across menus
* not page-specific

---

## 4. Media Schema

### Structure

media:

* id
* type
* path
* metadata

### Purpose

* manage reusable assets
* support visual content
* support the current inline-first media authoring pattern where a surface has
  the right seams

---

## 5. Extended Scripture Data

### Examples

* verse_meta
* translations
* commentaries
* relations

### Purpose

* enrich canonical content
* provide study tools

---

## System Relationship

Canonical Schema -> provides content
CMS Schema -> provides layout
Navigation Schema -> provides movement
Media Schema -> provides assets

---

## Boundaries (Very Important)

| System     | Controls            | Does NOT Control    |
| ---------- | ------------------- | ------------------- |
| Canonical  | scripture structure | layout              |
| CMS        | layout/content      | canonical hierarchy |
| Navigation | linking             | content             |
| Media      | assets              | structure           |

---

## Summary

Each system has a clear role:

* Canonical = truth
* CMS = presentation
* Navigation = movement
* Media = assets

Separation must always be preserved.

