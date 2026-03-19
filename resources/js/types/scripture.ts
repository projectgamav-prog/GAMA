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
    sort_order: number;
    href: string;
};

export type ScriptureBookSection = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    sort_order: number;
};

export type ScriptureChapter = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    sort_order: number;
    href: string;
    verses_href?: string;
};

export type ScriptureChapterSection = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    sort_order: number;
    verses_count?: number;
    href?: string;
};

export type ScriptureVerse = {
    id: number;
    slug: string;
    number: string | null;
    text: string;
    sort_order: number;
    href?: string;
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
    chapter_sections: Array<
        ScriptureChapterSection & {
            verses: ScriptureVerse[];
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
    translations: ScriptureVerseTranslation[];
    commentaries: ScriptureVerseCommentary[];
    content_blocks: ScriptureContentBlock[];
};
