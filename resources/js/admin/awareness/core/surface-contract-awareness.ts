import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    AdminEntityContext,
    AdminSchemaFamily,
    AdminSurfaceContext,
} from './awareness-types';

export function createEntityContextFromSurface(
    surface: AdminSurfaceContract,
    schemaFamily: AdminSchemaFamily = 'scripture',
): AdminEntityContext {
    return {
        entityType: surface.entity,
        entityId: surface.entityId,
        schemaFamily,
        label: surface.label ?? null,
        parent: surface.owner
            ? {
                  entityType: surface.owner.entity,
                  entityId: surface.owner.entityId,
                  schemaFamily,
              }
            : null,
    };
}

export function createSurfaceContextFromContract(
    surface: AdminSurfaceContract,
): AdminSurfaceContext {
    return {
        surfaceKey: surface.surfaceKey,
        contractKey: surface.contractKey,
        regionKey: surface.regionKey,
        slot: surface.slot,
        owner: surface.owner,
        capabilities: surface.capabilities,
        metadata: surface.metadata,
        surface,
    };
}
