import type { ScriptureReaderLanguage } from '@/types/scripture';

type ScriptureSectionLike = {
    slug: string;
    title: string | null;
};

/**
 * The canonical hierarchy always keeps section layers present, even when a
 * book or chapter only has one structural "main" section. Public pages hide
 * those generic labels so readers see the text flow, not the storage detail.
 */
export const isGenericSectionLabel = (
    slug: string,
    title: string | null,
): boolean => {
    const normalizedSlug = normalizeSectionText(slug);
    const normalizedTitle = normalizeSectionText(title);

    return (
        normalizedTitle === 'main' ||
        normalizedTitle === 'main text' ||
        normalizedTitle === 'main passage' ||
        normalizedSlug === 'main' ||
        normalizedSlug === 'main-text' ||
        normalizedSlug.endsWith('-main')
    );
};

export const hidesSingleGenericSection = (
    sections: ScriptureSectionLike[],
): boolean => {
    return (
        sections.length === 1 &&
        isGenericSectionLabel(sections[0].slug, sections[0].title)
    );
};

export const sectionAnchorId = (slug: string): string => `section-${slug}`;

export const sectionLabel = (
    number: string | null,
    title: string | null,
): string => {
    if (number && title) {
        return `Section ${number}: ${title}`;
    }

    if (number) {
        return `Section ${number}`;
    }

    return title ?? 'Section';
};

export const chapterLabel = (
    number: string | null,
    title: string | null,
): string => {
    if (number && title) {
        return `Chapter ${number}: ${title}`;
    }

    if (number) {
        return `Chapter ${number}`;
    }

    return title ?? 'Chapter';
};

export const verseLabel = (number: string | null): string => {
    return number ? `Verse ${number}` : 'Verse';
};

export const languageLabel = (language: ScriptureReaderLanguage): string => {
    return language === 'hi' ? 'Hindi' : 'English';
};

const normalizeSectionText = (value: string | null): string =>
    value?.trim().toLowerCase() ?? '';
