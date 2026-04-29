import { Link, useForm } from '@inertiajs/react';
import { ExternalLink, Pencil } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    AdminQuickEditField,
    AdminQuickEditMethod,
    AdminSurfaceContract,
} from '@/admin/surfaces/core/surface-contracts';
import { AdminOverlayActionButton } from './AdminOverlayActionButton';
import { AdminOverlayControlStrip } from './AdminOverlayControlStrip';
import { AdminOverlayEditFooter } from './AdminOverlayEditFooter';
import { AdminOverlayFrame } from './AdminOverlayFrame';
import { AdminSchemaFieldEditDialog } from './AdminSchemaFieldEditDialog';
import { AdminSurfaceActionMenu } from './AdminSurfaceActionMenu';
import { resolveAdminControlZone } from './AdminControlPlacementResolver';
import {
    resolveAdminEditableSurfaceOwnershipGate,
    useAdminControlComparison,
    useAdminResolvedControls,
    useRegisterCurrentAdminControls,
} from '@/admin/awareness/core';
import type { AdminResolvedControl } from '@/admin/awareness/core';
import {
    getAdminQuickEditAdapter,
    type AdminQuickEditValues,
} from './AdminQuickEditRegistry';

type Props = {
    surface: AdminSurfaceContract;
    children: ReactNode;
    emptyPlaceholder?: ReactNode;
    className?: string;
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

function AwarenessOwnedControlStrip({
    controls,
    fullEditHref,
    onQuickEdit,
}: {
    controls: readonly AdminResolvedControl[];
    fullEditHref: string | null;
    onQuickEdit: () => void;
}) {
    return (
        <AdminOverlayControlStrip>
            {controls.map((control) => {
                if (control.mode === 'quick_edit') {
                    return (
                        <AdminOverlayActionButton
                            key={control.key}
                            icon={Pencil}
                            title="awareness-owned"
                            aria-label={`${control.label} (awareness-owned)`}
                            data-admin-diagnostic-layer="awareness"
                            data-admin-diagnostic-label="awareness-owned"
                            onClick={onQuickEdit}
                        >
                            {control.label}
                        </AdminOverlayActionButton>
                    );
                }

                if (control.mode === 'full_edit' && fullEditHref) {
                    return (
                        <Button
                            key={control.key}
                            asChild
                            variant="ghost"
                            className="chronicle-admin-action-button"
                            title="awareness-owned"
                            aria-label={`${control.label} (awareness-owned)`}
                            data-admin-diagnostic-layer="awareness"
                            data-admin-diagnostic-label="awareness-owned"
                        >
                            <Link href={fullEditHref}>
                                <ExternalLink
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                {control.label}
                            </Link>
                        </Button>
                    );
                }

                return null;
            })}
        </AdminOverlayControlStrip>
    );
}

function isSchemaFieldSurface(surface: AdminSurfaceContract): boolean {
    return surface.blockType === 'schema_field';
}

export function AdminEditableSurface({
    surface,
    children,
    className,
    emptyPlaceholder = null,
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isFieldEditDialogOpen, setIsFieldEditDialogOpen] = useState(false);
    const quickEdit = surface.quickEdit ?? null;
    const adapter = getAdminQuickEditAdapter(surface);
    const initialValues = useMemo(
        () => valuesFromFields(quickEdit?.fields ?? []),
        [quickEdit?.fields],
    );
    const form = useForm<AdminQuickEditValues>(initialValues);
    const fullEditHref = quickEdit?.fullEditHref ?? null;
    const usesSchemaActionMenu = isSchemaFieldSurface(surface);
    const fieldControlZone = usesSchemaActionMenu
        ? resolveAdminControlZone({
              surfaceKind: 'schema_field',
              family: 'quick_edit',
          })
        : 'top-right';
    const { resolvedSurfaces } = useAdminResolvedControls();
    const { comparisons } = useAdminControlComparison();
    const ownershipGate = useMemo(
        () =>
            resolveAdminEditableSurfaceOwnershipGate({
                surface,
                resolvedSurfaces,
                comparisons,
            }),
        [comparisons, resolvedSurfaces, surface],
    );
    const currentControlSummary = useMemo(() => {
        if (!quickEdit) {
            return null;
        }

        const controls = [];

        if (quickEdit.mode === 'same_layout' && adapter && quickEdit.updateHref) {
            controls.push({
                key: 'editable-surface:quick-edit',
                label: 'Edit',
                family: 'edit',
                mode: 'quick_edit',
                placement: 'top-right',
                source: 'editable_surface' as const,
            });
        }

        if (fullEditHref) {
            controls.push({
                key: 'editable-surface:full-edit',
                label: 'Full edit',
                family: 'navigate',
                mode: 'full_edit',
                placement: 'top-right',
                source: 'editable_surface' as const,
            });
        }

        return controls.length > 0
            ? {
                  surface,
                  controls,
              }
            : null;
    }, [adapter, fullEditHref, quickEdit, surface]);

    useRegisterCurrentAdminControls(currentControlSummary, [
        currentControlSummary,
    ]);

    useEffect(() => {
        if (isEditing) {
            return;
        }

        form.setData(initialValues);
        form.clearErrors();
    }, [form, initialValues, isEditing]);

    const discardChanges = () => {
        form.setData(initialValues);
        form.clearErrors();
        setIsEditing(false);
    };
    const saveChanges = () => {
        if (!quickEdit || !adapter || !quickEdit.updateHref) {
            return;
        }

        form.transform((values) => adapter.buildPayload(values, quickEdit));
        submitForm(
            form,
            quickEdit.method ?? 'patch',
            quickEdit.updateHref,
            () => setIsEditing(false),
        );
    };

    if (!quickEdit) {
        return <>{children}</>;
    }

    if (quickEdit.mode !== 'same_layout' || !adapter || !quickEdit.updateHref) {
        return (
            <AdminOverlayFrame
                className={className}
                controls={null}
            >
                {children}
            </AdminOverlayFrame>
        );
    }

    if (usesSchemaActionMenu) {
        return (
            <AdminOverlayFrame
                anchorKey={surface.regionKey ?? null}
                anchorLevel="field"
                className={className}
                placement={fieldControlZone}
                controlsMode="raw"
                controls={
                    <AdminSurfaceActionMenu
                        entityType={surface.entity}
                        fieldName={quickEdit.fields[0]?.name ?? null}
                        editLabel="Edit"
                        fullEditHref={fullEditHref}
                        zone={fieldControlZone}
                        onEdit={() => setIsFieldEditDialogOpen(true)}
                    />
                }
            >
                {children || emptyPlaceholder}
                <AdminSchemaFieldEditDialog
                    surface={surface}
                    open={isFieldEditDialogOpen}
                    onOpenChange={setIsFieldEditDialogOpen}
                />
            </AdminOverlayFrame>
        );
    }

    if (!isEditing) {
        const controls = ownershipGate.canUseAwarenessControls ? (
            <AwarenessOwnedControlStrip
                controls={ownershipGate.controls}
                fullEditHref={fullEditHref}
                onQuickEdit={() => setIsEditing(true)}
            />
        ) : null;

        return (
            <AdminOverlayFrame className={className} controls={controls}>
                {children || emptyPlaceholder}
            </AdminOverlayFrame>
        );
    }

    return (
        <AdminOverlayFrame
            active
            anchorKey={surface.regionKey ?? null}
            anchorLevel={null}
            className={cn('chronicle-admin-same-place-edit-frame', className)}
            placement="top-right"
            controlsMode="overlay"
            controls={null}
        >
            <div className="chronicle-admin-same-place-edit-fields">
                {quickEdit.fields.map((field) => (
                    <div
                        key={field.name}
                        className="chronicle-admin-same-place-edit-field"
                    >
                        <label
                            className={
                                quickEdit.fields.length > 1
                                    ? 'chronicle-kicker chronicle-admin-same-place-edit-label'
                                    : 'sr-only'
                            }
                        >
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
                ))}
            </div>
            <AdminOverlayEditFooter
                fullEditHref={fullEditHref}
                processing={form.processing}
                saveLabel="Accept changes"
                viewLabel="View"
                onView={discardChanges}
                onDiscard={discardChanges}
                onSave={saveChanges}
            />
        </AdminOverlayFrame>
    );
}
