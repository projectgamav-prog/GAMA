import type { AdminModuleDefinition } from './module-types';
import { entityActionAdminModules } from '@/admin/integrations/entity-actions';
import { bookAdminModules } from '@/admin/integrations/scripture/books';
import { chapterAdminModules } from '@/admin/integrations/scripture/chapters';
import { sectionAdminModules } from '@/admin/integrations/sections';
import { verseAdminModules } from '@/admin/integrations/scripture/verses';

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
    ...sectionAdminModules,
    ...entityActionAdminModules,
]);

export function getRegisteredAdminModules(): readonly AdminModuleDefinition[] {
    return adminModuleRegistry;
}

