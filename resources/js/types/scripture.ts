export type ScriptureContentBlock = {
    id: number;
    region: string;
    block_type: string;
    title: string | null;
    body: string | null;
    data_json: Record<string, unknown> | null;
    sort_order: number;
};

export type ScriptureBook = {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    href: string;
};

export type ScriptureBookSection = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    href: string;
};

export type ScriptureChapter = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    href: string;
    verses_href?: string;
};

export type ScriptureChapterSection = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    verses_count?: number;
    href?: string;
};

export type ScriptureVerse = {
    id: number;
    slug: string;
    number: string | null;
    text: string;
    href?: string;
};

export type ScriptureReaderVerse = {
    id: number;
    slug: string;
    number: string | null;
    text: string;
    explanation_href: string;
    video_href: string | null;
    translations: {
        en: string | null;
        hi: string | null;
    };
};

export type ScriptureReaderCard = {
    id: string;
    type: 'single' | 'group';
    label: string;
    verses: ScriptureReaderVerse[];
};

export type ScriptureVerseTranslation = {
    id: number;
    source_key: string;
    source_name: string;
    language_code: string;
    text: string;
    sort_order: number;
};

export type ScriptureVerseCommentary = {
    id: number;
    source_key: string;
    source_name: string;
    author_name: string | null;
    language_code: string;
    title: string | null;
    body: string;
    sort_order: number;
};

export type BookShowProps = {
    book: ScriptureBook;
    content_blocks: ScriptureContentBlock[];
    book_sections: Array<
        ScriptureBookSection & {
            chapters: ScriptureChapter[];
        }
    >;
};

export type BooksIndexProps = {
    books: ScriptureBook[];
};

export type ChapterShowProps = {
    book: ScriptureBook;
    book_section: ScriptureBookSection;
    chapter: ScriptureChapter;
    content_blocks: ScriptureContentBlock[];
    chapter_sections: ScriptureChapterSection[];
};

export type ChapterVersesIndexProps = {
    book: ScriptureBook;
    book_section: ScriptureBookSection;
    chapter: ScriptureChapter;
    reader_languages: Array<'en' | 'hi'>;
    default_language: 'en' | 'hi' | null;
    chapter_sections: Array<
        ScriptureChapterSection & {
            cards: ScriptureReaderCard[];
        }
    >;
};

export type VerseShowProps = {
    book: ScriptureBook;
    book_section: ScriptureBookSection;
    chapter: ScriptureChapter;
    chapter_section: ScriptureChapterSection & {
        href: string;
    };
    verse: ScriptureVerse;
    previous_verse: (ScriptureVerse & { href: string }) | null;
    next_verse: (ScriptureVerse & { href: string }) | null;
    translations: ScriptureVerseTranslation[];
    commentaries: ScriptureVerseCommentary[];
    content_blocks: ScriptureContentBlock[];
};
