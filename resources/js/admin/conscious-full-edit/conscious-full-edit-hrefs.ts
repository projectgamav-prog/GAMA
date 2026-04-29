import type { AdminSchemaFamily } from '@/admin/schema/fields';
import type { AdminSurfaceIdentifier } from '@/admin/surfaces/core/surface-contracts';
import type { ScriptureEntityType } from '@/types';

const SUPPORTED_CONSCIOUS_FULL_EDIT_ENTITIES = new Set<string>([
    'book',
    'book_section',
    'chapter',
    'chapter_section',
    'verse',
    'content_block',
]);

export function resolveConsciousFullEditHref({
    schemaFamily,
    entityType,
    entityId,
}: {
    schemaFamily: AdminSchemaFamily;
    entityType: ScriptureEntityType | (string & {});
    entityId: AdminSurfaceIdentifier;
}): string | null {
    if (schemaFamily !== 'scripture') {
        return null;
    }

    if (!SUPPORTED_CONSCIOUS_FULL_EDIT_ENTITIES.has(entityType)) {
        return null;
    }

    const normalizedId = String(entityId).trim();

    if (!/^\d+$/.test(normalizedId)) {
        return null;
    }

    return `/admin/schema/${encodeURIComponent(schemaFamily)}/${encodeURIComponent(
        entityType,
    )}/${encodeURIComponent(normalizedId)}/full-edit`;
}
