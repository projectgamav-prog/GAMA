import { useForm } from '@inertiajs/react';
import type {
    ScriptureCommentarySourceOption,
} from '@/types';

export type CommentaryFormData = {
    source_key: string;
    source_name: string;
    commentary_source_id: string;
    author_name: string;
    language_code: string;
    title: string;
    body: string;
    sort_order: string;
};

export type CommentaryForm = ReturnType<typeof useForm<CommentaryFormData>>;

export const NONE_VALUE = '__none__';

const COMMENTARY_FIELD_COPY = {
    source_key: {
        label: 'Source key',
        helpText:
            'Use the source key you want to keep with this commentary.',
    },
    source_name: {
        label: 'Source name',
        helpText: 'The source name shown alongside this commentary.',
    },
    commentary_source_id: {
        label: 'Source',
        helpText:
            'Choose a saved source to prefill the details below, or leave it blank and enter them manually.',
    },
    author_name: {
        label: 'Author',
        helpText: 'Add the author name shown with this commentary.',
    },
    language_code: {
        label: 'Language',
        helpText: 'Use a short language code such as en, sa, or hi.',
    },
    title: {
        label: 'Title',
        helpText: 'Optional title shown above the commentary text.',
    },
    body: {
        label: 'Commentary',
        helpText: 'Enter the commentary text shown for this verse.',
    },
    sort_order: {
        label: 'Order',
        helpText: 'Lower numbers appear first in the commentary list.',
    },
} as const;

export function selectSourceOptionLabel(
    source: ScriptureCommentarySourceOption,
): string {
    return source.short_name
        ? `${source.name} (${source.short_name})`
        : source.name;
}

export function getFieldCopy<Key extends keyof typeof COMMENTARY_FIELD_COPY>(
    fieldKey: Key,
) {
    return COMMENTARY_FIELD_COPY[fieldKey];
}

export function applySourceToForm(
    form: CommentaryForm,
    sourceOptions: ScriptureCommentarySourceOption[],
    value: string,
) {
    form.setData('commentary_source_id', value);

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
        commentary_source_id: value,
        source_key: selectedSource.slug,
        source_name: selectedSource.name,
        author_name: selectedSource.author_name ?? form.data.author_name,
        language_code: selectedSource.language_code ?? form.data.language_code,
    });
}
