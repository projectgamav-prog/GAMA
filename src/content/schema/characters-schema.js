import { deepFreeze } from "../../core/data/freeze.js";
import { buildRecordLookup } from "../../core/data/indexes.js";
import {
    MEDIA_PATH_PATTERN,
    assertUnique,
    createUniqueTracker,
    requireBoolean,
    requireFields,
    requireIdentifier,
    requireMediaPath,
    requireObject,
    requirePositiveInteger,
    requireString,
} from "../../core/data/validate.js";

export const CHARACTER_TABLE_SCHEMAS = Object.freeze({
    characters: Object.freeze({
        fields: Object.freeze([
            "id",
            "slug",
            "name",
            "image",
            "tradition",
            "role",
            "era",
            "collection",
            "short_meta",
            "summary",
            "overview",
            "focus",
            "detail_available",
            "aliases",
            "tags",
            "search_terms",
            "ui_order",
            "is_published",
        ]),
        requiredFields: Object.freeze([
            "id",
            "slug",
            "name",
            "image",
            "tradition",
            "role",
            "era",
            "collection",
            "short_meta",
            "summary",
            "overview",
            "focus",
            "detail_available",
            "ui_order",
            "is_published",
        ]),
    }),
});

export const CHARACTER_FIELD_CONFIGS = Object.freeze({
    characters: Object.freeze([
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "name", label: "Name", type: "text", required: true },
        { name: "image", label: "Image", type: "text", required: true },
        { name: "tradition", label: "Tradition", type: "text", required: true },
        { name: "role", label: "Role", type: "text", required: true },
        { name: "era", label: "Era", type: "text", required: true },
        { name: "collection", label: "Collection", type: "text", required: true },
        { name: "short_meta", label: "Short Meta", type: "text", required: true },
        { name: "summary", label: "Summary", type: "textarea", required: true },
        { name: "overview", label: "Overview", type: "textarea", required: true },
        { name: "focus", label: "Focus", type: "textarea", required: true },
        { name: "detail_available", label: "Detail Available", type: "checkbox" },
        { name: "aliases", label: "Aliases", type: "textarea" },
        { name: "tags", label: "Tags", type: "textarea" },
        { name: "search_terms", label: "Search Terms", type: "textarea" },
        { name: "ui_order", label: "UI Order", type: "number", min: 1, required: true },
        { name: "is_published", label: "Published", type: "checkbox" },
    ]),
});

export const CHARACTER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeStringList(value, field, label) {
    if (value == null) {
        return Object.freeze([]);
    }

    const list = Array.isArray(value)
        ? value
        : String(value)
            .split(/\r?\n|,/)
            .map((item) => String(item || "").trim())
            .filter(Boolean);

    const tracker = createUniqueTracker();

    return Object.freeze(
        list.map((item, index) => {
            const normalized = String(item || "").trim();
            if (!normalized) {
                throw new Error(`${label} has an invalid "${field}" entry at index ${index}.`);
            }

            const dedupeKey = normalized.toLowerCase();
            assertUnique(tracker, dedupeKey, `${field} value`);
            return normalized;
        })
    );
}

export function normalizeCharacterRecord(record, index = 0) {
    const label = `Character at index ${index}`;
    requireObject(record, label);
    requireFields(record, CHARACTER_TABLE_SCHEMAS.characters.requiredFields, label);

    const normalized = {
        id: requireIdentifier(record, "id", label),
        slug: requireIdentifier(record, "slug", label),
        name: requireString(record, "name", label),
        image: requireMediaPath(record, "image", label),
        tradition: requireString(record, "tradition", label),
        role: requireString(record, "role", label),
        era: requireString(record, "era", label),
        collection: requireString(record, "collection", label),
        short_meta: requireString(record, "short_meta", label),
        summary: requireString(record, "summary", label),
        overview: requireString(record, "overview", label),
        focus: requireString(record, "focus", label),
        detail_available: requireBoolean(record, "detail_available", label),
        aliases: normalizeStringList(record.aliases, "aliases", label),
        tags: normalizeStringList(record.tags, "tags", label),
        search_terms: normalizeStringList(record.search_terms, "search_terms", label),
        ui_order: requirePositiveInteger(record, "ui_order", label),
        is_published: requireBoolean(record, "is_published", label),
    };

    if (!CHARACTER_SLUG_PATTERN.test(normalized.slug)) {
        throw new Error(`${label} must use a lowercase kebab-case slug.`);
    }

    if (!MEDIA_PATH_PATTERN.test(normalized.image)) {
        throw new Error(`${label} has an invalid image path.`);
    }

    return normalized;
}

function sortByOrder(records = []) {
    return [...records].sort((left, right) => left.ui_order - right.ui_order || left.name.localeCompare(right.name));
}

export function createCharactersDatabase(rawTables) {
    const rawCharacters = Array.isArray(rawTables) ? rawTables : rawTables?.characters;
    if (!Array.isArray(rawCharacters)) {
        throw new Error('Characters database must provide a "characters" array.');
    }

    const idTracker = createUniqueTracker();
    const slugTracker = createUniqueTracker();
    const characters = rawCharacters.map((record, index) => {
        const normalized = normalizeCharacterRecord(record, index);
        assertUnique(idTracker, normalized.id, "character id");
        assertUnique(slugTracker, normalized.slug, "character slug");
        return normalized;
    });

    const database = {
        characters: deepFreeze(sortByOrder(characters)),
    };

    database.indexes = deepFreeze({
        charactersById: buildRecordLookup(database.characters, "id"),
        charactersBySlug: buildRecordLookup(database.characters, "slug"),
    });

    return deepFreeze(database);
}
