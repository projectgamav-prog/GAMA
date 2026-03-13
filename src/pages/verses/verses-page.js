import {
    getBookBySlug,
    getChapterBySlug,
    getFirstChapterForBook,
} from "../../content/books/queries.js";
import { BOOKS_QUERY_API } from "../../content/books/queries.js";
import { renderChapterVersesPreview } from "../../content/renderers/verses-renderer.js";

const DEFAULT_BOOK_SLUG = "bhagavad-gita";

function getCurrentContext() {
    const params = new URLSearchParams(window.location.search);
    const requestedBookSlug = params.get("book") || DEFAULT_BOOK_SLUG;
    const book = getBookBySlug(requestedBookSlug) || getBookBySlug(DEFAULT_BOOK_SLUG);
    if (!book) return null;

    const requestedChapterSlug = params.get("chapter");
    let chapter = requestedChapterSlug ? getChapterBySlug(book.slug, requestedChapterSlug) : null;
    if (!chapter) {
        chapter = getFirstChapterForBook(book.id);
    }

    if (!chapter) return null;

    return { book, chapter, params };
}

function getDisplayMode() {
    return document.body.dataset.verseMode || "sanskrit-english";
}

function renderVersesPage() {
    const context = getCurrentContext();
    const main = document.querySelector(".verse-main");
    if (!context || !main) return;

    const { book, chapter, params } = context;
    const highlightedVerseNumber = Number.parseInt(params.get("verse") || "", 10);
    const mode = getDisplayMode();

    document.title = `${book.title} | Chapter ${chapter.chapter_number}`;

    const sectionContainer = main.querySelector(".verse-section");
    if (!sectionContainer) return;

    renderChapterVersesPreview({
        book,
        chapter,
        container: sectionContainer,
        queryApi: BOOKS_QUERY_API,
        routeResolver: window.resolveAppRoute,
        mode,
        highlightedVerseNumber,
        breadcrumbElement: main.querySelector(".verse-breadcrumb"),
        chapterLabelElement: main.querySelector(".verse-chapter-label"),
        chapterNameElement: main.querySelector(".verse-chapter-name"),
    });
}

renderVersesPage();
