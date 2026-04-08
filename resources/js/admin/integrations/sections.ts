import { hierarchyCreateEditorModule } from '@/admin/modules/sections/HierarchyCreateEditor';
import { sectionCollectionPanelModule } from '@/admin/modules/sections/SectionCollectionPanel';
import { sectionGroupPanelModule } from '@/admin/modules/sections/SectionGroupPanel';
import { sectionIntroEditorModule } from '@/admin/modules/sections/SectionIntroEditor';
import { sectionRowDetailEditorModule } from '@/admin/modules/sections/SectionRowDetailEditor';
import {
    createBookChapterGroupsSurface,
    createBookSectionActionsSurface,
    createBookSectionChapterGroupSurface,
    createBooksCollectionSurface,
    createChapterSectionActionsSurface,
    createChapterSectionVerseGroupSurface,
    createChapterVerseGroupsSurface,
} from '@/admin/surfaces/sections/surface-builders';
import type {
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureBookSection,
    ScriptureBooksIndexAdmin,
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterSection,
} from '@/types';

export {
    hierarchyCreateEditorModule,
    sectionCollectionPanelModule,
    sectionGroupPanelModule,
    sectionIntroEditorModule,
    sectionRowDetailEditorModule,
};

export const sectionAdminModules = [
    sectionCollectionPanelModule,
    sectionGroupPanelModule,
    hierarchyCreateEditorModule,
    sectionIntroEditorModule,
    sectionRowDetailEditorModule,
] as const;

export function resolveBooksCollectionSurface({
    bookCount,
    admin,
    enabled = true,
}: {
    bookCount: number;
    admin?: ScriptureBooksIndexAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return null;
    }

    return createBooksCollectionSurface({
        bookCount,
        storeHref: admin.store_href,
    });
}

export function resolveBookChapterGroupsSurface({
    book,
    bookSections,
    admin,
    enabled = true,
}: {
    book: ScriptureBook;
    bookSections: Array<ScriptureBookSection & { chapters: ScriptureChapter[] }>;
    admin?: ScriptureBookAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return null;
    }

    const totalChapterCount = bookSections.reduce(
        (sum, section) => sum + section.chapters.length,
        0,
    );

    return createBookChapterGroupsSurface({
        book,
        groupCount: bookSections.length,
        chapterCount: totalChapterCount,
        canonicalEditHref: admin.canonical_edit_href,
        bookSectionStoreHref: admin.book_section_store_href,
    });
}

export function resolveBookSectionChapterGroupSurface({
    bookSection,
    title,
    enabled = true,
}: {
    bookSection: ScriptureBookSection & { chapters: ScriptureChapter[] };
    title: string;
    enabled?: boolean;
}) {
    if (!enabled) {
        return null;
    }

    return createBookSectionChapterGroupSurface({
        bookSection,
        title,
        chapterCount: bookSection.chapters.length,
    });
}

export function resolveBookSectionActionsSurface({
    bookSection,
    title,
    enabled = true,
}: {
    bookSection: ScriptureBookSection & { chapters: ScriptureChapter[] };
    title: string;
    enabled?: boolean;
}) {
    if (!enabled || !bookSection.admin?.destroy_href) {
        return null;
    }

    return createBookSectionActionsSurface({
        bookSection,
        title,
    });
}

export function resolveChapterVerseGroupsSurface({
    chapter,
    chapterSections,
    admin,
    enabled = true,
}: {
    chapter: ScriptureChapter;
    chapterSections: Array<
        ScriptureChapterSection & {
            verses_count?: number;
        }
    >;
    admin?: Pick<ScriptureChapterAdmin, 'chapter_section_store_href'> | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return null;
    }

    const verseCount = chapterSections.reduce(
        (sum, section) => sum + (section.verses_count ?? 0),
        0,
    );

    return createChapterVerseGroupsSurface({
        chapter,
        groupCount: chapterSections.length,
        verseCount,
        chapterSectionStoreHref: admin.chapter_section_store_href,
    });
}

export function resolveChapterSectionVerseGroupSurface({
    chapterSection,
    title,
    primaryCount,
    primaryLabel,
    secondaryCount = null,
    secondaryLabel = null,
    openHref,
    openLabel,
    enabled = true,
}: {
    chapterSection: ScriptureChapterSection;
    title: string;
    primaryCount: number;
    primaryLabel: string;
    secondaryCount?: number | null;
    secondaryLabel?: string | null;
    openHref: string | null;
    openLabel?: string | null;
    enabled?: boolean;
}) {
    if (!enabled) {
        return null;
    }

    return createChapterSectionVerseGroupSurface({
        chapterSection,
        title,
        primaryCount,
        primaryLabel,
        secondaryCount,
        secondaryLabel,
        openHref,
        openLabel,
    });
}

export function resolveChapterSectionActionsSurface({
    chapterSection,
    title,
    enabled = true,
}: {
    chapterSection: ScriptureChapterSection;
    title: string;
    enabled?: boolean;
}) {
    if (!enabled || !chapterSection.admin?.destroy_href) {
        return null;
    }

    return createChapterSectionActionsSurface({
        chapterSection,
        title,
    });
}
