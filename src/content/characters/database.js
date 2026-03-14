import { createCharactersDatabase, normalizeCharacterSlug } from "./schema.js";

const EMPTY_TABLES = Object.freeze({
    characters: [],
});

async function readJson(relativePath) {
    const response = await fetch(relativePath, {
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to load ${relativePath}: ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
        throw new Error(`${relativePath} must contain a JSON array.`);
    }

    return payload;
}

async function loadRawTables() {
    try {
        const characters = await readJson("/content/data/characters.json");
        return { characters };
    } catch (error) {
        console.error("Failed to load character table.", error);
        return { ...EMPTY_TABLES };
    }
}

export const RAW_CHARACTER_TABLES = Object.freeze(await loadRawTables());

function createSafeDatabase(rawTables) {
    try {
        return createCharactersDatabase(rawTables);
    } catch (error) {
        console.error("Failed to build characters database from JSON tables.", error);
        return createCharactersDatabase({ ...EMPTY_TABLES });
    }
}

export const CHARACTERS_DATABASE = createSafeDatabase(RAW_CHARACTER_TABLES);
export const CHARACTERS = CHARACTERS_DATABASE.characters;
export const CHARACTER_FALLBACK_IMAGE = "/assets/images/image.png";

export function getCharacterRecordBySlug(slug) {
    return CHARACTERS_DATABASE.indexes.charactersBySlug[normalizeCharacterSlug(slug)] || null;
}

export function getCharacterRecordById(characterId) {
    return CHARACTERS_DATABASE.indexes.charactersById[characterId] || null;
}
