import { useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VerseTranslationsContractMetadata } from '@/admin/surfaces/core/contract-readers';
import type { ScriptureAdminVerseTranslation } from '@/types';
import { VerseRelationSourceSummary } from '../VerseRelationSourceSummary';
import {
    type TranslationFormData,
    NONE_VALUE,
} from './translation-editor-helpers';
import { TranslationSourceDetailsFields } from './TranslationSourceDetailsFields';
import { TranslationSourceSelectField } from './TranslationSourceSelectField';

type Props = {
    metadata: VerseTranslationsContractMetadata;
    row: ScriptureAdminVerseTranslation;
    onSuccess: () => void;
};

export function TranslationEditorCard({ metadata, row, onSuccess }: Props) {
    const form = useForm<TranslationFormData>({
        source_key: row.source_key,
        source_name: row.source_name,
        translation_source_id:
            row.translation_source_id === null
                ? NONE_VALUE
                : String(row.translation_source_id),
        language_code: row.language_code,
        text: row.text,
        sort_order: String(row.sort_order),
    });
    const selectedSource =
        metadata.sourceOptions.find(
            (source) => String(source.id) === form.data.translation_source_id,
        ) ?? null;

    return (
        <Card id={`verse-translation-${row.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{row.source_name}</Badge>
                    <Badge variant="outline">{row.language_code}</Badge>
                    <Badge variant="outline">Order {row.sort_order}</Badge>
                </div>
                <CardTitle>Edit translation</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {row.source_name}
                </p>
            </CardHeader>
            <CardContent className="space-y-5">
                <TranslationSourceSelectField
                    metadata={metadata}
                    form={form}
                    htmlFor={`translation_source_id_${row.id}`}
                />

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="This entry is not linked to a saved source yet."
                />

                <TranslationSourceDetailsFields
                    metadata={metadata}
                    form={form}
                    idPrefix={`translation_${row.id}`}
                    description="Update the saved source link or edit the details kept with this translation."
                />

                <div className="flex flex-wrap gap-2">
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
                            form.patch(row.update_href, {
                                preserveScroll: true,
                                onSuccess,
                            });
                        }}
                        disabled={form.processing}
                    >
                        Save translation
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() =>
                            form.delete(row.destroy_href, {
                                preserveScroll: true,
                                preserveState: false,
                            })
                        }
                        disabled={form.processing}
                    >
                        Delete translation
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
