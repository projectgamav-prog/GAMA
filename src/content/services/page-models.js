import {
    getCanonicalBookBySlug,
    getCanonicalChapterByRoute,
    getCanonicalCharacterBySlug,
    getCanonicalFirstChapterForBook,
    getCanonicalVerseByNumber,
    listCanonicalBookSections,
    listCanonicalChapterSections,
    listCanonicalChaptersForBookSection,
    listCanonicalVersesForChapter,
    listCanonicalVersesForChapterSection,
} from "../repositories/canonical-content-repository.js";
import {
    buildRegionMap,
    listContentBlocksForOwner,
    synthesizeExplanationBlocksForVerse,
    synthesizeInsightBlocksFromRecord,
} from "../repositories/cms-content-repository.js";

function resolveOwnerRegions(record, ownerEntity, options = {}) {
    if (!record) {
        return buildRegionMap([]);
    }

    const blockOptions = {
        includeDraft: options.includeDraft === true,
        includeHidden: options.includeHidden === true,
    };

    const cmsBlocks = listContentBlocksForOwner(ownerEntity, record.id, blockOptions);
    if (cmsBlocks.length) {
        return buildRegionMap(cmsBlocks);
    }

    return buildRegionMap(synthesizeInsightBlocksFromRecord(record, ownerEntity, record.id));
}

function resolveVerseBodyRegions(verse, options = {}) {
    if (!verse) {
        return buildRegionMap([]);
    }

    const cmsBlocks = listContentBlocksForOwner("verses", verse.id, {
        includeDraft: options.includeDraft === true,
        includeHidden: options.includeHidden === true,
    });

    if (cmsBlocks.some((block) => block.region === "body")) {
        return buildRegionMap(cmsBlocks);
    }

    const legacyBlocks = synthesizeExplanationBlocksForVerse(verse.id, {
        includeDraft: options.includeDraft === true,
        includeHidden: options.includeHidden === true,
    });

    if (legacyBlocks.length) {
        return buildRegionMap(legacyBlocks);
    }

    return buildRegionMap(cmsBlocks);
}

export function getBookPageModel(bookSlug, options = {}) {
    const book = getCanonicalBookBySlug(bookSlug);
    if (!book) {
        return null;
    }

    const sections = listCanonicalBookSections(book.id).map((section) => ({
        record: section,
        regions: resolveOwnerRegions(section, "book_sections", options),
        chapters: listCanonicalChaptersForBookSection(section.id).map((chapter) => ({
            record: chapter,
            regions: resolveOwnerRegions(chapter, "chapters", options),
        })),
    }));

    return Object.freeze({
        book,
        regions: resolveOwnerRegions(book, "books", options),
        sections: Object.freeze(sections),
        firstChapter: getCanonicalFirstChapterForBook(book.id),
    });
}

export function getChapterPageModel(bookSlug, chapterSlug, options = {}) {
    const book = getCanonicalBookBySlug(bookSlug);
    const chapter = book ? getCanonicalChapterByRoute(bookSlug, chapterSlug) : null;

    if (!book || !chapter) {
        return null;
    }

    const sections = listCanonicalChapterSections(chapter.id).map((section) => ({
        record: section,
        regions: resolveOwnerRegions(section, "chapter_sections", options),
        verses: listCanonicalVersesForChapterSection(section.id).map((verse) => ({
            record: verse,
            regions: resolveOwnerRegions(verse, "verses", options),
        })),
    }));

    return Object.freeze({
        book,
        chapter,
        regions: resolveOwnerRegions(chapter, "chapters", options),
        sections: Object.freeze(sections),
    });
}

export function getVersePageModel(bookSlug, chapterSlug, verseNumber, options = {}) {
    const book = getCanonicalBookBySlug(bookSlug);
    const chapter = book ? getCanonicalChapterByRoute(bookSlug, chapterSlug) : null;
    const verses = chapter ? listCanonicalVersesForChapter(chapter.id) : [];
    const verse = chapter && Number.isInteger(verseNumber)
        ? getCanonicalVerseByNumber(chapter.id, verseNumber)
        : verses[0] || null;

    if (!book || !chapter || !verse) {
        return null;
    }

    const sections = listCanonicalChapterSections(chapter.id).map((section) => ({
        record: section,
        regions: resolveOwnerRegions(section, "chapter_sections", options),
        verses: listCanonicalVersesForChapterSection(section.id).map((entry) => ({
            record: entry,
            regions: resolveOwnerRegions(entry, "verses", options),
        })),
    }));

    return Object.freeze({
        book,
        chapter,
        verse,
        verses: Object.freeze(verses),
        regions: resolveOwnerRegions(verse, "verses", options),
        bodyRegions: resolveVerseBodyRegions(verse, options),
        sections: Object.freeze(sections),
    });
}

export function getCharacterPageModel(characterSlug, options = {}) {
    const character = getCanonicalCharacterBySlug(characterSlug);
    if (!character) {
        return null;
    }

    return Object.freeze({
        character,
        regions: resolveOwnerRegions(character, "characters", options),
    });
}
