import type {
    AdminSurfaceCapability,
    AdminSurfaceContract,
    AdminSurfaceContractKey,
    AdminSurfaceOwner,
    AdminSurfaceSlot,
} from '@/admin/surfaces/core/surface-contracts';
import type { AdminSurfaceKey } from '@/admin/surfaces/core/surface-keys';

export type AdminSurfaceContext<TMetadata = unknown> = {
    surfaceKey?: AdminSurfaceKey | null;
    contractKey?: AdminSurfaceContractKey | null;
    regionKey?: string | null;
    slot?: AdminSurfaceSlot | null;
    owner?: AdminSurfaceOwner | null;
    capabilities: readonly AdminSurfaceCapability[];
    metadata?: TMetadata;
    surface?: AdminSurfaceContract<TMetadata> | null;
};
