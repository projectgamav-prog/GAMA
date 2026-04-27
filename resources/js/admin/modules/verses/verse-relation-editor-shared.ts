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

type VerseRelationSourcePrefillPatch<
    TFormData extends VerseRelationSourcePrefillBase,
> = VerseRelationSourcePrefillBase &
    Partial<Omit<TFormData, keyof VerseRelationSourcePrefillBase>>;

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
    ) => Partial<Omit<TFormData, keyof VerseRelationSourcePrefillBase>>,
): VerseRelationSourcePrefillPatch<TFormData> | null {
    if (value === VERSE_RELATION_NONE_VALUE) {
        return null;
    }

    const selectedSource = sourceOptions.find(
        (candidate) => String(candidate.id) === value,
    );

    if (!selectedSource) {
        return null;
    }

    const basePatch: VerseRelationSourcePrefillBase = {
        source_key: selectedSource.slug,
        source_name: selectedSource.name,
    };

    return {
        ...basePatch,
        ...(buildPatch ? buildPatch(selectedSource, currentData) : {}),
    } as VerseRelationSourcePrefillPatch<TFormData>;
}
