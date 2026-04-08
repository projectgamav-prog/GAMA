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
    type VerseTranslationsContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import { VERSE_TRANSLATIONS_SURFACE_KEY } from '@/admin/surfaces/core/surface-keys';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type {
    ScriptureAdminVerseTranslation,
    ScriptureTranslationSourceOption,
} from '@/types';
import { VerseRelationSourceSummary } from './VerseRelationSourceSummary';

type TranslationFormData = {
    source_key: string;
    source_name: string;
    translation_source_id: string;
    language_code: string;
    text: string;
    sort_order: string;
};

const NONE_VALUE = '__none__';
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

function selectSourceOptionLabel(source: ScriptureTranslationSourceOption): string {
    return source.short_name
        ? `${source.name} (${source.short_name})`
        : source.name;
}

function resolveTranslationMetadata(
    props: AdminModuleComponentProps,
): VerseTranslationsContractMetadata | null {
    const metadata =
        getRelationRowsContractMetadata<
            ScriptureAdminVerseTranslation,
            ScriptureTranslationSourceOption
        >(props.surface);

    return metadata?.relationKey === 'translations' ? metadata : null;
}

function getFieldCopy<Key extends keyof typeof TRANSLATION_FIELD_COPY>(
    fieldKey: Key,
) {
    return TRANSLATION_FIELD_COPY[fieldKey];
}

function applySourceToForm(
    form: ReturnType<typeof useForm<TranslationFormData>>,
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

function CreateTranslationCard({
    metadata,
    onSuccess,
}: {
    metadata: VerseTranslationsContractMetadata;
    onSuccess: () => void;
}) {
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
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.translation_source_id}
                        htmlFor="new_translation_source_id"
                        labelOverride={getFieldCopy('translation_source_id').label}
                        helperTextOverride={
                            getFieldCopy('translation_source_id').helpText
                        }
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Select
                        value={form.data.translation_source_id}
                        onValueChange={(value) =>
                            applySourceToForm(form, metadata.sourceOptions, value)
                        }
                    >
                        <SelectTrigger id="new_translation_source_id">
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
                    <InputError message={form.errors.translation_source_id} />
                </div>

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="Choose a saved source to prefill the details below, or enter them manually."
                />

                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Source details</h4>
                    <p className="text-sm text-muted-foreground">
                        These details stay with this translation entry.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.source_key}
                            htmlFor="new_translation_source_key"
                            labelOverride={getFieldCopy('source_key').label}
                            helperTextOverride={getFieldCopy('source_key').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_translation_source_key"
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
                            htmlFor="new_translation_source_name"
                            labelOverride={getFieldCopy('source_name').label}
                            helperTextOverride={getFieldCopy('source_name').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_translation_source_name"
                            value={form.data.source_name}
                            onChange={(event) =>
                                form.setData('source_name', event.target.value)
                            }
                        />
                        <InputError message={form.errors.source_name} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.language_code}
                            htmlFor="new_translation_language_code"
                            labelOverride={getFieldCopy('language_code').label}
                            helperTextOverride={
                                getFieldCopy('language_code').helpText
                            }
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_translation_language_code"
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

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.sort_order}
                            htmlFor="new_translation_sort_order"
                            labelOverride={getFieldCopy('sort_order').label}
                            helperTextOverride={getFieldCopy('sort_order').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id="new_translation_sort_order"
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
                        field={metadata.fields.text}
                        htmlFor="new_translation_text"
                        labelOverride={getFieldCopy('text').label}
                        helperTextOverride={getFieldCopy('text').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Textarea
                        id="new_translation_text"
                        value={form.data.text}
                        onChange={(event) =>
                            form.setData('text', event.target.value)
                        }
                        rows={6}
                    />
                    <InputError message={form.errors.text} />
                </div>

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

function TranslationEditorCard({
    metadata,
    row,
    onSuccess,
}: {
    metadata: VerseTranslationsContractMetadata;
    row: ScriptureAdminVerseTranslation;
    onSuccess: () => void;
}) {
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
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.translation_source_id}
                        htmlFor={`translation_source_id_${row.id}`}
                        labelOverride={getFieldCopy('translation_source_id').label}
                        helperTextOverride={
                            getFieldCopy('translation_source_id').helpText
                        }
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Select
                        value={form.data.translation_source_id}
                        onValueChange={(value) =>
                            applySourceToForm(form, metadata.sourceOptions, value)
                        }
                    >
                        <SelectTrigger id={`translation_source_id_${row.id}`}>
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
                    <InputError message={form.errors.translation_source_id} />
                </div>

                <VerseRelationSourceSummary
                    source={selectedSource}
                    emptyMessage="This entry is not linked to a saved source yet."
                />

                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Source details</h4>
                    <p className="text-sm text-muted-foreground">
                        Update the saved source link or edit the details kept
                        with this translation.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.source_key}
                            htmlFor={`translation_source_key_${row.id}`}
                            labelOverride={getFieldCopy('source_key').label}
                            helperTextOverride={getFieldCopy('source_key').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`translation_source_key_${row.id}`}
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
                            htmlFor={`translation_source_name_${row.id}`}
                            labelOverride={getFieldCopy('source_name').label}
                            helperTextOverride={getFieldCopy('source_name').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`translation_source_name_${row.id}`}
                            value={form.data.source_name}
                            onChange={(event) =>
                                form.setData('source_name', event.target.value)
                            }
                        />
                        <InputError message={form.errors.source_name} />
                    </div>

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.language_code}
                            htmlFor={`translation_language_code_${row.id}`}
                            labelOverride={getFieldCopy('language_code').label}
                            helperTextOverride={
                                getFieldCopy('language_code').helpText
                            }
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`translation_language_code_${row.id}`}
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

                    <div className="grid gap-2">
                        <ScriptureAdminSourceLabel
                            field={metadata.fields.sort_order}
                            htmlFor={`translation_sort_order_${row.id}`}
                            labelOverride={getFieldCopy('sort_order').label}
                            helperTextOverride={getFieldCopy('sort_order').helpText}
                            showSchemaMeta={false}
                            showValidation={false}
                        />
                        <Input
                            id={`translation_sort_order_${row.id}`}
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
                        field={metadata.fields.text}
                        htmlFor={`translation_text_${row.id}`}
                        labelOverride={getFieldCopy('text').label}
                        helperTextOverride={getFieldCopy('text').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Textarea
                        id={`translation_text_${row.id}`}
                        value={form.data.text}
                        onChange={(event) =>
                            form.setData('text', event.target.value)
                        }
                        rows={6}
                    />
                    <InputError message={form.errors.text} />
                </div>

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

function VerseTranslationsEditor(props: AdminModuleComponentProps) {
    const metadata = resolveTranslationMetadata(props);
    const handleMutationSuccess = () => props.activation.deactivate();
    const fullEditHref =
        metadata?.fullEditHref
            ? buildScriptureAdminSectionHref(
                  metadata.fullEditHref,
                  'translations',
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
                            {metadata.rows.length} translation
                            {metadata.rows.length === 1 ? '' : 's'}
                        </Badge>
                        <Badge variant="outline">
                            {metadata.sourceOptions.length} saved source
                            {metadata.sourceOptions.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">
                            Verse translations
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Add, update, and organize the translations shown
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

                <CreateTranslationCard
                    metadata={metadata}
                    onSuccess={handleMutationSuccess}
                />

                {metadata.rows.map((row) => (
                    <TranslationEditorCard
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

export const verseTranslationsEditorModule = defineAdminModule({
    key: 'verse-translations-editor',
    surfaceKeys: VERSE_TRANSLATIONS_SURFACE_KEY,
    contractKeys: 'relation_rows',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_translations',
            placement: 'inline',
            openMode: 'inline',
            priority: 30,
        },
    ],
    qualifies: (surface) =>
        getRelationRowsContractMetadata(surface)?.relationKey ===
        'translations',
    EditorComponent: VerseTranslationsEditor,
    order: 30,
    description:
        'Manages verse translations through the shared verse relation surface.',
});
