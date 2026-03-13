import { deepFreeze } from "../../core/data/freeze.js";
import { buildGroupedLookup, buildRecordLookup } from "../../core/data/indexes.js";
import {
    MEDIA_PATH_PATTERN,
    assertUnique,
    createUniqueTracker,
    normalizeOptionalBoolean,
    normalizeOptionalMediaPath,
    normalizeOptionalString,
    requireBoolean,
    requireFields,
    requireIdentifier,
    requireMediaPath,
    requireObject,
    requirePositiveInteger,
    requireString,
} from "../../core/data/validate.js";

export const EXPLANATION_TARGET_TYPES = Object.freeze([
    "book",
    "book_section",
    "chapter",
    "chapter_section",
    "verse",
]);

export const EXPLANATION_DOCUMENT_STATUSES = Object.freeze([
    "draft",
    "published",
]);

export const EXPLANATION_BLOCK_TYPES = Object.freeze([
    "text_section",
    "video",
    "image",
    "divider",
]);

function defineTableSchema(fields, requiredFields) {
    return Object.freeze({
        fields: Object.freeze(fields),
        requiredFields: Object.freeze(requiredFields),
    });
}

const EDITOR_REQUIRED_FIELD_NAMES = Object.freeze({
    explanation_documents: Object.freeze([
        "target_type",
        "target_id",
    ]),
    explanation_blocks: Object.freeze([
        "explanation_id",
        "type",
        "sort_order",
        "data_json",
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

function normalizeDocumentStatus(record, label) {
    const status = requireString(record, "status", label).toLowerCase();
    if (!EXPLANATION_DOCUMENT_STATUSES.includes(status)) {
        throw new Error(`${label} must use a supported "status" value.`);
    }
    return status;
}

function normalizeTargetType(record, label) {
    const targetType = requireString(record, "target_type", label).toLowerCase();
    if (!EXPLANATION_TARGET_TYPES.includes(targetType)) {
        throw new Error(`${label} must use a supported "target_type" value.`);
    }
    return targetType;
}

function normalizeBlockType(record, label) {
    const blockType = requireString(record, "type", label).toLowerCase();
    if (!EXPLANATION_BLOCK_TYPES.includes(blockType)) {
        throw new Error(`${label} must use a supported "type" value.`);
    }
    return blockType;
}

function normalizeOptionalLink(record, fieldName, label) {
    if (!(fieldName in record) || record[fieldName] == null) {
        return null;
    }

    const value = String(record[fieldName] ?? "").trim();
    if (!value) {
        return null;
    }

    if (!MEDIA_PATH_PATTERN.test(value)) {
        throw new Error(`${label} has an invalid "${fieldName}" value.`);
    }

    return value;
}

export function normalizeExplanationBlockData(type, dataJson, label) {
    requireObject(dataJson, `${label} data_json`);

    switch (type) {
        case "text_section":
            return deepFreeze({
                title: normalizeOptionalString(dataJson, "title"),
                body: requireString(dataJson, "body", `${label} data_json`),
            });
        case "video": {
            const url = normalizeOptionalLink(dataJson, "url", `${label} data_json`);
            const embedUrl = normalizeOptionalLink(dataJson, "embed_url", `${label} data_json`);
            if (!url && !embedUrl) {
                throw new Error(`${label} data_json must provide "url" or "embed_url".`);
            }

            return deepFreeze({
                title: normalizeOptionalString(dataJson, "title"),
                url,
                embed_url: embedUrl,
                description: normalizeOptionalString(dataJson, "description"),
            });
        }
        case "image":
            return deepFreeze({
                src: requireMediaPath(dataJson, "src", `${label} data_json`),
                alt: normalizeOptionalString(dataJson, "alt"),
                caption: normalizeOptionalString(dataJson, "caption"),
            });
        case "divider":
            return deepFreeze({
                style: normalizeOptionalString(dataJson, "style"),
            });
        default:
            throw new Error(`${label} uses unsupported block type "${type}".`);
    }
}

function getTargetLookup(contentDatabase) {
    return Object.freeze({
        book: contentDatabase?.indexes?.booksById || {},
        book_section: contentDatabase?.indexes?.bookSectionsById || {},
        chapter: contentDatabase?.indexes?.chaptersById || {},
        chapter_section: contentDatabase?.indexes?.chapterSectionsById || {},
        verse: contentDatabase?.indexes?.versesById || {},
    });
}

function assertTargetExists(targetType, targetId, label, contentDatabase) {
    const lookup = getTargetLookup(contentDatabase)[targetType] || {};
    if (!lookup[targetId]) {
        throw new Error(`${label} references unknown ${targetType} target "${targetId}".`);
    }
}

function sortByOrder(records = [], fieldName = "sort_order") {
    return [...records].sort((left, right) => left[fieldName] - right[fieldName]);
}

export const EXPLANATION_TABLE_SCHEMAS = Object.freeze({
    explanation_documents: defineTableSchema(
        [
            "id",
            "target_type",
            "target_id",
            "status",
            "created_at",
            "updated_at",
        ],
        [
            "id",
            "target_type",
            "target_id",
            "status",
            "created_at",
            "updated_at",
        ]
    ),
    explanation_blocks: defineTableSchema(
        [
            "id",
            "explanation_id",
            "type",
            "sort_order",
            "data_json",
            "is_visible",
            "created_at",
            "updated_at",
        ],
        [
            "id",
            "explanation_id",
            "type",
            "sort_order",
            "data_json",
            "is_visible",
            "created_at",
            "updated_at",
        ]
    ),
});

export const EXPLANATION_FIELD_CONFIGS = Object.freeze({
    explanation_documents: withSchemaRequiredFlags("explanation_documents", [
        { name: "target_type", label: "Target Type", type: "select", required: true },
        { name: "target_id", label: "Target ID", type: "text", required: true },
        { name: "status", label: "Status", type: "select", required: true },
    ]),
    explanation_blocks: withSchemaRequiredFlags("explanation_blocks", [
        { name: "explanation_id", label: "Explanation Document", type: "text", required: true },
        { name: "type", label: "Block Type", type: "select", required: true },
        { name: "sort_order", label: "Sort Order", type: "number", required: true },
        { name: "data_json", label: "Block Data", type: "textarea", required: true },
        { name: "is_visible", label: "Visible", type: "checkbox" },
    ]),
});

function normalizeExplanationDocuments(rawDocuments, contentDatabase) {
    if (!Array.isArray(rawDocuments)) {
        throw new Error('Explanations database must provide an "explanation_documents" array.');
    }

    const ids = createUniqueTracker();
    const targetKeys = createUniqueTracker();

    return rawDocuments.map((record, index) => {
        const label = `Explanation document at index ${index}`;
        requireObject(record, label);
        requireFields(record, EXPLANATION_TABLE_SCHEMAS.explanation_documents.requiredFields, label);

        const targetType = normalizeTargetType(record, label);
        const targetId = requireIdentifier(record, "target_id", label);
        assertTargetExists(targetType, targetId, label, contentDatabase);

        const normalized = {
            id: requireIdentifier(record, "id", label),
            target_type: targetType,
            target_id: targetId,
            status: normalizeDocumentStatus(record, label),
            created_at: normalizeTimestamp(record.created_at, "created_at", label),
            updated_at: normalizeTimestamp(record.updated_at, "updated_at", label),
        };

        assertUnique(ids, normalized.id, "explanation document id");
        assertUnique(targetKeys, `${normalized.target_type}:${normalized.target_id}`, "explanation target key");
        return normalized;
    });
}

function normalizeExplanationBlocks(rawBlocks, documentsById) {
    if (!Array.isArray(rawBlocks)) {
        throw new Error('Explanations database must provide an "explanation_blocks" array.');
    }

    const ids = createUniqueTracker();
    const orderKeys = createUniqueTracker();

    return rawBlocks.map((record, index) => {
        const label = `Explanation block at index ${index}`;
        requireObject(record, label);
        requireFields(record, EXPLANATION_TABLE_SCHEMAS.explanation_blocks.requiredFields, label);

        const explanationId = requireIdentifier(record, "explanation_id", label);
        if (!documentsById[explanationId]) {
            throw new Error(`${label} references unknown explanation_id "${explanationId}".`);
        }

        const blockType = normalizeBlockType(record, label);
        const normalized = {
            id: requireIdentifier(record, "id", label),
            explanation_id: explanationId,
            type: blockType,
            sort_order: requirePositiveInteger(record, "sort_order", label),
            data_json: normalizeExplanationBlockData(blockType, record.data_json, label),
            is_visible: requireBoolean(record, "is_visible", label),
            created_at: normalizeTimestamp(record.created_at, "created_at", label),
            updated_at: normalizeTimestamp(record.updated_at, "updated_at", label),
        };

        assertUnique(ids, normalized.id, "explanation block id");
        assertUnique(orderKeys, `${normalized.explanation_id}:${normalized.sort_order}`, "explanation block order key");
        return normalized;
    });
}

function createIndexes(database) {
    const documentsById = buildRecordLookup(database.explanationDocuments, "id");
    const documentByTargetKey = deepFreeze(
        Object.fromEntries(
            database.explanationDocuments.map((document) => [
                `${document.target_type}:${document.target_id}`,
                document,
            ])
        )
    );
    const blocksById = buildRecordLookup(database.explanationBlocks, "id");
    const blocksByExplanationId = deepFreeze(
        Object.fromEntries(
            Object.entries(buildGroupedLookup(database.explanationBlocks, "explanation_id"))
                .map(([explanationId, blocks]) => [explanationId, Object.freeze(sortByOrder(blocks))])
        )
    );

    return deepFreeze({
        documentsById,
        documentByTargetKey,
        blocksById,
        blocksByExplanationId,
    });
}

export function createExplanationsDatabase(rawTables, contentDatabase) {
    requireObject(rawTables, "Explanations database");

    const explanationDocuments = normalizeExplanationDocuments(rawTables.explanation_documents, contentDatabase);
    const documentsById = buildRecordLookup(explanationDocuments, "id");
    const explanationBlocks = normalizeExplanationBlocks(rawTables.explanation_blocks, documentsById);

    const database = {
        explanationDocuments: deepFreeze(explanationDocuments),
        explanationBlocks: deepFreeze(sortByOrder(explanationBlocks)),
    };

    database.indexes = createIndexes(database);
    return deepFreeze(database);
}
