# Shared Route Map

## Runtime model

All normal content pages boot the shared page runtime from `/src/core/browser/page-entry.js`.

- Public routes use real thin HTML wrappers at the repo root.
- Admin shared routes use real thin HTML wrappers under `admin/*/index.html`.
- Admin wrappers only set admin mode and then boot the same shared runtime.
- `admin/permissions/index.html` remains an admin-only page and does not use the shared page registry.

Normal shared admin routes no longer depend on a server catch-all rewrite to `admin/index.html`.

## Public shared routes

| Browser route | HTML entry | Shared page id |
| --- | --- | --- |
| `/` and `/index.html` | `/index.html` | `home` |
| `/books/` and `/books/index.html` | `/books/index.html` | `books` |
| `/chapters/` and `/chapters/index.html` | `/chapters/index.html` | `chapters` |
| `/verses/` and `/verses/index.html` | `/verses/index.html` | `verses` |
| `/explanations/` and `/explanations/index.html` | `/explanations/index.html` | `explanations` |
| `/characters/` and `/characters/index.html` | `/characters/index.html` | `characters` |
| `/topics/` and `/topics/index.html` | `/topics/index.html` | `topics` |
| `/places/` and `/places/index.html` | `/places/index.html` | `places` |
| `/profile/` and `/profile/index.html` | `/profile/index.html` | `profile` |

## Admin shared routes

| Browser route | HTML entry | Shared page id |
| --- | --- | --- |
| `/admin/` and `/admin/index.html` | `/admin/index.html` | `home` |
| `/admin/books/` and `/admin/books/index.html` | `/admin/books/index.html` | `books` |
| `/admin/chapters/` and `/admin/chapters/index.html` | `/admin/chapters/index.html` | `chapters` |
| `/admin/verses/` and `/admin/verses/index.html` | `/admin/verses/index.html` | `verses` |
| `/admin/explanations/` and `/admin/explanations/index.html` | `/admin/explanations/index.html` | `explanations` |
| `/admin/characters/` and `/admin/characters/index.html` | `/admin/characters/index.html` | `characters` |
| `/admin/topics/` and `/admin/topics/index.html` | `/admin/topics/index.html` | `topics` |
| `/admin/places/` and `/admin/places/index.html` | `/admin/places/index.html` | `places` |
| `/admin/profile/` and `/admin/profile/index.html` | `/admin/profile/index.html` | `profile` |

## Admin-only routes

| Browser route | HTML entry | Notes |
| --- | --- | --- |
| `/admin/permissions/` and `/admin/permissions/index.html` | `/admin/permissions/index.html` | Management-only page for roles and permissions |

## Explicit legacy redirects

These redirects exist so old URLs and half-supported aliases resolve cleanly without bringing back the old admin catch-all behavior.

| Legacy path | Destination |
| --- | --- |
| `/verses/sanskrit-english.html` | `/verses/index.html` |
| `/verses/sanskrit-hindi.html` | `/verses/index.html?mode=sanskrit-hindi` |
| `/verses/english-only.html` | `/verses/index.html?mode=english-only` |
| `/verses/hindi-only.html` | `/verses/index.html?mode=hindi-only` |
| `/characters/detail.html?slug=...` | `/characters/index.html?slug=...` |
| `/admin/home`, `/admin/home/`, `/admin/home/index.html` | `/admin/` |
| `/admin/verses/sanskrit-english.html` | `/admin/verses/index.html` |
| `/admin/verses/sanskrit-hindi.html` | `/admin/verses/index.html?mode=sanskrit-hindi` |
| `/admin/verses/english-only.html` | `/admin/verses/index.html?mode=english-only` |
| `/admin/verses/hindi-only.html` | `/admin/verses/index.html?mode=hindi-only` |
| `/admin/characters/detail.html?slug=...` | `/admin/characters/index.html?slug=...` |
