import { BOOKS_DATABASE } from "./database.js";
import { createBooksQueryApi } from "./query-api.js";

export const BOOKS_QUERY_API = createBooksQueryApi(BOOKS_DATABASE);

export const {
    listBooks,
    listPublishedBooks,
    getBookBySlug,
    listBookSections,
    listChaptersForBookSection,
    getChapterBySlug,
    listChapterSections,
    listVersesForChapterSection,
    listVersesForChapter,
    getFirstChapterForBook,
    getVerseByChapterAndNumber,
    getBookCounts,
    getChapterVerseCount,
    books,
    bookSections,
    chapters,
    chapterSections,
    verses,
} = BOOKS_QUERY_API;
