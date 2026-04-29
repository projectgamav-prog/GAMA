import type { ReactNode } from 'react';
import { resolveConsciousFieldUpdateHref } from '@/admin/conscious-full-edit/conscious-field-update-hrefs';
import { AdminSchemaFieldSurface } from '@/admin/core/AdminSchemaFieldSurface';
import { resolveConsciousFullEditHref } from '@/admin/conscious-full-edit/conscious-full-edit-hrefs';
import { adminSchemaFieldRegistry } from '@/admin/schema';
import type {
    AdminRenderedSchemaField,
    AdminSchemaFamily,
    AdminSchemaFieldEditorType,
    AdminSchemaFieldKind,
} from '@/admin/schema/fields';
import { createInlineEditorSurface } from '@/admin/surfaces/core/surface-builders';
import type {
    AdminQuickEditContentKind,
    AdminQuickEditInput,
    AdminQuickEditMethod,
    AdminQuickEditPayloadField,
    AdminSurfaceContract,
    AdminSurfaceIdentifier,
} from '@/admin/surfaces/core/surface-contracts';
import type { ScriptureEntityType } from '@/types';

type Props = {
    schemaFamily?: AdminSchemaFamily;
    entityType: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    fieldName: string;
    value: string | boolean | number | null;
    displayValue?: string | null;
    updateHref?: string | null;
    method?: AdminQuickEditMethod;
    fullEditHref?: string | null;
    payloadKey?: string | null;
    hiddenPayloadFields?: readonly AdminQuickEditPayloadField[];
    surface?: AdminSurfaceContract | null;
    className?: string;
    emptyPlaceholder?: ReactNode;
    children: ReactNode;
};

function inputForEditor(
    editor: AdminSchemaFieldEditorType | null | undefined,
    fieldKind: AdminSchemaFieldKind,
): AdminQuickEditInput {
    if (
        editor === 'textarea' ||
        fieldKind === 'long_text' ||
        fieldKind === 'rich_text_lite' ||
        fieldKind === 'description'
    ) {
        return 'textarea';
    }

    return 'input';
}

function contentKindForField(
    fieldKind: AdminSchemaFieldKind,
): AdminQuickEditContentKind {
    if (fieldKind === 'title' || fieldKind === 'name') {
        return 'card_title';
    }

    if (fieldKind === 'description') {
        return 'card_description';
    }

    if (fieldKind === 'long_text' || fieldKind === 'rich_text_lite') {
        return 'long_text';
    }

    return 'plain_text';
}

function fieldValueToString(
    value: AdminRenderedSchemaField['value'],
): string | null {
    if (value === null) {
        return null;
    }

    return String(value);
}

function createSchemaQuickEditSurface(
    field: AdminRenderedSchemaField,
): AdminSurfaceContract | null {
    if (
        !field.quickEditable ||
        field.fullEditOnly ||
        field.protected ||
        field.readonly ||
        !field.updateHref
    ) {
        return null;
    }

    return createInlineEditorSurface({
        entity: field.entityType as ScriptureEntityType,
        entityId: field.entityId,
        regionKey: `schema_field:${field.fieldName}`,
        blockType: 'schema_field',
        capabilities: [
            'edit',
            ...(field.fullEditHref ? (['full_edit'] as const) : []),
        ],
        label: field.label,
        quickEdit: {
            mode: 'same_layout',
            contentKind: contentKindForField(field.fieldKind),
            fields: [
                {
                    name: field.fieldName,
                    label: field.label,
                    value: fieldValueToString(field.value),
                    input: inputForEditor(
                        field.preferredEditor,
                        field.fieldKind,
                    ),
                    fieldKind: field.fieldKind,
                    editorType: field.preferredEditor ?? undefined,
                    payloadKey: field.payloadKey ?? undefined,
                },
            ],
            payloadFields: field.hiddenPayloadFields,
            updateHref: field.updateHref,
            method: field.method ?? 'patch',
            fullEditHref: field.fullEditHref ?? null,
        },
        metadata: {
            schemaFamily: field.schemaFamily,
            fieldName: field.fieldName,
            columnName: field.columnName ?? null,
        },
    });
}

export function AdminSchemaFieldDisplay({
    schemaFamily = 'scripture',
    entityType,
    entityId,
    fieldName,
    value,
    displayValue,
    updateHref = null,
    method = 'patch',
    payloadKey = null,
    hiddenPayloadFields = [],
    surface = null,
    className,
    emptyPlaceholder = null,
    children,
}: Props) {
    const fieldDefinition = adminSchemaFieldRegistry.get({
        schemaFamily,
        entityType,
        fieldName,
    });

    if (!fieldDefinition) {
        return children;
    }

    const consciousFullEditHref = resolveConsciousFullEditHref({
        schemaFamily,
        entityType,
        entityId,
    });
    const consciousFieldUpdateHref =
        updateHref !== null
            ? resolveConsciousFieldUpdateHref({
                  schemaFamily,
                  entityType,
                  entityId,
                  fieldName,
              })
            : null;
    const resolvedUpdateHref = consciousFieldUpdateHref ?? updateHref;
    const usesConsciousFieldUpdate = consciousFieldUpdateHref !== null;
    const field: AdminRenderedSchemaField = {
        ...fieldDefinition,
        entityId,
        value,
        displayValue,
        updateHref: resolvedUpdateHref,
        method,
        fullEditHref: consciousFullEditHref,
        hiddenPayloadFields: usesConsciousFieldUpdate
            ? []
            : hiddenPayloadFields,
        payloadKey: usesConsciousFieldUpdate
            ? 'value'
            : (payloadKey ?? fieldDefinition.payloadKey),
    };
    const schemaSurface = surface ?? createSchemaQuickEditSurface(field);

    return (
        <AdminSchemaFieldSurface
            field={field}
            surface={schemaSurface}
            className={className}
            emptyPlaceholder={emptyPlaceholder}
        >
            {children}
        </AdminSchemaFieldSurface>
    );
}
