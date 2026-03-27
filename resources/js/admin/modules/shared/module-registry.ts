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
 * Central registry for reusable admin editor modules.
 *
 * This stays intentionally empty until concrete module components are added.
 * Pages should eventually mount the host, not import module components
 * directly.
 */
export const adminModuleRegistry = defineAdminModuleRegistry([]);

export function getRegisteredAdminModules(): readonly AdminModuleDefinition[] {
    return adminModuleRegistry;
}
