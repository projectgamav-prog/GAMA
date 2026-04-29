import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type {
    AdminQuickEditField,
    AdminQuickEditMethod,
    AdminSurfaceContract,
} from '@/admin/surfaces/core/surface-contracts';
import {
    getAdminQuickEditAdapter,
    type AdminQuickEditAdapter,
    type AdminQuickEditValues,
} from './AdminQuickEditRegistry';

type Props = {
    surface: AdminSurfaceContract;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const valuesFromFields = (
    fields: readonly AdminQuickEditField[],
): AdminQuickEditValues =>
    fields.reduce<AdminQuickEditValues>((values, field) => {
        values[field.name] = field.value ?? '';

        return values;
    }, {});

function submitForm(
    form: ReturnType<typeof useForm<AdminQuickEditValues>>,
    method: AdminQuickEditMethod,
    href: string,
    onSuccess: () => void,
) {
    const options = {
        preserveScroll: true,
        onSuccess,
    };

    if (method === 'post') {
        form.post(href, options);

        return;
    }

    if (method === 'put') {
        form.put(href, options);

        return;
    }

    form.patch(href, options);
}

function renderFields({
    adapter,
    form,
    fields,
}: {
    adapter: AdminQuickEditAdapter;
    form: ReturnType<typeof useForm<AdminQuickEditValues>>;
    fields: readonly AdminQuickEditField[];
}) {
    return fields.map((field) => (
        <div
            key={field.name}
            className="chronicle-admin-field-edit-dialog-field"
        >
            <label className="chronicle-admin-field-edit-dialog-label">
                {field.label}
            </label>
            {adapter.renderField({
                field,
                value: form.data[field.name] ?? '',
                processing: form.processing,
                onChange: (value) => form.setData(field.name, value),
            })}
            {form.errors[field.name] && (
                <p className="text-sm text-destructive">
                    {form.errors[field.name]}
                </p>
            )}
        </div>
    ));
}

export function AdminSchemaFieldEditDialog({
    surface,
    open,
    onOpenChange,
}: Props) {
    const quickEdit = surface.quickEdit ?? null;
    const adapter = getAdminQuickEditAdapter(surface);
    const fields = quickEdit?.fields ?? [];
    const form = useForm<AdminQuickEditValues>(valuesFromFields(fields));
    const primaryField = fields[0] ?? null;
    const columnName =
        surface.metadata &&
        typeof surface.metadata === 'object' &&
        'columnName' in surface.metadata
            ? String(surface.metadata.columnName ?? '')
            : '';
    const fieldName =
        surface.metadata &&
        typeof surface.metadata === 'object' &&
        'fieldName' in surface.metadata
            ? String(surface.metadata.fieldName ?? primaryField?.name ?? '')
            : (primaryField?.name ?? '');

    useEffect(() => {
        if (!open) {
            form.setData(valuesFromFields(fields));
            form.clearErrors();
        }
    }, [fields, form, open]);

    if (!quickEdit || !adapter || !quickEdit.updateHref || !primaryField) {
        return null;
    }

    const updateHref = quickEdit.updateHref;
    const saveChanges = () => {
        form.transform((values) => adapter.buildPayload(values, quickEdit));
        submitForm(
            form,
            quickEdit.method ?? 'patch',
            updateHref,
            () => onOpenChange(false),
        );
    };

    const discardChanges = () => {
        form.setData(valuesFromFields(fields));
        form.clearErrors();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="chronicle-admin-field-edit-dialog sm:max-w-xl">
                <div onClick={(event) => event.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Edit {primaryField.label}</DialogTitle>
                    <DialogDescription>
                        Update this field through the Conscious Admin field
                        route.
                    </DialogDescription>
                    {(columnName || fieldName) && (
                        <p className="chronicle-admin-field-edit-dialog-diagnostic">
                            {surface.entity}.{columnName || fieldName}
                        </p>
                    )}
                </DialogHeader>

                <div className="chronicle-admin-field-edit-dialog-fields">
                    {renderFields({ adapter, form, fields })}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={discardChanges}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="chronicle-button"
                        onClick={saveChanges}
                        disabled={form.processing}
                    >
                        {form.processing ? 'Saving' : 'Save'}
                    </Button>
                </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
