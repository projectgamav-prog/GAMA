import InputError from '@/components/input-error';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { VerseCommentariesContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { type CommentaryForm, getFieldCopy } from './commentary-editor-helpers';

type Props = {
    metadata: VerseCommentariesContractMetadata;
    form: CommentaryForm;
    idPrefix: string;
    description?: string;
};

export function CommentarySourceDetailsFields({
    metadata,
    form,
    idPrefix,
    description = 'These details stay with this commentary entry.',
}: Props) {
    return (
        <>
            <div className="space-y-1">
                <h4 className="text-sm font-semibold">Source details</h4>
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.source_key}
                        htmlFor={`${idPrefix}_source_key`}
                        labelOverride={getFieldCopy('source_key').label}
                        helperTextOverride={getFieldCopy('source_key').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Input
                        id={`${idPrefix}_source_key`}
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
                        htmlFor={`${idPrefix}_source_name`}
                        labelOverride={getFieldCopy('source_name').label}
                        helperTextOverride={getFieldCopy('source_name').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Input
                        id={`${idPrefix}_source_name`}
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
                        htmlFor={`${idPrefix}_author_name`}
                        labelOverride={getFieldCopy('author_name').label}
                        helperTextOverride={getFieldCopy('author_name').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Input
                        id={`${idPrefix}_author_name`}
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
                        htmlFor={`${idPrefix}_language_code`}
                        labelOverride={getFieldCopy('language_code').label}
                        helperTextOverride={getFieldCopy('language_code').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Input
                        id={`${idPrefix}_language_code`}
                        value={form.data.language_code}
                        onChange={(event) =>
                            form.setData('language_code', event.target.value)
                        }
                        placeholder="en"
                    />
                    <InputError message={form.errors.language_code} />
                </div>

                <div className="grid gap-2 md:col-span-2">
                    <ScriptureAdminSourceLabel
                        field={metadata.fields.title}
                        htmlFor={`${idPrefix}_title`}
                        labelOverride={getFieldCopy('title').label}
                        helperTextOverride={getFieldCopy('title').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Input
                        id={`${idPrefix}_title`}
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
                        htmlFor={`${idPrefix}_sort_order`}
                        labelOverride={getFieldCopy('sort_order').label}
                        helperTextOverride={getFieldCopy('sort_order').helpText}
                        showSchemaMeta={false}
                        showValidation={false}
                    />
                    <Input
                        id={`${idPrefix}_sort_order`}
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
                    htmlFor={`${idPrefix}_body`}
                    labelOverride={getFieldCopy('body').label}
                    helperTextOverride={getFieldCopy('body').helpText}
                    showSchemaMeta={false}
                    showValidation={false}
                />
                <Textarea
                    id={`${idPrefix}_body`}
                    value={form.data.body}
                    onChange={(event) =>
                        form.setData('body', event.target.value)
                    }
                    rows={8}
                />
                <InputError message={form.errors.body} />
            </div>
        </>
    );
}
