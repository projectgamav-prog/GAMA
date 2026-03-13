import {
    normalizeBookSlug,
    normalizeChapterSlug,
} from "./schema.js";

function sortByUiOrder(records) {
    return [...records].sort((a, b) => a.ui_order - b.ui_order);
}

function sortByVerseNumber(records) {
    return [...records].sort((a, b) => a.verse_number - b.verse_number);
}

function getVersesByRange(indexes, chapterId, verseStart, verseEnd) {
    return sortByVerseNumber(indexes.versesByChapterId[chapterId] || []).filter((verse) => {
        if (verseStart == null || verseEnd == null) {
            return true;
        }

        return verse.verse_number >= verseStart && verse.verse_number <= verseEnd;
    });
}

export function createBooksQueryApi(database) {
    const {
        books,
        bookSections,
        chapters,
        chapterSections,
        verses,
        indexes,
    } = database;

    function getBookBySlug(slug) {
        return indexes.booksBySlug[normalizeBookSlug(slug)] || null;
    }

    function listBooks() {
        return sortByUiOrder(books);
    }

    function listPublishedBooks() {
        return listBooks().filter((book) => book.is_published);
    }

    function listBookSections(bookId) {
        return sortByUiOrder(indexes.bookSectionsByBookId[bookId] || []);
    }

    function listChaptersForBookSection(sectionId) {
        const section = indexes.bookSectionsById[sectionId];
        if (!section) return [];

        return [...(indexes.chaptersBySourceBookId[section.source_book_id] || [])]
            .filter((chapter) => {
                if (section.chapter_start == null || section.chapter_end == null) {
                    return false;
                }

                return chapter.chapter_number >= section.chapter_start && chapter.chapter_number <= section.chapter_end;
            })
            .sort((a, b) => a.chapter_number - b.chapter_number);
    }

    function getChapterBySlug(sourceBookSlug, chapterSlug) {
        const sourceBook = getBookBySlug(sourceBookSlug);
        if (!sourceBook || sourceBook.book_type !== "source") return null;

        const lookupKey = `${sourceBook.id}:${normalizeChapterSlug(chapterSlug)}`;
        return indexes.chapterBySourceBookAndSlug[lookupKey] || null;
    }

    function listChapterSections(chapterId) {
        return sortByUiOrder(indexes.chapterSectionsByChapterId[chapterId] || []);
    }

    function listVersesForChapterSection(chapterSectionId) {
        const section = indexes.chapterSectionsById[chapterSectionId];
        if (!section) return [];

        return getVersesByRange(indexes, section.chapter_id, section.verse_start, section.verse_end);
    }

    function listVersesForChapter(chapterId) {
        return sortByVerseNumber(indexes.versesByChapterId[chapterId] || []);
    }

    function getFirstChapterForBook(bookId) {
        const sections = listBookSections(bookId);

        for (const section of sections) {
            const chaptersForSection = listChaptersForBookSection(section.id);
            if (chaptersForSection.length) {
                return chaptersForSection[0];
            }
        }

        return null;
    }

    function getVerseByChapterAndNumber(chapterId, verseNumber) {
        return indexes.versesByChapterAndNumber[`${chapterId}:${verseNumber}`] || null;
    }

    function getChapterVerseCount(chapterId) {
        const verseIds = new Set();

        listChapterSections(chapterId).forEach((section) => {
            listVersesForChapterSection(section.id).forEach((verse) => {
                verseIds.add(verse.id);
            });
        });

        return verseIds.size;
    }

    function getBookCounts(bookId) {
        const chapterIds = new Set();
        const verseIds = new Set();

        listBookSections(bookId).forEach((section) => {
            listChaptersForBookSection(section.id).forEach((chapter) => {
                chapterIds.add(chapter.id);

                listChapterSections(chapter.id).forEach((chapterSection) => {
                    listVersesForChapterSection(chapterSection.id).forEach((verse) => {
                        verseIds.add(verse.id);
                    });
                });
            });
        });

        return {
            chapter_count: chapterIds.size,
            verse_count: verseIds.size,
        };
    }

    return Object.freeze({
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
    });
}
