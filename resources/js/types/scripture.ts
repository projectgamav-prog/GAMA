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
    number: string | null;
    title: string;
    description?: string | null;
    href: string;
    overview_href: string;
    overview_video?: ScriptureContentBlock | null;
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

export type ScriptureReaderLanguage = 'en' | 'hi';

export type ScriptureReaderVerse = {
    id: number;
    slug: string;
    number: string | null;
    text: string;
    explanation_href: string;
    video_href: string | null;
    translations: Record<ScriptureReaderLanguage, string | null>;
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

export type ScriptureVerseMeta = {
    primary_speaker_character_id: number | null;
    primary_listener_character_id: number | null;
    scene_location: string | null;
    narrative_phase: string | null;
    teaching_mode: string | null;
    difficulty_level: string | null;
    memorization_priority: number;
    is_featured: boolean;
    summary_short: string | null;
    keywords_json: unknown[] | null;
    study_flags_json: unknown[] | null;
};

export type ScriptureDictionaryEntrySummary = {
    id: number;
    slug: string;
    headword: string;
    transliteration: string | null;
    short_meaning: string | null;
    href: string;
};

export type ScriptureDictionaryEntry = {
    id: number;
    slug: string;
    headword: string;
    transliteration: string | null;
    root_headword: string | null;
    meaning: string | null;
    explanation: string | null;
    entry_type: string | null;
    href: string;
};

export type ScriptureDictionaryIndexEntry = {
    id: number;
    slug: string;
    headword: string;
    transliteration: string | null;
    root_headword: string | null;
    short_meaning: string | null;
    href: string;
};

export type ScriptureRelatedVerse = {
    id: number;
    slug: string;
    number: string | null;
    chapter_slug: string;
    chapter_number: string | null;
    book_slug: string;
    href: string;
};

export type ScriptureDictionaryRelatedVerse = ScriptureRelatedVerse;

export type ScriptureDictionaryTerm = {
    id: number;
    matched_text: string | null;
    matched_normalized_text: string | null;
    match_type: string;
    language_code: string | null;
    sort_order: number;
    dictionary_entry: ScriptureDictionaryEntrySummary | null;
};

export type ScriptureMediaSummary = {
    id: number;
    title: string | null;
    path: string | null;
    url: string | null;
};

export type ScriptureVerseRecitation = {
    id: number;
    reciter_name: string;
    reciter_slug: string | null;
    language_code: string | null;
    style: string | null;
    duration_seconds: number | null;
    sort_order: number;
    media: ScriptureMediaSummary | null;
};

export type ScriptureTopicSummary = {
    id: number;
    slug: string;
    name: string;
    href: string;
};

export type ScriptureTopic = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    href: string;
};

export type ScriptureTopicIndexEntry = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    href: string;
};

export type ScriptureVerseTopicAssignment = {
    id: number;
    weight: number | null;
    sort_order: number;
    notes: string | null;
    topic: ScriptureTopicSummary | null;
};

export type ScriptureCharacterSummary = {
    id: number;
    slug: string;
    name: string;
    href: string;
};

export type ScriptureCharacter = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    href: string;
};

export type ScriptureCharacterIndexEntry = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    href: string;
};

export type ScriptureVerseCharacterAssignment = {
    id: number;
    weight: number | null;
    sort_order: number;
    notes: string | null;
    character: ScriptureCharacterSummary | null;
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

export type BookOverviewProps = {
    book: ScriptureBook;
    content_blocks: ScriptureContentBlock[];
};

export type BooksIndexProps = {
    books: ScriptureBook[];
};

export type DictionaryIndexProps = {
    dictionary_entries: ScriptureDictionaryIndexEntry[];
};

export type DictionaryEntryShowProps = {
    dictionary_entry: ScriptureDictionaryEntry;
    related_verses: ScriptureRelatedVerse[];
};

export type TopicsIndexProps = {
    topics: ScriptureTopicIndexEntry[];
};

export type TopicShowProps = {
    topic: ScriptureTopic;
    related_verses: ScriptureRelatedVerse[];
    content_blocks: ScriptureContentBlock[];
};

export type CharactersIndexProps = {
    characters: ScriptureCharacterIndexEntry[];
};

export type CharacterShowProps = {
    character: ScriptureCharacter;
    related_verses: ScriptureRelatedVerse[];
    content_blocks: ScriptureContentBlock[];
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
    reader_languages: ScriptureReaderLanguage[];
    default_language: ScriptureReaderLanguage | null;
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
    verse_meta: ScriptureVerseMeta | null;
    dictionary_terms: ScriptureDictionaryTerm[];
    recitations: ScriptureVerseRecitation[];
    topics: ScriptureVerseTopicAssignment[];
    characters: ScriptureVerseCharacterAssignment[];
    content_blocks: ScriptureContentBlock[];
};
