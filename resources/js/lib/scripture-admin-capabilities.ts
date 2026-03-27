import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import type {
    ScriptureAdminRegionConfig,
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureContentBlockReorderMeta,
} from '@/types';

export type ScriptureContentBlockManagementCapability = {
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

export type ScriptureContentBlockSectionCapabilities = {
    sectionAdminSurface?: ScriptureAdminSurfaceOptions | null;
    insertBlockTypes?: string[];
    blockCreationDisabled?: boolean;
    onInsertBlockTypeSelected?: (
        position: ScriptureContentBlockInsertionPoint,
        blockType: string,
    ) => void;
    resolveBlockAdminSurface?: (
        block: ScriptureContentBlock,
    ) => ScriptureAdminSurfaceOptions | null;
    resolveBlockManagement?: (
        block: ScriptureContentBlock,
        reorderMeta: ScriptureContentBlockReorderMeta,
    ) => ScriptureContentBlockManagementCapability | null;
};

type CreateSurfaceCapabilityOptions = {
    config?: ScriptureAdminRegionConfig | null;
    onEdit?: ScriptureAdminSurfaceOptions['onEdit'];
    label: string;
    isActive: boolean;
    activeLabel?: string;
    statusLabel?: string;
    statusTone?: 'success';
};

/**
 * Builds a shared page-attached admin surface from capability-qualified state.
 *
 * The caller decides what the region qualifies for; this helper keeps the
 * visible surface contract consistent once the capability exists.
 */
export function createScriptureAdminSurfaceCapability({
    config,
    onEdit,
    label,
    isActive,
    activeLabel = 'Editing',
    statusLabel,
    statusTone = 'success',
}: CreateSurfaceCapabilityOptions): ScriptureAdminSurfaceOptions | null {
    if (!config && !statusLabel && !isActive) {
        return null;
    }

    return {
        config,
        onEdit,
        label,
        isActive,
        activeLabel,
        statusLabel,
        statusTone,
    };
}

export function createScriptureContentBlockSectionCapabilities(
    capabilities: ScriptureContentBlockSectionCapabilities,
): ScriptureContentBlockSectionCapabilities {
    return capabilities;
}
