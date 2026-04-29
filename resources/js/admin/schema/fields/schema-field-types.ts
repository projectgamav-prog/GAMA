import type {
    AdminQuickEditMethod,
    AdminQuickEditPayloadField,
    AdminSurfaceIdentifier,
} from '@/admin/surfaces/core/surface-contracts';
import type { ScriptureEntityType } from '@/types';

export type AdminSchemaFamily = 'scripture' | 'cms' | (string & {});

export type AdminSchemaFieldKind =
    | 'short_text'
    | 'long_text'
    | 'rich_text_lite'
    | 'title'
    | 'name'
    | 'description'
    | 'number'
    | 'slug'
    | 'boolean'
    | 'enum'
    | 'date'
    | 'relation'
    | 'media'
    | 'order'
    | 'json'
    | 'canonical_identity'
    | 'protected_metadata';

export type AdminSchemaFieldEditorType =
    | 'input'
    | 'textarea'
    | 'toggle'
    | 'select'
    | 'date'
    | 'structured'
    | 'full_edit';

export type AdminSchemaFieldEditMode =
    | 'quick_edit'
    | 'structured_editor'
    | 'full_edit'
    | 'protected'
    | 'readonly';

export type AdminSchemaFieldConstraint = {
    required?: boolean;
    maxLength?: number | null;
    options?: readonly string[];
    validationHint?: string | null;
};

export type AdminSchemaFieldDefinition = {
    schemaFamily: AdminSchemaFamily;
    entityType: ScriptureEntityType | (string & {});
    fieldName: string;
    columnName?: string | null;
    fieldKind: AdminSchemaFieldKind;
    label: string;
    quickEditable?: boolean;
    structuredEditable?: boolean;
    fullEditOnly?: boolean;
    protected?: boolean;
    readonly?: boolean;
    payloadKey?: string | null;
    constraints?: AdminSchemaFieldConstraint | null;
    preferredEditor?: AdminSchemaFieldEditorType | null;
    preferredPlacement?: string | null;
};

export type AdminRenderedSchemaField = AdminSchemaFieldDefinition & {
    entityId: AdminSurfaceIdentifier;
    value: string | boolean | number | null;
    displayValue?: string | null;
    updateHref?: string | null;
    method?: AdminQuickEditMethod;
    fullEditHref?: string | null;
    hiddenPayloadFields?: readonly AdminQuickEditPayloadField[];
};

export type AdminSchemaFieldRegistryKey = `${string}:${string}.${string}`;
