import { bookSchemaConsciousActions } from './book-schema-actions';
import type {
    ConsciousAdminActionDefinition,
    ConsciousAdminActionQuery,
} from './conscious-action-types';

const actions = [...bookSchemaConsciousActions];

function matchesQuery(
    action: ConsciousAdminActionDefinition,
    query: ConsciousAdminActionQuery,
): boolean {
    if (query.schemaFamily && action.schemaFamily !== query.schemaFamily) {
        return false;
    }

    if (action.entityType !== query.entityType) {
        return false;
    }

    if (query.controlLevel && action.controlLevel !== query.controlLevel) {
        return false;
    }

    if (
        query.fieldName &&
        action.backendAction.type === 'field_route' &&
        action.backendAction.fieldName !== '*' &&
        action.backendAction.fieldName !== query.fieldName
    ) {
        return false;
    }

    return query.includeUnavailable
        ? true
        : action.showInSurfaceMenu && action.enabled !== false;
}

export const consciousAdminActionRegistry = {
    list(): readonly ConsciousAdminActionDefinition[] {
        return actions;
    },

    findByKey(key: string): ConsciousAdminActionDefinition | null {
        return actions.find((action) => action.key === key) ?? null;
    },

    query(
        query: ConsciousAdminActionQuery,
    ): readonly ConsciousAdminActionDefinition[] {
        return actions.filter((action) => matchesQuery(action, query));
    },

    getSurfaceMenuActions(
        query: ConsciousAdminActionQuery,
    ): readonly ConsciousAdminActionDefinition[] {
        return this.query({
            ...query,
            includeUnavailable: false,
        }).filter((action) => action.showInSurfaceMenu);
    },
};
