import { EXPLANATIONS_DATABASE } from "./database.js";
import { createExplanationsQueryApi } from "./query-api.js";

export const EXPLANATIONS_QUERY_API = createExplanationsQueryApi(EXPLANATIONS_DATABASE);

export const {
    listExplanationDocuments,
    getExplanationDocumentById,
    getExplanationDocumentForTarget,
    getExplanationContentForTarget,
    getVerseExplanationContent,
    listExplanationBlocks,
    listAllExplanationBlocks,
    explanationDocuments,
    explanationBlocks,
} = EXPLANATIONS_QUERY_API;
