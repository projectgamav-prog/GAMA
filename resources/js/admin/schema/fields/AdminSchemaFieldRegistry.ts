import type {
    AdminSchemaFieldDefinition,
    AdminSchemaFieldRegistryKey,
} from './schema-field-types';

function fieldKey({
    entityType,
    fieldName,
    schemaFamily,
}: Pick<
    AdminSchemaFieldDefinition,
    'entityType' | 'fieldName' | 'schemaFamily'
>): AdminSchemaFieldRegistryKey {
    return `${schemaFamily}:${entityType}.${fieldName}`;
}

export class AdminSchemaFieldRegistry {
    private definitions = new Map<
        AdminSchemaFieldRegistryKey,
        AdminSchemaFieldDefinition
    >();

    register(definition: AdminSchemaFieldDefinition): void {
        this.definitions.set(fieldKey(definition), definition);
    }

    registerMany(definitions: readonly AdminSchemaFieldDefinition[]): void {
        definitions.forEach((definition) => this.register(definition));
    }

    get({
        entityType,
        fieldName,
        schemaFamily,
    }: Pick<
        AdminSchemaFieldDefinition,
        'entityType' | 'fieldName' | 'schemaFamily'
    >): AdminSchemaFieldDefinition | null {
        return this.definitions.get(fieldKey({
            entityType,
            fieldName,
            schemaFamily,
        })) ?? null;
    }

    has(definition: Pick<
        AdminSchemaFieldDefinition,
        'entityType' | 'fieldName' | 'schemaFamily'
    >): boolean {
        return this.get(definition) !== null;
    }

    list(): readonly AdminSchemaFieldDefinition[] {
        return [...this.definitions.values()];
    }
}

export const adminSchemaFieldRegistry = new AdminSchemaFieldRegistry();
