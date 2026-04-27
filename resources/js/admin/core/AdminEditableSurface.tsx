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

function LocalControlStrip({
    fullEditHref,
    onQuickEdit,
}: {
    fullEditHref: string | null;
    onQuickEdit: () => void;
}) {
    return (
        <AdminOverlayControlStrip
            data-admin-diagnostic-layer="old"
            data-admin-diagnostic-label="fallback"
        >
            <AdminOverlayActionButton
                icon={Pencil}
                className="chronicle-admin-action-button-old"
                title="fallback admin"
                aria-label="Edit (fallback admin)"
                data-admin-diagnostic-layer="old"
                data-admin-diagnostic-label="fallback"
                onClick={onQuickEdit}
            >
                Edit
            </AdminOverlayActionButton>
            {fullEditHref && (
                <Button
                    asChild
                    variant="ghost"
                    className="chronicle-admin-action-button chronicle-admin-action-button-old"
                    title="fallback admin"
                    aria-label="Full edit (fallback admin)"
                    data-admin-diagnostic-layer="old"
                    data-admin-diagnostic-label="fallback"
                >
                    <Link href={fullEditHref}>
                        <ExternalLink
                            className="size-3.5"
                            aria-hidden="true"
                        />
                        Full edit
                    </Link>
                </Button>
            )}
        </AdminOverlayControlStrip>
    );
}

export function AdminEditableSurface({
    surface,
    children,
    className,
    emptyPlaceholder = null,
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const quickEdit = surface.quickEdit ?? null;
    const adapter = getAdminQuickEditAdapter(surface);
    const initialValues = useMemo(
        () => valuesFromFields(quickEdit?.fields ?? []),
        [quickEdit?.fields],
    );
    const form = useForm<AdminQuickEditValues>(initialValues);
    const fullEditHref = quickEdit?.fullEditHref ?? null;
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

    if (!quickEdit) {
        return <>{children}</>;
    }

    if (quickEdit.mode !== 'same_layout' || !adapter || !quickEdit.updateHref) {
        return (
            <AdminOverlayFrame
                className={className}
                controls={
                    fullEditHref ? (
                        <AdminOverlayControlStrip
                            data-admin-diagnostic-layer="old"
                            data-admin-diagnostic-label="fallback"
                        >
                            <Button
                                asChild
                                variant="ghost"
                                className="chronicle-admin-action-button chronicle-admin-action-button-old"
                                title="fallback admin"
                                aria-label="Full edit (fallback admin)"
                                data-admin-diagnostic-layer="old"
                                data-admin-diagnostic-label="fallback"
                            >
                                <Link href={fullEditHref}>
                                    <ExternalLink
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    Full edit
                                </Link>
                            </Button>
                        </AdminOverlayControlStrip>
                    ) : null
                }
            >
                {children}
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
        ) : (
            <LocalControlStrip
                fullEditHref={fullEditHref}
                onQuickEdit={() => setIsEditing(true)}
            />
        );

        return (
            <AdminOverlayFrame className={className} controls={controls}>
                {children || emptyPlaceholder}
            </AdminOverlayFrame>
        );
    }

    return (
        <AdminOverlayFrame
            active
            className={cn('chronicle-admin-same-place-edit-frame', className)}
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
                onSave={() => {
                    form.transform((values) =>
                        adapter.buildPayload(values, quickEdit),
                    );
                    submitForm(
                        form,
                        quickEdit.method ?? 'patch',
                        quickEdit.updateHref!,
                        () => setIsEditing(false),
                    );
                }}
            />
        </AdminOverlayFrame>
    );
}
