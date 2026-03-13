import {
    resolveBooksPageContext,
    resolveChaptersPageContext,
    resolveExplanationsPageContext,
    resolveVersesPageContext,
} from "../content/books/page-context.js";
import { getContentRecord } from "./content-state.js";

const SUPPORTED_PAGE_IDS = new Set(["books", "chapters", "verses", "explanations"]);
const SUPPORTED_ENTITIES = new Set(["books", "book_sections", "chapters", "chapter_sections", "verses"]);

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
        explanationMode: false,
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
            return {
                ...createBaseContext(pageId, selection),
                pageContext,
                currentBook: pageContext?.book || null,
                currentChapter: pageContext?.chapter || null,
                currentVerse: pageContext?.verse || null,
                explanationMode: true,
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
