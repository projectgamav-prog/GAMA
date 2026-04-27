import type { ReactNode } from 'react';
import {
    AdminSurfaceEmitter,
    createEntityContextFromSurface,
    createSurfaceContextFromContract,
} from '@/admin/awareness/core';
import type {
    AdminBlockContext,
    AdminLayoutPositionContext,
    AdminSchemaConstraintContext,
} from '@/admin/awareness/core';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { AdminSurfaceBoundary } from './AdminSurfaceBoundary';

type Props = {
    surface?: AdminSurfaceContract | null;
    children: ReactNode;
    emptyPlaceholder?: ReactNode;
    className?: string;
    manifestKey?: string;
    block?: AdminBlockContext | null;
    layout?: AdminLayoutPositionContext | null;
    schemaConstraints?: AdminSchemaConstraintContext | null;
};

function defaultBlockContext(
    surface: AdminSurfaceContract,
): AdminBlockContext | null {
    const quickEdit = surface.quickEdit;
    const field = quickEdit?.fields[0] ?? null;

    if (!quickEdit || !field) {
        return null;
    }

    return {
        blockType: surface.blockType ?? 'text_field',
        contentKind: quickEdit.contentKind,
        fieldKind: field.name,
    };
}

function defaultSchemaConstraints(
    surface: AdminSurfaceContract,
): AdminSchemaConstraintContext | null {
    const quickEditFields = surface.quickEdit?.fields.map((field) => field.name);

    if (!quickEditFields || quickEditFields.length === 0) {
        return null;
    }

    return {
        quickEditAllowedFields: quickEditFields,
    };
}

export function AdminFieldQuickEditSurface({
    surface = null,
    children,
    className,
    emptyPlaceholder = null,
    manifestKey,
    block = null,
    layout = null,
    schemaConstraints = null,
}: Props) {
    if (!surface) {
        return <>{children}</>;
    }

    const quickEdit = surface.quickEdit ?? null;
    const field = quickEdit?.fields[0] ?? null;

    return (
        <>
            <AdminSurfaceEmitter
                manifestKey={
                    manifestKey ??
                    `field:${surface.entity}:${surface.entityId}:${surface.regionKey ?? field?.name ?? 'text'}`
                }
                entity={createEntityContextFromSurface(surface)}
                surface={createSurfaceContextFromContract(surface)}
                block={block ?? defaultBlockContext(surface)}
                layout={
                    layout ?? {
                        layoutZone: 'inline_prose',
                        visualRole: 'field',
                        preferredPlacement: 'top-right',
                    }
                }
                actionCapabilities={{
                    canQuickEdit: Boolean(quickEdit),
                    canFullEdit: surface.capabilities.includes('full_edit'),
                }}
                quickEdit={{
                    quickEdit,
                    fullEditFallbackAvailable: Boolean(
                        quickEdit?.fullEditHref,
                    ),
                }}
                schemaConstraints={
                    schemaConstraints ?? defaultSchemaConstraints(surface)
                }
            />
            <AdminSurfaceBoundary
                surface={surface}
                className={className}
                emptyPlaceholder={emptyPlaceholder}
            >
                {children}
            </AdminSurfaceBoundary>
        </>
    );
}
