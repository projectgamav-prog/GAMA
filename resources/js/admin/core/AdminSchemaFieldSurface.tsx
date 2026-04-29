import type { ReactNode } from 'react';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { AdminRenderedSchemaField } from '@/admin/schema/fields';
import { AdminFieldQuickEditSurface } from './AdminFieldQuickEditSurface';

type Props = {
    field: AdminRenderedSchemaField;
    surface?: AdminSurfaceContract | null;
    children: ReactNode;
    className?: string;
    emptyPlaceholder?: ReactNode;
};

export function AdminSchemaFieldSurface({
    field,
    surface = null,
    children,
    className,
    emptyPlaceholder = null,
}: Props) {
    return (
        <AdminFieldQuickEditSurface
            surface={surface}
            className={className}
            emptyPlaceholder={emptyPlaceholder}
            manifestKey={`schema-field:${field.schemaFamily}:${field.entityType}:${field.entityId}:${field.fieldName}`}
            block={{
                blockType: 'schema_field',
                contentKind: field.fieldKind,
                fieldKind: field.fieldName,
            }}
            layout={{
                layoutZone: 'inline_prose',
                visualRole: 'field',
                preferredPlacement: field.preferredPlacement ?? 'top-right',
            }}
            schemaConstraints={{
                quickEditAllowedFields: field.quickEditable
                    ? [field.fieldName]
                    : [],
                structuredOnlyFields: field.structuredEditable
                    ? []
                    : [field.fieldName],
                readOnlyFields: field.readonly ? [field.fieldName] : [],
                isProtected: field.protected,
                protectedMutationReasons: field.protected
                    ? [`${field.label} is protected by schema field policy.`]
                    : [],
            }}
        >
            {children}
        </AdminFieldQuickEditSurface>
    );
}
