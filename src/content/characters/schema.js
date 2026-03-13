import { deepFreeze } from "../../core/data/freeze.js";
import { normalizeIdentifier, normalizeText } from "../../core/data/normalize.js";
import {
    MEDIA_PATH_PATTERN,
    assertUnique,
    createUniqueTracker,
    requireObject,
} from "../../core/data/validate.js";

export const REQUIRED_CHARACTER_FIELDS = Object.freeze([
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
]);

export const OPTIONAL_CHARACTER_FIELDS = Object.freeze(["aliases", "tags", "search_terms"]);

export const CHARACTER_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @typedef {Object} CharacterRecord
 * @property {string} slug
 * @property {string} name
 * @property {string} image
 * @property {string} tradition
 * @property {string} role
 * @property {string} era
 * @property {string} collection
 * @property {string} short_meta
 * @property {string} summary
 * @property {string} overview
 * @property {string} focus
 * @property {boolean} detail_available
 * @property {string[]} aliases
 * @property {string[]} tags
 * @property {string[]} search_terms
 */

function normalizeKey(value) {
    return normalizeText(value).toLowerCase();
}

export function normalizeCharacterSlug(slug) {
    return normalizeIdentifier(slug);
}

function requireStringField(character, field, slugLabel) {
    const value = normalizeText(character[field]);
    if (!value) {
        throw new Error(`Character "${slugLabel}" has an invalid "${field}" value.`);
    }
    return value;
}

function normalizeListField(value, field, slugLabel) {
    if (value == null) return [];
    if (!Array.isArray(value)) {
        throw new Error(`Character "${slugLabel}" must use an array for "${field}".`);
    }

    const seen = new Set();
    const normalized = [];

    value.forEach((item, itemIndex) => {
        const normalizedItem = normalizeText(item);
        if (!normalizedItem) {
            throw new Error(`Character "${slugLabel}" has an invalid "${field}" item at index ${itemIndex}.`);
        }

        const dedupeKey = normalizeKey(normalizedItem);
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);
        normalized.push(normalizedItem);
    });

    return normalized;
}

export function normalizeCharacterRecord(character, index = 0) {
    requireObject(character, `Character at index ${index}`);

    const slug = normalizeCharacterSlug(character.slug);
    const slugLabel = slug || character.name || `index-${index}`;

    REQUIRED_CHARACTER_FIELDS.forEach((field) => {
        if (!(field in character)) {
            throw new Error(`Character "${slugLabel}" is missing field "${field}".`);
        }
    });

    if (!CHARACTER_SLUG_PATTERN.test(slug)) {
        throw new Error(`Character "${slugLabel}" must use a lowercase kebab-case slug.`);
    }

    const image = requireStringField(character, "image", slugLabel);
    if (!MEDIA_PATH_PATTERN.test(image)) {
        throw new Error(`Character "${slugLabel}" has an invalid "image" path.`);
    }

    const detailAvailable = character.detail_available;
    if (typeof detailAvailable !== "boolean") {
        throw new Error(`Character "${slugLabel}" must use a boolean detail_available value.`);
    }

    return {
        slug,
        name: requireStringField(character, "name", slugLabel),
        image,
        tradition: requireStringField(character, "tradition", slugLabel),
        role: requireStringField(character, "role", slugLabel),
        era: requireStringField(character, "era", slugLabel),
        collection: requireStringField(character, "collection", slugLabel),
        short_meta: requireStringField(character, "short_meta", slugLabel),
        summary: requireStringField(character, "summary", slugLabel),
        overview: requireStringField(character, "overview", slugLabel),
        focus: requireStringField(character, "focus", slugLabel),
        detail_available: detailAvailable,
        aliases: normalizeListField(character.aliases, "aliases", slugLabel),
        tags: normalizeListField(character.tags, "tags", slugLabel),
        search_terms: normalizeListField(character.search_terms, "search_terms", slugLabel),
    };
}

export function createCharacterCollection(characters) {
    if (!Array.isArray(characters)) {
        throw new Error("Character dataset must be an array.");
    }

    const seenSlugs = createUniqueTracker();
    const normalized = characters.map((character, index) => normalizeCharacterRecord(character, index));

    normalized.forEach((character) => {
        assertUnique(seenSlugs, character.slug, "character slug");
    });

    return deepFreeze(normalized.map((character) => ({ ...character })));
}
