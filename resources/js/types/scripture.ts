import type { CmsExposedRegion } from './cms';
import type { PublicContentBlock } from './content-blocks';

export type ScriptureContentBlock = PublicContentBlock;

export type ScriptureAdminEditMode = 'contextual' | 'full' | 'canonical';

export type ScriptureAdminEditModeStatus = 'active' | 'planned' | 'disabled';

export type ScriptureAdminFieldClassification = 'canonical' | 'editorial';

export type ScriptureAdminFieldGroup = 'identity' | 'editorial' | 'supporting';

export type ScriptureRegisteredAdminMode = {
    key: ScriptureAdminEditMode;
    label: string;
    status: ScriptureAdminEditModeStatus;
    description: string;
    warning: string | null;
};

export type ScriptureRegisteredAdminField = {
    key: string;
    label: string;
    source: string;
    type: string;
    validation_rules: string[];
    edit_modes: ScriptureAdminEditMode[];
    classification: ScriptureAdminFieldClassification;
    group: ScriptureAdminFieldGroup;
    read_only: boolean;
    options: string[] | null;
    help_text: string | null;
    visibility_rule: string | null;
};

export type ScriptureRegisteredAdminMethodFamily =
    | 'text_field_edit'
    | 'long_text_edit'
    | 'number_field_edit'
    | 'choice_field_edit'
    | 'toggle_field_edit'
    | 'relation_field_edit'
    | 'canonical_display'
    | 'content_block_create'
    | 'content_block_edit'
    | 'ordered_insertion'
    | 'reorder'
    | 'media_slot_edit';

export type ScriptureRegisteredAdminMethod = {
    key: string;
    family: ScriptureRegisteredAdminMethodFamily;
    family_label: string;
    family_description: string;
    label: string;
    description: string;
    scope: 'field' | 'region';
    edit_modes: ScriptureAdminEditMode[];
    field_keys: string[];
    region_key: string | null;
    surface: string | null;
    capability_hint: string | null;
    ui_hint: string | null;
    content_aware: boolean;
};

export type ScriptureRegisteredAdminRegion = {
    key: string;
    label: string;
    surface: string;
    description: string;
    field_keys: string[];
    contextual_field_keys: string[];
    full_field_keys: string[];
    canonical_field_keys: string[];
    supported_modes: ScriptureAdminEditMode[];
    capability_hint: string | null;
    help_text: string | null;
    method_families: ScriptureRegisteredAdminMethodFamily[];
    fields: ScriptureRegisteredAdminField[];
    contextual_fields: ScriptureRegisteredAdminField[];
    full_fields: ScriptureRegisteredAdminField[];
    canonical_fields: ScriptureRegisteredAdminField[];
};

export type ScriptureRegisteredAdminEntity = {
    key: string;
    label: string;
    primary_model: string;
    primary_table: string;
    edit_modes: Record<ScriptureAdminEditMode, ScriptureRegisteredAdminMode>;
    notes: string | null;
    fields: Record<string, ScriptureRegisteredAdminField>;
    field_groups: Record<
        ScriptureAdminFieldGroup,
        ScriptureRegisteredAdminField[]
    >;
    methods: ScriptureRegisteredAdminMethod[];
    methods_by_mode: Record<
        ScriptureAdminEditMode,
        ScriptureRegisteredAdminMethod[]
    >;
    regions: ScriptureRegisteredAdminRegion[];
};

export type ScriptureVerseAdmin = {
    identity_update_href: string;
    meta_update_href: string;
    full_edit_href: string;
    destroy_href: string;
    translations: ScriptureVerseTranslationsAdmin;
    commentaries: ScriptureVerseCommentariesAdmin;
    intro_store_href: string;
    primary_intro_block: ScriptureContentBlock | null;
    primary_intro_update_href: string | null;
    primary_intro_destroy_href: string | null;
    intro_block_types: string[];
    intro_default_region: string;
};

export type ScriptureBookAdmin = {
    identity_update_href: string;
    details_update_href: string;
    full_edit_href: string;
    canonical_edit_href: string;
    destroy_href: string;
    book_section_store_href: string;
    media_assignment_attach_href?: string;
    media_assignment_store_href?: string;
    media_assignments?: ScriptureAdminMediaAssignment[];
    available_media?: ScriptureAdminMediaSummary[];
    next_media_assignment_sort_order?: number;
};

export type ScriptureChapterAdmin = {
    full_edit_href: string;
    identity_update_href: string;
    destroy_href: string;
    chapter_section_store_href: string;
    intro_store_href: string;
    primary_intro_block: ScriptureContentBlock | null;
    primary_intro_update_href: string | null;
    primary_intro_destroy_href: string | null;
    intro_block_types: string[];
    intro_default_region: string;
};

export type ScriptureChapterRowAdmin = Pick<
    ScriptureChapterAdmin,
    | 'full_edit_href'
    | 'identity_update_href'
    | 'destroy_href'
    | 'intro_store_href'
    | 'primary_intro_block'
    | 'primary_intro_update_href'
    | 'primary_intro_destroy_href'
    | 'intro_block_types'
    | 'intro_default_region'
>;

export type ScriptureBookCardAdmin = Pick<
    ScriptureBookAdmin,
    | 'details_update_href'
    | 'full_edit_href'
    | 'canonical_edit_href'
>;

export type ScriptureBooksIndexAdmin = {
    store_href: string;
};

export type ScriptureAdminContentBlock = ScriptureContentBlock & {
    status: 'draft' | 'published';
    update_href: string;
};

export type ScriptureProtectedAdminContentBlock = ScriptureContentBlock & {
    status: 'draft' | 'published';
    protection_reason: string;
};

export type ScriptureAdminMediaSummary = {
    id: number;
    media_type: string;
    title: string | null;
    alt_text: string | null;
    caption: string | null;
    url: string | null;
    path: string | null;
};

export type ScriptureAdminMediaAssignment = {
    id: number;
    media_id: number;
    role: string;
    title_override: string | null;
    caption_override: string | null;
    sort_order: number;
    status: 'draft' | 'published';
    replace_media_href?: string;
    update_href: string;
    destroy_href?: string | null;
    media: ScriptureAdminMediaSummary | null;
};

export type ScriptureSectionRowAdmin = {
    details_update_href: string;
    destroy_href?: string | null;
    child_store_href?: string | null;
    intro_store_href?: string | null;
    primary_intro_block?: ScriptureContentBlock | null;
    primary_intro_update_href?: string | null;
    primary_intro_destroy_href?: string | null;
    intro_block_types?: string[] | null;
    intro_default_region?: string | null;
};

export type ScriptureEntityType =
    | 'book'
    | 'book_section'
    | 'chapter'
    | 'chapter_section'
    | 'verse'
    | 'verse_translation'
    | 'verse_commentary'
    | 'content_block'
    | 'topic'
    | 'character'
    | 'dictionary_entry'
    | 'verse_dictionary_term'
    | 'verse_recitation'
    | 'verse_topic_assignment'
    | 'verse_character_assignment';

export type ScriptureEntityRegionInput = {
    entityType: ScriptureEntityType;
    entityId: number | string;
    entityLabel?: string | null;
    parentEntityType?: ScriptureEntityType;
    parentEntityId?: number | string | null;
    region: string;
    capabilityHint?: string | null;
};

export type ScriptureEntityRegionMeta = {
    entityType: ScriptureEntityType;
    entityId: string;
    entityLabel?: string;
    parentEntityType?: ScriptureEntityType;
    parentEntityId?: string;
    region: string;
    capabilityHint?: string;
};

export type ScriptureBook = {
    id: number;
    slug: string;
    number: string | null;
    title: string;
    description?: string | null;
    href: string;
    media_slots: ScriptureBookMediaSlots;
    admin?: ScriptureBookCardAdmin | null;
};

export type ScriptureBookMedia = {
    id: number | null;
    media_type: string;
    title: string | null;
    alt_text: string | null;
    caption: string | null;
    url: string | null;
    path: string | null;
    poster_url: string | null;
};

export type ScriptureBookMediaSlot = {
    role: string;
    title: string | null;
    caption: string | null;
    media: ScriptureBookMedia;
};

export type ScriptureBookMediaSlots = {
    hero_media: ScriptureBookMediaSlot | null;
    supporting_media: ScriptureBookMediaSlot[];
};

export type ScriptureBookSection = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    href: string;
    intro_block?: ScriptureContentBlock | null;
    admin?: ScriptureSectionRowAdmin | null;
};

export type ScriptureChapter = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    href: string;
    intro_block?: ScriptureContentBlock | null;
    admin?: ScriptureChapterRowAdmin | null;
};

export type ScriptureChapterSection = {
    id: number;
    slug: string;
    number: string | null;
    title: string | null;
    verses_count?: number;
    href?: string;
    intro_block?: ScriptureContentBlock | null;
    admin?: ScriptureSectionRowAdmin | null;
};

export type ScriptureVerse = {
    id: number;
    slug: string;
    number: string | null;
    text: string;
    href?: string;
    intro_block?: ScriptureContentBlock | null;
};

export type ScriptureReaderLanguage = 'en' | 'hi';

export type ScriptureVerseRelationRowsAdmin<TRow> = {
    store_href: string;
    next_sort_order: number;
    rows: TRow[];
};

export type ScriptureVerseRelationSharedAdmin<
    TSource,
    TFields = Record<string, ScriptureRegisteredAdminField>,
> = {
    sources: TSource[];
    fields: TFields;
};

export type ScriptureChapterVerseSharedAdmin = {
    translations: ScriptureVerseRelationSharedAdmin<
        ScriptureTranslationSourceOption,
        ScriptureVerseTranslationsAdminFields
    >;
    commentaries: ScriptureVerseRelationSharedAdmin<
        ScriptureCommentarySourceOption,
        ScriptureVerseCommentariesAdminFields
    >;
};

export type ScriptureReaderVerseAdmin = {
    identity_update_href: string;
    meta_update_href: string;
    full_edit_href: string;
    destroy_href: string;
    nearby_create_href: string;
    intro_store_href: string;
    primary_intro_block: ScriptureContentBlock | null;
    primary_intro_update_href: string | null;
    primary_intro_destroy_href: string | null;
    intro_block_types: string[];
    intro_default_region: string;
    translations: ScriptureVerseRelationRowsAdmin<ScriptureAdminVerseTranslation>;
    commentaries: ScriptureVerseRelationRowsAdmin<ScriptureAdminVerseCommentary>;
};

export type ScriptureReaderVerse = {
    id: number;
    slug: string;
    number: string | null;
    text: string;
    intro_block?: ScriptureContentBlock | null;
    explanation_href: string;
    video_href: string | null;
    translations: Record<ScriptureReaderLanguage, string | null>;
    verse_meta?: ScriptureVerseMeta | null;
    characters?: ScriptureVerseCharacterAssignment[];
    admin?: ScriptureReaderVerseAdmin | null;
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

export type ScriptureTranslationSourceOption = {
    id: number;
    slug: string;
    name: string;
    short_name: string | null;
    author_name: string | null;
    language_code: string | null;
    tradition: string | null;
    description: string | null;
    website_url: string | null;
    sort_order: number;
    is_published: boolean;
};

export type ScriptureCommentarySourceOption = {
    id: number;
    slug: string;
    name: string;
    short_name: string | null;
    author_name: string | null;
    language_code: string | null;
    tradition: string | null;
    description: string | null;
    website_url: string | null;
    sort_order: number;
    is_published: boolean;
};

export type ScriptureAdminVerseTranslation = {
    id: number;
    source_key: string;
    source_name: string;
    translation_source_id: number | null;
    language_code: string;
    text: string;
    sort_order: number;
    update_href: string;
    destroy_href: string;
};

export type ScriptureAdminVerseCommentary = {
    id: number;
    source_key: string;
    source_name: string;
    commentary_source_id: number | null;
    author_name: string | null;
    language_code: string;
    title: string | null;
    body: string;
    sort_order: number;
    update_href: string;
    destroy_href: string;
};

export type ScriptureVerseTranslationsAdminFields = {
    source_key: ScriptureRegisteredAdminField;
    source_name: ScriptureRegisteredAdminField;
    translation_source_id: ScriptureRegisteredAdminField;
    language_code: ScriptureRegisteredAdminField;
    text: ScriptureRegisteredAdminField;
    sort_order: ScriptureRegisteredAdminField;
};

export type ScriptureVerseCommentariesAdminFields = {
    source_key: ScriptureRegisteredAdminField;
    source_name: ScriptureRegisteredAdminField;
    commentary_source_id: ScriptureRegisteredAdminField;
    author_name: ScriptureRegisteredAdminField;
    language_code: ScriptureRegisteredAdminField;
    title: ScriptureRegisteredAdminField;
    body: ScriptureRegisteredAdminField;
    sort_order: ScriptureRegisteredAdminField;
};

export type ScriptureVerseTranslationsAdmin = {
    store_href: string;
    next_sort_order: number;
    rows: ScriptureAdminVerseTranslation[];
    sources: ScriptureTranslationSourceOption[];
    fields: ScriptureVerseTranslationsAdminFields;
};

export type ScriptureVerseCommentariesAdmin = {
    store_href: string;
    next_sort_order: number;
    rows: ScriptureAdminVerseCommentary[];
    sources: ScriptureCommentarySourceOption[];
    fields: ScriptureVerseCommentariesAdminFields;
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
    isAdmin: boolean;
    admin?: ScriptureBookAdmin | null;
    book_sections: Array<
        ScriptureBookSection & {
            chapters: ScriptureChapter[];
        }
    >;
};

export type BooksIndexProps = {
    books: ScriptureBook[];
    isAdmin: boolean;
    admin?: ScriptureBooksIndexAdmin | null;
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
    reader_languages: ScriptureReaderLanguage[];
    default_language: ScriptureReaderLanguage | null;
    chapter_sections: Array<
        ScriptureChapterSection & {
            cards: ScriptureReaderCard[];
        }
    >;
    isAdmin: boolean;
    admin?: ScriptureChapterAdmin | null;
    verse_admin_shared?: ScriptureChapterVerseSharedAdmin | null;
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
    cms_regions?: CmsExposedRegion[];
    isAdmin: boolean;
    admin?: ScriptureVerseAdmin | null;
};

export type VerseFullEditProps = {
    book: ScriptureBook;
    book_section: ScriptureBookSection;
    chapter: ScriptureChapter;
    chapter_section: ScriptureChapterSection & {
        href: string;
    };
    verse: (ScriptureVerse & { href: string }) & {
        admin_full_edit_href: string;
    };
    admin_entity: ScriptureRegisteredAdminEntity;
    characters: ScriptureVerseCharacterAssignment[];
    admin_identity_update_href: string;
    verse_meta: ScriptureVerseMeta | null;
    admin_meta_update_href: string;
    admin_translations: ScriptureVerseTranslationsAdmin;
    admin_commentaries: ScriptureVerseCommentariesAdmin;
    admin_content_block_store_href: string;
    next_content_block_sort_order: number;
    admin_content_blocks: ScriptureAdminContentBlock[];
    protected_content_blocks: ScriptureProtectedAdminContentBlock[];
};

export type ChapterFullEditProps = {
    book: ScriptureBook;
    book_section: ScriptureBookSection;
    chapter: ScriptureChapter & {
        admin_full_edit_href: string;
    };
    admin_entity: ScriptureRegisteredAdminEntity;
    admin_identity_update_href: string;
    admin_content_block_store_href: string;
    next_content_block_sort_order: number;
    admin_content_blocks: ScriptureAdminContentBlock[];
    protected_content_blocks: ScriptureProtectedAdminContentBlock[];
};

export type BookFullEditProps = {
    book: ScriptureBook & {
        admin_full_edit_href: string;
        admin_canonical_edit_href: string;
    };
    admin_entity: ScriptureRegisteredAdminEntity;
    admin_details_update_href: string;
    admin_content_block_store_href: string;
    admin_media_assignment_attach_href: string;
    admin_media_assignment_store_href: string;
    next_content_block_sort_order: number;
    next_media_assignment_sort_order: number;
    admin_content_blocks: ScriptureAdminContentBlock[];
    protected_content_blocks: ScriptureProtectedAdminContentBlock[];
    admin_media_assignments: ScriptureAdminMediaAssignment[];
    available_media: ScriptureAdminMediaSummary[];
};

export type BookCanonicalEditProps = {
    book: ScriptureBook & {
        admin_full_edit_href: string;
        admin_canonical_edit_href: string;
    };
    admin_identity_update_href: string;
    admin_entity: ScriptureRegisteredAdminEntity;
};
