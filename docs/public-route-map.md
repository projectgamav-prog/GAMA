# Public Route Map

## Shared page runtime

All normal content routes now boot the same shared page runtime from `/src/core/browser/page-entry.js`.
Public HTML files are thin entry shells only.
Admin shared routes are served by `admin/index.html`, which only sets admin mode and forwards into that same runtime.

## Canonical public routes

| Route | HTML entry | Shared page id |
| --- | --- | --- |
| `/` | `/index.html` | `home` |
| `/books` | `/books/index.html` | `books` |
| `/chapters` | `/chapters/index.html` | `chapters` |
| `/verses` | `/verses/index.html` | `verses` |
| `/explanations` | `/explanations/index.html` | `explanations` |
| `/characters` | `/characters/index.html` | `characters` |
| `/topics` | `/topics/index.html` | `topics` |
| `/places` | `/places/index.html` | `places` |
| `/profile` | `/profile/index.html` | `profile` |

## Canonical admin shared routes

These routes use the same shared page definitions and renderers as public mode.
The only admin-specific HTML entry for shared content is `admin/index.html`.

| Public route | Admin route | Shared page id |
| --- | --- | --- |
| `/index.html` | `/admin/index.html` | `home` |
| `/books/index.html` | `/admin/books/index.html` | `books` |
| `/chapters/index.html` | `/admin/chapters/index.html` | `chapters` |
| `/verses/index.html` | `/admin/verses/index.html` | `verses` |
| `/explanations/index.html` | `/admin/explanations/index.html` | `explanations` |
| `/characters/index.html` | `/admin/characters/index.html` | `characters` |
| `/topics/index.html` | `/admin/topics/index.html` | `topics` |
| `/places/index.html` | `/admin/places/index.html` | `places` |
| `/profile/index.html` | `/admin/profile/index.html` | `profile` |

## Admin-only routes

| Route | Notes |
| --- | --- |
| `/admin/permissions/index.html` | Management-only page for roles and permissions |

## Legacy route aliases redirected to canonical shells

| Legacy path | Canonical destination |
| --- | --- |
| `/verses/sanskrit-english.html` | `/verses/index.html` |
| `/verses/sanskrit-hindi.html` | `/verses/index.html?mode=sanskrit-hindi` |
| `/verses/english-only.html` | `/verses/index.html?mode=english-only` |
| `/verses/hindi-only.html` | `/verses/index.html?mode=hindi-only` |
| `/characters/detail.html?slug=...` | `/characters/index.html?slug=...` |
