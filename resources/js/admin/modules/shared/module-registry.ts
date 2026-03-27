import type { AdminModuleDefinition } from './module-types';
import { blockAdminModules } from '@/admin/modules/blocks';
import { bookAdminModules } from '@/admin/modules/books';
import { chapterAdminModules } from '@/admin/modules/chapters';
import { verseAdminModules } from '@/admin/modules/verses';

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
 * Pages and shared admin surfaces should mount the host and let the registry
 * plus qualification rules attach the right module automatically.
 */
export const adminModuleRegistry = defineAdminModuleRegistry([
    ...bookAdminModules,
    ...chapterAdminModules,
    ...verseAdminModules,
    ...blockAdminModules,
]);

export function getRegisteredAdminModules(): readonly AdminModuleDefinition[] {
    return adminModuleRegistry;
}
