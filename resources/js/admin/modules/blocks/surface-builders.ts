import type { ComponentProps } from 'react';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import type { ScriptureContentBlockManagementCapability } from '@/lib/scripture-admin-capabilities';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import {
    createBlockActionsSurface,
    createInsertControlSurface,
    createSurfaceOwner,
    type AdminSurfaceCapability,
    type AdminSurfaceContract,
} from '@/admin/modules/shared';
import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureEntityRegionInput,
} from '@/types/scripture';
import type {
    BlockActionSurfaceMetadata,
    BlockCreateSurfaceMetadata,
} from './surface-types';

type CreateInsertControlSurfaceArgs = {
    entityMeta?: ScriptureEntityRegionInput;
    insertionPoint: ScriptureContentBlockInsertionPoint;
    blockTypes: string[];
    disabled?: boolean;
    label?: string;
    onSelectType?: (blockType: string) => void;
};

type CreateBlockActionsSurfaceArgs = {
    entityMeta?: ScriptureEntityRegionInput;
    block: ScriptureContentBlock;
    blockSurface: ScriptureAdminSurfaceOptions | null;
    management: ScriptureContentBlockManagementCapability | null;
    canDragReorder: boolean;
    isDragSource: boolean;
    dragHandleProps?: ComponentProps<'button'>;
};

export function createContentBlockInsertControlSurface({
    entityMeta,
    insertionPoint,
    blockTypes,
    disabled = false,
    label = 'Add block',
    onSelectType,
}: CreateInsertControlSurfaceArgs): AdminSurfaceContract<BlockCreateSurfaceMetadata> | null {
    if (!entityMeta || blockTypes.length === 0 || !onSelectType) {
        return null;
    }

    const capabilities: AdminSurfaceCapability[] = ['add_block'];

    if (insertionPoint.insertion_mode === 'end') {
        capabilities.push('add_block_bottom');
    }

    return createInsertControlSurface({
        entity: entityMeta.entityType,
        entityId: entityMeta.entityId,
        regionKey: entityMeta.region,
        owner: createSurfaceOwner(entityMeta.entityType, entityMeta.entityId),
        capabilities,
        label,
        metadata: {
            blockTypes,
            disabled,
            label,
            placementLabel: insertionPoint.label,
            onSelectType,
        },
    });
}

/**
 * Builds the shared block-action surface so the page-level section renderer
 * does not hand-assemble module contracts for every block.
 */
export function createContentBlockActionsSurface({
    entityMeta,
    block,
    blockSurface,
    management,
    canDragReorder,
    isDragSource,
    dragHandleProps,
}: CreateBlockActionsSurfaceArgs): AdminSurfaceContract<BlockActionSurfaceMetadata> | null {
    if (!management && !blockSurface?.config?.fullEditHref) {
        return null;
    }

    const capabilities: AdminSurfaceCapability[] = [];

    if (management?.moveUpHref || management?.moveDownHref) {
        capabilities.push('reorder');
    }

    if (canDragReorder) {
        capabilities.push('drag_reorder');
    }

    if (management?.duplicateHref) {
        capabilities.push('duplicate');
    }

    if (management?.deleteHref) {
        capabilities.push('delete');
    }

    if (
        blockSurface?.config?.supportsFullEdit &&
        blockSurface.config.fullEditHref
    ) {
        capabilities.push('full_edit');
    }

    if (capabilities.length === 0) {
        return null;
    }

    return createBlockActionsSurface({
        entity: 'content_block',
        entityId: block.id,
        regionKey: block.region,
        blockType: block.block_type,
        owner: entityMeta
            ? createSurfaceOwner(entityMeta.entityType, entityMeta.entityId)
            : null,
        capabilities,
        label: block.title ?? scriptureInlineRegionLabel(block.region),
        metadata: {
            management,
            dragHandleProps,
            isDragging: isDragSource,
            fullEditHref: blockSurface?.config?.fullEditHref ?? null,
        },
    });
}
