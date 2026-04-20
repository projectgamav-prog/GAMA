import type {
    ScriptureCommentarySourceOption,
    ScriptureTranslationSourceOption,
} from '@/types';

export type VerseRelationSourceOption =
    | ScriptureTranslationSourceOption
    | ScriptureCommentarySourceOption;

export const VERSE_RELATION_NONE_VALUE = '__none__';

export function formatVerseRelationSourceOptionLabel(
    source: VerseRelationSourceOption,
): string {
    return source.short_name
        ? `${source.name} (${source.short_name})`
        : source.name;
}
