import {
    BOOK_CHAPTER_GROUPS_SURFACE_KEY,
    BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
    BOOKS_COLLECTION_SURFACE_KEY,
    CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
    CHAPTER_VERSE_GROUPS_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import { createInlineEditorSurface } from '@/admin/surfaces/core/surface-builders';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type {
    ScriptureBook,
    ScriptureBookSection,
    ScriptureChapter,
    ScriptureChapterSection,
} from '@/types';
import type {
    SectionCollectionSurfaceMetadata,
    SectionCreateFieldMetadata,
    SectionCreateMetadata,
    SectionGroupSurfaceMetadata,
} from './surface-types';

type BooksCollectionSurfaceArgs = {
    bookCount: number;
    storeHref: string | null;
};

type BookChapterGroupsSurfaceArgs = {
    book: ScriptureBook;
    groupCount: number;
    chapterCount: number;
    canonicalEditHref: string | null;
    bookSectionStoreHref: string | null;
};

type BookSectionChapterGroupSurfaceArgs = {
    bookSection: ScriptureBookSection;
    title: string;
    chapterCount: number;
};

type ChapterVerseGroupsSurfaceArgs = {
    chapter: ScriptureChapter;
    groupCount: number;
    verseCount: number;
    readerHref: string | null;
    chapterSectionStoreHref: string | null;
};

type ChapterSectionVerseGroupSurfaceArgs = {
    chapterSection: ScriptureChapterSection;
    title: string;
    primaryCount: number;
    primaryLabel: string;
    secondaryCount?: number | null;
    secondaryLabel?: string | null;
    openHref: string | null;
    openLabel?: string | null;
};

const SECTION_ROW_FIELDS = [
    {
        key: 'slug',
        label: 'Slug',
        placeholder: 'section-slug',
        required: true,
    },
    {
        key: 'number',
        label: 'Number',
        placeholder: '1',
        required: false,
    },
    {
        key: 'title',
        label: 'Title',
        placeholder: 'Section title',
        required: false,
    },
] as const satisfies readonly SectionCreateFieldMetadata[];

const BOOK_FIELDS = [
    {
        key: 'slug',
        label: 'Slug',
        placeholder: 'book-slug',
        required: true,
    },
    {
        key: 'number',
        label: 'Number',
        placeholder: '1',
        required: false,
    },
    {
        key: 'title',
        label: 'Title',
        placeholder: 'Book title',
        required: true,
    },
] as const satisfies readonly SectionCreateFieldMetadata[];

const VERSE_FIELDS = [
    {
        key: 'slug',
        label: 'Slug',
        placeholder: 'verse-slug',
        required: true,
    },
    {
        key: 'number',
        label: 'Number',
        placeholder: '1',
        required: false,
    },
    {
        key: 'text',
        label: 'Verse text',
        placeholder: 'Enter the canonical verse text.',
        required: true,
        multiline: true,
    },
] as const satisfies readonly SectionCreateFieldMetadata[];

function createSectionCreateMetadata(
    createHref: string | null,
    entityLabel: string,
    parentLabel: string | null,
    fields: readonly SectionCreateFieldMetadata[],
): SectionCreateMetadata | null {
    if (createHref === null) {
        return null;
    }

    return {
        createHref,
        entityLabel,
        parentLabel,
        fields,
    };
}

export function createBooksCollectionSurface({
    bookCount,
    storeHref,
}: BooksCollectionSurfaceArgs): AdminSurfaceContract<SectionCollectionSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: BOOKS_COLLECTION_SURFACE_KEY,
        contractKey: 'section_collection',
        entity: 'book',
        entityId: 'library',
        regionKey: 'books_collection',
        capabilities: storeHref === null ? [] : ['create_row'],
        presentation: {
            placement: 'header_tools',
            variant: 'compact',
        },
        metadata: {
            title: 'Canonical library rows',
            groupLabel: 'books',
            groupCount: bookCount,
            itemLabel: 'books',
            itemCount: bookCount,
            openHref: null,
            openLabel: null,
            structureHref: null,
            structureLabel: null,
            create: createSectionCreateMetadata(
                storeHref,
                'Book',
                null,
                BOOK_FIELDS,
            ),
        },
    });
}

export function createBookChapterGroupsSurface({
    book,
    groupCount,
    chapterCount,
    canonicalEditHref,
    bookSectionStoreHref,
}: BookChapterGroupsSurfaceArgs): AdminSurfaceContract<SectionCollectionSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: BOOK_CHAPTER_GROUPS_SURFACE_KEY,
        contractKey: 'section_collection',
        entity: 'book',
        entityId: book.id,
        regionKey: 'canonical_browse',
        capabilities: [
            'full_edit',
            ...(bookSectionStoreHref === null ? [] : ['create_row' as const]),
        ],
        presentation: {
            placement: 'header_tools',
            variant: 'compact',
        },
        metadata: {
            title: 'Canonical chapter groups',
            groupLabel: 'book sections',
            groupCount,
            itemLabel: 'chapters',
            itemCount: chapterCount,
            openHref: null,
            openLabel: null,
            structureHref:
                canonicalEditHref === null
                    ? null
                    : buildScriptureAdminSectionHref(
                          canonicalEditHref,
                          'canonical_browse',
                      ),
            structureLabel: 'Canonical Structure',
            create: createSectionCreateMetadata(
                bookSectionStoreHref,
                'Book Section',
                book.title,
                SECTION_ROW_FIELDS,
            ),
        },
    });
}

export function createBookSectionChapterGroupSurface({
    bookSection,
    title,
    chapterCount,
}: BookSectionChapterGroupSurfaceArgs): AdminSurfaceContract<SectionGroupSurfaceMetadata> {
    const hasEditCapability =
        bookSection.admin?.details_update_href !== undefined &&
        bookSection.admin?.details_update_href !== null;
    const hasCreateCapability =
        bookSection.admin?.child_store_href !== undefined &&
        bookSection.admin?.child_store_href !== null;

    return createInlineEditorSurface({
        surfaceKey: BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
        contractKey: 'section_group',
        entity: 'book_section',
        entityId: bookSection.id,
        regionKey: 'chapter_group',
        capabilities: [
            ...(hasEditCapability ? (['edit'] as const) : []),
            ...(hasCreateCapability ? (['create_row'] as const) : []),
        ],
        presentation: {
            placement: 'inline',
            variant: 'compact',
        },
        metadata: {
            title,
            groupLabel: 'Book section',
            rowNumber: bookSection.number,
            rowTitle: bookSection.title,
            primaryCount: chapterCount,
            primaryLabel: 'chapters',
            secondaryCount: null,
            secondaryLabel: null,
            openHref: null,
            openLabel: null,
            updateHref: bookSection.admin?.details_update_href ?? null,
            introBlock: bookSection.admin?.primary_intro_block ?? null,
            introBlockTypes: bookSection.admin?.intro_block_types ?? [],
            introStoreHref: bookSection.admin?.intro_store_href ?? null,
            introUpdateHref:
                bookSection.admin?.primary_intro_update_href ?? null,
            introDefaultRegion:
                bookSection.admin?.intro_default_region ?? null,
            create: createSectionCreateMetadata(
                bookSection.admin?.child_store_href ?? null,
                'Chapter',
                title,
                SECTION_ROW_FIELDS,
            ),
        },
    });
}

export function createChapterVerseGroupsSurface({
    chapter,
    groupCount,
    verseCount,
    readerHref,
    chapterSectionStoreHref,
}: ChapterVerseGroupsSurfaceArgs): AdminSurfaceContract<SectionCollectionSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_VERSE_GROUPS_SURFACE_KEY,
        contractKey: 'section_collection',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'chapter_sections',
        capabilities:
            chapterSectionStoreHref === null ? [] : ['create_row'],
        presentation: {
            placement: 'header_tools',
            variant: 'compact',
        },
        metadata: {
            title: 'Reader section groups',
            groupLabel: 'chapter sections',
            groupCount,
            itemLabel: 'verses',
            itemCount: verseCount,
            openHref: readerHref,
            openLabel: 'Open Reader',
            structureHref: null,
            structureLabel: null,
            create: createSectionCreateMetadata(
                chapterSectionStoreHref,
                'Chapter Section',
                chapter.title ?? chapter.number ?? 'Chapter',
                SECTION_ROW_FIELDS,
            ),
        },
    });
}

export function createChapterSectionVerseGroupSurface({
    chapterSection,
    title,
    primaryCount,
    primaryLabel,
    secondaryCount = null,
    secondaryLabel = null,
    openHref,
    openLabel = 'Open Group',
}: ChapterSectionVerseGroupSurfaceArgs): AdminSurfaceContract<SectionGroupSurfaceMetadata> {
    const hasEditCapability =
        chapterSection.admin?.details_update_href !== undefined &&
        chapterSection.admin?.details_update_href !== null;
    const hasCreateCapability =
        chapterSection.admin?.child_store_href !== undefined &&
        chapterSection.admin?.child_store_href !== null;

    return createInlineEditorSurface({
        surfaceKey: CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
        contractKey: 'section_group',
        entity: 'chapter_section',
        entityId: chapterSection.id,
        regionKey: 'verse_group',
        capabilities: [
            ...(hasEditCapability ? (['edit'] as const) : []),
            ...(hasCreateCapability ? (['create_row'] as const) : []),
        ],
        presentation: {
            placement: 'inline',
            variant: 'compact',
        },
        metadata: {
            title,
            groupLabel: 'Chapter section',
            rowNumber: chapterSection.number,
            rowTitle: chapterSection.title,
            primaryCount,
            primaryLabel,
            secondaryCount,
            secondaryLabel,
            openHref,
            openLabel,
            updateHref: chapterSection.admin?.details_update_href ?? null,
            introBlock: chapterSection.admin?.primary_intro_block ?? null,
            introBlockTypes: chapterSection.admin?.intro_block_types ?? [],
            introStoreHref: chapterSection.admin?.intro_store_href ?? null,
            introUpdateHref:
                chapterSection.admin?.primary_intro_update_href ?? null,
            introDefaultRegion:
                chapterSection.admin?.intro_default_region ?? null,
            create: createSectionCreateMetadata(
                chapterSection.admin?.child_store_href ?? null,
                'Verse',
                title,
                VERSE_FIELDS,
            ),
        },
    });
}

