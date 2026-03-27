import type { ScriptureEntityType } from '@/types';

/**
 * Stable capability keys that a page surface can advertise to the shared
 * module engine.
 *
 * These are intentionally higher-level than route names or UI buttons so future
 * modules can qualify by behavior rather than by page-specific wiring.
 */
export type AdminSurfaceCapability =
    | 'edit'
    | 'full_edit'
    | 'add_block'
    | 'add_block_bottom'
    | 'reorder'
    | 'drag_reorder'
    | 'duplicate'
    | 'delete'
    | 'manage_blocks'
    | 'manage_media'
    | 'manage_relations';

export type AdminSurfaceIdentifier = string | number;

export type AdminSurfaceOwner = {
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
};

/**
 * Shared metadata contract that any editable page surface must expose.
 *
 * The host and qualification engine only depend on this contract. Pages can
 * keep their own rendering concerns, while modules decide whether they attach
 * based on entity, region, block type, and capabilities.
 */
export type AdminSurfaceContract = {
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    regionKey?: string | null;
    blockType?: string | null;
    owner?: AdminSurfaceOwner | null;
    capabilities: readonly AdminSurfaceCapability[];
    label?: string | null;
    metadata?: Readonly<Record<string, unknown>>;
};
