import { createCmsDatabase } from "../schema/cms-schema.js";
import { CANONICAL_CONTENT_DATABASE } from "../repositories/canonical-content-repository.js";

const EMPTY_TABLES = Object.freeze({
    content_blocks: [],
    media_assets: [],
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
        const [content_blocks, media_assets] = await Promise.all([
            readJson("/content/data/content_blocks.json"),
            readJson("/content/data/media_assets.json"),
        ]);

        return {
            content_blocks,
            media_assets,
        };
    } catch (error) {
        console.error("Failed to load CMS tables.", error);
        return { ...EMPTY_TABLES };
    }
}

export const RAW_CMS_TABLES = Object.freeze(await loadRawTables());

function createSafeDatabase(rawTables) {
    try {
        return createCmsDatabase(rawTables, CANONICAL_CONTENT_DATABASE);
    } catch (error) {
        console.error("Failed to build CMS database from JSON tables.", error);
        return createCmsDatabase({ ...EMPTY_TABLES }, CANONICAL_CONTENT_DATABASE);
    }
}

export const CMS_DATABASE = createSafeDatabase(RAW_CMS_TABLES);
