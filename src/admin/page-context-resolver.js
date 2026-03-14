import {
    resolveBooksPageContext,
    resolveChaptersPageContext,
    resolveExplanationsPageContext,
    resolveVersesPageContext,
} from "../content/books/page-context.js";
import { getCharacterBySlug } from "../content/characters/queries.js";
import { getVerseExplanationContent } from "../content/explanations/queries.js";
import { getExplanationPageBridge } from "../content/explanations/page-bridge.js";
import { getContentRecord } from "./content-state.js";

const SUPPORTED_PAGE_IDS = new Set(["books", "chapters", "verses", "explanations", "characters"]);
const SUPPORTED_ENTITIES = new Set(["books", "book_sections", "chapters", "chapter_sections", "verses", "characters"]);

function getSearchParams() {
    return window.APP_PAGE_CONTEXT?.route?.searchParams || new URLSearchParams(window.location.search);
}

function getPageId() {
    return window.APP_PAGE_CONTEXT?.route?.id || document.body?.dataset?.pageId || "";
}

function resolveSelection(selection) {
    const entity = String(selection?.entity || "").trim();
    const recordId = String(selection?.id || "").trim();

    if (!SUPPORTED_ENTITIES.has(entity) || !recordId) {
        return null;
    }

    const record = getContentRecord(entity, recordId);
    if (!record) {
        return null;
    }

    return Object.freeze({
        ...selection,
        entity,
        id: recordId,
        record,
    });
}

function createBaseContext(pageId, selection) {
    return {
        pageId,
        route: window.APP_PAGE_CONTEXT?.route || null,
        supported: SUPPORTED_PAGE_IDS.has(pageId),
        selection,
        currentBook: null,
        currentChapter: null,
        currentVerse: null,
        currentCharacter: null,
        currentExplanationDocument: null,
        currentExplanationBlocks: Object.freeze([]),
        currentExplanationTarget: null,
        explanationMode: false,
    };
}

function getRouteMode() {
    return window.APP_PAGE_CONTEXT?.mode
        || window.APP_PAGE_CONTEXT?.route?.mode
        || document.body?.dataset?.pageMode
        || "";
}

function resolveExplanationState(verse) {
    if (!verse) {
        return {
            document: null,
            blocks: Object.freeze([]),
        };
    }

    const bridgeState = getExplanationPageBridge()?.getState?.() || null;
    if (bridgeState?.targetType === "verse" && bridgeState?.targetId === verse.id) {
        return {
            document: bridgeState.document || null,
            blocks: Array.isArray(bridgeState.blocks) ? Object.freeze([...bridgeState.blocks]) : Object.freeze([]),
        };
    }

    const includeDraft = getRouteMode() === "admin";
    const explanationContent = getVerseExplanationContent(verse.id, {
        includeDraft,
        includeHidden: includeDraft,
    });

    return {
        document: explanationContent.document || null,
        blocks: Array.isArray(explanationContent.blocks) ? Object.freeze([...explanationContent.blocks]) : Object.freeze([]),
    };
}

function resolveSupportedContext(pageId, selection) {
    const searchParams = getSearchParams();

    switch (pageId) {
        case "books":
            return {
                ...createBaseContext(pageId, selection),
                pageContext: resolveBooksPageContext(searchParams),
            };
        case "chapters": {
            const pageContext = resolveChaptersPageContext(searchParams);
            return {
                ...createBaseContext(pageId, selection),
                pageContext,
                currentBook: pageContext?.book || null,
            };
        }
        case "verses": {
            const pageContext = resolveVersesPageContext(searchParams);
            return {
                ...createBaseContext(pageId, selection),
                pageContext,
                currentBook: pageContext?.book || null,
                currentChapter: pageContext?.chapter || null,
                currentVerse: pageContext?.verse || null,
            };
        }
        case "explanations": {
            const pageContext = resolveExplanationsPageContext(searchParams);
            const explanationState = resolveExplanationState(pageContext?.verse || null);
            return {
                ...createBaseContext(pageId, selection),
                pageContext,
                currentBook: pageContext?.book || null,
                currentChapter: pageContext?.chapter || null,
                currentVerse: pageContext?.verse || null,
                currentExplanationDocument: explanationState.document || null,
                currentExplanationBlocks: explanationState.blocks,
                currentExplanationTarget: pageContext?.verse
                    ? Object.freeze({
                        type: "verse",
                        id: pageContext.verse.id,
                        record: pageContext.verse,
                    })
                    : null,
                explanationMode: true,
            };
        }
        case "characters": {
            const characterSlug = String(searchParams.get("slug") || "").trim();
            const character = characterSlug ? getCharacterBySlug(characterSlug) : null;
            return {
                ...createBaseContext(pageId, selection),
                pageContext: Object.freeze({
                    slug: characterSlug,
                    mode: character ? "detail" : "collection",
                }),
                currentCharacter: character,
            };
        }
        default:
            return createBaseContext(pageId, selection);
    }
}

export function resolveAdminPageContext({ selection = null } = {}) {
    const pageId = getPageId();
    const resolvedSelection = resolveSelection(selection);
    const context = resolveSupportedContext(pageId, resolvedSelection);

    return Object.freeze({
        ...context,
        supported: context.supported && Boolean(context.pageContext || pageId === "books"),
    });
}
