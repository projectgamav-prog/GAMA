import type { ScriptureEntityType } from '@/types';
import type { AdminSurfaceKey } from './surface-keys';

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

export type AdminSurfaceSlot =
    | 'inline_editor'
    | 'sheet_editor'
    | 'insert_control'
    | 'block_actions';

export type AdminSurfacePlacement =
    | 'inline'
    | 'sidebar'
    | 'drawer'
    | 'header_tools'
    | 'section_footer';

export type AdminSurfaceVariant = 'compact' | 'full';

export type AdminSurfacePresentation = {
    placement?: AdminSurfacePlacement | null;
    variant?: AdminSurfaceVariant | null;
};

export type AdminSurfaceOwner = {
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
};

/**
 * Shared metadata contract that any editable page surface must expose.
 *
 * The host and qualification engine only depend on this contract. Pages can
 * keep their own rendering concerns, while modules decide whether they attach
 * based on semantic surface identity, entity ownership, capabilities, and
 * optional supporting metadata such as region or block type.
 */
export type AdminSurfaceContract<TMetadata = unknown> = {
    surfaceKey?: AdminSurfaceKey | null;
    entity: ScriptureEntityType;
    entityId: AdminSurfaceIdentifier;
    slot: AdminSurfaceSlot;
    regionKey?: string | null;
    blockType?: string | null;
    owner?: AdminSurfaceOwner | null;
    capabilities: readonly AdminSurfaceCapability[];
    presentation?: AdminSurfacePresentation | null;
    label?: string | null;
    metadata?: TMetadata;
};
