import { CHARACTERS, CHARACTER_FALLBACK_IMAGE, getCharacterRecordBySlug } from "./database.js";

export function listCharacters() {
    return [...CHARACTERS]
        .filter((character) => character.is_published !== false)
        .sort((a, b) => a.ui_order - b.ui_order || a.name.localeCompare(b.name));
}

export function getCharacterBySlug(slug) {
    return getCharacterRecordBySlug(slug);
}

export function listCharacterFilterValues() {
    const getValues = (key) =>
        [...new Set(CHARACTERS.map((character) => character[key]).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b)
        );

    return Object.freeze({
        tradition: Object.freeze(getValues("tradition")),
        role: Object.freeze(getValues("role")),
        era: Object.freeze(getValues("era")),
        collection: Object.freeze(getValues("collection")),
    });
}

export { CHARACTERS, CHARACTER_FALLBACK_IMAGE };
