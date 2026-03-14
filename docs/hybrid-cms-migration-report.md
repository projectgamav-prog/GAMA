# Hybrid CMS Migration Report

## What Exists Now

- Canonical content already lives in `content/data/books.json`, `book_sections.json`, `chapters.json`, `chapter_sections.json`, and `verses.json`.
- Public and admin already share the same route runtime and page tree; admin is layered on with inline overlays after the shared page boots.
- Verse explanation content currently uses the legacy `explanation_documents` and `explanation_blocks` tables.
- Repeated composition fields still live directly on canonical records: `insight_title`, `insight_caption`, `insight_media`, plus some media-like fields such as `cover_image`, `hero_image`, `audio_intro_url`, and `audio_url`.
- Characters were previously hardcoded in `src/content/characters/database.js` and were not part of the canonical table-backed content system.
- Role and permission assignment previously lived under `data/system` as `roles`, `role_permissions`, and `user_roles`.

## What Stays Canonical

- `books`
- `book_sections`
- `chapters`
- `chapter_sections`
- `verses`
- `characters`

These entities continue to own identity, slugs, numbering, ordering, publication state, and domain relations. They are not replaced by generic CMS blobs.

## What Moves To `content_blocks`

- Repeated record-level insight panels backed by `insight_title`, `insight_caption`, and `insight_media`
- Reusable editorial body content that was previously represented by verse-only `explanation_blocks`
- Future region-level composition for hero, body, sidebar, footer, and related editorial sections

Reusable media references are normalized into `media_assets` instead of being duplicated directly on blocks wherever migration can safely extract them.

## What Is Deprecated

- Legacy composition fields on canonical records:
  - `insight_title`
  - `insight_caption`
  - `insight_media`
  - `cover_image`
  - `hero_image`
  - `audio_intro_url`
  - `audio_url`
- Legacy verse explanation tables:
  - `explanation_documents`
  - `explanation_blocks`
- Legacy role-assignment source tables under `data/system`:
  - `roles`
  - `role_permissions`
  - `user_roles`

Deprecated fields and tables remain readable during the migration period and are not auto-removed by the migration script.

## Compatibility Rules During Migration

- If `content_blocks` exist for an entity and region, shared page models prefer them.
- If block data is missing for verse explanation regions, the app falls back to legacy `explanation_documents` and `explanation_blocks`.
- If neither block source exists, the app synthesizes fallback insight/media blocks from legacy canonical fields.
- Legacy tables and fields are preserved until migration has been verified end-to-end.
