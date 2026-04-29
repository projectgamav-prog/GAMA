import type { AdminModuleDefinition } from './module-types';

/**
 * Small helper for future module definitions so module files can export typed
 * registrations without repeating the full interface.
 */
export function defineAdminModule(
    module: AdminModuleDefinition,
): AdminModuleDefinition {
    return module;
}

/**
 * Keeps module ordering deterministic regardless of import order.
 */
export function defineAdminModuleRegistry(
    modules: readonly AdminModuleDefinition[],
): readonly AdminModuleDefinition[] {
    return [...modules].sort((left, right) => {
        const orderDifference = (left.order ?? 0) - (right.order ?? 0);

        if (orderDifference !== 0) {
            return orderDifference;
        }

        return left.key.localeCompare(right.key);
    });
}

/**
 * @deprecated The legacy visible public-page module registry is quarantined.
 * Keep this empty compatibility registry only so old module files can retain
 * local typed definitions while Conscious Admin replaces the UI path.
 */
export const adminModuleRegistry = defineAdminModuleRegistry([]);

export function getRegisteredAdminModules(): readonly AdminModuleDefinition[] {
    return adminModuleRegistry;
}

