import type { ReactNode } from 'react';
import type {
    AdminQuickEditField,
} from '@/admin/surfaces/core/surface-contracts';
import type {
    AdminSchemaFieldEditorType,
    AdminSchemaFieldKind,
} from '@/admin/schema/fields/schema-field-types';
import { AdminEditableText } from './AdminEditableText';
import { AdminEditableTextarea } from './AdminEditableTextarea';

export type AdminFieldEditorRenderArgs = {
    field: AdminQuickEditField;
    value: string;
    processing: boolean;
    onChange: (value: string) => void;
};

export type AdminFieldEditorAdapter = {
    key: string;
    fieldKinds: readonly AdminSchemaFieldKind[];
    editorTypes: readonly AdminSchemaFieldEditorType[];
    renderField: (args: AdminFieldEditorRenderArgs) => ReactNode;
};

const shortTextAdapter: AdminFieldEditorAdapter = {
    key: 'schema-short-text',
    fieldKinds: ['short_text', 'title', 'name'],
    editorTypes: ['input'],
    renderField: ({ field, value, processing, onChange }) => (
        <AdminEditableText
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={processing}
            placeholder={field.placeholder ?? undefined}
            aria-label={field.label}
        />
    ),
};

const longTextAdapter: AdminFieldEditorAdapter = {
    key: 'schema-long-text',
    fieldKinds: ['long_text', 'rich_text_lite', 'description'],
    editorTypes: ['textarea'],
    renderField: ({ field, value, processing, onChange }) => (
        <AdminEditableTextarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={processing}
            placeholder={field.placeholder ?? undefined}
            aria-label={field.label}
            rows={4}
        />
    ),
};

const fieldEditorAdapters = [shortTextAdapter, longTextAdapter] as const;

function inferEditorType(field: AdminQuickEditField): AdminSchemaFieldEditorType {
    if (field.editorType) {
        return field.editorType;
    }

    if (field.input === 'textarea') {
        return 'textarea';
    }

    if (
        field.fieldKind === 'long_text' ||
        field.fieldKind === 'rich_text_lite' ||
        field.fieldKind === 'description'
    ) {
        return 'textarea';
    }

    return 'input';
}

function inferFieldKind(field: AdminQuickEditField): AdminSchemaFieldKind {
    if (field.fieldKind) {
        return field.fieldKind;
    }

    if (field.name.includes('body') || field.name.includes('description')) {
        return 'long_text';
    }

    if (field.name.includes('title')) {
        return 'title';
    }

    if (field.name.includes('name')) {
        return 'name';
    }

    return field.input === 'textarea' ? 'long_text' : 'short_text';
}

export function getAdminFieldEditorAdapter(
    field: AdminQuickEditField,
): AdminFieldEditorAdapter | null {
    const fieldKind = inferFieldKind(field);
    const editorType = inferEditorType(field);

    return (
        fieldEditorAdapters.find(
            (adapter) =>
                adapter.fieldKinds.includes(fieldKind) &&
                adapter.editorTypes.includes(editorType),
        ) ?? null
    );
}
