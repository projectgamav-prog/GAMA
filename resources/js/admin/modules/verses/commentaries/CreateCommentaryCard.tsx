import { useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    onSuccess: () => void;
};

export function CreateCommentaryCard({ metadata, onSuccess }: Props) {
    const form = useForm<CommentaryFormData>({
        source_key: '',
        source_name: '',
        commentary_source_id: NONE_VALUE,
        author_name: '',
        language_code: '',
        title: '',
        body: '',
        sort_order: String(metadata.nextSortOrder),
    });
    const selectedSource =
        metadata.sourceOptions.find(
            (source) => String(source.id) === form.data.commentary_source_id,
        ) ?? null;

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Verse commentaries</Badge>
                    <Badge variant="secondary">New</Badge>
                </div>
                <CardTitle>Add commentary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <CommentarySourceSelectField
                    metadata={metadata}
                    form={form}
                    htmlFor="new_commentary_source_id"
                />

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="Choose a saved source to prefill the details below, or enter them manually."
                />

                <CommentarySourceDetailsFields
                    metadata={metadata}
                    form={form}
                    idPrefix="new_commentary"
                    description="These details stay with this commentary entry."
                />

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
                        form.post(metadata.storeHref, {
                            preserveScroll: true,
                            preserveState: false,
                            onSuccess,
                        });
                    }}
                    disabled={form.processing}
                >
                    Add commentary
                </Button>
            </CardContent>
        </Card>
    );
}
