import { consciousAdminActionRegistry } from './conscious-action-registry';
import type {
    ConsciousAdminActionDefinition,
    ConsciousAdminControlLevel,
    ConsciousAdminSurfaceActionContext,
    ConsciousAdminSurfaceActionGroup,
} from './conscious-action-types';

function isActionAvailableForRuntime(
    action: ConsciousAdminActionDefinition,
    context: ConsciousAdminSurfaceActionContext,
): boolean {
    if (
        !action.enabled ||
        !action.showInSurfaceMenu ||
        action.backendStatus !== 'available_now'
    ) {
        return false;
    }

    if (action.family === 'edit') {
        return Boolean(context.hasEditHandler);
    }

    if (action.family === 'full_edit') {
        return Boolean(context.hasFullEditHref);
    }

    return false;
}

function controlLevelMatchesSurface(
    actionLevel: ConsciousAdminControlLevel,
    surfaceLevel: ConsciousAdminControlLevel,
): boolean {
    if (actionLevel === surfaceLevel) {
        return true;
    }

    return surfaceLevel === 'field' && actionLevel === 'entity';
}

function compareActions(
    left: ConsciousAdminActionDefinition,
    right: ConsciousAdminActionDefinition,
): number {
    const order: Record<string, number> = {
        edit: 10,
        full_edit: 20,
        identity: 30,
        manage: 40,
        create: 50,
        reorder: 60,
        duplicate: 70,
        move: 80,
        delete: 90,
    };

    return (order[left.family] ?? 100) - (order[right.family] ?? 100);
}

export function resolveConsciousActionsForSurface(
    context: ConsciousAdminSurfaceActionContext,
): readonly ConsciousAdminActionDefinition[] {
    return consciousAdminActionRegistry
        .query({
            schemaFamily: context.schemaFamily,
            entityType: context.entityType,
            fieldName: context.fieldName,
            includeUnavailable: true,
        })
        .filter((action) =>
            controlLevelMatchesSurface(action.controlLevel, context.controlLevel),
        )
        .filter((action) => isActionAvailableForRuntime(action, context))
        .sort(compareActions);
}

export function groupConsciousSurfaceActions(
    actions: readonly ConsciousAdminActionDefinition[],
): readonly ConsciousAdminSurfaceActionGroup[] {
    const groups = actions.reduce<Map<string, ConsciousAdminActionDefinition[]>>(
        (currentGroups, action) => {
            currentGroups.set(action.menuGroup, [
                ...(currentGroups.get(action.menuGroup) ?? []),
                action,
            ]);

            return currentGroups;
        },
        new Map(),
    );

    return Array.from(groups.entries()).map(([menuGroup, groupActions]) => ({
        menuGroup: menuGroup as ConsciousAdminSurfaceActionGroup['menuGroup'],
        actions: groupActions,
    }));
}

export function getEnabledSurfaceActions(
    context: ConsciousAdminSurfaceActionContext,
): readonly ConsciousAdminActionDefinition[] {
    return resolveConsciousActionsForSurface(context);
}
