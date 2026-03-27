import type { ComponentProps } from 'react';
import { isSurfaceMetadataObject } from '@/admin/modules/shared/surface-metadata';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';
import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
} from '@/types';

export type BlockActionManagement = {
    moveUpHref?: string;
    moveDownHref?: string;
    reorderHref?: string;
    duplicateHref?: string;
    deleteHref?: string;
    positionInRegion?: number;
    totalInRegion?: number;
    regionLabel?: string;
    disabled?: boolean;
    onMoveUpSuccess?: () => void;
    onMoveDownSuccess?: () => void;
    onReorderSuccess?: (message: string) => void;
    onDuplicateSuccess?: () => void;
    onDeleteSuccess?: () => void;
};

export type RegisteredBlockEditorSurfaceMetadata = {
    editor: 'registered_block';
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

export type BlockCreateSurfaceMetadata = {
    entityLabel?: string;
    storeHref?: string;
    fullEditHref?: string;
    defaultRegion?: string;
    insertionPoint?: ScriptureContentBlockInsertionPoint;
    blockTypes: string[];
    disabled?: boolean;
    label?: string;
    placementLabel?: string;
    onSelectType: (blockType: string) => void;
};

export type BlockRegionSurfaceMetadata = {
    editor: 'block_region';
    entityLabel: string;
    fullEditHref: string;
};

export type BlockActionSurfaceMetadata = {
    management: BlockActionManagement | null;
    dragHandleProps?: ComponentProps<'button'>;
    isDragging?: boolean;
    fullEditHref?: string | null;
};

export function getRegisteredBlockEditorMetadata(
    surface: AdminSurfaceContract,
): RegisteredBlockEditorSurfaceMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<RegisteredBlockEditorSurfaceMetadata>;

    return candidate.editor === 'registered_block' &&
        typeof candidate.entityLabel === 'string' &&
        typeof candidate.updateHref === 'string' &&
        typeof candidate.fullEditHref === 'string' &&
        typeof candidate.block === 'object' &&
        candidate.block !== null
        ? (candidate as RegisteredBlockEditorSurfaceMetadata)
        : null;
}

export function getBlockCreateMetadata(
    surface: AdminSurfaceContract,
): BlockCreateSurfaceMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<BlockCreateSurfaceMetadata>;

    return Array.isArray(candidate.blockTypes) &&
        typeof candidate.onSelectType === 'function'
        ? (candidate as BlockCreateSurfaceMetadata)
        : null;
}

export function getBlockActionMetadata(
    surface: AdminSurfaceContract,
): BlockActionSurfaceMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<BlockActionSurfaceMetadata>;

    return candidate.management || candidate.fullEditHref
        ? (candidate as BlockActionSurfaceMetadata)
        : null;
}

export function getBlockRegionMetadata(
    surface: AdminSurfaceContract,
): BlockRegionSurfaceMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<BlockRegionSurfaceMetadata>;

    return candidate.editor === 'block_region' &&
        typeof candidate.entityLabel === 'string' &&
        typeof candidate.fullEditHref === 'string'
        ? (candidate as BlockRegionSurfaceMetadata)
        : null;
}
