# Scripture Linking System

## Purpose

The Scripture Linking System provides a fast, structured, and scalable way to link any canonical entity (book, chapter, verse, etc.) within the platform.

It replaces manual slug/URL entry with a guided navigation system through the canonical hierarchy.

---

## Core Principle

Linking should feel like navigating the scripture itself.

Instead of typing identifiers, the user should:

* start from a high-level entity
* progressively drill down into deeper levels
* select the exact target naturally

---

## Hierarchical Model

The system is based on the canonical hierarchy:

book → book_section → chapter → chapter_section → verse

Each selection step reveals only relevant children.

---

## Interaction Model

### Step-based progressive navigation

1. Select Book
2. Select Book Section (if exists)
3. Select Chapter
4. Select Chapter Section (if exists)
5. Select Verse

Each step:

* loads only the next level
* does not preload the entire tree
* reduces database load
* improves speed

---

## Performance Strategy

### Lazy loading (critical)

* Do NOT fetch full hierarchy at once
* Fetch only children of selected node
* Use indexed queries on:

  * book_id
  * book_section_id
  * chapter_id
  * chapter_section_id

### Caching (optional later)

* cache frequently accessed lists (e.g., chapters of a book)
* avoid repeated queries during same session

---

## UX Principles

### Fast selection

* minimal typing
* minimal waiting
* immediate feedback

### Clear hierarchy

* breadcrumb or path display:
  Book > Chapter > Verse

### Progressive reveal

* deeper levels appear only after parent selection

### Keyboard support (future)

* arrow navigation
* quick search within level

---

## Modes of Linking

Support linking to:

* Book page
* Chapter page
* Verse page
* (future) Topics / Characters

---

## Data Output

Final selection produces a structured link target:

```json
{
  "type": "scripture",
  "value": {
    "book": "bhagavad-gita",
    "chapter": "chapter-2",
    "verse": "verse-1"
  }
}
```

---

## Integration Points

Used in:

* button_group
* card_list
* navigation
* CMS modules
* future inline rich text links

---

## Do NOT

* allow free-form slug typing as primary flow
* preload entire scripture tree
* mix CMS structure with canonical linking
* degrade into URL-based linking for scripture

---

## Future Enhancements

* search within current level
* jump-to search (type verse number)
* favorites / recently used links
* deep linking presets

---

## Summary

Scripture linking must be:

* hierarchical
* fast
* progressive
* structured
* aligned with canonical schema
