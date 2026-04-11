import type { RouteTargetKey, ScriptureTargetKind } from '@/types';

export const SHARED_ROUTE_TARGET_OPTIONS: Record<RouteTargetKey, string> = {
    home: 'Home',
    'scripture.books.index': 'Books library',
    'scripture.dictionary.index': 'Dictionary',
    'scripture.topics.index': 'Topics',
    'scripture.characters.index': 'Characters',
};

export const SHARED_SCRIPTURE_TARGET_KIND_OPTIONS: Record<
    ScriptureTargetKind,
    string
> = {
    book: 'Book',
    chapter: 'Chapter',
    verse: 'Verse',
    dictionary_entry: 'Dictionary entry',
    topic: 'Topic',
    character: 'Character',
};
