# Media System (Planned Architecture)

## Purpose

The Media System manages all visual and audio assets across the platform.

It replaces raw URL-based media usage with a structured, reusable asset system.

---

## Core Goals

* allow upload of media files
* provide a central media library
* enable easy selection and reuse
* support structured metadata
* integrate with CMS modules cleanly

---

## Phase 1 (Initial System)

### Features

* upload image/video
* store in filesystem
* create media record in database
* select media in modules (media block)
* basic preview

### Data model (conceptual)

media:

* id
* type (image/video)
* path
* url
* title
* alt_text
* created_at

---

## Phase 2 (Improvement Layer)

* media picker UI
* thumbnail previews
* search/filter
* recently used
* basic categorization

---

## Phase 3 (Advanced System)

* folders or collections
* tagging system
* media roles (hero, thumbnail, inline)
* cropping / variants
* responsive images
* CDN integration
* lazy loading strategies

---

## UX Principles

* no manual URL entry required
* selection should feel visual
* reuse should be easy
* editing should not require re-upload

---

## Integration Points

* media module
* card_list images (future)
* header/footer (if needed)
* CMS pages
* scripture supplemental content

---

## Important Constraints

* do not tightly couple media to specific modules
* media must remain a reusable global resource
* CMS modules should reference media, not own it

---

## Future Ideas

* attach media to scripture entities
* recitations/audio linking
* media-based learning modules
* video playlists

---

## Summary

Media system should evolve from:

URL → Upload → Library → Structured asset ecosystem
