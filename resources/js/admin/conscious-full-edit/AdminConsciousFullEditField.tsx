import { useForm } from '@inertiajs/react';
import { Check, Lock, Save } from 'lucide-react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ConsciousFullEditField } from './types';

type FieldForm = Record<string, string | number | boolean | null>;

type Props = {
    field: ConsciousFullEditField;
};

function createFieldFormData(field: ConsciousFullEditField): FieldForm {
    const data: FieldForm = {
        [field.payload_key]: field.value ?? '',
    };

    field.hidden_payload_fields.forEach((hiddenField) => {
        data[hiddenField.name] = hiddenField.value ?? '';
    });

    return data;
}

function submitForm(
    form: ReturnType<typeof useForm<FieldForm>>,
    field: ConsciousFullEditField,
    onSuccess: () => void,
) {
    if (!field.update_href) {
        return;
    }

    const options = {
        preserveScroll: true,
        onSuccess,
    };

    if (field.method === 'post') {
        form.post(field.update_href, options);
        return;
    }

    if (field.method === 'put') {
        form.put(field.update_href, options);
        return;
    }

    form.patch(field.update_href, options);
}

export function AdminConsciousFullEditField({ field }: Props) {
    const form = useForm<FieldForm>(createFieldFormData(field));
    const value = String(form.data[field.payload_key] ?? '');
    const isTextarea =
        field.editor_type === 'textarea' ||
        field.field_kind === 'long_text' ||
        field.field_kind === 'description';

    useEffect(() => {
        form.setData(createFieldFormData(field));
        form.clearErrors();
    }, [field.value]);

    const save = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitForm(form, field, () => form.clearErrors());
    };

    return (
        <form
            onSubmit={save}
            className={cn(
                'border-b border-[color:var(--chronicle-border)] py-5 last:border-b-0',
                field.protected &&
                    'bg-[color:var(--chronicle-paper-muted)]/45 px-4',
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            htmlFor={`conscious-field-${field.name}`}
                            className="font-serif text-lg font-semibold text-[color:var(--chronicle-ink)]"
                        >
                            {field.label}
                        </label>
                        {field.protected && (
                            <Badge variant="outline" className="gap-1">
                                <Lock className="size-3" aria-hidden="true" />
                                Protected
                            </Badge>
                        )}
                        {field.editable && !field.protected && (
                            <Badge variant="outline" className="gap-1">
                                <Check className="size-3" aria-hidden="true" />
                                Editable
                            </Badge>
                        )}
                    </div>
                    {field.diagnostic_key && (
                        <p className="text-xs tracking-wide text-[color:var(--chronicle-brown)]">
                            {field.diagnostic_key}
                        </p>
                    )}
                </div>

                {field.editable && field.update_href && (
                    <Button
                        type="submit"
                        size="sm"
                        disabled={form.processing}
                        className="w-fit"
                    >
                        <Save className="size-3.5" aria-hidden="true" />
                        {form.processing ? 'Saving' : 'Save field'}
                    </Button>
                )}
            </div>

            <div className="mt-4">
                {field.editable && field.update_href ? (
                    isTextarea ? (
                        <Textarea
                            id={`conscious-field-${field.name}`}
                            value={value}
                            required={field.required}
                            className="min-h-36 bg-[color:var(--chronicle-paper)] font-serif text-base leading-7"
                            onChange={(event) =>
                                form.setData(
                                    field.payload_key,
                                    event.target.value,
                                )
                            }
                        />
                    ) : (
                        <Input
                            id={`conscious-field-${field.name}`}
                            value={value}
                            required={field.required}
                            className="bg-[color:var(--chronicle-paper)] font-serif text-base"
                            onChange={(event) =>
                                form.setData(
                                    field.payload_key,
                                    event.target.value,
                                )
                            }
                        />
                    )
                ) : (
                    <div className="rounded border border-[color:var(--chronicle-border)] bg-[color:var(--chronicle-paper)] px-3 py-2 font-serif text-base leading-7 text-[color:var(--chronicle-ink)]">
                        {field.display_value || (
                            <span className="text-[color:var(--chronicle-brown)]">
                                Empty
                            </span>
                        )}
                    </div>
                )}
            </div>

            {field.notice && (
                <p className="mt-3 text-sm text-[color:var(--chronicle-brown)]">
                    {field.notice}
                </p>
            )}

            {Object.keys(form.errors).length > 0 && (
                <div className="mt-3 space-y-1 text-sm text-destructive">
                    {Object.values(form.errors).map((error) => (
                        <p key={error}>{error}</p>
                    ))}
                </div>
            )}
        </form>
    );
}
