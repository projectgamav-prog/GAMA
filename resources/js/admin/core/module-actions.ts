import type { AdminSurfaceCapability, AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    AdminModuleDefinition,
    AdminResolvedModuleAction,
} from './module-types';

function hasCapabilities(
    capabilities: readonly AdminSurfaceCapability[],
    requiredCapabilities: readonly AdminSurfaceCapability[] | undefined,
): boolean {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
        return true;
    }

    return requiredCapabilities.every((capability) =>
        capabilities.includes(capability),
    );
}

export function resolveAdminModuleActions(
    surface: AdminSurfaceContract,
    modules: readonly AdminModuleDefinition[],
): AdminResolvedModuleAction[] {
    return modules
        .flatMap((module) =>
            (module.actions ?? []).flatMap((action) => {
                if (
                    !hasCapabilities(
                        surface.capabilities,
                        action.requiredCapabilities,
                    )
                ) {
                    return [];
                }

                if (action.visibility && !action.visibility(surface)) {
                    return [];
                }

                return [
                    {
                        key: `${module.key}:${action.actionKey}`,
                        module,
                        action,
                        label: action.dynamicLabel?.(surface) ?? action.defaultLabel,
                        priority: action.priority ?? module.order ?? 0,
                        placement: action.placement ?? 'inline',
                        openMode: action.openMode ?? 'inline',
                        variant: action.variant ?? 'default',
                    } satisfies AdminResolvedModuleAction,
                ];
            }),
        )
        .sort((left, right) => {
            const priorityDifference = left.priority - right.priority;

            if (priorityDifference !== 0) {
                return priorityDifference;
            }

            const moduleDifference =
                (left.module.order ?? 0) - (right.module.order ?? 0);

            if (moduleDifference !== 0) {
                return moduleDifference;
            }

            return left.key.localeCompare(right.key);
        });
}

export function findModuleActionByKey(
    actions: readonly AdminResolvedModuleAction[],
    key: string | null,
): AdminResolvedModuleAction | null {
    if (key === null) {
        return null;
    }

    return actions.find((action) => action.key === key) ?? null;
}

export function findFirstModuleAction(
    actions: readonly AdminResolvedModuleAction[],
    moduleKey: string,
    actionKey?: string,
): AdminResolvedModuleAction | null {
    return (
        actions.find(
            (action) =>
                action.module.key === moduleKey &&
                (actionKey === undefined ||
                    action.action.actionKey === actionKey),
        ) ?? null
    );
}
