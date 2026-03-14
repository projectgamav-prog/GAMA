import {
    books,
    bookSections,
    chapters,
    chapterSections,
    verses,
} from "../content/books/queries.js";
import { CHARACTERS } from "../content/characters/database.js";

const ENTITY_COLLECTIONS = Object.freeze({
    books,
    book_sections: bookSections,
    chapters,
    chapter_sections: chapterSections,
    verses,
    characters: CHARACTERS,
});

export function listContentRecords(entity) {
    return ENTITY_COLLECTIONS[entity] || [];
}

export function listContentRecordsByField(entity, fieldName, value) {
    return listContentRecords(entity).filter((record) => String(record?.[fieldName] ?? "") === String(value ?? ""));
}

export function getContentRecord(entity, recordId) {
    if (!recordId) {
        return null;
    }

    return listContentRecords(entity).find((record) => record.id === recordId) || null;
}

export function getBookById(bookId) {
    return getContentRecord("books", bookId);
}

export function getBookSectionById(sectionId) {
    return getContentRecord("book_sections", sectionId);
}

export function getChapterById(chapterId) {
    return getContentRecord("chapters", chapterId);
}

export function getChapterSectionById(sectionId) {
    return getContentRecord("chapter_sections", sectionId);
}

export function getVerseById(verseId) {
    return getContentRecord("verses", verseId);
}

export function getSourceBookForChapter(chapter) {
    return chapter ? getBookById(chapter.source_book_id) : null;
}

export function getBookForBookSection(section) {
    return section ? getBookById(section.book_id) : null;
}

export function getChapterForChapterSection(section) {
    return section ? getChapterById(section.chapter_id) : null;
}

export function getChapterForVerse(verse) {
    return verse ? getChapterById(verse.chapter_id) : null;
}

export function getBookForVerse(verse) {
    return getSourceBookForChapter(getChapterForVerse(verse));
}
