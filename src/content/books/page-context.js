import {
    getBookBySlug,
    getChapterBySlug,
    getFirstChapterForBook,
    getVerseByChapterAndNumber,
    listVersesForChapter,
} from "./queries.js";

export const DEFAULT_BOOK_SLUG = "bhagavad-gita";

function toSearchParams(searchParams = window.location.search) {
    if (searchParams instanceof URLSearchParams) {
        return new URLSearchParams(searchParams);
    }

    if (typeof searchParams === "string") {
        const normalized = searchParams.startsWith("?") ? searchParams.slice(1) : searchParams;
        return new URLSearchParams(normalized);
    }

    return new URLSearchParams();
}

function parsePositiveInteger(value) {
    const parsed = Number.parseInt(value || "", 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveCurrentBook(searchParams) {
    const params = toSearchParams(searchParams);
    const requestedBookSlug = params.get("book") || DEFAULT_BOOK_SLUG;
    const book = getBookBySlug(requestedBookSlug) || getBookBySlug(DEFAULT_BOOK_SLUG);

    if (!book) {
        return null;
    }

    return { book, searchParams: params };
}

function resolveCurrentChapter(book, searchParams) {
    const params = toSearchParams(searchParams);
    const requestedChapterSlug = params.get("chapter");

    return (requestedChapterSlug ? getChapterBySlug(book.slug, requestedChapterSlug) : null)
        || getFirstChapterForBook(book.id)
        || null;
}

export function resolveBooksPageContext(searchParams = window.location.search) {
    return Object.freeze({
        searchParams: toSearchParams(searchParams),
    });
}

export function resolveChaptersPageContext(searchParams = window.location.search) {
    const bookContext = resolveCurrentBook(searchParams);
    if (!bookContext) {
        return null;
    }

    return Object.freeze(bookContext);
}

export function resolveVersesPageContext(searchParams = window.location.search) {
    const bookContext = resolveCurrentBook(searchParams);
    if (!bookContext) {
        return null;
    }

    const chapter = resolveCurrentChapter(bookContext.book, bookContext.searchParams);
    if (!chapter) {
        return null;
    }

    const highlightedVerseNumber = parsePositiveInteger(bookContext.searchParams.get("verse"));
    const verse = highlightedVerseNumber
        ? getVerseByChapterAndNumber(chapter.id, highlightedVerseNumber)
        : null;

    return Object.freeze({
        ...bookContext,
        chapter,
        verse,
        highlightedVerseNumber,
    });
}

export function resolveExplanationsPageContext(searchParams = window.location.search) {
    const verseContext = resolveVersesPageContext(searchParams);
    if (!verseContext) {
        return null;
    }

    const verses = listVersesForChapter(verseContext.chapter.id);
    const requestedVerseNumber = parsePositiveInteger(verseContext.searchParams.get("verse"));
    const verse = requestedVerseNumber
        ? getVerseByChapterAndNumber(verseContext.chapter.id, requestedVerseNumber) || verses[0] || null
        : verses[0] || null;

    if (!verse) {
        return null;
    }

    return Object.freeze({
        ...verseContext,
        verse,
        verses,
    });
}
