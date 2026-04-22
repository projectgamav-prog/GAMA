import type {
    ScriptureCommentarySourceOption,
    ScriptureTranslationSourceOption,
} from '@/types';

export type VerseRelationSourceOption =
    | ScriptureTranslationSourceOption
    | ScriptureCommentarySourceOption;

export const VERSE_RELATION_NONE_VALUE = '__none__';

type VerseRelationSourcePrefillBase = {
    source_key: string;
    source_name: string;
};

export function formatVerseRelationSourceOptionLabel(
    source: VerseRelationSourceOption,
): string {
    return source.short_name
        ? `${source.name} (${source.short_name})`
        : source.name;
}

export function resolveVerseRelationSourcePrefill<
    TFormData extends VerseRelationSourcePrefillBase,
    TSource extends VerseRelationSourceOption,
>(
    value: string,
    sourceOptions: TSource[],
    currentData: TFormData,
    buildPatch?: (
        source: TSource,
        currentData: TFormData,
    ) => Partial<TFormData>,
): Partial<TFormData> | null {
    if (value === VERSE_RELATION_NONE_VALUE) {
        return null;
    }

    const selectedSource = sourceOptions.find(
        (candidate) => String(candidate.id) === value,
    );

    if (!selectedSource) {
        return null;
    }

    return {
        source_key: selectedSource.slug,
        source_name: selectedSource.name,
        ...(buildPatch ? buildPatch(selectedSource, currentData) : {}),
    };
}
