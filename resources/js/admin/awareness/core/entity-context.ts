import type { AdminSurfaceIdentifier } from '@/admin/surfaces/core/surface-contracts';

export type AdminSchemaFamily = 'scripture' | 'cms' | 'taxonomy' | (string & {});

export type AdminEntityReference = {
    entityType: string;
    entityId: AdminSurfaceIdentifier;
    schemaFamily?: AdminSchemaFamily;
    label?: string | null;
};

export type AdminEntityContext = AdminEntityReference & {
    schemaFamily: AdminSchemaFamily;
    parent?: AdminEntityReference | null;
};
