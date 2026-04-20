import { useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VerseTranslationsContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { VerseRelationSourceSummary } from '../VerseRelationSourceSummary';
import { VerseRelationSourceSelectField } from '../VerseRelationSourceSelectField';
import {
    applySourceToForm,
    getFieldCopy,
    type TranslationFormData,
    NONE_VALUE,
    selectSourceOptionLabel,
} from './translation-editor-helpers';
import { TranslationSourceDetailsFields } from './TranslationSourceDetailsFields';

type Props = {
    metadata: VerseTranslationsContractMetadata;
    onSuccess: () => void;
};

export function CreateTranslationCard({ metadata, onSuccess }: Props) {
    const form = useForm<TranslationFormData>({
        source_key: '',
        source_name: '',
        translation_source_id: NONE_VALUE,
        language_code: '',
        text: '',
        sort_order: String(metadata.nextSortOrder),
    });
    const selectedSource =
        metadata.sourceOptions.find(
            (source) => String(source.id) === form.data.translation_source_id,
        ) ?? null;

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Verse translations</Badge>
                    <Badge variant="secondary">New</Badge>
                </div>
                <CardTitle>Add translation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <VerseRelationSourceSelectField
                    field={metadata.fields.translation_source_id}
                    htmlFor="new_translation_source_id"
                    value={form.data.translation_source_id}
                    error={form.errors.translation_source_id}
                    labelOverride={getFieldCopy('translation_source_id').label}
                    helperTextOverride={
                        getFieldCopy('translation_source_id').helpText
                    }
                    sourceOptions={metadata.sourceOptions}
                    noneLabel="Not linked to a saved source"
                    placeholder="Choose a source"
                    onValueChange={(value) =>
                        applySourceToForm(form, metadata.sourceOptions, value)
                    }
                    optionLabel={selectSourceOptionLabel}
                />

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="Choose a saved source to prefill the details below, or enter them manually."
                />

                <TranslationSourceDetailsFields
                    metadata={metadata}
                    form={form}
                    idPrefix="new_translation"
                    description="These details stay with this translation entry."
                />

                <Button
                    type="button"
                    onClick={() => {
                        form.transform((data) => ({
                            ...data,
                            translation_source_id:
                                data.translation_source_id === NONE_VALUE
                                    ? null
                                    : Number(data.translation_source_id),
                            sort_order: Number(data.sort_order),
                        }));
                        form.post(metadata.storeHref, {
                            preserveScroll: true,
                            preserveState: false,
                            onSuccess,
                        });
                    }}
                    disabled={form.processing}
                >
                    Add translation
                </Button>
            </CardContent>
        </Card>
    );
}
