import { deepFreeze } from "../../core/data/freeze.js";
import { BOOKS_DATABASE } from "../books/database.js";
import { BOOKS_QUERY_API } from "../books/queries.js";
import { CHARACTERS_DATABASE } from "../characters/database.js";
import { getCharacterBySlug, listCharacters } from "../characters/queries.js";

export const CANONICAL_CONTENT_DATABASE = deepFreeze({
    ...BOOKS_DATABASE,
    characters: CHARACTERS_DATABASE.characters,
    indexes: deepFreeze({
        ...BOOKS_DATABASE.indexes,
        ...CHARACTERS_DATABASE.indexes,
    }),
});

export function listCanonicalBooks({ includeUnpublished = false } = {}) {
    const books = includeUnpublished ? BOOKS_QUERY_API.listBooks() : BOOKS_QUERY_API.listPublishedBooks();
    return books.map((book) => ({ ...book }));
}

export function getCanonicalBookBySlug(bookSlug) {
    return BOOKS_QUERY_API.getBookBySlug(bookSlug);
}

export function listCanonicalBookSections(bookId) {
    return BOOKS_QUERY_API.listBookSections(bookId);
}

export function listCanonicalChaptersForBookSection(sectionId) {
    return BOOKS_QUERY_API.listChaptersForBookSection(sectionId);
}

export function getCanonicalChapterByRoute(bookSlug, chapterSlug) {
    return BOOKS_QUERY_API.getChapterBySlug(bookSlug, chapterSlug);
}

export function listCanonicalChapterSections(chapterId) {
    return BOOKS_QUERY_API.listChapterSections(chapterId);
}

export function listCanonicalVersesForChapterSection(sectionId) {
    return BOOKS_QUERY_API.listVersesForChapterSection(sectionId);
}

export function listCanonicalVersesForChapter(chapterId) {
    return BOOKS_QUERY_API.listVersesForChapter(chapterId);
}

export function getCanonicalVerseByNumber(chapterId, verseNumber) {
    return BOOKS_QUERY_API.getVerseByChapterAndNumber(chapterId, verseNumber);
}

export function getCanonicalFirstChapterForBook(bookId) {
    return BOOKS_QUERY_API.getFirstChapterForBook(bookId);
}

export function getCanonicalBookCounts(bookId) {
    return BOOKS_QUERY_API.getBookCounts(bookId);
}

export function getCanonicalChapterVerseCount(chapterId) {
    return BOOKS_QUERY_API.getChapterVerseCount(chapterId);
}

export function listCanonicalCharacters() {
    return listCharacters();
}

export function getCanonicalCharacterBySlug(characterSlug) {
    return getCharacterBySlug(characterSlug);
}

export function resolveCanonicalRecord(ownerEntity, ownerId) {
    switch (ownerEntity) {
        case "books":
            return CANONICAL_CONTENT_DATABASE.indexes.booksById[ownerId] || null;
        case "book_sections":
            return CANONICAL_CONTENT_DATABASE.indexes.bookSectionsById[ownerId] || null;
        case "chapters":
            return CANONICAL_CONTENT_DATABASE.indexes.chaptersById[ownerId] || null;
        case "chapter_sections":
            return CANONICAL_CONTENT_DATABASE.indexes.chapterSectionsById[ownerId] || null;
        case "verses":
            return CANONICAL_CONTENT_DATABASE.indexes.versesById[ownerId] || null;
        case "characters":
            return CANONICAL_CONTENT_DATABASE.indexes.charactersById[ownerId] || null;
        default:
            return null;
    }
}
