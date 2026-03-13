import { CONTENT_FIELD_CONFIGS } from "../content/books/schema.js";
import { getEntityEditPermissionKey } from "../permissions/access.js";

function augmentFields(fields = [], overrides = {}) {
    return Object.freeze(
        fields.map((field) => Object.freeze({
            ...field,
            ...(overrides[field.name] || {}),
        }))
    );
}

function getNumericValue(record, fieldName) {
    const value = Number.parseInt(record?.[fieldName], 10);
    return Number.isInteger(value) && value > 0 ? value : null;
}

function getNextNumericValue(records = [], fieldName, fallback = 1) {
    return records.reduce((maxValue, record) => {
        const value = getNumericValue(record, fieldName);
        return value && value > maxValue ? value : maxValue;
    }, Math.max(0, fallback - 1)) + 1;
}

function getNextAvailablePositiveInteger(usedValues, startValue = 1) {
    let candidate = Math.max(1, Number.parseInt(startValue, 10) || 1);

    while (usedValues.has(candidate)) {
        candidate += 1;
    }

    return candidate;
}

function getSelectedRecord(context, entity) {
    return context?.selection?.entity === entity ? context.selection.record : null;
}

function getCurrentBookId(context) {
    return context?.currentBook?.id
        || getSelectedRecord(context, "books")?.id
        || getSelectedRecord(context, "book_sections")?.book_id
        || "";
}

function getCurrentSourceBookId(context) {
    return context?.currentChapter?.source_book_id
        || getSelectedRecord(context, "chapters")?.source_book_id
        || getSelectedRecord(context, "book_sections")?.source_book_id
        || (context?.currentBook?.book_type === "source" ? context.currentBook.id : "")
        || "";
}

function getCurrentChapterId(context) {
    return context?.currentChapter?.id
        || getSelectedRecord(context, "chapters")?.id
        || getSelectedRecord(context, "chapter_sections")?.chapter_id
        || getSelectedRecord(context, "verses")?.chapter_id
        || "";
}

function getCurrentVerseNumber(context) {
    return context?.currentVerse?.verse_number
        || getSelectedRecord(context, "verses")?.verse_number
        || null;
}

function filterRecordsByField(records = [], fieldName, value) {
    if (!value) {
        return [];
    }

    return records.filter((record) => String(record?.[fieldName] ?? "") === String(value));
}

const BOOK_FIELDS = augmentFields(CONTENT_FIELD_CONFIGS.books, {
    is_published: {
        permissionKey: "content.publish",
        description: "Requires publish permission.",
    },
});

const BOOK_SECTION_FIELDS = augmentFields(CONTENT_FIELD_CONFIGS.book_sections, {
    source_book_id: {
        optionFilter(record) {
            return record?.book_type === "source";
        },
    },
});

const CHAPTER_FIELDS = augmentFields(CONTENT_FIELD_CONFIGS.chapters, {
    source_book_id: {
        optionFilter(record) {
            return record?.book_type === "source";
        },
    },
});

const CHAPTER_SECTION_FIELDS = augmentFields(CONTENT_FIELD_CONFIGS.chapter_sections, {
    chapter_id: {
        optionFilter(record, context) {
            const sourceBookId = getCurrentSourceBookId(context);
            return sourceBookId ? record?.source_book_id === sourceBookId : true;
        },
    },
});

const VERSE_FIELDS = augmentFields(CONTENT_FIELD_CONFIGS.verses, {
    chapter_id: {
        optionFilter(record, context) {
            const sourceBookId = getCurrentSourceBookId(context);
            return sourceBookId ? record?.source_book_id === sourceBookId : true;
        },
    },
});

function createEntityConfig(config) {
    return Object.freeze({
        createPermissionKey: "content.create",
        deletePermissionKey: "content.delete",
        ...config,
    });
}

export const CONTENT_ADMIN_ENTITY_CONFIGS = Object.freeze({
    books: createEntityConfig({
        entity: "books",
        label: "Book",
        pluralLabel: "Books",
        createActionLabel: "New Book",
        editActionLabel: "Edit Book",
        deleteActionLabel: "Delete Book",
        endpoint: "/api/books",
        collectionKey: "books",
        fields: BOOK_FIELDS,
        permissionKey: getEntityEditPermissionKey("books"),
        sortable: true,
        orderField: "ui_order",
        getRecordLabel(record) {
            return record?.short_title || record?.title || record?.slug || "Book";
        },
        getCreateDefaults(context, helpers) {
            return {
                book_type: "source",
                is_published: false,
                ui_order: getNextNumericValue(helpers.listRecords("books"), "ui_order"),
            };
        },
    }),
    book_sections: createEntityConfig({
        entity: "book_sections",
        label: "Book Section",
        pluralLabel: "Book Sections",
        createActionLabel: "New Book Section",
        editActionLabel: "Edit Book Section",
        deleteActionLabel: "Delete Book Section",
        endpoint: "/api/book-sections",
        collectionKey: "bookSections",
        fields: BOOK_SECTION_FIELDS,
        permissionKey: getEntityEditPermissionKey("book_sections"),
        sortable: true,
        orderField: "ui_order",
        getRecordLabel(record) {
            return record?.title || "Book Section";
        },
        getCreateDefaults(context, helpers) {
            const bookId = getCurrentBookId(context);
            const sourceBookId = getSelectedRecord(context, "book_sections")?.source_book_id || getCurrentSourceBookId(context);
            const scopedRecords = filterRecordsByField(helpers.listRecords("book_sections"), "book_id", bookId);
            const nextChapterStart = scopedRecords.reduce((maxValue, record) => {
                const chapterEnd = getNumericValue(record, "chapter_end");
                return chapterEnd && chapterEnd > maxValue ? chapterEnd : maxValue;
            }, 0) + 1;

            return {
                book_id: bookId,
                source_book_id: sourceBookId,
                ui_order: getNextNumericValue(scopedRecords, "ui_order"),
                chapter_start: Math.max(1, nextChapterStart),
                chapter_end: Math.max(1, nextChapterStart),
            };
        },
    }),
    chapters: createEntityConfig({
        entity: "chapters",
        label: "Chapter",
        pluralLabel: "Chapters",
        createActionLabel: "New Chapter",
        editActionLabel: "Edit Chapter",
        deleteActionLabel: "Delete Chapter",
        endpoint: "/api/chapters",
        collectionKey: "chapters",
        fields: CHAPTER_FIELDS,
        permissionKey: getEntityEditPermissionKey("chapters"),
        sortable: false,
        getRecordLabel(record) {
            return record?.chapter_number ? `Chapter ${record.chapter_number}` : record?.title || "Chapter";
        },
        getCreateDefaults(context, helpers) {
            const sourceBookId = getCurrentSourceBookId(context);
            const scopedRecords = filterRecordsByField(helpers.listRecords("chapters"), "source_book_id", sourceBookId);
            const nextChapterNumber = getNextNumericValue(scopedRecords, "chapter_number");

            return {
                source_book_id: sourceBookId,
                chapter_number: nextChapterNumber,
                ui_order: nextChapterNumber,
            };
        },
    }),
    chapter_sections: createEntityConfig({
        entity: "chapter_sections",
        label: "Chapter Section",
        pluralLabel: "Chapter Sections",
        createActionLabel: "New Chapter Section",
        editActionLabel: "Edit Chapter Section",
        deleteActionLabel: "Delete Chapter Section",
        endpoint: "/api/chapter-sections",
        collectionKey: "chapterSections",
        fields: CHAPTER_SECTION_FIELDS,
        permissionKey: getEntityEditPermissionKey("chapter_sections"),
        sortable: true,
        orderField: "ui_order",
        getRecordLabel(record) {
            return record?.section_number ? `Section ${record.section_number}` : record?.title || "Chapter Section";
        },
        getCreateDefaults(context, helpers) {
            const chapterId = getCurrentChapterId(context);
            const scopedRecords = filterRecordsByField(helpers.listRecords("chapter_sections"), "chapter_id", chapterId);
            const nextSectionNumber = getNextNumericValue(scopedRecords, "section_number");
            const nextVerseStart = getCurrentVerseNumber(context)
                || scopedRecords.reduce((maxValue, record) => {
                    const verseEnd = getNumericValue(record, "verse_end");
                    return verseEnd && verseEnd > maxValue ? verseEnd : maxValue;
                }, 0) + 1;

            return {
                chapter_id: chapterId,
                section_number: nextSectionNumber,
                ui_order: getNextNumericValue(scopedRecords, "ui_order", nextSectionNumber),
                verse_start: Math.max(1, nextVerseStart),
                verse_end: Math.max(1, nextVerseStart),
            };
        },
    }),
    verses: createEntityConfig({
        entity: "verses",
        label: "Verse",
        pluralLabel: "Verses",
        createActionLabel: "New Verse",
        editActionLabel: "Edit Verse",
        deleteActionLabel: "Delete Verse",
        endpoint: "/api/verses",
        collectionKey: "verses",
        fields: VERSE_FIELDS,
        permissionKey: getEntityEditPermissionKey("verses"),
        sortable: false,
        getRecordLabel(record) {
            return record?.verse_number ? `Verse ${record.verse_number}` : "Verse";
        },
        getCreateDefaults(context, helpers) {
            const chapterId = getCurrentChapterId(context);
            const scopedRecords = filterRecordsByField(helpers.listRecords("verses"), "chapter_id", chapterId);
            const usedNumbers = new Set(
                scopedRecords
                    .map((record) => getNumericValue(record, "verse_number"))
                    .filter(Boolean)
            );
            const preferredStart = getCurrentVerseNumber(context)
                ? getCurrentVerseNumber(context) + 1
                : getNextNumericValue(scopedRecords, "verse_number");

            return {
                chapter_id: chapterId,
                verse_number: getNextAvailablePositiveInteger(usedNumbers, preferredStart),
                is_featured: false,
            };
        },
    }),
});

export function getContentEntityConfig(entity) {
    return CONTENT_ADMIN_ENTITY_CONFIGS[entity] || null;
}

export function getContentEntityFields(entity, scope = "default") {
    const config = getContentEntityConfig(entity);
    if (!config) {
        return [];
    }

    const scopedFieldNames = config.fieldScopes?.[scope];
    if (!Array.isArray(scopedFieldNames) || !scopedFieldNames.length) {
        return config.fields;
    }

    const allowedFieldNames = new Set(scopedFieldNames);
    return config.fields.filter((field) => allowedFieldNames.has(field.name));
}
