import type {
    AdminActionCapabilityContext,
    AdminEntityContext,
    AdminSchemaConstraintContext,
    AdminSchemaFamily,
} from '../core/awareness-types';

export type AdminEntityDefinition = {
    entityType: string;
    schemaFamily: AdminSchemaFamily;
    label: string;
    defaultCapabilities?: AdminActionCapabilityContext;
    defaultConstraints?: AdminSchemaConstraintContext;
    qualifies?: (entity: AdminEntityContext) => boolean;
};

const entityDefinitions = new Map<string, AdminEntityDefinition>();

const entityKey = (schemaFamily: string, entityType: string) =>
    `${schemaFamily}:${entityType}`;

export function registerAdminEntityDefinition(
    definition: AdminEntityDefinition,
): void {
    entityDefinitions.set(
        entityKey(definition.schemaFamily, definition.entityType),
        definition,
    );
}

export function registerAdminEntityDefinitions(
    definitions: readonly AdminEntityDefinition[],
): void {
    definitions.forEach(registerAdminEntityDefinition);
}

export function getAdminEntityDefinition(
    schemaFamily: AdminSchemaFamily,
    entityType: string,
): AdminEntityDefinition | null {
    return entityDefinitions.get(entityKey(schemaFamily, entityType)) ?? null;
}

export function hasAdminEntityDefinition(
    schemaFamily: AdminSchemaFamily,
    entityType: string,
): boolean {
    return entityDefinitions.has(entityKey(schemaFamily, entityType));
}

export function listAdminEntityDefinitions(): AdminEntityDefinition[] {
    return [...entityDefinitions.values()];
}

export function clearAdminEntityDefinitionsForTests(): void {
    entityDefinitions.clear();
}
