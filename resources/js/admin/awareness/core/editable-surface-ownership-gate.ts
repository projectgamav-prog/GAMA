import { getAdminQuickEditAdapter } from '@/admin/core/AdminQuickEditRegistry';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import {
    surfaceContractSignature,
    surfaceManifestSignature,
} from './control-resolution-helpers';
import type { AdminResolvedSurfaceControls } from './control-ownership-types';
import type { AdminResolvedControl } from './control-resolution-types';

export type AdminEditableSurfaceOwnershipGateResult = {
    canUseAwarenessControls: boolean;
    controls: readonly AdminResolvedControl[];
    resolvedSurface: AdminResolvedSurfaceControls | null;
    reasons: readonly string[];
};

function isAllowedControl(control: AdminResolvedControl): boolean {
    return (
        !control.disabled &&
        (control.mode === 'quick_edit' || control.mode === 'full_edit') &&
        (control.family === 'edit' || control.family === 'navigate')
    );
}

function findResolvedSurface(
    surface: AdminSurfaceContract,
    resolvedSurfaces: readonly AdminResolvedSurfaceControls[],
): AdminResolvedSurfaceControls | null {
    const signature = surfaceContractSignature(surface);

    return (
        resolvedSurfaces.find(
            (resolvedSurface) =>
                surfaceManifestSignature(resolvedSurface.input) === signature,
        ) ?? null
    );
}

export function resolveAdminEditableSurfaceOwnershipGate({
    resolvedSurfaces,
    surface,
}: {
    surface: AdminSurfaceContract;
    resolvedSurfaces: readonly AdminResolvedSurfaceControls[];
}): AdminEditableSurfaceOwnershipGateResult {
    const reasons: string[] = [];
    const quickEdit = surface.quickEdit ?? null;
    const adapter = getAdminQuickEditAdapter(surface);
    const resolvedSurface = findResolvedSurface(surface, resolvedSurfaces);
    const controls =
        resolvedSurface?.controls.filter((control) => isAllowedControl(control)) ??
        [];

    if (!quickEdit || quickEdit.mode !== 'same_layout') {
        reasons.push('Surface is not a same-layout quick-edit surface.');
    }

    if (!quickEdit?.updateHref) {
        reasons.push('Quick-edit update href is missing.');
    }

    if ((quickEdit?.fields.length ?? 0) === 0) {
        reasons.push('Quick-edit fields are missing.');
    }

    if (!adapter) {
        reasons.push('No quick-edit adapter matches this surface.');
    }

    if (!resolvedSurface) {
        reasons.push('No resolved awareness surface was found.');
    }

    if (resolvedSurface && resolvedSurface.ownership.hasDuplicateRisk) {
        reasons.push('Resolved ownership still reports duplicate risk.');
    }

    if (resolvedSurface?.ownership.ownerKind === 'mixed') {
        reasons.push('Resolved ownership is mixed.');
    }

    if (resolvedSurface?.input.schemaConstraints?.isProtected) {
        reasons.push('Schema constraints mark this surface protected.');
    }

    if (resolvedSurface && controls.length !== resolvedSurface.controls.length) {
        reasons.push('Resolver returned controls outside quick/full edit scope.');
    }

    if (!controls.some((control) => control.mode === 'quick_edit')) {
        reasons.push('Resolver did not return an active quick-edit control.');
    }

    if (
        quickEdit?.fullEditHref &&
        !controls.some((control) => control.mode === 'full_edit')
    ) {
        reasons.push('Full Edit fallback exists but resolver did not return it.');
    }

    if (controls.some((control) => !control.placement)) {
        reasons.push('At least one resolver control is missing placement.');
    }

    if (controls.some((control) => control.mode === 'none')) {
        reasons.push('At least one resolver control is missing mode.');
    }

    return {
        canUseAwarenessControls: reasons.length === 0,
        controls,
        resolvedSurface,
        reasons: [...new Set(reasons)],
    };
}
