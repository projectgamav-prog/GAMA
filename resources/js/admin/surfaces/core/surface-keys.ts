import type { ScriptureEntityType } from '@/types';

export const BOOKS_COLLECTION_SURFACE_KEY = 'books.collection' as const;
export const BOOK_INTRO_SURFACE_KEY = 'book.intro' as const;
export const BOOK_CONTENT_BLOCKS_SURFACE_KEY =
    'book.content_blocks' as const;
export const BOOK_MEDIA_SLOTS_SURFACE_KEY = 'book.media_slots' as const;
export const BOOK_CHAPTER_GROUPS_SURFACE_KEY = 'book.chapter_groups' as const;
export const BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY =
    'book_section.chapter_group' as const;

export const CHAPTER_INTRO_SURFACE_KEY = 'chapter.intro' as const;
export const CHAPTER_CONTENT_BLOCKS_SURFACE_KEY =
    'chapter.content_blocks' as const;
export const CHAPTER_VERSE_GROUPS_SURFACE_KEY =
    'chapter.verse_groups' as const;
export const CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY =
    'chapter_section.verse_group' as const;

export const VERSE_INTRO_SURFACE_KEY = 'verse.intro' as const;
export const VERSE_META_SURFACE_KEY = 'verse.meta' as const;
export const VERSE_NOTES_SURFACE_KEY = 'verse.notes' as const;

export const ADMIN_SURFACE_KEYS = {
    book: {
        collection: BOOKS_COLLECTION_SURFACE_KEY,
        intro: BOOK_INTRO_SURFACE_KEY,
        contentBlocks: BOOK_CONTENT_BLOCKS_SURFACE_KEY,
        mediaSlots: BOOK_MEDIA_SLOTS_SURFACE_KEY,
        chapterGroups: BOOK_CHAPTER_GROUPS_SURFACE_KEY,
    },
    bookSection: {
        chapterGroup: BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
    },
    chapter: {
        intro: CHAPTER_INTRO_SURFACE_KEY,
        contentBlocks: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        verseGroups: CHAPTER_VERSE_GROUPS_SURFACE_KEY,
    },
    chapterSection: {
        verseGroup: CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
    },
    verse: {
        intro: VERSE_INTRO_SURFACE_KEY,
        meta: VERSE_META_SURFACE_KEY,
        notes: VERSE_NOTES_SURFACE_KEY,
    },
} as const;

export type KnownAdminSurfaceKey =
    | typeof BOOKS_COLLECTION_SURFACE_KEY
    | typeof BOOK_INTRO_SURFACE_KEY
    | typeof BOOK_CONTENT_BLOCKS_SURFACE_KEY
    | typeof BOOK_MEDIA_SLOTS_SURFACE_KEY
    | typeof BOOK_CHAPTER_GROUPS_SURFACE_KEY
    | typeof BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY
    | typeof CHAPTER_INTRO_SURFACE_KEY
    | typeof CHAPTER_CONTENT_BLOCKS_SURFACE_KEY
    | typeof CHAPTER_VERSE_GROUPS_SURFACE_KEY
    | typeof CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY
    | typeof VERSE_INTRO_SURFACE_KEY
    | typeof VERSE_META_SURFACE_KEY
    | typeof VERSE_NOTES_SURFACE_KEY;

export type AdminSurfaceKey = KnownAdminSurfaceKey | `${string}.${string}`;

export function resolveSemanticSurfaceKey(
    entity: ScriptureEntityType,
    regionKey?: string | null,
): AdminSurfaceKey | null {
    if (!regionKey) {
        return null;
    }

    switch (`${entity}:${regionKey}`) {
        case 'book:page_intro':
        case 'book:book_intro':
            return BOOK_INTRO_SURFACE_KEY;
        case 'book:books_collection':
        case 'book:library_collection':
            return BOOKS_COLLECTION_SURFACE_KEY;
        case 'book:content_blocks':
            return BOOK_CONTENT_BLOCKS_SURFACE_KEY;
        case 'book:book_media_slots':
            return BOOK_MEDIA_SLOTS_SURFACE_KEY;
        case 'book:canonical_browse':
        case 'book:chapter_groups':
            return BOOK_CHAPTER_GROUPS_SURFACE_KEY;
        case 'book_section:canonical_browse_section':
        case 'book_section:chapter_group':
            return BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY;
        case 'chapter:page_intro':
        case 'chapter:chapter_intro':
            return CHAPTER_INTRO_SURFACE_KEY;
        case 'chapter:content_blocks':
            return CHAPTER_CONTENT_BLOCKS_SURFACE_KEY;
        case 'chapter:chapter_sections':
        case 'chapter:verse_groups':
            return CHAPTER_VERSE_GROUPS_SURFACE_KEY;
        case 'chapter_section:reader_section':
        case 'chapter_section:verse_group':
            return CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY;
        case 'verse:verse_intro':
            return VERSE_INTRO_SURFACE_KEY;
        case 'verse:verse_notes':
            return VERSE_META_SURFACE_KEY;
        case 'verse:content_blocks':
            return VERSE_NOTES_SURFACE_KEY;
        default:
            return `${entity}.${regionKey}`;
    }
}
