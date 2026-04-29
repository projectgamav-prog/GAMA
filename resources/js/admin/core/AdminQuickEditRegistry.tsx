import type { ReactNode } from 'react';
import type {
    AdminQuickEditContentKind,
    AdminQuickEditField,
    AdminSurfaceCapability,
    AdminSurfaceContract,
    AdminSurfaceQuickEdit,
} from '@/admin/surfaces/core/surface-contracts';
import { getAdminFieldEditorAdapter } from './AdminFieldEditorRegistry';

export type AdminQuickEditValues = Record<string, string>;

export type AdminQuickEditRenderFieldArgs = {
    field: AdminQuickEditField;
    value: string;
    processing: boolean;
    onChange: (value: string) => void;
};

export type AdminQuickEditAdapter = {
    key: string;
    contentKinds: readonly AdminQuickEditContentKind[];
    requiredCapabilities?: readonly AdminSurfaceCapability[];
    supports?: (
        surface: AdminSurfaceContract,
        quickEdit: AdminSurfaceQuickEdit,
    ) => boolean;
    renderField: (args: AdminQuickEditRenderFieldArgs) => ReactNode;
    buildPayload: (
        values: AdminQuickEditValues,
        quickEdit: AdminSurfaceQuickEdit,
    ) => Record<string, unknown>;
};

const buildMappedPayload = (
    values: AdminQuickEditValues,
    quickEdit: AdminSurfaceQuickEdit,
): Record<string, unknown> => {
    const payload = (quickEdit.payloadFields ?? []).reduce<
        Record<string, unknown>
    >((currentPayload, field) => {
        currentPayload[field.payloadKey ?? field.name] = field.value ?? '';

        return currentPayload;
    }, {});

    return quickEdit.fields.reduce<Record<string, unknown>>(
        (currentPayload, field) => {
            currentPayload[field.payloadKey ?? field.name] =
                values[field.name] ?? '';

            return currentPayload;
        },
        payload,
    );
};

const textAdapter: AdminQuickEditAdapter = {
    key: 'chronicle-text-fields',
    contentKinds: [
        'plain_text',
        'long_text',
        'rich_text_lite',
        'intro_block_text',
        'content_block_text',
        'content_block_quote',
        'card_title',
        'card_description',
    ],
    requiredCapabilities: ['edit'],
    renderField: ({ field, value, processing, onChange }) => {
        return getAdminFieldEditorAdapter(field)?.renderField({
            field,
            value,
            processing,
            onChange,
        }) ?? null;
    },
    buildPayload: buildMappedPayload,
};

const quickEditAdapters = [textAdapter] as const;

function hasRequiredCapabilities(
    surface: AdminSurfaceContract,
    adapter: AdminQuickEditAdapter,
): boolean {
    const requiredCapabilities = adapter.requiredCapabilities ?? [];

    if (requiredCapabilities.length === 0) {
        return true;
    }

    return requiredCapabilities.every((capability) =>
        surface.capabilities.includes(capability),
    );
}

export function getAdminQuickEditAdapter(
    surface: AdminSurfaceContract,
): AdminQuickEditAdapter | null {
    const quickEdit = surface.quickEdit;

    if (!quickEdit || quickEdit.mode !== 'same_layout') {
        return null;
    }

    return (
        quickEditAdapters.find(
            (adapter) =>
                adapter.contentKinds.includes(quickEdit.contentKind) &&
                hasRequiredCapabilities(surface, adapter) &&
                (adapter.supports?.(surface, quickEdit) ?? true),
        ) ?? null
    );
}
