import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { AdminResolvedSurfaceControls } from './control-ownership-types';

export type AdminEditableFieldCategory =
    | 'quick_edit_text'
    | 'quick_edit_name'
    | 'quick_edit_description'
    | 'structured_identity'
    | 'ordering_metadata'
    | 'relation_metadata'
    | 'media_metadata'
    | 'protected_canonical';

const QUICK_EDIT_TEXT_FIELDS = new Set([
    'body',
    'caption',
    'description',
    'intro_text',
    'name',
    'notes',
    'quote_text',
    'summary',
    'text',
    'title',
    'verse_text',
]);

const QUICK_EDIT_NAME_FIELDS = new Set(['name', 'title']);

const QUICK_EDIT_DESCRIPTION_FIELDS = new Set([
    'caption',
    'description',
    'summary',
]);

const ORDERING_FIELDS = new Set([
    'canonical_order',
    'number',
    'order',
    'position',
    'sort_order',
]);

const RELATION_FIELDS = new Set([
    'parent_id',
    'parent_relation',
    'source_id',
    'source_relation',
]);

const MEDIA_FIELDS = new Set([
    'media_assignment',
    'media_id',
    'media_slot',
]);

const STRUCTURED_IDENTITY_FIELDS = new Set([
    'block_type',
    'slug',
    'status',
]);

function normalizeFieldName(fieldName: string): string {
    return fieldName.trim().toLowerCase();
}

export function classifyAdminEditableField(
    fieldName: string,
): AdminEditableFieldCategory {
    const normalizedFieldName = normalizeFieldName(fieldName);

    if (QUICK_EDIT_NAME_FIELDS.has(normalizedFieldName)) {
        return 'quick_edit_name';
    }

    if (QUICK_EDIT_DESCRIPTION_FIELDS.has(normalizedFieldName)) {
        return 'quick_edit_description';
    }

    if (QUICK_EDIT_TEXT_FIELDS.has(normalizedFieldName)) {
        return 'quick_edit_text';
    }

    if (ORDERING_FIELDS.has(normalizedFieldName)) {
        return 'ordering_metadata';
    }

    if (RELATION_FIELDS.has(normalizedFieldName)) {
        return 'relation_metadata';
    }

    if (MEDIA_FIELDS.has(normalizedFieldName)) {
        return 'media_metadata';
    }

    if (STRUCTURED_IDENTITY_FIELDS.has(normalizedFieldName)) {
        return 'structured_identity';
    }

    return 'protected_canonical';
}

export function isQuickEditableTextField(fieldName: string): boolean {
    const category = classifyAdminEditableField(fieldName);

    return (
        category === 'quick_edit_text' ||
        category === 'quick_edit_name' ||
        category === 'quick_edit_description'
    );
}

export function isExcludedFromQuickEdit(fieldName: string): boolean {
    return !isQuickEditableTextField(fieldName);
}

export function isQuickEditableFieldSurface(
    surface: AdminSurfaceContract,
): boolean {
    const quickEdit = surface.quickEdit;

    if (!quickEdit || quickEdit.mode !== 'same_layout') {
        return false;
    }

    return (
        quickEdit.fields.length > 0 &&
        quickEdit.fields.every((field) => isQuickEditableTextField(field.name))
    );
}

function surfaceEntityKey(surface: AdminSurfaceContract): string {
    return `${surface.entity}:${surface.entityId}`;
}

export function hasAwarenessOwnedQuickEditFieldForEntity({
    resolvedSurfaces,
    surface,
}: {
    surface: AdminSurfaceContract;
    resolvedSurfaces: readonly AdminResolvedSurfaceControls[];
}): boolean {
    const sourceEntityKey = surfaceEntityKey(surface);

    return resolvedSurfaces.some((resolvedSurface) => {
        const candidateSurface = resolvedSurface.input.surface?.surface;

        if (!candidateSurface) {
            return false;
        }

        if (surfaceEntityKey(candidateSurface) !== sourceEntityKey) {
            return false;
        }

        if (!isQuickEditableFieldSurface(candidateSurface)) {
            return false;
        }

        if (resolvedSurface.ownership.hasDuplicateRisk) {
            return false;
        }

        if (resolvedSurface.ownership.ownerKind !== 'quick_edit_overlay') {
            return false;
        }

        return resolvedSurface.controls.some(
            (control) => control.mode === 'quick_edit' && !control.disabled,
        );
    });
}

export function shouldDeferStructuredIdentityToQuickEditFields({
    resolvedSurfaces,
    surface,
}: {
    surface: AdminSurfaceContract;
    resolvedSurfaces: readonly AdminResolvedSurfaceControls[];
}): boolean {
    return (
        surface.contractKey === 'identity' &&
        hasAwarenessOwnedQuickEditFieldForEntity({ resolvedSurfaces, surface })
    );
}
