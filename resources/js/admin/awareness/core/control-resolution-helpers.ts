import type {
    AdminActionCapabilityContext,
    AdminControlResolutionInput,
    AdminQuickEditContext,
    AdminResolvedControlMode,
} from './awareness-types';

const metadataString = (
    metadata: unknown,
    key: string,
): string | null => {
    if (typeof metadata !== 'object' || metadata === null) {
        return null;
    }

    const value = (metadata as Record<string, unknown>)[key];

    return typeof value === 'string' && value.length > 0 ? value : null;
};

export function actionCapabilitiesFromSurface(
    input: AdminControlResolutionInput,
): AdminActionCapabilityContext {
    const explicit = input.actionCapabilities ?? {};
    const surfaceCapabilities = input.surface?.capabilities ?? [];
    const hasCapability = (capability: string) =>
        surfaceCapabilities.includes(capability as never);
    const quickEdit = quickEditContextFromInput(input).quickEdit;

    return {
        canQuickEdit:
            explicit.canQuickEdit ?? (hasCapability('edit') && !!quickEdit),
        canStructuredEdit: explicit.canStructuredEdit ?? hasCapability('edit'),
        canFullEdit: explicit.canFullEdit ?? hasCapability('full_edit'),
        canCreateBefore: explicit.canCreateBefore ?? false,
        canCreateAfter: explicit.canCreateAfter ?? false,
        canCreateInside:
            explicit.canCreateInside ??
            (hasCapability('create_row') || hasCapability('add_block')),
        canReorder: explicit.canReorder ?? false,
        canDelete: explicit.canDelete ?? hasCapability('delete'),
        canManageMedia:
            explicit.canManageMedia ?? hasCapability('manage_media'),
        canManageRelations:
            explicit.canManageRelations ?? hasCapability('manage_relations'),
    };
}

export function quickEditContextFromInput(
    input: AdminControlResolutionInput,
): AdminQuickEditContext {
    return {
        ...(input.quickEdit ?? {}),
        quickEdit:
            input.quickEdit?.quickEdit ?? input.surface?.surface?.quickEdit ?? null,
    };
}

export function getFullEditHref(
    input: AdminControlResolutionInput,
): string | null {
    return (
        quickEditContextFromInput(input).quickEdit?.fullEditHref ??
        metadataString(input.surface?.metadata, 'fullEditHref') ??
        null
    );
}

export function isQuickEditAllowed(
    input: AdminControlResolutionInput,
): boolean {
    const quickEdit = quickEditContextFromInput(input).quickEdit;

    if (!quickEdit || quickEdit.mode !== 'same_layout') {
        return false;
    }

    const constraints = input.schemaConstraints;
    const fields = quickEdit.fields.map((field) => field.name);
    const readOnlyFields = new Set(constraints?.readOnlyFields ?? []);
    const structuredOnlyFields = new Set(
        constraints?.structuredOnlyFields ?? [],
    );
    const allowedFields = constraints?.quickEditAllowedFields
        ? new Set(constraints.quickEditAllowedFields)
        : null;

    return fields.some(
        (field) =>
            !readOnlyFields.has(field) &&
            !structuredOnlyFields.has(field) &&
            (allowedFields === null || allowedFields.has(field)),
    );
}

export function resolveEditMode(
    input: AdminControlResolutionInput,
): AdminResolvedControlMode | null {
    const capabilities = actionCapabilitiesFromSurface(input);

    if (capabilities.canQuickEdit && isQuickEditAllowed(input)) {
        return 'quick_edit';
    }

    if (capabilities.canStructuredEdit) {
        return 'structured_editor';
    }

    if (capabilities.canFullEdit && getFullEditHref(input) !== null) {
        return 'full_edit';
    }

    return null;
}

export function isCasualMutationProtected(
    input: AdminControlResolutionInput,
): boolean {
    return Boolean(
        input.schemaConstraints?.isProtected ||
            (input.schemaConstraints?.isCanonical &&
                input.ordering?.orderFamily === 'canonical'),
    );
}

export function protectedMutationReason(
    input: AdminControlResolutionInput,
): string | null {
    return (
        input.ordering?.protectedReason ??
        input.schemaConstraints?.protectedMutationReasons?.[0] ??
        null
    );
}
