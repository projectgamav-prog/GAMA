import { deepFreeze } from "../../core/data/freeze.js";
import { buildGroupedLookup, buildRecordLookup } from "../../core/data/indexes.js";
import {
    MEDIA_PATH_PATTERN,
    assertUnique,
    createUniqueTracker,
    normalizeOptionalMediaPath,
    normalizeOptionalString,
    requireBoolean,
    requireFields,
    requireIdentifier,
    requireObject,
    requirePositiveInteger,
    requireString,
} from "../../core/data/validate.js";

export const CONTENT_BLOCK_OWNER_ENTITIES = Object.freeze([
    "books",
    "book_sections",
    "chapters",
    "chapter_sections",
    "verses",
    "characters",
]);

export const CONTENT_BLOCK_REGIONS = Object.freeze([
    "hero",
    "insight",
    "body",
    "sidebar",
    "footer",
]);

export const CONTENT_BLOCK_TYPES = Object.freeze([
    "hero",
    "rich_text",
    "video",
    "media",
    "image",
    "quote",
    "commentary",
    "audio",
    "related_entities",
    "cta",
    "gallery",
    "stat_grid",
    "verse_insight",
]);

export const CONTENT_BLOCK_STATUSES = Object.freeze([
    "draft",
    "published",
]);

export const CONTENT_BLOCK_VISIBILITIES = Object.freeze([
    "public",
    "hidden",
]);

export const MEDIA_ASSET_TYPES = Object.freeze([
    "image",
    "video",
    "audio",
    "embed",
    "document",
]);

function defineTableSchema(fields, requiredFields) {
    return Object.freeze({
        fields: Object.freeze(fields),
        requiredFields: Object.freeze(requiredFields),
    });
}

export const CMS_TABLE_SCHEMAS = Object.freeze({
    content_blocks: defineTableSchema(
        [
            "id",
            "owner_entity",
            "owner_id",
            "region",
            "block_type",
            "variant",
            "position",
            "status",
            "visibility",
            "is_published",
            "data",
            "created_at",
            "updated_at",
        ],
        [
            "id",
            "owner_entity",
            "owner_id",
            "region",
            "block_type",
            "position",
            "status",
            "visibility",
            "is_published",
            "data",
            "created_at",
            "updated_at",
        ]
    ),
    media_assets: defineTableSchema(
        [
            "id",
            "asset_type",
            "title",
            "src",
            "alt_text",
            "caption",
            "provider",
            "metadata",
            "created_at",
            "updated_at",
        ],
        [
            "id",
            "asset_type",
            "src",
            "created_at",
            "updated_at",
        ]
    ),
});

export const CMS_FIELD_CONFIGS = Object.freeze({
    content_blocks: Object.freeze([
        {
            name: "owner_entity",
            label: "Owner Entity",
            type: "select",
            required: true,
            options: Object.freeze(
                CONTENT_BLOCK_OWNER_ENTITIES.map((value) => ({
                    value,
                    label: value,
                }))
            ),
        },
        { name: "owner_id", label: "Owner ID", type: "text", required: true },
        {
            name: "region",
            label: "Region",
            type: "select",
            required: true,
            options: Object.freeze(
                CONTENT_BLOCK_REGIONS.map((value) => ({
                    value,
                    label: value,
                }))
            ),
        },
        {
            name: "block_type",
            label: "Block Type",
            type: "select",
            required: true,
            options: Object.freeze(
                CONTENT_BLOCK_TYPES.map((value) => ({
                    value,
                    label: value,
                }))
            ),
        },
        { name: "variant", label: "Variant", type: "text" },
        { name: "position", label: "Position", type: "number", min: 1, required: true },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: Object.freeze(
                CONTENT_BLOCK_STATUSES.map((value) => ({
                    value,
                    label: value,
                }))
            ),
        },
        {
            name: "visibility",
            label: "Visibility",
            type: "select",
            required: true,
            options: Object.freeze(
                CONTENT_BLOCK_VISIBILITIES.map((value) => ({
                    value,
                    label: value,
                }))
            ),
        },
        { name: "is_published", label: "Published", type: "checkbox" },
        { name: "data", label: "Block Data", type: "textarea", required: true },
    ]),
    media_assets: Object.freeze([
        {
            name: "asset_type",
            label: "Asset Type",
            type: "select",
            required: true,
            options: Object.freeze(
                MEDIA_ASSET_TYPES.map((value) => ({
                    value,
                    label: value,
                }))
            ),
        },
        { name: "title", label: "Title", type: "text" },
        { name: "src", label: "Source", type: "text", required: true },
        { name: "alt_text", label: "Alt Text", type: "text" },
        { name: "caption", label: "Caption", type: "textarea" },
        { name: "provider", label: "Provider", type: "text" },
        { name: "metadata", label: "Metadata JSON", type: "textarea" },
    ]),
});

function normalizeTimestamp(value, fieldName, label) {
    const normalized = String(value ?? "").trim();
    if (!normalized) {
        throw new Error(`${label} must provide "${fieldName}".`);
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`${label} must use a valid "${fieldName}" timestamp.`);
    }

    return parsed.toISOString();
}

function requireArray(value, fieldName, label) {
    if (!Array.isArray(value)) {
        throw new Error(`${label} must provide an array for "${fieldName}".`);
    }

    return value;
}

function normalizeObjectArray(value, fieldName, label) {
    return requireArray(value, fieldName, label).map((entry, index) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            throw new Error(`${label} has an invalid "${fieldName}" entry at index ${index}.`);
        }

        return deepFreeze({ ...entry });
    });
}

function normalizeStringArray(value, fieldName, label) {
    return Object.freeze(
        requireArray(value, fieldName, label).map((entry, index) => {
            const normalized = String(entry ?? "").trim();
            if (!normalized) {
                throw new Error(`${label} has an invalid "${fieldName}" entry at index ${index}.`);
            }
            return normalized;
        })
    );
}

function normalizeBlockEnum(record, fieldName, values, label) {
    const normalized = requireString(record, fieldName, label).toLowerCase();
    if (!values.includes(normalized)) {
        throw new Error(`${label} must use a supported "${fieldName}" value.`);
    }

    return normalized;
}

function normalizeOptionalEnumValue(value, fieldName, values, label) {
    if (value == null || value === "") {
        return null;
    }

    const normalized = String(value).trim().toLowerCase();
    if (!values.includes(normalized)) {
        throw new Error(`${label} must use a supported "${fieldName}" value.`);
    }

    return normalized;
}

function requireAtLeastOneMediaSource(label, fields = {}) {
    const hasSource = Object.values(fields).some((value) => String(value || "").trim());
    if (!hasSource) {
        throw new Error(`${label} must provide at least one media source.`);
    }
}

export function normalizeContentBlockData(blockType, data, label) {
    requireObject(data, `${label} data`);

    switch (blockType) {
        case "hero":
            return deepFreeze({
                eyebrow: normalizeOptionalString(data, "eyebrow"),
                title: requireString(data, "title", `${label} data`),
                subtitle: normalizeOptionalString(data, "subtitle"),
                media_asset_id: normalizeOptionalString(data, "media_asset_id"),
                cta_label: normalizeOptionalString(data, "cta_label"),
                cta_href: normalizeOptionalString(data, "cta_href"),
            });
        case "rich_text":
        case "commentary":
            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                body: requireString(data, "body", `${label} data`),
            });
        case "image": {
            const mediaAssetId = normalizeOptionalString(data, "media_asset_id");
            const src = normalizeOptionalMediaPath(data, "src", `${label} data`);
            requireAtLeastOneMediaSource(label, { mediaAssetId, src });

            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                media_asset_id: mediaAssetId,
                src,
                caption: normalizeOptionalString(data, "caption"),
                alt_text: normalizeOptionalString(data, "alt_text"),
            });
        }
        case "audio": {
            const mediaAssetId = normalizeOptionalString(data, "media_asset_id");
            const src = normalizeOptionalMediaPath(data, "src", `${label} data`);
            requireAtLeastOneMediaSource(label, { mediaAssetId, src });

            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                media_asset_id: mediaAssetId,
                src,
                caption: normalizeOptionalString(data, "caption"),
                provider: normalizeOptionalString(data, "provider"),
            });
        }
        case "video": {
            const mediaAssetId = normalizeOptionalString(data, "media_asset_id");
            const src = normalizeOptionalMediaPath(data, "src", `${label} data`);
            const embedUrl = normalizeOptionalMediaPath(data, "embed_url", `${label} data`);
            requireAtLeastOneMediaSource(label, { mediaAssetId, src, embedUrl });

            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                media_asset_id: mediaAssetId,
                src,
                embed_url: embedUrl,
                caption: normalizeOptionalString(data, "caption"),
                provider: normalizeOptionalString(data, "provider"),
                alt_text: normalizeOptionalString(data, "alt_text"),
            });
        }
        case "media": {
            const mediaAssetId = normalizeOptionalString(data, "media_asset_id");
            const src = normalizeOptionalMediaPath(data, "src", `${label} data`);
            const embedUrl = normalizeOptionalMediaPath(data, "embed_url", `${label} data`);
            requireAtLeastOneMediaSource(label, { mediaAssetId, src, embedUrl });

            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                media_asset_id: mediaAssetId,
                src,
                embed_url: embedUrl,
                caption: normalizeOptionalString(data, "caption"),
                provider: normalizeOptionalString(data, "provider"),
                alt_text: normalizeOptionalString(data, "alt_text"),
                media_kind: normalizeOptionalEnumValue(data.media_kind, "media_kind", MEDIA_ASSET_TYPES, `${label} data`),
            });
        }
        case "quote":
            return deepFreeze({
                quote: requireString(data, "quote", `${label} data`),
                attribution: normalizeOptionalString(data, "attribution"),
            });
        case "related_entities":
            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                items: normalizeObjectArray(data.items, "items", `${label} data`),
            });
        case "cta":
            return deepFreeze({
                title: requireString(data, "title", `${label} data`),
                body: normalizeOptionalString(data, "body"),
                label: requireString(data, "label", `${label} data`),
                href: requireString(data, "href", `${label} data`),
            });
        case "gallery":
            return deepFreeze((() => {
                const mediaAssetIds = normalizeStringArray(data.media_asset_ids, "media_asset_ids", `${label} data`);
                if (!mediaAssetIds.length) {
                    throw new Error(`${label} data must include at least one "media_asset_ids" entry.`);
                }

                return {
                    title: normalizeOptionalString(data, "title"),
                    media_asset_ids: mediaAssetIds,
                    caption: normalizeOptionalString(data, "caption"),
                };
            })());
        case "stat_grid":
            return deepFreeze({
                title: normalizeOptionalString(data, "title"),
                items: normalizeObjectArray(data.items, "items", `${label} data`),
            });
        case "verse_insight":
            return deepFreeze({
                label: requireString(data, "label", `${label} data`),
                title: requireString(data, "title", `${label} data`),
                body: requireString(data, "body", `${label} data`),
                caption: normalizeOptionalString(data, "caption"),
                media_asset_id: normalizeOptionalString(data, "media_asset_id"),
            });
        default:
            throw new Error(`${label} uses unsupported block type "${blockType}".`);
    }
}

function normalizeMediaMetadata(record, label) {
    if (!("metadata" in record) || record.metadata == null) {
        return deepFreeze({});
    }

    requireObject(record.metadata, `${label} metadata`);
    return deepFreeze({ ...record.metadata });
}

function getOwnerLookup(contentDatabase) {
    return Object.freeze({
        books: contentDatabase?.indexes?.booksById || {},
        book_sections: contentDatabase?.indexes?.bookSectionsById || {},
        chapters: contentDatabase?.indexes?.chaptersById || {},
        chapter_sections: contentDatabase?.indexes?.chapterSectionsById || {},
        verses: contentDatabase?.indexes?.versesById || {},
        characters: contentDatabase?.indexes?.charactersById || {},
    });
}

function assertOwnerExists(ownerEntity, ownerId, label, contentDatabase) {
    const ownerLookup = getOwnerLookup(contentDatabase)[ownerEntity] || {};
    if (!ownerLookup[ownerId]) {
        throw new Error(`${label} references unknown ${ownerEntity} owner "${ownerId}".`);
    }
}

function normalizeMediaAssetRecord(record, index = 0) {
    const label = `Media asset at index ${index}`;
    requireObject(record, label);
    requireFields(record, CMS_TABLE_SCHEMAS.media_assets.requiredFields, label);

    const assetType = normalizeBlockEnum(record, "asset_type", MEDIA_ASSET_TYPES, label);
    const src = requireString(record, "src", label);
    if (!MEDIA_PATH_PATTERN.test(src)) {
        throw new Error(`${label} has an invalid "src" value.`);
    }

    return {
        id: requireIdentifier(record, "id", label),
        asset_type: assetType,
        title: normalizeOptionalString(record, "title"),
        src,
        alt_text: normalizeOptionalString(record, "alt_text"),
        caption: normalizeOptionalString(record, "caption"),
        provider: normalizeOptionalString(record, "provider"),
        metadata: normalizeMediaMetadata(record, label),
        created_at: normalizeTimestamp(record.created_at, "created_at", label),
        updated_at: normalizeTimestamp(record.updated_at, "updated_at", label),
    };
}

function normalizeContentBlockRecord(record, index, mediaAssetsById, contentDatabase) {
    const label = `Content block at index ${index}`;
    requireObject(record, label);
    requireFields(record, CMS_TABLE_SCHEMAS.content_blocks.requiredFields, label);

    const ownerEntity = normalizeBlockEnum(record, "owner_entity", CONTENT_BLOCK_OWNER_ENTITIES, label);
    const ownerId = requireIdentifier(record, "owner_id", label);
    assertOwnerExists(ownerEntity, ownerId, label, contentDatabase);

    const region = normalizeBlockEnum(record, "region", CONTENT_BLOCK_REGIONS, label);
    const blockType = normalizeBlockEnum(record, "block_type", CONTENT_BLOCK_TYPES, label);
    const normalizedData = normalizeContentBlockData(blockType, record.data, label);

    if (normalizedData.media_asset_id && !mediaAssetsById[normalizedData.media_asset_id]) {
        throw new Error(`${label} references unknown media_asset_id "${normalizedData.media_asset_id}".`);
    }

    if (Array.isArray(normalizedData.media_asset_ids)) {
        normalizedData.media_asset_ids.forEach((assetId) => {
            if (!mediaAssetsById[assetId]) {
                throw new Error(`${label} references unknown media asset "${assetId}".`);
            }
        });
    }

    return {
        id: requireIdentifier(record, "id", label),
        owner_entity: ownerEntity,
        owner_id: ownerId,
        region,
        block_type: blockType,
        variant: normalizeOptionalString(record, "variant"),
        position: requirePositiveInteger(record, "position", label),
        status: normalizeBlockEnum(record, "status", CONTENT_BLOCK_STATUSES, label),
        visibility: normalizeBlockEnum(record, "visibility", CONTENT_BLOCK_VISIBILITIES, label),
        is_published: requireBoolean(record, "is_published", label),
        data: normalizedData,
        created_at: normalizeTimestamp(record.created_at, "created_at", label),
        updated_at: normalizeTimestamp(record.updated_at, "updated_at", label),
    };
}

function sortBlocks(records = []) {
    return [...records].sort((left, right) => {
        if (left.region !== right.region) {
            return left.region.localeCompare(right.region);
        }

        return left.position - right.position;
    });
}

function createBlockIndexes(contentBlocks, mediaAssets) {
    const blocksByOwnerKey = Object.fromEntries(
        Object.entries(buildGroupedLookup(contentBlocks, "owner_id")).map(([ownerId, blocks]) => [ownerId, deepFreeze(sortBlocks(blocks))])
    );

    const blocksByOwnerEntityKey = deepFreeze(
        Object.fromEntries(
            contentBlocks.reduce((accumulator, block) => {
                const key = `${block.owner_entity}:${block.owner_id}`;
                if (!accumulator[key]) {
                    accumulator[key] = [];
                }

                accumulator[key].push(block);
                return accumulator;
            }, {})
                ? Object.entries(
                    contentBlocks.reduce((accumulator, block) => {
                        const key = `${block.owner_entity}:${block.owner_id}`;
                        if (!accumulator[key]) {
                            accumulator[key] = [];
                        }

                        accumulator[key].push(block);
                        return accumulator;
                    }, {})
                ).map(([key, blocks]) => [key, deepFreeze(sortBlocks(blocks))])
                : []
        )
    );

    return deepFreeze({
        contentBlocksById: buildRecordLookup(contentBlocks, "id"),
        mediaAssetsById: buildRecordLookup(mediaAssets, "id"),
        blocksByOwnerKey,
        blocksByOwnerEntityKey,
    });
}

export function createCmsDatabase(rawTables, contentDatabase) {
    requireObject(rawTables, "CMS database");

    if (!Array.isArray(rawTables.content_blocks)) {
        throw new Error('CMS database must provide a "content_blocks" array.');
    }

    if (!Array.isArray(rawTables.media_assets)) {
        throw new Error('CMS database must provide a "media_assets" array.');
    }

    const mediaIdTracker = createUniqueTracker();
    const mediaAssets = rawTables.media_assets.map((record, index) => {
        const normalized = normalizeMediaAssetRecord(record, index);
        assertUnique(mediaIdTracker, normalized.id, "media asset id");
        return normalized;
    });
    const mediaAssetsById = buildRecordLookup(mediaAssets, "id");

    const blockIdTracker = createUniqueTracker();
    const positionTracker = createUniqueTracker();
    const contentBlocks = rawTables.content_blocks.map((record, index) => {
        const normalized = normalizeContentBlockRecord(record, index, mediaAssetsById, contentDatabase);
        assertUnique(blockIdTracker, normalized.id, "content block id");
        assertUnique(positionTracker, `${normalized.owner_entity}:${normalized.owner_id}:${normalized.region}:${normalized.position}`, "content block position");
        return normalized;
    });

    const database = {
        contentBlocks: deepFreeze(sortBlocks(contentBlocks)),
        mediaAssets: deepFreeze(mediaAssets),
    };

    database.indexes = createBlockIndexes(database.contentBlocks, database.mediaAssets);
    return deepFreeze(database);
}
