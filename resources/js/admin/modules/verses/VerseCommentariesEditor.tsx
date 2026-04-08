import { Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    getRelationRowsContractMetadata,
    type VerseCommentariesContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import { VERSE_COMMENTARIES_SURFACE_KEY } from '@/admin/surfaces/core/surface-keys';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type {
    ScriptureAdminVerseCommentary,
    ScriptureCommentarySourceOption,
} from '@/types';
import { VerseRelationSourceSummary } from './VerseRelationSourceSummary';

type CommentaryFormData = {
    source_key: string;
    source_name: string;
    commentary_source_id: string;
    author_name: string;
    language_code: string;
    title: string;
    body: string;
    sort_order: string;
};

const NONE_VALUE = '__none__';
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

function selectSourceOptionLabel(source: ScriptureCommentarySourceOption): string {
    return source.short_name
        ? `${source.name} (${source.short_name})`
        : source.name;
}

function resolveCommentaryMetadata(
    props: AdminModuleComponentProps,
): VerseCommentariesContractMetadata | null {
    const metadata =
        getRelationRowsContractMetadata<
            ScriptureAdminVerseCommentary,
            ScriptureCommentarySourceOption
        >(props.surface);

    return metadata?.relationKey === 'commentaries' ? metadata : null;
}

function getFieldCopy<Key extends keyof typeof COMMENTARY_FIELD_COPY>(
    fieldKey: Key,
) {
    return COMMENTARY_FIELD_COPY[fieldKey];
}

function applySourceToForm(
    form: ReturnType<typeof useForm<CommentaryFormData>>,
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

function CreateCommentaryCard({
    metadata,
    onSuccess,
}: {
    metadata: VerseCommentariesContractMetadata;
    onSuccess: () => void;
}) {
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
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.commentary_source_id}
                        htmlFor="new_commentary_source_id"
                        labelOverride={getFieldCopy('commentary_source_id').label}
                        helperTextOverride={
                            getFieldCopy('commentary_source_id').helpText
                        }
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Select
                        value={form.data.commentary_source_id}
                        onValueChange={(value) =>
                            applySourceToForm(form, metadata.sourceOptions, value)
                        }
                    >
                        <SelectTrigger id="new_commentary_source_id">
                            <SelectValue placeholder="Choose a source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE_VALUE}>
                                Not linked to a saved source
                            </SelectItem>
                            {metadata.sourceOptions.map((source) => (
                                <SelectItem
                                    key={source.id}
                                    value={String(source.id)}
                                >
                                    {selectSourceOptionLabel(source)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.commentary_source_id} />
                </div>

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="Choose a saved source to prefill the details below, or enter them manually."
                />

                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Source details</h4>
                    <p className="text-sm text-muted-foreground">
                        These details stay with this commentary entry.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.source_key}
                            htmlFor="new_commentary_source_key"
                            labelOverride={getFieldCopy('source_key').label}
                            helperTextOverride={getFieldCopy('source_key').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_commentary_source_key"
                            value={form.data.source_key}
                            onChange={(event) =>
                                form.setData('source_key', event.target.value)
                            }
                        />
                        <InputError message={form.errors.source_key} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.source_name}
                            htmlFor="new_commentary_source_name"
                            labelOverride={getFieldCopy('source_name').label}
                            helperTextOverride={getFieldCopy('source_name').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_commentary_source_name"
                            value={form.data.source_name}
                            onChange={(event) =>
                                form.setData('source_name', event.target.value)
                            }
                        />
                        <InputError message={form.errors.source_name} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.author_name}
                            htmlFor="new_commentary_author_name"
                            labelOverride={getFieldCopy('author_name').label}
                            helperTextOverride={getFieldCopy('author_name').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_commentary_author_name"
                            value={form.data.author_name}
                            onChange={(event) =>
                                form.setData('author_name', event.target.value)
                            }
                        />
                        <InputError message={form.errors.author_name} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.language_code}
                            htmlFor="new_commentary_language_code"
                            labelOverride={getFieldCopy('language_code').label}
                            helperTextOverride={
                                getFieldCopy('language_code').helpText
                            }
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_commentary_language_code"
                            value={form.data.language_code}
                            onChange={(event) =>
                                form.setData(
                                    'language_code',
                                    event.target.value,
                                )
                            }
                            placeholder="en"
                        />
                        <InputError message={form.errors.language_code} />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.title}
                            htmlFor="new_commentary_title"
                            labelOverride={getFieldCopy('title').label}
                            helperTextOverride={getFieldCopy('title').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_commentary_title"
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.sort_order}
                            htmlFor="new_commentary_sort_order"
                            labelOverride={getFieldCopy('sort_order').label}
                            helperTextOverride={getFieldCopy('sort_order').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_commentary_sort_order"
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.body}
                        htmlFor="new_commentary_body"
                        labelOverride={getFieldCopy('body').label}
                        helperTextOverride={getFieldCopy('body').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Textarea
                        id="new_commentary_body"
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={8}
                    />
                    <InputError message={form.errors.body} />
                </div>

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

function CommentaryEditorCard({
    metadata,
    row,
    onSuccess,
}: {
    metadata: VerseCommentariesContractMetadata;
    row: ScriptureAdminVerseCommentary;
    onSuccess: () => void;
}) {
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
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.commentary_source_id}
                        htmlFor={`commentary_source_id_${row.id}`}
                        labelOverride={getFieldCopy('commentary_source_id').label}
                        helperTextOverride={
                            getFieldCopy('commentary_source_id').helpText
                        }
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Select
                        value={form.data.commentary_source_id}
                        onValueChange={(value) =>
                            applySourceToForm(form, metadata.sourceOptions, value)
                        }
                    >
                        <SelectTrigger id={`commentary_source_id_${row.id}`}>
                            <SelectValue placeholder="Choose a source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE_VALUE}>
                                Not linked to a saved source
                            </SelectItem>
                            {metadata.sourceOptions.map((source) => (
                                <SelectItem
                                    key={source.id}
                                    value={String(source.id)}
                                >
                                    {selectSourceOptionLabel(source)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.commentary_source_id} />
                </div>

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="This entry is not linked to a saved source yet."
                />

                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Source details</h4>
                    <p className="text-sm text-muted-foreground">
                        Update the saved source link or edit the details kept
                        with this commentary.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.source_key}
                            htmlFor={`commentary_source_key_${row.id}`}
                            labelOverride={getFieldCopy('source_key').label}
                            helperTextOverride={getFieldCopy('source_key').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`commentary_source_key_${row.id}`}
                            value={form.data.source_key}
                            onChange={(event) =>
                                form.setData('source_key', event.target.value)
                            }
                        />
                        <InputError message={form.errors.source_key} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.source_name}
                            htmlFor={`commentary_source_name_${row.id}`}
                            labelOverride={getFieldCopy('source_name').label}
                            helperTextOverride={getFieldCopy('source_name').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`commentary_source_name_${row.id}`}
                            value={form.data.source_name}
                            onChange={(event) =>
                                form.setData('source_name', event.target.value)
                            }
                        />
                        <InputError message={form.errors.source_name} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.author_name}
                            htmlFor={`commentary_author_name_${row.id}`}
                            labelOverride={getFieldCopy('author_name').label}
                            helperTextOverride={getFieldCopy('author_name').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`commentary_author_name_${row.id}`}
                            value={form.data.author_name}
                            onChange={(event) =>
                                form.setData('author_name', event.target.value)
                            }
                        />
                        <InputError message={form.errors.author_name} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.language_code}
                            htmlFor={`commentary_language_code_${row.id}`}
                            labelOverride={getFieldCopy('language_code').label}
                            helperTextOverride={
                                getFieldCopy('language_code').helpText
                            }
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`commentary_language_code_${row.id}`}
                            value={form.data.language_code}
                            onChange={(event) =>
                                form.setData(
                                    'language_code',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.language_code} />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.title}
                            htmlFor={`commentary_title_${row.id}`}
                            labelOverride={getFieldCopy('title').label}
                            helperTextOverride={getFieldCopy('title').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`commentary_title_${row.id}`}
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.sort_order}
                            htmlFor={`commentary_sort_order_${row.id}`}
                            labelOverride={getFieldCopy('sort_order').label}
                            helperTextOverride={getFieldCopy('sort_order').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`commentary_sort_order_${row.id}`}
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.body}
                        htmlFor={`commentary_body_${row.id}`}
                        labelOverride={getFieldCopy('body').label}
                        helperTextOverride={getFieldCopy('body').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Textarea
                        id={`commentary_body_${row.id}`}
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={8}
                    />
                    <InputError message={form.errors.body} />
                </div>

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

function VerseCommentariesEditor(props: AdminModuleComponentProps) {
    const metadata = resolveCommentaryMetadata(props);
    const handleMutationSuccess = () => props.activation.deactivate();
    const fullEditHref =
        metadata?.fullEditHref
            ? buildScriptureAdminSectionHref(
                  metadata.fullEditHref,
                  'commentaries',
              )
            : null;

    if (metadata === null || !props.activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm sm:px-5">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {metadata.rows.length}{' '}
                            {metadata.rows.length === 1
                                ? 'commentary'
                                : 'commentaries'}
                        </Badge>
                        <Badge variant="outline">
                            {metadata.sourceOptions.length} saved source
                            {metadata.sourceOptions.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">
                            Verse commentaries
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Add, update, and organize the commentary shown
                            with this verse. Choose a saved source to prefill
                            details when it helps.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={props.activation.deactivate}
                    >
                        Close
                    </Button>
                    {fullEditHref && (
                        <Button asChild variant="outline">
                            <Link href={fullEditHref}>Open full edit</Link>
                        </Button>
                    )}
                </div>

                <CreateCommentaryCard
                    metadata={metadata}
                    onSuccess={handleMutationSuccess}
                />

                {metadata.rows.map((row) => (
                    <CommentaryEditorCard
                        key={row.id}
                        metadata={metadata}
                        row={row}
                        onSuccess={handleMutationSuccess}
                    />
                ))}
            </div>
        </div>
    );
}

export const verseCommentariesEditorModule = defineAdminModule({
    key: 'verse-commentaries-editor',
    surfaceKeys: VERSE_COMMENTARIES_SURFACE_KEY,
    contractKeys: 'relation_rows',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_commentaries',
            placement: 'inline',
            openMode: 'inline',
            priority: 35,
        },
    ],
    qualifies: (surface) =>
        getRelationRowsContractMetadata(surface)?.relationKey ===
        'commentaries',
    EditorComponent: VerseCommentariesEditor,
    order: 35,
    description:
        'Manages verse commentaries through the shared verse relation surface.',
});
