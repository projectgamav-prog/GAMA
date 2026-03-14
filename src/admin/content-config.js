import { ALL_CONTENT_FIELD_CONFIGS } from "../content/schema/index.js";
import { getEntityEditPermissionKey } from "../permissions/access.js";
import { getAdminEntityApiPath } from "./entity-api-paths.js";

function augmentFields(fields = [], overrides = {}) {
    return Object.freeze(
        fields.map((field) => Object.freeze({
            ...field,
            ...(overrides[field.name] || {}),
        }))
    );
}

function excludeFieldNames(fields = [], excludedNames = []) {
    const excluded = new Set(excludedNames);
    return Object.freeze(fields.filter((field) => !excluded.has(field.name)));
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

const BOOK_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.books, {
    is_published: {
        permissionKey: "content.publish",
        description: "Requires publish permission.",
    },
});
const BOOK_DETAILS_FIELDS = excludeFieldNames(BOOK_FIELDS, ["insight_title", "insight_media", "insight_caption"]);

const BOOK_SECTION_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.book_sections, {
    source_book_id: {
        optionFilter(record) {
            return record?.book_type === "source";
        },
    },
});
const BOOK_SECTION_DETAILS_FIELDS = excludeFieldNames(BOOK_SECTION_FIELDS, ["insight_title", "insight_media", "insight_caption"]);

const CHAPTER_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.chapters, {
    source_book_id: {
        optionFilter(record) {
            return record?.book_type === "source";
        },
    },
});
const CHAPTER_DETAILS_FIELDS = excludeFieldNames(CHAPTER_FIELDS, ["insight_title", "insight_media", "insight_caption"]);

const CHAPTER_SECTION_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.chapter_sections, {
    chapter_id: {
        optionFilter(record, context) {
            const sourceBookId = getCurrentSourceBookId(context);
            return sourceBookId ? record?.source_book_id === sourceBookId : true;
        },
    },
});
const CHAPTER_SECTION_DETAILS_FIELDS = excludeFieldNames(CHAPTER_SECTION_FIELDS, ["insight_title", "insight_media", "insight_caption"]);

const VERSE_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.verses, {
    chapter_id: {
        optionFilter(record, context) {
            const sourceBookId = getCurrentSourceBookId(context);
            return sourceBookId ? record?.source_book_id === sourceBookId : true;
        },
    },
});
const VERSE_DETAILS_FIELDS = excludeFieldNames(VERSE_FIELDS, ["insight_title", "insight_media", "insight_caption"]);

const CHARACTER_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.characters, {
    is_published: {
        permissionKey: "content.publish",
        description: "Requires publish permission.",
    },
});

const CONTENT_BLOCK_INSIGHT_MEDIA_FIELDS = Object.freeze([
    Object.freeze({ name: "content_title", label: "Insight Title", type: "text" }),
    Object.freeze({
        name: "media_asset_id",
        label: "Insight Media Asset",
        type: "select-from-state",
        source: "media_assets",
        optionLabel(option) {
            return option?.title ? `${option.title} (${option.src})` : String(option?.src || option?.id || "");
        },
        optionValue: "id",
    }),
    Object.freeze({ name: "content_caption", label: "Insight Caption", type: "textarea" }),
]);

const CONTENT_BLOCK_INSIGHT_TEXT_FIELDS = Object.freeze([
    Object.freeze({ name: "content_title", label: "Insight Title", type: "text" }),
    Object.freeze({ name: "content_body", label: "Insight Body", type: "textarea" }),
]);

const MEDIA_ASSET_INSIGHT_FIELDS = Object.freeze([
    Object.freeze({
        name: "asset_type",
        label: "Media Type",
        type: "select",
        required: true,
        options: Object.freeze([
            { value: "image", label: "image" },
            { value: "video", label: "video" },
            { value: "audio", label: "audio" },
            { value: "embed", label: "embed" },
            { value: "document", label: "document" },
        ]),
    }),
    Object.freeze({ name: "title", label: "Media Title", type: "text" }),
    Object.freeze({ name: "src", label: "Media URL", type: "text", required: true }),
    Object.freeze({ name: "provider", label: "Provider", type: "text" }),
    Object.freeze({ name: "alt_text", label: "Alt Text", type: "text" }),
    Object.freeze({ name: "caption", label: "Caption", type: "textarea" }),
]);

function cloneObject(value, fallback = {}) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? { ...value }
        : { ...fallback };
}

function getContentBlockLabel(record) {
    const ownerEntity = String(record?.owner_entity || "content").replaceAll("_", " ");
    const ownerId = record?.owner_id || "record";
    const region = record?.region || "body";
    return `${ownerEntity} ${ownerId} ${region} block`;
}

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
        endpoint: getAdminEntityApiPath("books"),
        collectionKey: "books",
        fields: BOOK_FIELDS,
        fieldScopes: Object.freeze({
            details: Object.freeze(BOOK_DETAILS_FIELDS.map((field) => field.name)),
        }),
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
        endpoint: getAdminEntityApiPath("book_sections"),
        collectionKey: "bookSections",
        fields: BOOK_SECTION_FIELDS,
        fieldScopes: Object.freeze({
            details: Object.freeze(BOOK_SECTION_DETAILS_FIELDS.map((field) => field.name)),
        }),
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
        endpoint: getAdminEntityApiPath("chapters"),
        collectionKey: "chapters",
        fields: CHAPTER_FIELDS,
        fieldScopes: Object.freeze({
            details: Object.freeze(CHAPTER_DETAILS_FIELDS.map((field) => field.name)),
        }),
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
        endpoint: getAdminEntityApiPath("chapter_sections"),
        collectionKey: "chapterSections",
        fields: CHAPTER_SECTION_FIELDS,
        fieldScopes: Object.freeze({
            details: Object.freeze(CHAPTER_SECTION_DETAILS_FIELDS.map((field) => field.name)),
        }),
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
        endpoint: getAdminEntityApiPath("verses"),
        collectionKey: "verses",
        fields: VERSE_FIELDS,
        fieldScopes: Object.freeze({
            details: Object.freeze(VERSE_DETAILS_FIELDS.map((field) => field.name)),
        }),
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
    characters: createEntityConfig({
        entity: "characters",
        label: "Character",
        pluralLabel: "Characters",
        createActionLabel: "New Character",
        editActionLabel: "Edit Character",
        deleteActionLabel: "Delete Character",
        endpoint: getAdminEntityApiPath("characters"),
        collectionKey: "characters",
        fields: CHARACTER_FIELDS,
        permissionKey: getEntityEditPermissionKey("characters"),
        sortable: true,
        orderField: "ui_order",
        getRecordLabel(record) {
            return record?.name || record?.slug || "Character";
        },
        getCreateDefaults(_context, helpers) {
            return {
                detail_available: false,
                is_published: false,
                ui_order: getNextNumericValue(helpers.listRecords("characters"), "ui_order"),
            };
        },
    }),
    content_blocks: createEntityConfig({
        entity: "content_blocks",
        label: "Insight Block",
        pluralLabel: "Insight Blocks",
        editActionLabel: "Edit Insight Block",
        endpoint: getAdminEntityApiPath("content_blocks"),
        collectionKey: "contentBlocks",
        fields: Object.freeze([
            ...CONTENT_BLOCK_INSIGHT_MEDIA_FIELDS,
            ...CONTENT_BLOCK_INSIGHT_TEXT_FIELDS.filter((field) => field.name === "content_body"),
        ]),
        fieldScopes: Object.freeze({
            insight_media: Object.freeze(CONTENT_BLOCK_INSIGHT_MEDIA_FIELDS.map((field) => field.name)),
            insight_rich_text: Object.freeze(CONTENT_BLOCK_INSIGHT_TEXT_FIELDS.map((field) => field.name)),
        }),
        permissionKey: "content.create",
        getRecordLabel(record) {
            return getContentBlockLabel(record);
        },
        getFormValues(record) {
            return {
                content_title: record?.data?.title || "",
                content_caption: record?.data?.caption || "",
                content_body: record?.data?.body || "",
                media_asset_id: record?.data?.media_asset_id || "",
            };
        },
        serializePayload(values, { record, fieldScope }) {
            const nextRecord = {
                ...record,
                data: cloneObject(record?.data),
            };

            if (fieldScope === "insight_media") {
                nextRecord.data.title = values.content_title || null;
                nextRecord.data.caption = values.content_caption || null;
                nextRecord.data.media_asset_id = values.media_asset_id || null;
            } else {
                nextRecord.data.title = values.content_title || null;
                nextRecord.data.body = values.content_body || "";
            }

            return nextRecord;
        },
    }),
    media_assets: createEntityConfig({
        entity: "media_assets",
        label: "Media Asset",
        pluralLabel: "Media Assets",
        editActionLabel: "Edit Media Asset",
        endpoint: getAdminEntityApiPath("media_assets"),
        collectionKey: "mediaAssets",
        fields: MEDIA_ASSET_INSIGHT_FIELDS,
        fieldScopes: Object.freeze({
            insight_media_asset: Object.freeze(MEDIA_ASSET_INSIGHT_FIELDS.map((field) => field.name)),
        }),
        permissionKey: "media.upload",
        getRecordLabel(record) {
            return record?.title || record?.src || "Media Asset";
        },
        getFormValues(record) {
            return {
                asset_type: record?.asset_type || "image",
                title: record?.title || "",
                src: record?.src || "",
                provider: record?.provider || "",
                alt_text: record?.alt_text || "",
                caption: record?.caption || "",
            };
        },
        serializePayload(values, { record }) {
            return {
                ...record,
                asset_type: values.asset_type || record.asset_type,
                title: values.title || null,
                src: values.src || record.src,
                provider: values.provider || null,
                alt_text: values.alt_text || null,
                caption: values.caption || null,
                metadata: cloneObject(record?.metadata),
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
