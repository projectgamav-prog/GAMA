import type { AdminSchemaFamily } from '@/admin/schema/fields';
import type { AdminSurfaceIdentifier } from '@/admin/surfaces/core/surface-contracts';
import type { ScriptureEntityType } from '@/types';

const SUPPORTED_CONSCIOUS_FIELD_UPDATES = new Set<string>([
    'scripture:book:title',
    'scripture:book:description',
    'scripture:book_section:title',
    'scripture:chapter:title',
    'scripture:chapter_section:title',
    'scripture:verse:text',
]);

function fieldUpdateKey(
    schemaFamily: AdminSchemaFamily,
    entityType: ScriptureEntityType,
    fieldName: string,
): string {
    return `${schemaFamily}:${entityType}:${fieldName}`;
}

export function supportsConsciousFieldUpdate({
    schemaFamily,
    entityType,
    fieldName,
}: {
    schemaFamily: AdminSchemaFamily;
    entityType: ScriptureEntityType;
    fieldName: string;
}): boolean {
    return SUPPORTED_CONSCIOUS_FIELD_UPDATES.has(
        fieldUpdateKey(schemaFamily, entityType, fieldName),
    );
}

export function resolveConsciousFieldUpdateHref({
    schemaFamily,
    entityType,
    entityId,
    fieldName,
}: {
    schemaFamily: AdminSchemaFamily;
    entityType: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    fieldName: string;
}): string | null {
    if (!supportsConsciousFieldUpdate({ schemaFamily, entityType, fieldName })) {
        return null;
    }

    return `/admin/schema/${encodeURIComponent(schemaFamily)}/${encodeURIComponent(entityType)}/${encodeURIComponent(String(entityId))}/fields/${encodeURIComponent(fieldName)}`;
}
