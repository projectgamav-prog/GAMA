import { useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    ScriptureAdminVerseCommentary,
} from '@/types';
import type { VerseCommentariesContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { VerseRelationSourceSummary } from '../VerseRelationSourceSummary';
import {
    type CommentaryFormData,
    NONE_VALUE,
} from './commentary-editor-helpers';
import { CommentarySourceDetailsFields } from './CommentarySourceDetailsFields';
import { CommentarySourceSelectField } from './CommentarySourceSelectField';

type Props = {
    metadata: VerseCommentariesContractMetadata;
    row: ScriptureAdminVerseCommentary;
    onSuccess: () => void;
};

export function CommentaryEditorCard({ metadata, row, onSuccess }: Props) {
    const form = useForm<CommentaryFormData>({
        source_key: row.source_key,
        source_name: row.source_name,
        commentary_source_id:
            row.commentary_source_id === null
                ? NONE_VALUE
                : String(row.commentary_source_id),
        author_name: row.author_name ?? '',
        language_code: row.language_code,
        title: row.title ?? '',
        body: row.body,
        sort_order: String(row.sort_order),
    });
    const selectedSource =
        metadata.sourceOptions.find(
            (source) => String(source.id) === form.data.commentary_source_id,
        ) ?? null;

    return (
        <Card id={`verse-commentary-${row.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        {row.title ?? row.source_name}
                    </Badge>
                    <Badge variant="outline">{row.language_code}</Badge>
                    <Badge variant="outline">Order {row.sort_order}</Badge>
                </div>
                <CardTitle>Edit commentary</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {row.title ?? row.source_name}
                </p>
            </CardHeader>
            <CardContent className="space-y-5">
                <CommentarySourceSelectField
                    metadata={metadata}
                    form={form}
                    htmlFor={`commentary_source_id_${row.id}`}
                />

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="This entry is not linked to a saved source yet."
                />

                <CommentarySourceDetailsFields
                    metadata={metadata}
                    form={form}
                    idPrefix={`commentary_${row.id}`}
                    description="Update the saved source link or edit the details kept with this commentary."
                />

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        onClick={() => {
                            form.transform((data) => ({
                                ...data,
                                commentary_source_id:
                                    data.commentary_source_id === NONE_VALUE
                                        ? null
                                        : Number(data.commentary_source_id),
                                author_name:
                                    data.author_name.trim() === ''
                                        ? null
                                        : data.author_name,
                                title:
                                    data.title.trim() === '' ? null : data.title,
                                sort_order: Number(data.sort_order),
                            }));
                            form.patch(row.update_href, {
                                preserveScroll: true,
                                onSuccess,
                            });
                        }}
                        disabled={form.processing}
                    >
                        Save commentary
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
                        Delete commentary
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
