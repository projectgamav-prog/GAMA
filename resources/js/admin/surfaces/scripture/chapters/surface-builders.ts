import {
    CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
    CHAPTER_INTRO_SURFACE_KEY,
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
    ScriptureChapter,
    ScriptureContentBlock,
} from '@/types';
import type {
    ChapterIdentitySurfaceMetadata,
    ChapterIntroSurfaceMetadata,
} from './surface-types';

type ChapterIdentitySurfaceArgs = {
    chapter: ScriptureChapter;
    updateHref: string;
    fullEditHref: string;
};

type ChapterIntroSurfaceArgs = {
    chapter: ScriptureChapter;
    chapterTitle: string;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    storeHref: string | null;
    fullEditHref: string;
};

type ChapterBlockRegionSurfaceArgs = {
    chapter: ScriptureChapter;
    entityLabel: string;
    blocks: ScriptureContentBlock[];
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
};

type ChapterContentBlockSurfaceArgs = {
    chapter: ScriptureChapter;
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

type ChapterBlockActionsSurfaceArgs = {
    chapter: ScriptureChapter;
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

export function createChapterIdentitySurface({
    chapter,
    updateHref,
    fullEditHref,
}: ChapterIdentitySurfaceArgs): AdminSurfaceContract<ChapterIdentitySurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_INTRO_SURFACE_KEY,
        contractKey: 'identity',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'page_intro',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            editor: 'chapter_identity',
            chapter,
            updateHref,
            fullEditHref,
        },
    });
}

export function createChapterIntroSurface({
    chapter,
    chapterTitle,
    block,
    blockTypes,
    updateHref,
    storeHref,
    fullEditHref,
}: ChapterIntroSurfaceArgs): AdminSurfaceContract<ChapterIntroSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_INTRO_SURFACE_KEY,
        contractKey: 'intro',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'page_intro',
        capabilities:
            updateHref !== null
                ? ['edit', 'full_edit']
                : ['add_block', 'full_edit'],
        metadata: {
            editor: 'chapter_intro',
            chapter,
            chapterTitle,
            block,
            blockTypes,
            updateHref,
            storeHref,
            fullEditHref,
        },
    });
}

export function createChapterBlockRegionSurface({
    chapter,
    entityLabel,
    blocks,
    storeHref,
    fullEditHref,
    defaultRegion,
    blockTypes,
}: ChapterBlockRegionSurfaceArgs): AdminSurfaceContract<BlockRegionSurfaceMetadata> {
    const insertionPoint =
        blocks.length > 0
            ? createAfterLastContentBlockInsertionPoint(blocks[blocks.length - 1])
            : createSectionStartContentBlockInsertionPoint(defaultRegion);

    return createInsertControlSurface({
        surfaceKey: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        contractKey: 'block_region',
        entity: 'chapter',
        entityId: chapter.id,
        regionKey: 'content_blocks',
        owner: createSurfaceOwner('chapter', chapter.id),
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
        },
    });
}

export function createChapterContentBlockSurface({
    chapter,
    entityLabel,
    block,
    updateHref,
    fullEditHref,
}: ChapterContentBlockSurfaceArgs): AdminSurfaceContract<RegisteredBlockEditorSurfaceMetadata> {
    return createInlineEditorSurface({
        surfaceKey: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        contractKey: 'registered_block',
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('chapter', chapter.id),
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

export function createChapterContentBlockActionsSurface({
    chapter,
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
}: ChapterBlockActionsSurfaceArgs) {
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
        surfaceKey: CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
        contractKey: 'block_actions',
        entity: 'content_block',
        entityId: block.id,
        regionKey: 'content_blocks',
        blockType: block.block_type,
        owner: createSurfaceOwner('chapter', chapter.id),
        capabilities,
        metadata: {
            management,
            fullEditHref,
        },
    });
}

