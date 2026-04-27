import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    AdminCurrentVisibleControl,
    AdminCurrentVisibleControlSurface,
} from './control-comparison-types';
import type { AdminControlResolutionInput } from './control-resolution-types';
import type { AdminResolvedControl } from './control-resolution-types';

export function surfaceContractSignature(
    surface: AdminSurfaceContract,
): string {
    const owner = surface.owner
        ? `${surface.owner.entity}:${surface.owner.entityId}`
        : `${surface.entity}:${surface.entityId}`;

    return [
        surface.surfaceKey ?? 'surface',
        surface.contractKey ?? 'contract',
        surface.regionKey ?? 'region',
        owner,
    ].join(':');
}

export function surfaceManifestSignature(
    entry: AdminControlResolutionInput,
): string {
    return entry.surface?.surface
        ? surfaceContractSignature(entry.surface.surface)
        : [
              entry.surface?.surfaceKey ?? 'surface',
              entry.surface?.contractKey ?? 'contract',
              entry.surface?.regionKey ?? 'region',
              `${entry.entity.entityType}:${entry.entity.entityId}`,
          ].join(':');
}

export function currentSurfaceMatchesResolvedSurface(
    current: AdminCurrentVisibleControlSurface,
    resolved: AdminControlResolutionInput,
): boolean {
    return (
        surfaceContractSignature(current.surface) ===
            surfaceManifestSignature(resolved)
    );
}

export function hasKnownPlacement(
    controls: readonly AdminResolvedControl[],
): boolean {
    return controls.some((control) => Boolean(control.placement));
}

export function hasKnownMode(
    controls: readonly AdminResolvedControl[],
): boolean {
    return controls.some((control) => control.mode !== 'none');
}

export function currentHasComparableMode(
    currentControls: readonly AdminCurrentVisibleControl[],
    resolvedControls: readonly AdminResolvedControl[],
): boolean {
    if (currentControls.length === 0 || resolvedControls.length === 0) {
        return true;
    }

    const currentModes = new Set(
        currentControls.map((control) => control.mode).filter(Boolean),
    );

    if (currentModes.size === 0) {
        return true;
    }

    return resolvedControls.some((control) => currentModes.has(control.mode));
}

export function currentHasComparablePlacement(
    currentControls: readonly AdminCurrentVisibleControl[],
    resolvedControls: readonly AdminResolvedControl[],
): boolean {
    if (currentControls.length === 0 || resolvedControls.length === 0) {
        return true;
    }

    const currentPlacements = new Set(
        currentControls.map((control) => control.placement).filter(Boolean),
    );

    if (currentPlacements.size === 0) {
        return true;
    }

    return resolvedControls.some((control) =>
        currentPlacements.has(control.placement),
    );
}
