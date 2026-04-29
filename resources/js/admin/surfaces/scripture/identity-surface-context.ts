export type IdentitySurfaceSemanticContext = 'page' | 'row';

export type ChapterIdentitySurfaceContext = 'chapter_page' | 'book_page_row';
export type VerseIdentitySurfaceContext = 'verse_page' | 'chapter_page_row';

type IdentitySurfaceContextConfig = {
    regionKey: string;
    semanticContext: IdentitySurfaceSemanticContext;
    editorDescription: string;
};

const CHAPTER_IDENTITY_CONTEXT_CONFIG: Record<
    ChapterIdentitySurfaceContext,
    IdentitySurfaceContextConfig
> = {
    chapter_page: {
        regionKey: 'chapter_identity',
        semanticContext: 'page',
        editorDescription:
            'Update the canonical chapter slug, number, and title without leaving the public chapter page.',
    },
    book_page_row: {
        regionKey: 'chapter_list_row_identity',
        semanticContext: 'row',
        editorDescription:
            'Update the canonical chapter slug, number, and title directly from this chapter row on the book page.',
    },
};

const VERSE_IDENTITY_CONTEXT_CONFIG: Record<
    VerseIdentitySurfaceContext,
    IdentitySurfaceContextConfig
> = {
    verse_page: {
        regionKey: 'verse_identity',
        semanticContext: 'page',
        editorDescription:
            'Update the canonical verse text, number, and slug without leaving the public verse detail page.',
    },
    chapter_page_row: {
        regionKey: 'verse_list_row_identity',
        semanticContext: 'row',
        editorDescription:
            'Update the canonical verse text, number, and slug directly from this verse row on the chapter page.',
    },
};

export function resolveChapterIdentitySurfaceContext(
    context: ChapterIdentitySurfaceContext,
): IdentitySurfaceContextConfig {
    return CHAPTER_IDENTITY_CONTEXT_CONFIG[context];
}

export function resolveVerseIdentitySurfaceContext(
    context: VerseIdentitySurfaceContext,
): IdentitySurfaceContextConfig {
    return VERSE_IDENTITY_CONTEXT_CONFIG[context];
}
