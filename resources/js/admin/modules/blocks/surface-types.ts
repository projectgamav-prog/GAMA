import type { ComponentProps } from 'react';
import type { InlineTextContentBlockCreateSession } from '@/lib/scripture-inline-text-content-block';
import type {
    InlineTextContentBlockSaveResult,
    InlineTextContentBlockSession,
} from '@/components/scripture/scripture-text-content-block-inline-editor';
import type { InlineEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';
import { isSurfaceMetadataObject } from '@/admin/modules/shared/surface-metadata';
import type { ScriptureContentBlockManagementCapability } from '@/lib/scripture-admin-capabilities';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

export type TextBlockEditorSurfaceMetadata = InlineEditorSurfaceMetadata<
    InlineTextContentBlockSession | InlineTextContentBlockCreateSession,
    (result: InlineTextContentBlockSaveResult) => void,
    {
        entityLabel: string;
    }
>;

export type BlockCreateSurfaceMetadata = {
    blockTypes: string[];
    disabled?: boolean;
    label?: string;
    placementLabel?: string;
    onSelectType: (blockType: string) => void;
};

export type BlockActionSurfaceMetadata = {
    management: ScriptureContentBlockManagementCapability | null;
    dragHandleProps?: ComponentProps<'button'>;
    isDragging?: boolean;
    fullEditHref?: string | null;
};

export function getTextBlockEditorMetadata(
    surface: AdminSurfaceContract,
): TextBlockEditorSurfaceMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    const candidate = surface.metadata as Partial<TextBlockEditorSurfaceMetadata>;

    return typeof candidate.entityLabel === 'string' &&
        typeof candidate.onCancel === 'function'
        ? (candidate as TextBlockEditorSurfaceMetadata)
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
