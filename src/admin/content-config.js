import { ALL_CONTENT_FIELD_CONFIGS } from "../content/schema/index.js";
import { getEntityEditPermissionKey } from "../permissions/access.js";
import { getAdminEntityApiPath } from "./entity-api-paths.js";
import { DEFAULT_INSIGHT_MEDIA } from "../content/renderers/renderer-utils.js";

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

const BOOK_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.books, {
    is_published: {
        permissionKey: "content.publish",
        description: "Requires publish permission.",
    },
});
const BOOK_DETAILS_FIELDS = BOOK_FIELDS;

const BOOK_SECTION_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.book_sections, {
    source_book_id: {
        optionFilter(record) {
            return record?.book_type === "source";
        },
    },
});
const BOOK_SECTION_DETAILS_FIELDS = BOOK_SECTION_FIELDS;

const CHAPTER_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.chapters, {
    source_book_id: {
        optionFilter(record) {
            return record?.book_type === "source";
        },
    },
});
const CHAPTER_DETAILS_FIELDS = CHAPTER_FIELDS;

const CHAPTER_SECTION_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.chapter_sections, {
    chapter_id: {
        optionFilter(record, context) {
            const sourceBookId = getCurrentSourceBookId(context);
            return sourceBookId ? record?.source_book_id === sourceBookId : true;
        },
    },
});
const CHAPTER_SECTION_DETAILS_FIELDS = CHAPTER_SECTION_FIELDS;

const VERSE_FIELDS = augmentFields(ALL_CONTENT_FIELD_CONFIGS.verses, {
    chapter_id: {
        optionFilter(record, context) {
            const sourceBookId = getCurrentSourceBookId(context);
            return sourceBookId ? record?.source_book_id === sourceBookId : true;
        },
    },
});
const VERSE_DETAILS_FIELDS = VERSE_FIELDS;

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

const INSIGHT_BLOCK_FIELDS = Object.freeze([
    Object.freeze({
        name: "insight_block_type",
        label: "Insight Type",
        type: "select",
        required: true,
        options: Object.freeze([
            Object.freeze({ value: "rich_text", label: "rich_text" }),
            Object.freeze({ value: "media", label: "media" }),
        ]),
        description: "Switch between text-only and media-backed insight content for this record.",
    }),
    Object.freeze({ name: "content_title", label: "Insight Title", type: "text" }),
    Object.freeze({
        name: "content_body",
        label: "Insight Body",
        type: "textarea",
        description: "Used when the insight type is rich_text.",
    }),
    Object.freeze({
        name: "media_asset_id",
        label: "Insight Media Asset",
        type: "select-from-state",
        source: "media_assets",
        optionLabel(option) {
            return option?.title ? `${option.title} (${option.src})` : String(option?.src || option?.id || "");
        },
        optionValue: "id",
        description: "Used when the insight type is media. Leave blank to auto-create a reusable default asset.",
    }),
    Object.freeze({
        name: "content_caption",
        label: "Insight Caption",
        type: "textarea",
        description: "Used when the insight type is media.",
    }),
]);

const VERSE_INSIGHT_FIELDS = Object.freeze([
    Object.freeze({ name: "content_label", label: "Option Label", type: "text", required: true }),
    Object.freeze({ name: "content_title", label: "Insight Title", type: "text", required: true }),
    Object.freeze({ name: "content_body", label: "Insight Body", type: "textarea", required: true }),
    Object.freeze({ name: "content_caption", label: "Insight Caption", type: "textarea" }),
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

function createOwnerScopedMediaSrc(src, ownerId) {
    const normalizedSrc = String(src || DEFAULT_INSIGHT_MEDIA).trim() || DEFAULT_INSIGHT_MEDIA;
    if (!ownerId || /[?&]cms_owner=/.test(normalizedSrc)) {
        return normalizedSrc;
    }

    return `${normalizedSrc}${normalizedSrc.includes("?") ? "&" : "?"}cms_owner=${encodeURIComponent(ownerId)}`;
}

function inferMediaProvider(src, fallbackProvider = "") {
    const normalizedSrc = String(src || "").trim().toLowerCase();
    if (normalizedSrc.includes("youtube.com") || normalizedSrc.includes("youtu.be")) {
        return "youtube";
    }

    return fallbackProvider || "local";
}

function getDefaultInsightMediaAsset(helpers) {
    const assets = helpers.listRecords("media_assets");

    return assets.find((asset) => asset?.id === "media-asset-insight-default-image")
        || assets.find((asset) => asset?.metadata?.source === "legacy-insight-media" && !asset?.metadata?.owner_id)
        || assets.find((asset) => String(asset?.src || "").trim() === DEFAULT_INSIGHT_MEDIA)
        || null;
}

function resolveInsightTarget(context) {
    const requestedOwnerEntity = String(context?.requestedOwnerEntity || "").trim();
    const requestedOwnerRecord = context?.requestedOwnerRecord || null;

    if (requestedOwnerEntity && requestedOwnerRecord?.id) {
        return {
            ownerEntity: requestedOwnerEntity,
            ownerRecord: requestedOwnerRecord,
        };
    }

    const selectedEntity = String(context?.selection?.entity || "").trim();
    const selectedRecord = context?.selection?.record || null;
    if (selectedEntity && selectedRecord?.id) {
        return {
            ownerEntity: selectedEntity,
            ownerRecord: selectedRecord,
        };
    }

    if (context?.currentVerse?.id) {
        return { ownerEntity: "verses", ownerRecord: context.currentVerse };
    }

    if (context?.currentChapter?.id) {
        return { ownerEntity: "chapters", ownerRecord: context.currentChapter };
    }

    if (context?.currentBook?.id) {
        return { ownerEntity: "books", ownerRecord: context.currentBook };
    }

    return null;
}

function getNextInsightBlockPosition(helpers, ownerEntity, ownerId) {
    const scopedBlocks = helpers
        .listRecords("content_blocks")
        .filter((block) =>
            String(block?.owner_entity || "") === String(ownerEntity || "")
            && String(block?.owner_id || "") === String(ownerId || "")
            && String(block?.region || "") === "insight"
        );

    return getNextNumericValue(scopedBlocks, "position");
}

async function ensureBookInsightMediaAsset({
    values,
    record,
    helpers,
    api,
}) {
    const selectedAssetId = String(values.media_asset_id || record?.data?.media_asset_id || "").trim();
    if (selectedAssetId) {
        return selectedAssetId;
    }

    const desiredAssetId = `media-asset-${record?.owner_id || "book"}-insight-media`;
    const existingOwnerAsset = helpers
        .listRecords("media_assets")
        .find((asset) => asset?.id === desiredAssetId)
        || null;
    if (existingOwnerAsset?.id) {
        return existingOwnerAsset.id;
    }

    const sharedDefaultAsset = getDefaultInsightMediaAsset(helpers);
    const seededSrc = createOwnerScopedMediaSrc(sharedDefaultAsset?.src || DEFAULT_INSIGHT_MEDIA, record?.owner_id || "");
    const seededAssetType = sharedDefaultAsset?.asset_type || "image";
    const seededProvider = inferMediaProvider(seededSrc, sharedDefaultAsset?.provider || "");

    const createdAsset = await api.createRecord("media_assets", {
        id: desiredAssetId,
        asset_type: seededAssetType,
        title: `${values.content_title || record?.owner_id || "book"} Insight Media`,
        src: seededSrc,
        provider: seededProvider,
        alt_text: `${values.content_title || "Insight"} media`,
        caption: values.content_caption || null,
        metadata: {
            source: "admin-generated-book-insight-media",
            owner_entity: record?.owner_entity || "books",
            owner_id: record?.owner_id || "",
            seeded_from_asset_id: sharedDefaultAsset?.id || null,
        },
    });

    return createdAsset?.id || "";
}

function getContentBlockLabel(record) {
    if (record?.block_type === "verse_insight") {
        const optionLabel = String(record?.data?.label || record?.data?.title || "").trim();
        if (optionLabel) {
            return `verse insight ${optionLabel}`;
        }
    }

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
        label: "Content Block",
        pluralLabel: "Content Blocks",
        createActionLabel: "Create Insight Block",
        editActionLabel: "Edit Content Block",
        endpoint: getAdminEntityApiPath("content_blocks"),
        collectionKey: "contentBlocks",
        fields: Object.freeze([
            ...CONTENT_BLOCK_INSIGHT_MEDIA_FIELDS,
            ...CONTENT_BLOCK_INSIGHT_TEXT_FIELDS.filter((field) => field.name === "content_body"),
        ]),
        fieldScopes: Object.freeze({
            insight_block: Object.freeze(INSIGHT_BLOCK_FIELDS.map((field) => field.name)),
            verse_insight: Object.freeze(VERSE_INSIGHT_FIELDS.map((field) => field.name)),
        }),
        permissionKey: "content.create",
        getRecordLabel(record) {
            return getContentBlockLabel(record);
        },
        getCreateDefaults(context) {
            const target = resolveInsightTarget(context);
            if (!target?.ownerEntity || !target?.ownerRecord?.id) {
                throw new Error("Select a supported content record before creating an insight block.");
            }

            return {
                insight_block_type: "rich_text",
                content_label: "",
                content_title: "",
                content_caption: "",
                content_body: "",
                media_asset_id: "",
            };
        },
        getFormValues(record) {
            const normalizedInsightType = ["media", "image", "audio"].includes(record?.block_type)
                ? "media"
                : "rich_text";

            return {
                insight_block_type: normalizedInsightType,
                content_label: record?.data?.label || "",
                content_title: record?.data?.title || "",
                content_caption: record?.data?.caption || (normalizedInsightType === "rich_text" ? record?.data?.body || "" : ""),
                content_body: record?.data?.body || (normalizedInsightType === "media" ? record?.data?.caption || "" : ""),
                media_asset_id: record?.data?.media_asset_id || "",
            };
        },
        async serializePayload(values, { record, fieldScope, context, helpers, api }) {
            const target = resolveInsightTarget(context);
            const baseRecord = record
                ? {
                    ...record,
                    data: cloneObject(record?.data),
                }
                : {
                    owner_entity: target?.ownerEntity || "",
                    owner_id: target?.ownerRecord?.id || "",
                    region: "insight",
                    block_type: "rich_text",
                    position: getNextInsightBlockPosition(helpers, target?.ownerEntity, target?.ownerRecord?.id),
                    status: target?.ownerRecord?.is_published ? "published" : "draft",
                    visibility: "public",
                    is_published: Boolean(target?.ownerRecord?.is_published),
                    data: {},
                };

            const nextRecord = {
                ...baseRecord,
                data: cloneObject(baseRecord?.data),
            };

            if (fieldScope === "insight_block") {
                const nextInsightType = values.insight_block_type === "media" ? "media" : "rich_text";

                nextRecord.block_type = nextInsightType;

                if (nextInsightType === "media") {
                    const mediaAssetId = await ensureBookInsightMediaAsset({
                        values,
                        record: nextRecord,
                        helpers,
                        api,
                    });

                    nextRecord.data = {
                        title: values.content_title || null,
                        caption: values.content_caption || values.content_body || "",
                        media_asset_id: mediaAssetId,
                    };
                } else {
                    nextRecord.data = {
                        title: values.content_title || null,
                        body: values.content_body || values.content_caption || "",
                    };
                }

                return nextRecord;
            }

            if (fieldScope === "verse_insight") {
                nextRecord.block_type = "verse_insight";
                nextRecord.data = {
                    label: values.content_label || values.content_title || "Insight",
                    title: values.content_title || values.content_label || "Insight",
                    body: values.content_body || "",
                    caption: values.content_caption || null,
                    media_asset_id: values.media_asset_id || null,
                };
                return nextRecord;
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
