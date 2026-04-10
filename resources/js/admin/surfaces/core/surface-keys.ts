import type { ScriptureEntityType } from '@/types';

export const BOOKS_COLLECTION_SURFACE_KEY = 'books.collection' as const;
export const BOOK_IDENTITY_SURFACE_KEY = 'book.identity' as const;
export const BOOK_INTRO_SURFACE_KEY = 'book.intro' as const;
export const BOOK_MEDIA_SLOTS_SURFACE_KEY = 'book.media_slots' as const;
export const BOOK_CHAPTER_GROUPS_SURFACE_KEY = 'book.chapter_groups' as const;
export const BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY =
    'book_section.chapter_group' as const;

export const CHAPTER_IDENTITY_SURFACE_KEY = 'chapter.identity' as const;
export const CHAPTER_INTRO_SURFACE_KEY = 'chapter.intro' as const;
export const CHAPTER_VERSE_GROUPS_SURFACE_KEY =
    'chapter.verse_groups' as const;
export const CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY =
    'chapter_section.verse_group' as const;

export const VERSE_IDENTITY_SURFACE_KEY = 'verse.identity' as const;
export const VERSE_ROW_ACTIONS_SURFACE_KEY = 'verse.row_actions' as const;
export const VERSE_INTRO_SURFACE_KEY = 'verse.intro' as const;
export const VERSE_META_SURFACE_KEY = 'verse.meta' as const;
export const VERSE_TRANSLATIONS_SURFACE_KEY = 'verse.translations' as const;
export const VERSE_COMMENTARIES_SURFACE_KEY = 'verse.commentaries' as const;

export const ADMIN_SURFACE_KEYS = {
    book: {
        collection: BOOKS_COLLECTION_SURFACE_KEY,
        identity: BOOK_IDENTITY_SURFACE_KEY,
        intro: BOOK_INTRO_SURFACE_KEY,
        mediaSlots: BOOK_MEDIA_SLOTS_SURFACE_KEY,
        chapterGroups: BOOK_CHAPTER_GROUPS_SURFACE_KEY,
    },
    bookSection: {
        chapterGroup: BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
    },
    chapter: {
        identity: CHAPTER_IDENTITY_SURFACE_KEY,
        intro: CHAPTER_INTRO_SURFACE_KEY,
        verseGroups: CHAPTER_VERSE_GROUPS_SURFACE_KEY,
    },
    chapterSection: {
        verseGroup: CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
    },
    verse: {
        identity: VERSE_IDENTITY_SURFACE_KEY,
        rowActions: VERSE_ROW_ACTIONS_SURFACE_KEY,
        intro: VERSE_INTRO_SURFACE_KEY,
        meta: VERSE_META_SURFACE_KEY,
        translations: VERSE_TRANSLATIONS_SURFACE_KEY,
        commentaries: VERSE_COMMENTARIES_SURFACE_KEY,
    },
} as const;

export type KnownAdminSurfaceKey =
    | typeof BOOKS_COLLECTION_SURFACE_KEY
    | typeof BOOK_IDENTITY_SURFACE_KEY
    | typeof BOOK_INTRO_SURFACE_KEY
    | typeof BOOK_MEDIA_SLOTS_SURFACE_KEY
    | typeof BOOK_CHAPTER_GROUPS_SURFACE_KEY
    | typeof BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY
    | typeof CHAPTER_IDENTITY_SURFACE_KEY
    | typeof CHAPTER_INTRO_SURFACE_KEY
    | typeof CHAPTER_VERSE_GROUPS_SURFACE_KEY
    | typeof CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY
    | typeof VERSE_IDENTITY_SURFACE_KEY
    | typeof VERSE_ROW_ACTIONS_SURFACE_KEY
    | typeof VERSE_INTRO_SURFACE_KEY
    | typeof VERSE_META_SURFACE_KEY
    | typeof VERSE_TRANSLATIONS_SURFACE_KEY
    | typeof VERSE_COMMENTARIES_SURFACE_KEY;

export type AdminSurfaceKey = KnownAdminSurfaceKey | `${string}.${string}`;

export function resolveSemanticSurfaceKey(
    entity: ScriptureEntityType,
    regionKey?: string | null,
): AdminSurfaceKey | null {
    if (!regionKey) {
        return null;
    }

    switch (`${entity}:${regionKey}`) {
        case 'book:book_identity':
            return BOOK_IDENTITY_SURFACE_KEY;
        case 'book:book_intro':
            return BOOK_INTRO_SURFACE_KEY;
        case 'book:books_collection':
            return BOOKS_COLLECTION_SURFACE_KEY;
        case 'book:book_media_slots':
            return BOOK_MEDIA_SLOTS_SURFACE_KEY;
        case 'book:chapter_list':
            return BOOK_CHAPTER_GROUPS_SURFACE_KEY;
        case 'book_section:chapter_list_section':
            return BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY;
        case 'chapter:chapter_identity':
            return CHAPTER_IDENTITY_SURFACE_KEY;
        case 'chapter:page_intro':
            return CHAPTER_INTRO_SURFACE_KEY;
        case 'chapter:verse_list':
            return CHAPTER_VERSE_GROUPS_SURFACE_KEY;
        case 'chapter_section:verse_list_section':
            return CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY;
        case 'verse:verse_identity':
            return VERSE_IDENTITY_SURFACE_KEY;
        case 'verse:verse_row_actions':
            return VERSE_ROW_ACTIONS_SURFACE_KEY;
        case 'verse:page_intro':
            return VERSE_INTRO_SURFACE_KEY;
        case 'verse:verse_notes':
            return VERSE_META_SURFACE_KEY;
        case 'verse:translations':
            return VERSE_TRANSLATIONS_SURFACE_KEY;
        case 'verse:commentaries':
            return VERSE_COMMENTARIES_SURFACE_KEY;
        default:
            return `${entity}.${regionKey}`;
    }
}
