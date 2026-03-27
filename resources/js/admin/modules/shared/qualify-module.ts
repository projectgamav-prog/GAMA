import type { AdminModuleDefinition, AdminModuleScope } from './module-types';
import type { AdminSurfaceContract } from './surface-contracts';

function matchesScope<T extends string>(
    scope: AdminModuleScope<T>,
    value: T | null | undefined,
): boolean {
    if (scope === undefined || scope === null || scope === '*') {
        return true;
    }

    if (value === undefined || value === null) {
        return false;
    }

    if (Array.isArray(scope)) {
        return scope.includes(value);
    }

    return scope === value;
}

function hasRequiredCapabilities(
    surface: AdminSurfaceContract,
    module: AdminModuleDefinition,
): boolean {
    const requiredCapabilities = module.requiredCapabilities ?? [];

    if (requiredCapabilities.length === 0) {
        return true;
    }

    const surfaceCapabilities = new Set(surface.capabilities);

    return requiredCapabilities.every((capability) =>
        surfaceCapabilities.has(capability),
    );
}

/**
 * Determine whether a module can attach to the given surface contract.
 *
 * Qualification is intentionally metadata-driven so future pages can inherit
 * editor behavior by exposing the same surface shape instead of wiring actions
 * by hand.
 */
export function qualifyAdminModule(
    surface: AdminSurfaceContract,
    module: AdminModuleDefinition,
): boolean {
    return (
        matchesScope(module.entityScope, surface.entity) &&
        matchesScope(module.surfaceSlots, surface.slot) &&
        matchesScope(module.regionScope, surface.regionKey) &&
        matchesScope(module.blockTypes, surface.blockType) &&
        hasRequiredCapabilities(surface, module)
    );
}

export function getQualifyingAdminModules(
    surface: AdminSurfaceContract,
    modules: readonly AdminModuleDefinition[],
): AdminModuleDefinition[] {
    return modules.filter((module) => qualifyAdminModule(surface, module));
}
