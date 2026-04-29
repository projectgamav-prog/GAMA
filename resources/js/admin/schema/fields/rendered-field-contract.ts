import type {
    AdminSchemaFamily,
    AdminSchemaFieldDefinition,
} from './schema-field-types';

export type SchemaRenderedFieldDisplayKind =
    | 'stored_schema_value'
    | 'computed_schema_display'
    | 'presentation_only';

export type SchemaRenderedFieldContract = Pick<
    AdminSchemaFieldDefinition,
    'entityType' | 'fieldName'
> & {
    schemaFamily?: AdminSchemaFamily;
    storedValue?: string | number | boolean | null;
    displayValue?: string | number | boolean | null;
    displayKind: SchemaRenderedFieldDisplayKind;
    reason?: string | null;
};

const normalizeSchemaDisplayText = (
    value: string | number | boolean | null | undefined,
): string => String(value ?? '').trim();

export function isStoredSchemaDisplay({
    storedValue,
    displayValue,
    displayKind,
}: Pick<
    SchemaRenderedFieldContract,
    'storedValue' | 'displayValue' | 'displayKind'
>): boolean {
    if (displayKind !== 'stored_schema_value') {
        return false;
    }

    const storedText = normalizeSchemaDisplayText(storedValue);
    const renderedText = normalizeSchemaDisplayText(displayValue ?? storedValue);

    return storedText.length > 0 && renderedText === storedText;
}

export function isComputedSchemaDisplay({
    displayKind,
}: Pick<SchemaRenderedFieldContract, 'displayKind'>): boolean {
    return displayKind === 'computed_schema_display';
}

export function isPresentationOnlySchemaDisplay({
    displayKind,
}: Pick<SchemaRenderedFieldContract, 'displayKind'>): boolean {
    return displayKind === 'presentation_only';
}

export function createSchemaFieldDisplayDescriptor(
    contract: SchemaRenderedFieldContract,
): SchemaRenderedFieldContract {
    return contract;
}

export function assertSchemaFieldSurfaceCoverage(
    contract: SchemaRenderedFieldContract,
): void {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    if (
        contract.displayKind === 'stored_schema_value' &&
        !isStoredSchemaDisplay(contract)
    ) {
        console.warn(
            '[ConsciousAdmin] Stored schema field display does not match its stored value.',
            contract,
        );
    }
}
