import { createBooksDatabase } from "./schema.js";

const EMPTY_TABLES = Object.freeze({
    books: [],
    book_sections: [],
    chapters: [],
    chapter_sections: [],
    verses: [],
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
            books,
            book_sections,
            chapters,
            chapter_sections,
            verses,
        ] = await Promise.all([
            readJson("/content/data/books.json"),
            readJson("/content/data/book_sections.json"),
            readJson("/content/data/chapters.json"),
            readJson("/content/data/chapter_sections.json"),
            readJson("/content/data/verses.json"),
        ]);

        return {
            books,
            book_sections,
            chapters,
            chapter_sections,
            verses,
        };
    } catch (error) {
        console.error("Failed to load content tables.", error);
        return { ...EMPTY_TABLES };
    }
}

export const RAW_BOOKS_TABLES = Object.freeze(await loadRawTables());
function createSafeDatabase(rawTables) {
    try {
        return createBooksDatabase(rawTables);
    } catch (error) {
        console.error("Failed to build books database from JSON tables.", error);
        return createBooksDatabase({ ...EMPTY_TABLES });
    }
}

export const DATABASE = createSafeDatabase(RAW_BOOKS_TABLES);
export const BOOKS_DATABASE = DATABASE;
export const BOOKS = DATABASE.books;
export const BOOK_SECTIONS = DATABASE.bookSections;
export const CHAPTERS = DATABASE.chapters;
export const CHAPTER_SECTIONS = DATABASE.chapterSections;
export const VERSES = DATABASE.verses;
