# CMS Schema-Fed Query & Runtime Filter System

## Purpose

This system enables CMS blocks to:

1. Fetch structured data from canonical schemas using controlled queries
2. Apply filters at creation time (admin-defined)
3. Allow users/guests to dynamically filter results at runtime

It transforms CMS from static content rendering into a **data-driven, interactive content system**, while preserving architectural boundaries.

---

# 🧠 SYSTEM OVERVIEW

The system consists of two layers:

## 1. Query Definition Layer (Admin)

* Defined when creating/editing CMS block
* Determines what data the block is based on
* Stored in database
* Locked after configuration (unless edited by admin)

## 2. Runtime Filter Layer (User/Guest)

* Applied on top of base query
* Controlled by UI (dropdowns, search, toggles)
* Does NOT change base query
* Only refines results

---

# 🧩 PART 1: QUERY DEFINITION SYSTEM (ADMIN)

## Core Concept

CMS blocks can use structured queries instead of manual content.

---

## Query Structure

```json
{
  "entity": "verse",
  "chain": {
    "book": "bhagavad-gita",
    "chapter": "chapter-2"
  },
  "filters": [
    { "field": "number", "operator": "=", "value": 1 }
  ],
  "sort": "canonical",
  "limit": 10
}
```

---

## Query Components

### 1. Entity

Defines the base dataset:

* book
* chapter
* verse
* (future: topics, characters)

---

### 2. Chain (Hierarchical Scope)

Defines parent → child traversal:

```json
"chain": {
  "book": "...",
  "chapter": "..."
}
```

Rules:

* always top-down
* only valid parent-child relations
* no arbitrary joins

---

### 3. Filters (Admin-Level)

Used to refine dataset:

Supported operators:

* equals
* contains
* starts_with
* greater_than
* less_than

Example:

```json
{ "field": "title", "operator": "contains", "value": "Yoga" }
```

---

### 4. Sort

Options:

* canonical
* alphabetical
* custom (future)

---

### 5. Limit

Restricts result size.

---

## Query Modes

Each block supports one of:

### Manual

* static content

### Selected Entity

* single item (e.g., one verse)

### Parent → Children

* auto-load children (e.g., verses in chapter)

### Filtered Query

* entity + filters

### Context Query

* based on current page (e.g., current chapter)

---

## Presets (Recommended)

Instead of manual filters:

* "All verses in chapter"
* "First verse of chapter"
* "Featured verses"
* "Top chapters"

---

## Storage

Each CMS block stores:

```json
{
  "source": "query",
  "query_definition": {...}
}
```

---

# 🧩 PART 2: RUNTIME FILTER SYSTEM (USER/GUEST)

## Purpose

Allow users to filter displayed data without modifying CMS configuration.

---

## Example Use Cases

* Filter verses by number
* Filter chapters by name
* Filter books by category
* Search within results

---

## Runtime Filter Structure

```json
{
  "runtime_filters": [
    {
      "field": "number",
      "type": "number",
      "ui": "dropdown"
    },
    {
      "field": "title",
      "type": "text",
      "ui": "search"
    }
  ]
}
```

---

## Behavior

* base query runs first
* runtime filters apply on result set
* filtering can be:

  * client-side (small datasets)
  * server-side (large datasets)

---

## UI Types

* dropdown (numbers, enums)
* search input (text)
* toggle (boolean)
* range slider (future)

---

## Example Flow

1. CMS block loads:
   → all verses from chapter 2

2. User selects:
   → verse number = 1

3. UI updates instantly:
   → filtered result shown

---

## Rules

### Must NOT:

* alter base query
* break canonical structure
* expose raw database access

### Must:

* be fast
* be predictable
* be reversible

---

# 🧩 PART 3: RENDERING SYSTEM

## Flow

1. Resolve base query (server)
2. Fetch dataset
3. Apply runtime filters
4. Render module (cards/list/text)

---

## Rendering Modes

* list
* card grid
* text block
* grouped sections

---

# 🧩 PART 4: PERFORMANCE STRATEGY

## Query Layer

* use indexed columns
* load only required depth
* avoid deep joins

## Runtime Filtering

* client-side for small datasets (<100 items)
* server-side for large datasets

## Caching (future)

* cache base query results
* reuse within session

---

# 🧩 PART 5: SECURITY

* no raw SQL exposure
* no arbitrary query execution
* whitelist fields and operators
* validate all filters

---

# 🧩 PART 6: INTEGRATION WITH CMS

Used in:

* card_list
* text modules
* future dynamic modules
* scripture-based content blocks

---

# 🧩 PART 7: EXAMPLES

## Example 1: Verse List Block

* entity: verse
* chain: chapter-2
* runtime filter: verse number

---

## Example 2: Chapter Cards

* entity: chapter
* chain: book
* filter: name contains "Yoga"

---

## Example 3: Dynamic Study Section

* entity: verse
* chain: current chapter
* runtime filter: keyword search

---

# 🧩 PART 8: FUTURE EXTENSIONS

* advanced search
* saved filters
* user preferences
* pagination
* multi-condition filters
* aggregation (counts)

---

# 🧩 SUMMARY

This system enables:

* CMS blocks powered by structured data
* safe query abstraction (no SQL exposure)
* dynamic user filtering
* reusable and scalable content generation

It combines:

CMS flexibility + Database power + User interactivity

without breaking architectural boundaries.
