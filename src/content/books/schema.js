import { deepFreeze } from "../../core/data/freeze.js";
import { buildGroupedLookup, buildRecordLookup } from "../../core/data/indexes.js";
import { normalizeIdentifier } from "../../core/data/normalize.js";
import {
    assertUnique,
    createUniqueTracker,
    normalizeOptionalBoolean,
    normalizeOptionalMediaPath,
    normalizeOptionalPositiveInteger,
    normalizeOptionalString,
    requireBoolean,
    requireFields,
    requireIdentifier,
    requireObject,
    requirePositiveInteger,
    requireString,
} from "../../core/data/validate.js";

export const BOOK_TYPES = Object.freeze(["source", "collection"]);

function defineTableSchema(fields, requiredFields) {
    return Object.freeze({
        fields: Object.freeze(fields),
        requiredFields: Object.freeze(requiredFields),
    });
}

const EDITOR_REQUIRED_FIELD_NAMES = Object.freeze({
    books: Object.freeze([
        "slug",
        "title",
        "short_title",
        "description",
        "book_type",
        "ui_order",
        "cover_image",
        "theme_key",
        "meta_title",
        "meta_description",
    ]),
    book_sections: Object.freeze([
        "book_id",
        "source_book_id",
        "title",
        "ui_order",
        "chapter_start",
        "chapter_end",
    ]),
    chapters: Object.freeze([
        "source_book_id",
        "chapter_number",
        "slug",
        "title",
        "ui_order",
    ]),
    chapter_sections: Object.freeze([
        "chapter_id",
        "section_number",
        "title",
        "ui_order",
        "verse_start",
        "verse_end",
    ]),
    verses: Object.freeze([
        "chapter_id",
        "verse_number",
    ]),
});

function withSchemaRequiredFlags(tableName, fields) {
    const requiredFieldNames = new Set(EDITOR_REQUIRED_FIELD_NAMES[tableName] || []);

    return Object.freeze(
        fields.map((field) => {
            if (field.type === "checkbox") {
                return Object.freeze({ ...field });
            }

            return Object.freeze({
                ...field,
                required: field.required === true || requiredFieldNames.has(field.name),
            });
        })
    );
}

export const CONTENT_TABLE_SCHEMAS = Object.freeze({
    books: defineTableSchema(
        [
            "id",
            "slug",
            "title",
            "short_title",
            "description",
            "book_type",
            "ui_order",
            "is_published",
            "cover_image",
            "theme_key",
            "meta_title",
            "meta_description",
        ],
        [
            "id",
            "slug",
            "title",
            "short_title",
            "description",
            "book_type",
            "ui_order",
            "is_published",
            "cover_image",
            "theme_key",
            "meta_title",
            "meta_description",
        ]
    ),
    book_sections: defineTableSchema(
        [
            "id",
            "book_id",
            "source_book_id",
            "title",
            "slug",
            "summary",
            "ui_order",
            "chapter_start",
            "chapter_end",
            "badge_text",
            "cover_image",
        ],
        [
            "id",
            "book_id",
            "source_book_id",
            "title",
            "slug",
            "summary",
            "ui_order",
            "chapter_start",
            "chapter_end",
        ]
    ),
    chapters: defineTableSchema(
        [
            "id",
            "source_book_id",
            "chapter_number",
            "slug",
            "title",
            "summary",
            "ui_order",
            "hero_image",
            "audio_intro_url",
        ],
        [
            "id",
            "source_book_id",
            "chapter_number",
            "slug",
            "title",
            "summary",
            "ui_order",
        ]
    ),
    chapter_sections: defineTableSchema(
        [
            "id",
            "chapter_id",
            "section_number",
            "slug",
            "title",
            "summary",
            "ui_order",
            "verse_start",
            "verse_end",
            "card_variant",
            "accent_key",
        ],
        [
            "id",
            "chapter_id",
            "section_number",
            "slug",
            "title",
            "summary",
            "ui_order",
            "verse_start",
            "verse_end",
        ]
    ),
    verses: defineTableSchema(
        [
            "id",
            "chapter_id",
            "verse_number",
            "slug",
            "sanskrit_text",
            "transliteration_text",
            "english_text",
            "hindi_text",
            "audio_url",
            "is_featured",
        ],
        [
            "id",
            "chapter_id",
            "verse_number",
            "slug",
            "sanskrit_text",
            "transliteration_text",
            "english_text",
            "hindi_text",
            "audio_url",
            "is_featured",
        ]
    ),
});

export const BOOK_FIELDS = CONTENT_TABLE_SCHEMAS.books.fields;
export const BOOK_SECTION_FIELDS = CONTENT_TABLE_SCHEMAS.book_sections.fields;
export const CHAPTER_FIELDS = CONTENT_TABLE_SCHEMAS.chapters.fields;
export const CHAPTER_SECTION_FIELDS = CONTENT_TABLE_SCHEMAS.chapter_sections.fields;
export const VERSE_FIELDS = CONTENT_TABLE_SCHEMAS.verses.fields;

export const CHAPTER_SECTION_VERSE_FIELDS = Object.freeze([
    "id",
]);

export const CONTENT_FIELD_CONFIGS = Object.freeze({
    books: withSchemaRequiredFlags("books", [
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "short_title", label: "Short Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        {
            name: "book_type",
            label: "Book Type",
            type: "select",
            required: true,
            options: Object.freeze(
                BOOK_TYPES.map((value) => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                }))
            ),
        },
        { name: "ui_order", label: "UI Order", type: "number", min: 1, required: true },
        { name: "is_published", label: "Published", type: "checkbox" },
        { name: "cover_image", label: "Cover Image", type: "text" },
        { name: "theme_key", label: "Theme Key", type: "text" },
        { name: "meta_title", label: "Meta Title", type: "text" },
        { name: "meta_description", label: "Meta Description", type: "textarea" },
    ]),
    book_sections: withSchemaRequiredFlags("book_sections", [
        { name: "book_id", label: "Book", type: "select-from-state", source: "books", optionLabel: "title", optionValue: "id", required: true },
        { name: "source_book_id", label: "Source Book", type: "select-from-state", source: "books", optionLabel: "title", optionValue: "id", required: true },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "ui_order", label: "UI Order", type: "number", min: 1, required: true },
        { name: "chapter_start", label: "Chapter Start", type: "number", min: 1, required: true },
        { name: "chapter_end", label: "Chapter End", type: "number", min: 1, required: true },
        { name: "badge_text", label: "Badge Text", type: "text" },
        { name: "cover_image", label: "Cover Image", type: "text" },
    ]),
    chapters: withSchemaRequiredFlags("chapters", [
        { name: "source_book_id", label: "Source Book", type: "select-from-state", source: "books", optionLabel: "title", optionValue: "id", required: true },
        { name: "chapter_number", label: "Chapter Number", type: "number", min: 1, required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "ui_order", label: "UI Order", type: "number", min: 1, required: true },
        { name: "hero_image", label: "Hero Image", type: "text" },
        { name: "audio_intro_url", label: "Audio Intro URL", type: "text" },
    ]),
    chapter_sections: withSchemaRequiredFlags("chapter_sections", [
        {
            name: "chapter_id",
            label: "Chapter",
            type: "select-from-state",
            source: "chapters",
            optionLabel(record) {
                return `${record.chapter_number}. ${record.title}`;
            },
            optionValue: "id",
            required: true,
        },
        { name: "section_number", label: "Section Number", type: "number", min: 1, required: true },
        { name: "slug", label: "Slug", type: "text" },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "ui_order", label: "UI Order", type: "number", min: 1, required: true },
        { name: "verse_start", label: "Verse Start", type: "number", min: 1, required: true },
        { name: "verse_end", label: "Verse End", type: "number", min: 1, required: true },
        { name: "card_variant", label: "Card Variant", type: "text" },
        { name: "accent_key", label: "Accent Key", type: "text" },
    ]),
    verses: withSchemaRequiredFlags("verses", [
        {
            name: "chapter_id",
            label: "Chapter",
            type: "select-from-state",
            source: "chapters",
            optionLabel(record) {
                return `${record.chapter_number}. ${record.title}`;
            },
            optionValue: "id",
            required: true,
        },
        { name: "verse_number", label: "Verse Number", type: "number", min: 1, required: true },
        { name: "slug", label: "Slug", type: "text" },
        { name: "sanskrit_text", label: "Sanskrit Text", type: "textarea" },
        { name: "transliteration_text", label: "Transliteration", type: "textarea" },
        { name: "english_text", label: "English Text", type: "textarea" },
        { name: "hindi_text", label: "Hindi Text", type: "textarea" },
        { name: "audio_url", label: "Audio URL", type: "text" },
        { name: "is_featured", label: "Featured", type: "checkbox" },
    ]),
});

/**
 * @typedef {Object} BookRecord
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string | null} short_title
 * @property {string | null} description
 * @property {"source"|"collection"} book_type
 * @property {number} ui_order
 * @property {boolean} is_published
 * @property {string | null} cover_image
 * @property {string | null} theme_key
 * @property {string | null} meta_title
 * @property {string | null} meta_description
 */

/**
 * @typedef {Object} BookSectionRecord
 * @property {string} id
 * @property {string} book_id
 * @property {string} source_book_id
 * @property {string} title
 * @property {string} slug
 * @property {string | null} summary
 * @property {number} ui_order
 * @property {number | null} chapter_start
 * @property {number | null} chapter_end
 * @property {string | null} badge_text
 * @property {string | null} cover_image
 */

/**
 * @typedef {Object} ChapterRecord
 * @property {string} id
 * @property {string} source_book_id
 * @property {number} chapter_number
 * @property {string} slug
 * @property {string} title
 * @property {string | null} summary
 * @property {number} ui_order
 * @property {string | null} hero_image
 * @property {string | null} audio_intro_url
 */

/**
 * @typedef {Object} ChapterSectionRecord
 * @property {string} id
 * @property {string} chapter_id
 * @property {number} section_number
 * @property {string} slug
 * @property {string} title
 * @property {string | null} summary
 * @property {number} ui_order
 * @property {string | null} card_variant
 * @property {string | null} accent_key
 * @property {number | null} verse_start
 * @property {number | null} verse_end
 */

/**
 * @typedef {Object} VerseRecord
 * @property {string} id
 * @property {string} chapter_id
 * @property {number} verse_number
 * @property {string} slug
 * @property {string | null} sanskrit_text
 * @property {string | null} transliteration_text
 * @property {string | null} english_text
 * @property {string | null} hindi_text
 * @property {string | null} audio_url
 * @property {boolean | null} is_featured
 */

/**
 * @typedef {Object} BooksDatabase
 * @property {readonly BookRecord[]} books
 * @property {readonly BookSectionRecord[]} bookSections
 * @property {readonly ChapterRecord[]} chapters
 * @property {readonly ChapterSectionRecord[]} chapterSections
 * @property {readonly VerseRecord[]} verses
 * @property {Readonly<Record<string, unknown>>} indexes
 */

function sortByUiOrder(records) {
    return [...records].sort((a, b) => a.ui_order - b.ui_order);
}

export function normalizeBookSlug(slug) {
    return normalizeIdentifier(slug);
}

export function normalizeBookSectionSlug(slug) {
    return normalizeIdentifier(slug);
}

export function normalizeChapterSlug(slug) {
    return normalizeIdentifier(slug);
}

export function normalizeChapterSectionSlug(slug) {
    return normalizeIdentifier(slug);
}

export function normalizeVerseSlug(slug) {
    return normalizeIdentifier(slug);
}

function normalizeBooks(rawBooks) {
    if (!Array.isArray(rawBooks)) {
        throw new Error('Books database must provide a "books" array.');
    }

    const ids = createUniqueTracker();
    const slugs = createUniqueTracker();

    return rawBooks.map((record, index) => {
        const label = `Book at index ${index}`;
        requireObject(record, label);
        requireFields(record, CONTENT_TABLE_SCHEMAS.books.requiredFields, label);

        const normalized = {
            id: requireIdentifier(record, "id", label),
            slug: normalizeBookSlug(record.slug),
            title: requireString(record, "title", label),
            short_title: normalizeOptionalString(record, "short_title"),
            description: normalizeOptionalString(record, "description"),
            book_type: requireString(record, "book_type", label),
            ui_order: requirePositiveInteger(record, "ui_order", label),
            is_published: requireBoolean(record, "is_published", label),
            cover_image: normalizeOptionalMediaPath(record, "cover_image", label),
            theme_key: normalizeOptionalString(record, "theme_key"),
            meta_title: normalizeOptionalString(record, "meta_title"),
            meta_description: normalizeOptionalString(record, "meta_description"),
        };

        if (!BOOK_TYPES.includes(normalized.book_type)) {
            throw new Error(`${label} has an invalid "book_type" value.`);
        }

        assertUnique(ids, normalized.id, "book id");
        assertUnique(slugs, normalized.slug, "book slug");
        return normalized;
    });
}

function normalizeBookSections(rawBookSections, booksById) {
    if (!Array.isArray(rawBookSections)) {
        throw new Error('Books database must provide a "book_sections" array.');
    }

    const ids = createUniqueTracker();

    return rawBookSections.map((record, index) => {
        const label = `Book section at index ${index}`;
        requireObject(record, label);
        requireFields(record, CONTENT_TABLE_SCHEMAS.book_sections.requiredFields, label);

        const bookId = requireIdentifier(record, "book_id", label);
        const sourceBookId = requireIdentifier(record, "source_book_id", label);

        if (!booksById[bookId]) {
            throw new Error(`${label} references unknown book_id "${bookId}".`);
        }

        if (!booksById[sourceBookId] || booksById[sourceBookId].book_type !== "source") {
            throw new Error(`${label} must reference a valid source_book_id.`);
        }

        const normalized = {
            id: requireIdentifier(record, "id", label),
            book_id: bookId,
            source_book_id: sourceBookId,
            title: requireString(record, "title", label),
            slug: normalizeBookSectionSlug(record.slug),
            summary: normalizeOptionalString(record, "summary"),
            ui_order: requirePositiveInteger(record, "ui_order", label),
            chapter_start: normalizeOptionalPositiveInteger(record, "chapter_start", label),
            chapter_end: normalizeOptionalPositiveInteger(record, "chapter_end", label),
            badge_text: normalizeOptionalString(record, "badge_text"),
            cover_image: normalizeOptionalMediaPath(record, "cover_image", label),
        };

        if ((normalized.chapter_start == null) !== (normalized.chapter_end == null)) {
            throw new Error(`${label} must provide both chapter_start and chapter_end together.`);
        }
        if (normalized.chapter_start != null && normalized.chapter_start > normalized.chapter_end) {
            throw new Error(`${label} must use chapter_start before chapter_end.`);
        }

        assertUnique(ids, normalized.id, "book section id");
        return normalized;
    });
}

function normalizeChapters(rawChapters, booksById) {
    if (!Array.isArray(rawChapters)) {
        throw new Error('Books database must provide a "chapters" array.');
    }

    const ids = createUniqueTracker();
    const numberKeys = createUniqueTracker();
    const slugKeys = createUniqueTracker();

    return rawChapters.map((record, index) => {
        const label = `Chapter at index ${index}`;
        requireObject(record, label);
        requireFields(record, CONTENT_TABLE_SCHEMAS.chapters.requiredFields, label);

        const sourceBookId = requireIdentifier(record, "source_book_id", label);
        const sourceBook = booksById[sourceBookId];
        if (!sourceBook) {
            throw new Error(`${label} references unknown source_book_id "${sourceBookId}".`);
        }
        if (sourceBook.book_type !== "source") {
            throw new Error(`${label} must reference a source book.`);
        }

        const normalized = {
            id: requireIdentifier(record, "id", label),
            source_book_id: sourceBookId,
            chapter_number: requirePositiveInteger(record, "chapter_number", label),
            slug: normalizeChapterSlug(record.slug),
            title: requireString(record, "title", label),
            summary: normalizeOptionalString(record, "summary"),
            ui_order: requirePositiveInteger(record, "ui_order", label),
            hero_image: normalizeOptionalMediaPath(record, "hero_image", label),
            audio_intro_url: normalizeOptionalMediaPath(record, "audio_intro_url", label),
        };

        assertUnique(ids, normalized.id, "chapter id");
        assertUnique(numberKeys, `${normalized.source_book_id}:${normalized.chapter_number}`, "chapter number key");
        assertUnique(slugKeys, `${normalized.source_book_id}:${normalized.slug}`, "chapter slug key");
        return normalized;
    });
}

function normalizeChapterSections(rawChapterSections, chaptersById) {
    if (!Array.isArray(rawChapterSections)) {
        throw new Error('Books database must provide a "chapter_sections" array.');
    }

    const ids = createUniqueTracker();
    const sectionKeys = createUniqueTracker();

    return rawChapterSections.map((record, index) => {
        const label = `Chapter section at index ${index}`;
        requireObject(record, label);
        requireFields(record, CONTENT_TABLE_SCHEMAS.chapter_sections.requiredFields, label);

        const chapterId = requireIdentifier(record, "chapter_id", label);
        if (!chaptersById[chapterId]) {
            throw new Error(`${label} references unknown chapter_id "${chapterId}".`);
        }

        const verseStart = normalizeOptionalPositiveInteger(record, "verse_start", label);
        const verseEnd = normalizeOptionalPositiveInteger(record, "verse_end", label);
        if ((verseStart == null) !== (verseEnd == null)) {
            throw new Error(`${label} must provide both verse_start and verse_end together.`);
        }
        if (verseStart != null && verseStart > verseEnd) {
            throw new Error(`${label} must use verse_start before verse_end.`);
        }

        const normalized = {
            id: requireIdentifier(record, "id", label),
            chapter_id: chapterId,
            section_number: requirePositiveInteger(record, "section_number", label),
            slug: normalizeChapterSectionSlug(record.slug),
            title: requireString(record, "title", label),
            summary: normalizeOptionalString(record, "summary"),
            ui_order: requirePositiveInteger(record, "ui_order", label),
            card_variant: normalizeOptionalString(record, "card_variant"),
            accent_key: normalizeOptionalString(record, "accent_key"),
            verse_start: verseStart,
            verse_end: verseEnd,
        };

        assertUnique(ids, normalized.id, "chapter section id");
        assertUnique(sectionKeys, `${normalized.chapter_id}:${normalized.section_number}`, "chapter section number key");
        return normalized;
    });
}

function normalizeVerses(rawVerses, chaptersById) {
    if (!Array.isArray(rawVerses)) {
        throw new Error('Books database must provide a "verses" array.');
    }

    const ids = createUniqueTracker();
    const numberKeys = createUniqueTracker();

    return rawVerses.map((record, index) => {
        const label = `Verse at index ${index}`;
        requireObject(record, label);
        requireFields(record, CONTENT_TABLE_SCHEMAS.verses.requiredFields, label);

        const chapterId = requireIdentifier(record, "chapter_id", label);
        if (!chaptersById[chapterId]) {
            throw new Error(`${label} references unknown chapter_id "${chapterId}".`);
        }

        const normalized = {
            id: requireIdentifier(record, "id", label),
            chapter_id: chapterId,
            verse_number: requirePositiveInteger(record, "verse_number", label),
            slug: normalizeVerseSlug(record.slug),
            sanskrit_text: normalizeOptionalString(record, "sanskrit_text"),
            transliteration_text: normalizeOptionalString(record, "transliteration_text"),
            english_text: normalizeOptionalString(record, "english_text"),
            hindi_text: normalizeOptionalString(record, "hindi_text"),
            audio_url: normalizeOptionalMediaPath(record, "audio_url", label),
            is_featured: normalizeOptionalBoolean(record, "is_featured", label),
        };

        assertUnique(ids, normalized.id, "verse id");
        assertUnique(numberKeys, `${normalized.chapter_id}:${normalized.verse_number}`, "verse number key");
        return normalized;
    });
}

function validateChapterSectionCoverage(chapterSections, chapterSectionVerses, chaptersById, versesById) {
    const sectionsByChapterId = buildGroupedLookup(chapterSections, "chapter_id");
    const versesByChapterId = buildGroupedLookup(Object.values(versesById), "chapter_id");

    Object.keys(sectionsByChapterId).forEach((chapterId) => {
        const sections = sortByUiOrder(sectionsByChapterId[chapterId]);
        const canonicalVerseNumbers = (versesByChapterId[chapterId] || [])
            .slice()
            .sort((a, b) => a.verse_number - b.verse_number)
            .map((verse) => verse.verse_number);

        if (!canonicalVerseNumbers.length) {
            return;
        }

        let lastVerseNumber = 0;

        sections.forEach((section) => {
            const mappedVerses = (versesByChapterId[chapterId] || [])
                .slice()
                .sort((a, b) => a.verse_number - b.verse_number)
                .filter((verse) => {
                    if (section.verse_start == null || section.verse_end == null) {
                        return false;
                    }

                    return verse.verse_number >= section.verse_start && verse.verse_number <= section.verse_end;
                })
                .map((verse) => verse.verse_number);

            if (!mappedVerses.length) {
                return;
            }

            mappedVerses.forEach((verseNumber, index) => {
                if (index > 0 && verseNumber <= mappedVerses[index - 1]) {
                    throw new Error(`Chapter section "${section.id}" must map verses in increasing order.`);
                }
                if (index > 0 && verseNumber !== mappedVerses[index - 1] + 1) {
                    throw new Error(`Chapter section "${section.id}" must map a continuous verse sequence.`);
                }
            });

            lastVerseNumber = mappedVerses[mappedVerses.length - 1];
        });

        if (lastVerseNumber > canonicalVerseNumbers[canonicalVerseNumbers.length - 1]) {
            const chapter = chaptersById[chapterId];
            throw new Error(`Chapter section mappings exceed the canonical verse count for chapter "${chapter?.title || chapterId}".`);
        }
    });
}

function validateImpliedHierarchyPathUniqueness(bookSectionsById, chaptersById, chapterSections, versesById) {
    const chapterSectionsByChapterId = buildGroupedLookup(chapterSections, "chapter_id");
    const pathKeys = createUniqueTracker();

    Object.values(bookSectionsById).forEach((bookSection) => {
        Object.values(chaptersById)
            .filter((chapter) => {
                if (chapter.source_book_id !== bookSection.source_book_id) return false;
                if (bookSection.chapter_start == null || bookSection.chapter_end == null) return false;
                return chapter.chapter_number >= bookSection.chapter_start && chapter.chapter_number <= bookSection.chapter_end;
            })
            .forEach((chapter) => {
                const sections = chapterSectionsByChapterId[chapter.id] || [];
                sections.forEach((section) => {
                    Object.values(versesById)
                        .filter((verse) => {
                            if (verse.chapter_id !== section.chapter_id) return false;
                            if (section.verse_start == null || section.verse_end == null) return false;
                            return verse.verse_number >= section.verse_start && verse.verse_number <= section.verse_end;
                        })
                        .forEach((verse) => {
                const pathKey = [
                    bookSection.book_id,
                    bookSection.id,
                    chapter.id,
                    section.id,
                    verse.id,
                ].join(":");

                assertUnique(pathKeys, pathKey, "implied hierarchy path");
            });
                });
            });
    });
}

function createIndexes(database) {
    const booksById = buildRecordLookup(database.books, "id");
    const booksBySlug = buildRecordLookup(database.books, "slug");
    const bookSectionsById = buildRecordLookup(database.bookSections, "id");
    const bookSectionsByBookId = buildGroupedLookup(database.bookSections, "book_id");
    const chaptersById = buildRecordLookup(database.chapters, "id");
    const chaptersBySourceBookId = buildGroupedLookup(database.chapters, "source_book_id");
    const chapterBySourceBookAndSlug = deepFreeze(
        Object.fromEntries(
            database.chapters.map((chapter) => [
                `${chapter.source_book_id}:${chapter.slug}`,
                chapter,
            ])
        )
    );
    const chaptersBySourceAndNumber = deepFreeze(
        Object.fromEntries(
            database.chapters.map((chapter) => [
                `${chapter.source_book_id}:${chapter.chapter_number}`,
                chapter,
            ])
        )
    );
    const chapterSectionsById = buildRecordLookup(database.chapterSections, "id");
    const chapterSectionsByChapterId = buildGroupedLookup(database.chapterSections, "chapter_id");
    const versesById = buildRecordLookup(database.verses, "id");
    const versesByChapterId = buildGroupedLookup(database.verses, "chapter_id");
    const versesByChapterAndNumber = deepFreeze(
        Object.fromEntries(
            database.verses.map((verse) => [
                `${verse.chapter_id}:${verse.verse_number}`,
                verse,
            ])
        )
    );
    return deepFreeze({
        booksById,
        booksBySlug,
        bookSectionsById,
        bookSectionsByBookId,
        chaptersById,
        chaptersBySourceBookId,
        chapterBySourceBookAndSlug,
        chaptersBySourceAndNumber,
        chapterSectionsById,
        chapterSectionsByChapterId,
        versesById,
        versesByChapterId,
        versesByChapterAndNumber,
    });
}

export function createBooksDatabase(rawTables) {
    requireObject(rawTables, "Books database");

    const books = normalizeBooks(rawTables.books);
    const booksById = buildRecordLookup(books, "id");

    const bookSections = normalizeBookSections(rawTables.book_sections, booksById);
    const bookSectionsById = buildRecordLookup(bookSections, "id");

    const chapters = normalizeChapters(rawTables.chapters, booksById);
    const chaptersById = buildRecordLookup(chapters, "id");

    const chapterSections = normalizeChapterSections(rawTables.chapter_sections, chaptersById);
    const verses = normalizeVerses(rawTables.verses, chaptersById);
    const versesById = buildRecordLookup(verses, "id");

    validateChapterSectionCoverage(chapterSections, [], chaptersById, versesById);
    validateImpliedHierarchyPathUniqueness(bookSectionsById, chaptersById, chapterSections, versesById);

    const database = {
        books: deepFreeze(books),
        bookSections: deepFreeze(bookSections),
        chapters: deepFreeze(chapters),
        chapterSections: deepFreeze(chapterSections),
        verses: deepFreeze(verses),
    };

    database.indexes = createIndexes(database);
    return deepFreeze(database);
}
