# Scripture JSON Authoring Contract

This is the locked-in developer-facing authoring format for scripture JSON datasets.

## Filesystem Structure

All books use the same filesystem pattern:

```text
database/data/scripture/
  manifest.json
  categories.json
  books/
    {book-slug}/
      manifest.json
      sections/
        {section-slug}/
          chapters/
            chapter-01.json
```

## Allowed JSON File Types

Only these JSON file types are valid:

1. Root corpus manifest: `database/data/scripture/manifest.json`
2. Categories manifest: `database/data/scripture/categories.json`
3. Book manifest: `database/data/scripture/books/{book-slug}/manifest.json`
4. Chapter dataset: `database/data/scripture/books/{book-slug}/sections/{section-slug}/chapters/chapter-XX.json`

Section manifest files do not exist.

## Root Corpus Manifest

Required keys:

- `schema_version`
- `books`

`books` must be an array of objects with:

- `slug`
- `path`
- `enabled`

Optional book entry keys:

- `number`

Books render in canonical order by `number`, then `id`.

## Categories Manifest

Required keys:

- `schema_version`
- `categories`

`categories` must be an array of objects with:

- `slug`
- `name`

Optional keys:

- `description`
- `sort_order`

## Book Manifest

Required keys:

- `schema_version`
- `book`
- `categories`
- `section`

Optional book keys:

- `book.number`
- `book.description`

Each `section` item must be an array item with:

- `slug`
- `title`
- `chapters`

Optional section keys:

- `number`

Sections render in canonical order by `number`, then `id`.

Each `chapters` item must be an object with:

- `path`

Rules:

- `section` is the only valid book manifest collection key.
- `section` must remain an array.
- All books use this same structure, including books that conceptually only have one main section.
- Books without natural sections still use one section with `slug: "main"` and `title: "Main"`.

## Chapter Dataset

Required keys:

- `schema_version`
- `chapter`
- `chapter-section`

Required chapter keys:

- `chapter.slug`

Optional chapter keys:

- `chapter.number`
- `chapter.title`

Chapters render in canonical order by `chapter.number`, then `id`.

Each `chapter-section` item must be an array item with:

- `slug`
- `title`
- `verses`

Optional chapter-section keys:

- `number`

Chapter sections render in canonical order by `number`, then `id`.

Each verse item continues to use the canonical verse fields:

- `slug`
- `number`
- `text`
- `translations`
- `commentaries`

Verses render in canonical order by `number`, then `id`.

Rules:

- `chapter-section` is the only valid chapter collection key.
- `chapter-section` must remain an array.
- Books without natural internal chapter grouping still use one chapter-section with `slug: "main"` and `title: "Main"`.
