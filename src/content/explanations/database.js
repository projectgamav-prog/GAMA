import { BOOKS_DATABASE } from "../books/database.js";
import { createExplanationsDatabase } from "./schema.js";

const EMPTY_TABLES = Object.freeze({
    explanation_documents: [],
    explanation_blocks: [],
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
        const [
            explanation_documents,
            explanation_blocks,
        ] = await Promise.all([
            readJson("/content/data/explanation_documents.json"),
            readJson("/content/data/explanation_blocks.json"),
        ]);

        return {
            explanation_documents,
            explanation_blocks,
        };
    } catch (error) {
        console.error("Failed to load explanation tables.", error);
        return { ...EMPTY_TABLES };
    }
}

export const RAW_EXPLANATION_TABLES = Object.freeze(await loadRawTables());

function createSafeDatabase(rawTables) {
    try {
        return createExplanationsDatabase(rawTables, BOOKS_DATABASE);
    } catch (error) {
        console.error("Failed to build explanations database from JSON tables.", error);
        return createExplanationsDatabase({ ...EMPTY_TABLES }, BOOKS_DATABASE);
    }
}

export const EXPLANATIONS_DATABASE = createSafeDatabase(RAW_EXPLANATION_TABLES);
export const EXPLANATION_DOCUMENTS = EXPLANATIONS_DATABASE.explanationDocuments;
export const EXPLANATION_BLOCKS = EXPLANATIONS_DATABASE.explanationBlocks;
