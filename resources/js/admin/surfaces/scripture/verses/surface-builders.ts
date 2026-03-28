import {
    VERSE_INTRO_SURFACE_KEY,
    VERSE_META_SURFACE_KEY,
    VERSE_NOTES_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import {
    createBlockActionsSurface,
    createInlineEditorSurface,
    createInsertControlSurface,
    createSurfaceOwner,
} from '@/admin/surfaces/core/surface-builders';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    BlockActionManagement,
    BlockRegionSurfaceMetadata,
    RegisteredBlockEditorSurfaceMetadata,
} from '@/admin/surfaces/blocks/surface-types';
import {
    createAfterLastContentBlockInsertionPoint,
    createSectionStartContentBlockInsertionPoint,
} from '@/lib/scripture-content-block-insertion';
import type {
    ScriptureContentBlock,
    ScriptureVerse,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
} from '@/types';
import type {
    VerseIdentitySurfaceMetadata,
    VerseMetaSurfaceMetadata,
} from './surface-types';

type VerseIdentitySurfaceArgs = {
    verse: ScriptureVerse;
    updateHref: string;
    fullEditHref: string;
};

type VerseMetaSurfaceArgs = {
    verse: ScriptureVerse;
    verseMeta: ScriptureVerseMeta | null;
    characters: ScriptureVerseCharacterAssignment[];
    updateHref: string;
    fullEditHref: string;
};

type VerseBlockRegionSurfaceArgs = {
    verse: ScriptureVerse;
    entityLabel: string;
    blocks: ScriptureContentBlock[];
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
};

type VerseNoteBlockSurfaceArgs = {
    verse: ScriptureVerse;
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

type VerseBlockActionsSurfaceArgs = {
    verse: ScriptureVerse;
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

export function createVerseIdentitySurface({
    verse,
    updateHref,
    fullEditHref,
}: VerseIdentitySurfaceArgs): AdminSurfaceContract<VerseIdentitySurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_INTRO_SURFACE_KEY,
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'verse_intro',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            verse,
            updateHref,
            fullEditHref,
        },
    });
}

export function createVerseMetaSurface({
    verse,
    verseMeta,
    characters,
    updateHref,
    fullEditHref,
}: VerseMetaSurfaceArgs): AdminSurfaceContract<VerseMetaSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_META_SURFACE_KEY,
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'verse_notes',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            verseMeta,
            updateHref,
            fullEditHref,
            characters,
        },
    });
}

export function createVerseBlockRegionSurface({
    verse,
    entityLabel,
    blocks,
    storeHref,
    fullEditHref,
    defaultRegion,
    blockTypes,
}: VerseBlockRegionSurfaceArgs): AdminSurfaceContract<BlockRegionSurfaceMetadata> {
    const insertionPoint =
        blocks.length > 0
            ? createAfterLastContentBlockInsertionPoint(blocks[blocks.length - 1])
            : createSectionStartContentBlockInsertionPoint(defaultRegion);

    return createInsertControlSurface({
        surfaceKey: VERSE_NOTES_SURFACE_KEY,
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'content_blocks',
        owner: createSurfaceOwner('verse', verse.id),
        capabilities: ['add_block', 'full_edit'],
        metadata: {
            editor: 'block_region',
            entityLabel,
            storeHref,
            fullEditHref,
            defaultRegion,
            blockTypes,
            insertionPoint,
            label: 'Add Block',
            placementLabel: insertionPoint.label,
            onSelectType: () => undefined,
        },
    });
}

export function createVerseNoteBlockSurface({
    verse,
    entityLabel,
    block,
    updateHref,
    fullEditHref,
}: VerseNoteBlockSurfaceArgs): AdminSurfaceContract<RegisteredBlockEditorSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_NOTES_SURFACE_KEY,
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('verse', verse.id),
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

export function createVerseNoteBlockActionsSurface({
    verse,
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
}: VerseBlockActionsSurfaceArgs) {
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
        surfaceKey: VERSE_NOTES_SURFACE_KEY,
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('verse', verse.id),
        capabilities,
        metadata: {
            management,
            fullEditHref,
        },
    });
}

