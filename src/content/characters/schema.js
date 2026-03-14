export {
    CHARACTER_FIELD_CONFIGS,
    CHARACTER_SLUG_PATTERN,
    CHARACTER_TABLE_SCHEMAS,
    createCharactersDatabase,
    normalizeCharacterRecord,
} from "../schema/characters-schema.js";

export function normalizeCharacterSlug(slug) {
    return String(slug ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

export function createCharacterCollection(characters) {
    return createCharactersDatabase({ characters }).characters;
}

import { createCharactersDatabase } from "../schema/characters-schema.js";
