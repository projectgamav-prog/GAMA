# Hybrid CMS Migration Report

## What Exists Now

- Canonical content already lives in `content/data/books.json`, `book_sections.json`, `chapters.json`, `chapter_sections.json`, and `verses.json`.
- Public and admin already share the same route runtime and page tree; admin is layered on with inline overlays after the shared page boots.
- Verse explanation and body content now lives in `content_blocks` with `owner_entity = "verses"` and `region = "body"`.
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
- Reusable editorial body content for verses
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
  - removed from the runtime and data model
- Legacy role-assignment source tables under `data/system`:
  - `roles`
  - `role_permissions`
  - `user_roles`

Deprecated fields remain readable during the migration period. The legacy explanation tables have been removed from the runtime and data model.

## Compatibility Rules During Migration

- If `content_blocks` exist for an entity and region, shared page models prefer them.
- Verse explanation regions read only from `content_blocks` for `owner_entity = "verses"` and `region = "body"`.
- If neither block source exists, the app synthesizes fallback insight/media blocks from legacy canonical fields.
- Legacy canonical fields are preserved until migration has been verified end-to-end.
