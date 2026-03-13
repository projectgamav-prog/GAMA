# Shared Route Map

## Runtime model

All normal content pages boot the shared page runtime from `/src/core/browser/page-entry.js`.

- Public routes use real thin HTML wrappers at the repo root.
- Admin shared routes use real thin HTML wrappers under `admin/*/index.html`.
- Admin wrappers only set admin mode and then boot the same shared runtime.
- `admin/permissions/index.html` remains an admin-only page and does not use the shared page registry.
- Route config constants use the `index.html` entry paths below; directory URLs like `/books/` or `/admin/books/` are also served by the filesystem-backed wrappers.

Normal shared admin routes no longer depend on a server catch-all rewrite to `admin/index.html`.

## Public shared routes

| Route helper path | Also served at | Shared page id |
| --- | --- | --- |
| `/index.html` | `/` | `home` |
| `/books/index.html` | `/books/` | `books` |
| `/chapters/index.html` | `/chapters/` | `chapters` |
| `/verses/index.html` | `/verses/` | `verses` |
| `/explanations/index.html` | `/explanations/` | `explanations` |
| `/characters/index.html` | `/characters/` | `characters` |
| `/topics/index.html` | `/topics/` | `topics` |
| `/places/index.html` | `/places/` | `places` |
| `/profile/index.html` | `/profile/` | `profile` |

## Admin shared routes

| Route helper path | Also served at | Shared page id |
| --- | --- | --- |
| `/admin/index.html` | `/admin/` | `home` |
| `/admin/books/index.html` | `/admin/books/` | `books` |
| `/admin/chapters/index.html` | `/admin/chapters/` | `chapters` |
| `/admin/verses/index.html` | `/admin/verses/` | `verses` |
| `/admin/explanations/index.html` | `/admin/explanations/` | `explanations` |
| `/admin/characters/index.html` | `/admin/characters/` | `characters` |
| `/admin/topics/index.html` | `/admin/topics/` | `topics` |
| `/admin/places/index.html` | `/admin/places/` | `places` |
| `/admin/profile/index.html` | `/admin/profile/` | `profile` |

## Admin-only routes

| Route helper path | Also served at | Notes |
| --- | --- | --- |
| `/admin/permissions/index.html` | `/admin/permissions/` | Management-only page for roles and permissions |

## Explicit legacy redirects

These redirects exist so old URLs and half-supported aliases resolve cleanly without bringing back the old admin catch-all behavior.

| Legacy path | Destination |
| --- | --- |
| `/verses/sanskrit-english.html` | `/verses/index.html` |
| `/verses/sanskrit-hindi.html` | `/verses/index.html?mode=sanskrit-hindi` |
| `/verses/english-only.html` | `/verses/index.html?mode=english-only` |
| `/verses/hindi-only.html` | `/verses/index.html?mode=hindi-only` |
| `/characters/detail.html?slug=...` | `/characters/index.html?slug=...` |
| `/admin/home`, `/admin/home/`, `/admin/home/index.html` | `/admin/index.html` |
| `/admin/verses/sanskrit-english.html` | `/admin/verses/index.html` |
| `/admin/verses/sanskrit-hindi.html` | `/admin/verses/index.html?mode=sanskrit-hindi` |
| `/admin/verses/english-only.html` | `/admin/verses/index.html?mode=english-only` |
| `/admin/verses/hindi-only.html` | `/admin/verses/index.html?mode=hindi-only` |
| `/admin/characters/detail.html?slug=...` | `/admin/characters/index.html?slug=...` |
