import { getAdminQuickEditAdapter } from '@/admin/core/AdminQuickEditRegistry';
import type { AdminSurfaceManifestEntry } from './AdminSurfaceManifestProvider';
import { actionCapabilitiesFromSurface, quickEditContextFromInput } from './control-resolution-helpers';
import type {
    AdminControlDiagnostic,
    AdminControlOwnership,
    AdminControlOwnerKind,
    AdminResolvedSurfaceControls,
} from './control-ownership-types';
import type {
    AdminControlResolutionInput,
    AdminResolvedControl,
} from './control-resolution-types';

const editableModes = new Set(['quick_edit', 'structured_editor', 'full_edit']);

function surfaceSignature(entry: AdminSurfaceManifestEntry): string {
    const surface = entry.surface;
    const owner = surface?.owner
        ? `${surface.owner.entity}:${surface.owner.entityId}`
        : `${entry.entity.entityType}:${entry.entity.entityId}`;

    return [
        surface?.surfaceKey ?? 'surface',
        surface?.contractKey ?? 'contract',
        surface?.regionKey ?? 'region',
        owner,
    ].join(':');
}

function resolveOwnerKind(
    controls: readonly AdminResolvedControl[],
): AdminControlOwnerKind {
    const activeEditModes = new Set(
        controls
            .filter((control) => !control.disabled && editableModes.has(control.mode))
            .map((control) => control.mode),
    );
    const hasQuickEdit = activeEditModes.has('quick_edit');
    const hasStructuredEditor = activeEditModes.has('structured_editor');
    const hasFullEdit = activeEditModes.has('full_edit');

    if (activeEditModes.size === 0) {
        return controls.length > 0 ? 'unresolved' : 'none';
    }

    if (hasQuickEdit) {
        return hasStructuredEditor ? 'mixed' : 'quick_edit_overlay';
    }

    if (hasStructuredEditor) {
        return 'structured_editor';
    }

    if (hasFullEdit) {
        return 'full_edit';
    }

    return 'unresolved';
}

function preferredPlacement(
    controls: readonly AdminResolvedControl[],
): AdminControlOwnership['preferredPlacement'] {
    return controls.find((control) => !control.disabled)?.placement ?? null;
}

function hasQuickEditAdapter(input: AdminControlResolutionInput): boolean {
    const surface = input.surface?.surface;

    if (!surface) {
        return false;
    }

    return getAdminQuickEditAdapter(surface) !== null;
}

export function resolveAdminControlOwnership({
    controls,
    duplicateSurface,
    input,
    surfaceId,
}: {
    surfaceId: string;
    input: AdminControlResolutionInput;
    controls: readonly AdminResolvedControl[];
    duplicateSurface?: boolean;
}): AdminControlOwnership {
    const ownerKind = resolveOwnerKind(controls);
    const reasons: string[] = [];
    const quickEdit = quickEditContextFromInput(input).quickEdit;

    if (ownerKind === 'none') {
        reasons.push('No resolver controls were produced for this surface.');
    }

    if (ownerKind === 'unresolved') {
        reasons.push('Resolver controls exist, but no active edit owner is clear.');
    }

    if (ownerKind === 'mixed') {
        reasons.push('Multiple edit paths are active for the same surface.');
    }

    if (quickEdit?.mode === 'same_layout' && !hasQuickEditAdapter(input)) {
        reasons.push('Same-layout quick edit metadata has no matching adapter.');
    }

    if (duplicateSurface) {
        reasons.push('Multiple awareness entries emitted the same surface identity.');
    }

    return {
        surfaceId,
        ownerKind,
        preferredPlacement: preferredPlacement(controls),
        hasDuplicateRisk:
            ownerKind === 'mixed' ||
            Boolean(duplicateSurface),
        reasons,
    };
}

export function buildAdminControlDiagnostics(
    resolvedSurfaces: readonly AdminResolvedSurfaceControls[],
    entries: readonly AdminSurfaceManifestEntry[],
): AdminControlDiagnostic[] {
    const diagnostics: AdminControlDiagnostic[] = [];
    const duplicateSignatures = new Map<string, string[]>();

    entries.forEach((entry) => {
        const signature = surfaceSignature(entry);
        const matches = duplicateSignatures.get(signature) ?? [];

        duplicateSignatures.set(signature, [...matches, entry.key]);
    });

    duplicateSignatures.forEach((surfaceIds) => {
        if (surfaceIds.length <= 1) {
            return;
        }

        diagnostics.push({
            key: `duplicate-surface:${surfaceIds.join('|')}`,
            severity: 'warning',
            message: 'Multiple awareness entries emitted the same surface identity.',
            reason: surfaceIds.join(', '),
        });
    });

    resolvedSurfaces.forEach(({ controls, input, ownership, surfaceId }) => {
        const quickEdit = quickEditContextFromInput(input).quickEdit;
        const capabilities = actionCapabilitiesFromSurface(input);

        if (ownership.ownerKind === 'mixed') {
            diagnostics.push({
                key: `mixed-owner:${surfaceId}`,
                surfaceId,
                severity: 'warning',
                message: 'Surface has multiple incompatible edit owners.',
                reason: ownership.reasons.join(' '),
            });
        }

        if (
            quickEdit?.mode === 'same_layout' &&
            input.surface?.surface &&
            getAdminQuickEditAdapter(input.surface.surface) === null
        ) {
            diagnostics.push({
                key: `missing-quick-edit-adapter:${surfaceId}`,
                surfaceId,
                severity: 'warning',
                message: 'Surface declares same-layout quick edit, but no adapter matches it.',
                reason: quickEdit.contentKind,
            });
        }

        if (controls.length === 0 && Object.values(capabilities).some(Boolean)) {
            diagnostics.push({
                key: `capabilities-without-controls:${surfaceId}`,
                surfaceId,
                severity: 'warning',
                message: 'Surface has capabilities, but the resolver produced no controls.',
            });
        }

        if (
            (capabilities.canCreateBefore ||
                capabilities.canCreateAfter ||
                capabilities.canReorder) &&
            !input.ordering
        ) {
            diagnostics.push({
                key: `ordering-context-missing:${surfaceId}`,
                surfaceId,
                severity: 'info',
                message: 'Surface requests ordering/create controls without ordering context.',
            });
        }

        if (ownership.hasDuplicateRisk) {
            diagnostics.push({
                key: `ownership-duplicate-risk:${surfaceId}`,
                surfaceId,
                severity: 'info',
                message: 'Surface may need explicit control ownership before visible overlay replacement.',
                reason: ownership.reasons.join(' '),
            });
        }
    });

    return diagnostics;
}

export function duplicateSurfaceIds(
    entries: readonly AdminSurfaceManifestEntry[],
): Set<string> {
    const signatures = new Map<string, string[]>();

    entries.forEach((entry) => {
        const signature = surfaceSignature(entry);
        const matches = signatures.get(signature) ?? [];

        signatures.set(signature, [...matches, entry.key]);
    });

    return new Set(
        [...signatures.values()]
            .filter((surfaceIds) => surfaceIds.length > 1)
            .flat(),
    );
}
