import {
    createAfterLastContentBlockInsertionPoint,
    createSectionStartContentBlockInsertionPoint,
} from '@/lib/scripture-content-block-insertion';
import type {
    ScriptureContentBlock,
    ScriptureEntityType,
} from '@/types';
import {
    createBlockActionsSurface,
    createInlineEditorSurface,
    createInsertControlSurface,
    createSurfaceOwner,
} from '@/admin/surfaces/core/surface-builders';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { AdminSurfaceKey } from '@/admin/surfaces/core/surface-keys';
import type {
    BlockActionManagement,
    BlockRegionSurfaceMetadata,
    RegisteredBlockEditorSurfaceMetadata,
} from './surface-types';

type RegisteredBlockOwnerArgs = {
    surfaceKey: AdminSurfaceKey;
    ownerEntity: ScriptureEntityType;
    ownerEntityId: number | string;
    regionKey?: string;
};

type RegisteredBlockRegionSurfaceArgs = RegisteredBlockOwnerArgs & {
    entityLabel: string;
    blocks: ScriptureContentBlock[];
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
};

type RegisteredBlockEditorSurfaceArgs = RegisteredBlockOwnerArgs & {
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

type RegisteredBlockActionsSurfaceArgs = RegisteredBlockOwnerArgs & {
    block: ScriptureContentBlock;
    fullEditHref: string;
    moveUpHref?: string;
    moveDownHref?: string;
    reorderHref?: string;
    duplicateHref?: string;
    deleteHref?: string;
    positionInRegion?: number;
    totalInRegion?: number;
    regionLabel?: string;
};

export function createRegisteredBlockRegionSurface({
    surfaceKey,
    ownerEntity,
    ownerEntityId,
    entityLabel,
    regionKey = 'content_blocks',
    blocks,
    storeHref,
    fullEditHref,
    defaultRegion,
    blockTypes,
}: RegisteredBlockRegionSurfaceArgs): AdminSurfaceContract<BlockRegionSurfaceMetadata> {
    const insertionPoint =
        blocks.length > 0
            ? createAfterLastContentBlockInsertionPoint(blocks[blocks.length - 1])
            : createSectionStartContentBlockInsertionPoint(defaultRegion);

    return createInsertControlSurface({
        surfaceKey,
        contractKey: 'block_region',
        entity: ownerEntity,
        entityId: ownerEntityId,
        regionKey,
        owner: createSurfaceOwner(ownerEntity, ownerEntityId),
        capabilities: ['add_block', 'full_edit'],
        metadata: {
            editor: 'block_region',
            entityLabel,
            storeHref,
            fullEditHref,
            defaultRegion,
            blockTypes,
            insertionPoint,
            placementLabel: insertionPoint.label,
        },
    });
}

export function createRegisteredBlockEditorSurface({
    surfaceKey,
    ownerEntity,
    ownerEntityId,
    entityLabel,
    regionKey = 'content_blocks',
    block,
    updateHref,
    fullEditHref,
}: RegisteredBlockEditorSurfaceArgs): AdminSurfaceContract<RegisteredBlockEditorSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey,
        contractKey: 'registered_block',
        entity: 'content_block',
        entityId: block.id,
        regionKey,
        blockType: block.block_type,
        owner: createSurfaceOwner(ownerEntity, ownerEntityId),
        capabilities: ['edit'],
        metadata: {
            editor: 'registered_block',
            entityLabel,
            block,
            updateHref,
            fullEditHref,
        },
    });
}

export function createRegisteredBlockActionsSurface({
    surfaceKey,
    ownerEntity,
    ownerEntityId,
    regionKey = 'content_blocks',
    block,
    fullEditHref,
    moveUpHref,
    moveDownHref,
    reorderHref,
    duplicateHref,
    deleteHref,
    positionInRegion,
    totalInRegion,
    regionLabel,
}: RegisteredBlockActionsSurfaceArgs) {
    const capabilities: Array<'reorder' | 'duplicate' | 'delete' | 'full_edit'> = [];
    const management: BlockActionManagement = {
        moveUpHref,
        moveDownHref,
        reorderHref,
        duplicateHref,
        deleteHref,
        positionInRegion,
        totalInRegion,
        regionLabel,
    };

    if (moveUpHref || moveDownHref) {
        capabilities.push('reorder');
    }

    if (duplicateHref) {
        capabilities.push('duplicate');
    }

    if (deleteHref) {
        capabilities.push('delete');
    }

    if (fullEditHref) {
        capabilities.push('full_edit');
    }

    return createBlockActionsSurface({
        surfaceKey,
        contractKey: 'block_actions',
        entity: 'content_block',
        entityId: block.id,
        regionKey,
        blockType: block.block_type,
        owner: createSurfaceOwner(ownerEntity, ownerEntityId),
        capabilities,
        metadata: {
            management,
            fullEditHref,
        },
    });
}
