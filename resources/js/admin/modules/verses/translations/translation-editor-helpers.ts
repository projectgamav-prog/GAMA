import { useForm } from '@inertiajs/react';
import type { ScriptureTranslationSourceOption } from '@/types';
import {
    formatVerseRelationSourceOptionLabel,
    VERSE_RELATION_NONE_VALUE,
} from '../verse-relation-editor-shared';

export type TranslationFormData = {
    source_key: string;
    source_name: string;
    translation_source_id: string;
    language_code: string;
    text: string;
    sort_order: string;
};

export type TranslationForm = ReturnType<typeof useForm<TranslationFormData>>;

export const NONE_VALUE = VERSE_RELATION_NONE_VALUE;

const TRANSLATION_FIELD_COPY = {
    source_key: {
        label: 'Source key',
        helpText:
            'Use the source key you want to keep with this translation.',
    },
    source_name: {
        label: 'Source name',
        helpText: 'The source name shown alongside this translation.',
    },
    translation_source_id: {
        label: 'Source',
        helpText:
            'Choose a saved source to prefill the details below, or leave it blank and enter them manually.',
    },
    language_code: {
        label: 'Language',
        helpText: 'Use a short language code such as en, sa, or hi.',
    },
    text: {
        label: 'Translation',
        helpText: 'Enter the translation text shown for this verse.',
    },
    sort_order: {
        label: 'Order',
        helpText: 'Lower numbers appear first in the translation list.',
    },
} as const;

export function selectSourceOptionLabel(
    source: ScriptureTranslationSourceOption,
): string {
    return formatVerseRelationSourceOptionLabel(source);
}

export function getFieldCopy<Key extends keyof typeof TRANSLATION_FIELD_COPY>(
    fieldKey: Key,
) {
    return TRANSLATION_FIELD_COPY[fieldKey];
}

export function applySourceToForm(
    form: TranslationForm,
    sourceOptions: ScriptureTranslationSourceOption[],
    value: string,
) {
    form.setData('translation_source_id', value);

    if (value === NONE_VALUE) {
        return;
    }

    const selectedSource = sourceOptions.find(
        (candidate) => String(candidate.id) === value,
    );

    if (!selectedSource) {
        return;
    }

    form.setData({
        ...form.data,
        translation_source_id: value,
        source_key: selectedSource.slug,
        source_name: selectedSource.name,
        language_code: selectedSource.language_code ?? form.data.language_code,
    });
}
